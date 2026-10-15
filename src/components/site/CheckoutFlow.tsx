"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, FileText, Loader2, Lock, Mail, X } from "lucide-react";
import { placeOrder } from "@/app/actions/checkout";
import { useCart } from "@/components/cart/CartProvider";
import { WhatsAppIcon } from "@/components/site/SocialIcons";
import { btn, Field, inputCls, TypeChip } from "@/components/ui";
import { cn } from "@/lib/cn";
import { dateLong, dateShort, mxn, time } from "@/lib/format";
import type { Profile, SessionUser } from "@/lib/types";

type Doc = { key: string; title: string; short: string; body: string[] };

export function CheckoutFlow({
  user,
  profile,
  docs,
  consentsCurrent,
  paymentLabel,
}: {
  user: SessionUser;
  profile: Profile | null;
  docs: Doc[];
  consentsCurrent: boolean;
  paymentLabel: string;
}) {
  const cart = useCart();
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  const [open, setOpen] = useState<Doc | null>(null);
  const [form, setForm] = useState({
    fullName: profile?.fullName || user.name || "",
    phone: profile?.phone ?? "",
    birthdate: profile?.birthdate ?? "",
    emergencyName: profile?.emergencyName ?? "",
    emergencyPhone: profile?.emergencyPhone ?? "",
    channel: "whatsapp" as "email" | "whatsapp",
    privacy: consentsCurrent,
    image: consentsCurrent ? Boolean(profile?.consents?.image) : false,
    waiver: consentsCurrent,
    marketing: Boolean(profile?.marketing?.optIn),
  });
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  if (!cart.ready) return <div className="h-96" />;

  if (cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-md py-24 text-center">
        <p className="accent text-4xl">Tu carrito está vacío.</p>
        <Link href="/experiencias" className={btn("brand", "lg", "mt-8")}>Ver experiencias</Link>
      </div>
    );
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    start(async () => {
      const res = await placeOrder({
        ...form,
        privacy: form.privacy as true,
        waiver: form.waiver as true,
        items: cart.items.map((i) => ({ activityId: i.activityId, sessionId: i.sessionId, ticketId: i.ticketId, qty: i.qty, shirtSize: i.shirtSize })),
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      cart.clear();
      window.location.assign(res.url);
    });
  };

  return (
    <form onSubmit={submit} className="grid gap-10 lg:grid-cols-[1fr_400px] lg:gap-14">
      <div className="space-y-10">
        <section className="rounded-[var(--radius-card)] bg-white p-6 ring-1 ring-line sm:p-8">
          <StepTitle n={2} title="Tus datos" sub={`Sesión iniciada como ${user.email}`} />
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Field label="Nombre completo" className="sm:col-span-2">
              <input required value={form.fullName} onChange={(e) => set("fullName", e.target.value)} className={inputCls} autoComplete="name" />
            </Field>
            <Field label="Celular" hint="10 dígitos. Aquí te llegan avisos de la actividad.">
              <input required type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} className={inputCls} autoComplete="tel" placeholder="33 1234 5678" />
            </Field>
            <Field label="Fecha de nacimiento">
              <input type="date" value={form.birthdate} onChange={(e) => set("birthdate", e.target.value)} className={inputCls} autoComplete="bday" />
            </Field>
            <Field label="Contacto de emergencia">
              <input required value={form.emergencyName} onChange={(e) => set("emergencyName", e.target.value)} className={inputCls} placeholder="Nombre" />
            </Field>
            <Field label="Teléfono de emergencia">
              <input required type="tel" value={form.emergencyPhone} onChange={(e) => set("emergencyPhone", e.target.value)} className={inputCls} placeholder="33 1234 5678" />
            </Field>
          </div>

          <p className="mb-3 mt-8 text-sm font-semibold">¿Dónde quieres recibir tus boletos?</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { k: "whatsapp" as const, icon: WhatsAppIcon, t: "WhatsApp", d: form.phone || "A tu celular" },
              { k: "email" as const, icon: Mail, t: "Correo", d: user.email },
            ].map((o) => (
              <label
                key={o.k}
                className={cn("flex cursor-pointer items-center gap-3 rounded-2xl p-4 ring-1 transition", form.channel === o.k ? "bg-ink text-paper ring-ink" : "ring-line hover:ring-ink/40")}
              >
                <input type="radio" name="channel" className="sr-only" checked={form.channel === o.k} onChange={() => set("channel", o.k)} />
                <o.icon className="size-5" />
                <span className="min-w-0">
                  <span className="block font-semibold">{o.t}</span>
                  <span className={cn("block truncate text-xs", form.channel === o.k ? "text-paper/70" : "text-muted")}>{o.d}</span>
                </span>
              </label>
            ))}
          </div>
        </section>

        <section className="rounded-[var(--radius-card)] bg-white p-6 ring-1 ring-line sm:p-8">
          <StepTitle n={3} title="Consentimientos" sub="Como son actividades físicas, necesitamos tu autorización." />
          {consentsCurrent && profile?.consents?.privacy && (
            <p className="mt-4 flex items-center gap-2 rounded-xl bg-sage/30 px-3 py-2 text-sm">
              <Check className="size-4" /> Ya los aceptaste el {dateShort(profile.consents.privacy)}. Puedes revisarlos cuando quieras.
            </p>
          )}
          <div className="mt-6 space-y-3">
            {docs.map((d) => {
              const key = d.key === "aviso-de-privacidad" ? "privacy" : d.key === "uso-de-imagen" ? "image" : "waiver";
              const required = key !== "image";
              const checked = form[key as "privacy" | "image" | "waiver"];
              return (
                <div key={d.key} className={cn("flex items-start gap-3 rounded-2xl p-4 ring-1 transition", checked ? "bg-cream ring-ink/20" : "ring-line")}>
                  <input
                    id={`c-${d.key}`}
                    type="checkbox"
                    required={required}
                    checked={checked}
                    onChange={(e) => set(key as "privacy" | "image" | "waiver", e.target.checked)}
                    className="mt-0.5 size-5 shrink-0 accent-[var(--color-brand)]"
                  />
                  <label htmlFor={`c-${d.key}`} className="flex-1 cursor-pointer">
                    <span className="block font-semibold">
                      {d.key === "responsiva" ? "Acepto la carta responsiva" : d.key === "uso-de-imagen" ? "Autorizo el uso de mi imagen" : "Acepto el aviso de privacidad"}
                      {!required && <span className="ml-2 text-xs font-normal text-muted">(opcional)</span>}
                    </span>
                    <span className="block text-sm text-muted">{d.short}</span>
                  </label>
                  <button type="button" onClick={() => setOpen(d)} className="flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold hover:bg-ink/5">
                    <FileText className="size-3.5" /> Leer
                  </button>
                </div>
              );
            })}
            <label className={cn("flex cursor-pointer items-start gap-3 rounded-2xl p-4 ring-1 transition", form.marketing ? "bg-sage/25 ring-sage" : "ring-line")}>
              <input type="checkbox" checked={form.marketing} onChange={(e) => set("marketing", e.target.checked)} className="mt-0.5 size-5 shrink-0 accent-[var(--color-brand)]" />
              <span className="flex-1">
                <span className="flex items-center gap-2 font-semibold">
                  <WhatsAppIcon className="size-4" /> Quiero enterarme primero de nuevas experiencias
                  <span className="text-xs font-normal text-muted">(opcional)</span>
                </span>
                <span className="block text-sm text-muted">Te escribimos por WhatsApp con nuevas fechas y promociones. Te das de baja cuando quieras respondiendo BAJA.</span>
              </span>
            </label>
          </div>
        </section>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="overflow-hidden rounded-[var(--radius-card)] bg-white ring-1 ring-line">
          <div className="border-b border-line px-6 py-5">
            <p className="display text-3xl">Tu pedido</p>
          </div>
          <ul className="divide-y divide-line px-6">
            {cart.items.map((i) => (
              <li key={i.key} className="flex gap-3 py-4">
                <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-sand">
                  <Image src={i.image} alt="" fill sizes="56px" className="object-cover" unoptimized={i.image.startsWith("data:")} />
                </div>
                <div className="min-w-0 flex-1 text-sm">
                  <div className="flex justify-between gap-2">
                    <p className="truncate font-semibold">{i.title}</p>
                    <p className="font-semibold tabular">{mxn(i.unitPrice * i.qty)}</p>
                  </div>
                  <p className="text-muted">{dateLong(i.startsAt)} · {time(i.startsAt)}</p>
                  <div className="mt-1 flex items-center gap-2 text-muted">
                    <TypeChip type={i.type} className="!px-2 !py-0.5" />
                    <span className="truncate">{i.qty} × {i.ticketName}{i.shirtSize && ` · ${i.shirtSize}`}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="space-y-4 border-t border-line bg-cream/50 p-6">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-muted">Total (IVA incluido)</span>
              <span className="display text-5xl tabular">{mxn(cart.total)}</span>
            </div>
            {error && <p className="rounded-xl bg-brand-soft/60 px-3 py-2 text-sm font-medium text-brand-deep" role="alert">{error}</p>}
            <button disabled={pending} className={btn("brand", "lg", "w-full")}>
              {pending ? <Loader2 className="size-4 animate-spin" /> : <Lock className="size-4" />}
              {cart.total === 0 ? "Confirmar registro" : `Pagar ${mxn(cart.total)}`}
            </button>
            <p className="text-center text-xs text-muted">{cart.total === 0 ? "Registro sin costo" : paymentLabel}</p>
          </div>
        </div>
      </aside>

      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-[70] grid place-items-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button type="button" className="absolute inset-0 bg-ink/50" onClick={() => setOpen(null)} aria-label="Cerrar" />
            <motion.div
              role="dialog"
              aria-label={open.title}
              className="relative max-h-[85vh] w-full max-w-xl overflow-y-auto rounded-[var(--radius-card)] bg-paper p-7 shadow-2xl"
              initial={{ y: 24, scale: 0.98 }}
              animate={{ y: 0, scale: 1 }}
            >
              <button type="button" onClick={() => setOpen(null)} className="absolute right-4 top-4 grid size-9 place-items-center rounded-full hover:bg-ink/5" aria-label="Cerrar">
                <X className="size-5" />
              </button>
              <h3 className="display pr-10 text-4xl">{open.title}</h3>
              <div className="mt-5 space-y-3 text-sm leading-relaxed text-ink/80">
                {open.body.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
              <button
                type="button"
                className={btn("ink", "md", "mt-6")}
                onClick={() => {
                  const key = open.key === "aviso-de-privacidad" ? "privacy" : open.key === "uso-de-imagen" ? "image" : "waiver";
                  set(key as "privacy" | "image" | "waiver", true);
                  setOpen(null);
                }}
              >
                Leído y acepto
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}

function StepTitle({ n, title, sub }: { n: number; title: string; sub?: string }) {
  return (
    <div className="flex items-start gap-4">
      <span className="display grid size-10 shrink-0 place-items-center rounded-full bg-ink text-xl text-paper">{n}</span>
      <div>
        <h2 className="display text-4xl">{title}</h2>
        {sub && <p className="text-sm text-muted">{sub}</p>}
      </div>
    </div>
  );
}
