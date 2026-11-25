"use client";

import { useMemo, useState } from "react";
import SudokuGrid from "./SudokuGrid";
import { findConflicts, type SudokuSize } from "@/lib/sudoku";

type Props = {
  puzzleId: string;
  size: SudokuSize;
  grid: string[];
  name: string;
};

export default function SudokuPlay({ puzzleId, size, grid, name }: Props) {
  const [values, setValues] = useState<string[]>(grid);
  const [wrong, setWrong] = useState<number[]>([]);
  const [message, setMessage] = useState<{ good: boolean; text: string } | null>(null);
  const [checking, setChecking] = useState(false);

  const fixed = useMemo(() => grid.map(Boolean), [grid]);
  const flagged = useMemo(() => {
    const set = findConflicts(values, size);
    wrong.forEach((index) => set.add(index));
    return set;
  }, [values, size, wrong]);

  function change(next: string[]) {
    setValues(next);
    setWrong([]);
    setMessage(null);
  }

  async function check() {
    if (name.trim().length < 2) {
      setMessage({ good: false, text: "Add your display name above first." });
      return;
    }

    setChecking(true);
    try {
      const response = await fetch(`/api/puzzles/${puzzleId}/solve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ solver: name.trim(), grid: values }),
      });
      const data = await response.json();

      if (!response.ok) {
        setMessage({ good: false, text: data.error ?? "That could not be checked." });
        return;
      }

      if (data.correct) {
        setWrong([]);
        setMessage({ good: true, text: "Solved. Lovely work." });
      } else if (data.wrong.length > 0) {
        setWrong(data.wrong);
        setMessage({ good: false, text: "Some squares need another look." });
      } else {
        setMessage({
          good: false,
          text: `${data.empty} ${data.empty === 1 ? "square is" : "squares are"} still empty.`,
        });
      }
    } catch {
      setMessage({ good: false, text: "Could not reach the server. Try again." });
    } finally {
      setChecking(false);
    }
  }

  return (
    <div>
      <SudokuGrid
        size={size}
        values={values}
        onChange={change}
        fixed={fixed}
        flagged={flagged}
      />

      {message && (
        <p
          className={`mt-5 rounded-2xl px-5 py-3.5 text-[15px] font-medium ${
            message.good ? "bg-sage text-forest" : "bg-clay-soft text-clay"
          }`}
        >
          {message.text}
        </p>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={check}
          disabled={checking}
          className="rounded-full bg-forest-soft px-7 py-3.5 text-[15px] font-bold text-paper transition hover:bg-forest disabled:opacity-60"
        >
          {checking ? "Checking" : "Check my answers"}
        </button>
        <button
          type="button"
          onClick={() => change(grid)}
          className="rounded-full border border-line bg-paper px-6 py-3.5 text-[15px] font-bold transition hover:border-forest-soft"
        >
          Start over
        </button>
      </div>
    </div>
  );
}