# Rrvvfo Experimental Sprite Pipeline

## Scope and visual direction

This pipeline is an optional presentation layer for Rrvvfo. Combat positions,
hitboxes, damage, startup, active timing, recovery, hitstun, guard, cooldowns,
clashes, AI, Lens of Truth, Object Swap, and Shots of Agony remain authoritative
in the existing combat modules.

The replacement concept sheet supplied for this branch is the animation source.
The polished red presentation image (`docs/reference/rrvvfo-polished-design.jpg`)
guides color and proportions, while the original lower-left red-hoodie design
(`docs/reference/rrvvfo-original-design.jpg`) is historical identity reference.
Neither design reference is loaded at runtime.

- Medium-brown skin
- Light-brown hair
- Red hoodie
- Black pants with red accents
- Red-and-black shoes
- Hood down by default
- Hood Up — Prototype visual variant with identical gameplay
- Confident, energetic fire-ninja silhouette

The full concept sheet is retained as `rrvvfo-source-sheet.png` for development
only. Runtime code never loads or draws it.

The newer supplied Hood Up concept sheet is retained separately as
`docs/reference/rrvvfo-hood-up-prototype-sheet.jpg`. It contains a broader set
of hooded action references, but it remains a labeled JPEG concept sheet rather
than normalized transparent art. This stabilization branch does not crop it
into the active atlas or claim that Hood Up is complete.

## Source limitations

The input is a JPEG concept sheet, not a production atlas. It contains labels,
frame numbers, section rules, a pale background, varied frame spacing, baked-in
effects, and compression noise. The atlas builder uses conservative,
edge-connected background removal and detached-debris filtering. It favors
keeping dark outlines over aggressively erasing pale pixels.

Some source poses contain fire, dust, block shields, or Lens distortion baked
into the reference. Where practical, gameplay uses separate effect images.
Frames containing all four Shots clones or a large combined ultimate effect are
not used as fighter body frames. Shots clones are four separate instances of one
blue clone asset.

## Build

Install Pillow outside the game itself, then run from the repository root:

```bash
python3 tools/build-rrvvfo-atlas.py \
  --source /path/to/rrvvfo-concept-sheet.jpg \
  --output assets/fighters/rrvvfo
```

The browser has no build dependency. All image processing happens once during
development.

Outputs:

- `rrvvfo-source-sheet.png` — archival source, never runtime-loaded
- `rrvvfo-atlas.png` — game-ready body-frame atlas
- `rrvvfo-animations.json` — rectangles, pivots, anchors, timing, variants
- `effects/*.png` — separate projectile, clone, Lens, swap, impact, dust, and
  aura layers

## Atlas geometry

- Atlas: 1536 × 1920 pixels
- Cell: 192 × 192 pixels
- Columns: 8
- Normalized ground pivot: `(96, 178)`
- Center pivot: `(96, 96)`
- Default projectile origin: `(138, 90)`
- Default hand/effect anchors: stored per frame
- Default game scale: `0.62`

The logical fighter location remains the 48 × 86 combat body. The visual ground
pivot is placed at the logical midpoint between Rrvvfo's feet. Visible sprite
edges never define collision.

## Crop coordinates

The authoritative pixel rectangles are the `CROPS` dictionary in
`tools/build-rrvvfo-atlas.py`. Coordinates use Pillow's
`(left, top, right, bottom)` convention.

| Source section | Exported frames | Source region |
|---|---:|---|
| Idle | 6 | x 20–403, y 48–146 |
| Run | 4 | x 420–740, y 58–147 |
| Fighting stance | 4 | x 746–1014, y 53–149 |
| Jump/fall/land | 5 | x 20–495, y 185–273 |
| Dash | 4 | x 512–1008, y 187–274 |
| Light combo | 6 | x 16–510, y 312–397 |
| Heavy | 4 | x 520–1010, y 312–398 |
| Launcher | 4 | x 15–365, y 435–529 |
| Air light/heavy | 6 | x 372–880, y 435–529 |
| Block/perfect block | 4 | x 886–1265, y 435–529 |
| Hurt/knockdown | 5 | x 16–362, y 566–647 |
| Fire Blast body/effect reference | 4 | x 367–679, y 566–647 |
| Shots command body | 1 | x 686–755, y 566–647 |
| Lens | 5 | x 15–464, y 683–754 |
| Object Swap | 4 | x 470–680, y 683–754 |
| Victory | 4 | x 16–342, y 804–931 |
| Turnaround | 5 | x 355–682, y 820–931 |
| Hood-up reference | 3 | x 762–1034, y 818–931 |

Effect crop rectangles are in `EFFECT_CROPS` in the same script.

## Animation manifest

Every frame records:

- Atlas source rectangle
- Cell width and height
- Ground and center pivots
- Visual X/Y offsets
- Effect anchor
- Hand anchor
- Projectile origin
- Target-facing direction
- Trimmed content bounds

Animations record frame names, duration, loop/cancel behavior, optional events,
and hood state. Damage and hitbox data do not live in this manifest.

Animations:

`idle`, `fightingStance`, `run`, `jumpStart`, `jumpRise`, `fall`, `land`,
`dash`, `turn`, `light1`, `light2`, `light3`, `heavyStartup`, `heavyActive`,
`heavyRecovery`, `launcherStartup`, `launcherActive`, `launcherRecovery`,
`airLight`, `airHeavy`, `airHurt`, `airFall`, `blockStart`, `blockHold`,
`blockHit`, `perfectBlock`, `guardBreak`, `breaker`, `hurtLight`, `hurtHeavy`,
`knockback`, `knockdown`, `groundDown`, `getUp`, `defeated`,
`fireBlastStartup`, `fireBlastFire`, `fireBlastRecovery`, `shotsStartup`,
`shotsSummon`, `shotsCommand`, `shotsFire`, `shotsRecovery`, `lensActivate`,
`lensActive`, `lensDodgeLeft`, `lensDodgeRight`, `lensEnd`,
`objectSwapStartup`, `objectSwapDisappear`, `objectSwapReappear`,
`objectSwapRecovery`, `ultimateStartup`, `ultimateCharge`, `ultimateAttack`,
`ultimateRecovery`, `victory`, and `defeat`.

## Temporary and reused frames

This is an experimental conversion, so several animation names intentionally
reuse source poses:

- Jump start/rise/fall and land share the five jump/fall references.
- Block start/hold and block-hit share the two block poses.
- Ground-down and defeat reuse the final knockdown pose.
- Shots startup/command/recovery reuse the clean command and Fire Blast poses;
  the four-clone composite is deliberately excluded.
- Lens left/right dodge reverse the two clean dodge poses.
- Object Swap disappearance/reappearance use clean body poses while flash and
  marker are separate assets.
- Ultimate uses the three clean hood-up reference poses while aura, fire, and
  impact are separate layers.
- Hood Up — Prototype is available only when unfinished appearances are exposed
  in a developer build. The active atlas has only three clean hood-up views, so
  those frames repeat across many animations. The newer Hood Up reference sheet
  is deliberately not used to fabricate runtime motion in this branch.

These repetitions change presentation only and never alter combat timing.

## Manual-cleanup warnings

- JPEG halos remain on a few hair and flame edges.
- A few source frames have fire or shield highlights close to the body outline.
- Side/back turnaround frames are reference-quality rather than final combat
  animation.
- Hood-up motion still needs reviewed, normalized frames for production-quality run,
  jump, normals, and hurt animations.
- Some extreme fire trails are cropped conservatively to keep a predictable
  192-pixel cell.
- Automated ground alignment should receive artist review before this pipeline
  becomes the default.

## Runtime architecture

- `sprite-atlas.js` validates/caches the manifest, atlas, and effect images.
- `sprite-animation.js` controls frame timing, looping, events, completion, and
  interruption priority.
- `sprite-renderer.js` handles pivots, flipping, opacity, afterimages, scaling,
  optional Z/depth scale, ground shadow, and debug overlays.
- `fighter-visuals.js` translates authoritative fighter state into visual state
  and falls back to legacy rendering on every load/render failure. Appearance
  is resolved from each `fighter.appearance`, never one global hood value.
- `sprite-debug-viewer.js` is available only when the developer checkbox is
  enabled. It includes black, white, red, blue, and transparent-checkerboard
  backgrounds for compression-halo and edge inspection.

Priority is defeated, cinematic, clash, knockdown, hurt, guard break, perfect
block, block hit, attack, dash, jump/fall, run, stance, idle.

## Adding another fighter

1. Add a fighter folder with an atlas and manifest using the same schema.
2. Normalize frames to one cell and a consistent between-the-feet pivot.
3. Store character-specific visual settings separately from combat data.
4. Add a state adapter that selects common animation names.
5. Keep projectile/effect assets separate where practical.
6. Preload only when that fighter is selected and keep a legacy fallback.
7. Add manifest, priority, cleanup, and relative-path tests.

The renderer already carries optional `z`, depth scale, target-facing flip, and
ground-shadow support for a later 2.5D arena. This branch does not implement that
arena.
