import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import type { Language } from "../../i18n/translations";
import { benchmarkTexts } from "../../i18n/benchmark";
import { runBubbleSortBenchmark } from "../../services/apiClient";
import type { BenchmarkResult, DatasetType } from "../../types/benchmark";
import "./Benchmark.css";

export function Benchmark({ language }: { language: Language }) {
  const texts = benchmarkTexts[language];
  const [size, setSize] = useState("100");
  const [seed, setSeed] = useState("42");
  const [datasetType, setDatasetType] = useState<DatasetType>("random");
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<"invalid" | "error" | null>(null);
  const [result, setResult] = useState<BenchmarkResult | null>(null);
  const activeRequest = useRef<AbortController | null>(null);

  useEffect(() => () => activeRequest.current?.abort(), []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (activeRequest.current) return;
    const inputSize = Number(size);
    const inputSeed = Number(seed);
    setResult(null);
    if (!size.trim() || !seed.trim() || !Number.isInteger(inputSize) || inputSize < 1 || inputSize > 1000 ||
      !Number.isInteger(inputSeed) || inputSeed < -2147483648 || inputSeed > 2147483647) {
      setError("invalid");
      return;
    }
    const controller = new AbortController();
    activeRequest.current = controller;
    setRunning(true);
    setError(null);
    try {
      const response = await runBubbleSortBenchmark({ size: inputSize, seed: inputSeed, dataset_type: datasetType }, controller.signal);
      if (!controller.signal.aborted) setResult(response);
    } catch {
      if (!controller.signal.aborted) setError("error");
    } finally {
      activeRequest.current = null;
      if (!controller.signal.aborted) setRunning(false);
    }
  }

  const formatTime = (ns: number) => (ns / 1_000_000).toLocaleString(language, { minimumFractionDigits: 4, maximumFractionDigits: 4 });

  return (
    <section className="benchmark" aria-labelledby="benchmark-title">
      <h2 id="benchmark-title">{texts.title}</h2>
      <p>{texts.description}</p>
      <form onSubmit={(event) => { void handleSubmit(event); }}>
        <fieldset disabled={running} className="benchmark__fields">
          <label>{texts.algorithm}<select aria-label={texts.algorithm} value="bubble-sort" disabled><option value="bubble-sort">Bubble Sort</option></select></label>
          <label>{texts.dataset}<select value={datasetType} onChange={(event) => setDatasetType(event.target.value as DatasetType)}>
            {Object.entries(texts.types).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select></label>
          <label>{texts.size}<input type="number" required min="1" max="1000" step="1" value={size} onChange={(event) => setSize(event.target.value)} /></label>
          <label>{texts.seed}<input type="number" required min="-2147483648" max="2147483647" step="1" value={seed} onChange={(event) => setSeed(event.target.value)} /></label>
          <button type="submit">{running ? texts.running : texts.run}</button>
        </fieldset>
        <p className="benchmark__hint">{texts.hint}</p>
      </form>
      {running && <p role="status">{texts.running}</p>}
      {error && <p role="alert">{texts[error]}</p>}
      {result && <article className="benchmark__result" aria-label={texts.result} aria-live="polite">
        <h3>{texts.result}</h3>
        <p className={result.correct ? "benchmark__correct" : "benchmark__incorrect"}>{result.correct ? texts.correct : texts.incorrect}</p>
        <p>{texts.types[result.dataset_type]} · {texts.size}: {result.size} · Seed: {result.seed} · {texts.runs}: {result.runs}</p>
        <dl>{([["median", result.median_ns], ["min", result.min_ns], ["max", result.max_ns]] as const).map(([label, value]) =>
          <div key={label}><dt>{texts[label]}</dt><dd>{formatTime(value)} ms</dd></div>)}</dl>
        <p className="benchmark__hint">{texts.note}</p>
      </article>}
    </section>
  );
}
