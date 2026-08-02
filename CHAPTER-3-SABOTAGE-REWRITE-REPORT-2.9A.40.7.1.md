# Chapter 3 Sabotage Investigation Rewrite — Implementation Report

## 1. Every file changed

### Story/gameplay files with meaningful logic changes
- `js/story/chapter3-content.js` — new v4 Chapter 3 state, evidence, required-story spine, migration, and blue-clone foundation flag.
- `js/story/rrvvfo-chapter-3.js` — complete required-story rewrite, sabotage investigation, witness/Strange Man logic, Project Hollow reveal, real Sage/lockdown sequence, blue-clone escape, unstable teleport, multi-day blackout, and replay/reload recovery.
- `js/story/rrvvfo-chapter-4.js` — minimal handoff correction so Chapter 4 opens after the vanished unstable teleport rather than implying a functioning teleporter remains beside Rrvvfo.
- `tests/smoke.js` — rewritten Chapter 3 regression coverage plus ten dedicated 2.9A.40.7.1 tests.
- `js/build-info.js`, `tests/smoke-bootstrap.js`, `tests/smoke.html`, `index.html` — release identity/test-count/cache synchronization.

### Cache-identity-only source changes
`js/ability-hotbar.js`, `js/arena/arena-controls.js`, `js/arena/arena-mode.js`, `js/controller-manager.js`, `js/fighter.js`, `js/input-runtime.js`, `js/main-menu.js`, `js/main.js`, `js/save-manager.js`, `js/settings-panel.js`, `js/sonic-battle-dialogue.js`, `js/story/chapter2-hub-quests.js`, `js/story/chapter4-content.js`, `js/story/combat-manual.js`, `js/story/core-fun.js`, `js/story/lost-year-data.js`, `js/story/lost-year-story.js`, `js/story/revisit-loop.js`, `js/story/rrvvfo-mission-0.js`, `js/story/rrvvfo-mission-1.js`, `js/story/rrvvfo-mission-2.js`, `js/story/rrvvfo-road-hub.js`, `js/story/story-charm.js`, `js/story/story-engine.js`, `js/story/story-map.js`, `js/story/story-polish.js`, `js/story/story-progression.js`, `js/story/story-rpg-ui.js`, and `js/touch-controls.js` only move active imports to the 2.9A.40.7.1 cache tag.

Release documentation/manifest files are added or updated as part of packaging.

## 2. Old Chapter 3 story beats removed/replaced
- Removed Sage/Plouke disguise as the opening suspicion.
- Removed “find out what Sage/Plouke was doing” as the chapter's core motivation.
- Removed the Plouke bag as required Story progression.
- Removed hunting Sage before sabotage evidence exists.
- Removed the old ordinary-combat implication that Project Hollow simply defeats Sage.
- Removed the teleporter-door sequence as an Object Swap lesson.
- Removed the implication that the Sage beside Rrvvfo had secretly been a clone all along.
- Removed playable Echo exploration at the end of Chapter 3.
- Removed the functioning teleporter remaining beside Rrvvfo after arrival.
- Removed the Chapter 3 objective to reach Shadow's Lookout; that remains Chapter 4 territory.

## 3. New Chapter 3 opening
The opening uses the tournament repairs themselves as urgency:
- Rrvvfo: “Someone messed with that ring.”
- Rrvvfo: “And if they replace everything, there goes half the evidence.”
The objective becomes **INVESTIGATE THE TOURNAMENT SABOTAGE**.

## 4. Ring evidence
The player can inspect three required clues:
1. **Damaged Ring Support** — the load point was deliberately cut and the failure direction came from beneath the fighting floor.
2. **Unregistered Component** — hardware is wired into the ring but has no tournament serial number.
3. **Maintenance Access** — the lower access was opened during the final tournament window despite nobody being authorized there.
After all three, Rrvvfo concludes: “Yeah. Someone definitely did this.”

## 5. Witnesses
- **Tournament Worker:** saw an unidentified person moving equipment around maintenance areas during the tournament.
- **Security:** says nobody was officially authorized in lower maintenance, yet the access log records entry.
- **Medical Worker:** says Plouke skipped the medical tent after his fight and was seen heading toward maintenance. Rrvvfo treats this as evidence Sage may have noticed the sabotage, not evidence Sage caused it.

## 6. Exact medical-worker conversations
### First conversation
- MEDICAL WORKER: “Plouke never came to the medical tent after his fight. I saw him heading toward maintenance instead.”
- RRVVFO: “Why the hell was he going down there?”
- RRVVFO: “...He probably noticed something too.”

### Required second conversation
- RRVVFO: “You said Plouke skipped the medical tent and went toward maintenance.”
- MEDICAL WORKER: “Plouke?”
- RRVVFO: “...Yeah.”
- MEDICAL WORKER: “I’ve never treated or spoken to anyone named Plouke.”
- RRVVFO: “You literally told me that a few minutes ago.”
- MEDICAL WORKER: “I think you have me confused with someone else.”

## 7. Strange Man appearance/disappearance
After the required witness phase, Strange Man appears and gives the warning that the people Rrvvfo is speaking to “aren’t the real people,” specifically directing him back to the medical worker. After the contradiction, Rrvvfo returns to Strange Man's location and finds no obvious route, no useful witness memory, and only the hat.

## 8. Strange Man's Hat storage
The hat is stored as key item `strange-mans-hat`. Required flags `strangeManWarningSeen`, `medicalWorkerRevisited`, and `strangeManHatCollected` reconcile into checkpoint state on reload.

## 9. Lens of Truth and the hat
Lens inspection is optional and uses `strangeManHatLensInspected`. The Lens presents mutually contradictory possibilities rather than solving the mystery. Rrvvfo's conclusion is: “Great. Even my eye doesn’t know what happened.”

## 10. Discovering tournament maintenance
After the hat sequence Rrvvfo summarizes the sabotage, changing testimony, and Sage's maintenance direction, then chooses to investigate the East Support/maintenance access. The first underground space is still labeled **TOURNAMENT MAINTENANCE**.

## 11. Establishing Sage followed the same trail
Inside maintenance Rrvvfo finds a destroyed surveillance robot and a piece of fake Plouke material. He concludes:
- “...Sage.”
- “So he found this place too.”
Only then does **Find the Sage** become a primary objective.

## 12. Gradual Project Hollow reveal
The sequence is deliberately staged:
1. ordinary repair/storage/utility maintenance,
2. new cables behind old walls,
3. hidden camera/unmarked power/robot components,
4. non-tournament security door,
5. surveillance/robot infrastructure,
6. tournament combat recordings,
7. fighter response and energy observation data,
8. central terminal finally displays **PROJECT HOLLOW**.

## 13. Real Sage encounter
The person Rrvvfo finds deeper in the facility is explicitly the real Sage. Narration shows him tearing through Project Hollow units faster than the facility can replace them. Their exchange keeps Sage sarcastic and Rrvvfo annoyed while confirming they followed the same mystery independently.

## 14. Threatening Sage without nerfing him
Project Hollow does not overpower Sage in a fair fight. The threat comes from numbers, data evacuation, closing security shutters, specialized resonance/suppression systems, and Rrvvfo needing an escape route. Sage remains individually dominant.

## 15. Facility lockdown
After the Sage encounter the facility enters lockdown, evacuates/deletes data, closes sections, activates suppression hardware, and converges units. Rrvvfo fights a **Hollow Containment Unit** while Sage keeps destroying surrounding units. The teleporter wing becomes the immediate route out.

## 16. Real Sage creates the blue clone
At the closing teleporter-room door, the real Sage shoves Rrvvfo toward the opening and creates a visibly blue duplicate while the opening shrinks. `sageBlueCloneCreated` records the event.

## 17. Real Sage stays outside
Rrvvfo reaches the room and pulls the blue duplicate through. The real Sage remains outside fighting Project Hollow. The sequence explicitly states that separation before the door seals.

## 18. Rrvvfo realizes the companion is a clone
Inside, the Sage beside Rrvvfo begins visibly glowing blue while the real Sage can still be heard/understood to be outside. Rrvvfo says:
- “Sage—”
- “...Wait.”
- “You’re the clone.”

## 19. Exact blue-clone lesson dialogue
- SAGE CLONE: “Try to master this technique, kid.”
- RRVVFO: “The clone thing?”
- SAGE CLONE: “Something like it.”
- RRVVFO: “What about the real you?!”
- SAGE CLONE: “He’ll be fine.”
- SAGE CLONE: “I’m gonna be gone for a while.”
- RRVVFO: “What does THAT mean?!”

## 20. `blueCloneTechniqueFoundationLearned`
The flag is part of Chapter 3 state v4 and the mandatory required-step chain. It is normalized/recovered from both explicit boolean state and required-completion state and is preserved through old completed-save migration.

## 21. Chapter 5 Shots of Agony setup
The flag records only conceptual knowledge: Rrvvfo has seen one source divide into an independently acting manifestation. Chapter 5 can later combine that mandatory memory with Project Hollow's multi-emitter technology to inspire the unstable Shots of Agony prototype.

## 22. Chapter 3 does not unlock Shots of Agony
Confirmed. No Shots of Agony technique is granted in Chapter 3. The blue-clone mastery toast explicitly says **No technique was unlocked**.

## 23. Not an Object Swap lesson
Confirmed. While Object Swap remains part of Rrvvfo's existing kit, the door sequence explicitly rejects ability use with **THE ESCAPE IS ABOUT THE CLOSING DOOR • NOT OBJECT SWAP**. The interaction is about reaching/pulling the blue clone through the closing doorway.

## 24. Blue clone activates the teleporter
After the lesson, the blue clone moves to the unstable teleporter controls and initiates the only available escape as Project Hollow breaches the room.

## 25. Clone disappearance
During the breach, the blue clone fades normally as part of Sage's technique. `blueCloneDisappeared` is saved before Rrvvfo is moved to Echo Region. The real Sage is not shown being defeated.

## 26. Reaching Echo Region
The unstable long-distance teleport throws Rrvvfo into the remote Echo mountain region. The teleport connection collapses immediately; no usable Project Hollow teleporter remains beside him.

## 27. Multi-day unconscious period
Rrvvfo only gets a brief glimpse of the unfamiliar mountains/floating lookout before the unstable teleport overwhelms him. He is shown entering a non-graphic knockdown state, then narration states that several days pass while he remains unconscious. `rrvvfoUnconscious` and `echoOperationTimeSkipStarted` persist this handoff.

## 28. Project Hollow's Echo-operation time
During the blackout the chapter shows only a restrained system cutaway:
- `TARGET ARRIVED. RECOVERY PERIOD: ESTIMATED MULTIPLE DAYS.`
- `BEGIN ECHO REGION OPERATION.`
This gives Project Hollow time to move equipment and establish the situation Rrvvfo later wakes into without revealing the full plan.

## 29. Direct Chapter 4 handoff
Chapter 3 ends with Rrvvfo unconscious and does not grant free Echo exploration. Chapter 4 still opens when he wakes with the existing concern for Sage. The only continuity adjustment removes the implication that a working teleport remains beside him; Rrvvfo instead notes that whatever dropped him there is gone.

## 30. Conflicts found and resolved
- **Old Sage-suspicion motive:** incompatible with the rewrite; removed from required progression.
- **Old Plouke-bag gate:** no longer supports the new investigation logic; removed from required progression and migrated for old saves.
- **Old Object Swap door lesson:** conflicted with the blue-clone foundation; replaced.
- **Old Echo ending:** gave Rrvvfo control too early and left a teleporter beside him; replaced by immediate collapse and multi-day blackout.
- **Old Sage power presentation:** risked implying ordinary Hollow units could simply beat Sage; replaced with suppression/lockdown/numbers while Sage remains dominant.
- **Old save checkpoints:** could create a hybrid old/new ending. State v4 migration advances old door/teleporter/completed saves through the mandatory blue-clone and blackout evidence as appropriate.
- **Chapter 4 opening teleporter wording:** minimally adjusted so it matches the vanished connection while preserving the existing Sage concern and Chapter 4 story structure.
- **40.7 optional quest replacements/interiors/connected world:** retained wherever compatible rather than thrown away.
