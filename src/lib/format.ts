const TZ = "America/Mexico_City";

const money = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

export function mxn(n: number) {
  return n === 0 ? "Gratis" : money.format(n);
}

function fmt(iso: string, opts: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("es-MX", { timeZone: TZ, ...opts }).format(new Date(iso));
}

/** Mayúscula solo en la primera letra: "Domingo, 15 de noviembre". */
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const dayNum = (iso: string) => fmt(iso, { day: "numeric" });
export const monthShort = (iso: string) => fmt(iso, { month: "short" }).replace(".", "");
export const monthLong = (iso: string) => fmt(iso, { month: "long" });
export const weekdayShort = (iso: string) => cap(fmt(iso, { weekday: "short" }).replace(".", ""));
export const weekdayLong = (iso: string) => fmt(iso, { weekday: "long" });
export const time = (iso: string) => fmt(iso, { hour: "numeric", minute: "2-digit", hour12: true });
export const dateLong = (iso: string) => cap(fmt(iso, { weekday: "long", day: "numeric", month: "long" }));
export const dateShort = (iso: string) => fmt(iso, { day: "numeric", month: "short", year: "numeric" });
export const dateTime = (iso: string) =>
  fmt(iso, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hour12: true });

/** Clave AAAA-MM en hora de CDMX, para agrupar por mes. */
export function monthKey(iso: string) {
  const p = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit" }).format(
    new Date(iso),
  );
  return p.slice(0, 7);
}

/** Clave AAAA-MM-DD en hora de CDMX. */
export function dayKey(iso: string) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(
    new Date(iso),
  );
}

export function monthLabel(key: string) {
  const [y, m] = key.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1, 15, 12));
  return cap(new Intl.DateTimeFormat("es-MX", { timeZone: TZ, month: "long", year: "numeric" }).format(d));
}

/** Construye un ISO a partir de una hora local de Guadalajara (UTC-6, sin horario de verano). */
export function mxIso(y: number, m: number, d: number, h: number, min = 0) {
  return new Date(Date.UTC(y, m - 1, d, h + 6, min)).toISOString();
}

/** Convierte "2026-10-19T07:00" (input datetime-local en hora GDL) a ISO. */
export function localInputToIso(v: string) {
  const [date, t] = v.split("T");
  const [y, m, d] = date.split("-").map(Number);
  const [h, min] = (t ?? "00:00").split(":").map(Number);
  return mxIso(y, m, d, h, min);
}

export function isoToLocalInput(iso: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date(iso));
  const g = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  const hh = g("hour") === "24" ? "00" : g("hour");
  return `${g("year")}-${g("month")}-${g("day")}T${hh}:${g("minute")}`;
}

export const typeLabel: Record<string, string> = {
  clase: "Clase",
  taller: "Taller",
  carrera: "Carrera",
};

export function spotsLeft(s: { capacity: number; booked: number }) {
  return Math.max(0, s.capacity - s.booked);
}

export function slugify(s: string) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function uid(prefix = "") {
  return prefix + crypto.randomUUID().replace(/-/g, "").slice(0, 12);
}

/** Código corto legible para boletos y pedidos (sin 0/O/1/I). */
export function shortCode(prefix: string) {
  const a = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  for (const b of bytes) s += a[b % a.length];
  return `${prefix}-${s}`;
}
