"use client";

import Link from "next/link";
import { Wave } from "@/components/brand/Wave";
import { btn } from "@/components/ui";

export default function SiteError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="grid min-h-[80svh] place-items-center bg-cream px-6 pt-24 text-center">
      <div className="max-w-lg space-y-6">
        <Wave className="mx-auto h-8 w-48 text-brand" arches={5} />
        <h1 className="display text-6xl">Tomamos aire</h1>
        <p className="text-lg text-muted">Algo no cargó como esperábamos. Intenta de nuevo en un momento.</p>
        <div className="flex justify-center gap-3">
          <button onClick={reset} className={btn("brand", "lg")}>Reintentar</button>
          <Link href="/" className={btn("soft", "lg")}>Ir al inicio</Link>
        </div>
      </div>
    </section>
  );
}
