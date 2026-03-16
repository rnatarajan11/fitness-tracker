"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { foodApi } from "@/lib/sheets";
import type { FoodEntry } from "@/lib/types";
import CalorieRing from "@/components/food/CalorieRing";
import MacroCard from "@/components/food/MacroCard";
import QuickAddChips from "@/components/food/QuickAddChips";
import FoodLogEntry from "@/components/food/FoodLogEntry";
import AddFoodModal from "@/components/food/AddFoodModal";

// ─── Goals (will be pulled from Profile later) ───────────────────────────────
const GOALS = { calories: 2000, protein: 150, carbs: 225, fat: 65 };

const MEAL_ORDER = ["breakfast", "lunch", "dinner", "snack"] as const;
const MEAL_LABEL: Record<string, string> = {
  breakfast: "Breakfast",
  lunch:     "Lunch",
  dinner:    "Dinner",
  snack:     "Snacks",
};

function todayISO() {
  return new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function FoodPage() {
  const [entries,    setEntries]    = useState<FoodEntry[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [showModal,  setShowModal]  = useState(false);
  const [prefill,    setPrefill]    = useState<Partial<FoodEntry>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // ── Load today's entries on mount ──────────────────────────────────────────
  useEffect(() => {
    foodApi
      .getAll()
      .then((all) => {
        const today = todayISO();
        // GAS may return date cells as ISO timestamps ("2025-03-15T00:00:00.000Z")
        // rather than plain "YYYY-MM-DD" strings — slice to first 10 chars to normalise.
        setEntries(all.filter((e) => String(e.date).slice(0, 10) === today));
      })
      .catch((err: unknown) => setError(String(err)))
      .finally(() => setLoading(false));
  }, []);

  // ── Totals ─────────────────────────────────────────────────────────────────
  const totals = useMemo(
    () =>
      entries.reduce(
        (acc, e) => ({
          calories: acc.calories + Number(e.calories),
          protein:  acc.protein  + Number(e.protein),
          carbs:    acc.carbs    + Number(e.carbs),
          fat:      acc.fat      + Number(e.fat),
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      ),
    [entries]
  );

  // ── Actions ────────────────────────────────────────────────────────────────
  async function handleAdd(entry: FoodEntry) {
    // Optimistic update — show immediately, write to Sheets in background
    setEntries((prev) => [...prev, entry]);
    setShowModal(false);
    setPrefill({});
    foodApi.add(entry).catch(console.error);
  }

  async function handleDelete(id: string) {
    await foodApi.delete(id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
    setExpandedId(null);
  }

  function openModal(data: Partial<FoodEntry> = {}) {
    setPrefill(data);
    setShowModal(true);
  }

  const handleQuickAdd = useCallback(async function handleQuickAdd(data: Partial<FoodEntry>) {
    const entry: FoodEntry = {
      id:       typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      date:     new Date().toLocaleDateString("en-CA"),
      time:     new Date().toTimeString().slice(0, 5),
      name:     data.name     ?? "Unknown",
      calories: data.calories ?? 0,
      protein:  data.protein  ?? 0,
      carbs:    data.carbs    ?? 0,
      fat:      data.fat      ?? 0,
      meal:     data.meal     ?? "snack",
    };
    // Optimistic update — UI reflects instantly, Sheets write happens in background
    setEntries((prev) => [...prev, entry]);
    foodApi.add(entry).catch(console.error);
  }, []);

  // ── Group by meal ──────────────────────────────────────────────────────────
  const grouped = MEAL_ORDER.map((meal) => ({
    meal,
    label:   MEAL_LABEL[meal],
    entries: entries.filter((e) => e.meal === meal),
  }));

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      <div className="px-4 pt-4 pb-4 space-y-5">
        {/* Calorie ring */}
        <div className="flex justify-center pt-1">
          <CalorieRing eaten={Math.round(totals.calories)} goal={GOALS.calories} />
        </div>

        {/* Macro cards */}
        <div className="flex gap-3">
          <MacroCard label="Protein" current={Math.round(totals.protein)} goal={GOALS.protein} color="#818cf8" />
          <MacroCard label="Carbs"   current={Math.round(totals.carbs)}   goal={GOALS.carbs}   color="#fbbf24" />
          <MacroCard label="Fat"     current={Math.round(totals.fat)}     goal={GOALS.fat}     color="#f87171" />
        </div>

        {/* Quick add */}
        <QuickAddChips onSelect={handleQuickAdd} />

        {/* Food log */}
        <div>
          {error && (
            <p className="text-center py-6 text-sm" style={{ color: "#f87171" }}>
              {error}
            </p>
          )}

          {loading && !error && (
            <div className="space-y-3 mt-2">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="h-16 rounded-2xl animate-pulse"
                  style={{ background: "var(--surface)" }}
                />
              ))}
            </div>
          )}

          {!loading && !error && entries.length === 0 && (
            <p
              className="text-center py-10 text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              No food logged today.
              <br />
              Tap <strong style={{ color: "var(--text-primary)" }}>+ Add Food</strong> to get started.
            </p>
          )}

          {!loading && !error && entries.length > 0 && (
            <div className="space-y-4">
              {grouped.map(({ meal, label, entries: mealEntries }) =>
                mealEntries.length === 0 ? null : (
                  <section key={meal}>
                    {/* Section header */}
                    <div
                      className="flex justify-between items-baseline mb-2 px-1"
                    >
                      <h3
                        className="text-sm font-semibold"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {label}
                      </h3>
                      <span
                        className="text-xs tabular-nums"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {mealEntries
                          .reduce((s, e) => s + Number(e.calories), 0)
                          .toLocaleString()}{" "}
                        kcal
                      </span>
                    </div>

                    {/* Entries card */}
                    <div
                      className="rounded-2xl overflow-hidden"
                      style={{ background: "var(--surface)" }}
                    >
                      {mealEntries.map((entry, idx) => (
                        <FoodLogEntry
                          key={entry.id}
                          entry={entry}
                          isExpanded={expandedId === entry.id}
                          isLast={idx === mealEntries.length - 1}
                          onTap={() =>
                            setExpandedId(
                              expandedId === entry.id ? null : entry.id
                            )
                          }
                          onKeep={() => setExpandedId(null)}
                          onDelete={() => handleDelete(entry.id)}
                        />
                      ))}
                    </div>
                  </section>
                )
              )}
            </div>
          )}
        </div>

        {/* Bottom spacer — clears the fixed Add Food button */}
        <div style={{ height: "72px" }} />
      </div>

      {/* Fixed Add Food button — sits above the tab bar */}
      <div
        className="fixed left-0 right-0 z-40 px-4"
        style={{
          bottom: "calc(var(--tab-bar-height) + env(safe-area-inset-bottom, 0px))",
          paddingBottom: "10px",
          background:
            "linear-gradient(to top, var(--background) 60%, transparent)",
          paddingTop: "16px",
        }}
      >
        <button
          onClick={() => openModal()}
          className="w-full py-3.5 rounded-2xl font-semibold text-white flex items-center justify-center gap-2 active:scale-95 transition-transform"
          style={{ background: "var(--accent)" }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Food
        </button>
      </div>

      {/* Add food modal */}
      {showModal && (
        <AddFoodModal
          prefill={prefill}
          onClose={() => {
            setShowModal(false);
            setPrefill({});
          }}
          onAdd={handleAdd}
        />
      )}
    </>
  );
}
