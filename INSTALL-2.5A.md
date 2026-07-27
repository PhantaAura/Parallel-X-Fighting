# Install Prototype 2.5A

From Terminal:

```bash
cd ~/Downloads
unzip -o PX_2_5A_Lost_Year_Foundation.zip

cd "/Users/emeraldhunter/Documents/Codex/Parallel-X-Fighting-fresh"
git switch prototype-2.4A-arena-foundation

rsync -av \
  "$HOME/Downloads/PX_2_5A_Lost_Year_Foundation/" \
  ./
```

Restart the local server from the repository root:

```bash
python3 -m http.server 4173
```

Open:

```text
http://localhost:4173/?v=25a-lost-year
```

Then press Command + Shift + R.

## Verify

- Main-menu build label: `Prototype 2.5A — Lost Year Foundation`
- Story Mode opens **The Lost Year** character-story screen
- Eight story routes are visible
- Rrvvfo's route opens Mission 1: **No Peace**
- Global Tournament feels substantially larger than Tangai Dojo

Do not merge this branch into `main` until the new Story screen and both arenas pass a local test.
