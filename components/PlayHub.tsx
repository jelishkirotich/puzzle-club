"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";

const sizes = [
  { value: 4, label: "4 by 4", note: "A quick warm up" },
  { value: 6, label: "6 by 6", note: "A fair middle" },
  { value: 9, label: "9 by 9", note: "The classic" },
];

const levels = [
  { value: "Easy", note: "Solved with singles alone" },
  { value: "Medium", note: "Fewer clues" },
  { value: "Hard", note: "The fewest clues" },
];

function Thumb({ size }: { size: number }) {
  return (
    <div
      className="grid h-14 w-14 overflow-hidden rounded border border-forest-soft bg-paper"
      style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: size * size }, (_, i) => (
        <span key={i} className="border-[0.5px] border-line" />
      ))}
    </div>
  );
}

export default function PlayHub({ dailyLabel }: { dailyLabel: string }) {
  const [size, setSize] = useState(9);
  const [level, setLevel] = useState("Medium");

  return (
    <div className="pt-6">
      <h1 className="text-4xl font-bold leading-[1.05] sm:text-5xl md:text-6xl">
        A fresh puzzle,
        <br />
        any time you like.
      </h1>
      <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
        Every puzzle is made for you on the spot and has exactly one solution.
      </p>

      <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-[2rem] border border-line bg-paper p-6 md:p-8">
          <h2 className="text-2xl font-bold">Pick a size</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {sizes.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setSize(item.value)}
                className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition ${
                  size === item.value
                    ? "border-forest bg-sage"
                    : "border-line bg-paper hover:border-forest-soft"
                }`}
              >
                <Thumb size={item.value} />
                <span>
                  <span className="block font-bold">{item.label}</span>
                  <span className="block text-sm text-muted">{item.note}</span>
                </span>
              </button>
            ))}
          </div>

          <h2 className="mt-9 text-2xl font-bold">Pick a level</h2>
          <div className="mt-5 space-y-2">
            {levels.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setLevel(item.value)}
                className={`flex w-full items-center justify-between gap-4 rounded-2xl border px-5 py-3.5 text-left transition ${
                  level === item.value
                    ? "border-forest bg-sage"
                    : "border-line bg-paper hover:border-forest-soft"
                }`}
              >
                <span className="font-bold">{item.value}</span>
                <span className="text-sm text-muted">{item.note}</span>
              </button>
            ))}
          </div>

          <a
            href={`/play/start?size=${size}&level=${level}`}
            className="mt-9 inline-flex items-center gap-2.5 rounded-full bg-forest-soft px-7 py-3.5 text-[15px] font-bold text-paper transition hover:bg-forest"
          >
            Start puzzle
            <ArrowRight className="h-4 w-4" />
          </a>
        </section>

        <section className="flex flex-col justify-between rounded-[2rem] bg-hero p-6 text-[#f6f3ec] md:p-8">
          <div>
            <p className="text-sm text-[#f6f3ec]/70">{dailyLabel}</p>
            <h2 className="mt-2 text-3xl font-bold">Today&rsquo;s puzzle</h2>
            <p className="mt-3 text-[#f6f3ec]/75">
              One 9 by 9 for everyone. Finish it and your time joins the board.
            </p>
          </div>
          <a
            href="/play/daily"
            className="mt-8 inline-flex items-center justify-center gap-2.5 rounded-full bg-[#eee6d9] px-7 py-3.5 text-[15px] font-bold text-[#254f45] transition hover:bg-[#f6f3ec]"
          >
            Play today&rsquo;s puzzle
            <ArrowRight className="h-4 w-4" />
          </a>
        </section>
      </div>
    </div>
  );
}