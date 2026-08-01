# Prototype 2.9A.32 — Hub Charm & Progression Celebration

## Hub charm layer
- Added one shared Story presentation system for destination arrivals, party banter, level-ups, stat boosts, technique reveals, chapter/mode unlocks, route milestones, and future character unlock celebrations.
- Arrival and progression cues use distinct animation, color, and audio language while staying out of combat HUD space.
- Major saved Story checkpoints can trigger one-time reactions without replaying every time a hub state is written.

## Living hubs
- Chapter 2 NPC chatter now reacts to the first brawl, Wade's route, the cracked-ring repair, and tournament progress.
- The tournament adds a short Festival Photo Stand activity with three joke poses and a persistent team-photo display.
- Festival lights and decorations become more active as Chapter 2 progresses.
- Echo Village villagers, banners, beacon energy, lift machinery, and celebration activity react visually to completed Story steps.
- Echo Village adds a short Echo Chime Jam party activity instead of another collection quest.

## Progression celebration
- Story save comparisons now emit reliable deltas for new levels, permanent stat gains, techniques, key items, and completed missions.
- Chapter and mode unlocks receive explicit celebration cards.
- Chapter 4 technique rewards receive dedicated Vibration Sense, Lens Mastery, Echo Team Badge, and Hollow Watcher reveals.
- Chapter 2's existing level-up screen remains authoritative there; the shared system covers silent level gains elsewhere without duplicating it.

## Compatibility
- Complete cumulative build; no older package is required.
- Save export schema remains 268.
- Chapter 4 state normalizer upgrades to internal version 4 and preserves the new Echo Chime activity state.
