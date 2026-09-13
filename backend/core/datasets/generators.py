"""Reproducible integer permutations, independent of Django and the database."""

from dataclasses import dataclass
from random import Random
from typing import Literal

DatasetType = Literal["random", "sorted", "reversed", "nearly_sorted"]
DATASET_TYPES = ("random", "sorted", "reversed", "nearly_sorted")
MAX_DATASET_SIZE = 100_000


@dataclass(frozen=True)
class Dataset:
    dataset_type: DatasetType
    size: int
    seed: int
    values: tuple[int, ...]

    def copy_for_run(self) -> list[int]:
        """Give a sorting implementation its own mutable input."""
        return list(self.values)


def generate_dataset(dataset_type: DatasetType, size: int, seed: int) -> Dataset:
    """Generate a permutation of range(size) with the requested ordering.

    Nearly sorted inputs swap roughly 1% of adjacent pairs, at least one for
    size >= 2. Pairs do not overlap, bounding the disturbance to sorted order.
    Sorted/reversed inputs accept and record seed but have no random choices.
    """
    if dataset_type not in DATASET_TYPES:
        raise ValueError(f"dataset_type must be one of {DATASET_TYPES}")
    # bool is an int subclass, but is not a meaningful size or seed here.
    if type(size) is not int:
        raise TypeError("size must be an integer")
    if not 1 <= size <= MAX_DATASET_SIZE:
        raise ValueError(f"size must be between 1 and {MAX_DATASET_SIZE}")
    if type(seed) is not int:
        raise TypeError("seed must be an integer")

    rng = Random(seed)
    values = list(range(size))

    if dataset_type == "random":
        rng.shuffle(values)
    elif dataset_type == "reversed":
        values.reverse()
    elif dataset_type == "nearly_sorted" and size >= 2:
        swap_count = max(1, size // 100)
        for index in rng.sample(range(0, size - 1, 2), swap_count):
            values[index], values[index + 1] = values[index + 1], values[index]

    return Dataset(dataset_type, size, seed, tuple(values))
