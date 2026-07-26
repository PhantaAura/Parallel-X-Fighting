# Prototype 2.4C Lens of Truth Hotfix

## Fixed

- WebGL Arena Battle now displays Rrvvfo's human-player blindness overlay while Lens of Truth is active.
- The overlay remains active for the full four-second Lens duration.
- The final second changes to `WARNING • LENS ENDING` and pulses visibly.
- The remaining Lens duration is shown on the overlay.
- The saved reduced Lens-overlay accessibility preference is respected.
- CPU-controlled Rrvvfo does not blind the human player's screen.
- The blindness layer sits above the 3D arena but below the HUD, hotbar, pause layer, and settings menus.
- Round reset, match exit, and Lens expiration reliably clear the overlay.

## Unchanged gameplay

- Lens still costs 90 Energy and 50 HP with a 1 HP floor.
- Lens still lasts four seconds and preserves its arena auto-dodge behavior.
- No damage, timing, cooldown, movement, or camera values were changed.
