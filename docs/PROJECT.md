# Project Definition

## Project name

**Algorithm Evaluation Lab**

The repository currently has the legacy GitHub name `Pathfinding-Algorithm-Lab`.

## Vision

Algorithm Evaluation Lab is an educational benchmarking environment for understanding algorithms through both theory and real execution.

Instead of only reading that an algorithm has a complexity such as `O(n log n)`, the application should allow a user to run controlled experiments and observe how algorithms behave on different datasets and input sizes.

## Core user flow

1. Browse the Algorithm Library.
2. Select one or more algorithms.
3. Choose a dataset type.
4. Choose an input size.
5. Choose the number of benchmark runs.
6. Run an experiment.
7. Measure performance.
8. Store results.
9. Compare algorithms in a dashboard.
10. Relate measured behavior to theoretical complexity.

Example:

```text
Algorithms:
  Quick Sort
  Merge Sort

Dataset:
  Random

Input size:
  10,000

Runs:
  10
```

## Product goals

### Educational
Explain algorithms through descriptions, complexity metadata, visualizations, datasets, and comparisons.

### Experimental
Run repeatable algorithm benchmarks using controlled inputs.

### Analytical
Store and present measurements so users can compare real behavior rather than relying only on theory.

## MVP scope

The first complete MVP should contain:

- Algorithm Library
- built-in sorting algorithms
- dataset generators
- benchmark runner
- experiment persistence
- results API
- results/comparison dashboard
- multiple runs per experiment
- summary statistics such as mean, min, max, and median

## Current algorithm family

```text
Sorting
```

Current seeded algorithms:

- Bubble Sort
- Selection Sort
- Insertion Sort
- Merge Sort
- Quick Sort

## Future algorithm families

### Searching
- Linear Search
- Binary Search

### Graph algorithms
- BFS
- DFS
- Dijkstra
- A*

### Later
- Dynamic Programming
- String Matching
- Tree algorithms

## Visualization

The original visualizer concept remains part of the project, but it is now one module rather than the whole product.

Future controls may include:

- Play
- Pause
- Step
- Reset
- Speed

The existing pathfinding grid can later be reused for graph/pathfinding algorithms.

## Out of scope for the current MVP

- microservices
- Kubernetes
- Redis
- Celery
- WebSockets
- authentication
- complex cloud infrastructure
- arbitrary user code execution
- AI-generated result explanations

## MVP success criteria

A user can:

1. inspect sorting algorithms,
2. generate a controlled dataset,
3. run two or more algorithms against equivalent input,
4. repeat benchmarks,
5. receive stored measurements,
6. compare results in the frontend,
7. understand how measured behavior relates to theoretical complexity.
