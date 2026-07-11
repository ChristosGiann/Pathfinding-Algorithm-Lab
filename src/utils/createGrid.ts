import type { Grid, GridNode } from "../types/grid";

const START_NODE_POSITION = {
  row: 10,
  col: 5,
};

const END_NODE_POSITION = {
  row: 10,
  col: 24,
};

export function createGrid(rows: number, cols: number): Grid {
  const grid: Grid = [];

  for (let row = 0; row < rows; row++) {
    const currentRow: GridNode[] = [];

    for (let col = 0; col < cols; col++) {
      currentRow.push(createNode(row, col));
    }

    grid.push(currentRow);
  }

  return grid;
}

function createNode(row: number, col: number): GridNode {
  const isStart =
    row === START_NODE_POSITION.row && col === START_NODE_POSITION.col;

  const isEnd =
    row === END_NODE_POSITION.row && col === END_NODE_POSITION.col;

  return {
    row,
    col,
    type: isStart ? "start" : isEnd ? "end" : "empty",
  };
}