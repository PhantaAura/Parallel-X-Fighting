# 2.9A.40.5 Implementation Report

## What changed

### World Delight state
A new `js/story/world-delight.js` module stores small discoveries independently from mandatory Story progression. It currently defines discoveries for the Chapter 1 cliff overlook, Chapter 2 festival shortcut route, Chapter 3 night service route, Chapter 4 Water Lift, Chapter 4 Apothecary Passage, and a hidden-nearby Echo overlook.

These discoveries dispatch the existing Story arrival/banter presentation rather than creating a separate quest UI.

### Party banter
`story-charm.js` now supports a secondary checkpoint-banter table in addition to checkpoint arrival/progression cards. These lines are short and one-time so they add personality without turning exploration into constant cutscenes.

### Learned-by-doing moments
Field-skill mastery cards now include one brief owner reaction and dispatch a field-mastery event plus the existing Story UI audio cue. World Delight listens for the event and can follow with the existing party-banter presentation.

### Combat juice
The existing Arena combat pipeline remains intact. 40.5 only strengthens presentation around already-supported success states:
- Flow Cancel
- perfect parry
- pursuit finisher
- Support heal interruption

No damage or cooldown balance was changed by this pass.

### Hollow Watcher
The boss keeps the same Action Scan → Range Scan → Route Scan rules. Phase transitions now use stronger presentation and short Rrvvfo reactions. Pattern-breaking and exposed windows are unchanged mechanically.

### Chapter 4 squad set piece
The 3v3 logic still uses the existing squad architecture. Added readable low-HP/down reactions for Bark and Wade plus a short clean-clear reaction when all three ninjas remain standing.

## Files with primary gameplay changes

- `js/story/world-delight.js` (new)
- `js/story/story-charm.js`
- `js/story/field-skills.js`
- `js/story/story-polish.js`
- `js/story/rrvvfo-road-hub.js`
- `js/story/rrvvfo-mission-2.js`
- `js/story/rrvvfo-chapter-3.js`
- `js/story/rrvvfo-chapter-4.js`
- `js/arena/arena-mode.js`
- `js/save-manager.js`
- `js/main.js`
- `css/world-delight-29a405.css` (new)
- `index.html`

Release/test/cache files were also updated for Prototype 2.9A.40.5.

## Explicit non-goals

- No Chapter 5 content.
- No quest overhaul yet (reserved for 40.7).
- No full revisit loop yet (reserved for 40.6).
- No major new combat system.
- No giant map-marker checklist.
