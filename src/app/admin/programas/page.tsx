import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { ProgramEditor } from "@/components/admin/ProgramEditor";
import { PageHead } from "@/components/admin/ui";
import { btn } from "@/components/ui";
import { mediaLibrary } from "@/content/site";
import { repo } from "@/lib/repo";
import type { Program } from "@/lib/types";

export const metadata = { title: "Programas" };

export default async function AdminProgramas({ searchParams }: { searchParams: Promise<{ nuevo?: string }> }) {
  const { nuevo } = await searchParams;
  const programs = await repo.listPrograms({ includeUnpublished: true });
  const blank: Program = {
    id: "",
    slug: "",
    title: "",
    durationDays: 30,
    tagline: "",
    description: "",
    pillars: [],
    includes: [],
    outcomes: [],
    image: mediaLibrary[0].url,
    format: "Presencial",
    color: "brand",
    published: false,
    sort: programs.length + 1,
  };
  return (
    <>
      <PageHead title="Programas" sub="Retos y experiencias para empresas que aparecen en /programas.">
        <Link href="/programas" target="_blank" className={btn("soft", "md")}>
          <ExternalLink className="size-4" /> Ver página
        </Link>
        <Link href="/admin/programas?nuevo=1" className={btn("brand", "md")}>Nuevo programa</Link>
      </PageHead>
      <div className="space-y-3">
        {nuevo && <ProgramEditor program={blank} library={mediaLibrary} defaultOpen />}
        {programs.map((p) => (
          <ProgramEditor key={p.id} program={p} library={mediaLibrary} />
        ))}
      </div>
    </>
  );
}
