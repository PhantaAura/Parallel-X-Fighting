# Validation — Prototype 2.9A.36.1 — Chapter 4 Replay Overlay Fix

## Browser smoke suite
- **344 / 344 passed**
- The new replay regression confirms Chapter 4 completion, choice, and QTE overlays stay hidden until intentionally shown.
- The suite ran in Chromium against the exact packaged files through an intercepted virtual origin.

## Static validation
- **90 / 90** JavaScript modules parse with ECMAScript module grammar.
- **34 / 34** JSON and manifest files parse.
- **247 / 247** relative imports resolve.
- **259** HTML IDs checked with no duplicates.
- Save schema remains **268**.

## Root cause confirmed
The Chapter 4 overlay classes declared `display: grid` in author CSS but had no author-level `[hidden]` override. That overrode the browser's default hidden presentation and displayed the completion panel during replay startup.
