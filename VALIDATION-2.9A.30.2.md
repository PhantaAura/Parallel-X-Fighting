# Validation — Prototype 2.9A.30.2

## Build

- Build label: `Prototype 2.9A.30.2 — Smoke Runner Recovery`
- Release cache: `29a302-smoke-runner-recovery-20260731`
- Save schema: `268`
- Base: `Prototype 2.9A.30.1 — Stability & Interface Cleanup`

## Validation coverage

- 85 JavaScript files passed `node --check`.
- 19 JSON and web-manifest files parsed successfully.
- 221 relative ES-module references were checked with no missing targets.
- 24 local `src`/`href` references from `index.html` and `tests/smoke.html` were checked with no missing targets.
- Both active HTML pages use one release cache ID.
- Targeted source assertions passed for streaming progress, current/last-test reporting, 30-second test timeout, 12-second request timeout, 30-second module-import timeout, 35-second no-progress watchdog, mixed-build verification, rerun controls, and copyable results.
- 298 browser smoke cases are packaged.
- ZIP integrity and SHA-256 checksum are checked after packaging.

## Browser-suite status

A Chromium attempt did not complete in this container, so the complete 298-case browser result is not claimed here. The repaired deployed page must provide the authoritative browser result.

## Required browser checks

- PASS/FAIL lines appear before the suite completes.
- Progress advances from `0 / 298`.
- Current and last-completed test names update.
- The suite finishes or names the exact timed-out test.
- **Retry Failed Tests**, **Run Again**, and **Copy Results** work.
- A mixed cache/build displays a visible warning.
