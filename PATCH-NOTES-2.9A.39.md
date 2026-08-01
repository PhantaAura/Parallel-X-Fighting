# Prototype 2.9A.39 — Chapters 1–4 Full Experience Polish

## Goal
Make the first four released Rrvvfo chapters feel like one paced RPG adventure before Chapter 5 work begins. The build avoids lengthening chapters with empty walking, arbitrary timers, or new fetch gates.

## Intended first-play pacing
- Chapter 1: **35–50 minutes** — shortest, clean opening adventure.
- Chapter 2: **70–100 minutes** — festival/tournament chapter with the most social downtime.
- Chapter 3: **55–80 minutes** — tighter mystery and facility escalation.
- Chapter 4: **90–120 minutes** — longest released chapter because it has the most distinct gameplay phases.

## Adventure rhythm
- Added `js/story/story-experience.js` as a shared pacing-intent layer for Chapters 1–4.
- Major Story checkpoints now have contextual adventure beats: travel progress, tournament changes, investigation breakthroughs, world changes, crisis/aftermath, and destination payoffs.
- The hidden playtest menu reports the active chapter pacing target and intended gameplay rhythm so playtests can identify dead stretches quickly.

## Story fight ranks
- The unnumbered Combat Rank Patch remains integrated: every player-controlled fight uses **S / A / B / C / D / E**.
- Story S ranks now trigger a full skill celebration.
- Story A ranks receive a brief acknowledgement.
- B/C/D/E do not add another overlay, keeping the RPG flow moving.

## Chapter 4 recovery beat
- After the mandatory Echo Village defense, a new **optional** `REST WITH BARK & WADE` interaction appears at the recovery area.
- It provides a short party conversation and fully restores HP, Energy, and Guard.
- First-play completion grants **+45 Story XP** once. Replay gives no XP and says so.
- The interaction is not part of `CHAPTER4_REQUIRED_STEPS`; the mountain and Ryuzankaro choices remain available without using it.
- Echo Village visually exposes the recovery area after the defense.

## Save / compatibility
- Save schema remains **268**.
- No new mandatory Chapter 4 completion step was added.
- Existing mastery, S–E ranks, Chapters 1–4 saves, Replay isolation, and Chapter 4 false-completion recovery remain intact.
