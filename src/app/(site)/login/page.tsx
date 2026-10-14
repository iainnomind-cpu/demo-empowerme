import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { demoSignIn } from "@/app/actions/auth";
import { SupabaseAuth } from "@/components/site/AuthButtons";
import { GoogleIcon } from "@/components/site/SocialIcons";
import { btn, inputCls } from "@/components/ui";
import { media } from "@/content/site";
import { getCurrentUser } from "@/lib/auth";
import { hasSupabase } from "@/lib/env";

export const metadata: Metadata = { title: "Entrar" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; admin?: string; denied?: string }>;
}) {
  const sp = await searchParams;
  const next = sp.next?.startsWith("/") ? sp.next : "/cuenta";
  const user = await getCurrentUser();
  if (user && !sp.denied && (!sp.admin || user.role === "admin")) redirect(next);
  const admin = sp.admin === "1";

  return (
    <section className="grid min-h-dvh bg-paper lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-ink lg:block">
        <Image src={admin ? media.officeTeam : media.runPink} alt="" fill priority sizes="50vw" className="object-cover opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
        <p className="display absolute bottom-12 left-12 right-12 text-[5.5rem] text-white">
          {admin ? "Panel" : "Tu lugar"} <span className="accent text-pink">{admin ? "Empowerme" : "te espera"}</span>
        </p>
      </div>

      <div className="flex items-center justify-center px-5 pb-16 pt-28">
        <div className="w-full max-w-sm">
          <h1 className="display text-6xl">{admin ? "Acceso admin" : "Entra o regístrate"}</h1>
          <p className="mt-3 text-muted">
            {admin
              ? "Administra experiencias, agenda, inscritos y el CRM."
              : "Con tu cuenta guardas tus datos, tus consentimientos y todos tus boletos en un solo lugar."}
          </p>
          {sp.denied && (
            <p className="mt-4 rounded-xl bg-brand-soft/60 px-3 py-2 text-sm text-brand-deep">Tu cuenta no tiene permisos de administración.</p>
          )}

          <div className="mt-8">
            {hasSupabase ? (
              <SupabaseAuth next={next} />
            ) : (
              <div className="space-y-4">
                <div className="flex items-start gap-2 rounded-xl bg-sun/30 px-3 py-2.5 text-xs leading-relaxed">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0" />
                  Modo demo: el acceso con Google está simulado. Al conectar Supabase se activa el inicio de sesión real.
                </div>
                {admin ? (
                  <form action={demoSignIn}>
                    <input type="hidden" name="next" value={next} />
                    <input type="hidden" name="admin" value="1" />
                    <button className={btn("brand", "lg", "w-full")}>Entrar como administradora (demo)</button>
                  </form>
                ) : (
                  <>
                    <form action={demoSignIn}>
                      <input type="hidden" name="next" value={next} />
                      <button className={btn("light", "lg", "w-full ring-1 ring-line")}>
                        <GoogleIcon className="size-5" /> Continuar con Google
                      </button>
                    </form>
                    <div className="flex items-center gap-3 text-xs text-muted">
                      <span className="h-px flex-1 bg-line" /> o con tu correo <span className="h-px flex-1 bg-line" />
                    </div>
                    <form action={demoSignIn} className="space-y-3">
                      <input type="hidden" name="next" value={next} />
                      <input name="name" required placeholder="Tu nombre" className={inputCls} autoComplete="name" />
                      <input name="email" type="email" required placeholder="tu@correo.com" className={inputCls} autoComplete="email" />
                      <button className={btn("ink", "lg", "w-full")}>Continuar</button>
                    </form>
                  </>
                )}
              </div>
            )}
          </div>
          <p className="mt-8 text-xs leading-relaxed text-muted">
            Al continuar aceptas nuestro <a href="/legal/aviso-de-privacidad" className="underline">aviso de privacidad</a>.
          </p>
        </div>
      </div>
    </section>
  );
}
