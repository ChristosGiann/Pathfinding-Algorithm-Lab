import { neighbours } from "./evaluation";
import type { Search } from "./evaluation";
import { reconstructPath } from "./reconstructPath";
import type { SearchNode } from "./reconstructPath";

/** Iterative depth-first search on validated input; does not promise shortest paths. */
export const dfs: Search = (input) => {
  const start: SearchNode = { id: input.start, previous: null };
  const stack: SearchNode[] = [start];
  const processed = new Set<number>();
  const visited: number[] = [];
  while (stack.length) {
    const node = stack.pop()!;
    if (processed.has(node.id)) continue;
    processed.add(node.id);
    visited.push(node.id);
    if (node.id === input.end) return { found: true, visited, path: reconstructPath(start, node) };
    // Reverse pushes preserve up/right/down/left priority when popping the stack.
    for (const id of neighbours(input, node.id).reverse()) {
      if (!processed.has(id)) stack.push({ id, previous: node });
    }
  }
  return { found: false, visited, path: [] };
};
