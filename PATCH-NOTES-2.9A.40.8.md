# Prototype 2.9A.40.8 — Final Legacy QoL Update

Cumulative build. Save schema stays **268**. Chapter 5 is untouched.

## Release hygiene
- One cache ID (`29a408-final-qol-20260817`) is now used for every file. The previous build mixed two IDs (the keyboard-fix commit used its own), which could serve stale files on GitHub Pages and Safari.
- The smoke runner's expected build/title were refreshed. The suite is now 488 tests (482 existing + 6 new).

## New QoL
- **Keyboard remapping (Player 1):** Settings → Controls → Keyboard Bindings. Click an action, press a key. Binding a key that is already in use swaps the two actions. Esc, Tab, Enter, P, Y, H, Backspace, 1–5 and Player 2's keys are reserved. Combo prompts, the Controls panel and move lists follow the live bindings. Space still jumps. Hub-chapter prompts that are hard-coded to E/Enter/A/D/Space (interact, some QTEs) are unchanged.
- **Autosave backups + indicator:** a rolling two-slot backup of progress is written when progress changes (at most every 15 s, and when the tab is hidden or closed). A small "AUTOSAVED" indicator confirms it. Settings → Gameplay → Autosave Backups turns it off; Settings → Save Data → Restore Autosave Backup recovers it (falls back to the older slot if the newest is damaged). The backup is local-only and is not part of save exports.
- **Colorblind modes:** Settings → Accessibility → Colorblind Mode (Deuteranopia, Protanopia, Tritanopia). Uses a daltonization filter over the whole page, including the canvas.
- **Skip seen scenes:** conversations of 3+ lines with no choices that you have already read show a "SKIP SEEN SCENE (TAB)" button; Tab, Esc (no confirm) and gamepad Y/Triangle also skip. Unskippable cutscenes stay unskippable. Toggle: Settings → Gameplay.

## UI — Dojo-Forge identity
Clash of Souls' navy/fire/energy palette plus Season 1 motifs taken from the script: pink Asrylyte energy, shards, and the Elemental Ninja trio. Purely additive (colors and thin accents): forge-to-Asrylyte accent line on every panel, shard markers on headings and the start prompt, gradient subtitle, Asrylyte focus ring. New tagline: "Train at Tangai's dojo. Chase the shards. Win the Clash."

## Dialogue — Season 1 voice pass (16 lines)
- Wade: excitable ALL-CAPS bursts, snacks and candy-brain.
- Bark: dry, exasperated, still holding the group together.
- Rrvvfo: "Elemental Ninja" identity and the rent/landlord running gag.
- Sage: "the greatest Sage" bravado.
No plot beats, choices or quest logic changed.

## Not covered
- The live game page could not be loaded in the automated in-app browser used for this pass (it froze the pane while a JS-free copy of the same page rendered fine). Please play-test on desktop and phone before publishing.
