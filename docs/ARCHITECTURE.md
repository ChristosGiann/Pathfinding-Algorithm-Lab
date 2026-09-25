# Architecture

## Architectural style

The project uses a **modular monolith**.

The application remains one backend and one frontend, while responsibilities are separated into clear modules. Microservices are intentionally avoided at the current scale.

## High-level architecture

```text
+-----------------------------+
|       React Frontend        |
|                             |
| Algorithm Library           |
| Dataset Builder             |
| Experiment Builder          |
| Results Dashboard           |
| Visualizer                  |
+-------------+---------------+
              |
              | REST / JSON
              v
+-----------------------------+
|       Django Backend        |
|                             |
| Algorithms                  |
| Datasets                    |
| Experiments                 |
| Benchmarks                  |
| Results                     |
+-------------+---------------+
              |
              v
+-----------------------------+
|          Database           |
|                             |
| Problems                    |
| Algorithms                  |
| Implementations             |
| Experiments (planned)       |
| Results (planned)           |
+-----------------------------+
```

## Frontend

Current technologies:

- React 19
- TypeScript 6
- Vite 8
- CSS
- Fetch API

Current important structure:

```text
src/
├── components/
│   ├── AlgorithmLibrary/
│   ├── AppHeader/
│   ├── BackendStatus/
│   ├── Grid/
│   └── Toolbar/
├── i18n/
│   └── translations.ts
├── services/
│   └── apiClient.ts
├── types/
│   └── algorithm.ts
├── utils/
├── App.tsx
└── main.tsx
```

Planned growth:

```text
src/
├── components/
│   ├── DatasetBuilder/
│   ├── ExperimentForm/
│   ├── BenchmarkResults/
│   ├── Charts/
│   └── Visualizer/
├── types/
│   ├── dataset.ts
│   ├── experiment.ts
│   └── benchmark.ts
└── ...
```

Do not create empty modules before they are needed.

## Backend

Current technologies:

- Django 5.2.16
- Django REST Framework 3.17.1
- SQLite

Current important structure:

```text
backend/core/
├── management/
│   └── commands/
│       └── seed_sorting_algorithms.py
├── migrations/
├── models.py
├── serializers.py
├── tests.py
├── urls.py
└── views.py
```

Planned modular growth:

```text
backend/core/
├── algorithms/
│   ├── registry.py
│   └── sorting/
├── datasets/
│   └── generators.py
├── benchmarks/
│   ├── runner.py
│   └── metrics.py
└── ...
```

If the domain grows enough, modules may later become separate Django apps.

## Domain model

### Problem

Represents the family/problem category an algorithm solves.

Current example:

```text
Sorting
```

Future examples:

```text
Searching
Graph Traversal
Shortest Path
String Matching
```

### Algorithm

Represents the theoretical algorithm concept.

Current metadata includes:

- problem
- name
- slug
- description
- best-case complexity
- average-case complexity
- worst-case complexity
- space complexity
- timestamps

### AlgorithmImplementation

Represents an executable implementation of an algorithm.

Example:

```text
Algorithm:
  Quick Sort

Implementation:
  Built-in Python
```

The separation allows future variants:

```text
Quick Sort
├── Reference Python
├── Optimized Python
└── Custom implementation
```

## Algorithm registry

Executable functions should not be stored in the database.

Planned pattern:

```python
ALGORITHM_REGISTRY = {
    "sorting.bubble_sort": bubble_sort,
    "sorting.selection_sort": selection_sort,
    "sorting.insertion_sort": insertion_sort,
    "sorting.merge_sort": merge_sort,
    "sorting.quick_sort": quick_sort,
}
```

The database stores a `registry_key`, and the backend resolves it to trusted Python code.

## Current data flow: Algorithm Library

```text
SQLite
  ↓
Django Model
  ↓
DRF Serializer
  ↓
GET /api/algorithms/
  ↓
Fetch API
  ↓
TypeScript Algorithm[]
  ↓
React AlgorithmLibrary
```

## Planned data flow: Experiment

```text
React Experiment Form
  ↓
Experiment API
  ↓
Dataset Generator
  ↓
Algorithm Registry
  ↓
Benchmark Runner
  ↓
Metrics
  ↓
Persistence
  ↓
Results API
  ↓
React Dashboard
```

## Benchmark principles

Benchmarks should:

- run equivalent input for compared algorithms,
- avoid sharing a mutated dataset,
- use repeated runs,
- store dataset type and input size,
- report summary statistics,
- keep benchmark logic separate from API views.

## Database strategy

Current development database:

```text
SQLite
```

Potential production database:

```text
PostgreSQL
```

## API boundary

Frontend components should use the centralized API client:

```text
React component
    ↓
apiClient.ts
    ↓
Django REST API
```

## Frontend request lifecycle

`AlgorithmLibrary` loads on mount and retries when the user selects New attempt.
Loading state is initialized on mount and reset by the retry event handler.
Effect cleanup ignores stale responses; it does not cancel algorithm requests.

`BackendStatus` independently polls the health endpoint. It waits five seconds
after each settled request before checking again, with a five-second request
timeout. Cleanup clears timers and aborts the active request. Background checks
preserve the last status until a new result arrives. A recovered health check
does not automatically reload the Algorithm Library; its retry button does that.

## i18n

Greek and English translation structures already exist.

Default language is currently Greek. A language switcher is lower priority than the evaluation MVP.

## Dataset utility (Issue #17, local implementation)

`backend/core/datasets/generators.py` has no Django or database dependencies.
A frozen `Dataset` retains type, size, seed and tuple values. `copy_for_run()`
provides independent mutable inputs. See [Datasets](DATASETS.md).

## First benchmark vertical slice (local #18)

React Benchmark form -> centralized API client -> benchmark request serializer
-> pure runner -> dataset copies -> trusted Bubble Sort -> correctness and timing
summary -> result card. The endpoint has no persistence or registry lookup.
See [Benchmarks](BENCHMARKS.md).

## Experiment definitions (#19, local)

Experiment selects implementations through a many-to-many relation and owns
DatasetDefinition rows through a foreign key. API validation precedes atomic
creation of all records. Status is server-owned and defaults to draft.
Read uses prefetching for implementations, algorithms and datasets. No execution
is triggered. See [Experiments](EXPERIMENTS.md).

## Custom Python validation (#22)

React CustomPython editor -> centralized API client -> static validation API ->
AST parse/compile and signature checks -> structured result. This path never
executes or saves submitted code. The separate developer CLI opts into a child
Python process for finite correctness smoke cases with a timeout. The API does
not import the runner. There is no sandbox, database model or benchmark integration.
See [Custom Python](CUSTOM_PYTHON.md).
