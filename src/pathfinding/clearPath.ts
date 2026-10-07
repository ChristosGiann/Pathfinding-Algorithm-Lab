import type { Grid } from "../types/grid";

/** Remove visualization marks while preserving walls and endpoints. */
export function clearPath(grid: Grid): Grid {
  return grid.map(row => row.map(node => ({
    ...node, type: node.type === "visited" || node.type === "path" ? "empty" : node.type,
  })));
}
