"use client";

import { useState } from "react";
import WordSearchGrid from "./WordSearchGrid";

type Props = {
  puzzleId: string;
  rows: string[];
  words: string[];
  name: string;
};

export default function WordSearchPlay({ puzzleId, rows, words, name }: Props) {
  const [start, setStart] = useState<[number, number] | null>(null);
  const [found, setFound] = useState<string[]>([]);
  const [cells, setCells] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState<{ good: boolean; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [recorded, setRecorded] = useState(false);

  const done = found.length === words.length;

  function handleCell(r: number, c: number) {
    if (done) return;

    if (!start) {
      setStart([r, c]);
      setMessage(null);
      return;
    }

    const [sr, sc] = start;
    const dr = r - sr;
    const dc = c - sc;
    setStart(null);

    if (dr === 0 && dc === 0) return;

    if (!(dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc))) {
      setMessage({ good: false, text: "Pick two letters in a straight line." });
      return;
    }

    const length = Math.max(Math.abs(dr), Math.abs(dc)) + 1;
    const stepR = Math.sign(dr);
    const stepC = Math.sign(dc);
    let text = "";
    const line: string[] = [];

    for (let i = 0; i < length; i++) {
      const rr = sr + stepR * i;
      const cc = sc + stepC * i;
      text += rows[rr][cc];
      line.push(`${rr}-${cc}`);
    }

    const reversed = text.split("").reverse().join("");
    const match = words.find(
      (word) => !found.includes(word) && (word === text || word === reversed)
    );

    if (!match) {
      setMessage({ good: false, text: "Not one of the hidden words. Try again." });
      return;
    }

    const nextFound = [...found, match];
    setFound(nextFound);
    setCells(new Set([...cells, ...line]));
    setMessage(
      nextFound.length === words.length
        ? { good: true, text: "Every word found." }
        : null
    );
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
        body: JSON.stringify({ solver: name.trim(), found }),
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
    setStart(null);
    setFound([]);
    setCells(new Set());
    setMessage(null);
    setRecorded(false);
  }

  return (
    <div>
      <WordSearchGrid
        rows={rows}
        marked={cells}
        selected={start ? `${start[0]}-${start[1]}` : null}
        onCellClick={handleCell}
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