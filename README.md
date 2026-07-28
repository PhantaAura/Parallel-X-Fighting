# Parallels X: Clash of Souls — Prototype 2.8B.2

This is the complete standalone repository. The latest fix makes Chapter Select restart Chapter 2 from its true opening instead of stopping at the post-tournament “Back at the tournament grounds” scene. Permanent unlocks, Training Level, and Story XP are preserved.

See `README-2.8B.2.md` and `PATCH-NOTES-2.8B.2.md` for the current release details. Older notes below are retained as development history.

---

# Parallels X Prototype 2.6.2 — Parallels Battle Menu Flow

This patch replaces the broad V2 theme with a scoped, consistent menu flow built for Parallels X.

## New flow

1. Start screen
2. Horizontal **Choose Your Mode** bar
3. Story opens **Character / Episode Select**
4. A chosen episode opens **Mission Select**
5. A selected mission opens its briefing and start button

VS CPU, Local 2 Player, and Training still open the fighter-select screen, now restyled to match the same interface family.

## Included fixes

- Main mode menu is horizontal and works with Left/Right or Up/Down.
- Story character/episode cards are horizontal and controller-friendly.
- Mission cards use the same visual language.
- Character select, stage select, settings, and extras are restyled so transitions are less jarring.
- The mode information panel stays visible on mobile instead of disappearing.
- Quick Continue is part of the layout and no longer floats over menu choices.
- Paragraphs, manuals, and descriptions use a readable system font.
- Strong keyboard focus styling is included.
- The broad V2 stylesheet is disconnected so it no longer unexpectedly changes the combat HUD.
- No external font is required for the new menu.

The animated intro is intentionally deferred to a later update.
