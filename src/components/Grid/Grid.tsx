import type { Grid as GridType } from "../../types/grid";
import { GridNode } from "./GridNode";
import "./Grid.css";

type GridProps = {
  grid: GridType;
  onNodeClick: (row: number, col: number) => void;
};

export function Grid({ grid, onNodeClick }: GridProps) {
  return (
    <div className="grid">
      {grid.map((row, rowIndex) => (
        <div className="grid-row" key={rowIndex}>
          {row.map((node) => (
            <GridNode
              key={`${node.row}-${node.col}`}
              node={node}
              onNodeClick={onNodeClick}
            />
          ))}
        </div>
      ))}
    </div>
  );
}