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


def selection_sort(values: list[int]) -> None:
    """Select the smallest remaining value for each position."""
    for index in range(len(values) - 1):
        smallest = index
        for candidate in range(index + 1, len(values)):
            if values[candidate] < values[smallest]:
                smallest = candidate
        if smallest != index:
            values[index], values[smallest] = values[smallest], values[index]


def merge_sort(values: list[int]) -> None:
    """Stable bottom-up merges; mutate the caller's list with O(n) workspace."""
    size = len(values)
    buffer = [0] * size
    width = 1
    while width < size:
        for left in range(0, size, 2 * width):
            middle, right = min(left + width, size), min(left + 2 * width, size)
            first, second = left, middle
            for target in range(left, right):
                if first < middle and (second >= right or values[first] <= values[second]):
                    buffer[target] = values[first]
                    first += 1
                else:
                    buffer[target] = values[second]
                    second += 1
        values[:] = buffer
        width *= 2


def quick_sort(values: list[int]) -> None:
    """Three-way partition with a middle pivot; process smaller ranges first."""
    pending = [(0, len(values) - 1)]
    while pending:
        left, right = pending.pop()
        if left >= right:
            continue
        pivot = values[(left + right) // 2]
        lower, current, upper = left, left, right
        while current <= upper:
            if values[current] < pivot:
                values[lower], values[current] = values[current], values[lower]
                lower += 1
                current += 1
            elif values[current] > pivot:
                values[current], values[upper] = values[upper], values[current]
                upper -= 1
            else:
                current += 1
        first, second = (left, lower - 1), (upper + 1, right)
        # LIFO: leave the larger range pending, keeping stack space O(log n).
        if first[1] - first[0] < second[1] - second[0]:
            first, second = second, first
        for start, end in (first, second):
            if start < end:
                pending.append((start, end))
