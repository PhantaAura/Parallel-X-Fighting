# Prototype 2.9A.27.1 — Chapter 4 Replay Recovery

- Fixed Chapter 4 Replay opening directly on the completed Shadow’s Lookout screen.
- Replay and Restart now create a fresh temporary Chapter 4 state regardless of how completion was recorded.
- Legacy saves with `chapter4State.chapterComplete` but no `rrvvfo-04` mission entry are supported.
- The original Chapter 4 state and checkpoint are restored when leaving a replay.
- Completion presentation hides the map, exploration HUD, prompts, trackers, and stale objective toast.
