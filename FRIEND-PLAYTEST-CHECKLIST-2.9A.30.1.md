# Friend Playtest Checklist — Prototype 2.9A.30.1

## Story restart

- Enter a Story fight with maximum HP above 100 or a custom opponent health value.
- Use Restart Match and Rematch.
- Confirm both maximum-health values remain unchanged.

## Focus Recovery input

- With no gray health, hold Block + Charge and confirm the fighter blocks instead of freezing.
- With gray health but no usable Energy, repeat the check.
- Begin the 0.6-second startup, move before healing begins, then stop and confirm startup restarts from zero.
- Tap Block + Charge for one frame and confirm there is no 0.3-second release lock.
- Heal, release, and confirm the normal vulnerable release period still occurs after actual recovery.
- Start a second channel and confirm its `+HP` counter begins from zero.

## Training cleanup

- Build gray health, then let the Training fighter reach zero HP.
- Confirm health resets to maximum and no old gray segment returns after later damage.
- Reset during startup, active recovery, and release recovery.

## Arenas and cameras

- Load all five stages and watch the opening camera.
- Confirm large stages do not begin zoomed in and then pop outward.
- Push a fighter against Mountain Path’s outer limit and confirm no wall splat occurs.
- Confirm Tournament says Medium and Echo Caverns says Large.

## Mobile interface

- On iPhone landscape, trigger pursuit, Focus Recovery, a combat event, and edge pressure.
- Confirm the cues occupy separate lanes and do not cover health, Energy, hotbar, or touch buttons.
- Open Training, collapse the drawer, and reopen it.
- Open Stage Select and move through every stage with the previous/next arrows.
- Rotate to portrait and confirm temporary combat feedback does not crush the screen.

## Regression checks

- Complete one normal Arena match and one Story match.
- Test ring-outs, wall splats, ground bounces, pursuit Tech, and Focus Recovery.
- Pause, restart, rematch, return to Stage Select, and exit without stuck camera or recovery state.
