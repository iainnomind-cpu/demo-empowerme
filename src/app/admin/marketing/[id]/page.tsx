import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarX, Copy, Send } from "lucide-react";
import { cancelSchedule, sendCampaignNow } from "@/app/actions/marketing";
import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";
import { Badge, Card, PageHead, StatTile, td, th } from "@/components/admin/ui";
import { WhatsAppPreview } from "@/components/admin/WhatsAppPreview";
import { btn } from "@/components/ui";
import { fillTemplate, presets, VARIABLES } from "@/content/marketing";
import { dateTime } from "@/lib/format";
import { resolveAudience } from "@/lib/marketing";
import { repo } from "@/lib/repo";

export const metadata = { title: "Campaña" };

const segmentLabel: Record<string, string> = {
  comunidad: "Toda la comunidad",
  experiencia: "Asistentes de una experiencia",
  tipo: "Por tipo de experiencia",
  sesion: "Inscritos de una fecha",
  recurrentes: "Comunidad fiel (2+ reservas)",
  cumpleanos: "Cumplen años hoy",
};

export default async function CampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = await repo.getCampaign(id);
  if (!c) notFound();
  const sentDone = c.status === "enviada";
  const [log, audience] = await Promise.all([
    repo.listNotifications({ refPrefix: `cmp:${c.id}`, limit: 2000 }),
    sentDone ? null : resolveAudience(c.audience, c.kind, c.activityId),
  ]);
  const sample = audience?.recipients[0]?.vars ?? Object.fromEntries(VARIABLES.map((v) => [v.key, v.sample]));
  const excluded = audience ? audience.excluded.noOptIn + audience.excluded.noPhone + audience.excluded.optedOut : 0;

  return (
    <>
      <Link href="/admin/marketing" className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-ink">
        <ArrowLeft className="size-4" /> Marketing
      </Link>
      <PageHead title={c.name} sub={`${presets[c.kind].label} · ${segmentLabel[c.audience.segment]} · creada por ${c.createdBy}`}>
        <Link href={`/admin/marketing/nueva?desde=${c.id}`} className={btn("soft", "md")}>
          <Copy className="size-4" /> Duplicar
        </Link>
        {c.status === "programada" && (
          <form action={cancelSchedule}>
            <input type="hidden" name="id" value={c.id} />
            <button className={btn("soft", "md")}>
              <CalendarX className="size-4" /> Cancelar programación
            </button>
          </form>
        )}
        {(c.status === "borrador" || c.status === "programada") && (
          <form action={sendCampaignNow}>
            <input type="hidden" name="id" value={c.id} />
            <ConfirmSubmit message={`¿Enviar ahora a ${audience?.recipients.length ?? 0} personas?`} className={btn("brand", "md")}>
              <Send className="size-4" /> Enviar ahora
            </ConfirmSubmit>
          </form>
        )}
      </PageHead>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          accent
          label="Estado"
          value={<span className="text-4xl">{c.status}</span>}
          hint={c.sentAt ? dateTime(c.sentAt) : c.scheduledAt ? `Programada: ${dateTime(c.scheduledAt)}` : "Sin enviar"}
        />
        <StatTile label={sentDone ? "Enviados" : "Audiencia actual"} value={sentDone ? c.stats.sent : (audience?.recipients.length ?? 0)} />
        <StatTile label="Con error" value={c.stats.failed} />
        <StatTile label="Excluidos" value={sentDone ? c.stats.skipped : excluded} hint="Sin permiso, sin teléfono o con baja" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card className="overflow-hidden">
          <div className="px-6 pb-2 pt-6">
            <h2 className="text-lg font-semibold">{sentDone ? "Registro de envíos" : "Recibirán el mensaje"}</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-line">
                <tr>
                  <th className={th}>{sentDone ? "Número" : "Persona"}</th>
                  <th className={th}>{sentDone ? "Hora" : "Teléfono"}</th>
                  <th className={th}>Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {sentDone
                  ? log.map((n) => (
                      <tr key={n.id}>
                        <td className={`${td} font-mono`}>+{n.to}</td>
                        <td className={`${td} text-muted`}>{dateTime(n.createdAt)}</td>
                        <td className={td}>
                          <Badge tone={n.status === "enviado" ? "good" : n.status === "error" ? "brand" : "warn"}>{n.status}</Badge>
                        </td>
                      </tr>
                    ))
                  : audience?.recipients.map((r) => (
                      <tr key={r.key}>
                        <td className={`${td} font-medium`}>{r.name}</td>
                        <td className={`${td} font-mono text-muted`}>{r.phone}</td>
                        <td className={td}>
                          <Badge tone="muted">pendiente</Badge>
                        </td>
                      </tr>
                    ))}
                {((sentDone && log.length === 0) || (!sentDone && !audience?.recipients.length)) && (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-muted">
                      {sentDone ? "Esta campaña se envió antes de que existiera el registro detallado." : "Nadie cumple con este segmento por ahora."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
        <div className="space-y-3">
          <WhatsAppPreview text={fillTemplate(c.body, sample)} imageUrl={c.imageUrl} />
          {c.templateName && (
            <p className="text-center text-xs text-muted">
              Plantilla de Meta: <span className="font-mono">{c.templateName}</span>
            </p>
          )}
        </div>
      </div>
    </>
  );
}
