import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, LayoutDashboard, LogOut, ShieldCheck } from "lucide-react";
import { signOut } from "@/app/actions/auth";
import { btn } from "@/components/ui";
import { LEGAL_VERSION } from "@/content/legal";
import { requireUser } from "@/lib/auth";
import { dateLong, dateShort, dayNum, monthShort, mxn, time } from "@/lib/format";
import { repo } from "@/lib/repo";

export const metadata: Metadata = { title: "Mi cuenta" };
export const dynamic = "force-dynamic";

export default async function CuentaPage() {
  const user = await requireUser("/cuenta");
  const [profile, bookings, orders] = await Promise.all([
    repo.getProfile(user.id),
    repo.listBookings({ userId: user.id }),
    repo.listOrders({ userId: user.id }),
  ]);
  const now = new Date();
  const upcoming = bookings.filter((b) => new Date(b.startsAt) > now && b.status !== "cancelado").sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const past = bookings.filter((b) => new Date(b.startsAt) <= now);
  const consentsOk = profile?.consents?.version === LEGAL_VERSION;

  return (
    <section className="min-h-dvh bg-paper pt-28 lg:pt-32">
      <div className="mx-auto max-w-[1200px] px-4 pb-24 sm:px-6 lg:px-10">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow text-muted">Mi cuenta</p>
            <h1 className="display mt-2 text-[clamp(3rem,8vw,6.5rem)]">
              Hola, <span className="accent text-brand">{user.name.split(" ")[0]}</span>
            </h1>
          </div>
          <div className="flex gap-2">
            {user.role === "admin" && (
              <Link href="/admin" className={btn("ink", "md")}>
                <LayoutDashboard className="size-4" /> Panel admin
              </Link>
            )}
            <form action={signOut}>
              <button className={btn("soft", "md")}>
                <LogOut className="size-4" /> Salir
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_340px]">
          <div className="space-y-12">
            <div>
              <h2 className="display text-4xl">Próximas experiencias</h2>
              {upcoming.length === 0 ? (
                <div className="mt-5 rounded-[var(--radius-card)] bg-cream p-8">
                  <p className="accent text-3xl">Aún no tienes fechas apartadas.</p>
                  <Link href="/experiencias" className={btn("brand", "md", "mt-5")}>Ver calendario</Link>
                </div>
              ) : (
                <ul className="mt-5 grid gap-3">
                  {upcoming.map((b) => (
                    <li key={b.id}>
                      <Link href={`/cuenta/pedido/${b.orderCode}`} className="group flex items-center gap-4 rounded-2xl bg-white p-4 ring-1 ring-line transition hover:ring-ink/30">
                        <span className="grid w-14 shrink-0 place-items-center rounded-xl bg-brand py-2 text-white">
                          <span className="display text-3xl leading-none">{dayNum(b.startsAt)}</span>
                          <span className="eyebrow !text-[0.55rem]">{monthShort(b.startsAt)}</span>
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-semibold">{b.activityTitle}</span>
                          <span className="block text-sm text-muted">{dateLong(b.startsAt)} · {time(b.startsAt)}</span>
                        </span>
                        <span className="hidden font-mono text-sm sm:block">{b.code}</span>
                        <ArrowUpRight className="size-5 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <h2 className="display text-4xl">Historial de pedidos</h2>
              <div className="mt-5 overflow-hidden rounded-[var(--radius-card)] ring-1 ring-line">
                <table className="w-full text-sm">
                  <thead className="bg-cream text-left">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Pedido</th>
                      <th className="hidden px-4 py-3 font-semibold sm:table-cell">Fecha</th>
                      <th className="px-4 py-3 font-semibold">Estado</th>
                      <th className="px-4 py-3 text-right font-semibold">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line bg-white">
                    {orders.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-4 py-6 text-center text-muted">Sin pedidos todavía.</td>
                      </tr>
                    )}
                    {orders.map((o) => (
                      <tr key={o.id}>
                        <td className="px-4 py-3">
                          <Link href={`/cuenta/pedido/${o.code}`} className="font-mono font-semibold underline-offset-4 hover:underline">{o.code}</Link>
                          <span className="block truncate text-xs text-muted">{o.items.map((i) => i.title).join(", ")}</span>
                        </td>
                        <td className="hidden px-4 py-3 text-muted sm:table-cell">{dateShort(o.createdAt)}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${o.status === "pagado" ? "bg-sage/40" : "bg-sun/50"}`}>{o.status}</span>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold tabular">{mxn(o.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {past.length > 0 && <p className="mt-3 text-sm text-muted">Has asistido a {past.length} experiencias con nosotros.</p>}
            </div>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-[var(--radius-card)] bg-white p-6 ring-1 ring-line">
              <p className="eyebrow text-muted">Mis datos</p>
              <dl className="mt-4 space-y-3 text-sm">
                {[
                  ["Nombre", profile?.fullName || user.name],
                  ["Correo", user.email],
                  ["Celular", profile?.phone || "—"],
                  ["Emergencia", profile?.emergencyName ? `${profile.emergencyName} · ${profile.emergencyPhone}` : "—"],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-muted">{k}</dt>
                    <dd className="font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className={`rounded-[var(--radius-card)] p-6 ${consentsOk ? "bg-sage/30" : "bg-sun/40"}`}>
              <p className="flex items-center gap-2 font-semibold">
                <ShieldCheck className="size-5" /> Consentimientos
              </p>
              {consentsOk && profile?.consents ? (
                <ul className="mt-3 space-y-1 text-sm">
                  <li>Aviso de privacidad · {profile.consents.privacy ? dateShort(profile.consents.privacy) : "—"}</li>
                  <li>Carta responsiva · {profile.consents.waiver ? dateShort(profile.consents.waiver) : "—"}</li>
                  <li>Uso de imagen · {profile.consents.image ? dateShort(profile.consents.image) : "No autorizado"}</li>
                </ul>
              ) : (
                <p className="mt-2 text-sm">Los aceptarás en tu próximo registro.</p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
