import "server-only";
import { defaultAutomations } from "@/content/marketing";
import { seedActivities, seedCampaigns, seedLeads, seedNotifications, seedPeople, seedPrograms } from "@/lib/seed";
import { uid } from "@/lib/format";
import type { ActivityWithSessions, Automations, Booking, Campaign, Lead, Notification, Order, Profile, Program } from "@/lib/types";
import type { Repo } from "./types";

/**
 * Almacén en memoria para el modo demo. Vive mientras viva el proceso del servidor
 * (en Vercel cada instancia arranca con los datos de ejemplo). Para persistencia real
 * se configura Supabase.
 */
interface Store {
  activities: ActivityWithSessions[];
  orders: Order[];
  bookings: Booking[];
  profiles: Profile[];
  leads: Lead[];
  programs: Program[];
  notifications: Notification[];
  campaigns: Campaign[];
  automations: Automations;
}

function createStore(): Store {
  const activities = seedActivities();
  const { people, orders, bookings } = seedPeople(activities);
  return {
    activities,
    orders,
    bookings,
    profiles: people,
    leads: seedLeads(),
    programs: seedPrograms(),
    notifications: seedNotifications(),
    campaigns: seedCampaigns(),
    automations: structuredClone(defaultAutomations),
  };
}

const g = globalThis as unknown as { __empowermeStore?: Store };
const db = (): Store => (g.__empowermeStore ??= createStore());

const clone = <T>(x: T): T => structuredClone(x);
const now = () => new Date().toISOString();
const byStart = (a: { startsAt: string }, b: { startsAt: string }) => a.startsAt.localeCompare(b.startsAt);

export const memoryRepo: Repo = {
  kind: "memoria",

  async listActivities(opts) {
    return clone(
      db()
        .activities.filter((a) => opts?.includeUnpublished || a.published)
        .map((a) => ({ ...a, sessions: [...a.sessions].sort(byStart) })),
    );
  },

  async getActivityBySlug(slug) {
    const a = db().activities.find((x) => x.slug === slug);
    return a ? clone({ ...a, sessions: [...a.sessions].sort(byStart) }) : null;
  },

  async getActivityById(id) {
    const a = db().activities.find((x) => x.id === id);
    return a ? clone({ ...a, sessions: [...a.sessions].sort(byStart) }) : null;
  },

  async saveActivity(input, sessions) {
    const s = db();
    const id = input.id ?? uid("act-");
    const existing = s.activities.find((a) => a.id === id);
    const nextSessions = sessions.map((x) => {
      const prev = existing?.sessions.find((p) => p.id === x.id);
      return {
        id: x.id ?? uid("ses-"),
        activityId: id,
        startsAt: x.startsAt,
        endsAt: x.endsAt,
        capacity: x.capacity,
        booked: prev?.booked ?? 0,
      };
    });
    const rec: ActivityWithSessions = {
      ...input,
      id,
      createdAt: existing?.createdAt ?? now(),
      sessions: nextSessions,
    };
    if (existing) s.activities[s.activities.indexOf(existing)] = rec;
    else s.activities.unshift(rec);
    return id;
  },

  async deleteActivity(id) {
    const s = db();
    s.activities = s.activities.filter((a) => a.id !== id);
  },

  async getSession(id) {
    for (const a of db().activities) {
      const ses = a.sessions.find((x) => x.id === id);
      if (ses) return clone({ ...ses, activity: a });
    }
    return null;
  },

  async createOrder({ order, bookings }) {
    const s = db();
    // Validación de cupo y reserva de lugares en una sola pasada (sin concurrencia en memoria).
    const need = new Map<string, number>();
    for (const b of bookings) need.set(b.sessionId, (need.get(b.sessionId) ?? 0) + 1);
    for (const [sid, n] of need) {
      const ses = s.activities.flatMap((a) => a.sessions).find((x) => x.id === sid);
      if (!ses) throw new Error("Una de las fechas ya no existe.");
      if (ses.capacity - ses.booked < n) throw new Error("Ya no hay cupo suficiente en una de las fechas elegidas.");
    }
    for (const [sid, n] of need) {
      const ses = s.activities.flatMap((a) => a.sessions).find((x) => x.id === sid)!;
      ses.booked += n;
    }
    const rec: Order = { ...order, id: uid("ord-"), createdAt: now() };
    s.orders.unshift(rec);
    for (const b of bookings) s.bookings.unshift({ ...b, id: uid("bk-"), orderId: rec.id, createdAt: rec.createdAt });
    return clone(rec);
  },

  async getOrderByCode(code) {
    const o = db().orders.find((x) => x.code === code);
    return o ? clone(o) : null;
  },

  async listOrders(opts) {
    return clone(db().orders.filter((o) => !opts?.userId || o.userId === opts.userId));
  },

  async markOrderPaid(code, providerRef) {
    const s = db();
    const o = s.orders.find((x) => x.code === code);
    if (!o) return null;
    if (o.status !== "pagado") {
      o.status = "pagado";
      o.paidAt = now();
      if (providerRef) o.providerRef = providerRef;
      s.bookings.filter((b) => b.orderCode === code).forEach((b) => (b.status = "pagado"));
    }
    return clone(o);
  },

  async listBookings(opts) {
    return clone(
      db().bookings.filter(
        (b) =>
          (!opts?.sessionId || b.sessionId === opts.sessionId) &&
          (!opts?.orderCode || b.orderCode === opts.orderCode) &&
          (!opts?.userId || b.userId === opts.userId),
      ),
    );
  },

  async getBookingByCode(code) {
    const b = db().bookings.find((x) => x.code === code.toUpperCase());
    return b ? clone(b) : null;
  },

  async setCheckIn(code, checkedIn) {
    const b = db().bookings.find((x) => x.code === code.toUpperCase());
    if (!b) return null;
    b.checkedInAt = checkedIn ? now() : undefined;
    return clone(b);
  },

  async getProfile(id) {
    const p = db().profiles.find((x) => x.id === id);
    return p ? clone(p) : null;
  },

  async upsertProfile(p) {
    const s = db();
    const i = s.profiles.findIndex((x) => x.id === p.id);
    if (i >= 0) s.profiles[i] = p;
    else s.profiles.unshift(p);
    return clone(p);
  },

  async listProfiles() {
    return clone(db().profiles);
  },

  async listLeads() {
    return clone(db().leads);
  },

  async createLead(l) {
    const rec: Lead = { ...l, id: uid("lead-"), status: "nuevo", notes: [], createdAt: now() };
    db().leads.unshift(rec);
    return clone(rec);
  },

  async updateLead(id, patch) {
    const l = db().leads.find((x) => x.id === id);
    if (l) Object.assign(l, patch);
  },

  async addLeadNote(id, note) {
    db().leads.find((x) => x.id === id)?.notes.unshift(note);
  },

  async listPrograms(opts) {
    return clone(
      db()
        .programs.filter((p) => opts?.includeUnpublished || p.published)
        .sort((a, b) => a.sort - b.sort),
    );
  },

  async saveProgram(p) {
    const s = db();
    const i = s.programs.findIndex((x) => x.id === p.id);
    if (i >= 0) s.programs[i] = p;
    else s.programs.push(p);
  },

  async addNotification(n) {
    db().notifications.unshift({ ...n, id: uid("ntf-"), createdAt: now() });
  },

  async listNotifications(opts) {
    const list = db().notifications.filter((n) => !opts?.refPrefix || n.ref?.startsWith(opts.refPrefix));
    return clone(list.slice(0, opts?.limit ?? 500));
  },

  async listCampaigns() {
    return clone([...db().campaigns].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  },

  async getCampaign(id) {
    const c = db().campaigns.find((x) => x.id === id);
    return c ? clone(c) : null;
  },

  async saveCampaign(c) {
    const s = db();
    const i = s.campaigns.findIndex((x) => x.id === c.id);
    if (i >= 0) s.campaigns[i] = clone(c);
    else s.campaigns.unshift(clone(c));
  },

  async getAutomations() {
    return clone(db().automations);
  },

  async saveAutomations(a) {
    db().automations = clone(a);
  },
};
