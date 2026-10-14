import Link from "next/link";
import { Wave } from "@/components/brand/Wave";
import { btn } from "@/components/ui";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-cream px-6 text-center">
      <div className="max-w-lg space-y-6">
        <p className="display text-[7rem] text-brand">404</p>
        <Wave className="mx-auto h-8 w-48 text-brand" arches={5} />
        <p className="accent text-4xl">Esta ruta no está en el mapa.</p>
        <Link href="/" className={btn("ink", "lg")}>Volver al inicio</Link>
      </div>
    </main>
  );
}
