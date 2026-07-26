# Install 2.5C4

```bash
cd ~/Downloads
unzip -o PX_2_5C4_Sage_Sprite_Render_Hotfix.zip

cd "/Users/emeraldhunter/Documents/Codex/Parallel-X-Fighting-fresh"
git switch prototype-2.4A-arena-foundation

rsync -av \
  "$HOME/Downloads/PX_2_5C4_Sage_Sprite_Render_Hotfix/" \
  ./

python3 -m http.server 4173
```

Open `http://localhost:4173/?v=25c4-retina-sprite-hotfix` and press Command + Shift + R once.
