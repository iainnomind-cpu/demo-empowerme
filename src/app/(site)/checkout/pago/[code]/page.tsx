import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { CreditCard, FlaskConical } from "lucide-react";
import { simulatePayment } from "@/app/actions/checkout";
import { btn } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { dateLong, mxn, time } from "@/lib/format";
import { repo } from "@/lib/repo";

export const metadata: Metadata = { title: "Pago" };
export const dynamic = "force-dynamic";

/** Pasarela simulada del modo demo. Con STRIPE_SECRET_KEY se usa Stripe Checkout real. */
export default async function PagoPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const user = await requireUser(`/checkout/pago/${code}`);
  const order = await repo.getOrderByCode(code);
  if (!order || order.userId !== user.id) notFound();
  if (order.status === "pagado") redirect(`/cuenta/pedido/${code}`);

  return (
    <section className="grid min-h-dvh place-items-center bg-cream px-4 pb-16 pt-28">
      <div className="w-full max-w-md overflow-hidden rounded-[var(--radius-card)] bg-white shadow-xl ring-1 ring-line">
        <div className="flex items-center gap-2 bg-sun/50 px-6 py-3 text-sm font-medium">
          <FlaskConical className="size-4" /> Pasarela de pago simulada (modo demo)
        </div>
        <div className="p-7">
          <p className="eyebrow text-muted">Pedido {order.code}</p>
          <p className="display mt-2 text-6xl tabular">{mxn(order.total)}</p>
          <ul className="mt-5 space-y-2 border-y border-line py-4 text-sm">
            {order.items.map((i) => (
              <li key={i.sessionId + i.ticketName} className="flex justify-between gap-3">
                <span>
                  <span className="font-semibold">{i.qty} × {i.title}</span>
                  <span className="block text-muted">{dateLong(i.startsAt)} · {time(i.startsAt)}</span>
                </span>
                <span className="tabular">{mxn(i.unitPrice * i.qty)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-sm text-muted">
            Al conectar Stripe (o Mercado Pago) este paso abre la pasarela real con tarjeta, OXXO o transferencia.
          </p>
          <form action={simulatePayment} className="mt-6">
            <input type="hidden" name="code" value={order.code} />
            <button className={btn("brand", "lg", "w-full")}>
              <CreditCard className="size-4" /> Simular pago aprobado
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
