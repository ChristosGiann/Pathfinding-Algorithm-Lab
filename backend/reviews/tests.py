from io import StringIO

from django.core.management import call_command
from django.db import IntegrityError, transaction
from django.urls import reverse
from rest_framework.test import APITestCase

from core.models import AlgorithmImplementation
from .models import ImplementationReview, RATING_FIELDS, TEXT_FIELDS


class ImplementationReviewTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        call_command("seed_sorting_algorithms", stdout=StringIO())
        cls.implementation = AlgorithmImplementation.objects.get(algorithm__slug="bubble-sort")
        cls.other = AlgorithmImplementation.objects.get(algorithm__slug="merge-sort")

    def setUp(self):
        self.url = reverse("implementation-review", args=[self.implementation.pk])
        self.payload = {**dict.fromkeys(RATING_FIELDS, None), **dict.fromkeys(TEXT_FIELDS, "")}

    def test_initial_get_returns_blank_without_writing(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, {"implementation_id": self.implementation.pk,
                                       **self.payload, "updated_at": None})
        self.assertFalse(ImplementationReview.objects.exists())

    def test_create_update_and_retrieve_preserves_all_fields(self):
        self.payload.update(dict(zip(RATING_FIELDS, [1, 2, 3, 4, 5, 2])))
        self.payload.update({key: f"  Ελληνικά {key}\nδεύτερη γραμμή  " for key in TEXT_FIELDS})
        created = self.client.put(self.url, self.payload, format="json")
        self.assertEqual(created.status_code, 201)
        self.assertIsNotNone(created.data["updated_at"])
        self.assertEqual(self.client.get(self.url).data, created.data)
        self.payload.update(overall=5, performance=None, notes="")
        updated = self.client.put(self.url, self.payload, format="json")
        self.assertEqual(updated.status_code, 200)
        self.assertEqual(ImplementationReview.objects.count(), 1)
        for key, value in self.payload.items():
            self.assertEqual(self.client.get(self.url).data[key], value)

    def test_reviews_are_isolated_by_implementation_and_catalogue_exposes_ids(self):
        self.client.put(self.url, {**self.payload, "notes": "Bubble only"}, format="json")
        other_url = reverse("implementation-review", args=[self.other.pk])
        self.assertEqual(self.client.get(other_url).data["notes"], "")
        self.client.put(other_url, {**self.payload, "notes": "Merge only"}, format="json")
        self.assertEqual(self.client.get(self.url).data["notes"], "Bubble only")
        library = self.client.get(reverse("algorithm-list")).data
        ids = [item["id"] for algorithm in library for item in algorithm["implementations"]]
        self.assertIn(self.implementation.pk, ids)
        self.assertNotIn("registry_key", str(library))

    def test_rejects_invalid_ratings_without_changing_saved_review(self):
        self.client.put(self.url, {**self.payload, "notes": "Keep me"}, format="json")
        for field in RATING_FIELDS:
            for value in [0, 6, -1, 2.5, "3", True, [], {}]:
                with self.subTest(field=field, value=value):
                    response = self.client.put(self.url, {**self.payload, field: value}, format="json")
                    self.assertEqual(response.status_code, 400)
                    self.assertIn(field, response.data)
                    self.assertEqual(self.client.get(self.url).data["notes"], "Keep me")

    def test_text_limits_and_strict_types(self):
        for field in TEXT_FIELDS:
            for value in ["a" * 5001, None, 123, True, [], {}]:
                with self.subTest(field=field, value_type=type(value)):
                    self.assertEqual(self.client.put(self.url, {**self.payload, field: value}, format="json").status_code, 400)
        self.assertFalse(ImplementationReview.objects.exists())
        response = self.client.put(self.url, {**self.payload, "notes": "α" * 5000}, format="json")
        self.assertEqual(response.status_code, 201)

    def test_full_put_rejects_missing_unknown_and_readonly_fields(self):
        for data in [{}, [], {**self.payload, "implementation_id": self.other.pk},
                     {**self.payload, "updated_at": "2026-01-01"}, {**self.payload, "median_ns": 10}]:
            with self.subTest(data=data):
                self.assertEqual(self.client.put(self.url, data, format="json").status_code, 400)
        self.assertFalse(ImplementationReview.objects.exists())
        for method in [self.client.post, self.client.patch, self.client.delete]:
            self.assertEqual(method(self.url, self.payload, format="json").status_code, 405)

    def test_inaccessible_implementations_return_404(self):
        self.assertEqual(self.client.get(reverse("implementation-review", args=[999999])).status_code, 404)
        for changes in [{"is_active": False}, {"is_active": True, "source_type": "custom"}]:
            AlgorithmImplementation.objects.filter(pk=self.implementation.pk).update(**changes)
            self.assertEqual(self.client.get(self.url).status_code, 404)
            self.assertEqual(self.client.put(self.url, self.payload, format="json").status_code, 404)

    def test_database_enforces_rating_bounds_and_single_review(self):
        for field in RATING_FIELDS:
            for value in [0, 6]:
                with self.subTest(field=field, value=value), self.assertRaises(IntegrityError), transaction.atomic():
                    ImplementationReview.objects.create(implementation=self.implementation, **{field: value})
        ImplementationReview.objects.create(implementation=self.implementation)
        with self.assertRaises(IntegrityError), transaction.atomic():
            ImplementationReview.objects.create(implementation=self.implementation)
