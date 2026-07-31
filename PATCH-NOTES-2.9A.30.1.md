# Prototype 2.9A.30.1 — Stability & Interface Cleanup

## Story and match recovery

- Restart Match and Rematch preserve each fighter’s real maximum HP instead of forcing both fighters to 100 HP.
- Story encounter scaling, earned Rrvvfo HP, and custom opponent health therefore survive restarts.
- Stage cameras initialize from the active stage profile and fighter separation, avoiding the brief Dojo-distance zoom on larger arenas.

## Focus Recovery reliability

- Block + Charge becomes a recovery input only when recovery is available or its startup/channel is already active.
- With no gray health or usable Energy, Block remains available instead of creating a dead input state.
- Moving or entering an unsafe combat state clears startup progress rather than allowing it to resume later.
- Startup-only taps no longer create release recovery; the 0.3-second penalty begins only after actual healing starts.
- The HUD reports the amount healed by the current channel instead of the accumulated round total.
- Training knockouts clear gray health, startup, channel, sound cooldowns, and release recovery.
- CPU recovery logic now checks a percentage of maximum HP rather than a fixed 70-HP threshold.

## Arena identity and mobile interface

- Mountain Path is handled as an OPEN stage: it has no wall splats against invisible limits and no hard rectangular perimeter line.
- Global Tournament is labeled Medium and Echo Caverns is labeled Large to match their relative dimensions more honestly.
- Phone pursuit, Focus Recovery, combat-event, and edge-warning cues occupy separate safe vertical lanes.
- Training can collapse into a compact drawer on phones and coarse-pointer devices.
- Mobile Stage Select shows one stage card at a time with previous/next controls and a position indicator.
- Portrait mode hides temporary combat feedback instead of compressing it over the fight.

## Presentation and compatibility

- The Sage Manual and active Arena diagnostics display Prototype 2.9A.30.1.
- Save schema remains 268.
- Focus Recovery rates, pursuit balance, combat damage, and Chapters 1–4 are unchanged.
