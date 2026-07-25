# Parallels X: Clash of Souls — Prototype 2.3

A dependency-free browser fighting game with Story Mode, VS CPU, local multiplayer, configurable rounds, five stages, 15 playable fighters, browser saves, keyboard/controller/touch input, clashes, advanced defense, cinematic ultimates, and Training Mode.

## Run

Serve the project directory with any static web server, then open `index.html`. ES modules do not work reliably from a `file://` URL.

Example: `python3 -m http.server 4173`, then visit `http://127.0.0.1:4173/`.

## Project structure

- `index.html` — accessible game/menu markup and module entry point
- `css/game.css` — original presentation and responsive layout
- `css/combat.css` — combo, cooldown, and clash HUD
- `css/training.css` — Training Mode controls and diagnostics
- `js/main.js` — initialization, match lifecycle, update loop, and render coordination
- `js/roster.js` — all 15 character identities, base attributes, and select-screen metadata
- `js/movesets.js` — Rrvvfo, Revvfo, Wade, and Bark move data
- `js/fighter.js` — fighter state, attack resolution, specials, ultimates, and drawing
- `js/combat.js` — projectile class, attack categories, final-damage calculation, combo rules, juggle rules, and managed delayed timers
- `js/input.js` — separate keyboard/touch/controller state combined into one input stream
- `js/ai.js` — difficulty profiles and CPU decisions
- `js/effects.js` — particle/effect state and rendering
- `js/stages.js` — stage data and rendering
- `js/clash-system.js` — melee, beam, projectile, and ultimate clashes
- `js/guard-system.js` — guard, perfect-block, throw, breaker, chip, and dash-defense rules
- `js/ultimate-system.js` — character ultimate data and cinematic lifecycle
- `js/camera-system.js` — focus, zoom, freeze, shake, and guaranteed camera restoration
- `js/audio-manager.js` — organized combat and round audio hooks
- `js/story.js` — story ladder and compatible `pxSave` key
- `js/training.js` — isolated Training Mode settings and reset behavior
- `js/ui.js` — UI lookup boundary
- `tests/smoke.html`, `tests/smoke.js` — dependency-free browser smoke tests
- `assets/` — reserved portraits, sprites, sounds, and music

## Keyboard controls

| Action | Player 1 | Player 2 |
|---|---|---|
| Move | A / D | Left / Right |
| Jump | W or Space | Up |
| Block | S | Down |
| Light / air attack | F | J |
| Heavy | R | I |
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

Touch controls include movement, jump, block, light, heavy, throw, breaker, special, ultimate, and Lens access.

## Controller controls

- Left stick/D-pad: move; left trigger/D-pad down: block
- A / Cross: light
- B / Circle: heavy
- X / Square: launcher
- Y / Triangle: special
- Left bumper: ultimate
- Right bumper: dash
- Right trigger: jump
- Left-stick click: Bark counter
- Light + heavy buttons together: throw
- Block + special together: combo breaker
- Right-stick click: Lens of Truth when controlling Rrvvfo

Two standard gamepads are supported in local multiplayer.

## Combo mechanics

Lights chain into character-specific three-hit strings. The final ground-light hit adds pushback and a short light-chain lockout, so repeatedly cycling 1-2-3 cannot form an infinite wall loop. Heavy attacks are slower and more punishable. Launchers start air routes, and the light button performs air attacks while airborne. Connected hits build a counter and total-damage readout. Each successive hit scales down, with a non-zero damage floor and stronger minimum scaling for specials/ultimates. Six air juggles force knockdown; get-up frames are briefly invulnerable. Combos reset after recovery or a short no-hit window.

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

## Shots of Agony

Shots of Agony costs 40 energy and creates exactly four clones around the opponent. All four clones appear before the attack starts, then fire together after the visual tell. Rrvvfo cannot begin another volley—or regenerate the spent energy—while its clones or projectiles remain active. Once all four clones fire, a 300-frame (about five-second) cooldown begins. The energy HUD reports the active volley and its remaining cooldown together. CPU-controlled Rrvvfo follows the same restrictions. A full unblocked volley deals roughly 25–30 health to an average-defense fighter.

## CPU behavior

Every fighter has character-specific priorities layered over the shared legal-action checks. Rrvvfo manages ranged fire pressure, Shots availability, and Lens; Revvfo teleports into launcher routes; Wade rushes down and occasionally retreats after a string; Bark favors defense, armor, deliberate counters, and slow punishes; Alt pressures and spends rage aggressively; Robert controls range with ice; Virek shifts between melee and ranged play; Shadow spaces, fires projectiles, and heals when appropriate; Phanta uses unpredictable movement, clone pressure, and sudden punishes; Creed emphasizes evasion and whiff punishment; Rev uses mechanical zoning. The remaining roster profiles select their existing specials and ultimates according to range and resources.

Difficulty changes reaction delay, decision quality, blocking consistency, aggression, and combo completion. It never changes fighter damage and does not grant perfect input reading.

## Bark’s Seismic Counter

Press E for Player 1, semicolon for Player 2, or click the left stick on a controller. The stance costs 20 energy and has six startup frames, a 12-frame active window, 30 recovery frames, and a 90-frame cooldown. It counters only nearby light, heavy, launcher, and air melee attacks. Ordinary blocking never counters. Projectiles and ranged specials hit Bark normally, and a missed counter leaves him in recovery.

## Training Mode

Choose Training Mode from the mode menu. Configure infinite health, energy, guard, guard regeneration, perfect-block practice, clash testing, and dummy behavior. Pre-match and live Training controls stay synchronized. During training, live controls can switch the dummy among:

- **Never Block:** stationary, passive, and never blocks.
- **Always Block:** stationary, passive, and always blocks.
- **Block After First Hit:** the first hit connects, then the stationary dummy blocks.
- **Perfect Block:** the stationary dummy perfect-blocks incoming attacks.
- **Use Breaker:** the stationary dummy spends its breaker when put in hitstun.
- **Stationary:** stationary and passive; the separate “Stationary blocks” checkbox controls blocking.
- **CPU Dummy:** fully controlled by the selected CPU difficulty.

Perfect-block practice makes the stationary dummy throw a slow heavy at a predictable interval. Player 2 keyboard and controller attacks are ignored for every other non-CPU behavior. The HUD shows combo count, actual post-defense combo damage, scaling, guard damage, perfect-block timing, clash state, move list, and ten recent inputs.

Reset Training with Y or the on-screen button. A reset cancels delayed attacks and clears projectiles, particles, effects, clashes, cinematics, camera transforms, Lens, armor, aura, traps, freeze, invulnerability, hitstun, guard-break/get-up state, startup, throws, breakers, counters, cooldowns, air dashes, juggle count, light-chain position, combo state, guard values, and both fighter positions. Quick restart applies the same transient cleanup without returning to character select.

Use the always-visible **EXIT TRAINING** button or press Escape to return to character select. Exiting clears delayed attacks, projectiles, effects, input state, temporary abilities, and Training session state. Training settings do not affect Story, VS CPU, or local multiplayer.

## Smoke tests

With the local server running, open `http://127.0.0.1:4173/tests/smoke.html`.

The browser suite contains 61 checks covering all Prototype 2.2 regressions plus melee/beam/ultimate clashes, rivalry scenarios, clash lifecycle and safe damage, CPU/controller clash input, Training clash reset, guard damage/regeneration/breaks, perfect-block timing, throws and protection, breaker cost/lockout, chip floor, defensive AI, all 15 cinematic ultimates, miss recovery, damage bounds, camera restoration, Creed’s evasive window, and audio-hook coverage.

## Save compatibility

Story completion continues to use the existing `pxSave` browser-storage key. Mirror matches remain disabled.

## Known limitations

- Fighters use procedural canvas art; the asset folders are prepared for later sprite/audio production.
- Detailed hitbox visualization is not implemented; the previous nonfunctional toggle has been removed.
- Expanded fighters use contextual single-button specials rather than command motions.
- Flow State is reserved for a later prototype and is not part of Lens of Truth.
- Audio uses synthesized hooks until final sound and music assets are available.
- Cinematics use procedural 2D canvas effects; full sprite animation remains future presentation work.
- Automated browser checks can verify keyboard events and gamepad mapping code, but physical controller feel should also be tested on target hardware.
