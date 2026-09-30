# API Reference

## Purpose

This document describes the public contract between the React frontend and Django backend.

Only implemented endpoints are considered current API. Planned endpoints are marked clearly.

## Base URL

The frontend reads:

```text
VITE_API_BASE_URL
```

Local development commonly uses:

```text
http://127.0.0.1:8000
```

## GET /api/health/

Status: **Implemented**

### Purpose

Check whether the backend is reachable.

### Response

```json
{
  "status": "ok"
}
```

### Frontend client

```typescript
getBackendHealth(signal?: AbortSignal)
```

The client accepts an optional cancellation signal and bypasses the browser cache.
`BackendStatus` checks on mount, then schedules the next check five seconds after
the previous request settles. Each request has a five-second timeout. Cleanup
cancels the active request and timers. The status describes the health endpoint,
not the success of every application endpoint.

---

## GET /api/algorithms/

Status: **Implemented**

### Purpose

Return available sorting algorithms that have an active built-in implementation.

### Example response

```json
[
  {
    "name": "Quick Sort",
    "slug": "quick-sort",
    "description": "A divide-and-conquer sorting algorithm that partitions elements around a pivot.",
    "problem": "Sorting",
    "best_case_complexity": "O(n log n)",
    "average_case_complexity": "O(n log n)",
    "worst_case_complexity": "O(n^2)",
    "space_complexity": "O(log n) avg / O(n) worst",
    "implementations": [
      {
        "name": "Built-in Python",
        "slug": "built-in-python",
        "language": "python",
        "source_type": "built_in",
        "is_reference": true,
        "is_active": true
      }
    ]
  }
]
```

### Current behavior

- returns algorithms under the Sorting problem,
- requires at least one active built-in implementation,
- returns only active built-in implementations in the nested list,
- does not expose `registry_key`.

### Frontend type

```text
src/types/algorithm.ts
```

### Frontend client

```typescript
getAlgorithms()
```

## POST /api/benchmarks/bubble-sort/

Implemented locally for Issue #18. Accepts size (1–1000), optional seed and
dataset_type. Runs trusted Bubble Sort ten times and returns correctness plus
median/min/max and individual times in ns. See [Benchmark contract](BENCHMARKS.md)
for full validation and response semantics.

## Experiment definition API

Implemented locally for Issue #19:

- `POST /api/experiments/`: create a draft, HTTP 201.
- `GET /api/experiments/<id>/`: retrieve saved configuration, HTTP 200/404.

See [Experiments](EXPERIMENTS.md) for validation, relationships, status and full
request/response semantics. Catalogue implementation objects now expose an `id`
for selection; internal registry keys remain private.

# Planned API

The exact contracts below are not finalized.

## Dataset API

Status: **Planned**

Possible responsibilities:

- expose supported dataset types,
- validate dataset configuration,
- optionally preview generated data.

Initial dataset types:

- random
- sorted
- reversed
- nearly sorted

The open Issue #17 defines these four initial types. Few unique values remains
a proposed extension, outside that issue's current acceptance criteria.

No endpoint path is final yet.

## Experiment execution API

Status: **Planned**. Creating saved definitions is implemented; scheduling and
executing an experiment remain separate future work.

## Results API

Status: **Planned**

Expected responsibilities:

- fetch experiment results,
- expose summary statistics,
- support dashboard/comparison views.

No endpoint path or payload is final yet.

## API design rules

1. Do not expose internal execution details unnecessarily.
2. Keep `registry_key` private unless a future use case requires it.
3. Validate IDs, slugs, and configuration in the backend.
4. Keep frontend types aligned with API responses.
5. Add API tests for new endpoints.
6. Update this document in the same PR when a public contract changes.

## Custom Python static validation (#22)

`POST /api/implementations/validate-python/` accepts only JSON `{ "source": "def solve(values):\n    return sorted(values)" }`.
There is no execution flag. No submitted code is executed or persisted.

A valid request returns HTTP 200 with a domain result, including source errors:

```json
{"valid": true, "stage": "static", "errors": []}
```

```json
{"valid": false, "stage": "static", "errors": [{"code": "missing_solve", "message": "Χρειάζεται μία συνάρτηση def solve(values): στο κύριο επίπεδο του αρχείου.", "line": null, "column": null}]}
```

Malformed JSON, missing/extra fields and non-string source return HTTP 400 with
`invalid_request` in the same envelope. Unsupported methods return 405 and
unsupported content types 415 using DRF transport errors. Source is limited to
32,768 UTF-8 bytes. Syntax positions are 1-based when available. A successful
result checks syntax/declaration only, not correctness or safety.
See [Custom Python](CUSTOM_PYTHON.md) for the signature and local CLI contract.

Το #11 δεν αλλάζει το API contract: τα Python validation messages παραμένουν
ελληνικά. Το frontend μεταφράζει τους stable error codes στην επιλεγμένη UI
γλώσσα. Δεν αποστέλλεται language preference στο backend.

## POST /api/benchmarks/sorting/ — #41

JSON: `{"algorithm":"insertion-sort","size":100,"seed":42,"dataset_type":"random"}`.
Υποχρεωτικό algorithm: `bubble-sort`, `insertion-sort`, `selection-sort`, `merge-sort` ή `quick-sort`. Η απόκριση περιλαμβάνει το
επιλεγμένο algorithm και τα ίδια metrics με το Bubble endpoint. Ίδιο strict validation,
10 runs, όριο 1–1000, POST-only, χωρίς database access. Άγνωστο/missing algorithm ή
άγνωστα fields επιστρέφουν 400 πριν εκτελεστεί runner. Το αρχικό Bubble endpoint
διατηρεί το contract του. Βλ. [Benchmarks](BENCHMARKS.md).

## POST /api/experiments/<id>/run/ — #43

Body `{}`. Εκτελεί μία φορά draft experiment με έως 4 pairs και size έως 1000.
HTTP 200 επιστρέφει status, results και execution_error· 400 για μη έγκυρη
configuration/body, 404 για άγνωστο ID, 409 για non-draft. Το GET detail επιστρέφει
πλέον τα persisted results, ενώ το create τα εκθέτει read-only (αρχικά κενά).
Βλ. [Experiments](EXPERIMENTS.md) για snapshots, failure/transaction semantics και limits.

## Catalogue executable capability — #45

Κάθε implementation στο GET /api/algorithms/ περιλαμβάνει read-only boolean
`executable`, από τον ίδιο resolver που χρησιμοποιεί το experiment run. Το
registry_key παραμένει private. Το flag είναι ένδειξη κατά τη φόρτωση· ο server
επαναλαμβάνει όλους τους ελέγχους κατά το run. Δεν αλλάζει το create/run contract.

## GET /api/experiments/ — #47

Bounded summaries: `{ "results": [...], "next_before": 12 }`. Fields ανά summary:
id/name/status/created_at/updated_at. Έως 10 rows με descending ID. Προαιρετικό
`before` positive 64-bit integer, φίλτρο id < before. next_before null στο τέλος.
Unknown/duplicate/invalid query parameters: 400. Το POST creation contract παραμένει
ίδιο. Δεν εκτελείται benchmark και δεν φορτώνονται result blobs στο listing.


## Comparison backend (#58)

POST `/api/benchmarks/sorting/compare/`: algorithms (2–5 distinct trusted slugs), size (1–1000), dataset_type και seed. Μία deterministic generation, fresh copy ανά sorter/run, 10 runs. Response: configuration και results με algorithm/status/measurement ή ασφαλές runner_error χωρίς metrics. Αποτυχία ενός sorter δεν ακυρώνει τους υπόλοιπους. Χωρίς persistence· ίδια single-run contracts. Tests: κοινό input, distinct copies, dispatch, API validation και isolated failures.


## Persisted comparisons (#62)

Comparison response προσθέτει save_token μόνο για πλήρη measured batches. POST `/api/benchmarks/sorting/compare/save/` δέχεται name/token, επαληθεύει server signature (1 ώρα), και αποθηκεύει υπάρχουσες μετρήσεις σε Experiment/ExperimentResult χωρίς rerun. Δεν δέχεται client timings. Snapshot marker comparison επιτρέπει reopen με το κοινό chart από το υπάρχον history/ID. Catalogue identity αποτυπώνεται κατά το save· αν λείπει απορρίπτεται. Έως 5 ήδη εκτελεσμένα results, ενώ draft execution παραμένει max 4 pairs. Χωρίς migration. Token replay μπορεί να δημιουργήσει δεύτερο saved copy· σε timeout ελέγχουμε history πριν retry. Tests: signature/expiry/tamper, persistence/history/immutable snapshots και frontend reconstruction.


## Richer statistics (#63)

Mean και population standard deviation (`mean_ns`, `stddev_ns`) υπολογίζονται από τα ίδια 10 timings. Median/min/max παραμένουν. Στο comparison το πρώτο algorithm του request είναι σταθερό, ρητό `baseline_algorithm`: `relative_speed = baseline median / row median`, μόνο για σωστά αποτελέσματα με θετικούς χρόνους και finite ratio. Αποτυχία του baseline δεν επιλέγει άλλο· επιστρέφεται null. Baseline και ratio διατηρούνται μέσα στα measurement snapshots. Παλιά snapshots χωρίς νέα fields εμφανίζουν —. UI σε ms, ratios σε ×, χωρίς statistical significance/winner claims. Tests ελέγχουν ακριβείς υπολογισμούς, zero/incorrect/overflow, persistence και el/en rendering.
