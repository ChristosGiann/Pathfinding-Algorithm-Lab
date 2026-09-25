# First built-in benchmark — Issue #18

Merged into dev through PR #29 and promoted to main through PR #33.

## API

`POST /api/benchmarks/bubble-sort/` with JSON:

```json
{"size": 100, "seed": 42, "dataset_type": "random"}
```

`size` is required, integer 1–1000. `seed` defaults to 42 and is a signed 32-bit
integer. `dataset_type` defaults to random; sorted, reversed and nearly_sorted
are also accepted. Unknown fields (including arbitrary algorithm/code or run
count), booleans, fractional numbers, numeric strings and null integer fields
are rejected with HTTP 400. GET returns 405.

Successful response fields:

| Field | Meaning |
| --- | --- |
| algorithm | Always bubble-sort |
| size, seed, dataset_type | Effective input configuration |
| runs | Always 10 |
| correct | Every run matched the sorted reference, including values and length |
| timings_ns | Ten integer elapsed times in nanoseconds |
| median_ns | Median of all ten timings; may contain half a nanosecond |
| min_ns, max_ns | Minimum and maximum elapsed time |

If a sorter produces an incorrect result the response still contains measurements
but `correct` is false. It must not be presented as a successful sorting result.

## Measurement boundary

Generate the dataset and sorted reference once. For each of ten runs:

1. Copy the original dataset with `copy_for_run()`.
2. Read `perf_counter_ns()`.
3. Execute the trusted in-place Bubble Sort.
4. Read `perf_counter_ns()` and subtract the starting value.
5. Compare the output against the reference, outside timing.

Generation, copying, correctness checks, summary statistics, network, rendering,
visualization and database writes are outside the timed region. No database
reads or writes are needed by this endpoint. It directly imports trusted code;
database registry resolution and execution of other algorithms remain future work.
Bubble Sort exits early when a pass makes no swaps, matching its O(n) best case.

## UI and scope

The form fixes the algorithm to Bubble Sort and accepts dataset type, size and
seed. Inputs and submission are disabled while the request is pending. Errors
allow another attempt. The result card retains the submitted configuration and
shows times in milliseconds, converting from API nanoseconds. Greek and English
texts are provided; the application currently defaults to Greek.

Results are ephemeral: no persisted timing results or benchmark history.
Issue #19 stores experiment definitions only; execution/results persistence is future work.
Ten runs are synchronous and size is capped at 1000 because Bubble Sort is
quadratic. This is a local MVP, not an unrestricted public benchmarking service.
There is no warm-up exclusion or guaranteed reproducible timing: machine load
and runtime affect measurements even when the input is identical. Browser request
abort on unmount does not cancel sorting already executing on the server.

## Verification

25 backend tests pass, including eight new algorithm/runner/API tests. Coverage
includes duplicates/negative inputs, fresh input per run, clock boundaries and
statistics with a controlled clock, correctness failures, API validation and
POST-only behavior. API tests prohibit database access.

Lint, build and migration dry-run passed. Browser checks verified random size 100,
result-card metrics, rejection of 1001, connection failure and retry recovery.
