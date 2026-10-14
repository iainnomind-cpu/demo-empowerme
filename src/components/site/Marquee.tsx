import { MeMark } from "@/components/brand/Logo";
import { cn } from "@/lib/cn";

export function Marquee({
  words,
  className,
  reverse,
}: {
  words: string[];
  className?: string;
  reverse?: boolean;
}) {
  const row = (
    <div className="flex shrink-0 items-center gap-8 pr-8" aria-hidden>
      {words.map((w, i) => (
        <span key={i} className="flex items-center gap-8">
          <span className={cn(i % 2 ? "accent normal-case" : "")}>{w}</span>
          <MeMark className="h-[0.42em] w-auto opacity-80" />
        </span>
      ))}
    </div>
  );
  return (
    <div className={cn("flex overflow-hidden whitespace-nowrap", className)} role="marquee" aria-label={words.join(", ")}>
      <div className={cn("flex", reverse ? "animate-marquee-rev" : "animate-marquee")}>
        {row}
        {row}
        {row}
        {row}
      </div>
    </div>
  );
}
