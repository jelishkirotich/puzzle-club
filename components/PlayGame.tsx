"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Leaderboard from "./Leaderboard";
import SudokuPlay from "./SudokuPlay";
import { useToast } from "./Toaster";
import { useDisplayName } from "@/lib/useDisplayName";
import type { Difficulty } from "@/lib/puzzles";
import type { SudokuSize } from "@/lib/sudoku";

type Props = {
  size: SudokuSize;
  level: Difficulty;
  seed: number;
  grid: string[];
  daily?: { key: string; label: string };
};

export default function PlayGame({ size, level, seed, grid, daily }: Props) {
  const toast = useToast();
  const [name, setName] = useDisplayName();
  const [refreshKey, setRefreshKey] = useState(0);
  const [solved, setSolved] = useState(false);

  function handleSolved() {
    setSolved(true);
    setRefreshKey((key) => key + 1);
    toast(daily ? "Solved. Your time is on the board." : "Solved. Lovely work.", "good");
  }

  const again = `/play/start?size=${size}&level=${level}`;

  return (
    <div className="pt-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/play"
          className="inline-flex items-center gap-2 text-[15px] font-bold text-muted transition hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" />
          All puzzles
        </Link>
        {!daily && (
          <a
            href={again}
            className="rounded-full border border-line bg-paper px-5 py-2.5 text-sm font-bold transition hover:border-forest-soft"
          >
            New puzzle
          </a>
        )}
      </div>

      <h1 className="mt-6 text-3xl font-bold sm:text-4xl md:text-5xl">
        {daily ? "Today\u2019s puzzle" : `${size} by ${size}, ${level}`}
      </h1>
      <p className="mt-2 text-muted">
        {daily ? `${daily.label}. ${size} by ${size}, ${level}.` : "One solution, no guessing needed."}
      </p>

      <div
        className={`mt-8 grid gap-6 ${
          daily ? "lg:grid-cols-[minmax(0,1fr)_380px]" : ""
        }`}
      >
        <section className="rounded-[2rem] border border-line bg-paper p-5 sm:p-6 md:p-8">
          {daily && (
            <div className="mb-6 max-w-xs">
              <label htmlFor="player" className="mb-2 block text-[15px] font-bold">
                Your display name
              </label>
              <input
                id="player"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="What should we call you?"
                maxLength={30}
                className="h-12 w-full rounded-2xl border border-line bg-paper px-4 text-[15px] outline-none transition placeholder:text-muted/70 focus:border-forest-soft"
              />
            </div>
          )}

          <SudokuPlay
            endpoint="/api/play/check"
            extra={{ size, level, seed, ...(daily ? { daily: daily.key } : {}) }}
            requireName={Boolean(daily)}
            size={size}
            grid={grid}
            name={name}
            onSolved={handleSolved}
          />

          {solved && !daily && (
            <a
              href={again}
              className="mt-6 inline-flex rounded-full bg-forest-soft px-7 py-3.5 text-[15px] font-bold text-paper transition hover:bg-forest"
            >
              Play another
            </a>
          )}
        </section>

        {daily && (
          <Leaderboard
            endpoint={`/api/play/daily?date=${daily.key}`}
            name={name}
            refreshKey={refreshKey}
          />
        )}
      </div>
    </div>
  );
}