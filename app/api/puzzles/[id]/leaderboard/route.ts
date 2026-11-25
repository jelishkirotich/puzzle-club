import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Context) {
  const { id } = await params;

  try {
    const snapshot = await db()
      .collection("puzzles")
      .doc(id)
      .collection("solves")
      .where("timeSeconds", ">", 0)
      .orderBy("timeSeconds", "asc")
      .limit(10)
      .get();

    const entries = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        solver: data.solver as string,
        timeSeconds: data.timeSeconds as number,
      };
    });

    return NextResponse.json({ entries });
  } catch (error) {
    console.error("Loading the leaderboard failed:", error);
    return NextResponse.json({ entries: [] }, { status: 500 });
  }
}