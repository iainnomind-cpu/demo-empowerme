import Link from "next/link";
import { ArrowUpRight, Megaphone, Plus } from "lucide-react";
import { AutomationsPanel } from "@/components/admin/AutomationsPanel";
import { Badge, Card, PageHead, StatTile, td, th } from "@/components/admin/ui";
import { btn } from "@/components/ui";
import { presets } from "@/content/marketing";
import { buildContacts } from "@/lib/crm";
import { dateTime } from "@/lib/format";
import { repo } from "@/lib/repo";
import type { CampaignStatus } from "@/lib/types";

export const metadata = { title: "Marketing WhatsApp" };

const tone: Record<CampaignStatus, "good" | "warn" | "muted" | "brand"> = { enviada: "good", programada: "warn", borrador: "muted", enviando: "brand" };

export default async function MarketingPage() {
  const [campaigns, contacts, automations, sent] = await Promise.all([
    repo.listCampaigns(),
    buildContacts(),
    repo.getAutomations(),
    repo.listNotifications({ limit: 5000 }),
  ]);
  const optIn = contacts.filter((c) => c.marketing?.optIn && !c.marketing.optOutAt).length;
  const optOut = contacts.filter((c) => c.marketing?.optOutAt).length;
  const month = new Date().toISOString().slice(0, 7);
  const waMonth = sent.filter((n) => n.channel === "whatsapp" && n.createdAt.startsWith(month)).length;

  return (
    <>
      <PageHead title="Marketing WhatsApp" sub="Campañas de nuevos eventos, recordatorios y felicitaciones para tu comunidad.">
        <Link href="/admin/marketing/nueva" className={btn("brand", "md")}>
          <Plus className="size-4" /> Nueva campaña
        </Link>
      </PageHead>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile accent label="Pueden recibir marketing" value={optIn} hint={`de ${contacts.length} personas registradas`} />
        <StatTile label="Bajas" value={optOut} hint="Respondieron BAJA" />
        <StatTile
          label="Campañas enviadas"
          value={campaigns.filter((c) => c.status === "enviada").length}
          hint={`${campaigns.filter((c) => c.status === "programada").length} programadas`}
        />
        <StatTile label="WhatsApps este mes" value={waMonth} hint="Confirmaciones, campañas y automatizaciones" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Card className="overflow-hidden">
          <div className="px-6 pb-2 pt-6">
            <h2 className="text-lg font-semibold">Campañas</h2>
          </div>
          {campaigns.length === 0 ? (
            <div className="flex flex-col items-center gap-3 p-10 text-center text-muted">
              <Megaphone className="size-8" />
              <p>Aún no hay campañas. Crea la primera para anunciar tu próximo evento.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-sm">
                <thead className="border-b border-line">
                  <tr>
                    <th className={th}>Campaña</th>
                    <th className={th}>Estado</th>
                    <th className={th}>Enviados</th>
                    <th className={th}>Fecha</th>
                    <th className={th} />
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {campaigns.map((c) => (
                    <tr key={c.id} className="hover:bg-cream/40">
                      <td className={td}>
                        <Link href={`/admin/marketing/${c.id}`} className="font-semibold hover:underline">
                          {c.name}
                        </Link>
                        <p className="text-xs text-muted">
                          {presets[c.kind].label} · por {c.createdBy}
                        </p>
                      </td>
                      <td className={td}>
                        <Badge tone={tone[c.status]}>{c.status}</Badge>
                      </td>
                      <td className={`${td} tabular`}>{c.status === "enviada" ? `${c.stats.sent}/${c.stats.total}` : "—"}</td>
                      <td className={`${td} text-muted`}>
                        {c.sentAt ? dateTime(c.sentAt) : c.scheduledAt ? `Programada: ${dateTime(c.scheduledAt)}` : dateTime(c.createdAt)}
                      </td>
                      <td className={`${td} text-right`}>
                        <Link href={`/admin/marketing/${c.id}`} className="inline-grid size-9 place-items-center rounded-full hover:bg-ink/5" aria-label={`Ver ${c.name}`}>
                          <ArrowUpRight className="size-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
        <AutomationsPanel initial={automations} />
      </div>
    </>
  );
}
