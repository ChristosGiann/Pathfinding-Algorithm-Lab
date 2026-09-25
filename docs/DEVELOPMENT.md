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
python backend\manage.py test core
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
python backend\manage.py test core
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
