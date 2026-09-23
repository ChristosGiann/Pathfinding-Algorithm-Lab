# Project Progress

Last verified: **2026-09-22**

## Current phase

Issue #17 merged through PR #28 and Issue #18 through PR #29 into dev; both closed.
Issue #19 is implemented locally on `codex/19-experiment-model-api` with models,
atomic create/read API and validation. No commit, push or merge yet for #19.

## Git state

- Issue #16 is closed; PR #27 merged the library into `main` at `49f7fd1`.
- `dev` was created from that `origin/main` commit.
- Fixes (`9e1582b`) and documentation (`b1a6908`) have been merged into `dev`.
- Integration branch: `dev`; `main` has not received these follow-up changes.
- Only `main` and `dev` are permanent. Delete issue branches after merging to dev.
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

Latest frontend checks on 2026-09-13: lint, build, and diff whitespace checks passed.
Backend verification after Issue #18: 25 tests passed (17 existing and 8 new benchmark tests),
Those earlier changes needed no migrations; #19 adds migration 0003.

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

1. Review/integrate Issue #19 into dev.
2. Inspect the live Issue #20 before implementation.
3. Issue #21: MVP Integration Review.

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

## Issue #20 dashboard

Implemented on `codex/20-results-dashboard`, based on dev, for PR review.
See [Results dashboard](RESULTS_DASHBOARD.md) for scope, validation and limitations.
PR #30 for #19 was merged into dev. The #20 branch now includes updated dev;
both experiment and dashboard testing sections are retained for integration.
