"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import FilterSelect from "./FilterSelect";
import PuzzleCard from "./PuzzleCard";
import type { PuzzleSummary } from "@/lib/puzzles";

const kindOptions = [
  { value: "all", label: "Every kind" },
  { value: "sudoku", label: "Sudoku" },
  { value: "wordsearch", label: "Word search" },
];

const difficultyOptions = [
  { value: "all", label: "Any difficulty" },
  { value: "Easy", label: "Easy" },
  { value: "Medium", label: "Medium" },
  { value: "Hard", label: "Hard" },
];

const sortOptions = [
  { value: "recent", label: "Recently added" },
  { value: "solved", label: "Most solved" },
  { value: "talked", label: "Most discussed" },
];

export default function Shelf({ puzzles }: { puzzles: PuzzleSummary[] }) {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [sort, setSort] = useState("recent");

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();

    const filtered = puzzles.filter((puzzle) => {
      const matchesText =
        term === "" ||
        puzzle.title.toLowerCase().includes(term) ||
        puzzle.description.toLowerCase().includes(term) ||
        puzzle.author.toLowerCase().includes(term);
      const matchesKind = kind === "all" || puzzle.kind === kind;
      const matchesDifficulty =
        difficulty === "all" || puzzle.difficulty === difficulty;
      return matchesText && matchesKind && matchesDifficulty;
    });

    return [...filtered].sort((a, b) => {
      if (sort === "solved") return b.solves - a.solves;
      if (sort === "talked") return b.messages - a.messages;
      return b.createdAt.localeCompare(a.createdAt);
    });
  }, [puzzles, query, kind, difficulty, sort]);

  return (
    <section className="mt-14">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-forest-soft">
            The puzzle shelf
          </p>
          <h2 className="mt-3 text-3xl font-bold md:text-4xl">
            Pick your next little challenge
          </h2>
        </div>
        <Link
          href="/create"
          className="inline-flex shrink-0 items-center gap-2 rounded-full border border-line bg-paper px-5 py-3 text-[15px] font-bold transition hover:border-forest-soft"
        >
          <Plus className="h-4 w-4" />
          Add yours
        </Link>
      </div>

      <div className="mt-7 grid gap-3 md:grid-cols-[1fr_auto_auto_auto]">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search the shelf..."
            className="h-12 w-full rounded-2xl border border-line bg-paper pl-11 pr-4 text-[15px] outline-none transition placeholder:text-muted/70 focus:border-forest-soft"
          />
        </div>
        <FilterSelect label="Kind" value={kind} onChange={setKind} options={kindOptions} />
        <FilterSelect
          label="Difficulty"
          value={difficulty}
          onChange={setDifficulty}
          options={difficultyOptions}
        />
        <FilterSelect label="Sort" value={sort} onChange={setSort} options={sortOptions} />
      </div>

      <div className="mt-6 flex flex-col gap-4">
        {visible.length > 0 ? (
          visible.map((puzzle) => <PuzzleCard key={puzzle.id} puzzle={puzzle} />)
        ) : (
          <p className="rounded-3xl border border-dashed border-line py-14 text-center text-muted">
            Nothing on the shelf matches that yet.
          </p>
        )}
      </div>
    </section>
  );
}