"use client";

import { useRef } from "react";
import { boxShape, type SudokuSize } from "@/lib/sudoku";

type Props = {
  size: SudokuSize;
  values: string[];
  onChange?: (next: string[]) => void;
  fixed?: boolean[];
  flagged?: Set<number>;
};

export default function SudokuGrid({ size, values, onChange, fixed, flagged }: Props) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const { rows: boxRows, cols: boxCols } = boxShape(size);
  const textSize = size === 9 ? "text-xl" : size === 6 ? "text-2xl" : "text-3xl";

  function setCell(index: number, raw: string) {
    if (!onChange) return;
    const digit = raw.replace(new RegExp(`[^1-${size}]`, "g"), "").slice(-1);
    const next = [...values];
    next[index] = digit;
    onChange(next);
  }

  function handleKey(event: React.KeyboardEvent<HTMLInputElement>, index: number) {
    const row = Math.floor(index / size);
    const col = index % size;
    let target = -1;

    if (event.key === "ArrowRight" && col < size - 1) target = index + 1;
    if (event.key === "ArrowLeft" && col > 0) target = index - 1;
    if (event.key === "ArrowDown" && row < size - 1) target = index + size;
    if (event.key === "ArrowUp" && row > 0) target = index - size;

    if (target >= 0) {
      event.preventDefault();
      refs.current[target]?.focus();
    }
  }

  return (
    <div
      className="grid aspect-square w-full max-w-[460px] overflow-hidden rounded-xl border-2 border-forest-soft bg-paper"
      style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
    >
      {values.map((value, index) => {
        const row = Math.floor(index / size);
        const col = index % size;
        const isFixed = fixed?.[index] ?? false;

        const right =
          col === size - 1
            ? ""
            : col % boxCols === boxCols - 1
              ? "border-r-2 border-r-forest-soft"
              : "border-r border-r-line";
        const bottom =
          row === size - 1
            ? ""
            : row % boxRows === boxRows - 1
              ? "border-b-2 border-b-forest-soft"
              : "border-b border-b-line";

        const tone = flagged?.has(index)
          ? "bg-clay-soft text-clay"
          : isFixed
            ? "bg-sage/70 text-forest"
            : "bg-transparent text-ink focus:bg-sage";

        return (
          <input
            key={index}
            ref={(element) => {
              refs.current[index] = element;
            }}
            value={value}
            readOnly={!onChange || isFixed}
            inputMode="numeric"
            aria-label={`Row ${row + 1}, column ${col + 1}`}
            onChange={(event) => setCell(index, event.target.value)}
            onKeyDown={(event) => handleKey(event, index)}
            onFocus={(event) => event.target.select()}
            className={`w-full min-w-0 text-center font-display font-bold outline-none ${textSize} ${tone} ${right} ${bottom}`}
          />
        );
      })}
    </div>
  );
}