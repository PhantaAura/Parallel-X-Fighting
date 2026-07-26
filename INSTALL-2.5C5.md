# Install Prototype 2.5C5

```bash
cd ~/Downloads
unzip -o PX_2_5C5_Sage_No_Clipping_Hotfix.zip

cd "/Users/emeraldhunter/Documents/Codex/Parallel-X-Fighting-fresh"
git switch prototype-2.4A-arena-foundation

rsync -av \
  "$HOME/Downloads/PX_2_5C5_Sage_No_Clipping_Hotfix/" \
  ./
```

Stop the old local server with Control+C, then restart it:

```bash
cd "/Users/emeraldhunter/Documents/Codex/Parallel-X-Fighting-fresh"
python3 -m http.server 4173
```

Open:

```text
http://localhost:4173/?v=25c5-sage-no-clipping
```

Then press Command+Shift+R.
