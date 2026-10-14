"use client";

import { useState } from "react";
import { mxn } from "@/lib/format";

/**
 * Ingresos por día (una sola serie → sin leyenda; el título la nombra).
 * Barras delgadas con extremo redondeado anclado a la base, 2px de separación,
 * cuadrícula discreta y tooltip al pasar el cursor.
 */
export function RevenueChart({ data }: { data: { label: string; value: number; count: number }[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.value));
  const nice = Math.ceil(max / 1000) * 1000 || 1000;
  const W = 720;
  const H = 220;
  const pad = { l: 48, r: 8, t: 12, b: 26 };
  const iw = W - pad.l - pad.r;
  const ih = H - pad.t - pad.b;
  const step = iw / data.length;
  const bw = Math.max(4, step - 2);
  const ticks = [0, nice / 2, nice];

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Ingresos por día, últimos 30 días" onMouseLeave={() => setHover(null)}>
        {ticks.map((t) => {
          const y = pad.t + ih - (t / nice) * ih;
          return (
            <g key={t}>
              <line x1={pad.l} x2={W - pad.r} y1={y} y2={y} stroke="var(--color-line)" strokeDasharray={t === 0 ? undefined : "2 4"} />
              <text x={pad.l - 8} y={y + 4} textAnchor="end" className="fill-muted text-[10px] tabular">
                {t >= 1000 ? `$${t / 1000}k` : `$${t}`}
              </text>
            </g>
          );
        })}
        {data.map((d, i) => {
          const h = (d.value / nice) * ih;
          const x = pad.l + i * step + 1;
          const y = pad.t + ih - h;
          const r = Math.min(4, bw / 2, h);
          const path =
            h <= 0
              ? ""
              : `M${x} ${pad.t + ih} V${y + r} Q${x} ${y} ${x + r} ${y} H${x + bw - r} Q${x + bw} ${y} ${x + bw} ${y + r} V${pad.t + ih} Z`;
          return (
            <g key={i} onMouseEnter={() => setHover(i)}>
              <rect x={pad.l + i * step} y={pad.t} width={step} height={ih} fill="transparent" />
              {path && <path d={path} fill={hover === null || hover === i ? "var(--color-brand)" : "color-mix(in oklab, var(--color-brand) 40%, white)"} />}
              {i % 5 === 0 && (
                <text x={x + bw / 2} y={H - 8} textAnchor="middle" className="fill-muted text-[10px]">
                  {d.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      {hover !== null && (
        <div
          className="pointer-events-none absolute top-0 -translate-x-1/2 rounded-lg bg-ink px-3 py-2 text-xs text-paper shadow-lg"
          style={{ left: `${((pad.l + hover * step + step / 2) / W) * 100}%` }}
        >
          <p className="font-semibold">{data[hover].label}</p>
          <p className="tabular">{mxn(data[hover].value)} · {data[hover].count} pedidos</p>
        </div>
      )}
    </div>
  );
}
