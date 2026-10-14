import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { CalendarPlus, CheckCircle2, Mail, MapPin } from "lucide-react";
import { MeMark } from "@/components/brand/Logo";
import { WhatsAppIcon } from "@/components/site/SocialIcons";
import { btn } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { env } from "@/lib/env";
import { dateLong, dayNum, monthShort, mxn, time, weekdayShort } from "@/lib/format";
import { repo } from "@/lib/repo";

export const metadata: Metadata = { title: "Tus boletos" };
export const dynamic = "force-dynamic";

function gcal(title: string, start: string, end: string, place: string) {
  const f = (iso: string) => iso.replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const p = new URLSearchParams({ action: "TEMPLATE", text: `${title} · Empowerme`, dates: `${f(start)}/${f(end)}`, location: place });
  return `https://calendar.google.com/calendar/render?${p}`;
}

export default async function PedidoPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ nuevo?: string }>;
}) {
  const [{ code }, { nuevo }] = await Promise.all([params, searchParams]);
  const user = await requireUser(`/cuenta/pedido/${code}`);
  const order = await repo.getOrderByCode(code);
  if (!order || (order.userId !== user.id && user.role !== "admin")) notFound();
  const bookings = (await repo.listBookings({ orderCode: code })).sort((a, b) => a.startsAt.localeCompare(b.startsAt));

  const tickets = await Promise.all(
    bookings.map(async (b) => {
      const ses = await repo.getSession(b.sessionId);
      const qr = await QRCode.toString(`${env.siteUrl}/admin/checkin?code=${b.code}`, {
        type: "svg",
        margin: 0,
        errorCorrectionLevel: "M",
        color: { dark: "#1b1714", light: "#00000000" },
      });
      return { b, ses, qr };
    }),
  );

  const paid = order.status === "pagado";

  return (
    <section className="min-h-dvh bg-cream pt-28 lg:pt-32">
      <div className="mx-auto max-w-[1100px] px-4 pb-24 sm:px-6 lg:px-10">
        {nuevo && paid && (
          <div className="mb-10 flex flex-col gap-4 rounded-[var(--radius-card)] bg-brand p-6 text-white sm:flex-row sm:items-center sm:p-8">
            <CheckCircle2 className="size-12 shrink-0" />
            <div className="flex-1">
              <p className="display text-5xl">¡Nos vemos ahí!</p>
              <p className="mt-1 text-white/85">
                Tu pago quedó confirmado. Te enviamos tus boletos por {order.channel === "whatsapp" ? "WhatsApp" : "correo"}
                {order.channel === "whatsapp" ? ` al ${order.phone}` : ` a ${order.email}`}.
              </p>
            </div>
            {order.channel === "whatsapp" ? <WhatsAppIcon className="hidden size-10 sm:block" /> : <Mail className="hidden size-10 sm:block" />}
          </div>
        )}

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow text-muted">Pedido {order.code}</p>
            <h1 className="display mt-2 text-[clamp(3rem,8vw,6rem)]">
              Tus <span className="accent text-brand">boletos</span>
            </h1>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-sm text-muted">Total {paid ? "pagado" : "pendiente"}</p>
            <p className="display text-4xl tabular">{mxn(order.total)}</p>
          </div>
        </div>

        {!paid && (
          <div className="mt-6 flex flex-col gap-3 rounded-2xl bg-sun/40 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm">Este pedido está pendiente de pago. Tus lugares están apartados temporalmente.</p>
            <Link href={`/checkout/pago/${order.code}`} className={btn("ink", "sm")}>Completar pago</Link>
          </div>
        )}

        <ul className="mt-10 space-y-5">
          {tickets.map(({ b, ses, qr }) => (
            <li key={b.id} className="grid overflow-hidden rounded-[var(--radius-card)] bg-white ring-1 ring-line md:grid-cols-[1fr_auto]">
              <div className="relative flex gap-5 p-6 sm:p-8">
                <div className="grid w-20 shrink-0 place-items-center self-start rounded-2xl bg-ink py-3 text-paper">
                  <span className="eyebrow !text-[0.6rem] text-paper/60">{weekdayShort(b.startsAt)}</span>
                  <span className="display text-5xl leading-none">{dayNum(b.startsAt)}</span>
                  <span className="eyebrow !text-[0.6rem]">{monthShort(b.startsAt)}</span>
                </div>
                <div className="min-w-0">
                  <p className="display text-4xl leading-[0.9]">{b.activityTitle}</p>
                  <p className="mt-2 font-medium">{dateLong(b.startsAt)} · {time(b.startsAt)}</p>
                  {ses && (
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
                      <MapPin className="size-3.5" /> {ses.activity.location.name}
                    </p>
                  )}
                  <p className="mt-3 text-sm">
                    <span className="text-muted">Titular:</span> {b.attendeeName} · {b.ticketName}
                    {b.shirtSize && ` · Talla ${b.shirtSize}`}
                  </p>
                  {ses && (
                    <a
                      href={gcal(b.activityTitle, ses.startsAt, ses.endsAt, `${ses.activity.location.name}, ${ses.activity.location.address}`)}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-flex items-center gap-2 rounded-full bg-ink/[0.06] px-3.5 py-2 text-sm font-semibold hover:bg-ink/10"
                    >
                      <CalendarPlus className="size-4" /> Agregar a mi calendario
                    </a>
                  )}
                </div>
              </div>
              <div className="relative flex items-center gap-5 border-t-2 border-dashed border-line bg-paper p-6 md:flex-col md:justify-center md:border-l-2 md:border-t-0 md:px-10">
                <div className="size-32 shrink-0" dangerouslySetInnerHTML={{ __html: qr }} aria-label={`Código QR del boleto ${b.code}`} role="img" />
                <div className="md:text-center">
                  <p className="eyebrow text-muted">Boleto</p>
                  <p className="font-mono text-lg font-bold tracking-wider">{b.code}</p>
                  <p className={`mt-1 text-xs font-semibold ${b.checkedInAt ? "text-sage" : paid ? "text-brand" : "text-muted"}`}>
                    {b.checkedInAt ? "✓ Asistencia registrada" : paid ? "Válido · muéstralo en la entrada" : "Pendiente de pago"}
                  </p>
                </div>
                <MeMark className="absolute bottom-3 right-4 h-4 w-auto text-ink/15" />
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/cuenta" className={btn("ink", "lg")}>Ir a mi cuenta</Link>
          <Link href="/experiencias" className={btn("soft", "lg")}>Seguir explorando</Link>
        </div>
      </div>
    </section>
  );
}
