"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";

/**
 * La onda de la "M" convertida en línea de ruta. Se dibuja al entrar en pantalla.
 * Es el hilo gráfico que conecta las secciones del sitio.
 */
export function Wave({
  className,
  arches = 9,
  strokeWidth = 3,
  color = "currentColor",
  draw = true,
}: {
  className?: string;
  arches?: number;
  strokeWidth?: number;
  color?: string;
  draw?: boolean;
}) {
  const reduce = useReducedMotion();
  const w = 40;
  let d = `M0 44`;
  for (let i = 0; i < arches; i++) {
    const x = i * w;
    d += ` L${x} 22 A${w / 2} ${w / 2} 0 0 1 ${x + w} 22`;
  }
  d += ` L${arches * w} 44`;
  return (
    <svg viewBox={`-2 -2 ${arches * w + 4} 50`} className={cn("overflow-visible", className)} aria-hidden preserveAspectRatio="none">
      <motion.path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        initial={draw && !reduce ? { pathLength: 0 } : false}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 1.8, ease: [0.65, 0, 0.35, 1] }}
      />
    </svg>
  );
}
