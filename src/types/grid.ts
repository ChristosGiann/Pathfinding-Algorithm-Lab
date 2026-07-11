export type NodeType = "empty" | "start" | "end" | "wall" | "visited" | "path";

export type GridNode = {
  row: number;
  col: number;
  type: NodeType;
};

export type Grid = GridNode[][];