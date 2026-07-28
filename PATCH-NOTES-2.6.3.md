# Prototype 2.6.3 — Start Screen Boot Hotfix

This fixes the frozen **PRESS ANY BUTTON** screen in Prototype 2.6.2.

Root causes fixed:

1. `lost-year-story.js` used an unquoted object key containing a hyphen:
   `alt-rover`
2. `sonic-battle-dialogue.js` contained escaped template-literal delimiters that
   were invalid when loaded as a browser ES module.
3. Story and Arena were imported during initial boot, so one Story module error
   prevented the entire game from attaching start-screen controls.

Changes:

- Corrects both ES-module syntax problems.
- Loads Story and Arena lazily only when the player selects those modes.
- Adds a persistent pointer/touch start handler.
- Adds full ES-module graph verification to the installer.
