"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Building2,
  CalendarDays,
  ExternalLink,
  LayoutDashboard,
  Layers,
  Megaphone,
  Menu,
  Rocket,
  ScanLine,
  Send,
  Users,
  X,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { cn } from "@/lib/cn";

const groups = [
  {
    label: "Operación",
    items: [
      { href: "/admin", label: "Resumen", icon: LayoutDashboard, exact: true },
      { href: "/admin/experiencias", label: "Experiencias", icon: Layers },
      { href: "/admin/agenda", label: "Agenda e inscritos", icon: CalendarDays },
      { href: "/admin/checkin", label: "Check-in QR", icon: ScanLine },
    ],
  },
  {
    label: "CRM",
    items: [
      { href: "/admin/crm", label: "Personas", icon: Users, exact: true },
      { href: "/admin/crm/empresas", label: "Empresas (leads)", icon: Building2 },
      { href: "/admin/marketing", label: "Marketing WhatsApp", icon: Megaphone },
      { href: "/admin/programas", label: "Programas", icon: Rocket },
      { href: "/admin/envios", label: "Envíos", icon: Send },
    ],
  },
];

export function AdminNav({ user, source, newLeads }: { user: { name: string; email: string }; source: string; newLeads: number }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="flex h-full flex-col" aria-label="Administración">
      <Link href="/admin" className="px-5 pb-6 pt-6 text-[1.35rem] text-paper">
        <Logo />
      </Link>
      <div className="flex-1 space-y-6 overflow-y-auto px-3">
        {groups.map((g) => (
          <div key={g.label}>
            <p className="eyebrow mb-2 px-3 !text-[0.62rem] text-paper/40">{g.label}</p>
            <ul className="space-y-0.5">
              {g.items.map((it) => {
                const active = it.exact ? pathname === it.href : pathname.startsWith(it.href);
                return (
                  <li key={it.href}>
                    <Link
                      href={it.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                        active ? "bg-paper text-ink" : "text-paper/75 hover:bg-white/[0.06] hover:text-paper",
                      )}
                    >
                      <it.icon className="size-[18px]" />
                      <span className="flex-1">{it.label}</span>
                      {it.href === "/admin/crm/empresas" && newLeads > 0 && (
                        <span className={cn("rounded-full px-1.5 text-[0.65rem] font-bold tabular", active ? "bg-brand text-white" : "bg-brand text-white")}>{newLeads}</span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
      <div className="space-y-3 border-t border-white/10 p-4">
        <Link href="/" className="flex items-center gap-2 rounded-xl px-2 py-2 text-sm text-paper/75 hover:bg-white/[0.06] hover:text-paper">
          <ExternalLink className="size-4" /> Ver sitio público
        </Link>
        <div className="flex items-center gap-3 px-2">
          <span className="grid size-9 place-items-center rounded-full bg-brand text-sm font-bold text-white">{user.name.slice(0, 1)}</span>
          <span className="min-w-0 flex-1 text-sm">
            <span className="block truncate font-semibold text-paper">{user.name}</span>
            <span className="block truncate text-xs text-paper/50">{user.email}</span>
          </span>
        </div>
        <p className="px-2 text-[0.68rem] text-paper/40">
          Datos: <span className={source === "supabase" ? "text-sage" : "text-sun"}>{source === "supabase" ? "Supabase" : "modo demo (memoria)"}</span>
        </p>
      </div>
    </nav>
  );

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 bg-ink lg:block">{nav}</aside>
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between bg-ink px-4 text-paper lg:hidden">
        <Link href="/admin" className="text-lg">
          <Logo community={false} />
        </Link>
        <button onClick={() => setOpen(true)} className="grid size-10 place-items-center" aria-label="Abrir menú">
          <Menu className="size-5" />
        </button>
      </header>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button className="absolute inset-0 bg-ink/60" onClick={() => setOpen(false)} aria-label="Cerrar menú" />
          <aside className="absolute inset-y-0 left-0 w-72 bg-ink">
            <button onClick={() => setOpen(false)} className="absolute right-3 top-5 grid size-9 place-items-center text-paper" aria-label="Cerrar">
              <X className="size-5" />
            </button>
            {nav}
          </aside>
        </div>
      )}
    </>
  );
}
