# Testing Strategy

## Goal

Testing should protect the evaluation pipeline without becoming unnecessary maintenance overhead.

## Current backend test suite

Current verified state:

```text
36 tests
```

Run with:

```powershell
python backend\manage.py test core reviews
```

Latest verified result after local Experiment Model/API implementation:

```text
Ran 36 tests
OK
```

## Current coverage

### Algorithms API

The suite verifies that:

- five seeded sorting algorithms are returned,
- complexity metadata is returned correctly,
- only active built-in implementations are returned,
- custom implementations do not leak into the public list,
- inactive built-in implementations do not leak into the public list,
- algorithms without an active built-in implementation are excluded,
- `registry_key` is not exposed.

### Seed command

The suite verifies that:

```text
seed_sorting_algorithms
```

is idempotent.

Repeated execution should not create duplicate:

- Problems
- Algorithms
- AlgorithmImplementations

## Test database

Django tests use a temporary test database.

Running:

```powershell
python backend\manage.py test core reviews
```

does not modify the normal development SQLite database.

## Testing layers

### 1. Unit tests

Use for isolated logic:

- dataset generators,
- sorting implementations,
- benchmark metric calculations,
- statistics helpers,
- registry resolution.

### 2. API tests

Use for REST contracts:

```text
/api/algorithms/
future experiment endpoints
future results endpoints
```

Verify:

- status code,
- response structure,
- filtering,
- validation,
- hidden internal fields,
- errors.

### 3. Integration tests

Use for important end-to-end backend flows.

Target future flow:

```text
Create experiment
    ↓
Generate dataset
    ↓
Resolve implementation
    ↓
Run benchmark
    ↓
Calculate metrics
    ↓
Store result
    ↓
Return result through API
```

## Frontend testing

Current frontend verification is primarily:

- TypeScript/build verification through `npm run build`,
- manual browser testing,
- real backend integration testing.

A dedicated frontend testing framework has not yet been established.

Add one when frontend behavior becomes complex enough to justify it.

## Current manual verification

Verified on 2026-09-13 using the real local Django server and the browser:

| Scenario | Steps | Observed result |
| --- | --- | --- |
| Initial success | Start backend and frontend, open page | Five algorithm cards with complexity metadata |
| Connection failure | Stop backend, reload page | Library error message and New attempt button |
| Failed retry | Keep backend stopped, select New attempt | Loading, then error and retry button again |
| Recovery | Restart backend, select New attempt without refresh | All five cards return |
| Health loss | With page open, stop backend | Header changes to unavailable without refresh |
| Health recovery | Restart backend without refreshing page | Header changes to available automatically |

Stop only the development server started for the test (Ctrl+C in its terminal),
then restart it with the same command. Leave the backend running after recovery.
Health checks are scheduled five seconds after the previous check completes;
a request may take up to another five seconds to time out.

These are browser verification results, not automated frontend tests. The empty
response, delayed-request timeout, and component-unmount cleanup scenarios were
not separately exercised in this session. Do not infer those results from lint
or build success. No full browser-console audit was performed.

The lint/build checks passed after the fixes. ESLint excludes `backend/.venv`;
the check should inspect application code rather than installed Python packages.

Algorithm Library checks include:

- backend running,
- frontend running,
- algorithms endpoint reachable,
- all five sorting algorithms visible,
- complexity metadata visible,
- built-in implementation visible,
- basic responsive behavior,
- no obvious functional errors.

## Benchmark testing principles

When the benchmark engine is implemented, distinguish:

### Correctness

Does the algorithm return the correct result?

### Orchestration

Does the runner:

- copy inputs correctly,
- run the configured number of times,
- collect timings,
- isolate algorithms from each other's mutations?

### Statistics

Are mean, min, max, and median calculated correctly?

Do not test for exact execution times. Timing is environment-dependent.

## Pre-PR checks

Recommended:

```powershell
npm run lint
npm run build
python backend\manage.py check
python backend\manage.py test core reviews
python backend\manage.py makemigrations --check --dry-run
git diff --check
```

## Testing rules

- Every reliable bug should be considered for a regression test.
- Every new public API contract should have API coverage.
- New pure benchmark/data logic should have focused unit tests.

## Dataset tests

Eleven tests in `backend/core/datasets/tests.py` cover reproducibility, ordering,
contents, size limits, validation, global RNG isolation and independent copies.
They use `SimpleTestCase` without a database. See [Datasets](DATASETS.md).

## Benchmark verification

Eight new tests cover Bubble Sort, timing boundaries, fresh inputs, correctness
failures, stats, API bounds and validation. The suite contained 44 tests before #22; the current integrated suite has 60.
See [Benchmarks](BENCHMARKS.md) for browser scenarios and measurement limits.

## Implementation reviews (#21)

Run `manage.py test core reviews` from backend (60 tests including custom Python validation).
The [review guide](IMPLEMENTATION_REVIEWS.md) records the API contract, browser
save/refresh/update scenarios and verification limitations.

## Results dashboard (#20)

Run `npm test` for the four rendering regression tests; requires Node 22.15+.
See [Results dashboard](RESULTS_DASHBOARD.md) for browser scenarios and limits.

## Experiment tests

Eleven new tests cover relationship persistence, defaults, catalogue IDs, bounds,
invalid inputs, atomic rollback, draft creation without execution, status DB
constraint and unsupported mutation methods. Real HTTP create/read was also
verified locally. See [Experiments](EXPERIMENTS.md).

## Έλεγχος τεκμηρίωσης #12 — 2026-09-25

Στο dev-based branch του README πέρασαν 44 backend tests, 4 frontend tests,
ESLint, production build, Django check και migration dry-run. Ελέγχθηκαν τα
relative links, τα explicit anchors και το screenshot του README. Έγινε
πραγματικό browser benchmark με Random/100/42 και επιβεβαιώθηκε η εμφάνιση
αποτελεσμάτων και της Algorithm Library. Το screenshot ελέγχθηκε οπτικά.
Δεν αλλάζει application code και δεν προστέθηκαν νέα tests. Οι εντολές checks
επαληθεύτηκαν στο υπάρχον local environment· δεν έγινε clean-machine reinstall.
Οι 44 έλεγχοι αφορούσαν το αρχικό branch του README πριν το integration του #22.
Το συνδυασμένο snapshot περιλαμβάνει 60 backend tests και τις δύο ενότητες τεκμηρίωσης.

## Custom Python validation (#22)

On 2026-09-25, `manage.py test core reviews` passed all 60 tests (16 new).
Coverage includes UTF-8 boundary sizes, strict solve signatures, syntax positions,
no execution by the API, malformed requests, returning/in-place sorting,
incorrect output, runtime errors, explicit CLI opt-in, and real infinite loops
at module load and function call terminated by the 2-second timeout.
The four existing frontend tests, lint/build, Django checks and migration dry-run passed.

Browser verification against the real local backend covered valid code, missing
solve, syntax errors with Greek messages and positions, and disabled submission
above the byte limit. No browser console errors were observed. A direct CLI
check returned exit 0 for valid code and exit 1 with `timeout` for an infinite
loop. Infinite-loop behavior was also checked by real automated subprocess tests;
the UI is static-only.
No new automated frontend interaction suite, delayed-response/unmount test or
adversarial sandbox audit is claimed. See [Custom Python](CUSTOM_PYTHON.md).

## Integration PR #38 + #39 — 2026-09-25

Μετά το merge του dev στο README branch και την επίλυση των τεσσάρων docs
conflicts, πέρασαν ξανά 60 backend tests, 4 frontend tests, lint/build, Django
check και migration dry-run. Διατηρήθηκαν και οι δύο ενότητες τεκμηρίωσης.

## Επαλήθευση #11 — 2026-09-28

Πέρασαν 9 frontend tests (5 νέα), 60 backend tests, lint/build, Django check και
migration dry-run. Στον browser ελέγχθηκαν default Ελληνικά, αλλαγή σε English
και επιστροφή, localized benchmark results και ήδη υπάρχον validation error.
Διατηρήθηκαν source, αποτέλεσμα benchmark, grid wall και μη αποθηκευμένο review
draft. Το draft δεν αποθηκεύτηκε στη βάση. Το document lang/title ακολουθεί τη
γλώσσα και το refresh επιστρέφει στο el. Δεν παρατηρήθηκαν console errors.
Δεν έγινε ξεχωριστό delayed-request ή offline end-to-end σενάριο κατά την
αλλαγή γλώσσας. Τα tests rendering δεν υποκαθιστούν τα browser interaction checks.

## Επαλήθευση #41 — Sorting selection

Πέρασαν 65 backend tests και 10 frontend tests, lint/build, Django check και
migration dry-run. Καλύπτονται Insertion Sort edge cases, όλοι οι dataset generators,
dispatch των δύο algorithms, fresh copies, timing boundaries, λάθος αποτελέσματα,
invalid/missing algorithm και compatibility του αρχικού Bubble endpoint.
Τα rendering tests ελέγχουν mixed algorithm results και error/timeout labels σε el/en.
Στον browser εκτελέστηκαν Bubble Sort και Insertion Sort με random size 100, seed 42:
και οι δύο επέστρεψαν correct για 10 runs. Η αλλαγή selector και el→en→el διατήρησε
την ταυτότητα και τις μετρήσεις των προηγούμενων γραμμών. Δεν εμφανίστηκαν console errors.
Δεν έγινε νέο πραγματικό 30-second timeout ή delayed-request/unmount σενάριο.

## Επαλήθευση #43

75 backend tests πέρασαν, με 10 νέα execution tests: τέσσερα πραγματικά pairs,
GET χωρίς rerun, conflict σε repeated/non-draft run, runtime limits, stale catalogue,
registry identity mismatch, missing definitions, safe runner failure, incorrect output,
rollback μετά από partial storage write και ανθεκτικά snapshots μετά από διαγραφές.
Δεν έγινε πολυδιεργασιακό concurrency/load test· το execution παραμένει synchronous local MVP.

Το migration 0004 εφαρμόστηκε επιτυχώς στην τοπική βάση. Django check και migration
dry-run πέρασαν. Τα 10 frontend regression tests παραμένουν επιτυχή.

Lint/build πέρασαν. Smoke check μέσω Django APIClient στην migrated local βάση
επαλήθευσε create 201, run 200 με δύο saved pairs, GET 200 με ίδια δεδομένα και
repeat 409. Το προσωρινό experiment αφαιρέθηκε με transaction rollback.
Δεν έγινε νέο browser flow: το feature αφορά backend API και μία διευκρίνιση UI κειμένου.

## Επαλήθευση #45 — Experiment UI

76 backend tests και 12 frontend tests πέρασαν, μαζί με lint/build, Django check,
migration dry-run και diff check. Νέο capability test ελέγχει true για trusted
Bubble/Insertion, false για unsupported/unknown registry και απόκρυψη registry_key.
Rendering tests καλύπτουν snapshots μετά από catalogue deletion, incorrect output,
runner failure, draft χωρίς invented metrics και translation parity.

Browser στο πραγματικό local backend: save draft με δύο implementations, run,
completed status με δύο rows, disabled rerun, αλλαγή el→en, page refresh και άνοιγμα
με ID 2 επέστρεψαν ίδιες μετρήσεις. Χωρίς console errors. Το sample experiment
`Smoke #45 — Bubble και Insertion` παραμένει στη local βάση για επανάληψη ελέγχου.
Δεν έγινε νέο πραγματικό timeout/offline/unmount ή automated interaction suite.

## Επαλήθευση #47 — Experiment history

81 backend tests και 14 frontend tests πέρασαν, όπως lint/build, Django check,
migration dry-run και diff check. Πέντε νέα backend tests ελέγχουν empty/exact-page,
23-row pagination με ενδιάμεση εισαγωγή, ένα bounded query χωρίς relations, invalid
queries, missing cursor row και listing χωρίς execution. Δύο frontend rendering
tests ελέγχουν localized summaries, escaped names, disabled controls και empty state.

Browser: άνοιγμα του saved #2 από τη λίστα, save/run του sample #3 με αυτόματη
ανανέωση history σε completed, el/en, next/previous σε 11 rows και διατήρηση δεύτερης
σελίδας κατά αλλαγή γλώσσας. Οι οκτώ προσωρινές pagination εγγραφές αφαιρέθηκαν.
Το sample #3 `Smoke #47 — Ιστορικό` παραμένει στη local βάση για review.
Σταμάτημα backend → history error με διατήρηση detail → restart → retry ανέκτησε
τη λίστα. Τα αναμενόμενα network errors αυτού του offline ελέγχου δεν είναι application
exceptions. Δεν έγινε νέο πραγματικό 15-second timeout ή automated browser suite.


## Selection Sort (#51)

Regression coverage: edge cases, τέσσερις dataset types έως 1000 items, fresh copies/timing boundaries, incorrect result, πραγματικό API και persisted create/run/get. Frontend rendering ελέγχει το option σε el/en.


## Merge Sort (#52)

Ίδια κάλυψη με Selection: edge cases/τέσσερα datasets έως 1000, fresh copies/timing, incorrect output, API και persisted round trip. Το frontend render test καλύπτει το option σε el/en.
