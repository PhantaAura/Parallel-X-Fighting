# Friend Playtest Checklist — Prototype 2.9A.30.2

## Smoke runner

1. Open `tests/smoke.html` in a private browser window.
2. Confirm the page immediately shows the build, cache ID, elapsed time, current test, last completed test, and `0 / 298` progress.
3. Confirm PASS or FAIL lines appear while the suite is still running.
4. Confirm the page finishes instead of remaining on `Running…`.
5. Copy the complete result using **Copy Results**.
6. When failures exist, press **Retry Failed Tests** and confirm only failed checks rerun.
7. Press **Run Again** and confirm the complete suite reruns.
8. If a mixed-build warning appears, fully close Safari/Home Screen mode, reopen privately, and deploy again only after checking the cache ID.

## Expected recovery behavior

- A test or file request that stalls becomes a visible timeout failure instead of freezing the suite.
- A module startup error appears as a FATAL diagnostic.
- More than 35 seconds without progress identifies the current stalled test.
- The most recently completed test remains visible.
