"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Minus, Plus, Trash2, X } from "lucide-react";
import { useEffect } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { btn, TypeChip } from "@/components/ui";
import { dateLong, mxn, time } from "@/lib/format";

export function CartDrawer() {
  const { open, setOpen, items, total, remove, setQty } = useCart();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, setOpen]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60]">
          <motion.button
            aria-label="Cerrar carrito"
            className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
          <motion.aside
            role="dialog"
            aria-label="Tu carrito"
            className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-paper shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="display text-3xl">Tu carrito</h2>
              <button onClick={() => setOpen(false)} className="grid size-10 place-items-center rounded-full hover:bg-ink/5" aria-label="Cerrar">
                <X className="size-5" />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
                <p className="accent text-3xl">Aún no hay nada aquí.</p>
                <p className="text-sm text-muted">Elige una clase, taller o carrera y aparta tu lugar.</p>
                <Link href="/experiencias" onClick={() => setOpen(false)} className={btn("brand")}>
                  Ver experiencias
                </Link>
              </div>
            ) : (
              <>
                <ul className="flex-1 divide-y divide-line overflow-y-auto px-5">
                  {items.map((i) => (
                    <li key={i.key} className="flex gap-4 py-4">
                      <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-sand">
                        <Image src={i.image} alt="" fill sizes="80px" className="object-cover" unoptimized={i.image.startsWith("data:")} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <TypeChip type={i.type} />
                            <p className="mt-1.5 truncate font-semibold">{i.title}</p>
                          </div>
                          <button onClick={() => remove(i.key)} className="grid size-8 shrink-0 place-items-center rounded-full text-muted hover:bg-ink/5 hover:text-ink" aria-label={`Quitar ${i.title}`}>
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                        <p className="text-sm text-muted">
                          {dateLong(i.startsAt)} · {time(i.startsAt)}
                        </p>
                        <p className="text-sm text-muted">
                          {i.ticketName}
                          {i.shirtSize && ` · Talla ${i.shirtSize}`}
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center rounded-full ring-1 ring-line">
                            <button className="grid size-8 place-items-center" onClick={() => setQty(i.key, i.qty - 1)} aria-label="Menos">
                              <Minus className="size-3.5" />
                            </button>
                            <span className="w-6 text-center text-sm font-semibold tabular">{i.qty}</span>
                            <button className="grid size-8 place-items-center" onClick={() => setQty(i.key, i.qty + 1)} aria-label="Más">
                              <Plus className="size-3.5" />
                            </button>
                          </div>
                          <span className="font-semibold tabular">{mxn(i.unitPrice * i.qty)}</span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="space-y-3 border-t border-line bg-cream/60 px-5 py-5">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm text-muted">Total</span>
                    <span className="display text-4xl tabular">{mxn(total)}</span>
                  </div>
                  <Link href="/checkout" onClick={() => setOpen(false)} className={btn("brand", "lg", "w-full")}>
                    Continuar con mi registro
                  </Link>
                  <p className="text-center text-xs text-muted">Pago seguro · Recibes tus boletos por correo o WhatsApp</p>
                </div>
              </>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
