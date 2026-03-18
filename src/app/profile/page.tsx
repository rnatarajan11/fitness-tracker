"use client";

import { useState, useEffect } from "react";
import { profileApi } from "@/lib/sheets";
import type { UserProfile } from "@/lib/types";

const DEFAULTS: UserProfile = {
  goalWeightLb:     175,
  dailyCalorieGoal: 2000,
  dailyProteinGoal: 150,
};

export default function ProfilePage() {
  const [form,    setForm]    = useState<UserProfile>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    profileApi
      .get()
      .then((p) => { if (p) setForm(p as UserProfile); })
      .catch((err: unknown) => setError(String(err)))
      .finally(() => setLoading(false));
  }, []);

  function field(key: keyof UserProfile, val: string) {
    setForm((f) => ({ ...f, [key]: Number(val) || 0 }));
    setSaved(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await profileApi.save(form);
      setSaved(true);
    } catch (err: unknown) {
      setError(String(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="px-4 pt-6 space-y-4">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="h-14 rounded-xl animate-pulse" style={{ background: "var(--surface)" }} />
        ))}
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="px-4 pt-4 pb-32 space-y-5">

      {/* Avatar */}
      <div className="flex justify-center pt-2 pb-1">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold"
          style={{ background: "var(--accent)", color: "#fff" }}
        >
          RN
        </div>
      </div>

      {error && (
        <p className="text-sm rounded-xl px-4 py-3" style={{ background: "rgba(239,68,68,0.12)", color: "#f87171" }}>
          {error}
        </p>
      )}

      {/* Weight target */}
      <div>
        <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--text-secondary)" }}>
          Weight target (lb)
        </label>
        <input
          type="number"
          inputMode="decimal"
          step="0.1"
          value={form.goalWeightLb || ""}
          onChange={(e) => field("goalWeightLb", e.target.value)}
          className="w-full rounded-xl px-4 py-3 text-base outline-none"
          style={{ background: "var(--surface)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
        />
      </div>

      {/* Daily calorie goal */}
      <div>
        <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--text-secondary)" }}>
          Daily calorie goal (kcal)
        </label>
        <input
          type="number"
          inputMode="numeric"
          value={form.dailyCalorieGoal || ""}
          onChange={(e) => field("dailyCalorieGoal", e.target.value)}
          className="w-full rounded-xl px-4 py-3 text-base outline-none"
          style={{ background: "var(--surface)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
        />
      </div>

      {/* Protein goal */}
      <div>
        <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--text-secondary)" }}>
          Daily protein goal (g)
        </label>
        <div className="relative">
          <input
            type="number"
            inputMode="numeric"
            value={form.dailyProteinGoal || ""}
            onChange={(e) => field("dailyProteinGoal", e.target.value)}
            className="w-full rounded-xl px-4 py-3 text-base outline-none"
            style={{ background: "var(--surface)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm pointer-events-none" style={{ color: "var(--text-secondary)" }}>g</span>
        </div>
      </div>

      {/* Save button */}
      <div
        className="fixed left-0 right-0 z-40 px-4"
        style={{
          bottom: "calc(var(--tab-bar-height) + env(safe-area-inset-bottom, 0px))",
          paddingBottom: "10px",
          background: "linear-gradient(to top, var(--background) 60%, transparent)",
          paddingTop: "16px",
        }}
      >
        <button
          type="submit"
          disabled={saving}
          className="w-full py-3.5 rounded-2xl font-semibold text-white active:scale-95 transition-all"
          style={{
            background: saved ? "#34d399" : "var(--accent)",
            opacity: saving ? 0.6 : 1,
            transition: "background 0.3s, opacity 0.2s, transform 0.1s",
          }}
        >
          {saving ? "Saving…" : saved ? "✓ Saved" : "Save"}
        </button>
      </div>
    </form>
  );
}
