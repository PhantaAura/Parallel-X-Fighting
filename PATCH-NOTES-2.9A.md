# Prototype 2.9A — Combat Depth & Tournament Ring-Outs

## Match flow
- Standard combat remains first to three KOs with no timeout.
- Only the defeated fighter respawns. The winner keeps health, energy, and position.
- KO downtime is shortened and story rematches restart automatically at 0–0.
- Chapter 2 tournament battles count both KOs and ring-outs. The scripted Plouke final stays KO-only so its story sequence remains intact.

## Character depth
### Wade
- Lightning Blast: fast, low-cooldown pressure projectile.
- Super Lightning Dash: fast committed rush that punishes charging.
- Thunderstorm: warning zones followed by lightning strikes.
- Lightning Beam: expensive clash-capable finisher.

### Bark
- Ground Quake: arena-floor shockwave that stuns grounded opponents.
- Rock Armor: temporary damage and knockback resistance with visible durability.
- Earth Wall: physical, destructible cover that blocks movement and projectiles.
- Seismic Counter: retaliates with a real rock projectile that can collide with energy.
- Rock Shot: slow, high-guard-damage ranged pressure.

## Defense, resources, and movement
- Blocking has a maximum hold duration and a fatigue lockout.
- The first moments of guard form a perfect-parry window.
- Grabs beat guarding and are punishable on miss.
- Passive energy regeneration is slower; attacks and parries build energy.
- Holding Charge while standing still restores energy. Guard also recovers faster while still.
- Neutral dash consistently retreats instead of choosing a random direction.
- Combo timing, hitstun, lock-on turning, magnetism, depth shadows, and hit feedback were tightened.
- Heavy attacks and projectiles can clash.

## AI
- The arena CPU now chooses states based on distance, height, edge position, projectiles, guard, energy, charging, whiffs, and habits.
- Easy, Normal, and Hard use different reaction delays and mistake rates.
- The CPU does not frame-perfectly read player inputs.
- Wade circles and rushes; Bark controls ground and defense; Pouki pressures; Plouke fights with guarded Sage-style timing.

## Rrvvfo balance
- Shots of Agony requires a full meter and consumes all energy.
- Lens of Truth begins at 90 Energy / 70 HP, predicts the opponent's probable action, and improves through successful use.
- Full Lens mastery grants two automatic dodges; early mastery grants prediction only.
- Solar Weave now deals meaningful high-health damage and clashes properly.

## Shared rules
- The side-view engine now also preserves the winner between KOs.
- Shots of Agony and Lens costs/mastery are shared between the side-view and arena presentations.
