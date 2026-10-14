"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Pause, Play } from "lucide-react";
import { btn } from "@/components/ui";
import { heroVideos } from "@/content/site";
import { cn } from "@/lib/cn";

const CLIP_MS = 6500;

export function Hero({ next }: { next?: { title: string; when: string; href: string; place: string } }) {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(true);
  const reduce = useReducedMotion();
  const refs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    if (!playing || reduce) return;
    const t = setTimeout(() => setI((v) => (v + 1) % heroVideos.length), CLIP_MS);
    return () => clearTimeout(t);
  }, [i, playing, reduce]);

  useEffect(() => {
    refs.current.forEach((v, idx) => {
      if (!v) return;
      if (idx === i && playing && !reduce) {
        v.currentTime = 0;
        v.play().catch(() => {});
      } else v.pause();
    });
  }, [i, playing, reduce]);

  const words = ["El movimiento", "nos volvió"];

  return (
    <section className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-ink text-white">
      {heroVideos.map((v, idx) => (
        <video
          key={v.src}
          ref={(el) => {
            refs.current[idx] = el;
          }}
          src={v.src}
          muted
          playsInline
          loop
          preload={idx === 0 ? "auto" : "metadata"}
          className={cn(
            "absolute inset-0 -z-10 size-full object-cover transition-opacity duration-[1200ms]",
            idx === i ? "opacity-100" : "opacity-0",
          )}
          aria-hidden
        />
      ))}
      {/* Tratamiento de color: tinta abajo para leer el texto, un toque cálido de marca arriba */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/35 to-ink/10" />
      <div className="absolute inset-0 -z-10 bg-brand/25 mix-blend-multiply" />

      <div className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col justify-end px-4 pb-8 pt-28 sm:px-6 lg:px-10 lg:pb-10">
        <motion.p
          className="eyebrow mb-5 text-white/80"
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          Empowerme Community · Guadalajara
        </motion.p>
        <h1 className="display text-[clamp(3.4rem,min(11.5vw,17svh),11.5rem)]">
          {words.map((w, k) => (
            <span key={w} className="block overflow-hidden pb-[0.04em]">
              <motion.span
                className="block"
                initial={reduce ? false : { y: "105%" }}
                animate={{ y: "0%" }}
                transition={{ delay: 0.15 + k * 0.1, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              >
                {w}
              </motion.span>
            </span>
          ))}
          <span className="block overflow-hidden">
            <motion.span
              className="accent block text-[1.08em] leading-[0.95] text-pink"
              initial={reduce ? false : { y: "105%" }}
              animate={{ y: "0%" }}
              transition={{ delay: 0.38, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            >
              comunidad.
            </motion.span>
          </span>
        </h1>

        <div className="mt-8 grid items-end gap-8 lg:mt-10 lg:grid-cols-[1fr_auto]">
          <motion.div
            className="max-w-xl space-y-6"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <p className="text-lg leading-relaxed text-white/85 sm:text-xl">
              Clases, talleres, carreras y retos corporativos de bienestar integral. Muévete, respira y conecta con personas que suman.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/experiencias" className={btn("brand", "lg")}>
                Ver próximas experiencias <ArrowRight className="size-4 transition-transform group-hover/btn:translate-x-0.5" />
              </Link>
              <Link href="/programas" className={btn("outline-light", "lg")}>
                Programas para empresas
              </Link>
            </div>
          </motion.div>

          {next && (
            <motion.div initial={reduce ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.85 }}>
              <Link
                href={next.href}
                className="group flex items-center gap-4 rounded-2xl bg-white/10 p-3 pr-5 ring-1 ring-white/20 backdrop-blur-md transition hover:bg-white/15"
              >
                <span className="grid size-14 place-items-center rounded-xl bg-paper text-center text-ink">
                  <span className="display text-[1.6rem] leading-none">{next.when.split(" ")[0]}</span>
                  <span className="eyebrow -mt-1 !text-[0.55rem]">{next.when.split(" ")[1]}</span>
                </span>
                <span>
                  <span className="eyebrow block text-white/60">Próxima experiencia</span>
                  <span className="block font-semibold">{next.title}</span>
                  <span className="block text-sm text-white/70">{next.place}</span>
                </span>
                <ArrowRight className="ml-2 size-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
          )}
        </div>

        <div className="mt-10 flex items-center gap-4 border-t border-white/15 pt-4">
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            className="grid size-8 shrink-0 place-items-center rounded-full ring-1 ring-white/30 hover:bg-white/10"
            aria-label={playing ? "Pausar video" : "Reproducir video"}
          >
            {playing ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
          </button>
          <div className="grid flex-1 grid-cols-4 gap-3">
            {heroVideos.map((v, idx) => (
              <button key={v.label} onClick={() => setI(idx)} className="group text-left" aria-label={`Ver clip ${v.label}`}>
                <span className="block h-0.5 overflow-hidden rounded bg-white/20">
                  <span
                    key={`${i}-${playing}`}
                    className={cn("block h-full bg-white", idx < i && "w-full", idx > i && "w-0")}
                    style={
                      idx === i
                        ? { width: playing && !reduce ? undefined : "100%", animation: playing && !reduce ? `heroProgress ${CLIP_MS}ms linear forwards` : undefined }
                        : undefined
                    }
                  />
                </span>
                <span className={cn("eyebrow mt-2 hidden !text-[0.62rem] transition sm:block", idx === i ? "text-white" : "text-white/50 group-hover:text-white/80")}>
                  {v.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <style>{`@keyframes heroProgress{from{width:0}to{width:100%}}`}</style>
    </section>
  );
}
