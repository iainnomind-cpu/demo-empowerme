"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, ChevronDown, Info, Loader2, Save, Send, Users } from "lucide-react";
import { createCampaign, previewAudience } from "@/app/actions/marketing";
import { WhatsAppPreview } from "@/components/admin/WhatsAppPreview";
import { btn, Field, inputCls } from "@/components/ui";
import { fillTemplate, presets, VARIABLES } from "@/content/marketing";
import { cn } from "@/lib/cn";
import { dateTime, localInputToIso } from "@/lib/format";
import type { ActivityType, Audience, AudienceSegment, Campaign, CampaignKind } from "@/lib/types";

type Act = { id: string; title: string; type: ActivityType; image: string; sessions: { id: string; startsAt: string; booked: number }[] };

const SEGMENTS: { k: AudienceSegment; label: string; hint: string }[] = [
  { k: "comunidad", label: "Toda la comunidad", hint: "Todas las personas registradas con permiso de WhatsApp." },
  { k: "experiencia", label: "Asistentes de una experiencia", hint: "Quienes ya fueron a una experiencia específica." },
  { k: "tipo", label: "Por tipo de experiencia", hint: "Quienes han ido a clases, talleres o carreras." },
  { k: "sesion", label: "Inscritos de una fecha", hint: "Personas con boleto para una fecha concreta." },
  { k: "recurrentes", label: "Comunidad fiel (2+ reservas)", hint: "Ideal para preventas y beneficios." },
  { k: "cumpleanos", label: "Cumplen años hoy", hint: "Para felicitaciones." },
];

const sampleVars = Object.fromEntries(VARIABLES.map((v) => [v.key, v.sample]));

export function CampaignBuilder({ activities, initial }: { activities: Act[]; initial?: Partial<Campaign> }) {
  const router = useRouter();
  const [kind, setKind] = useState<CampaignKind>(initial?.kind ?? "evento");
  const [name, setName] = useState(initial?.name ? `${initial.name} (copia)` : "");
  const [audience, setAudience] = useState<Audience>(initial?.audience ?? { segment: "comunidad" });
  const [activityId, setActivityId] = useState(initial?.activityId ?? activities[0]?.id ?? "");
  const [body, setBody] = useState(initial?.body ?? presets.evento.body);
  const [useImage, setUseImage] = useState(Boolean(initial?.imageUrl ?? true));
  const [templateName, setTemplateName] = useState(initial?.templateName ?? "");
  const [advanced, setAdvanced] = useState(Boolean(initial?.templateName));
  const [when, setWhen] = useState<"ahora" | "programar">("ahora");
  const [scheduleAt, setScheduleAt] = useState("");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const [preview, setPreview] = useState<{ count: number; excluded: { noOptIn: number; noPhone: number; optedOut: number }; sample: { name: string; phone: string; text: string }[] } | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);

  const promo = activities.find((a) => a.id === activityId);
  const session = audience.segment === "sesion" ? activities.flatMap((a) => a.sessions.map((s) => ({ a, s }))).find((x) => x.s.id === audience.sessionId) : undefined;
  const imageUrl = useImage ? (session?.a.image ?? promo?.image) : undefined;

  useEffect(() => {
    setLoadingPreview(true);
    const t = setTimeout(async () => {
      const r = await previewAudience(audience, kind, activityId, body);
      setPreview(r);
      setLoadingPreview(false);
    }, 350);
    return () => clearTimeout(t);
  }, [audience, kind, activityId, body]);

  const chooseKind = (k: CampaignKind) => {
    setKind(k);
    setBody(presets[k].body);
    if (k === "recordatorio") setAudience({ segment: "sesion", sessionId: activities.flatMap((a) => a.sessions)[0]?.id });
    if (k === "felicitacion") setAudience({ segment: "cumpleanos" });
    if (k === "evento" && (audience.segment === "sesion" || audience.segment === "cumpleanos")) setAudience({ segment: "comunidad" });
  };

  const insertVar = (key: string) => {
    const el = textRef.current;
    const token = `{{${key}}}`;
    if (!el) return setBody((b) => b + token);
    const { selectionStart: a, selectionEnd: b } = el;
    const next = body.slice(0, a) + token + body.slice(b);
    setBody(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(a + token.length, a + token.length);
    });
  };

  const submit = (mode: "borrador" | "enviar" | "programar") => {
    setError("");
    if (mode === "enviar" && !confirm(`Se enviará ahora a ${preview?.count ?? 0} personas por WhatsApp. ¿Continuar?`)) return;
    start(async () => {
      const res = await createCampaign(
        {
          name: name || `${presets[kind].label} · ${promo?.title ?? session?.a.title ?? ""}`.trim(),
          kind,
          audience,
          body,
          activityId: audience.segment === "sesion" ? session?.a.id : activityId || undefined,
          imageUrl,
          templateName: templateName || undefined,
          scheduledAt: mode === "programar" && scheduleAt ? localInputToIso(scheduleAt) : undefined,
        },
        mode,
      );
      if (!res.ok) return setError(res.error);
      router.push(`/admin/marketing/${res.id}`);
    });
  };

  const previewText = preview?.sample[0]?.text ?? fillTemplate(body, { ...sampleVars, experiencia: promo?.title ?? sampleVars.experiencia });
  const totalExcluded = preview ? preview.excluded.noOptIn + preview.excluded.noPhone + preview.excluded.optedOut : 0;

  return (
    <div className="grid gap-8 xl:grid-cols-[1fr_380px]">
      <div className="space-y-6">
        <Step n={1} title="Tipo de mensaje">
          <div className="grid gap-3 sm:grid-cols-2">
            {(Object.keys(presets) as CampaignKind[]).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => chooseKind(k)}
                className={cn("rounded-2xl p-4 text-left ring-1 transition", kind === k ? "bg-ink text-paper ring-ink" : "bg-white ring-line hover:ring-ink/30")}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="font-semibold">{presets[k].label}</span>
                  <span className={cn("rounded-full px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide", presets[k].category === "Utilidad" ? "bg-sage/50 text-ink" : kind === k ? "bg-white/15" : "bg-ink/[0.06]")}>
                    {presets[k].category}
                  </span>
                </span>
                <span className={cn("mt-1 block text-sm", kind === k ? "text-paper/70" : "text-muted")}>{presets[k].hint}</span>
              </button>
            ))}
          </div>
        </Step>

        <Step n={2} title="¿A quién le llega?">
          <div className="grid gap-2 sm:grid-cols-2">
            {SEGMENTS.map((s) => (
              <label key={s.k} className={cn("flex cursor-pointer gap-3 rounded-2xl p-3.5 ring-1 transition", audience.segment === s.k ? "bg-brand-soft/50 ring-brand" : "bg-white ring-line hover:ring-ink/30")}>
                <input
                  type="radio"
                  name="segment"
                  className="mt-1 accent-[var(--color-brand)]"
                  checked={audience.segment === s.k}
                  onChange={() =>
                    setAudience({
                      segment: s.k,
                      activityId: s.k === "experiencia" ? activities[0]?.id : undefined,
                      sessionId: s.k === "sesion" ? activities.flatMap((a) => a.sessions)[0]?.id : undefined,
                      type: s.k === "tipo" ? "carrera" : undefined,
                    })
                  }
                />
                <span>
                  <span className="block text-sm font-semibold">{s.label}</span>
                  <span className="block text-xs text-muted">{s.hint}</span>
                </span>
              </label>
            ))}
          </div>

          {audience.segment === "experiencia" && (
            <Field label="Experiencia" className="mt-4">
              <select value={audience.activityId} onChange={(e) => setAudience({ ...audience, activityId: e.target.value })} className={inputCls}>
                {activities.map((a) => (
                  <option key={a.id} value={a.id}>{a.title}</option>
                ))}
              </select>
            </Field>
          )}
          {audience.segment === "tipo" && (
            <Field label="Tipo" className="mt-4">
              <select value={audience.type} onChange={(e) => setAudience({ ...audience, type: e.target.value as ActivityType })} className={inputCls}>
                <option value="clase">Clases</option>
                <option value="taller">Talleres</option>
                <option value="carrera">Carreras</option>
              </select>
            </Field>
          )}
          {audience.segment === "sesion" && (
            <Field label="Fecha" className="mt-4">
              <select value={audience.sessionId} onChange={(e) => setAudience({ ...audience, sessionId: e.target.value })} className={inputCls}>
                {activities.map((a) => (
                  <optgroup key={a.id} label={a.title}>
                    {a.sessions.map((s) => (
                      <option key={s.id} value={s.id}>
                        {dateTime(s.startsAt)} · {s.booked} inscritos
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </Field>
          )}
          {presets[kind].category === "Marketing" && (
            <p className="mt-4 flex items-start gap-2 rounded-xl bg-cream p-3 text-xs leading-relaxed text-ink/75">
              <Info className="mt-0.5 size-4 shrink-0" />
              Por reglas de WhatsApp, los mensajes de marketing solo llegan a quienes aceptaron recibirlos al registrarse. Quien responda BAJA deja de recibirlos
              automáticamente.
            </p>
          )}
        </Step>

        <Step n={3} title="Mensaje">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nombre interno de la campaña">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder={`${presets[kind].label} · ${promo?.title ?? ""}`} className={inputCls} />
            </Field>
            {audience.segment !== "sesion" && kind !== "felicitacion" && (
              <Field label="Experiencia que promocionas" hint="Llena {{experiencia}}, {{fecha}}, {{sede}} y {{link}}.">
                <select value={activityId} onChange={(e) => setActivityId(e.target.value)} className={inputCls}>
                  <option value="">Ninguna</option>
                  {activities.map((a) => (
                    <option key={a.id} value={a.id}>{a.title}</option>
                  ))}
                </select>
              </Field>
            )}
          </div>

          <div className="mt-4">
            <div className="mb-2 flex flex-wrap items-center gap-1.5">
              <span className="mr-1 text-sm font-semibold">Insertar:</span>
              {VARIABLES.map((v) => (
                <button key={v.key} type="button" onClick={() => insertVar(v.key)} className="rounded-full bg-ink/[0.06] px-2.5 py-1 font-mono text-xs hover:bg-ink/10">
                  {`{{${v.key}}}`}
                </button>
              ))}
            </div>
            <textarea ref={textRef} rows={9} value={body} onChange={(e) => setBody(e.target.value)} className={cn(inputCls, "font-[inherit] leading-relaxed")} />
            <div className="mt-1 flex justify-between text-xs text-muted">
              <span>*negritas* · _itálicas_ · emojis 🧡</span>
              <span className={cn("tabular", body.length > 1024 && "font-semibold text-brand")}>{body.length}/1024</span>
            </div>
          </div>

          <label className="mt-4 flex items-center gap-3 text-sm">
            <input type="checkbox" checked={useImage} onChange={(e) => setUseImage(e.target.checked)} className="size-4 accent-[var(--color-brand)]" />
            Enviar con la foto de la experiencia
          </label>

          <button type="button" onClick={() => setAdvanced((v) => !v)} className="mt-4 flex items-center gap-1 text-sm font-semibold text-muted hover:text-ink">
            <ChevronDown className={cn("size-4 transition", advanced && "rotate-180")} /> Plantilla aprobada de Meta (producción)
          </button>
          {advanced && (
            <div className="mt-3 rounded-xl bg-cream p-4">
              <Field label="Nombre de la plantilla" hint="Para escribirle a alguien que no te ha escrito en las últimas 24 h, Meta exige una plantilla aprobada con el mismo texto. Las variables se envían en el orden en que aparecen.">
                <input value={templateName} onChange={(e) => setTemplateName(e.target.value)} placeholder="nuevo_evento_v1" className={cn(inputCls, "font-mono")} />
              </Field>
            </div>
          )}
        </Step>

        <Step n={4} title="Envío">
          <div className="grid gap-2 sm:grid-cols-2">
            {([
              ["ahora", "Enviar ahora", Send],
              ["programar", "Programar", CalendarClock],
            ] as const).map(([k, l, Icon]) => (
              <button key={k} type="button" onClick={() => setWhen(k)} className={cn("flex items-center gap-2 rounded-2xl p-4 text-sm font-semibold ring-1", when === k ? "bg-ink text-paper ring-ink" : "bg-white ring-line")}>
                <Icon className="size-4" /> {l}
              </button>
            ))}
          </div>
          {when === "programar" && (
            <Field label="Fecha y hora (Guadalajara)" className="mt-4">
              <input type="datetime-local" value={scheduleAt} onChange={(e) => setScheduleAt(e.target.value)} className={inputCls} />
            </Field>
          )}
          {error && <p className="mt-4 rounded-xl bg-brand-soft/60 px-3 py-2 text-sm font-medium text-brand-deep" role="alert">{error}</p>}
          <div className="mt-5 flex flex-wrap gap-2">
            <button type="button" disabled={pending || !preview?.count} onClick={() => submit(when === "ahora" ? "enviar" : "programar")} className={btn("brand", "lg")}>
              {pending ? <Loader2 className="size-4 animate-spin" /> : when === "ahora" ? <Send className="size-4" /> : <CalendarClock className="size-4" />}
              {when === "ahora" ? `Enviar a ${preview?.count ?? 0} personas` : "Programar campaña"}
            </button>
            <button type="button" disabled={pending} onClick={() => submit("borrador")} className={btn("soft", "lg")}>
              <Save className="size-4" /> Guardar borrador
            </button>
          </div>
        </Step>
      </div>

      <aside className="space-y-4 xl:sticky xl:top-8 xl:self-start">
        <div className="rounded-2xl bg-white p-5 ring-1 ring-line">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <Users className="size-4" /> Audiencia
            </p>
            {loadingPreview && <Loader2 className="size-4 animate-spin text-muted" />}
          </div>
          <p className="display mt-2 text-6xl tabular">{preview?.count ?? "—"}</p>
          <p className="text-sm text-muted">personas recibirán el mensaje</p>
          {preview && totalExcluded > 0 && (
            <ul className="mt-3 space-y-1 border-t border-line pt-3 text-xs text-muted">
              {preview.excluded.noOptIn > 0 && <li>{preview.excluded.noOptIn} sin permiso de marketing</li>}
              {preview.excluded.optedOut > 0 && <li>{preview.excluded.optedOut} se dieron de baja</li>}
              {preview.excluded.noPhone > 0 && <li>{preview.excluded.noPhone} sin teléfono válido</li>}
            </ul>
          )}
          {preview && preview.sample.length > 0 && (
            <p className="mt-3 truncate text-xs text-muted">
              {preview.sample.map((s) => s.name.split(" ")[0]).join(", ")}
              {preview.count > preview.sample.length && ` y ${preview.count - preview.sample.length} más`}
            </p>
          )}
        </div>
        <WhatsAppPreview text={previewText} imageUrl={imageUrl} />
        <p className="text-center text-xs text-muted">Vista previa con los datos de {preview?.sample[0]?.name.split(" ")[0] ?? "ejemplo"}</p>
      </aside>
    </div>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-white p-6 ring-1 ring-line">
      <h2 className="mb-5 flex items-center gap-3 text-lg font-semibold">
        <span className="display grid size-8 place-items-center rounded-full bg-ink text-lg text-paper">{n}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}
