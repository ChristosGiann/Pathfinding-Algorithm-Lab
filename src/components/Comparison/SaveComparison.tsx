import { useEffect, useRef, useState } from "react";
import type { Language } from "../../i18n/translations";
import { saveComparison } from "../../services/apiClient";
import { comparisonSaveTexts } from "../../i18n/comparisonSave";

export function SaveComparison({ token, language }: { token: string; language: Language }) {
  const t = comparisonSaveTexts[language];
  const [name, setName] = useState(""), [id, setId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false), [error, setError] = useState(false);
  const request = useRef<AbortController | null>(null);
  useEffect(() => () => request.current?.abort(), []);
  async function save() {
    if (request.current || !name.trim()) return;
    const controller = new AbortController(); request.current = controller; setBusy(true); setError(false);
    try {
      const response = await saveComparison(name.trim(), token, AbortSignal.any([controller.signal, AbortSignal.timeout(15_000)]));
      if (!controller.signal.aborted) setId(response.id);
    } catch { if (!controller.signal.aborted) setError(true); }
    finally { request.current = null; if (!controller.signal.aborted) setBusy(false); }
  }
  return <div>{id ? <p role="status">{t.saved} #{id}. {t.history}</p> : <>
    <label>{t.name}<input maxLength={200} value={name} disabled={busy} onChange={event => setName(event.target.value)} /></label>
    <button disabled={busy || !name.trim()} onClick={() => { void save(); }}>{t.save}</button><p>{t.note}</p>
    {error && <p role="alert">{t.error}</p>}</>}</div>;
}
