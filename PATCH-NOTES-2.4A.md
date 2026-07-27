# Prototype 2.4A — WebGL Arena Foundation, Hotbar Restoration

This patch keeps the WebGL 3D Tangai Dojo and restores the five-slot Rrvvfo ability hotbar that was accidentally removed when Arena Battle was separated from Classic Battle.

## Restored hotbar

- Bottom-center five-slot hotbar matching the Prototype 2.3.5 layout.
- Keyboard shortcuts 1–5.
- Click/tap activation.
- Energy costs, cooldown fills, READY/ACTIVE states, and unavailable feedback.
- Player and CPU energy bars in the arena HUD.
- Responsive sizing so the hotbar remains visible on smaller screens.

## Arena ability foundations

1. Fire Blast — 28 Energy; world-space fire projectile.
2. Shots of Agony — 40 Energy; exactly four clones appear around the opponent, then fire together. Energy regeneration pauses while the volley remains active, and the five-second cooldown begins when the clones fire.
3. Object Swap — 20 Energy; 3D reposition with disappearance/reappearance effects.
4. Lens of Truth — 90 Energy and 50 HP with a 1-HP floor; four-second automatic dodge state.
5. Fire Awakening: Solar Weave — 90 Energy; large world-space ultimate projectile.

These are 2.4A arena-foundation versions. Full animation timing, combo routing, clashes, cinematic presentation, and exact final balance remain scheduled for later 2.4 checkpoints.

## Preserved

- Native WebGL perspective renderer.
- 3D floor, walls, rails, posts, lanterns, depth buffer, and perspective camera.
- Actual X/Y/Z fighter positions.
- Rrvvfo versus CPU Revvfo.
- Eight-direction movement, jumping, blocking, depth-aware light attacks, health, timer, rounds, K.O., pause, restart, and exit.
- Classic Battle remains untouched.

## Controls

- A / D: horizontal arena movement
- W / S: depth movement
- Space: jump
- F: light attack
- Left or Right Shift: block
- 1–5: ability hotbar
- P: pause
- Escape: main menu
