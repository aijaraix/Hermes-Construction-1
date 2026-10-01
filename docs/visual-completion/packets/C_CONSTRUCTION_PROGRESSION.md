# Packet C — Construction Progression

## Objective

Make visual state track actual construction state over time.

## Canonical visual states

Map existing project/operation states into at least:
- PLANNED
- STAGED
- LAYOUT
- IN_PROGRESS
- INSTALLED
- INSPECTED
- COMPLETE
- REWORK / BLOCKED where applicable

## Required behavior

A construction event that changes physical state must change the visible world when appropriate.

Examples:
- excavation modifies terrain;
- foundation placement creates foundation geometry;
- framing creates members;
- sheathing covers framing;
- dry-in adds weather-protection layers;
- rough MEP adds routed systems;
- close-in hides or layers over framing appropriately;
- rework visibly removes/replaces affected work where modeled.

## Timeline

The user must be able to move backward/forward through meaningful project states without losing project identity or truth labels.

## What Changed

For each meaningful transition, visually identify:
- added;
- removed;
- moved;
- changed-state;
- blocked/rework.

## Tests

Verify deterministic reconstruction of visible state from project revision/event state.

## Visual gate

The reported phase and the rendered scene must agree.

A “foundation” phase cannot display a generic completed building mass.
