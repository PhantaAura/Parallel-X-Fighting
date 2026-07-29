# Prototype 2.9A.7 — Chapter Controls Hotfix

This hotfix corrects the control-source mistake in 2.9A.6. The Chapter 1–3 control scheme is the official shared scheme. The older classic 2D profile is not the source of truth.

## Restored mouse combat

- **Mouse 1 / left click** performs the configured primary attack and defaults to Light Attack.
- **Mouse 2 / right click** holds Block.
- Mouse combat now works in VS CPU, Local play for Player 1, Training, Arena, and Story Chapters 1–3.
- Mouse actions enter the same semantic `InputManager` used by keyboard, controller, and touch instead of being handled only inside Arena.
- Releasing Mouse 2 reliably releases Block, including after pausing or leaving a match.

## Chapter controls everywhere

Player 1 uses:

- WASD — movement and depth
- Space — jump
- Mouse 1 or J — light / primary attack
- K — heavy
- I — launcher
- Mouse 2 or L — block
- Shift — dash
- U — special in 2D / grab in Arena
- C — combo breaker in 2D / charge in Arena
- O — ultimate or selected ability
- E — counter
- Z — Lens
- 1–5 — Arena abilities

The controls screen, Story tutorial prompts, Training route prompts, Arena help, README, and static in-match guide now use this same language.

## Prompt repair

- Story no longer converts mouse input back into generic keyboard prompts.
- When the player uses the mouse, tutorial steps show **M1** for the primary attack and **M2** for Block.
- If the player changes the primary-click option to Heavy, prompts keep Light on J and show Heavy on M1.

## Validation

- All JavaScript files pass `node --check`.
- Mouse semantic input passed direct runtime tests for press, hold, release, and labels.
- The smoke suite now contains a regression check for shared M1 attack and M2 Block.
- ZIP integrity is checked before release.
