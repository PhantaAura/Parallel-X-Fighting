# Prototype 2.5C5 — Sage No-Clipping Hotfix

## What changed

- Mission 0 no longer swaps between the generated Sage sheet's inconsistent poses.
- The Sage now uses one verified, complete full-body sprite with generous transparent padding.
- Idle breathing, running lean, and prediction-dodge motion are applied procedurally in the fighter renderer.
- This removes the visible frame morphing / front-edge clipping instead of trying another atlas-coordinate adjustment.
- The Sage health bar is forced to the white Mission 0 style.
- The 2× fighter render layer and high-resolution canvas from 2.5C4 remain enabled.
- Rrvvfo, dialogue, mission logic, Shots of Agony progression, and controls are unchanged.

## Test focus

1. Watch the Sage while standing still.
2. Attack him repeatedly and watch every prediction dodge.
3. Chase him while he moves around the field.
4. Confirm no part of his body changes into a different pose or gets cut off.
5. Confirm the right-side health bar is white.

## Technical note

This is deliberately a Mission 0 presentation solution. The Sage is story-only, so eliminating generated-sheet frame swapping is safer than attempting to make unrelated AI-generated poses behave like a traditional hand-authored animation set.
