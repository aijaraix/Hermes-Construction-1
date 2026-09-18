# HERMES ACADEMY CONSTRUCTION PROCESS CURRICULUM

**Status:** Planning specification  
**Purpose:** Define what HERMES must learn and simulate from raw land through project handoff.

## 1. Academy principle

The Academy is not a collection of disconnected quizzes.

It is a progressively harder construction world in which agents must complete real process sequences with spatial, material, schedule, inspection, and business constraints.

The target is full construction-process understanding.

## 2. Curriculum dimensions

Every curriculum level may vary:

- building type;
- site condition;
- weather/environment;
- construction method;
- material availability;
- schedule pressure;
- workforce mix;
- equipment;
- code/jurisdiction;
- uncertainty;
- sensor quality;
- failures/conflicts.

Progress by increasing world difficulty, not merely asking harder text questions.

## 3. Level 0 — canonical process literacy

Before autonomous execution, agents must understand the full project lifecycle:

- customer/project intent;
- programming;
- site due diligence;
- survey;
- geotech;
- jurisdiction;
- utilities;
- environmental constraints;
- concept design;
- engineering;
- estimating;
- procurement;
- permitting;
- mobilization;
- construction;
- inspections;
- commissioning;
- closeout;
- handoff;
- warranty/lessons learned.

Output:

- process graph;
- responsible roles;
- dependencies;
- required evidence;
- major failure modes.

## 4. Level 1 — controlled small house

World:

- simple site;
- known dimensions;
- known soil;
- no severe weather;
- materials available;
- no unexpected failures.

Process:

1. owner brief;
2. program;
3. survey/site;
4. geotech assumption/evidence;
5. buildable envelope;
6. foundation selection;
7. temporary site layout;
8. takeoff/procurement;
9. mobilization;
10. excavation/foundation;
11. structure/framing;
12. roof/enclosure;
13. rough MEP;
14. inspections;
15. close-in;
16. finishes;
17. commissioning;
18. handoff.

Goal:

Prove agents understand normal sequence and canonical world mutation.

## 5. Level 2 — logistics and temporary works

Add:

- delivery windows;
- staging capacity;
- access roads;
- trailers;
- sanitation;
- temporary power/water;
- waste;
- crane/equipment zones;
- material bundles;
- haul routes.

Signature problems:

- delivery arrives before staging is ready;
- material blocks access;
- equipment and delivery compete for route;
- temporary office placement conflicts with building footprint;
- waste/staging zone causes logistics conflict.

## 6. Level 3 — spatial constructability

Add:

- narrow corridors;
- temporary openings;
- long materials;
- large equipment;
- closure events;
- maintenance access;
- concurrent work zones.

Signature problems:

- LVL before wall closure;
- drywall before doorway framing;
- equipment egress before enclosure;
- AHU/large equipment before roof/ceiling closure;
- valve/damper access before close-in.

Goal:

Derive task dependencies from physical reality.

## 7. Level 4 — site/environment

Vary:

- slope;
- soil;
- water table;
- wetness;
- flood zone;
- wind;
- heat;
- rain;
- temporary-road condition.

Required reasoning:

- temporary facility placement;
- foundation method;
- equipment trafficability;
- curing/weather controls;
- drainage/erosion;
- material protection.

## 8. Level 5 — trade coordination

Add:

- plumbing/electrical/HVAC clashes;
- structural penetrations;
- ceiling congestion;
- equipment clearances;
- fire/life-safety coordination;
- inspection gates.

Goal:

- detect conflict;
- assign ownership;
- generate repair/revision;
- revalidate;
- preserve provenance.

## 9. Level 6 — procurement and schedule disruption

Add:

- late supplier;
- damaged delivery;
- unavailable product;
- alternate material;
- price shock;
- critical path delay;
- equipment breakdown.

Agents must:

- identify downstream impact;
- evaluate substitutions;
- preserve code/spec compatibility;
- update schedule/cost;
- issue decisions with evidence.

## 10. Level 7 — incomplete/conflicting information

Add:

- missing survey data;
- contradictory drawings;
- stale field measurement;
- uncertain soil data;
- ambiguous owner requirement;
- conflicting sources.

Required behaviors:

- do not invent;
- classify uncertainty;
- request information;
- identify professional review;
- quarantine unverified assumptions;
- update when evidence arrives.

## 11. Level 8 — quality and rework

Inject:

- wrong placement;
- failed inspection;
- improper slope;
- missing fastener;
- damaged waterproofing;
- incorrect material;
- dimensional deviation.

Loop:

`OBSERVE → DETECT → TICKET → REPAIR PLAN → EXECUTE → REINSPECT → CLOSE`

Track:

- cost;
- schedule;
- cause;
- lesson learned.

## 12. Level 9 — dynamic mixed workforce

World contains:

- simulated humans;
- equipment;
- autonomous actors;
- inspectors;
- deliveries.

Add:

- shared corridors;
- changing zones;
- safety buffers;
- human unpredictability;
- priority conflicts.

Goal:

multi-actor coordination and safe sequencing.

## 13. Level 10 — perception uncertainty

Introduce simulated sensors:

- camera;
- LiDAR/depth;
- survey;
- robot odometry.

Problems:

- occlusion;
- noisy pose;
- stale map;
- conflicting observations;
- missed object;
- localization drift.

Agents must distinguish:

- planned;
- observed;
- verified.

## 14. Level 11 — hardware-in-loop / shadow

Use robot simulator or site-computer adapter.

HERMES sends structured mission.

Adapter returns:

- pose;
- progress;
- observation;
- blocked;
- completion/fault.

No physical construction authority yet.

## 15. Level 12 — supervised physical execution

Only after safety/engineering review.

Start with low-risk controlled tasks such as:

- inspection/navigation;
- material transport;
- surveying;
- scanning;
- simple staging.

Physical construction operations require task-specific engineering/safety gates.

## 16. Discipline curricula

Each discipline gets both knowledge and embodied/process training.

### Site/Civil
- survey;
- grading;
- drainage;
- access;
- utilities;
- temporary roads;
- erosion.

### Geotech
- borings;
- soil interpretation;
- groundwater;
- bearing/settlement;
- foundation recommendation.

### Structural
- foundations;
- framing;
- loads;
- connections;
- erection sequence.

### Envelope
- WRB;
- flashing;
- openings;
- roofing;
- waterproofing.

### Plumbing
- supply;
- DWV;
- slope;
- vent;
- equipment;
- testing.

### Electrical
- service;
- panels;
- circuits;
- pathways;
- devices;
- testing.

### HVAC
- equipment;
- duct;
- piping;
- diffusers;
- controls;
- balancing.

### Fire/Life Safety
- penetrations;
- firestop;
- alarms;
- egress;
- suppression where applicable.

### Logistics/Procurement
- takeoff;
- vendor;
- delivery;
- staging;
- substitutions;
- inventory.

### Quality/Inspection
- hold points;
- evidence;
- deficiency;
- reinspection;
- closeout.

### Project Controls
- CPM;
- float;
- progress;
- cost;
- change impact.

## 17. Management curricula

Managers must learn to:

- delegate;
- coordinate disciplines;
- identify missing evidence;
- reject unsupported work;
- resolve conflict;
- escalate professional-review items;
- manage risk/sequence.

Prime must not become a monolithic expert replacing specialist structure.

## 18. Business/process intelligence

Construction is also commercial/organizational.

Academy should include:

- scope;
- budget;
- bids/quotes;
- lead time;
- procurement;
- change order;
- schedule impact;
- inspection;
- owner decision;
- handoff documents.

Do not reduce HERMES to geometry alone.

## 19. Evidence model

Every Academy conclusion should know its evidence origin.

Examples:

- deterministic calculation;
- source document;
- simulated fixture;
- user input;
- observed sensor;
- professional approval.

Competency cannot promote from a source category that lacks required authority.

## 20. Certification dimensions

Do not use one global score.

Track competence by:

- knowledge;
- calculation;
- spatial;
- process;
- source grounding;
- uncertainty;
- coordination;
- constructability;
- safety;
- tool use.

An agent may be strong in one and blocked in another.

## 21. Training project ladder

Recommended projects:

1. Academy House 001 — controlled;
2. House 002 — changed site/layout/roof;
3. House 003 — adverse water/slope/logistics;
4. duplex/small multifamily;
5. townhouse/small multi-storey;
6. small commercial shell;
7. small hotel subset;
8. larger hotel/resort;
9. warehouse/logistics building;
10. complex projects later.

Each new project should prove generalization, not simply more hard-coded fixtures.

## 22. Failure injection library

Maintain reusable scenarios:

- spatial blockage;
- clash;
- late material;
- weather;
- failed inspection;
- equipment unavailable;
- wrong material;
- incomplete evidence;
- sensor uncertainty;
- safety conflict;
- schedule compression;
- owner change.

Track whether lesson learned improves future performance.

## 23. Academy replay

Every training attempt should be replayable:

- starting world;
- decisions;
- commands;
- events;
- world revisions;
- validation;
- failures;
- repairs;
- final result.

This creates auditable learning rather than opaque “agent got smarter” claims.

## 24. Academy exit rule

Do not claim real-world readiness from simulated competency alone.

Progression labels:

- KNOWLEDGE READY;
- SIMULATION READY;
- SHADOW READY;
- HARDWARE-IN-LOOP READY;
- SUPERVISED PHYSICAL READY;
- PHYSICAL CERTIFICATION/APPROVAL — external/task-specific.

## 25. Immediate curriculum priority

After Academy House visual acceptance:

1. preserve House 001 as first full-process reference;
2. convert hard-coded process into reusable curriculum stages;
3. build House 002 to test generalization;
4. add spatial/logistics failure injection;
5. only then increase robotics/perception difficulty.
