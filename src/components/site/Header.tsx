"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Menu, ShoppingBag, UserRound, X } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { useCart } from "@/components/cart/CartProvider";
import { btn } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { SessionUser } from "@/lib/types";

const nav = [
  { href: "/experiencias", label: "Experiencias" },
  { href: "/programas", label: "Empresas" },
  { href: "/#nosotros", label: "Nosotros" },
  { href: "/#comunidad", label: "Comunidad" },
];

export function Header({ user }: { user: SessionUser | null }) {
  const pathname = usePathname();
  const overlayRoute = pathname === "/" || pathname === "/programas";
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const cart = useCart();

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => setMenu(false), [pathname]);

  const overlay = overlayRoute && !scrolled && !menu;

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[background,color,box-shadow] duration-300",
          overlay ? "text-white" : "bg-paper/90 text-ink shadow-[0_1px_0_var(--color-line)] backdrop-blur-xl",
        )}
      >
        <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-6 px-4 sm:px-6 lg:h-[72px] lg:px-10">
          <Link href="/" className="text-[1.35rem] lg:text-[1.5rem]" aria-label="Empowerme, inicio">
            <Logo />
          </Link>

          <nav className="ml-6 hidden items-center gap-1 lg:flex" aria-label="Principal">
            {nav.map((n) => {
              const active = n.href.startsWith("/#") ? false : pathname.startsWith(n.href);
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={cn(
                    "rounded-full px-3.5 py-2 text-sm font-medium transition",
                    overlay ? "hover:bg-white/10" : "hover:bg-ink/5",
                    active && (overlay ? "bg-white/15" : "bg-ink/[0.07]"),
                  )}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-1.5">
            <Link
              href={user ? (user.role === "admin" ? "/admin" : "/cuenta") : "/login"}
              className={cn("hidden h-10 items-center gap-2 rounded-full px-3 text-sm font-medium transition sm:flex", overlay ? "hover:bg-white/10" : "hover:bg-ink/5")}
            >
              <UserRound className="size-[18px]" />
              <span className="max-w-[10ch] truncate">{user ? user.name.split(" ")[0] : "Entrar"}</span>
            </Link>
            <button
              type="button"
              onClick={() => cart.setOpen(true)}
              className={cn("relative grid size-10 place-items-center rounded-full transition", overlay ? "hover:bg-white/10" : "hover:bg-ink/5")}
              aria-label={`Carrito, ${cart.count} boletos`}
            >
              <ShoppingBag className="size-[19px]" />
              {cart.count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid min-w-5 place-items-center rounded-full bg-brand px-1 text-[0.65rem] font-bold text-white tabular">
                  {cart.count}
                </span>
              )}
            </button>
            <Link href="/experiencias" className={btn(overlay ? "light" : "brand", "sm", "ml-1.5 hidden sm:inline-flex")}>
              Reservar lugar
            </Link>
            <button
              type="button"
              className={cn("grid size-10 place-items-center rounded-full lg:hidden", overlay ? "hover:bg-white/10" : "hover:bg-ink/5")}
              onClick={() => setMenu((v) => !v)}
              aria-expanded={menu}
              aria-label={menu ? "Cerrar menú" : "Abrir menú"}
            >
              {menu ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex flex-col bg-paper px-5 pb-8 pt-24 lg:hidden"
          >
            <nav className="flex flex-col" aria-label="Móvil">
              {[{ href: "/", label: "Inicio" }, ...nav].map((n, i) => (
                <motion.div key={n.href} initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.04 * i }}>
                  <Link href={n.href} onClick={() => setMenu(false)} className="display block border-b border-line py-3 text-[2.6rem]">
                    {n.label}
                  </Link>
                </motion.div>
              ))}
            </nav>
            <div className="mt-auto grid gap-3">
              <Link href={user ? "/cuenta" : "/login"} className={btn("soft", "lg")}>
                <UserRound className="size-4" /> {user ? "Mi cuenta" : "Entrar o registrarme"}
              </Link>
              <Link href="/experiencias" className={btn("brand", "lg")}>
                Reservar lugar
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
