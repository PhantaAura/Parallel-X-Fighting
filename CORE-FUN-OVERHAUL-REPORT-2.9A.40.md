# 2.9A.40 Core Fun Overhaul — Implementation Report

## Design problem

The existing route had a lot of content, but too much of the moment-to-moment rhythm could collapse into the same pattern: travel to an objective, receive dialogue, fight, receive a rank, and continue. This build focuses on changing what the player *does*, not merely extending chapter runtime.

## Replayable action-RPG loop

The first implementation target is:

**Explore → make a gameplay choice → fight/platform/investigate → earn a persistent result → try a different route/build/optional goal.**

This is intentionally a foundation rather than a giant loot/equipment system.

## Combat expression

Flow Cancel creates a small decision after a successful melee hit. Spending 8 Energy cancels recovery into Dash. It creates a choice between conserving Energy for techniques and spending Energy to keep movement/pressure fluid.

## Builds

Rrvvfo currently has three curated presets, each with four techniques and two passives. This avoids a huge inventory while still letting the player choose a style.

A Story safety rule is important: normal fights honor the selected build, but scripted traversal/tutorial states use the canonical technique order. This prevents a Fire Pressure build from making a required Object Swap or Lens interaction impossible.

## Chapter-specific play

- Chapter 1 makes the optional cliff path a real jump sequence and rewards route/traversal play.
- Chapter 2 leans into successive tournament fights and opponent behavior variety.
- Chapter 3 rewards solving the investigation cleanly rather than padding it with combat.
- Chapter 4 adds party-scale battles, then deliberately removes the party for the mountain section.

## Chapter 4 squad architecture

The current browser combat engine was built around one fully simulated player fighter and one fully simulated opponent fighter. 2.9A.40 does **not** pretend that engine was silently replaced with a universal six-fighter engine.

Instead, Chapter 4 adds a Story squad layer:

- Rrvvfo and the currently selected enemy use full Arena fighter simulation.
- Bark, Wade, and off-target enemies remain active as squad actors with position, HP, role logic, attacks, targeting, hit feedback, healing/support logic, and knockout state.
- Changing/defeating the selected enemy promotes another living squad enemy into the full Arena opponent slot while preserving its squad HP/position.

This gives the village defense simultaneous 3v3/3v2 pressure without destabilizing every existing 1v1 mode.

## What is intentionally deferred

- Full universal multi-fighter Arena/VS engine
- Party-character switching
- Huge skill trees/equipment inventories
- Dozens of Adventure Missions
- Chapter 5
- Online leaderboards or grind loops

The next decision should be based on human playtesting: if players voluntarily explore, replay fights, change builds, and pursue optional goals, expand this foundation. If not, continue fixing the core loop before adding more Story chapters.
