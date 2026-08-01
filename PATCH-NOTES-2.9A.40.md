# Prototype 2.9A.40 — Core Fun Overhaul

## Goal

Shift Chapters 1–4 away from a repeated `walk → objective → dialogue → fight` rhythm and toward a replayable action-RPG loop: **explore → choose → fight/play → earn something → try a different route/build/mission**.

## Core combat

- Added **Flow Cancel**. After a connected melee hit, Rrvvfo can spend **8 Energy** during a short window to dash-cancel recovery and choose a new route, reposition, or continue pressure.
- Flow Cancel uses existing Dash input and does not add a fighting-game command list.
- Existing S/A/B/C/D/E fight ranks, pursuit, wall splat, ground bounce, parry, guard break, and fighter-identity systems remain intact.

## Rrvvfo Build Lab

Extras now includes **RRVVFO BUILD LAB**.

Three launch presets are included:

- **Balanced** — Fire Blast, Shots of Agony, Object Swap, Lens of Truth; Hot Start + Parry Spark.
- **Fire Pressure** — Fire Blast, Shots of Agony, Solar Weave, Lens of Truth; Fire Focus + Pursuit Battery.
- **Improviser** — Fire Blast, Object Swap, Lens of Truth, Solar Weave; Swap Economy + Parry Spark.

Each preset contains exactly **4 techniques + 2 passives**. Normal Arena/Story combat uses the saved build. Scripted Story tutorials and traversal beats temporarily keep the canonical ability order so a build can never remove a required Object Swap/Lens/Shots prompt.

## Enemy archetypes

Six tactical jobs now support more varied encounters:

- **Rushdown** — closes distance quickly.
- **Guard** — blocks often and rewards grabs/guard breaks.
- **Ranged** — backs away and pressures from distance.
- **Heavy** — slower, tougher, higher-impact opponent.
- **Trickster** — changes spacing and avoids repeated approaches.
- **Support** — helps allies and becomes a priority target in squad fights.

Chapter 2 tournament opponents and Chapter 4 squad encounters use these roles.

## Chapter gameplay identities

### Chapter 1 — Movement Adventure

- Platforming + route choice is the main identity.
- The optional Cliff Route now has three real jump-gap checks instead of only being labeled the dangerous route.
- Object Swap traversal/rescue remains part of the road journey.
- The High Road Run and Swap Rescue become optional Adventure Mission goals.

### Chapter 2 — Tournament Marathon

- Back-to-back tournament fighting is emphasized.
- Hamual, Daniel, Wade, and Plouke use different tactical archetypes.
- Three In A Row rewards a tournament win streak.
- Ring Master rewards an A/S performance in tournament combat.

### Chapter 3 — Investigation & Infiltration

- Progress rewards observation and deduction rather than adding more mandatory battles.
- Clean Entry rewards reaching the facility with the full evidence set.
- No False Leads rewards reconstructing the incident without an ordering mistake.

### Chapter 4 — Party Journey

- Echo Village defense is now a **3v3 squad encounter**.
- An optional Project Hollow swarm becomes a **3v2 squad encounter**.
- Bark has his own HP and **Anchor** role; Wade has his own HP and **Interceptor** role.
- Both allies can be knocked down.
- Team commands remain available.
- Non-selected enemy bodies stay active through squad AI while the selected enemy receives full Arena-fighter simulation.
- Support enemies can heal allies; Heavy/Guard/Ranged/Trickster/Rushdown roles create different target priorities.
- Keyboard players can cycle living targets with **Tab**. Other input styles still auto-promote a new target when the current target falls.
- Keeping Bark and Wade standing through the village defense completes **Squad Control**.
- The later solo mountain route is unchanged so losing the party still creates a deliberate mechanical contrast.

## Adventure Missions

Eight short optional goals launch with the framework, two per released chapter. They reuse existing chapter play instead of creating mandatory checklist chores.

- Ch1: High Road Run, Swap Rescue
- Ch2: Three In A Row, Ring Master
- Ch3: Clean Entry, No False Leads
- Ch4: Squad Control, Solo Summit

First completion/reward state persists and cannot be farmed by repeating the same mission.

## Chapter 4 ending hardening included

All 2.9A.39.2 changes are cumulative here:

- Lookout landing camera beat
- Elevated platform grounding/clamping
- Subtle entrance guidance
- Wind/height ambience
- Deliberate collapse → fade timing
- No new Shadow dialogue or exposition
- Mandatory pebble → CHARGE → RELEASE → LOCK → OBJECT SWAP preserved

## Saves

- Added `pxRrvvfoBuildV1`.
- Added `pxAdventureProgressV1`.
- Both are included in safe save export/import.
- Save schema remains **268**.
