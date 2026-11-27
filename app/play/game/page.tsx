import { redirect } from "next/navigation";
import PlayGame from "@/components/PlayGame";
import { generatePuzzle } from "@/lib/generator";
import type { Difficulty } from "@/lib/puzzles";
import type { SudokuSize } from "@/lib/sudoku";

export const dynamic = "force-dynamic";

export default async function GamePage({
  searchParams,
}: {
  searchParams: Promise<{ size?: string; level?: string; seed?: string }>;
}) {
  const params = await searchParams;
  const size = Number(params.size);
  const seed = Number(params.seed);
  const level = params.level as Difficulty;

  if (
    ![4, 6, 9].includes(size) ||
    !["Easy", "Medium", "Hard"].includes(level) ||
    !Number.isInteger(seed) ||
    seed < 0 ||
    seed > 4294967295
  ) {
    redirect("/play");
  }

  const { puzzle } = generatePuzzle(size as SudokuSize, level, seed);

  return (
    <PlayGame size={size as SudokuSize} level={level} seed={seed} grid={puzzle} />
  );
}