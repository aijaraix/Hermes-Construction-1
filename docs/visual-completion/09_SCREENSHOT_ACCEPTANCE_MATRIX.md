# Visual Screenshot Acceptance Matrix

## Rule

Visual acceptance requires evidence from the actual rendered product.

Source code, DOM output, unit tests, component existence, server logs, and headless structural assertions are not substitutes for rendered visual evidence.

## Desktop evidence

Capture and inspect:

1. Empty/existing site
2. Site layout
3. Excavation
4. Foundation
5. Framing
6. Roof framing
7. Dry-in shell
8. Rough MEP
9. X-ray/system view
10. Construction-complete house
11. Materials workspace
12. Schedule workspace
13. Logistics workspace
14. Universal Inspector
15. What Changed
16. Attention state
17. Timeline/replay

## Mobile evidence

Capture at minimum:
- main project scene;
- building/framing scene;
- Inspector;
- Materials;
- Schedule;
- timeline/replay.

## Evidence metadata

Every acceptance image set must record:
- source commit SHA;
- project ID;
- project revision/construction state;
- viewport size/device class;
- camera/view mode;
- timestamp;
- known limitations.

## Inspection questions

For each scene ask:

### Recognition
Can a normal observer identify what is being shown?

### Scale
Do person/equipment/opening/building proportions make physical sense?

### State
Does the visual scene match the claimed construction stage?

### Geometry
Are walls, roof, openings, ground, and systems represented by meaningful shapes instead of generic proxies?

### Spatial relationship
Does the project visibly fit on the site and relate correctly to access/staging/work areas?

### Interaction
Can the user select meaningful objects and inspect their current truth/state?

### Professional quality
Would a construction professional understand the scene without needing a developer to explain what the boxes mean?

## Failure policy

If any critical acceptance scene is visibly misleading, obviously proxy-like, dimensionally inconsistent, or contradicts canonical state, the packet is not visually accepted.

Record defects and repair before advancing when they undermine the next packet.
