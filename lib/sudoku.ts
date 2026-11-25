export type SudokuSize = 4 | 6 | 9;

export const sudokuSizes: SudokuSize[] = [4, 6, 9];

export function boxShape(size: SudokuSize) {
  if (size === 4) return { rows: 2, cols: 2 };
  if (size === 6) return { rows: 2, cols: 3 };
  return { rows: 3, cols: 3 };
}

function boxOf(index: number, size: SudokuSize) {
  const { rows, cols } = boxShape(size);
  const r = Math.floor(index / size);
  const c = index % size;
  return Math.floor(r / rows) * (size / cols) + Math.floor(c / cols);
}

export function findConflicts(grid: string[], size: SudokuSize): Set<number> {
  const bad = new Set<number>();
  const seen = new Map<string, number>();

  grid.forEach((value, index) => {
    if (!value) return;
    const keys = [
      `r${Math.floor(index / size)}-${value}`,
      `c${index % size}-${value}`,
      `b${boxOf(index, size)}-${value}`,
    ];
    for (const key of keys) {
      const other = seen.get(key);
      if (other !== undefined) {
        bad.add(index);
        bad.add(other);
      } else {
        seen.set(key, index);
      }
    }
  });

  return bad;
}

type SolveResult = {
  count: number;
  solution: string[] | null;
  gaveUp: boolean;
};

function solveSudoku(grid: string[], size: SudokuSize, limit = 2): SolveResult {
  const total = size * size;
  const full = (1 << size) - 1;
  const cells = grid.map((value) => (value ? Number(value) : 0));
  const rowMask = Array<number>(size).fill(0);
  const colMask = Array<number>(size).fill(0);
  const boxMask = Array<number>(size).fill(0);

  for (let i = 0; i < total; i++) {
    const digit = cells[i];
    if (!digit) continue;
    const bit = 1 << (digit - 1);
    const r = Math.floor(i / size);
    const c = i % size;
    const b = boxOf(i, size);
    if ((rowMask[r] & bit) || (colMask[c] & bit) || (boxMask[b] & bit)) {
      return { count: 0, solution: null, gaveUp: false };
    }
    rowMask[r] |= bit;
    colMask[c] |= bit;
    boxMask[b] |= bit;
  }

  const state = {
    count: 0,
    nodes: 0,
    gaveUp: false,
    first: null as number[] | null,
  };

  const search = (): boolean => {
    state.nodes++;
    if (state.nodes > 200000) {
      state.gaveUp = true;
      return true;
    }

    let best = -1;
    let bestMask = 0;
    let bestOptions = size + 1;

    for (let i = 0; i < total; i++) {
      if (cells[i] !== 0) continue;
      const r = Math.floor(i / size);
      const c = i % size;
      const b = boxOf(i, size);
      const mask = full & ~(rowMask[r] | colMask[c] | boxMask[b]);
      let options = 0;
      for (let m = mask; m; m &= m - 1) options++;
      if (options === 0) return false;
      if (options < bestOptions) {
        best = i;
        bestMask = mask;
        bestOptions = options;
        if (options === 1) break;
      }
    }

    if (best === -1) {
      state.count++;
      if (!state.first) state.first = [...cells];
      return state.count >= limit;
    }

    const r = Math.floor(best / size);
    const c = best % size;
    const b = boxOf(best, size);

    for (let digit = 1; digit <= size; digit++) {
      const bit = 1 << (digit - 1);
      if (!(bestMask & bit)) continue;

      cells[best] = digit;
      rowMask[r] |= bit;
      colMask[c] |= bit;
      boxMask[b] |= bit;

      const stop = search();

      cells[best] = 0;
      rowMask[r] &= ~bit;
      colMask[c] &= ~bit;
      boxMask[b] &= ~bit;

      if (stop) return true;
    }
    return false;
  };

  search();

  return {
    count: state.count,
    solution: state.first ? state.first.map(String) : null,
    gaveUp: state.gaveUp,
  };
}

export type SudokuCheck = {
  status: "empty" | "clash" | "none" | "many" | "open" | "valid";
  message: string;
  solution: string[] | null;
};

export function checkSudoku(grid: string[], size: SudokuSize): SudokuCheck {
  if (grid.length !== size * size) {
    return { status: "none", message: "That grid is not the right size.", solution: null };
  }
  if (grid.every((value) => !value)) {
    return { status: "empty", message: "", solution: null };
  }
  if (findConflicts(grid, size).size > 0) {
    return {
      status: "clash",
      message: "Some numbers clash in a row, column or box.",
      solution: null,
    };
  }

  const result = solveSudoku(grid, size);

  if (result.count > 1) {
    return {
      status: "many",
      message: "More than one answer so far. Keep adding numbers until only one is left.",
      solution: null,
    };
  }
  if (result.gaveUp) {
    return {
      status: "open",
      message: "Too open to check. Add more numbers.",
      solution: null,
    };
  }
  if (result.count === 0) {
    return {
      status: "none",
      message: "This puzzle has no solution. Check the numbers.",
      solution: null,
    };
  }

  return {
    status: "valid",
    message: "A valid puzzle with exactly one solution.",
    solution: result.solution,
  };
}