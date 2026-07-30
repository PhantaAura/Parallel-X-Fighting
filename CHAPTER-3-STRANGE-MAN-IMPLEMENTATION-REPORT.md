# Chapter 3 Strange Man Implementation Report

## Scene placement

The new sequence occurs after `ploukeBag` and before `lensTrail` in Chapter 3's existing required-step order. By this point Rrvvfo has already completed the first medical-worker conversation and The Fighter Nobody Recorded witness investigation. After the east-support clue, the chapter resumes the existing Lens trail, Sage explanation, facility entrance, bosses, Project Hollow sequence, teleporter escape, and Echo Region ending.

## Quest flags

- `strangeManWarningSeen`
- `medicalWorkerRevisited`
- `strangeManHatCollected`
- `strangeManHatLensInspected`
- `strangeManLeadFound` (supporting east-support clue flag)

The first four match the requested state names. `strangeManLeadFound` safely records the final clue that reconnects the sequence to the existing facility path.

## Medical-worker trigger

The altered medical-worker dialogue is exposed only when `strangeManWarningSeen` is true and `chapter3NextRequired(state)` is `medicalWorkerRevisited`. The original first medical-worker dialogue remains unchanged. The optional Medical Tent Follow-Up marker is temporarily suppressed while the mandatory revisit is active so the two interactions cannot compete at the same coordinates.

## Hat persistence

The key item uses the ID `strange-mans-hat` and appears as **Strange Man's Hat** with the requested description. It is stored in both Chapter 3 state and the existing top-level Lost Year progress save under `keyItems`. This keeps it available after Chapter 3 and during future story chapters. Replay collection merges the item into the real save without overwriting the completed Chapter 3 state.

## Save and reload safety

State normalization reconciles implied earlier flags. For example, a saved hat automatically implies that the medical revisit and warning already occurred. Older saves already at `lensTrail`, inside the facility, or beyond are migrated past the inserted steps and receive the persistent hat, preventing them from being sent backward into an unavailable hub objective.

## Existing-code conflicts found

1. Chapter 3 uses a strictly linear `CHAPTER3_REQUIRED_STEPS` sequence. Adding steps before `lensTrail` would have softlocked older saves whose `location` was already `facility`, because the facility interaction table had no Strange Man interactions. A migration now marks the inserted sequence complete for saves already beyond the insertion point.
2. The optional `medicalFollowup` quest uses the same medical-worker position as the mandatory second conversation. The optional marker is hidden only while `medicalWorkerRevisited` is the active required step.
3. Ability slot 4 was already context-sensitive for the existing Lens trail. It now routes to the hat only during `strangeManLead`, then returns to the original Lens-trail behavior.
4. The build had no general Story key-item array or inventory page. Rather than create a separate system, the existing Lost Year progress object was extended additively with `keyItems`, and Chapter 3's existing journal displays the item.
5. The supplied second conversation says Rrvvfo was previously told someone was treated near the east support, but the existing first medical-worker dialogue does not contain that statement. The first conversation was left unchanged and the supplied second dialogue was preserved as requested.
6. No Strange Man-specific sprite or model asset exists in the 2.9A.24 package. The encounter uses the current Chapter 3 primitive NPC rendering style, with a distinct dark silhouette and wide hat.

## Files changed

### Modified

- `FULL-CHAIN-MANIFEST.json`
- `README.md`
- `css/interface-unified-29a6.css`
- `index.html`
- `js/build-info.js`
- `js/main-menu.js`
- `js/main.js`
- `js/story/chapter3-content.js`
- `js/story/lost-year-data.js`
- `js/story/lost-year-story.js`
- `js/story/rrvvfo-chapter-3.js`
- `tests/smoke.html`
- `tests/smoke.js`

### Added

- `BUILD-MANIFEST-2.9A.24.1.json`
- `CHAPTER-3-STRANGE-MAN-IMPLEMENTATION-REPORT.md`
- `FRIEND-PLAYTEST-CHECKLIST-2.9A.24.1.md`
- `PATCH-NOTES-2.9A.24.1.md`
- `VALIDATION-2.9A.24.1.md`

### Replaced release documents

The following 2.9A.24 release-document files were removed and replaced by the 2.9A.24.1 versions:

- `BUILD-MANIFEST-2.9A.24.json`
- `FRIEND-PLAYTEST-CHECKLIST-2.9A.24.md`
- `PATCH-NOTES-2.9A.24.md`
- `VALIDATION-2.9A.24.md`
