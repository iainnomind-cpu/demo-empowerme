import { NextResponse, type NextRequest } from "next/server";
import { completeOrder } from "@/lib/orders";
import { getStripe } from "@/lib/stripe";

/** Webhook de Stripe: confirma el pedido aunque la persona cierre la pestaña antes de volver. */
export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) return NextResponse.json({ ok: false }, { status: 400 });
  const sig = req.headers.get("stripe-signature") ?? "";
  try {
    const event = stripe.webhooks.constructEvent(await req.text(), sig, secret);
    if (event.type === "checkout.session.completed") {
      const s = event.data.object;
      const code = s.metadata?.orderCode;
      if (code && s.payment_status === "paid") await completeOrder(code, s.id);
    }
    return NextResponse.json({ received: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
