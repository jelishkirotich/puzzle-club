"use client";

import { useEffect, useRef, useState } from "react";

export type Cell = [number, number];

type Props = {
  rows: string[];
  marked?: Set<string>;
  popCells?: Set<string>;
  hint?: string | null;
  shakeKey?: number;
  onSelectLine?: (cells: Cell[]) => void;
};

function buildLine(start: Cell, end: Cell, size: number): Cell[] {
  const dr = end[0] - start[0];
  const dc = end[1] - start[1];
  const ar = Math.abs(dr);
  const ac = Math.abs(dc);

  if (ar === 0 && ac === 0) return [start];

  let stepR = 0;
  let stepC = 0;
  let length: number;

  if (ar > ac * 2) {
    stepR = Math.sign(dr);
    length = ar + 1;
  } else if (ac > ar * 2) {
    stepC = Math.sign(dc);
    length = ac + 1;
  } else {
    stepR = Math.sign(dr);
    stepC = Math.sign(dc);
    length = Math.round((ar + ac) / 2) + 1;
  }

  const cells: Cell[] = [];
  for (let i = 0; i < length; i++) {
    const r = start[0] + stepR * i;
    const c = start[1] + stepC * i;
    if (r < 0 || r >= size || c < 0 || c >= size) break;
    cells.push([r, c]);
  }
  return cells;
}

export default function WordSearchGrid({
  rows,
  marked,
  popCells,
  hint,
  shakeKey = 0,
  onSelectLine,
}: Props) {
  const size = rows.length;
  const textSize = size > 10 ? "text-base" : "text-lg";
  const gridRef = useRef<HTMLDivElement | null>(null);
  const [start, setStart] = useState<Cell | null>(null);
  const [line, setLine] = useState<Cell[]>([]);
  const [shaking, setShaking] = useState(false);

  useEffect(() => {
    if (!shakeKey) return;
    setShaking(true);
    const timer = setTimeout(() => setShaking(false), 350);
    return () => clearTimeout(timer);
  }, [shakeKey]);

  function cellAt(event: React.PointerEvent<HTMLDivElement>): Cell | null {
    const element = gridRef.current;
    if (!element) return null;
    const rect = element.getBoundingClientRect();
    const clamp = (value: number) => Math.max(0, Math.min(size - 1, value));
    const col = clamp(Math.floor(((event.clientX - rect.left) / rect.width) * size));
    const row = clamp(Math.floor(((event.clientY - rect.top) / rect.height) * size));
    return [row, col];
  }

  function cancel() {
    setStart(null);
    setLine([]);
  }

  const lineKeys = new Set(line.map(([r, c]) => `${r}-${c}`));

  return (
    <div
      ref={gridRef}
      className={`grid aspect-square w-full max-w-[460px] select-none overflow-hidden rounded-xl border-2 border-forest-soft bg-paper ${
        shaking ? "shake" : ""
      } ${onSelectLine ? "cursor-pointer" : ""}`}
      style={{
        gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
        touchAction: onSelectLine ? "none" : undefined,
      }}
      onPointerDown={(event) => {
        if (!onSelectLine) return;
        const cell = cellAt(event);
        if (!cell) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        setStart(cell);
        setLine([cell]);
      }}
      onPointerMove={(event) => {
        if (!start) return;
        const cell = cellAt(event);
        if (cell) setLine(buildLine(start, cell, size));
      }}
      onPointerUp={() => {
        if (start && line.length > 1) onSelectLine?.(line);
        cancel();
      }}
      onPointerCancel={cancel}
    >
      {rows.flatMap((row, r) =>
        row.split("").map((letter, c) => {
          const key = `${r}-${c}`;
          const tone = lineKeys.has(key)
            ? "bg-clay text-paper"
            : hint === key
              ? "hint-glow text-ink"
              : marked?.has(key)
                ? "bg-sage text-forest"
                : "text-ink";

          return (
            <div
              key={key}
              className={`flex items-center justify-center font-display font-bold transition-colors ${textSize} ${tone} ${
                popCells?.has(key) ? "pop" : ""
              }`}
            >
              {letter}
            </div>
          );
        })
      )}
    </div>
  );
}