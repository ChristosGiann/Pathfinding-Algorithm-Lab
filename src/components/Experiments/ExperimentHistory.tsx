import { useEffect, useState } from "react";
import type { Language } from "../../i18n/translations";
import type { ExperimentPage } from "../../types/experiment";
import { experimentTexts } from "../../i18n/experiment";
import { listExperiments } from "../../services/apiClient";
import { HistoryPage } from "./HistoryPage";

export function ExperimentHistory({ language, busy, onOpen }: {
  language: Language; busy: boolean; onOpen: (id: number) => void;
}) {
  const t = experimentTexts[language];
  const [cursors, setCursors] = useState<(number | null)[]>([null]);
  const [reload, setReload] = useState(0);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [data, setData] = useState<ExperimentPage>({ results: [], next_before: null });
  const before = cursors[cursors.length - 1];
  useEffect(() => {
    const controller = new AbortController();
    void listExperiments(before, AbortSignal.any([controller.signal, AbortSignal.timeout(15_000)]))
      .then(page => { if (!controller.signal.aborted) { setData(page); setStatus("ready"); } })
      .catch(() => { if (!controller.signal.aborted) setStatus("error"); });
    return () => controller.abort();
  }, [before, reload]);
  function navigate(next: (number | null)[]) { setStatus("loading"); setCursors(next); setReload(value => value + 1); }
  return <section aria-labelledby="experiment-history-title" aria-busy={status === "loading"}>
    <h3 id="experiment-history-title">{t.history}</h3>
    <button type="button" disabled={busy || status === "loading"} onClick={() => navigate([null])}>{t.historyRefresh}</button>
    {status === "loading" && <p role="status">{t.historyLoading}</p>}
    {status === "error" && <p role="alert">{t.historyError} <button type="button" disabled={busy} onClick={() => navigate(cursors)}>{t.retry}</button></p>}
    {status === "ready" && <HistoryPage data={data} language={language} busy={busy} onOpen={onOpen} />}
    <div className="experiments__fields">
      <button type="button" disabled={busy || status === "loading" || cursors.length === 1} onClick={() => navigate(cursors.slice(0, -1))}>{t.previous}</button>
      <span>{t.page} {cursors.length}</span>
      <button type="button" disabled={busy || status !== "ready" || data.next_before === null} onClick={() => navigate([...cursors, data.next_before])}>{t.next}</button>
    </div>
  </section>;
}
