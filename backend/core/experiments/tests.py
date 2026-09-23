from io import StringIO
from unittest.mock import patch

from django.core.management import call_command
from django.db import IntegrityError, transaction
from django.urls import reverse
from rest_framework.test import APITestCase

from core.models import AlgorithmImplementation, DatasetDefinition, Experiment


class ExperimentAPITests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        call_command("seed_sorting_algorithms", stdout=StringIO())

    def payload(self):
        return {
            "name": "Sorting comparison",
            "implementation_ids": list(AlgorithmImplementation.objects.values_list("pk", flat=True)[:2]),
            "datasets": [
                {"dataset_type": "random", "size": 100, "seed": 42},
                {"dataset_type": "reversed", "size": 1000, "seed": 7},
            ],
        }

    def create(self, payload=None):
        return self.client.post(reverse("experiment-create"),
                                self.payload() if payload is None else payload, format="json")

    def test_creation_and_retrieval_persist_relationships(self):
        payload = self.payload()
        response = self.create(payload)
        self.assertEqual(response.status_code, 201)
        experiment = Experiment.objects.get(pk=response.data["id"])
        self.assertEqual(experiment.status, "draft")
        self.assertCountEqual(experiment.implementations.values_list("pk", flat=True), payload["implementation_ids"])
        self.assertEqual(list(experiment.datasets.values("dataset_type", "size", "seed")), payload["datasets"])
        retrieved = self.client.get(reverse("experiment-detail", args=[experiment.pk]))
        self.assertEqual(retrieved.status_code, 200)
        self.assertEqual(retrieved.data, response.data)
        self.assertNotIn("implementation_ids", retrieved.data)
        self.assertNotIn("registry_key", retrieved.data["implementations"][0])
        self.assertIsNotNone(retrieved.data["created_at"])

    def test_library_exposes_ids_for_selection(self):
        response = self.client.get(reverse("algorithm-list"))
        ids = [item["id"] for algorithm in response.data for item in algorithm["implementations"]]
        self.assertCountEqual(ids, AlgorithmImplementation.objects.values_list("pk", flat=True))

    def test_defaults_and_boundaries(self):
        payload = self.payload()
        payload["datasets"] = [{"dataset_type": "sorted", "size": 1},
                               {"dataset_type": "nearly_sorted", "size": 100000, "seed": -(2**31)}]
        response = self.create(payload)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["datasets"][0]["seed"], 42)

    def test_invalid_top_level_inputs_create_no_records(self):
        for changes in ({"name": " "}, {"name": "x" * 201}, {"implementation_ids": []},
                        {"implementation_ids": [999999]}, {"implementation_ids": [True]},
                        {"implementation_ids": ["1"]}, {"datasets": []}, {"status": "completed"},
                        {"id": 5}, {"unexpected": "x"}):
            with self.subTest(changes=changes):
                self.assertEqual(self.create(self.payload() | changes).status_code, 400)
        self.assertEqual(self.create({}).status_code, 400)
        self.assertEqual(self.create([]).status_code, 400)
        self.assertFalse(Experiment.objects.exists())
        self.assertFalse(DatasetDefinition.objects.exists())

    def test_invalid_dataset_inputs_create_no_records(self):
        for changes in ({"size": 0}, {"size": 100001}, {"size": True}, {"size": 1.5},
                        {"seed": None}, {"seed": 2**31}, {"seed": "42"},
                        {"dataset_type": "unknown"}, {"id": 3}, {"extra": 1}):
            with self.subTest(changes=changes):
                payload = self.payload()
                payload["datasets"][1].update(changes)
                self.assertEqual(self.create(payload).status_code, 400)
        self.assertFalse(Experiment.objects.exists())
        self.assertFalse(DatasetDefinition.objects.exists())

    def test_duplicates_and_large_collections_rejected(self):
        payload = self.payload()
        payload["implementation_ids"] *= 2
        self.assertEqual(self.create(payload).status_code, 400)
        payload = self.payload()
        payload["datasets"] *= 2
        self.assertEqual(self.create(payload).status_code, 400)
        payload["datasets"] = [{"dataset_type": "random", "size": 10, "seed": n} for n in range(21)]
        self.assertEqual(self.create(payload).status_code, 400)

    def test_inactive_and_custom_implementations_rejected(self):
        implementation = AlgorithmImplementation.objects.get(pk=self.payload()["implementation_ids"][0])
        implementation.is_active = False
        implementation.save()
        self.assertEqual(self.create().status_code, 400)
        implementation.is_active = True
        implementation.source_type = "custom"
        implementation.save()
        self.assertEqual(self.create().status_code, 400)

    def test_creation_rolls_back_all_relations_on_storage_failure(self):
        with patch("core.experiments.api.DatasetDefinition.objects.bulk_create", side_effect=IntegrityError):
            with self.assertRaises(IntegrityError):
                self.create()
        self.assertFalse(Experiment.objects.exists())
        self.assertFalse(Experiment.implementations.through.objects.exists())

    def test_creation_does_not_run_benchmark(self):
        with patch("core.benchmarks.runner.run_bubble_sort_benchmark") as run:
            self.assertEqual(self.create().status_code, 201)
            run.assert_not_called()

    def test_missing_experiment_and_disallowed_mutations(self):
        self.assertEqual(self.client.get(reverse("experiment-detail", args=[999999])).status_code, 404)
        response = self.create()
        url = reverse("experiment-detail", args=[response.data["id"]])
        self.assertEqual(self.client.patch(url, {"status": "completed"}, format="json").status_code, 405)
        self.assertEqual(self.client.delete(url).status_code, 405)

    def test_status_choices_and_database_constraint(self):
        self.assertEqual(set(Experiment.Status.values), {"draft", "pending", "running", "completed", "failed"})
        with self.assertRaises(IntegrityError), transaction.atomic():
            Experiment.objects.create(name="Invalid", status="unknown")
