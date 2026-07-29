# Parallels X: Clash of Souls — Prototype 2.9A.10

## Living Tournament Hub

Prototype 2.9A.10 rebuilds Chapter 2 around a living tournament town instead of sending Rrvvfo directly from a few conversations into consecutive arena fights. The tournament grounds now function as an RPG hub before the bracket and reopen between rounds.

This is a complete cumulative build. No earlier ZIP or patch is required.

## Main Chapter 2 quest spine

Only the four quests that directly support the Chapter 2 story are mandatory:

1. **The Lost Bracket** — help the announcer recover three contestant cards while learning the hub layout.
2. **Wade’s Shortcut** — race through five districts. Finishing is required; beating Wade’s route time is optional.
3. **The Cracked Ring** — inspect three damaged supports with Bark and defeat the saboteur in a ring-out lesson.
4. **Rumors About Plouke** — verify one new clue during each tournament intermission before the next major bracket event.

The tournament registration desk remains locked only until the first three preparation quests are complete. Plouke’s clues are gathered naturally between rounds rather than as one long investigation.

## Tournament intermissions

The tournament grounds reopen after:

- The opening qualifier
- The quarterfinal
- Bark versus Pouki
- Rrvvfo versus Wade

During each intermission, the player can follow the next Plouke lead, train, talk to updated NPCs, complete side quests, prepare a meal, or return to the bracket board. The next official event does not begin until the player chooses to enter the arena.

## Optional side quests

These activities are never required to progress:

- **Controlled Flame** — serve three correctly heated meals and choose a one-fight Power, Defense, or Speed meal.
- **The Fake Champion** — expose the scam with Lens of Truth or win a first-hit challenge. Reward: permanent Story Focus.
- **Wade’s Biggest Fan** — reunite a lost fan with Wade. Reward: permanent Story HP.
- **Dummy on the Loose** — shut down a runaway practice dummy. Reward: permanent Story Defense.
- **The Missing Prize Envelope** — catch a moving delivery cart. Reward: 80 coins and discounted tournament meals.
- **One Match Anyway** — give a rejected contestant a meaningful spar. Reward: permanent Story Power or Speed.

Bark’s spar, roaming grunts, and extra conversations also remain optional.

Optional quests enter the Story journal only after discovery. Until then, the journal simply points the player toward blue-marked locals so the hub does not feel like a mandatory checklist.

## RPG rewards

Chapter 2 side-quest bonuses now persist through the Story save:

- HP
- Power
- Defense
- Speed
- Focus

These bonuses affect Rrvvfo’s real Story combat calculations and are shown in the RPG menu. They do not change VS, Arena, or Training balance.

The food vendor now has a functional use for the prize-cart reward. After Controlled Flame is complete, the staff discount allows another one-fight tournament meal to be prepared for 20 coins.

## Hub exploration

The Local Tournament Grounds gained:

- Registration Plaza
- Market Street
- Practice Grounds
- Spectator District
- Main Arena Gate
- North and south walking loops
- Cross paths and service lanes
- Shops, benches, notice boards, and district signs
- Moving crowds, birds, carts, practice fighters, and changing ambient dialogue
- Quest markers that distinguish main objectives from optional activities
- Area-title transitions and district-aware objective text

Completing Wade’s route activates three real fast-travel shortcuts between the largest districts.

## Tournament and save compatibility

- Existing Chapter 2 saves that had already entered the tournament automatically receive the three new pre-tournament quest completions, preventing old saves from becoming locked.
- Quest arrays are normalized and deduplicated when loading.
- Meal buffs survive retries and are consumed only once when the official fight first begins.
- Chapter 2 still continues into the playable Chapter 3 demo after completion.

## Build identifiers

- Build: `Prototype 2.9A.10 — Living Tournament Hub`
- Story Engine: `2.9A.10`
- Save export schema: `247`
- Cache ID: `29a10-living-tournament-hub-20260729`

## Validation

- 70 game JavaScript files passed `node --check`.
- The browser smoke suite passed 207/207 checks in a route-backed Chromium harness.
- The one 404 logged by the smoke harness is the intentional missing-sprite-manifest fallback test.
- Chapter 2 quest-state, rumor-gate, shortcut, and persistent-stat checks passed directly in Node.
- All current JSON files parsed successfully before packaging.
- HTML, CSS asset, and JavaScript import references were checked with no missing local files.
- The main menu was visually audited at 1440×900 and 844×390 with no page errors.

A full real-time WebGL playthrough, physical-controller test, and human pacing review are still required. Headless Chromium in this environment cannot create the game’s WebGL arena.
