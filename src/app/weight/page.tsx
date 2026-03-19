"use client";

import { useState, useEffect } from "react";
import { weightApi, profileApi } from "@/lib/sheets";
import type { WeightEntry } from "@/lib/types";
import AddWeightModal from "@/components/weight/AddWeightModal";

export default function WeightPage() {
  const [entries,   setEntries]   = useState<WeightEntry[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);
  const [showModal,  setShowModal]  = useState(false);
  const [editEntry,  setEditEntry]  = useState<WeightEntry | null>(null);
  const [goalLb,    setGoalLb]    = useState<number | null>(null);

  useEffect(() => {
    profileApi.get().then((p) => {
      if (p && p.goalWeightLb) setGoalLb(Number(p.goalWeightLb));
    }).catch(() => {});

    weightApi
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

  function handleAdd(entry: WeightEntry) {
    setEntries((prev) =>
      [entry, ...prev].sort((a, b) =>
        String(b.date).slice(0, 10).localeCompare(String(a.date).slice(0, 10))
      )
    );
    setShowModal(false);
    weightApi.add(entry).catch(console.error);
  }

  function handleEdit(updated: WeightEntry) {
    setEntries((prev) =>
      prev.map((e) => (e.id === updated.id ? updated : e)).sort((a, b) =>
        String(b.date).slice(0, 10).localeCompare(String(a.date).slice(0, 10))
      )
    );
    setEditEntry(null);
    weightApi.update(updated).catch(console.error);
  }

  const latest = entries[0];
  const last7  = entries.slice(0, 7);
  const avg7   = last7.length >= 2
    ? last7.reduce((s, e) => s + Number(e.weightKg), 0) / last7.length
    : null;
  const delta  = latest && avg7 !== null ? Number(latest.weightKg) - avg7 : null;

  return (
    <>
      <div className="px-4 pt-4 pb-4 space-y-4">

        {/* Error */}
        {error && (
          <p className="text-center py-6 text-sm" style={{ color: "#f87171" }}>
            {error}
          </p>
        )}

        {/* Skeleton */}
        {loading && !error && (
          <div className="space-y-3 mt-2">
            {[1, 2].map((n) => (
              <div
                key={n}
                className="h-20 rounded-2xl animate-pulse"
                style={{ background: "var(--surface)" }}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && entries.length === 0 && (
          <p
            className="text-center py-10 text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            No weight logged yet.
            <br />
            Tap{" "}
            <strong style={{ color: "var(--text-primary)" }}>+ Log Weight</strong>{" "}
            to get started.
          </p>
        )}

        {/* Hero + avg */}
        {!loading && !error && latest && (
          <>
            {/* Latest weight — large hero */}
            <div className="flex flex-col items-center pt-6 pb-2 gap-2">
              <div className="flex items-end gap-2 leading-none">
                <span
                  className="font-bold tabular-nums"
                  style={{ fontSize: "6rem", lineHeight: 1, color: "var(--text-primary)" }}
                >
                  {Number(latest.weightKg).toFixed(1)}
                </span>
                <span
                  className="text-2xl font-semibold pb-3"
                  style={{ color: "var(--text-secondary)" }}
                >
                  lb
                </span>
                <button
                  onClick={() => setEditEntry(latest)}
                  className="pb-3 active:opacity-60 transition-opacity"
                  aria-label="Edit today's weight"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
              </div>

              {/* Delta vs 7-day avg */}
              {delta !== null && (
                <span
                  className="text-base font-semibold"
                  style={{
                    color:
                      delta < 0 ? "#34d399" :
                      delta > 0 ? "#f87171" :
                      "var(--text-secondary)",
                  }}
                >
                  {delta > 0 ? "+" : ""}
                  {delta.toFixed(1)} lb vs recent avg
                </span>
              )}
            </div>

            {/* 7-day average pill */}
            {avg7 !== null && (
              <div
                className="rounded-2xl px-4 py-3.5 flex items-center justify-between"
                style={{ background: "var(--surface)" }}
              >
                <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  recent average
                </span>
                <span
                  className="text-base font-semibold tabular-nums"
                  style={{ color: "var(--text-primary)" }}
                >
                  {avg7.toFixed(1)} lb
                </span>
              </div>
            )}

            {/* To goal pill */}
            {avg7 !== null && goalLb !== null && (
              <div
                className="rounded-2xl px-4 py-3.5 flex items-center justify-between"
                style={{ background: "var(--surface)" }}
              >
                <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  to goal ({goalLb} lb)
                </span>
                <span
                  className="text-base font-semibold tabular-nums"
                  style={{
                    color: avg7 <= goalLb ? "#34d399" : "var(--text-primary)",
                  }}
                >
                  {avg7 <= goalLb
                    ? "Goal reached!"
                    : `${(avg7 - goalLb).toFixed(1)} lb to go`}
                </span>
              </div>
            )}
          </>
        )}

        <div style={{ height: "72px" }} />
      </div>

      {/* Fixed Log Weight button */}
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
          Log Weight
        </button>
      </div>

      {showModal && (
        <AddWeightModal
          onClose={() => setShowModal(false)}
          onAdd={handleAdd}
        />
      )}

      {editEntry && (
        <AddWeightModal
          entry={editEntry}
          onClose={() => setEditEntry(null)}
          onEdit={handleEdit}
        />
      )}
    </>
  );
}
