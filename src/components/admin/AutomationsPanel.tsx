"use client";

import { useState, useTransition } from "react";
import { BellRing, Cake, Loader2, Play } from "lucide-react";
import { runAutomationsNow, saveAutomations } from "@/app/actions/marketing";
import { btn, inputCls } from "@/components/ui";
import { cn } from "@/lib/cn";
import { dateTime } from "@/lib/format";
import type { Automations } from "@/lib/types";

export function AutomationsPanel({ initial }: { initial: Automations }) {
  const [a, setA] = useState(initial);
  const [open, setOpen] = useState<"reminders" | "birthdays" | null>(null);
  const [saving, startSave] = useTransition();
  const [running, startRun] = useTransition();
  const [result, setResult] = useState("");

  const update = (next: Automations) => {
    setA(next);
    startSave(() => saveAutomations(next));
  };

  const items = [
    { k: "reminders" as const, icon: BellRing, title: "Recordatorio 1 día antes", text: "A cada persona con boleto, el día anterior a su experiencia." },
    { k: "birthdays" as const, icon: Cake, title: "Felicitación de cumpleaños", text: "El día de su cumpleaños, a quienes aceptaron mensajes." },
  ];

  return (
    <div className="rounded-2xl bg-white ring-1 ring-line">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-5">
        <div>
          <h2 className="text-lg font-semibold">Automatizaciones</h2>
          <p className="text-sm text-muted">Corren solas todos los días a las 9:00 a.m.{a.lastRunAt && ` · Última ejecución: ${dateTime(a.lastRunAt)}`}</p>
        </div>
        <button
          type="button"
          disabled={running}
          onClick={() =>
            startRun(async () => {
              const r = await runAutomationsNow();
              setResult(`${r.reminders} recordatorios · ${r.birthdays} felicitaciones · ${r.campaigns} campañas programadas`);
            })
          }
          className={btn("soft", "sm")}
        >
          {running ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4" />} Ejecutar ahora
        </button>
      </div>
      {result && <p className="border-b border-line bg-sage/20 px-5 py-2 text-sm">Enviados: {result}</p>}
      <ul className="divide-y divide-line">
        {items.map((it) => {
          const cfg = a[it.k];
          return (
            <li key={it.k} className="p-5">
              <div className="flex items-start gap-4">
                <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", cfg.enabled ? "bg-brand text-white" : "bg-ink/[0.06] text-muted")}>
                  <it.icon className="size-5" />
                </span>
                <div className="flex-1">
                  <p className="font-semibold">{it.title}</p>
                  <p className="text-sm text-muted">{it.text}</p>
                  <button type="button" onClick={() => setOpen(open === it.k ? null : it.k)} className="mt-1 text-sm font-semibold text-brand hover:underline">
                    {open === it.k ? "Cerrar" : "Editar mensaje"}
                  </button>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={cfg.enabled}
                  aria-label={it.title}
                  onClick={() => update({ ...a, [it.k]: { ...cfg, enabled: !cfg.enabled } })}
                  className={cn("relative h-6 w-11 shrink-0 rounded-full transition", cfg.enabled ? "bg-brand" : "bg-ink/20")}
                >
                  <span className={cn("absolute top-0.5 size-5 rounded-full bg-white shadow transition-all", cfg.enabled ? "left-[22px]" : "left-0.5")} />
                </button>
              </div>
              {open === it.k && (
                <div className="mt-4 space-y-2 pl-14">
                  <textarea
                    rows={6}
                    defaultValue={cfg.body}
                    onBlur={(e) => update({ ...a, [it.k]: { ...cfg, body: e.target.value } })}
                    className={cn(inputCls, "text-sm leading-relaxed")}
                  />
                  <input
                    defaultValue={cfg.templateName ?? ""}
                    onBlur={(e) => update({ ...a, [it.k]: { ...cfg, templateName: e.target.value.trim() || undefined } })}
                    placeholder="Plantilla de Meta (opcional), ej. recordatorio_v1"
                    className={cn(inputCls, "font-mono text-sm")}
                  />
                  <p className="text-xs text-muted">{saving ? "Guardando…" : "Se guarda al salir del campo."} Variables: {"{{nombre}} {{experiencia}} {{fecha}} {{hora}} {{sede}} {{link}}"}</p>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
