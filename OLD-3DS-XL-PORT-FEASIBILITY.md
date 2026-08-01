# Old Nintendo 3DS XL Port Feasibility

## Recommendation

Try a **small native proof of concept later**, but do not make the Old 3DS XL the main platform or block browser development on it.

The current game cannot be copied directly into the Old 3DS browser. It depends on modern JavaScript modules, WebGL-style rendering, large sprite/asset packages, dynamic UI, and memory budgets far beyond what that browser is designed to handle.

A real 3DS version would be a separate native homebrew rebuild with a reduced scope:

- C or C++ using the established 3DS homebrew toolchain
- Citro2D or Citro3D rendering instead of browser WebGL
- Two fighters at once
- One small stage first
- 30 FPS target before visual extras
- Compressed sprite sheets and streamed audio
- Simplified particles, lighting, menus, and Story hubs
- Top screen for combat; bottom screen for HUD, abilities, pause, and map

## Best prototype

Build only this vertical slice:

1. Rrvvfo versus Revvfo
2. Tangai Dojo
3. Move, jump, light, heavy, launcher, dash, block, and one special
4. First to one KO
5. Static bottom-screen HUD

Continue only if that slice holds its frame rate and memory budget on an actual Old 3DS XL.

## What should not be attempted first

- Full Chapters 1–4
- Every fighter and atlas
- Web build running inside the 3DS browser
- Online multiplayer
- Full pursuit effects, dynamic hub decoration, or large audio banks
- Matching the browser build feature-for-feature

The 3DS edition should be treated as **Parallels X: Clash of Souls Pocket Prototype**, not as the canonical full version.
