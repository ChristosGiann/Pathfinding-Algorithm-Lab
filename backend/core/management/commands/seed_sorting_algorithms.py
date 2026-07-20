from django.core.management.base import BaseCommand
from django.db import transaction

from core.models import Algorithm, AlgorithmImplementation, Problem


SORTING_ALGORITHMS = [
    {
        "name": "Bubble Sort",
        "slug": "bubble-sort",
        "description": (
            "A simple sorting algorithm that repeatedly compares "
            "and swaps adjacent elements."
        ),
        "best_case_complexity": "O(n)",
        "average_case_complexity": "O(n^2)",
        "worst_case_complexity": "O(n^2)",
        "space_complexity": "O(1)",
        "registry_key": "sorting.bubble_sort",
    },
    {
        "name": "Selection Sort",
        "slug": "selection-sort",
        "description": (
            "A sorting algorithm that repeatedly selects the smallest "
            "remaining element."
        ),
        "best_case_complexity": "O(n^2)",
        "average_case_complexity": "O(n^2)",
        "worst_case_complexity": "O(n^2)",
        "space_complexity": "O(1)",
        "registry_key": "sorting.selection_sort",
    },
    {
        "name": "Insertion Sort",
        "slug": "insertion-sort",
        "description": (
            "A sorting algorithm that builds the sorted result "
            "one element at a time."
        ),
        "best_case_complexity": "O(n)",
        "average_case_complexity": "O(n^2)",
        "worst_case_complexity": "O(n^2)",
        "space_complexity": "O(1)",
        "registry_key": "sorting.insertion_sort",
    },
    {
        "name": "Merge Sort",
        "slug": "merge-sort",
        "description": (
            "A divide-and-conquer sorting algorithm that splits, sorts "
            "and merges collections."
        ),
        "best_case_complexity": "O(n log n)",
        "average_case_complexity": "O(n log n)",
        "worst_case_complexity": "O(n log n)",
        "space_complexity": "O(n)",
        "registry_key": "sorting.merge_sort",
    },
    {
        "name": "Quick Sort",
        "slug": "quick-sort",
        "description": (
            "A divide-and-conquer sorting algorithm that partitions "
            "elements around a pivot."
        ),
        "best_case_complexity": "O(n log n)",
        "average_case_complexity": "O(n log n)",
        "worst_case_complexity": "O(n^2)",
        "space_complexity": "O(log n) avg / O(n) worst",
        "registry_key": "sorting.quick_sort",
    },
]


class Command(BaseCommand):
    help = "Creates or updates the built-in sorting algorithms."

    @transaction.atomic
    def handle(self, *args, **options):
        problem, problem_created = Problem.objects.update_or_create(
            slug="sorting",
            defaults={
                "name": "Sorting",
                "description": (
                    "Problems where a collection of values must be arranged "
                    "in a defined order."
                ),
            },
        )

        algorithms_created = 0
        implementations_created = 0

        for algorithm_data in SORTING_ALGORITHMS:
            algorithm, algorithm_created = Algorithm.objects.update_or_create(
                problem=problem,
                slug=algorithm_data["slug"],
                defaults={
                    "name": algorithm_data["name"],
                    "description": algorithm_data["description"],
                    "best_case_complexity": (
                        algorithm_data["best_case_complexity"]
                    ),
                    "average_case_complexity": (
                        algorithm_data["average_case_complexity"]
                    ),
                    "worst_case_complexity": (
                        algorithm_data["worst_case_complexity"]
                    ),
                    "space_complexity": (
                        algorithm_data["space_complexity"]
                    ),
                },
            )

            if algorithm_created:
                algorithms_created += 1

            implementation, implementation_created = (
                AlgorithmImplementation.objects.update_or_create(
                    algorithm=algorithm,
                    slug="built-in-python",
                    defaults={
                        "name": "Built-in Python",
                        "language": AlgorithmImplementation.Language.PYTHON,
                        "source_type": (
                            AlgorithmImplementation.SourceType.BUILT_IN
                        ),
                        "registry_key": algorithm_data["registry_key"],
                        "description": (
                            f"Reference Python implementation of "
                            f"{algorithm_data['name']}."
                        ),
                        "is_reference": True,
                        "is_active": True,
                    },
                )
            )

            if implementation_created:
                implementations_created += 1

        problem_status = "created" if problem_created else "already existed"

        self.stdout.write(
            self.style.SUCCESS(
                "Sorting seed completed successfully.\n"
                f"Problem: {problem_status}\n"
                f"Algorithms created: {algorithms_created}\n"
                f"Implementations created: {implementations_created}"
            )
        )