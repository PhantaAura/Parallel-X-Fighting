# Prototype 2.9A.28.1 — Spacious Mobile Story UI

## Purpose

The Mode Select and Route Select carousels already fit phones well, but the playable Story hubs still squeezed desktop HUD cards, maps, and menus into the mobile viewport. This hotfix gives the in-game Story interface its own phone-first layout.

## Changes

- Chapters 1–4 use a compact mobile hub header with one objective card and one Story Menu button.
- Objective kicker and detail text collapse by default; the information button expands them without opening a separate screen.
- The persistent minimap is hidden on coarse-pointer mobile devices. The Map button and full map remain available.
- Road, tournament, Chapter 3, and Chapter 4 Story menus now open as full-width bottom sheets with safe-area padding and independent scrolling.
- Return, manual, journal, restart, and exit actions appear near the top of the sheet.
- Story attack categories use a horizontal card rail instead of consuming multiple vertical rows.
- Touchscreen Story menus hide the redundant keyboard/controller control legend.
- Chapter 2 quest lists, Chapter 3 case board, Chapter 4 journal, and the full map receive wider single-column mobile layouts.
- Existing desktop layouts, combat HUDs, story progression, saves, and the 2.9A.28 carousels are unchanged.

## Save compatibility

Save schema remains 268. No save migration is required.
