import type { AppTexts } from "../../i18n/translations";
import type { GridNode as GridNodeType } from "../../types/grid";

type GridNodeProps = {
  node: GridNodeType;
  texts: AppTexts["grid"];
  onNodeClick: (row: number, col: number) => void;
  disabled?: boolean;
};

export function GridNode({ node, texts, onNodeClick, disabled = false }: GridNodeProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={`grid-node grid-node--${node.type}`}
      title={texts.cell(node.row, node.col)}
      aria-label={texts.cell(node.row, node.col)}
      onClick={() => onNodeClick(node.row, node.col)}
    />
  );
}
