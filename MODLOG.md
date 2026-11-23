# Fighter sprite atlas notes

## Chapter 1–4 environment pass (2.9A.47)

- Added original painterly scene backdrops for the natural Chapter 1 field, the Chapter 2 tournament grounds, the Chapter 3 automated factory, Echo Region, the rocky mountain ascent, and Shadow’s floating sanctuary.
- Kept the environments behind the existing 3D floors and scenery, so collision, race checkpoints, story triggers, puzzles, side quests, and map progression still use their existing world data.
- Kept Chapter 1’s route a countryside field with no tournament branding; the tournament architecture appears only at the actual grounds.
- Added a Rrvvfo correction to Wade’s introduction: Wade calls it a route “to the tournament,” Rrvvfo points out they are already inside, and Wade reframes it as the fastest route across.
- Added a Settings-only MAP DEBUG MODE unlock with chapter warps, five boss practice fights, combat quick tests, and six temporary map previews. Chapter entries run as replays; practice fights and previews use training mode, so they do not change story progress. The older Story Menu debug room now also requires the Settings unlock.
- Kept the after-hours tournament investigation on its dark night palette instead of showing the daytime tournament backdrop.
- Updated the browser cache key and build label to 2.9A.47. Save schema remains 268.


## Broad reliability and QoL pass (2.9A.46)

- Fixed the built-in QA screen’s stale recovery build check; it compares the dedicated Chapter 1 recovery layer version instead of expecting the overall game build to contain a historical version string.
- Aligned current versioned imports for the story battle engine, arena runtime, Chapter 1 recovery layer, and playtest checks so they share module instances after a browser refresh.
- Updated the README’s current build details to match the cumulative release.
- Kept save schema 268 unchanged.

## Adventure presentation pass (2.9A.45)

- Reframed Chapter 1 as a guided dojo lesson with a short training plan, control summary, checkpoint resume, and a clearer skip-ahead action.
- Locked Wade, Bark, Virek, and Oddballs story routes until all eight Rrvvfo chapters are complete, with a direct-entry guard and an unlock explanation in the route menu.
- Repainted local, regional, and world maps with layered hills, roads, rivers, landmarks, and warmer hand-drawn colors while preserving map discovery and objective markers.
- Updated the build/cache version to 2.9A.45.

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
