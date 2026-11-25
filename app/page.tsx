import Hero from "@/components/Hero";
import Shelf from "@/components/Shelf";
import Stats from "@/components/Stats";
import { db } from "@/lib/firebase";
import type { PuzzleSummary } from "@/lib/puzzles";

export const dynamic = "force-dynamic";

export default async function Home() {
  const snapshot = await db()
    .collection("puzzles")
    .orderBy("createdAt", "desc")
    .get();

  const puzzles: PuzzleSummary[] = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      title: data.title,
      description:
        data.note ||
        (data.kind === "sudoku"
          ? "A Sudoku grid waiting for you."
          : "Words hiding in a little grid."),
      kind: data.kind,
      difficulty: data.difficulty,
      author: data.author,
      solves: data.solveCount ?? 0,
      messages: data.messageCount ?? 0,
      createdAt:
        data.createdAt?.toDate?.().toISOString() ?? new Date().toISOString(),
    };
  });

  const solves = puzzles.reduce((sum, puzzle) => sum + puzzle.solves, 0);
  const notes = puzzles.reduce((sum, puzzle) => sum + puzzle.messages, 0);

  return (
    <>
      <Hero />
      <Stats puzzles={puzzles.length} solves={solves} notes={notes} />
      <Shelf puzzles={puzzles} />
    </>
  );
}