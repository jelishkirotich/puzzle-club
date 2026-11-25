"use client";

import { useRef, useState } from "react";
import { boxShape, type SudokuSize } from "@/lib/sudoku";

type Props = {
  size: SudokuSize;
  values: string[];
  onChange?: (next: string[]) => void;
  onSelect?: (index: number) => void;
  fixed?: boolean[];
  flagged?: Set<number>;
  hideKeyboard?: boolean;
};

export default function SudokuGrid({
  size,
  values,
  onChange,
  onSelect,
  fixed,
  flagged,
  hideKeyboard,
}: Props) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const { rows: boxRows, cols: boxCols } = boxShape(size);
  const textSize = size === 9 ? "text-xl" : size === 6 ? "text-2xl" : "text-3xl";

  const boxIndex = (index: number) =>
    Math.floor(Math.floor(index / size) / boxRows) * (size / boxCols) +
    Math.floor((index % size) / boxCols);

  function isPeer(index: number) {
    if (selected === null) return false;
    return (
      Math.floor(index / size) === Math.floor(selected / size) ||
      index % size === selected % size ||
      boxIndex(index) === boxIndex(selected)
    );
  }

  const selectedValue = selected !== null ? values[selected] : "";

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
        const isFlagged = flagged?.has(index) ?? false;

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

        const text = isFlagged ? "text-clay" : isFixed ? "text-forest" : "text-ink";
        const background = isFlagged
          ? "bg-clay-soft"
          : selected === index
            ? "bg-[#cfe0d3]"
            : selectedValue && value === selectedValue
              ? "bg-[#dde9dc]"
              : isPeer(index)
                ? "bg-sage/60"
                : isFixed
                  ? "bg-sand/60"
                  : "bg-transparent";

        return (
          <input
            key={index}
            ref={(element) => {
              refs.current[index] = element;
            }}
            value={value}
            readOnly={!onChange || isFixed}
            inputMode={hideKeyboard ? "none" : "numeric"}
            aria-label={`Row ${row + 1}, column ${col + 1}`}
            onChange={(event) => setCell(index, event.target.value)}
            onKeyDown={(event) => handleKey(event, index)}
            onFocus={(event) => {
              event.target.select();
              setSelected(index);
              onSelect?.(index);
            }}
            className={`w-full min-w-0 cursor-pointer text-center font-display font-bold outline-none ${textSize} ${text} ${background} ${right} ${bottom}`}
          />
        );
      })}
    </div>
  );
}