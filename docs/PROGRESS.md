# Project Progress

Last verified: **2026-09-13**

## Current phase

Algorithm Evaluation Lab MVP. The Algorithm Library is implemented and merged.
Dataset generation is the next feature; it has not been implemented yet.

## Git state

- Issue #16 is closed as completed.
- PR #27 merged the Algorithm Library into `main` at `49f7fd1`.
- After `git fetch origin`, `origin/main` points to that merge commit.
- The local `main` branch still points to `a94fc88`; fetch does not move it.
- Current working branch: `feature-16-algorithm-library`.
- Follow-up fixes are committed locally as `9e1582b`.
- Relative to `origin/main`, this branch contains the follow-up fix commit and
  lacks the PR #27 merge commit. Before those fixes, the file trees were identical.
- The imported and updated documentation is being recorded in a separate local
  commit. Fixes and documentation have not been pushed or merged into `main`.

## Completed functionality

- React/TypeScript/Vite frontend and Django/DRF backend.
- Health endpoint and frontend API client.
- Pathfinding grid foundation, wall toggling, clear/reset controls, translations.
- `Problem`, `Algorithm`, and `AlgorithmImplementation` domain models.
- Idempotent seed command for Bubble, Selection, Insertion, Merge, and Quick Sort.
- Complexity metadata and read-only `GET /api/algorithms/` API.
- Filtering of active built-in implementations; private registry keys.
- Algorithm Library cards, loading/error/empty states and retry button.

Seeded implementation records are metadata. Executable sorting functions and
registry resolution remain planned work.

## Follow-up fixes

- ESLint excludes `backend/.venv` dependencies.
- Algorithm Library retries set loading state in the event handler.
- Effect cleanup ignores outdated algorithm responses.
- Backend health is checked on mount and five seconds after each completed check.
- Health requests time out after five seconds; cleanup aborts requests and timers.
- Health recovery updates the status automatically; library recovery uses retry.

## Verification

Latest frontend checks on 2026-09-13: lint, build, and diff whitespace checks passed.
Backend baseline verified earlier in this session: six tests passed, Django checks
passed, and no model changes requiring migrations were detected.

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

1. Publish/integrate the local fixes and documentation through the Git workflow.
2. Issue #17: Dataset Generators.
3. Issue #18: Benchmark Runner.
4. Issue #19: Experiment Model and API.
5. Issue #20: Results Dashboard.
6. Issue #21: MVP Integration Review.

## Scope alignment for Issue #17

The live issue specifies Random, Sorted, Reversed, and Nearly Sorted datasets;
`size` and `seed`; reproducibility tests; sizes 10, 100, 1000 plus bounded custom
sizes; and independent input copies for benchmark runs.

Few Unique Values appears in the imported plan but is a proposed extension.
The custom size limit and exact generator semantics remain design decisions for
Issue #17. No new dataset endpoint contract has been finalized.
