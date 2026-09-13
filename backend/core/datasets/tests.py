from dataclasses import FrozenInstanceError
from random import getstate

from django.test import SimpleTestCase

from .generators import DATASET_TYPES, MAX_DATASET_SIZE, generate_dataset


class DatasetGeneratorTests(SimpleTestCase):
    def test_reproducible_for_every_type_and_supported_size(self):
        for kind in DATASET_TYPES:
            for size in (1, 2, 10, 37, 100, 1000, MAX_DATASET_SIZE):
                with self.subTest(kind=kind, size=size):
                    first = generate_dataset(kind, size, 42)
                    self.assertEqual(first, generate_dataset(kind, size, 42))
                    self.assertEqual(len(first.values), size)
                    self.assertEqual(sorted(first.values), list(range(size)))
                    self.assertEqual((first.dataset_type, first.size, first.seed),
                                     (kind, size, 42))

    def test_sorted_and_reversed_order(self):
        self.assertEqual(generate_dataset("sorted", 10, 42).values, tuple(range(10)))
        self.assertEqual(generate_dataset("reversed", 10, 42).values,
                         tuple(range(9, -1, -1)))

    def test_random_seed_changes_order_without_changing_contents(self):
        first = generate_dataset("random", 100, 42).values
        second = generate_dataset("random", 100, 43).values
        self.assertNotEqual(first, second)
        self.assertNotEqual(first, tuple(range(100)))
        self.assertEqual(sorted(first), sorted(second))

    def test_nearly_sorted_is_disturbed_but_stays_close_to_sorted(self):
        for size in (2, 3, 10, 100, 1000):
            with self.subTest(size=size):
                values = generate_dataset("nearly_sorted", size, 42).values
                displaced = sum(value != index for index, value in enumerate(values))
                self.assertGreater(displaced, 0)
                self.assertLessEqual(displaced, max(2, size // 50))
                self.assertTrue(all(abs(value - index) <= 1
                                    for index, value in enumerate(values)))
        self.assertNotEqual(generate_dataset("nearly_sorted", 1000, 42).values,
                            generate_dataset("nearly_sorted", 1000, 43).values)

    def test_generators_do_not_change_global_random_state(self):
        before = getstate()
        for kind in DATASET_TYPES:
            generate_dataset(kind, 100, 42)
        self.assertEqual(getstate(), before)

    def test_each_run_gets_an_independent_copy(self):
        for kind in DATASET_TYPES:
            with self.subTest(kind=kind):
                dataset = generate_dataset(kind, 100, 42)
                original = dataset.values
                first = dataset.copy_for_run()
                second = dataset.copy_for_run()
                self.assertIsNot(first, second)
                first.sort()
                first[0] = -999
                first.append(1000)
                self.assertEqual(second, list(original))
                self.assertEqual(dataset.values, original)
                self.assertEqual(dataset.copy_for_run(), list(original))

    def test_dataset_is_immutable(self):
        dataset = generate_dataset("random", 10, 42)
        with self.assertRaises(FrozenInstanceError):
            dataset.seed = 7
        with self.assertRaises(TypeError):
            dataset.values[0] = 7

    def test_rejects_out_of_range_sizes(self):
        for kind in DATASET_TYPES:
            for size in (-1, 0, MAX_DATASET_SIZE + 1):
                with self.subTest(kind=kind, size=size), self.assertRaises(ValueError):
                    generate_dataset(kind, size, 42)

    def test_rejects_non_integer_sizes_and_seeds(self):
        for value in (True, False, 1.5, "10", None):
            with self.subTest(value=value):
                with self.assertRaises(TypeError):
                    generate_dataset("random", value, 42)
                with self.assertRaises(TypeError):
                    generate_dataset("random", 10, value)

    def test_rejects_unknown_dataset_type(self):
        for kind in ("unknown", "Random", "reverse", "", None):
            with self.subTest(kind=kind), self.assertRaises(ValueError):
                generate_dataset(kind, 10, 42)

    def test_zero_and_negative_seeds_are_reproducible(self):
        for seed in (0, -1):
            with self.subTest(seed=seed):
                self.assertEqual(generate_dataset("random", 10, seed),
                                 generate_dataset("random", 10, seed))
