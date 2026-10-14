export type ActivityType = "clase" | "taller" | "carrera";
/** unica: un solo evento (carrera, taller). recurrente: varias fechas a elegir (clases). */
export type BookingMode = "unica" | "recurrente";

export interface TicketType {
  id: string;
  name: string;
  price: number; // MXN, pesos enteros
  description?: string;
}

export interface Faq {
  q: string;
  a: string;
}

export interface Location {
  name: string;
  address: string;
  mapsUrl?: string;
}

export interface Session {
  id: string;
  activityId: string;
  startsAt: string; // ISO
  endsAt: string;
  capacity: number;
  booked: number;
}

export interface Activity {
  id: string;
  slug: string;
  title: string;
  type: ActivityType;
  mode: BookingMode;
  tagline: string;
  description: string;
  includes: string[];
  image: string;
  location: Location;
  coach?: string;
  durationMin: number;
  level: string;
  tickets: TicketType[];
  faqs: Faq[];
  requiresShirtSize: boolean;
  published: boolean;
  featured: boolean;
  createdAt: string;
}

export interface ActivityWithSessions extends Activity {
  sessions: Session[];
}

export interface SessionInput {
  id?: string;
  startsAt: string;
  endsAt: string;
  capacity: number;
}

export type ActivityInput = Omit<Activity, "id" | "createdAt"> & { id?: string };

export interface CartItem {
  key: string;
  activityId: string;
  slug: string;
  title: string;
  image: string;
  type: ActivityType;
  sessionId: string;
  startsAt: string;
  ticketId: string;
  ticketName: string;
  unitPrice: number;
  qty: number;
  shirtSize?: string;
}

export interface Consents {
  version: string;
  privacy: string | null; // fecha de aceptación ISO
  image: string | null;
  waiver: string | null;
}

export type Role = "user" | "admin";

export interface Profile {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  birthdate?: string;
  emergencyName?: string;
  emergencyPhone?: string;
  role: Role;
  consents?: Consents;
  tags: string[];
  createdAt: string;
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar?: string;
}

export type OrderStatus = "pendiente" | "pagado" | "cancelado";
export type Channel = "email" | "whatsapp";

export interface OrderItem {
  activityId: string;
  title: string;
  sessionId: string;
  startsAt: string;
  ticketName: string;
  unitPrice: number;
  qty: number;
  shirtSize?: string;
}

export interface Order {
  id: string;
  code: string;
  userId: string;
  email: string;
  fullName: string;
  phone: string;
  channel: Channel;
  status: OrderStatus;
  total: number;
  items: OrderItem[];
  provider: "demo" | "stripe" | "gratis";
  providerRef?: string;
  createdAt: string;
  paidAt?: string;
}

export interface Booking {
  id: string;
  code: string;
  orderId: string;
  orderCode: string;
  userId: string;
  activityId: string;
  activityTitle: string;
  sessionId: string;
  startsAt: string;
  attendeeName: string;
  email: string;
  phone: string;
  ticketName: string;
  shirtSize?: string;
  status: OrderStatus;
  checkedInAt?: string;
  createdAt: string;
}

export type LeadStatus = "nuevo" | "contactado" | "propuesta" | "ganado" | "perdido";

export interface LeadNote {
  at: string;
  text: string;
  author: string;
}

export interface Lead {
  id: string;
  company: string;
  contactName: string;
  role?: string;
  email: string;
  phone?: string;
  employees: string;
  programId?: string;
  programTitle?: string;
  message?: string;
  status: LeadStatus;
  value?: number;
  notes: LeadNote[];
  source: string;
  createdAt: string;
}

export interface Program {
  id: string;
  slug: string;
  title: string;
  durationDays: number;
  tagline: string;
  description: string;
  pillars: string[];
  includes: string[];
  outcomes: string[];
  image: string;
  format: string;
  color: "brand" | "pink" | "sun" | "sage";
  published: boolean;
  sort: number;
}

export interface Notification {
  id: string;
  channel: Channel;
  to: string;
  subject?: string;
  body: string;
  status: "enviado" | "simulado" | "error";
  ref?: string;
  createdAt: string;
}
