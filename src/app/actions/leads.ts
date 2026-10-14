"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { repo } from "@/lib/repo";

const leadSchema = z.object({
  company: z.string().trim().min(2, "Escribe el nombre de la empresa."),
  contactName: z.string().trim().min(3, "Escribe tu nombre."),
  role: z.string().trim().optional(),
  email: z.string().trim().email("Escribe un correo válido."),
  phone: z.string().trim().optional(),
  employees: z.string().min(1, "Selecciona el tamaño del equipo."),
  programId: z.string().optional(),
  message: z.string().trim().max(1000).optional(),
});

export type LeadState = { ok: boolean; error?: string; name?: string } | null;

export async function submitLead(_prev: LeadState, formData: FormData): Promise<LeadState> {
  // Honeypot anti-spam: los bots llenan este campo oculto.
  if (formData.get("website")) return { ok: true };

  const parsed = leadSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const d = parsed.data;
  const program = d.programId ? (await repo.listPrograms()).find((p) => p.id === d.programId) : undefined;
  await repo.createLead({
    company: d.company,
    contactName: d.contactName,
    role: d.role || undefined,
    email: d.email,
    phone: d.phone || undefined,
    employees: d.employees,
    programId: program?.id,
    programTitle: program?.title ?? "Por definir",
    message: d.message || undefined,
    source: "Sitio web",
  });
  revalidatePath("/admin/crm/empresas");
  return { ok: true, name: d.contactName.split(" ")[0] };
}
