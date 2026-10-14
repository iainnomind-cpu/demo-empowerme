import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Award, Quote } from "lucide-react";
import { MeMark } from "@/components/brand/Logo";
import { Wave } from "@/components/brand/Wave";
import { ActivityCard } from "@/components/site/ActivityCard";
import { CountUp } from "@/components/site/CountUp";
import { Hero } from "@/components/site/Hero";
import { Marquee } from "@/components/site/Marquee";
import { Reveal } from "@/components/site/Reveal";
import { InstagramIcon } from "@/components/site/SocialIcons";
import { ArrowLink, btn, Eyebrow } from "@/components/ui";
import { awards, founder, highlights, media, pillars, site, stats, testimonials, timeline } from "@/content/site";
import { dayNum, monthShort } from "@/lib/format";
import { repo } from "@/lib/repo";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [activities, programs] = await Promise.all([repo.listActivities(), repo.listPrograms()]);
  const now = new Date();

  // Próximas fechas (una por experiencia) ordenadas por cercanía.
  const upcoming = activities
    .map((a) => ({ a, s: a.sessions.find((s) => new Date(s.startsAt) > now) }))
    .filter((x): x is { a: (typeof activities)[number]; s: NonNullable<typeof x.s> } => Boolean(x.s))
    .sort((x, y) => x.s.startsAt.localeCompare(y.s.startsAt));
  const featured = upcoming.find((x) => x.a.featured) ?? upcoming[0];

  return (
    <>
      <Hero
        next={
          featured && {
            title: featured.a.title,
            when: `${dayNum(featured.s.startsAt)} ${monthShort(featured.s.startsAt)}`,
            place: featured.a.location.name,
            href: `/experiencias/${featured.a.slug}`,
          }
        }
      />

      <Marquee
        words={["Muévete", "respira", "Corre", "conecta", "Celebra", "transforma"]}
        className="display bg-brand py-4 text-[clamp(2rem,5vw,3.6rem)] text-white"
      />

      {/* ── Manifiesto + cifras ─────────────────────────── */}
      <section className="grain bg-cream">
        <div className="mx-auto max-w-[1400px] px-4 py-24 sm:px-6 lg:px-10 lg:py-36">
          <Reveal>
            <Eyebrow className="text-brand">Nuestro propósito</Eyebrow>
          </Reveal>
          <Reveal delay={0.05}>
            <p className="mt-6 max-w-[18ch] text-[clamp(2.4rem,6vw,5.6rem)] font-semibold leading-[0.98] tracking-[-0.03em]">
              Transformamos vidas, empresas y comunidades{" "}
              <span className="accent font-normal text-brand">a través del movimiento.</span>
            </p>
          </Reveal>
          <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
            <Reveal delay={0.1}>
              <p className="max-w-md text-lg leading-relaxed text-ink/75">
                Creamos experiencias de bienestar integral donde nadie se queda atrás: clases al aire libre, talleres que te
                sacuden por dentro, carreras con causa y programas que cambian la cultura de las empresas. Aquí no se trata de
                ser perfecta. Se trata de moverte — juntas.
              </p>
            </Reveal>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-10">
              {stats.map((s, i) => (
                <Reveal key={s.label} delay={0.1 + i * 0.06}>
                  <dt className="sr-only">{s.label}</dt>
                  <dd>
                    <span className="display block text-[clamp(3.4rem,7vw,6rem)] text-ink">
                      <CountUp value={s.value} prefix={s.prefix} suffix={s.suffix} />
                    </span>
                    <span className="mt-2 block max-w-[22ch] border-t border-ink/15 pt-3 text-sm text-muted">{s.label}</span>
                  </dd>
                </Reveal>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* ── Próximas experiencias ───────────────────────── */}
      <section className="bg-paper">
        <div className="mx-auto max-w-[1400px] px-4 py-24 sm:px-6 lg:px-10 lg:py-32">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <Reveal>
              <Eyebrow className="text-brand">Agenda abierta</Eyebrow>
              <h2 className="display mt-4 text-[clamp(3.2rem,8vw,7.5rem)]">
                Lo que <span className="accent text-brand">viene</span>
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <Link href="/experiencias" className={btn("ink", "lg")}>
                Ver calendario completo <ArrowRight className="size-4" />
              </Link>
            </Reveal>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.slice(0, 6).map(({ a, s }, i) => (
              <Reveal key={a.id} delay={(i % 3) * 0.06}>
                <ActivityCard activity={a} session={s} priority={i < 3} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tres formas de moverte ──────────────────────── */}
      <section className="bg-ink text-paper">
        <div className="mx-auto max-w-[1400px] px-4 pt-24 sm:px-6 lg:px-10 lg:pt-32">
          <Reveal>
            <Eyebrow className="text-pink">Experiencias</Eyebrow>
            <h2 className="display mt-4 max-w-[14ch] text-[clamp(3rem,7vw,6.5rem)]">
              Tres formas de <span className="accent text-pink">moverte</span>
            </h2>
          </Reveal>
        </div>
        <div className="mx-auto mt-12 flex max-w-[1400px] flex-col gap-3 px-4 pb-24 sm:px-6 lg:h-[620px] lg:flex-row lg:px-10 lg:pb-32">
          {[
            { t: "Clases", k: "clase", img: media.yogaGroup, d: "Yoga, pilates y funcional, al aire libre o en estudio. Reserva una o varias fechas." },
            { t: "Talleres", k: "taller", img: media.circle, d: "Breathwork, nutrición y círculos UNIDAS para trabajar lo de adentro." },
            { t: "Carreras", k: "carrera", img: media.runPink, d: "SocialRun cada semana, Relay 12K y Santa Run. Kit, medalla y porras." },
          ].map((x, i) => (
            <Link
              key={x.k}
              href={`/experiencias?tipo=${x.k}`}
              className="group relative isolate flex min-h-[340px] flex-1 flex-col justify-end overflow-hidden rounded-[var(--radius-card)] p-6 transition-[flex] duration-700 ease-[cubic-bezier(.22,1,.36,1)] lg:hover:flex-[1.9]"
            >
              <Image src={x.img} alt="" fill sizes="(min-width:1024px) 50vw, 100vw" className="-z-10 object-cover transition duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink/90 via-ink/30 to-ink/0" />
              <span className="eyebrow absolute left-6 top-6 text-white/70">0{i + 1}</span>
              <h3 className="display text-[clamp(3rem,5vw,4.8rem)]">{x.t}</h3>
              <p className="mt-3 max-w-sm text-white/80 lg:max-h-0 lg:overflow-hidden lg:opacity-0 lg:transition-all lg:duration-500 lg:group-hover:max-h-40 lg:group-hover:opacity-100">
                {x.d}
              </p>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold">
                Ver fechas <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Pilares ─────────────────────────────────────── */}
      <section className="bg-paper">
        <div className="mx-auto grid max-w-[1400px] gap-px overflow-hidden px-4 py-20 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-10">
          {pillars.map((p, i) => (
            <Reveal key={p.verb} delay={i * 0.06} className="border-t-2 border-ink pt-5 sm:pr-8">
              <p className="eyebrow text-muted">0{i + 1}</p>
              <h3 className="display mt-3 text-5xl">{p.verb}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{p.text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Nosotros ────────────────────────────────────── */}
      <section id="nosotros" className="scroll-mt-20 bg-cream">
        <div className="mx-auto max-w-[1400px] px-4 py-24 sm:px-6 lg:px-10 lg:py-32">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
            <Reveal>
              <div className="relative">
                <div className="relative aspect-[3/4] overflow-hidden rounded-[var(--radius-card)] bg-ink">
                  <Image
                    src={founder.photo}
                    alt={`${founder.name}, fundadora de Empowerme, con el Premio Jalisco al Emprendimiento`}
                    fill
                    sizes="(min-width:1024px) 40vw, 100vw"
                    className="object-cover object-[50%_35%]"
                  />
                </div>
                <div className="absolute -bottom-6 -right-3 flex rotate-[-4deg] items-center gap-3 rounded-2xl bg-sun px-4 py-3 shadow-xl sm:px-5 sm:py-4 lg:-right-8">
                  <Award className="size-7 sm:size-8" />
                  <div>
                    <p className="eyebrow !text-[0.6rem]">Ganadora 2026</p>
                    <p className="text-sm font-bold leading-tight sm:text-base">Premio Jalisco al Emprendimiento</p>
                  </div>
                </div>
              </div>
              <div className="mt-12 flex items-end gap-4">
                <MeMark className="mb-1.5 h-7 w-auto shrink-0 text-brand" />
                <div>
                  <p className="display text-5xl">{founder.name}</p>
                  <p className="mt-1 text-sm text-muted">{founder.role}</p>
                </div>
              </div>
            </Reveal>

            <div>
              <Reveal>
                <Eyebrow className="text-brand">Quiénes somos</Eyebrow>
                <h2 className="display mt-4 text-[clamp(3rem,6.5vw,6rem)]">
                  Bienestar que se <span className="accent text-brand">sostiene</span> en comunidad
                </h2>
              </Reveal>
              <Reveal delay={0.05}>
                <div className="mt-8 space-y-4 text-lg leading-relaxed text-ink/75">
                  {founder.bio.map((p) => (
                    <p key={p}>{p}</p>
                  ))}
                </div>
              </Reveal>

              <Reveal delay={0.1}>
                <h3 className="eyebrow mt-12 text-muted">Reconocimientos</h3>
                <ul className="mt-4 divide-y divide-ink/10 border-y border-ink/10">
                  {awards.map((a) => (
                    <li key={a.title} className="grid grid-cols-[4.5rem_1fr] gap-4 py-4">
                      <span className="display text-3xl text-brand">{a.year}</span>
                      <span>
                        <span className="block font-semibold">{a.title}</span>
                        <span className="block text-sm text-muted">{a.detail}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
          </div>

          {/* Trayectoria */}
          <div className="mt-24">
            <Reveal>
              <h3 className="eyebrow text-muted">Trayectoria</h3>
            </Reveal>
            <Wave className="mt-6 h-10 w-full text-brand" arches={24} strokeWidth={2.5} />
            <ol className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {timeline.map((t, i) => (
                <Reveal as="li" key={t.title} delay={i * 0.08}>
                  <p className="display text-4xl">{t.year}</p>
                  <p className="mt-2 font-semibold">{t.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{t.text}</p>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ── Empresas ────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden bg-ink text-paper">
        <Image src={media.officeCheer} alt="" fill sizes="100vw" className="-z-10 object-cover opacity-25" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink via-ink/90 to-ink/60" />
        <div className="mx-auto grid max-w-[1400px] gap-14 px-4 py-24 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:px-10 lg:py-32">
          <Reveal>
            <Eyebrow className="text-sun">Programas para empresas</Eyebrow>
            <h2 className="mt-5 text-[clamp(2.4rem,5vw,4.6rem)] font-semibold leading-[1] tracking-[-0.03em]">
              ¿Y si el bienestar se convirtiera en parte de la <span className="accent font-normal text-sun">cultura</span> de tu empresa?
            </h2>
            <p className="mt-6 max-w-lg text-lg text-paper/75">
              Retos de 30 días y experiencias in-company para impulsar la salud, la energía y la conexión de tus colaboradores.
              Medimos participación y resultados.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/programas#contacto" className={btn("brand", "lg")}>
                Solicitar información
              </Link>
              <Link href="/programas" className={btn("outline-light", "lg")}>
                Ver retos
              </Link>
            </div>
          </Reveal>
          <ul className="grid gap-3 self-end">
            {programs.slice(0, 4).map((p, i) => (
              <Reveal as="li" key={p.id} delay={i * 0.06}>
                <Link
                  href={`/programas#${p.slug}`}
                  className="group flex items-center gap-5 rounded-2xl bg-white/[0.06] p-4 ring-1 ring-white/10 backdrop-blur transition hover:bg-white/10"
                >
                  <span className="display grid size-16 shrink-0 place-items-center rounded-xl bg-paper text-ink">
                    <span className="text-3xl leading-none">{p.durationDays}</span>
                    <span className="eyebrow -mt-3 !text-[0.5rem]">{p.durationDays === 1 ? "día" : "días"}</span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-lg font-semibold">{p.title}</span>
                    <span className="block truncate text-sm text-paper/60">{p.tagline}</span>
                  </span>
                  <ArrowRight className="size-5 shrink-0 transition-transform group-hover:translate-x-1" />
                </Link>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Testimonios ─────────────────────────────────── */}
      <section className="bg-paper">
        <div className="mx-auto max-w-[1400px] px-4 py-24 sm:px-6 lg:px-10 lg:py-32">
          <Reveal>
            <Eyebrow className="text-brand">Lo que dice la comunidad</Eyebrow>
          </Reveal>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {testimonials.map((t, i) => (
              <Reveal key={t.name} delay={i * 0.07}>
                <figure className={`flex h-full flex-col rounded-[var(--radius-card)] p-7 ${["bg-pink/50", "bg-sun/50", "bg-sage/40"][i]}`}>
                  <Quote className="size-7 text-ink/40" />
                  <blockquote className="accent mt-4 flex-1 text-[1.75rem] leading-[1.15]">“{t.quote}”</blockquote>
                  <figcaption className="mt-8 border-t border-ink/15 pt-4">
                    <span className="block font-semibold">{t.name}</span>
                    <span className="block text-sm text-ink/60">{t.detail}</span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Comunidad ───────────────────────────────────── */}
      <section id="comunidad" className="scroll-mt-20 bg-cream">
        <div className="mx-auto max-w-[1400px] px-4 py-24 sm:px-6 lg:px-10 lg:py-32">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <Reveal>
              <Eyebrow className="text-brand">Comunidad</Eyebrow>
              <h2 className="display mt-4 text-[clamp(3rem,7vw,6.5rem)]">
                Aquí vienes <br /> por la <span className="accent text-brand">gente</span>
              </h2>
            </Reveal>
            <Reveal delay={0.1} className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {highlights.map((h) => (
                  <span key={h} className="rounded-full bg-white px-3.5 py-1.5 text-sm font-medium ring-1 ring-line">
                    {h}
                  </span>
                ))}
              </div>
              <a href={site.instagram} target="_blank" rel="noreferrer" className={btn("ink", "lg")}>
                <InstagramIcon className="size-5" /> Síguenos en {site.instagramHandle}
              </a>
            </Reveal>
          </div>
          <div className="mt-12 grid auto-rows-[160px] grid-cols-2 gap-3 sm:auto-rows-[200px] lg:grid-cols-4">
            {[
              { src: media.runPink, cls: "row-span-2" },
              { src: media.handsUp, cls: "" },
              { src: media.elbow, cls: "" },
              { src: media.medals, cls: "row-span-2" },
              { src: media.yogaFour, cls: "col-span-2 lg:col-span-1" },
              { src: media.dumbbells, cls: "" },
            ].map((m, i) => (
              <Reveal key={i} delay={i * 0.05} className={`relative overflow-hidden rounded-2xl bg-sand ${m.cls}`}>
                <Image src={m.src} alt="" fill sizes="(min-width:1024px) 25vw, 50vw" className="object-cover transition duration-700 hover:scale-105" />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA final ───────────────────────────────────── */}
      <section className="relative overflow-hidden bg-brand text-white">
        <div className="mx-auto max-w-[1400px] px-4 py-24 text-center sm:px-6 lg:px-10 lg:py-32">
          <Wave className="mx-auto h-10 w-56 text-white/70" arches={6} strokeWidth={3} />
          <h2 className="display mx-auto mt-8 max-w-[14ch] text-[clamp(3.4rem,9vw,8.5rem)]">
            Tu próximo domingo <span className="accent">empieza aquí</span>
          </h2>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link href="/experiencias" className={btn("light", "lg")}>
              Reservar mi lugar
            </Link>
            <ArrowLink href="/programas" className="h-14 px-4 text-white">
              Soy empresa
            </ArrowLink>
          </div>
        </div>
      </section>
    </>
  );
}
