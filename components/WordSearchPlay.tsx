"use client";

import { useEffect, useState } from "react";
import WordSearchGrid, { type Cell } from "./WordSearchGrid";
import { locateWord } from "@/lib/wordsearch";

type Props = {
  puzzleId: string;
  rows: string[];
  words: string[];
  name: string;
};

function formatTime(total: number) {
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

export default function WordSearchPlay({ puzzleId, rows, words, name }: Props) {
  const [found, setFound] = useState<string[]>([]);
  const [cells, setCells] = useState<Set<string>>(new Set());
  const [popped, setPopped] = useState<Set<string>>(new Set());
  const [misses, setMisses] = useState(0);
  const [hint, setHint] = useState<string | null>(null);
  const [shakeKey, setShakeKey] = useState(0);
  const [message, setMessage] = useState<{ good: boolean; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [recorded, setRecorded] = useState(false);
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [finishedIn, setFinishedIn] = useState<number | null>(null);

  const done = found.length === words.length;

  useEffect(() => {
    if (finishedIn !== null) return;
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [finishedIn, startedAt]);

  function handleLine(line: Cell[]) {
    if (done) return;

    const text = line.map(([r, c]) => rows[r][c]).join("");
    const reversed = text.split("").reverse().join("");
    const match = words.find(
      (word) => !found.includes(word) && (word === text || word === reversed)
    );

    if (!match) {
      setMisses((count) => count + 1);
      setShakeKey((key) => key + 1);
      return;
    }

    const keys = line.map(([r, c]) => `${r}-${c}`);
    const nextFound = [...found, match];

    setFound(nextFound);
    setCells(new Set([...cells, ...keys]));
    setPopped(new Set(keys));
    setHint(null);
    setMisses(0);

    if (nextFound.length === words.length) {
      const seconds = Math.floor((Date.now() - startedAt) / 1000);
      setElapsed(seconds);
      setFinishedIn(seconds);
      setMessage({ good: true, text: `Every word found in ${formatTime(seconds)}.` });
    }
  }

  function showHint() {
    const target = words.find((word) => !found.includes(word));
    if (!target) return;
    const spot = locateWord(rows, target);
    if (!spot) return;
    setHint(`${spot.row}-${spot.col}`);
    setMisses(0);
  }

  async function record() {
    if (name.trim().length < 2) {
      setMessage({ good: false, text: "Add your display name above first." });
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/puzzles/${puzzleId}/solve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ solver: name.trim(), found, time: finishedIn }),
      });
      const data = await response.json();

      if (!response.ok || !data.correct) {
        setMessage({ good: false, text: data.error ?? "That could not be counted." });
        return;
      }
      setRecorded(true);
      setMessage({ good: true, text: "Counted. Well spotted." });
    } catch {
      setMessage({ good: false, text: "Could not reach the server. Try again." });
    } finally {
      setSaving(false);
    }
  }

  function reset() {
    setFound([]);
    setCells(new Set());
    setPopped(new Set());
    setMisses(0);
    setHint(null);
    setMessage(null);
    setRecorded(false);
    setFinishedIn(null);
    setElapsed(0);
    setStartedAt(Date.now());
  }

  return (
    <div>
      <div className="mb-4 flex max-w-[460px] items-center justify-between">
        <span className="font-display text-2xl font-bold tabular-nums">
          {formatTime(elapsed)}
        </span>
        {misses >= 3 && !done && (
          <button
            type="button"
            onClick={showHint}
            className="rounded-full border border-line bg-paper px-4 py-2 text-sm font-bold transition hover:border-forest-soft"
          >
            Show a hint
          </button>
        )}
      </div>

      <WordSearchGrid
        rows={rows}
        marked={cells}
        popCells={popped}
        hint={hint}
        shakeKey={shakeKey}
        onSelectLine={handleLine}
      />

      <ul className="mt-6 flex flex-wrap gap-2">
        {words.map((word) => (
          <li
            key={word}
            className={`rounded-full px-3.5 py-1.5 text-sm font-bold tracking-wide ${
              found.includes(word)
                ? "bg-sage text-forest-soft line-through"
                : "bg-sand text-ink"
            }`}
          >
            {word}
          </li>
        ))}
      </ul>

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
        {done && !recorded && (
          <button
            type="button"
            onClick={record}
            disabled={saving}
            className="rounded-full bg-forest-soft px-7 py-3.5 text-[15px] font-bold text-paper transition hover:bg-forest disabled:opacity-60"
          >
            {saving ? "Counting" : "Count my solve"}
          </button>
        )}
        <button
          type="button"
          onClick={reset}
          className="rounded-full border border-line bg-paper px-6 py-3.5 text-[15px] font-bold transition hover:border-forest-soft"
        >
          Start over
        </button>
      </div>
    </div>
  );
}