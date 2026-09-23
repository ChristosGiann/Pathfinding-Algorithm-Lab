# Architecture Decision Log

## ADR-012 — Poll backend health for the local status indicator

**Status:** Implemented in local follow-up commit `9e1582b`

The status indicator checks `/api/health/` on mount and schedules its next check
five seconds after the previous request settles. A five-second timeout bounds
each request. Cleanup cancels timers and aborts the active request.

Browser testing found that a mount-only check stayed offline after the library
successfully retried. Independent health polling lets the indicator recover and
detect later outages without coupling it to the library. It adds one small
request approximately every five seconds while the component is mounted and
does not guarantee that every application endpoint works. Visibility-aware
polling and shared connection state can be revisited if needed.

This file records important project decisions and why they were made.

## ADR-001 — Expand from Pathfinding Visualizer to Algorithm Evaluation Lab

**Status:** Accepted

### Decision

The current project name is:

```text
Algorithm Evaluation Lab
```

Visualization remains a module, while the broader product focuses on algorithm evaluation, benchmarking, experiments, and comparison.

### Reason

The broader scope supports more educational and engineering value across sorting, searching, graph algorithms, datasets, benchmarks, and performance analysis.

---

## ADR-002 — Use a modular monolith

**Status:** Accepted

### Decision

Use a modular monolith instead of microservices.

### Reason

The application is still one coherent domain. Microservices would add deployment, networking, coordination, and observability complexity without solving a current problem.

---

## ADR-003 — React + TypeScript frontend and Django + DRF backend

**Status:** Accepted

### Decision

Frontend:

```text
React + TypeScript + Vite
```

Backend:

```text
Django + Django REST Framework
```

### Reason

This creates a clear frontend/backend boundary and provides practice with typed frontend development, REST APIs, relational modeling, backend tests, and full-stack integration.

---

## ADR-004 — Separate Algorithm from AlgorithmImplementation

**Status:** Accepted

### Decision

Represent the theoretical algorithm and its executable implementation separately.

Example:

```text
Algorithm:
  Quick Sort

Implementation:
  Built-in Python
```

### Reason

An algorithm may later have multiple implementations, such as reference, optimized, or custom variants.

---

## ADR-005 — Store registry keys, not executable code, in the database

**Status:** Accepted

### Decision

Built-in implementations will be resolved through a Python registry.

Conceptually:

```python
ALGORITHM_REGISTRY = {
    "sorting.quick_sort": quick_sort,
}
```

The database stores the registry key, not executable source code.

### Reason

This keeps trusted code execution explicit and avoids treating database content as executable code.

---

## ADR-006 — Keep complexity metadata on Algorithm for the MVP

**Status:** Accepted

### Decision

Store:

- best case
- average case
- worst case
- space complexity

on `Algorithm`.

### Reason

These describe the theoretical algorithm. Empirical implementation performance belongs in benchmark results.

---

## ADR-007 — SQLite for development, PostgreSQL later if needed

**Status:** Accepted

### Decision

Use SQLite during current development.

Potential production database:

```text
PostgreSQL
```

### Reason

SQLite is sufficient for local development, migrations, API work, initial experiment storage, and automated tests.

---

## ADR-008 — API-first frontend/backend communication

**Status:** Accepted

### Decision

React receives backend data through REST endpoints and the centralized API client.

Current examples:

```text
GET /api/health/
GET /api/algorithms/
```

### Reason

This creates a clean boundary and independently testable backend behavior.

---

## ADR-009 — Benchmarks should use repeated runs

**Status:** Accepted

### Decision

Do not rely on one timing measurement.

Experiments should support multiple runs and summary statistics.

Initial statistics:

- mean
- minimum
- maximum
- median

### Reason

Single timings are noisy and can be misleading.

---

## ADR-010 — Complete the evaluation pipeline before adding infrastructure

**Status:** Accepted

### Decision

Do not add Redis, Celery, Kubernetes, microservices, or WebSockets until a concrete requirement appears.

### Reason

Current priority is:

```text
Algorithms
→ Datasets
→ Benchmarks
→ Experiments
→ Results
→ Comparison
```

Architecture complexity should grow only when product needs justify it.

---

## ADR-011 — Keep Greek and English translation structure

**Status:** Accepted

### Decision

Keep both Greek and English translation entries.

Default language is currently Greek.

### Reason

The structure already exists and makes a future language selector straightforward.

## ADR-013 — Controlled permutations and immutable sources

**Status:** Implemented locally for Issue #17

Use permutations of `range(size)` to isolate input ordering across dataset types.
Use private seeded randomness and frozen tuple values with fresh copies per run.
Limit generation to 100,000 items; benchmark execution needs separate limits.
Nearly sorted uses disjoint adjacent swaps for roughly 1% of the input length.
See [Datasets](DATASETS.md) for the complete contract.

## ADR-014 — Bounded synchronous Bubble Sort benchmark

**Status:** Implemented locally for Issue #18

Use a fixed trusted Bubble Sort, ten runs, perf_counter_ns and a 1000-item cap.
Copying and correctness checks stay outside timing. The first endpoint directly
imports built-in code without accepting arbitrary execution targets; general
registry integration waits for multiple executable implementations. Return
results without persistence until #19. This matches the narrower live issue
rather than implementing the broader planned benchmark engine prematurely.

## ADR-015 — Persist draft definitions separately from execution

**Status:** Implemented locally for #19

Experiments own dataset configurations and reference active built-in sorting
implementations. Creation is atomic and always draft; API clients cannot set
execution status. This avoids claiming execution has occurred when saving
configuration. Dataset limits match generation (100,000); actual execution
must apply runner limits separately. Catalogue references are live, not code
version snapshots. See [Experiments](EXPERIMENTS.md) for limitations.
