import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Trash2 } from "lucide-react";
import { deleteActivity } from "@/app/actions/admin";
import { ActivityForm } from "@/components/admin/ActivityForm";
import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";
import { PageHead } from "@/components/admin/ui";
import { btn } from "@/components/ui";
import { mediaLibrary } from "@/content/site";
import { repo } from "@/lib/repo";

export const metadata = { title: "Editar experiencia" };

export default async function EditarExperiencia({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ creada?: string }> }) {
  const [{ id }, { creada }] = await Promise.all([params, searchParams]);
  const a = await repo.getActivityById(id);
  if (!a) notFound();
  return (
    <>
      <Link href="/admin/experiencias" className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-ink">
        <ArrowLeft className="size-4" /> Experiencias
      </Link>
      <PageHead title={a.title} sub={creada ? "¡Experiencia creada! Ya aparece en el sitio." : "Edita contenido, precios, fechas y cupo."}>
        <Link href={`/experiencias/${a.slug}`} target="_blank" className={btn("soft", "md")}>
          <ExternalLink className="size-4" /> Ver en el sitio
        </Link>
        <form action={deleteActivity}>
          <input type="hidden" name="id" value={a.id} />
          <ConfirmSubmit message={`¿Eliminar "${a.title}"? Se quitará del sitio con todas sus fechas.`} className={btn("ghost", "md", "text-brand")}>
            <Trash2 className="size-4" /> Eliminar
          </ConfirmSubmit>
        </form>
      </PageHead>
      <ActivityForm key={a.id} initial={a} library={mediaLibrary} />
    </>
  );
}
