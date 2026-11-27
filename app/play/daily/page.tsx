import PlayGame from "@/components/PlayGame";
import { DAILY, dailySeed, dateLabel, todayKey } from "@/lib/daily";
import { generatePuzzle } from "@/lib/generator";

export const dynamic = "force-dynamic";

export default function DailyPage() {
  const key = todayKey();
  const seed = dailySeed(key);
  const { puzzle } = generatePuzzle(DAILY.size, DAILY.level, seed);

  return (
    <PlayGame
      size={DAILY.size}
      level={DAILY.level}
      seed={seed}
      grid={puzzle}
      daily={{ key, label: dateLabel(key) }}
    />
  );
}