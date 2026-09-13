from statistics import median
from time import perf_counter_ns

from core.algorithms.sorting import bubble_sort
from core.datasets import generate_dataset

RUN_COUNT = 10
MAX_BENCHMARK_SIZE = 1000


def run_bubble_sort_benchmark(size: int, seed: int = 42,
                              dataset_type: str = "random") -> dict:
    """Time only trusted sorting code, using identical fresh input each run."""
    if type(size) is not int or not 1 <= size <= MAX_BENCHMARK_SIZE:
        raise ValueError(f"size must be an integer between 1 and {MAX_BENCHMARK_SIZE}")
    dataset = generate_dataset(dataset_type, size, seed)
    expected = sorted(dataset.values)
    timings = []
    correct = True
    for _ in range(RUN_COUNT):
        values = dataset.copy_for_run()
        start = perf_counter_ns()
        bubble_sort(values)
        elapsed = perf_counter_ns() - start
        timings.append(elapsed)
        correct = (values == expected) and correct
    return {
        "algorithm": "bubble-sort",
        "dataset_type": dataset_type,
        "size": size,
        "seed": seed,
        "runs": RUN_COUNT,
        "correct": correct,
        "timings_ns": timings,
        "median_ns": median(timings),
        "min_ns": min(timings),
        "max_ns": max(timings),
    }
