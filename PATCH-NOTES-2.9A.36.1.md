# Prototype 2.9A.36.1 — Chapter 4 Replay Overlay Fix

## Fixed
- Chapter 4 Replay no longer shows the completed **Shadow’s Lookout** panel over the opening dialogue.
- Chapter 4 choice and QTE overlays now obey their `hidden` state instead of being forced visible by CSS.
- Every Chapter 4 start explicitly clears transient completion, choice, and QTE presentation.

## Scope
- No Story, quest, combat, balance, reward, or save-schema changes.
- Save schema remains **268**.
- Browser smoke coverage increases to **344** cases.
