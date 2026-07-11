import { useMemo } from "react";
import { Grid } from "./components/Grid/Grid";
import { createGrid } from "./utils/createGrid";
import "./App.css";

const ROWS = 20;
const COLS = 30;

function App() {
  const grid = useMemo(() => createGrid(ROWS, COLS), []);

  return (
    <main className="app">
      <section className="app-header">
        <h1>Pathfinding Algorithm Visualizer</h1>
        <p>
          Visualize how pathfinding algorithms explore a grid step by step.
        </p>
      </section>

      <Grid grid={grid} />
    </main>
  );
}

export default App;