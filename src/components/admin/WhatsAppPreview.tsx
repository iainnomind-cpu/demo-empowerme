import { Fragment } from "react";
import { MeMark } from "@/components/brand/Logo";
import { cn } from "@/lib/cn";

/** Aplica el formato de WhatsApp: *negritas*, _itálicas_ y saltos de línea. */
export function WaText({ text }: { text: string }) {
  return (
    <>
      {text.split("\n").map((line, i) => (
        <Fragment key={i}>
          {i > 0 && <br />}
          {line.split(/(\*[^*\n]+\*|_[^_\n]+_)/g).map((part, j) =>
            part.startsWith("*") && part.endsWith("*") && part.length > 2 ? (
              <strong key={j}>{part.slice(1, -1)}</strong>
            ) : part.startsWith("_") && part.endsWith("_") && part.length > 2 ? (
              <em key={j}>{part.slice(1, -1)}</em>
            ) : (
              <Fragment key={j}>{part}</Fragment>
            ),
          )}
        </Fragment>
      ))}
    </>
  );
}

/** Maqueta de chat de WhatsApp para previsualizar el mensaje tal como lo verá la persona. */
export function WhatsAppPreview({ text, imageUrl, className }: { text: string; imageUrl?: string; className?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-[2rem] bg-ink p-2 shadow-2xl", className)}>
      <div className="overflow-hidden rounded-[1.6rem] bg-[#efe7dd]">
        <div className="flex items-center gap-3 bg-[#075e54] px-4 py-3 text-white">
          <span className="grid size-9 place-items-center rounded-full bg-brand">
            <MeMark className="h-3.5 w-auto text-white" />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold">Empowerme</p>
            <p className="text-[0.7rem] text-white/70">Cuenta de empresa</p>
          </div>
        </div>
        <div className="min-h-[300px] space-y-2 p-3" style={{ backgroundImage: "radial-gradient(rgb(0 0 0 / 0.04) 1px, transparent 1px)", backgroundSize: "14px 14px" }}>
          <div className="max-w-[88%] rounded-xl rounded-tl-none bg-white p-1.5 text-[0.84rem] leading-snug text-[#111b21] shadow-sm">
            {imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt="" className="mb-1.5 aspect-[16/10] w-full rounded-lg object-cover" />
            )}
            <div className="px-1.5 pb-0.5 [overflow-wrap:anywhere]">
              <WaText text={text || "Escribe tu mensaje…"} />
              <span className="ml-2 inline-block translate-y-1 text-[0.65rem] text-[#667781]">9:41</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
