"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { hasSupabase } from "@/lib/env";
import { slugify, uid } from "@/lib/format";
import { repo } from "@/lib/repo";
import type { LeadStatus, Program } from "@/lib/types";

const activitySchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(3, "El título es muy corto."),
  slug: z.string().trim().optional(),
  type: z.enum(["clase", "taller", "carrera"]),
  mode: z.enum(["unica", "recurrente"]),
  tagline: z.string().trim().min(5, "Agrega una frase corta."),
  description: z.string().trim().min(10, "Agrega una descripción."),
  includes: z.array(z.string().trim().min(1)),
  image: z.string().min(1, "Elige una imagen."),
  location: z.object({ name: z.string().trim().min(2, "Indica la sede."), address: z.string().trim(), mapsUrl: z.string().optional() }),
  coach: z.string().optional(),
  durationMin: z.number().int().min(10),
  level: z.string(),
  tickets: z
    .array(z.object({ id: z.string(), name: z.string().trim().min(1, "Nombre de boleto vacío."), price: z.number().int().min(0), description: z.string().optional() }))
    .min(1, "Agrega al menos un tipo de boleto."),
  faqs: z.array(z.object({ q: z.string().trim().min(1), a: z.string().trim().min(1) })),
  requiresShirtSize: z.boolean(),
  published: z.boolean(),
  featured: z.boolean(),
  sessions: z
    .array(z.object({ id: z.string().optional(), startsAt: z.string(), endsAt: z.string(), capacity: z.number().int().min(1, "El cupo debe ser mayor a 0.") }))
    .min(1, "Agrega al menos una fecha."),
});

export type ActivityPayload = z.infer<typeof activitySchema>;

export async function saveActivity(payload: ActivityPayload): Promise<{ ok: false; error: string } | { ok: true; id: string }> {
  await requireAdmin();
  const parsed = activitySchema.safeParse(payload);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const { sessions, ...a } = parsed.data;
  const slug = slugify(a.slug || a.title);
  const clash = (await repo.listActivities({ includeUnpublished: true })).find((x) => x.slug === slug && x.id !== a.id);
  if (clash) return { ok: false, error: `Ya existe una experiencia con la URL /${slug}.` };
  const id = await repo.saveActivity({ ...a, slug, coach: a.coach || undefined }, sessions);
  revalidatePath("/", "layout");
  return { ok: true, id };
}

export async function deleteActivity(formData: FormData) {
  await requireAdmin();
  await repo.deleteActivity(String(formData.get("id")));
  revalidatePath("/", "layout");
  redirect("/admin/experiencias");
}

export async function togglePublished(formData: FormData) {
  await requireAdmin();
  const a = await repo.getActivityById(String(formData.get("id")));
  if (!a) return;
  const { sessions, ...rest } = a;
  await repo.saveActivity({ ...rest, published: !a.published }, sessions);
  revalidatePath("/", "layout");
}

/** Sube una imagen a Supabase Storage o, en modo demo, la guarda como data URL. */
export async function uploadImage(formData: FormData): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Selecciona una imagen." };
  if (!file.type.startsWith("image/")) return { ok: false, error: "El archivo debe ser una imagen." };
  if (file.size > 5 * 1024 * 1024) return { ok: false, error: "La imagen pesa más de 5 MB." };
  const buf = Buffer.from(await file.arrayBuffer());
  if (!hasSupabase) return { ok: true, url: `data:${file.type};base64,${buf.toString("base64")}` };
  const { admin } = await import("@/lib/repo/supabase");
  const path = `actividades/${Date.now()}-${slugify(file.name.replace(/\.[^.]+$/, ""))}.${file.type.split("/")[1]}`;
  const { error } = await admin().storage.from("media").upload(path, buf, { contentType: file.type });
  if (error) return { ok: false, error: error.message };
  return { ok: true, url: admin().storage.from("media").getPublicUrl(path).data.publicUrl };
}

export async function toggleCheckIn(code: string, checkedIn: boolean) {
  await requireAdmin();
  const b = await repo.setCheckIn(code, checkedIn);
  revalidatePath("/admin/agenda");
  return b;
}

export async function lookupBooking(code: string) {
  await requireAdmin();
  // Acepta el código suelto o la URL completa que va dentro del QR.
  const m = code.toUpperCase().match(/BO-[A-Z0-9]{6}/);
  return m ? repo.getBookingByCode(m[0]) : null;
}

export async function setLeadStatus(id: string, status: LeadStatus) {
  await requireAdmin();
  await repo.updateLead(id, { status });
  revalidatePath("/admin/crm/empresas");
}

export async function setLeadValue(id: string, value: number) {
  await requireAdmin();
  await repo.updateLead(id, { value });
  revalidatePath("/admin/crm/empresas");
}

export async function addLeadNote(id: string, text: string) {
  const user = await requireAdmin();
  if (!text.trim()) return;
  await repo.addLeadNote(id, { at: new Date().toISOString(), text: text.trim(), author: user.name.split(" ")[0] });
  revalidatePath("/admin/crm/empresas");
}

export async function saveProgram(p: Program) {
  await requireAdmin();
  await repo.saveProgram({ ...p, id: p.id || uid("prg-"), slug: slugify(p.slug || p.title) });
  revalidatePath("/", "layout");
}

export async function seedDatabase() {
  await requireAdmin();
  if (!hasSupabase) return;
  const { seedSupabase } = await import("@/lib/repo/supabase");
  await seedSupabase();
  revalidatePath("/", "layout");
}
