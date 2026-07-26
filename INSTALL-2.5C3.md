# Install Prototype 2.5C3

```bash
cd ~/Downloads
unzip -o PX_2_5C3_Mission_0_Visual_Hotfix.zip

cd "/Users/emeraldhunter/Documents/Codex/Parallel-X-Fighting-fresh"
git switch prototype-2.4A-arena-foundation

rsync -av \
  "$HOME/Downloads/PX_2_5C3_Mission_0_Visual_Hotfix/" \
  ./
```

Restart the local server from the repository folder:

```bash
python3 -m http.server 4173
```

Open:

```text
http://localhost:4173/?v=25c3-sprite-hud-fix
```

Then press Command + Shift + R.
