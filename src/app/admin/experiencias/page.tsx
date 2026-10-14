import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, Pencil, Plus, Star } from "lucide-react";
import { togglePublished } from "@/app/actions/admin";
import { Badge, Card, PageHead, td, th } from "@/components/admin/ui";
import { btn, TypeChip } from "@/components/ui";
import { dateTime, mxn } from "@/lib/format";
import { repo } from "@/lib/repo";

export const metadata = { title: "Experiencias" };

export default async function AdminExperiencias() {
  const activities = await repo.listActivities({ includeUnpublished: true });
  const now = new Date();
  return (
    <>
      <PageHead title="Experiencias" sub={`${activities.length} experiencias · crea, edita y publica clases, talleres y carreras.`}>
        <Link href="/admin/experiencias/nueva" className={btn("brand", "md")}>
          <Plus className="size-4" /> Nueva experiencia
        </Link>
      </PageHead>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="border-b border-line">
              <tr>
                <th className={th}>Experiencia</th>
                <th className={th}>Próxima fecha</th>
                <th className={th}>Fechas</th>
                <th className={th}>Ocupación</th>
                <th className={th}>Precio</th>
                <th className={th}>Estado</th>
                <th className={th} />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {activities.map((a) => {
                const future = a.sessions.filter((s) => new Date(s.startsAt) > now);
                const cap = future.reduce((s, x) => s + x.capacity, 0);
                const booked = future.reduce((s, x) => s + x.booked, 0);
                return (
                  <tr key={a.id} className="hover:bg-cream/40">
                    <td className={td}>
                      <Link href={`/admin/experiencias/${a.id}`} className="flex items-center gap-3">
                        <span className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-sand">
                          <Image src={a.image} alt="" fill sizes="48px" className="object-cover" unoptimized={a.image.startsWith("data:")} />
                        </span>
                        <span>
                          <span className="flex items-center gap-1.5 font-semibold">
                            {a.title} {a.featured && <Star className="size-3.5 fill-sun text-sun" />}
                          </span>
                          <TypeChip type={a.type} className="mt-1 inline-block !py-0.5" />
                        </span>
                      </Link>
                    </td>
                    <td className={`${td} text-muted`}>{future[0] ? dateTime(future[0].startsAt) : "—"}</td>
                    <td className={`${td} tabular`}>{future.length}</td>
                    <td className={td}>
                      <span className="tabular">{cap ? Math.round((booked / cap) * 100) : 0}%</span>
                      <span className="block text-xs text-muted tabular">{booked}/{cap}</span>
                    </td>
                    <td className={`${td} tabular`}>{mxn(Math.min(...a.tickets.map((t) => t.price)))}</td>
                    <td className={td}>
                      <form action={togglePublished}>
                        <input type="hidden" name="id" value={a.id} />
                        <button title="Cambiar visibilidad">
                          {a.published ? (
                            <Badge tone="good"><Eye className="size-3" /> Publicada</Badge>
                          ) : (
                            <Badge tone="muted"><EyeOff className="size-3" /> Borrador</Badge>
                          )}
                        </button>
                      </form>
                    </td>
                    <td className={`${td} text-right`}>
                      <Link href={`/admin/experiencias/${a.id}`} className="inline-grid size-9 place-items-center rounded-full hover:bg-ink/5" aria-label={`Editar ${a.title}`}>
                        <Pencil className="size-4" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
