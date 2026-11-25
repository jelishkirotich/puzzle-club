import { notFound } from "next/navigation";
import PuzzleView from "@/components/PuzzleView";
import { db } from "@/lib/firebase";
import type { PuzzleDetail } from "@/lib/puzzles";

export const dynamic = "force-dynamic";

export default async function PuzzlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const snapshot = await db().collection("puzzles").doc(id).get();
  const data = snapshot.data();

  if (!data) notFound();

  const puzzle: PuzzleDetail = {
    id: snapshot.id,
    title: data.title,
    note: data.note ?? "",
    kind: data.kind,
    difficulty: data.difficulty,
    author: data.author,
    size: data.size ?? 9,
    grid: data.grid,
    words: data.words ?? [],
  };

  return <PuzzleView puzzle={puzzle} />;
}