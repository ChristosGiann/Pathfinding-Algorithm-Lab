import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import type { Language } from "../../i18n/translations";
import type { DatasetType, SortingAlgorithm } from "../../types/benchmark";
import type { ComparisonResult } from "../../types/comparison";
import { benchmarkTexts } from "../../i18n/benchmark";
import { comparisonTexts } from "../../i18n/comparison";
import { runComparison } from "../../services/apiClient";
import { ComparisonResults } from "./ComparisonResults";

export function Comparison({ language }: { language: Language }) {
  const t = comparisonTexts[language], b = benchmarkTexts[language];
  const [algorithms, setAlgorithms] = useState<SortingAlgorithm[]>(["bubble-sort", "quick-sort"]);
  const [size, setSize] = useState("100"), [seed, setSeed] = useState("42");
  const [dataset, setDataset] = useState<DatasetType>("random");
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [busy, setBusy] = useState(false), [error, setError] = useState<"invalid" | "error" | "timeout" | null>(null);
  const request = useRef<AbortController | null>(null);
  useEffect(() => () => request.current?.abort(), []);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (request.current) return;
    const count = Number(size), randomSeed = Number(seed);
    if (algorithms.length < 2 || !size.trim() || !seed.trim() || !Number.isInteger(count) || count < 1 || count > 1000 || !Number.isInteger(randomSeed) || randomSeed < -2147483648 || randomSeed > 2147483647) { setError("invalid"); return; }
    const controller = new AbortController(), timeout = AbortSignal.timeout(30_000);
    request.current = controller; setBusy(true); setError(null); setResult(null);
    try {
      const response = await runComparison({ algorithms, size: count, seed: randomSeed, dataset_type: dataset }, AbortSignal.any([controller.signal, timeout]));
      if (!controller.signal.aborted) setResult(response);
    } catch { if (!controller.signal.aborted) setError(timeout.aborted ? "timeout" : "error"); }
    finally { request.current = null; if (!controller.signal.aborted) setBusy(false); }
  }
  return <section className="benchmark" aria-label={t.title}><h2>{t.title}</h2>
    <form onSubmit={event => { void submit(event); }}><fieldset disabled={busy}><legend>{t.select}</legend>
      {Object.entries(b.algorithms).map(([slug, label]) => <label key={slug}><input type="checkbox" checked={algorithms.includes(slug as SortingAlgorithm)} onChange={event => setAlgorithms(previous => event.target.checked ? [...previous, slug as SortingAlgorithm] : previous.filter(item => item !== slug))} />{label}</label>)}
      <div className="benchmark__fields"><label>{b.dataset}<select value={dataset} onChange={event => setDataset(event.target.value as DatasetType)}>{Object.entries(b.types).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label>{b.size}<input type="number" required min={1} max={1000} value={size} onChange={event => setSize(event.target.value)} /></label>
        <label>{b.seed}<input type="number" required min={-2147483648} max={2147483647} value={seed} onChange={event => setSeed(event.target.value)} /></label>
        <button type="submit">{t.run}</button></div></fieldset></form>
    {busy && <p role="status">{t.loading}</p>}{error && <p role="alert">{t[error]}</p>}
    {result ? <ComparisonResults result={result} language={language} /> : !busy && <p>{t.empty}</p>}
  </section>;
}
