# Parallels X Prototype 2.9A.8 — Kinetic Combat Pass

This update rebuilds the finished fighters around fast 3D movement, character-specific normals, launch-and-pursuit offense, readable counterplay, and shorter periods where either player is unable to act.

The Sonic Battle influence is adapted rather than copied directly: Parallels X uses its own character kits, a Shot / Power / Trick category language, and a defendable Momentum Finisher instead of hidden special immunities or literal instant-KO attacks.

## Finished fighters now fight differently

The Arena/Story engine no longer gives every finished fighter the same normal attacks.

- **Rrvvfo:** balanced reach, damage, pursuit speed, and combo flexibility.
- **Revvfo:** faster pressure strings, longer lunges, and the quickest aggressive pursuit after Wade.
- **Wade:** the fastest movement and normal attacks, with lower individual hit damage.
- **Bark:** slower armored startup, larger hit volumes, stronger guard damage, and heavy knockback.
- **The Sage:** deceptive timing and the longest normal-attack reach.

Each fighter has individual Light 1–3, Heavy, Launcher, Air Light, Air Heavy, Pursuit Light, and Pursuit Heavy data. Plouke correctly uses the Sage profile during the Chapter 3 preview.

## High-speed kinetic movement

- Walk, run, air movement, acceleration, braking, dashing, and pursuit speeds were retuned per fighter.
- Running reaches full speed faster.
- Dash can cancel into jump or an attack after its opening movement.
- Every fighter receives one air dash before landing.
- Dash now has a short, readable dodge window instead of appearing invulnerable while remaining hittable for almost the entire animation.
- Faster movement produces clearer trails and stronger ground-shadow direction cues.
- Close attacks receive modest depth correction so visually nearby opponents are less likely to miss because of a small Z-axis difference.

## Heavy launch and pursuit

- Heavy attacks and Launchers can open a **Pursuit Window** on hit.
- Press Dash during that window to chase the launched opponent.
- During the pursuit follow-up window, press Light for a faster aerial continuation or Heavy for a stronger slam.
- Each combo permits one pursuit and one pursuit wall-bounce opportunity.
- Fighter-specific pursuit speed and attacks preserve character identity.
- The HUD and Sage’s Manual explain the pursuit route instead of leaving the mechanic hidden.

## Combo fairness

- Arena damage now scales down by 8% for each additional hit, with a 55% minimum.
- The combo display shows the current scaling percentage.
- Six airborne hits trigger forced recovery and temporary juggle protection.
- Pursuit and wall-bounce routes remain dramatic without allowing endless launcher loops.

## Defense is strong but no longer free to spam

### Universal Counter

- Costs **18 Energy**.
- Active for approximately **0.14 seconds**.
- Has approximately **0.62 seconds** of missed recovery.
- Has a **2.4-second cooldown**.
- Counter startup and recovery are visually communicated.
- Bark keeps the stronger character-specific Seismic Counter.

### Combo Breaker

- Costs **60 Energy** in Arena/Story and Classic 2D combat.
- Arena Breaker has a **6.5-second cooldown** and cannot repeat during the same combo.
- The existing Classic 2D once-per-life/cooldown protection remains.

### Grab

Grab remains because it is the direct answer to passive blocking, but it is no longer a safe general-purpose combo starter.

- Short **72-unit** range.
- Cannot grab an airborne or invulnerable target.
- Clear missed-grab recovery.
- Deals 6 damage with moderate displacement.
- Does not create a knockdown or easy full combo.
- Grabs never add ring-out pressure and cannot directly ring out an opponent.

## Energy and anti-stalling

- Fighters begin a normal life with **45 Energy**, rather than immediately receiving every major ability.
- A defeated fighter respawns with 50 Energy in continuous multi-KO matches.
- Passive Energy recovery is slower.
- Retreating at extreme range builds a stall state that reduces passive recovery and charging effectiveness.
- Close offense, heavier attacks, pursuit hits, parries, and taking damage build resources more effectively than avoiding combat.
- Charging remains visible and punishable from across the arena.

## Special-move commitment

Rrvvfo’s main techniques now have visible startup and recovery:

- Fire Blast: 0.18s startup / 0.24s recovery
- Shots of Agony: 0.42s startup / 0.52s recovery
- Object Swap: 0.20s startup / 0.24s recovery
- Lens of Truth: 0.30s startup / 0.34s recovery
- Solar Weave: 0.58s startup / 0.62s recovery

Energy and cooldown are committed at startup. Being hit before execution interrupts the technique, creating real risk. Normal-to-special cancels are limited to deliberate routes instead of every connected attack.

Object Swap has less invulnerability and visible arrival recovery, so it remains a movement trick rather than a free escape.

Character-specific abilities for Revvfo, Wade, Bark, and the Sage also use startup/recovery states and reserved costs.

## Shot / Power / Trick technique language

Abilities are organized into three readable tactical categories:

- **Shot:** ranged pressure such as Fire Blast and Shots of Agony.
- **Power:** high-commitment damage and guard pressure such as Solar Weave.
- **Trick:** movement, prediction, traps, counters, and utility such as Object Swap and Lens of Truth.

The hotbar shows category labels, and the Sage’s Manual explains the basic counterplay. This does not add hidden category immunity or allow characters to copy one another’s identity.

## Momentum Finisher

- Aggressive play, heavy hits, pursuit attacks, perfect parries, and surviving pressure build Momentum.
- Both fighters now have a visible Momentum meter.
- At 100 Momentum, Rrvvfo’s next Solar Weave becomes a clearly announced **Momentum Finisher**.
- The Finisher is stronger, larger, faster, and more threatening to guard, but it is **not an instant KO**.
- It still has startup, can be interrupted before release, and can be avoided or defended against.
- Momentum resets after the enhanced technique is used.

## Ring-outs now require an actual edge sequence

Tournament ring-outs no longer happen because a fighter touched an invisible line while still standing safely on the platform.

- A fighter must be near the visible edge.
- The attacker must land three qualifying melee pressure hits within the edge-pressure window.
- The final hit must be a strong finisher such as Light 3, Heavy, Launcher, Pursuit Heavy, or another sufficiently forceful strike.
- Grabs do not count.
- Respawn protection prevents immediate ring-outs.
- The HUD displays edge-pressure progress.
- A successful ring-out launches the fighter beyond the platform and plays a visible falling state before the KO is awarded.

## 3D readability

- Stronger ground shadows identify each fighter’s current position.
- Accent centers and depth lines help compare Z-axis alignment.
- Movement and pursuit trails scale with speed.
- Active attacks display a brief footprint indicating their forward volume.
- Full Momentum creates a visible aura.
- Edge-pressure pips show when a real ring-out sequence is building.

## CPU behavior

- CPU fighters understand launch-and-pursuit opportunities.
- They can chase and choose pursuit follow-ups without reading player input.
- Long-distance retreat and charging are less rewarding.
- Existing state-based reaction rules remain in place.

## Sage’s Manual and Training

New public pages explain:

- Kinetic movement and depth alignment
- Heavy launch and pursuit follow-ups
- Shot / Power / Trick categories
- Momentum Finishers and their counterplay
- Combo scaling and six-hit juggle protection

Arena Training’s combo drill now teaches launch, Dash pursuit, and the Light/Heavy follow-up choice.

## Validation performed

- **69 JavaScript files** passed `node --check`.
- **11 JSON files** parsed successfully.
- **12 local HTML references**, **8 CSS asset references**, and **162 JavaScript imports** were checked with no missing targets.
- No duplicate HTML IDs were found.
- One active cache identifier is used by the release page.
- A direct Arena runtime check confirmed 45 starting Energy, distinct Wade/Bark normal timing, Grab ring-out immunity, three-hit edge pressure, and the visible falling state.
- The route-backed browser smoke suite passed **199/199** checks. Its console includes the expected 404 from the intentional missing-sprite-manifest fallback test.
- The complete ZIP passed archive-integrity testing.

A complete real-time WebGL playthrough, physical-controller test, and final combat-feel judgment still require human playtesting on the GitHub Pages build.
