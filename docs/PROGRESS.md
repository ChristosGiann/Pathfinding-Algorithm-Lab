# Project Progress

Last verified: **2026-09-23**

## Current phase

Issue #17 merged through PR #28 and Issue #18 through PR #29 into dev; both closed.
Issues #19 and #20 were merged into dev via PR #30 and PR #31 and closed.
Issue #21 was merged through PR #32 into dev and closed.
Issues #17–#21 are integrated; this snapshot prepares their promotion to main.

## Git state

- Issue #16 is closed; PR #27 merged the library into `main` at `49f7fd1`.
- `dev` was created from that `origin/main` commit.
- Fixes (`9e1582b`) and documentation (`b1a6908`) have been merged into `dev`.
- Integration branch: `dev`; promotion to `main` is explicitly authorized on 2026-09-23.
- `main` and `dev` are permanent. Never delete `dev`, locally or remotely,
  including after a dev-to-main PR. Delete only merged temporary issue branches.
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

Seeded implementation records are metadata. Bubble Sort is executable since #18; other sorters and
database registry resolution remain planned work.

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
The documentation refresh changes no application code.

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

1. Promote this integrated snapshot from dev to main as authorized.
2. Continue with Issue #22: custom Python validation; implementation has not started.
3. Keep dev permanently for subsequent issue branches.

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

Merged into dev through PR #32; Issue #21 closed.
Adds review persistence, strict GET/PUT API, Greek editable form and eight new
backend tests (44 total with experiments integrated). Lint/build and migration checks pass.
Browser verification covered save, refresh, update, offline load/save errors,
retry, and separate review data per implementation. See
[Implementation reviews](IMPLEMENTATION_REVIEWS.md).

PR #30 (#19), PR #31 (#20) and PR #32 (#21) are merged into dev.
The earlier association of #21 with MVP Integration Review was corrected to the
live GitHub issue. All three completed temporary branches have been deleted.

## Issue #20 dashboard

Merged into dev through PR #31; Issue #20 closed.
See [Results dashboard](RESULTS_DASHBOARD.md) for scope, validation and limitations.
Both experiment and dashboard testing sections are retained in the integrated documentation.
