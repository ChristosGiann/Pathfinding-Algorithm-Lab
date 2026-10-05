# Project Progress

Last verified: **2026-10-05**

## Current phase

Το παρόν snapshot περιλαμβάνει το ολοκληρωμένο sorting evaluation scope #58–#64/#66–#68:
comparison, αποθήκευση/ιστορικό, statistics/baseline, Big-O context, educational
Library, visualization, trusted local custom execution και CI. Το #65 προσθέτει
το pathfinding input/result/evaluation foundation. Τα #2/#3/#1 παρέχουν neighbours,
reconstruction και pure BFS. Η UI σύνδεση και το animation ακολουθούν στο #4.
Η προώθηση από dev σε main γίνεται μόνο με ρητή εντολή· τα δύο branches παραμένουν μόνιμα.

Οι επόμενες ενότητες διατηρούν το ιστορικό ανά issue· οι παλιότερες test counts
και ενδιάμεσες καταστάσεις αφορούν την ημερομηνία τους.

## Git state

- Issue #16 is closed; PR #27 merged the Algorithm Library into `main`.
- Issues #17–#21 were merged into `dev` through PRs #28–#32.
- PR #33 promoted that integrated `dev` snapshot to `main` on 2026-09-23.
- `main` and `dev` are permanent. Never delete `dev`, locally or remotely,
  including after a dev-to-main PR. Delete only merged temporary issue branches.
- New issue branches should continue to start from `dev`.
- Promote `dev` to `main` only on explicit user request.

## Completed functionality

- React/TypeScript/Vite frontend and Django/DRF backend.
- Health endpoint and frontend API client.
- Pathfinding grid foundation, wall toggling, clear/reset controls, translations.
- `Problem`, `Algorithm`, and `AlgorithmImplementation` domain models.
- Idempotent seed command for Bubble, Selection, Insertion, Merge, and Quick Sort.
- Complexity metadata and read-only `GET /api/algorithms/` API.
- Filtering of active built-in implementations; private registry keys.
- Algorithm Library cards, loading/error/empty states and retry button.

Seeded implementation records are metadata. Bubble Sort (#18) and Insertion Sort (#41)
are executable through a fixed code allowlist. Selection Sort (#51) is also executable; Merge Sort (#52) is executable; Quick Sort (#53) completes all five executable sorters. The experiment resolver checks trusted catalogue identity.

## Follow-up fixes

- ESLint excludes `backend/.venv` dependencies.
- Algorithm Library retries set loading state in the event handler.
- Effect cleanup ignores outdated algorithm responses.
- Backend health is checked on mount and five seconds after each completed check.
- Health requests time out after five seconds; cleanup aborts requests and timers.
- Health recovery updates the status automatically; library recovery uses retry.

## Verification

Integration verification on 2026-09-23: 44 backend tests and 4 frontend rendering
tests passed, along with lint, build, Django checks and migration consistency.
Core migration 0003 and reviews migration 0001 are applied locally.
Issue #22 adds static custom Python validation and an explicit developer-only local runner; see the verification section below.

Browser scenarios verified against the real local backend:

- Available backend: all five algorithm cards and complexity metadata appear.
- Stopped backend: error message and retry button appear.
- Retry while stopped: loading returns to an actionable error state.
- Backend restored: retry loads all five cards without page refresh.
- Health polling: online to offline to online updates without refresh.

These were browser checks, not a newly added automated frontend test suite.
Timeout and cleanup behavior have not been separately exercised with a delayed
server response or an automated unmount test. See [Testing](TESTING.md).

## Next

1. Το ζητημένο sorting scope ολοκληρώθηκε. Το pathfinding foundation #65 προετοιμάζει την επόμενη φάση· τα #1–#10 παραμένουν ανοικτά και απαιτούν ξεχωριστή υλοποίηση. Νέα κενά καταγράφονται σε issue πριν από εργασία.
2. Keep `dev` as the permanent integration branch for subsequent issue branches.
3. Keep documentation synchronized in the same PR whenever feature status, API contracts, architecture, or roadmap change.

## Issue #12 — Portfolio README, 2026-09-25

Το παρόν feature snapshot ανανεώνει το README στα Ελληνικά με αγγλικούς technical
terms: σημερινά features, διάκριση benchmarking/visualization, vertical slice,
setup, πραγματικό screenshot, roadmap και MVP limitations. Δεν αλλάζει application
code. Το #22 ενσωματώθηκε μέσω PR #38 και η τεκμηρίωση συμφιλιώθηκε στο PR #39.
Η προτίμηση για ελληνικά PR descriptions/comments καταγράφεται στο DEVELOPMENT.

## Issue #19 verification

36 backend tests pass (25 existing + 11 new). Migration 0003 applied locally;
Django checks and migration dry-run passed. Actual HTTP POST returned 201 and
GET returned 200 with matching stored implementations and datasets. A local draft
named `Issue 19 API verification` (ID 1) remains available for inspection.
See [Experiments](EXPERIMENTS.md). No new experiment UI or execution is included.

## Scope alignment for Issue #17

The live issue specifies Random, Sorted, Reversed, and Nearly Sorted datasets;
`size` and `seed`; reproducibility tests; sizes 10, 100, 1000 plus bounded custom
sizes; and independent input copies for benchmark runs.

Few Unique Values appears in the imported plan but is a proposed extension.
The local implementation supports sizes 1 through 100,000 with the semantics
in [Datasets](DATASETS.md). The future runner must use `copy_for_run()`. No new dataset endpoint contract has been finalized.


## Issue #21 — 2026-09-22

Merged into `dev` through PR #32, then promoted to `main` through PR #33; Issue #21 closed.
Adds review persistence, strict GET/PUT API, Greek editable form and eight new
backend tests (44 total with experiments integrated). Lint/build and migration checks pass.
Browser verification covered save, refresh, update, offline load/save errors,
retry, and separate review data per implementation. See
[Implementation reviews](IMPLEMENTATION_REVIEWS.md).

PR #30 (#19), PR #31 (#20) and PR #32 (#21) were merged into `dev` and are now present on `main` through PR #33.
The earlier association of #21 with MVP Integration Review was corrected to the
live GitHub issue. All three completed temporary branches have been deleted.

## Issue #20 dashboard

Merged into `dev` through PR #31, then promoted to `main` through PR #33; Issue #20 closed.
See [Results dashboard](RESULTS_DASHBOARD.md) for scope, validation and limitations.
Both experiment and dashboard testing sections are retained in the integrated documentation.

## Issue #22 — 2026-09-25

Integrated through PR #38: Greek source editor, static-only validation
API, 32,768-byte limit, solve(values) contract, structured errors and explicit
local CLI execution with a 2-second subprocess timeout. No persistence, public
execution or custom benchmarks. All 60 backend tests and 4 frontend tests pass;
lint/build, Django checks and migration dry-run pass. No migrations required.
See [Custom Python](CUSTOM_PYTHON.md) for scope and verification limits.

## Issue #11 — Επιλογή γλώσσας

Το header προσφέρει Ελληνικά / English και ενημερώνει όλες τις ενότητες,
reviews, grid accessibility labels και custom validation errors. Default el,
χωρίς persistence της επιλογής. Τα drafts/results παραμένουν κατά την αλλαγή.
Προστέθηκαν πέντε frontend regression tests (εννέα συνολικά).
Βλ. [Language](LANGUAGE.md) για το contract και τα όρια.

## Issue #41 — Sorting selection

Στο παρόν feature snapshot προστέθηκε Insertion Sort, κοινός trusted runner και
POST `/api/benchmarks/sorting/`. Ο selector και κάθε αποτέλεσμα κρατούν την ταυτότητα
algorithm σε el/en. Το παλιό Bubble endpoint παραμένει συμβατό. Δεν αλλάζουν models.
Τα #11/#12/#22 έχουν ενσωματωθεί στο dev μέσω PR #40/#39/#38 και έκλεισαν.
Το #41 ενσωματώθηκε στο dev μέσω PR #42. Το feature περιλαμβάνεται στο release snapshot.

## Issue #43 — Εκτέλεση και αποθήκευση experiments

Backend-only feature: POST run, runtime validation, έως 4 pairs, atomic persistence,
GET persisted results και snapshot identity. Προστέθηκε migration 0004.
Το #41 έγινε merge στο dev μέσω PR #42 (20b0e96) και έκλεισε.
Το #43 ενσωματώθηκε στο dev μέσω PR #44· το standalone benchmark UI παραμένει session-only.

## Issue #45 — Experiment UI

Στο παρόν feature snapshot: create draft, run, open by ID, refresh, snapshot result
table και el/en feedback. Το #43 ενσωματώθηκε στο dev μέσω PR #44 (ac23024) και έκλεισε.
Το #45 έγινε merge μέσω PR #46. Το #47 προσθέτει history/listing· richer comparison ακολουθεί.

## Issue #47 — Experiment history

Στο παρόν feature snapshot: GET collection με bounded summaries/cursor, history UI,
previous/next, retry/refresh και άνοιγμα χωρίς ID πληκτρολόγηση. Ενσωματώθηκε στο dev μέσω PR #48.
Το #45 έχει ενσωματωθεί στο dev μέσω PR #46 (e350267) και έκλεισε.


## Issue #51 — Selection Sort

Υλοποιείται Selection Sort σε benchmark API, selector el/en και saved experiments.
Επιλέγει το ελάχιστο στοιχείο σε κάθε pass: O(n²) χρόνος, O(1) επιπλέον χώρος.
Τα όρια παραμένουν 1000 items, 10 runs και 4 experiment pairs. Το #51 ενσωματώθηκε μέσω PR #54. Τα #52/#53 ολοκληρώνουν Merge/Quick Sort.


## Issue #52 — Merge Sort

Προστίθεται bottom-up Merge Sort: O(n log n) χρόνος και O(n) βοηθητικός χώρος.
Benchmark API, selector el/en και persisted experiments χρησιμοποιούν την ίδια trusted implementation.
Το υπάρχον list μεταβάλλεται, χωρίς recursion ή αλλαγή των execution limits.


## Issue #53 — Quick Sort

Προστίθεται iterative three-way Quick Sort με middle pivot και επεξεργασία μικρότερου partition πρώτα.
O(n log n) average, O(n²) worst-case, O(log n) stack· όλα ίσα στοιχεία ολοκληρώνονται σε O(n).
Και οι πέντε catalogue sorters είναι executable σε benchmark/experiments.
Τα #51/#52 ενσωματώθηκαν με PR #54/#55. Διατηρείται όριο 4 pairs ανά experiment·
οι πέντε implementations δεν επιλέγονται όλες μαζί σε ένα run.


### Integrated verification #51–#53 (2026-09-29)

91 backend και 17 frontend tests, lint/build, Django checks και migration dry-run επιτυχή.
Browser: κάθε νέος sorter έτρεξε benchmark, δημιουργήθηκε το local experiment #12
«Smoke #51–53 — Sorting catalogue» με Selection/Merge/Quick, εκτελέστηκε με τρία σωστά results,
έγινε refresh από server με ίδιες μετρήσεις και αλλαγή el/en. Δεν καταγράφηκαν console errors.
Το δείγμα παραμένει τοπικά για επιθεώρηση. Δεν προστέθηκε migration.


## Comparison backend (#58)

POST `/api/benchmarks/sorting/compare/`: algorithms (2–5 distinct trusted slugs), size (1–1000), dataset_type και seed. Μία deterministic generation, fresh copy ανά sorter/run, 10 runs. Response: configuration και results με algorithm/status/measurement ή ασφαλές runner_error χωρίς metrics. Αποτυχία ενός sorter δεν ακυρώνει τους υπόλοιπους. Χωρίς persistence· ίδια single-run contracts. Tests: κοινό input, distinct copies, dispatch, API validation και isolated failures.


## Comparison view (#59)

Dedicated comparison form επιλέγει 2–5 sorters και κοινό dataset. Table και median/min/max chart χρησιμοποιούν κοινή κλίμακα ms. Incorrect rows διατηρούν τη σήμανσή τους, failed rows δεν εμφανίζουν metrics. State ανεξάρτητο από language, request guard/abort και 30s timeout. Rendering tests καλύπτουν el/en, shared scale και zero timings. Το #58 ενσωματώθηκε μέσω PR #69.


## Theory context (#60)

Single/comparison result rows αντιστοιχίζονται με slug στο catalogue API και εμφανίζουν best/average/worst/space σε διακριτό details panel. Missing/failed metadata δεν κατασκευάζουν Big-O και δεν κρύβουν timings. Fetch με 15s timeout/abort, ανεξάρτητο από language. Tests για exact mapping και fallback.


## CI (#61)

GitHub Actions `.github/workflows/checks.yml` τρέχει σε PR προς dev/main και push στα δύο μόνιμα branches. Backend: Python 3.10, pinned requirements, tests/check/migration consistency. Frontend: Node 24, npm ci, tests/lint/build. Independent jobs, read-only contents permission, 10-minute timeouts, cancellation παλαιότερου run στο ίδιο ref. Τα env values είναι αποκλειστικά test defaults, χωρίς secrets. Δεν αλλάζουν branch protections/deployment.


## Persisted comparisons (#62)

Comparison response προσθέτει save_token μόνο για πλήρη measured batches. POST `/api/benchmarks/sorting/compare/save/` δέχεται name/token, επαληθεύει server signature (1 ώρα), και αποθηκεύει υπάρχουσες μετρήσεις σε Experiment/ExperimentResult χωρίς rerun. Δεν δέχεται client timings. Snapshot marker comparison επιτρέπει reopen με το κοινό chart από το υπάρχον history/ID. Catalogue identity αποτυπώνεται κατά το save· αν λείπει απορρίπτεται. Έως 5 ήδη εκτελεσμένα results, ενώ draft execution παραμένει max 4 pairs. Χωρίς migration. Token replay μπορεί να δημιουργήσει δεύτερο saved copy· σε timeout ελέγχουμε history πριν retry. Tests: signature/expiry/tamper, persistence/history/immutable snapshots και frontend reconstruction.


## Richer statistics (#63)

Mean και population standard deviation (`mean_ns`, `stddev_ns`) υπολογίζονται από τα ίδια 10 timings. Median/min/max παραμένουν. Στο comparison το πρώτο algorithm του request είναι σταθερό, ρητό `baseline_algorithm`: `relative_speed = baseline median / row median`, μόνο για σωστά αποτελέσματα με θετικούς χρόνους και finite ratio. Αποτυχία του baseline δεν επιλέγει άλλο· επιστρέφεται null. Baseline και ratio διατηρούνται μέσα στα measurement snapshots. Παλιά snapshots χωρίς νέα fields εμφανίζουν —. UI σε ms, ratios σε ×, χωρίς statistical significance/winner claims. Tests ελέγχουν ακριβείς υπολογισμούς, zero/incorrect/overflow, persistence και el/en rendering.


## Sorting visualization (#64)

Ανεξάρτητο TypeScript educational trace για Bubble/Insertion/Selection/Merge/Quick, με algorithm identities του catalogue, explicit input 1–32 integers 0–999 και immutable step snapshots. Play/Pause/Step/Speed/Reset χρησιμοποιούν καθαρό reducer· αλλαγή algorithm ξαναφορτώνει το αρχικό input. Το UI εξηγεί ότι writes μπορεί να εμφανίζουν προσωρινά duplicates λόγω buffer/key εκτός array. Δεν καλείται ούτε αλλάζει ο Python benchmark runner και δεν παράγονται performance metrics από animation. Tests καλύπτουν deterministic traces, duplicates/sorted/reversed/singleton, input validation, playback transitions και el/en controls.


## Educational library (#66)

Το catalogue API προσθέτει optional `education`: curated el/en what/intuition/how/strengths/weaknesses/uses/pitfalls, stable/in_place properties και deterministic walkthrough για τους 5 sorting algorithms. Η πηγή είναι το versioned backend module core/education.py· Big-O συνεχίζει να προέρχεται από τα υπάρχοντα model fields. Η Library επαναχρησιμοποιεί αυτά τα metadata, με ασφαλές fallback όταν optional περιεχόμενο λείπει. Τα walkthroughs δείχνουν σημαντικές καταστάσεις, όχι κάθε σύγκριση. Η Quick Sort σημείωση διακρίνει generic catalogue family από το three-way, smaller-range-first implementation. Δεν υπάρχει dynamic content generation ή inference από timings. Backend coverage ελέγχει πληρότητα και παραδείγματα, frontend tests el/en structure και missing fields.


## Trusted custom benchmark (#67)

POST `/api/benchmarks/sorting/custom/` με source, trusted:true, size, seed, dataset_type. Disabled by default: απαιτούνται DEBUG, `ENABLE_TRUSTED_CUSTOM_EXECUTION=true`, loopback REMOTE_ADDR και επιτρεπόμενο frontend Origin. Το UI ζητά acknowledgement για δικό σου trusted code. Για προσωρινή τοπική ενεργοποίηση PowerShell: `$env:ENABLE_TRUSTED_CUSTOM_EXECUTION='true'` και restart backend στο 127.0.0.1. Μην ενεργοποιείται σε public/proxied server. Δεν αλλάζει αυτόματα το .env.

Νέος worker, ξεχωριστός από το παλιό CLI smoke: Python -I -S, προσωρινό cwd, reduced env, stdout/stderr discarded, 2 s wall timeout, ένα custom process ανά server process, input≤1000/source≤32768 UTF-8 bytes/output≤16 KiB. Unix επιπλέον 256 MiB address-space/2 s CPU/file-size limits· Windows έχει wall-time/input/output/concurrency limits, όχι OS memory isolation. **Δεν είναι hostile-code sandbox**. Static validation προηγείται· execution subset δέχεται μόνο function definitions χωρίς imports/classes/decorators/defaults/annotations, περιορισμένα built-ins και list/dict methods (core/custom_python/benchmark.py). Δεν υποστηρίζονται packages/network/I/O.

solve(values) επιστρέφει list ή None για in-place. Δέκα fresh copies, μόνο solve timed, correctness μετά κάθε run, ίδιο timing_statistics helper με built-ins. Structured validation/runtime/timeout/busy/unavailable errors, ποτέ fallback. Source/results δεν αποθηκεύονται. Tests: πραγματικά subprocess success/incorrect/exception/timeout/fresh-copy, rejection πριν process, local opt-in gates και bilingual UI acknowledgement. Η παλαιότερη περιγραφή «μόνο CLI execution» αντικαθίσταται από αυτό το opt-in flow.


## Mixed custom/built-in comparison (#68)

Το υπάρχον POST sorting/compare/ δέχεται optional custom_source και trusted:true μαζί με 1–4 distinct built-ins (χωρίς custom παραμένει 2–5). Μία generation, ανεξάρτητες copies σε parent/worker, ίδιο configuration και metrics helper. Το πρώτο selected built-in είναι το ρητό baseline· custom row έχει source_type:custom και algorithm:custom-python. Failure/timeout/disabled/invalid custom δεν ακυρώνουν τις built-in μετρήσεις και δεν δημιουργούν metrics. Το UI προσθέτει προαιρετική built-in επιλογή στη custom φόρμα και επαναχρησιμοποιεί ComparisonResults/table/common scale/relative speed. Mixed results δεν παίρνουν save_token: custom persistence είναι εκτός scope. Process startup δεν χρονομετρείται· ο worker έχει ξεχωριστό process context, επομένως οι χρόνοι δεν αποδεικνύουν γενική ανωτερότητα. Backend tests καλύπτουν same dataset/fresh copies/πραγματικό worker/errors, frontend tests mixed identities/scales/failed rows.


## Pathfinding foundation (#65)

Κοινό GridInput/Search/PathfindingResult για bfs/dfs/dijkstra/astar, adapter από υπάρχον UI grid χωρίς DOM, frozen copies, cardinal unit-cost neighbours και same-grid evaluation utility. Found/no-path/invalid/runner error έχουν διακριτό contract. Timing μόνο του search call· path length σε ακμές, null όταν δεν υπάρχει path. Δεν προστίθενται ακόμη οι τέσσερις algorithms, animation ή persistence και δεν κλείνουν τα #1–#10. Αναλυτικό contract και όρια στο [Pathfinding](PATHFINDING.md). Tests καλύπτουν input validation, walls/markers, same-cell/no-path, invalid trace, timing boundary και copy isolation· το sorting regression suite παραμένει ενεργό.

## Issue #2 — Pathfinding neighbours

Το υπάρχον neighbours του #65 καλύπτει τα cardinal neighbours χωρίς walls/out-of-grid ή UI logic. Προστέθηκε ξεχωριστό regression suite για edges/corners, narrow grids, invalid origins και copy isolation. Δεν προστέθηκε duplicate utility.

## Issue #3 — Path reconstruction

Υλοποιήθηκε καθαρό iterative reconstructPath με previous node references, start→end IDs, no-path/cycle handling και tests. Δεν προστίθεται ακόμη algorithm ή UI execution.

## Issue #1 — BFS

Προστέθηκε καθαρός BFS με deterministic traversal, shortest path σε unit-cost grid, walls/no-path/same-cell handling και συμβατότητα με evaluation metrics. Τα tests ελέγχουν processing order, route, isolation και reversed endpoints. Το UI παραμένει ανενεργό μέχρι το animation issue #4.

## Issue #10 — Pathfinding tests

Το dedicated suite καλύπτει neighbours, BFS paths/walls/no-path και ανεξάρτητη επαλήθευση σε 11.520 μικρά grid cases, συν το μέγιστο grid 10.000 cells. Εκτελείται με npm test και το υπάρχον CI. Η συνέχεια είναι η UI οπτικοποίηση (#4).
