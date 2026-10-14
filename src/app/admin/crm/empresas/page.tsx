import { Download } from "lucide-react";
import { LeadsBoard } from "@/components/admin/LeadsBoard";
import { PageHead } from "@/components/admin/ui";
import { btn } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { repo } from "@/lib/repo";

export const metadata = { title: "CRM · Empresas" };

export default async function CrmEmpresas() {
  const [user, leads] = await Promise.all([requireAdmin(), repo.listLeads()]);
  return (
    <>
      <PageHead title="Empresas" sub="Solicitudes de programas corporativos. Arrastra cada tarjeta según avance la conversación.">
        <a href="/admin/export/leads" className={btn("soft", "md")}>
          <Download className="size-4" /> Exportar CSV
        </a>
      </PageHead>
      <LeadsBoard initial={leads} me={user.name.split(" ")[0]} />
    </>
  );
}
