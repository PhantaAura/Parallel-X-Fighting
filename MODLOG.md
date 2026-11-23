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

## Jonathan and Raggie (2.9A.43)

- Added a 6 × 6 transparent atlas and animation manifest for Jonathan. His actions cover trap placement, explosive throws, chain reactions, demolition, and standard movement/combat states.
- Added a 6 × 6 transparent atlas and animation manifest for Raggie, using flat 2D hand-drawn cartoon art to match his original reference. His actions cover quick movement, flattening, folding through gaps, unfolding, feints, floating, and Paper Disc use.
- Added both fighters to the sprite visual manifest registry so their atlases can render when story content uses them.
- Both atlases use 192 × 192 cells, pivot [96, 178], default render scale 0.74, and right-facing orientation.

## Arcade ink UI (2.9A.44)

- Reworked the start screen, mode carousel, fighter setup, route chooser, and training controls with a flatter arcade palette, clearer hierarchy, and more legible text.
- Removed the route chooser's CSS-drawn placeholder faces in favor of simple route-color letter badges.
- Replaced internal build codenames in the player-facing version label with a clean version string.
- Kept existing gameplay and route selection behavior unchanged.
