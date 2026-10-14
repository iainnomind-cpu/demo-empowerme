import type { Metadata } from "next";
import { AdminNav } from "@/components/admin/AdminNav";
import { requireAdmin } from "@/lib/auth";
import { repo } from "@/lib/repo";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · Admin Empowerme" }, robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  const leads = await repo.listLeads();
  return (
    <div className="min-h-dvh bg-[#f7f4ee]">
      <AdminNav user={{ name: user.name, email: user.email }} source={repo.kind} newLeads={leads.filter((l) => l.status === "nuevo").length} />
      <div className="lg:pl-64">
        <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 lg:px-10 lg:py-10">{children}</div>
      </div>
    </div>
  );
}
