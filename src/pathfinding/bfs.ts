import { neighbours } from "./evaluation";
import type { Search } from "./evaluation";
import { reconstructPath } from "./reconstructPath";
import type { SearchNode } from "./reconstructPath";

/** BFS over a validated GridInput. Unit-cost cardinal edges give shortest paths. */
export const bfs: Search = (input) => {
  const start: SearchNode = { id: input.start, previous: null };
  const queue: SearchNode[] = [start];
  const discovered = new Set<number>([start.id]);
  const visited: number[] = [];

  // A cursor avoids shifting the array on every dequeue.
  for (let head = 0; head < queue.length; head++) {
    const node = queue[head];
    visited.push(node.id);
    if (node.id === input.end) {
      return { found: true, visited, path: reconstructPath(start, node) };
    }
    for (const id of neighbours(input, node.id)) {
      if (discovered.has(id)) continue;
      // Mark at enqueue time: each cell has one parent and enters the queue once.
      discovered.add(id);
      queue.push({ id, previous: node });
    }
  }
  return { found: false, visited, path: [] };
};
