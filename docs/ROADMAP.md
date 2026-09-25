# Roadmap

## Main development path

```text
Algorithm Library
        ↓
Dataset Generators
        ↓
Benchmark Runner
        ↓
Experiment API
        ↓
Results Dashboard
        ↓
MVP Integration
        ↓
Advanced Comparison
        ↓
Visualization
        ↓
Additional Algorithm Families
```

The evaluation pipeline is the priority. Infrastructure should be added only when it solves a real requirement.

## Phase 0 — Foundation

Status: **Completed**

- React/Vite frontend foundation
- Django backend foundation
- Django REST Framework
- backend health endpoint
- CORS configuration
- frontend API client
- base pathfinding grid
- i18n structure

## Phase 1 — Algorithm domain

Status: **Completed**

- `Problem`
- `Algorithm`
- `AlgorithmImplementation`
- sorting seed command
- Bubble Sort
- Selection Sort
- Insertion Sort
- Merge Sort
- Quick Sort
- complexity metadata
- migrations
- Django admin support

## Phase 2 — Algorithms API

Status: **Completed**

- `GET /api/algorithms/`
- serializers
- active built-in implementation filtering
- private `registry_key`
- backend automated tests

## Phase 3 — Issue #16: Algorithm Library

Status: **Merged through PR #27; Issue #16 closed**

Implemented:

- TypeScript API types
- `getAlgorithms()`
- responsive Algorithm Library
- algorithm cards
- complexity display
- implementation display
- loading state
- empty state
- error state
- retry
- Greek and English translations
- integration into `App.tsx`

Follow-up fixes for retry cleanup, lint scope, and backend health polling were
committed as `9e1582b`, integrated into `dev`, and promoted to `main` with
the combined snapshot through PR #33 on 2026-09-23. See [Progress](PROGRESS.md).

## Phase 4 — Issue #17: Dataset Generators

Status: **Merged through PR #28 and promoted to main through PR #33; Issue #17 closed**

Initial dataset types:

- Random
- Sorted
- Reversed
- Nearly Sorted

Issue #17 acceptance sizes:

- 10
- 100
- 1,000
- custom size from 1 through 100,000

Requirements:

- each generator accepts `size` and `seed`; identical configuration reproduces input,
- focused tests,
- safe copies so one algorithm cannot mutate another algorithm's input.

Few Unique Values and larger preset sizes were suggested in the imported plan.
They remain possible extensions, not part of Issue #17's current scope.

## Phase 5 — Issue #18: Benchmark Runner

Status: **Merged through PR #29 and promoted to main through PR #33; Issue #18 closed**

Initial measurements:

- execution time
- algorithm
- implementation
- dataset type
- input size

Later possibilities:

- comparisons
- swaps
- iterations
- memory usage

## Phase 6 — Issue #19: Experiment Model + API

Status: **Merged through PR #30 and promoted to main through PR #33; Issue #19 closed**

Experiment definitions store selected implementations and owned dataset
configurations. Create and retrieve APIs, draft default, five model statuses,
validation and atomic persistence are implemented. Execution, lifecycle transitions
and stored timing results are separate future work. See [Experiments](EXPERIMENTS.md).

## Phase 7 — Issue #20: Results Dashboard

Status: **Merged through PR #31 and promoted to main through PR #33; Issue #20 closed**

Implemented: a session results table, median/min/max chart, correctness and
error/timeout states for the Bubble Sort benchmark. History is not persisted.
Experiment execution/results and comparisons between implementations remain
future work. See [Results dashboard](RESULTS_DASHBOARD.md).

## Phase 8 — Issue #21: Personal Implementation Review

Status: **Merged through PR #32 and promoted to main through PR #33; Issue #21 closed**

The live issue #21 requests subjective ratings and notes per implementation.
The earlier mapping to MVP Integration Review was stale. Six optional 1–5
ratings, strengths, weaknesses, use cases and notes are persisted via GET/PUT
and edited through a Greek form in the Algorithm Library.
See [Implementation reviews](IMPLEMENTATION_REVIEWS.md) for the single-user scope.

## Issue #22: Custom Python implementation validation

Status: **Implemented in this feature snapshot**

Delivered scope:

- accept Python source code for a local custom implementation,
- validate syntax,
- require a `solve(values)` function,
- enforce a source-size limit,
- return structured validation errors,
- provide explicit local CLI execution with a 2-second subprocess timeout,
- keep arbitrary custom-code execution local-development-only until a real sandbox exists.

The HTTP API performs static checks only. Execution requires the local CLI flag;
custom-code persistence and benchmark integration remain future work.
See [Custom Python](CUSTOM_PYTHON.md).

## Future milestone — MVP Integration Review

Status: **Planned; not the scope of Issue #21**

End-to-end flow:

```text
Select algorithm(s)
    ↓
Generate dataset
    ↓
Run benchmark
    ↓
Store results
    ↓
Retrieve results
    ↓
Display comparison
```

Review:

- architecture
- API contracts
- error handling
- tests
- UX
- documentation
- data correctness

## Phase 9 — Visualization

Status: **Future**

Planned controls:

- Play
- Pause
- Step
- Reset
- Speed

Sorting visualizations may show comparisons, swaps, active indices, and sorted regions.

The existing pathfinding grid can later support graph algorithms.

## Phase 10 — Additional algorithm families

Possible order:

1. Searching
2. Graph traversal / shortest path
3. Dynamic programming
4. String matching
5. Trees

## Phase 11 — Advanced features

Possible future features:

- custom datasets
- experiment history
- experiment replay
- CSV/JSON export
- richer benchmark statistics
- algorithm ranking views
- memory measurements
- custom implementations
- AI-assisted result explanation

These are outside the first MVP.

## Lower-priority backlog

Previously discussed work also includes:

- README/documentation improvements
- fuller i18n / language switching
- continued visualizer improvements

These should not interrupt the evaluation pipeline unless they become blockers.
