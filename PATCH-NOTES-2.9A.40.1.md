# Prototype 2.9A.40.1 — Builds & Combat Readability

A cumulative follow-up to the Core Fun Overhaul. No previous ZIP is required.

## Build Lab is no longer exiled to Extras
- Chapters 1–4 expose **RRVVFO BUILD** from their Story pause/menu flow.
- Builds can be changed during normal exploration.
- Active fights, Chapter 4 QTEs, and scripted technique sequences keep the build locked so loadout switching cannot trivialize an encounter or break required Story inputs.
- Story-required traversal/tutorial techniques still use the existing canonical-slot safeguard.

## Fourth build: Custom
- **CUSTOM** joins Balanced, Fire Pressure, and Improviser.
- Pick any four valid Rrvvfo techniques and two passives.
- Duplicate/invalid slot data is normalized safely.
- Custom choices persist through the existing `pxRrvvfoBuildV1` save key; save schema remains 268.

## Enemy readability
- All six archetypes have a role icon.
- Heavy/Guard/Ranged/Trickster/Support fallback bodies use different proportions instead of only different colors.
- Chapter 2 opponents show a compact **OPPONENT STYLE** card on first engagement.
- Chapter 4 squad role HUD also exposes the current archetype icon and description.

## Support counterplay
- Support enemies visibly wind up their heal for 0.9 seconds.
- Damaging the Support during the cast cancels the heal and applies a short cooldown.
- Successful casts still heal an injured teammate by 10 HP.

## Squad target controls
- Keyboard: **Tab** or Interact cycles living squad targets.
- Controller: the shared Interact action cycles squad targets.
- Touch: the Interact control becomes a visible **TARGET** button during 3v3/3v2 fights.
- Auto-promotion after a KO remains as fallback behavior.

## Chapter identity presentation
The internal chapter-gimmick metadata is no longer the only expression of chapter identity. Chapter-start cards use player-facing hooks:
- Ch1: **THE ROAD OPENS UP**
- Ch2: **ENTER THE BRACKET**
- Ch3: **SOMETHING DOESN'T ADD UP**
- Ch4: **THREE NINJAS, ONE JOURNEY**

## Flow Cancel teaching
Chapter 1's optional road fight now surfaces an **OPENING! DASH NOW TO FLOW CANCEL** prompt when a connected melee hit creates a cancel window. Performing it once records **FLOW CANCEL LEARNED** rather than expecting the player to discover the mechanic from patch notes.

## Adventure Mission result language
The eight launch missions keep their different chapter identities instead of all being forced into the combat rank ladder:
- Combat/platform performance can show an S–E rank.
- Streak missions show **STREAK CLEAR**.
- Perfect investigation shows **PERFECT**.
- Quality objectives can show **CLEAN** or **PERFECT**.
- Straight exploration/survival discoveries simply show **COMPLETE**.

## Compatibility
- Save schema: **268**
- Chapter 5: not added or modified.
- Chapter 4's floating-lookout ending and mandatory pebble → Charge → Release → Lock → Object Swap sequence are unchanged.
