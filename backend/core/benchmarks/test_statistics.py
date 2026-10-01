from unittest.mock import patch
from statistics import pstdev
from django.test import TestCase
from django.core.management import call_command
from rest_framework.test import APIClient
from .runner import run_sorting_benchmark, add_relative_statistics


class StatisticsTests(TestCase):
    def test_same_ten_samples(self):
        clock = [v for n in range(1, 11) for v in (0, n)]
        with patch("core.benchmarks.runner.perf_counter_ns", side_effect=clock):
            result = run_sorting_benchmark("quick-sort", 5)
        self.assertEqual(result["mean_ns"], 5.5)
        self.assertEqual(result["stddev_ns"], pstdev(range(1, 11)))
        self.assertEqual(result["median_ns"], 5.5)

    def test_ratios_and_edge_cases_keep_reference(self):
        def row(name, duration, correct=True):
            return {"algorithm": name, "status": "completed", "measurement": {"median_ns": duration, "correct": correct}}
        rows = [row("base", 10), row("fast", 5), row("zero", 0), row("wrong", 2, False), row("tiny", 1e-320), {"algorithm": "failed", "status": "error"}]
        add_relative_statistics(rows, "base")
        self.assertEqual([r["measurement"]["relative_speed"] for r in rows[:5]], [1, 2, None, None, None])
        add_relative_statistics(rows, "failed")
        self.assertTrue(all(r["measurement"]["relative_speed"] is None for r in rows[:5]))
        self.assertEqual(rows[0]["measurement"]["baseline_algorithm"], "failed")

    def test_saved_statistics_and_baseline_unchanged(self):
        call_command("seed_sorting_algorithms", verbosity=0)
        client = APIClient()
        result = client.post("/api/benchmarks/sorting/compare/", {"algorithms": ["quick-sort", "bubble-sort"], "size": 5}, format="json").data
        self.assertEqual(result["baseline_algorithm"], "quick-sort")
        saved = client.post("/api/benchmarks/sorting/compare/save/", {"name": "Statistics", "token": result["save_token"]}, format="json")
        self.assertEqual(saved.status_code, 201)
        for snapshot, original in zip(saved.data["results"], result["results"]):
            self.assertEqual(snapshot["measurement"], original["measurement"])
