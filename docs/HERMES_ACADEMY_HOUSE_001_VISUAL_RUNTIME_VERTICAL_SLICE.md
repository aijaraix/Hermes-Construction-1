# HERMES ACADEMY HOUSE 001 — VISUAL + RUNTIME VERTICAL SLICE

**Status:** CANONICAL EXECUTION HANDOFF  
**Repository:** `aijaraix/Hermes-Construction-1`  
**Canonical branch:** `main`  
**Purpose:** Turn the existing HERMES Construction architecture into one physically credible, visually convincing, end-to-end construction academy proof without restarting or redesigning the system.

---

# 0. FIRST ACTION — FETCH CURRENT REMOTE MAIN

Before editing anything:

1. Fetch current remote `main`.
2. Record the fetched SHA in the execution report.
3. Do **not** assume the SHA recorded when this document was authored remains current.
4. Preserve all legitimate newer work.
5. Do not overwrite concurrent work.
6. Work from the current physical repository state, not from a reconstructed or simplified copy.

Reference HEAD when this handoff was authored:

`7297e1ac5c96d2a09f470d2ecc302c585d1273e7`

This SHA is a reference only, not an instruction to reset.

---

# 1. DO NOT REDISCOVER OR REDESIGN HERMES

HERMES already contains substantial architecture and implementation for:

- canonical project/world state
- event-driven construction progression
- BIM / IFC ingestion and 3D rendering
- deterministic geometry
- agent roles and organizations
- task graphs
- Academy / competency workflows
- source provenance
- spatial actors
- work zones
- access paths
- material envelopes
- construction knowledge
- validation engines
- project persistence
- reasoning-provider abstraction

Preserve and deepen those systems.

Do **not**:

- create `Hermes-Construction-2`
- replace the current project with a new prototype
- create a disconnected game demo
- create a separate fake robotics demo
- rebuild the agent registry from scratch
- throw away historical validation fixtures
- replace canonical state with frontend-only animation state
- create visuals that are not backed by canonical world data unless explicitly labeled synthetic demo/training-only
- add new numbered phases merely to claim progress

The objective is to make the existing system visibly and physically credible.

---

# 2. PRIMARY PRODUCT DEFINITION

HERMES is a **living construction academy and embodied construction operating system**.

The Academy should feel visually like a high-quality simulation/game environment, but it is **not a game**.

Every meaningful visual construction state must correspond to canonical construction truth.

The long-term target is that the same world/task abstractions used by Academy agents can later be consumed by real site computers, sensors, cameras, autonomous equipment, and robots.

The digital world is therefore not disposable presentation. It is the future execution language.

Canonical principle:

> **COMMAND → EVENT → STATE → WORLD → OBSERVATION → VALIDATION → NEXT ACTION**

The 3D world is a deterministic view of canonical project/world state.

---

# 3. FIRST VERTICAL SLICE: ACADEMY HOUSE 001

The immediate milestone is **one complete small house project**.

The system must start from an empty parcel and progress through the recognizable real-world process of creating a finished house.

This is not a requirement to simulate every possible construction method or solve every robotics problem now.

It is a requirement to prove the architecture with one coherent, truthful, visually strong vertical slice.

The final result must be understandable to:

- a homeowner
- a builder
- an architect / engineer
- an investor
- a robotics engineer
- a nontechnical observer

A nontechnical observer should immediately recognize a real house project rather than a collection of abstract cubes.

---

# 4. ACCEPTANCE EXPERIENCE — WHAT THE OWNER MUST BE ABLE TO DO

The Academy House 001 proof is not complete until the owner can perform this experience:

1. Open HERMES and see **empty land**.
2. Issue an intent equivalent to: **“Build me a house.”**
3. Observe HERMES begin the project process rather than instantly spawning a finished structure.
4. See survey / site / geotechnical / planning / architecture / structural / logistics work become visible.
5. See the buildable area and project layout emerge from site truth.
6. See temporary site establishment occur where applicable.
7. See deliveries, staging, equipment, and construction progression.
8. Watch the building advance through foundation, structure, enclosure, MEP, finishes, and completion.
9. Pause / resume the project visualization.
10. Change playback speed.
11. Scrub backward and forward through project time.
12. Enter a human-scale walkthrough of the finished house.
13. Toggle walls / surfaces transparent.
14. Isolate Structure / Electrical / Plumbing / HVAC and other supported systems.
15. Inspect actual component geometry in place.
16. Click a component and see which task / agent / event / revision created or modified it.
17. Inspect active actors, work zones, movement paths, payloads, and current tasks.
18. See at least one spatial sequencing problem where a future construction state would make a required task impossible, and see HERMES correct the task order.

If these things cannot be demonstrated from the actual application, the pass is not complete.

---

# 5. VISUAL STANDARD

The visual bar is professional architectural/BIM visualization, not a debug visualization.

Use the existing browser rendering stack as the foundation. The VPS is **not** the renderer; the browser/GPU is.

The owner should be able to see a house at a standard comparable in clarity to commonly used residential 3D/BIM walkthrough tools.

Required modes:

## 5.1 Finished Architectural View

Show a credible finished residence with, where modeled:

- exterior envelope
- roof
- doors and windows
- interior walls
- flooring
- cabinetry
- fixtures
- major finishes
- site / grade context
- realistic scale
- lighting / shadows appropriate to browser performance

Furniture may be used as a presentation aid, but must not be confused with canonical structural/MEP truth unless explicitly represented as project objects.

## 5.2 Construction / BIM View

Allow the user to inspect:

- footings / foundation
- slab
- framing
- roof structure
- wall assemblies
- plumbing
- electrical
- HVAC
- supported equipment and components

## 5.3 X-Ray View

Finished surfaces may become transparent or hidden so internal systems are visible in their actual locations.

## 5.4 Discipline Isolation

At minimum support filters for the systems already represented by current HERMES data, such as:

- Architecture
- Structure
- Plumbing
- HVAC
- Electrical
- Envelope

Extend only when backed by actual world data.

## 5.5 Section / Cutaway View

Provide a practical clipping / section mechanism to inspect interior construction.

## 5.6 Walkthrough View

Provide human-height navigation through the finished house.

## 5.7 Construction Time View

Show world state changing over project time rather than simply toggling a complete model visible/invisible.

## 5.8 Agent / Logistics View

Show, where present:

- active actors
- equipment
- deliveries
- staging
- access paths
- work zones
- reserved / blocked areas
- payloads
- current mission / operation

---

# 6. EMPTY LAND MUST REALLY BE THE STARTING WORLD

Academy House 001 begins from a raw site state.

Do not begin with the house already present.

The project progression should represent the real decision and mobilization process at an appropriate level of fidelity.

The initial world may include:

- parcel / site boundary
- terrain / grade
- adjacent access / road context where modeled
- known utility context
- environmental / jurisdictional data

But no completed house should exist at genesis.

---

# 7. SITE / PRECONSTRUCTION PROCESS TO REPRESENT

The vertical slice should visibly and canonically represent the applicable portions of:

1. project/customer intent
2. location / parcel context
3. survey / site control
4. topography / slope
5. jurisdiction / setbacks / buildable envelope
6. soil / geotechnical assumptions or evidence
7. groundwater / wetness considerations where relevant
8. utility context
9. environmental / weather / flood / wind inputs where already modeled
10. foundation / structural method selection
11. temporary site logistics strategy
12. construction sequencing
13. site establishment / mobilization

HERMES should reason about the site before pretending construction can begin.

---

# 8. TEMPORARY SITE ESTABLISHMENT IS PART OF THE BUILD

Where reasonable for the selected Academy project, model the construction site as an operating environment rather than only the permanent building.

Potential world entities include:

- site entrance / gate
- management / operations container or trailer
- engineering / discipline facility
- laydown / material staging area
- temporary sanitation
- temporary power
- temporary water where needed
- erosion / site-control measures where applicable
- waste / debris area
- equipment staging
- delivery route
- temporary access route

The chosen temporary facilities should be influenced by site facts when possible.

Example considerations:

- slope
- ground condition / wetness
- flood exposure
- access
- expected project duration
- footprint available
- temporary utility availability
- safety / clearance

Do not hard-code one temporary facility strategy as universally correct.

---

# 9. HOUSE CONSTRUCTION PROGRESSION

The visual/runtime slice should cover a recognizable sequence such as:

1. site establishment
2. clearing / grading / pad work as applicable
3. excavation
4. foundation / footing preparation
5. reinforcement / embeds as applicable
6. concrete / foundation completion
7. framing / primary structure
8. roof structure
9. enclosure / weather protection
10. doors / windows
11. plumbing rough-in
12. electrical rough-in
13. HVAC rough-in
14. inspections / validation gates
15. insulation / close-in
16. wall / ceiling closure
17. exterior / roofing completion
18. fixtures / trim / finishes
19. commissioning / final validation
20. completed house

Do not fake completeness by jumping directly from foundation to finished structure.

The sequence does not need photorealistic animation for every human hand motion, but the canonical physical state transitions must be meaningful and visible.

---

# 10. THE 1-METER WORLD CELL MODEL

Preserve the owner’s spatial concept:

> The world is cognitively addressable as a grid of 1m × 1m × 1m cells.

However, **1 meter is a planning / reasoning cell, not the lowest physical precision of HERMES**.

Use a hierarchical spatial representation:

## Level A — Macro Planning Cells

- nominal cell size: 1 meter cube
- global spatial addressing
- occupancy / adjacency
- high-level routing
- work-zone reasoning
- agent coordination

## Level B — Fine Occupancy / Navigation

Use finer/adaptive resolution as required for:

- navigation
- clearance
- obstacle avoidance
- payload envelope
- equipment movement

Do not force all collision reasoning to 1m resolution.

## Level C — Continuous Precise Geometry

Canonical geometry retains real dimensions and precise positions.

Examples:

- actual wall thickness
- actual pipe diameter
- actual conduit diameter
- actual duct size
- actual framing dimensions
- actual opening dimensions
- actual equipment envelopes

The cell is the reasoning lattice; it is **not** a replacement for precise BIM geometry.

---

# 11. EMBODIED ACTOR CONTRACT

HERMES already contains spatial actor concepts. Evolve them toward a canonical embodiment contract.

A physical or simulated embodied actor should be able to represent, as applicable:

## Identity

- actor ID
- assigned agent / role
- discipline
- current mission / task

## Pose / Localization

- world position
- orientation
- velocity where relevant
- localization confidence

## Body Geometry

- bounding / collision envelope
- articulated geometry or simplified envelope where needed
- turning / maneuvering constraints

## Capabilities

- mobility type
- terrain capability
- reach
- payload limits
- tool compatibility

## Tools

- current tool
- tool operating state
- tool collision / working envelope where relevant

## Payload

- carried material / object
- real dimensions
- orientation
- mass when known
- grasp / attachment relationship
- combined swept/collision volume

## Sensors / Telemetry

Future-compatible fields for:

- camera
- depth
- LiDAR
- IMU
- odometry
- joint state
- battery / energy
- health / fault state

Do not require real hardware integration in this pass. The data contract must simply avoid blocking that future.

---

# 12. PAYLOAD GEOMETRY CHANGES THE ACTOR

A critical requirement for future robotics is that an actor carrying an object is not treated as the same geometry as an empty actor.

The runtime must evolve toward reasoning about:

`ACTOR BODY + TOOL + PAYLOAD + SAFETY CLEARANCE`

as one moving swept volume.

Example:

A robot carrying a 12-foot board may be able to travel through a corridor while empty but not while carrying the board.

The spatial system must be capable of representing this difference.

Do not reduce `carriedMaterial` to descriptive metadata only.

---

# 13. FUTURE-WORLD CONSTRUCTABILITY LOOK-AHEAD

This is a required architectural direction and must receive at least one real vertical-slice proof.

HERMES must reason not only:

> Can this task be executed now?

but also:

> If this task is executed now, does it make a required future task physically impossible or materially harder?

Minimum proof case:

## Long Material / Future Closure Test

Construct a scenario where:

- a long material or assembly must be placed inside an area
- a future wall / opening closure makes that future transport path infeasible
- HERMES detects the issue before closure
- HERMES creates or enforces the required predecessor task
- the material is staged / placed before the closure operation

The proof should be visible in 3D and recorded in task/event state.

This is **not** an LLM-only judgment. Use deterministic geometry / swept-volume / path validation wherever possible.

---

# 14. DEPENDENCY TYPES

Do not treat all scheduling dependencies as generic manual `dependsOn` relationships.

Evolve the task graph to preserve the reason for dependencies.

Examples:

- LOGICAL
- PHYSICAL_ACCESS
- MATERIAL
- TOOL
- EQUIPMENT
- SAFETY
- INSPECTION
- TEMPORARY_ACCESS
- RESOURCE
- ENVIRONMENTAL
- SPATIAL_CONFLICT
- FUTURE_CONSTRUCTABILITY

A dependency may still map onto the existing task graph implementation, but the causal reason must not be lost.

---

# 15. CANONICAL WORLD VS VISUAL WORLD

This is a hard rule.

The browser renderer may interpolate and animate presentation, but it must not own independent construction truth.

Examples:

If a wall appears, canonical state must contain the wall.

If a pipe appears, canonical state must contain the pipe / route or equivalent component record.

If a delivery appears, a canonical event / entity must represent that delivery or the animation must be explicitly marked synthetic visualization.

If an actor carries a board, canonical actor/payload state must reflect the board.

If a component changes status, that status must come from canonical event/state.

No visual-only fake construction progression may be used to claim the Academy has executed a construction process.

---

# 16. DESIGN WORLD / EXECUTED WORLD / OBSERVED WORLD

Prepare the architecture for three related but distinct truths:

## Design World

What should exist according to engineering / BIM intent.

## Executed World

What HERMES has recorded as constructed through canonical events.

## Observed World

What cameras / sensors / robots / inspection evidence observe in the real world.

For Academy House 001, Design + Executed World are the primary requirement.

Do not block future Observed World integration.

The eventual canonical site truth should support reconciliation of these layers rather than assuming `BIM == physical truth` forever.

---

# 17. REAL-WORLD ROBOTICS BOUNDARY

HERMES Prime should eventually assign missions; it should not directly command motors.

Preserve this hierarchy:

`HERMES PRIME / DIRECTOR`  
→ project / site mission  
→ embodied actor / robot mission agent  
→ local motion planner  
→ real-time controller  
→ motors / hydraulics / tools

Telemetry flows upward.

Do not implement unsafe real-world actuation in this pass.

The objective is to ensure Academy abstractions are compatible with future robot adapters.

---

# 18. MODEL / REASONING ARCHITECTURE

HERMES must become model-provider-independent.

The current reasoning-provider abstraction should be preserved and expanded rather than tying system correctness to Gemini availability.

Target routing classes:

1. **DETERMINISTIC** — no language model
2. **LOCAL_FAST** — small quantized local model
3. **LOCAL_DEEP** — optional larger local model
4. **REMOTE_FRONTIER** — optional external model escalation
5. **HUMAN_REVIEW** — when required

The default long-term Academy runtime should not require a remote frontier model for routine operations.

Do not select a final local model by opinion alone.

Create a HERMES-specific benchmark harness using real tasks and independent validators.

Candidate default target class:

- approximately 2B–4B quantized local model

Optional escalation class:

- approximately 7B–14B local model only if benchmarks justify it

Frontier APIs are consultants / escalation providers, not the canonical operating system.

---

# 19. WHEN NOT TO CALL AN LLM

Prefer deterministic computation for:

- geometry
- collision
- component dimensions
- quantity calculations
- path feasibility
- schedule dependency math
- known code thresholds already encoded
- BOM rollups
- state transitions
- inventory counts
- exact engineering formulas supported by deterministic engines

Use a reasoning model for constrained tasks such as:

- tool selection
- workflow routing
- interpretation of retrieved evidence
- choosing among validated alternatives
- structured proposal generation
- ambiguity identification
- natural-language explanation

The model does not need to “be” HERMES.

HERMES intelligence is distributed across:

- canonical world state
- structured knowledge
- spatial graph
- business/project graph
- task graph
- tools
- deterministic validators
- agent contracts
- memory
- evidence
- reasoning providers

---

# 20. VPS ROLE

Do **not** treat the VPS as the visual rendering engine.

Browser/client responsibility:

- Three.js / IFC visualization
- camera / walkthrough
- overlays
- x-ray / clipping
- user interaction
- local interpolation / display animation

VPS responsibility when productionized:

- canonical HERMES runtime
- Prime / workers
- durable state
- task / event processing
- local inference endpoint
- knowledge / project services
- telemetry ingestion
- persistence
- WebSocket / API updates

Do not provision an unnecessarily complex production stack before the visual/runtime vertical slice proves the product.

The vertical slice may initially run in the current development environment if that is the fastest path to proof.

Then harden the proven runtime for VPS deployment.

---

# 21. TARGET VPS ARCHITECTURE AFTER VERTICAL-SLICE PROOF

Preferred target, subject to implementation audit:

- `hermes-api`
- `hermes-worker`
- PostgreSQL canonical database
- durable job / lease / lock mechanism
- local inference service
- reverse proxy / TLS
- persistent storage for evidence / BIM assets as appropriate
- structured logging
- health checks
- restart policy
- backup / restore

Redis may be introduced if justified by the real workload, but do not add infrastructure merely because it is conventional.

PostgreSQL advisory locking / durable job tables may be sufficient for early production.

---

# 22. RUNTIME HARDENING REQUIRED DURING THIS PASS

Do not spend the entire pass on infrastructure, but fix blockers that make the visual proof untruthful or unreliable.

Audit and address, where present on current main:

- compile / type errors
- duplicate runtime ownership
- duplicate heartbeat route handling
- competing schedulers / timers
- in-process state incorrectly described as distributed
- non-durable queues described as durable
- hard-coded acceptance gates
- synthetic metrics presented as physical runtime proof
- provider failures incorrectly counted as successful reasoning
- state persistence that cannot survive the intended deployment model

Do not silently delete historical test fixtures.

Isolate regression / simulation modes from live acceptance instead.

---

# 23. TRUTH / ACCEPTANCE POLICY — ZERO HYPE

A gate is not `PASSED` because code returned the word `PASSED`.

A physical/runtime claim requires evidence.

Every major acceptance gate should record, where applicable:

- gate ID
- status
- proof type
- commit SHA
- project ID
- attempt ID
- started time
- completed time
- host / runtime identity
- event IDs
- state hash before
- state hash after
- evidence artifact / endpoint / screenshot reference
- failure reason

Allowed states should include at least:

- `UNVERIFIED`
- `RUNNING`
- `PASSED`
- `FAILED`
- `BLOCKED`

No evidence = `UNVERIFIED`, not `PASSED`.

Simulation proof must be labeled simulation proof.

Do not use `Math.max`, fixed counts, or fallback literals to manufacture minimum production metrics.

---

# 24. VISUAL PROOF MUST BE TIED TO DATA PROVENANCE

Clicking a significant component should expose useful provenance such as:

- component/entity ID
- system / discipline
- dimensions
- precise world location
- project phase
- responsible agent / role
- source task
- creation event
- current revision
- inspection / validation status
- relevant material/spec references where available

The user should be able to see that the visual object came from HERMES state rather than from a decorative scene.

---

# 25. SPEED / TIME CONTROLS

Support presentation controls that do not mutate engineering truth incorrectly.

Suggested modes:

- manual step
- pause
- real-time presentation
- accelerated playback
- event-by-event replay
- timeline scrub

Changing playback speed must not change deterministic task order or engineering calculations.

---

# 26. PERFORMANCE / RENDERING GUIDELINES

The visual proof must remain practical in a normal modern desktop browser.

Prefer techniques such as:

- geometry instancing where appropriate
- LOD
- efficient materials
- batching
- scene culling
- lazy asset loading
- selective high-detail systems
- GLTF for reusable equipment / vehicle / presentation assets when appropriate
- IFC / canonical procedural geometry for truth-bearing building elements

Do not sacrifice dimensional truth merely to improve appearance.

Decorative assets must not become canonical engineering data accidentally.

---

# 27. IMPLEMENTATION ORDER

Follow this order unless current repo evidence proves a small adjustment is necessary.

## STEP 0 — PHYSICAL REPOSITORY AUDIT

- fetch current main
- install dependencies cleanly
- run typecheck / lint
- run tests
- run production build
- identify current blockers
- record actual current capabilities

Do not make unsupported “all systems operational” claims.

## STEP 1 — CANONICAL WORLD CONTRACT

Confirm one active Academy House world/state/event path.

Do not allow frontend-only construction truth.

## STEP 2 — VISUAL BASELINE

Make empty site and current world render clearly.

Implement / repair professional camera, lighting, navigation, and visual layers.

## STEP 3 — TIME / EVENT PLAYBACK

Render canonical state progression through project events/checkpoints.

## STEP 4 — SITE MOBILIZATION

Represent survey/site establishment/logistics entities and relevant deliveries.

## STEP 5 — HOUSE BUILD SEQUENCE

Render the permanent building evolving from foundation through completion.

## STEP 6 — BIM / X-RAY / DISCIPLINE VIEWS

Add transparent / isolate / section views tied to canonical components.

## STEP 7 — PROVENANCE INTERACTION

Click an object → show component/agent/task/event truth.

## STEP 8 — EMBODIED ACTOR / PAYLOAD PROOF

Show actor envelope + carried material affecting spatial feasibility.

## STEP 9 — FUTURE CONSTRUCTABILITY PROOF

Implement and demonstrate the long-material-before-closure case.

## STEP 10 — RUNTIME HARDENING FOR HANDOFF

Fix minimum persistence / scheduler / provider issues required for a truthful stable demo.

## STEP 11 — VPS DEPLOYMENT PLAN

Produce the exact production deployment plan based on the now-proven runtime.

Do not fabricate a VPS deployment if credentials / host access are not actually available.

---

# 28. ACCEPTANCE TEST MATRIX

Academy House 001 is not complete until all applicable tests below are physically exercised.

## A. Repository

- clean checkout installs
- typecheck passes
- tests pass or failures are documented and scoped
- production build passes

## B. Genesis

- house project starts from empty parcel state
- no finished house exists at genesis

## C. Preconstruction

- site/survey/buildable-context state is visible
- at least one site-driven decision is represented canonically

## D. Mobilization

- temporary/logistics entities appear through canonical progression
- staging/access is represented

## E. Construction

- foundation visibly emerges
- structure visibly emerges
- enclosure visibly emerges
- MEP visibly emerges
- finishes/completion visibly emerge

## F. 3D Quality

- user can orbit / navigate
- user can walk through finished house
- visual scale is credible
- no debug-box-only final presentation

## G. BIM Visibility

- x-ray/transparency works
- discipline isolation works
- section/cutaway works or equivalent inspection method is provided

## H. Geometry Truth

- at least representative electrical/plumbing/HVAC/structural components use actual modeled dimensions and canonical placement

## I. Provenance

- click component → display agent/task/event/revision information

## J. Timeline

- pause/resume
- step/replay
- timeline or equivalent world-history navigation

## K. Embodied Actor

- actor has canonical spatial envelope
- actor has mission/task
- payload is represented when carrying material

## L. Constructability Look-Ahead

- future closure makes long-material path infeasible
- system detects issue
- system enforces/recommends predecessor movement
- visible world/event proof exists

## M. Truthful Runtime

- no hard-coded acceptance pass for tested gates
- no fake production counts used as proof
- simulation is labeled simulation

---

# 29. OWNER-FACING DEMO SCRIPT

The finished vertical slice should support a short demonstration approximately like this:

1. **“This is an empty property.”**
2. **“Build me a house.”**
3. HERMES begins site / survey / planning activity.
4. Temporary operations and site logistics become visible.
5. Construction progresses visibly.
6. Pause during framing and inspect structure.
7. Resume through MEP.
8. Toggle electrical-only view.
9. Toggle plumbing-only view.
10. Toggle x-ray and show systems in actual wall/floor locations.
11. Click a component and show the agent/task/event that produced it.
12. Demonstrate the long-material / future-wall closure constructability case.
13. Complete the project.
14. Enter walkthrough mode and move through the finished house.
15. Rewind the timeline to an earlier construction state.

This is the minimum “people can actually see what the agents learned and did” demonstration.

---

# 30. DEFINITION OF DONE

This pass is complete only when:

- the current HERMES repository remains the source of truth
- the application builds and runs from current main/feature work
- Academy House 001 starts from empty land
- real canonical construction progression is visible
- finished architectural presentation is credible
- BIM systems can be exposed / isolated
- components retain true geometric scale
- events/tasks/agents are traceable from the world
- embodied actor / payload spatial logic is represented
- one future-constructability sequencing case is proven
- acceptance claims are evidence-backed
- a clear VPS productionization path is documented from the proven system

The objective is **not** maximum feature count.

The objective is:

> **Make HERMES visibly demonstrate that its agents understand and execute a construction process inside a physically grounded, spatially coherent world that can later become the control abstraction for real construction automation.**

---

# 31. FINAL HANDOFF REQUIREMENTS

When Codex finishes this pass, report:

1. starting remote SHA
2. ending SHA(s)
3. files changed
4. build/test/typecheck results
5. actual live/preview command or URL if physically available
6. Academy House project/attempt ID
7. visual acceptance evidence
8. runtime acceptance evidence
9. known limitations
10. what remains synthetic vs deterministic vs physically verified
11. exact VPS requirements based on measured runtime needs
12. recommended local-model benchmark candidates and measured results if benchmark work was included
13. the next smallest executable step

Do not report “complete” if the visual acceptance experience cannot be physically demonstrated.
