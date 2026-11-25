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
    <div className="mt-10 flex flex-wrap items-center gap-y-4">
      {items.map((item, index) => (
        <div
          key={item.label}
          className={`flex items-baseline gap-3 pr-8 ${
            index > 0 ? "border-l border-line pl-8" : "pl-2"
          }`}
        >
          <span className="font-display text-3xl font-bold">{item.value}</span>
          <span className="text-sm text-muted">{item.label}</span>
        </div>
      ))}
    </div>
  );
}