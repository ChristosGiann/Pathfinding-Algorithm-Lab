# Custom Python validation (#22)

The editor validates Python source through `POST /api/implementations/validate-python/`.
This performs static checks only: it never imports or executes submitted code.
Source and validation results are not persisted or registered as implementations.
Custom code is not connected to experiments or benchmarks.

## Contract

- Maximum 32,768 UTF-8 bytes, enforced in the UI, API validator and CLI.
- Exactly one top-level synchronous `def solve(values)` declaration.
- Positional-only `values` is allowed. Extra/default parameters, decorators,
  async functions and generator implementations are rejected.
- Expected behavior: return a sorted integer list, or sort the input list in
  place and return `None`. Static validation cannot prove this behavior.
- Syntax checks use Python AST parsing and compilation without execution.
- Errors have stable codes, Greek messages and optional 1-based line/column.

For example:

```python
def solve(values):
    return sorted(values)
```

The editor preserves source after a failed request. Editing clears the previous
result; submission locks the editor until the request settles. Requests time out
after 15 seconds and abort on unmount.

## Explicit local execution

From the repository root, with the backend environment activated:

```powershell
python backend\manage.py validate_custom_python .\example.py
python backend\manage.py validate_custom_python .\example.py --run-local
```

The first command only validates. The second explicitly executes developer-owned
code in a separate Python process, after static validation. No HTTP parameter can
enable execution. Output is JSON; exit status is 0 for success and 1 for failure.

The worker checks empty, singleton, unsorted, duplicate/negative, sorted and
reversed lists. It checks actual runtime signature and integer-list results.
Import-time and function-call exceptions are reported as `runtime_error`;
wrong output is `incorrect_result`. A 2-second timeout includes code loading and
all smoke cases. On timeout the direct child is killed and reaped.
Child stdout/stderr are discarded so prints do not corrupt the result protocol.

## Limits

**This is not a sandbox and is not suitable for public execution of untrusted
code.** The child retains the local user's filesystem, network and OS privileges.
Isolated Python flags, a temporary working directory and a reduced environment
are hygiene measures, not a security boundary. There are no memory/CPU quotas,
and timeout handling does not guarantee termination of spawned descendants.
Use `--run-local` only with code you own and trust.

Passing static validation proves only the checked declaration and syntax; later
rebinding or top-level side effects are possible. Passing the finite smoke cases
does not prove general correctness. Hostile code can tamper with the worker or
exit status. Public execution requires a separately designed and hardened
sandbox (for example Docker with resource, filesystem and network restrictions).
No such sandbox is included here.

## Verification

On 2026-09-25, all 60 backend tests passed, including 16 new tests covering
static validation, strict API requests, real subprocess results, real infinite
loops at import and call time, and CLI opt-in/error behavior. Existing four
frontend tests, lint, production build, Django checks and migration dry-run passed.
Browser checks covered valid source, syntax error with position, missing solve
and a disabled submit button above the byte limit; no browser console errors
were observed. Direct CLI checks also confirmed valid execution (exit 0) and an
infinite-loop timeout (exit 1 with `timeout`).
See [Testing](TESTING.md) for remaining verification limits.
