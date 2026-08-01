# Prototype 2.9A.31.3 — Save, Stage, Chapter 4 & Fallback Reliability

## Save and startup reliability
- Save Export and Reset All now cover the complete current Story, Lens, Sage Manual, Arena controls, dialogue, controller, touch, visual, QOL, hotbar, mobile-presentation, and Training-preset data set.
- Save Import now requires the active save schema and replaces the complete known save set atomically. Failed imports roll back to the previous data.
- Story saves are written and verified. A failed write returns the last verified progress, shows a visible warning, and no longer emits false checkpoint or chapter-completion events.
- Startup storage access is guarded so restricted iPhone/Safari storage cannot permanently lock the start screen.
- Interrupted Story fights can restore the pre-fight checkpoint on the next page load.

## Stage reliability
- VS CPU, 2 Player, Stage Select, Extras, Quick Continue, and menu descriptions now use the same five playable stages: Tangai Dojo, Global Tournament, Resonance Facility, Echo Caverns, and Mountain Path.
- Removed the old selectable Asrylyte, Clone Base, and Hell IDs that silently fell back to the Dojo.
- Ring-out behavior now reads each stage profile’s `RING-OUT` boundary instead of checking the Tournament ID.
- Mountain Path and Echo Caverns retain their current arena identities without reusing the old Hell presentation.

## Chapter 4 and playtesting
- The secret playtest menu includes **CHAPTER 4 • ECHO VILLAGE HUB**.
- This jump creates a clean temporary Chapter 4 state directly in Echo Village and preserves the player’s real Story save.
- Normal Chapter 4 entry, replay, progression, Ryuzankaro gating, rewards, and completion remain unchanged.
- Chapter 3’s Hamual, Daniel, and Wade dummy-pattern names now explain the behavior each pattern represents.

## Fighters, portraits, and mobile feedback
- Asset-less Story enemies use their configured accent instead of sharing the same purple fallback silhouette.
- The sprite loader requests manifests only for fighters with packaged atlases, preventing repeated missing-manifest requests from Hollow Grunts and other asset-less enemies.
- Portrait combat retains compact Pursuit, Focus Recovery, event, and ring-edge cues.
- Expanded mobile Training UI is placed below the protected combat-prompt region.

## Smoke runner
- A timed-out smoke test now stops the suite before later tests can run against contaminated shared state.
- The page explains that it must be reloaded after a timeout.
- 309 smoke tests are packaged.

## Compatibility
- Save schema remains 268.
- No combat damage, Energy costs, Focus Recovery values, pursuit balance, or released Story content changed.
