import "server-only";
import { fillTemplate, templateParams } from "@/content/marketing";
import { buildContacts } from "@/lib/crm";
import { env } from "@/lib/env";
import { dateLong, dayKey, time } from "@/lib/format";
import { normalizeMxPhone, sendWhatsApp } from "@/lib/notify";
import { repo } from "@/lib/repo";
import type { ActivityWithSessions, Audience, Campaign, CampaignKind, Session } from "@/lib/types";

export interface Recipient {
  key: string;
  name: string;
  phone: string;
  vars: Record<string, string>;
}

export interface AudienceResult {
  recipients: Recipient[];
  excluded: { noOptIn: number; noPhone: number; optedOut: number };
}

/** Recordatorios son mensajes de servicio; todo lo demás es marketing y requiere opt-in. */
export const needsOptIn = (kind: CampaignKind) => kind !== "recordatorio";

const first = (name: string) => name.trim().split(/\s+/)[0] ?? "";
const mmdd = (iso: string) => iso.slice(5, 10);

function activityVars(a: ActivityWithSessions | undefined, s?: Session): Record<string, string> {
  if (!a) return {};
  const ses = s ?? a.sessions.find((x) => new Date(x.startsAt) > new Date());
  return {
    experiencia: a.title,
    sede: a.location.name,
    fecha: ses ? dateLong(ses.startsAt).toLowerCase() : "",
    hora: ses ? time(ses.startsAt) : "",
    link: `${env.siteUrl}/experiencias/${a.slug}`,
  };
}

/** Calcula a quién le llega un mensaje y por qué se excluye al resto. */
export async function resolveAudience(aud: Audience, kind: CampaignKind, activityId?: string): Promise<AudienceResult> {
  const [contacts, orders, activities] = await Promise.all([
    buildContacts(),
    repo.listOrders(),
    repo.listActivities({ includeUnpublished: true }),
  ]);
  const promo = activities.find((a) => a.id === activityId);
  const excluded = { noOptIn: 0, noPhone: 0, optedOut: 0 };
  const seen = new Set<string>();
  const out: Recipient[] = [];
  const optIn = needsOptIn(kind);

  const push = (key: string, name: string, phone: string, marketing: { optIn?: boolean; optOutAt?: string } | undefined, vars: Record<string, string>) => {
    if (!phone || phone.replace(/\D/g, "").length < 10) return void excluded.noPhone++;
    if (marketing?.optOutAt) return void excluded.optedOut++;
    if (optIn && !marketing?.optIn) return void excluded.noOptIn++;
    const norm = normalizeMxPhone(phone);
    if (seen.has(norm)) return;
    seen.add(norm);
    out.push({ key, name, phone, vars: { nombre: first(name), ...vars } });
  };

  if (aud.segment === "sesion") {
    const ses = await repo.getSession(aud.sessionId ?? "");
    if (!ses) return { recipients: [], excluded };
    const bookings = (await repo.listBookings({ sessionId: ses.id })).filter((b) => b.status === "pagado");
    const byUser = new Map(contacts.map((c) => [c.id, c]));
    for (const b of bookings) {
      push(b.code, b.attendeeName.replace(/\s*\(\d+\/\d+\)$/, ""), b.phone, byUser.get(b.userId)?.marketing, {
        ...activityVars(ses.activity, ses),
        link: `${env.siteUrl}/cuenta/pedido/${b.orderCode}`,
      });
    }
    return { recipients: out, excluded };
  }

  const today = mmdd(dayKey(new Date().toISOString()));
  const typeOf = new Map(activities.map((a) => [a.id, a.type]));
  const vars = activityVars(promo);

  for (const c of contacts) {
    const mine = orders.filter((o) => o.userId === c.id && o.status === "pagado").flatMap((o) => o.items);
    const match =
      aud.segment === "comunidad" ||
      (aud.segment === "experiencia" && mine.some((i) => i.activityId === aud.activityId)) ||
      (aud.segment === "tipo" && mine.some((i) => typeOf.get(i.activityId) === aud.type)) ||
      (aud.segment === "recurrentes" && c.bookings >= 2) ||
      (aud.segment === "cumpleanos" && Boolean(c.birthdate) && mmdd(c.birthdate!) === today);
    if (match) push(c.id, c.fullName || c.email, c.phone, c.marketing, vars);
  }
  return { recipients: out, excluded };
}

/** Envía una campaña ahora mismo y guarda las estadísticas. */
export async function sendCampaign(id: string) {
  const c = await repo.getCampaign(id);
  if (!c || c.status === "enviada" || c.status === "enviando") return c;
  const { recipients, excluded } = await resolveAudience(c.audience, c.kind, c.activityId);
  const stats = { total: recipients.length, sent: 0, failed: 0, skipped: excluded.noOptIn + excluded.noPhone + excluded.optedOut };
  await repo.saveCampaign({ ...c, status: "enviando", stats });

  for (const r of recipients) {
    const text = fillTemplate(c.body, r.vars);
    const status = await sendWhatsApp(r.phone, text, `cmp:${c.id}`, {
      imageUrl: c.imageUrl,
      template: c.templateName ? { name: c.templateName, params: templateParams(c.body, r.vars) } : undefined,
    });
    if (status === "error") stats.failed++;
    else stats.sent++;
  }

  const done: Campaign = { ...c, status: "enviada", sentAt: new Date().toISOString(), stats };
  await repo.saveCampaign(done);
  return done;
}

/**
 * Tareas automáticas (las llama el cron diario y el botón "Ejecutar ahora"):
 * campañas programadas vencidas, recordatorios del día siguiente y cumpleaños.
 */
export async function runAutomations() {
  const auto = await repo.getAutomations();
  const now = Date.now();
  const result = { campaigns: 0, reminders: 0, birthdays: 0 };

  for (const c of await repo.listCampaigns()) {
    if (c.status === "programada" && c.scheduledAt && new Date(c.scheduledAt).getTime() <= now) {
      await sendCampaign(c.id);
      result.campaigns++;
    }
  }

  if (auto.reminders.enabled) {
    const done = new Set((await repo.listNotifications({ refPrefix: "rem:", limit: 5000 })).map((n) => n.ref));
    const activities = await repo.listActivities({ includeUnpublished: true });
    const soon = activities.flatMap((a) =>
      a.sessions
        .filter((s) => {
          const t = new Date(s.startsAt).getTime();
          return t > now + 12 * 3600e3 && t <= now + 36 * 3600e3;
        })
        .map((s) => ({ a, s })),
    );
    const contacts = new Map((await buildContacts()).map((c) => [c.id, c]));
    for (const { a, s } of soon) {
      for (const b of await repo.listBookings({ sessionId: s.id })) {
        const ref = `rem:${b.code}`;
        if (b.status !== "pagado" || done.has(ref) || contacts.get(b.userId)?.marketing?.optOutAt || !b.phone) continue;
        const vars = { nombre: first(b.attendeeName), ...activityVars(a, s), link: `${env.siteUrl}/cuenta/pedido/${b.orderCode}` };
        await sendWhatsApp(b.phone, fillTemplate(auto.reminders.body, vars), ref, {
          template: auto.reminders.templateName ? { name: auto.reminders.templateName, params: templateParams(auto.reminders.body, vars) } : undefined,
        });
        result.reminders++;
      }
    }
  }

  if (auto.birthdays.enabled) {
    const year = new Date().getFullYear();
    const done = new Set((await repo.listNotifications({ refPrefix: "bday:", limit: 5000 })).map((n) => n.ref));
    const { recipients } = await resolveAudience({ segment: "cumpleanos" }, "felicitacion");
    for (const r of recipients) {
      const ref = `bday:${r.key}:${year}`;
      if (done.has(ref)) continue;
      await sendWhatsApp(r.phone, fillTemplate(auto.birthdays.body, r.vars), ref, {
        template: auto.birthdays.templateName ? { name: auto.birthdays.templateName, params: templateParams(auto.birthdays.body, r.vars) } : undefined,
      });
      result.birthdays++;
    }
  }

  await repo.saveAutomations({ ...auto, lastRunAt: new Date().toISOString() });
  return result;
}

/** Baja de marketing cuando alguien responde BAJA / STOP. */
export async function optOutByPhone(phone: string) {
  const target = normalizeMxPhone(phone);
  const at = new Date().toISOString();
  let n = 0;
  for (const p of await repo.listProfiles()) {
    if (p.phone && normalizeMxPhone(p.phone) === target) {
      await repo.upsertProfile({ ...p, marketing: { ...(p.marketing ?? { optIn: false }), optIn: false, optOutAt: at } });
      n++;
    }
  }
  return n;
}
