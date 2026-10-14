import type {
  ActivityInput,
  ActivityWithSessions,
  Booking,
  Lead,
  LeadNote,
  Notification,
  Order,
  Profile,
  Program,
  Session,
  SessionInput,
} from "@/lib/types";

export interface NewOrder {
  order: Omit<Order, "id" | "createdAt">;
  bookings: Omit<Booking, "id" | "orderId" | "createdAt">[];
}

/** Contrato único de datos. Hay dos implementaciones: memoria (demo) y Supabase. */
export interface Repo {
  kind: "memoria" | "supabase";

  listActivities(opts?: { includeUnpublished?: boolean }): Promise<ActivityWithSessions[]>;
  getActivityBySlug(slug: string): Promise<ActivityWithSessions | null>;
  getActivityById(id: string): Promise<ActivityWithSessions | null>;
  saveActivity(input: ActivityInput, sessions: SessionInput[]): Promise<string>;
  deleteActivity(id: string): Promise<void>;
  getSession(id: string): Promise<(Session & { activity: ActivityWithSessions }) | null>;

  createOrder(input: NewOrder): Promise<Order>;
  getOrderByCode(code: string): Promise<Order | null>;
  listOrders(opts?: { userId?: string }): Promise<Order[]>;
  markOrderPaid(code: string, providerRef?: string): Promise<Order | null>;

  listBookings(opts?: { sessionId?: string; orderCode?: string; userId?: string }): Promise<Booking[]>;
  getBookingByCode(code: string): Promise<Booking | null>;
  setCheckIn(code: string, checkedIn: boolean): Promise<Booking | null>;

  getProfile(id: string): Promise<Profile | null>;
  upsertProfile(p: Profile): Promise<Profile>;
  listProfiles(): Promise<Profile[]>;

  listLeads(): Promise<Lead[]>;
  createLead(l: Omit<Lead, "id" | "createdAt" | "notes" | "status">): Promise<Lead>;
  updateLead(id: string, patch: Partial<Pick<Lead, "status" | "value">>): Promise<void>;
  addLeadNote(id: string, note: LeadNote): Promise<void>;

  listPrograms(opts?: { includeUnpublished?: boolean }): Promise<Program[]>;
  saveProgram(p: Program): Promise<void>;

  addNotification(n: Omit<Notification, "id" | "createdAt">): Promise<void>;
  listNotifications(): Promise<Notification[]>;
}
