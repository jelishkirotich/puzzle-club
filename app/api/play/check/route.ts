import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "@/lib/firebase";
import { DAILY, dailySeed, recentKeys } from "@/lib/daily";
import { generatePuzzle } from "@/lib/generator";
import { sudokuSizes, type SudokuSize } from "@/lib/sudoku";
import type { Difficulty } from "@/lib/puzzles";

const levels = ["Easy", "Medium", "Hard"];

function fail(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;

  if (!body) return fail("Something went wrong with that request.");

  const size = Number(body.size);
  const seed = Number(body.seed);
  const level = String(body.level);
  const submitted = body.grid;

  if (!sudokuSizes.includes(size as SudokuSize)) return fail("Unknown grid size.");
  if (!levels.includes(level)) return fail("Unknown level.");
  if (!Number.isInteger(seed) || seed < 0 || seed > 4294967295) {
    return fail("Unknown puzzle.");
  }
  if (!Array.isArray(submitted) || submitted.length !== size * size) {
    return fail("That answer could not be checked.");
  }

  const rawTime = Number(body.time);
  const timeSeconds =
    Number.isFinite(rawTime) && rawTime > 0 && rawTime < 86400
      ? Math.round(rawTime)
      : null;

  try {
    const { solution } = generatePuzzle(
      size as SudokuSize,
      level as Difficulty,
      seed
    );

    const wrong: number[] = [];
    let empty = 0;

    submitted.forEach((value, index) => {
      if (!value) empty++;
      else if (value !== solution[index]) wrong.push(index);
    });

    const correct = empty === 0 && wrong.length === 0;

    const dailyKey = typeof body.daily === "string" ? body.daily : null;
    const solver = String(body.solver ?? "").trim();

    if (
      correct &&
      dailyKey &&
      recentKeys().includes(dailyKey) &&
      seed === dailySeed(dailyKey) &&
      size === DAILY.size &&
      level === DAILY.level &&
      solver.length >= 2 &&
      solver.length <= 30
    ) {
      const slug =
        solver.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40) || "solver";
      const ref = db()
        .collection("dailies")
        .doc(dailyKey)
        .collection("solves")
        .doc(slug);
      const existing = await ref.get();

      if (!existing.exists) {
        await ref.set({
          solver,
          timeSeconds,
          createdAt: FieldValue.serverTimestamp(),
        });
      } else if (timeSeconds !== null) {
        const previous = existing.data()?.timeSeconds;
        if (typeof previous !== "number" || timeSeconds < previous) {
          await ref.update({ timeSeconds });
        }
      }
    }

    return NextResponse.json({ correct, wrong, empty });
  } catch (error) {
    console.error("Checking the generated puzzle failed:", error);
    return fail("That could not be checked right now.", 500);
  }
}