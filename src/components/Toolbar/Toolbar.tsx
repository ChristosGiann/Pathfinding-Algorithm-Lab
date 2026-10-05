import type { AppTexts } from "../../i18n/translations";
import "./Toolbar.css";
import type { AnimationSpeed } from "../../pathfinding/playback";

type ToolbarProps = {
  texts: AppTexts["toolbar"];
  algorithms: AppTexts["algorithms"];
  speed: AppTexts["speed"];
  onResetGrid: () => void;
  onClearWalls: () => void;
  onVisualize: () => void;
  selectedSpeed: AnimationSpeed;
  onSpeedChange: (speed: AnimationSpeed) => void;
  disabled?: boolean;
};

export function Toolbar({
  texts,
  algorithms,
  speed,
  onResetGrid,
  onClearWalls,
  onVisualize,
  selectedSpeed,
  onSpeedChange,
  disabled = false,
}: ToolbarProps) {
  return (
    <section className="toolbar" aria-label={texts.ariaLabel}>
      <div className="toolbar-group">
        <label className="toolbar-label" htmlFor="algorithm-select">
          {texts.algorithmLabel}
        </label>

        <select id="algorithm-select" className="toolbar-select" defaultValue="bfs" disabled={disabled}>
          <option value="bfs">{algorithms.bfs}</option>
          <option value="dfs" disabled>{algorithms.dfs}</option>
          <option value="dijkstra" disabled>{algorithms.dijkstra}</option>
          <option value="astar" disabled>{algorithms.astar}</option>
        </select>
      </div>

      <div className="toolbar-group">
        <label className="toolbar-label" htmlFor="speed-select">
          {texts.speedLabel}
        </label>

        <select
          id="speed-select"
          className="toolbar-select"
          value={selectedSpeed}
          disabled={disabled}
          onChange={event => onSpeedChange(event.target.value as AnimationSpeed)}
        >
          <option value="slow">{speed.slow}</option>
          <option value="normal">{speed.normal}</option>
          <option value="fast">{speed.fast}</option>
        </select>
      </div>

      <div className="toolbar-actions">
        <button
          className="toolbar-button toolbar-button--primary"
          type="button"
          onClick={onVisualize}
          disabled={disabled}
        >
          {texts.visualize}
        </button>

        <button className="toolbar-button" type="button" disabled>
          {texts.compare}
        </button>

        <button className="toolbar-button" type="button" onClick={onClearWalls} disabled={disabled}>
          {texts.clearWalls}
        </button>

        <button className="toolbar-button" type="button" onClick={onResetGrid} disabled={disabled}>
          {texts.resetGrid}
        </button>
      </div>
    </section>
  );
}
