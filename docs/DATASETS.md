# Dataset generators

Implemented locally for Issue #17 in `backend/core/datasets/generators.py`.
This is a Python utility, without a dataset HTTP endpoint or frontend form.

## Contract

```python
from core.datasets import generate_dataset

dataset = generate_dataset("random", size=1000, seed=42)
run_input = dataset.copy_for_run()
```

- `size`: integer from 1 through 100,000. Includes presets 10, 100, 1000 and
  arbitrary sizes in the same range. Empty datasets are intentionally rejected.
- `seed`: required integer, including zero or negative values. Booleans, strings,
  floats and `None` are rejected for both size and seed.
- `dataset_type`: `random`, `sorted`, `reversed`, or `nearly_sorted`.
- Unknown type or out-of-range size raises `ValueError`; invalid size/seed types
  raise `TypeError`.
- Result: frozen `Dataset` with type, size, seed and an immutable tuple of values.

All types contain each integer from 0 through size - 1 exactly once. This isolates
the effect of ordering. Duplicate-heavy and random-with-replacement inputs are
future extensions.

| Type | Ordering |
| --- | --- |
| `random` | Shuffled using a private `Random(seed)` instance |
| `sorted` | Ascending |
| `reversed` | Descending |
| `nearly_sorted` | Ascending with `max(1, size // 100)` disjoint adjacent swaps for size >= 2 |

Nearly sorted swaps select pairs beginning at even indices. Each affected value
moves only one position; size 1 stays unchanged. Sorted/reversed accept and retain
the seed but their values do not depend on it. Randomness does not modify Python's
global random state. Reproducibility is for the same implementation and runtime;
cross-version random-library compatibility is not promised.

## Independent benchmark input

```python
first = dataset.copy_for_run()
second = dataset.copy_for_run()
first.sort()
assert second == list(dataset.values)
```

Every run must call `copy_for_run()` before executing an in-place sorter. Copying
should be outside the timed algorithm section. The runner is planned in Issue #18;
the copy contract and isolation are tested here, not runner orchestration.
The 100,000-element limit bounds generator allocation, not benchmark execution
time. The future runner needs its own limits for slow quadratic algorithms.

## Verification

```powershell
.\backend\.venv\Scripts\python.exe backend\manage.py test core.datasets
```

Eleven tests cover repeatability, ordering, permutation contents, nearly sorted
displacement, input validation, global RNG isolation, immutable source data, and
independent mutable copies. The full `test core` suite contains 17 passing tests
as verified on 2026-09-13.
