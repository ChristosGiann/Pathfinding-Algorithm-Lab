import type { Grid } from "../types/grid";

export function clearWalls(grid: Grid): Grid {
  return grid.map((row) =>
    row.map((node) => {
      if (node.type !== "wall") {
        return node;
      }

      return {
        ...node,
        type: "empty",
      };
    }),
  );
}