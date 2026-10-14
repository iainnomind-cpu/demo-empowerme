import Link from "next/link";
import { Download, Search } from "lucide-react";
import { Badge, Card, PageHead, StatTile, td, th } from "@/components/admin/ui";
import { WhatsAppIcon } from "@/components/site/SocialIcons";
import { btn, inputCls } from "@/components/ui";
import { cn } from "@/lib/cn";
import { buildContacts } from "@/lib/crm";
import { dateShort, mxn } from "@/lib/format";
import { repo } from "@/lib/repo";

export const metadata = { title: "CRM · Personas" };

const segments = [
  { k: "", label: "Todas" },
  { k: "recurrentes", label: "Recurrentes (2+)" },
  { k: "corredoras", label: "Corren con nosotros" },
  { k: "sin-imagen", label: "Sin permiso de imagen" },
];

export default async function CrmPersonas({ searchParams }: { searchParams: Promise<{ q?: string; tag?: string; seg?: string }> }) {
  const sp = await searchParams;
  const [all, activities] = await Promise.all([buildContacts(), repo.listActivities({ includeUnpublished: true })]);
  const runTitles = new Set(activities.filter((a) => a.type === "carrera").map((a) => a.title));
  const allTags = [...new Set(all.flatMap((c) => c.tags))].sort();

  const q = (sp.q ?? "").toLowerCase();
  const list = all.filter((c) => {
    if (q && !`${c.fullName} ${c.email} ${c.phone}`.toLowerCase().includes(q)) return false;
    if (sp.tag && !c.tags.includes(sp.tag)) return false;
    if (sp.seg === "recurrentes" && c.bookings < 2) return false;
    if (sp.seg === "corredoras" && !c.tags.some((t) => runTitles.has(t))) return false;
    if (sp.seg === "sin-imagen" && c.consents?.image) return false;
    return true;
  });

  const href = (patch: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    Object.entries({ q: sp.q, tag: sp.tag, seg: sp.seg, ...patch }).forEach(([k, v]) => v && p.set(k, v));
    return `/admin/crm${p.size ? `?${p}` : ""}`;
  };

  const ltv = all.length ? Math.round(all.reduce((s, c) => s + c.spent, 0) / all.length) : 0;

  return (
    <>
      <PageHead title="Personas" sub="Tu comunidad: cada persona registrada, lo que ha vivido con Empowerme y sus consentimientos.">
        <a href="/admin/export/personas" className={btn("soft", "md")}>
          <Download className="size-4" /> Exportar CSV
        </a>
      </PageHead>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatTile label="Personas en la comunidad" value={all.length} />
        <StatTile label="Regresan (2+ reservas)" value={all.filter((c) => c.bookings >= 2).length} hint="Base para campañas de lealtad" />
        <StatTile label="Valor promedio por persona" value={mxn(ltv)} />
      </div>

      <Card>
        <div className="space-y-3 border-b border-line p-4">
          <form className="relative max-w-md" action="/admin/crm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <input name="q" defaultValue={sp.q} placeholder="Buscar por nombre, correo o teléfono" className={cn(inputCls, "pl-9")} />
            {sp.tag && <input type="hidden" name="tag" value={sp.tag} />}
            {sp.seg && <input type="hidden" name="seg" value={sp.seg} />}
          </form>
          <div className="flex flex-wrap gap-2">
            {segments.map((s) => (
              <Link key={s.k} href={href({ seg: s.k || undefined })} className={cn("rounded-full px-3 py-1.5 text-xs font-semibold", (sp.seg ?? "") === s.k ? "bg-ink text-paper" : "bg-ink/[0.06] hover:bg-ink/10")}>
                {s.label}
              </Link>
            ))}
            <span className="mx-1 w-px bg-line" />
            {allTags.map((t) => (
              <Link key={t} href={href({ tag: sp.tag === t ? undefined : t })} className={cn("rounded-full px-3 py-1.5 text-xs font-medium ring-1", sp.tag === t ? "bg-brand text-white ring-brand" : "ring-line hover:ring-ink/30")}>
                {t}
              </Link>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead className="border-b border-line">
              <tr>
                <th className={th}>Persona</th>
                <th className={th}>Experiencias</th>
                <th className={th}>Reservas</th>
                <th className={th}>Total</th>
                <th className={th}>Consentimientos</th>
                <th className={th}>Última</th>
                <th className={th} />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {list.map((c) => (
                <tr key={c.id} className="align-top hover:bg-cream/40">
                  <td className={td}>
                    <p className="font-semibold">{c.fullName || "Sin nombre"}</p>
                    <p className="text-xs text-muted">{c.email}</p>
                    <p className="text-xs text-muted">{c.phone || "—"}</p>
                  </td>
                  <td className={td}>
                    <div className="flex max-w-xs flex-wrap gap-1">
                      {c.tags.slice(0, 4).map((t) => (
                        <Badge key={t}>{t}</Badge>
                      ))}
                      {c.tags.length > 4 && <Badge tone="muted">+{c.tags.length - 4}</Badge>}
                    </div>
                  </td>
                  <td className={`${td} tabular`}>{c.bookings}</td>
                  <td className={`${td} font-semibold tabular`}>{mxn(c.spent)}</td>
                  <td className={td}>
                    <div className="flex flex-wrap gap-1">
                      <Badge tone={c.consents?.privacy ? "good" : "muted"}>Privacidad</Badge>
                      <Badge tone={c.consents?.waiver ? "good" : "muted"}>Responsiva</Badge>
                      <Badge tone={c.consents?.image ? "good" : "warn"}>Imagen</Badge>
                    </div>
                  </td>
                  <td className={`${td} text-muted`}>{c.lastAt ? dateShort(c.lastAt) : "—"}</td>
                  <td className={`${td} text-right`}>
                    {c.phone && (
                      <a href={`https://wa.me/52${c.phone.replace(/\D/g, "").slice(-10)}`} target="_blank" rel="noreferrer" className="inline-grid size-9 place-items-center rounded-full hover:bg-ink/5" aria-label={`WhatsApp a ${c.fullName}`}>
                        <WhatsAppIcon className="size-4" />
                      </a>
                    )}
                  </td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-muted">Nadie coincide con ese filtro.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
