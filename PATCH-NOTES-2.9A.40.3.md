# Prototype 2.9A.40.3 — Connected World & Exploration Framework

This cumulative build changes the released Rrvvfo route from four isolated map concepts into one persistent connected-world model without adding Chapter 5.

## Connected world

- Adds four persistent regions: **Training Region**, **Tournament Region**, **Resonance Underground**, and **Echo Region**.
- Records the exact region/area Rrvvfo has visited, the entrance used, visit counts, discovered landmarks, and permanent shortcuts.
- Existing 2.9A.40.2 saves migrate into the connected-world state automatically. Save schema remains **268**.
- The released Story bridge is now represented as Tournament Road → Tournament Region → Resonance Underground → damaged teleporter → Echo Region.
- Chapter Select/replay remains available; connected-world state is the foundation for normal Story continuity and revisiting.

## Nonlinear hubs and route knowledge

- Chapter 1 records Main Road / Forest / Cliff discoveries and the skilled Cliff shortcut.
- Chapter 2 maps the festival as districts instead of one corridor. Wade route progress can permanently reveal useful cuts between tournament districts.
- Chapter 3 deliberately reuses the Tournament Region after hours before moving through the Resonance Facility and into Echo Region.
- Chapter 4 adds a powered **Old Water Lift** loop and a skilled **Old Apothecary Passage** route. The latter rewards Precision Object Swap knowledge during the optional potion route instead of forcing the long village loop every time.
- Echo Caverns can register a permanent return route after the party field route is repaired.

## Illustrated exploration maps

The Story map now supports three views:

- **LOCAL** — immediate player/objective/landmark positions.
- **REGION** — stylized geography, discovered districts, nearby unknown areas, and opened shortcuts.
- **WORLD** — the larger released journey and discovered regions.

Unvisited areas remain vague. Hidden routes are not drawn before discovery. Opened permanent shortcuts are added to the map.

## Travel Journal

The Rrvvfo route screen now includes a compact World Travel Journal showing:

- current region and area;
- mapped area count per discovered region;
- number of permanent shortcuts discovered.

This is informational rather than a permanent exploration-HUD checklist.

## Building/interior foundation

A new interior registry establishes the next patch's building architecture for:

- Tournament Medical Center;
- Tournament Administration;
- Fighter Backstage;
- Old Apothecary;
- Echo homes.

These interiors are **not falsely marked enterable in 2.9A.40.3**. The framework defines Door → Interior → Return transitions, building-map titles, and contextual locked-door dialogue. Actual modeled/enterable interiors are reserved for 2.9A.40.4.

## Not included yet

- Chapter 5 Story content.
- Full interior rooms/building art.
- Large batches of secrets, hidden fights, and ambient world events.
- Fast travel.

Those stay on the roadmap so this architecture can be stress-tested before more content is layered onto it.
