"use client";

import type { WeightEntry } from "@/lib/types";

interface Props {
  entries: WeightEntry[]; // sorted newest-first
}

export default function WeightChart({ entries }: Props) {
  // Up to 30 entries, oldest-first for the chart
  const data = entries.slice(0, 30).reverse();
  if (data.length < 2) return null;

  const weights = data.map((e) => Number(e.weightKg));
  const min = Math.min(...weights) - 0.5;
  const max = Math.max(...weights) + 0.5;
  const range = max - min || 1;

  const W = 320;
  const H = 120;
  const PAD = 16;

  const pts = data.map((_, i) => ({
    x: PAD + (i / (data.length - 1)) * (W - PAD * 2),
    y: H - PAD - ((weights[i] - min) / range) * (H - PAD * 2),
  }));

  const polyline = pts.map((p) => `${p.x},${p.y}`).join(" ");
  const area = [
    `M ${pts[0].x},${H - PAD}`,
    ...pts.map((p) => `L ${p.x},${p.y}`),
    `L ${pts[pts.length - 1].x},${H - PAD}`,
    "Z",
  ].join(" ");

  return (
    <div
      className="rounded-2xl overflow-hidden px-3 pt-3 pb-2"
      style={{ background: "var(--surface)" }}
    >
      <div
        className="text-xs font-medium mb-1 px-1"
        style={{ color: "var(--text-secondary)" }}
      >
        Last {data.length} entries
      </div>
      <svg
        width="100%"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="wgrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#wgrad)" />
        <polyline
          points={polyline}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill="var(--accent)" />
        ))}
      </svg>
      <div className="flex justify-between px-1 mt-0.5">
        <span className="text-xs tabular-nums" style={{ color: "var(--text-secondary)" }}>
          {String(data[0].date).slice(5)}
        </span>
        <span className="text-xs tabular-nums" style={{ color: "var(--text-secondary)" }}>
          {String(data[data.length - 1].date).slice(5)}
        </span>
      </div>
    </div>
  );
}
