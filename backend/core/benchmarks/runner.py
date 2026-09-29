from statistics import median
from time import perf_counter_ns

from core.algorithms.sorting import bubble_sort, insertion_sort, selection_sort, merge_sort, quick_sort
from core.datasets import generate_dataset

RUN_COUNT = 10
MAX_BENCHMARK_SIZE = 1000


def run_sorting_benchmark(algorithm: str, size: int, seed: int = 42,
                          dataset_type: str = "random") -> dict:
    """Time only trusted sorting code, using identical fresh input each run."""
    sorters = {"bubble-sort": bubble_sort, "insertion-sort": insertion_sort, "selection-sort": selection_sort, "merge-sort": merge_sort, "quick-sort": quick_sort}
    if not isinstance(algorithm, str) or algorithm not in sorters:
        raise ValueError("Unknown sorting algorithm")
    sorter = sorters[algorithm]
    if type(size) is not int or not 1 <= size <= MAX_BENCHMARK_SIZE:
        raise ValueError(f"size must be an integer between 1 and {MAX_BENCHMARK_SIZE}")
    dataset = generate_dataset(dataset_type, size, seed)
    expected = sorted(dataset.values)
    timings = []
    correct = True
    for _ in range(RUN_COUNT):
        values = dataset.copy_for_run()
        start = perf_counter_ns()
        sorter(values)
        elapsed = perf_counter_ns() - start
        timings.append(elapsed)
        correct = (values == expected) and correct
    return {
        "algorithm": algorithm,
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


def run_bubble_sort_benchmark(size: int, seed: int = 42,
                              dataset_type: str = "random") -> dict:
    """Keep the original Bubble Sort contract available."""
    return run_sorting_benchmark("bubble-sort", size, seed, dataset_type)
