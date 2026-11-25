"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Grid2x2, Shuffle, Type, X } from "lucide-react";
import FilterSelect from "@/components/FilterSelect";
import SudokuGrid from "@/components/SudokuGrid";
import { useToast } from "@/components/Toaster";
import WordSearchGrid from "@/components/WordSearchGrid";
import {
  checkSudoku,
  findConflicts,
  type SudokuCheck,
  type SudokuSize,
} from "@/lib/sudoku";
import {
  arrangeWordSearch,
  splitWords,
  validateWords,
  type Level,
} from "@/lib/wordsearch";
import { useDisplayName } from "@/lib/useDisplayName";
import type { PuzzleKind } from "@/lib/puzzles";

const inputClass =
  "h-12 w-full rounded-2xl border border-line bg-paper px-4 text-[15px] outline-none transition placeholder:text-muted/70 focus:border-forest-soft";

const pillButton =
  "inline-flex items-center gap-2 rounded-full border border-line bg-paper px-4 py-2 text-sm font-bold transition hover:border-forest-soft";

const difficultyOptions = [
  { value: "Easy", label: "Easy" },
  { value: "Medium", label: "Medium" },
  { value: "Hard", label: "Hard" },
];
const directionOptions = [
  { value: "Easy", label: "Across and down" },
  { value: "Medium", label: "Plus diagonals" },
  { value: "Hard", label: "Every direction" },
];
const sudokuSizeOptions = [
  { value: "4", label: "4 by 4" },
  { value: "6", label: "6 by 6" },
  { value: "9", label: "9 by 9" },
];
const wordSizeOptions = [
  { value: "8", label: "8 by 8" },
  { value: "10", label: "10 by 10" },
  { value: "12", label: "12 by 12" },
];

const statusStyle: Record<SudokuCheck["status"], string> = {
  valid: "bg-sage text-forest",
  many: "bg-gold-soft text-gold-text",
  open: "bg-gold-soft text-gold-text",
  clash: "bg-clay-soft text-clay",
  none: "bg-clay-soft text-clay",
  empty: "",
};

export default function CreatePage() {
  const router = useRouter();
  const toast = useToast();
  const [kind, setKind] = useState<PuzzleKind>("sudoku");
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [author, setAuthor] = useDisplayName();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const errorRef = useRef<HTMLParagraphElement | null>(null);

  const [difficulty, setDifficulty] = useState<Level>("Medium");
  const [sudokuSize, setSudokuSize] = useState<SudokuSize>(9);
  const [grid, setGrid] = useState<string[]>(() => Array<string>(81).fill(""));

  const [gridSize, setGridSize] = useState(10);
  const [level, setLevel] = useState<Level>("Medium");
  const [words, setWords] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [wordNote, setWordNote] = useState<string | null>(null);
  const [shuffles, setShuffles] = useState(0);
  const [showWords, setShowWords] = useState(true);

  useEffect(() => {
    if (error) {
      errorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [error]);

  const check = useMemo(() => checkSudoku(grid, sudokuSize), [grid, sudokuSize]);
  const conflicts = useMemo(() => findConflicts(grid, sudokuSize), [grid, sudokuSize]);
  const filled = grid.filter(Boolean).length;

  const arrangement = useMemo(() => {
    if (words.length < 3) return null;
    return arrangeWordSearch(words, gridSize, level);
  }, [words, gridSize, level, shuffles]);

  const hiddenCells = useMemo(() => {
    const cells = new Set<string>();
    arrangement?.placements.forEach((p) => {
      for (let i = 0; i < p.word.length; i++) {
        cells.add(`${p.row + p.dr * i}-${p.col + p.dc * i}`);
      }
    });
    return cells;
  }, [arrangement]);

  function changeSudokuSize(next: SudokuSize) {
    setSudokuSize(next);
    setGrid(Array<string>(next * next).fill(""));
    setError(null);
  }

  function changeGridSize(next: number) {
    setGridSize(next);
    setWords((current) => current.filter((word) => word.length <= next));
  }

  function addWords(raw: string) {
    const incoming = splitWords(raw);
    setDraft("");
    if (incoming.length === 0) return;

    const next = [...words];
    let message: string | null = null;

    for (const word of incoming) {
      if (next.includes(word)) {
        message = `${word} is already on the list.`;
        continue;
      }
      if (word.length < 3) {
        message = `${word} is too short. Use at least 3 letters.`;
        continue;
      }
      if (word.length > gridSize) {
        message = `${word} is longer than the grid. Pick a bigger grid or a shorter word.`;
        continue;
      }
      if (next.length >= 12) {
        message = "A grid holds up to 12 words.";
        break;
      }
      next.push(word);
    }

    setWords(next);
    setWordNote(message);
  }

  async function handlePublish() {
    setError(null);

    if (title.trim().length < 3) {
      setError("Give your puzzle a title of at least 3 letters.");
      return;
    }
    if (author.trim().length < 2) {
      setError("Add a display name so people know who made it.");
      return;
    }

    let payload: Record<string, unknown>;

    if (kind === "sudoku") {
      if (check.status === "empty") {
        setError("Add the starting numbers first.");
        return;
      }
      if (check.status !== "valid") {
        setError(check.message);
        return;
      }
      payload = { kind, difficulty, size: sudokuSize, grid };
    } else {
      const problem = validateWords(words, gridSize);
      if (problem) {
        setError(problem);
        return;
      }
      if (!arrangement) {
        setError("These words do not fit together. Try a bigger grid or fewer words.");
        return;
      }
      payload = {
        kind,
        difficulty: level,
        size: gridSize,
        grid: arrangement.grid,
        words,
      };
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/puzzles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          title: title.trim(),
          note: note.trim(),
          author: author.trim(),
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "The puzzle could not be saved.");
        return;
      }

      toast("Your puzzle is on the shelf.", "good");
      router.push("/");
      router.refresh();
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const kindButton = (value: PuzzleKind, label: string, icon: React.ReactNode) => (
    <button
      type="button"
      onClick={() => {
        setKind(value);
        setError(null);
      }}
      className={`flex h-14 flex-1 items-center justify-center gap-2.5 rounded-2xl border text-[15px] font-bold transition ${
        kind === value
          ? "border-forest bg-sage text-forest"
          : "border-line bg-paper text-muted hover:border-forest-soft"
      }`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <div className="mx-auto max-w-3xl pt-6">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-forest-soft">
        Make something for the shelf
      </p>
      <h1 className="mt-4 text-4xl font-bold leading-[1.02] sm:text-5xl md:text-6xl">
        Creating is part
        <br />
        of the fun.
      </h1>
      <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
        Put together a challenge, give it a name, and send it out into the club.
        Someone will be glad you did.
      </p>

      <div className="mt-10 rounded-[2rem] border border-line bg-paper p-5 sm:p-6 md:p-10">
        <h2 className="text-2xl font-bold">First, the kind of puzzle</h2>
        <p className="mt-1 text-[15px] text-muted">
          Choose the format you feel like making today.
        </p>
        <div className="mt-5 flex gap-3">
          {kindButton("sudoku", "Sudoku", <Grid2x2 className="h-5 w-5" strokeWidth={1.6} />)}
          {kindButton("wordsearch", "Word search", <Type className="h-5 w-5" strokeWidth={1.6} />)}
        </div>

        <hr className="my-9 border-line" />

        <h2 className="text-2xl font-bold">Give it a little context</h2>
        <p className="mt-1 text-[15px] text-muted">
          Titles are how people find a puzzle worth their time.
        </p>

        <div className="mt-6 space-y-5">
          <div>
            <label htmlFor="title" className="mb-2 block text-[15px] font-bold">
              Puzzle title
            </label>
            <input
              id="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="The Sunday window"
              maxLength={80}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="note" className="mb-2 block text-[15px] font-bold">
              A note about it{" "}
              <span className="text-sm font-semibold text-muted">(optional)</span>
            </label>
            <textarea
              id="note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="A little hint, a bit of backstory, or just the mood."
              maxLength={240}
              rows={3}
              className="w-full resize-y rounded-2xl border border-line bg-paper px-4 py-3 text-[15px] outline-none transition placeholder:text-muted/70 focus:border-forest-soft"
            />
          </div>

          <div>
            <label htmlFor="author" className="mb-2 block text-[15px] font-bold">
              Your display name
            </label>
            <input
              id="author"
              value={author}
              onChange={(event) => setAuthor(event.target.value)}
              placeholder="What should we call you?"
              maxLength={30}
              className={inputClass}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {kind === "sudoku" ? (
              <>
                <div>
                  <span className="mb-2 block text-[15px] font-bold">Grid size</span>
                  <FilterSelect
                    label="Grid size"
                    value={String(sudokuSize)}
                    onChange={(value) => changeSudokuSize(Number(value) as SudokuSize)}
                    options={sudokuSizeOptions}
                  />
                </div>
                <div>
                  <span className="mb-2 block text-[15px] font-bold">Difficulty</span>
                  <FilterSelect
                    label="Difficulty"
                    value={difficulty}
                    onChange={(value) => setDifficulty(value as Level)}
                    options={difficultyOptions}
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <span className="mb-2 block text-[15px] font-bold">Grid size</span>
                  <FilterSelect
                    label="Grid size"
                    value={String(gridSize)}
                    onChange={(value) => changeGridSize(Number(value))}
                    options={wordSizeOptions}
                  />
                </div>
                <div>
                  <span className="mb-2 block text-[15px] font-bold">How words run</span>
                  <FilterSelect
                    label="How words run"
                    value={level}
                    onChange={(value) => setLevel(value as Level)}
                    options={directionOptions}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        <hr className="my-9 border-line" />

        {kind === "sudoku" ? (
          <div>
            <div className="flex items-baseline justify-between">
              <h2 className="text-2xl font-bold">Set the starting numbers</h2>
              <span className="text-sm text-muted">
                {filled} / {sudokuSize * sudokuSize}
              </span>
            </div>
            <div className="mt-5">
              <SudokuGrid
                size={sudokuSize}
                values={grid}
                onChange={setGrid}
                flagged={conflicts}
              />
            </div>
            {check.status !== "empty" && (
              <p
                className={`mt-5 rounded-2xl px-5 py-3.5 text-[15px] font-medium ${statusStyle[check.status]}`}
              >
                {check.message}
              </p>
            )}
          </div>
        ) : (
          <div>
            <div className="flex items-baseline justify-between">
              <h2 className="text-2xl font-bold">Hide some words</h2>
              <span className="text-sm text-muted">{words.length} of 12</span>
            </div>

            <textarea
              value={draft}
              onChange={(event) => {
                const value = event.target.value;
                if (/[\s,;]/.test(value)) addWords(value);
                else setDraft(value.toUpperCase());
              }}
              onBlur={() => {
                if (draft) addWords(draft);
              }}
              placeholder="Type a word, then press Enter"
              rows={2}
              className="mt-5 w-full resize-none rounded-2xl border border-line bg-paper px-4 py-3 text-[15px] font-bold tracking-wide outline-none transition placeholder:font-normal placeholder:tracking-normal placeholder:text-muted/70 focus:border-forest-soft"
            />

            {wordNote && <p className="mt-2 text-sm text-clay">{wordNote}</p>}

            {words.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {words.map((word) => (
                  <span
                    key={word}
                    className="inline-flex items-center gap-1.5 rounded-full bg-sand py-1.5 pl-3.5 pr-2 text-sm font-bold tracking-wide"
                  >
                    {word}
                    <button
                      type="button"
                      aria-label={`Remove ${word}`}
                      onClick={() => setWords(words.filter((item) => item !== word))}
                      className="rounded-full p-0.5 text-muted transition hover:text-ink"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {arrangement ? (
              <div className="mt-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-lg font-bold">Your grid</h3>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShuffles((count) => count + 1)}
                      className={pillButton}
                    >
                      <Shuffle className="h-4 w-4" />
                      Shuffle
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowWords((value) => !value)}
                      className={pillButton}
                    >
                      {showWords ? "Hide the words" : "Show the words"}
                    </button>
                  </div>
                </div>
                <div className="mt-4">
                  <WordSearchGrid
                    rows={arrangement.grid}
                    marked={showWords ? hiddenCells : undefined}
                  />
                </div>
              </div>
            ) : (
              words.length >= 3 && (
                <p className="mt-6 rounded-2xl bg-clay-soft px-5 py-3.5 text-[15px] font-medium text-clay">
                  These words do not fit together. Try a bigger grid, fewer words or more
                  directions.
                </p>
              )
            )}
          </div>
        )}

        {error && (
          <p
            ref={errorRef}
            className="mt-8 rounded-2xl bg-clay-soft px-5 py-4 text-[15px] font-medium text-clay"
          >
            {error}
          </p>
        )}

        <div className="mt-9 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2.5 rounded-full border border-line bg-paper px-6 py-3.5 text-[15px] font-bold transition hover:border-forest-soft"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to shelf
          </Link>
          <button
            type="button"
            onClick={handlePublish}
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2.5 rounded-full bg-forest-soft px-7 py-3.5 text-[15px] font-bold text-paper transition hover:bg-forest disabled:opacity-60"
          >
            {submitting ? "Publishing" : "Publish puzzle"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}