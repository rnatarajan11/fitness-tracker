"use client";

import { useState, useEffect } from "react";
import { workoutApi } from "@/lib/sheets";
import type { WorkoutEntry } from "@/lib/types";
import AddWorkoutModal from "@/components/workout/AddWorkoutModal";

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export default function WorkoutPage() {
  const [entries,    setEntries]    = useState<WorkoutEntry[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [showModal,  setShowModal]  = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    workoutApi
      .getAll()
      .then((all) => {
        setEntries(
          [...all].sort((a, b) =>
            String(b.date).slice(0, 10).localeCompare(String(a.date).slice(0, 10))
          )
        );
      })
      .catch((err: unknown) => setError(String(err)))
      .finally(() => setLoading(false));
  }, []);

  function handleAdd(entry: WorkoutEntry) {
    setEntries((prev) => [entry, ...prev]);
    setShowModal(false);
    workoutApi.add(entry).catch(console.error);
  }

  function handleDelete(id: string) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    setExpandedId(null);
    workoutApi.delete(id).catch(console.error);
  }

  return (
    <>
      <div className="px-4 pt-4 pb-4 space-y-3">

        {error && (
          <p className="text-center py-6 text-sm" style={{ color: "#f87171" }}>{error}</p>
        )}

        {loading && !error && (
          <div className="space-y-3 mt-2">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-20 rounded-2xl animate-pulse" style={{ background: "var(--surface)" }} />
            ))}
          </div>
        )}

        {!loading && !error && entries.length === 0 && (
          <p className="text-center py-10 text-sm" style={{ color: "var(--text-secondary)" }}>
            No workouts logged yet.
            <br />
            Tap <strong style={{ color: "var(--text-primary)" }}>+ Log Workout</strong> to get started.
          </p>
        )}

        {!loading && !error && entries.length > 0 && entries.map((entry) => {
          const isExpanded = expandedId === entry.id;
          const exCount = Array.isArray(entry.exercises) ? entry.exercises.length : 0;

          return (
            <div
              key={entry.id}
              className="rounded-2xl overflow-hidden"
              style={{ background: "var(--surface)" }}
            >
              {/* Row */}
              <button
                className="w-full flex items-center px-4 py-3.5 text-left active:opacity-70 transition-opacity"
                style={{ background: isExpanded ? "var(--surface-2)" : "transparent" }}
                onClick={() => setExpandedId(isExpanded ? null : entry.id)}
              >
                {/* Icon */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mr-3 flex-none"
                  style={{ background: "rgba(99,102,241,0.15)" }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 5v14M18 5v14M6 12h12" />
                  </svg>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                    {entry.notes || "Workout"}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                    {formatDate(String(entry.date).slice(0, 10))}
                    {exCount > 0 && ` · ${exCount} exercise${exCount !== 1 ? "s" : ""}`}
                  </div>
                </div>

                <svg
                  width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                  style={{
                    color: "var(--text-secondary)",
                    flexShrink: 0,
                    transform: isExpanded ? "rotate(180deg)" : "none",
                    transition: "transform 0.2s",
                  }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {/* Expanded detail */}
              {isExpanded && (
                <div style={{ borderTop: "1px solid var(--border)" }}>
                  {Array.isArray(entry.exercises) && entry.exercises.length > 0 && (
                    <div className="px-4 pt-3 pb-2 space-y-2">
                      {entry.exercises.map((ex, i) => (
                        <div key={i} className="rounded-xl p-3" style={{ background: "var(--surface-2)" }}>
                          <div className="text-sm font-semibold mb-1.5" style={{ color: "var(--text-primary)" }}>
                            {ex.name}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {ex.sets.map((s, si) => {
                              const parts = [
                                s.reps != null     && `${s.reps} reps`,
                                s.weightKg != null && `${s.weightKg} lb`,
                              ].filter(Boolean);
                              return (
                                <span
                                  key={si}
                                  className="text-xs px-2 py-0.5 rounded-lg tabular-nums"
                                  style={{ background: "var(--surface)", color: "var(--text-secondary)" }}
                                >
                                  {parts.join(" · ") || "—"}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2 px-4 py-3">
                    <button
                      onClick={() => setExpandedId(null)}
                      className="flex-1 py-2.5 rounded-xl text-sm font-medium active:opacity-70"
                      style={{ background: "var(--surface-2)", color: "var(--text-primary)" }}
                    >
                      Keep
                    </button>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="flex-1 py-2.5 rounded-xl text-sm font-medium active:opacity-70"
                      style={{ background: "rgba(239,68,68,0.15)", color: "#f87171" }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        <div style={{ height: "72px" }} />
      </div>

      {/* Fixed Log Workout button */}
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
          onClick={() => setShowModal(true)}
          className="w-full py-3.5 rounded-2xl font-semibold text-white flex items-center justify-center gap-2 active:scale-95 transition-transform"
          style={{ background: "var(--accent)" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Log Workout
        </button>
      </div>

      {showModal && (
        <AddWorkoutModal
          onClose={() => setShowModal(false)}
          onAdd={handleAdd}
        />
      )}
    </>
  );
}
