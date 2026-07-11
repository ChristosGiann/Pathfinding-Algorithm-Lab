import type { GridNode as GridNodeType } from "../../types/grid";

type GridNodeProps = {
  node: GridNodeType;
};

export function GridNode({ node }: GridNodeProps) {
  return (
    <div
      className={`grid-node grid-node--${node.type}`}
      title={`row: ${node.row}, col: ${node.col}`}
    />
  );
}