interface Props {
  label: string;
  current: number;
  goal: number;
  color: string;
}

export default function MacroCard({ label, current, goal, color }: Props) {
  const pct = goal > 0 ? Math.min(current / goal, 1) : 0;

  return (
    <div
      className="flex-1 rounded-2xl p-3 flex flex-col gap-2"
      style={{ background: "var(--surface)" }}
    >
      <div className="flex justify-between items-baseline">
        <span
          className="text-xs font-medium"
          style={{ color: "var(--text-secondary)" }}
        >
          {label}
        </span>
        <span
          className="text-xs tabular-nums"
          style={{ color: "var(--text-secondary)" }}
        >
          /{goal}g
        </span>
      </div>

      <div
        className="text-xl font-bold tabular-nums leading-none"
        style={{ color: "var(--text-primary)" }}
      >
        {current}
        <span
          className="text-xs font-normal ml-0.5"
          style={{ color: "var(--text-secondary)" }}
        >
          g
        </span>
      </div>

      <div
        className="h-1 rounded-full overflow-hidden"
        style={{ background: "var(--surface-2)" }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct * 100}%`, background: color }}
        />
      </div>
    </div>
  );
}
