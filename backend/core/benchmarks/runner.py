from math import isfinite
from statistics import median, mean, pstdev
from time import perf_counter_ns

from core.algorithms.sorting import bubble_sort, insertion_sort, selection_sort, merge_sort, quick_sort
from core.datasets import generate_dataset

RUN_COUNT = 10
MAX_BENCHMARK_SIZE = 1000


def run_sorting_benchmark(algorithm: str, size: int, seed: int = 42,
                          dataset_type: str = "random") -> dict:
    """Time only trusted sorting code, using identical fresh input each run."""
    sorter = resolve_sorter(algorithm)
    dataset = benchmark_dataset(size, seed, dataset_type)
    return measure_sorter(algorithm, sorter, dataset)


def resolve_sorter(algorithm):
    sorters = {"bubble-sort": bubble_sort, "insertion-sort": insertion_sort,
               "selection-sort": selection_sort, "merge-sort": merge_sort, "quick-sort": quick_sort}
    if not isinstance(algorithm, str) or algorithm not in sorters:
        raise ValueError("Unknown sorting algorithm")
    return sorters[algorithm]


SORTING_ALGORITHMS = ("bubble-sort", "insertion-sort", "selection-sort", "merge-sort", "quick-sort")


def benchmark_dataset(size, seed=42, dataset_type="random"):
    if type(size) is not int or not 1 <= size <= MAX_BENCHMARK_SIZE:
        raise ValueError(f"size must be an integer between 1 and {MAX_BENCHMARK_SIZE}")
    return generate_dataset(dataset_type, size, seed)


def measure_sorter(algorithm, sorter, dataset):
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
        "dataset_type": dataset.dataset_type,
        "size": dataset.size,
        "seed": dataset.seed,
        "runs": RUN_COUNT,
        "correct": correct,
        "timings_ns": timings,
        **timing_statistics(timings),
    }


def run_bubble_sort_benchmark(size: int, seed: int = 42,
                              dataset_type: str = "random") -> dict:
    """Keep the original Bubble Sort contract available."""
    return run_sorting_benchmark("bubble-sort", size, seed, dataset_type)


def compare_sorting(algorithms, size, seed=42, dataset_type="random"):
    if (not isinstance(algorithms, list) or not 2 <= len(algorithms) <= 5
            or any(not isinstance(item, str) for item in algorithms)
            or len(set(algorithms)) != len(algorithms)):
        raise ValueError("Select 2–5 distinct trusted algorithms")
    sorters = [(algorithm, resolve_sorter(algorithm)) for algorithm in algorithms]
    dataset = benchmark_dataset(size, seed, dataset_type)
    results = []
    for algorithm, sorter in sorters:
        try:
            measurement = measure_sorter(algorithm, sorter, dataset)
            results.append({"algorithm": algorithm, "status": "completed", "measurement": measurement})
        except Exception:
            results.append({"algorithm": algorithm, "status": "error", "error": "runner_error"})
    add_relative_statistics(results, algorithms[0])
    return {"baseline_algorithm": algorithms[0], "dataset_type": dataset_type, "size": size, "seed": seed, "results": results}


def add_relative_statistics(results, baseline_algorithm):
    """Keep the explicit reference even when it fails; never choose a new one."""
    reference = next((row for row in results if row["algorithm"] == baseline_algorithm), None)
    baseline = (reference["measurement"]["median_ns"] if reference
                and reference["status"] == "completed" and reference["measurement"]["correct"] else 0)
    for row in results:
        if row["status"] == "completed":
            measurement = row["measurement"]
            duration = measurement["median_ns"]
            measurement["baseline_algorithm"] = baseline_algorithm
            measurement["relative_speed"] = (baseline / duration if baseline > 0 and duration > 0
                                               and measurement["correct"] else None)
            if measurement["relative_speed"] is not None and not isfinite(measurement["relative_speed"]):
                measurement["relative_speed"] = None


def timing_statistics(timings):
    return {"median_ns": median(timings), "mean_ns": mean(timings), "stddev_ns": pstdev(timings),
            "min_ns": min(timings), "max_ns": max(timings)}
