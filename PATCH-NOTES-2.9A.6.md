# Parallels X Prototype 2.9A.6
## Engine, Controls & Reliability Polish

This is a complete cumulative build based on 2.9A.5.

## 1. One Story and Arena foundation

Chapters 1, 2, and 3 now create the same `ArenaBattle` and attach the same `StoryEngineSession` before any chapter content begins.

The shared Story Engine owns:

- Arena startup and teardown
- Gameplay input dispatch
- CPU dispatch
- Update and rendering dispatch
- Dialogue lifecycle
- HUD modes
- Exploration, tutorial, combat, cinematic, and completion transitions
- Ability restrictions
- Story timer protection
- Keyboard/controller/touch prompt selection

Chapter files no longer replace `ArenaBattle.input`, `cpu`, `update`, `draw`, `applyDamage`, or the other engine methods directly. They register chapter profiles containing only scripted rules, encounters, objectives, NPC interaction, special cameras, and chapter-specific fight behavior.

## 2. One semantic input runtime

Normal battles, Training, Arena, and Story all use the same singleton `InputManager`.

Unified Player 1 keyboard layout:

- WASD — movement and 3D depth
- Space — jump
- J — light
- K — heavy
- I — launcher
- U — special in 2D / grab in Arena
- Shift — dash
- L — block
- O — ultimate or selected ability
- C — combo breaker in 2D / charge in Arena
- E — counter
- Z — Lens
- 1–5 — Arena ability slots

Controller and touch input now feed those same semantic actions. Controller vertical axes and D-pad up/down correctly reach Story and Arena depth movement.

## 3. Correct device prompts

- Story lessons read the active Nintendo, Xbox, PlayStation, or custom controller mapping.
- Tutorial prompts change when the player switches devices.
- Arena help uses the same current mapping.
- Story QTE jump input now uses the configured controller’s real Jump button instead of always assuming Xbox button 0.
- QTE labels adapt between keyboard letters, directional symbols, and the current Jump glyph.

## 4. Removed duplicate legacy Story Mode

The old character-select Story option and its obsolete roster-ladder runtime have been removed. Story is entered only from the dedicated main-menu Story route.

Old Quick Continue data that still says `story` is redirected to the real Story route instead of opening the obsolete character-select flow.

## 5. Loading reliability

- Retry and Return are bound in one place only.
- Match startup is protected by one in-flight promise, preventing duplicate match creation.
- Fighter manifests and movesets are actually validated.
- Stage selection is actually validated.
- Sprite loading still uses real atlas promises and per-fighter fallback.
- The finished loading card remains visible long enough to read.
- A run identifier prevents an older completion timer from hiding a newer Retry attempt.

## 6. Startup and audio reliability

All pointer, keyboard, and controller starts pass through one guarded `activateStartOnce()` path.

Procedural music now uses generation-specific gain buses. When a theme changes, the previous bus fades out and disconnects, so already-scheduled notes do not overlap the new menu, dojo, tournament, or battle theme.

## 7. CSS consolidation

Ten previously layered menu and Story patch files were merged, in their exact prior cascade order, into:

`css/interface-unified-29a6.css`

The active page now loads eight stylesheets instead of eighteen. Each former section is labeled inside the consolidated file so future cleanup can continue screen by screen without depending on patch-file order.

Every active CSS and JavaScript URL uses one cache identifier:

`29a6-engine-consolidation-20260729`

## 8. Showcase sprites enabled safely

- Showcase sprites now default On for new and migrated saves.
- Rrvvfo, Revvfo, and The Sage use runtime atlas support.
- A missing fighter atlas falls back only for that fighter instead of disabling the entire sprite pipeline.
- The player can still turn showcase sprites Off manually.

## 9. Smaller playable release

Large source sheets and design-reference images were removed from the playable package. Runtime atlases, animation manifests, and effects remain included.

The source artwork belongs in the private development archive, not the friend-test download.

## Validation performed

- All JavaScript files passed `node --check`.
- All JSON files parsed successfully.
- HTML local references were checked.
- Relative JavaScript imports were checked.
- CSS image references were checked.
- Duplicate HTML IDs were checked.
- The old character-select Story option was confirmed absent.
- Chapter source files were checked for direct engine-method replacement.
- One active cache identifier was confirmed.
- Development source sheets were confirmed absent.
- ZIP integrity was tested after packaging.

A complete live Chromium/WebGL playthrough could not be performed in this environment because the headless browser did not finish local navigation. The friend test still needs to judge real combat timing, physical controllers, audio balance, mobile comfort, and complete Chapter 1–3 progression.
