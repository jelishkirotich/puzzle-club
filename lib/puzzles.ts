export type PuzzleKind = "sudoku" | "wordsearch";
export type Difficulty = "Easy" | "Medium" | "Hard";

export type PuzzleSummary = {
  id: string;
  title: string;
  description: string;
  kind: PuzzleKind;
  difficulty: Difficulty;
  author: string;
  solves: number;
  messages: number;
  createdAt: string;
};

export const samplePuzzles: PuzzleSummary[] = [
  {
    id: "focused-finish",
    title: "A focused finish",
    description: "A little more to think about, one row at a time.",
    kind: "sudoku",
    difficulty: "Medium",
    author: "Puzzle Club",
    solves: 0,
    messages: 0,
    createdAt: "2026-11-20",
  },
  {
    id: "club-warm-up",
    title: "Puzzle club warm up",
    description: "Find the words hiding in this little grid.",
    kind: "wordsearch",
    difficulty: "Easy",
    author: "Puzzle Club",
    solves: 0,
    messages: 0,
    createdAt: "2026-11-20",
  },
  {
    id: "gentle-start",
    title: "The gentle start",
    description: "A classic grid to settle in with.",
    kind: "sudoku",
    difficulty: "Easy",
    author: "Puzzle Club",
    solves: 0,
    messages: 0,
    createdAt: "2026-11-20",
  },
];
export type PuzzleDetail = {
  id: string;
  title: string;
  note: string;
  kind: PuzzleKind;
  difficulty: Difficulty;
  author: string;
  size: number;
  grid: string[];
  words: string[];
};