import { useCatalogue } from "../../hooks/useCatalogue";
import { ComplexityContext } from "../Benchmark/ComplexityContext";
import { useId } from "react";
import type { ComparisonResult } from "../../types/comparison";
import type { SortingAlgorithm } from "../../types/benchmark";
import type { Language } from "../../i18n/translations";
import { benchmarkTexts } from "../../i18n/benchmark";
import { comparisonTexts } from "../../i18n/comparison";
import "../Benchmark/ResultsDashboard.css";

export function ComparisonResults({ result, language }: { result: ComparisonResult; language: Language }) {
  const catalogue = useCatalogue();
  const t = comparisonTexts[language], b = benchmarkTexts[language], id = useId();
  const format = (ns: number | undefined) => ns === undefined || !Number.isFinite(ns) ? "—" : (ns / 1_000_000).toLocaleString(language, { maximumSignificantDigits: 6 });
  const name = (slug: string) => slug === "custom-python" ? "Custom Python" : b.algorithms[slug as SortingAlgorithm] ?? slug;
  const measured = result.results.filter(row => row.status === "completed");
  const max = Math.max(0, ...measured.map(row => row.measurement.max_ns));
  return <section className="results" aria-labelledby={id}>
    <h3 id={id}>{t.results}</h3><p>{t.note}</p>
    {result.baseline_algorithm && <p>{t.baseline}: {name(result.baseline_algorithm)} · {t.ratio}</p>}
    <p>{b.types[result.dataset_type]} · {b.size}: {result.size} · {b.seed}: {result.seed}</p>
    <div className="results__scroll" role="region" aria-label={t.results} tabIndex={0}>
      <table><caption>{t.results}</caption><thead><tr>{[b.algorithm, b.status, `${b.median} (ms)`, `${b.min} (ms)`, `${b.max} (ms)`, `${b.mean} (ms)`, `${b.stddev} (ms)`, t.relative].map(label => <th scope="col" key={label}>{label}</th>)}</tr></thead>
        <tbody>{result.results.map(row => <tr key={row.algorithm}>
          <th scope="row">{name(row.algorithm)} · {row.source_type === "custom" ? t.custom : t.builtIn}<ComplexityContext slug={row.algorithm} catalogue={catalogue} language={language} /></th>
          <td>{row.status === "completed" ? (row.measurement.correct ? b.correct : b.incorrect) : row.status === "timeout" ? t.timeout : t.failed}</td>
          {(["median_ns", "min_ns", "max_ns", "mean_ns", "stddev_ns"] as const).map(metric => <td key={metric}>{row.status === "completed" ? format(row.measurement[metric]) : "—"}</td>)}
        <td>{row.status === "completed" && row.measurement.relative_speed != null && Number.isFinite(row.measurement.relative_speed) ? `${row.measurement.relative_speed.toLocaleString(language, { maximumSignificantDigits: 4 })}×` : "—"}</td>
        </tr>)}</tbody>
      </table>
    </div>
    {measured.length > 0 && <figure className="results__chart"><figcaption>{b.chart}</figcaption><p>{b.chartNote} · 0–{format(max)} ms</p>
      {measured.map(row => <div className="results__plot" key={row.algorithm}><span>{name(row.algorithm)}</span>
        <div className="results__track" aria-hidden="true"><div className="results__bar" style={{ width: `${max ? row.measurement.median_ns / max * 100 : 0}%` }} /><div className="results__range" style={{ left: `${max ? row.measurement.min_ns / max * 100 : 0}%`, width: `${max ? (row.measurement.max_ns - row.measurement.min_ns) / max * 100 : 0}%` }} /></div>
        <span>{format(row.measurement.median_ns)} ms{!row.measurement.correct && ` · ${b.incorrect}`}</span></div>)}
    </figure>}
  </section>;
}
