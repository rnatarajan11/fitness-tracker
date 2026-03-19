"use client";

import { useState } from "react";
import type { WorkoutEntry, Exercise, ExerciseSet } from "@/lib/types";

function todayISO() { return new Date().toLocaleDateString("en-CA"); }
function nowTime()  { return new Date().toTimeString().slice(0, 5); }
function newId() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

interface SetDraft { reps: string; weight: string; }
interface ExEntry  { name: string; sets: SetDraft[]; }

interface Props {
  onClose: () => void;
  onAdd: (entry: WorkoutEntry) => void;
}

export default function AddWorkoutModal({ onClose, onAdd }: Props) {
  // ── Step 1 ────────────────────────────────────────────────────────────────
  const [step, setStep] = useState<1 | 2>(1);
  const [meta, setMeta] = useState({
    date: todayISO(),
    name: "",
  });

  // ── Step 2 ────────────────────────────────────────────────────────────────
  const [exercises,   setExercises]   = useState<ExEntry[]>([]);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [newSetDraft, setNewSetDraft] = useState<SetDraft>({ reps: "", weight: "" });
  const [addingEx,    setAddingEx]    = useState(false);
  const [newExName,   setNewExName]   = useState("");
  const [submitting,  setSubmitting]  = useState(false);

  function metaField(key: keyof typeof meta, val: string) {
    setMeta((m) => ({ ...m, [key]: val }));
  }

  // ── Exercise management ───────────────────────────────────────────────────
  function confirmNewExercise() {
    const name = newExName.trim();
    if (!name) return;
    setExercises((prev) => [...prev, { name, sets: [] }]);
    setNewExName("");
    setAddingEx(false);
    setExpandedIdx(exercises.length); // auto-expand the new one
  }

  function removeExercise(i: number) {
    setExercises((prev) => prev.filter((_, idx) => idx !== i));
    setExpandedIdx(null);
  }

  function toggleExpand(i: number) {
    if (expandedIdx === i) {
      setExpandedIdx(null);
      setNewSetDraft({ reps: "", weight: "" });
    } else {
      setExpandedIdx(i);
      setNewSetDraft({ reps: "", weight: "" });
    }
  }

  // ── Set management ────────────────────────────────────────────────────────
  function addSet(exIdx: number) {
    const { reps, weight } = newSetDraft;
    if (!reps && !weight) return;
    setExercises((prev) =>
      prev.map((ex, i) =>
        i === exIdx ? { ...ex, sets: [...ex.sets, { reps, weight }] } : ex
      )
    );
    setNewSetDraft({ reps: "", weight: "" });
  }

  function removeSet(exIdx: number, setIdx: number) {
    setExercises((prev) =>
      prev.map((ex, i) =>
        i === exIdx ? { ...ex, sets: ex.sets.filter((_, si) => si !== setIdx) } : ex
      )
    );
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  function handleSubmit() {
    if (submitting) return;
    setSubmitting(true);
    const entry: WorkoutEntry = {
      id:          newId(),
      date:        meta.date,
      startTime:   "",
      durationMin: 0,
      notes:       meta.name.trim() || undefined,
      exercises:   exercises.map((ex): Exercise => ({
        name:     ex.name,
        category: "strength",
        sets:     ex.sets
          .filter((s) => s.reps || s.weight)
          .map((s): ExerciseSet => ({
            reps:     s.reps   ? Number(s.reps)   : undefined,
            weightKg: s.weight ? Number(s.weight) : undefined,
          })),
      })),
    };
    onAdd(entry);
  }

  const metaValid = meta.name.trim().length > 0;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col justify-end">
      <div
        className="absolute inset-0"
        style={{ background: "rgba(0,0,0,0.65)" }}
        onClick={onClose}
      />
      <div
        className="relative rounded-t-3xl flex flex-col"
        style={{ background: "var(--surface)", maxHeight: "92dvh" }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 flex-none">
          <div className="w-10 h-1 rounded-full" style={{ background: "var(--border)" }} />
        </div>

        {/* Header */}
        <div className="flex items-center px-5 py-3 flex-none" style={{ borderBottom: "1px solid var(--border)" }}>
          {step === 2 && (
            <button
              onClick={() => setStep(1)}
              className="text-sm mr-3 active:opacity-60"
              style={{ color: "var(--accent)" }}
            >
              ← Back
            </button>
          )}
          <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
            {step === 1 ? "Log Workout" : "Add Exercises"}
          </h2>
          {step === 2 ? (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="ml-auto px-5 py-2 rounded-xl font-semibold text-sm text-white transition-opacity"
              style={{ background: "var(--accent)", opacity: submitting ? 0.45 : 1 }}
            >
              {submitting ? "Saving…" : "Log"}
            </button>
          ) : (
            <span className="ml-auto text-xs" style={{ color: "var(--text-secondary)" }}>1 / 2</span>
          )}
        </div>

        {/* ── Step 1 ── */}
        {step === 1 && (
          <div className="overflow-y-auto flex-1 px-5 pb-10">
            <div className="mb-4">
              <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--text-secondary)" }}>
                Workout name
              </label>
              <input
                type="text"
                placeholder="Push day, leg day…"
                value={meta.name}
                onChange={(e) => metaField("name", e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && metaValid) setStep(2); }}
                autoFocus
                className="w-full rounded-xl px-4 py-3 text-base outline-none"
                style={{ background: "var(--surface-2)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
              />
            </div>

            <div className="mb-7">
              <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--text-secondary)" }}>Date</label>
              <input
                type="date"
                value={meta.date}
                onChange={(e) => metaField("date", e.target.value)}
                className="w-full rounded-xl px-4 py-2.5 text-base outline-none"
                style={{ background: "var(--surface-2)", color: "var(--text-primary)", border: "1px solid var(--border)", colorScheme: "dark" }}
              />
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!metaValid}
              className="w-full py-4 rounded-2xl font-semibold text-white transition-opacity"
              style={{ background: "var(--accent)", opacity: metaValid ? 1 : 0.45 }}
            >
              Next → Add Exercises
            </button>
          </div>
        )}

        {/* ── Step 2 ── */}
        {step === 2 && (
          <>
          {/* Pinned top: add exercise */}
          <div className="flex-none px-5 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
            {addingEx ? (
              <div className="rounded-2xl p-4" style={{ background: "var(--surface-2)", border: "1px solid var(--accent)" }}>
                <input type="text" placeholder="Exercise name" value={newExName}
                  onChange={(e) => setNewExName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); confirmNewExercise(); } }}
                  autoFocus
                  className="w-full rounded-xl px-3 py-2.5 text-base outline-none mb-3"
                  style={{ background: "var(--surface)", color: "var(--text-primary)", border: "1px solid var(--border)" }} />
                <div className="flex gap-2">
                  <button onClick={() => { setAddingEx(false); setNewExName(""); }}
                    className="flex-1 py-2.5 rounded-xl text-sm"
                    style={{ background: "var(--surface)", color: "var(--text-secondary)" }}>
                    Cancel
                  </button>
                  <button onClick={confirmNewExercise} disabled={!newExName.trim()}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-opacity"
                    style={{ background: "var(--accent)", color: "#fff", opacity: newExName.trim() ? 1 : 0.45 }}>
                    Add
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setAddingEx(true)}
                className="w-full py-3.5 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 active:opacity-70"
                style={{ background: "var(--surface-2)", color: "var(--accent)", border: "1px dashed var(--accent)" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                + Add Exercise
              </button>
            )}
          </div>

          {/* Scrollable exercise list */}
          <div className="overflow-y-auto flex-1 px-5 pt-3 pb-2">
            {exercises.length === 0 && !addingEx && (
              <p className="text-center py-6 text-sm" style={{ color: "var(--text-secondary)" }}>
                Add an exercise above to get started.
              </p>
            )}

            {exercises.map((ex, i) => {
              const isOpen = expandedIdx === i;
              return (
                <div
                  key={i}
                  className="rounded-2xl overflow-hidden mb-2"
                  style={{ background: "var(--surface-2)" }}
                >
                  {/* Exercise header */}
                  <button
                    className="w-full flex items-center px-4 py-3 text-left active:opacity-70"
                    onClick={() => toggleExpand(i)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                        {ex.name}
                      </div>
                      {ex.sets.length > 0 ? (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {ex.sets.map((s, si) => (
                            <span key={si} className="text-xs px-2 py-0.5 rounded-lg tabular-nums"
                              style={{ background: "var(--surface)", color: "var(--text-secondary)" }}>
                              {[s.reps && `${s.reps}×`, s.weight && `${s.weight} lb`].filter(Boolean).join(" ")}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>Tap to log sets</div>
                      )}
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                      style={{ color: "var(--text-secondary)", flexShrink: 0, marginLeft: 8,
                        transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>

                  {/* Expanded: sets + log-set form */}
                  {isOpen && (
                    <div style={{ borderTop: "1px solid var(--border)" }}>
                      {ex.sets.map((s, si) => (
                        <div key={si} className="flex items-center px-4 py-2.5 gap-3"
                          style={{ borderBottom: "1px solid var(--border)" }}>
                          <span className="text-xs w-5 text-center tabular-nums flex-none" style={{ color: "var(--text-secondary)" }}>
                            {si + 1}
                          </span>
                          <span className="flex-1 text-sm tabular-nums" style={{ color: "var(--text-primary)" }}>
                            {[s.reps && `${s.reps} reps`, s.weight && `${s.weight} lb`].filter(Boolean).join("  ·  ")}
                          </span>
                          <button onClick={() => removeSet(i, si)}
                            className="w-7 h-7 flex-none rounded-lg flex items-center justify-center"
                            style={{ color: "#f87171", background: "rgba(248,113,113,0.1)" }}>
                            ×
                          </button>
                        </div>
                      ))}

                      {/* Log set row */}
                      <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
                        <p className="text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Log set</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <input type="number" inputMode="numeric" placeholder="Reps"
                              value={newSetDraft.reps}
                              onChange={(e) => setNewSetDraft((d) => ({ ...d, reps: e.target.value }))}
                              className="w-full rounded-xl px-3 py-3 text-base text-center outline-none"
                              style={{ background: "var(--surface)", color: "var(--text-primary)", border: "1px solid var(--border)" }} />
                          </div>
                          <div className="flex-1">
                            <input type="number" inputMode="decimal" placeholder="Weight (lb)"
                              value={newSetDraft.weight}
                              onChange={(e) => setNewSetDraft((d) => ({ ...d, weight: e.target.value }))}
                              className="w-full rounded-xl px-3 py-3 text-base text-center outline-none"
                              style={{ background: "var(--surface)", color: "var(--text-primary)", border: "1px solid var(--border)" }} />
                          </div>
                          <button onClick={() => addSet(i)}
                            disabled={!newSetDraft.reps && !newSetDraft.weight}
                            className="px-4 py-3 rounded-xl font-semibold text-sm transition-opacity"
                            style={{ background: "var(--accent)", color: "#fff",
                              opacity: newSetDraft.reps || newSetDraft.weight ? 1 : 0.4 }}>
                            Add
                          </button>
                        </div>
                      </div>

                      <div className="px-4 py-2.5">
                        <button onClick={() => removeExercise(i)} className="text-xs active:opacity-60"
                          style={{ color: "#f87171" }}>
                          Remove exercise
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          </>
        )}
      </div>
    </div>
  );
}
