# Prototype 2.9A.29.1 — Pursuit Feel & Stability

## Pursuit now sells the chase

- Active pursuit uses dedicated speed lines, fighter-colored afterimages, a brief lock-on reticle, a rising chase cue, and a smooth camera pull.
- Normal dashes do not use the full pursuit treatment, so the chase remains visually distinct.
- Pursuit Light, Pursuit Heavy, Pursuit Tech, wall splat, and ground bounce now have separate audio and impact feedback.
- Pursuit Heavy uses four simulation frames of impact freeze; wall splat uses five; ground bounce uses four; Pursuit Light and Tech use two.
- Screen shake, localized flashes, and impact freeze continue honoring accessibility settings.
- Music ducks briefly during the chase and returns when pursuit ends.

## Clearer fighter movement identity

- Rrvvfo uses ember-colored displacement and a side-feint silhouette.
- Revvfo uses a dark-purple blink distortion and sharper arrival cue.
- Wade uses the quickest recovery, fastest chase, and a thin electric streak.
- Bark uses heavier dust, a visible armor pulse, slower cadence, and reduced grounded knockback.
- Phanta uses a wider ghost trail and doubled afterimage.
- Creed uses a narrow silver evasive fade and the longest dash-invulnerability window.
- These differences remain movement properties and do not increase attack damage.

## Fairer Pursuit Tech

- Pursuit Tech now costs a fixed **15 Energy**.
- Exactly 15 Energy succeeds; values below 15 fail without spending Energy.
- A successful Tech performs a visible side-step/fade, gives brief invulnerability, and leaves the pursuer in a short punishable recovery.
- Tech has a cooldown to prevent repeated escapes.
- CPU difficulty changes decision quality and frequency, never the Energy cost.

## Prompt and mobile clarity

- Gameplay settings now include **Pursuit Prompts: Full / Minimal / Off**.
- Full mode teaches Dash, attack-ready timing, and the Heavy finisher.
- Minimal mode uses a compact pursuit cue.
- Off removes tutorial text without changing any combat rule or visual impact.
- Mobile prompts use a smaller safe-area layout, hide shortly after the window closes, and temporarily enlarge the Dash touch target.
- Prompts are suppressed while paused, during round results, and when pursuit is not a legal active route.

## Training upgrade

- **Ideal Pursuit Combo** teaches Launcher → Dash → Light → Heavy with timing feedback.
- **Pursuit Pressure** practices defensive Tech and the punish afterward.
- Pursuit Defense dummy settings include Never Tech, Tech Occasionally, Tech Every Time, and Tech After Repeated Route.
- Training can display Wall Splat and Ground Bounce use as 0/1 counters.
- Timing grades report Good, Great, or Perfect.
- **Reset Combat State** clears pursuit, buffers, reactions, camera overrides, hitstop, temporary invulnerability, and armed clash state without restarting the entire match.

## Reliability

- Pursuit state clears on Training reset, pause, round end, respawn, match exit, and Story transition.
- Ring-out stages continue rejecting wall splats.
- Rapid pursuit attempts and successful Techs clear stale buffered inputs and camera focus.
- Save schema remains **268**.
