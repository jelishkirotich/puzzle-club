import { ChevronDown } from "lucide-react";

type Option = { value: string; label: string };

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
};

export default function FilterSelect({ label, value, onChange, options }: Props) {
  return (
    <div className="relative">
      <select
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full cursor-pointer appearance-none rounded-2xl border border-line bg-paper pl-5 pr-11 text-[15px] font-medium text-ink outline-none transition focus:border-forest-soft"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink" />
    </div>
  );
}