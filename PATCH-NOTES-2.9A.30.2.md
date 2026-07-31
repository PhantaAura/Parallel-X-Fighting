# Prototype 2.9A.30.2 — Smoke Runner Recovery

## Fixed

- The smoke page no longer waits for the entire suite before showing output.
- Every test prints PASS or FAIL immediately with current progress and elapsed time.
- Individual tests and file requests have bounded timeouts so one stalled operation cannot leave the suite on `Running…` for hours.
- Module startup failures, script errors, and unhandled promise rejections display a visible fatal diagnostic.
- A no-progress watchdog reports the current and last completed tests.
- Mixed active build/cache files produce a GitHub Pages or Safari cache warning.
- Retry Failed Tests, Run Again, and Copy Results controls are available.

## Compatibility

- No gameplay or Story changes.
- Combat balance is unchanged.
- Save schema remains 268.
- 298 smoke cases are packaged.
