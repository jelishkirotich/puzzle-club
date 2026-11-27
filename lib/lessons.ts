export type LessonLevel = "Beginner" | "Intermediate" | "Advanced";

export type Diagram = {
  cols: number;
  given: string;
  box?: [number, number];
  notes?: Record<number, string>;
  shade?: number[];
  focus?: number[];
  answer?: Record<number, string>;
  strike?: Record<number, string>;
};

export type Step = { title: string; text: string; diagram: Diagram };
export type Source = { label: string; url: string };

export type Lesson = {
  slug: string;
  level: LessonLevel;
  title: string;
  summary: string;
  steps: Step[];
  sources: Source[];
};

const at = (r: number, c: number) => r * 9 + c;
const rowCells = (r: number) => Array.from({ length: 9 }, (_, c) => at(r, c));
const colCells = (c: number) => Array.from({ length: 9 }, (_, r) => at(r, c));
const boxCells = (br: number, bc: number) =>
  Array.from({ length: 9 }, (_, i) =>
    at(br * 3 + Math.floor(i / 3), bc * 3 + (i % 3))
  );

const board = (entries: [number, number, string][]) => {
  const cells = Array<string>(81).fill(".");
  for (const [r, c, value] of entries) cells[at(r, c)] = value;
  return cells.join("");
};

const EMPTY = ".".repeat(81);
const CLASSIC = [
  "53..7....",
  "6..195...",
  ".98....6.",
  "8...6...3",
  "4..8.3..1",
  "7...2...6",
  ".6....28.",
  "...419..5",
  "....8..79",
].join("");
const SMALL = "1..4.41.2..3.32.";

const small = (extra: Partial<Diagram>): Diagram => ({
  cols: 4,
  given: SMALL,
  ...extra,
});
const classic = (extra: Partial<Diagram>): Diagram => ({
  cols: 9,
  given: CLASSIC,
  ...extra,
});
const blank = (extra: Partial<Diagram>): Diagram => ({
  cols: 9,
  given: EMPTY,
  ...extra,
});
const strip = (given: string, extra: Partial<Diagram>): Diagram => ({
  cols: 9,
  given,
  box: [0, 0],
  ...extra,
});

const SUDOKUWIKI: Source = { label: "SudokuWiki", url: "https://www.sudokuwiki.org" };
const KRAZYDAD: Source = {
  label: "KrazyDad solving techniques",
  url: "https://krazydad.com/sudokustrategy",
};
const THONKY: Source = {
  label: "Thonky Sudoku strategies",
  url: "https://www.thonky.com/sudoku",
};
const BRAINZILLA: Source = {
  label: "BrainZilla strategy guide",
  url: "https://brainzilla.com/logic/sudoku/how-to-play-and-strategies",
};
const DAL: Source = {
  label: "Sudoku Helper strategy notes",
  url: "https://www.mathstat.dal.ca/~jpg/sudoku/strategies.html",
};

export const levels: { name: LessonLevel; blurb: string }[] = [
  {
    name: "Beginner",
    blurb: "Start here. You only need patience. No guessing and no maths.",
  },
  {
    name: "Intermediate",
    blurb: "When the easy squares run out, pencil marks and pairs take over.",
  },
  {
    name: "Advanced",
    blurb: "Patterns that stretch across the whole grid, for puzzles that refuse to budge.",
  },
];

export const references: { label: string; url: string; note: string }[] = [
  {
    label: "SudokuWiki",
    url: "https://www.sudokuwiki.org",
    note: "The most thorough catalogue of techniques, from pairs up to chains and fish, with a solver.",
  },
  {
    label: "KrazyDad solving techniques",
    url: "https://krazydad.com/sudokustrategy",
    note: "A long list of techniques ordered from simple to advanced.",
  },
  {
    label: "Thonky Sudoku strategies",
    url: "https://www.thonky.com/sudoku",
    note: "Strategy pages grouped as basic, advanced and challenging, plus a solver.",
  },
  {
    label: "BrainZilla strategy guide",
    url: "https://brainzilla.com/logic/sudoku/how-to-play-and-strategies",
    note: "A compact guide that runs from naked singles to XY-Wings.",
  },
  {
    label: "Sudoku Helper strategy notes",
    url: "https://www.mathstat.dal.ca/~jpg/sudoku/strategies.html",
    note: "Short notes that group techniques by the logic behind them.",
  },
];

const topLeftBox = boxCells(0, 0);

export const lessons: Lesson[] = [
  {
    slug: "start-small",
    level: "Beginner",
    title: "Start with a 4 by 4",
    summary: "Learn the one rule on a grid small enough to see all at once.",
    sources: [THONKY, BRAINZILLA],
    steps: [
      {
        title: "The one rule",
        text: "Every row, every column and every 2 by 2 box must hold the numbers 1 to 4, each exactly once. Bigger grids use the same rule with more numbers. This top row already has a 1 and a 4.",
        diagram: small({ shade: [0, 1, 2, 3] }),
      },
      {
        title: "Find what is missing",
        text: "The top row still needs a 2 and a 3. Look at the empty square second from the left. Its column already holds a 4 and a 3, so a 3 cannot go there. That leaves the 2.",
        diagram: small({
          shade: [0, 1, 2, 3, 1, 5, 9, 13],
          focus: [1],
          notes: { 1: "23" },
          strike: { 1: "3" },
        }),
      },
      {
        title: "Write it in",
        text: "Put the 2 in. The square beside it must now be a 3, because the top row needs a 3 and nothing else is left.",
        diagram: small({ shade: [0, 1, 2, 3], answer: { 1: "2", 2: "3" } }),
      },
      {
        title: "Keep going",
        text: "Treat every square the same way: rule out the numbers its row, column and box already hold, and see what is left. In this puzzle each empty square has exactly one possibility from the start, so it finishes without a single guess.",
        diagram: small({
          answer: { 1: "2", 2: "3", 4: "3", 7: "2", 9: "1", 10: "4", 12: "4", 15: "1" },
        }),
      },
    ],
  },
  {
    slug: "scanning",
    level: "Beginner",
    title: "Scan for a missing number",
    summary: "Pick a number and hunt for the one square in a box where it fits.",
    sources: [KRAZYDAD, THONKY],
    steps: [
      {
        title: "Choose a number and a box",
        text: "Take the 5 and the top right box. That box has no 5 yet, so one of its empty squares must hold it. The 5s already on the grid are highlighted.",
        diagram: classic({
          shade: boxCells(0, 2),
          focus: [at(0, 0), at(1, 5), at(7, 8)],
        }),
      },
      {
        title: "Block out rows and columns",
        text: "A 5 sits in the top row and another in the second row, so no 5 can go on either row. The 5 near the bottom right sits in the last column, which blocks the right edge of the box too.",
        diagram: classic({
          shade: [...rowCells(0), ...rowCells(1), ...colCells(8)],
          focus: [at(0, 0), at(1, 5), at(7, 8)],
        }),
      },
      {
        title: "One square is left",
        text: "Only one open square in the box survives, at the left end of its bottom row. The 5 goes there.",
        diagram: classic({
          shade: [...rowCells(0), ...rowCells(1), ...colCells(8)],
          focus: [at(0, 0), at(1, 5), at(7, 8)],
          answer: { [at(2, 6)]: "5" },
        }),
      },
      {
        title: "Repeat with every number",
        text: "Run through 1 to 9 for each box. This habit, often called scanning or cross hatching, solves most easy puzzles on its own.",
        diagram: classic({ answer: { [at(2, 6)]: "5" } }),
      },
    ],
  },
  {
    slug: "naked-singles",
    level: "Beginner",
    title: "Naked singles",
    summary: "A square that has only one number left to try.",
    sources: [KRAZYDAD, SUDOKUWIKI],
    steps: [
      {
        title: "Look at one square",
        text: "Instead of asking where a number goes, ask what can go in a square. Take the centre one.",
        diagram: classic({ focus: [at(4, 4)] }),
      },
      {
        title: "Rule out what you can see",
        text: "Its row holds 4, 8, 3 and 1. Its column holds 7, 9, 6, 2, 1 and 8. Its box holds 6, 8, 3 and 2. Together that rules out every number except one.",
        diagram: classic({
          shade: [...rowCells(4), ...colCells(4), ...boxCells(1, 1)],
          focus: [at(4, 4)],
        }),
      },
      {
        title: "One number survives",
        text: "Only 5 is left. A square with a single possibility is called a naked single, and you can write it in straight away.",
        diagram: classic({
          shade: [...rowCells(4), ...colCells(4), ...boxCells(1, 1)],
          answer: { [at(4, 4)]: "5" },
        }),
      },
      {
        title: "Pencil marks make them visible",
        text: "On paper, write the possible numbers small in each empty square. Squares left with one mark are naked singles. This puzzle starts with four of them.",
        diagram: classic({
          notes: {
            [at(4, 4)]: "5",
            [at(6, 5)]: "7",
            [at(6, 8)]: "4",
            [at(7, 7)]: "3",
          },
          focus: [at(4, 4), at(6, 5), at(6, 8), at(7, 7)],
        }),
      },
    ],
  },
  {
    slug: "hidden-singles",
    level: "Beginner",
    title: "Hidden singles",
    summary: "A number that has only one place to go in a row, column or box.",
    sources: [KRAZYDAD, THONKY],
    steps: [
      {
        title: "Write the possibilities",
        text: "These are the pencil marks for the bottom left box. Most squares have several possibilities, so no single square gives itself away.",
        diagram: classic({
          shade: boxCells(2, 0),
          notes: {
            [at(6, 0)]: "139",
            [at(6, 2)]: "134579",
            [at(7, 0)]: "23",
            [at(7, 1)]: "278",
            [at(7, 2)]: "237",
            [at(8, 0)]: "123",
            [at(8, 1)]: "1245",
            [at(8, 2)]: "12345",
          },
        }),
      },
      {
        title: "Hunt for a number that appears once",
        text: "Run your eye over the marks for each number. The 8 shows up in only one square of this box.",
        diagram: classic({
          shade: boxCells(2, 0),
          focus: [at(7, 1)],
          notes: {
            [at(6, 0)]: "139",
            [at(6, 2)]: "134579",
            [at(7, 0)]: "23",
            [at(7, 1)]: "278",
            [at(7, 2)]: "237",
            [at(8, 0)]: "123",
            [at(8, 1)]: "1245",
            [at(8, 2)]: "12345",
          },
        }),
      },
      {
        title: "It has to go there",
        text: "The box needs an 8 somewhere and this is the only square that can hold one. The square also lists 2 and 7, but those marks no longer matter. Write the 8.",
        diagram: classic({
          shade: boxCells(2, 0),
          answer: { [at(7, 1)]: "8" },
          notes: {
            [at(6, 0)]: "139",
            [at(6, 2)]: "134579",
            [at(7, 0)]: "23",
            [at(7, 2)]: "237",
            [at(8, 0)]: "123",
            [at(8, 1)]: "1245",
            [at(8, 2)]: "12345",
          },
        }),
      },
      {
        title: "Why it is called hidden",
        text: "The square looked undecided, with three possibilities, until you compared it with its neighbours. A naked single is different: the square itself has only one possibility left.",
        diagram: classic({
          shade: boxCells(2, 0),
          answer: { [at(7, 1)]: "8" },
        }),
      },
    ],
  },
  {
    slug: "naked-pairs",
    level: "Intermediate",
    title: "Naked pairs",
    summary: "Two squares that share the same two numbers, and what that frees up.",
    sources: [SUDOKUWIKI, BRAINZILLA],
    steps: [
      {
        title: "Spot the pair",
        text: "Here is one row with its pencil marks. Two squares can each hold only a 2 or a 7. That is a naked pair.",
        diagram: strip("5...8.3..", {
          notes: { 1: "27", 2: "27", 3: "129", 5: "247", 7: "179", 8: "469" },
          focus: [1, 2],
        }),
      },
      {
        title: "Reason about the pair",
        text: "Those two squares will use up the 2 and the 7 between them, in one order or the other. We do not know which yet, but we know no other square in the row can be a 2 or a 7.",
        diagram: strip("5...8.3..", {
          notes: { 1: "27", 2: "27", 3: "129", 5: "247", 7: "179", 8: "469" },
          focus: [1, 2],
        }),
      },
      {
        title: "Cross them out",
        text: "Remove the 2 and the 7 from every other square in the row.",
        diagram: strip("5...8.3..", {
          notes: { 1: "27", 2: "27", 3: "129", 5: "247", 7: "179", 8: "469" },
          focus: [1, 2],
          strike: { 3: "2", 5: "27", 7: "7" },
        }),
      },
      {
        title: "See what it unlocks",
        text: "The square that held 2, 4 and 7 now has only a 4 left, so it is a naked single. That 4 also leaves the last square in the row. The same idea works with three squares and three numbers, called a naked triple.",
        diagram: strip("5...8.3..", {
          notes: { 1: "27", 2: "27", 3: "19", 7: "19", 8: "469" },
          focus: [1, 2],
          answer: { 5: "4" },
          strike: { 8: "4" },
        }),
      },
    ],
  },
  {
    slug: "hidden-pairs",
    level: "Intermediate",
    title: "Hidden pairs",
    summary: "Two numbers that have only two homes, buried among other marks.",
    sources: [SUDOKUWIKI, BRAINZILLA],
    steps: [
      {
        title: "Write the marks",
        text: "Here is another row with its pencil marks. Look for two numbers that each appear in only two squares of the row.",
        diagram: strip("1....4.9.", {
          notes: { 1: "257", 2: "238", 3: "2567", 4: "567", 6: "368", 8: "257" },
        }),
      },
      {
        title: "Find the hidden pair",
        text: "The numbers 3 and 8 appear in just two squares, the third and the seventh. Both numbers need a home in this row, so between them these two squares must hold a 3 and an 8.",
        diagram: strip("1....4.9.", {
          notes: { 1: "257", 2: "238", 3: "2567", 4: "567", 6: "368", 8: "257" },
          focus: [2, 6],
        }),
      },
      {
        title: "Strip the extras",
        text: "Since those two squares are spoken for, remove every other mark from them: the 2 from one and the 6 from the other.",
        diagram: strip("1....4.9.", {
          notes: { 1: "257", 2: "238", 3: "2567", 4: "567", 6: "368", 8: "257" },
          focus: [2, 6],
          strike: { 2: "2", 6: "6" },
        }),
      },
      {
        title: "Compare with naked pairs",
        text: "A naked pair removes marks from the neighbours. A hidden pair removes marks from the two squares themselves. Either way you end up with a clean pair and fewer possibilities everywhere else.",
        diagram: strip("1....4.9.", {
          notes: { 1: "257", 2: "38", 3: "2567", 4: "567", 6: "38", 8: "257" },
          focus: [2, 6],
        }),
      },
    ],
  },
  {
    slug: "pointing-pairs",
    level: "Intermediate",
    title: "Pointing pairs",
    summary: "When a number in a box can only sit along one line, it clears that line.",
    sources: [SUDOKUWIKI, THONKY],
    steps: [
      {
        title: "Look inside one box",
        text: "In the top left box, the 5 lower down the first column rules out three squares, and the other squares are already filled. Only two squares can still hold this box's 5, and both are in the top row. Only the squares that matter are marked.",
        diagram: blank({
          given: board([
            [4, 0, "5"],
            [1, 1, "2"],
            [1, 2, "9"],
            [2, 1, "7"],
            [2, 2, "4"],
          ]),
          shade: [...topLeftBox, ...colCells(0)],
          focus: [at(0, 1), at(0, 2)],
          notes: {
            [at(0, 0)]: "13",
            [at(1, 0)]: "36",
            [at(2, 0)]: "18",
            [at(0, 1)]: "56",
            [at(0, 2)]: "35",
            [at(0, 4)]: "158",
            [at(0, 7)]: "56",
          },
        }),
      },
      {
        title: "The pair points along the row",
        text: "The box's 5 must land in one of those two squares. Whichever it is, it sits in the top row, so the top row's 5 is already used up inside this box.",
        diagram: blank({
          given: board([
            [4, 0, "5"],
            [1, 1, "2"],
            [1, 2, "9"],
            [2, 1, "7"],
            [2, 2, "4"],
          ]),
          shade: rowCells(0),
          focus: [at(0, 1), at(0, 2)],
          notes: {
            [at(0, 0)]: "13",
            [at(0, 1)]: "56",
            [at(0, 2)]: "35",
            [at(0, 4)]: "158",
            [at(0, 7)]: "56",
          },
        }),
      },
      {
        title: "Clear the rest of the row",
        text: "No other square in the top row can be a 5. Remove it from the marks in the squares outside the box.",
        diagram: blank({
          given: board([
            [4, 0, "5"],
            [1, 1, "2"],
            [1, 2, "9"],
            [2, 1, "7"],
            [2, 2, "4"],
          ]),
          shade: rowCells(0),
          focus: [at(0, 1), at(0, 2)],
          notes: {
            [at(0, 0)]: "13",
            [at(0, 1)]: "56",
            [at(0, 2)]: "35",
            [at(0, 4)]: "158",
            [at(0, 7)]: "56",
          },
          strike: { [at(0, 4)]: "5", [at(0, 7)]: "5" },
        }),
      },
      {
        title: "The name and its mirror",
        text: "Two squares in a box pointing along a line make a pointing pair, and three make a pointing triple. The mirror version, box line reduction, works the other way: if a number in a row can only sit inside one box, remove it from the rest of that box.",
        diagram: blank({
          given: board([
            [4, 0, "5"],
            [1, 1, "2"],
            [1, 2, "9"],
            [2, 1, "7"],
            [2, 2, "4"],
          ]),
          focus: [at(0, 1), at(0, 2)],
          notes: {
            [at(0, 0)]: "13",
            [at(0, 1)]: "56",
            [at(0, 2)]: "35",
            [at(0, 4)]: "18",
            [at(0, 7)]: "6",
          },
        }),
      },
    ],
  },
  {
    slug: "x-wing",
    level: "Advanced",
    title: "X-Wing",
    summary: "Four corners that lock a number into two rows and two columns.",
    sources: [SUDOKUWIKI, THONKY, BRAINZILLA],
    steps: [
      {
        title: "Look at one number",
        text: "Pick a digit, here 4, and mark every square where it could still go. Only the 4s are drawn, so the picture stays readable.",
        diagram: blank({
          notes: {
            [at(1, 2)]: "4",
            [at(1, 6)]: "4",
            [at(5, 2)]: "4",
            [at(5, 6)]: "4",
            [at(0, 2)]: "4",
            [at(7, 2)]: "4",
            [at(3, 6)]: "4",
            [at(8, 6)]: "4",
            [at(0, 5)]: "4",
            [at(4, 3)]: "4",
            [at(6, 8)]: "4",
            [at(2, 0)]: "4",
          },
        }),
      },
      {
        title: "Find two rows with exactly two spots",
        text: "Rows two and six each have only two squares that could hold a 4, and they line up in the same two columns, three and seven. The four corners form a rectangle.",
        diagram: blank({
          shade: [...rowCells(1), ...rowCells(5)],
          focus: [at(1, 2), at(1, 6), at(5, 2), at(5, 6)],
          notes: {
            [at(1, 2)]: "4",
            [at(1, 6)]: "4",
            [at(5, 2)]: "4",
            [at(5, 6)]: "4",
            [at(0, 2)]: "4",
            [at(7, 2)]: "4",
            [at(3, 6)]: "4",
            [at(8, 6)]: "4",
            [at(0, 5)]: "4",
            [at(4, 3)]: "4",
            [at(6, 8)]: "4",
            [at(2, 0)]: "4",
          },
        }),
      },
      {
        title: "Follow both possibilities",
        text: "If row two puts its 4 in column three, row six cannot use that column, so its 4 goes in column seven. If row two uses column seven, row six uses column three. Either way, columns three and seven get their 4 from these two rows.",
        diagram: blank({
          focus: [at(1, 2), at(1, 6), at(5, 2), at(5, 6)],
          shade: [...colCells(2), ...colCells(6)],
          notes: {
            [at(1, 2)]: "4",
            [at(1, 6)]: "4",
            [at(5, 2)]: "4",
            [at(5, 6)]: "4",
            [at(0, 2)]: "4",
            [at(7, 2)]: "4",
            [at(3, 6)]: "4",
            [at(8, 6)]: "4",
            [at(0, 5)]: "4",
            [at(4, 3)]: "4",
            [at(6, 8)]: "4",
            [at(2, 0)]: "4",
          },
        }),
      },
      {
        title: "Clear the columns",
        text: "So no other square in those two columns can be a 4. Remove the 4 from each of them. The squares outside the columns keep theirs.",
        diagram: blank({
          shade: [...colCells(2), ...colCells(6)],
          focus: [at(1, 2), at(1, 6), at(5, 2), at(5, 6)],
          notes: {
            [at(1, 2)]: "4",
            [at(1, 6)]: "4",
            [at(5, 2)]: "4",
            [at(5, 6)]: "4",
            [at(0, 2)]: "4",
            [at(7, 2)]: "4",
            [at(3, 6)]: "4",
            [at(8, 6)]: "4",
            [at(0, 5)]: "4",
            [at(4, 3)]: "4",
            [at(6, 8)]: "4",
            [at(2, 0)]: "4",
          },
          strike: {
            [at(0, 2)]: "4",
            [at(7, 2)]: "4",
            [at(3, 6)]: "4",
            [at(8, 6)]: "4",
          },
        }),
      },
      {
        title: "Turn it sideways",
        text: "The same pattern works rotated: two columns whose only 4s sit in the same two rows. Then you clear the 4s from those rows. Bigger versions use three or four lines and are called Swordfish and Jellyfish.",
        diagram: blank({
          focus: [at(1, 2), at(1, 6), at(5, 2), at(5, 6)],
          notes: {
            [at(1, 2)]: "4",
            [at(1, 6)]: "4",
            [at(5, 2)]: "4",
            [at(5, 6)]: "4",
            [at(0, 5)]: "4",
            [at(4, 3)]: "4",
            [at(6, 8)]: "4",
            [at(2, 0)]: "4",
          },
        }),
      },
    ],
  },
  {
    slug: "xy-wing",
    level: "Advanced",
    title: "XY-Wing",
    summary: "Three squares with two marks each that force a number out of a fourth.",
    sources: [SUDOKUWIKI, BRAINZILLA, DAL],
    steps: [
      {
        title: "Find three squares with two marks",
        text: "The top left square is the pivot with marks 1 and 2. One partner in its row has 1 and 3. The other partner in its column has 2 and 3. The pivot must see both partners, in the same row, column or box.",
        diagram: blank({
          shade: [...rowCells(0), ...colCells(0)],
          focus: [at(0, 0), at(0, 4), at(4, 0)],
          notes: {
            [at(0, 0)]: "12",
            [at(0, 4)]: "13",
            [at(4, 0)]: "23",
            [at(4, 4)]: "379",
          },
        }),
      },
      {
        title: "Try the pivot as 1",
        text: "If the pivot is a 1, the partner in its row cannot be a 1, so it becomes a 3.",
        diagram: blank({
          shade: rowCells(0),
          answer: { [at(0, 0)]: "1", [at(0, 4)]: "3" },
          notes: { [at(4, 0)]: "23", [at(4, 4)]: "379" },
        }),
      },
      {
        title: "Try the pivot as 2",
        text: "If the pivot is a 2, the partner in its column cannot be a 2, so it becomes a 3.",
        diagram: blank({
          shade: colCells(0),
          answer: { [at(0, 0)]: "2", [at(4, 0)]: "3" },
          notes: { [at(0, 4)]: "13", [at(4, 4)]: "379" },
        }),
      },
      {
        title: "Either way, a partner is 3",
        text: "The pivot has to be a 1 or a 2, so one of the two partners is always a 3. We do not know which one, and we do not need to. Any square that sees both partners cannot be a 3.",
        diagram: blank({
          focus: [at(0, 0), at(0, 4), at(4, 0)],
          notes: {
            [at(0, 0)]: "12",
            [at(0, 4)]: "13",
            [at(4, 0)]: "23",
            [at(4, 4)]: "379",
          },
        }),
      },
      {
        title: "Clear the 3",
        text: "The centre square sees one partner along its row and the other along its column. Remove the 3 from its marks.",
        diagram: blank({
          shade: [...rowCells(4), ...colCells(4)],
          focus: [at(0, 4), at(4, 0)],
          notes: {
            [at(0, 0)]: "12",
            [at(0, 4)]: "13",
            [at(4, 0)]: "23",
            [at(4, 4)]: "379",
          },
          strike: { [at(4, 4)]: "3" },
        }),
      },
    ],
  },
];