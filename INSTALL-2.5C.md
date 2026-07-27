# Install Prototype 2.5C

This patch is designed to be copied over Prototype 2.5B.

```bash
cd ~/Downloads
unzip -o PX_2_5C_Mission_0_No_Maximums.zip

cd "/Users/emeraldhunter/Documents/Codex/Parallel-X-Fighting-fresh"
git switch prototype-2.4A-arena-foundation

rsync -av \
  "$HOME/Downloads/PX_2_5C_Mission_0_No_Maximums/" \
  ./
```

Restart the local server from the repository root:

```bash
python3 -m http.server 4173
```

Open:

```text
http://localhost:4173/?v=25c-no-maximums
```

Then press Command + Shift + R.

## Test path

1. Open Story Mode — The Lost Year.
2. Open Rrvvfo — Restless Flame.
3. Select Mission 0 — No Maximums.
4. Finish the opening dialogue.
5. Try to hit the Sage three times with direct attacks.
6. Press 2 or select the second hotbar slot.
7. Progress from one clone to four.
8. Land the four-clone volley.
9. Return to the Lost Year screen and confirm Mission 0 shows progress.

Do not commit until the full mission can be completed and replayed without getting stuck.
