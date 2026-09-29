from unittest.mock import patch
from statistics import median

from django.test import SimpleTestCase
from django.urls import reverse
from rest_framework.test import APISimpleTestCase

from core.algorithms.sorting import bubble_sort, insertion_sort, selection_sort, merge_sort, quick_sort
from core.datasets import generate_dataset
from .runner import run_bubble_sort_benchmark, run_sorting_benchmark


class BubbleSortTests(SimpleTestCase):
    def test_sorts_edge_cases_and_generated_inputs(self):
        inputs = [[], [1], [3, -1, 3, 0], list(range(10)), list(range(10, -1, -1))]
        inputs += [generate_dataset(kind, 100, 42).copy_for_run()
                   for kind in ("random", "sorted", "reversed", "nearly_sorted")]
        for original in inputs:
            with self.subTest(values=original[:10]):
                values = original.copy()
                self.assertIsNone(bubble_sort(values))
                self.assertEqual(values, sorted(original))


class RunnerTests(SimpleTestCase):
    def test_ten_fresh_inputs_and_timing_boundaries(self):
        events, received, live_inputs = [], [], []
        expected = generate_dataset("random", 10, 42).copy_for_run()
        def sorter(values):
            events.append("sort")
            received.append(values.copy())
            live_inputs.append(values)
            values.sort()
        ticks = iter(value for run in range(10) for value in (run * 100, run * 100 + run + 1))
        def clock():
            events.append("clock")
            return next(ticks)
        with patch("core.benchmarks.runner.bubble_sort", side_effect=sorter), \
             patch("core.benchmarks.runner.perf_counter_ns", side_effect=clock):
            result = run_bubble_sort_benchmark(10)
        self.assertEqual(received, [expected] * 10)
        self.assertEqual(len({id(values) for values in live_inputs}), 10)
        self.assertEqual(events, ["clock", "sort", "clock"] * 10)
        self.assertEqual(result["timings_ns"], list(range(1, 11)))
        self.assertEqual((result["min_ns"], result["median_ns"], result["max_ns"]), (1, 5.5, 10))
        self.assertTrue(result["correct"])

    def test_detects_wrong_result_even_if_later_runs_succeed(self):
        calls = 0
        def sorter(values):
            nonlocal calls
            calls += 1
            values.sort()
            if calls == 1:
                values[0] = -999
        with patch("core.benchmarks.runner.bubble_sort", side_effect=sorter):
            result = run_bubble_sort_benchmark(10)
        self.assertFalse(result["correct"])
        self.assertEqual(calls, 10)

    def test_rejects_oversized_run_before_generating_data(self):
        with patch("core.benchmarks.runner.generate_dataset") as generate:
            for size in (0, 1001, True, "100"):
                with self.assertRaises(ValueError):
                    run_bubble_sort_benchmark(size)
            generate.assert_not_called()


class BenchmarkAPITests(APISimpleTestCase):
    def test_real_benchmark_without_database(self):
        for kind in ("random", "sorted", "reversed", "nearly_sorted"):
            with self.subTest(kind=kind):
                response = self.client.post(reverse("bubble-sort-benchmark"),
                                            {"size": 100, "dataset_type": kind}, format="json")
                self.assertEqual(response.status_code, 200)
                data = response.data
                self.assertTrue(data["correct"])
                self.assertEqual((data["algorithm"], data["size"], data["seed"], data["runs"]),
                                 ("bubble-sort", 100, 42, 10))
                self.assertEqual(len(data["timings_ns"]), 10)
                self.assertTrue(all(t >= 0 for t in data["timings_ns"]))
                self.assertEqual(data["median_ns"], median(data["timings_ns"]))
                self.assertEqual(data["min_ns"], min(data["timings_ns"]))
                self.assertEqual(data["max_ns"], max(data["timings_ns"]))

    def test_invalid_requests_do_not_execute_runner(self):
        payloads = [{}, {"size": 0}, {"size": 1001}, {"size": True}, {"size": 1.5},
                    {"size": "100"}, {"size": 10, "seed": None},
                    {"size": 10, "seed": 2**31}, {"size": 10, "seed": False},
                    {"size": 10, "dataset_type": "custom"},
                    {"size": 10, "algorithm": "untrusted"}, {"size": 10, "runs": 100000}, []]
        with patch("core.benchmarks.api.run_bubble_sort_benchmark") as run:
            for payload in payloads:
                with self.subTest(payload=payload):
                    response = self.client.post(reverse("bubble-sort-benchmark"), payload, format="json")
                    self.assertEqual(response.status_code, 400)
            run.assert_not_called()

    def test_size_boundaries_and_explicit_seed(self):
        with patch("core.benchmarks.api.run_bubble_sort_benchmark", return_value={}) as run:
            for size in (1, 1000):
                response = self.client.post(reverse("bubble-sort-benchmark"),
                                            {"size": size, "seed": -7}, format="json")
                self.assertEqual(response.status_code, 200)
                run.assert_called_with(size=size, seed=-7, dataset_type="random")

    def test_get_is_not_allowed(self):
        self.assertEqual(self.client.get(reverse("bubble-sort-benchmark")).status_code, 405)


class SortingSelectionTests(APISimpleTestCase):
    def test_insertion_sort_edge_cases_and_generators(self):
        inputs = [[], [1], [3, -1, 3, 0], [2, 2, 2]]
        inputs += [generate_dataset(kind, 100, -7).copy_for_run()
                   for kind in ("random", "sorted", "reversed", "nearly_sorted")]
        for original in inputs:
            values = original.copy()
            self.assertIsNone(insertion_sort(values))
            self.assertEqual(values, sorted(original))

    def test_dispatch_and_fresh_inputs_for_supported_algorithms(self):
        for algorithm, symbol in (("bubble-sort", "bubble_sort"), ("insertion-sort", "insertion_sort"), ("selection-sort", "selection_sort"), ("merge-sort", "merge_sort"), ("quick-sort", "quick_sort")):
            inputs, events = [], []
            def sorter(values):
                events.append("sort")
                inputs.append(values)
                self.assertEqual(values, generate_dataset("reversed", 10, 42).copy_for_run())
                values.sort()
            ticks = iter(range(20))
            def clock():
                events.append("clock")
                return next(ticks)
            with patch(f"core.benchmarks.runner.{symbol}", side_effect=sorter), \
                 patch("core.benchmarks.runner.perf_counter_ns", side_effect=clock):
                result = run_sorting_benchmark(algorithm, 10, dataset_type="reversed")
            self.assertEqual(result["algorithm"], algorithm)
            self.assertEqual(len({id(values) for values in inputs}), 10)
            self.assertEqual(events, ["clock", "sort", "clock"] * 10)
            self.assertEqual(result["timings_ns"], [1] * 10)
            self.assertTrue(result["correct"])

    def test_real_api_for_supported_algorithms_and_all_datasets_without_database(self):
        for algorithm in ("bubble-sort", "insertion-sort", "selection-sort", "merge-sort", "quick-sort"):
            for kind in ("random", "sorted", "reversed", "nearly_sorted"):
                response = self.client.post(reverse("sorting-benchmark"),
                    {"algorithm": algorithm, "size": 100, "dataset_type": kind}, format="json")
                self.assertEqual(response.status_code, 200)
                self.assertEqual(response.data["algorithm"], algorithm)
                self.assertTrue(response.data["correct"])
                self.assertEqual(len(response.data["timings_ns"]), 10)

    def test_invalid_algorithm_and_payload_do_not_execute(self):
        payloads = [{"size": 10}, *({"size": 10, "algorithm": value}
                    for value in (None, "unknown-sort", "__proto__", [], {}, True))]
        payloads += [{"algorithm": "insertion-sort", "size": size} for size in (0, 1001, True, "10")]
        payloads += [{"algorithm": "insertion-sort", "size": 10, "source": "code"}]
        with patch("core.benchmarks.api.run_sorting_benchmark") as run:
            for payload in payloads:
                self.assertEqual(self.client.post(reverse("sorting-benchmark"), payload, format="json").status_code, 400)
            run.assert_not_called()
        self.assertEqual(self.client.get(reverse("sorting-benchmark")).status_code, 405)
        with patch("core.benchmarks.runner.generate_dataset") as generate:
            for algorithm in ("unknown", [], None):
                with self.assertRaises(ValueError):
                    run_sorting_benchmark(algorithm, 10)
            generate.assert_not_called()

    def test_insertion_correctness_failure_is_retained(self):
        with patch("core.benchmarks.runner.insertion_sort", side_effect=lambda values: values.clear()):
            self.assertFalse(run_sorting_benchmark("insertion-sort", 10)["correct"])


class SelectionSortTests(SimpleTestCase):
    def test_edge_cases_and_all_dataset_types(self):
        inputs = [[], [1], [3, -1, 3, 0], [2] * 1000]
        inputs += [generate_dataset(kind, 1000, -7).copy_for_run()
                   for kind in ("random", "sorted", "reversed", "nearly_sorted")]
        for original in inputs:
            with self.subTest(size=len(original)):
                values = original.copy()
                self.assertIsNone(selection_sort(values))
                self.assertEqual(values, sorted(original))

    def test_incorrect_result_is_reported(self):
        with patch("core.benchmarks.runner.selection_sort", side_effect=lambda values: values.clear()):
            self.assertFalse(run_sorting_benchmark("selection-sort", 10)["correct"])


class MergeSortTests(SimpleTestCase):
    def test_edge_cases_and_all_dataset_types(self):
        inputs = [[], [1], [3, -1, 3, 0], [2] * 1000]
        inputs += [generate_dataset(kind, 1000, -7).copy_for_run()
                   for kind in ("random", "sorted", "reversed", "nearly_sorted")]
        for original in inputs:
            with self.subTest(size=len(original)):
                values = original.copy()
                self.assertIsNone(merge_sort(values))
                self.assertEqual(values, sorted(original))

    def test_incorrect_result_is_reported(self):
        with patch("core.benchmarks.runner.merge_sort", side_effect=lambda values: values.clear()):
            self.assertFalse(run_sorting_benchmark("merge-sort", 10)["correct"])


class QuickSortTests(SimpleTestCase):
    def test_edge_cases_and_all_dataset_types(self):
        inputs = [[], [1], [3, -1, 3, 0], [2] * 1000]
        inputs += [generate_dataset(kind, 1000, -7).copy_for_run()
                   for kind in ("random", "sorted", "reversed", "nearly_sorted")]
        for original in inputs:
            with self.subTest(size=len(original)):
                values = original.copy()
                self.assertIsNone(quick_sort(values))
                self.assertEqual(values, sorted(original))

    def test_incorrect_result_is_reported(self):
        with patch("core.benchmarks.runner.quick_sort", side_effect=lambda values: values.clear()):
            self.assertFalse(run_sorting_benchmark("quick-sort", 10)["correct"])


    def test_duplicate_heavy_and_varied_lengths(self):
        from random import Random
        random = Random(42)
        for size in [2, 3, 7, 31, 65, 999, 1000, 3000]:
            for original in ([random.randrange(-5, 6) for _ in range(size)],
                             list(range(size)), list(range(size, 0, -1))):
                values = original.copy()
                quick_sort(values)
                self.assertEqual(values, sorted(original))
