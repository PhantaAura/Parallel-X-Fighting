# Parallels X — Prototype 2.5C4

## Sage Sprite + Retina Render Hotfix

- Uses new Sage and Rrvvfo atlas filenames so Safari cannot combine a corrected animation manifest with an older cached texture.
- Cache-busts the complete module chain from `index.html` through Mission 0.
- Raises the transparent fighter layer from 960×540 to 1920×1080 while gameplay coordinates stay unchanged.
- Uses high-quality resampling for cleaner character edges.
- Changes the Sage's Mission 0 health bar from purple to white.
- Keeps Mission 0 dialogue, auto-dodging, progression, and combat rules unchanged.
