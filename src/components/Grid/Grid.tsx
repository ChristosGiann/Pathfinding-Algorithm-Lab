import type { AppTexts } from "../../i18n/translations";
import type { Grid as GridType } from "../../types/grid";
import { GridNode } from "./GridNode";
import "./Grid.css";

type GridProps = {
  grid: GridType;
  texts: AppTexts["grid"];
  onNodeClick: (row: number, col: number) => void;
};

export function Grid({ grid, texts, onNodeClick }: GridProps) {
  return (
    <div className="grid">
      {grid.map((row, rowIndex) => (
        <div className="grid-row" key={rowIndex}>
          {row.map((node) => (
            <GridNode
              key={`${node.row}-${node.col}`}
              node={node}
              texts={texts}
              onNodeClick={onNodeClick}
            />
          ))}
        </div>
      ))}
    </div>
  );
}