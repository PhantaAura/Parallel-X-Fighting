# Friend Playtest Checklist — Prototype 2.9A.31.3

## Verified automatically
- 309 / 309 browser smoke tests pass.
- Basic attack buffering retains a late Light input.
- Rrvvfo, Revvfo, Wade, and Bark expose distinct feel signatures.
- Instant Rematch resets match state.
- Story-safe battles do not offer Random Rematch.
- Victory animation state resets.
- Fighter Identity Guide closes without freezing Training.

## Real-device confirmation after deployment
1. Hard refresh the GitHub Pages game and confirm the title/build label says 2.9A.31.3.
2. Play one Arena match with each of the four released fighters and confirm the feel difference is noticeable without reading the guide.
3. Use Instant Rematch twice and confirm both fighters begin normally.
4. Finish a Story fight and confirm Random Rematch is absent.
5. Close the Fighter Identity Guide with mouse, keyboard/controller, and touch where available.
6. Open `tests/smoke.html` in a private browser window and confirm 309 / 309 on the deployed origin.
