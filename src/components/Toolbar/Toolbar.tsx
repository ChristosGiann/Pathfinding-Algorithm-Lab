import type { AppTexts } from "../../i18n/translations";
import "./Toolbar.css";

type ToolbarProps = {
  texts: AppTexts["toolbar"];
  algorithms: AppTexts["algorithms"];
  speed: AppTexts["speed"];
  onResetGrid: () => void;
  onClearWalls: () => void;
};

export function Toolbar({
  texts,
  algorithms,
  speed,
  onResetGrid,
  onClearWalls,
}: ToolbarProps) {
  return (
    <section className="toolbar" aria-label={texts.ariaLabel}>
      <div className="toolbar-group">
        <label className="toolbar-label" htmlFor="algorithm-select">
          {texts.algorithmLabel}
        </label>

        <select id="algorithm-select" className="toolbar-select" defaultValue="bfs">
          <option value="bfs">{algorithms.bfs}</option>
          <option value="dfs">{algorithms.dfs}</option>
          <option value="dijkstra">{algorithms.dijkstra}</option>
          <option value="astar">{algorithms.astar}</option>
        </select>
      </div>

      <div className="toolbar-group">
        <label className="toolbar-label" htmlFor="speed-select">
          {texts.speedLabel}
        </label>

        <select
          id="speed-select"
          className="toolbar-select"
          defaultValue="normal"
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
          disabled
        >
          {texts.visualize}
        </button>

        <button className="toolbar-button" type="button" disabled>
          {texts.compare}
        </button>

        <button className="toolbar-button" type="button" onClick={onClearWalls}>
          {texts.clearWalls}
        </button>

        <button className="toolbar-button" type="button" onClick={onResetGrid}>
          {texts.resetGrid}
        </button>
      </div>
    </section>
  );
}