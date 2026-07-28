# Prototype 2.6.5 — Compatible Sprite-on-Top Dialogue

This patch merges the uploaded `px-dialogue-system` visual design into the
current game without replacing the Mission 1 API.

## Preserved 1-to-1 visual elements

- Character sprite sitting above the box
- White angular dialogue panel
- Thick black border and offset shadow
- Colored speaker name tag
- Typewriter cursor
- `Press A` prompt styling
- Angular choice buttons and selection marker
- Sprite bounce when the speaker changes

## Compatibility work

- Keeps `SonicBattleDialogue`, which Mission 1 already imports
- Also exports `PXDialogue` for future missions
- Keeps `overlay`, `_onKey`, `portraitEl`, `show()`, `close()`, and `destroy()`
- Uses z-index 2200 so dialogue stays above the arena
- Supports mouse, touch, keyboard, and controller A-button input
- Prevents duplicate completion callbacks and duplicate input listeners
- Accepts both old fields (`portrait`, `speakerClass: p1`, `tail`) and new fields
  (`sprite`, `speakerClass: rrvvfo`)
- Uses existing Rrvvfo and Sage fighter atlases as dialogue sprites; no images
  are generated or added
- Refreshes the full browser module/cache chain
