# Prototype 2.4C — Reusable Arena Pipeline

This checkpoint keeps the existing WebGL Tangai Dojo fight, depth combat, hotbar, and PC/controller/mobile layouts, but removes Tangai-specific stage rules from the combat loop.

## Data-driven stage definition

Tangai Dojo now supplies its own:

- Arena bounds and two spawn points.
- Perspective camera yaw, FOV, zoom range, tracking limits, and smoothing.
- Clear color, fog color, and fog range.
- Floor dimensions, grid spacing, and center markings.
- Boundary rails, posts, and caps.
- Decorative geometry and lamps.
- Projectile cleanup padding and vertical limits.
- Performance metadata.

## Shared systems now read stage data

- Fighter boundary clamping.
- Lens dodge destinations.
- Shots of Agony clone placement.
- Object Swap destinations.
- Projectile cleanup.
- Revvfo AI wall avoidance.
- Round spawn positions.
- Camera behavior.
- WebGL floor, scenery, and boundary rendering.

## Pipeline safety

- Added schema validation for every playable arena.
- Added safe fallback to Tangai Dojo for an unknown arena ID.
- Added reusable stage loading through `startArenaBattle(stageId)`.
- Prevented arena changes during an active match.
- Added a catalog entry for Global Tournament and Asrylyte Zone without falsely presenting either as playable.

## Verification

- JavaScript syntax checks pass for all changed and added modules.
- Stage schema, spawn, boundary-clamp, projectile-cleanup, and AI wall-avoidance checks pass in Node.
- Automated visual WebGL capture was unavailable in this environment, so Tangai Dojo still needs a quick local visual check before committing.
