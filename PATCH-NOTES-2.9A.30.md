# Prototype 2.9A.30 — Arena Identity & Focus Recovery

## Arena identity

- Expanded Arena Select to five playable stages with size, boundary, archetype, tags, recommended playstyle, description, and dimensions.
- Defined distinct roles for Tangai Dojo, Global Tournament, Resonance Facility, Echo Caverns, and Mountain Path.
- Added stage-aware boundary lighting and location-specific wall-splat colors and debris.
- Kept decorative geometry separate from gameplay bounds.
- Preserved stage-driven camera, projectile cleanup, AI wall avoidance, and ring-out rules.

## Global Tournament

- Preserved a clean, flat official ring with no crates, cover, platforms, or random hazards.
- Added clearer perimeter feedback during edge pressure.
- Added crowd and announcer-style reactions for strong edge hits and ring-outs.
- Kept wall splats disabled while tournament ring-out rules are active.

## Focus Recovery

- Hold Block + Charge while stationary to begin recovery.
- Startup: 0.6 seconds.
- Healing rate: 5 HP per second.
- Cost: 2 Energy per HP.
- Recoverable-health cap: 20% of maximum HP.
- Only the visible gray health segment can be restored.
- The fighter cannot guard while recovering, any clean hit interrupts the channel, and releasing it creates 0.3 seconds of recovery.
- Strong hits reduce previously banked gray health before adding new recoverable damage.
- Recovery, audio, HUD, and temporary state clear on resets, round transitions, and match exits.

## CPU, Training, and mobile

- CPU fighters consider stage size, distance, incoming attacks, edge danger, and opponent approach before attempting recovery.
- Training adds a Focus Recovery trial and dummy options for Never Recover, Recover When Safe, Recover at Low Health, and Always Attempt.
- Recovery dummy practice seeds visible gray health so the behavior can be tested immediately.
- Health bars show a gray recoverable segment and an active recovery outline.
- The compact recovery cue respects mobile safe areas and does not replace health, Energy, or the ability row.

## Compatibility

- Save schema remains 268.
- Chapters 1–4, pursuit balance, 15-Energy Pursuit Tech, and existing combat damage are unchanged.
- This build intentionally does not add damaging hazards, full multi-level arenas, or tournament obstacles.
