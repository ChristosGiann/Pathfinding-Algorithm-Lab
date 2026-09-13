# API Reference

## Purpose

This document describes the public contract between the React frontend and Django backend.

Only implemented endpoints are considered current API. Planned endpoints are marked clearly.

## Base URL

The frontend reads:

```text
VITE_API_BASE_URL
```

Local development commonly uses:

```text
http://127.0.0.1:8000
```

## GET /api/health/

Status: **Implemented**

### Purpose

Check whether the backend is reachable.

### Response

```json
{
  "status": "ok"
}
```

### Frontend client

```typescript
getBackendHealth(signal?: AbortSignal)
```

The client accepts an optional cancellation signal and bypasses the browser cache.
`BackendStatus` checks on mount, then schedules the next check five seconds after
the previous request settles. Each request has a five-second timeout. Cleanup
cancels the active request and timers. The status describes the health endpoint,
not the success of every application endpoint.

---

## GET /api/algorithms/

Status: **Implemented**

### Purpose

Return available sorting algorithms that have an active built-in implementation.

### Example response

```json
[
  {
    "name": "Quick Sort",
    "slug": "quick-sort",
    "description": "A divide-and-conquer sorting algorithm that partitions elements around a pivot.",
    "problem": "Sorting",
    "best_case_complexity": "O(n log n)",
    "average_case_complexity": "O(n log n)",
    "worst_case_complexity": "O(n^2)",
    "space_complexity": "O(log n) avg / O(n) worst",
    "implementations": [
      {
        "name": "Built-in Python",
        "slug": "built-in-python",
        "language": "python",
        "source_type": "built_in",
        "is_reference": true,
        "is_active": true
      }
    ]
  }
]
```

### Current behavior

- returns algorithms under the Sorting problem,
- requires at least one active built-in implementation,
- returns only active built-in implementations in the nested list,
- does not expose `registry_key`.

### Frontend type

```text
src/types/algorithm.ts
```

### Frontend client

```typescript
getAlgorithms()
```

## POST /api/benchmarks/bubble-sort/

Implemented locally for Issue #18. Accepts size (1–1000), optional seed and
dataset_type. Runs trusted Bubble Sort ten times and returns correctness plus
median/min/max and individual times in ns. See [Benchmark contract](BENCHMARKS.md)
for full validation and response semantics.

# Planned API

The exact contracts below are not finalized.

## Dataset API

Status: **Planned**

Possible responsibilities:

- expose supported dataset types,
- validate dataset configuration,
- optionally preview generated data.

Initial dataset types:

- random
- sorted
- reversed
- nearly sorted

The open Issue #17 defines these four initial types. Few unique values remains
a proposed extension, outside that issue's current acceptance criteria.

No endpoint path is final yet.

## Experiment API

Status: **Planned**

Expected responsibilities:

- create an experiment,
- choose algorithms/implementations,
- choose dataset configuration,
- choose run count,
- execute or trigger benchmarking,
- return stored experiment metadata.

No endpoint path or payload is final yet.

## Results API

Status: **Planned**

Expected responsibilities:

- fetch experiment results,
- expose summary statistics,
- support dashboard/comparison views.

No endpoint path or payload is final yet.

## API design rules

1. Do not expose internal execution details unnecessarily.
2. Keep `registry_key` private unless a future use case requires it.
3. Validate IDs, slugs, and configuration in the backend.
4. Keep frontend types aligned with API responses.
5. Add API tests for new endpoints.
6. Update this document in the same PR when a public contract changes.
