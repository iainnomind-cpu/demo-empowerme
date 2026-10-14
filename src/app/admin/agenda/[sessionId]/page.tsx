import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, Pencil, ScanLine } from "lucide-react";
import { AttendeeList } from "@/components/admin/AttendeeList";
import { Card, PageHead, StatTile } from "@/components/admin/ui";
import { btn } from "@/components/ui";
import { dateLong, time } from "@/lib/format";
import { repo } from "@/lib/repo";

export const metadata = { title: "Inscritos" };

export default async function SessionPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const s = await repo.getSession(sessionId);
  if (!s) notFound();
  const bookings = (await repo.listBookings({ sessionId })).sort((a, b) => a.attendeeName.localeCompare(b.attendeeName));
  const paid = bookings.filter((b) => b.status === "pagado").length;

  return (
    <>
      <Link href="/admin/agenda" className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-ink">
        <ArrowLeft className="size-4" /> Agenda
      </Link>
      <PageHead title={s.activity.title} sub={`${dateLong(s.startsAt)} · ${time(s.startsAt)} · ${s.activity.location.name}`}>
        <Link href="/admin/checkin" className={btn("ink", "md")}>
          <ScanLine className="size-4" /> Check-in QR
        </Link>
        <a href={`/admin/export/inscritos?session=${s.id}`} className={btn("soft", "md")}>
          <Download className="size-4" /> CSV
        </a>
        <Link href={`/admin/experiencias/${s.activity.id}`} className={btn("soft", "md")}>
          <Pencil className="size-4" /> Editar
        </Link>
      </PageHead>
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatTile label="Lugares reservados" value={`${s.booked}/${s.capacity}`} hint={`${Math.max(0, s.capacity - s.booked)} disponibles`} />
        <StatTile label="Boletos pagados en sistema" value={paid} hint="Las reservas previas a la demo no tienen boleto individual" />
        <StatTile label="Asistencia" value={bookings.filter((b) => b.checkedInAt).length} hint="Se actualiza con el check-in" />
      </div>
      <Card>
        <AttendeeList initial={bookings} />
      </Card>
    </>
  );
}
