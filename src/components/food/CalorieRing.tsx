"use client";

interface Props {
  eaten: number;
  goal: number;
}

export default function CalorieRing({ eaten, goal }: Props) {
  const SIZE = 192;
  const STROKE = 15;
  const radius = (SIZE - STROKE) / 2;
  const circ = 2 * Math.PI * radius;
  const pct = goal > 0 ? Math.min(eaten / goal, 1) : 0;
  const offset = circ * (1 - pct);
  const over = eaten > goal;
  const remaining = Math.max(goal - eaten, 0);

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Ring */}
      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        <svg
          width={SIZE}
          height={SIZE}
          style={{ transform: "rotate(-90deg)" }}
          aria-hidden="true"
        >
          {/* Track */}
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={radius}
            fill="none"
            stroke="var(--surface-2)"
            strokeWidth={STROKE}
          />
          {/* Progress arc */}
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={radius}
            fill="none"
            stroke={over ? "#f87171" : "var(--accent)"}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{
              transition: "stroke-dashoffset 0.6s cubic-bezier(.4,0,.2,1), stroke 0.3s ease",
            }}
          />
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
          <span
            className="text-4xl font-bold tabular-nums leading-none"
            style={{ color: over ? "#f87171" : "var(--text-primary)" }}
          >
            {eaten.toLocaleString()}
          </span>
          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
            kcal eaten
          </span>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-6">
        <div className="text-center">
          <div
            className="text-sm font-semibold tabular-nums"
            style={{ color: "var(--text-primary)" }}
          >
            {goal.toLocaleString()}
          </div>
          <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
            Goal
          </div>
        </div>

        <div className="w-px h-8" style={{ background: "var(--border)" }} />

        <div className="text-center">
          <div
            className="text-sm font-semibold tabular-nums"
            style={{ color: over ? "#f87171" : "var(--text-primary)" }}
          >
            {over
              ? `+${(eaten - goal).toLocaleString()}`
              : remaining.toLocaleString()}
          </div>
          <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
            {over ? "Over" : "Remaining"}
          </div>
        </div>
      </div>
    </div>
  );
}
