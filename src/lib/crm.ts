import "server-only";
import { repo } from "@/lib/repo";
import type { Profile } from "@/lib/types";

export interface Contact extends Profile {
  bookings: number;
  spent: number;
  lastAt?: string;
}

/** Personas del CRM B2C: perfil + historial de compras agregado. */
export async function buildContacts(): Promise<Contact[]> {
  const [profiles, orders] = await Promise.all([repo.listProfiles(), repo.listOrders()]);
  return profiles
    .filter((p) => p.role !== "admin")
    .map((p) => {
      const mine = orders.filter((o) => o.userId === p.id && o.status === "pagado");
      const tags = new Set(p.tags);
      mine.forEach((o) => o.items.forEach((i) => tags.add(i.title)));
      return {
        ...p,
        tags: [...tags],
        bookings: mine.reduce((s, o) => s + o.items.reduce((a, i) => a + i.qty, 0), 0),
        spent: mine.reduce((s, o) => s + o.total, 0),
        lastAt: mine[0]?.createdAt,
      };
    })
    .sort((a, b) => (b.lastAt ?? b.createdAt).localeCompare(a.lastAt ?? a.createdAt));
}
