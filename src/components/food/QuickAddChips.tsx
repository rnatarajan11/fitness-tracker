"use client";

import { useState, useEffect, useRef } from "react";
import type { FoodEntry } from "@/lib/types";

type QuickItem = {
  label:    string;
  name:     string;
  calories: number;
  protein:  number;
  carbs:    number;
  fat:      number;
  meal:     FoodEntry["meal"];
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

function loadItems(): QuickItem[] {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) return JSON.parse(stored);
    // First run — seed with defaults
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULTS));
    return DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

function persist(items: QuickItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

interface Props {
  onSelect: (data: Omit<QuickItem, "label">) => void;
}

export default function QuickAddChips({ onSelect }: Props) {
  // Initialise with DEFAULTS so the section is always visible immediately.
  // useEffect then overwrites with whatever is in localStorage.
  const [items,       setItems]       = useState<QuickItem[]>(DEFAULTS);
  const [showManager, setShowManager] = useState(false);
  const [form,        setForm]        = useState(BLANK);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setItems(loadItems()); }, []);

  useEffect(() => {
    if (showManager) setTimeout(() => nameRef.current?.focus(), 60);
  }, [showManager]);

  function field(key: keyof typeof BLANK, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleDelete(label: string) {
    const updated = items.filter((i) => i.label !== label);
    setItems(updated);
    persist(updated);
  }

  function handleAdd() {
    const name = form.name.trim();
    if (!name || !Number(form.calories)) return;
    // Use name as label; if a chip with that label already exists, append (2) etc.
    let label = name;
    if (items.some((i) => i.label === label)) label = `${name} (2)`;
    const item: QuickItem = {
      label,
      name,
      calories: Number(form.calories),
      protein:  Number(form.protein)  || 0,
      carbs:    Number(form.carbs)    || 0,
      fat:      Number(form.fat)      || 0,
      meal:     "snack",
    };
    const updated = [...items, item];
    setItems(updated);
    persist(updated);
    setForm(BLANK);
    nameRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") { e.preventDefault(); handleAdd(); }
  }

  const isValid = form.name.trim().length > 0 && Number(form.calories) > 0;

  return (
    <div>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
          Quick Add
        </h3>
        <button
          onClick={() => setShowManager((v) => !v)}
          aria-label={showManager ? "Close quick-add manager" : "Manage quick adds"}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold active:opacity-70 transition-opacity"
          style={{
            background: showManager ? "var(--surface-2)" : "var(--accent)",
            color: "#fff",
          }}
        >
          {showManager ? (
            <>
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <line x1="2" y1="2" x2="10" y2="10" />
                <line x1="10" y1="2" x2="2" y2="10" />
              </svg>
              Close
            </>
          ) : (
            <>
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M2 4h2M8 4h6M2 8h6M12 8h2M2 12h4M10 12h4" />
                <circle cx="5.5" cy="4"  r="1.5" fill="currentColor" stroke="none" />
                <circle cx="9.5" cy="8"  r="1.5" fill="currentColor" stroke="none" />
                <circle cx="7.5" cy="12" r="1.5" fill="currentColor" stroke="none" />
              </svg>
              Manage
            </>
          )}
        </button>
      </div>

      {/* ── Manager panel ───────────────────────────────────────────────── */}
      {showManager && (
        <div
          className="rounded-2xl mb-3 overflow-hidden"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          {/* List of existing items */}
          {items.length === 0 ? (
            <p
              className="text-sm text-center py-5"
              style={{ color: "var(--text-secondary)" }}
            >
              No quick adds yet.
            </p>
          ) : (
            <ul>
              {items.map((item, idx) => (
                <li
                  key={item.label}
                  className="flex items-center justify-between px-4 py-3"
                  style={{
                    borderBottom: idx < items.length - 1 ? "1px solid var(--border)" : "none",
                  }}
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                      {item.name}
                    </div>
                    <div className="text-xs mt-0.5 tabular-nums" style={{ color: "var(--text-secondary)" }}>
                      {item.calories} kcal · P {item.protein}g · C {item.carbs}g · F {item.fat}g
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(item.label)}
                    aria-label={`Delete ${item.name}`}
                    className="ml-3 flex-none w-7 h-7 flex items-center justify-center rounded-full active:opacity-60 transition-opacity"
                    style={{ background: "rgba(239,68,68,0.12)", color: "#f87171" }}
                  >
                    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3,5 4,14 12,14 13,5" />
                      <line x1="1" y1="5" x2="15" y2="5" />
                      <path d="M6 5V3h4v2" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Divider + Add form */}
          <div style={{ borderTop: "1px solid var(--border)" }} className="px-4 pt-4 pb-4">
            <p className="text-xs font-semibold mb-3" style={{ color: "var(--text-secondary)" }}>
              Add new
            </p>

            <input
              ref={nameRef}
              type="text"
              placeholder="Name"
              value={form.name}
              onChange={(e) => field("name", e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              className="w-full rounded-xl px-3 py-2.5 text-sm mb-3 outline-none"
              style={{
                background: "var(--surface-2)",
                color: "var(--text-primary)",
                border: "1px solid var(--border)",
              }}
            />

            <div className="mb-3">
              <input
                type="number"
                inputMode="numeric"
                placeholder="Calories"
                value={form.calories}
                onChange={(e) => field("calories", e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full rounded-xl px-3 py-2.5 text-sm text-center outline-none"
                style={{
                  background: "var(--surface-2)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border)",
                }}
              />
            </div>

            <div className="flex gap-2 mb-4">
              {(["protein", "carbs", "fat"] as const).map((macro) => (
                <div key={macro} className="flex-1 relative">
                  <input
                    type="number"
                    inputMode="decimal"
                    placeholder={macro.charAt(0).toUpperCase() + macro.slice(1)}
                    value={form[macro]}
                    onChange={(e) => field(macro, e.target.value)}
                    onKeyDown={handleKeyDown}
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
              ))}
            </div>

            <button
              onClick={handleAdd}
              disabled={!isValid}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity"
              style={{ background: "var(--accent)", opacity: isValid ? 1 : 0.4 }}
            >
              Save Quick Add
            </button>
          </div>
        </div>
      )}

      {/* ── Chips row ───────────────────────────────────────────────────── */}
      {items.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 no-scrollbar">
          {items.map(({ label, ...data }) => (
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
      )}
    </div>
  );
}
