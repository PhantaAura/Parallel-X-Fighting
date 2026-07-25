# Parallels X: Clash of Souls — Prototype 2.2

A dependency-free browser fighting game with Story Mode, VS CPU, local multiplayer, configurable rounds, five stages, 14 playable fighters, browser saves, controller/touch input, and Training Mode.

## Run

Serve the project directory with any static web server, then open `index.html`. ES modules do not work reliably from a `file://` URL.

Example: `python3 -m http.server 4173`, then visit `http://127.0.0.1:4173/`.

## Project structure

- `index.html` — accessible game/menu markup and module entry point
- `css/game.css` — original presentation and responsive layout
- `css/combat.css` — combo HUD
- `css/training.css` — Training Mode controls and diagnostics
- `js/main.js` — initialization, match lifecycle, update loop, and render coordination
- `js/roster.js` — all 14 character identities and base attributes
- `js/movesets.js` — Rrvvfo, Revvfo, Wade, and Bark move data
- `js/fighter.js` — fighter state, attack resolution, specials, ultimates, and drawing
- `js/combat.js` — projectile class, attack categories, final-damage calculation, combo rules, juggle rules, and managed delayed timers
- `js/input.js` — separate keyboard/touch/controller state combined into one input stream
- `js/ai.js` — difficulty profiles and CPU decisions
- `js/effects.js` — particle/effect state and rendering
- `js/stages.js` — stage data and rendering
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
| Launcher | T | U |
| Bark counter | E | Semicolon (;) |
| Special | G | K |
| Ultimate | H | L |
| Dash | Q | O |
| Pause | P | P |
| Training position reset | Y | Y |

Touch controls preserve movement, jump, light attack, special, and ultimate access.

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

Two standard gamepads are supported in local multiplayer.

## Combo mechanics

Lights chain into character-specific three-hit strings. The final ground-light hit adds pushback and a short light-chain lockout, so repeatedly cycling 1-2-3 cannot form an infinite wall loop. Heavy attacks are slower and more punishable. Launchers start air routes, and the light button performs air attacks while airborne. Connected hits build a counter and total-damage readout. Each successive hit scales down, with a non-zero damage floor and stronger minimum scaling for specials/ultimates. Six air juggles force knockdown; get-up frames are briefly invulnerable. Combos reset after recovery or a short no-hit window.

Taking a hit during unarmored attack startup cancels the pending attack. Bark’s intentionally armored heavy is the exception while its startup armor is active.

## Expanded fighters

- **Rrvvfo:** fire light chain, Flame Heavy/Launcher, air fire attacks, Fire Blast, Shots of Agony, Object Swap Dash, and Lens of Truth
- **Revvfo:** Astrylte blade chain, heavy/teleport launcher, air blade attacks, Beam, Teleport Strike, Astrylte Dragon behavior, and Perfected State
- **Wade:** rapid low-damage normals, lightning launcher, fast air attacks, Flash Step, Barrage, one air dash per jump, and Thunderstorm
- **Bark:** slow high-damage chain, armored heavy, Earth Launcher, Air Slam, temporary Rock Armor, Earth Wall, deliberate Seismic Counter, and Earthquake

Other roster members retain their legacy specials/ultimates and shared normal toolkit.

## Lens of Truth

Rrvvfo needs 90 energy. Activation sacrifices exactly 50 health but never lowers him below 1 HP. For four seconds, incoming melee, projectile, special, and ultimate hits trigger short repositioning teleports. Human-controlled Rrvvfo receives a blindness overlay; CPU Rrvvfo does not obscure a human player’s view. The overlay warns during the final second. A 300-frame ultimate cooldown prevents repeated use.

Flow State is not implemented in Prototype 2.2 and is intentionally separate from Lens of Truth.

In local multiplayer, both players share one canvas, so a human Rrvvfo’s blindness overlay obscures the shared screen.

## Shots of Agony

Shots of Agony costs 40 energy and creates exactly four clones around the opponent. All four clones appear before the attack starts, then fire together after the visual tell. Rrvvfo cannot begin another volley—or regenerate the spent energy—while its clones or projectiles remain active. Once all four clones fire, a 300-frame (about five-second) cooldown begins. The energy HUD reports the active volley and its remaining cooldown together. CPU-controlled Rrvvfo follows the same restrictions. A full unblocked volley deals roughly 25–30 health to an average-defense fighter.

## CPU behavior

Every fighter has character-specific priorities layered over the shared legal-action checks. Rrvvfo manages ranged fire pressure and Shots availability; Revvfo teleports into launcher routes; Wade rushes down and occasionally retreats after a string; Bark favors defense, armor, deliberate counters, and slow punishes; Alt pressures and spends rage aggressively; Robert controls range with ice; Virek shifts between melee and ranged play; Shadow spaces, fires projectiles, and heals when appropriate; Phanta uses unpredictable movement, clone pressure, and sudden punishes; Creed emphasizes evasion and whiff punishment. The remaining roster profiles select their existing specials and ultimates according to range and resources.

Difficulty changes reaction delay, decision quality, blocking consistency, aggression, and combo completion. It never changes fighter damage and does not grant perfect input reading.

## Bark’s Seismic Counter

Press E for Player 1, semicolon for Player 2, or click the left stick on a controller. The stance costs 20 energy and has six startup frames, a 12-frame active window, 30 recovery frames, and a 90-frame cooldown. It counters only nearby light, heavy, launcher, and air melee attacks. Ordinary blocking never counters. Projectiles and ranged specials hit Bark normally, and a missed counter leaves him in recovery.

## Training Mode

Choose Training Mode from the mode menu. Configure infinite health/energy and the starting dummy behavior. Pre-match and live Training controls stay synchronized. During training, live controls can switch the dummy among:

- **Never Block:** stationary, passive, and never blocks.
- **Always Block:** stationary, passive, and always blocks.
- **Block After First Hit:** the first hit connects, then the stationary dummy blocks.
- **Stationary:** stationary and passive; the separate “Stationary blocks” checkbox controls blocking.
- **CPU Dummy:** fully controlled by the selected CPU difficulty.

Player 2 keyboard and controller attacks are ignored for every non-CPU dummy. The HUD shows combo count, actual post-defense combo damage, current scaling, move list, and ten recent inputs.

Reset Training with Y or the on-screen button. A reset cancels delayed attacks and clears projectiles, particles, effects, Lens, armor, aura, traps, freeze, invulnerability, hitstun, knockdown/get-up state, startup, counter state, cooldowns, air dashes, juggle count, light-chain position, combo state, and both fighter positions. Quick restart applies the same transient cleanup without returning to character select.

Use the always-visible **EXIT TRAINING** button or press Escape to return to character select. Exiting clears delayed attacks, projectiles, effects, input state, temporary abilities, and Training session state. Training settings do not affect Story, VS CPU, or local multiplayer.

## Smoke tests

With the local server running, open `http://127.0.0.1:4173/tests/smoke.html`.

The suite covers roster loading, mirror prevention, mixed keyboard/gamepad state, quick keyboard taps, three-hit light chaining, Wade’s wall-loop termination, startup interruption, launcher-to-air follow-up, damage scaling/final damage, full Training reset and exit, dummy passivity, Training-setting synchronization, Bark counter range/projectile behavior, Lens health sacrifice, Shots of Agony clone/cooldown/energy/damage rules, Phanta’s single-move survival, and legal action selection for every character-specific CPU profile.

## Save compatibility

Story completion continues to use the existing `pxSave` browser-storage key. Mirror matches remain disabled.

## Known limitations

- Fighters use procedural canvas art; the asset folders are prepared for later sprite/audio production.
- Detailed hitbox visualization is not implemented; the previous nonfunctional toggle has been removed.
- Expanded fighters use contextual single-button specials rather than command motions.
- Flow State is reserved for a later prototype and is not part of Lens of Truth.
- Automated browser checks can verify keyboard events and gamepad mapping code, but physical controller feel should also be tested on target hardware.
