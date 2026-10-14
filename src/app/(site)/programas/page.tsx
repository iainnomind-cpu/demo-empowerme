import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, BarChart3, Check, HeartPulse, Users } from "lucide-react";
import { Wave } from "@/components/brand/Wave";
import { LeadForm } from "@/components/site/LeadForm";
import { Reveal } from "@/components/site/Reveal";
import { btn, Eyebrow } from "@/components/ui";
import { media } from "@/content/site";
import { cn } from "@/lib/cn";
import { repo } from "@/lib/repo";

export const metadata: Metadata = {
  title: "Programas para empresas",
  description: "Retos de bienestar de 30 días y experiencias in-company para impulsar a tus colaboradores.",
};
export const dynamic = "force-dynamic";

const steps = [
  { t: "Diagnóstico", d: "Conversamos con tu equipo de People para entender objetivos, sedes y horarios." },
  { t: "Diseño", d: "Armamos el reto a la medida: actividades, calendario, dinámica de equipos y premios." },
  { t: "30 días en movimiento", d: "Kick-off, clases, talleres y retos semanales. Nosotros operamos todo." },
  { t: "Resultados", d: "Reporte con participación, encuesta de bienestar y aprendizajes para seguir." },
];

const colorMap = {
  brand: "bg-brand text-white",
  pink: "bg-pink text-ink",
  sun: "bg-sun text-ink",
  sage: "bg-sage text-ink",
};

export default async function ProgramasPage({ searchParams }: { searchParams: Promise<{ programa?: string }> }) {
  const { programa } = await searchParams;
  const programs = await repo.listPrograms();

  return (
    <>
      <section className="relative isolate flex min-h-[88svh] items-end overflow-hidden bg-ink text-white">
        <Image src={media.officeTeam} alt="" fill priority sizes="100vw" className="-z-10 object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/60 to-ink/30" />
        <div className="mx-auto w-full max-w-[1400px] px-4 pb-14 pt-32 sm:px-6 lg:px-10 lg:pb-20">
          <Eyebrow className="text-sun">Empowerme para empresas</Eyebrow>
          <h1 className="display mt-5 max-w-[11ch] text-[clamp(3.6rem,11vw,10rem)]">
            Retos que mueven <span className="accent text-sun">culturas</span>
          </h1>
          <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <p className="max-w-xl text-lg text-white/85 sm:text-xl">
              Programas de 30 días para impulsar el bienestar físico, mental y social de tus colaboradores — con medición de
              resultados y cero carga operativa para tu equipo.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="#contacto" className={btn("brand", "lg")}>Solicitar propuesta</Link>
              <Link href="#retos" className={btn("outline-light", "lg")}>
                Ver retos <ArrowDown className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-cream">
        <div className="mx-auto grid max-w-[1400px] gap-6 px-4 py-16 sm:grid-cols-3 sm:px-6 lg:px-10">
          {[
            { icon: Users, t: "Participación", d: "Dinámicas por equipos que generan conversación y pertenencia." },
            { icon: HeartPulse, t: "Bienestar integral", d: "Cuerpo, mente y hábitos: no solo ejercicio." },
            { icon: BarChart3, t: "Resultados medibles", d: "Reporte de participación y encuesta pre/post." },
          ].map((x, i) => (
            <Reveal key={x.t} delay={i * 0.06} className="flex gap-4">
              <x.icon className="size-7 shrink-0 text-brand" />
              <div>
                <p className="font-semibold">{x.t}</p>
                <p className="text-sm text-muted">{x.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="retos" className="scroll-mt-20 bg-paper">
        <div className="mx-auto max-w-[1400px] px-4 py-24 sm:px-6 lg:px-10 lg:py-32">
          <Reveal>
            <Eyebrow className="text-brand">Catálogo</Eyebrow>
            <h2 className="display mt-4 text-[clamp(3rem,8vw,7rem)]">
              Elige tu <span className="accent text-brand">reto</span>
            </h2>
          </Reveal>

          <div className="mt-14 space-y-6">
            {programs.map((p, i) => (
              <Reveal key={p.id}>
                <article id={p.slug} className="grid scroll-mt-24 overflow-hidden rounded-[var(--radius-card)] bg-white ring-1 ring-line lg:grid-cols-[0.9fr_1.1fr]">
                  <div className={cn("relative min-h-[280px]", i % 2 && "lg:order-2")}>
                    <Image src={p.image} alt="" fill sizes="(min-width:1024px) 45vw, 100vw" className="object-cover" />
                    <div className={cn("absolute left-5 top-5 rounded-2xl px-4 py-3 text-center", colorMap[p.color])}>
                      <span className="display block text-5xl leading-none">{p.durationDays}</span>
                      <span className="eyebrow !text-[0.6rem]">{p.durationDays === 1 ? "día" : "días"}</span>
                    </div>
                  </div>
                  <div className="flex flex-col p-7 sm:p-10">
                    <div className="flex flex-wrap gap-2">
                      {p.pillars.map((x) => (
                        <span key={x} className="rounded-full bg-ink/[0.06] px-3 py-1 text-xs font-semibold">{x}</span>
                      ))}
                      <span className="rounded-full px-3 py-1 text-xs font-semibold text-muted ring-1 ring-line">{p.format}</span>
                    </div>
                    <h3 className="display mt-5 text-[clamp(2.6rem,5vw,4rem)]">{p.title}</h3>
                    <p className="accent mt-2 text-2xl text-brand">{p.tagline}</p>
                    <p className="mt-4 leading-relaxed text-muted">{p.description}</p>
                    <div className="mt-6 grid gap-6 sm:grid-cols-2">
                      <div>
                        <p className="eyebrow mb-3 text-muted">Incluye</p>
                        <ul className="space-y-2 text-sm">
                          {p.includes.map((x) => (
                            <li key={x} className="flex gap-2">
                              <Check className="mt-0.5 size-4 shrink-0 text-brand" /> {x}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="eyebrow mb-3 text-muted">Resultados</p>
                        <ul className="space-y-2 text-sm">
                          {p.outcomes.map((x) => (
                            <li key={x} className="flex gap-2">
                              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-ink" /> {x}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="mt-8">
                      <Link href={`/programas?programa=${p.id}#contacto`} className={btn("ink", "md")}>
                        Me interesa este reto
                      </Link>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-cream">
        <div className="mx-auto max-w-[1400px] px-4 py-24 sm:px-6 lg:px-10">
          <Reveal>
            <Eyebrow className="text-brand">Cómo funciona</Eyebrow>
            <h2 className="display mt-4 text-[clamp(2.8rem,6vw,5rem)]">De la idea al movimiento</h2>
          </Reveal>
          <Wave className="mt-10 h-10 w-full text-brand" arches={24} strokeWidth={2.5} />
          <ol className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <Reveal as="li" key={s.t} delay={i * 0.08}>
                <span className="display text-6xl text-brand">0{i + 1}</span>
                <p className="mt-2 text-lg font-semibold">{s.t}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted">{s.d}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <ContactSection programs={programs.map((p) => ({ id: p.id, title: p.title }))} defaultProgram={programa} />
    </>
  );
}

function ContactSection({ programs, defaultProgram }: { programs: { id: string; title: string }[]; defaultProgram?: string }) {
  return (
    <section id="contacto" className="scroll-mt-16 bg-brand text-white">
      <div className="mx-auto grid max-w-[1400px] gap-12 px-4 py-24 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-10 lg:py-32">
        <div>
          <Eyebrow className="text-white/80">Hablemos</Eyebrow>
          <h2 className="display mt-4 text-[clamp(3rem,7vw,6rem)]">
            Lleva el reto a tu <span className="accent">equipo</span>
          </h2>
          <p className="mt-6 max-w-md text-lg text-white/85">
            Déjanos tus datos y te enviamos una propuesta con calendario, alcance e inversión. Sin compromiso.
          </p>
          <ul className="mt-8 space-y-3 text-white/90">
            {["Respuesta en menos de 48 h hábiles", "Propuesta a la medida de tu plantilla", "Formatos presencial, online o híbrido"].map((x) => (
              <li key={x} className="flex items-center gap-3">
                <Check className="size-5" /> {x}
              </li>
            ))}
          </ul>
        </div>
        <LeadForm key={defaultProgram ?? "none"} programs={programs} defaultProgram={defaultProgram} />
      </div>
    </section>
  );
}
