import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ActivityForm } from "@/components/admin/ActivityForm";
import { PageHead } from "@/components/admin/ui";
import { mediaLibrary } from "@/content/site";

export const metadata = { title: "Nueva experiencia" };

export default function NuevaExperiencia() {
  return (
    <>
      <Link href="/admin/experiencias" className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-ink">
        <ArrowLeft className="size-4" /> Experiencias
      </Link>
      <PageHead title="Nueva experiencia" sub="Se publica en el sitio en cuanto la guardes." />
      <ActivityForm library={mediaLibrary} />
    </>
  );
}
