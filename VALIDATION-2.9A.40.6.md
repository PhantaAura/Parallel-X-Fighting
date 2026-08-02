# Validation — Prototype 2.9A.40.6

## Browser smoke suite

**461 / 461 PASS** in headless Chromium using the same intercepted `https://px.test/` set-document-content harness used by recent builds.

New coverage includes:
- Connected-world v3 migration.
- Field-skill-gated revisit opportunities.
- One-time revisit rewards / anti-farming behavior.
- Post-clear fast-travel node gating and persistence.
- Fast-travel arrival world-state updates.
- Story route revisit journal integration.
- Tournament post-clear Rooftop Challenger.
- Echo post-clear Vibration Sense shrine secret.
- Release/cache/save-schema synchronization.

## Static validation

- **97 / 97** game JavaScript modules parse.
- **2 / 2** smoke-test JavaScript modules parse.
- **307 / 307** relative imports resolve.
- **259 / 259** HTML IDs are unique.
- **57 / 57** JSON/manifest files parse after the 40.6 manifest is included.
- Save schema remains **268**.
- Chapter 5 is untouched.
