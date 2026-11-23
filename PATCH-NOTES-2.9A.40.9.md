# Prototype 2.9A.40.9 — Story Event Reliability

Cumulative Legacy Pages update based on 2.9A.40.8. Save schema remains **268**.

## Wade’s Shortcut
- Moved the five checkpoint triggers out of the market stalls, registration building, clinic, and arena collision volumes and onto the nearby walkable approaches.
- Added swept checkpoint detection so a fast dash or a long frame cannot skip a trigger between updates.
- Count race time only while gameplay is updating; opening another tab or resuming after a phone pause no longer burns the player's time.
- Corrected the live lead display to track the next checkpoint immediately after each pass.

## Story route preparation
- Added an expanded Chapters 5–8 pacing and continuity plan from the supplied roadmap. It keeps Project Hollow as legacy wording for Organization of the Red, spaces the investigation and identity conflict, and saves the longest sustained action for the finale.
- Future chapter gameplay remains in planning; the existing four released chapters and save schema are preserved.

## Deployment
- Bumped the shared cache token to `29a409-wade-race-events-20261122` across the page and loaded modules to prevent GitHub Pages/Safari from mixing old and new code.
