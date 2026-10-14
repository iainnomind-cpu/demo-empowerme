"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

/** Barra fija en móvil que lleva al panel de reserva (que en pantallas chicas queda abajo). */
export function MobileBookBar({ price, label }: { price: string; label: string }) {
  const [show, setShow] = useState(true);
  useEffect(() => {
    const el = document.getElementById("reservar");
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setShow(!e.isIntersecting), { threshold: 0.05 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/95 px-4 py-3 backdrop-blur-xl transition-transform duration-300 lg:hidden",
        show ? "translate-y-0" : "translate-y-full",
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs text-muted">{label}</p>
          <p className="display text-3xl tabular">{price}</p>
        </div>
        <a href="#reservar" className="inline-flex h-12 items-center rounded-full bg-brand px-6 text-sm font-semibold text-white">
          Elegir fecha
        </a>
      </div>
    </div>
  );
}
