# Prototype 2.9A.29.2 — Combat HUD & Feedback Unification

## Combat HUD

- Added one shared prompt language across Arena notices, pursuit prompts, Story combat callouts, and notifications.
- Added compact icon feedback for Perfect Parry, Guard Break, Pursuit Tech, Wall Splat, Ground Bounce, full Energy, critical health, and ability cooldown completion.
- Added dedicated bar reactions for guard shatter, parry confirmation, Energy spending, full Energy, and critical health.
- The selected ability is visually stronger without making every ready ability glow.
- Secondary Arena HUD elements fade during pursuit, then restore immediately.

## Mobile

- Moved temporary combat feedback into a protected central safe zone.
- Reduced prompt width and text size on phones.
- Temporarily lowers nonessential HUD emphasis during pursuit.
- Preserves the ability row and touch controls without placing prompts over health or Energy.
- Portrait remains a rotation-safe fallback rather than a compressed full combat layout.

## Menus and Training

- Strengthened center-card focus for Mode and Route carousels.
- Improved Settings focus hierarchy and Results emphasis.
- Kept Training counters and pursuit-defense controls readable without moving them into normal matches.

## Compatibility

- Save schema remains 268.
- Chapters 1–4, combat balance, pursuit timings, and Story progression are unchanged.
