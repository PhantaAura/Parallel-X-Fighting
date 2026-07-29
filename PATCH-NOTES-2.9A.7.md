# Parallels X Prototype 2.9A.7 — Casual Player Retention Pass

This update is focused on removing moments that could make a new player feel confused, cheated, interrupted, or trapped in a long encounter.

## One control language

- **C** is Charge in every combat presentation.
- **U** is Grab in every combat presentation.
- **R** is Combo Breaker.
- **Q** is Counter.
- **E** is Interact.
- **M1 / J** is Light and **M2 / L** is Block.
- **O** or the controller’s ZR/RT/R2 button activates the selected ability.
- Keyboard numbers 1–5 directly activate a slot.
- Controller D-pad Left/Right changes the selected slot without moving the fighter.
- Touch controls include dedicated Charge, Grab, Breaker, Counter, and context-sensitive Interact buttons.

## Fairer casual combat

- Generic CPU rivals use the same **100 HP** as the player on every difficulty.
- VS CPU now defaults to **Quick Battle — First to 1 KO**.
- **Full Battle — First to 3 KOs** remains available and official Arena/Story tournament matches keep the continuous first-to-three identity.
- Combo Breaker costs 35 Energy in both combat presentations.
- Counter is a universal action; Bark keeps the stronger Seismic Counter variation.
- Guard fatigue now gives a visible warning before its lockout.

## Truthful Lens of Truth

- Lens predictions are always based on the opponent’s current action or plan.
- Low mastery gives broad but truthful warnings.
- Higher mastery provides more precise information.
- The early cost is now **60 Energy and 25 HP**, rather than almost emptying both resources.

## Honest roster presentation

- The normal playable roster is Rrvvfo, Revvfo, Wade, Bark, and The Sage.
- Unfinished fighters are disabled under a collapsed **Coming Soon Fighters** section.
- Random selection only chooses from the finished playable group.
- Showcase, playable, and in-development states are labeled clearly.

## Cleaner setup and Training

- Character select now keeps fighter, opponent, difficulty, stage, and match format visible.
- Technical settings and destructive utilities are under **Advanced Settings**.
- The development sprite viewer is hidden from normal player setup.
- Main-menu Training now opens **Arena Training**, using the same 3D combat used in Chapters 1–3.
- Arena Training initially shows only a drill, dummy behavior, reset, move list, and **Advanced 2D Lab**.
- Classic 2D Training remains available as the advanced lab.
- The unfinished crouch option was removed.

## Exploration and onboarding

- NPC interaction uses E, the configured controller Interact button, or the touch Interact button.
- Attack input is suppressed while Story exploration expects interaction.
- Field prompts change for keyboard, mouse, Nintendo, Xbox, PlayStation, custom controller, or touch input.
- Manual pages unlock through compact notifications instead of repeatedly opening the full book.
- The warm-up flags separately require movement, a jump, and a dash.
- The roadside escape gives one retry.
- A second escape failure starts a fair first-to-1 fight with 100 HP on both sides.

## Mobile and presentation cleanup

- The default landscape touch layout keeps all combat and interaction controls clear of the ability hotbar.
- Old touch layouts migrate to the safer Interact position.
- Loading copy now identifies Quick Battle correctly instead of always claiming first-to-three rules.
- Controller help now correctly reserves the D-pad for ability selection and the left stick for movement.

## Validation performed

- All game JavaScript and test JavaScript passed syntax validation.
- Every JSON file parsed successfully.
- Local HTML resources, JavaScript imports, CSS URLs, and duplicate IDs were checked.
- Direct runtime checks passed for controls, mouse input, fair roster selection, Lens cost/prediction, road rules, Story input filtering, and touch/hotbar separation.
- The complete ZIP passed archive-integrity testing.

A full browser smoke run and complete WebGL playthrough could not be performed in this environment because local pages are blocked. Combat feel, camera comfort, physical controllers, and complete Chapter progression still need the friend playtest.
