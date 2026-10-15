import { NextResponse, type NextRequest } from "next/server";
import { runAutomations } from "@/lib/marketing";

/**
 * Cron diario (vercel.json): campañas programadas, recordatorios y cumpleaños.
 * Vercel envía "Authorization: Bearer CRON_SECRET".
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  return NextResponse.json(await runAutomations());
}
