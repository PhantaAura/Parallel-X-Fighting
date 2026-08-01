# Friend Playtest Checklist — Prototype 2.9A.37

The goal is to test **first-play reliability and RPG pacing**, not speedrun the chapters.

## Fresh Story route
1. Start from a fresh Story save.
2. Play Chapter 1 normally and confirm Continue always returns to the correct checkpoint after a reload.
3. Finish Chapter 1 and read the Adventure Beat before choosing **CONTINUE JOURNEY**.
4. Repeat through Chapters 2 and 3.
5. Confirm Chapter 4 is **not** marked complete before you actually finish it.

## Chapter 4
1. Begin Chapter 4 as a normal first play, not Replay.
2. Open the Story Menu and confirm there is no `REPLAY — DOES NOT SAVE` label.
3. Reload once in Echo Village, once after a major fight, and once on the mountain route.
4. Confirm Continue returns to the expected place every time.
5. Finish the chapter and confirm 4 / 8 appears only after Shadow's Lookout ending is actually reached.

## Replay safety
1. Replay a completed chapter.
2. Confirm the run is clearly temporary.
3. Exit Replay.
4. Confirm the real Story checkpoint and completion state are unchanged.

## RPG feel
While playing, answer these:
- Did each hub have enough time to become familiar before the next major event?
- Did the quiet aftermath beats feel useful, or did any feel like waiting?
- Did Chapter 2 feel like attending a tournament rather than clearing a checklist?
- Did Chapter 3 feel meaningfully different when returning after hours?
- Did spending time with Bark and Wade make the solo Chapter 4 mountain section feel different?
- Did the Adventure Beat after each chapter make the next chapter feel anticipated instead of rushed?

## Hidden save-health check
From the Story route screen enter:

`↑ ↑ ↓ ↓ ← → ← → B A`

Confirm the debug room reports:
- **SAVE HEALTH • GOOD**
- The expected checkpoint
- The correct chapter statuses
- FIRST PLAY during a normal run, REPLAY during Replay, and PLAYTEST only for debug jumps
