# Prototype 2.9A.36 — Playful Exploration & Quest Variety

## Purpose
This build turns the slower RPG pacing from 2.9A.35 into more memorable play. It replaces checklist-style progression with movement, timing, observation, and party-powered interactions while keeping first-time chapters substantial.

## Chapter 1 — Runaway Tournament Cart
- The rescued tournament transport now leads into a mandatory moving-cart interception.
- The player chases, jumps, changes position, and completes an Object Swap finish rather than collecting parts.
- Failure returns to a safe retry and never traps Story progress.
- The saved cart remains visible and is remembered by later Story state.

## Chapter 2 — Festival Technique Exhibition
- A new mandatory public exhibition opens after Bark and Wade join the hub.
- The course uses movement, jumping, timing, and a clean technique finish.
- Performance earns Rough Debut, Crowd Favorite, or Tournament Showstopper.
- Registration remains locked until the exhibition, Wade route, and ring repair are complete.
- A persistent festival poster records the result.

## Chapter 3 — Reconstruct the Incident
- The single-answer security reconstruction is replaced by a five-event evidence sequence.
- Wrong answers provide an order clue and preserve already confirmed evidence.
- The completed reconstruction remains visible on the security terminal.

## Chapter 4 — Party Field Route
- Bark stabilizes the damaged ground.
- Wade powers the old Echo mechanism.
- Rrvvfo swaps the prepared support into place.
- The cavern entrance stays blocked until all three field actions are complete.
- The repaired approach remains visible in Echo Village.
- Older saves already beyond the cavern entrance migrate safely and never move backward.

## Compatibility
- Save schema remains 268.
- Existing Chapter 2 tournament saves automatically receive exhibition completion.
- Existing Chapter 4 saves at or beyond Echo Caverns automatically receive the completed party route.

## Release hardening
- Chapter 2 QTE meters now use each activity’s real duration instead of a shared hardcoded timer.
- Build-info imports are versioned with the 2.9A.36 cache identity to prevent stale Safari labels.
- The smoke page and suite are synchronized at 343 tests.
