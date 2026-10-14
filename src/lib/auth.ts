import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminEmails, hasSupabase } from "@/lib/env";
import { repo } from "@/lib/repo";
import { supabaseServer } from "@/lib/supabase/server";
import type { Profile, SessionUser } from "@/lib/types";

/** Cookie del modo demo (sin Supabase): sesión simulada, nada sensible. */
export const DEMO_COOKIE = "em_demo_session";

export async function getCurrentUser(): Promise<SessionUser | null> {
  if (!hasSupabase) {
    const raw = (await cookies()).get(DEMO_COOKIE)?.value;
    if (!raw) return null;
    try {
      return JSON.parse(Buffer.from(raw, "base64url").toString("utf8")) as SessionUser;
    } catch {
      return null;
    }
  }

  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  const u = data.user;
  if (!u?.email) return null;
  const profile = await ensureProfile({
    id: u.id,
    email: u.email,
    name: (u.user_metadata?.full_name as string) ?? (u.user_metadata?.name as string) ?? "",
  });
  return {
    id: u.id,
    email: u.email,
    name: profile.fullName || u.email,
    role: profile.role,
    avatar: (u.user_metadata?.avatar_url as string) ?? undefined,
  };
}

/** Crea el perfil la primera vez que alguien inicia sesión. */
export async function ensureProfile(u: { id: string; email: string; name: string }): Promise<Profile> {
  const existing = await repo.getProfile(u.id);
  const shouldBeAdmin = adminEmails().includes(u.email.toLowerCase());
  if (existing) {
    if (shouldBeAdmin && existing.role !== "admin") return repo.upsertProfile({ ...existing, role: "admin" });
    return existing;
  }
  return repo.upsertProfile({
    id: u.id,
    email: u.email,
    fullName: u.name,
    phone: "",
    role: shouldBeAdmin ? "admin" : "user",
    tags: [],
    createdAt: new Date().toISOString(),
  });
}

export async function requireUser(next = "/cuenta") {
  const u = await getCurrentUser();
  if (!u) redirect(`/login?next=${encodeURIComponent(next)}`);
  return u;
}

export async function requireAdmin() {
  const u = await getCurrentUser();
  if (!u) redirect("/login?next=/admin&admin=1");
  if (u.role !== "admin") redirect("/login?next=/admin&admin=1&denied=1");
  return u;
}
