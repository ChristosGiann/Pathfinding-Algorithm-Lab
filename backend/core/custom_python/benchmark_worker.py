"""Child-process entry point for trusted sorting snippets; never import user modules."""
import builtins
import json
import os
from pathlib import Path
import sys
from time import perf_counter_ns

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from core.benchmarks.runner import RUN_COUNT, timing_statistics
from core.custom_python.benchmark import BUILTINS, error_result


def main():
    if os.name != "nt":
        import resource
        resource.setrlimit(resource.RLIMIT_CPU, (2, 2))
        resource.setrlimit(resource.RLIMIT_AS, (256 * 1024 * 1024, 256 * 1024 * 1024))
        resource.setrlimit(resource.RLIMIT_FSIZE, (16384, 16384))
    data = json.loads(sys.stdin.buffer.read(200000))
    namespace = {"__builtins__": {key: getattr(builtins, key) for key in BUILTINS}}
    try:
        exec(compile(data["source"], "<trusted-custom-sorter>", "exec"), namespace)
        solve = namespace["solve"]
        expected = sorted(data["values"])
        timings, correct = [], True
        for _ in range(RUN_COUNT):
            values = list(data["values"])
            start = perf_counter_ns()
            returned = solve(values)
            timings.append(perf_counter_ns() - start)
            output = values if returned is None else returned
            correct = (type(output) is list and output == expected) and correct
        measurement = {key: data[key] for key in ("dataset_type", "size", "seed")}
        measurement.update(algorithm="custom-python", runs=RUN_COUNT, correct=correct,
                           timings_ns=timings, **timing_statistics(timings))
        result = {"algorithm": "custom-python", "source_type": "custom", "status": "completed", "measurement": measurement}
    except BaseException:
        result = error_result("runtime_error")
    Path(sys.argv[1]).write_text(json.dumps(result, allow_nan=False), encoding="utf-8")


if __name__ == "__main__":
    main()
