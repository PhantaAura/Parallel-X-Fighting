# Parallels X Arena Pipeline

Arena Battle loads stage definitions from `js/arena/arena-stages.js`. Combat systems must read the active stage instead of hard-coding Tangai Dojo measurements.

## Required stage fields

```js
{
  schema: 1,
  id: 'dojo',
  name: 'Tangai Dojo',
  bounds: {minX: -360, maxX: 360, minZ: -240, maxZ: 240},
  spawnPoints: [{x: -170, z: 55}, {x: 170, z: -55}],
  projectileLimits: {padding: 100, minY: 0, maxY: 420},
  camera: {
    yawDeg: 40,
    fov: 42,
    minDistance: 800,
    maxDistance: 1080
  }
}
```

The full Tangai Dojo object also contains presentation, floor, boundary, scenery, and performance data.

## Adding an arena

1. Add a complete stage object to `ARENA_STAGES`.
2. Add its public status to `ARENA_STAGE_CATALOG`.
3. Run `validateArenaStage(stage)`.
4. Confirm both spawns are inside the bounds.
5. Test close combat, maximum separation, wall pressure, projectiles, Object Swap, Lens, and Shots clone placement.
6. Test the camera on desktop and mobile.
7. Only mark the catalog entry `available: true` after the arena passes those checks.

## Runtime entry point

```js
startArenaBattle('dojo');
```

The battle instance rejects stage changes while a match is active. Exit first, then start the next arena.

## Rules

- Do not add arena-specific `if (stage === ...)` combat branches unless a documented stage mechanic requires one.
- Decorative geometry must not silently change gameplay boundaries.
- Camera configuration cannot increase attack range or expose extra playable space.
- Projectile cleanup must use the active stage limits.
- AI wall avoidance must use the active stage bounds.
