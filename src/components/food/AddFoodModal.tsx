"use client";

import { useState } from "react";
import type { FoodEntry } from "@/lib/types";
import QuickAddChips from "@/components/food/QuickAddChips";

const MEALS: { value: FoodEntry["meal"]; label: string }[] = [
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch",     label: "Lunch"     },
  { value: "dinner",    label: "Dinner"    },
  { value: "snack",     label: "Snack"     },
];

function nowTime() {
  return new Date().toTimeString().slice(0, 5);
}

function newId() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

interface Props {
  prefill: Partial<FoodEntry>;
  onClose: () => void;
  onAdd: (entry: FoodEntry) => Promise<void>;
  onQuickAdd?: (data: Partial<FoodEntry>) => void;
}

export default function AddFoodModal({ prefill, onClose, onAdd, onQuickAdd }: Props) {
  const [form, setForm] = useState({
    name:     prefill.name     ?? "",
    meal:     prefill.meal     ?? ("snack" as FoodEntry["meal"]),
    calories: prefill.calories != null ? String(prefill.calories) : "",
    protein:  prefill.protein  != null ? String(prefill.protein)  : "",
    time:     nowTime(),
  });
  const [submitting, setSubmitting] = useState(false);

  function field(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const isValid = form.name.trim().length > 0 && Number(form.calories) > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;

    const entry: FoodEntry = {
      id:       newId(),
      date:     new Date().toLocaleDateString("en-CA"),
      time:     form.time,
      name:     form.name.trim(),
      calories: Number(form.calories),
      protein:  Number(form.protein) || 0,
      meal:     form.meal,
    };

    setSubmitting(true);
    try {
      await onAdd(entry);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: "rgba(0,0,0,0.65)" }}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className="relative rounded-t-3xl"
        style={{
          background: "var(--surface)",
          maxHeight: "92dvh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 flex-none">
          <div className="w-10 h-1 rounded-full" style={{ background: "var(--border)" }} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 flex-none" style={{ borderBottom: "1px solid var(--border)" }}>
          <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Log Food</h2>
          <button
            type="submit"
            form="food-form"
            disabled={!isValid || submitting}
            className="px-5 py-2 rounded-xl font-semibold text-sm text-white transition-opacity"
            style={{ background: "var(--accent)", opacity: !isValid || submitting ? 0.45 : 1 }}
          >
            {submitting ? "Saving…" : "Log"}
          </button>
        </div>

        {/* Scrollable form body */}
        <form onSubmit={handleSubmit} id="food-form" className="overflow-y-auto px-5 pb-8 flex-1">

          {/* Quick add chips */}
          {onQuickAdd && (
            <div className="mb-5">
              <QuickAddChips
                onSelect={(data) => {
                  onQuickAdd(data);
                  onClose();
                }}
              />
            </div>
          )}

          {/* Food name */}
          <input
            type="text"
            placeholder="Food name"
            value={form.name}
            onChange={(e) => field("name", e.target.value)}
            autoFocus
            autoComplete="off"
            className="w-full rounded-xl px-4 py-3 text-base mb-4 outline-none"
            style={{
              background: "var(--surface-2)",
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
            }}
          />

          {/* Meal selector */}
          <div className="flex gap-2 mb-5">
            {MEALS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => field("meal", value)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold transition-colors active:opacity-70"
                style={{
                  background: form.meal === value ? "var(--accent)" : "var(--surface-2)",
                  color: form.meal === value ? "#fff" : "var(--text-secondary)",
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Calories — large centre input */}
          <div className="mb-4">
            <label
              className="text-xs font-medium mb-1.5 block"
              style={{ color: "var(--text-secondary)" }}
            >
              Calories
            </label>
            <input
              type="number"
              inputMode="numeric"
              placeholder="0"
              value={form.calories}
              onChange={(e) => field("calories", e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-3xl font-bold text-center outline-none tabular-nums"
              style={{
                background: "var(--surface-2)",
                color: "var(--text-primary)",
                border: "1px solid var(--border)",
              }}
            />
          </div>

          {/* Protein */}
          <div className="mb-4">
            <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--text-secondary)" }}>
              Protein
            </label>
            <div className="relative">
              <input
                type="number"
                inputMode="decimal"
                placeholder="0"
                value={form.protein}
                onChange={(e) => field("protein", e.target.value)}
                className="w-full rounded-xl px-3 py-2.5 text-base text-center outline-none"
                style={{ background: "var(--surface-2)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs pointer-events-none" style={{ color: "var(--text-secondary)" }}>g</span>
            </div>
          </div>

          {/* Time */}
          <div className="mb-7">
            <label
              className="text-xs font-medium mb-1.5 block"
              style={{ color: "var(--text-secondary)" }}
            >
              Time
            </label>
            <input
              type="time"
              value={form.time}
              onChange={(e) => field("time", e.target.value)}
              className="w-full rounded-xl px-4 py-2.5 text-base outline-none"
              style={{
                background: "var(--surface-2)",
                color: "var(--text-primary)",
                border: "1px solid var(--border)",
                colorScheme: "dark",
              }}
            />
          </div>

        </form>
      </div>
    </div>
  );
}
