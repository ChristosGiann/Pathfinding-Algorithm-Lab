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
committed locally as `9e1582b`. Publication of these fixes and the documentation
is still pending. See [Progress](PROGRESS.md).

## Phase 4 — Issue #17: Dataset Generators

Status: **Next**

Initial dataset types:

- Random
- Sorted
- Reversed
- Nearly Sorted

Issue #17 acceptance sizes:

- 10
- 100
- 1,000
- custom size with an explicit upper bound (to be chosen during implementation)

Requirements:

- each generator accepts `size` and `seed`; identical configuration reproduces input,
- focused tests,
- safe copies so one algorithm cannot mutate another algorithm's input.

Few Unique Values and larger preset sizes were suggested in the imported plan.
They remain possible extensions, not part of Issue #17's current scope.

## Phase 5 — Issue #18: Benchmark Runner

Status: **Planned**

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

Status: **Planned**

An experiment should describe:

```text
Algorithm(s)
Dataset type
Input size
Number of runs
Execution results
```

Initial statistics:

- mean
- min
- max
- median

Later:

- standard deviation
- percentiles

## Phase 7 — Issue #20: Results Dashboard

Status: **Planned**

Frontend goals:

- inspect experiment results,
- compare algorithms,
- display execution-time charts,
- compare input sizes,
- show theoretical complexity next to measured behavior.

## Phase 8 — Issue #21: MVP Integration Review

Status: **Planned**

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
