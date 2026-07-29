# Parallels X 2.9A.5 — Friend Playtest Checklist

Use the normal GitHub Pages build after 2.9A.5 is deployed. A test does not need to be perfect or completed in one sitting; the most useful report includes the screen, mode, character, input device, and what happened immediately before the issue.

## 1. First impression

- Let the title screen sit for ten seconds. Check the logo, particles, prompt pulse, tagline, and sound.
- Press a button and move through every main-menu option.
- Confirm the selected mode has artwork, a clear description, and visible feedback.
- Select Arcade and confirm it says **Coming in Prototype 3.x** without opening a broken screen.

## 2. The Sage’s Manual

- Open **Extras → The Sage’s Manual**.
- Check category filters, scrolling, keyboard/controller/touch instructions, fighter pages, glossary, and locked Story pages.
- Confirm closing the Manual returns to the correct menu without leaving a dialogue or invisible overlay behind.

## 3. Quick combat test

- Start **VS CPU** with Rrvvfo versus Revvfo.
- Check movement, jump, dash, light, heavy, launcher, guard, grab, charge, special, ultimate, hit-stop, screen shake, perfect-parry feedback, KO, respawn, and first-to-three completion.
- Watch for attacks occurring during menus, dialogue, KO sequences, or loading transitions.

## 4. Character and loading presentation

- Open character select and confirm each fighter says **Showcase**, **Visual Prototype**, or **In Development**.
- Start fights with Rrvvfo, Revvfo, Wade, Bark, and the Sage.
- Check that the loading card shows the selected fighter, stage, task progress, and never stays stuck on **Loading**.

## 5. Training and onboarding

- Open Training Mode and try each Suggested Drill.
- Complete the guided Story refresher without outside help.
- At every lesson, confirm it is obvious what to press, what success looks like, and what remains unfinished.
- Switch input devices during the tutorial and check that the displayed controls update.

## 6. Story Engine

### Chapter 1

- Begin from a clean save when possible.
- Check dialogue removal, exploration controls, combat transitions, tutorial completion, pauses, exits, and checkpoint restoration.

### Chapter 2

- Enter the tournament hub, open the Story Menu, begin optional and official fights, lose once, win once, replay a fight, and exit the chapter.
- Confirm first-to-three rules only appear where intended and optional fights still use their intended rules.

### Chapter 3 preview

- Launch the preview and check dialogue, camera, objectives, movement, pause/exit behavior, and return to the route screen.

Across all chapters, note anything that feels like a different engine: movement speed, camera behavior, input timing, HUD style, dialogue controls, pause rules, or combat feedback.

## 7. Device checks

- Test keyboard first.
- Test a controller, including menu navigation and live glyph changes.
- On a phone, test the default landscape layout before editing it.
- Check 1280×720 or another small laptop window for overlapping HUD elements.

## Report format

Copy this for each problem:

```text
Build: 2.9A.5
Mode/Chapter:
Character:
Input device:
Screen size/device:
What I was doing:
What happened:
What I expected:
Can I repeat it? Yes / No / Sometimes
Screenshot or recording:
```
