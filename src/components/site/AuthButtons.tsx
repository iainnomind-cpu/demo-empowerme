"use client";

import { useState } from "react";
import { Loader2, Mail } from "lucide-react";
import { GoogleIcon } from "@/components/site/SocialIcons";
import { btn, inputCls } from "@/components/ui";
import { supabaseBrowser } from "@/lib/supabase/client";

/** Inicio de sesión real con Supabase: Google OAuth o enlace mágico por correo. */
export function SupabaseAuth({ next }: { next: string }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [msg, setMsg] = useState("");
  const redirectTo = () => `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

  async function google() {
    setState("loading");
    const { error } = await supabaseBrowser().auth.signInWithOAuth({ provider: "google", options: { redirectTo: redirectTo() } });
    if (error) {
      setState("error");
      setMsg(error.message);
    }
  }

  async function magic(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    const { error } = await supabaseBrowser().auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo() } });
    if (error) {
      setState("error");
      setMsg(error.message);
    } else setState("sent");
  }

  if (state === "sent") {
    return (
      <div className="rounded-2xl bg-cream p-6 text-center">
        <Mail className="mx-auto size-8 text-brand" />
        <p className="mt-3 font-semibold">Revisa tu correo</p>
        <p className="mt-1 text-sm text-muted">Te enviamos un enlace para entrar a {email}.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <button type="button" onClick={google} disabled={state === "loading"} className={btn("light", "lg", "w-full ring-1 ring-line")}>
        {state === "loading" ? <Loader2 className="size-5 animate-spin" /> : <GoogleIcon className="size-5" />}
        Continuar con Google
      </button>
      <div className="flex items-center gap-3 text-xs text-muted">
        <span className="h-px flex-1 bg-line" /> o con tu correo <span className="h-px flex-1 bg-line" />
      </div>
      <form onSubmit={magic} className="space-y-3">
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@correo.com" className={inputCls} autoComplete="email" />
        <button disabled={state === "loading"} className={btn("ink", "lg", "w-full")}>
          Enviarme un enlace de acceso
        </button>
      </form>
      {state === "error" && <p className="text-sm text-brand">{msg}</p>}
    </div>
  );
}

/** Acceso del equipo: correo y contraseña de un usuario creado en Supabase › Authentication. */
export function AdminPasswordLogin({ next }: { next: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    const { error } = await supabaseBrowser().auth.signInWithPassword({ email, password });
    if (error) {
      setLoading(false);
      setMsg(error.message === "Invalid login credentials" ? "Correo o contraseña incorrectos." : error.message);
      return;
    }
    // Recarga completa para que el servidor lea la sesión nueva.
    window.location.assign(next);
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="correo@empowerme.mx" className={inputCls} autoComplete="username" />
      <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña" className={inputCls} autoComplete="current-password" />
      <button disabled={loading} className={btn("brand", "lg", "w-full")}>
        {loading && <Loader2 className="size-4 animate-spin" />} Entrar al panel
      </button>
      {msg && <p className="text-sm text-brand" role="alert">{msg}</p>}
    </form>
  );
}
