import Link from "next/link";
import {
  ChevronRight,
  Grid2x2,
  MessageCircle,
  Trophy,
  Type,
} from "lucide-react";
import type { Difficulty, PuzzleSummary } from "@/lib/puzzles";

const difficultyStyle: Record<Difficulty, string> = {
  Easy: "bg-sage text-forest-soft",
  Medium: "bg-[#f5e9d0] text-gold-text",
  Hard: "bg-clay-soft text-clay",
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export default function PuzzleCard({ puzzle }: { puzzle: PuzzleSummary }) {
  const isSudoku = puzzle.kind === "sudoku";

  return (
    <Link
      href={`/puzzle/${puzzle.id}`}
      className="group flex items-center gap-5 rounded-3xl border border-line bg-paper p-5 transition hover:-translate-y-0.5 hover:border-forest-soft/40 hover:shadow-sm md:p-6"
    >
      <div
        className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${
          isSudoku ? "bg-sage text-forest" : "bg-clay-soft text-clay"
        }`}
      >
        {isSudoku ? (
          <Grid2x2 className="h-6 w-6" strokeWidth={1.6} />
        ) : (
          <Type className="h-6 w-6" strokeWidth={1.6} />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-sand px-3 py-1 text-xs font-bold text-ink">
            {isSudoku ? "Sudoku" : "Word Search"}
          </span>
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${difficultyStyle[puzzle.difficulty]}`}
          >
            {puzzle.difficulty}
          </span>
        </div>

        <h3 className="mt-2.5 text-xl font-bold">{puzzle.title}</h3>
        <p className="mt-1 truncate text-[15px] text-muted">
          {puzzle.description}
        </p>

        <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-muted">
          <span>by {puzzle.author}</span>
          <span className="inline-flex items-center gap-1.5">
            <Trophy className="h-3.5 w-3.5" />
            {puzzle.solves} solves
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MessageCircle className="h-3.5 w-3.5" />
            {puzzle.messages}
          </span>
          <span>{formatDate(puzzle.createdAt)}</span>
        </div>
      </div>

      <ChevronRight className="h-5 w-5 shrink-0 text-muted transition group-hover:translate-x-1 group-hover:text-ink" />
    </Link>
  );
}