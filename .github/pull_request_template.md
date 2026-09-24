## Summary

Describe the problem and the result of this Pull Request.

## Implementation

Explain the important implementation choices and any relevant limitations.

## Validation

- [ ] Relevant automated tests pass
- [ ] Lint/build/checks pass where applicable
- [ ] Manual verification completed where applicable
- [ ] `git diff --check` is clean

## Documentation

Review the documentation impact for this change.

- [ ] `PROGRESS.md` updated if implementation status changed
- [ ] `ROADMAP.md` updated if milestone/scope status changed
- [ ] `API.md` updated if a public API contract changed
- [ ] `ARCHITECTURE.md` updated if architecture changed
- [ ] `DECISIONS.md` updated for an important technical decision
- [ ] `TESTING.md` updated if testing strategy/coverage changed
- [ ] `DEVELOPMENT.md` updated if setup/workflow changed
- [ ] `README.md` updated if the public project summary/setup changed
- [ ] No documentation update is required for this PR

Documentation changes belong in the same issue branch as the code they describe.
They merge automatically with the branch into `dev`, then with `dev` into
`main`.

## Branch flow

- Normal issue/feature PR target: `dev`
- `main` and `dev` are permanent branches
- Promotion `dev` -> `main` happens only on explicit user instruction
- After promotion, synchronize `main` back into `dev`
- Delete only merged temporary issue branches
