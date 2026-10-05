import type { Grid } from "../types/grid";
import type { PathfindingResult } from "./evaluation";

export const ANIMATION_DELAYS = { slow: 80, normal: 25, fast: 5 } as const;
export type AnimationSpeed = keyof typeof ANIMATION_DELAYS;
type Frame = { id: number; type: "visited" | "path" };
export interface Playback {
  grid: Grid;
  frames: readonly Frame[];
  cursor: number;
  status: "idle" | "running" | "completed" | "error";
  result: Extract<PathfindingResult, { status: "completed" }> | null;
}

export function idlePlayback(grid: Grid): Playback {
  return {
    grid: grid.map(row => row.map(node => ({
      ...node, type: node.type === "visited" || node.type === "path" ? "empty" : node.type,
    }))),
    frames: [], cursor: 0, status: "idle", result: null,
  };
}

/** Animation consumes an already measured result; no algorithm runs in a timer. */
export function startPlayback(grid: Grid, result: PathfindingResult): Playback {
  const state = idlePlayback(grid);
  if (result.status === "error") return { ...state, status: "error" };
  const frames: Frame[] = [
    ...result.visited.map(id => ({ id, type: "visited" as const })),
    ...result.path.map(id => ({ id, type: "path" as const })),
  ];
  return { ...state, frames, result, status: frames.length ? "running" : "completed" };
}

export function advancePlayback(state: Playback): Playback {
  if (state.status !== "running") return state;
  const frame = state.frames[state.cursor];
  const cols = state.grid[0].length;
  const row = Math.floor(frame.id / cols), col = frame.id % cols;
  const node = state.grid[row]?.[col];
  let grid = state.grid;
  if (node && !["start", "end", "wall"].includes(node.type)) {
    grid = [...grid];
    grid[row] = [...grid[row]];
    grid[row][col] = { ...node, type: frame.type };
  }
  const cursor = state.cursor + 1;
  return { ...state, grid, cursor, status: cursor === state.frames.length ? "completed" : "running" };
}
