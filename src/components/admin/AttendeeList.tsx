"use client";

import { useMemo, useState, useTransition } from "react";
import { Check, Search } from "lucide-react";
import { toggleCheckIn } from "@/app/actions/admin";
import { WhatsAppIcon } from "@/components/site/SocialIcons";
import { inputCls } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { Booking } from "@/lib/types";

export function AttendeeList({ initial }: { initial: Booking[] }) {
  const [rows, setRows] = useState(initial);
  const [q, setQ] = useState("");
  const [, start] = useTransition();
  const filtered = useMemo(
    () => rows.filter((r) => `${r.attendeeName} ${r.email} ${r.code} ${r.phone}`.toLowerCase().includes(q.toLowerCase())),
    [rows, q],
  );
  const checked = rows.filter((r) => r.checkedInAt).length;

  const toggle = (b: Booking) => {
    const on = !b.checkedInAt;
    setRows((p) => p.map((r) => (r.id === b.id ? { ...r, checkedInAt: on ? new Date().toISOString() : undefined } : r)));
    start(async () => {
      await toggleCheckIn(b.code, on);
    });
  };

  return (
    <div>
      <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nombre, correo o boleto" className={cn(inputCls, "pl-9")} />
        </div>
        <p className="text-sm">
          <span className="font-semibold tabular">{checked}</span> <span className="text-muted">de {rows.length} con asistencia</span>
        </p>
      </div>
      {rows.length === 0 ? (
        <p className="p-10 text-center text-muted">Todavía no hay inscritos con boleto en esta fecha.</p>
      ) : (
        <ul className="divide-y divide-line">
          {filtered.map((b) => (
            <li key={b.id} className="flex items-center gap-4 px-4 py-3">
              <button
                onClick={() => toggle(b)}
                className={cn("grid size-9 shrink-0 place-items-center rounded-full ring-2 transition", b.checkedInAt ? "bg-sage ring-sage text-ink" : "ring-line hover:ring-ink/40")}
                aria-label={b.checkedInAt ? `Quitar asistencia de ${b.attendeeName}` : `Marcar asistencia de ${b.attendeeName}`}
              >
                {b.checkedInAt && <Check className="size-4" strokeWidth={3} />}
              </button>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{b.attendeeName}</p>
                <p className="truncate text-xs text-muted">
                  {b.email} · {b.ticketName}
                  {b.shirtSize && ` · Talla ${b.shirtSize}`}
                </p>
              </div>
              <span className="hidden font-mono text-xs sm:block">{b.code}</span>
              <span className={cn("hidden rounded-full px-2 py-0.5 text-xs font-semibold md:inline", b.status === "pagado" ? "bg-sage/40" : "bg-sun/60")}>{b.status}</span>
              {b.phone && (
                <a
                  href={`https://wa.me/52${b.phone.replace(/\D/g, "").slice(-10)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="grid size-9 place-items-center rounded-full text-muted hover:bg-ink/5 hover:text-ink"
                  aria-label={`WhatsApp a ${b.attendeeName}`}
                >
                  <WhatsAppIcon className="size-4" />
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
