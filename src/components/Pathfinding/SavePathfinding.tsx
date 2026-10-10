import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import type { Language } from "../../i18n/translations";
import type { PathfindingSnapshot } from "../../pathfinding/persistence";
import { pathfindingPersistenceTexts } from "../../i18n/pathfindingPersistence";
import { savePathfinding } from "../../services/apiClient";

export function SavePathfinding({ snapshot, language }: { snapshot: PathfindingSnapshot; language: Language }) {
  const t = pathfindingPersistenceTexts[language];
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [id, setId] = useState<number | null>(null);
  const active = useRef<AbortController | null>(null);
  useEffect(() => () => active.current?.abort(), []);
  async function save(event: FormEvent) {
    event.preventDefault();
    if (active.current || status === "saved" || !name.trim()) return;
    const controller = new AbortController();
    active.current = controller;
    setStatus("saving");
    try {
      const result = await savePathfinding(name.trim(), snapshot, AbortSignal.any([controller.signal, AbortSignal.timeout(30_000)]));
      if (!controller.signal.aborted) { setId(result.id); setStatus("saved"); }
    } catch {
      if (!controller.signal.aborted) setStatus("error");
    } finally { active.current = null; }
  }
  return <form onSubmit={save}>
    <fieldset disabled={status === "saving" || status === "saved"}>
      <label>{t.name}<input required maxLength={200} value={name} onChange={event => setName(event.target.value)} /></label>
      <button type="submit" disabled={!name.trim()}>{status === "saving" ? t.saving : t.save}</button>
    </fieldset>
    {status === "saved" && <p role="status">{t.saved} #{id}</p>}
    {status === "error" && <p role="alert">{t.error}</p>}
  </form>;
}
