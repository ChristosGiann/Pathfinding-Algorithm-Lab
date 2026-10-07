import { useEffect, useState } from "react";
import { Grid } from "../Grid/Grid";
import { Toolbar } from "../Toolbar/Toolbar";
import { PathfindingStatistics } from "./PathfindingStatistics";
import { translations } from "../../i18n/translations";
import type { Language } from "../../i18n/translations";
import { PATHFINDING_SEARCHES } from "../../pathfinding/registry";
import type { AvailablePathfindingAlgorithm } from "../../pathfinding/registry";
import { evaluatePathfinding, gridToInput } from "../../pathfinding/evaluation";
import { advancePlayback, ANIMATION_DELAYS, idlePlayback, startPlayback } from "../../pathfinding/playback";
import type { AnimationSpeed } from "../../pathfinding/playback";
import { createGrid } from "../../utils/createGrid";
import { clearWalls } from "../../utils/clearWalls";
import { toggleWall } from "../../utils/toggleWall";
import type { Grid as GridType } from "../../types/grid";

export function Pathfinding({ language }: { language: Language }) {
  const texts = translations[language];
  const [state, setState] = useState(() => idlePlayback(createGrid(20, 30)));
  const [speed, setSpeed] = useState<AnimationSpeed>("normal");
  const [algorithm, setAlgorithm] = useState<AvailablePathfindingAlgorithm>("bfs");
  const running = state.status === "running";

  useEffect(() => {
    if (state.status !== "running") return;
    const timer = window.setTimeout(() => {
      // A callback queued before reset/restart must not paint the new grid.
      setState(current => current === state ? advancePlayback(current) : current);
    }, ANIMATION_DELAYS[speed]);
    return () => window.clearTimeout(timer);
  }, [state, speed]);

  function visualize() {
    if (running) return;
    try {
      const result = evaluatePathfinding(algorithm, gridToInput(state.grid), PATHFINDING_SEARCHES[algorithm]);
      setState(startPlayback(state.grid, result));
    } catch {
      setState({ ...idlePlayback(state.grid), status: "error" });
    }
  }

  function editGrid(transform: (grid: GridType) => GridType) {
    setState(current => current.status === "running" ? current : idlePlayback(transform(current.grid)));
  }

  const message = state.status === "completed"
    ? state.result?.found ? texts.pathfinding.found : texts.pathfinding.noPath
    : texts.pathfinding[state.status];

  return <section aria-label={texts.pathfinding.title} aria-busy={running}>
    <h2>{texts.pathfinding.title}</h2>
    <p>{texts.pathfinding.description}</p>
    <p>{texts.pathfinding.searchNote}</p>
    <Toolbar texts={texts.toolbar} algorithms={texts.algorithms} speed={texts.speed}
      disabled={running} selectedSpeed={speed}
      selectedAlgorithm={algorithm} onAlgorithmChange={value => {
        if (running) return;
        setAlgorithm(value);
        editGrid(grid => grid);
      }}
      onSpeedChange={value => { if (!running) setSpeed(value); }} onVisualize={visualize}
      onResetGrid={() => editGrid(() => createGrid(20, 30))}
      onClearPath={() => editGrid(grid => grid)}
      onClearWalls={() => editGrid(clearWalls)} />
    <p role="status">{message}</p>
    <PathfindingStatistics status={state.status} result={state.result} language={language} />
    <Grid grid={state.grid} texts={texts.grid} disabled={running}
      onNodeClick={(row, col) => editGrid(grid => toggleWall(grid, row, col))} />
  </section>;
}
