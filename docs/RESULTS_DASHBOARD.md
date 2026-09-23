# Results dashboard — Issue #20

The benchmark form opens results inline after each attempt. The table retains the
latest 20 attempts in memory, with input type/size/seed, implementation, run count,
correctness and median/min/max sorting time in milliseconds. Refreshing the page
clears this history; Clear results resets it without sending a backend request.

The chart shares a linear, zero-based scale across measured rows. Blue bars show
median and black lines show min–max. Failed requests have no invented timings.
Incorrect sorting remains explicitly labelled in both the table and chart.
Compare identical configurations in the same environment; no winner is declared.
The range is observed min–max, not a confidence interval.

Only the existing trusted Bubble Sort Python endpoint is executable. There is no
experiment execution/results endpoint yet, and no multi-implementation comparison
or persistent results history. PR #31 was integrated into dev after PR #30.

Requests have a 30-second client response deadline. A timeout is shown separately
from a network/HTTP error, preserves earlier rows and enables retry. Aborting the
client request does not guarantee the server has stopped computing. Unmount aborts
the active request and suppresses late state updates.

## Verification

- `npm test`: four rendering tests (Node 22.15+ with module registerHooks;
  verified on Node 26.3.1). Covers empty/loading, ns-to-ms conversion, common chart
  scale, error/timeout without metrics, incorrect sorting and zero durations.
- `npm run lint` and `npm run build`.
- Backend regression: from backend, `.venv/Scripts/python.exe manage.py test core`.
- Browser: offline request produced an error row; starting the real backend then
  retrying appended successful metrics while retaining the earlier error row.
- The actual 30-second timeout and unmount race have not been exercised end-to-end;
  timeout rendering is covered with a fixture.

## Manual scenarios

1. Run default random/100/42 twice; check two rows and common-scale chart.
2. Change input; earlier rows retain their original configuration.
3. Stop backend and run; error row has dashes for metrics, retry remains possible.
4. Restore backend and retry; prior rows remain.
5. Clear results; empty guidance appears. Reload also clears session history.
6. At narrow widths, scroll the table horizontally; chart rows stack vertically.
