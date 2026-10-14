"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import { saveProgram } from "@/app/actions/admin";
import { btn, Field, inputCls } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { Program } from "@/lib/types";

const lines = (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean);

export function ProgramEditor({ program, library, defaultOpen }: { program: Program; library: { key: string; url: string }[]; defaultOpen?: boolean }) {
  const [p, setP] = useState(program);
  const [open, setOpen] = useState(defaultOpen ?? false);
  const [text, setText] = useState({ pillars: program.pillars.join("\n"), includes: program.includes.join("\n"), outcomes: program.outcomes.join("\n") });
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);
  const set = <K extends keyof Program>(k: K, v: Program[K]) => {
    setSaved(false);
    setP((x) => ({ ...x, [k]: v }));
  };

  return (
    <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-line">
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full items-center gap-4 p-4 text-left hover:bg-cream/40">
        <span className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-sand">
          {p.image && <Image src={p.image} alt="" fill sizes="56px" className="object-cover" />}
        </span>
        <span className="flex-1">
          <span className="block font-semibold">{p.title || "Nuevo programa"}</span>
          <span className="block text-sm text-muted">{p.durationDays} días · {p.format} · {p.published ? "Publicado" : "Oculto"}</span>
        </span>
        <ChevronDown className={cn("size-5 transition", open && "rotate-180")} />
      </button>
      {open && (
        <form
          className="grid gap-4 border-t border-line p-5 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            start(async () => {
              await saveProgram({ ...p, pillars: lines(text.pillars), includes: lines(text.includes), outcomes: lines(text.outcomes) });
              setSaved(true);
            });
          }}
        >
          <Field label="Título">
            <input required value={p.title} onChange={(e) => set("title", e.target.value)} className={inputCls} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Duración (días)">
              <input type="number" min={1} value={p.durationDays} onChange={(e) => set("durationDays", Number(e.target.value))} className={inputCls} />
            </Field>
            <Field label="Orden">
              <input type="number" value={p.sort} onChange={(e) => set("sort", Number(e.target.value))} className={inputCls} />
            </Field>
          </div>
          <Field label="Frase corta" className="sm:col-span-2">
            <input value={p.tagline} onChange={(e) => set("tagline", e.target.value)} className={inputCls} />
          </Field>
          <Field label="Descripción" className="sm:col-span-2">
            <textarea rows={3} value={p.description} onChange={(e) => set("description", e.target.value)} className={inputCls} />
          </Field>
          <Field label="Pilares (uno por línea)">
            <textarea rows={3} value={text.pillars} onChange={(e) => setText((t) => ({ ...t, pillars: e.target.value }))} className={inputCls} />
          </Field>
          <Field label="Formato">
            <input value={p.format} onChange={(e) => set("format", e.target.value)} className={inputCls} placeholder="Presencial · Híbrido" />
          </Field>
          <Field label="Incluye (uno por línea)">
            <textarea rows={5} value={text.includes} onChange={(e) => setText((t) => ({ ...t, includes: e.target.value }))} className={inputCls} />
          </Field>
          <Field label="Resultados (uno por línea)">
            <textarea rows={5} value={text.outcomes} onChange={(e) => setText((t) => ({ ...t, outcomes: e.target.value }))} className={inputCls} />
          </Field>
          <div className="sm:col-span-2">
            <p className="mb-2 text-sm font-semibold">Imagen</p>
            <div className="grid grid-cols-6 gap-2 sm:grid-cols-10">
              {library.map((m) => (
                <button key={m.key} type="button" onClick={() => set("image", m.url)} className={cn("relative aspect-square overflow-hidden rounded-lg ring-2 ring-offset-1", p.image === m.url ? "ring-brand" : "ring-transparent")}>
                  <Image src={m.url} alt="" fill sizes="64px" className="object-cover" />
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={p.published} onChange={(e) => set("published", e.target.checked)} className="size-4 accent-[var(--color-brand)]" /> Publicado
            </label>
            <select value={p.color} onChange={(e) => set("color", e.target.value as Program["color"])} className={cn(inputCls, "w-auto py-2")}>
              <option value="brand">Color: rojo</option>
              <option value="pink">Color: rosa</option>
              <option value="sun">Color: sol</option>
              <option value="sage">Color: salvia</option>
            </select>
            <span className="flex-1" />
            {saved && <span className="text-sm font-medium text-ink/70">Guardado ✓</span>}
            <button disabled={pending} className={btn("brand", "md")}>
              {pending && <Loader2 className="size-4 animate-spin" />} Guardar
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
