import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, ChevronLeft, ChevronRight, LayoutGrid } from "lucide-react";
import { ActivityCard } from "@/components/site/ActivityCard";
import { Reveal } from "@/components/site/Reveal";
import { Eyebrow } from "@/components/ui";
import { cn } from "@/lib/cn";
import { dayKey, monthKey, monthLabel, time } from "@/lib/format";
import { repo } from "@/lib/repo";
import type { ActivityWithSessions, Session } from "@/lib/types";

export const metadata: Metadata = {
  title: "Experiencias",
  description: "Calendario de clases, talleres y carreras de Empowerme en Guadalajara.",
};
export const dynamic = "force-dynamic";

const types = [
  { k: "", label: "Todas" },
  { k: "clase", label: "Clases" },
  { k: "taller", label: "Talleres" },
  { k: "carrera", label: "Carreras" },
];

const dot: Record<string, string> = { clase: "bg-sun", taller: "bg-pink", carrera: "bg-brand" };

export default async function ExperienciasPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string; vista?: string; mes?: string }>;
}) {
  const sp = await searchParams;
  const tipo = types.some((t) => t.k === sp.tipo) ? (sp.tipo ?? "") : "";
  const vista = sp.vista === "calendario" ? "calendario" : "lista";
  const now = new Date();

  const all = await repo.listActivities();
  const acts = all.filter((a) => !tipo || a.type === tipo);
  const future = acts.flatMap((a) => a.sessions.filter((s) => new Date(s.startsAt) > now).map((s) => ({ a, s })));
  future.sort((x, y) => x.s.startsAt.localeCompare(y.s.startsAt));

  const qs = (patch: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const merged = { tipo, vista, mes: sp.mes, ...patch };
    Object.entries(merged).forEach(([k, v]) => v && !(k === "vista" && v === "lista") && p.set(k, v));
    const s = p.toString();
    return s ? `/experiencias?${s}` : "/experiencias";
  };

  return (
    <>
      <section className="grain bg-cream pt-28 lg:pt-36">
        <div className="mx-auto max-w-[1400px] px-4 pb-12 sm:px-6 lg:px-10">
          <Reveal>
            <Eyebrow className="text-brand">Calendario {now.getFullYear()}</Eyebrow>
            <h1 className="display mt-4 text-[clamp(4rem,13vw,12rem)]">
              Experi<span className="accent text-brand">encias</span>
            </h1>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="mt-6 max-w-xl text-lg text-ink/70">
              Clases, talleres y carreras para moverte con la comunidad. Elige tu fecha, aparta tu lugar y recibe tu boleto por
              correo o WhatsApp.
            </p>
          </Reveal>
        </div>
      </section>

      <div className="sticky top-16 z-30 border-y border-line bg-paper/90 backdrop-blur-xl lg:top-[72px]">
        <div className="mx-auto flex max-w-[1400px] items-center gap-3 overflow-x-auto px-4 py-3 no-scrollbar sm:px-6 lg:px-10">
          {types.map((t) => (
            <Link
              key={t.k}
              href={qs({ tipo: t.k || undefined })}
              scroll={false}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition",
                tipo === t.k ? "bg-ink text-paper" : "bg-ink/[0.05] hover:bg-ink/10",
              )}
            >
              {t.k && <span className={cn("size-2 rounded-full", dot[t.k])} />}
              {t.label}
            </Link>
          ))}
          <div className="ml-auto flex shrink-0 rounded-full bg-ink/[0.05] p-1">
            <Link
              href={qs({ vista: "lista", mes: undefined })}
              scroll={false}
              className={cn("flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium", vista === "lista" && "bg-white shadow-sm")}
            >
              <LayoutGrid className="size-4" /> <span className="hidden sm:inline">Lista</span>
            </Link>
            <Link
              href={qs({ vista: "calendario" })}
              scroll={false}
              className={cn("flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium", vista === "calendario" && "bg-white shadow-sm")}
            >
              <CalendarDays className="size-4" /> <span className="hidden sm:inline">Calendario</span>
            </Link>
          </div>
        </div>
      </div>

      <section className="bg-paper">
        <div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 lg:px-10 lg:py-16">
          {future.length === 0 ? (
            <p className="accent py-20 text-center text-4xl text-muted">No hay fechas próximas en esta categoría.</p>
          ) : vista === "lista" ? (
            <ListView items={future} />
          ) : (
            <CalendarView items={future} month={sp.mes} qs={qs} />
          )}
        </div>
      </section>
    </>
  );
}

function ListView({ items }: { items: { a: ActivityWithSessions; s: Session }[] }) {
  // Agrupa por mes. Las clases recurrentes aparecen una vez por mes (su siguiente fecha).
  const months = new Map<string, { a: ActivityWithSessions; s: Session }[]>();
  for (const it of items) {
    const k = monthKey(it.s.startsAt);
    const list = months.get(k) ?? [];
    if (it.a.mode === "recurrente" && list.some((x) => x.a.id === it.a.id)) continue;
    list.push(it);
    months.set(k, list);
  }
  return (
    <div className="space-y-16">
      {[...months.entries()].map(([k, list]) => (
        <section key={k}>
          <div className="flex items-baseline gap-4 border-b-2 border-ink pb-3">
            <h2 className="display text-5xl sm:text-6xl">{monthLabel(k).split(" ")[0]}</h2>
            <span className="text-sm text-muted">{monthLabel(k).split(" ").at(-1)} · {list.length} experiencias</span>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {list.map(({ a, s }, i) => (
              <Reveal key={s.id} delay={(i % 3) * 0.05}>
                <ActivityCard activity={a} session={s} />
              </Reveal>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function CalendarView({
  items,
  month,
  qs,
}: {
  items: { a: ActivityWithSessions; s: Session }[];
  month?: string;
  qs: (p: Record<string, string | undefined>) => string;
}) {
  const current = month && /^\d{4}-\d{2}$/.test(month) ? month : monthKey(items[0].s.startsAt);
  const [y, m] = current.split("-").map(Number);
  const first = new Date(Date.UTC(y, m - 1, 1));
  const daysIn = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const lead = (first.getUTCDay() + 6) % 7; // semana inicia en lunes
  const prev = new Date(Date.UTC(y, m - 2, 1)).toISOString().slice(0, 7);
  const next = new Date(Date.UTC(y, m, 1)).toISOString().slice(0, 7);
  const today = dayKey(new Date().toISOString());

  const byDay = new Map<string, { a: ActivityWithSessions; s: Session }[]>();
  for (const it of items) {
    const k = dayKey(it.s.startsAt);
    byDay.set(k, [...(byDay.get(k) ?? []), it]);
  }

  const cells: (number | null)[] = [...Array(lead).fill(null), ...Array.from({ length: daysIn }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="display text-5xl sm:text-6xl">{monthLabel(current)}</h2>
        <div className="flex gap-2">
          <Link href={qs({ mes: prev })} scroll={false} className="grid size-11 place-items-center rounded-full ring-1 ring-line hover:bg-ink/5" aria-label="Mes anterior">
            <ChevronLeft className="size-5" />
          </Link>
          <Link href={qs({ mes: next })} scroll={false} className="grid size-11 place-items-center rounded-full ring-1 ring-line hover:bg-ink/5" aria-label="Mes siguiente">
            <ChevronRight className="size-5" />
          </Link>
        </div>
      </div>
      <div className="overflow-hidden rounded-[var(--radius-card)] ring-1 ring-line">
        <div className="grid grid-cols-7 bg-cream">
          {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((d) => (
            <div key={d} className="eyebrow px-2 py-3 text-center text-muted">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-px bg-line">
          {cells.map((d, i) => {
            const k = d ? `${current}-${String(d).padStart(2, "0")}` : "";
            const evs = d ? byDay.get(k) ?? [] : [];
            return (
              <div key={i} className={cn("min-h-[92px] bg-white p-1.5 sm:min-h-[128px] sm:p-2", !d && "bg-paper")}>
                {d && (
                  <>
                    <span className={cn("grid size-7 place-items-center rounded-full text-sm font-semibold tabular", k === today && "bg-brand text-white", k < today && "text-muted/60")}>
                      {d}
                    </span>
                    <ul className="mt-1 space-y-1">
                      {evs.slice(0, 3).map(({ a, s }) => (
                        <li key={s.id}>
                          <Link
                            href={`/experiencias/${a.slug}?fecha=${s.id}`}
                            className="flex items-center gap-1.5 rounded-md px-1 py-0.5 text-[0.7rem] leading-tight hover:bg-ink/5 sm:text-xs"
                          >
                            <span className={cn("size-1.5 shrink-0 rounded-full", dot[a.type])} />
                            <span className="hidden font-semibold tabular sm:inline">{time(s.startsAt).replace(" ", "")}</span>
                            <span className="truncate">{a.title}</span>
                          </Link>
                        </li>
                      ))}
                      {evs.length > 3 && <li className="px-1 text-[0.7rem] text-muted">+{evs.length - 3} más</li>}
                    </ul>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
