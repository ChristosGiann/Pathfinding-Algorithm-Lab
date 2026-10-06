import { bfs } from "./bfs";
import { dfs } from "./dfs";
import type { Search } from "./evaluation";

export const PATHFINDING_SEARCHES = { bfs, dfs } satisfies Record<string, Search>;
export type AvailablePathfindingAlgorithm = keyof typeof PATHFINDING_SEARCHES;
