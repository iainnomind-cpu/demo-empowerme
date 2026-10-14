"use client";

import { useState, useTransition } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Building2, Mail, Phone, Send, Users, X } from "lucide-react";
import { addLeadNote, setLeadStatus, setLeadValue } from "@/app/actions/admin";
import { btn, inputCls } from "@/components/ui";
import { cn } from "@/lib/cn";
import { dateShort, dateTime, mxn } from "@/lib/format";
import type { Lead, LeadStatus } from "@/lib/types";

const COLS: { k: LeadStatus; label: string; dot: string }[] = [
  { k: "nuevo", label: "Nuevo", dot: "bg-brand" },
  { k: "contactado", label: "Contactado", dot: "bg-sun" },
  { k: "propuesta", label: "Propuesta", dot: "bg-pink" },
  { k: "ganado", label: "Ganado", dot: "bg-sage" },
  { k: "perdido", label: "Perdido", dot: "bg-muted/50" },
];

/** Tablero tipo Kanban: arrastra tarjetas entre etapas o cámbialas desde el detalle. */
export function LeadsBoard({ initial, me }: { initial: Lead[]; me: string }) {
  const [leads, setLeads] = useState(initial);
  const [drag, setDrag] = useState<string | null>(null);
  const [over, setOver] = useState<LeadStatus | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [, start] = useTransition();
  const open = leads.find((l) => l.id === openId) ?? null;

  const move = (id: string, status: LeadStatus) => {
    setLeads((p) => p.map((l) => (l.id === id ? { ...l, status } : l)));
    start(() => setLeadStatus(id, status));
  };

  const saveNote = () => {
    if (!open || !note.trim()) return;
    const n = { at: new Date().toISOString(), text: note.trim(), author: me };
    setLeads((p) => p.map((l) => (l.id === open.id ? { ...l, notes: [n, ...l.notes] } : l)));
    const id = open.id;
    const text = note;
    setNote("");
    start(() => addLeadNote(id, text));
  };

  return (
    <>
      <div className="-mx-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
        <div className="grid min-w-[1100px] grid-cols-5 gap-3">
          {COLS.map((c) => {
            const items = leads.filter((l) => l.status === c.k);
            return (
              <div
                key={c.k}
                onDragOver={(e) => {
                  e.preventDefault();
                  setOver(c.k);
                }}
                onDragLeave={() => setOver(null)}
                onDrop={() => {
                  if (drag) move(drag, c.k);
                  setDrag(null);
                  setOver(null);
                }}
                className={cn("flex min-h-[420px] flex-col rounded-2xl bg-ink/[0.035] p-2 transition", over === c.k && "bg-brand-soft/60 ring-2 ring-brand/40")}
              >
                <div className="flex items-center justify-between px-2 py-2">
                  <span className="flex items-center gap-2 text-sm font-semibold">
                    <span className={cn("size-2 rounded-full", c.dot)} /> {c.label}
                  </span>
                  <span className="text-xs text-muted tabular">
                    {items.length} · {mxn(items.reduce((s, l) => s + (l.value ?? 0), 0))}
                  </span>
                </div>
                <ul className="flex-1 space-y-2">
                  {items.map((l) => (
                    <li
                      key={l.id}
                      draggable
                      onDragStart={() => setDrag(l.id)}
                      onDragEnd={() => setDrag(null)}
                      onClick={() => setOpenId(l.id)}
                      className={cn("cursor-grab rounded-xl bg-white p-3 shadow-sm ring-1 ring-line transition hover:ring-ink/30 active:cursor-grabbing", drag === l.id && "opacity-40")}
                    >
                      <p className="font-semibold leading-tight">{l.company}</p>
                      <p className="mt-0.5 text-xs text-muted">{l.contactName}{l.role && ` · ${l.role}`}</p>
                      <p className="mt-2 truncate text-xs">{l.programTitle}</p>
                      <div className="mt-2 flex items-center justify-between text-xs text-muted">
                        <span className="flex items-center gap-1">
                          <Users className="size-3" /> {l.employees}
                        </span>
                        <span className="font-semibold text-ink tabular">{l.value ? mxn(l.value) : "—"}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50">
            <motion.button className="absolute inset-0 bg-ink/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpenId(null)} aria-label="Cerrar" />
            <motion.aside
              className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col overflow-y-auto bg-paper shadow-2xl"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 32, stiffness: 320 }}
            >
              <div className="flex items-start justify-between border-b border-line p-6">
                <div>
                  <p className="flex items-center gap-2 text-xs text-muted">
                    <Building2 className="size-3.5" /> {open.source} · {dateShort(open.createdAt)}
                  </p>
                  <h2 className="display mt-1 text-4xl">{open.company}</h2>
                </div>
                <button onClick={() => setOpenId(null)} className="grid size-9 place-items-center rounded-full hover:bg-ink/5" aria-label="Cerrar">
                  <X className="size-5" />
                </button>
              </div>
              <div className="space-y-6 p-6">
                <div className="space-y-1.5 text-sm">
                  <p className="font-semibold">{open.contactName}{open.role && <span className="font-normal text-muted"> · {open.role}</span>}</p>
                  <a href={`mailto:${open.email}`} className="flex items-center gap-2 text-brand hover:underline">
                    <Mail className="size-4" /> {open.email}
                  </a>
                  {open.phone && (
                    <a href={`tel:${open.phone}`} className="flex items-center gap-2 hover:underline">
                      <Phone className="size-4" /> {open.phone}
                    </a>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl bg-white p-3 ring-1 ring-line">
                    <p className="text-xs text-muted">Programa</p>
                    <p className="font-semibold">{open.programTitle}</p>
                  </div>
                  <div className="rounded-xl bg-white p-3 ring-1 ring-line">
                    <p className="text-xs text-muted">Colaboradores</p>
                    <p className="font-semibold">{open.employees}</p>
                  </div>
                </div>
                {open.message && <p className="rounded-xl bg-cream p-4 text-sm leading-relaxed">“{open.message}”</p>}

                <div>
                  <p className="mb-2 text-sm font-semibold">Etapa</p>
                  <div className="flex flex-wrap gap-1.5">
                    {COLS.map((c) => (
                      <button key={c.k} onClick={() => move(open.id, c.k)} className={cn("flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ring-1", open.status === c.k ? "bg-ink text-paper ring-ink" : "ring-line hover:ring-ink/30")}>
                        <span className={cn("size-1.5 rounded-full", c.dot)} /> {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold">Valor estimado (MXN)</span>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    defaultValue={open.value ?? ""}
                    onBlur={(e) => {
                      const v = Number(e.target.value) || 0;
                      setLeads((p) => p.map((x) => (x.id === open.id ? { ...x, value: v } : x)));
                      start(() => setLeadValue(open.id, v));
                    }}
                    className={inputCls}
                  />
                </label>

                <div>
                  <p className="mb-2 text-sm font-semibold">Notas y seguimiento</p>
                  <div className="flex gap-2">
                    <input value={note} onChange={(e) => setNote(e.target.value)} onKeyDown={(e) => e.key === "Enter" && saveNote()} placeholder="Ej. Llamada agendada el jueves" className={inputCls} />
                    <button onClick={saveNote} className={btn("ink", "md", "h-auto")} aria-label="Guardar nota">
                      <Send className="size-4" />
                    </button>
                  </div>
                  <ol className="mt-4 space-y-3 border-l-2 border-line pl-4">
                    {open.notes.map((n, i) => (
                      <li key={i} className="text-sm">
                        <p>{n.text}</p>
                        <p className="text-xs text-muted">{n.author} · {dateTime(n.at)}</p>
                      </li>
                    ))}
                    <li className="text-xs text-muted">Lead creado · {dateTime(open.createdAt)}</li>
                  </ol>
                </div>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

