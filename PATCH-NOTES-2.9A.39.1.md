# Parallels X: Clash of Souls — Prototype 2.9A.39.1
## Chapter 4 Ending Continuity Patch

This patch replaces **only the final Shadow’s Lookout sequence in Chapter 4**. All earlier Chapter 4 hub, cavern, village-defense, Ryuzankaro, mountain, Hollow Watcher, rewards, and progression content remains intact.

### New ending flow

1. Rrvvfo completes the existing solo mountain journey and reaches the summit beneath Shadow’s Lookout.
2. The lookout remains visibly floating with no bridge, stairs, path, or ground support.
3. Rrvvfo uses the existing summit pebble and the mandatory **CHARGE → RELEASE → LOCK → OBJECT SWAP** sequence.
4. Object Swap lands Rrvvfo on the floating lookout, but **does not complete the chapter**.
5. The player regains control and walks to **SHADOW’S ENTRANCE**.
6. The final Chapter 4 scene contains only Rrvvfo’s line: **“Shadow... it’s been a while.”**
7. Rrvvfo visibly collapses as the scene fades to black.
8. The handoff displays **CHAPTER 4 COMPLETE** and **CHAPTER 5 SETUP**.

### Chapter 5 material removed from Chapter 4

The old ending’s Project Hollow / symbol discussion, Shadow exposition, and Ryuzankaro-specific Shadow dialogue are gone from Chapter 4. Chapter 5 is now responsible for Rrvvfo waking inside the lookout and the conversation that follows.

### Ryuzankaro convergence

Completing or skipping the optional Ryuzankaro quest no longer changes the final Shadow scene. Existing rewards and optional-quest state are preserved, but both paths converge before Rrvvfo approaches Shadow’s entrance.

### Save and checkpoint safety

- Chapter 4 state version is now **5**.
- `shadowArrival` replaces the old `shadowBriefing` ending step.
- `chapterSaved` remains the final required persistence step.
- `chapterComplete: true` remains the canonical completion state.
- `rrvvfo-04-complete` remains the canonical completed checkpoint.
- Old fully completed Chapter 4 saves migrate to the new completion evidence.
- Old partial ending saves do **not** skip the new entrance scene.
- A corrupted/partial `shadow-lookout` location without `lookoutReached` is normalized back to `echo-mountain`, preserving the mandatory Object Swap.

### Compatibility

- Save schema: **268** (unchanged)
- Full browser smoke suite: **379 / 379 PASS**
