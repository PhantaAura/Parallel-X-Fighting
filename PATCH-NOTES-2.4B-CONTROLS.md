# Prototype 2.4B — Control Layout Checkpoint 2

This checkpoint keeps the WebGL Tangai Dojo, depth combat, and five-slot hotbar, then rebuilds the player-facing controls for desktop, controller, and mobile.

## PC layouts

- **Two-Hand Ergonomic** is the new default: WASD movement, Space jump, Shift block, J light, K heavy, I launcher, and L dash.
- **Classic** remains available: WASD movement, Space jump, Shift block, F light, R heavy, T launcher, and Q dash.
- A live control guide updates when the keyboard or controller becomes the active input.
- Number keys 1–5 continue to activate the ability hotbar.
- Control preferences are saved under `pxArenaControlsV1` and do not alter combat timing or balance.

## Controller layout

- Left Stick: movement.
- A: jump.
- X: light.
- Y: heavy.
- Up + Y: launcher.
- RB: dash.
- LB: block.
- D-Pad Left/Right: choose a hotbar slot.
- RT: activate the selected ability.
- The selected ability receives a visible focus ring.

## Mobile layout

- Fixed analog joystick on one side and a six-button combat cluster on the other.
- Dedicated Light, Heavy, Jump, Dash, Launcher, and hold-to-Block buttons.
- Full multitouch support so movement, blocking, attacks, and hotbar taps can overlap.
- The five-slot hotbar remains at bottom center without covering the joystick or action cluster.
- Right-handed and left-handed layouts.
- Compact, Standard, and Large Button presets.
- Adjustable control opacity and optional action labels.
- Touch visibility can be Auto, Always On, or Off.
- Safe-area insets protect controls from notches and browser edges.
- Portrait mode displays a landscape recommendation.

## Control settings

Open **Controls** from the bottom-right desktop controls or the mobile gear button. Changes save immediately. Restore Defaults returns to Two-Hand Ergonomic PC controls and the Standard right-handed mobile layout.

## Preserved

- WebGL 3D Tangai Dojo.
- X/Y/Z hit volumes and soft lock-on.
- Existing combo, guard, projectile, CPU, and hotbar balance.
- Classic Battle remains unchanged.


## Checkpoint 2.1 — Mouse and Shift refinement

- Shift is now Dash in every PC preset.
- Two-Hand preset uses L for keyboard Block.
- Classic attack preset uses Q for keyboard Block.
- Left mouse click can be configured as Light or Heavy.
- Right mouse click holds Block while the pointer is over the arena.
- Mouse input is captured only by the arena canvas, so menu and hotbar clicks never cause accidental attacks.
