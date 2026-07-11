import type { Grid as GridType } from "../../types/grid";
import { GridNode } from "./GridNode";
import "./Grid.css";

type GridProps = {
  grid: GridType;
};

export function Grid({ grid }: GridProps) {
  return (
    <div className="grid">
      {grid.map((row, rowIndex) => (
        <div className="grid-row" key={rowIndex}>
          {row.map((node) => (
            <GridNode key={`${node.row}-${node.col}`} node={node} />
          ))}
        </div>
      ))}
    </div>
  );
}