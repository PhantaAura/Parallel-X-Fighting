# Prototype 2.9A.40.7.2R — Complete Chapter 1 Adventure Rebuild + Mobile Playtest Lab

Recovery base: Prototype 2.9A.40.7.1 — Chapter 3 Sabotage Investigation Rewrite.
The interrupted 2.9A.40.7.2 files are not used as a runtime base.
Save schema remains 268. Chapter 5 is untouched.

## Complete Chapter 1 rebuild
- Physical three-way route junction: north Forest, center Main, south Cliff.
- Object Swap river landing is moved before the commitment line so Main Road is not auto-selected.
- Main Road: controlled Fire Blast, four-beat work-lane weave, road crest.
- Forest Trail: four sequential blue-bell navigation beats.
- Cliff Pass: five sequential airborne ledges.
- Route rejoin cannot be crossed until the chosen route gameplay is completed.
- Guidance escalation: environmental read first, contextual hint at 18s, explicit tool/control hint at 36s.
- Transport rescue is two-sided: wheel swap strands Rrvvfo, then a second return-anchor swap is required.
- Final roadblock supports direct Lens of Truth or a longer southern detour.
- Southern detour persists as World Delight `c1-road-detour` and `chapter1RoadDetour` Story state.
- Shots of Agony remains unavailable while unlearned.
- Story-only Fire Blast focus while Shots is locked: 22 Energy, 1.05s cooldown, 15 damage, 500 speed, 25 radius, 9 guard damage, 1.3 clash power.

## Mobile Developer Playtest Lab
- Existing Konami-code developer room remains.
- Settings displays the build version; tap it seven times to unlock developer tools for the current session.
- Existing secret room gains an Open Mobile Playtest Lab button.
- One-click QA validates recovery wiring without changing Story progress.
- Human telemetry records objective timing, dialogue, fights, ranks, damage, background pauses, reliability warnings, and approximate arena usage.
- Chapter 1–4 temporary playtest jumps reuse the existing developer pathway.
- Copy Report is the primary phone workflow; JSON export is also available.

## Important testing rule
Automated QA can detect broken flow and suspicious timings. It cannot prove that Chapter 1 is fun. Use the Human Pacing Playtest and paste the copied report back into ChatGPT for design analysis.
