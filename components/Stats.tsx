type Props = {
  puzzles: number;
  solves: number;
  notes: number;
};

export default function Stats({ puzzles, solves, notes }: Props) {
  const items = [
    { value: puzzles, label: "puzzles shared" },
    { value: solves, label: "solves celebrated" },
    { value: notes, label: "notes left" },
  ];

  return (
    <div className="mt-8 grid grid-cols-3 sm:mt-10 sm:flex sm:items-center">
      {items.map((item, index) => (
        <div
          key={item.label}
          className={`flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-3 sm:pr-8 ${
            index > 0 ? "border-l border-line pl-4 sm:pl-8" : "pl-1 sm:pl-2"
          }`}
        >
          <span className="font-display text-2xl font-bold sm:text-3xl">
            {item.value}
          </span>
          <span className="text-xs text-muted sm:text-sm">{item.label}</span>
        </div>
      ))}
    </div>
  );
}