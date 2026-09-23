import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { getImplementationReview, saveImplementationReview } from "../../services/apiClient";
import { noteLabels, ratingLabels } from "../../types/review";
import type { ReviewInput } from "../../types/review";
import "./ImplementationReview.css";

function ReviewForm({ implementationId }: { implementationId: number }) {
  const [input, setInput] = useState<ReviewInput | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const activeSave = useRef<AbortController | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const signal = AbortSignal.any([controller.signal, AbortSignal.timeout(15_000)]);
    void getImplementationReview(implementationId, signal).then(review => {
      if (controller.signal.aborted) return;
      const { implementation_id: id, updated_at, ...fields } = review;
      if (id !== implementationId) throw new Error("Unexpected implementation");
      setInput(fields);
      setUpdatedAt(updated_at);
    }).catch(() => {
      if (!controller.signal.aborted) setLoadError(true);
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });
    return () => controller.abort();
  }, [implementationId, attempt]);

  useEffect(() => () => activeSave.current?.abort(), []);

  function change<K extends keyof ReviewInput>(key: K, value: ReviewInput[K]) {
    setInput(previous => previous ? { ...previous, [key]: value } : previous);
    setDirty(true);
    setSaved(false);
    setSaveError(false);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!input || activeSave.current) return;
    const controller = new AbortController();
    activeSave.current = controller;
    setSaving(true);
    setSaveError(false);
    setSaved(false);
    try {
      const review = await saveImplementationReview(implementationId, input,
        AbortSignal.any([controller.signal, AbortSignal.timeout(15_000)]));
      if (!controller.signal.aborted) {
        setUpdatedAt(review.updated_at);
        setSaved(true);
        setDirty(false);
      }
    } catch {
      if (!controller.signal.aborted) setSaveError(true);
    } finally {
      activeSave.current = null;
      if (!controller.signal.aborted) setSaving(false);
    }
  }

  if (loading) return <p role="status">Φόρτωση αξιολόγησης…</p>;
  if (loadError) return <div role="alert"><p>Δεν φορτώθηκε η αξιολόγηση. Δοκίμασε ξανά πριν την επεξεργαστείς.</p>
    <button type="button" onClick={() => { setLoadError(false); setLoading(true); setAttempt(value => value + 1); }}>Νέα προσπάθεια</button></div>;
  if (!input) return null;
  return <form onSubmit={event => { void submit(event); }}>
    <p>Προσωπική κρίση, ανεξάρτητη από τα αυτόματα benchmark metrics. 1: χαμηλή · 5: υψηλή. Η συνολική βαθμολογία ορίζεται από εσένα.</p>
    <p>Μία κοινή αξιολόγηση ανά υλοποίηση σε αυτή την τοπική εγκατάσταση, χωρίς ξεχωριστούς λογαριασμούς.</p>
    <fieldset disabled={saving}>
      <legend>Βαθμολογίες και σημειώσεις</legend>
      <div className="implementation-review__ratings">
        {Object.entries(ratingLabels).map(([field, label]) => {
          const key = field as keyof typeof ratingLabels;
          return <label key={key}>{label}<select value={input[key] ?? ""} onChange={event => change(key, event.target.value === "" ? null : Number(event.target.value))}>
            <option value="">Χωρίς βαθμολογία</option>
            {[1, 2, 3, 4, 5].map(value => <option key={value} value={value}>{value}</option>)}
          </select></label>;
        })}
      </div>
      {Object.entries(noteLabels).map(([field, label]) => {
        const key = field as keyof typeof noteLabels;
        return <label key={key}>{label}<textarea aria-label={label} rows={3} maxLength={5000} value={input[key]} onChange={event => change(key, event.target.value)} />
          <small>{input[key].length}/5.000 χαρακτήρες</small></label>;
      })}
      <button type="submit">{saving ? "Αποθήκευση…" : "Αποθήκευση αξιολόγησης"}</button>
    </fieldset>
    {saving && <p role="status">Αποθήκευση αξιολόγησης…</p>}
    {saved && <p role="status">Η αξιολόγηση αποθηκεύτηκε.</p>}
    {dirty && <p>Υπάρχουν μη αποθηκευμένες αλλαγές. Αποθήκευσέ τες πριν ανανεώσεις τη σελίδα.</p>}
    {saveError && <p role="alert">Δεν επιβεβαιώθηκε η αποθήκευση. Τα πεδία σου διατηρήθηκαν· δοκίμασε ξανά. Αν χάθηκε η απάντηση, ο server μπορεί να έχει ήδη αποθηκεύσει την αξιολόγηση.</p>}
    {updatedAt && <p>Τελευταία αποθήκευση: {new Date(updatedAt).toLocaleString("el-GR")}</p>}
  </form>;
}

export function ImplementationReview({ implementationId, name }: { implementationId: number; name: string }) {
  const [opened, setOpened] = useState(false);
  return <details className="implementation-review" onToggle={event => { if (event.currentTarget.open) setOpened(true); }}>
    <summary>Προσωπική αξιολόγηση — {name}</summary>
    {opened && <ReviewForm key={implementationId} implementationId={implementationId} />}
  </details>;
}
