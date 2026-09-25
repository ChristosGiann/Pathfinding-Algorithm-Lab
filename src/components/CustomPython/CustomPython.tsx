import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import type { Language } from "../../i18n/translations";
import { customPythonTexts } from "../../i18n/customPython";
import { validatePythonSource } from "../../services/apiClient";
import type { PythonValidationResult } from "../../types/customPython";
import "./CustomPython.css";

export function CustomPython({ language }: { language: Language }) {
  const texts = customPythonTexts[language];
  const [source, setSource] = useState("def solve(values):\n    return sorted(values)\n");
  const [result, setResult] = useState<PythonValidationResult | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState(false);
  const active = useRef<AbortController | null>(null);
  const bytes = new TextEncoder().encode(source).length;
  useEffect(() => () => active.current?.abort(), []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (active.current || bytes > 32768) return;
    const controller = new AbortController();
    active.current = controller;
    setRunning(true);
    setError(false);
    setResult(null);
    try {
      const response = await validatePythonSource(source, AbortSignal.any([controller.signal, AbortSignal.timeout(15_000)]));
      if (!controller.signal.aborted) setResult(response);
    } catch {
      if (!controller.signal.aborted) setError(true);
    } finally {
      active.current = null;
      if (!controller.signal.aborted) setRunning(false);
    }
  }

  return <section className="custom-python" aria-labelledby="custom-python-title">
    <h2 id="custom-python-title">{texts.title}</h2>
    <p>{texts.hint}</p><p>{texts.note}</p>
    <form onSubmit={event => { void submit(event); }}>
      <label htmlFor="python-source">{texts.source}</label>
      <textarea id="python-source" rows={10} spellCheck={false} disabled={running} value={source}
        aria-describedby="python-size" onChange={event => { setSource(event.target.value); setResult(null); setError(false); }} />
      <p id="python-size">{texts.limit} · {bytes.toLocaleString(language)} bytes</p>
      {bytes > 32768 && <p role="alert">{texts.tooLarge}</p>}
      <button type="submit" disabled={running || bytes > 32768}>{texts.submit}</button>
    </form>
    {running && <p role="status">{texts.running}</p>}
    {error && <p role="alert">{texts.error}</p>}
    {result?.valid && <p role="status">{texts.success}</p>}
    {result && !result.valid && <div role="alert"><h3>{texts.errors}</h3><ul>
      {result.errors.map((item, index) => <li key={index}>{item.message}
        {item.line != null && ` (${texts.line} ${item.line}${item.column != null ? `, ${texts.column} ${item.column}` : ""})`}
      </li>)}
    </ul></div>}
  </section>;
}
