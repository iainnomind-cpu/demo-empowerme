import { NextResponse, type NextRequest } from "next/server";
import { optOutByPhone } from "@/lib/marketing";

/** Verificación del webhook en Meta (WHATSAPP_VERIFY_TOKEN). */
export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  if (p.get("hub.mode") === "subscribe" && p.get("hub.verify_token") === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(p.get("hub.challenge") ?? "", { status: 200 });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

const STOP = /^\s*(baja|stop|alto|cancelar|no más|no mas)\s*$/i;

/** Mensajes entrantes: si alguien responde BAJA, se le da de baja del marketing. */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const messages: { from?: string; text?: { body?: string } }[] =
    body?.entry?.flatMap((e: { changes?: { value?: { messages?: unknown[] } }[] }) => e.changes?.flatMap((c) => c.value?.messages ?? []) ?? []) ?? [];
  for (const m of messages) {
    if (m.from && STOP.test(m.text?.body ?? "")) await optOutByPhone(m.from);
  }
  return NextResponse.json({ received: true });
}
