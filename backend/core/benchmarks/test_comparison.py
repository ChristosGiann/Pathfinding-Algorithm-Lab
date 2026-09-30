from unittest.mock import patch
from django.urls import reverse
from rest_framework.test import APISimpleTestCase
from core.datasets import generate_dataset
from .runner import compare_sorting, SORTING_ALGORITHMS


class ComparisonTests(APISimpleTestCase):
    def test_shared_generation_fresh_copies_and_dispatch(self):
        original = generate_dataset("reversed", 8, 42)
        copies = []
        def sort(values):
            self.assertEqual(values, list(original.values))
            copies.append(values)
            values.sort()
        with patch("core.benchmarks.runner.generate_dataset", return_value=original) as generate, \
             patch("core.benchmarks.runner.bubble_sort", side_effect=sort), \
             patch("core.benchmarks.runner.quick_sort", side_effect=sort):
            response = compare_sorting(["bubble-sort", "quick-sort"], 8, dataset_type="reversed")
        generate.assert_called_once_with("reversed", 8, 42)
        self.assertEqual(len({id(item) for item in copies}), 20)
        self.assertEqual([r["algorithm"] for r in response["results"]], ["bubble-sort", "quick-sort"])
        self.assertTrue(all(r["measurement"]["correct"] for r in response["results"]))

    def test_real_api_all_algorithms(self):
        response = self.client.post(reverse("sorting-comparison"),
            {"algorithms": list(SORTING_ALGORITHMS), "size": 25}, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["results"]), 5)
        for item in response.data["results"]:
            self.assertTrue(item["measurement"]["correct"])
            self.assertEqual(item["measurement"]["runs"], 10)

    def test_invalid_selection_does_not_run(self):
        with patch("core.benchmarks.api.compare_sorting") as run:
            for values in ([], ["bubble-sort"], ["bubble-sort"] * 2,
                           ["bubble-sort", "unknown"], [None, "quick-sort"], "quick-sort", [[], {}]):
                response = self.client.post(reverse("sorting-comparison"),
                    {"algorithms": values, "size": 10}, format="json")
                self.assertEqual(response.status_code, 400)
            for extra in ({"size": 1001}, {"size": True}, {"source": "code"}):
                response = self.client.post(reverse("sorting-comparison"),
                    {"algorithms": ["bubble-sort", "quick-sort"], "size": 10, **extra}, format="json")
                self.assertEqual(response.status_code, 400)
            run.assert_not_called()

    def test_failed_and_incorrect_rows_do_not_invent_metrics(self):
        with patch("core.benchmarks.runner.bubble_sort", side_effect=RuntimeError("secret")), \
             patch("core.benchmarks.runner.quick_sort", side_effect=lambda values: values.clear()):
            results = compare_sorting(["bubble-sort", "quick-sort", "merge-sort"], 8)["results"]
        self.assertEqual(results[0], {"algorithm": "bubble-sort", "status": "error", "error": "runner_error"})
        self.assertFalse(results[1]["measurement"]["correct"])
        self.assertTrue(results[2]["measurement"]["correct"])
