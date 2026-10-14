import { cn } from "@/lib/cn";

export function PageHead({ title, sub, children }: { title: string; sub?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <h1 className="display text-5xl sm:text-6xl">{title}</h1>
        {sub && <p className="mt-2 text-muted">{sub}</p>}
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("rounded-2xl bg-white ring-1 ring-line", className)}>{children}</div>;
}

export function StatTile({ label, value, hint, accent }: { label: string; value: React.ReactNode; hint?: React.ReactNode; accent?: boolean }) {
  return (
    <div className={cn("rounded-2xl p-5 ring-1", accent ? "bg-brand text-white ring-brand" : "bg-white ring-line")}>
      <p className={cn("text-sm font-medium", accent ? "text-white/80" : "text-muted")}>{label}</p>
      <p className="display mt-2 text-5xl tabular">{value}</p>
      {hint && <p className={cn("mt-1 text-xs", accent ? "text-white/75" : "text-muted")}>{hint}</p>}
    </div>
  );
}

export function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "good" | "warn" | "brand" | "muted" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
        tone === "neutral" && "bg-ink/[0.07]",
        tone === "good" && "bg-sage/40 text-ink",
        tone === "warn" && "bg-sun/60 text-ink",
        tone === "brand" && "bg-brand text-white",
        tone === "muted" && "bg-ink/[0.04] text-muted",
      )}
    >
      {children}
    </span>
  );
}

export const th = "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted";
export const td = "px-4 py-3";
