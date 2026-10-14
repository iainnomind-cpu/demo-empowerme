import { NextResponse, type NextRequest } from "next/server";
import { ensureProfile } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";

/** Regreso de Google / enlace mágico: canjea el código por la sesión y crea el perfil. */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const nextParam = url.searchParams.get("next") ?? "/cuenta";
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/cuenta";
  if (code) {
    const supabase = await supabaseServer();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user?.email) {
      await ensureProfile({
        id: data.user.id,
        email: data.user.email,
        name: (data.user.user_metadata?.full_name as string) ?? (data.user.user_metadata?.name as string) ?? "",
      });
      return NextResponse.redirect(new URL(next, url.origin));
    }
  }
  return NextResponse.redirect(new URL("/login?error=1", url.origin));
}
