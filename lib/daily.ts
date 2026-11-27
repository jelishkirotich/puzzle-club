import type { SudokuSize } from "@/lib/sudoku";
import type { Difficulty } from "@/lib/puzzles";

export const DAILY: { size: SudokuSize; level: Difficulty } = {
  size: 9,
  level: "Medium",
};

export function todayKey(now: number = Date.now()) {
  return new Date(now).toISOString().slice(0, 10);
}

export function recentKeys() {
  const now = Date.now();
  return [0, 1].map((days) => todayKey(now - days * 86400000));
}

export function dailySeed(key: string) {
  return Number(key.replace(/-/g, ""));
}

export function dateLabel(key: string) {
  return new Date(`${key}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });
}