import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, PageHead } from "@/components/admin/ui";
import { cn } from "@/lib/cn";
import { dayKey, monthKey, monthLabel, time } from "@/lib/format";
import { repo } from "@/lib/repo";

export const metadata = { title: "Agenda" };

const bar: Record<string, string> = { clase: "border-l-sun", taller: "border-l-pink", carrera: "border-l-brand" };

export default async function AgendaPage({ searchParams }: { searchParams: Promise<{ mes?: string }> }) {
  const { mes } = await searchParams;
  const activities = await repo.listActivities({ includeUnpublished: true });
  const current = mes && /^\d{4}-\d{2}$/.test(mes) ? mes : monthKey(new Date().toISOString());
  const [y, m] = current.split("-").map(Number);
  const daysIn = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const lead = (new Date(Date.UTC(y, m - 1, 1)).getUTCDay() + 6) % 7;
  const prev = new Date(Date.UTC(y, m - 2, 1)).toISOString().slice(0, 7);
  const next = new Date(Date.UTC(y, m, 1)).toISOString().slice(0, 7);
  const today = dayKey(new Date().toISOString());

  const all = activities.flatMap((a) => a.sessions.map((s) => ({ a, s })));
  const inMonth = all.filter(({ s }) => monthKey(s.startsAt) === current);
  const byDay = new Map<string, typeof inMonth>();
  for (const it of inMonth.sort((x, z) => x.s.startsAt.localeCompare(z.s.startsAt))) {
    const k = dayKey(it.s.startsAt);
    byDay.set(k, [...(byDay.get(k) ?? []), it]);
  }
  const cells: (number | null)[] = [...Array(lead).fill(null), ...Array.from({ length: daysIn }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);

  const totalBooked = inMonth.reduce((s, x) => s + x.s.booked, 0);
  const totalCap = inMonth.reduce((s, x) => s + x.s.capacity, 0);

  return (
    <>
      <PageHead title="Agenda" sub={`${inMonth.length} sesiones en ${monthLabel(current)} · ${totalBooked} de ${totalCap} lugares reservados`}>
        <div className="flex items-center gap-2">
          <Link href={`/admin/agenda?mes=${prev}`} className="grid size-10 place-items-center rounded-full bg-white ring-1 ring-line hover:bg-cream" aria-label="Mes anterior">
            <ChevronLeft className="size-5" />
          </Link>
          <span className="min-w-36 text-center font-semibold">{monthLabel(current)}</span>
          <Link href={`/admin/agenda?mes=${next}`} className="grid size-10 place-items-center rounded-full bg-white ring-1 ring-line hover:bg-cream" aria-label="Mes siguiente">
            <ChevronRight className="size-5" />
          </Link>
        </div>
      </PageHead>

      <div className="mb-4 flex flex-wrap gap-4 text-xs text-muted">
        {[
          ["Clase", "bg-sun"],
          ["Taller", "bg-pink"],
          ["Carrera", "bg-brand"],
        ].map(([l, c]) => (
          <span key={l} className="flex items-center gap-1.5">
            <span className={`h-3 w-1 rounded ${c}`} /> {l}
          </span>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="grid grid-cols-7 border-b border-line">
          {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((d) => (
            <div key={d} className="px-2 py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-muted">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-px bg-line">
          {cells.map((d, i) => {
            const k = d ? `${current}-${String(d).padStart(2, "0")}` : "";
            const evs = d ? byDay.get(k) ?? [] : [];
            return (
              <div key={i} className={cn("min-h-[110px] bg-white p-1.5 sm:min-h-[140px]", !d && "bg-[#f7f4ee]")}>
                {d && (
                  <>
                    <span className={cn("grid size-7 place-items-center rounded-full text-sm font-semibold tabular", k === today && "bg-ink text-paper", k < today && "text-muted/60")}>{d}</span>
                    <ul className="mt-1 space-y-1">
                      {evs.map(({ a, s }) => {
                        const full = s.booked >= s.capacity;
                        return (
                          <li key={s.id}>
                            <Link href={`/admin/agenda/${s.id}`} className={cn("block rounded-md border-l-[3px] bg-cream/70 px-1.5 py-1 text-[0.7rem] leading-tight hover:bg-cream", bar[a.type])}>
                              <span className="block truncate font-semibold">{a.title}</span>
                              <span className="hidden text-muted sm:block">
                                {time(s.startsAt)} · <span className={cn("tabular", full && "font-semibold text-brand")}>{s.booked}/{s.capacity}</span>
                              </span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </>
  );
}
