# Project Progress

Last verified: **2026-09-13**

## Current phase

Algorithm Evaluation Lab MVP. The Algorithm Library is implemented and merged.
Issue #17 was merged into dev via PR #28 and closed with a completion comment.
Issue #18 is implemented locally on `codex/18-bubble-sort-benchmark`: trusted
Bubble Sort, ten timed runs, API and frontend result card. Review/push/merge
remain pending for #18. See [Benchmarks](BENCHMARKS.md).

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

Seeded implementation records are metadata. Bubble Sort is executable locally for #18; other sorters and
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
Django checks passed, and no migrations are required.

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

1. Start issue work from an updated `dev`; integrate completed work back into `dev`.
2. Review and integrate Issue #18 into dev.
3. Continue with Issue #19 after integration.
4. Issue #19: Experiment Model and API.
5. Issue #20: Results Dashboard.
6. Issue #21: MVP Integration Review.

## Scope alignment for Issue #17

The live issue specifies Random, Sorted, Reversed, and Nearly Sorted datasets;
`size` and `seed`; reproducibility tests; sizes 10, 100, 1000 plus bounded custom
sizes; and independent input copies for benchmark runs.

Few Unique Values appears in the imported plan but is a proposed extension.
The local implementation supports sizes 1 through 100,000 with the semantics
in [Datasets](DATASETS.md). The future runner must use `copy_for_run()`. No new dataset endpoint contract has been finalized.
