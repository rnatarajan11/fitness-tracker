/**
 * Google Sheets client — routes through /api/sheets (server-side proxy)
 * to avoid CORS issues with Google Apps Script.
 */

import type {
  FoodEntry,
  WeightEntry,
  WorkoutEntry,
  WalkEntry,
  UserProfile,
  SheetName,
} from "./types";

// Always use the local proxy route (works from any client component)
const BASE = "/api/sheets";

async function gasGet<T>(
  action: string,
  params: Record<string, unknown> = {}
): Promise<T> {
  const qs = new URLSearchParams({
    action,
    payload: JSON.stringify(params),
  });
  const res = await fetch(`${BASE}?${qs}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Sheets proxy error: ${res.status}`);
  const json = await res.json();
  if (json?.error) throw new Error(json.error);
  return json as T;
}

async function gasPost<T>(
  action: string,
  payload: Record<string, unknown>
): Promise<T> {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...payload }),
  });
  if (!res.ok) throw new Error(`Sheets proxy error: ${res.status}`);
  const json = await res.json();
  if (json?.error) throw new Error(json.error);
  return json as T;
}

// ─── Generic helpers ────────────────────────────────────────────────────────

export async function getRows<T>(sheet: SheetName): Promise<T[]> {
  return gasGet<T[]>("getRows", { sheet });
}

export async function appendRow<T extends { id: string }>(
  sheet: SheetName,
  row: T
): Promise<void> {
  return gasPost("appendRow", { sheet, row });
}

export async function updateRow<T extends { id: string }>(
  sheet: SheetName,
  row: T
): Promise<void> {
  return gasPost("updateRow", { sheet, row });
}

export async function deleteRow(sheet: SheetName, id: string): Promise<void> {
  return gasPost("deleteRow", { sheet, id });
}

// ─── Typed helpers ──────────────────────────────────────────────────────────

export const foodApi = {
  getAll: () => getRows<FoodEntry>("Food"),
  add: (entry: FoodEntry) => appendRow("Food", entry),
  update: (entry: FoodEntry) => updateRow("Food", entry),
  delete: (id: string) => deleteRow("Food", id),
};

export const weightApi = {
  getAll: () => getRows<WeightEntry>("Weight"),
  add: (entry: WeightEntry) => appendRow("Weight", entry),
  update: (entry: WeightEntry) => updateRow("Weight", entry),
  delete: (id: string) => deleteRow("Weight", id),
};

export const workoutApi = {
  getAll: () => getRows<WorkoutEntry>("Workout"),
  add: (entry: WorkoutEntry) => appendRow("Workout", entry),
  update: (entry: WorkoutEntry) => updateRow("Workout", entry),
  delete: (id: string) => deleteRow("Workout", id),
};

export const walksApi = {
  getAll: () => getRows<WalkEntry>("Walks"),
  add: (entry: WalkEntry) => appendRow("Walks", entry),
  update: (entry: WalkEntry) => updateRow("Walks", entry),
  delete: (id: string) => deleteRow("Walks", id),
};

export const profileApi = {
  get: async (): Promise<UserProfile | null> => {
    const rows = await getRows<UserProfile>("Profile");
    return rows[0] ?? null;
  },
  save: (profile: UserProfile) =>
    gasPost("saveProfile", { sheet: "Profile", row: profile }),
};
