import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LEGAL_VERSION, legalDocs, type LegalKey } from "@/content/legal";

export function generateStaticParams() {
  return Object.keys(legalDocs).map((doc) => ({ doc }));
}

export async function generateMetadata({ params }: { params: Promise<{ doc: string }> }): Promise<Metadata> {
  const d = legalDocs[(await params).doc as LegalKey];
  return d ? { title: d.title } : {};
}

export default async function LegalPage({ params }: { params: Promise<{ doc: string }> }) {
  const { doc } = await params;
  const d = legalDocs[doc as LegalKey];
  if (!d) notFound();
  return (
    <section className="min-h-dvh bg-paper pt-28 lg:pt-36">
      <div className="mx-auto max-w-3xl px-4 pb-24 sm:px-6">
        <nav className="flex flex-wrap gap-2 text-sm">
          {Object.entries(legalDocs).map(([k, v]) => (
            <Link key={k} href={`/legal/${k}`} className={`rounded-full px-3 py-1.5 ${k === doc ? "bg-ink text-paper" : "bg-ink/[0.06] hover:bg-ink/10"}`}>
              {v.title}
            </Link>
          ))}
        </nav>
        <h1 className="display mt-10 text-[clamp(3rem,8vw,5.5rem)]">{d.title}</h1>
        <p className="mt-3 text-sm text-muted">Versión {LEGAL_VERSION} · Documento de ejemplo: se reemplazará por el machote oficial de Empowerme.</p>
        <div className="mt-10 space-y-5 text-lg leading-relaxed text-ink/80">
          {d.body.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
