# Global Tournament Pipeline Check

Global Tournament is intentionally data-driven. Its dimensions, spawns, camera, fog, floor, ring ropes, scenery, projectile limits, and performance tier live in `js/arena/arena-stages.js`.

The shared renderer now supports either one boundary rail or a `rails` array, allowing the tournament ring to use three ropes without a tournament-specific render function.

The combat loop continues to read stage boundaries for movement clamping, AI wall avoidance, Object Swap, Lens dodges, Shots of Agony placement, camera framing, and projectile cleanup.
