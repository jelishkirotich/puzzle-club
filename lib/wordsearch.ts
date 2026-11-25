import type { Difficulty } from "@/lib/puzzles";

export type Level = Difficulty;
type Direction = [number, number];

export const gridSizes = [8, 10, 12];

const EASY: Direction[] = [
  [0, 1],
  [1, 0],
];
const MEDIUM: Direction[] = [...EASY, [1, 1], [-1, 1]];
const HARD: Direction[] = [...MEDIUM, [0, -1], [-1, 0], [-1, -1], [1, -1]];

export type Placement = {
  word: string;
  row: number;
  col: number;
  dr: number;
  dc: number;
};

export function splitWords(raw: string): string[] {
  return raw
    .split(/[\s,;]+/)
    .map((word) => word.toUpperCase().replace(/[^A-Z]/g, ""))
    .filter(Boolean);
}

export function validateWords(words: string[], size: number): string | null {
  if (words.length < 3 || words.length > 12) {
    return "Add between 3 and 12 words.";
  }
  for (const word of words) {
    if (!/^[A-Z]+$/.test(word) || word.length < 3 || word.length > size) {
      return `${word} needs 3 to ${size} letters, A to Z only.`;
    }
  }
  if (new Set(words).size !== words.length) {
    return "Each word can only appear once.";
  }
  return null;
}

const randomInt = (max: number) => Math.floor(Math.random() * max);

function tryBuild(words: string[], size: number, directions: Direction[]) {
  const cells = Array.from({ length: size }, () => Array<string>(size).fill(""));
  const placements: Placement[] = [];
  const ordered = [...words].sort((a, b) => b.length - a.length);

  for (const word of ordered) {
    let placed = false;

    for (let attempt = 0; attempt < 400 && !placed; attempt++) {
      const [dr, dc] = directions[randomInt(directions.length)];
      const row = randomInt(size);
      const col = randomInt(size);
      const endRow = row + dr * (word.length - 1);
      const endCol = col + dc * (word.length - 1);

      if (endRow < 0 || endRow >= size || endCol < 0 || endCol >= size) continue;

      let fits = true;
      for (let i = 0; i < word.length; i++) {
        const cell = cells[row + dr * i][col + dc * i];
        if (cell !== "" && cell !== word[i]) {
          fits = false;
          break;
        }
      }
      if (!fits) continue;

      for (let i = 0; i < word.length; i++) {
        cells[row + dr * i][col + dc * i] = word[i];
      }
      placements.push({ word, row, col, dr, dc });
      placed = true;
    }

    if (!placed) return null;
  }

  return { cells, placements };
}

export function arrangeWordSearch(words: string[], size: number, level: Level) {
  const directions = level === "Easy" ? EASY : level === "Medium" ? MEDIUM : HARD;
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  for (let round = 0; round < 60; round++) {
    const built = tryBuild(words, size, directions);
    if (built) {
      const grid = built.cells.map((line) =>
        line.map((cell) => cell || letters[randomInt(letters.length)]).join("")
      );
      return { grid, placements: built.placements };
    }
  }
  return null;
}

export function findWord(grid: string[], word: string): boolean {
  const size = grid.length;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      for (const [dr, dc] of HARD) {
        const endRow = r + dr * (word.length - 1);
        const endCol = c + dc * (word.length - 1);
        if (endRow < 0 || endRow >= size || endCol < 0 || endCol >= size) continue;

        let match = true;
        for (let i = 0; i < word.length; i++) {
          if (grid[r + dr * i][c + dc * i] !== word[i]) {
            match = false;
            break;
          }
        }
        if (match) return true;
      }
    }
  }
  return false;
}