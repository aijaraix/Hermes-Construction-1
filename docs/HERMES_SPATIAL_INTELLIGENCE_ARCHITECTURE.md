# HERMES SPATIAL INTELLIGENCE ARCHITECTURE

**Status:** Planning specification  
**Purpose:** Define the canonical spatial reasoning system that supports Academy simulation today and future real-world construction robotics later.

## 1. Objective

HERMES must reason about:

- where every relevant object is;
- what volume it occupies;
- what space an actor/tool/payload needs to move;
- what areas are reserved or unsafe;
- what construction changes will alter future accessibility;
- what sequence is physically possible.

Spatial intelligence is not a visual effect.

It is a core planning constraint.

## 2. Current implementation reality

Existing source already contains:

- spatial actors;
- work zones;
- access paths;
- material envelopes;
- project world frames;
- 1:1 metric world concepts;
- facility placement evaluation;
- actor positions/envelopes;
- equipment dimensions/clearance radii;
- material staging geometry;
- long-material/future-closure constructability proof;
- collision/bounding-envelope logic.

A major current limitation is that `SpatialLogisticsEngine.find3DPath()` is labeled as 3D A* but currently returns deterministic midpoint waypoints and always reports a path. It is not yet a real obstacle-aware A* search.

That must be treated as **PARTIAL**, not complete pathfinding.

## 3. Canonical spatial hierarchy

Use three spatial resolutions simultaneously.

### Level A — 1 m planning cells

Nominal size:

`1m × 1m × 1m`

Purpose:

- global spatial address;
- coarse occupancy;
- adjacency;
- project/site zoning;
- work-zone planning;
- high-level routing;
- task coordination;
- fast look-ahead.

A planning cell is not a rendering voxel.

### Level B — adaptive/fine occupancy

Use finer resolution only where needed.

Examples:

- doorways;
- corridors;
- MEP corridors;
- equipment maneuvering;
- payload transport;
- room interior navigation;
- excavation edge conditions.

Resolution may be:

- 0.25 m;
- 0.10 m;
- smaller/adaptive around critical geometry.

Do not allocate centimeter voxels across an entire large site unless needed.

### Level C — continuous precise geometry

Use exact canonical geometry for:

- collision;
- clearance;
- installation;
- wall/opening truth;
- MEP routing;
- robot payload envelopes;
- swept-volume validation.

The world cell is the cognitive lattice.

Continuous geometry is the physical truth.

## 4. World frame

Canonical storage:

- length: meters;
- orientation: quaternion or radians;
- root datum: project-defined world frame;
- vertical axis: consistent with current HERMES/Three.js mapping;
- optional georeference transform for real site coordinates.

Every object should expose:

- world transform;
- parent/local transform;
- bounding volume;
- collision volume where different;
- spatial precision/confidence when observed from sensors.

## 5. Spatial entity types

Spatial reasoning should support:

- permanent building component;
- temporary construction component;
- material/inventory;
- human actor;
- robot actor;
- vehicle/equipment;
- tool;
- work zone;
- exclusion/safety zone;
- access path;
- staging zone;
- observation/sensor;
- terrain/ground;
- obstacle;
- opening/portal.

Each entity needs an explicit spatial role.

## 6. Embodied actor effective geometry

Do not plan against body geometry alone.

Use:

`effective envelope = body + articulated posture + tool + payload + required safety clearance`

Examples:

- empty framing robot;
- framing robot carrying 12 ft LVL;
- worker carrying sheet goods;
- forklift with raised load;
- excavator with boom swing;
- crane with suspended load.

The effective envelope can change during a task.

## 7. Actor spatial state

A physically embodied actor should expose:

- actor ID;
- pose;
- orientation;
- velocity;
- mobility mode;
- current cell(s);
- current work zone;
- body envelope;
- tool envelope;
- payload envelope;
- combined/effective envelope;
- current path;
- target;
- reserved corridor;
- localization confidence;
- state: idle/moving/working/blocked/unsafe/fault.

Humans, robots, vehicles, and equipment may share the common contract with capability-specific extensions.

## 8. Occupancy representation

Each planning/fine cell should be able to represent:

- static occupied;
- dynamic occupied;
- reserved;
- temporarily blocked;
- unsafe;
- traversable;
- unknown/unobserved;
- cost/penalty;
- active task owner;
- valid time interval.

A cell may be passable for one actor and blocked for another.

Example:

- person: traversable;
- empty robot: traversable;
- robot + 3.66 m LVL: not traversable.

Therefore traversability is:

`f(world, actor, tool, payload, posture, time)`

not simply a boolean map.

## 9. Portals and transitions

Doors, gates, stairs, ramps, temporary openings, hoist zones, and floor transitions should be explicit spatial portals.

Portal contract:

- source zone;
- destination zone;
- clear width;
- clear height;
- elevation change;
- slope;
- turn constraints;
- load/weight constraints;
- availability interval;
- closure event/task;
- supported actor classes.

The long-material test should reason against portals, not only room boxes.

## 10. Real pathfinding

Replace placeholder waypoint generation with real search when P2 begins.

Recommended architecture:

### Coarse route

A*/Dijkstra over:

- work zones;
- portals;
- 1 m cells.

### Fine validation

For candidate route:

- adaptive occupancy;
- continuous collision checks;
- payload orientation feasibility;
- swept-volume validation.

### Local motion planning

Future robot-local planner may use:

- nav mesh;
- Hybrid A*;
- RRT/RRT*;
- lattice planner;
- manufacturer/robot-specific motion planner.

HERMES does not need to duplicate all robot-local motion planning.

It must produce a mission/route corridor that is physically feasible.

## 11. Route contract

A route should include:

- route ID;
- actor;
- payload;
- start;
- goal;
- waypoints/corridor;
- required orientation states;
- portal transitions;
- minimum clearance;
- estimated distance/time;
- reservations;
- validity interval;
- hazards;
- world revision/hash used for planning.

If the world changes, route validity must be re-evaluated.

## 12. Swept-volume reasoning

A route is valid only if the actor's effective volume can traverse it.

For a rigid long object, track orientation through movement.

Approximation hierarchy:

1. AABB coarse rejection;
2. OBB oriented-box validation;
3. capsule/cylinder/profile checks where appropriate;
4. mesh-level check only when needed.

Use the cheapest deterministic method that preserves correctness.

## 13. Work-zone reservations

Construction is multi-actor.

A work zone should support:

- owner task;
- active actors;
- required equipment;
- spatial bounds;
- start/end;
- safety buffer;
- permitted disciplines;
- conflicting activities;
- ingress/egress path.

Before dispatching work, HERMES should check:

- zone availability;
- route availability;
- equipment clearance;
- concurrent interference;
- safety constraints.

## 14. Temporal spatial state

The world is 4D:

`space + time`

HERMES must know:

- what exists now;
- what will be installed;
- what will be removed;
- when access changes;
- when a zone becomes blocked/free.

Temporary works are especially time-dependent.

Example:

`temporary opening OPEN until TASK-420 → CLOSED after TASK-420`

## 15. Future-world constructability

Before committing a geometry-changing task, HERMES should evaluate downstream physical feasibility.

Question:

> If this object is installed now, what future tasks lose feasible access?

Workflow:

1. identify world mutation;
2. create candidate future world;
3. identify downstream tasks/material/equipment routes;
4. revalidate required access;
5. detect newly infeasible tasks;
6. create/reorder dependency;
7. record evidence.

Dependency reason:

`FUTURE_CONSTRUCTABILITY`

## 16. Signature constructability tests

Maintain deterministic regression cases.

### Long material before closure

A 3.66 m LVL cannot be transported after a restricted opening is closed.

### Drywall access

Sheet geometry vs corridor + doorway turn.

### Equipment egress

Excavator/forklift must exit before enclosure/grade change blocks route.

### Ceiling close-in

Valves, dampers, junctions, inspections, or large equipment must be installed/verified before ceiling closure.

### Crane/logistics conflict

Delivery/truck path conflicts with active crane/exclusion zone.

### Maintenance access

Installed equipment must preserve required service clearance.

## 17. Spatial dependency taxonomy

Use explicit reasons:

- LOGICAL;
- PHYSICAL_ACCESS;
- TEMPORARY_ACCESS;
- FUTURE_CONSTRUCTABILITY;
- SPATIAL_CONFLICT;
- SAFETY;
- MATERIAL;
- TOOL;
- EQUIPMENT;
- RESOURCE;
- INSPECTION;
- ENVIRONMENTAL.

A schedule edge without causal type loses valuable construction intelligence.

## 18. Terrain and outdoor site reasoning

Spatial intelligence must include the construction site, not only rooms.

Terrain factors:

- elevation;
- slope;
- surface type;
- wetness/trafficability;
- excavation;
- trenches;
- temporary roads;
- crane pads;
- overhead constraints;
- flood/water;
- unstable/unsafe zones.

Traversability may depend on equipment.

Example:

- tracked excavator: pass;
- delivery truck: fail;
- human: pass with safety penalty.

## 19. Observed vs planned world

Future real sites need separate states:

### Design/planned

What should exist.

### Observed

What sensors/cameras/robots believe exists.

### Executed/verified

What HERMES has evidence was completed.

Canonical world must preserve source/confidence.

Do not silently overwrite design truth with a low-confidence observation.

## 20. Sensor observation contract

Future observation record:

- sensor ID;
- timestamp;
- world frame;
- pose confidence;
- observed entity/region;
- observation type;
- measured geometry;
- confidence;
- raw evidence reference;
- reconciliation status.

Examples:

- camera detection;
- LiDAR point region;
- depth map;
- robot odometry;
- survey measurement.

## 21. Spatial reconciliation

Future loop:

`DESIGN → EXPECTED STATE → SENSOR OBSERVATION → RECONCILIATION → VERIFIED WORLD UPDATE`

Possible outcomes:

- MATCH;
- DEVIATION;
- UNKNOWN;
- STALE;
- CONFLICTING_EVIDENCE.

Inspection/QA decides what can promote to verified physical state.

## 22. Safety separation

Do not use generative model output as the final real-time safety layer.

Future physical safety must use deterministic systems for:

- emergency stop;
- exclusion zones;
- collision avoidance;
- speed limiting;
- human proximity;
- equipment interlocks.

HERMES may plan and coordinate; hardware/local safety has veto authority.

## 23. Performance strategy

Large sites cannot run continuous mesh-vs-mesh collision across every object.

Use hierarchy:

1. zone/cell broad phase;
2. bounding volume;
3. oriented envelope;
4. precise geometry only for candidates.

Cache:

- static occupancy;
- portal graph;
- unchanged geometry;
- route segments.

Invalidate cache by world revision.

## 24. Provenance/evidence

Every spatial decision should record:

- world revision/hash;
- actor envelope;
- payload envelope;
- route/zone;
- constraints checked;
- result;
- algorithm/version;
- confidence;
- originating task.

Then HERMES can explain:

> Why was this material moved first?

with actual spatial evidence.

## 25. First implementation slices

After construction modeling primitives are stable:

### Slice 1 — Real occupancy grid

Generate 1 m planning cells from canonical geometry.

### Slice 2 — Portal graph

Doors/openings/gates with clearance.

### Slice 3 — Real A*

Obstacle-aware route for simple actor.

### Slice 4 — Payload-aware route

Compare empty actor vs actor carrying long object.

### Slice 5 — Temporal closure

Route valid before wall closure, invalid after.

### Slice 6 — Work-zone reservation

Two tasks competing for one corridor/zone.

## 26. P2 acceptance benchmark

P2 is successful when HERMES can physically demonstrate:

1. canonical geometry populates occupancy;
2. actor gets a route around obstacles;
3. route changes by actor/payload;
4. future geometry invalidates a required route;
5. HERMES derives a task dependency;
6. evidence explains why;
7. result is visible in the BIM world;
8. the same contracts are hardware-neutral enough for future robot/site-computer consumption.
