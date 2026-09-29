def bubble_sort(values: list[int]) -> None:
    """Sort in place, stopping early when a pass makes no swaps."""
    for end in range(len(values) - 1, 0, -1):
        swapped = False
        for index in range(end):
            if values[index] > values[index + 1]:
                values[index], values[index + 1] = values[index + 1], values[index]
                swapped = True
        if not swapped:
            break


def insertion_sort(values: list[int]) -> None:
    """Insert each value into the sorted prefix, shifting larger values right."""
    for index in range(1, len(values)):
        value = values[index]
        previous = index - 1
        while previous >= 0 and values[previous] > value:
            values[previous + 1] = values[previous]
            previous -= 1
        values[previous + 1] = value
