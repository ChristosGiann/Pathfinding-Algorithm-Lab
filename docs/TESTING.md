# Testing Strategy

## Goal

Testing should protect the evaluation pipeline without becoming unnecessary maintenance overhead.

## Current backend test suite

Current verified state:

```text
25 tests
```

Run with:

```powershell
python backend\manage.py test core
```

Latest verified result after local Bubble Sort benchmark implementation:

```text
Ran 25 tests
OK
```

## Current coverage

### Algorithms API

The suite verifies that:

- five seeded sorting algorithms are returned,
- complexity metadata is returned correctly,
- only active built-in implementations are returned,
- custom implementations do not leak into the public list,
- inactive built-in implementations do not leak into the public list,
- algorithms without an active built-in implementation are excluded,
- `registry_key` is not exposed.

### Seed command

The suite verifies that:

```text
seed_sorting_algorithms
```

is idempotent.

Repeated execution should not create duplicate:

- Problems
- Algorithms
- AlgorithmImplementations

## Test database

Django tests use a temporary test database.

Running:

```powershell
python backend\manage.py test core
```

does not modify the normal development SQLite database.

## Testing layers

### 1. Unit tests

Use for isolated logic:

- dataset generators,
- sorting implementations,
- benchmark metric calculations,
- statistics helpers,
- registry resolution.

### 2. API tests

Use for REST contracts:

```text
/api/algorithms/
future experiment endpoints
future results endpoints
```

Verify:

- status code,
- response structure,
- filtering,
- validation,
- hidden internal fields,
- errors.

### 3. Integration tests

Use for important end-to-end backend flows.

Target future flow:

```text
Create experiment
    ↓
Generate dataset
    ↓
Resolve implementation
    ↓
Run benchmark
    ↓
Calculate metrics
    ↓
Store result
    ↓
Return result through API
```

## Frontend testing

Current frontend verification is primarily:

- TypeScript/build verification through `npm run build`,
- manual browser testing,
- real backend integration testing.

A dedicated frontend testing framework has not yet been established.

Add one when frontend behavior becomes complex enough to justify it.

## Current manual verification

Verified on 2026-09-13 using the real local Django server and the browser:

| Scenario | Steps | Observed result |
| --- | --- | --- |
| Initial success | Start backend and frontend, open page | Five algorithm cards with complexity metadata |
| Connection failure | Stop backend, reload page | Library error message and New attempt button |
| Failed retry | Keep backend stopped, select New attempt | Loading, then error and retry button again |
| Recovery | Restart backend, select New attempt without refresh | All five cards return |
| Health loss | With page open, stop backend | Header changes to unavailable without refresh |
| Health recovery | Restart backend without refreshing page | Header changes to available automatically |

Stop only the development server started for the test (Ctrl+C in its terminal),
then restart it with the same command. Leave the backend running after recovery.
Health checks are scheduled five seconds after the previous check completes;
a request may take up to another five seconds to time out.

These are browser verification results, not automated frontend tests. The empty
response, delayed-request timeout, and component-unmount cleanup scenarios were
not separately exercised in this session. Do not infer those results from lint
or build success. No full browser-console audit was performed.

The lint/build checks passed after the fixes. ESLint excludes `backend/.venv`;
the check should inspect application code rather than installed Python packages.

Algorithm Library checks include:

- backend running,
- frontend running,
- algorithms endpoint reachable,
- all five sorting algorithms visible,
- complexity metadata visible,
- built-in implementation visible,
- basic responsive behavior,
- no obvious functional errors.

## Benchmark testing principles

When the benchmark engine is implemented, distinguish:

### Correctness

Does the algorithm return the correct result?

### Orchestration

Does the runner:

- copy inputs correctly,
- run the configured number of times,
- collect timings,
- isolate algorithms from each other's mutations?

### Statistics

Are mean, min, max, and median calculated correctly?

Do not test for exact execution times. Timing is environment-dependent.

## Pre-PR checks

Recommended:

```powershell
npm run lint
npm run build
python backend\manage.py check
python backend\manage.py test core
python backend\manage.py makemigrations --check --dry-run
git diff --check
```

## Testing rules

- Every reliable bug should be considered for a regression test.
- Every new public API contract should have API coverage.
- New pure benchmark/data logic should have focused unit tests.

## Dataset tests

Eleven tests in `backend/core/datasets/tests.py` cover reproducibility, ordering,
contents, size limits, validation, global RNG isolation and independent copies.
They use `SimpleTestCase` without a database. See [Datasets](DATASETS.md).

## Benchmark verification

Eight new tests cover Bubble Sort, timing boundaries, fresh inputs, correctness
failures, stats, API bounds and validation. The suite now contains 25 tests.
See [Benchmarks](BENCHMARKS.md) for browser scenarios and measurement limits.
