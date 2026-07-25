# Parallels X: Clash of Souls — Prototype 2.0

A single-file browser fighting game based on **Parallels X**.

## Play locally

Open `index.html` in a modern browser.

## Controls

### Player 1
- A / D: Move
- W or Space: Jump
- S: Block
- F: Attack
- G: Special
- H: Ultimate
- Q: Dash

### Player 2
- Arrow keys: Move / Jump / Block
- J: Attack
- K: Special
- L: Ultimate
- O: Dash

Standard gamepads are supported for up to two players.

## Prototype 2.0 additions

- Configurable one-round, best-of-three, and best-of-five matches
- Score tracking between rounds
- Proper match-winning flow and rematches
- Two-player standard gamepad input
- Existing 14-character roster, stages, CPU, story ladder, saves, specials, and ultimates preserved

## Next milestone

Prototype 2.1 will focus on combos, hit counters, stronger AI behavior, character-specific command lists, and improved impact effects.

## Prototype 2.1 — Lens of Truth

Rrvvfo's ultimate now activates **Lens of Truth**:

- Costs 90 energy
- Immediately removes 50 health, representing half of his maximum health
- Cannot reduce him below 1 health when activated
- Blinds the human player for 4 seconds
- Automatically dodges melee attacks, projectiles, specials, and ultimates during that period
- Each dodge teleports Rrvvfo away from the incoming hit

The blindness is applied only when a human-controlled Rrvvfo uses the ability, so a CPU activation does not cover the player's screen.
