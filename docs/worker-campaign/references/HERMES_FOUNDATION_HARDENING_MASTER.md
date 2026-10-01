# HERMES FOUNDATION HARDENING MASTER

**Status:** Controlling implementation plan for foundation work derived from the September 20, 2026 deep-research pass.

**Repository:** `aijaraix/Hermes-Construction-1`  
**Planning branch:** `planning/hermes-control-layer-2026-09-18`

## Purpose

HERMES does **not** need a conceptual reset or frontend rewrite.

The research confirms that the core product direction remains valid:

`COMMAND → EVENT → STATE → WORLD → OBSERVATION → VALIDATION → NEXT ACTION`

The world remains the product, and the renderer remains a projection of canonical truth.

The immediate risk is not the choice of renderer or LLM. The risk is allowing implementation to grow before the system has durable:

- entity identity;
- revisions and temporal truth;
- units and coordinate-frame semantics;
- source authority and provenance;
- production persistence;
- openBIM normalization;
- provider-neutral AI routing.

This program hardens those foundations **without stopping the human-experience work**.

## Relationship to HX-01 / HX-02 / HX-03

The existing human-experience sequence remains controlling:

1. HX-01 — immersive foundation, navigation, executive overview
2. HX-02 — inspector, attention, timeline / What Changed
3. HX-03 — materials, schedule, logistics

Foundation work proceeds beneath/alongside HX.

The UI must consume canonical adapters and must not create a second source of truth.

Foundation implementation order:

1. **FND-01 — Canonical Identity, Revision, Units & Spatial Frames**
2. **FND-02 — Evidence, Provenance, Source Authority & Truth Classification**
3. **FND-03 — Production Persistence, PostgreSQL/PostGIS & Object Storage**
4. **FND-04 — openBIM Server Normalization & Model Revision Pipeline**
5. **FND-05 — Provider-Neutral AI Capability Router & AI Provenance**

## Dependency graph

```text
FND-01
  ├── FND-02
  ├── FND-03
  └── FND-04

FND-02
  ├── FND-03
  ├── FND-04
  └── FND-05

FND-03
  └── production persistence for later live connectors

FND-04
  └── model revisions / IFC normalization / BIM evidence

FND-05
  └── model/provider independence and accountable AI execution
```

FND-01 should be implemented first because every later layer depends on stable identity, units and coordinate semantics.

## Program rules

Every implementation worker must:

1. Fetch current remote `main` first.
2. Preserve legitimate newer work.
3. Read the HERMES control index and this master.
4. Read only the single FND ticket being implemented plus files directly relevant to it.
5. Avoid broad rediscovery.
6. Avoid rewriting working frontend/render/runtime systems unless the ticket explicitly requires it.
7. Preserve the current Academy House vertical slice.
8. Preserve runtime-generated persistence/reference files unless explicitly migrated in an authorized task.
9. Do not claim physical acceptance without runtime evidence.
10. Do not merge planning documents directly into runtime behavior.

## Architecture invariants

### Canonical truth

- Renderer state is not canonical state.
- AI output is not canonical state.
- Imported BIM source files are not the internal HERMES ontology.
- External public datasets are contextual evidence, not project-specific professional truth.
- Simulation fixtures must remain distinguishable from live evidence.
- HERMES validation must remain distinct from licensed-professional approval, AHJ inspection and legal approval.

### Spatial truth

Every important spatial record must identify its frame.

Target hierarchy:

`Earth/geodetic CRS → project survey CRS → site → building → storey/space → component → task/work → equipment base → tool → sensor`

Transforms must be explicit, versioned and traceable.

### Temporal truth

Important objects should distinguish:

- when the fact was true;
- when it was observed;
- when HERMES learned/recorded it;
- which revision it belongs to.

### Evidence

Every important claim should be answerable with:

> Where did this come from?

### AI

Use the tier model:

- Tier 0: deterministic
- Tier 1: small/local
- Tier 2: larger/local
- Tier 3: remote frontier
- Human/professional escalation

Do not bind a construction role permanently to one model/provider.

## Explicit non-goals

This foundation program does **not** authorize:

- a frontend rewrite;
- replacing Three.js;
- replacing React;
- building a custom IFC parser;
- building a custom GIS projection engine;
- building a graph database;
- adding Kafka/microservices without measured need;
- building a universal physics simulator;
- implementing ROS/MoveIt runtime control now;
- direct LLM-to-actuator control;
- copying copyrighted standards into the repository;
- downloading large public datasets or model weights into normal Git;
- merging planning work directly to `main`.

## Done condition

The foundation program is complete only when HERMES can represent a live project such that:

- a physical/digital object retains identity across revisions/imports;
- every spatial value has explicit frame and units;
- every important claim can reference source/evidence;
- project state persists in a production database;
- large immutable artifacts live outside the relational database;
- IFC imports are normalized into HERMES entities rather than treated as runtime truth;
- AI execution records capability, provider/model, tools, output, evidence and approval path;
- HX work can consume these canonical contracts without duplicating truth.

## Truth labels

Use:

- **PHYSICALLY VERIFIED**
- **IMPLEMENTED — NOT PHYSICALLY VERIFIED**
- **PARTIAL**
- **SIMULATED**
- **BLOCKED**
- **NOT IMPLEMENTED**

No evidence = **UNVERIFIED**.
