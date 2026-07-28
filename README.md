# Parallels X: Clash of Souls — Prototype 2.9A.2

This is the complete cumulative repository. It includes the full Prototype 2.9A combat overhaul, all Story Mode repairs from 2.9A.1, and the Chapter 2 HUD/Story Menu hotfix in 2.9A.2. No previous patch is required.

See `PATCH-NOTES-2.9A.2.md` for the newest update, `PATCH-NOTES-2.9A.1.md` for the Story repair, and `PATCH-NOTES-2.9A.md` for the combat overhaul. Older notes below are retained as development history.

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



## Prototype 2.9A combat-depth update

- First-to-three KOs now continue without resetting the winner.
- Chapter 2 tournament fights include ring-outs; the scripted Plouke final is protected.
- Wade and Bark have complete arena kits and character-driven AI.
- Arena AI uses reaction delays, spacing, resources, danger checks, and deliberate mistakes instead of instant input reading.
- Timed guard, perfect parry, grabs, charge energy, projectile clashes, physical Earth Walls, and heavy clashes are active.
- Lens of Truth predicts attacks and improves through mastery; full mastery grants two auto-dodges.
- Shots of Agony consumes the full energy meter.

## Prototype 2.8B.3 replay fix

Completed chapters now show a separate **Replay** button. Chapter 2 replay starts from the beginning without replacing the saved completed checkpoint, and the tournament arena is no longer covered by an opaque blue UI layer.


## Prototype 2.8B.4 combat update

Normal fights are now first to three knockouts with automatic respawns, stronger CPU health, no timeout victories, and health-bar scaling for values above 100. The scripted Plouke finale is intentionally exempt so Chapter 2's established ending still plays correctly.
