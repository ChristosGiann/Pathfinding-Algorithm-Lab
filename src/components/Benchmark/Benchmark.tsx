import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import type { Language } from "../../i18n/translations";
import { benchmarkTexts } from "../../i18n/benchmark";
import { runBubbleSortBenchmark } from "../../services/apiClient";
import type { DatasetType } from "../../types/benchmark";
import { ResultsDashboard } from "./ResultsDashboard";
import type { ResultEntry } from "./ResultsDashboard";
import "./Benchmark.css";

export function Benchmark({ language }: { language: Language }) {
  const texts = benchmarkTexts[language];
  const [size, setSize] = useState("100");
  const [seed, setSeed] = useState("42");
  const [datasetType, setDatasetType] = useState<DatasetType>("random");
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<"invalid" | "error" | "timeout" | null>(null);
  const [entries, setEntries] = useState<ResultEntry[]>([]);
  const nextId = useRef(1);
  const activeRequest = useRef<AbortController | null>(null);

  useEffect(() => () => activeRequest.current?.abort(), []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (activeRequest.current) return;
    const inputSize = Number(size);
    const inputSeed = Number(seed);
    if (!size.trim() || !seed.trim() || !Number.isInteger(inputSize) || inputSize < 1 || inputSize > 1000 ||
      !Number.isInteger(inputSeed) || inputSeed < -2147483648 || inputSeed > 2147483647) {
      setError("invalid");
      return;
    }
    const controller = new AbortController();
    activeRequest.current = controller;
    const input = { size: inputSize, seed: inputSeed, dataset_type: datasetType };
    const id = nextId.current++;
    const timeout = AbortSignal.timeout(30_000);
    const signal = AbortSignal.any([controller.signal, timeout]);
    const append = (entry: ResultEntry) => setEntries(previous => [...previous, entry].slice(-20));
    setRunning(true);
    setError(null);
    try {
      const response = await runBubbleSortBenchmark(input, signal);
      if (!controller.signal.aborted) append({ id, input, status: "completed", result: response });
    } catch {
      if (!controller.signal.aborted) {
        const status = timeout.aborted ? "timeout" : "error";
        setError(status);
        append({ id, input, status });
      }
    } finally {
      activeRequest.current = null;
      if (!controller.signal.aborted) setRunning(false);
    }
  }

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
      {error && <p role="alert">{texts[error]}</p>}
      <ResultsDashboard entries={entries} running={running} language={language} onClear={() => setEntries([])} />
    </section>
  );
}
