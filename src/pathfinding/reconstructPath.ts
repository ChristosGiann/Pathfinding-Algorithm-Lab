/** Search-owned node; never a reference to mutable React grid state. */
export interface SearchNode {
  readonly id: number;
  readonly previous: SearchNode | null;
}

/** Follow previous references; unreachable or cyclic chains have no path. */
export function reconstructPath(start: SearchNode, end: SearchNode | null): number[] {
  const reversed: number[] = [];
  const seen = new Set<SearchNode>();
  let node = end;
  while (node !== null) {
    if (seen.has(node)) return [];
    seen.add(node);
    reversed.push(node.id);
    if (node === start) return reversed.reverse();
    node = node.previous;
  }
  return [];
}
