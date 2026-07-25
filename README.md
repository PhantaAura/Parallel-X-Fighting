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
- `js/main.js` — match lifecycle and rendering integration
- `js/roster.js` — all 14 character identities and base attributes
- `js/movesets.js` — Rrvvfo, Revvfo, Wade, and Bark move data
- `js/combat.js` — attack categories, combo scaling, juggle rules
- `js/input.js` — keyboard/controller mappings
- `js/ai.js` — difficulty profiles and combat decisions
- `js/effects.js` — visual helpers
- `js/stages.js` — stage data
- `js/story.js` — story ladder and compatible `pxSave` key
- `js/training.js` — isolated Training Mode settings and reset behavior
- `js/ui.js`, `js/fighter.js` — UI and fighter module boundaries
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

- **Rrvvfo:** fire light chain, Flame Heavy/Launcher, air fire attacks, Fire Blast, Shots of Agony, Object Swap Dash, Lens of Truth, and Flow State
- **Revvfo:** Astrylte blade chain, heavy/teleport launcher, air blade attacks, Beam, Teleport Strike, Astrylte Dragon behavior, and Perfected State
- **Wade:** rapid low-damage normals, lightning launcher, fast air attacks, Flash Step, Barrage, one air dash per jump, and Thunderstorm
- **Bark:** slow high-damage chain, armored heavy, Earth Launcher, Air Slam, temporary Rock Armor, Earth Wall, defensive counter, and Earthquake

Other roster members retain their legacy specials/ultimates and shared normal toolkit.

## Lens of Truth

Rrvvfo needs 90 energy. Activation sacrifices exactly 50 health but never lowers him below 1 HP. For four seconds, incoming melee, projectile, special, and ultimate hits trigger short repositioning teleports. Human-controlled Rrvvfo receives a blindness overlay; CPU Rrvvfo does not obscure a human player’s view. The overlay warns during the final second. A 300-frame ultimate cooldown prevents repeated use.

## Training Mode

Choose Training Mode from the mode menu. Configure infinite health/energy, optional hitbox display, and the starting dummy behavior. During training, live controls can switch the dummy among Never Block, Always Block, Block After First Hit, Stationary, and CPU. The HUD shows combo count, total damage, current scaling, move list, and ten recent inputs. Reset positions with Y or the on-screen button; quick restart does not return to character select.

Training resets clear positions, projectiles, temporary effects, stun, knockdown, and combo state. Training settings do not affect Story, VS CPU, or local multiplayer.

## Save compatibility

Story completion continues to use the existing `pxSave` browser-storage key. Mirror matches remain disabled.

## Known limitations

- Fighters use procedural canvas art; the asset folders are prepared for later sprite/audio production.
- Hitbox display is an optional training setting but detailed per-frame hitbox visualization is not yet rendered.
- Expanded fighters use contextual single-button specials rather than command motions.
- Automated browser checks can verify keyboard events and gamepad mapping code, but physical controller feel should also be tested on target hardware.
