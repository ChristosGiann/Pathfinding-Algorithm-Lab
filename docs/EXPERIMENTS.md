# Experiment definitions — Issue #19

The API creates and retrieves saved experiment definitions. It does not schedule
or run benchmarks, generate arrays, persist timings, or change the existing
Bubble Sort benchmark endpoint. No experiment UI is introduced in this issue.

## Models

- `Experiment`: name, selected implementations (many-to-many), status, timestamps.
- `DatasetDefinition`: an experiment-owned configuration (type, size, seed).
  It references one experiment via a foreign key; deleting the experiment also
  deletes its definitions. Arrays are generated later, not stored here.

Definitions are owned by each experiment so another experiment cannot edit its
dataset configuration. Implementation references are live catalogue records,
not versioned code snapshots. Deleting catalogue implementations through ORM/admin
removes their many-to-many selections. Historical snapshots/deletion protection
should be designed with execution results; they are not provided in this step.

## Create

`POST /api/experiments/` accepts JSON:

```json
{
  "name": "Random and reversed inputs",
  "implementation_ids": [1, 2],
  "datasets": [
    {"dataset_type": "random", "size": 100, "seed": 42},
    {"dataset_type": "reversed", "size": 1000, "seed": 7}
  ]
}
```

Obtain actual implementation IDs from `GET /api/algorithms/`, where each nested
implementation now includes `id`. The numbers above are illustrative.

- Name: nonblank, up to 200 characters.
- 1–20 distinct implementation IDs: existing, active, built-in and sorting only.
- 1–20 distinct dataset configurations: random/sorted/reversed/nearly_sorted.
- Size: JSON integer 1–100,000. Seed: signed 32-bit JSON integer, default 42.
- Boolean/fractional/string integers, unknown fields and supplied read-only fields
  (including status or IDs for nested definitions) return HTTP 400.
- Status is always `draft` on creation; clients cannot submit status transitions.
- Invalid input creates no records. Experiment, selections and definitions are
  saved in one database transaction; storage failure rolls them all back.

HTTP 201 returns `id`, `name`, `status`, `created_at`, `updated_at`,
`implementations` and `datasets`. Implementation summaries contain id, name,
slug, algorithm slug, language, is_active and source_type, but not registry_key.
Datasets contain their stored id, type, size and effective seed. The input-only
`implementation_ids` field is not returned.

## Read

`GET /api/experiments/<id>/` returns the same representation (HTTP 200).
An unknown ID returns 404. Update, delete, listing and execution endpoints are
not part of this issue; unsupported methods return 405.

## Status and execution boundary

The model supports draft, pending, running, completed and failed. Only draft
creation and reading are exposed. A future orchestration service must own legal
transitions, resolve trusted executable implementations and validate execution
limits at run time. An active catalogue entry alone is not proof of executable
code; currently only Bubble Sort is implemented.

The generator definition limit is 100,000, while the existing synchronous Bubble
Sort endpoint remains capped at 1,000. Saving a larger draft does not authorize
or start a larger benchmark. Authentication/ownership are still outside the local
MVP: these APIs do not provide per-user isolation.

## Verification

Migration: `0003_experiment_definitions`. Run:

```powershell
.\backend\.venv\Scripts\python.exe backend\manage.py migrate
.\backend\.venv\Scripts\python.exe backend\manage.py test core
```

Eleven new tests cover create/read persistence and relationships, catalogue IDs,
defaults/bounds, invalid selections/configurations, duplicates, rollback,
no benchmark execution, status constraint and unsupported mutations. The full
suite contains 36 tests. Migration application, checks and dry-run are verified
locally. No frontend behavior changes beyond adding the implementation ID type.
