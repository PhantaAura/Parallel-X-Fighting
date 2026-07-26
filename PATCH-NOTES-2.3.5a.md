# Prototype 2.3.5a QOL Hotfix

This focused patch fixes the highest-impact QOL problems found in the Prototype 2.3.5 review.

## Fixed

- Nintendo menus now use physical **A to confirm** and **B to cancel**.
- Xbox remains **A confirm / B cancel**.
- PlayStation remains **Cross confirm / Circle cancel**.
- Controller setup is remembered separately for Player 1 and Player 2 instead of using one global prompt flag.
- A second unfamiliar controller now receives its own setup prompt.
- **Settings → Controller Assignment & Reconnect** now opens a working device-management panel.
- A controller cannot be assigned to both players at once.
- **Pause → Controls** now opens a dedicated adaptive controls guide instead of the fighter Move List.
- Closing held hotbar move information now resumes the match when that information panel caused the pause, or restores the Pause menu when the match was already paused.

## Verification

- JavaScript syntax checks pass for every source file.
- Browser smoke suite: **179/179 passing** in the Node-compatible regression harness.
- Physical Nintendo/Xbox/PlayStation controller testing was not possible in this environment.
