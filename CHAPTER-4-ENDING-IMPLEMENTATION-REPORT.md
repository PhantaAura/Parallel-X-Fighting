# Chapter 4 Ending Implementation Report
## Prototype 2.9A.39.1 — Chapter 4 Ending Continuity Patch

## 1. Every file changed

### Gameplay / save behavior

- `js/story/rrvvfo-chapter-4.js`
- `js/story/chapter4-content.js`
- `js/story/story-reliability.js`
- `js/story/lost-year-data.js`

### Tests / release identity / documentation

- `tests/smoke.js`
- `tests/smoke-bootstrap.js`
- `tests/smoke.html`
- `js/build-info.js`
- `index.html`
- `README.md`
- `FULL-CHAIN-MANIFEST.json`
- `BUILD-MANIFEST-2.9A.39.1.json` (new)
- `PATCH-NOTES-2.9A.39.1.md` (new)
- `VALIDATION-2.9A.39.1.md` (new)
- `SMOKE-RESULTS-2.9A.39.1.txt` (new)
- `CHAPTER-4-ENDING-IMPLEMENTATION-REPORT.md` (new)

### Cache-bust-only import changes

The following runtime files changed only to replace the 2.9A.39 cache query with the 2.9A.39.1 cache identity so GitHub Pages/Safari cannot mix old and new modules:

- `js/ability-hotbar.js`
- `js/arena/arena-controls.js`
- `js/arena/arena-mode.js`
- `js/controller-manager.js`
- `js/fighter.js`
- `js/input-runtime.js`
- `js/main-menu.js`
- `js/main.js`
- `js/save-manager.js`
- `js/settings-panel.js`
- `js/sonic-battle-dialogue.js`
- `js/story/chapter2-hub-quests.js`
- `js/story/chapter3-content.js`
- `js/story/combat-manual.js`
- `js/story/lost-year-story.js`
- `js/story/rrvvfo-chapter-3.js`
- `js/story/rrvvfo-mission-0.js`
- `js/story/rrvvfo-mission-1.js`
- `js/story/rrvvfo-mission-2.js`
- `js/story/rrvvfo-road-hub.js`
- `js/story/story-charm.js`
- `js/story/story-engine.js`
- `js/story/story-polish.js`
- `js/story/story-progression.js`
- `js/story/story-rpg-ui.js`
- `js/touch-controls.js`

Those files do not change their gameplay behavior in this patch.

## 2. Which old Chapter 4 ending code was replaced

The old `reachLookout()` ending block was removed. It previously branched on Ryuzankaro completion and immediately performed a Shadow conversation after Object Swap.

The Ryuzankaro-complete branch included exchanges such as Shadow knowing Rrvvfo was coming, Rrvvfo questioning why Shadow did not help, Shadow asking what happened, and Shadow explicitly identifying Ryuzankaro.

The skipped branch had Shadow ask where Rrvvfo found the symbol, followed by Rrvvfo explaining the tournament/teleporter route and Shadow telling him to come inside.

Both branches then marked `shadowBriefing` and completed Chapter 4 immediately. That entire final briefing branch has been replaced by:

- `completeLookoutSwap()` → land on the lookout;
- `enterLookout()` → restore free player control on the floating platform;
- `startShadowArrival()` → exact one-line scene at the entrance;
- `finishShadowArrival()` → visible collapse and fade;
- `commitCompletion()` → save Chapter 4 only after the scene has played.

## 3. How the mandatory pebble Object Swap sequence is preserved

The existing summit interaction remains the gateway to the lookout.

`startLookoutObjectSwap()` establishes that the structure is floating and that there is no normal route. It throws/places the summit pebble target on the lookout and launches the existing Object Swap QTE.

`startLookoutSwapQte()` still requires the exact input sequence:

**CHARGE → RELEASE → LOCK → OBJECT SWAP**

No new movement mechanic was added. `lookoutReached` is marked only after that QTE succeeds. The player is then placed at elevation `y = 500` on the floating lookout.

A save that claims `location: 'shadow-lookout'` without `lookoutReached` is normalized back to `echo-mountain`, so loading cannot use a location flag to bypass the summit sequence.

## 4. How both Ryuzankaro quest branches converge

The new final scene contains no conditional check for Ryuzankaro.

Whether the optional quest was completed or skipped, the required route converges at:

`hollowWatcherDefeated` → summit pebble → Object Swap → `lookoutReached` → Shadow entrance → `shadowArrival` → `chapterSaved`.

Ryuzankaro rewards and state remain untouched. The completion screen may still summarize whether the optional secret was completed, but Shadow does not recognize, name, explain, or react differently to Ryuzankaro in the final scene. Therefore both routes enter Chapter 5 with the same Story starting state except for rewards already earned through the optional quest.

## 5. What save/checkpoint flag now marks Chapter 4 complete

The modern ending evidence is:

- `shadowArrival` — the new final Shadow arrival/pass-out scene has been played;
- `chapterSaved` — the final required persistence step.

The canonical completed state remains:

- `chapterComplete: true`
- `lastCheckpoint: 'rrvvfo-04-complete'`
- completed mission: `rrvvfo-04`

`shadowBriefing` is no longer a modern Chapter 4 required step. Fully completed older saves that contain `shadowBriefing` are migrated forward to `shadowArrival` for compatibility; partial old endings are not promoted.

## 6. Conflicts found with the existing Chapter 4 ending

Six conflicts were found:

1. **The old ending had two separate Shadow scenes** depending on Ryuzankaro completion, while the new continuity requires one converged ending.
2. **The Ryuzankaro branch explicitly named/explained Ryuzankaro**, which is forbidden in the new Chapter 4 ending.
3. **The skipped branch discussed the tournament/symbol/teleporter route**, moving information into Chapter 4 that is now reserved for Chapter 5.
4. **Shadow gave exposition and invited Rrvvfo inside**, while the new ending requires Shadow to remain essentially silent.
5. **Object Swap and chapter completion were effectively part of the same ending event**, so the player did not get the requested walk across the floating lookout to Shadow’s entrance.
6. **The old `shadowBriefing` save evidence could let older partial ending state collide with the new flow.** State version 5 and explicit migration rules now separate fully completed old saves from partial ones.

No conflict required changing the earlier Chapter 4 village, cavern, defense, Ryuzankaro, mountain, Hollow Watcher, or reward content.
