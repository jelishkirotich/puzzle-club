"use client";

type Props = {
  rows: string[];
  marked?: Set<string>;
  selected?: string | null;
  onCellClick?: (row: number, col: number) => void;
};

export default function WordSearchGrid({ rows, marked, selected, onCellClick }: Props) {
  const size = rows.length;
  const textSize = size > 10 ? "text-base" : "text-lg";

  return (
    <div
      className="grid aspect-square w-full max-w-[460px] select-none overflow-hidden rounded-xl border-2 border-forest-soft bg-paper"
      style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
    >
      {rows.flatMap((row, r) =>
        row.split("").map((letter, c) => {
          const key = `${r}-${c}`;
          const tone =
            selected === key
              ? "bg-clay text-paper"
              : marked?.has(key)
                ? "bg-sage text-forest"
                : "text-ink enabled:hover:bg-cream";

          return (
            <button
              key={key}
              type="button"
              disabled={!onCellClick}
              onClick={() => onCellClick?.(r, c)}
              className={`flex items-center justify-center font-display font-bold transition ${textSize} ${tone} ${
                onCellClick ? "cursor-pointer" : "cursor-default"
              }`}
            >
              {letter}
            </button>
          );
        })
      )}
    </div>
  );
}