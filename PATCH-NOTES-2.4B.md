# Prototype 2.4B — Depth Combat Checkpoint 1

This checkpoint keeps the WebGL Tangai Dojo and restored five-slot hotbar, then rebuilds the basic fight around real arena combat instead of side-view rules placed inside a 3D stage.

## Combat foundation

- Soft lock-on rotates attacks toward the opponent during startup, then locks aim when the active frames begin.
- Every normal and projectile uses world-space X, Y, and Z collision limits.
- Light chain: Light 1 → Light 2 → Light 3.
- Light → Heavy finisher and Light → Launcher buffering.
- Heavy attacks have wider arena coverage, stronger knockback, and knockdown.
- Launchers preserve X/Z momentum while sending the opponent into 3D vertical space.
- Air Light and Air Heavy use separate vertical/depth hit volumes.
- Small attack lunges and limited post-hit combo magnetism improve consistency without pulling across the arena.
- Dash/sidestep movement has a short evasive portion and punishable recovery.

## Defense and impact

- Guard meter added for both fighters.
- Blocking slows/stops attacks but drains guard.
- A short perfect-block window creates attacker disadvantage and reduced guard loss.
- Guard break causes a clear punish window and partial guard restoration.
- Lights, heavies, launchers, blocks, perfect blocks, projectiles, and guard breaks use different synthesized impact cues.
- Hit-stop, directional knockback, camera shake, screen flash, and world-space impact particles scale by attack strength.
- Combo count and damage appear during connected routes.

## Projectiles and CPU

- Fire Blast and Astrylte Blast travel through X/Y/Z space with fixed launch aim, ground shadows, vertical collision, and arena cleanup.
- Projectiles do not curve after launch.
- Revvfo approaches diagonally, checks distance before attacking, blocks pressure, sidesteps incoming projectiles, avoids walls, and uses Astrylte Blast at range.

## Preserved

- Native WebGL 3D Tangai Dojo.
- Rrvvfo five-slot hotbar, including Shots of Agony, Object Swap, Lens of Truth, and Solar Weave.
- Classic Battle remains unchanged.

## Controls

- A / D + W / S: arena movement
- Space: jump
- F: light / air light
- R: heavy / air heavy
- T: launcher
- Q: dash / sidestep
- Shift: block
- 1–5: ability hotbar
- P: pause
- Escape: main menu
