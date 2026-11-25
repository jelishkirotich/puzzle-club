import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "@/lib/firebase";

type Context = { params: Promise<{ id: string }> };

function fail(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request, { params }: Context) {
  const { id } = await params;
  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;

  if (!body) return fail("Something went wrong with that request.");

  const solver = String(body.solver ?? "").trim();
  if (solver.length < 2 || solver.length > 30) {
    return fail("Add your display name first.");
  }

  try {
    const firestore = db();
    const puzzleRef = firestore.collection("puzzles").doc(id);
    const snapshot = await puzzleRef.get();
    if (!snapshot.exists) return fail("That puzzle could not be found.", 404);

    const puzzle = snapshot.data() ?? {};
    let correct = false;
    const wrong: number[] = [];
    let empty = 0;

    if (puzzle.kind === "sudoku") {
      const secret = await firestore.collection("puzzleSecrets").doc(id).get();
      const solution = secret.data()?.solution as string[] | undefined;
      const submitted = body.grid;

      if (
        !solution ||
        !Array.isArray(submitted) ||
        submitted.length !== solution.length
      ) {
        return fail("That answer could not be checked.");
      }

      submitted.forEach((value, index) => {
        if (!value) empty++;
        else if (value !== solution[index]) wrong.push(index);
      });
      correct = empty === 0 && wrong.length === 0;
    } else {
      const found = Array.isArray(body.found)
        ? body.found.map((word) => String(word).toUpperCase())
        : [];
      const words = (puzzle.words ?? []) as string[];
      correct = words.length > 0 && words.every((word) => found.includes(word));
    }

    if (correct) {
      const slug =
        solver.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40) || "solver";
      const solveRef = puzzleRef.collection("solves").doc(slug);
      const existing = await solveRef.get();

      if (!existing.exists) {
        const batch = firestore.batch();
        batch.set(solveRef, { solver, createdAt: FieldValue.serverTimestamp() });
        batch.update(puzzleRef, { solveCount: FieldValue.increment(1) });
        await batch.commit();
      }
    }

    return NextResponse.json({ correct, wrong, empty });
  } catch (error) {
    console.error("Checking the puzzle failed:", error);
    return fail("That could not be checked right now.", 500);
  }
}