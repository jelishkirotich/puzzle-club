"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Chat from "./Chat";
import SudokuPlay from "./SudokuPlay";
import WordSearchPlay from "./WordSearchPlay";
import { useDisplayName } from "@/lib/useDisplayName";
import type { Difficulty, PuzzleDetail } from "@/lib/puzzles";
import type { SudokuSize } from "@/lib/sudoku";

const difficultyStyle: Record<Difficulty, string> = {
  Easy: "bg-sage text-forest-soft",
  Medium: "bg-[#f5e9d0] text-gold-text",
  Hard: "bg-clay-soft text-clay",
};

export default function PuzzleView({ puzzle }: { puzzle: PuzzleDetail }) {
  const [name, setName] = useDisplayName();

  return (
    <div className="pt-4">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-[15px] font-bold text-muted transition hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to shelf
      </Link>

      <div className="mt-6 flex flex-wrap gap-2">
        <span className="rounded-full bg-sand px-3 py-1 text-xs font-bold text-ink">
          {puzzle.kind === "sudoku" ? "Sudoku" : "Word Search"}
        </span>
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${difficultyStyle[puzzle.difficulty]}`}
        >
          {puzzle.difficulty}
        </span>
      </div>

      <h1 className="mt-4 text-4xl font-bold leading-tight md:text-5xl">
        {puzzle.title}
      </h1>
      {puzzle.note && (
        <p className="mt-3 max-w-2xl text-lg text-muted">{puzzle.note}</p>
      )}
      <p className="mt-3 text-[15px] text-muted">by {puzzle.author}</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <section className="rounded-[2rem] border border-line bg-paper p-6 md:p-8">
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

          {puzzle.kind === "sudoku" ? (
            <SudokuPlay
              puzzleId={puzzle.id}
              size={puzzle.size as SudokuSize}
              grid={puzzle.grid}
              name={name}
            />
          ) : (
            <WordSearchPlay
              puzzleId={puzzle.id}
              rows={puzzle.grid}
              words={puzzle.words}
              name={name}
            />
          )}
        </section>

        <Chat puzzleId={puzzle.id} name={name} />
      </div>
    </div>
  );
}