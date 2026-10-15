import type { Automations, CampaignKind } from "@/lib/types";

/** Variables disponibles en los mensajes. Se reemplazan por persona al enviar. */
export const VARIABLES = [
  { key: "nombre", label: "Nombre", sample: "Andrea" },
  { key: "experiencia", label: "Experiencia", sample: "Wellness Morning" },
  { key: "fecha", label: "Fecha", sample: "domingo 19 de octubre" },
  { key: "hora", label: "Hora", sample: "8:00 a.m." },
  { key: "sede", label: "Sede", sample: "Bosque Los Colomos" },
  { key: "link", label: "Link", sample: "empowerme.mx/experiencias/wellness-morning" },
] as const;

const BAJA = "\n\nResponde BAJA si ya no quieres recibir estos mensajes.";

export const presets: Record<CampaignKind, { label: string; hint: string; category: "Marketing" | "Utilidad"; body: string }> = {
  evento: {
    label: "Nuevo evento",
    hint: "Anuncia una experiencia a quienes aceptaron recibir novedades.",
    category: "Marketing",
    body: "¡Hola {{nombre}}! 🧡 Abrimos lugares para *{{experiencia}}*.\n\n📅 {{fecha}} · {{hora}}\n📍 {{sede}}\n\nLos lugares vuelan, aparta el tuyo aquí 👉 {{link}}" + BAJA,
  },
  recordatorio: {
    label: "Recordatorio",
    hint: "Avisa a los inscritos de una fecha. Es un mensaje de servicio: no requiere opt-in de marketing.",
    category: "Utilidad",
    body: "Hola {{nombre}}, ¡te esperamos en *{{experiencia}}*! 💪\n\n📅 {{fecha}} · {{hora}}\n📍 {{sede}}\n\nLleva agua, ropa cómoda y tu boleto QR: {{link}}",
  },
  felicitacion: {
    label: "Felicitación",
    hint: "Cumpleaños, logros o fechas especiales de la comunidad.",
    category: "Marketing",
    body: "¡Feliz cumpleaños, {{nombre}}! 🎉 Toda la comunidad Empowerme te manda un abrazo enorme. Que este año te encuentre en movimiento y con gente que suma." + BAJA,
  },
  libre: {
    label: "Mensaje libre",
    hint: "Escribe desde cero: avisos, encuestas, agradecimientos.",
    category: "Marketing",
    body: "Hola {{nombre}}, " + BAJA,
  },
};

export const defaultAutomations: Automations = {
  reminders: {
    enabled: true,
    body: "Hola {{nombre}}, ¡mañana nos vemos en *{{experiencia}}*! 💪\n\n📅 {{fecha}} · {{hora}}\n📍 {{sede}}\n\nTu boleto QR: {{link}}",
  },
  birthdays: {
    enabled: true,
    body: presets.felicitacion.body,
  },
};

export function fillTemplate(body: string, vars: Record<string, string | undefined>) {
  return body.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k: string) => vars[k] ?? "");
}

/** Valores de las variables en el orden en que aparecen (parámetros de plantilla de Meta). */
export function templateParams(body: string, vars: Record<string, string | undefined>) {
  return [...body.matchAll(/\{\{\s*(\w+)\s*\}\}/g)].map((m) => vars[m[1]] ?? "");
}
