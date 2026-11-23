# Fighter sprite atlas notes

## Stock reference

- Wade and Bark sheets are transparent RGBA WebP atlases at 1728 × 1920. They use 192 × 192 frames in a 9-column grid.
- Their animation manifests name every frame and provide source rectangles, ground pivots, animation timing, and a right-facing target orientation.
- Stock frame pivot is [96, 178], default render scale is 0.74, with alpha edges and shaded 3D character art.

## Jimmy (2.9A.42)

- Source identity: Jimmy's supplied model image. Visual style reference: Wade's stock atlas.
- Generated sheet is sliced from a 6 × 6 transparent RGBA grid and repacked as 1152 × 1152 WebP with 192 × 192 frames.
- Manifest has 36 cells and 30 states, emphasizing idle, run, retreat, dodge, block, redirect, protect, distract, reassurance, recovery, and peaceful victory. It intentionally defines no punch, kick, weapon, or offensive special animations because Jimmy is a pacifist.
- Ground pivot remains [96, 178], default render scale 0.74, right-facing.
