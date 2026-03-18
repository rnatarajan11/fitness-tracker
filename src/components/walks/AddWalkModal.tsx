"use client";

import { useState } from "react";
import type { WalkEntry } from "@/lib/types";

function todayISO() { return new Date().toLocaleDateString("en-CA"); }
function newId() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

interface Props {
  onClose: () => void;
  onAdd: (entry: WalkEntry) => void;
}

export default function AddWalkModal({ onClose, onAdd }: Props) {
  const [form, setForm] = useState({
    date:        todayISO(),
    durationMin: "",
    speedMph:    "",
    incline:     "",
  });
  const [submitting, setSubmitting] = useState(false);

  function field(key: keyof typeof form, val: string) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  const isValid = Number(form.durationMin) > 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || submitting) return;
    setSubmitting(true);
    onAdd({
      id:          newId(),
      date:        form.date,
      durationMin: Number(form.durationMin),
      speedMph:    form.speedMph  ? Number(form.speedMph)  : undefined,
      incline:     form.incline   ? Number(form.incline)   : undefined,
    });
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

        <form id="walk-form" onSubmit={handleSubmit} className="overflow-y-auto px-5 pb-4 flex-1">
          <h2
            className="text-lg font-semibold mt-2 mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            Log Walk
          </h2>

          {/* Duration — large center */}
          <div className="mb-4">
            <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--text-secondary)" }}>
              Duration (min)
            </label>
            <input
              type="number"
              inputMode="numeric"
              placeholder="0"
              value={form.durationMin}
              onChange={(e) => field("durationMin", e.target.value)}
              autoFocus
              className="w-full rounded-xl px-4 py-3 text-3xl font-bold text-center outline-none tabular-nums"
              style={{ background: "var(--surface-2)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
            />
          </div>

          {/* Speed + Incline */}
          <div className="flex gap-3 mb-4">
            <div className="flex-1">
              <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--text-secondary)" }}>
                Speed (mph)
              </label>
              <input
                type="number"
                inputMode="decimal"
                step="0.1"
                placeholder="3.0"
                value={form.speedMph}
                onChange={(e) => field("speedMph", e.target.value)}
                className="w-full rounded-xl px-3 py-2.5 text-base text-center outline-none"
                style={{ background: "var(--surface-2)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
              />
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--text-secondary)" }}>
                Incline (%)
              </label>
              <input
                type="number"
                inputMode="decimal"
                step="0.5"
                placeholder="0"
                value={form.incline}
                onChange={(e) => field("incline", e.target.value)}
                className="w-full rounded-xl px-3 py-2.5 text-base text-center outline-none"
                style={{ background: "var(--surface-2)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
              />
            </div>
          </div>

          {/* Date */}
          <div className="mb-7">
            <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--text-secondary)" }}>
              Date
            </label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => field("date", e.target.value)}
              className="w-full rounded-xl px-4 py-2.5 text-base outline-none"
              style={{ background: "var(--surface-2)", color: "var(--text-primary)", border: "1px solid var(--border)", colorScheme: "dark" }}
            />
          </div>

        </form>
        <div
          className="flex-none px-5 pt-3"
          style={{ paddingBottom: "max(env(safe-area-inset-bottom), 20px)", borderTop: "1px solid var(--border)" }}
        >
          <button
            type="submit"
            form="walk-form"
            disabled={!isValid || submitting}
            className="w-full py-4 rounded-2xl font-semibold text-white transition-opacity"
            style={{ background: "var(--accent)", opacity: !isValid || submitting ? 0.45 : 1 }}
          >
            {submitting ? "Saving…" : "Log Walk"}
          </button>
        </div>
      </div>
    </div>
  );
}
