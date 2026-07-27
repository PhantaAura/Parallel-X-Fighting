# Prototype 2.5C1 — Story Select + Battle Dialogue Hotfix

## Fixed

- The Lost Year screen no longer stops after rendering only the title and feature chips.
- The story screen now rebuilds stale/older DOM safely and renders all eight route cards every time it opens.
- Route, mission, briefing, and return navigation now use explicit hidden states instead of relying on overlapping global CSS classes.
- Added an on-screen error panel if story rendering ever fails again.

## Dialogue presentation

Mission 0 now uses an original handheld battle-RPG presentation inspired by the supplied reference:

- Large white dialogue box with a heavy black outline.
- Character name tab.
- Existing Rrvvfo/Sage sprite portraits.
- Typewriter text.
- Animated blue advance arrow.
- Click, Enter, or Space to reveal/advance dialogue.
- Arena HUD and hotbar fade away during cutscenes, leaving both fighters visible in the field.

No new artwork was generated. The approved Sage atlas and existing Rrvvfo atlas are used.
