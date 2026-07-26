# Prototype 2.5C6 — Animated Sage Clipping Fix

This patch corrects the previous single-frame workaround.

## Fixed

- Restored a real multi-frame Sage animation set.
- Curated 12 complete Sage poses: 4 idle, 4 fighting-stance, and 4 run/dodge frames.
- Repacked every pose into a larger padded 256 × 256 cell so limbs cannot be cut by a frame boundary.
- Aligned every frame to the same ground pivot to stop vertical and horizontal popping.
- Added a brief frame crossfade for the Sage to soften harsh snapping between generated poses.
- Removed the obvious white sheet-background wedges between his legs.
- Preserved the white Sage health bar and high-resolution fighter canvas.
- Kept Mission 0 gameplay, auto-dodging, dialogue, and Shots of Agony progression unchanged.

## Important

The Sage remains story-only. This patch does not add him to the selectable roster.
