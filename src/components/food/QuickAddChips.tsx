"use client";

import { useState, useEffect, useRef } from "react";
import type { FoodEntry } from "@/lib/types";

type QuickItem = Omit<Partial<FoodEntry>, "meal"> & {
  label: string;
  meal: FoodEntry["meal"];
};

const DEFAULTS: QuickItem[] = [
  { label: "Banana",        name: "Banana",                  calories: 105, protein: 1,  carbs: 27, fat: 0,  meal: "snack"     },
  { label: "Black Coffee",  name: "Black Coffee",             calories: 5,   protein: 0,  carbs: 1,  fat: 0,  meal: "breakfast" },
  { label: "Egg",           name: "Egg",                      calories: 70,  protein: 6,  carbs: 0,  fat: 5,  meal: "breakfast" },
  { label: "Oatmeal",       name: "Oatmeal",                  calories: 150, protein: 5,  carbs: 27, fat: 3,  meal: "breakfast" },
  { label: "Chicken 100g",  name: "Chicken Breast (100g)",    calories: 165, protein: 31, carbs: 0,  fat: 4,  meal: "lunch"     },
  { label: "Greek Yogurt",  name: "Greek Yogurt",             calories: 100, protein: 17, carbs: 6,  fat: 0,  meal: "snack"     },
  { label: "Almonds 30g",   name: "Almonds (30g)",            calories: 170, protein: 6,  carbs: 6,  fat: 15, meal: "snack"     },
  { label: "Rice 100g",     name: "Cooked Rice (100g)",       calories: 130, protein: 3,  carbs: 28, fat: 0,  meal: "lunch"     },
  { label: "Protein Shake", name: "Protein Shake",            calories: 120, protein: 25, carbs: 3,  fat: 2,  meal: "snack"     },
  { label: "Apple",         name: "Apple",                    calories: 95,  protein: 0,  carbs: 25, fat: 0,  meal: "snack"     },
  { label: "Avocado ½",     name: "Avocado (½)",              calories: 120, protein: 2,  carbs: 6,  fat: 11, meal: "lunch"     },
  { label: "Whey + Milk",   name: "Whey Protein + Milk",      calories: 220, protein: 28, carbs: 18, fat: 4,  meal: "snack"     },
];

const STORAGE_KEY = "fittrack-quick-adds";

const BLANK = { name: "", calories: "", protein: "", carbs: "", fat: "" };

function loadCustom(): QuickItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

interface Props {
  onSelect: (data: Partial<FoodEntry>) => void;
}

export default function QuickAddChips({ onSelect }: Props) {
  const [custom,     setCustom]     = useState<QuickItem[]>([]);
  const [showPanel,  setShowPanel]  = useState(false);
  const [form,       setForm]       = useState(BLANK);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setCustom(loadCustom()); }, []);

  // Focus name input when panel opens
  useEffect(() => {
    if (showPanel) setTimeout(() => nameRef.current?.focus(), 50);
  }, [showPanel]);

  function field(key: keyof typeof BLANK, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSave() {
    if (!form.name.trim() || !Number(form.calories)) return;
    const item: QuickItem = {
      label:    form.name.trim(),
      name:     form.name.trim(),
      calories: Number(form.calories),
      protein:  Number(form.protein)  || 0,
      carbs:    Number(form.carbs)    || 0,
      fat:      Number(form.fat)      || 0,
      meal:     "snack",
    };
    const updated = [...custom, item];
    setCustom(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setForm(BLANK);
    setShowPanel(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") { e.preventDefault(); handleSave(); }
    if (e.key === "Escape") setShowPanel(false);
  }

  const isValid = form.name.trim().length > 0 && Number(form.calories) > 0;
  const all = [...DEFAULTS, ...custom];

  return (
    <div>
      {/* Header row */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
          Quick Add
        </h3>
        <button
          onClick={() => setShowPanel((v) => !v)}
          aria-label={showPanel ? "Cancel" : "Create quick add"}
          className="w-6 h-6 rounded-full flex items-center justify-center transition-colors active:opacity-60"
          style={{
            background: showPanel ? "var(--surface-2)" : "var(--accent)",
            color: "#fff",
          }}
        >
          {showPanel ? (
            // × close
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="2" y1="2" x2="10" y2="10" />
              <line x1="10" y1="2" x2="2" y2="10" />
            </svg>
          ) : (
            // + add
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="6" y1="1" x2="6" y2="11" />
              <line x1="1" y1="6" x2="11" y2="6" />
            </svg>
          )}
        </button>
      </div>

      {/* Creation panel */}
      {showPanel && (
        <div
          className="rounded-2xl p-4 mb-3"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          onKeyDown={handleKeyDown}
        >
          {/* Name */}
          <input
            ref={nameRef}
            type="text"
            placeholder="Name (e.g. Greek yogurt)"
            value={form.name}
            onChange={(e) => field("name", e.target.value)}
            autoComplete="off"
            className="w-full rounded-xl px-3 py-2.5 text-sm mb-3 outline-none"
            style={{
              background: "var(--surface-2)",
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
            }}
          />

          {/* Kcal — full width */}
          <div className="mb-3">
            <label className="text-xs mb-1 block" style={{ color: "var(--text-secondary)" }}>
              Calories
            </label>
            <input
              type="number"
              inputMode="numeric"
              placeholder="0"
              value={form.calories}
              onChange={(e) => field("calories", e.target.value)}
              className="w-full rounded-xl px-3 py-2.5 text-sm text-center outline-none"
              style={{
                background: "var(--surface-2)",
                color: "var(--text-primary)",
                border: "1px solid var(--border)",
              }}
            />
          </div>

          {/* Macros row */}
          <div className="flex gap-2 mb-4">
            {(["protein", "carbs", "fat"] as const).map((macro) => (
              <div key={macro} className="flex-1">
                <label className="text-xs mb-1 block capitalize" style={{ color: "var(--text-secondary)" }}>
                  {macro}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    inputMode="decimal"
                    placeholder="0"
                    value={form[macro]}
                    onChange={(e) => field(macro, e.target.value)}
                    className="w-full rounded-xl px-2 py-2.5 text-sm text-center outline-none"
                    style={{
                      background: "var(--surface-2)",
                      color: "var(--text-primary)",
                      border: "1px solid var(--border)",
                    }}
                  />
                  <span
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs pointer-events-none"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    g
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={!isValid}
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity"
            style={{ background: "var(--accent)", opacity: isValid ? 1 : 0.4 }}
          >
            Save Quick Add
          </button>
        </div>
      )}

      {/* Chips row */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 no-scrollbar">
        {all.map(({ label, ...data }) => (
          <button
            key={label}
            onClick={() => onSelect(data)}
            className="flex-none px-3.5 py-2 rounded-full text-sm font-medium whitespace-nowrap active:opacity-60 transition-opacity"
            style={{
              background: "var(--surface)",
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
