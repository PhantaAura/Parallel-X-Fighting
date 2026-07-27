# Prototype 2.4C Fighter Visibility Hotfix

- Replaces Safari-sensitive WebGL sprite planes with a transparent 2D fighter canvas layered above the 3D arena.
- Keeps the arena, shadows, projectiles, particles, and scenery in real WebGL 3D.
- Draws Rrvvfo and Revvfo from the existing animation atlases using projected 3D positions and perspective scaling.
- Preserves depth ordering between fighters.
- Adds a guaranteed temporary fallback fighter drawing while atlases load or if an asset fails.
- Keeps HUD, hotbar, Lens blindness, stage selector, controls, and mobile input above the fighter layer.
- Adds a visible PROTOTYPE 2.4C • FIGHTER FIX badge and cache-busted arena import.
