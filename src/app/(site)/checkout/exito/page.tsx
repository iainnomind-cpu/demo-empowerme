import { redirect } from "next/navigation";
import { completeOrder } from "@/lib/orders";
import { getStripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

/** Regreso de Stripe Checkout: verifica el pago y confirma el pedido. */
export default async function ExitoPage({ searchParams }: { searchParams: Promise<{ order?: string; session_id?: string }> }) {
  const { order, session_id } = await searchParams;
  const stripe = getStripe();
  if (!order) redirect("/cuenta");
  if (stripe && session_id) {
    const s = await stripe.checkout.sessions.retrieve(session_id);
    if (s.payment_status === "paid" && s.metadata?.orderCode === order) await completeOrder(order, s.id);
  }
  redirect(`/cuenta/pedido/${order}?nuevo=1`);
}
