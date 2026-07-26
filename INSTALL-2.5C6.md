# Install Prototype 2.5C6

```bash
cd ~/Downloads
unzip -o PX_2_5C6_Animated_Sage_Clipping_Fix.zip

cd "/Users/emeraldhunter/Documents/Codex/Parallel-X-Fighting-fresh"
git switch prototype-2.4A-arena-foundation

rsync -av \
  "$HOME/Downloads/PX_2_5C6_Animated_Sage_Clipping_Fix/" \
  ./
```

Restart the local server:

```bash
cd "/Users/emeraldhunter/Documents/Codex/Parallel-X-Fighting-fresh"
python3 -m http.server 4173
```

Open:

```text
http://localhost:4173/?v=25c6-animated-sage
```

Then use Command + Shift + R.

Expected arena badge:

```text
PROTOTYPE 2.5C6 • RRVVFO MISSION 0
```
