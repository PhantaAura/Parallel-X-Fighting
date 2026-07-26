# Prototype 2.4C — Global Tournament Arena

This checkpoint proves the reusable WebGL arena pipeline with a second playable stage.

## Added

- Arena Select screen before Arena Battle.
- Tangai Dojo remains available and unchanged in combat behavior.
- Global Tournament is now playable as a large long-range arena.
- Three tournament-ring ropes, corner posts, raised platform, grandstand structure, crowd blocks, arena lights, and championship backdrop.
- Tournament-specific spawns, bounds, camera angle, zoom range, fog, projectile cleanup limits, and AI wall awareness.
- Change Arena button on the post-match screen.
- Asrylyte Zone appears honestly as the next unavailable effects checkpoint.

## Preserved

- Lens of Truth blindness hotfix and accessibility preference.
- Five-slot hotbar.
- Shift Dash, mouse attack selection, right-click Block, controller layout, and multitouch mobile controls.
- Rrvvfo and Revvfo combat values, guard, projectiles, hit volumes, cooldowns, and AI rules.
- Classic Battle modes.

## Verification

- JavaScript syntax checks pass for every modified file.
- Both playable stage definitions pass arena-schema validation.
- Both stages render valid floor, boundary, and scenery geometry through the shared renderer.
- Spawn clamping and projectile cleanup math pass for both stages.
