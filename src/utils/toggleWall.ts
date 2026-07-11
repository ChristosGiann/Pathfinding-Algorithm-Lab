import type { Grid } from "../types/grid";

export function toggleWall(grid: Grid, row: number, col: number): Grid {
  const selectedNode = grid[row]?.[col];

  if (!selectedNode) {
    return grid;
  }

  if (selectedNode.type === "start" || selectedNode.type === "end") {
    return grid;
  }

  return grid.map((currentRow, rowIndex) =>
    currentRow.map((node, colIndex) => {
      const isSelectedNode = rowIndex === row && colIndex === col;

      if (!isSelectedNode) {
        return node;
      }

      return {
        ...node,
        type: node.type === "wall" ? "empty" : "wall",
      };
    }),
  );
}