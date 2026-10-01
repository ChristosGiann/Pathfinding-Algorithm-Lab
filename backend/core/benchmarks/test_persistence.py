from io import StringIO
from unittest.mock import patch
from django.core.management import call_command
from django.core import signing
from django.urls import reverse
from rest_framework.test import APITestCase
from core.models import Experiment, AlgorithmImplementation


class ComparisonPersistenceTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        call_command("seed_sorting_algorithms", stdout=StringIO())

    def comparison(self):
        return self.client.post(reverse("sorting-comparison"),
            {"algorithms": ["bubble-sort", "quick-sort"], "size": 10}, format="json").data

    def test_save_retrieve_history_without_rerun_and_immutable_snapshots(self):
        original = self.comparison()
        with patch("core.benchmarks.api.compare_sorting") as run:
            saved = self.client.post(reverse("save-comparison"), {"name":"Saved comparison", "token":original["save_token"]}, format="json")
            self.assertEqual(saved.status_code, 201)
            pk = saved.data["id"]
            self.assertEqual(saved.data["status"], "completed")
            self.assertEqual([r["measurement"] for r in saved.data["results"]], [r["measurement"] for r in original["results"]])
            AlgorithmImplementation.objects.all().delete()
            fetched = self.client.get(reverse("experiment-detail", args=[pk]))
            self.assertEqual(fetched.data["results"], saved.data["results"])
            self.assertEqual(self.client.get(reverse("experiment-create")).data["results"][0]["id"], pk)
            run.assert_not_called()

    def test_tampered_expired_and_client_metrics_rejected(self):
        token = self.comparison()["save_token"]
        for payload in ({"name":"x","token":token+"x"}, {"name":"x","token":token,"results":[]}):
            self.assertEqual(self.client.post(reverse("save-comparison"),payload,format="json").status_code,400)
        with patch("core.benchmarks.persistence.signing.loads", side_effect=signing.SignatureExpired()):
            self.assertEqual(self.client.post(reverse("save-comparison"),{"name":"x","token":token},format="json").status_code,400)
        self.assertFalse(Experiment.objects.exists())

    def test_all_five_saved_without_changing_draft_execution_limit(self):
        result = self.client.post(reverse("sorting-comparison"), {"algorithms":["bubble-sort","insertion-sort","selection-sort","merge-sort","quick-sort"],"size":10},format="json").data
        response = self.client.post(reverse("save-comparison"),{"name":"Five","token":result["save_token"]},format="json")
        self.assertEqual(response.status_code,201)
        self.assertEqual(len(response.data["results"]),5)
        self.assertEqual(self.client.post(reverse("experiment-run",args=[response.data["id"]]),{},format="json").status_code,409)
