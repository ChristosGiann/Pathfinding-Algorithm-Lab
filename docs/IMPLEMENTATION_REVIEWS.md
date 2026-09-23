# Personal implementation reviews — Issue #21

Open **Προσωπική αξιολόγηση** underneath an implementation in the Algorithm
Library. The form loads on first opening and retains unsaved edits when collapsed.
Save explicitly before refreshing or leaving the page.

Six independent ratings accept integers 1–5 or null (unrated): performance,
readability, simplicity, reliability, learning_value and overall. Overall is a
personal judgement, not an automatically calculated average or benchmark score.
Strengths, weaknesses, use_cases and notes accept up to 5,000 characters each.
Whitespace and line breaks are preserved. All form text is Greek.

## Persistence and API

`reviews.ImplementationReview` has a one-to-one relation to a catalogue
implementation. Rating bounds have database constraints as well as serializer
validation. Notes are validated by the API. Deleting an implementation cascades
to its review. Inactive/custom implementations are unavailable through this API.

`GET /api/implementations/<id>/review/` returns 200 with ratings, text,
implementation_id and updated_at. An untouched implementation returns null
ratings, empty text and null updated_at without creating a database row.

`PUT` to the same URL takes all ten editable fields. It creates (201) or updates
(200) one review using update_or_create. Missing, unknown and read-only fields,
non-integer ratings, invalid text types and out-of-range values return 400.
A rejected request does not replace existing data. Missing or unsupported
implementations return 404. POST/PATCH/DELETE are not exposed.

Example full PUT body:

```json
{
  "performance": 2,
  "readability": 4,
  "simplicity": 5,
  "reliability": null,
  "learning_value": 5,
  "overall": 4,
  "strengths": "Εύκολη κατανόηση",
  "weaknesses": "Αργός σε μεγάλα δεδομένα",
  "use_cases": "Εκμάθηση ταξινόμησης",
  "notes": "Προσωπικές παρατηρήσεις"
}
```

The catalogue exposes numeric implementation IDs, matching the additive change
also proposed in PR #30. No private registry keys are exposed.

## Scope and integration

This is one shared review per implementation in the **single-user local MVP**.
There is no user ownership or account isolation. Two tabs editing the same review
use last-write-wins; conflict detection/version history is future work. Reviews
are not versioned source-code snapshots and do not affect benchmark metrics.

The separate Django app keeps subjective reviews separate from the algorithm
catalogue and experiment definitions. Its initial migration depends on core 0002,
so it does not create competing core migration leaves with PR #30. PR #32 was integrated into dev after PR #30 and #31.

Apply `python manage.py migrate` from backend before starting the updated server.
Restart a server started with --noreload after updating code. No npm dependency
was added. The Greek form reflects the current Greek-only app entry point.

## Verification

- From backend: `.venv/Scripts/python.exe manage.py test core reviews` — 33 tests,
  including eight review tests covering round trips, updates, nulls, all field
  validation, DB constraints, inaccessible targets and implementation isolation.
- `manage.py makemigrations --check --dry-run`: no missing migrations.
- `manage.py migrate`: reviews.0001_initial applied locally; test DB also migrated.
- `npm run lint`, `npm run build`, `git diff --check` passed.
- Browser with real backend: all six ratings and four text fields saved (201),
  persisted after refresh, updated (200), persisted again. Offline save preserved
  edits, retry succeeded; offline initial load blocked editing and retry loaded
  the form. A second implementation remained blank.
- A clearly labelled test review remains on local Bubble Sort implementation ID 1;
  the SQLite database is ignored by Git and is not published.
- The 15-second response deadline and unmount races have not been simulated with
  a delayed server. No automated frontend interaction suite was added.

GET and PUT have 15-second client deadlines. The save error message deliberately
says that confirmation failed: if a response is lost the server may have saved
successfully. Repeating PUT targets the same review. No automatic retry is sent.
