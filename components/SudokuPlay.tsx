"use client";

import { useEffect, useMemo, useState } from "react";
import { Undo2 } from "lucide-react";
import SudokuGrid from "./SudokuGrid";
import { findConflicts, type SudokuSize } from "@/lib/sudoku";

type Props = {
  endpoint: string;
  extra?: Record<string, unknown>;
  requireName?: boolean;
  size: SudokuSize;
  grid: string[];
  name: string;
  onSolved?: () => void;
};

function formatTime(total: number) {
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

export default function SudokuPlay({
  endpoint,
  extra,
  requireName = true,
  size,
  grid,
  name,
  onSolved,
}: Props) {
  const [values, setValues] = useState<string[]>(grid);
  const [history, setHistory] = useState<string[][]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [wrong, setWrong] = useState<number[]>([]);
  const [message, setMessage] = useState<{ good: boolean; text: string } | null>(
    null
  );
  const [checking, setChecking] = useState(false);
  const [startedAt] = useState(() => Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [solved, setSolved] = useState(false);

  useEffect(() => {
    if (solved) return;
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [solved, startedAt]);

  const fixed = useMemo(() => grid.map(Boolean), [grid]);
  const flagged = useMemo(() => {
    const set = findConflicts(values, size);
    wrong.forEach((index) => set.add(index));
    return set;
  }, [values, size, wrong]);

  function change(next: string[]) {
    setHistory((past) => [...past, values]);
    setValues(next);
    setWrong([]);
    setMessage(null);
  }

  function place(digit: string) {
    if (solved || selected === null || fixed[selected]) return;
    if (values[selected] === digit) return;
    const next = [...values];
    next[selected] = digit;
    change(next);
  }

  function undo() {
    if (history.length === 0 || solved) return;
    setValues(history[history.length - 1]);
    setHistory(history.slice(0, -1));
    setWrong([]);
    setMessage(null);
  }

  function reset() {
    setValues(grid);
    setHistory([]);
    setWrong([]);
    setMessage(null);
  }

  async function check() {
    if (requireName && name.trim().length < 2) {
      setMessage({ good: false, text: "Add your display name above first." });
      return;
    }

    const seconds = Math.floor((Date.now() - startedAt) / 1000);
    setChecking(true);
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...extra,
          solver: name.trim(),
          grid: values,
          time: seconds,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        setMessage({ good: false, text: data.error ?? "That could not be checked." });
        return;
      }

      if (data.correct) {
        setElapsed(seconds);
        setSolved(true);
        setWrong([]);
        setMessage({
          good: true,
          text: `Solved in ${formatTime(seconds)}. Lovely work.`,
        });
        onSolved?.();
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

  const digits = Array.from({ length: size }, (_, i) => String(i + 1));
  const padColumns = size === 9 ? "grid-cols-5" : "grid-cols-4";
  const padButton =
    "h-12 w-full rounded-2xl border border-line bg-paper text-[15px] font-bold transition hover:border-forest-soft disabled:opacity-50";

  return (
    <div>
      <div className="mb-4 flex max-w-[460px] items-center justify-between">
        <span className="font-display text-2xl font-bold tabular-nums">
          {formatTime(elapsed)}
        </span>
        <button
          type="button"
          onClick={undo}
          disabled={history.length === 0 || solved}
          className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-4 py-2 text-sm font-bold transition hover:border-forest-soft disabled:opacity-50"
        >
          <Undo2 className="h-4 w-4" />
          Undo
        </button>
      </div>

      <SudokuGrid
        size={size}
        values={values}
        onChange={solved ? undefined : change}
        onSelect={setSelected}
        fixed={fixed}
        flagged={flagged}
        hideKeyboard
      />

      <div className={`mt-5 grid max-w-[460px] gap-2 ${padColumns}`}>
        {digits.map((digit) => (
          <button
            key={digit}
            type="button"
            disabled={solved}
            onClick={() => place(digit)}
            className={`${padButton} font-display text-lg`}
          >
            {digit}
          </button>
        ))}
        <button
          type="button"
          disabled={solved}
          onClick={() => place("")}
          className={padButton}
        >
          Erase
        </button>
      </div>

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
          disabled={checking || solved}
          className="rounded-full bg-forest-soft px-7 py-3.5 text-[15px] font-bold text-paper transition hover:bg-forest disabled:opacity-60"
        >
          {checking ? "Checking" : "Check my answers"}
        </button>
        <button
          type="button"
          onClick={reset}
          disabled={solved}
          className="rounded-full border border-line bg-paper px-6 py-3.5 text-[15px] font-bold transition hover:border-forest-soft disabled:opacity-50"
        >
          Start over
        </button>
      </div>
    </div>
  );
}