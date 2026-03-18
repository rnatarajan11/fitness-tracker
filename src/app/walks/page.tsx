"use client";

import { useState, useEffect, useMemo } from "react";
import { walksApi } from "@/lib/sheets";
import type { WalkEntry } from "@/lib/types";
import AddWalkModal from "@/components/walks/AddWalkModal";

function todayISO() { return new Date().toLocaleDateString("en-CA"); }

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (d.getTime() === today.getTime()) return "Today";
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export default function WalksPage() {
  const [entries,    setEntries]    = useState<WalkEntry[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [showModal,  setShowModal]  = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    walksApi
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

  function handleAdd(entry: WalkEntry) {
    setEntries((prev) =>
      [entry, ...prev].sort((a, b) =>
        String(b.date).slice(0, 10).localeCompare(String(a.date).slice(0, 10))
      )
    );
    setShowModal(false);
    walksApi.add(entry).catch(console.error);
  }

  function handleDelete(id: string) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    setExpandedId(null);
    walksApi.delete(id).catch(console.error);
  }

  const today = todayISO();
  const todayEntries = useMemo(
    () => entries.filter((e) => String(e.date).slice(0, 10) === today),
    [entries, today]
  );
  const todaySteps    = todayEntries.reduce((s, e) => s + Number(e.steps), 0);
  const todayDistance = todayEntries.reduce((s, e) => s + Number(e.distanceKm), 0);
  const todayDuration = todayEntries.reduce((s, e) => s + Number(e.durationMin), 0);

  return (
    <>
      <div className="px-4 pt-4 pb-4 space-y-4">

        {error && (
          <p className="text-center py-6 text-sm" style={{ color: "#f87171" }}>{error}</p>
        )}

        {loading && !error && (
          <div className="space-y-3 mt-2">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-16 rounded-2xl animate-pulse" style={{ background: "var(--surface)" }} />
            ))}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Today's step hero */}
            <div className="flex flex-col items-center pt-4 pb-2 gap-1">
              <span
                className="font-bold tabular-nums"
                style={{ fontSize: "5rem", lineHeight: 1, color: "var(--text-primary)" }}
              >
                {todaySteps.toLocaleString()}
              </span>
              <span className="text-base" style={{ color: "var(--text-secondary)" }}>
                steps today
              </span>
            </div>

            {/* Today's stats — only show if something logged */}
            {todayEntries.length > 0 && (
              <div className="flex gap-3">
                {todayDistance > 0 && (
                  <div
                    className="flex-1 rounded-2xl p-3 text-center"
                    style={{ background: "var(--surface)" }}
                  >
                    <div className="text-xl font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>
                      {todayDistance.toFixed(2)}
                    </div>
                    <div className="text-xs" style={{ color: "var(--text-secondary)" }}>mi today</div>
                  </div>
                )}
                {todayDuration > 0 && (
                  <div
                    className="flex-1 rounded-2xl p-3 text-center"
                    style={{ background: "var(--surface)" }}
                  >
                    <div className="text-xl font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>
                      {todayDuration}
                    </div>
                    <div className="text-xs" style={{ color: "var(--text-secondary)" }}>min today</div>
                  </div>
                )}
              </div>
            )}

            {/* Empty state */}
            {entries.length === 0 && (
              <p className="text-center py-6 text-sm" style={{ color: "var(--text-secondary)" }}>
                No walks logged yet.
                <br />
                Tap <strong style={{ color: "var(--text-primary)" }}>+ Log Walk</strong> to get started.
              </p>
            )}

            {/* Walk history */}
            {entries.length > 0 && (
              <div>
                <h3
                  className="text-xs font-semibold mb-2 px-1"
                  style={{ color: "var(--text-secondary)" }}
                >
                  History
                </h3>
                <div className="rounded-2xl overflow-hidden" style={{ background: "var(--surface)" }}>
                  {entries.map((entry, idx) => {
                    const isExpanded = expandedId === entry.id;
                    const prevExpanded = idx > 0 && expandedId === entries[idx - 1].id;
                    const label = formatDate(String(entry.date).slice(0, 10));
                    const isToday = label === "Today";

                    const meta = [
                      Number(entry.durationMin) > 0 && `${entry.durationMin} min`,
                      Number(entry.distanceKm)  > 0 && `${Number(entry.distanceKm).toFixed(2)} mi`,
                      entry.route,
                    ].filter(Boolean).join(" · ");

                    return (
                      <div key={entry.id}>
                        {idx > 0 && !isExpanded && !prevExpanded && (
                          <div className="mx-4 h-px" style={{ background: "var(--border)" }} />
                        )}
                        <button
                          className="w-full flex items-center px-4 py-3.5 text-left active:opacity-70 transition-opacity"
                          style={{ background: isExpanded ? "var(--surface-2)" : "transparent" }}
                          onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                        >
                          <div className="flex-1">
                            <div className="text-base font-semibold tabular-nums" style={{ color: "var(--text-primary)" }}>
                              {Number(entry.steps).toLocaleString()} steps
                            </div>
                            {meta && (
                              <div className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                                {meta}
                              </div>
                            )}
                          </div>
                          <div
                            className="text-sm ml-3 flex-none"
                            style={{ color: isToday ? "var(--accent)" : "var(--text-secondary)" }}
                          >
                            {label}
                          </div>
                        </button>

                        {isExpanded && (
                          <div
                            className="flex gap-2 px-4 py-2.5"
                            style={{ borderTop: "1px solid var(--border)" }}
                          >
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
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        <div style={{ height: "72px" }} />
      </div>

      {/* Fixed Log Walk button */}
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
          Log Walk
        </button>
      </div>

      {showModal && (
        <AddWalkModal
          onClose={() => setShowModal(false)}
          onAdd={handleAdd}
        />
      )}
    </>
  );
}
