# Development Guide

## Repository

Local development path used during the project:

```text
D:\Projects\pathfinding-visualizer
```

GitHub repository:

```text
ChristosGiann/Pathfinding-Algorithm-Lab
```

Project name:

```text
Algorithm Evaluation Lab
```

## Backend environment

For a fresh checkout, follow the dependency and environment-file setup in
[README](../README.md#quick-start). Do not overwrite existing environment files.

PowerShell activation:

```powershell
& .\backend\.venv\Scripts\Activate.ps1
```

Activation is optional. If PowerShell blocks activation, call the interpreter
directly without changing execution policy:

```powershell
.\backend\.venv\Scripts\python.exe backend\manage.py check
```

## Run backend

```powershell
python backend\manage.py runserver
```

Default local backend:

```text
http://127.0.0.1:8000
```

## Migrations

Check for unexpected model changes:

```powershell
python backend\manage.py makemigrations --check --dry-run
```

Create intentional migrations:

```powershell
python backend\manage.py makemigrations
```

Apply:

```powershell
python backend\manage.py migrate
```

## Seed sorting algorithms

```powershell
python backend\manage.py seed_sorting_algorithms
```

The command should remain idempotent.

## Django checks

```powershell
python backend\manage.py check
```

## Backend tests

```powershell
python backend\manage.py test core reviews
```

## Frontend

```powershell
npm install
npm run dev
```

Lint and production build checks:

```powershell
npm run lint
npm run build
```

## Frontend API configuration

The frontend expects:

```text
VITE_API_BASE_URL
```

The centralized client is:

```text
src/services/apiClient.ts
```

Components should normally use the client rather than building backend URLs directly.

## Manual API checks

```powershell
curl.exe http://127.0.0.1:8000/api/health/
curl.exe http://127.0.0.1:8000/api/algorithms/
```

## Προτεραιότητα και καταγραφή εργασιών

Προτεραιότητα ήταν η ολοκλήρωση του sorting scope #58–#64/#66–#68. Μετά την ενσωμάτωσή του, το #65 ξεκινά μόνο το pathfinding foundation. Η συνέχεια υλοποιείται ανά issue: neighbours (#2), reconstruction (#3), BFS (#1), tests (#10), και έπειτα UI/animation/controls/statistics/DFS/comparison (#4–#9).
Για εργασία χωρίς υπάρχον GitHub issue, δημιουργούμε σχετικό issue με scope και
acceptance criteria πριν από την υλοποίηση. Κάθε issue ακολουθεί ξεχωριστό branch/PR προς dev.

## Normal feature workflow

```text
Issue
  ↓
Update dev
  ↓
Create feature branch
  ↓
Implement in small steps
  ↓
Run tests/checks
  ↓
Manual verification
  ↓
Review diff
  ↓
Commit
  ↓
Push
  ↓
Pull Request targeting dev
  ↓
Merge into dev
  ↓
Delete merged issue branch
```

Example:

```powershell
git switch dev
git pull --ff-only origin dev
git switch -c codex/17-dataset-generators
```

## Branch naming

Feature:

```text
codex/<issue>-<short-name>
```

Examples:

```text
codex/17-dataset-generators
codex/18-benchmark-runner
```

Fix:

```text
codex/fix-<short-description>
```

Only `main` and `dev` are permanent branches. **Never delete `dev`, locally or
remotely, including after merging a dev-to-main PR.** Issue branches exist while work
is active and are deleted locally and remotely after their commits are merged.
Update `main` from `dev` only when the user explicitly requests it. Check for uncommitted
changes before switching branches. `git fetch origin` updates remote-tracking
references without merging changes into the current branch. Compare with
`git rev-list --left-right --count HEAD...origin/dev` before integration.

## Commit examples

```text
feat: add dataset generators
feat: add benchmark runner
fix: filter inactive implementations
test: add benchmark runner tests
refactor: extract benchmark metrics
docs: update architecture overview
```

## Before commit

Recommended checks:

```powershell
npm run lint
npm run build
python backend\manage.py check
python backend\manage.py test core reviews
python backend\manage.py makemigrations --check --dry-run
git diff --check
git status -sb
git diff --stat
```

Then:

```powershell
git status -sb
git diff --cached --check
git diff --cached --stat
```

## Definition of Done

A feature is done when applicable items are satisfied:

- implementation complete,
- frontend builds,
- Django checks pass,
- tests pass,
- manual flow works,
- no obvious browser-console errors,
- diff reviewed,
- relevant docs updated in the same branch/PR,
- meaningful commit,
- branch pushed,
- PR opened,
- PR merged to `dev`,
- merged issue branch deleted locally and remotely.

## Documentation workflow

Documentation is versioned exactly like source code. Every branch contains its own
snapshot of the Markdown files. Do not maintain separate manual copies for `dev`
and `main`.

The required flow is:

```text
dev
  ↓
issue / feature branch
  ├── code
  ├── tests
  └── relevant documentation updates
          ↓
        PR to dev
          ↓
        merge
          ↓
        dev now contains code + docs
          ↓
  dev-to-main promotion
          ↓
        main receives the same code + docs
```

When a feature changes:

- architecture -> update `ARCHITECTURE.md`
- project scope -> update `PROJECT.md`
- roadmap or milestone state -> update `ROADMAP.md`
- current implementation state -> update `PROGRESS.md`
- public API contract -> update `API.md`
- testing strategy or coverage -> update `TESTING.md`
- important technical choice -> update `DECISIONS.md`
- setup, commands, or workflow -> update `DEVELOPMENT.md`
- public project summary -> update `README.md` when useful

Relevant documentation must be updated in the same issue branch and Pull Request
as the code it describes. A merge then carries those Markdown changes automatically
into `dev`, and a later `dev` -> `main` merge carries the same documentation
into `main`.

Do not edit `main` separately just to duplicate documentation already present in
`dev`. If a post-merge status statement becomes stale because the promotion
itself changed the state (for example, "promotion to main pending"), create a small
documentation reconciliation PR through the normal `branch -> dev -> main` flow.

Before promoting `dev` to `main`, verify that `PROGRESS.md`, `ROADMAP.md`,
and `README.md` describe the integrated `dev` snapshot accurately.

After a `dev` -> `main` merge, synchronize `main` back into permanent `dev`
before starting the next issue branch. This keeps future issue branches based on
the latest shared Git history even when GitHub created a merge commit on `main`.

## GitHub communication

Write PR descriptions and GitHub comments in Greek, keeping established technical
terms, code identifiers and commands in English.

For every PR, add a detailed description and a conversation comment explaining
the problem, implementation choices, acceptance criteria, validation and remaining
limitations. Before closing a completed issue, post a completion comment linking
the merged PR and explaining how its criteria were satisfied. Distinguish tested
behavior from future integration work. Target dev; promote to main only on
explicit user instruction.

## Custom Python checks

Use `python backend\manage.py validate_custom_python .\example.py` for static
validation of a UTF-8 file. Add `--run-local` only to execute your own trusted
code locally with a 2-second timeout. The browser never executes custom code.
See [Custom Python](CUSTOM_PYTHON.md) for examples and the lack of a sandbox.

## Κείμενα UI και γλώσσα

Τα νέα UI strings μπαίνουν στα `src/i18n/` με εγγραφές el/en. Τα components
λαμβάνουν language ή texts από το κοινό App state· δεν ορίζουν δική τους default
γλώσσα. Τα error codes παραμένουν σταθερά και μεταφράζονται κατά το render.
Οι τύποι API δεν περιέχουν UI labels. Το `npm test` ελέγχει και αντιστοιχία
translation keys. Βλ. [Language](LANGUAGE.md).

## Experiment execution migration (#43)

Πριν χρησιμοποιήσεις το νέο run API, εκτέλεσε
`python backend/manage.py migrate`. Το migration 0004 προσθέτει τον πίνακα results
και execution_error. Οδηγίες και limits: [Experiments](EXPERIMENTS.md).


## CI (#61)

GitHub Actions `.github/workflows/checks.yml` τρέχει σε PR προς dev/main και push στα δύο μόνιμα branches. Backend: Python 3.10, pinned requirements, tests/check/migration consistency. Frontend: Node 24, npm ci, tests/lint/build. Independent jobs, read-only contents permission, 10-minute timeouts, cancellation παλαιότερου run στο ίδιο ref. Τα env values είναι αποκλειστικά test defaults, χωρίς secrets. Δεν αλλάζουν branch protections/deployment.


## Trusted custom benchmark (#67)

POST `/api/benchmarks/sorting/custom/` με source, trusted:true, size, seed, dataset_type. Disabled by default: απαιτούνται DEBUG, `ENABLE_TRUSTED_CUSTOM_EXECUTION=true`, loopback REMOTE_ADDR και επιτρεπόμενο frontend Origin. Το UI ζητά acknowledgement για δικό σου trusted code. Για προσωρινή τοπική ενεργοποίηση PowerShell: `$env:ENABLE_TRUSTED_CUSTOM_EXECUTION='true'` και restart backend στο 127.0.0.1. Μην ενεργοποιείται σε public/proxied server. Δεν αλλάζει αυτόματα το .env.

Νέος worker, ξεχωριστός από το παλιό CLI smoke: Python -I -S, προσωρινό cwd, reduced env, stdout/stderr discarded, 2 s wall timeout, ένα custom process ανά server process, input≤1000/source≤32768 UTF-8 bytes/output≤16 KiB. Unix επιπλέον 256 MiB address-space/2 s CPU/file-size limits· Windows έχει wall-time/input/output/concurrency limits, όχι OS memory isolation. **Δεν είναι hostile-code sandbox**. Static validation προηγείται· execution subset δέχεται μόνο function definitions χωρίς imports/classes/decorators/defaults/annotations, περιορισμένα built-ins και list/dict methods (core/custom_python/benchmark.py). Δεν υποστηρίζονται packages/network/I/O.

solve(values) επιστρέφει list ή None για in-place. Δέκα fresh copies, μόνο solve timed, correctness μετά κάθε run, ίδιο timing_statistics helper με built-ins. Structured validation/runtime/timeout/busy/unavailable errors, ποτέ fallback. Source/results δεν αποθηκεύονται. Tests: πραγματικά subprocess success/incorrect/exception/timeout/fresh-copy, rejection πριν process, local opt-in gates και bilingual UI acknowledgement. Η παλαιότερη περιγραφή «μόνο CLI execution» αντικαθίσταται από αυτό το opt-in flow.
