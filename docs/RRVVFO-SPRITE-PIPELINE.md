# Rrvvfo and Revvfo Experimental Sprite Pipeline

## Scope

The sprite layer changes presentation only. Combat positions, hitboxes, damage,
startup, recovery, hitstun, guard, cooldowns, clashes, AI, projectiles, Lens of
Truth, Object Swap, Shots of Agony, Revvfo's teleport strike, and all ultimate
rules remain authoritative in the existing JavaScript combat modules.

The supplied images are labeled concept sheets, not true transparent sprite
atlases. Build-time tools crop and normalize them so the browser never performs
background removal or reads the full reference sheets during gameplay.

## Current fighter coverage

### Rrvvfo

- Hood Down source: full action sheet
- Hood Up source: separate full action sheet
- 176 normalized frames total
- 1728 × 3840 atlas
- Every gameplay animation has matching Hood Down and Hood Up frame coverage
- Appearance is cosmetic and stored per player/training slot
- Shots clones remain four separate runtime effects rather than being baked
  into Rrvvfo's body animation

### Revvfo

- 88 normalized frames
- 1728 × 1920 atlas
- Original Astrylte presentation retained
- Original ranged Astrylte Blast, aerial beam, close teleport strike, dash,
  normal attacks, defense, clashes, and ultimate behavior retained
- No Rrvvfo move data is copied into Revvfo

## Source limitations

The sheets contain labels, frame numbers, section rules, pale backgrounds,
baked effects, varying spacing, and compression or generation artifacts. The
builder performs:

- resolution-aware crop scaling
- edge-connected background removal
- detached label and rule-line cleanup
- alpha trimming
- 192 × 192 frame normalization
- consistent `(96, 178)` ground pivots
- repository-relative manifest and effect paths

This process cannot create missing in-between animation art. Pose proportions,
hands, hair spikes, energy effects, and facial details may vary from frame to
frame and still need manual artist cleanup before the sprite option becomes the
default.

## Build commands

From the repository root with Pillow installed:

```bash
python3 tools/build-fighter-atlases.py \
  --fighter rrvvfo \
  --source /path/to/rrvvfo-hood-down-sheet.jpg \
  --alternate /path/to/rrvvfo-hood-up-sheet.jpg \
  --output assets/fighters/rrvvfo
```

```bash
python3 tools/build-fighter-atlases.py \
  --fighter revvfo \
  --source /path/to/revvfo-sheet.png \
  --output assets/fighters/revvfo
```

The older command remains available through `tools/build-rrvvfo-atlas.py`.

## Outputs

Each fighter folder contains:

- `<fighter>-source-sheet.png` — archived build source, never loaded at runtime
- optional Hood Up source archive
- `<fighter>-atlas.png` — normalized runtime atlas
- `<fighter>-animations.json` — frame rectangles, pivots, timing, variants, and
  effect paths
- `effects/*.png` — extracted or procedural projectiles, auras, afterimages,
  impacts, and movement effects

## Runtime architecture

- `sprite-atlas.js` validates and caches manifests, atlases, and effects.
- `sprite-animation.js` handles frame timing, loops, events, and interruption
  priority.
- `sprite-renderer.js` handles pivots, flipping, opacity, afterimages, scale,
  ground shadows, and future depth scaling.
- `fighter-visuals.js` loads only selected supported fighters, maps combat state
  to animation state, and falls back to procedural rendering per fighter.
- `sprite-debug-viewer.js` remains focused on Rrvvfo Hood Down/Hood Up comparison
  and anchor inspection.

The sprite setting defaults Off. A missing or malformed fighter atlas never
makes that fighter invisible; only the affected fighter returns to legacy
procedural rendering.

## Animation coverage

Shared animation names include idle, stance, run, jump, fall, landing, dash,
turn, light chain, heavy, launcher, air attacks, block, perfect block, hurt,
knockdown, recovery, breaker, ultimate, victory, and defeat.

Rrvvfo additionally maps Fire Blast, Shots of Agony command poses, Lens of
Truth, and Object Swap. Revvfo additionally maps Astrylte Blast, teleport rush,
dark power, and beam attack poses.

## 2.5D preparation

Frames use consistent ground pivots and repository manifests already include
optional depth-scale metadata. The later Sonic Battle-style arena update can
reuse these assets, but this branch does not add arena movement or depth-aware
combat.
