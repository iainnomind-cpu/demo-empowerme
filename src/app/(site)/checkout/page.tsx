import type { Metadata } from "next";
import Link from "next/link";
import { Check, LogIn } from "lucide-react";
import { CheckoutFlow } from "@/components/site/CheckoutFlow";
import { btn } from "@/components/ui";
import { LEGAL_VERSION, legalDocs } from "@/content/legal";
import { getCurrentUser } from "@/lib/auth";
import { hasStripe } from "@/lib/env";
import { repo } from "@/lib/repo";

export const metadata: Metadata = { title: "Completa tu registro" };
export const dynamic = "force-dynamic";

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ cancelado?: string }> }) {
  const { cancelado } = await searchParams;
  const user = await getCurrentUser();
  const profile = user ? await repo.getProfile(user.id) : null;
  const docs = Object.entries(legalDocs).map(([key, d]) => ({ key, ...d }));

  return (
    <section className="min-h-dvh bg-paper pt-28 lg:pt-32">
      <div className="mx-auto max-w-[1200px] px-4 pb-24 sm:px-6 lg:px-10">
        <h1 className="display text-[clamp(3.2rem,8vw,6.5rem)]">
          Completa tu <span className="accent text-brand">registro</span>
        </h1>
        <ol className="mt-6 flex flex-wrap gap-2 text-sm">
          {["Cuenta", "Datos", "Consentimientos", "Pago"].map((s, i) => (
            <li key={s} className={`flex items-center gap-2 rounded-full px-3 py-1.5 ${i === 0 && user ? "bg-ink text-paper" : "bg-ink/[0.06]"}`}>
              {i === 0 && user ? <Check className="size-3.5" /> : <span className="tabular">{i + 1}</span>} {s}
            </li>
          ))}
        </ol>
        {cancelado && (
          <p className="mt-6 rounded-xl bg-sun/40 px-4 py-3 text-sm">El pago se canceló. Tu carrito sigue aquí cuando quieras intentarlo de nuevo.</p>
        )}

        <div className="mt-10">
          {!user ? (
            <div className="max-w-xl rounded-[var(--radius-card)] bg-white p-8 ring-1 ring-line">
              <p className="display text-4xl">1 · Tu cuenta</p>
              <p className="mt-3 text-muted">
                Crea tu cuenta con Google en un clic. Así guardamos tus datos y consentimientos para que tu próximo registro tome segundos.
              </p>
              <Link href="/login?next=/checkout" className={btn("brand", "lg", "mt-6")}>
                <LogIn className="size-4" /> Entrar o crear cuenta
              </Link>
            </div>
          ) : (
            <CheckoutFlow
              user={user}
              profile={profile}
              docs={docs}
              consentsCurrent={profile?.consents?.version === LEGAL_VERSION && Boolean(profile.consents.waiver)}
              paymentLabel={hasStripe() ? "Pago seguro con tarjeta vía Stripe" : "Modo demo · el pago se simula en el siguiente paso"}
            />
          )}
        </div>
      </div>
    </section>
  );
}
