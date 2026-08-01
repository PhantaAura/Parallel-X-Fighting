# Prototype 2.9A.33 — Boss Dance & Stage Personality

## Goal
Close the highest-value gaps identified against Sonic Battle and Mario & Luigi: Superstar Saga without copying either game or replacing Parallels X's existing combat identity.

## Hollow Watcher boss dance
- Rebuilt the Hollow Watcher around three readable health-based phases: Action Scan, Range Scan, and Route Scan.
- The active scan now explains exactly what the Watcher is learning.
- One named pattern is adapted to at a time instead of the boss appearing generally resistant.
- Repeating the learned pattern reduces damage, but never creates full immunity.
- Changing the learned action, spacing, approach, or timing breaks the read and exposes the Watcher for a short punish window.
- The exposed state increases damage, adds stun, changes the Watcher's visual ring, and clearly calls out `PATTERN BROKEN • WATCHER EXPOSED`.
- Phase changes reset the current read and visibly alter the Watcher's scan presentation.

## Arena stage personality
- Resonance Facility now has two solid relay banks that create center and flank routes.
- Echo Caverns now has three resonance pillars that create curved approaches and projectile cover.
- Mountain Path now has two rock outcrops that bend pursuit routes without enclosing the open stage.
- Tangai Dojo remains an obstacle-free pressure floor.
- The Global Tournament remains a completely clean official ring; no hazards or obstacles were added.
- Stage geometry blocks fighters and projectiles in Arena modes while remaining disabled in Story fights so chapter scripting and hub collision are unchanged.
- Round banners identify each stage's intended combat personality.

## Faster casual fights
- Added Quick Battle to the main-menu continue card after VS CPU is unlocked.
- Quick Battle launches a first-to-one match using the player's last safe fighters, stage, and difficulty.
- Invalid or mirrored saved selections are corrected before launch.
- Open Setup remains available for players who want full configuration.

## Scope boundaries
- No Emerl-style universal move-copy system was added.
- No four-player mode was added.
- No timing prompts were added to every basic attack.
- No Tournament-ring clutter or random hazards were added.
- Story progression and save schema are unchanged.

## Compatibility
- Complete cumulative build; no older package is required.
- Save schema remains 268.
- Browser smoke suite: 322/322 passing.
