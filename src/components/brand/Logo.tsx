import { cn } from "@/lib/cn";

/**
 * "ME" del logotipo: la M es una onda continua (dos arcos) y la E se construye
 * con barras del mismo grosor. Redibujado en vector a partir del logo original;
 * sustituir por el SVG oficial cuando esté disponible.
 */
export function MeMark({ className, title }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 160 100" className={className} role={title ? "img" : undefined} aria-hidden={title ? undefined : true} aria-label={title}>
      <path
        d="M9 100V30a19 19 0 0 1 38 0v70M47 30a19 19 0 0 1 38 0v70"
        fill="none"
        stroke="currentColor"
        strokeWidth="18"
      />
      <path d="M108 0h52v18h-34v23h29v18h-29v23h34v18h-52z" fill="currentColor" />
    </svg>
  );
}

export function Logo({
  className,
  community = true,
}: {
  className?: string;
  community?: boolean;
}) {
  return (
    <span className={cn("inline-flex flex-col items-center leading-none select-none", className)} aria-label="Empowerme Community">
      <span className="flex items-baseline font-extrabold tracking-[-0.015em]" style={{ fontStretch: "100%" }} aria-hidden>
        EMPOWER
        <MeMark className="ml-[0.05em] h-[0.715em] w-auto" />
      </span>
      {community && (
        <span className="mt-[0.16em] text-[0.42em] font-medium tracking-[0.01em]" style={{ fontStretch: "100%" }} aria-hidden>
          Community
        </span>
      )}
    </span>
  );
}
