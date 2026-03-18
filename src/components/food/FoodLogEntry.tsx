import type { FoodEntry } from "@/lib/types";

interface Props {
  entry: FoodEntry;
  isExpanded: boolean;
  isLast: boolean;
  onTap: () => void;
  onKeep: () => void;
  onDelete: () => void;
}

export default function FoodLogEntry({
  entry,
  isExpanded,
  isLast,
  onTap,
  onKeep,
  onDelete,
}: Props) {
  return (
    <div>
      {/* Row */}
      <button
        onClick={onTap}
        className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors active:opacity-70"
        style={{
          background: isExpanded ? "var(--surface-2)" : "transparent",
        }}
      >
        <div className="min-w-0 flex-1">
          <div
            className="font-medium text-sm truncate"
            style={{ color: "var(--text-primary)" }}
          >
            {entry.name}
          </div>
          <div
            className="text-xs mt-0.5 tabular-nums"
            style={{ color: "var(--text-secondary)" }}
          >
            P {entry.protein}g
          </div>
        </div>

        <div className="ml-4 text-right flex-none">
          <div
            className="text-sm font-semibold tabular-nums"
            style={{ color: "var(--text-primary)" }}
          >
            {entry.calories}
          </div>
          <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
            kcal
          </div>
        </div>
      </button>

      {/* Expanded actions */}
      {isExpanded && (
        <div
          className="flex gap-2 px-4 py-2.5"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <button
            onClick={onKeep}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium active:opacity-70 transition-opacity"
            style={{ background: "var(--surface-2)", color: "var(--text-primary)" }}
          >
            Keep
          </button>
          <button
            onClick={onDelete}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium active:opacity-70 transition-opacity"
            style={{ background: "rgba(239,68,68,0.15)", color: "#f87171" }}
          >
            Delete
          </button>
        </div>
      )}

      {/* Divider — only between rows, not when last or expanded */}
      {!isLast && !isExpanded && (
        <div className="mx-4" style={{ height: 1, background: "var(--border)" }} />
      )}
    </div>
  );
}
