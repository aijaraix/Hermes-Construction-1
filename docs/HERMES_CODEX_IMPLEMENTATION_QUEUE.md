# HERMES CODEX IMPLEMENTATION QUEUE

**Purpose:** Convert the roadmap into bounded implementation assignments so Codex does not spend credits deciding what to build.

## Queue rules

- Work one ticket at a time unless explicitly authorized.
- Fetch current remote `main` first.
- Read the four control docs + this queue + the ticket-specific architecture doc.
- Do not reopen earlier product decisions.
- Do not start the next ticket automatically.
- Physical acceptance is required where specified.
- Preserve legitimate concurrent work.

---

# ACTIVE — HERMES-P0-01

## Title
Temporary faithful runtime + physical visual acceptance

## Objective
Expose current Academy House 001 long-lived Node/Express runtime on temporary Railway/Render host and physically inspect the 3D product.

## Scope
Deployment/acceptance only.

## Do not
- redesign persistence;
- provision permanent VPS;
- start local model work;
- build new modeling architecture;
- promote production.

## Acceptance
Physical screenshots/evidence for:

- empty site;
- mobilization;
- foundation;
- framing;
- MEP/X-ray;
- completed exterior;
- completed interior/walkthrough;
- cutaway;
- provenance;
- future-constructability.

## Output
Visual defect list classified:

- blocker;
- high;
- medium;
- cosmetic.

---

# NEXT — HERMES-P0-02

## Title
Visual blocker repair

## Start condition
Only after P0-01 physical evidence.

## Objective
Repair only defects preventing Academy House 001 from reading as credible CAD/BIM/construction visualization.

## Scope examples
- roof geometry;
- bad wall/opening placement;
- camera;
- MEP scale;
- clipping;
- replay mismatch;
- floating components.

## Acceptance
Repeat physical visual evidence and close blocker/high defects.

---

# HERMES-P1-01

## Title
Canonical parametric wall + hosted opening slice

## Read
- `HERMES_CONSTRUCTION_MODELING_ARCHITECTURE.md`
- current `BimCommandEngine`
- relevant renderer/component types.

## Objective
Create one reusable wall/opening/door-window modeling path.

## Required behavior

Wall generated from:

- start/end;
- height;
- thickness;
- assembly;
- storey.

Opening generated from:

- host wall;
- offset;
- sill;
- width/height.

Door/window attaches to opening.

Resize/move regenerates valid geometry.

## Avoid
Do not rewrite all Academy House geometry yet.

## Tests

- wall dimensions;
- wall orientation;
- opening inside host;
- opening invalid outside host;
- resize retains/flags opening;
- provenance/revision.

## Visual acceptance
One test room with correct wall/opening geometry in browser.

---

# HERMES-P1-02

## Title
Parametric roof slice

## Objective
Replace one-box roof assumption with reusable roof-face geometry.

## Minimum types
- gable;
- hip.

## Inputs
- support footprint;
- pitch;
- eave height;
- ridge direction;
- overhang.

## Derived
- roof faces;
- ridge;
- hips;
- eaves;
- height;
- quantities.

## Tests
- known geometry cases;
- pitch change;
- overhang;
- ridge height;
- non-floating support.

## Visual acceptance
Switch same small building between gable and hip without manually editing vertex literals.

---

# HERMES-P1-03

## Title
Polygon slab/floor slice

## Objective
Support polygonal footprint extrusion.

## Tests
- rectangle;
- L-shape;
- opening;
- quantity/area;
- world transform.

---

# HERMES-P1-04

## Title
MEP routed geometry + connectivity

## Objective
Replace coarse box-like MEP route representation with path-based geometry.

## Plumbing
- centerline;
- diameter;
- slope;
- fittings;
- topology.

## Electrical
- conduit/path;
- devices;
- logical circuit linkage.

## HVAC
- rectangular/round duct;
- fittings;
- terminal/equipment connectivity.

## Acceptance
X-ray view shows believable scale and deterministic connected routes.

---

# HERMES-P1-05

## Title
Second-house modeling benchmark

## Objective
Create House 002 from reusable primitives.

## Must differ
- footprint;
- layout;
- openings;
- roof;
- project parameters.

## Rule
Do not duplicate House 001 literal geometry and rename it.

## Exit
Prove modeling generalization.

---

# HERMES-P2-01

## Title
Canonical 1 m planning-cell occupancy

## Read
`HERMES_SPATIAL_INTELLIGENCE_ARCHITECTURE.md`

## Objective
Generate planning cells from canonical world geometry.

## Required
- occupied;
- free;
- reserved;
- unsafe/blocked;
- entity references.

## Tests
Known small room/site fixtures.

---

# HERMES-P2-02

## Title
Portal graph

## Objective
Create doors/openings/gates as traversability transitions.

## Required fields
- clear width;
- clear height;
- source/destination;
- availability/closure event;
- constraints.

---

# HERMES-P2-03

## Title
Real obstacle-aware pathfinding

## Objective
Replace current midpoint waypoint placeholder.

## Required
- deterministic A* or equivalent on planning/fine grid;
- blocked cells;
- no-path result;
- route evidence.

## Important
Remove/rename any claim that placeholder code is “3D A*” once replaced.

## Tests
- direct;
- obstacle detour;
- impossible route.

---

# HERMES-P2-04

## Title
Payload-aware route validation

## Objective
Actor route changes when tool/payload changes envelope.

## Signature proof
Empty actor passes; same actor + long payload fails/replans.

---

# HERMES-P2-05

## Title
Temporal future-access dependency

## Objective
Generalize the current long-material proof into world-revision look-ahead.

## Required
Candidate future geometry invalidates downstream route → create typed dependency.

---

# HERMES-P2-06

## Title
Work-zone reservations and multi-actor conflicts

## Objective
Prevent overlapping unsafe/incompatible activities.

## Tests
- same zone conflict;
- route conflict;
- compatible shared zone;
- release reservation.

---

# HERMES-P3-01

## Title
Separate mutable runtime state from source tree

## Objective
Stop normal runtime startup from dirtying tracked source/reference files.

## Important
Audit each currently mutated file before changing ignore/versioning behavior.

## Exit
Start/run/reset no longer produces unexplained tracked mutations.

---

# HERMES-P3-02

## Title
Durable canonical persistence

## Objective
Introduce production-grade canonical persistence while preserving world/event contracts.

## Scope decision
Choose database only after current data model audit.

Do not mix model routing into this ticket.

---

# HERMES-P3-03

## Title
Durable task leases / true cross-process locking

## Objective
Replace process-local “distributed” claims with actual cross-process semantics.

## Acceptance
Two worker processes cannot execute same leased task.

---

# HERMES-P3-04

## Title
Reasoning provider router refactor

## Read
`HERMES_LOCAL_MODEL_GPU_ARCHITECTURE.md`

## Objective
Remove direct hard-wired Gemini construction in `AgentExecutionService`.

## Rule
Behavior can remain Gemini-backed initially; this ticket is provider injection/routing architecture only.

## Tests
- injected provider;
- deterministic fake provider;
- Gemini adapter compatibility.

---

# HERMES-P3-05

## Title
Local inference provider

## Objective
Add OpenAI-compatible local provider.

## Acceptance
One low-risk Academy specialist scenario executes locally and passes existing deterministic validation.

---

# HERMES-P3-06

## Title
HERMES local-model benchmark harness

## Objective
Run same task corpus across candidate local models.

## Metrics
- schema validity;
- tool accuracy;
- validator pass;
- citation grounding;
- latency;
- memory;
- escalation behavior.

## Rule
Do not choose permanent GPU before results.

---

# HERMES-P4-01

## Title
Reusable construction-process curriculum state machine

## Read
`HERMES_ACADEMY_CONSTRUCTION_PROCESS_CURRICULUM.md`

## Objective
Separate reusable curriculum stages from House 001 fixture specifics.

## Acceptance
House 002 uses same process curriculum with different geometry/parameters.

---

# HERMES-P4-02

## Title
Logistics failure injection library

## Scenarios
- late delivery;
- blocked staging;
- route conflict;
- unavailable equipment.

---

# HERMES-P4-03

## Title
Trade coordination/rework curriculum

## Scenarios
- MEP clash;
- failed inspection;
- wrong placement;
- rework/reinspection.

---

# HERMES-P4-04

## Title
Uncertainty/evidence curriculum

## Scenarios
- missing survey;
- contradictory source;
- stale measurement;
- professional-review requirement.

---

# HERMES-P5-01

## Title
Hardware-neutral mission + telemetry contract

## Read
`HERMES_EMBODIED_ACTOR_ROBOTICS_ARCHITECTURE.md`

## Objective
Implement structured simulated mission/telemetry API without physical hardware.

---

# HERMES-P5-02

## Title
Simulated robot adapter

## Objective
Actor accepts mission, moves, carries payload, reports telemetry, blocks/replans, completes.

## No physical actuators.

---

# HERMES-P5-03

## Title
Robot simulator / hardware-in-loop bridge

## Start condition
Only after mission contract is stable.

---

# LATER — P6 scale

Do not schedule until House 002/general primitives pass.

Future bounded benchmarks:

- small multifamily;
- hotel subset;
- 100-room hotel planning/build simulation.

---

# Work that should NOT go to Codex first

Use planning/review layer before opening Codex for:

- architectural choices;
- product direction;
- technology comparison;
- GPU selection;
- model shortlist;
- construction-process research;
- acceptance criteria;
- backlog prioritization;
- visual screenshot review;
- source/diff review.

Codex should receive the resulting bounded ticket.
