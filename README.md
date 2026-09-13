# Algorithm Evaluation Lab

Algorithm Evaluation Lab is a full-stack educational and experimental application for studying, benchmarking, and comparing algorithms.

The project started as a pathfinding visualizer and has evolved into a broader lab where users will be able to:

- browse algorithms and their theoretical complexity,
- generate controlled datasets,
- run repeatable benchmarks,
- store experiment results,
- compare algorithms with real measurements,
- visualize algorithm behavior,
- connect theoretical Big-O complexity with observed performance.

> Repository note: the GitHub repository still uses the legacy name `Pathfinding-Algorithm-Lab`, while the current project name is **Algorithm Evaluation Lab**.

## Stack

### Frontend
- React 19
- TypeScript 6
- Vite 8
- CSS
- Fetch API

### Backend
- Python
- Django 5.2.16
- Django REST Framework 3.17.1
- SQLite for development

### Workflow
- Git
- GitHub Issues
- feature branches
- Pull Requests
- automated backend tests

## Current status

Implemented:

- Django backend foundation
- React/Vite frontend foundation
- backend health endpoint
- `Problem`, `Algorithm`, and `AlgorithmImplementation`
- sorting seed data
- algorithm complexity metadata
- read-only algorithms API
- backend API tests
- Algorithm Library frontend implementation

Latest completed feature:

- Issue #16 β€” Algorithm Library
- merged to `main` through PR #27; Issue #16 is closed
- follow-up retry, lint, and backend status fixes (`9e1582b`) integrated into `dev`
- follow-up fixes and documentation are on `dev`; promotion to `main` requires explicit user instruction

Next:

- #17 Dataset Generators: merged into dev through PR #28; issue closed
- #18 First Bubble Sort benchmark: implemented locally; review pending
- #19 Experiment Model + API
- #20 Results Dashboard
- #21 MVP Integration Review

## Quick start

### Backend

First-time setup from the repository root (skip file copies if already configured):

```powershell
python -m venv backend\.venv
.\backend\.venv\Scripts\python.exe -m pip install -r backend\requirements.txt
Copy-Item backend\.env.example backend\.env
```

Set a local `DJANGO_SECRET_KEY` in `backend/.env` and keep `DJANGO_DEBUG=True`
for local development. Then activate the virtual environment:

```powershell
& .\backend\.venv\Scripts\Activate.ps1
```

```powershell
python backend\manage.py migrate
python backend\manage.py seed_sorting_algorithms
python backend\manage.py runserver
```

Tests:

```powershell
python backend\manage.py test core
```

### Frontend

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

Copy the example only on first setup; preserve an existing `.env.local`.
In a separate terminal, run checks with `npm run lint` and `npm run build`.

The frontend expects `VITE_API_BASE_URL` in `.env.local`:

```text
VITE_API_BASE_URL=http://127.0.0.1:8000
```

## Current API

```text
GET /api/health/
GET /api/algorithms/
POST /api/benchmarks/bubble-sort/
```

See [docs/API.md](docs/API.md).

## Documentation

- [Project definition](docs/PROJECT.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Roadmap](docs/ROADMAP.md)
- [Progress](docs/PROGRESS.md)
- [Development](docs/DEVELOPMENT.md)
- [Decisions](docs/DECISIONS.md)
- [API](docs/API.md)
- [Testing](docs/TESTING.md)
- [Dataset generators](docs/DATASETS.md)
- [First benchmark](docs/BENCHMARKS.md)

## Documentation rule

The files under `docs/` are the project's source of truth for design, roadmap, progress, and technical decisions.

When a feature changes the architecture or roadmap, the corresponding documentation should be updated in the same Pull Request.
