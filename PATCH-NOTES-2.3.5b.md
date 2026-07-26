# Prototype 2.3.5b Rival Sprite Reimport

This patch imports the newest Rrvvfo and Revvfo concept sheets into the current
2.3.5a QOL Hotfix build without changing combat balance.

## Rrvvfo

- Rebuilt the atlas from the newer Hood Down sheet.
- Imported the separate full Hood Up sheet.
- Replaced the old repeated Hood Up standing pose with matching alternate frames
  for every animation.
- Re-normalized all frames to 192 × 192 with a consistent `(96, 178)` ground
  pivot.
- Rebuilt Fire Blast, Lens, Object Swap, ultimate, clone, projectile, impact,
  dust, and aura presentation assets.
- Kept Hood Down as the default and both appearances gameplay-identical.

## Revvfo

- Added the first Revvfo runtime sprite atlas using his old dark purple/black
  suit, red spiked hair, matching skin tone, and Astrylte effects.
- Added idle, movement, normals, launcher, air attacks, defense, hurt,
  knockdown, victory, ultimate, Astrylte Blast, teleport rush, dark aura, and
  beam animations.
- Preserved Revvfo's original special routing:
  - ranged Astrylte projectile
  - aerial beam
  - close teleport strike
- Did not copy Fire Blast, Shots of Agony, Object Swap, or Lens of Truth into
  Revvfo.

## Pipeline

- Added `tools/build-fighter-atlases.py` for both supported fighters.
- Added resolution-aware crop scaling for the newer 1448 × 1086 sheets.
- Improved detached label, rule, and neighboring-frame debris cleanup.
- Added per-fighter atlas loading and per-fighter legacy fallback.
- Preserved GitHub Pages-relative asset paths.

## Verification

- JavaScript syntax checks pass for every source and test file.
- Node-compatible regression harness: **183/183 passing**.
- Rrvvfo manifest: **176 frames**, **58 animations**, atlas **1728 × 3840**.
- Revvfo manifest: **88 frames**, **45 animations**, atlas **1728 × 1920**.
- All manifest pivots are normalized and all atlas dimensions remain under the
  runtime safety limit.

## Artwork warning

The imported images are concept sheets rather than hand-cleaned transparent
animation atlases. The game now extracts and normalizes them more reliably, but
frame-to-frame proportions, baked effects, halos, and small generation artifacts
still need manual artist cleanup before these sprites should become the default.
