import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";

export async function GET(request: Request) {
  const date = new URL(request.url).searchParams.get("date") ?? "";

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ entries: [] }, { status: 400 });
  }

  try {
    const snapshot = await db()
      .collection("dailies")
      .doc(date)
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
    console.error("Loading the daily leaderboard failed:", error);
    return NextResponse.json({ entries: [] }, { status: 500 });
  }
}