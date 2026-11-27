import PlayHub from "@/components/PlayHub";
import { dateLabel, todayKey } from "@/lib/daily";

export const dynamic = "force-dynamic";
export const metadata = { title: "Play | Puzzle Club" };

export default function PlayPage() {
  return <PlayHub dailyLabel={dateLabel(todayKey())} />;
}