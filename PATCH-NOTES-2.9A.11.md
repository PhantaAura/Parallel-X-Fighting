# Parallels X: Clash of Souls — Prototype 2.9A.11

## Bark, Wade & Tournament Pacing

Prototype 2.9A.11 imports Bark and Wade’s approved combat-sheet designs as normalized animation atlases and rebuilds the Chapter 2 bracket around named fighters, playable preparation, and visible tournament progression.

This is a complete cumulative build. No earlier ZIP or patch is required.

## Fighter visuals

- Bark now uses his approved shaggy black hair, `#C37C4D` skin reference, black one-piece suit, and tan accents.
- Wade now uses his blue one-piece suit, yellow accents, and very spiky blond hair.
- Both fighters use Rrvvfo-compatible frame dimensions, pivots, anchors, and animation naming without being recolors.
- Bark and Wade load in Arena, Story battles, and the Chapter 2 hub.
- Their manifests include movement, normals, defense, grabs, damage, defeat, victory, and character-technique animations.
- Wade’s technique coverage includes Lightning Blast, Lightning Dash, Thunderstorm, and Lightning Beam.
- Bark’s technique coverage includes Rock Shot, Rock Armor, Earth Wall, Ground Quake, and Seismic Counter.
- Arena sprite rendering now honors each manifest’s smoothing preference.
- Rrvvfo, Bark, and Wade share a fixed ground pivot and frame canvas for consistent placement.

## Tournament sequence

The official Chapter 2 progression is now:

1. Tournament opening ceremony
2. Hailey versus Plouke preliminary
3. Rrvvfo versus Hamual — power and size test
4. Rrvvfo versus Daniel — technical-skill test
5. Bark versus Pouki — phased spectator set piece
6. Rrvvfo versus Wade — speed test
7. Rrvvfo versus Plouke — strategy and endurance final

Hamual is an enormous former champion with extra visual scale, reach presence, and HP. Daniel looks ordinary but fights with disciplined technique. The preliminary establishes Plouke before Rrvvfo enters the bracket; his comedy comes from posing and over-explaining his “study angles,” while Hailey repeatedly forces him to focus on the match.

## Pacing and world-state changes

- The opening ceremony introduces the important contestants and establishes Sage’s continued absence.
- Bark versus Pouki now runs through center control, guard-break pressure, and Bark’s final counter instead of ending after roughly twelve seconds.
- Every Plouke rumor becomes a short playable observation or decision activity.
- Intermissions now describe medical-tent occupants, arena repairs, crowd movement, and updated bracket preparation.
- A quiet preparation-bench scene reviews Plouke’s four patterns, Rrvvfo’s level and HP, the selected meal, and the saved checkpoint before the final.
- Global random chatter was replaced with nearby NPC speech bubbles.

## Gameplay repairs

- Hamual, Daniel, Wade, and Plouke use expected milestone levels with only limited soft scaling when Rrvvfo is severely overleveled.
- The Dummy on the Loose challenge now requires a Perfect Parry, Pursuit, and Grab before the dummy can be defeated.
- Wade’s race now has a 3–2–1 countdown, 24-second target, checkpoint splits, Wade lead text, best-time display, and repeatable rematches.
- The Lost Bracket now mixes dialogue, an upper-walkway card, and a card caught on a moving maintenance cart.
- Each cracked-ring support reveals different evidence: impact direction, footprints, or a discarded wristband.
- District selection now respects authored district radii before falling back to nearest-center detection.
- Strong performance against Plouke changes crowd feedback, reveals his edge trap earlier, affects final dialogue, and can award a performance badge and XP.
- Winning the beam clash still changes the ending moment and awards the larger bonus level.

## Compatibility

- Existing Chapter 2 saves remain compatible.
- Saves already inside the old tournament keep their completed pre-tournament quest migration.
- Story levels and side-quest bonuses still do not alter VS or Training balance.
- Story continues into the Chapter 3 investigation demo after Chapter 2.

## Build identifiers

- Build: `Prototype 2.9A.11 — Bark, Wade & Tournament Pacing`
- Story Engine: `2.9A.11`
- Save export schema: `248`
- Cache ID: `29a11-bark-wade-tournament-pacing-20260729`

## Validation

- All 71 JavaScript files passed `node --check`.
- All current JSON files parsed successfully.
- 175 local JavaScript import references resolved.
- Bark and Wade each passed atlas bounds, animation-frame, and PNG integrity checks.
- The browser smoke suite was updated for 2.9A.11, but could not run in this environment because no Chromium binary was available and the temporary download endpoint was blocked.

A complete real-time Story playthrough, controller test, mobile layout check, and human pacing review are still required.
