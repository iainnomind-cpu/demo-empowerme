"use client";

import { useActionState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { submitLead, type LeadState } from "@/app/actions/leads";
import { btn, Field, inputCls } from "@/components/ui";
import type { Program } from "@/lib/types";

export function LeadForm({ programs, defaultProgram }: { programs: Pick<Program, "id" | "title">[]; defaultProgram?: string }) {
  const [state, action, pending] = useActionState<LeadState, FormData>(submitLead, null);

  if (state?.ok) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center rounded-[var(--radius-card)] bg-white p-10 text-center text-ink">
        <CheckCircle2 className="size-14 text-brand" />
        <p className="display mt-6 text-5xl">¡Gracias{state.name ? `, ${state.name}` : ""}!</p>
        <p className="mt-3 max-w-sm text-muted">Recibimos tu solicitud. Te contactamos en menos de 48 horas hábiles con una propuesta a la medida de tu equipo.</p>
      </div>
    );
  }

  return (
    <form action={action} className="grid gap-4 rounded-[var(--radius-card)] bg-white p-6 text-ink sm:grid-cols-2 sm:p-8">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <Field label="Empresa">
        <input name="company" required className={inputCls} placeholder="Nombre de la empresa" />
      </Field>
      <Field label="Tamaño del equipo">
        <select name="employees" required defaultValue="" className={inputCls}>
          <option value="" disabled>Selecciona</option>
          {["1–50", "51–200", "201–500", "500+"].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
      </Field>
      <Field label="Tu nombre">
        <input name="contactName" required className={inputCls} autoComplete="name" />
      </Field>
      <Field label="Puesto">
        <input name="role" className={inputCls} placeholder="RH, People, Dirección…" />
      </Field>
      <Field label="Correo de trabajo">
        <input name="email" type="email" required className={inputCls} autoComplete="email" />
      </Field>
      <Field label="Teléfono (opcional)">
        <input name="phone" type="tel" className={inputCls} autoComplete="tel" />
      </Field>
      <Field label="Programa de interés" className="sm:col-span-2">
        <select name="programId" defaultValue={defaultProgram ?? ""} className={inputCls}>
          <option value="">Aún no lo sé, quiero asesoría</option>
          {programs.map((p) => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>
      </Field>
      <Field label="Cuéntanos qué buscan" className="sm:col-span-2">
        <textarea name="message" rows={3} className={inputCls} placeholder="Objetivos, sedes, fechas tentativas…" />
      </Field>
      {state?.error && <p className="rounded-xl bg-brand-soft/60 px-3 py-2 text-sm font-medium text-brand-deep sm:col-span-2" role="alert">{state.error}</p>}
      <div className="flex flex-col items-start gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted">Al enviar aceptas nuestro <a href="/legal/aviso-de-privacidad" className="underline">aviso de privacidad</a>.</p>
        <button disabled={pending} className={btn("brand", "lg")}>
          {pending && <Loader2 className="size-4 animate-spin" />} Solicitar propuesta
        </button>
      </div>
    </form>
  );
}
