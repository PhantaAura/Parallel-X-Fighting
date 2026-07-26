# Install Prototype 2.5C2

```bash
cd ~/Downloads
unzip -o PX_2_5C2_Visual_Cleanup_Hotfix.zip

cd "/Users/emeraldhunter/Documents/Codex/Parallel-X-Fighting-fresh"
git switch prototype-2.4A-arena-foundation

rsync -av \
  "$HOME/Downloads/PX_2_5C2_Visual_Cleanup_Hotfix/" \
  ./

python3 -m http.server 4173
```

Open:

`http://localhost:4173/?v=25c2-visual-cleanup`

Then use Command + Shift + R.
