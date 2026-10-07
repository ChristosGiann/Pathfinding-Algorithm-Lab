import { neighbours } from "./evaluation";
import type { Search } from "./evaluation";
import { reconstructPath } from "./reconstructPath";
import type { SearchNode } from "./reconstructPath";

interface Entry extends SearchNode { readonly cost: number; readonly order: number }
const precedes = (a: Entry, b: Entry) => a.cost < b.cost || (a.cost === b.cost && a.order < b.order);

/** Binary min-heap; insertion order breaks equal-cost ties deterministically. */
class Frontier {
  private entries: Entry[] = [];
  push(entry: Entry) {
    const items = this.entries;
    let index = items.length;
    items.push(entry);
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (!precedes(entry, items[parent])) break;
      items[index] = items[parent];
      index = parent;
    }
    items[index] = entry;
  }
  pop(): Entry | undefined {
    const items = this.entries;
    const first = items[0];
    const last = items.pop();
    if (items.length && last) {
      let index = 0;
      while (index * 2 + 1 < items.length) {
        let child = index * 2 + 1;
        if (child + 1 < items.length && precedes(items[child + 1], items[child])) child++;
        if (!precedes(items[child], last)) break;
        items[index] = items[child];
        index = child;
      }
      items[index] = last;
    }
    return first;
  }
}

/** Dijkstra on validated non-negative costs; visited means settled, not enqueued. */
export const dijkstra: Search = input => {
  const start: Entry = { id: input.start, previous: null, cost: 0, order: 0 };
  const frontier = new Frontier();
  frontier.push(start);
  const distances = Array<number>(input.rows * input.cols).fill(Infinity);
  distances[input.start] = 0;
  const settled = new Set<number>();
  const visited: number[] = [];
  let order = 1;
  let node: Entry | undefined;
  while ((node = frontier.pop())) {
    if (settled.has(node.id) || node.cost !== distances[node.id]) continue;
    settled.add(node.id);
    visited.push(node.id);
    if (node.id === input.end) return { found: true, visited, path: reconstructPath(start, node) };
    for (const id of neighbours(input, node.id)) {
      if (settled.has(id)) continue;
      const cost = node.cost + (input.costs?.[id] ?? 1);
      if (cost < distances[id]) {
        distances[id] = cost;
        frontier.push({ id, previous: node, cost, order: order++ });
      }
    }
  }
  return { found: false, visited, path: [] };
};
