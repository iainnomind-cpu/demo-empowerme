"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { LEGAL_VERSION } from "@/content/legal";
import { getCurrentUser } from "@/lib/auth";
import { env } from "@/lib/env";
import { shortCode } from "@/lib/format";
import { completeOrder } from "@/lib/orders";
import { repo } from "@/lib/repo";
import { getStripe } from "@/lib/stripe";
import type { Booking, OrderItem } from "@/lib/types";

const schema = z.object({
  items: z
    .array(
      z.object({
        activityId: z.string(),
        sessionId: z.string(),
        ticketId: z.string(),
        qty: z.number().int().min(1).max(10),
        shirtSize: z.string().optional(),
      }),
    )
    .min(1, "Tu carrito está vacío."),
  fullName: z.string().trim().min(3, "Escribe tu nombre completo."),
  phone: z.string().trim().regex(/^[\d\s+()-]{10,}$/, "Escribe un teléfono de 10 dígitos."),
  birthdate: z.string().optional(),
  emergencyName: z.string().trim().min(3, "Indica un contacto de emergencia."),
  emergencyPhone: z.string().trim().regex(/^[\d\s+()-]{10,}$/, "Teléfono de emergencia inválido."),
  channel: z.enum(["email", "whatsapp"]),
  privacy: z.literal(true, { errorMap: () => ({ message: "Debes aceptar el aviso de privacidad." }) }),
  image: z.boolean(),
  waiver: z.literal(true, { errorMap: () => ({ message: "Debes aceptar la carta responsiva." }) }),
});

export type CheckoutInput = z.infer<typeof schema>;
export type CheckoutResult = { ok: true; url: string } | { ok: false; error: string };

export async function placeOrder(raw: CheckoutInput): Promise<CheckoutResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Inicia sesión para continuar." };

  const parsed = schema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const input = parsed.data;

  // Precios y fechas se toman del servidor, nunca del carrito del navegador.
  const items: OrderItem[] = [];
  const bookingDrafts: Omit<Booking, "id" | "orderId" | "createdAt" | "orderCode">[] = [];
  for (const it of input.items) {
    const a = await repo.getActivityById(it.activityId);
    const s = a?.sessions.find((x) => x.id === it.sessionId);
    const t = a?.tickets.find((x) => x.id === it.ticketId);
    if (!a || !a.published || !s || !t) return { ok: false, error: "Una de las experiencias ya no está disponible." };
    if (new Date(s.startsAt) < new Date()) return { ok: false, error: `La fecha de ${a.title} ya pasó.` };
    if (a.requiresShirtSize && !it.shirtSize) return { ok: false, error: `Elige talla de playera para ${a.title}.` };
    items.push({
      activityId: a.id,
      title: a.title,
      sessionId: s.id,
      startsAt: s.startsAt,
      ticketName: t.name,
      unitPrice: t.price,
      qty: it.qty,
      shirtSize: it.shirtSize,
    });
    for (let i = 0; i < it.qty; i++) {
      bookingDrafts.push({
        code: shortCode("BO"),
        userId: user.id,
        activityId: a.id,
        activityTitle: a.title,
        sessionId: s.id,
        startsAt: s.startsAt,
        attendeeName: it.qty > 1 ? `${input.fullName} (${i + 1}/${it.qty})` : input.fullName,
        email: user.email,
        phone: input.phone,
        ticketName: t.name,
        shirtSize: it.shirtSize,
        status: "pendiente",
      });
    }
  }
  const total = items.reduce((s, i) => s + i.unitPrice * i.qty, 0);

  // Perfil + consentimientos con fecha y versión del documento.
  const nowIso = new Date().toISOString();
  const profile = (await repo.getProfile(user.id)) ?? {
    id: user.id,
    email: user.email,
    fullName: input.fullName,
    phone: input.phone,
    role: user.role,
    tags: [],
    createdAt: nowIso,
  };
  const prev = profile.consents?.version === LEGAL_VERSION ? profile.consents : undefined;
  const tags = new Set(profile.tags);
  items.forEach((i) => tags.add(i.title));
  await repo.upsertProfile({
    ...profile,
    fullName: input.fullName,
    phone: input.phone,
    birthdate: input.birthdate || profile.birthdate,
    emergencyName: input.emergencyName,
    emergencyPhone: input.emergencyPhone,
    tags: [...tags],
    consents: {
      version: LEGAL_VERSION,
      privacy: prev?.privacy ?? nowIso,
      waiver: prev?.waiver ?? nowIso,
      image: input.image ? (prev?.image ?? nowIso) : null,
    },
  });

  const code = shortCode("EM");
  const provider = total === 0 ? "gratis" : getStripe() ? "stripe" : "demo";
  let order;
  try {
    order = await repo.createOrder({
      order: {
        code,
        userId: user.id,
        email: user.email,
        fullName: input.fullName,
        phone: input.phone,
        channel: input.channel,
        status: "pendiente",
        total,
        items,
        provider,
      },
      bookings: bookingDrafts.map((b) => ({ ...b, orderCode: code })),
    });
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "No pudimos crear tu pedido." };
  }

  revalidatePath("/experiencias");

  if (provider === "gratis") {
    await completeOrder(order.code);
    return { ok: true, url: `/cuenta/pedido/${order.code}?nuevo=1` };
  }

  const stripe = getStripe();
  if (stripe) {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: user.email,
      locale: "es",
      line_items: items.map((i) => ({
        quantity: i.qty,
        price_data: {
          currency: "mxn",
          unit_amount: i.unitPrice * 100,
          product_data: { name: `${i.title} · ${i.ticketName}` },
        },
      })),
      metadata: { orderCode: order.code },
      success_url: `${env.siteUrl}/checkout/exito?order=${order.code}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.siteUrl}/checkout?cancelado=1`,
    });
    return { ok: true, url: session.url! };
  }

  return { ok: true, url: `/checkout/pago/${order.code}` };
}

/** Pago simulado del modo demo (sin Stripe). */
export async function simulatePayment(formData: FormData) {
  const code = String(formData.get("code"));
  const user = await getCurrentUser();
  const order = await repo.getOrderByCode(code);
  if (!user || !order || order.userId !== user.id) redirect("/cuenta");
  await completeOrder(code, `demo_${Date.now()}`);
  redirect(`/cuenta/pedido/${code}?nuevo=1`);
}
