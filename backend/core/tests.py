from io import StringIO

from django.core.management import call_command
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Algorithm, AlgorithmImplementation, Problem


class AlgorithmListAPITests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        call_command(
            "seed_sorting_algorithms",
            stdout=StringIO(),
        )

    def test_returns_five_seeded_sorting_algorithms(self):
        response = self.client.get(
            reverse("algorithm-list"),
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            len(response.data),
            5,
        )

        returned_names = [
            algorithm["name"]
            for algorithm in response.data
        ]

        self.assertEqual(
            returned_names,
            [
                "Bubble Sort",
                "Insertion Sort",
                "Merge Sort",
                "Quick Sort",
                "Selection Sort",
            ],
        )

    def test_returns_algorithm_complexity_metadata(self):
        response = self.client.get(
            reverse("algorithm-list"),
        )

        bubble_sort = next(
            algorithm
            for algorithm in response.data
            if algorithm["slug"] == "bubble-sort"
        )

        self.assertEqual(
            bubble_sort["problem"],
            "Sorting",
        )
        self.assertEqual(
            bubble_sort["best_case_complexity"],
            "O(n)",
        )
        self.assertEqual(
            bubble_sort["average_case_complexity"],
            "O(n^2)",
        )
        self.assertEqual(
            bubble_sort["worst_case_complexity"],
            "O(n^2)",
        )
        self.assertEqual(
            bubble_sort["space_complexity"],
            "O(1)",
        )

    def test_returns_only_active_built_in_implementations(self):
        bubble_sort = Algorithm.objects.get(
            slug="bubble-sort",
        )

        AlgorithmImplementation.objects.create(
            algorithm=bubble_sort,
            name="Inactive Python",
            slug="inactive-python",
            language=AlgorithmImplementation.Language.PYTHON,
            source_type=AlgorithmImplementation.SourceType.BUILT_IN,
            registry_key="sorting.bubble_sort.inactive",
            is_reference=False,
            is_active=False,
        )

        AlgorithmImplementation.objects.create(
            algorithm=bubble_sort,
            name="Custom Python",
            slug="custom-python",
            language=AlgorithmImplementation.Language.PYTHON,
            source_type=AlgorithmImplementation.SourceType.CUSTOM,
            registry_key=None,
            is_reference=False,
            is_active=True,
        )

        response = self.client.get(
            reverse("algorithm-list"),
        )

        bubble_sort_data = next(
            algorithm
            for algorithm in response.data
            if algorithm["slug"] == "bubble-sort"
        )

        self.assertEqual(
            len(bubble_sort_data["implementations"]),
            1,
        )

        implementation = bubble_sort_data["implementations"][0]

        self.assertEqual(
            implementation["source_type"],
            "built_in",
        )
        self.assertTrue(
            implementation["is_active"],
        )

    def test_excludes_algorithm_without_active_built_in_implementation(self):
        sorting_problem = Problem.objects.get(
            slug="sorting",
        )

        algorithm = Algorithm.objects.create(
            problem=sorting_problem,
            name="Custom Only Sort",
            slug="custom-only-sort",
            description="Algorithm with only a custom implementation.",
        )

        AlgorithmImplementation.objects.create(
            algorithm=algorithm,
            name="Custom Python",
            slug="custom-python",
            language=AlgorithmImplementation.Language.PYTHON,
            source_type=AlgorithmImplementation.SourceType.CUSTOM,
            registry_key=None,
            is_active=True,
        )

        response = self.client.get(
            reverse("algorithm-list"),
        )

        returned_slugs = [
            item["slug"]
            for item in response.data
        ]

        self.assertNotIn(
            "custom-only-sort",
            returned_slugs,
        )

    def test_does_not_expose_registry_key(self):
        response = self.client.get(
            reverse("algorithm-list"),
        )

        implementation = response.data[0]["implementations"][0]

        self.assertNotIn(
            "registry_key",
            implementation,
        )


class SeedSortingAlgorithmsCommandTests(TestCase):
    def test_seed_command_is_idempotent(self):
        call_command(
            "seed_sorting_algorithms",
            stdout=StringIO(),
        )
        call_command(
            "seed_sorting_algorithms",
            stdout=StringIO(),
        )

        self.assertEqual(
            Problem.objects.filter(slug="sorting").count(),
            1,
        )
        self.assertEqual(
            Algorithm.objects.count(),
            5,
        )
        self.assertEqual(
            AlgorithmImplementation.objects.count(),
            5,
        )