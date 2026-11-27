import { boxOf, solveSudoku, type SudokuSize } from "@/lib/sudoku";
import type { Difficulty } from "@/lib/puzzles";

const TARGETS: Record<SudokuSize, Record<Difficulty, number>> = {
  4: { Easy: 10, Medium: 8, Hard: 6 },
  6: { Easy: 22, Medium: 17, Hard: 13 },
  9: { Easy: 40, Medium: 33, Hard: 27 },
};

const SALT: Record<Difficulty, number> = { Easy: 11, Medium: 23, Hard: 37 };

function makeRng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(items: T[], rng: () => number): T[] {
  const list = [...items];
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

function randomSolution(size: SudokuSize, rng: () => number): string[] {
  const total = size * size;

  for (let attempt = 0; attempt < 50; attempt++) {
    const cells = Array<number>(total).fill(0);
    const rowMask = Array<number>(size).fill(0);
    const colMask = Array<number>(size).fill(0);
    const boxMask = Array<number>(size).fill(0);
    let nodes = 0;

    const fill = (i: number): boolean => {
      if (i === total) return true;
      if (++nodes > 50000) return false;

      const r = Math.floor(i / size);
      const c = i % size;
      const b = boxOf(i, size);
      const order = shuffle(
        Array.from({ length: size }, (_, k) => k + 1),
        rng
      );

      for (const digit of order) {
        const bit = 1 << (digit - 1);
        if ((rowMask[r] | colMask[c] | boxMask[b]) & bit) continue;

        cells[i] = digit;
        rowMask[r] |= bit;
        colMask[c] |= bit;
        boxMask[b] |= bit;

        if (fill(i + 1)) return true;

        cells[i] = 0;
        rowMask[r] &= ~bit;
        colMask[c] &= ~bit;
        boxMask[b] &= ~bit;
      }
      return false;
    };

    if (fill(0)) return cells.map(String);
  }

  throw new Error("Could not build a grid.");
}

function solvableBySingles(grid: string[], size: SudokuSize): boolean {
  const total = size * size;
  const full = (1 << size) - 1;
  const cells = grid.map((value) => (value ? Number(value) : 0));

  const units: number[][] = [];
  for (let u = 0; u < size; u++) {
    const row: number[] = [];
    const col: number[] = [];
    const box: number[] = [];
    for (let k = 0; k < size; k++) {
      row.push(u * size + k);
      col.push(k * size + u);
    }
    for (let i = 0; i < total; i++) {
      if (boxOf(i, size) === u) box.push(i);
    }
    units.push(row, col, box);
  }

  const single = (mask: number) => mask !== 0 && (mask & (mask - 1)) === 0;

  let progress = true;
  while (progress) {
    progress = false;

    const used = units.map((unit) =>
      unit.reduce(
        (mask, i) => (cells[i] ? mask | (1 << (cells[i] - 1)) : mask),
        0
      )
    );

    const cand = Array<number>(total).fill(0);
    for (let i = 0; i < total; i++) {
      if (cells[i]) continue;
      const r = Math.floor(i / size);
      const c = i % size;
      const b = boxOf(i, size);
      cand[i] = full & ~(used[3 * r] | used[3 * c + 1] | used[3 * b + 2]);
      if (cand[i] === 0) return false;
    }

    for (let i = 0; i < total; i++) {
      if (!cells[i] && single(cand[i])) {
        cells[i] = Math.log2(cand[i]) + 1;
        progress = true;
      }
    }

    for (const unit of units) {
      for (let digit = 1; digit <= size; digit++) {
        const bit = 1 << (digit - 1);
        let spot = -1;
        let count = 0;

        for (const i of unit) {
          if (cells[i] === digit) {
            count = 2;
            break;
          }
          if (!cells[i] && (cand[i] & bit)) {
            count++;
            spot = i;
          }
        }

        if (count === 1 && !cells[spot]) {
          cells[spot] = digit;
          progress = true;
        }
      }
    }
  }

  return cells.every(Boolean);
}

type Generated = { puzzle: string[]; solution: string[] };

const cache = new Map<string, Generated>();

export function generatePuzzle(
  size: SudokuSize,
  level: Difficulty,
  seed: number
): Generated {
  const key = `${size}-${level}-${seed}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const rng = makeRng(seed * 31 + size * 7 + SALT[level]);
  const solution = randomSolution(size, rng);
  const target = TARGETS[size][level];
  const needSingles = level === "Easy";

  const puzzle = [...solution];
  let clues = size * size;

  const order = shuffle(
    Array.from({ length: size * size }, (_, i) => i),
    rng
  );

  for (const index of order) {
    if (clues <= target) break;

    const kept = puzzle[index];
    puzzle[index] = "";

    const result = solveSudoku(puzzle, size, 2);
    const unique = result.count === 1 && !result.gaveUp;

    if (unique && (!needSingles || solvableBySingles(puzzle, size))) {
      clues--;
    } else {
      puzzle[index] = kept;
    }
  }

  const generated = { puzzle, solution };
  if (cache.size >= 60) {
    const oldest = cache.keys().next().value;
    if (oldest) cache.delete(oldest);
  }
  cache.set(key, generated);
  return generated;
}