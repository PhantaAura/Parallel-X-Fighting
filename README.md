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

Two standard gamepads are supported in local multiplayer.

## Combo mechanics

Lights chain into character-specific strings. Heavy attacks are slower and more punishable. Launchers start air routes, and the light button performs air attacks while airborne. Connected hits build a counter and total-damage readout. Each successive hit scales down, with a non-zero damage floor and stronger minimum scaling for specials/ultimates. Six air juggles force knockdown; get-up frames are briefly invulnerable. Combos reset after recovery or a short no-hit window.

## Expanded fighters

- **Rrvvfo:** fire light chain, Flame Heavy/Launcher, air fire attacks, Fire Blast, Shots of Agony, Object Swap Dash, and Lens of Truth
- **Revvfo:** Astrylte blade chain, heavy/teleport launcher, air blade attacks, Beam, Teleport Strike, Astrylte Dragon behavior, and Perfected State
- **Wade:** rapid low-damage normals, lightning launcher, fast air attacks, Flash Step, Barrage, one air dash per jump, and Thunderstorm
- **Bark:** slow high-damage chain, armored heavy, Earth Launcher, Air Slam, temporary Rock Armor, Earth Wall, defensive counter, and Earthquake

Other roster members retain their legacy specials/ultimates and shared normal toolkit.

## Lens of Truth

Rrvvfo needs 90 energy. Activation sacrifices exactly 50 health but never lowers him below 1 HP. For four seconds, incoming melee, projectile, special, and ultimate hits trigger short repositioning teleports. Human-controlled Rrvvfo receives a blindness overlay; CPU Rrvvfo does not obscure a human player’s view. The overlay warns during the final second. A 300-frame ultimate cooldown prevents repeated use.

Flow State is not implemented in Prototype 2.2 and is intentionally separate from Lens of Truth.

## Training Mode

Choose Training Mode from the mode menu. Configure infinite health/energy, optional hitbox display, and the starting dummy behavior. During training, live controls can switch the dummy among:

- **Never Block:** stationary, passive, and never blocks.
- **Always Block:** stationary, passive, and always blocks.
- **Block After First Hit:** the first hit connects, then the stationary dummy blocks.
- **Stationary:** stationary and passive; the separate “Stationary blocks” checkbox controls blocking.
- **CPU Dummy:** fully controlled by the selected CPU difficulty.

Player 2 keyboard and controller attacks are ignored for every non-CPU dummy. The HUD shows combo count, actual post-defense combo damage, current scaling, move list, and ten recent inputs.

Reset Training with Y or the on-screen button. A reset cancels delayed attacks and clears projectiles, particles, effects, Lens, armor, aura, traps, freeze, invulnerability, hitstun, knockdown/get-up state, startup, cooldowns, air dashes, juggle count, light-chain position, combo state, and both fighter positions. Quick restart applies the same transient cleanup without returning to character select. Training settings do not affect Story, VS CPU, or local multiplayer.

## Smoke tests

With the local server running, open `http://127.0.0.1:4173/tests/smoke.html`.

The suite covers roster loading, mirror prevention, mixed keyboard/gamepad state, quick keyboard taps, a three-hit light combo, launcher-to-air follow-up, damage scaling/final damage, full Training reset, dummy passivity, and Lens health sacrifice.

## Save compatibility

Story completion continues to use the existing `pxSave` browser-storage key. Mirror matches remain disabled.

## Known limitations

- Fighters use procedural canvas art; the asset folders are prepared for later sprite/audio production.
- Hitbox display is an optional training setting but detailed per-frame hitbox visualization is not yet rendered.
- Expanded fighters use contextual single-button specials rather than command motions.
- Flow State is reserved for a later prototype and is not part of Lens of Truth.
- Automated browser checks can verify keyboard events and gamepad mapping code, but physical controller feel should also be tested on target hardware.
