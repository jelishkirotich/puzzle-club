import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "@/lib/firebase";
import { checkSudoku, sudokuSizes, type SudokuSize } from "@/lib/sudoku";
import { findWord, gridSizes, validateWords } from "@/lib/wordsearch";

const difficulties = ["Easy", "Medium", "Hard"];

function fail(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;

  if (!body) return fail("Something went wrong with that request.");

  const title = String(body.title ?? "").trim();
  const note = String(body.note ?? "").trim();
  const author = String(body.author ?? "").trim();
  const kind = body.kind;
  const difficulty = String(body.difficulty ?? "");
  const size = Number(body.size);

  if (title.length < 3 || title.length > 80) {
    return fail("The title needs 3 to 80 characters.");
  }
  if (author.length < 2 || author.length > 30) {
    return fail("The display name needs 2 to 30 characters.");
  }
  if (note.length > 240) return fail("The note is too long.");
  if (!difficulties.includes(difficulty)) return fail("Pick a difficulty.");
  if (kind !== "sudoku" && kind !== "wordsearch") {
    return fail("Pick a kind of puzzle.");
  }

  let grid: string[];
  let words: string[] = [];
  let solution: string[] | null = null;

  if (kind === "sudoku") {
    if (!sudokuSizes.includes(size as SudokuSize)) return fail("Pick a grid size.");

    const cells = body.grid;
    const allowed = new RegExp(`^[1-${size}]?$`);
    if (
      !Array.isArray(cells) ||
      cells.length !== size * size ||
      !cells.every((cell) => typeof cell === "string" && allowed.test(cell))
    ) {
      return fail("The Sudoku grid is not valid.");
    }

    const check = checkSudoku(cells as string[], size as SudokuSize);
    if (check.status !== "valid" || !check.solution) return fail(check.message);

    grid = cells as string[];
    solution = check.solution;
  } else {
    if (!gridSizes.includes(size)) return fail("Pick a grid size.");

    const rows = body.grid;
    if (
      !Array.isArray(rows) ||
      rows.length !== size ||
      !rows.every(
        (row) => typeof row === "string" && row.length === size && /^[A-Z]+$/.test(row)
      )
    ) {
      return fail("The letter grid is not valid.");
    }

    words = Array.isArray(body.words)
      ? body.words.map((word) => String(word).trim().toUpperCase())
      : [];

    const problem = validateWords(words, size);
    if (problem) return fail(problem);

    if (!words.every((word) => findWord(rows as string[], word))) {
      return fail("A word is missing from the grid. Shuffle and try again.");
    }
    grid = rows as string[];
  }

  try {
    const firestore = db();
    const ref = firestore.collection("puzzles").doc();
    const batch = firestore.batch();

    batch.set(ref, {
      title,
      note,
      kind,
      difficulty,
      author,
      size,
      grid,
      words,
      solveCount: 0,
      messageCount: 0,
      createdAt: FieldValue.serverTimestamp(),
    });

    if (solution) {
      batch.set(firestore.collection("puzzleSecrets").doc(ref.id), { solution });
    }

    await batch.commit();
    return NextResponse.json({ id: ref.id }, { status: 201 });
  } catch (error) {
    console.error("Saving the puzzle failed:", error);
    return fail(
      "The puzzle could not be saved. Check your Firebase keys in .env.local.",
      500
    );
  }
}