# Parallels X: Clash of Souls

**A 2.5D arena fighter and RPG built around kinetic movement, pursuit combos, parries, character techniques, exploration, side quests, and continuous Story progression.**

Play the GitHub Pages build: <https://phantaaura.github.io/Parallel-X-Fighting/>

## Current build

**Prototype 2.9A.24.2 — Hub Camera Comfort**

This is a complete cumulative build. No older package is required.

## 2.9A.24.2 highlights

- Hub free camera is now optional under **Settings → Gameplay**.
- Mouse and Mac trackpad look requires **clicking and dragging on the 3D world**.
- Pointer movement alone no longer rotates the camera.
- Clicking menus, dialogue, maps, journals, or other UI cannot start camera movement.
- Exploration camera angles remain where the player leaves them instead of recentering after 900 ms.
- Camera sensitivity is adjustable from 40% to 160%.
- Controller right-stick exploration look and fixed fight framing remain supported.

## 2.9A.24 highlights

- One shared Story fight-transition system now handles Chapters 1–4.
- Exploration overlays close before fights and return after combat.
- A pre-fight Story save snapshot is preserved for bug recovery.
- Dialogue uses existing fighter atlases for portraits, expressions, speaker focus, Auto, History, and text-speed controls. No new hand-drawn portraits are required.
- Objectives use one update presentation, play a UI cue, and save the latest objective.
- The Story route screen displays the current auto-save checkpoint.
- Chapter clears now produce ranked results with completion time, optional progress, recent unlocks, and total eight-chapter route progress.
- Combat feedback now includes Perfect Parry, Guard Break, Heavy Impact, and low-health cues.
- Procedural chapter music crossfades and includes distinct ambience accents for the dojo, road, tournament, mystery, facility, Echo Village, caverns, mountain, and Hollow systems.
- The hidden playtest menu opens on the Story screen with **↑ ↑ ↓ ↓ ← → ← → B A** using keyboard or a standard controller.
- The playtest menu can inspect save flags, copy/download a bug report, restart from the current saved checkpoint, reset the current chapter, jump to released chapters, and launch isolated combat tests.
- Prototype 2.9A.23.1 sprite recovery and 2.9A.23.2 combat UI cleanup remain included.

## Story progression

Rrvvfo’s route is planned for **eight chapters**. Four are currently playable, so completing Chapter 4 reports **4/8 — 50%**.

- **Chapter 1:** Shots of Agony training, Sage Manual, combat refresher, and wooded Tournament Road
- **Chapter 2:** martial-arts festival hub, preparation activities, tournament bracket, and Plouke
- **Chapter 3:** after-hours investigation, Resonance Facility, Project Hollow, and teleporter escape
- **Chapter 4:** Echo Village, Bark and Wade team missions, optional Ryuzankaro secret boss, solo mountain route, Hollow Watcher, and the pebble Object Swap into Shadow’s floating lookout
- **Chapters 5–8:** planned but intentionally undescribed until their official story plans exist

## Playable modes

- Rrvvfo Story: Chapters 1–4
- Four standard playable fighters: Rrvvfo, Revvfo, Wade, and Bark
- The Sage as a Story-only mentor and opponent
- Training from the start
- VS CPU after Chapter 1
- Local two-player after Chapter 2
- Arena after Chapter 3
- Keyboard and mouse, Nintendo, Xbox, PlayStation, custom-controller, and touch input

## Main controls

- Move/depth: **W / A / S / D**
- Jump: **Space**
- Light: **Left Click** or **J**
- Heavy: **K**
- Launcher: **I**
- Grab: **U**
- Dash: **Shift**
- Block: **Right Click** or **L**
- Charge: **C**
- Combo Breaker: **R**
- Counter: **Q**
- Interact: **E**
- Activate selected ability: **O**
- Ability slots: **1–5**
- Lens shortcut: **Z**
- Vibration Sense after unlocking: **V** or ability slot 4 while exploring Chapter 4
- Sage Manual: **M**
- Objective tracker: **T**
- Pause/Story menu: **Escape**
- Hub camera: click-and-drag with a mouse/trackpad or controller right stick; can be disabled under Settings → Gameplay

## Secret playtest menu

On the Story route screen, enter:

```text
↑ ↑ ↓ ↓ ← → ← → B A
```

On a standard controller, use the D-pad followed by the controller’s B and A buttons. Chapter jumps and isolated combat tests are intentionally blocked while an active chapter is running, preventing the debug menu from corrupting a live Story session.

## Save compatibility

Save-export schema: **266**. Existing Story saves continue through the current state normalizers.

## Testing

Use [`FRIEND-PLAYTEST-CHECKLIST-2.9A.24.2.md`](FRIEND-PLAYTEST-CHECKLIST-2.9A.24.2.md) for the real-device pass. See [`PATCH-NOTES-2.9A.24.2.md`](PATCH-NOTES-2.9A.24.2.md) and [`VALIDATION-2.9A.24.2.md`](VALIDATION-2.9A.24.2.md) for release details.


## 2.9A.24.1 Chapter 3 addition
The Strange Man now interrupts Rrvvfo’s investigation after the witness chain, leaves behind a persistent key-item hat, produces contradictory Lens predictions, and points the existing story back to the east support and underground facility.
