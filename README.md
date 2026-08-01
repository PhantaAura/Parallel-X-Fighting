# Parallels X: Clash of Souls

> **Combat Rank Patch integrated:** Every completed fight receives an **S / A / B / C / D / E** grade. Prototype 2.9A.40 includes that mini patch in the cumulative build.

**A 2.5D arena fighter and RPG built around kinetic movement, pursuit combos, parries, character techniques, exploration, side quests, and continuous Story progression.**

Play the GitHub Pages build: <https://phantaaura.github.io/Parallel-X-Fighting/>

## Current build

**Prototype 2.9A.40.2 — Field Skills & Minimal UI**

This is a complete cumulative build. No older package is required.



## 2.9A.40.2 Field Skills & Minimal UI

This cumulative pass reduces Story exploration clutter and makes technique progression happen through play. Chapter 1's old early Shots of Agony lesson is replaced by a three-anchor Object Swap field trial and Tournament Road precision relay; Chapter 4's Bark/Wade/Rrvvfo field actions now become persistent field mastery. Shots of Agony is hidden and unavailable in Chapters 1–4 Story, while non-Story modes retain the full moveset. The future Story slot stays **UNKNOWN TECHNIQUE** until Chapter 5 eventually grants the unstable prototype unlock. Flow Cancel and build passives also get compact feedback instead of permanent HUD text.


## 2.9A.40.1 Builds & Combat Readability

This cumulative follow-up keeps the 2.9A.40 Core Fun Overhaul and removes friction from using its new systems. Rrvvfo builds can now be changed from Story pause menus during exploration, Custom supports four techniques plus two passives, combat/QTEs lock loadout changes, enemy roles have icons and silhouette differences, Chapter 4 squad target cycling works across keyboard/controller/touch, Support healing is telegraphed and interruptible, chapter identity cards use player-facing language, Flow Cancel is taught through an optional Chapter 1 combat opening, and Adventure Missions use chapter-appropriate result language instead of forcing every activity into S–E grading.

## 2.9A.40 Core Fun Overhaul

- Gives every released chapter a gameplay identity, not only a different story/map: Chapter 1 movement adventure, Chapter 2 tournament marathon, Chapter 3 investigation/infiltration, Chapter 4 party journey.
- Adds **Flow Cancel**: after a connected melee hit, spend 8 Energy during a short window to dash-cancel recovery and choose a new route.
- Adds **RRVVFO BUILD LAB** in Extras with three focused presets. Each equips four techniques and two passives; Story and Arena share the saved choice.
- Adds six tactical enemy archetypes: Rushdown, Guard, Ranged, Heavy, Trickster, and Support.
- Adds eight short optional **Adventure Mission** goals (two per released chapter) with persistent one-time rewards and ranks. They are hooks inside existing chapter play, not mandatory map-marker chores.
- Chapter 4 village defense becomes a **3v3 squad encounter** and an optional Project Hollow swarm becomes **3v2**. Bark and Wade have HP, roles, target priorities, team commands, and can be knocked down; off-target enemies remain active through squad AI while the selected enemy receives full Arena-fighter simulation.
- Preserves Chapter 4's solo-mountain contrast: after the team portion, Rrvvfo still continues alone to the Hollow Watcher and floating lookout.
- Includes all 2.9A.39.2 lookout hardening: landing camera, elevated-platform grounding, subtle entrance guidance, wind/height ambience, and deliberate collapse/fade timing.
- Save schema remains **268** and the smoke suite contains **397** checks.

## 2.9A.39.2 Chapter 4 ending experience hardening

- Keeps the 2.9A.39.1 ending writing unchanged while improving the final playable approach.
- Object Swap landing now gets a brief dedicated camera frame before normal free-look returns.
- Shadow’s floating lookout is firmly grounded at its sanctuary height and clamped to the platform bounds on fresh and restored checkpoints.
- Adds subtle wind/cloud/height feedback and a restrained entrance cue without adding a giant objective arrow.
- Rrvvfo’s collapse now holds for a readable quiet beat before the fade commits Chapter 4 completion.
- Both Ryuzankaro routes still converge, and the mandatory pebble → CHARGE → RELEASE → LOCK → OBJECT SWAP sequence is untouched.
- Includes a dedicated ending regression checklist for fresh, replay, partial, migrated, Ryuzankaro-complete, and Ryuzankaro-skipped saves.
- Save schema remains **268** and the smoke suite contains **385** checks.

## 2.9A.39.1 Chapter 4 ending continuity highlights

- Replaces only Chapter 4’s final Shadow’s Lookout sequence; the rest of Chapter 4 remains intact.
- Preserves the floating-lookout summit setup and mandatory **pebble → CHARGE → RELEASE → LOCK → OBJECT SWAP** sequence.
- Object Swap now lands Rrvvfo on the floating lookout without completing the chapter; the player regains control and must approach Shadow’s entrance.
- Both Ryuzankaro-completed and Ryuzankaro-skipped routes converge into the same ending scene. Existing optional rewards remain intact.
- The Chapter 4 ending now contains only Rrvvfo’s line, **“Shadow... it’s been a while.”**, followed by his collapse and a fade to black. Project Hollow, the badge, the tournament, the Sage, memory inspection, and Shadow’s assessment are reserved for Chapter 5.
- Chapter 4 completion evidence now uses `shadowArrival`, then `chapterSaved`; the canonical completed checkpoint remains `rrvvfo-04-complete`.
- Old fully completed Chapter 4 saves migrate forward, while partial summit/lookout saves cannot skip the mandatory Object Swap or new entrance scene.
- Save schema remains **268** and the full smoke suite passes **379 / 379**.

## 2.9A.39 Chapters 1–4 full experience polish highlights

- Formalizes the intended first-play pacing: Chapter 1 **35–50 min**, Chapter 2 **70–100 min**, Chapter 3 **55–80 min**, and Chapter 4 **90–120 min**.
- Chapter 4 is deliberately the longest because it has the most distinct phases: village arrival, party fieldwork, caverns, village defense, recovery, optional secret route, solo mountain climb, Hollow Watcher, and the floating lookout payoff.
- Story checkpoints now trigger more RPG-style world-change and adventure-beat reactions across all four released chapters instead of feeling like silent objective updates.
- S-rank Story fights receive a full celebration and A-rank fights receive a short acknowledgement; B–E do not spam extra overlays.
- Chapter 4 adds an **optional Bark + Wade recovery moment** after the village defense that restores HP, Energy, and Guard and gives a one-time +45 Story XP reward. It is not a mandatory gate.
- The hidden playtest menu now reports each chapter’s intended pacing target and gameplay rhythm so boring stretches are easier to diagnose.
- Save schema remains **268** and the full smoke suite passes **373 / 373**.


## 2.9A.38 combat mastery and RPG rewards highlights

- Real-time Sonic Battle-style combat stays intact; progression is built around mastering it rather than replacing it with turn-based menus.
- Arena-engine matches now earn C/B/A/S mastery ranks based on actual combat decisions such as pursuit finishers, parries, guard breaks, signature mechanics, variety, clean wins, and damage taken.
- Extras adds **MASTERY & RECORDS**, with persistent records for Rrvvfo, Revvfo, Wade, and Bark.
- Fifteen optional mastery challenges reuse the best Training trials and fighter identity mechanics.
- First clears grant one-time medals, mastery points, and named RPG rewards; repeating a challenge cannot farm points.
- Better challenge grades can replace older grades, so replaying is about improving skill rather than grinding.
- `pxMasteryRecordsV1` is included in safe save export/import while save schema remains 268.

## 2.9A.37 first-play reliability and RPG flow highlights

- Story runs explicitly distinguish FIRST PLAY, REPLAY, and PLAYTEST so temporary runs cannot masquerade as saveable progress.
- The save path strips contradictory Chapter 4 completion markers before persistence while preserving earlier chapters and RPG growth.
- The secret playtest menu now exposes save health, run mode, checkpoint order, and per-chapter completion state.
- Chapter results include a short RPG afterglow showing what changed in the world and where the adventure goes next.
- First-time chapter progression still waits for the player at results instead of auto-rushing into the next objective.
- Save schema remains 268.



## 2.9A.36.2 Chapter 4 false-completion recovery

- Detects Chapter 4 saves that claim completion without the ending checkpoints.
- Offers **START FRESH** to repair only Chapter 4 while preserving Chapters 1–3 and RPG growth.
- Starts the repaired chapter as a normal saveable run instead of temporary Replay.
- Clearly labels temporary Chapter 4 Replay runs as not saving.
- Save schema remains 268.

## 2.9A.36.1 Chapter 4 replay overlay fix

- Chapter 4 Replay clears the completion, choice, and QTE overlays before the opening scene.
- Hidden Chapter 4 overlays now use an explicit `display: none !important` rule.
- Save schema remains 268.


## 2.9A.36 playful exploration and quest variety highlights

- Chapter 1 adds a mandatory Runaway Tournament Cart rescue built around chase movement, jumping, and an Object Swap finish.
- Chapter 2 adds a ranked Festival Technique Exhibition and keeps tournament registration locked until the meaningful preparation activities are complete.
- Chapter 3 replaces its one-answer reconstruction with a five-event evidence sequence that preserves confirmed progress after mistakes.
- Chapter 4 adds a three-character Party Field Route using Bark, Wade, and Rrvvfo before Echo Caverns open.
- Completed activities leave visible results in their hubs instead of disappearing as checklist entries.
- Older tournament and cavern saves migrate forward safely, and save schema remains 268.
- The browser smoke suite packages 343 cases.


## 2.9A.35 living hubs and RPG pacing highlights

- Chapters 1–4 now track arrival, development, crisis, aftermath, and departure phases instead of presenting each hub as one flat checklist.
- Chapter 2 asks first-time players to learn the festival layout and meet people before tournament registration opens.
- Chapter 2 optional activities unlock in story waves, while round aftermaths return control for reactions and exploration before the next call.
- Chapter 3 uses the empty tournament grounds as an orientation beat before its investigation opens, then stages optional leads as tension rises.
- Chapter 4 lets Rrvvfo inspect Echo Village’s resonance wall and water channel before Bark and Wade arrive, with a quiet recovery period after the defense.
- Chapter 1 remains the lightest introduction while still tracking a clear journey arc.
- Existing saves normalize safely, Chapter 4 legacy progress bypasses the new orientation gate, and save schema remains 268.


## 2.9A.34 signature combat and impact highlights

- Rrvvfo, Revvfo, Wade, and Bark each have a short signature combat moment built around their existing identity rather than a universal new meter.
- Object Swap angles, close pressure, lightning near-misses, and armored punishes now create distinct resource and feedback rewards.
- Final match KOs use stronger fighter-colored impact, audio, freeze, camera emphasis, and victory hold while preserving accessibility settings.
- Arena Training adds one quick identity trial for each finished standard fighter.
- Save schema remains 268.


## 2.9A.33 boss dance and stage personality highlights

- Hollow Watcher now teaches a three-phase Action, Range, and Route scan instead of applying an opaque general resistance.
- Breaking its named learned pattern creates a short, obvious exposed state with increased damage and stun.
- Resonance Facility, Echo Caverns, and Mountain Path gain solid route-shaping Arena geometry that blocks fighters and projectiles.
- Tangai Dojo remains a direct pressure stage, while the Global Tournament remains a completely clean official ring.
- New Arena geometry is disabled during Story fights so chapter scripting and hub collision remain unchanged.
- Quick Battle launches a first-to-one VS CPU match from the main menu using the last safe setup.
- The browser smoke suite now packages 322 cases.
- Save schema remains 268.


## 2.9A.32 hub charm and progression celebration highlights

- Story hubs now use a shared arrival, banter, and progression-celebration layer.
- NPC chatter changes after major tournament events instead of repeating one static line.
- Bark, Wade, and Rrvvfo receive short party banter at selected Story milestones.
- Chapter 2 adds a Festival Photo Stand activity and persistent team-photo display.
- Chapter 4 adds Echo Chime Jam, plus villagers, banners, beacon energy, and lift visuals that react to progress.
- Level, permanent stat, technique, chapter, mode, route, and future fighter unlocks now have clear celebration presentation.
- Save schema remains 268.


## 2.9A.31.3 reliability highlights

- Save export, import, Reset All, Story autosave failure reporting, and schema validation now protect the complete current save set.
- VS CPU, Local 2 Player, Extras, and Stage Select share the same five playable Arena stages.
- Ring-out rules read stage profiles instead of a tournament-only ID check.
- Asset-less Story opponents use their own accent colors and unsupported sprite IDs skip missing-manifest requests.
- Interrupted Story fights restore their pre-fight snapshot, while the playtest menu can jump straight to a clean temporary Echo Village hub.
- Portrait combat keeps compact critical cues, and a timed-out smoke test stops before contaminating later results.
- Save schema remains 268.

## 2.9A.31.2 final smoke cleanup highlights

- Lens smoke tests now isolate temporary mastery values and restore the player’s real saved mastery afterward.
- Visible Arena and Sage Manual build labels now come from the shared build constant.
- Ryuzankaro availability is strictly derived from completion of the Echo Village defense.
- The smoke suite remains 301 tests and uses a fresh cache identity.
- Save schema remains 268.

## 2.9A.31 core feel and character fantasy highlights

- Late basic-attack inputs are buffered through the final recovery frames instead of disappearing.
- Wade, Bark, Rrvvfo, and Revvfo now have visibly different dash-cancel rhythm and impact weight.
- Normal hit audio gains fighter-specific layers without changing move damage.
- Hurt, landing, and victory presentation now use fighter identity accents.
- Arena results add Instant Rematch and Random Rematch.
- Arena Training adds a Fighter Identity comparison guide.

## 2.9A.30.2 smoke runner recovery highlights

- The browser smoke page reports every PASS or FAIL immediately instead of waiting until the entire suite finishes.
- Current-test, last-completed-test, elapsed-time, progress, and pass/fail counters remain visible during the run.
- Asset requests time out instead of hanging indefinitely, while individual tests continue after a bounded timeout.
- Startup import failures, unhandled errors, and stalled progress display an explicit diagnostic instead of leaving `Running…` forever.
- Mixed GitHub Pages/Safari build files trigger a cache/build warning.
- Retry Failed Tests, Run Again, and Copy Results controls are available after completion or failure.
- The 2.9A.30.2 foundation packages 301 browser smoke cases; the current 2.9A.33 suite packages 322.
- Save schema remains 268.


## 2.9A.30.1 stability and interface cleanup highlights

- Story rematches preserve each fighter’s actual maximum HP and Story scaling instead of forcing both sides to 100 HP.
- Focus Recovery no longer steals Block/Charge input when no gray health or usable Energy exists.
- Unsafe movement or combat states fully cancel recovery startup, and startup-only taps no longer cause the 0.3-second release penalty.
- The recovery cue reports healing from the current channel rather than the whole round.
- Training knockouts clear gray health, channel state, and temporary recovery locks.
- CPU recovery decisions now use a percentage of maximum HP, keeping Story-scaled fighters consistent.
- Mountain Path is treated as an open stage: no invisible-wall splats and no hard rectangular gameplay-border presentation.
- Stage cameras initialize from each stage profile instead of briefly starting at the Dojo distance.
- Tournament and Echo Caverns size labels now match their actual dimensions more honestly.
- Phone combat prompts occupy separate vertical lanes, Training can collapse into a small drawer, and Stage Select shows one stage at a time on mobile.
- The Sage Manual and active Arena diagnostics now display the current build label.
- Save schema remains 268.


## 2.9A.30 arena identity and recovery highlights

- Arena Select now presents five playable stages with visible size, boundary, archetype, playstyle tags, recommendations, and dimensions.
- Tangai Dojo is a small walled pressure stage; the Global Tournament is a clean ring-out and edge-control stage; the Facility, Echo Caverns, and Mountain Path now communicate different route and pursuit identities.
- Tournament boundaries react to edge pressure, heavy hits, and ring-outs with readable perimeter light, rope/crowd atmosphere, and announcer-style audio without placing obstacles inside the official ring.
- Walled stages use location-specific impact colors and particles for wall splats, while ring-out stages continue blocking wall-splat behavior.
- Focus Recovery lets fighters hold Block + Charge while stationary to restore only gray recoverable health after a 0.6-second startup.
- Focus Recovery restores 5 HP per second, spends 2 Energy per HP, caps recoverable health at 20% of maximum HP, leaves the fighter vulnerable, and creates 0.3 seconds of release recovery.
- CPU fighters recover only after earning distance, while Training adds a Focus Recovery trial and selectable dummy recovery behavior.
- No random hazards, tournament obstacles, or full multi-level platforms were added in this build.
- Save schema remains 268.


## 2.9A.29.2 combat HUD and feedback highlights

- Perfect Parry, Guard Break, Pursuit Tech, Wall Splat, Ground Bounce, full Energy, critical health, and cooldown completion now use compact event icons with consistent shapes and color language.
- Health, Energy, and Guard bars react directly to critical damage, Energy spending, full Energy, parries, and guard shatter.
- The selected ability is clearer, while only the ability whose cooldown finishes receives a short ready pulse.
- Pursuit prompts, Arena notices, Story callouts, and combat notifications now share one visual language.
- Phones use a protected prompt zone, smaller temporary feedback, extra safe-area spacing, and reduced secondary HUD emphasis during pursuit.
- Mode and Route center cards, Settings focus, Training clarity, and Results hierarchy received a small presentation pass.
- Combat balance, pursuit timing, Story progression, and save schema remain unchanged.

## 2.9A.29.1 pursuit feel and stability highlights

- Active pursuit now has dedicated speed lines, fighter-colored afterimages, a brief lock-on marker, layered chase audio, and a smooth camera pull that releases cleanly.
- Pursuit Light, Pursuit Heavy, Pursuit Tech, wall splat, and ground bounce use distinct impact cues; impact freeze and flashes still respect accessibility settings.
- Rrvvfo, Revvfo, Wade, Bark, Phanta, and Creed communicate their movement identities through more obvious particles, timing, motion, and dash sounds.
- Pursuit Tech now costs a fixed 15 Energy, spends nothing on failure, and gives the defender a short punish opportunity after a successful escape.
- Pursuit prompts support Full, Minimal, and Off modes; phones use a compact prompt, faster dismissal, safe-area placement, and a larger Dash touch target during the chase window.
- Training adds an Ideal Pursuit Combo lesson, Pursuit Pressure, selectable Pursuit Defense behavior, timing grades, one-use reaction counters, and Reset Combat State.
- Pursuit, camera, buffered-input, splat, bounce, invulnerability, and prompt state now clear during resets, pauses, round changes, match exits, and Story transitions.


## 2.9A.29 combat highlights

- Launchers and heavy attacks open clear, bounded pursuit windows; Dash begins the chase and Light or Heavy can be buffered during travel.
- A pursuit Light can link into one Heavy finisher, while combo scaling and juggle protection continue preventing loops.
- Defenders can Dash-tech an incoming pursuit; the 2.9A.29.1 tuning pass sets the current cost to 15 Energy and keeps CPU use difficulty-aware.
- Strong hits can create one wall splat per combo, and aerial Heavy finishers can create one ground bounce per combo.
- Rrvvfo, Revvfo, Wade, Bark, Phanta, and Creed now have distinct movement traits without damage bonuses.
- Pursuit camera framing, prompts, hit feedback, sound cues, and Training trials make the new routes readable.


## 2.9A.28.1 mobile comfort hotfix

- Mobile Story hubs now show one compact objective card and one Story Menu button instead of several full-size controls across the screen.
- Objective details are collapsed by default and can be expanded with the small information button.
- The always-visible minimap is removed on phones; the dedicated Map button still opens the complete map.
- Chapter 1–4 Story menus open as spacious, scrollable mobile sheets with important actions near the top.
- Technique categories scroll horizontally, journals use one readable column, and touchscreen-only menus hide redundant keyboard/controller legends.
- Case boards, mission journals, and the full map use the safe mobile viewport rather than narrow desktop panels.

## 2.9A.28 highlights

- Main Menu now uses a one-mode-at-a-time carousel with arrows, swipe navigation, controller/keyboard support, side previews, and a dedicated information panel.
- Story Mode now opens a matching one-character-at-a-time Route Select screen.
- Rrvvfo is the only currently selectable story route; the structure is ready for later routes without inventing their details or unlock milestones.
- Story description now begins: “Experience what happened after Rrvvfo defeated Revvfo.”
- Selecting Rrvvfo opens his route and Chapter Select instead of automatically launching a chapter.
- Existing mode unlocks, Quick Continue, chapter replay, saves, and Chapters 1–4 remain intact.

## 2.9A.27.2 hotfix

- Roadside-fight losses now open a visible recovery menu instead of appearing frozen.
- The road hub HUD, menu buttons, objective strip, and map hide during combat.
- Tournament Road map objectives now cover route choice, branch travel, transport rescue, roadside challenge, checkpoint, and arrival.
- Map markers use a clear legend and distinct shapes for goals, places, routes, and optional content.
- The full uploaded smoke-test report was synchronized with the current pacing and Chapter 4 systems.

## 2.9A.27.1 hotfix

- Chapter 4 Replay and Restart now always begin from a clean Echo Region state.
- Older saves that record Chapter 4 completion only in `chapter4State.chapterComplete` are recognized correctly.
- Replay preserves the player’s original completed/in-progress Chapter 4 save and checkpoint.
- Chapter 4 completion now hides the map, exploration HUD, prompts, and stale objective toast.

## 2.9A.27 highlights

- Chapter 1 begins with an active Sage spar instead of repeated stationary button demonstrations.
- Shots of Agony training now proves the one-copy idea, then jumps to the four-copy finish instead of repeating every count.
- Tournament Road offers Main Road, Forest Shortcut, and Cliff Route choices that reconnect before the tournament.
- A stranded tournament transport creates a memorable Object Swap set piece before arrival.
- Chapter 2 gives Plouke information through watched matches and requires fewer rumor errands between rounds.
- A temporary ring-support shift adds a tournament set piece that foreshadows Chapter 3.
- Chapter 3 replaces the damaged-terminal loop with one security-footage reconstruction and shortens the Lens trail.
- The Project Hollow discovery now triggers a stronger facility-lockdown payoff.
- Chapter 4 adds a post-defense team rest scene, switchable Bark/Wade commands, and changed cavern-return dialogue.

## Previous foundation

- Chapter 2 and Chapter 3 results score their actual optional-quest state.
- Chapter completion uses one results flow with per-run statistics.
- The secret playtest code only works from the Story route menu.
- Hub free camera uses click-and-drag, includes Reset Camera, and stops behind menus.
- Hub collision blocks major walls, buildings, trees, columns, cavern structures, and Echo Village architecture.
- Chapter 3 uses consolidated evidence sweeps instead of repeated plaza laps.
- Chapter 4 includes role-specific team mechanics, three-ninja wave battles, optional swarms, a smarter Hollow Watcher, and reward soft caps.
- The Strange Man investigation, Echo Region route, Ryuzankaro branch, Vibration Sense, and floating-lookout Object Swap ending remain intact.

## Story progression

Rrvvfo's route is planned for **eight chapters**. Four are currently playable, so completing Chapter 4 reports **4/8 — 50%**.

- **Chapter 1:** Shots of Agony training, Sage Manual, combat refresher, and wooded Tournament Road
- **Chapter 2:** martial-arts festival hub, preparation activities, tournament bracket, and Plouke
- **Chapter 3:** after-hours investigation, Strange Man warning, Resonance Facility, Project Hollow, and teleporter escape
- **Chapter 4:** Echo Village, Bark and Wade team missions, optional Ryuzankaro secret boss, solo mountain route, Hollow Watcher, and the pebble Object Swap into Shadow's floating lookout
- **Chapters 5–8:** planned but intentionally undescribed until their official story plans exist

## Playable modes

- Rrvvfo Story: Chapters 1–4
- Four standard playable fighters: Rrvvfo, Revvfo, Wade, and Bark
- The Sage as a Story-only mentor and opponent
- Training from the start
- VS CPU after Chapter 1
- Local two-player after Chapter 2
- Arena after Chapter 3
- Keyboard and mouse, Nintendo, Xbox, PlayStation, custom-controller, and touch input

## Main controls

- Move/depth: **W / A / S / D**
- Jump: **Space**
- Light: **Left Click** or **J**
- Heavy: **K**
- Launcher: **I**
- Grab: **U**
- Dash: **Shift**
- Block: **Right Click** or **L**
- Charge: **C**
- Combo Breaker: **R**
- Counter: **Q**
- Interact: **E**
- Activate selected ability: **O**
- Ability slots: **1–5**
- Lens shortcut: **Z**
- Vibration Sense after unlocking: **V** or ability slot 4 while exploring Chapter 4
- Sage Manual: **M**
- Objective tracker / evidence board: **T**
- Pause/Story menu: **Escape**
- Hub camera: click-and-drag with a mouse/trackpad or controller right stick; can be disabled under Settings → Gameplay

## Secret playtest menu

On the Story route screen, enter:

```text
↑ ↑ ↓ ↓ ← → ← → B A
```

The menu can inspect flags, export bug reports, restart from checkpoints, reset chapters, jump to released chapters, and launch isolated combat tests.

## Save compatibility

Save-export schema: **268**. Existing Story saves continue through the current state normalizers.

## Testing

Use [`FRIEND-PLAYTEST-CHECKLIST-2.9A.33.md`](FRIEND-PLAYTEST-CHECKLIST-2.9A.33.md) for the real-device pass. See [`PATCH-NOTES-2.9A.33.md`](PATCH-NOTES-2.9A.33.md) and [`VALIDATION-2.9A.33.md`](VALIDATION-2.9A.33.md) for release details.
