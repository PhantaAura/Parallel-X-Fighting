# Parallels X: Clash of Souls — Prototype 2.9A.14

## Sage sprite integration

- Converted the supplied Sage reference sheet into a transparent 36-frame production atlas.
- Added distinct idle, stance, run, jump, fall, combo, heavy, launcher, aerial, block, perfect-block, hurt, knockdown, get-up, prediction, counter, energy, ultimate, defeated, and victory frames.
- Updated every Sage menu, loading, dialogue, Story, Classic, and Arena atlas reference to the new 6×6 layout.
- Preserved the original supplied sheet beside the active atlas for future art work.

## Progress and reliability

- Story progress now measures the planned six chapters. Completing Chapters 1–2 and the Chapter 3 demo displays 33%, not 100%.
- The Chapter 3 demo is labeled separately from completed full chapters.
- Failed Story startup restores the previous save instead of creating false Continue progress.
- Arena, VS CPU, and 2 Player remain hidden until six complete Story chapters exist.

## Camera and animation

- Hub cameras now detect solid scenery between Rrvvfo and the camera, then lift or move inward to keep him visible.
- Bark and Wade’s hub animations advance from simulation time instead of monitor refresh rate.
- Off-model turnaround cells no longer appear in active Rrvvfo, Revvfo, Bark, or Wade animations.

## Interface and combat readability

- Lens of Truth’s HUD warning now shows the correct 25 HP cost.
- Classic character select uses a stable five-column desktop roster with responsive tablet and phone layouts.
- Playable roster cards now show actual fighter sprites.
- Classic fighters render at a larger scale.
- Round banners are compact panels positioned above the center of combat.
- Main-menu buttons use balanced three-column groups, character artwork is larger and sharper, and the MODE SELECT header no longer clips its controls.

## Build

- Build: `Prototype 2.9A.14 — Sage & Complete Polish Pass`
- Cache ID: `29a14-sage-complete-polish-20260729`
- Save export schema: `250`
