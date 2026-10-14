"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronLeft, ChevronRight, Minus, Plus, ShieldCheck } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { btn, SpotsBar } from "@/components/ui";
import { cn } from "@/lib/cn";
import { dateLong, dayKey, dayNum, monthKey, monthLabel, monthShort, mxn, spotsLeft, time, weekdayShort } from "@/lib/format";
import type { ActivityWithSessions, CartItem, Session } from "@/lib/types";

const SIZES = ["XS", "S", "M", "L", "XL"];

export function BookingPanel({ activity, initialSessionId }: { activity: ActivityWithSessions; initialSessionId?: string }) {
  const router = useRouter();
  const cart = useCart();
  const upcoming = useMemo(() => activity.sessions.filter((s) => new Date(s.startsAt) > new Date()), [activity.sessions]);
  const recurring = activity.mode === "recurrente";

  const firstOpen = upcoming.find((s) => spotsLeft(s) > 0);
  const initial = upcoming.find((s) => s.id === initialSessionId && spotsLeft(s) > 0) ?? firstOpen;
  const [selected, setSelected] = useState<string[]>(initial ? [initial.id] : []);
  const [ticketId, setTicketId] = useState(activity.tickets[0]?.id);
  const [qty, setQty] = useState(1);
  const [size, setSize] = useState<string>("");
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);

  const ticket = activity.tickets.find((t) => t.id === ticketId) ?? activity.tickets[0];
  const chosen = upcoming.filter((s) => selected.includes(s.id));
  const total = ticket.price * qty * chosen.length;

  const toggle = (s: Session) => {
    if (spotsLeft(s) === 0) return;
    setError("");
    setAdded(false);
    if (recurring) setSelected((p) => (p.includes(s.id) ? p.filter((x) => x !== s.id) : [...p, s.id]));
    else setSelected([s.id]);
  };

  function buildItems(): CartItem[] | null {
    if (!chosen.length) {
      setError(recurring ? "Elige al menos una fecha en el calendario." : "Elige una fecha.");
      return null;
    }
    if (activity.requiresShirtSize && !size) {
      setError("Elige la talla de tu playera.");
      return null;
    }
    const tooMany = chosen.find((s) => spotsLeft(s) < qty);
    if (tooMany) {
      setError(`Solo quedan ${spotsLeft(tooMany)} lugares el ${dateLong(tooMany.startsAt)}.`);
      return null;
    }
    return chosen.map((s) => ({
      key: `${s.id}:${ticket.id}:${size}`,
      activityId: activity.id,
      slug: activity.slug,
      title: activity.title,
      image: activity.image,
      type: activity.type,
      sessionId: s.id,
      startsAt: s.startsAt,
      ticketId: ticket.id,
      ticketName: ticket.name,
      unitPrice: ticket.price,
      qty,
      shirtSize: size || undefined,
    }));
  }

  const addToCart = (go: boolean) => {
    const items = buildItems();
    if (!items) return;
    cart.add(items);
    if (go) router.push("/checkout");
    else {
      setAdded(true);
      cart.setOpen(true);
    }
  };

  if (!upcoming.length) {
    return (
      <div className="rounded-[var(--radius-card)] bg-white p-6 ring-1 ring-line">
        <p className="accent text-3xl">Pronto anunciaremos nuevas fechas.</p>
        <p className="mt-2 text-sm text-muted">Síguenos en Instagram para enterarte primero.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[var(--radius-card)] bg-white shadow-[0_30px_60px_-30px_rgb(27_23_20/0.35)] ring-1 ring-line">
      <div className="flex items-baseline justify-between border-b border-line px-6 py-5">
        <div>
          <p className="eyebrow text-muted">{recurring ? "Por clase" : activity.tickets.length > 1 ? "Desde" : "Registro"}</p>
          <p className="display text-5xl">{mxn(Math.min(...activity.tickets.map((t) => t.price)))}</p>
        </div>
        <p className="text-right text-sm text-muted">
          {activity.durationMin >= 60 ? `${Math.floor(activity.durationMin / 60)} h ${activity.durationMin % 60 ? `${activity.durationMin % 60} min` : ""}` : `${activity.durationMin} min`}
          <br />
          {activity.level}
        </p>
      </div>

      <div className="space-y-6 p-6">
        {/* Fechas */}
        <div>
          <p className="mb-3 text-sm font-semibold">{recurring ? "Elige tus fechas" : upcoming.length > 1 ? "Elige tu fecha" : "Fecha"}</p>
          {recurring ? (
            <MiniCalendar sessions={upcoming} selected={selected} onToggle={toggle} />
          ) : (
            <div className="grid gap-2">
              {upcoming.map((s) => {
                const on = selected.includes(s.id);
                const full = spotsLeft(s) === 0;
                return (
                  <button
                    key={s.id}
                    type="button"
                    disabled={full}
                    onClick={() => toggle(s)}
                    className={cn(
                      "flex items-center gap-4 rounded-2xl p-3 text-left ring-1 transition",
                      on ? "bg-ink text-paper ring-ink" : "ring-line hover:ring-ink/40",
                      full && "opacity-50",
                    )}
                  >
                    <span className={cn("grid w-12 shrink-0 place-items-center rounded-xl py-1.5", on ? "bg-paper text-ink" : "bg-cream")}>
                      <span className="eyebrow !text-[0.55rem]">{weekdayShort(s.startsAt)}</span>
                      <span className="display text-2xl leading-none">{dayNum(s.startsAt)}</span>
                      <span className="eyebrow !text-[0.55rem]">{monthShort(s.startsAt)}</span>
                    </span>
                    <span className="flex-1">
                      <span className="block font-semibold">{dateLong(s.startsAt)}</span>
                      <span className={cn("block text-sm", on ? "text-paper/70" : "text-muted")}>
                        {time(s.startsAt)} · {full ? "Cupo lleno" : `${spotsLeft(s)} lugares`}
                      </span>
                    </span>
                    {on && <Check className="size-5" />}
                  </button>
                );
              })}
            </div>
          )}
          {chosen.length === 1 && (
            <SpotsBar className="mt-3" capacity={chosen[0].capacity} booked={chosen[0].booked} />
          )}
        </div>

        {/* Tipo de boleto */}
        {activity.tickets.length > 1 && (
          <fieldset>
            <legend className="mb-3 text-sm font-semibold">Tipo de registro</legend>
            <div className="grid gap-2">
              {activity.tickets.map((t) => (
                <label
                  key={t.id}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-2xl p-3.5 ring-1 transition",
                    ticketId === t.id ? "bg-brand-soft/50 ring-brand" : "ring-line hover:ring-ink/40",
                  )}
                >
                  <input type="radio" name="ticket" className="sr-only" checked={ticketId === t.id} onChange={() => setTicketId(t.id)} />
                  <span className={cn("grid size-5 place-items-center rounded-full ring-2", ticketId === t.id ? "bg-brand ring-brand" : "ring-ink/25")}>
                    {ticketId === t.id && <span className="size-2 rounded-full bg-white" />}
                  </span>
                  <span className="flex-1">
                    <span className="block font-semibold">{t.name}</span>
                    {t.description && <span className="block text-xs text-muted">{t.description}</span>}
                  </span>
                  <span className="font-bold tabular">{mxn(t.price)}</span>
                </label>
              ))}
            </div>
          </fieldset>
        )}

        {/* Talla */}
        {activity.requiresShirtSize && (
          <div>
            <p className="mb-3 text-sm font-semibold">Talla de playera</p>
            <div className="flex gap-2">
              {SIZES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setSize(s);
                    setError("");
                  }}
                  className={cn("h-11 flex-1 rounded-xl text-sm font-semibold ring-1 transition", size === s ? "bg-ink text-paper ring-ink" : "ring-line hover:ring-ink/40")}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Cantidad */}
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">
            {recurring ? "Lugares por fecha" : "Lugares"}
          </p>
          <div className="flex items-center rounded-full ring-1 ring-line">
            <button type="button" className="grid size-10 place-items-center disabled:opacity-30" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} aria-label="Menos lugares">
              <Minus className="size-4" />
            </button>
            <span className="w-8 text-center font-semibold tabular" aria-live="polite">{qty}</span>
            <button type="button" className="grid size-10 place-items-center disabled:opacity-30" onClick={() => setQty((q) => Math.min(10, q + 1))} disabled={qty >= 10} aria-label="Más lugares">
              <Plus className="size-4" />
            </button>
          </div>
        </div>

        <div className="space-y-3 border-t border-line pt-5">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted">
              {chosen.length > 1 ? `${chosen.length} fechas × ${qty} ${qty > 1 ? "lugares" : "lugar"}` : "Total"}
            </span>
            <span className="display text-4xl tabular">{mxn(total)}</span>
          </div>
          {error && <p className="rounded-xl bg-brand-soft/60 px-3 py-2 text-sm font-medium text-brand-deep" role="alert">{error}</p>}
          <button type="button" onClick={() => addToCart(true)} className={btn("brand", "lg", "w-full")}>
            {ticket.price === 0 ? "Registrarme" : "Reservar ahora"}
          </button>
          <button type="button" onClick={() => addToCart(false)} className={btn("soft", "md", "w-full")}>
            {added ? <><Check className="size-4" /> Agregado al carrito</> : "Agregar al carrito"}
          </button>
          <p className="flex items-center justify-center gap-1.5 text-xs text-muted">
            <ShieldCheck className="size-3.5" /> Pago seguro · Boleto por correo o WhatsApp
          </p>
        </div>
      </div>
    </div>
  );
}

function MiniCalendar({ sessions, selected, onToggle }: { sessions: Session[]; selected: string[]; onToggle: (s: Session) => void }) {
  const months = [...new Set(sessions.map((s) => monthKey(s.startsAt)))];
  const [mi, setMi] = useState(0);
  const current = months[mi];
  const [y, m] = current.split("-").map(Number);
  const daysIn = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const lead = (new Date(Date.UTC(y, m - 1, 1)).getUTCDay() + 6) % 7;
  const byDay = new Map(sessions.filter((s) => monthKey(s.startsAt) === current).map((s) => [dayKey(s.startsAt), s]));

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="font-semibold">{monthLabel(current)}</p>
        <div className="flex gap-1">
          <button type="button" disabled={mi === 0} onClick={() => setMi((v) => v - 1)} className="grid size-8 place-items-center rounded-full hover:bg-ink/5 disabled:opacity-30" aria-label="Mes anterior">
            <ChevronLeft className="size-4" />
          </button>
          <button type="button" disabled={mi === months.length - 1} onClick={() => setMi((v) => v + 1)} className="grid size-8 place-items-center rounded-full hover:bg-ink/5 disabled:opacity-30" aria-label="Mes siguiente">
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
          <span key={i} className="eyebrow py-1 !text-[0.6rem] text-muted">{d}</span>
        ))}
        {Array.from({ length: lead }).map((_, i) => (
          <span key={`l${i}`} />
        ))}
        {Array.from({ length: daysIn }, (_, i) => i + 1).map((d) => {
          const s = byDay.get(`${current}-${String(d).padStart(2, "0")}`);
          if (!s) return <span key={d} className="grid aspect-square place-items-center text-sm text-muted/40 tabular">{d}</span>;
          const on = selected.includes(s.id);
          const full = spotsLeft(s) === 0;
          return (
            <button
              key={d}
              type="button"
              disabled={full}
              onClick={() => onToggle(s)}
              title={full ? "Cupo lleno" : `${time(s.startsAt)} · ${spotsLeft(s)} lugares`}
              className={cn(
                "relative grid aspect-square place-items-center rounded-xl text-sm font-semibold tabular transition",
                on ? "bg-brand text-white" : full ? "text-muted line-through" : "bg-cream hover:bg-ink hover:text-paper",
              )}
            >
              {d}
              {!full && spotsLeft(s) <= 5 && !on && <span className="absolute right-1 top-1 size-1.5 rounded-full bg-brand" />}
            </button>
          );
        })}
      </div>
      {selected.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {sessions
            .filter((s) => selected.includes(s.id))
            .map((s) => (
              <li key={s.id} className="rounded-full bg-ink/[0.06] px-2.5 py-1 text-xs font-medium">
                {weekdayShort(s.startsAt)} {dayNum(s.startsAt)} {monthShort(s.startsAt)} · {time(s.startsAt)}
              </li>
            ))}
        </ul>
      )}
      <p className="mt-2 flex items-center gap-1.5 text-xs text-muted">
        <span className="size-1.5 rounded-full bg-brand" /> Últimos lugares
      </p>
    </div>
  );
}
