# Prototype 2.5B — Battle Movement Test

This checkpoint changes the arena movement model to a fast isometric arena-brawler style inspired by Sonic Battle while keeping Parallels X combat, abilities, arenas, and controls intact.

## Movement changes

- Free eight-direction movement now accelerates instead of instantly snapping to full speed.
- Holding a direction builds from a short walk into a faster run.
- Releasing movement preserves a small amount of momentum before braking.
- Sharp direction reversals slow the fighter briefly instead of allowing instant 180-degree turns at full speed.
- Fighters face their travel direction while moving and turn back toward the opponent when idle or attacking.
- Air movement keeps forward momentum with reduced steering instead of dropping to a fixed slow speed.
- Run animation speed now follows actual movement speed.

## Dash changes

- Dash is shorter, faster, and recovers sooner.
- Shift still dashes on keyboard.
- Double-tapping a WASD direction also dashes.
- Quickly flicking the controller stick or mobile joystick triggers a dash.
- Dash can cancel into jump, Light, Heavy, or Launcher after the opening portion of the burst.
- A completed dash carries some running momentum into the next movement.

## Preserved systems

- Lost Year story-select foundation
- Enlarged Global Tournament
- Tangai Dojo
- Fighter visibility overlay
- Lens blindness and auto-dodge
- Five-slot hotbar
- Keyboard, mouse, controller, and mobile layouts
- Current combat, blocking, projectiles, AI, and stage pipeline

## Testing focus

This is intentionally a movement-feel test. Check:

1. Starting, stopping, and reversing direction.
2. Running diagonally without gaining extra speed.
3. Double-tap dash and Shift dash.
4. Dash-to-jump and dash-to-attack transitions.
5. Joystick low tilt for walking and full tilt for running.
6. Movement at the edges of both arenas.

No visual browser run was available in the build environment. JavaScript syntax checks passed for every modified file.
