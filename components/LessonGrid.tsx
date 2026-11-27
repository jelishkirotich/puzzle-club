import type { Diagram } from "@/lib/lessons";

export default function LessonGrid({ diagram }: { diagram: Diagram }) {
  const { cols, given } = diagram;
  const rows = Math.ceil(given.length / cols);
  const [boxRows, boxCols]: [number, number] =
    diagram.box ?? (cols === 9 ? [3, 3] : cols === 6 ? [2, 3] : [2, 2]);
  const shade = new Set(diagram.shade ?? []);
  const focus = new Set(diagram.focus ?? []);
  const digitSize = cols <= 6 ? "text-3xl" : rows === 1 ? "text-2xl" : "text-xl";

  return (
    <div
      role="img"
      aria-label="Sudoku example"
      className="grid w-full overflow-hidden rounded-xl border-2 border-forest-soft bg-paper"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {given.split("").map((char, index) => {
        const row = Math.floor(index / cols);
        const col = index % cols;
        const answer = diagram.answer?.[index];
        const notes = diagram.notes?.[index];
        const strike = diagram.strike?.[index] ?? "";

        const right =
          col === cols - 1
            ? ""
            : boxCols > 0 && col % boxCols === boxCols - 1
              ? "border-r-2 border-r-forest-soft"
              : "border-r border-r-line";
        const bottom =
          row === rows - 1
            ? ""
            : boxRows > 0 && row % boxRows === boxRows - 1
              ? "border-b-2 border-b-forest-soft"
              : "border-b border-b-line";

        const background = answer
          ? "bg-clay-soft"
          : focus.has(index)
            ? "bg-gold/40"
            : shade.has(index)
              ? "bg-sage"
              : "";

        return (
          <div
            key={index}
            className={`relative flex aspect-square items-center justify-center transition-colors duration-300 ${background} ${right} ${bottom}`}
          >
            {char !== "." && (
              <span className={`font-display font-bold text-forest ${digitSize}`}>
                {char}
              </span>
            )}

            {answer && (
              <span className={`font-display font-bold text-clay ${digitSize}`}>
                {answer}
              </span>
            )}

            {!answer && char === "." && notes && (
              <div className="grid h-full w-full grid-cols-3 grid-rows-3 p-0.5">
                {Array.from({ length: 9 }, (_, i) => {
                  const digit = String(i + 1);
                  const has = notes.includes(digit);
                  const struck = has && strike.includes(digit);
                  return (
                    <span
                      key={digit}
                      className={`flex items-center justify-center text-[9px] leading-none sm:text-[11px] ${
                        struck ? "font-bold text-clay line-through" : "text-muted"
                      }`}
                    >
                      {has ? digit : ""}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}