import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CampaignBuilder } from "@/components/admin/CampaignBuilder";
import { PageHead } from "@/components/admin/ui";
import { repo } from "@/lib/repo";

export const metadata = { title: "Nueva campaña" };

export default async function NuevaCampana({ searchParams }: { searchParams: Promise<{ desde?: string }> }) {
  const { desde } = await searchParams;
  const [activities, from] = await Promise.all([repo.listActivities(), desde ? repo.getCampaign(desde) : null]);
  const now = new Date();
  const acts = activities.map((a) => ({
    id: a.id,
    title: a.title,
    type: a.type,
    image: a.image,
    sessions: a.sessions.filter((s) => new Date(s.startsAt) > now).map((s) => ({ id: s.id, startsAt: s.startsAt, booked: s.booked })),
  }));
  return (
    <>
      <Link href="/admin/marketing" className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-ink">
        <ArrowLeft className="size-4" /> Marketing
      </Link>
      <PageHead title="Nueva campaña" sub="Elige el tipo, la audiencia y el mensaje. Ves exactamente lo que recibirá cada persona." />
      <CampaignBuilder activities={acts} initial={from ?? undefined} />
    </>
  );
}
