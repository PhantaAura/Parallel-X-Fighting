# Prototype 2.9A.29 — Pursuit & Combat Identity

## Pursuit flow

- Launcher and Heavy hits open separate, bounded pursuit windows.
- Pressing Dash begins a distance-scaled chase.
- Light or Heavy may be buffered during the chase so quick inputs are not lost.
- Pursuit Light creates a short link window into one Pursuit Heavy finisher.
- Missing the follow-up ends the route instead of trapping either fighter in a loop.

## Defensive counterplay

- A fighter targeted by pursuit may spend 18 Energy and press Dash to perform a side tech.
- Pursuit Tech cancels the chase, grants brief invulnerability, and leaves the pursuer with a small recovery.
- CPU fighters use Pursuit Tech according to difficulty rather than escaping every chase.

## Arena reactions

- Strong attacks can create one wall splat per combo outside ring-out stages.
- Air Heavy and Pursuit Heavy can create one ground bounce per combo.
- Wall splats and ground bounces cannot repeat inside the same combo.
- Existing combo scaling, juggle limits, ring-out protections, and Story damage rules remain active.

## Fighter movement identity

- Rrvvfo: Object-Swap-inspired side feint.
- Revvfo: short warp at the start of pursuit.
- Wade: quickest dash recovery and fastest chase.
- Bark: armored step, slower dash cadence, and reduced grounded knockback.
- Phanta: wider phantom feint.
- Creed: evasive shift with the longest dash invulnerability.
- These identities do not modify attack damage.

## Readability and Training

- Added a pursuit prompt for chase, buffer, finisher, and defensive-tech timing.
- Pursuit camera focus, wall impact, ground-bounce effects, and separate sound cues improve readability.
- Added Training trials for Pursuit Finisher, Wall Splat, Ground Bounce, and Pursuit Escape.
- Added a Pursuit Pressure dummy behavior.
- Updated the Sage Manual with the complete pursuit route and defensive answer.

## Compatibility

- Chapters 1–4, Story progression, mobile Story UI, mode/route carousels, and existing saves are preserved.
- Save schema remains 268.
