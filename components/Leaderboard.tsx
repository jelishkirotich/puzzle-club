"use client";

import { useEffect, useState } from "react";

type Entry = { id: string; solver: string; timeSeconds: number };

function formatTime(total: number) {
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

export default function Leaderboard({
  puzzleId,
  name,
  refreshKey,
}: {
  puzzleId: string;
  name: string;
  refreshKey: number;
}) {
  const [entries, setEntries] = useState<Entry[] | null>(null);

  useEffect(() => {
    let active = true;

    fetch(`/api/puzzles/${puzzleId}/leaderboard`, { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : { entries: [] }))
      .then((data) => {
        if (active) setEntries(data.entries);
      })
      .catch(() => {
        if (active) setEntries([]);
      });

    return () => {
      active = false;
    };
  }, [puzzleId, refreshKey]);

  const me = name.trim().toLowerCase();

  return (
    <section className="rounded-[2rem] border border-line bg-paper p-6">
      <h2 className="text-2xl font-bold">Fastest solvers</h2>

      {entries === null && (
        <div className="mt-5 animate-pulse space-y-3">
          <div className="h-11 rounded-2xl bg-sand/70" />
          <div className="h-11 rounded-2xl bg-sand/70" />
        </div>
      )}

      {entries !== null && entries.length === 0 && (
        <p className="mt-4 text-[15px] text-muted">
          No times yet. Yours could be the first.
        </p>
      )}

      {entries !== null && entries.length > 0 && (
        <ol className="mt-5 space-y-2">
          {entries.map((entry, index) => (
            <li
              key={entry.id}
              className={`flex items-center gap-3 rounded-2xl px-4 py-2.5 ${
                entry.solver.toLowerCase() === me ? "bg-sage" : "bg-cream"
              }`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  index === 0 ? "bg-clay text-paper" : "bg-sand text-ink"
                }`}
              >
                {index + 1}
              </span>
              <span className="min-w-0 flex-1 truncate text-[15px] font-bold">
                {entry.solver}
              </span>
              <span className="font-display text-lg font-bold tabular-nums">
                {formatTime(entry.timeSeconds)}
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}