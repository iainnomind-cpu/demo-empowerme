"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { CalendarPlus, ImagePlus, Loader2, Plus, Trash2 } from "lucide-react";
import { saveActivity, uploadImage, type ActivityPayload } from "@/app/actions/admin";
import { ActivityCard } from "@/components/site/ActivityCard";
import { btn, Field, inputCls } from "@/components/ui";
import { cn } from "@/lib/cn";
import { isoToLocalInput, localInputToIso, slugify } from "@/lib/format";
import type { ActivityWithSessions } from "@/lib/types";

type S = { id?: string; start: string; capacity: number; booked?: number };

const blank: ActivityPayload = {
  title: "",
  slug: "",
  type: "clase",
  mode: "unica",
  tagline: "",
  description: "",
  includes: [],
  image: "",
  location: { name: "", address: "" },
  coach: "",
  durationMin: 60,
  level: "Todos los niveles",
  tickets: [{ id: "general", name: "Registro general", price: 0 }],
  faqs: [],
  requiresShirtSize: false,
  published: true,
  featured: false,
  sessions: [],
};

const WEEKDAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export function ActivityForm({ initial, library }: { initial?: ActivityWithSessions; library: { key: string; url: string }[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [a, setA] = useState<ActivityPayload>(() =>
    initial
      ? { ...initial, coach: initial.coach ?? "", sessions: [] }
      : blank,
  );
  const [includesText, setIncludesText] = useState((initial?.includes ?? []).join("\n"));
  const [sessions, setSessions] = useState<S[]>(
    () => initial?.sessions.map((s) => ({ id: s.id, start: isoToLocalInput(s.startsAt), capacity: s.capacity, booked: s.booked })) ?? [],
  );
  const [gen, setGen] = useState({ days: [2, 4] as number[], time: "07:00", from: new Date().toISOString().slice(0, 10), weeks: 4, capacity: 25 });

  const set = <K extends keyof ActivityPayload>(k: K, v: ActivityPayload[K]) => {
    setSaved(false);
    setA((p) => ({ ...p, [k]: v }));
  };

  const payload = (): ActivityPayload => ({
    ...a,
    slug: a.slug || slugify(a.title),
    includes: includesText.split("\n").map((x) => x.trim()).filter(Boolean),
    sessions: sessions
      .filter((s) => s.start)
      .map((s) => {
        const startsAt = localInputToIso(s.start);
        return { id: s.id, startsAt, endsAt: new Date(new Date(startsAt).getTime() + a.durationMin * 60000).toISOString(), capacity: Number(s.capacity) };
      }),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    start(async () => {
      const res = await saveActivity(payload());
      if (!res.ok) return setError(res.error);
      setSaved(true);
      if (!initial) router.push(`/admin/experiencias/${res.id}?creada=1`);
      else router.refresh();
    });
  };

  async function onUpload(f: File) {
    setUploading(true);
    const fd = new FormData();
    fd.set("file", f);
    const res = await uploadImage(fd);
    setUploading(false);
    if (res.ok) set("image", res.url);
    else setError(res.error);
  }

  function generate() {
    const out: S[] = [];
    const [y, m, d] = gen.from.split("-").map(Number);
    for (let i = 0; i < gen.weeks * 7; i++) {
      const dt = new Date(Date.UTC(y, m - 1, d + i));
      if (gen.days.includes(dt.getUTCDay())) out.push({ start: `${dt.toISOString().slice(0, 10)}T${gen.time}`, capacity: gen.capacity });
    }
    setSessions((p) => [...p, ...out].sort((x, z) => x.start.localeCompare(z.start)));
  }

  const preview = payload();
  const previewActivity: ActivityWithSessions = {
    ...preview,
    id: initial?.id ?? "preview",
    slug: preview.slug || "preview",
    title: preview.title || "Título de la experiencia",
    tagline: preview.tagline || "Una frase corta que invite a moverse.",
    image: preview.image || library[0].url,
    location: { ...preview.location, name: preview.location.name || "Sede" },
    coach: preview.coach || undefined,
    createdAt: "",
    sessions: preview.sessions.map((s, i) => ({ ...s, id: s.id ?? `p${i}`, activityId: "preview", booked: sessions[i]?.booked ?? 0 })),
  };

  return (
    <form onSubmit={submit} className="grid gap-8 xl:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <Section title="Información básica">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Título" className="sm:col-span-2">
              <input required value={a.title} onChange={(e) => set("title", e.target.value)} className={inputCls} placeholder="Ej. Yoga al amanecer" />
            </Field>
            <Field label="Tipo">
              <div className="grid grid-cols-3 gap-2">
                {(["clase", "taller", "carrera"] as const).map((t) => (
                  <button key={t} type="button" onClick={() => set("type", t)} className={cn("h-11 rounded-xl text-sm font-semibold capitalize ring-1", a.type === t ? "bg-ink text-paper ring-ink" : "ring-line hover:ring-ink/40")}>
                    {t}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Modalidad de reserva" hint={a.mode === "recurrente" ? "La persona elige una o varias fechas en un calendario." : "Evento con fecha fija (o pocas fechas)."}>
              <div className="grid grid-cols-2 gap-2">
                {([
                  ["unica", "Fecha fija"],
                  ["recurrente", "Recurrente"],
                ] as const).map(([k, l]) => (
                  <button key={k} type="button" onClick={() => set("mode", k)} className={cn("h-11 rounded-xl text-sm font-semibold ring-1", a.mode === k ? "bg-ink text-paper ring-ink" : "ring-line hover:ring-ink/40")}>
                    {l}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Frase corta" className="sm:col-span-2">
              <input required value={a.tagline} onChange={(e) => set("tagline", e.target.value)} className={inputCls} maxLength={140} />
            </Field>
            <Field label="Descripción" hint="Separa párrafos con una línea en blanco." className="sm:col-span-2">
              <textarea required rows={5} value={a.description} onChange={(e) => set("description", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Qué incluye" hint="Un elemento por línea." className="sm:col-span-2">
              <textarea rows={4} value={includesText} onChange={(e) => setIncludesText(e.target.value)} className={inputCls} placeholder={"Clase guiada\nCoffee break\nMedalla"} />
            </Field>
          </div>
        </Section>

        <Section title="Imagen">
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={() => fileRef.current?.click()} className={btn("ink", "sm")}>
              {uploading ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />} Subir imagen
            </button>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])} />
            <span className="text-sm text-muted">o elige de la galería · JPG/PNG hasta 5 MB</span>
          </div>
          <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8">
            {library.map((m) => (
              <button
                key={m.key}
                type="button"
                onClick={() => set("image", m.url)}
                className={cn("relative aspect-square overflow-hidden rounded-xl ring-2 ring-offset-2 transition", a.image === m.url ? "ring-brand" : "ring-transparent hover:ring-ink/20")}
                aria-label={`Usar imagen ${m.key}`}
              >
                <Image src={m.url} alt="" fill sizes="100px" className="object-cover" />
              </button>
            ))}
          </div>
        </Section>

        <Section title="Detalles">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Sede">
              <input required value={a.location.name} onChange={(e) => set("location", { ...a.location, name: e.target.value })} className={inputCls} placeholder="Bosque Los Colomos" />
            </Field>
            <Field label="Dirección">
              <input value={a.location.address} onChange={(e) => set("location", { ...a.location, address: e.target.value })} className={inputCls} />
            </Field>
            <Field label="Coach / guía">
              <input value={a.coach} onChange={(e) => set("coach", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Nivel">
              <input value={a.level} onChange={(e) => set("level", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Duración (minutos)">
              <input type="number" min={10} step={5} value={a.durationMin} onChange={(e) => set("durationMin", Number(e.target.value))} className={inputCls} />
            </Field>
            <label className="flex items-center gap-3 self-end rounded-xl p-3 ring-1 ring-line">
              <input type="checkbox" checked={a.requiresShirtSize} onChange={(e) => set("requiresShirtSize", e.target.checked)} className="size-5 accent-[var(--color-brand)]" />
              <span className="text-sm font-medium">Pedir talla de playera (kit de carrera)</span>
            </label>
          </div>
        </Section>

        <Section
          title="Boletos y precios"
          action={
            <button type="button" className={btn("soft", "sm")} onClick={() => set("tickets", [...a.tickets, { id: `t${Date.now().toString(36)}`, name: "", price: 0 }])}>
              <Plus className="size-4" /> Tipo de boleto
            </button>
          }
        >
          <div className="space-y-2">
            {a.tickets.map((t, i) => (
              <div key={t.id} className="grid grid-cols-[1fr_120px_auto] gap-2 sm:grid-cols-[1fr_1fr_120px_auto]">
                <input required value={t.name} placeholder="Nombre (ej. 10K)" onChange={(e) => set("tickets", a.tickets.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} className={inputCls} />
                <input value={t.description ?? ""} placeholder="Descripción (opcional)" onChange={(e) => set("tickets", a.tickets.map((x, j) => (j === i ? { ...x, description: e.target.value } : x)))} className={cn(inputCls, "hidden sm:block")} />
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">$</span>
                  <input type="number" min={0} value={t.price} onChange={(e) => set("tickets", a.tickets.map((x, j) => (j === i ? { ...x, price: Number(e.target.value) } : x)))} className={cn(inputCls, "pl-7 tabular")} />
                </div>
                <button type="button" disabled={a.tickets.length === 1} onClick={() => set("tickets", a.tickets.filter((_, j) => j !== i))} className="grid size-11 place-items-center rounded-xl text-muted hover:bg-ink/5 disabled:opacity-30" aria-label="Quitar boleto">
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
            <p className="text-xs text-muted">Precio 0 = registro gratuito (no pasa por la pasarela de pago).</p>
          </div>
        </Section>

        <Section
          title={`Fechas y cupo (${sessions.length})`}
          action={
            <button type="button" className={btn("soft", "sm")} onClick={() => setSessions((p) => [...p, { start: "", capacity: p.at(-1)?.capacity ?? 20 }])}>
              <Plus className="size-4" /> Fecha
            </button>
          }
        >
          {a.mode === "recurrente" && (
            <div className="mb-5 rounded-2xl bg-cream p-4">
              <p className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <CalendarPlus className="size-4" /> Generar fechas recurrentes
              </p>
              <div className="flex flex-wrap items-end gap-3">
                <div className="flex gap-1">
                  {WEEKDAYS.map((d, i) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setGen((g) => ({ ...g, days: g.days.includes(i) ? g.days.filter((x) => x !== i) : [...g.days, i] }))}
                      className={cn("h-9 w-10 rounded-lg text-xs font-semibold ring-1", gen.days.includes(i) ? "bg-ink text-paper ring-ink" : "bg-white ring-line")}
                    >
                      {d}
                    </button>
                  ))}
                </div>
                <label className="text-xs font-medium">
                  Hora
                  <input type="time" value={gen.time} onChange={(e) => setGen((g) => ({ ...g, time: e.target.value }))} className={cn(inputCls, "mt-1 h-9 py-1")} />
                </label>
                <label className="text-xs font-medium">
                  Desde
                  <input type="date" value={gen.from} onChange={(e) => setGen((g) => ({ ...g, from: e.target.value }))} className={cn(inputCls, "mt-1 h-9 py-1")} />
                </label>
                <label className="w-20 text-xs font-medium">
                  Semanas
                  <input type="number" min={1} max={26} value={gen.weeks} onChange={(e) => setGen((g) => ({ ...g, weeks: Number(e.target.value) }))} className={cn(inputCls, "mt-1 h-9 py-1")} />
                </label>
                <label className="w-20 text-xs font-medium">
                  Cupo
                  <input type="number" min={1} value={gen.capacity} onChange={(e) => setGen((g) => ({ ...g, capacity: Number(e.target.value) }))} className={cn(inputCls, "mt-1 h-9 py-1")} />
                </label>
                <button type="button" onClick={generate} className={btn("ink", "sm", "h-9")}>Generar</button>
              </div>
            </div>
          )}
          <div className="space-y-2">
            {sessions.length === 0 && <p className="rounded-xl bg-cream px-4 py-6 text-center text-sm text-muted">Sin fechas todavía.</p>}
            {sessions.map((s, i) => (
              <div key={s.id ?? `n${i}`} className="grid grid-cols-[1fr_100px_auto] items-center gap-2 sm:grid-cols-[1fr_120px_110px_auto]">
                <input type="datetime-local" required value={s.start} onChange={(e) => setSessions((p) => p.map((x, j) => (j === i ? { ...x, start: e.target.value } : x)))} className={inputCls} />
                <div className="relative">
                  <input type="number" min={1} value={s.capacity} onChange={(e) => setSessions((p) => p.map((x, j) => (j === i ? { ...x, capacity: Number(e.target.value) } : x)))} className={cn(inputCls, "pr-12 tabular")} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted">cupo</span>
                </div>
                <span className="hidden text-sm text-muted sm:block">{s.booked ? `${s.booked} inscritos` : "—"}</span>
                <button
                  type="button"
                  onClick={() => {
                    if (s.booked && !confirm(`Esta fecha tiene ${s.booked} inscritos. ¿Eliminarla de todos modos?`)) return;
                    setSessions((p) => p.filter((_, j) => j !== i));
                  }}
                  className="grid size-11 place-items-center rounded-xl text-muted hover:bg-ink/5"
                  aria-label="Quitar fecha"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted">Horario de Guadalajara (GMT-6).</p>
        </Section>

        <Section
          title="Preguntas frecuentes"
          action={
            <button type="button" className={btn("soft", "sm")} onClick={() => set("faqs", [...a.faqs, { q: "", a: "" }])}>
              <Plus className="size-4" /> Pregunta
            </button>
          }
        >
          <div className="space-y-3">
            {a.faqs.length === 0 && <p className="text-sm text-muted">Sin preguntas. Agrega las dudas más comunes para reducir mensajes por WhatsApp.</p>}
            {a.faqs.map((f, i) => (
              <div key={i} className="grid gap-2 rounded-2xl bg-cream p-3 sm:grid-cols-[1fr_auto]">
                <div className="space-y-2">
                  <input value={f.q} placeholder="Pregunta" onChange={(e) => set("faqs", a.faqs.map((x, j) => (j === i ? { ...x, q: e.target.value } : x)))} className={inputCls} />
                  <textarea rows={2} value={f.a} placeholder="Respuesta" onChange={(e) => set("faqs", a.faqs.map((x, j) => (j === i ? { ...x, a: e.target.value } : x)))} className={inputCls} />
                </div>
                <button type="button" onClick={() => set("faqs", a.faqs.filter((_, j) => j !== i))} className="grid size-11 place-items-center rounded-xl text-muted hover:bg-ink/5" aria-label="Quitar pregunta">
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
        </Section>
      </div>

      <aside className="space-y-4 xl:sticky xl:top-8 xl:self-start">
        <div className="rounded-2xl bg-white p-5 ring-1 ring-line">
          <p className="mb-3 text-sm font-semibold">Publicación</p>
          <label className="flex items-center justify-between gap-3 py-2">
            <span className="text-sm">Visible en el sitio</span>
            <Toggle on={a.published} onChange={(v) => set("published", v)} />
          </label>
          <label className="flex items-center justify-between gap-3 py-2">
            <span className="text-sm">Destacar en inicio</span>
            <Toggle on={a.featured} onChange={(v) => set("featured", v)} />
          </label>
          <Field label="URL" className="mt-2">
            <div className="flex items-center rounded-xl border border-line bg-paper pl-3 text-sm text-muted">
              /experiencias/
              <input value={a.slug} onChange={(e) => set("slug", e.target.value)} placeholder={slugify(a.title) || "mi-experiencia"} className="min-w-0 flex-1 bg-transparent py-2.5 pr-3 text-ink outline-none" />
            </div>
          </Field>
          {error && <p className="mt-4 rounded-xl bg-brand-soft/60 px-3 py-2 text-sm font-medium text-brand-deep" role="alert">{error}</p>}
          {saved && <p className="mt-4 rounded-xl bg-sage/30 px-3 py-2 text-sm font-medium">Cambios guardados y publicados.</p>}
          <button disabled={pending} className={btn("brand", "lg", "mt-4 w-full")}>
            {pending && <Loader2 className="size-4 animate-spin" />} {initial ? "Guardar cambios" : "Crear experiencia"}
          </button>
        </div>
        <div>
          <p className="eyebrow mb-2 text-muted">Vista previa</p>
          <div className="pointer-events-none">
            <ActivityCard activity={previewActivity} />
          </div>
        </div>
      </aside>
    </form>
  );
}

function Section({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-white p-6 ring-1 ring-line">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={on} onClick={() => onChange(!on)} className={cn("relative h-6 w-11 rounded-full transition", on ? "bg-brand" : "bg-ink/20")}>
      <span className={cn("absolute top-0.5 size-5 rounded-full bg-white shadow transition-all", on ? "left-[22px]" : "left-0.5")} />
    </button>
  );
}
