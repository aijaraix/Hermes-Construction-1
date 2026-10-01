# HERMES EXECUTION ROADMAP

**Purpose:** Keep HERMES moving in the correct order and prevent expensive workers from exploring work that is not yet needed.

## Guiding principle

Do not optimize HERMES for “more features.”

Optimize for this progression:

**truthful construction world → reusable construction modeling → spatial intelligence → reliable runtime → local-first reasoning → academy depth → robotics interfaces → building-scale generalization**

---

# P0 — PHYSICAL VISUAL ACCEPTANCE

## Objective

Prove that Academy House 001 is physically understandable and visually credible in the real running application.

## Required proof

- empty site;
- mobilization / temporary facilities;
- foundation;
- framing;
- roof/enclosure;
- MEP;
- close-in/finishes;
- completed residence;
- X-ray/system isolation;
- section/cutaway;
- walkthrough;
- timeline/replay;
- site logistics;
- actor/material visibility;
- component provenance;
- long-material future-constructability case.

## Exit rule

Do not leave P0 because source code “looks correct.”

Leave P0 only after actual browser evidence exists and visual defects are triaged.

## Current status

**ACTIVE**

---

# P1 — CONSTRUCTION MODELING FOUNDATION

## Objective

Turn the first house from a vertical-slice implementation into reusable construction modeling primitives.

## Core primitives

- site/terrain envelope;
- building/storey/space hierarchy;
- walls and layered wall assemblies;
- floors/slabs;
- footings/foundations;
- beams;
- columns;
- openings;
- doors/windows;
- stairs;
- roof planes / roof systems;
- roof framing/trusses/rafters;
- rooms/zones;
- pipes/fittings;
- conduits/cable pathways;
- ducts/fittings;
- equipment;
- temporary works;
- material bundles/staging objects.

## Required behaviors

- dimensional inputs generate geometry;
- geometry preserves real units;
- openings cut/host correctly;
- systems attach/connect to canonical components;
- changes propagate to quantity/provenance;
- visual objects remain derived from canonical state.

## Demonstration

Without writing a second house by hand:

- change a room dimension;
- move an opening;
- change wall thickness/assembly;
- change roof pitch/type;
- regenerate affected geometry;
- preserve valid provenance.

## Exit rule

Academy House must no longer depend on one-off geometry assumptions that block another house.

---

# P2 — SPATIAL INTELLIGENCE + CONSTRUCTABILITY

## Objective

Make HERMES reason explicitly about space, motion, access, payloads, work zones, and future states.

## Spatial hierarchy

### A. 1 m planning cells
For:

- global addressing;
- occupancy;
- adjacency;
- work-zone coordination;
- coarse routing.

### B. Fine/adaptive occupancy
For:

- navigation;
- clearance;
- obstacles;
- equipment movement;
- payload envelope.

### C. Continuous precise geometry
For:

- real BIM/component dimensions;
- collision;
- installation;
- robot manipulation.

## Core capabilities

- occupancy map;
- traversability;
- actual pathfinding;
- swept-volume checks;
- actor + tool + payload envelope;
- access reservations;
- temporary path dependencies;
- work-zone conflicts;
- future-access simulation;
- resource/spatial dependency types;
- constructability look-ahead.

## Signature tests

- long LVL/board before wall closure;
- equipment egress before enclosure;
- MEP installation before ceiling closure;
- maintenance/commissioning access preservation;
- delivery route blocked by concurrent work.

## Exit rule

HERMES can derive at least several task dependencies from physical space rather than only manual schedule rules.

---

# P3 — PERSISTENT RUNTIME + LOCAL-FIRST MODEL ROUTING

## Objective

Turn the Academy prototype runtime into a restart-safe operating system without changing the construction-world contract.

## Runtime work

- separate immutable source from mutable runtime state;
- durable canonical database;
- durable event/task records;
- restart-safe leases;
- true cross-process locking;
- idempotent commands/events;
- queue/retry semantics;
- structured logging;
- backups;
- health/readiness;
- evidence-backed acceptance.

## Likely deployment shape

- HERMES API;
- HERMES worker(s);
- durable database;
- optional queue/cache;
- object storage for BIM/source/evidence;
- local inference service.

## Model router

Preferred task ladder:

1. deterministic;
2. small local 2–4B model;
3. larger local model if justified;
4. remote frontier model;
5. human/professional review.

## Benchmark rule

Do not choose the local model by popularity.

Benchmark against HERMES tasks:

- tool routing;
- structured JSON validity;
- constraint compliance;
- source grounding;
- spatial/task reasoning;
- latency;
- memory/VRAM;
- failure rate.

## GPU decision

Select GPU infrastructure based on measured local-inference/perception need, not browser rendering.

---

# P4 — ACADEMY PROCESS FIDELITY

## Objective

Teach HERMES the full construction operation, not only permanent building geometry.

## Curriculum progression

### Level 1 — controlled house
Near-perfect world, known materials, deterministic schedule.

### Level 2 — logistics
Deliveries, staging, access constraints, equipment contention.

### Level 3 — site/environment
Slope, groundwater, wetness, weather, soil, temporary access.

### Level 4 — coordination
Trade overlap, clashes, inspections, rework, procurement delays.

### Level 5 — uncertainty
Incomplete measurements, conflicting evidence, delayed materials, changing conditions.

### Level 6 — sensor/perception noise
Imperfect observations, confidence values, stale state, occlusion.

### Level 7 — dynamic mixed workforce
Humans, equipment, and simulated robots sharing space.

### Level 8 — hardware-in-loop
Site computers / robot simulators / selected physical devices.

## Construction lifecycle coverage

- intent/program;
- site due diligence;
- survey;
- geotech;
- jurisdiction;
- design;
- estimating;
- procurement;
- mobilization;
- temporary works;
- construction;
- inspections;
- commissioning;
- closeout;
- handoff;
- lessons learned.

---

# P5 — EMBODIED ROBOTICS INTERFACE

## Objective

Allow the same HERMES mission/world abstractions to be consumed by real autonomous equipment without making HERMES a motor controller.

## Actor embodiment contract

- identity;
- pose;
- orientation;
- body geometry;
- articulation summary;
- mobility;
- reach;
- payload;
- tool;
- sensor capability;
- energy;
- health/fault state;
- localization confidence;
- perception confidence.

## Control hierarchy

`HERMES Prime → Director/Site Coordinator → Mission → Local Planner → Real-Time Controller → Hardware`

HERMES owns mission intent and world/task coordination.

Robot-local deterministic controllers own:

- joint control;
- wheel/track control;
- force/torque control;
- emergency stop;
- immediate collision avoidance;
- hard real-time safety.

## Interface principle

Never make real hardware depend directly on free-form LLM output.

---

# P6 — SCALE GENERALIZATION

## Objective

Demonstrate that the same modeling/process architecture scales beyond one house.

Progressive targets:

1. second house with different layout/roof/site;
2. small multifamily;
3. larger residential/mixed-use;
4. hotel;
5. warehouse/commercial;
6. complex institutional/industrial classes where justified.

## Hotel test

A future request such as:

> “Build a 100-room resort/hotel with a specified architectural language.”

must decompose into real:

- program;
- rooms;
- circulation;
- egress;
- cores;
- service/back-of-house;
- structural grid/system;
- envelope;
- MEP distribution;
- site/logistics;
- schedule;
- procurement;
- inspections;
- handoff.

Architectural style changes geometry/assemblies; it does not replace construction truth.

---

# P7 — ENTERPRISE PRODUCTIZATION

Only after the construction engine is credible:

- project import/onboarding;
- enterprise auth/tenancy;
- roles/permissions;
- collaboration;
- integrations;
- deployment choices;
- customer support workflows;
- commercial packaging;
- presentation/sales modes.

Do not let SaaS features outrun construction capability.

---

# Cross-cutting acceptance rules

Every phase must preserve:

## Truth

No evidence = UNVERIFIED.

## Determinism

Use code for problems code can solve reliably.

## Provenance

Know why an object/decision exists.

## Spatial consistency

Visible world and reasoning world must describe the same physical reality.

## Reusability

Do not solve a general problem by hard-coding a single Academy fixture.

## Robotics compatibility

Do not introduce abstractions that prevent later physical embodiment.

## Cost discipline

Use high-cost models/agents only for work that actually requires them.

---

# Work allocation

## ChatGPT / planning layer

Use for:

- architecture;
- research;
- repository audits;
- backlog design;
- task decomposition;
- acceptance criteria;
- GitHub documentation;
- code review;
- targeted small edits.

## Codex

Use for:

- multi-file implementation;
- builds/tests;
- runtime debugging;
- browser automation;
- deployment;
- environment-specific work.

## Persistent HERMES runtime

Use for:

- Academy;
- local inference;
- canonical world;
- simulation;
- future sensor/perception workloads.

---

# Immediate next decision after P0

When physical visual acceptance returns:

1. classify defects;
2. repair only blockers to credible construction visualization;
3. confirm Three.js/BIM stack remains adequate;
4. start P1 construction-modeling primitives;
5. defer permanent GPU/VPS selection until runtime/model requirements are measurable.
