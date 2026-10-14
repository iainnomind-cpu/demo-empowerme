import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, Clock, Gauge, MapPin, Navigation, Plus, UserRound } from "lucide-react";
import { Wave } from "@/components/brand/Wave";
import { ActivityCard } from "@/components/site/ActivityCard";
import { BookingPanel } from "@/components/site/BookingPanel";
import { MobileBookBar } from "@/components/site/MobileBookBar";
import { Reveal } from "@/components/site/Reveal";
import { Eyebrow, TypeChip } from "@/components/ui";
import { mxn } from "@/lib/format";
import { repo } from "@/lib/repo";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const a = await repo.getActivityBySlug((await params).slug);
  return a ? { title: a.title, description: a.tagline, openGraph: { images: [a.image] } } : {};
}

export default async function ActivityPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ fecha?: string }>;
}) {
  const [{ slug }, { fecha }] = await Promise.all([params, searchParams]);
  const a = await repo.getActivityBySlug(slug);
  if (!a || !a.published) notFound();

  const related = (await repo.listActivities())
    .filter((x) => x.id !== a.id && x.sessions.some((s) => new Date(s.startsAt) > new Date()))
    .sort((x, y) => Number(y.type === a.type) - Number(x.type === a.type))
    .slice(0, 3);

  const details = [
    { icon: Clock, label: "Duración", value: a.durationMin >= 60 ? `${(a.durationMin / 60).toLocaleString("es-MX")} h` : `${a.durationMin} min` },
    { icon: Gauge, label: "Nivel", value: a.level },
    { icon: UserRound, label: "Guía", value: a.coach ?? "Equipo Empowerme" },
    { icon: MapPin, label: "Sede", value: a.location.name },
  ];

  return (
    <>
      <section className="relative isolate flex min-h-[78svh] items-end overflow-hidden bg-ink text-white">
        <Image src={a.image} alt="" fill priority sizes="100vw" className="-z-10 object-cover" unoptimized={a.image.startsWith("data:")} />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/40 to-ink/20" />
        <div className="mx-auto w-full max-w-[1400px] px-4 pb-12 pt-32 sm:px-6 lg:px-10 lg:pb-16">
          <Link href="/experiencias" className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-white/80 hover:text-white">
            <ArrowLeft className="size-4" /> Todas las experiencias
          </Link>
          <div className="flex items-center gap-3">
            <TypeChip type={a.type} />
            {a.mode === "recurrente" && <span className="eyebrow rounded-full bg-white/15 px-2.5 py-1 !text-[0.65rem] backdrop-blur">Varias fechas</span>}
          </div>
          <h1 className="display mt-5 max-w-[12ch] text-[clamp(3.6rem,11vw,10rem)]">{a.title}</h1>
          <p className="accent mt-4 max-w-2xl text-[clamp(1.6rem,3vw,2.4rem)] leading-[1.1] text-white/90">{a.tagline}</p>
        </div>
      </section>

      <section className="bg-paper">
        <div className="mx-auto grid max-w-[1400px] gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_420px] lg:gap-16 lg:px-10 lg:py-20">
          <div className="min-w-0 space-y-16">
            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-card)] bg-line ring-1 ring-line sm:grid-cols-4">
              {details.map((d) => (
                <div key={d.label} className="bg-white p-5">
                  <dt className="flex items-center gap-2 text-xs font-medium text-muted">
                    <d.icon className="size-4" /> {d.label}
                  </dt>
                  <dd className="mt-2 font-semibold leading-snug">{d.value}</dd>
                </div>
              ))}
            </dl>

            <Reveal>
              <Eyebrow className="text-brand">La experiencia</Eyebrow>
              <div className="mt-5 max-w-2xl space-y-5 text-lg leading-relaxed text-ink/80">
                {a.description.split(/\n+/).map((p, i) => (
                  <p key={i} className={i === 0 ? "text-xl text-ink first-letter:float-left first-letter:mr-2 first-letter:font-[var(--font-instrument)] first-letter:text-[4.2rem] first-letter:leading-[0.8] first-letter:text-brand" : ""}>
                    {p}
                  </p>
                ))}
              </div>
            </Reveal>

            {a.includes.length > 0 && (
              <Reveal>
                <h2 className="display text-5xl">Qué incluye</h2>
                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  {a.includes.map((x) => (
                    <li key={x} className="flex items-start gap-3 rounded-2xl bg-cream p-4">
                      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-brand text-white">
                        <Check className="size-3.5" strokeWidth={3} />
                      </span>
                      <span className="font-medium">{x}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            )}

            <Reveal>
              <h2 className="display text-5xl">Dónde</h2>
              <div className="mt-6 overflow-hidden rounded-[var(--radius-card)] ring-1 ring-line">
                <div className="relative h-48 bg-sage/40">
                  {/* Mapa ilustrado: la ruta de la "M" lleva al punto de encuentro */}
                  <Wave className="absolute inset-x-6 top-1/2 h-16 -translate-y-1/2 text-ink/25" arches={14} strokeWidth={2} />
                  <span className="absolute left-1/2 top-1/2 grid size-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-brand text-white shadow-xl ring-8 ring-brand/20">
                    <MapPin className="size-6" />
                  </span>
                </div>
                <div className="flex flex-col justify-between gap-4 bg-white p-5 sm:flex-row sm:items-center">
                  <div>
                    <p className="font-semibold">{a.location.name}</p>
                    <p className="text-sm text-muted">{a.location.address}</p>
                  </div>
                  <a
                    href={a.location.mapsUrl || `https://maps.google.com/?q=${encodeURIComponent(`${a.location.name}, ${a.location.address}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-ink/[0.06] px-4 py-2 text-sm font-semibold hover:bg-ink/10"
                  >
                    <Navigation className="size-4" /> Cómo llegar
                  </a>
                </div>
              </div>
            </Reveal>

            {a.faqs.length > 0 && (
              <Reveal>
                <h2 className="display text-5xl">Preguntas frecuentes</h2>
                <div className="mt-6 divide-y divide-line border-y border-line">
                  {a.faqs.map((f) => (
                    <details key={f.q} className="group py-5">
                      <summary className="flex cursor-pointer items-center justify-between gap-4 text-lg font-semibold">
                        {f.q}
                        <Plus className="size-5 shrink-0 transition-transform group-open:rotate-45" />
                      </summary>
                      <p className="mt-3 max-w-2xl leading-relaxed text-muted">{f.a}</p>
                    </details>
                  ))}
                </div>
              </Reveal>
            )}
          </div>

          <aside className="scroll-mt-20 lg:sticky lg:top-24 lg:self-start" id="reservar">
            <BookingPanel activity={a} initialSessionId={fecha} />
          </aside>
          <MobileBookBar
            price={mxn(Math.min(...a.tickets.map((t) => t.price)))}
            label={a.tickets.length > 1 ? "Desde" : a.mode === "recurrente" ? "Por clase" : "Registro"}
          />
        </div>
      </section>

      {related.length > 0 && (
        <section className="bg-cream">
          <div className="mx-auto max-w-[1400px] px-4 py-20 sm:px-6 lg:px-10">
            <h2 className="display text-[clamp(2.8rem,6vw,5rem)]">
              También te puede <span className="accent text-brand">mover</span>
            </h2>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <ActivityCard key={r.id} activity={r} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
