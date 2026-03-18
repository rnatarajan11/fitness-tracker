// ─── Profile ───────────────────────────────────────────────────────────────
export interface UserProfile {
  goalWeightLb:     number;
  dailyCalorieGoal: number;
  dailyProteinGoal: number; // grams
}

// ─── Food ──────────────────────────────────────────────────────────────────
export interface FoodEntry {
  id: string;
  date: string; // ISO YYYY-MM-DD
  time: string; // HH:MM
  name: string;
  calories: number;
  protein: number; // grams
  meal: "breakfast" | "lunch" | "dinner" | "snack";
}

// ─── Weight ────────────────────────────────────────────────────────────────
export interface WeightEntry {
  id: string;
  date: string;   // ISO YYYY-MM-DD
  weightKg: number;
  note?: string;
}

// ─── Workout ───────────────────────────────────────────────────────────────
export type ExerciseCategory = "strength" | "cardio" | "flexibility" | "other";

export interface ExerciseSet {
  reps?: number;
  weightKg?: number;
  durationSec?: number;
  distanceKm?: number;
}

export interface Exercise {
  name: string;
  category: ExerciseCategory;
  sets: ExerciseSet[];
  notes?: string;
}

export interface WorkoutEntry {
  id: string;
  date: string;   // ISO YYYY-MM-DD
  startTime: string;
  durationMin: number;
  exercises: Exercise[];
  notes?: string;
}

// ─── Walks ─────────────────────────────────────────────────────────────────
export interface WalkEntry {
  id: string;
  date: string;      // ISO YYYY-MM-DD
  durationMin: number;
  speedMph?: number; // defaults to 3 if absent
  incline?: number;  // percent grade, optional
}

// ─── Google Sheets API ─────────────────────────────────────────────────────
export type SheetName = "Food" | "Weight" | "Workout" | "Walks" | "Profile";

export interface SheetsResponse<T> {
  data: T[];
  error?: string;
}
