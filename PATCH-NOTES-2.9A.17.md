# Parallels X: Clash of Souls — Prototype 2.9A.17

## Chapter 2 announcer quest

- All three Lost Bracket cards now have visible yellow world markers and physical card props.
- Wade’s card clearly marks the Tournament Fan instead of hiding inside an ordinary NPC interaction.
- Bark’s roof card and the moving maintenance-cart card now use the same main-objective color.
- The HUD lists every remaining card source and returns the marker to the announcer only after all three are recovered.
- Duplicate or invalid saved card IDs are removed safely, while old completed saves restore all three valid cards.

## Sage hub sprite

- Sage is now loaded through the same hub sprite-actor pipeline as Bark and Wade.
- The block-built Sage fallback is suppressed while his atlas loads.
- Sage uses the supplied 36-frame production atlas in the Chapter 2 hub.

## Website icon

- Added the supplied Parallels X “X” artwork as the browser-tab icon.
- Added 180px, 192px, and 512px versions for Apple home screens and installable web apps.
- Added a GitHub Pages-safe web manifest with repository-relative icon paths.

## Preserved progression

- Chapters 1–3 remain the only released chapters and still count as 50% of Rrvvfo’s planned route.
- Classic VS CPU, 2 Player, and Arena remain hidden until all six chapters are completed.
- Chapter 3, controller, mobile, camera, combat, and sprite systems remain unchanged except for the shared cache/version update.

## Build

- Build: `Prototype 2.9A.17 — Chapter 1–3 Repair`
- Cache ID: `29a17-chapter123-repair-icon-20260729`
- Save export schema: `261`
- Touch-layout schema: `4`
