# Install Prototype 2.5B

This patch installs on top of Prototype 2.5A.

```bash
cd ~/Downloads
unzip -o PX_2_5B_Sonic_Battle_Movement.zip

cd "/Users/emeraldhunter/Documents/Codex/Parallel-X-Fighting-fresh"
git switch prototype-2.4A-arena-foundation

rsync -av \
  "$HOME/Downloads/PX_2_5B_Sonic_Battle_Movement/" \
  ./
```

Restart the local server:

```bash
python3 -m http.server 4173
```

Open:

```text
http://localhost:4173/?v=25b-battle-movement
```

Then press Command + Shift + R.

Expected arena badge:

```text
PROTOTYPE 2.5B • BATTLE MOVEMENT TEST
```
