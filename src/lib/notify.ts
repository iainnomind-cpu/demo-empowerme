import "server-only";
import { env } from "@/lib/env";
import { dateLong, mxn, time } from "@/lib/format";
import { repo } from "@/lib/repo";
import type { Booking, Order } from "@/lib/types";

/**
 * Envía la confirmación por el canal elegido.
 * - Correo: Resend (si hay RESEND_API_KEY).
 * - WhatsApp: WhatsApp Cloud API de Meta (si hay WHATSAPP_TOKEN y WHATSAPP_PHONE_ID).
 * Sin llaves, el mensaje queda registrado en Admin › Envíos como "simulado".
 */
export async function sendOrderConfirmation(order: Order, bookings: Booking[]) {
  const link = `${env.siteUrl}/cuenta/pedido/${order.code}`;
  const lines = bookings.map(
    (b) => `• ${b.activityTitle} — ${dateLong(b.startsAt)}, ${time(b.startsAt)} · ${b.ticketName} · Boleto ${b.code}`,
  );
  const first = order.fullName.split(" ")[0];
  const body = [
    `¡Hola ${first}! Tu lugar en Empowerme está confirmado 🧡`,
    "",
    ...lines,
    "",
    `Total: ${mxn(order.total)} · Pedido ${order.code}`,
    `Tus boletos con código QR: ${link}`,
    "",
    "Nos vemos pronto. — Equipo Empowerme",
  ].join("\n");

  if (order.channel === "whatsapp") {
    await sendWhatsApp(order.phone, body, order.code);
  } else {
    await sendEmail(order.email, `Tu registro está confirmado · ${order.code}`, body, order.code);
  }
}

async function sendEmail(to: string, subject: string, text: string, ref: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    await repo.addNotification({ channel: "email", to, subject, body: text, status: "simulado", ref });
    return;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: process.env.EMAIL_FROM ?? "Empowerme <onboarding@resend.dev>", to, subject, text }),
    });
    await repo.addNotification({ channel: "email", to, subject, body: text, status: res.ok ? "enviado" : "error", ref });
  } catch {
    await repo.addNotification({ channel: "email", to, subject, body: text, status: "error", ref });
  }
}

export interface WhatsAppMessage {
  phone: string;
  text: string;
  ref: string;
  /** Plantilla aprobada en Meta: obligatoria para iniciar conversación fuera de la ventana de 24 h. */
  template?: { name: string; language?: string; params: string[] };
  imageUrl?: string;
}

/**
 * Envía un WhatsApp por la Cloud API de Meta y lo registra en Envíos.
 * Sin WHATSAPP_TOKEN / WHATSAPP_PHONE_ID se registra como "simulado".
 */
export async function sendWhatsApp(phone: string, text: string, ref: string, extra?: Pick<WhatsAppMessage, "template" | "imageUrl">) {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;
  const to = normalizeMxPhone(phone);
  if (!token || !phoneId) {
    await repo.addNotification({ channel: "whatsapp", to, body: text, status: "simulado", ref });
    return "simulado" as const;
  }

  let payload: Record<string, unknown>;
  const image = extra?.imageUrl && /^https:\/\//.test(extra.imageUrl) ? extra.imageUrl : undefined;
  if (extra?.template) {
    const components: Record<string, unknown>[] = [];
    if (image) components.push({ type: "header", parameters: [{ type: "image", image: { link: image } }] });
    if (extra.template.params.length) {
      components.push({ type: "body", parameters: extra.template.params.map((t) => ({ type: "text", text: t || "-" })) });
    }
    payload = {
      messaging_product: "whatsapp",
      to,
      type: "template",
      template: { name: extra.template.name, language: { code: extra.template.language ?? "es_MX" }, components },
    };
  } else if (image) {
    payload = { messaging_product: "whatsapp", to, type: "image", image: { link: image, caption: text } };
  } else {
    payload = { messaging_product: "whatsapp", to, type: "text", text: { body: text } };
  }

  try {
    const res = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const status = res.ok ? ("enviado" as const) : ("error" as const);
    await repo.addNotification({ channel: "whatsapp", to, body: text, status, ref });
    return status;
  } catch {
    await repo.addNotification({ channel: "whatsapp", to, body: text, status: "error", ref });
    return "error" as const;
  }
}

export function normalizeMxPhone(p: string) {
  const d = p.replace(/\D/g, "");
  if (d.length === 10) return `52${d}`;
  return d;
}
