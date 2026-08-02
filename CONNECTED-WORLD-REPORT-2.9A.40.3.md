# Connected World Implementation Report — 2.9A.40.3

## Goal

Turn Chapters 1–4 into parts of one persistent RPG geography while keeping the existing chapter gameplay and save compatibility intact.

## Region graph

### Training Region
Tangai Dojo / Training Yard → Tournament Road Junction → Main Road, Forest Path, or Cliff Trail → Riverside → Tournament Outskirts.

### Tournament Region
West Gate, Practice District, Market, Central Plaza, Registration, Spectator District, Stadium, Rooftops, Service District, Backstage, Medical, and Security are represented as connected districts with loops instead of one direct corridor.

### Resonance Underground
Maintenance → Power → Corridor → Security / Records → Core → Terminal → Teleporter.

### Echo Region
Lower Trail → Village Gate → Central Village with Residential / Resonance Wall / Water Channel / Shrine / Apothecary / Upper Ridge branches → Cavern Approach → Caverns / Foothills → Mountain → Summit → floating Lookout.

## Persistent state

`worldState` is stored inside existing Lost Year progress and tracks:

- `currentRegion`
- `currentZone`
- `discoveredRegions`
- `discoveredZones`
- `landmarks`
- `shortcuts`
- `visitCounts`
- `lastEntrance`

Old completed missions infer previously visited geography so legacy players do not receive an empty map.

## Nonlinear Chapter 4 examples

### Old Water Lift
After Wade learns Lightning Current, the player can power a permanent Water Channel ↔ Upper Ridge loop.

### Old Apothecary Passage
During the optional Ryuzankaro potion route, Precision Object Swap can reveal a hidden Apothecary → Cavern Approach passage. This is a legal knowledge/skill shortcut rather than a glitch or quest skip flag.

### Cavern return
The repaired party route can be registered as a persistent Echo Cavern return shortcut.

## Map behavior

Region maps are discovery-based:

- known nodes are labeled;
- adjacent unknown nodes appear only as vague `?` hints;
- completely unknown remote nodes stay absent;
- opened shortcuts draw as a separate route layer;
- region art uses different visual palettes/landforms for Training, Tournament, Resonance, and Echo;
- the World view only reveals regions the save has reached.

## Interior architecture

`story-interiors.js` creates an explicit registry and transition model. This avoids the old pattern where an NPC can be visually placed “inside” a building shell that has no legitimate entrance. 2.9A.40.4 will use this foundation to build the actual clinic, offices, homes, shops, and other interiors.

## Chapter 5 compatibility

The connected-world model intentionally leaves room for Chapter 5 to return from Shadow's Lookout into the larger Echo/adjacent exploration world, search broad areas, discover hidden field-base entrances, and enter separate facility interiors. The inaccessible Project Hollow main cloning headquarters is not registered as a player-accessible region.

## Save compatibility

- Save schema: **268**
- Connected-world state version: **1**
- Old saves infer discovery from completed mission IDs.
- Invalid region/zone values fall back to a safe known region rather than corrupting Story progress.
