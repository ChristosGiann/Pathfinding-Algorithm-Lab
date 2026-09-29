from io import StringIO
from unittest.mock import patch

from django.core.management import call_command
from django.db import IntegrityError
from django.urls import reverse
from rest_framework.test import APITestCase

from core.models import AlgorithmImplementation, Experiment, ExperimentResult
from core.experiments.execution import execute_experiment


class ExecutionTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        call_command("seed_sorting_algorithms", stdout=StringIO())

    def create(self, algorithms=("bubble-sort", "insertion-sort"), size=10, count=2):
        ids = list(AlgorithmImplementation.objects.filter(algorithm__slug__in=algorithms).values_list("pk", flat=True))
        response = self.client.post(reverse("experiment-create"), {
            "name": "Execution test", "implementation_ids": ids,
            "datasets": [{"dataset_type": "reversed", "size": size, "seed": seed} for seed in range(count)],
        }, format="json")
        self.assertEqual(response.status_code, 201)
        return response.data["id"]

    def run_experiment(self, pk, payload=None):
        return self.client.post(reverse("experiment-run", args=[pk]), {} if payload is None else payload, format="json")

    def assert_draft(self, pk):
        self.assertEqual(Experiment.objects.get(pk=pk).status, "draft")
        self.assertFalse(ExperimentResult.objects.filter(experiment_id=pk).exists())

    def test_real_execution_persists_four_pairs_and_read_does_not_rerun(self):
        pk = self.create()
        response = self.run_experiment(pk)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["status"], "completed")
        self.assertEqual(response.data["execution_error"], "")
        self.assertEqual(len(response.data["results"]), 4)
        for result in response.data["results"]:
            measurement = result["measurement"]
            self.assertTrue(measurement["correct"])
            self.assertEqual(measurement["runs"], 10)
            self.assertEqual(len(measurement["timings_ns"]), 10)
            self.assertEqual(result["implementation_snapshot"]["algorithm"], measurement["algorithm"])
            self.assertNotIn("registry_key", result["implementation_snapshot"])
        with patch("core.experiments.execution.run_sorting_benchmark") as run:
            retrieved = self.client.get(reverse("experiment-detail", args=[pk]))
            self.assertEqual(retrieved.data, response.data)
            self.assertEqual(self.run_experiment(pk).status_code, 409)
            run.assert_not_called()
        self.assertEqual(ExperimentResult.objects.filter(experiment_id=pk).count(), 4)

    def test_unsupported_and_oversized_definitions_stay_draft(self):
        cases = [(('quick-sort',), 10, 1), (('bubble-sort',), 1001, 1), (('bubble-sort',), 10, 5)]
        with patch("core.experiments.execution.run_sorting_benchmark") as run:
            for algorithms, size, count in cases:
                pk = self.create(algorithms, size, count)
                self.assertEqual(self.run_experiment(pk).status_code, 400)
                self.assert_draft(pk)
            run.assert_not_called()

    def test_changed_catalogue_is_revalidated(self):
        for field, value in (("is_active", False), ("source_type", "custom"),
                             ("language", "javascript"), ("registry_key", "arbitrary.module"),
                             ("registry_key", None)):
            pk = self.create(("bubble-sort",), count=1)
            implementation = Experiment.objects.get(pk=pk).implementations.get()
            original = getattr(implementation, field)
            setattr(implementation, field, value)
            implementation.save()
            with patch("core.experiments.execution.run_sorting_benchmark") as run:
                self.assertEqual(self.run_experiment(pk).status_code, 400)
                run.assert_not_called()
            self.assert_draft(pk)
            setattr(implementation, field, original)
            implementation.save()

    def test_registry_key_must_match_algorithm_identity(self):
        pk = self.create(("bubble-sort",), count=1)
        algorithm = Experiment.objects.get(pk=pk).implementations.get().algorithm
        algorithm.slug = "other"
        algorithm.save()
        self.assertEqual(self.run_experiment(pk).status_code, 400)
        self.assert_draft(pk)

    def test_missing_selections_and_datasets_stay_draft(self):
        pk = self.create()
        Experiment.objects.get(pk=pk).implementations.clear()
        self.assertEqual(self.run_experiment(pk).status_code, 400)
        self.assert_draft(pk)
        pk = self.create()
        Experiment.objects.get(pk=pk).datasets.all().delete()
        self.assertEqual(self.run_experiment(pk).status_code, 400)
        self.assert_draft(pk)

    def test_runner_failure_has_safe_error_and_no_partial_results(self):
        pk = self.create()
        with patch("core.experiments.execution.run_sorting_benchmark", side_effect=[{"correct": True}, RuntimeError("secret traceback")]):
            response = self.run_experiment(pk)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["status"], "failed")
        self.assertEqual(response.data["execution_error"], "runner_error")
        self.assertEqual(response.data["results"], [])
        self.assertNotIn("secret", str(response.data))
        self.assertEqual(self.run_experiment(pk).status_code, 409)

    def test_incorrect_sorting_saves_metrics_but_fails_experiment(self):
        pk = self.create(("bubble-sort",), count=1)
        with patch("core.benchmarks.runner.bubble_sort", side_effect=lambda values: values.clear()):
            response = self.run_experiment(pk)
        self.assertEqual(response.data["status"], "failed")
        self.assertEqual(response.data["execution_error"], "incorrect_result")
        self.assertFalse(response.data["results"][0]["measurement"]["correct"])

    def test_storage_failure_rolls_back_claim_and_partial_writes(self):
        pk = self.create()
        def fail_after_write(results):
            results[0].save()
            raise IntegrityError("simulated storage failure")
        with patch("core.experiments.execution.ExperimentResult.objects.bulk_create", side_effect=fail_after_write):
            with self.assertRaises(IntegrityError):
                execute_experiment(pk)
        self.assert_draft(pk)

    def test_snapshots_survive_catalogue_and_definition_deletion(self):
        pk = self.create()
        results = self.run_experiment(pk).data["results"]
        experiment = Experiment.objects.get(pk=pk)
        experiment.implementations.all().delete()
        experiment.datasets.all().delete()
        self.assertEqual(self.client.get(reverse("experiment-detail", args=[pk])).data["results"], results)

    def test_request_contract_and_non_draft_conflicts(self):
        pk = self.create()
        for body in ([], {"algorithm": "bubble-sort"}, {"status": "draft"}):
            self.assertEqual(self.run_experiment(pk, body).status_code, 400)
        self.assert_draft(pk)
        self.assertEqual(self.client.get(reverse("experiment-run", args=[pk])).status_code, 405)
        self.assertEqual(self.run_experiment(999999).status_code, 404)
        for state in ("pending", "running", "completed", "failed"):
            Experiment.objects.filter(pk=pk).update(status=state)
            with patch("core.experiments.execution.run_sorting_benchmark") as run:
                self.assertEqual(self.run_experiment(pk).status_code, 409)
                run.assert_not_called()

    def test_catalogue_executable_matches_runner_capability_without_exposing_key(self):
        data = self.client.get(reverse("algorithm-list")).data
        for algorithm in data:
            for item in algorithm["implementations"]:
                self.assertEqual(item["executable"], algorithm["slug"] in ("bubble-sort", "insertion-sort", "selection-sort"))
                self.assertNotIn("registry_key", item)
        implementation = AlgorithmImplementation.objects.get(registry_key="sorting.bubble_sort")
        implementation.registry_key = "unknown"
        implementation.save()
        data = self.client.get(reverse("algorithm-list")).data
        item = next(item for algorithm in data for item in algorithm["implementations"] if item["id"] == implementation.pk)
        self.assertFalse(item["executable"])


    def test_selection_sort_persisted_round_trip(self):
        pk = self.create(("selection-sort",), size=100, count=1)
        response = self.run_experiment(pk)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["status"], "completed")
        result = response.data["results"][0]
        self.assertEqual(result["implementation_snapshot"]["algorithm"], "selection-sort")
        self.assertEqual(result["measurement"]["algorithm"], "selection-sort")
        self.assertTrue(result["measurement"]["correct"])
        self.assertEqual(self.client.get(reverse("experiment-detail", args=[pk])).data, response.data)
