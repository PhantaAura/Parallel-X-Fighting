# Parallels X: Clash of Souls — Prototype 2.3.5 QOL Build

A dependency-free browser fighting game with Story Mode, VS CPU, local multiplayer, configurable rounds, five stages, 15 playable fighters, browser saves, keyboard/controller/touch input, clashes, advanced defense, cinematic ultimates, Training Mode, an optional experimental Rrvvfo sprite pipeline, and a full quality-of-life shell for replay, pause, settings, accessibility, and save management.

The public build is hosted at [https://phantaaura.github.io/Parallel-X-Fighting/](https://phantaaura.github.io/Parallel-X-Fighting/).

## Run

Serve the project directory with any static web server, then open `index.html`. ES modules do not work reliably from a `file://` URL.

Example: `python3 -m http.server 4173`, then visit `http://127.0.0.1:4173/`.

## Project structure

- `index.html` — accessible game/menu markup and module entry point
- `css/game.css` — original presentation and responsive layout
- `css/combat.css` — combo, cooldown, and clash HUD
- `css/training.css` — Training Mode controls and diagnostics
- `css/mobile.css` — phone/tablet safe areas, touch controls, mobile modals, and portrait fallback
- `css/qol.css` — start/main menu, pause/results, settings, accessibility, loading, and HUD polish
- `js/main.js` — initialization, match lifecycle, update loop, and render coordination
- `js/roster.js` — all 15 character identities, base attributes, and select-screen metadata
- `js/movesets.js` — Rrvvfo, Revvfo, Wade, and Bark move data
- `js/fighter.js` — fighter state, attack resolution, specials, ultimates, and drawing
- `js/combat.js` — projectile class, attack categories, final-damage calculation, combo rules, juggle rules, and managed delayed timers
- `js/input.js` — semantic keyboard/touch/controller actions, style translation, simultaneous-input detection, and hit-stop buffering
- `js/controller-manager.js` — controller detection, saved styles/assignments, menu navigation, pause, and test-screen coordination
- `js/touch-controls.js` — multi-pointer joystick/D-Pad and combat-action translation
- `js/touch-layout-editor.js` — touch presets, per-control placement/sizing, and named custom layouts
- `js/mobile-platform.js` — iOS/Android detection, match-only browser protection, Back handling, persistence, fullscreen, and haptics
- `js/mobile-safe-area.js` — display-cutout, browser-bar, resize, and orientation tracking
- `js/ai.js` — difficulty profiles and CPU decisions
- `js/effects.js` — particle/effect state and rendering
- `js/stages.js` — stage data and rendering
- `js/clash-system.js` — melee, beam, projectile, and ultimate clashes
- `js/guard-system.js` — guard, perfect-block, throw, breaker, chip, and dash-defense rules
- `js/ultimate-system.js` — character ultimate data and cinematic lifecycle
- `js/camera-system.js` — focus, zoom, freeze, shake, and guaranteed camera restoration
- `js/audio-manager.js` — organized combat/menu audio hooks and independent volume routing
- `js/build-info.js` — centralized Prototype 2.3.5 build label and save-schema version
- `js/main-menu.js` — main-menu data, mode previews, duplicate-confirm protection, and Coming Later states
- `js/pause-menu.js`, `js/results-screen.js` — unified pause actions and post-match replay navigation
- `js/match-statistics.js`, `js/hud-model.js` — actual-damage match summaries and readable fighter HUD state
- `js/move-list.js` — adaptive Keyboard/Nintendo/Xbox/PlayStation/Touch/Custom move prompts
- `js/qol-settings.js`, `js/settings-panel.js` — persistent categorized settings and sanitization
- `js/save-manager.js` — versioned safe export/import and scoped reset operations
- `js/loading-manager.js`, `js/notification-system.js`, `js/confirmation-dialog.js` — recoverable loading, rate-limited feedback, and protected destructive actions
- `js/training-presets.js`, `js/first-time-hints.js` — named Training setups and optional input-aware guidance
- `js/sprite-atlas.js` — cached relative-path atlas/manifest/effect loading
- `js/sprite-animation.js` — reusable frame timing, looping, events, and animation priority
- `js/sprite-renderer.js` — grounded, flipped, depth-ready sprite and effect drawing
- `js/fighter-visuals.js` — combat-state-to-animation adapter and safe legacy fallback
- `js/sprite-debug-viewer.js` — developer-only animation inspection panel
- `js/story.js` — story ladder and compatible `pxSave` key
- `js/training.js` — isolated Training Mode settings and reset behavior
- `js/ui.js` — UI lookup boundary
- `tests/smoke.html`, `tests/smoke.js` — dependency-free browser smoke tests
- `assets/fighters/rrvvfo/` — generated Rrvvfo atlas, manifest, source archive, and layered effects
- `tools/build-rrvvfo-atlas.py` — Pillow-based development-time atlas generator
- `docs/RRVVFO-SPRITE-PIPELINE.md` — crop, anchor, rebuild, reuse, and cleanup documentation

## Keyboard controls

| Action | Player 1 | Player 2 |
|---|---|---|
| Move | A / D | Left / Right |
| Jump | W or Space | Up |
| Block | S | Down |
| Light / air light | F | J |
| Heavy / air heavy | R | I |
| Throw | F + R | J + I |
| Combo breaker | S + G | Down + K |
| Launcher | T | U |
| Bark counter | E | Semicolon (;) |
| Special | G | K |
| Ultimate | H | L |
| Lens of Truth (Rrvvfo) | Z | N |
| Dash | Q | O |
| Pause | P | P |
| Training position reset | Y | Y |
| Quick Restart | Hold Backspace outside Training; immediate in Training | Same |

## Controller controls

Select Nintendo, Xbox, PlayStation, or Custom for each player on Character Select. Controller styles translate physical buttons into the existing combat actions; they do not change combo timing, damage, scaling, cancels, or recovery.

| Action | Nintendo | Xbox | PlayStation |
|---|---|---|---|
| Jump | A | A | Cross |
| Light / air light | B | X | Square |
| Heavy / air heavy | Y | Y | Triangle |
| Special | X | B | Circle |
| Launcher | Up + Y | Up + Y | Up + Triangle |
| Dash / movement ability | R | RB | R1 |
| Block | L | LB | L1 |
| Ultimate | ZR | RT | R2 |
| Combo breaker | ZL | LT | L2 |
| Throw | B + Y | X + Y | Square + Triangle |
| Bark counter | Left-stick click | LS | L3 |
| Lens of Truth | Right-stick click | RS | R3 |

Move with the left stick or D-pad. The first detected controller opens a setup prompt for Nintendo, Xbox, PlayStation, or Custom style and Player 1/Player 2 assignment. Styles, custom buttons, and device assignments use the `pxControllerSettingsV1` save key. Connection and disconnection events update the assignment selectors without clearing keyboard or touch input. The controller can navigate Character Select, change focused selects, confirm buttons, pause with Start/Menu, and use the Controller Test screen. Two standard gamepads are supported in local multiplayer. Custom mappings can reassign Jump, Light, Heavy, Special, Dash, Block, Ultimate, and Breaker; Launcher and Throw prompts automatically follow the selected Heavy and Light bindings.

Start/Menu pauses. Minus/View/Create/Touchpad is the suggested remappable Quick Restart control; outside Training, restart still requires a hold/confirmation so it cannot happen accidentally. A disconnected assigned controller pauses the match, clears held state, reports the affected player, and restores its prior assignment where the browser exposes a stable reconnect identity. The match stays paused until reconnection is confirmed. Saved dead zones prevent an idle stick from moving menus or fighters while keyboard input remains active.

## iPhone, iPad, and Android touch controls

Touch controls use the same semantic actions and combat engine as keyboard and controller input. They do not duplicate attacks or change combo timing, damage, scaling, range, startup, recovery, or cancels. On first touch use, the game asks **“Choose your movement style”** with Virtual Joystick, D-Pad, and Decide Later. The choice is stored under `pxTouchSettingsV1` and can be changed from **TOUCH SETTINGS** at any time. Choose Auto detect, Always on, or Off if device detection does not match your setup.

- **Virtual Joystick:** fixed or follow-finger placement, adjustable dead zone, size, and sensitivity, with diagonal movement. Up is available for directional attacks, but Jump remains a separate button.
- **Virtual D-Pad:** large independent Up, Down, Left, and Right targets. Two compatible directions create diagonals; the latest direction wins if opposites are touched.
- **Combat buttons:** Jump, Light, Heavy, Special, Block, Dash, Ultimate, Combo Breaker, Launcher, and optional Throw. Rrvvfo receives a contextual Lens button, Bark receives Counter, and Training adds Reset.
- **Throws:** press Light + Heavy at the same time or use the optional Throw button. Both paths send the same throw action with identical startup, range, damage, and recovery.
- **Touch routes:** Light → Light → Light; Light → Light → Heavy; Light → Light → Launcher; Launcher → Jump → Air Light → Air Heavy; and legal special/ultimate cancels all use the normal combo rules.
- **Clashes:** one large clash control replaces the combat cluster. Repeated Tap, Timed Tap, and Hold and Pulse are selectable and share the same attainable maximum strength. Accepted taps are rate-capped.

Presets include Standard Joystick, Standard D-Pad, Compact Joystick, Compact D-Pad, Large Buttons, Left-Handed, Tablet, and Simplified. Settings can resize/reposition every control, change spacing and opacity, swap sides, enable or disable dedicated Throw/Launcher, lock the layout, reset defaults, and save up to eight named custom layouts. The same quick panel is available from Pause. Unlock **Drag controls in the match view** to place controls directly. Simplified mode can continue only the basic three-light chain; it never automates launchers, specials, ultimates, perfect blocks, throws, or breakers.

The 12-step touch tutorial teaches the selected movement style, Jump, normals, Launcher and air combo, Special, Block/perfect block, Dash, Throw, Breaker, Ultimate, and clash input. Training Mode changes its route and input-history labels to Touch automatically.

Mobile layout uses iOS safe-area insets and Android display-cutout space, tracks Safari/Chrome visual-viewport resizing and orientation changes, and keeps controls above the home indicator/navigation area. Landscape is recommended; portrait displays a rotate-device suggestion and keeps a playable fallback. During a match only, page scrolling, selection, callouts, gestures, and double-tap zoom are suppressed. Normal page behavior is restored after leaving the match. Android Back pauses first instead of immediately leaving the game. Fullscreen is available where the browser permits it.

Optional Haptics On, Reduced Haptics, and Haptics Off modes cover heavy hits, perfect blocks, guard breaks, clashes, and ultimate activation. Vibration is never required for gameplay.

## Combo mechanics

Lights chain into character-specific three-hit strings. Light → Light → Heavy creates a heavy finisher, while Light → Light → Launcher or Special uses the same legal cancel path on every input device. The final ground-light hit adds pushback and a short light-chain lockout, so repeatedly cycling 1-2-3 cannot form an infinite wall loop. Heavy attacks are slower and more punishable. Launchers start air routes; Light and Heavy become distinct air normals while airborne. Connected hits build a counter and total-damage readout. Each successive hit scales down, with a non-zero damage floor and stronger minimum scaling for specials/ultimates. Six air juggles force knockdown; get-up frames are briefly invulnerable. Combos reset after recovery or a short no-hit window.

The input manager distinguishes sequences, held Block, Up + Heavy launchers, and simultaneous Light + Heavy throws. Attack buttons use a three-frame simultaneous window: pressing them together throws, while an ordinary Light → Heavy sequence stays a combo. Legal inputs entered during hit-stop remain buffered for 12 simulation frames. Buffers expire naturally and are explicitly cleared on round transitions, clashes, cinematics, Training resets, pause changes, and return to Character Select.

Taking a hit during unarmored attack startup cancels the pending attack. Bark’s intentionally armored heavy is the exception while its startup armor is active.

## Clash system

Compatible heavy attacks, beams, high-power projectiles, and simultaneous ultimates can clash. Melee clashes briefly freeze and separate both fighters; players press light or heavy at a four-frame input limit to move the struggle meter. Beam clashes hold both projectiles at their collision point. Ultimate clashes use a longer meter and larger—but non-lethal—clash damage. CPU contribution uses difficulty and fighter identity without a damage multiplier.

Every clash has a 120-frame repeat cooldown. Round transitions, Training reset, quick restart, and character select clear clash state. Training can arm the next compatible clash, hold the clash meter indefinitely, display its current type/value, or reset it directly.

## Advanced defense

- Guard starts at 100. Lights deal low guard damage; heavies, launchers, specials, and ultimates deal progressively more.
- Guard regenerates only after its delay while the fighter is not blocking, attacking, stunned, knocked down, or getting up.
- Zero guard causes a 45-frame guard-break stun, then restores a safe portion of guard to prevent immediate break loops.
- The first six frames of a new block are a perfect-block window. Perfect blocks sharply reduce chip/guard damage, push the attacker, grant nine energy, and create a small frame advantage.
- Blocking lights causes no chip. Other chip is limited and cannot reduce health below 1.
- Throws beat blocking at close range, have seven startup frames, cannot start a combo, and grant 90 frames of throw protection.
- A combo breaker costs 85 energy, works only during normal hitstun, deals no major damage, and is limited to one use per round.
- Creed and Phanta have the strongest dash-evasion windows. Rrvvfo, Wade, and the rest have shorter windows plus punishable recovery.

CPU fighters retreat with low guard, vary blocking/perfect-block consistency by difficulty, throw blocking opponents without spamming, use breakers selectively, pressure guard, and participate in clashes. Difficulty never changes damage or reads player input.

## Cinematic ultimates

Every fighter has a distinct, data-driven ultimate with startup, range, recovery, energy cost, damage, camera treatment, and visual pattern. Ultimates cost 90 energy, use a 300-frame lockout, deal 25–38 base damage, and cannot one-shot a full-health normal fighter. Missing leaves the attacker in character-specific recovery.

The mode menu offers Full, Short, and Off cinematic settings. Local multiplayer automatically uses the shorter presentation. Camera state is restored after completion, interruption, round transitions, Training reset/exit, quick restart, and return to character select.

Rrvvfo’s new ultimate is **Fire Awakening: Solar Weave**. Lens of Truth remains a separate Z/N ability and Shots of Agony remains a separate special. Rev joins the roster with Mechanical Barrage zoning and Maximum Mechanical Ovation.

## Expanded fighters

- **Rrvvfo:** fire light chain, Flame Heavy/Launcher, air fire attacks, Fire Blast, Shots of Agony, Object Swap Dash, and Lens of Truth
- **Revvfo:** Astrylte blade chain, heavy/teleport launcher, air blade attacks, Beam, Teleport Strike, Astrylte Dragon behavior, and Perfected State
- **Wade:** rapid low-damage normals, lightning launcher, fast air attacks, Flash Step, Barrage, one air dash per jump, and Thunderstorm
- **Bark:** slow high-damage chain, armored heavy, Earth Launcher, Air Slam, temporary Rock Armor, Earth Wall, deliberate Seismic Counter, and Earthquake

Other roster members retain their legacy specials/ultimates and shared normal toolkit.

## Lens of Truth

Rrvvfo needs 90 energy. Press Z for Player 1, N for Player 2, or the right-stick click. Activation sacrifices exactly 50 health but never lowers him below 1 HP. For four seconds, incoming melee, projectile, special, and ultimate hits trigger short repositioning teleports. Human-controlled Rrvvfo receives a blindness overlay; CPU Rrvvfo does not obscure a human player’s view. The overlay warns during the final second. A 300-frame cooldown prevents repeated use.

Flow State is not implemented in Prototype 2.3 and is intentionally separate from Lens of Truth.

In local multiplayer, both players share one canvas, so a human Rrvvfo’s blindness overlay obscures the shared screen.

## Experimental Rrvvfo sprites

Character Select includes **Experimental Rrvvfo Sprites: On/Off**. Fresh saves default to Off while the concept-derived artwork awaits manual cleanup. Off preserves the original procedural Rrvvfo rendering exactly. On preloads a generated 1536 × 1920 atlas before any match containing Rrvvfo and maps existing combat state to 192 × 192 normalized frames. A loading failure or malformed manifest automatically restores the original visuals so Rrvvfo can never begin invisible. An explicit On or Off choice persists without rewriting untouched legacy Off values.

When a player slot contains Rrvvfo, Character Select shows that slot’s **RRVVFO APPEARANCE** selector and live preview. Hood Down is the default. Player 1, Player 2, Training Player 1, and the Training dummy store separate appearance choices under `pxRrvvfoVisualsV1`; the choice is copied onto the individual `Fighter` instance. Appearance never changes movement, damage, hitboxes, cooldowns, AI, combos, defense, or abilities.

**Hood Up — Prototype** is unfinished and hidden in production builds. On localhost or a URL with `?developer=1`, enable **Expose unfinished appearances** to inspect it. Character Select warns that dedicated Hood Up animations are still in development. The supplied Hood Up concept sheet is archived at `docs/reference/rrvvfo-hood-up-prototype-sheet.jpg` but is not loaded or cropped into gameplay on this stabilization branch. Current Hood Up runtime frames remain sparse and repeated; they are preserved only for future atlas work.

Full quality enables up to three visual afterimages and larger layered effects. Reduced quality keeps the same animation/combat behavior with fewer effects for mobile hardware. The atlas is cached after first load and all paths are relative for GitHub Pages deployment under `/Parallel-X-Fighting/`.

The developer-only sprite viewer can play/pause animations, step frames, change speed/facing/appearance/mobile scale, and display ground pivots, projectile anchors, visual bounds, and combat boxes separately. Edge testing supports black, white, red, blue, and transparent-checkerboard backgrounds. See [the pipeline guide](docs/RRVVFO-SPRITE-PIPELINE.md) for source limitations and rebuild instructions.

## Shots of Agony

Shots of Agony costs 40 energy and creates exactly four clones around the opponent. All four clones appear before the attack starts, then fire together after the visual tell. Rrvvfo cannot begin another volley—or regenerate the spent energy—while its clones or projectiles remain active. Once all four clones fire, a 300-frame (about five-second) cooldown begins. The energy HUD reports the active volley and its remaining cooldown together. CPU-controlled Rrvvfo follows the same restrictions. A full unblocked volley deals roughly 25–30 health to an average-defense fighter.

## CPU behavior

Every fighter has character-specific priorities layered over the shared legal-action checks. Rrvvfo manages ranged fire pressure, Shots availability, and Lens; Revvfo teleports into launcher routes; Wade rushes down and occasionally retreats after a string; Bark favors defense, armor, deliberate counters, and slow punishes; Alt pressures and spends rage aggressively; Robert controls range with ice; Virek shifts between melee and ranged play; Shadow spaces, fires projectiles, and heals when appropriate; Phanta uses unpredictable movement, clone pressure, and sudden punishes; Creed emphasizes evasion and whiff punishment; Rev uses mechanical zoning. The remaining roster profiles select their existing specials and ultimates according to range and resources.

Difficulty changes reaction delay, decision quality, blocking consistency, aggression, and combo completion. It never changes fighter damage and does not grant perfect input reading.

## Bark’s Seismic Counter

Press E for Player 1, semicolon for Player 2, or click the left stick on a controller. The stance costs 20 energy and has six startup frames, a 12-frame active window, 30 recovery frames, and a 90-frame cooldown. It counters only nearby light, heavy, launcher, and air melee attacks. Ordinary blocking never counters. Projectiles and ranged specials hit Bark normally, and a missed counter leaves him in recovery.

## Prototype 2.3.5 match flow and menus

The first launch uses a **Press Any Button / Tap to Start** screen, then opens a lightweight Parallels X main menu. Story, VS CPU, Local 2 Player, and Training open the existing playable setup. Arcade is visibly marked **Coming Later** and cannot open a broken screen. Mode previews show player count, input notes, availability, and honest story status. Quick Continue restores the last setup page but never starts a match without confirmation. The displayed build label comes only from `js/build-info.js`.

Every completed non-Training match provides **Rematch**, **Change Character**, **Change Stage**, **Return to Mode Select**, and **Return to Main Menu**. Rematch keeps fighters, per-player appearances, stage, rules, difficulty, controller styles, and assigned devices while rebuilding all runtime fighter and transient state without reloading the page. Change Character preserves rules and stage; Change Stage preserves fighters and appearances.

The shared Pause menu freezes simulation, AI, round time, cooldowns, cinematics, and delayed decisions. It offers Resume, Move List, Controls, conditional Training/Mobile settings, Restart, Character Select, Stage Select, Settings, and Quit. Resume clears menu-only buffered input without altering legitimate combat state. Local 2 Player identifies which assigned player opened Pause. Quit, restart outside Training, and in-match navigation use confirmations.

The results panel reports actual post-defense damage, match duration, highest combo/count, perfect blocks, guard breaks, throws, breakers, clashes, special/ultimate use, and remaining resources for both players. Training intentionally skips normal results.

## Settings, accessibility, audio, and saves

Settings are grouped into Gameplay, Controls, Touch Controls, Controller, Audio, Video, Accessibility, HUD, Save Data, and a localhost/developer-only category. Apply commits a sanitized draft; Cancel or close warns before discarding unsaved edits. Restore Category and Restore All Defaults are separate confirmed actions.

- **Audio:** Master, Music, Sound Effects, UI, and future Voice volume; Mute All; and Audio Test. Menu/controller cues use UI Volume while combat uses Sound Effects Volume. Browser autoplay suspension is treated as a normal interaction requirement.
- **Accessibility:** Full/Reduced/Off camera shake, screen flash, hit flash, and background motion; reduced ultimate effects; reduced Lens-overlay intensity; high-contrast HUD; larger text; stronger sprite outlines; and selectable clash methods. These settings never alter damage, hitboxes, timing, AI, or cooldowns. Because Local 2 Player shares one canvas, Lens still affects the shared view; Reduced Intensity is the supported accessibility option.
- **HUD:** Full, Compact, Minimal, or automatic mobile layout. Health, energy, guard, breaker/ultimate availability, status text, combo/damage, cooldown icons, and Rrvvfo’s Shots/Lens/Object Swap information do not rely on color alone.
- **Video:** Low, Medium, High, and Automatic presets cap particles and optional visual complexity only. Sprite smoothing, reduced menu motion, and an opt-in developer FPS counter do not affect simulation.
- **Save Data:** Export produces inert JSON with schema `235`; import accepts only known string keys, validates nested JSON, and rolls back if writing fails. Settings-only, Training-preset, and full reset paths are scoped and confirmed. Existing `pxSave`, controller, touch, and Rrvvfo visual keys remain compatible.

Combat messages can be Full, Important Only, or Off. Feedback is rate-limited so a held button cannot repeat warnings every frame. Optional hints use the active input style and wait until no combo, clash, or cinematic is active.

## Training Mode

Choose Training Mode from the mode menu. Configure infinite health, energy, guard, guard regeneration, perfect-block practice, clash testing, and dummy behavior. Pre-match and live Training controls stay synchronized. During training, live controls can switch the dummy among:

- **Never Block:** stationary, passive, and never blocks.
- **Always Block:** stationary, passive, and always blocks.
- **Block After First Hit:** the first hit connects, then the stationary dummy blocks.
- **Perfect Block:** the stationary dummy perfect-blocks incoming attacks.
- **Use Breaker:** the stationary dummy spends its breaker when put in hitstun.
- **Stationary:** stationary and passive; the separate “Stationary blocks” checkbox controls blocking.
- **CPU Dummy:** fully controlled by the selected CPU difficulty.

Additional future-ready choices include Crouch, Jump, Walk, Counterattack After Hit, Throw Attempt, and Random Defense. They use the same semantic gameplay actions as players and do not duplicate attacks.

Perfect-block practice makes the stationary dummy throw a slow heavy at a predictable interval. Player 2 keyboard and controller attacks are ignored for every other non-CPU behavior. The HUD shows combo count, actual post-defense combo damage, scaling, guard damage, perfect-block timing, clash state, move list, the last 20 semantic actions, and a launcher-to-air-combo route written for the most recently used Keyboard, Nintendo, Xbox, PlayStation, Touch, or Custom layout.

Reset Training with Y, Backspace, the touch Reset control, or the on-screen button. A reset cancels delayed attacks and clears projectiles, particles, effects, clashes, cinematics, camera transforms, Lens, armor, aura, traps, freeze, invulnerability, hitstun, guard-break/get-up state, startup, throws, breakers, counters, cooldowns, air dashes, juggle count, light-chain position, combo state, guard values, and both fighter positions. Quick tools can reset center/near either wall, swap sides, refill one resource, clear cooldowns/projectiles/clones/Lens/Object Swap/combo state, and save or load named Training presets.

Use the always-visible **EXIT TRAINING** button, or choose Character Select from Pause. Escape opens/closes the consistent Pause flow. Exiting clears delayed attacks, projectiles, effects, input state, temporary abilities, and Training session state. Training settings do not affect Story, VS CPU, or local multiplayer.

## Smoke tests

With the local server running, open `http://127.0.0.1:4173/tests/smoke.html`.

The browser suite contains **134 checks** covering all Prototype 2.2/2.3 regressions plus controller/touch mappings, combat systems, sprite fallback/appearance, menu availability, pause simulation gating, post-match actions/statistics, adaptive move prompts, QOL setting persistence, accessibility balance isolation, notification throttling, versioned save export/import/rollback, Training presets/tools, controller drift filtering, and first-time hints.

## Save compatibility

Story completion continues to use the existing `pxSave` browser-storage key. Controller, touch, and Rrvvfo visual keys are preserved. QOL settings use `pxQolSettingsV1`; Training presets use `pxTrainingPresetsV1`; exported saves declare schema 235. Mirror matches remain disabled.

## Known limitations

- Rrvvfo has optional experimental sprites; all other fighters still use procedural canvas art.
- The concept sheets are JPEG reference art, so frames retain compression halos and require manual edge cleanup before production use. The current Hood Up runtime variant still reuses sparse poses; the newer full Hood Up concept sheet is reference-only in this branch.
- Detailed hitbox visualization is not implemented; the previous nonfunctional toggle has been removed.
- Expanded fighters use contextual single-button specials rather than command motions.
- Flow State is reserved for a later prototype and is not part of Lens of Truth.
- Audio uses synthesized hooks until final sound and music assets are available.
- Music and voice sliders are saved and routed for future files, but this build has no final music or voice library.
- Cinematics use procedural 2D canvas effects; full sprite animation remains future presentation work.
- Automated browser checks verify semantic touch/controller behavior, saved assignment logic, and mobile layout calculations, but hot-plug timing and menu feel across physical Nintendo/Xbox/PlayStation controllers, iOS Safari browser chrome, Android navigation modes, display cutouts, vibration support, and multi-finger ergonomics should also be tested on representative hardware.
