# Install Prototype 2.5C1

Apply this after Prototype 2.5C.

```bash
cd ~/Downloads
unzip -o PX_2_5C1_Story_Select_Battle_Dialogue_Hotfix.zip

cd "/Users/emeraldhunter/Documents/Codex/Parallel-X-Fighting-fresh"
git switch prototype-2.4A-arena-foundation

rsync -av \
  "$HOME/Downloads/PX_2_5C1_Story_Select_Battle_Dialogue_Hotfix/" \
  ./
```

Restart:

```bash
cd "/Users/emeraldhunter/Documents/Codex/Parallel-X-Fighting-fresh"
python3 -m http.server 4173
```

Open:

```text
http://localhost:4173/?v=25c1-story-dialogue
```

Then press Command + Shift + R.
