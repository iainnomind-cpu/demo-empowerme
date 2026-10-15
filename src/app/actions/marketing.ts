"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { fillTemplate } from "@/content/marketing";
import { requireAdmin } from "@/lib/auth";
import { uid } from "@/lib/format";
import { resolveAudience, runAutomations, sendCampaign } from "@/lib/marketing";
import { repo } from "@/lib/repo";
import type { Audience, Automations, Campaign, CampaignKind } from "@/lib/types";

const audienceSchema = z.object({
  segment: z.enum(["comunidad", "experiencia", "sesion", "recurrentes", "tipo", "cumpleanos"]),
  activityId: z.string().optional(),
  sessionId: z.string().optional(),
  type: z.enum(["clase", "taller", "carrera"]).optional(),
});

const campaignSchema = z.object({
  name: z.string().trim().min(3, "Ponle nombre a la campaña."),
  kind: z.enum(["evento", "recordatorio", "felicitacion", "libre"]),
  audience: audienceSchema,
  body: z.string().trim().min(10, "El mensaje está vacío.").max(1024, "WhatsApp permite máximo 1,024 caracteres."),
  activityId: z.string().optional(),
  imageUrl: z.string().optional(),
  templateName: z.string().trim().regex(/^[a-z0-9_]*$/, "La plantilla solo lleva minúsculas, números y guion bajo.").optional(),
  scheduledAt: z.string().optional(),
});

export type CampaignPayload = z.infer<typeof campaignSchema>;

export async function previewAudience(aud: Audience, kind: CampaignKind, activityId: string | undefined, body: string) {
  await requireAdmin();
  const parsed = audienceSchema.safeParse(aud);
  if (!parsed.success) return { count: 0, excluded: { noOptIn: 0, noPhone: 0, optedOut: 0 }, sample: [] };
  const { recipients, excluded } = await resolveAudience(parsed.data, kind, activityId || undefined);
  return {
    count: recipients.length,
    excluded,
    sample: recipients.slice(0, 6).map((r) => ({ name: r.name, phone: r.phone, text: fillTemplate(body, r.vars) })),
  };
}

export async function createCampaign(
  payload: CampaignPayload,
  mode: "borrador" | "enviar" | "programar",
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const user = await requireAdmin();
  const parsed = campaignSchema.safeParse(payload);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const d = parsed.data;
  if (d.audience.segment === "sesion" && !d.audience.sessionId) return { ok: false, error: "Elige la fecha de los inscritos." };
  if (d.audience.segment === "experiencia" && !d.audience.activityId) return { ok: false, error: "Elige la experiencia del segmento." };
  if (mode === "programar" && (!d.scheduledAt || new Date(d.scheduledAt) <= new Date())) {
    return { ok: false, error: "Elige una fecha y hora futura para programar." };
  }

  const c: Campaign = {
    id: uid("cmp-"),
    name: d.name,
    kind: d.kind,
    audience: d.audience,
    body: d.body,
    activityId: d.activityId || undefined,
    imageUrl: d.imageUrl || undefined,
    templateName: d.templateName || undefined,
    status: mode === "programar" ? "programada" : "borrador",
    scheduledAt: mode === "programar" ? d.scheduledAt : undefined,
    stats: { total: 0, sent: 0, failed: 0, skipped: 0 },
    createdBy: user.name.split(" ")[0],
    createdAt: new Date().toISOString(),
  };
  await repo.saveCampaign(c);
  if (mode === "enviar") await sendCampaign(c.id);
  revalidatePath("/admin/marketing");
  return { ok: true, id: c.id };
}

export async function sendCampaignNow(formData: FormData) {
  await requireAdmin();
  await sendCampaign(String(formData.get("id")));
  revalidatePath("/admin/marketing", "layout");
}

export async function cancelSchedule(formData: FormData) {
  await requireAdmin();
  const c = await repo.getCampaign(String(formData.get("id")));
  if (c?.status === "programada") await repo.saveCampaign({ ...c, status: "borrador", scheduledAt: undefined });
  revalidatePath("/admin/marketing", "layout");
}

export async function saveAutomations(a: Automations) {
  await requireAdmin();
  const current = await repo.getAutomations();
  await repo.saveAutomations({ ...a, lastRunAt: current.lastRunAt });
  revalidatePath("/admin/marketing");
}

export async function runAutomationsNow() {
  await requireAdmin();
  const r = await runAutomations();
  revalidatePath("/admin/marketing", "layout");
  revalidatePath("/admin/envios");
  return r;
}
