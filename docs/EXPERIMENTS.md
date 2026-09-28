# Experiment definitions — Issue #19

The API creates/retrieves definitions (#19), and now executes bounded sorting
experiments with persisted results (#43). The standalone benchmark UI remains
session-only; #45 adds a separate saved-experiment UI.

## Models

- `Experiment`: name, selected implementations (many-to-many), status, timestamps.
- `DatasetDefinition`: an experiment-owned configuration (type, size, seed).
  It references one experiment via a foreign key; deleting the experiment also
  deletes its definitions. Arrays are generated later, not stored here.

Definitions are owned by each experiment so another experiment cannot edit its
dataset configuration. Implementation references are live catalogue records,
not versioned code snapshots. Deleting catalogue implementations through ORM/admin
removes their many-to-many selections. Execution results now retain independent identity/configuration snapshots; deleting catalogue
records or definitions does not remove those snapshots. Deleting the experiment deletes its results.

## Create

`POST /api/experiments/` accepts JSON:

```json
{
  "name": "Random and reversed inputs",
  "implementation_ids": [1, 2],
  "datasets": [
    {"dataset_type": "random", "size": 100, "seed": 42},
    {"dataset_type": "reversed", "size": 1000, "seed": 7}
  ]
}
```

Obtain actual implementation IDs from `GET /api/algorithms/`, where each nested
implementation now includes `id`. The numbers above are illustrative.

- Name: nonblank, up to 200 characters.
- 1–20 distinct implementation IDs: existing, active, built-in and sorting only.
- 1–20 distinct dataset configurations: random/sorted/reversed/nearly_sorted.
- Size: JSON integer 1–100,000. Seed: signed 32-bit JSON integer, default 42.
- Boolean/fractional/string integers, unknown fields and supplied read-only fields
  (including status or IDs for nested definitions) return HTTP 400.
- Status is always `draft` on creation; clients cannot submit status transitions.
- Invalid input creates no records. Experiment, selections and definitions are
  saved in one database transaction; storage failure rolls them all back.

HTTP 201 returns `id`, `name`, `status`, `created_at`, `updated_at`,
`implementations` and `datasets`. Implementation summaries contain id, name,
slug, algorithm slug, language, is_active and source_type, but not registry_key.
Datasets contain their stored id, type, size and effective seed. The input-only
`implementation_ids` field is not returned.

## Read

`GET /api/experiments/<id>/` returns the same representation (HTTP 200).
An unknown ID returns 404. Update, delete and listing endpoints remain unavailable; unsupported methods return 405.

## Execution — Issue #43

`POST /api/experiments/<id>/run/` accepts an empty JSON object `{}` and returns
HTTP 200 with the full experiment, including `results` and `execution_error`.
Only draft experiments may execute. Unknown ID: 404; non-draft: 409;
invalid body/configuration: 400; unsupported HTTP method: 405.

Runtime validation requires active built-in Python implementations whose private
registry key AND sorting algorithm identity match Bubble Sort or Insertion Sort.
No dynamic imports or custom code are allowed. Drafts can still contain other
catalogue entries, but those cannot run. Each dataset must have 1–1000 items,
and the implementation × dataset product must be 1–4 pairs. Validation failure
rolls back the claim, leaving a draft with no results.

Each pair runs through the existing runner (10 fresh copies, sorting-only timing).
`results` contains id, created_at, implementation_snapshot (id/name/slug/algorithm/language)
and measurement (algorithm/dataset_type/size/seed/runs/correct/timings_ns/median_ns/min_ns/max_ns).
These snapshots survive changes/deletion of catalogue records and dataset definitions.
They are not code-version or environment snapshots and do not guarantee replay of timings.

Server-owned transitions are draft → running → completed/failed. A conditional
update claims the draft in one database transaction, held through the bounded execution
and result writes. Running is therefore internal, not a progress/polling signal.
SQLite serializes writers; a concurrent request may wait or receive a database-lock
error. This is a local MVP, not a production worker/queue design.

- All correctness checks pass: completed, empty execution_error, all results saved.
- Incorrect sorting: failed, `incorrect_result`, measured results retained and labelled false.
- Runner exception: failed, `runner_error`, no partial results or exception details exposed.
- Storage failure/process interruption before commit: transaction rolls back to draft;
  a later request may execute again. This is not exactly-once execution across crashes.
- Completed and failed experiments cannot rerun. Create a new draft for another attempt.

GET returns persisted results without execution. Create accepts neither results nor
execution_error/status from clients. No authentication/ownership, async scheduling,
cancellation or public concurrency guarantee is provided. The 100,000-item draft
limit is independent of the 1000-item execution limit.

## Migration #43

Run `python backend/manage.py migrate` to apply
`0004_experiment_execution_error_experimentresult`. This adds a result table and
an empty-by-default error field; existing draft definitions remain valid.

## Original #19 verification

Migration: `0003_experiment_definitions`. Run:

```powershell
.\backend\.venv\Scripts\python.exe backend\manage.py migrate
.\backend\.venv\Scripts\python.exe backend\manage.py test core
```

Eleven new tests cover create/read persistence and relationships, catalogue IDs,
defaults/bounds, invalid selections/configurations, duplicates, rollback,
no benchmark execution, status constraint and unsupported mutations. The full
suite contains 36 tests. Migration application, checks and dry-run are verified
locally. No frontend behavior changes beyond adding the implementation ID type.

## UI — #45

Η ενότητα Αποθηκευμένα experiments προσφέρει όνομα, επιλογή implementations από
το catalogue `executable` flag και ένα dataset (1–1000, type/seed). Save draft και
Run είναι χωριστές ενέργειες. Το ID επιτρέπει άνοιγμα μετά από page refresh.
Η φόρμα δημιουργεί νέο draft, δεν αλλάζει υπάρχον experiment. API-created multi-dataset
experiments εμφανίζονται πλήρως. Τα persisted results χρησιμοποιούν snapshot identity.

Τα controls κλειδώνουν κατά το request. Catalogue timeout 15s, mutations/read 30s,
abort κατά unmount, χωρίς automatic replay. Με αποτυχία run απαιτείται successful
GET πριν ενεργοποιηθεί ξανά Run. Μη επιβεβαιωμένο save προειδοποιεί ότι μπορεί να
δημιουργήθηκε draft (η νέα αποθήκευση ενδέχεται να διπλασιάσει εγγραφή).
Labels el/en· η αλλαγή γλώσσας διατηρεί state. Δεν υπάρχει listing, edit/delete ή
localStorage. Authentication/ownership παραμένουν εκτός local MVP.
