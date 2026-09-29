# Project Progress

Last verified: **2026-09-29**

## Current phase

Issues #17–#21 are completed and closed.
They were integrated into `dev` through PRs #28–#32 and promoted together to `main` through PR #33 on 2026-09-23.
That promotion established the earlier baseline. The current release snapshot also includes custom Python validation, el/en selection, Bubble/Insertion benchmarks, persisted experiment execution, experiment UI and paginated history (PRs #38–#48).

## Git state

- Issue #16 is closed; PR #27 merged the Algorithm Library into `main`.
- Issues #17–#21 were merged into `dev` through PRs #28–#32.
- PR #33 promoted that integrated `dev` snapshot to `main` on 2026-09-23.
- `main` and `dev` are permanent. Never delete `dev`, locally or remotely,
  including after a dev-to-main PR. Delete only merged temporary issue branches.
- New issue branches should continue to start from `dev`.
- Promote `dev` to `main` only on explicit user request.

## Completed functionality

- React/TypeScript/Vite frontend and Django/DRF backend.
- Health endpoint and frontend API client.
- Pathfinding grid foundation, wall toggling, clear/reset controls, translations.
- `Problem`, `Algorithm`, and `AlgorithmImplementation` domain models.
- Idempotent seed command for Bubble, Selection, Insertion, Merge, and Quick Sort.
- Complexity metadata and read-only `GET /api/algorithms/` API.
- Filtering of active built-in implementations; private registry keys.
- Algorithm Library cards, loading/error/empty states and retry button.

Seeded implementation records are metadata. Bubble Sort (#18) and Insertion Sort (#41)
are executable through a fixed code allowlist. Other sorters remain planned; #43 resolves the two trusted catalogue implementations for experiment execution.

## Follow-up fixes

- ESLint excludes `backend/.venv` dependencies.
- Algorithm Library retries set loading state in the event handler.
- Effect cleanup ignores outdated algorithm responses.
- Backend health is checked on mount and five seconds after each completed check.
- Health requests time out after five seconds; cleanup aborts requests and timers.
- Health recovery updates the status automatically; library recovery uses retry.

## Verification

Integration verification on 2026-09-23: 44 backend tests and 4 frontend rendering
tests passed, along with lint, build, Django checks and migration consistency.
Core migration 0003 and reviews migration 0001 are applied locally.
Issue #22 adds static custom Python validation and an explicit developer-only local runner; see the verification section below.

Browser scenarios verified against the real local backend:

- Available backend: all five algorithm cards and complexity metadata appear.
- Stopped backend: error message and retry button appear.
- Retry while stopped: loading returns to an actionable error state.
- Backend restored: retry loads all five cards without page refresh.
- Health polling: online to offline to online updates without refresh.

These were browser checks, not a newly added automated frontend test suite.
Timeout and cleanup behavior have not been separately exercised with a delayed
server response or an automated unmount test. See [Testing](TESTING.md).

## Next

1. Το #11 (language selector) υλοποιήθηκε στο παρόν feature snapshot. Επόμενο βήμα είναι ο σχεδιασμός της πλήρους MVP integration. Τα #22 και #12 έχουν ενσωματωθεί στο dev μέσω PR #38/#39.
2. Keep `dev` as the permanent integration branch for subsequent issue branches.
3. Keep documentation synchronized in the same PR whenever feature status, API contracts, architecture, or roadmap change.

## Issue #12 — Portfolio README, 2026-09-25

Το παρόν feature snapshot ανανεώνει το README στα Ελληνικά με αγγλικούς technical
terms: σημερινά features, διάκριση benchmarking/visualization, vertical slice,
setup, πραγματικό screenshot, roadmap και MVP limitations. Δεν αλλάζει application
code. Το #22 ενσωματώθηκε μέσω PR #38 και η τεκμηρίωση συμφιλιώθηκε στο PR #39.
Η προτίμηση για ελληνικά PR descriptions/comments καταγράφεται στο DEVELOPMENT.

## Issue #19 verification

36 backend tests pass (25 existing + 11 new). Migration 0003 applied locally;
Django checks and migration dry-run passed. Actual HTTP POST returned 201 and
GET returned 200 with matching stored implementations and datasets. A local draft
named `Issue 19 API verification` (ID 1) remains available for inspection.
See [Experiments](EXPERIMENTS.md). No new experiment UI or execution is included.

## Scope alignment for Issue #17

The live issue specifies Random, Sorted, Reversed, and Nearly Sorted datasets;
`size` and `seed`; reproducibility tests; sizes 10, 100, 1000 plus bounded custom
sizes; and independent input copies for benchmark runs.

Few Unique Values appears in the imported plan but is a proposed extension.
The local implementation supports sizes 1 through 100,000 with the semantics
in [Datasets](DATASETS.md). The future runner must use `copy_for_run()`. No new dataset endpoint contract has been finalized.


## Issue #21 — 2026-09-22

Merged into `dev` through PR #32, then promoted to `main` through PR #33; Issue #21 closed.
Adds review persistence, strict GET/PUT API, Greek editable form and eight new
backend tests (44 total with experiments integrated). Lint/build and migration checks pass.
Browser verification covered save, refresh, update, offline load/save errors,
retry, and separate review data per implementation. See
[Implementation reviews](IMPLEMENTATION_REVIEWS.md).

PR #30 (#19), PR #31 (#20) and PR #32 (#21) were merged into `dev` and are now present on `main` through PR #33.
The earlier association of #21 with MVP Integration Review was corrected to the
live GitHub issue. All three completed temporary branches have been deleted.

## Issue #20 dashboard

Merged into `dev` through PR #31, then promoted to `main` through PR #33; Issue #20 closed.
See [Results dashboard](RESULTS_DASHBOARD.md) for scope, validation and limitations.
Both experiment and dashboard testing sections are retained in the integrated documentation.

## Issue #22 — 2026-09-25

Integrated through PR #38: Greek source editor, static-only validation
API, 32,768-byte limit, solve(values) contract, structured errors and explicit
local CLI execution with a 2-second subprocess timeout. No persistence, public
execution or custom benchmarks. All 60 backend tests and 4 frontend tests pass;
lint/build, Django checks and migration dry-run pass. No migrations required.
See [Custom Python](CUSTOM_PYTHON.md) for scope and verification limits.

## Issue #11 — Επιλογή γλώσσας

Το header προσφέρει Ελληνικά / English και ενημερώνει όλες τις ενότητες,
reviews, grid accessibility labels και custom validation errors. Default el,
χωρίς persistence της επιλογής. Τα drafts/results παραμένουν κατά την αλλαγή.
Προστέθηκαν πέντε frontend regression tests (εννέα συνολικά).
Βλ. [Language](LANGUAGE.md) για το contract και τα όρια.

## Issue #41 — Sorting selection

Στο παρόν feature snapshot προστέθηκε Insertion Sort, κοινός trusted runner και
POST `/api/benchmarks/sorting/`. Ο selector και κάθε αποτέλεσμα κρατούν την ταυτότητα
algorithm σε el/en. Το παλιό Bubble endpoint παραμένει συμβατό. Δεν αλλάζουν models.
Τα #11/#12/#22 έχουν ενσωματωθεί στο dev μέσω PR #40/#39/#38 και έκλεισαν.
Το #41 ενσωματώθηκε στο dev μέσω PR #42. Το feature περιλαμβάνεται στο release snapshot.

## Issue #43 — Εκτέλεση και αποθήκευση experiments

Backend-only feature: POST run, runtime validation, έως 4 pairs, atomic persistence,
GET persisted results και snapshot identity. Προστέθηκε migration 0004.
Το #41 έγινε merge στο dev μέσω PR #42 (20b0e96) και έκλεισε.
Το #43 ενσωματώθηκε στο dev μέσω PR #44· το standalone benchmark UI παραμένει session-only.

## Issue #45 — Experiment UI

Στο παρόν feature snapshot: create draft, run, open by ID, refresh, snapshot result
table και el/en feedback. Το #43 ενσωματώθηκε στο dev μέσω PR #44 (ac23024) και έκλεισε.
Το #45 έγινε merge μέσω PR #46. Το #47 προσθέτει history/listing· richer comparison ακολουθεί.

## Issue #47 — Experiment history

Στο παρόν feature snapshot: GET collection με bounded summaries/cursor, history UI,
previous/next, retry/refresh και άνοιγμα χωρίς ID πληκτρολόγηση. Ενσωματώθηκε στο dev μέσω PR #48.
Το #45 έχει ενσωματωθεί στο dev μέσω PR #46 (e350267) και έκλεισε.
