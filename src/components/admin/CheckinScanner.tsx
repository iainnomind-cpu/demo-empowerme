"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Camera, CameraOff, CheckCircle2, Loader2, XCircle } from "lucide-react";
import { lookupBooking, toggleCheckIn } from "@/app/actions/admin";
import { btn, inputCls } from "@/components/ui";
import { cn } from "@/lib/cn";
import { dateLong, time } from "@/lib/format";
import type { Booking } from "@/lib/types";

type Detector = { detect: (src: HTMLVideoElement) => Promise<{ rawValue: string }[]> };

/**
 * Check-in en la entrada: escanea el QR con la cámara del celular (BarcodeDetector,
 * disponible en Chrome/Android) o escribe el código del boleto.
 */
export function CheckinScanner({ initialCode }: { initialCode?: string }) {
  const [code, setCode] = useState(initialCode ?? "");
  const [result, setResult] = useState<{ b: Booking | null; already?: boolean } | null>(null);
  const [pending, start] = useTransition();
  const [camera, setCamera] = useState(false);
  const [camError, setCamError] = useState("");
  const video = useRef<HTMLVideoElement>(null);
  const busy = useRef(false);

  const check = (raw: string) => {
    if (!raw.trim()) return;
    start(async () => {
      const b = await lookupBooking(raw);
      if (!b) return setResult({ b: null });
      if (b.checkedInAt) return setResult({ b, already: true });
      const updated = b.status === "pagado" ? await toggleCheckIn(b.code, true) : b;
      setResult({ b: updated ?? b });
    });
  };

  useEffect(() => {
    if (initialCode) check(initialCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!camera) return;
    let stream: MediaStream | null = null;
    let raf = 0;
    const W = window as unknown as { BarcodeDetector?: new (o: { formats: string[] }) => Detector };
    if (!W.BarcodeDetector) {
      setCamError("Este navegador no puede leer QR con la cámara. Usa Chrome en Android o escribe el código.");
      setCamera(false);
      return;
    }
    const detector = new W.BarcodeDetector({ formats: ["qr_code"] });
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } })
      .then((s) => {
        stream = s;
        if (video.current) {
          video.current.srcObject = s;
          video.current.play();
        }
        const loop = async () => {
          if (video.current && !busy.current && video.current.readyState >= 2) {
            const found = await detector.detect(video.current).catch(() => []);
            if (found[0]) {
              busy.current = true;
              setCode(found[0].rawValue);
              check(found[0].rawValue);
              setTimeout(() => (busy.current = false), 2500);
            }
          }
          raf = requestAnimationFrame(loop);
        };
        loop();
      })
      .catch(() => {
        setCamError("No pudimos abrir la cámara. Revisa los permisos.");
        setCamera(false);
      });
    return () => {
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera]);

  const ok = result?.b && result.b.status === "pagado" && !result.already;
  const warn = result?.b && (result.already || result.b.status !== "pagado");

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-ink">
          {camera ? (
            <>
              <video ref={video} muted playsInline className="size-full object-cover" />
              <div className="pointer-events-none absolute inset-[18%] rounded-3xl ring-4 ring-white/80" />
            </>
          ) : (
            <div className="flex size-full flex-col items-center justify-center gap-3 p-6 text-center text-paper/70">
              <Camera className="size-10" />
              <p className="text-sm">Apunta la cámara al QR del boleto.</p>
            </div>
          )}
        </div>
        <button type="button" onClick={() => { setCamError(""); setCamera((c) => !c); }} className={btn(camera ? "soft" : "ink", "lg", "w-full")}>
          {camera ? <CameraOff className="size-4" /> : <Camera className="size-4" />} {camera ? "Apagar cámara" : "Escanear con cámara"}
        </button>
        {camError && <p className="text-sm text-brand">{camError}</p>}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            check(code);
          }}
          className="flex gap-2"
        >
          <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="BO-XXXXXX" className={cn(inputCls, "font-mono uppercase")} aria-label="Código del boleto" />
          <button className={btn("brand", "md", "h-auto")}>{pending ? <Loader2 className="size-4 animate-spin" /> : "Validar"}</button>
        </form>
      </div>

      <div
        className={cn(
          "flex min-h-[320px] flex-col items-center justify-center rounded-2xl p-8 text-center ring-1 transition-colors",
          !result && "bg-white ring-line",
          ok && "bg-sage/40 ring-sage",
          warn && "bg-sun/40 ring-sun",
          result && !result.b && "bg-brand-soft ring-brand/40",
        )}
        aria-live="polite"
      >
        {!result && <p className="text-muted">El resultado del escaneo aparece aquí.</p>}
        {result && !result.b && (
          <>
            <XCircle className="size-14 text-brand" />
            <p className="display mt-4 text-4xl">Boleto no encontrado</p>
            <p className="mt-1 text-sm text-muted">Revisa el código o busca a la persona en la lista de inscritos.</p>
          </>
        )}
        {result?.b && (
          <>
            {ok ? <CheckCircle2 className="size-14 text-ink" /> : <XCircle className="size-14 text-ink/70" />}
            <p className="display mt-4 text-4xl">{ok ? "¡Adelante!" : result.already ? "Ya registrado" : "Pago pendiente"}</p>
            <p className="mt-3 text-xl font-semibold">{result.b.attendeeName}</p>
            <p className="text-sm">{result.b.activityTitle} · {result.b.ticketName}{result.b.shirtSize && ` · Talla ${result.b.shirtSize}`}</p>
            <p className="text-sm text-muted">{dateLong(result.b.startsAt)} · {time(result.b.startsAt)}</p>
            <p className="mt-3 font-mono text-sm">{result.b.code}</p>
            {result.already && result.b.checkedInAt && <p className="mt-2 text-xs text-muted">Entró a las {time(result.b.checkedInAt)}</p>}
          </>
        )}
      </div>
    </div>
  );
}
