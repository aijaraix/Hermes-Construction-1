# Packet A — Architectural Legibility

## Objective

Make Academy House 001 immediately recognizable as a house under construction.

## Required outcomes

### Walls
- actual wall thickness and height;
- correct wall runs and corners;
- recognizable interior/exterior walls;
- door/window openings cut into host walls;
- support for non-orthogonal wall paths where required.

### Roof
- remove giant proxy/massing block behavior;
- render actual pitched/sloped roof geometry;
- show planes, ridge, eaves and relevant hips/valleys;
- show roof covering as a meaningful layer in finished/dry-in modes.

### Foundation
- represent slab/footings/stem wall according to canonical project state;
- maintain correct relation to terrain.

### Openings
- doors/windows must visually read as openings and assemblies, not floating labels or intersecting boxes.

### Framing
In framing mode, show structurally meaningful members where canonical data supports them:
- studs;
- headers;
- joists/beams;
- roof framing.

## Constraints

Do not fabricate architectural details unsupported by canonical state.

Where the current model lacks a required dimension or geometry fact:
- preserve the unknown explicitly;
- use the reference fixture only when the fixture is the declared source;
- do not invent a visually convenient dimension.

## Tests

Add/extend tests for:
- canonical dimensions;
- hosted opening geometry;
- roof plane generation;
- wall path geometry;
- scene component/state mapping.

## Visual gate

Desktop and mobile evidence must show:
- recognizable house silhouette;
- recognizable walls;
- recognizable roof;
- actual openings;
- framing mode.

If the scene still reasonably looks like generic boxes, Packet A fails.
