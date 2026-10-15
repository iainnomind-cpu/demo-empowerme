import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { uid } from "@/lib/format";
import { defaultAutomations } from "@/content/marketing";
import type {
  ActivityWithSessions,
  Automations,
  Booking,
  Campaign,
  Lead,
  Notification,
  Order,
  Profile,
  Program,
  Session,
} from "@/lib/types";
import type { Repo } from "./types";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Row = Record<string, any>;

let client: SupabaseClient | null = null;
export function admin(): SupabaseClient {
  if (!client) {
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!key) throw new Error("Falta SUPABASE_SERVICE_ROLE_KEY en las variables de entorno.");
    client = createClient(env.supabaseUrl, key, { auth: { persistSession: false } });
  }
  return client;
}

function check<T>(res: { data: T; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data;
}

const toSession = (r: Row): Session => ({
  id: r.id,
  activityId: r.activity_id,
  startsAt: r.starts_at,
  endsAt: r.ends_at,
  capacity: r.capacity,
  booked: r.booked,
});

const toActivity = (r: Row): ActivityWithSessions => ({
  id: r.id,
  slug: r.slug,
  title: r.title,
  type: r.type,
  mode: r.mode,
  tagline: r.tagline,
  description: r.description,
  includes: r.includes ?? [],
  image: r.image,
  location: r.location ?? { name: "", address: "" },
  coach: r.coach ?? undefined,
  durationMin: r.duration_min,
  level: r.level,
  tickets: r.tickets ?? [],
  faqs: r.faqs ?? [],
  requiresShirtSize: r.requires_shirt_size,
  published: r.published,
  featured: r.featured,
  createdAt: r.created_at,
  sessions: ((r.sessions ?? []) as Row[]).map(toSession).sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
});

const fromActivity = (a: Omit<ActivityWithSessions, "sessions" | "createdAt">): Row => ({
  id: a.id,
  slug: a.slug,
  title: a.title,
  type: a.type,
  mode: a.mode,
  tagline: a.tagline,
  description: a.description,
  includes: a.includes,
  image: a.image,
  location: a.location,
  coach: a.coach ?? null,
  duration_min: a.durationMin,
  level: a.level,
  tickets: a.tickets,
  faqs: a.faqs,
  requires_shirt_size: a.requiresShirtSize,
  published: a.published,
  featured: a.featured,
});

const toOrder = (r: Row): Order => ({
  id: r.id,
  code: r.code,
  userId: r.user_id,
  email: r.email,
  fullName: r.full_name,
  phone: r.phone,
  channel: r.channel,
  status: r.status,
  total: r.total,
  items: r.items ?? [],
  provider: r.provider,
  providerRef: r.provider_ref ?? undefined,
  createdAt: r.created_at,
  paidAt: r.paid_at ?? undefined,
});

const fromOrder = (o: Order): Row => ({
  id: o.id,
  code: o.code,
  user_id: o.userId,
  email: o.email,
  full_name: o.fullName,
  phone: o.phone,
  channel: o.channel,
  status: o.status,
  total: o.total,
  items: o.items,
  provider: o.provider,
  provider_ref: o.providerRef ?? null,
  created_at: o.createdAt,
  paid_at: o.paidAt ?? null,
});

const toBooking = (r: Row): Booking => ({
  id: r.id,
  code: r.code,
  orderId: r.order_id,
  orderCode: r.order_code,
  userId: r.user_id,
  activityId: r.activity_id,
  activityTitle: r.activity_title,
  sessionId: r.session_id,
  startsAt: r.starts_at,
  attendeeName: r.attendee_name,
  email: r.email,
  phone: r.phone,
  ticketName: r.ticket_name,
  shirtSize: r.shirt_size ?? undefined,
  status: r.status,
  checkedInAt: r.checked_in_at ?? undefined,
  createdAt: r.created_at,
});

const fromBooking = (b: Booking): Row => ({
  id: b.id,
  code: b.code,
  order_id: b.orderId,
  order_code: b.orderCode,
  user_id: b.userId,
  activity_id: b.activityId,
  activity_title: b.activityTitle,
  session_id: b.sessionId,
  starts_at: b.startsAt,
  attendee_name: b.attendeeName,
  email: b.email,
  phone: b.phone,
  ticket_name: b.ticketName,
  shirt_size: b.shirtSize ?? null,
  status: b.status,
  checked_in_at: b.checkedInAt ?? null,
  created_at: b.createdAt,
});

const toProfile = (r: Row): Profile => ({
  id: r.id,
  email: r.email,
  fullName: r.full_name,
  phone: r.phone,
  birthdate: r.birthdate ?? undefined,
  emergencyName: r.emergency_name ?? undefined,
  emergencyPhone: r.emergency_phone ?? undefined,
  role: r.role,
  consents: r.consents ?? undefined,
  marketing: r.marketing ?? undefined,
  tags: r.tags ?? [],
  createdAt: r.created_at,
});

const fromProfile = (p: Profile): Row => ({
  id: p.id,
  email: p.email,
  full_name: p.fullName,
  phone: p.phone,
  birthdate: p.birthdate || null,
  emergency_name: p.emergencyName ?? null,
  emergency_phone: p.emergencyPhone ?? null,
  role: p.role,
  consents: p.consents ?? null,
  marketing: p.marketing ?? null,
  tags: p.tags,
  created_at: p.createdAt,
});

const toLead = (r: Row): Lead => ({
  id: r.id,
  company: r.company,
  contactName: r.contact_name,
  role: r.role ?? undefined,
  email: r.email,
  phone: r.phone ?? undefined,
  employees: r.employees,
  programId: r.program_id ?? undefined,
  programTitle: r.program_title ?? undefined,
  message: r.message ?? undefined,
  status: r.status,
  value: r.value ?? undefined,
  notes: r.notes ?? [],
  source: r.source,
  createdAt: r.created_at,
});

const fromLead = (l: Lead): Row => ({
  id: l.id,
  company: l.company,
  contact_name: l.contactName,
  role: l.role ?? null,
  email: l.email,
  phone: l.phone ?? null,
  employees: l.employees,
  program_id: l.programId ?? null,
  program_title: l.programTitle ?? null,
  message: l.message ?? null,
  status: l.status,
  value: l.value ?? null,
  notes: l.notes,
  source: l.source,
  created_at: l.createdAt,
});

const toProgram = (r: Row): Program => ({
  id: r.id,
  slug: r.slug,
  title: r.title,
  durationDays: r.duration_days,
  tagline: r.tagline,
  description: r.description,
  pillars: r.pillars ?? [],
  includes: r.includes ?? [],
  outcomes: r.outcomes ?? [],
  image: r.image,
  format: r.format,
  color: r.color,
  published: r.published,
  sort: r.sort,
});

const fromProgram = (p: Program): Row => ({
  id: p.id,
  slug: p.slug,
  title: p.title,
  duration_days: p.durationDays,
  tagline: p.tagline,
  description: p.description,
  pillars: p.pillars,
  includes: p.includes,
  outcomes: p.outcomes,
  image: p.image,
  format: p.format,
  color: p.color,
  published: p.published,
  sort: p.sort,
});

const toCampaign = (r: Row): Campaign => ({
  id: r.id,
  name: r.name,
  kind: r.kind,
  audience: r.audience,
  body: r.body,
  activityId: r.activity_id ?? undefined,
  imageUrl: r.image_url ?? undefined,
  templateName: r.template_name ?? undefined,
  status: r.status,
  scheduledAt: r.scheduled_at ?? undefined,
  sentAt: r.sent_at ?? undefined,
  stats: r.stats,
  createdBy: r.created_by,
  createdAt: r.created_at,
});

const fromCampaign = (c: Campaign): Row => ({
  id: c.id,
  name: c.name,
  kind: c.kind,
  audience: c.audience,
  body: c.body,
  activity_id: c.activityId ?? null,
  image_url: c.imageUrl ?? null,
  template_name: c.templateName ?? null,
  status: c.status,
  scheduled_at: c.scheduledAt ?? null,
  sent_at: c.sentAt ?? null,
  stats: c.stats,
  created_by: c.createdBy,
  created_at: c.createdAt,
});

const now = () => new Date().toISOString();

export const supabaseRepo: Repo = {
  kind: "supabase",

  async listActivities(opts) {
    let q = admin().from("activities").select("*, sessions(*)").order("created_at", { ascending: false });
    if (!opts?.includeUnpublished) q = q.eq("published", true);
    return (check(await q) as Row[]).map(toActivity);
  },

  async getActivityBySlug(slug) {
    const r = check(await admin().from("activities").select("*, sessions(*)").eq("slug", slug).maybeSingle());
    return r ? toActivity(r) : null;
  },

  async getActivityById(id) {
    const r = check(await admin().from("activities").select("*, sessions(*)").eq("id", id).maybeSingle());
    return r ? toActivity(r) : null;
  },

  async saveActivity(input, sessions) {
    const id = input.id ?? uid("act-");
    check(await admin().from("activities").upsert(fromActivity({ ...input, id })));
    const existing = (check(await admin().from("sessions").select("id").eq("activity_id", id)) as Row[]).map((r) => r.id);
    const keep = sessions.filter((s) => s.id).map((s) => s.id!);
    const remove = existing.filter((x) => !keep.includes(x));
    if (remove.length) check(await admin().from("sessions").delete().in("id", remove));
    for (const s of sessions) {
      if (s.id) {
        check(
          await admin()
            .from("sessions")
            .update({ starts_at: s.startsAt, ends_at: s.endsAt, capacity: s.capacity })
            .eq("id", s.id),
        );
      } else {
        check(
          await admin()
            .from("sessions")
            .insert({ id: uid("ses-"), activity_id: id, starts_at: s.startsAt, ends_at: s.endsAt, capacity: s.capacity, booked: 0 }),
        );
      }
    }
    return id;
  },

  async deleteActivity(id) {
    check(await admin().from("activities").delete().eq("id", id));
  },

  async getSession(id) {
    const r = check(await admin().from("sessions").select("*").eq("id", id).maybeSingle());
    if (!r) return null;
    const activity = await supabaseRepo.getActivityById(r.activity_id);
    return activity ? { ...toSession(r), activity } : null;
  },

  async createOrder({ order, bookings }) {
    const need = new Map<string, number>();
    for (const b of bookings) need.set(b.sessionId, (need.get(b.sessionId) ?? 0) + 1);
    const reserved: [string, number][] = [];
    for (const [sid, n] of need) {
      const ok = check(await admin().rpc("reserve_spots", { p_session: sid, p_n: n }));
      if (!ok) {
        for (const [rs, rn] of reserved) await admin().rpc("release_spots", { p_session: rs, p_n: rn });
        throw new Error("Ya no hay cupo suficiente en una de las fechas elegidas.");
      }
      reserved.push([sid, n]);
    }
    const rec: Order = { ...order, id: uid("ord-"), createdAt: now() };
    check(await admin().from("orders").insert(fromOrder(rec)));
    const rows = bookings.map((b) => fromBooking({ ...b, id: uid("bk-"), orderId: rec.id, createdAt: rec.createdAt }));
    if (rows.length) check(await admin().from("bookings").insert(rows));
    return rec;
  },

  async getOrderByCode(code) {
    const r = check(await admin().from("orders").select("*").eq("code", code).maybeSingle());
    return r ? toOrder(r) : null;
  },

  async listOrders(opts) {
    let q = admin().from("orders").select("*").order("created_at", { ascending: false }).limit(1000);
    if (opts?.userId) q = q.eq("user_id", opts.userId);
    return (check(await q) as Row[]).map(toOrder);
  },

  async markOrderPaid(code, providerRef) {
    const o = await supabaseRepo.getOrderByCode(code);
    if (!o) return null;
    if (o.status === "pagado") return o;
    const paidAt = now();
    check(
      await admin()
        .from("orders")
        .update({ status: "pagado", paid_at: paidAt, provider_ref: providerRef ?? o.providerRef ?? null })
        .eq("code", code),
    );
    check(await admin().from("bookings").update({ status: "pagado" }).eq("order_code", code));
    return { ...o, status: "pagado", paidAt };
  },

  async listBookings(opts) {
    let q = admin().from("bookings").select("*").order("created_at", { ascending: false }).limit(2000);
    if (opts?.sessionId) q = q.eq("session_id", opts.sessionId);
    if (opts?.orderCode) q = q.eq("order_code", opts.orderCode);
    if (opts?.userId) q = q.eq("user_id", opts.userId);
    return (check(await q) as Row[]).map(toBooking);
  },

  async getBookingByCode(code) {
    const r = check(await admin().from("bookings").select("*").eq("code", code.toUpperCase()).maybeSingle());
    return r ? toBooking(r) : null;
  },

  async setCheckIn(code, checkedIn) {
    const r = check(
      await admin()
        .from("bookings")
        .update({ checked_in_at: checkedIn ? now() : null })
        .eq("code", code.toUpperCase())
        .select("*")
        .maybeSingle(),
    );
    return r ? toBooking(r) : null;
  },

  async getProfile(id) {
    const r = check(await admin().from("profiles").select("*").eq("id", id).maybeSingle());
    return r ? toProfile(r) : null;
  },

  async upsertProfile(p) {
    check(await admin().from("profiles").upsert(fromProfile(p)));
    return p;
  },

  async listProfiles() {
    return (check(await admin().from("profiles").select("*").order("created_at", { ascending: false })) as Row[]).map(toProfile);
  },

  async listLeads() {
    return (check(await admin().from("leads").select("*").order("created_at", { ascending: false })) as Row[]).map(toLead);
  },

  async createLead(l) {
    const rec: Lead = { ...l, id: uid("lead-"), status: "nuevo", notes: [], createdAt: now() };
    check(await admin().from("leads").insert(fromLead(rec)));
    return rec;
  },

  async updateLead(id, patch) {
    const row: Row = {};
    if (patch.status) row.status = patch.status;
    if (patch.value !== undefined) row.value = patch.value;
    check(await admin().from("leads").update(row).eq("id", id));
  },

  async addLeadNote(id, note) {
    const r = check(await admin().from("leads").select("notes").eq("id", id).maybeSingle());
    const notes = [note, ...((r?.notes as unknown[]) ?? [])];
    check(await admin().from("leads").update({ notes }).eq("id", id));
  },

  async listPrograms(opts) {
    let q = admin().from("programs").select("*").order("sort");
    if (!opts?.includeUnpublished) q = q.eq("published", true);
    return (check(await q) as Row[]).map(toProgram);
  },

  async saveProgram(p) {
    check(await admin().from("programs").upsert(fromProgram(p)));
  },

  async addNotification(n) {
    check(
      await admin()
        .from("notifications")
        .insert({ id: uid("ntf-"), channel: n.channel, to: n.to, subject: n.subject ?? null, body: n.body, status: n.status, ref: n.ref ?? null }),
    );
  },

  async listNotifications(opts) {
    let q = admin().from("notifications").select("*").order("created_at", { ascending: false }).limit(opts?.limit ?? 500);
    if (opts?.refPrefix) q = q.like("ref", `${opts.refPrefix}%`);
    return (check(await q) as Row[]).map(
      (r): Notification => ({
        id: r.id,
        channel: r.channel,
        to: r.to,
        subject: r.subject ?? undefined,
        body: r.body,
        status: r.status,
        ref: r.ref ?? undefined,
        createdAt: r.created_at,
      }),
    );
  },

  async listCampaigns() {
    return (check(await admin().from("campaigns").select("*").order("created_at", { ascending: false })) as Row[]).map(toCampaign);
  },

  async getCampaign(id) {
    const r = check(await admin().from("campaigns").select("*").eq("id", id).maybeSingle());
    return r ? toCampaign(r) : null;
  },

  async saveCampaign(c) {
    check(await admin().from("campaigns").upsert(fromCampaign(c)));
  },

  async getAutomations() {
    const r = check(await admin().from("settings").select("value").eq("key", "automations").maybeSingle());
    return (r?.value as Automations) ?? structuredClone(defaultAutomations);
  },

  async saveAutomations(a) {
    check(await admin().from("settings").upsert({ key: "automations", value: a }));
  },
};

/** Inserta los datos de ejemplo en una base vacía (botón en /admin). */
export async function seedSupabase() {
  const { seedActivities, seedPrograms, seedPeople, seedLeads, seedCampaigns } = await import("@/lib/seed");
  const acts = seedActivities();
  const { people, orders, bookings } = seedPeople(acts);
  check(await admin().from("activities").upsert(acts.map((a) => ({ ...fromActivity(a), created_at: a.createdAt }))));
  check(
    await admin()
      .from("sessions")
      .upsert(
        acts.flatMap((a) =>
          a.sessions.map((s) => ({ id: s.id, activity_id: a.id, starts_at: s.startsAt, ends_at: s.endsAt, capacity: s.capacity, booked: s.booked })),
        ),
      ),
  );
  check(await admin().from("programs").upsert(seedPrograms().map(fromProgram)));
  check(await admin().from("profiles").upsert(people.map(fromProfile)));
  check(await admin().from("orders").upsert(orders.map(fromOrder)));
  check(await admin().from("bookings").upsert(bookings.map(fromBooking)));
  check(await admin().from("leads").upsert(seedLeads().map(fromLead)));
  check(await admin().from("campaigns").upsert(seedCampaigns().map(fromCampaign)));
}
