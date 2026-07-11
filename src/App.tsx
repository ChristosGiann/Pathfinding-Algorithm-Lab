import { useState } from "react";
import { AppHeader } from "./components/AppHeader/AppHeader";
import { Grid } from "./components/Grid/Grid";
import { Toolbar } from "./components/Toolbar/Toolbar";
import type { Language } from "./i18n/translations";
import { translations } from "./i18n/translations";
import { clearWalls } from "./utils/clearWalls";
import { createGrid } from "./utils/createGrid";
import { toggleWall } from "./utils/toggleWall";
import "./App.css";

const ROWS = 20;
const COLS = 30;
const DEFAULT_LANGUAGE: Language = "el";

function App() {
  const texts = translations[DEFAULT_LANGUAGE];
  const [grid, setGrid] = useState(() => createGrid(ROWS, COLS));

  function handleNodeClick(row: number, col: number) {
    setGrid((currentGrid) => toggleWall(currentGrid, row, col));
  }

  function handleResetGrid() {
    setGrid(createGrid(ROWS, COLS));
  }

  function handleClearWalls() {
    setGrid((currentGrid) => clearWalls(currentGrid));
  }

  return (
    <main className="app">
      <AppHeader texts={texts.app} />

      <Toolbar
        texts={texts.toolbar}
        algorithms={texts.algorithms}
        speed={texts.speed}
        onResetGrid={handleResetGrid}
        onClearWalls={handleClearWalls}
      />

      <Grid grid={grid} onNodeClick={handleNodeClick} />
    </main>
  );
}

export default App;