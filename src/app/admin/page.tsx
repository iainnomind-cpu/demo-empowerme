import Link from "next/link";
import { ArrowUpRight, Database, Plus } from "lucide-react";
import { seedDatabase } from "@/app/actions/admin";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { Badge, Card, PageHead, StatTile, td, th } from "@/components/admin/ui";
import { btn } from "@/components/ui";
import { dateTime, dayKey, mxn, spotsLeft } from "@/lib/format";
import { repo } from "@/lib/repo";
import type { LeadStatus } from "@/lib/types";

export const metadata = { title: "Resumen" };

const stages: { k: LeadStatus; label: string }[] = [
  { k: "nuevo", label: "Nuevos" },
  { k: "contactado", label: "Contactados" },
  { k: "propuesta", label: "Propuesta enviada" },
  { k: "ganado", label: "Ganados" },
  { k: "perdido", label: "Perdidos" },
];

export default async function AdminHome() {
  const [activities, orders, leads] = await Promise.all([
    repo.listActivities({ includeUnpublished: true }),
    repo.listOrders(),
    repo.listLeads(),
  ]);
  const now = Date.now();
  const since = now - 30 * 86400000;
  const paid = orders.filter((o) => o.status === "pagado");
  const recent = paid.filter((o) => new Date(o.createdAt).getTime() >= since);
  const revenue = recent.reduce((s, o) => s + o.total, 0);
  const tickets = recent.reduce((s, o) => s + o.items.reduce((a, i) => a + i.qty, 0), 0);

  const upcoming = activities
    .flatMap((a) => a.sessions.map((s) => ({ a, s })))
    .filter(({ s }) => new Date(s.startsAt).getTime() > now)
    .sort((x, y) => x.s.startsAt.localeCompare(y.s.startsAt));
  const next14 = upcoming.filter(({ s }) => new Date(s.startsAt).getTime() < now + 14 * 86400000);
  const occ = next14.length ? Math.round((next14.reduce((s, { s: x }) => s + x.booked / x.capacity, 0) / next14.length) * 100) : 0;

  const open = leads.filter((l) => ["nuevo", "contactado", "propuesta"].includes(l.status));
  const pipeline = open.reduce((s, l) => s + (l.value ?? 0), 0);

  // Serie diaria de 30 días
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(now - (29 - i) * 86400000);
    return { key: dayKey(d.toISOString()), label: d.toLocaleDateString("es-MX", { day: "numeric", month: "short", timeZone: "America/Mexico_City" }), value: 0, count: 0 };
  });
  for (const o of recent) {
    const d = days.find((x) => x.key === dayKey(o.createdAt));
    if (d) {
      d.value += o.total;
      d.count += 1;
    }
  }

  return (
    <>
      <PageHead title="Resumen" sub="Lo que está pasando en Empowerme esta semana.">
        <Link href="/admin/experiencias/nueva" className={btn("brand", "md")}>
          <Plus className="size-4" /> Nueva experiencia
        </Link>
      </PageHead>

      {repo.kind === "supabase" && activities.length === 0 && (
        <Card className="mb-6 flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
          <Database className="size-8 text-brand" />
          <div className="flex-1">
            <p className="font-semibold">Tu base de datos está vacía</p>
            <p className="text-sm text-muted">Carga las experiencias, programas y leads de ejemplo para explorar el sistema.</p>
          </div>
          <form action={seedDatabase}>
            <button className={btn("ink", "md")}>Cargar datos de ejemplo</button>
          </form>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile accent label="Ingresos · 30 días" value={mxn(revenue)} hint={`${recent.length} pedidos pagados`} />
        <StatTile label="Boletos vendidos · 30 días" value={tickets} hint="Incluye registros gratuitos" />
        <StatTile label="Ocupación próximas 2 semanas" value={`${occ}%`} hint={`${next14.length} sesiones programadas`} />
        <StatTile label="Pipeline empresas" value={mxn(pipeline)} hint={`${open.length} oportunidades abiertas`} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card className="p-6">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-lg font-semibold">Ingresos por día</h2>
            <span className="text-sm text-muted">Últimos 30 días</span>
          </div>
          <RevenueChart data={days} />
        </Card>

        <Card className="p-6">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-lg font-semibold">Embudo B2B</h2>
            <Link href="/admin/crm/empresas" className="text-sm font-semibold text-brand hover:underline">Abrir CRM</Link>
          </div>
          <ul className="space-y-3">
            {stages.map((st) => {
              const n = leads.filter((l) => l.status === st.k).length;
              const v = leads.filter((l) => l.status === st.k).reduce((s, l) => s + (l.value ?? 0), 0);
              const pct = leads.length ? (n / leads.length) * 100 : 0;
              return (
                <li key={st.k}>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{st.label}</span>
                    <span className="tabular text-muted">{n} · {mxn(v)}</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-ink/[0.06]">
                    <div className={`h-full rounded-full ${st.k === "perdido" ? "bg-muted/50" : "bg-ink"}`} style={{ width: `${pct}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card>
          <div className="flex items-baseline justify-between px-6 pb-2 pt-6">
            <h2 className="text-lg font-semibold">Próximas sesiones</h2>
            <Link href="/admin/agenda" className="text-sm font-semibold text-brand hover:underline">Ver agenda</Link>
          </div>
          <ul className="divide-y divide-line">
            {upcoming.slice(0, 7).map(({ a, s }) => {
              const pct = Math.round((s.booked / s.capacity) * 100);
              return (
                <li key={s.id}>
                  <Link href={`/admin/agenda/${s.id}`} className="flex items-center gap-4 px-6 py-3 hover:bg-cream/60">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{a.title}</p>
                      <p className="text-xs text-muted">{dateTime(s.startsAt)}</p>
                    </div>
                    <div className="w-36">
                      <div className="flex justify-between text-xs">
                        <span className="tabular">{s.booked}/{s.capacity}</span>
                        <span className={spotsLeft(s) === 0 ? "font-semibold text-brand" : "text-muted"}>{spotsLeft(s) === 0 ? "Lleno" : `${pct}%`}</span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-ink/[0.07]">
                        <div className="h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <ArrowUpRight className="size-4 text-muted" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>

        <Card className="overflow-hidden">
          <div className="px-6 pb-2 pt-6">
            <h2 className="text-lg font-semibold">Últimos pedidos</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className={th}>Persona</th>
                  <th className={th}>Experiencia</th>
                  <th className={`${th} text-right`}>Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {orders.slice(0, 7).map((o) => (
                  <tr key={o.id}>
                    <td className={td}>
                      <p className="font-medium">{o.fullName}</p>
                      <p className="text-xs text-muted">{dateTime(o.createdAt)}</p>
                    </td>
                    <td className={`${td} max-w-[180px] truncate`}>{o.items[0]?.title}</td>
                    <td className={`${td} text-right`}>
                      <p className="font-semibold tabular">{mxn(o.total)}</p>
                      <Badge tone={o.status === "pagado" ? "good" : "warn"}>{o.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
}
