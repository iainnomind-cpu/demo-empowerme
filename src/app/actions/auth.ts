"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DEMO_COOKIE, ensureProfile } from "@/lib/auth";
import { hasSupabase } from "@/lib/env";
import { slugify } from "@/lib/format";
import { supabaseServer } from "@/lib/supabase/server";
import type { SessionUser } from "@/lib/types";

function safeNext(next: FormDataEntryValue | null) {
  const n = typeof next === "string" ? next : "/cuenta";
  return n.startsWith("/") && !n.startsWith("//") ? n : "/cuenta";
}

/** Inicio de sesión simulado para el modo demo (sin Supabase). */
export async function demoSignIn(formData: FormData) {
  if (hasSupabase) redirect("/login");
  const asAdmin = formData.get("admin") === "1";
  const name = String(formData.get("name") || (asAdmin ? "Liz Lozano" : "Invitada Demo")).trim();
  const email = String(formData.get("email") || (asAdmin ? "admin@empowerme.mx" : "demo@empowerme.mx"))
    .trim()
    .toLowerCase();
  const id = `usr-${slugify(email)}`;
  const profile = await ensureProfile({ id, email, name });
  const user: SessionUser = { id, email, name: profile.fullName || name, role: asAdmin ? "admin" : profile.role };
  if (asAdmin && profile.role !== "admin") {
    const { repo } = await import("@/lib/repo");
    await repo.upsertProfile({ ...profile, role: "admin" });
  }
  (await cookies()).set(DEMO_COOKIE, Buffer.from(JSON.stringify(user)).toString("base64url"), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  redirect(safeNext(formData.get("next")));
}

export async function signOut() {
  if (hasSupabase) {
    const supabase = await supabaseServer();
    await supabase.auth.signOut();
  } else {
    (await cookies()).delete(DEMO_COOKIE);
  }
  redirect("/");
}
