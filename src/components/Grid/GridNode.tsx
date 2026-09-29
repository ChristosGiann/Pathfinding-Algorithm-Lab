import type { AppTexts } from "../../i18n/translations";
import type { GridNode as GridNodeType } from "../../types/grid";

type GridNodeProps = {
  node: GridNodeType;
  texts: AppTexts["grid"];
  onNodeClick: (row: number, col: number) => void;
};

export function GridNode({ node, texts, onNodeClick }: GridNodeProps) {
  return (
    <button
      type="button"
      className={`grid-node grid-node--${node.type}`}
      title={texts.cell(node.row, node.col)}
      aria-label={texts.cell(node.row, node.col)}
      onClick={() => onNodeClick(node.row, node.col)}
    />
  );
}