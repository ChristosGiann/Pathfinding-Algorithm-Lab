import { useEffect, useState } from "react";

import "./App.css";
import { SortingVisualization } from "./components/SortingVisualization/SortingVisualization";
import { Comparison } from "./components/Comparison/Comparison";

import { AlgorithmLibrary } from "./components/AlgorithmLibrary/AlgorithmLibrary";
import { AppHeader } from "./components/AppHeader/AppHeader";
import { BackendStatus } from "./components/BackendStatus/BackendStatus";
import { Experiments } from "./components/Experiments/Experiments";
import { Benchmark } from "./components/Benchmark/Benchmark";
import { CustomPython } from "./components/CustomPython/CustomPython";
import { Grid } from "./components/Grid/Grid";
import { Toolbar } from "./components/Toolbar/Toolbar";

import type { Language } from "./i18n/translations";
import { translations } from "./i18n/translations";

import { clearWalls } from "./utils/clearWalls";
import { createGrid } from "./utils/createGrid";
import { toggleWall } from "./utils/toggleWall";

const ROWS = 20;
const COLS = 30;
const DEFAULT_LANGUAGE: Language = "el";

function App() {
  const [language, setLanguage] = useState<Language>(DEFAULT_LANGUAGE);
  const texts = translations[language];

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = translations[language].app.title;
  }, [language]);

  const [grid, setGrid] = useState(() =>
    createGrid(ROWS, COLS),
  );

  function handleNodeClick(
    row: number,
    col: number,
  ) {
    setGrid((currentGrid) =>
      toggleWall(currentGrid, row, col),
    );
  }

  function handleResetGrid() {
    setGrid(createGrid(ROWS, COLS));
  }

  function handleClearWalls() {
    setGrid((currentGrid) =>
      clearWalls(currentGrid),
    );
  }

  return (
    <main>
      <AppHeader texts={texts.app} language={language} onLanguageChange={setLanguage} />

      <BackendStatus texts={texts.backendStatus} />
      <Benchmark language={language} />
      <Comparison language={language} />
      <Experiments language={language} />
      <CustomPython language={language} />
      <SortingVisualization language={language} />

      <Toolbar
        texts={texts.toolbar}
        algorithms={texts.algorithms}
        speed={texts.speed}
        onResetGrid={handleResetGrid}
        onClearWalls={handleClearWalls}
      />

      <Grid
        grid={grid}
        texts={texts.grid}
        onNodeClick={handleNodeClick}
      />

      <AlgorithmLibrary
        texts={texts.algorithmLibrary}
        language={language}
      />
    </main>
  );
}

export default App;
