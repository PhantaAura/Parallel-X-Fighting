# Prototype 2.5C3 — Mission 0 Sprite + HUD Hotfix

## Fixed

- The right-side battle HUD now reads **THE SAGE** during Rrvvfo Mission 0 instead of incorrectly retaining **REVVFO**.
- HUD fighter names now update from the actual fighters in the match, so future story opponents will not inherit stale arena names.
- Removed the enclosed white source-sheet background between Rrvvfo's legs in his four fighting-stance frames.
- Removed the imported stance-floor highlight between Rrvvfo's feet.
- Sage combat animations now use a safe full-body frame map. Cropped front-edge poses are excluded from Mission 0 movement, dodging, and attacks.
- Added manifest cache-busting so Safari loads the corrected sprite maps instead of cached 2.5C2 data.

## Unchanged

- Mission 0 dialogue, objectives, auto-dodge behavior, and Shots of Agony progression.
- Sonic Battle-inspired movement.
- Story saving and route selection.
- Sage remains a story-only mentor opponent.
