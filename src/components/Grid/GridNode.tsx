import type { GridNode as GridNodeType } from "../../types/grid";

type GridNodeProps = {
  node: GridNodeType;
  onNodeClick: (row: number, col: number) => void;
};

export function GridNode({ node, onNodeClick }: GridNodeProps) {
  return (
    <button
      type="button"
      className={`grid-node grid-node--${node.type}`}
      title={`row: ${node.row}, col: ${node.col}`}
      aria-label={`Κελί γραμμής ${node.row}, στήλης ${node.col}`}
      onClick={() => onNodeClick(node.row, node.col)}
    />
  );
}