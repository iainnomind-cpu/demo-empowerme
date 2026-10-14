import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/cn";

type Variant = "brand" | "ink" | "ghost" | "light" | "outline-light" | "soft";
type Size = "sm" | "md" | "lg";

export function btn(variant: Variant = "brand", size: Size = "md", extra?: string) {
  return cn(
    "group/btn inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-[background,color,transform,box-shadow] duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap",
    size === "sm" && "h-9 px-4 text-[0.8rem]",
    size === "md" && "h-11 px-5 text-sm",
    size === "lg" && "h-14 px-7 text-[0.95rem]",
    variant === "brand" && "bg-brand text-white hover:bg-brand-deep shadow-[0_8px_24px_-12px_rgb(209_67_45/0.8)]",
    variant === "ink" && "bg-ink text-paper hover:bg-ink-2",
    variant === "ghost" && "text-ink hover:bg-ink/5",
    variant === "light" && "bg-paper text-ink hover:bg-white",
    variant === "outline-light" && "ring-1 ring-inset ring-white/50 text-white hover:bg-white/10",
    variant === "soft" && "bg-ink/[0.06] text-ink hover:bg-ink/10",
    extra,
  );
}

export function ArrowLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link href={href} className={cn("group inline-flex items-center gap-1.5 font-semibold underline-offset-4 hover:underline", className)}>
      {children}
      <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    </Link>
  );
}

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("eyebrow flex items-center gap-2", className)}>
      <span className="inline-block size-1.5 rounded-full bg-current" aria-hidden />
      {children}
    </p>
  );
}

const typeStyles: Record<string, string> = {
  clase: "bg-sun text-ink",
  taller: "bg-pink text-ink",
  carrera: "bg-brand text-white",
};

export function TypeChip({ type, className }: { type: string; className?: string }) {
  const label = { clase: "Clase", taller: "Taller", carrera: "Carrera" }[type] ?? type;
  return <span className={cn("eyebrow rounded-full px-2.5 py-1 !text-[0.65rem]", typeStyles[type], className)}>{label}</span>;
}

export function SpotsBar({ capacity, booked, className, dark }: { capacity: number; booked: number; className?: string; dark?: boolean }) {
  const left = Math.max(0, capacity - booked);
  const pct = capacity ? Math.min(100, (booked / capacity) * 100) : 100;
  const low = left > 0 && left <= Math.max(5, capacity * 0.15);
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className={cn("flex justify-between text-xs", dark ? "text-white/70" : "text-muted")}>
        <span className={cn(low && "font-semibold text-brand", left === 0 && "font-semibold")}>
          {left === 0 ? "Cupo lleno" : low ? `¡Quedan ${left} lugares!` : `${left} lugares disponibles`}
        </span>
        <span className="tabular">{Math.round(pct)}%</span>
      </div>
      <div className={cn("h-1 overflow-hidden rounded-full", dark ? "bg-white/15" : "bg-ink/10")}>
        <div className={cn("h-full rounded-full", left === 0 ? "bg-muted" : low ? "bg-brand" : dark ? "bg-white" : "bg-ink")} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function Field({
  label,
  hint,
  error,
  children,
  className,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block space-y-1.5", className)}>
      <span className="text-sm font-semibold">{label}</span>
      {children}
      {hint && !error && <span className="block text-xs text-muted">{hint}</span>}
      {error && <span className="block text-xs font-medium text-brand">{error}</span>}
    </label>
  );
}

export const inputCls =
  "w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-[0.95rem] outline-none transition placeholder:text-muted/60 focus:border-ink focus:ring-4 focus:ring-ink/5";
