"use client";

import { useState } from "react";
import type { WeightEntry } from "@/lib/types";

function todayISO() {
  return new Date().toLocaleDateString("en-CA");
}

function newId() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

interface Props {
  onClose: () => void;
  onAdd?: (entry: WeightEntry) => void;
  onEdit?: (entry: WeightEntry) => void;
  entry?: WeightEntry; // when provided, modal is in edit mode
}

export default function AddWeightModal({ onClose, onAdd, onEdit, entry }: Props) {
  const editMode = !!entry;
  const [form, setForm] = useState({
    date:     entry ? String(entry.date).slice(0, 10) : todayISO(),
    weightKg: entry ? String(entry.weightKg) : "",
    note:     entry?.note ?? "",
  });
  const [submitting, setSubmitting] = useState(false);

  function field(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const isValid = Number(form.weightKg) > 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || submitting) return;
    setSubmitting(true);
    const updated: WeightEntry = {
      id:       entry?.id ?? newId(),
      date:     form.date,
      weightKg: Number(form.weightKg),
      note:     form.note.trim() || undefined,
    };
    if (editMode) onEdit?.(updated);
    else onAdd?.(updated);
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div
        className="absolute inset-0"
        style={{ background: "rgba(0,0,0,0.65)" }}
        onClick={onClose}
      />
      <div
        className="relative rounded-t-3xl flex flex-col"
        style={{ background: "var(--surface)", maxHeight: "92dvh" }}
      >
        <div className="flex justify-center pt-3 pb-1 flex-none">
          <div className="w-10 h-1 rounded-full" style={{ background: "var(--border)" }} />
        </div>

        <form id="weight-form" onSubmit={handleSubmit} className="overflow-y-auto px-5 pb-4 flex-1">
          <h2
            className="text-lg font-semibold mt-2 mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            {editMode ? "Edit Weight" : "Log Weight"}
          </h2>

          {/* Weight — large center input */}
          <div className="mb-4">
            <label
              className="text-xs font-medium mb-1.5 block"
              style={{ color: "var(--text-secondary)" }}
            >
              Weight (lb)
            </label>
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              placeholder="0.0"
              value={form.weightKg}
              onChange={(e) => field("weightKg", e.target.value)}
              autoFocus
              className="w-full rounded-xl px-4 py-3 text-3xl font-bold text-center outline-none tabular-nums"
              style={{
                background: "var(--surface-2)",
                color: "var(--text-primary)",
                border: "1px solid var(--border)",
              }}
            />
          </div>

          {/* Date */}
          <div className="mb-4">
            <label
              className="text-xs font-medium mb-1.5 block"
              style={{ color: "var(--text-secondary)" }}
            >
              Date
            </label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => field("date", e.target.value)}
              className="w-full rounded-xl px-4 py-2.5 text-base outline-none"
              style={{
                background: "var(--surface-2)",
                color: "var(--text-primary)",
                border: "1px solid var(--border)",
                colorScheme: "dark",
              }}
            />
          </div>

          {/* Note */}
          <div className="mb-7">
            <label
              className="text-xs font-medium mb-1.5 block"
              style={{ color: "var(--text-secondary)" }}
            >
              Note (optional)
            </label>
            <input
              type="text"
              placeholder="Morning, post-workout…"
              value={form.note}
              onChange={(e) => field("note", e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-base outline-none"
              style={{
                background: "var(--surface-2)",
                color: "var(--text-primary)",
                border: "1px solid var(--border)",
              }}
            />
          </div>

        </form>
        <div
          className="flex-none px-5 pt-3"
          style={{ paddingBottom: "max(env(safe-area-inset-bottom), 20px)", borderTop: "1px solid var(--border)" }}
        >
          <button
            type="submit"
            form="weight-form"
            disabled={!isValid || submitting}
            className="w-full py-4 rounded-2xl font-semibold text-white transition-opacity"
            style={{ background: "var(--accent)", opacity: !isValid || submitting ? 0.45 : 1 }}
          >
            {submitting ? "Saving…" : editMode ? "Save Changes" : "Log Weight"}
          </button>
        </div>
      </div>
    </div>
  );
}
