# Parallels X: Clash of Souls

**A 2.5D arena fighter and RPG built around kinetic movement, pursuit combos, parries, character techniques, exploration, side quests, and continuous Story progression.**

Play the GitHub Pages build: <https://phantaaura.github.io/Parallel-X-Fighting/>

## Current build

**Prototype 2.9A.36 — Playful Exploration & Quest Variety**

This is a complete cumulative build. No older package is required.


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
