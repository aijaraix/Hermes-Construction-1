# HERMES CURRENT STATE

**Document role:** Compact operational truth for new workers.  
**Do not use this file as a substitute for fetching current remote state.**

## 1. Canonical source checkpoint

Reference implementation checkpoint when this document was drafted:

`5e6b174a9b30669595f1496e7160799240132d3c`

Commit message:

`feat: deliver Academy House 001 vertical slice`

Every worker must fetch current `main` first. Never reset to this SHA merely because it is written here.

## 2. What HERMES is today

HERMES is no longer only a static construction dashboard. The repository contains working architecture for:

- canonical project/world state;
- event-driven construction progression;
- browser-based Three.js/BIM visualization;
- IFC/WebIFC integration;
- deterministic geometry and engineering helpers;
- agent roles, managers, and organizational hierarchy;
- task graphs and construction sequencing;
- Academy/competency workflows;
- source provenance and construction knowledge;
- spatial actors, work zones, access paths, equipment, and material staging;
- inspection/validation concepts;
- local SQLite/JSON persistence;
- reasoning-provider abstraction;
- Academy House 001 as the current end-to-end vertical slice.

## 3. Academy House 001 checkpoint

At `5e6b174...`, the implementation added or deepened:

- empty canonical genesis site;
- site mobilization and temporary facilities;
- logistics, equipment, and material staging;
- foundation;
- framing;
- enclosure;
- MEP;
- inspections;
- close-in;
- finishes;
- completed residence;
- embodied actor fields for envelopes, tools, payloads, clearances, and telemetry;
- deterministic long-material/future-access test;
- `FUTURE_CONSTRUCTABILITY` dependency semantics;
- architectural/construction/X-ray/system-isolation/walkthrough/section controls;
- component provenance;
- truthful dynamic task/workforce/checkpoint reporting;
- targeted Academy House tests.

The implementation was reported to pass:

- TypeScript typecheck;
- production build;
- Academy House targeted tests;
- canonical progression to completion in the local runtime.

Physical browser acceptance remained the next required proof.

## 4. Current active acceptance objective

The immediate operational goal is to expose the unmodified long-lived Node/Express runtime on a temporary faithful host and physically inspect the actual 3D Academy House experience.

A serverless Vercel preview was rejected because HERMES currently depends on:

- a persistent Express process;
- stateful world/step/run/reset behavior;
- mutable in-memory and filesystem-backed state;
- local SQLite/persistence;
- continuously available runtime for replay/progression.

A temporary long-lived container host such as Railway or Render is therefore appropriate for acceptance.

This preview is **not production** and is **not the permanent GPU/VPS decision**.

## 5. Runtime-generated tracked mutations

Starting the existing runtime has been observed to mutate tracked persistence/reference files in a working checkout, including:

- `data/db/hermes_sqlite.db`
- `data/db/hermes_store.json`
- `data/db/reality_audit_store.json`
- `data/models/REFERENCE-BIM-0001.ifc`
- `data/models/TECHNICAL-IFC-PROOF-0001.ifc`
- `data/source-documents/DOC-DOE-PNNL-BASC.html`
- `data/source-documents/DOC-EPA-WATERSENSE-PLUMBING.html`
- `server/persistence/spatial_academy_state.json`

Treat runtime-generated mutation separately from source implementation.

Do not casually commit these files merely because the application ran.

Longer term, mutable runtime state should be separated from immutable repository source.

## 6. Visual stack

Current browser-side technology includes:

- React;
- Three.js;
- WebIFC;
- That Open components/UI.

This stack is considered sufficient to attempt professional CAD/BIM/construction visualization.

The current acceptance question is not “Can Three.js be photorealistic?” It is:

> Can HERMES present truthful, clear, professional construction geometry and process strongly enough for construction/engineering audiences?

Do not introduce a second renderer until physical acceptance shows a real product need.

## 7. Persistence/runtime reality

Current runtime is suitable for a prototype/academy host but not yet the intended final production architecture.

Current characteristics include:

- long-lived Node/Express process;
- SQLite/WASM + JSON/filesystem persistence;
- in-process and local-state mechanisms;
- browser UI coupled to runtime APIs.

Future production direction:

- durable canonical database;
- durable task leases/queues;
- true cross-process locking;
- clean separation of source artifacts from mutable runtime state;
- local-first inference endpoint;
- observable, restart-safe runtime.

Do not perform that migration merely to complete visual acceptance.

## 8. Model/reasoning state

HERMES already exposes a reasoning-provider abstraction, but active implementation remains significantly coupled to Gemini in places.

Desired long-term routing:

`DETERMINISTIC → SMALL LOCAL MODEL → LARGER LOCAL MODEL → FRONTIER MODEL / HUMAN`

Principle:

- deterministic code owns math, geometry, physics, collision, quantity, schedule math, and rule checks wherever practical;
- small local models handle routine tool routing, structured decisions, extraction, summarization, and constrained planning;
- larger models are escalation resources, not the operating system.

Model replacement is not the present P0 until visual acceptance is complete.

## 9. Spatial/robotics state

The codebase already contains early embodied/spatial concepts such as:

- actor position;
- actor envelope;
- work zone;
- tool state;
- carried material;
- equipment entities;
- access paths;
- collision/clearance concepts;
- future-constructability dependency.

This is the correct direction, but HERMES is **not yet a robotics control system**.

Robotics target:

- one canonical spatial world usable by digital agents today and real site computers/robots later;
- body + tool + payload + clearance as effective moving geometry;
- mission-level HERMES commands separated from real-time motor/joint control;
- sensor/perception uncertainty introduced progressively through Academy curricula.

## 10. Known truth/architecture debt

Do not lose sight of these issues:

- some historical runtime “proof”/acceptance code has hard-coded or overly optimistic pass semantics;
- some historical “distributed” behavior has been implemented as process-local state;
- duplicate/overlapping runtime paths and historical fixture code exist;
- old reality/audit documents may describe stronger guarantees than current physical infrastructure provides;
- historical tests include pre-existing failures unrelated to Academy House acceptance;
- current repository carries substantial historical phase documentation that should not all be read for every task.

The control layer exists specifically to prevent those historical artifacts from driving new work accidentally.

## 11. Product stage

Current product stage:

**ACADEMY HOUSE 001 — PHYSICAL VISUAL ACCEPTANCE**

Not yet:

- permanent production infrastructure;
- local GPU runtime;
- real robotics hardware control;
- generalized hotel/commercial generator;
- customer-facing SaaS;
- photorealistic presentation environment.

## 12. Immediate exit criterion

P0 visual acceptance is complete only when the owner can physically inspect a browser-accessible faithful runtime and judge:

- empty land;
- mobilization;
- construction progression;
- credible house geometry;
- roof;
- openings;
- framing/foundation;
- MEP/X-ray;
- walkthrough;
- section/cutaway;
- replay/timeline;
- site logistics;
- embodied actors;
- component provenance;
- long-material future-constructability proof.

Source code alone cannot satisfy this exit criterion.
