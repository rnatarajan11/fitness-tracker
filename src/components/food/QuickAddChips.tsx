"use client";

import type { FoodEntry } from "@/lib/types";

type QuickItem = Omit<Partial<FoodEntry>, "meal"> & {
  label: string;
  meal: FoodEntry["meal"];
};

const QUICK_ADD: QuickItem[] = [
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

interface Props {
  onSelect: (data: Partial<FoodEntry>) => void;
}

export default function QuickAddChips({ onSelect }: Props) {
  return (
    <div>
      <h3
        className="text-sm font-semibold mb-2"
        style={{ color: "var(--text-secondary)" }}
      >
        Quick Add
      </h3>
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 no-scrollbar">
        {QUICK_ADD.map(({ label, ...data }) => (
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
