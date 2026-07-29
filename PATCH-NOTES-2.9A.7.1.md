# Parallels X Prototype 2.9A.7.1 — Tutorial Grab Hotfix

This is a complete cumulative build. Prototype 2.9A.7 is not required.

## Fixed: Chapter 1 Grab lesson

The Basic Attacks step could trap a player because the Sage sometimes stopped outside the real grab range, or remained briefly airborne/invulnerable after another tutorial attack. Pressing Grab could therefore look broken and the checklist would never complete.

### Repairs

- The Sage now begins the Basic Attacks lesson inside close grab range.
- While Grab is still incomplete, the Sage actively approaches a closer teaching distance.
- Pressing Grab within a forgiving teaching radius stabilizes the training dummy and places it inside the real combat grab range before the shared engine resolves the move.
- The tutorial now marks Grab complete from a confirmed connected grab hit.
- Out-of-range attempts display **MOVE CLOSER** instead of silently failing.
- The instruction card explains that Grab is close range and shows live distance guidance.

The real combat rule is unchanged: Grab is still a short-range commitment and a missed grab still leaves the fighter open outside the tutorial assist.

## Validation

- 67 game JavaScript files passed `node --check`.
- The smoke-test JavaScript passed syntax checking.
- A regression test was added for confirmed grab-hit detection, tutorial range assist, and close-range instructions.
- The active page uses one cache identifier: `29a71-grab-tutorial-20260729`.
- Full WebGL and physical-controller testing still require a normal browser playtest.
