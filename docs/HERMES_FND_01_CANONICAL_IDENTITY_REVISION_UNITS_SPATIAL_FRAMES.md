# HERMES FND-01 — CANONICAL IDENTITY, REVISION, UNITS & SPATIAL FRAMES

## Objective

Create the minimum durable schema contracts required so HERMES can know **what an object is, which revision it belongs to, what units its values use, and where it exists in physical space**.

This is the first foundation ticket.

## Why now

The highest-cost future retrofit would be discovering that imported BIM objects, world objects, materials, equipment and later sensors/robots do not share durable identity or coordinate semantics.

The current system already has useful spatial/task/event concepts. Extend them; do not redesign the product.

## Required concepts

### 1. ConstructionEntity

Introduce a canonical HERMES entity abstraction capable of representing:

- building component;
- space/room;
- site object;
- material batch;
- equipment;
- actor;
- temporary work;
- sensor;
- document-linked physical asset;
- future robot/machine identity.

Minimum contract:

```ts
type ConstructionEntityId = string;

interface ConstructionEntity {
  entityId: ConstructionEntityId;
  projectId: string;
  entityClass: string;
  name?: string;
  externalIds: ExternalIdentity[];
  classificationRefs?: ClassificationRef[];
  lifecycleState?: string;
  constructionState?: string;
  currentRevisionId: string;
}
```

The exact TypeScript/API shape may be adapted to existing repo conventions, but semantics must remain.

### 2. External identity mapping

An entity may map to zero or more external identifiers:

- IFC GlobalId;
- Revit element ID;
- source-model ID;
- manufacturer SKU;
- serial number;
- GIS feature ID;
- BCF topic/object reference;
- sensor ID;
- equipment controller ID.

External IDs are aliases, not HERMES identity.

Re-importing/replacing a model must not automatically destroy canonical HERMES identity.

### 3. Revision model

Add project/entity revision semantics.

Minimum concepts:

- `ProjectRevision`
- `EntityRevision`
- revision source
- created/recorded timestamp
- supersedes relationship
- valid-from / valid-to where appropriate
- immutable historical revisions

Do not mutate historical revisions in place.

### 4. Unit semantics

Define canonical dimensional types/conversion boundary.

At minimum support:

- length
- area
- volume
- mass
- force
- pressure/stress
- temperature
- angle
- time/duration
- currency/monetary amount where already used
- quantity/count

Do not rely on unlabeled naked numbers for physical truth.

Existing render coordinates may remain internally convenient, but canonical records must identify unit semantics.

### 5. Spatial frames

Introduce explicit frame identities and transforms.

Minimum frame classes:

- geodetic / Earth CRS
- project survey CRS
- site local
- building
- storey / space
- component
- task/work area
- equipment base
- tool
- sensor

Minimum concepts:

```ts
SpatialFrame
SpatialTransform
Pose
BoundingEnvelope
```

Every transform should carry:

- source frame
- target frame
- translation
- orientation
- unit
- revision/version
- provenance/evidence reference when derived from survey/calibration

### 6. Renderer boundary

Three.js coordinates must remain a projection.

Do not make renderer-local `Vector3` values canonical project coordinates.

Create/adapt a translation boundary from canonical spatial records to render space.

## Compatibility requirements

Preserve:

- Academy House execution;
- existing Three.js renderer;
- existing task dependency semantics;
- future-constructability proof;
- current human status adapters;
- project context;
- current event architecture.

Do not attempt a broad migration of every historical object in this ticket.

Use adapters where required.

## Suggested files

Worker must inspect current source before deciding exact locations.

Prefer a narrow domain module such as:

`src/domain/canonical/`
or the repository's existing equivalent.

Possible files:

- `entity.ts`
- `revision.ts`
- `units.ts`
- `spatialFrame.ts`
- `externalIdentity.ts`
- adapter tests

Do not force this exact structure if current source has a better established convention.

## Acceptance

Required tests should prove:

1. HERMES entity ID remains stable when external source ID mappings change.
2. Two revisions of the same entity can coexist historically.
3. Physical dimensions cannot be interpreted without explicit unit semantics at canonical boundaries.
4. A pose can be transformed through explicit frames.
5. Transform direction is deterministic and invertible where appropriate.
6. Renderer projection does not change canonical coordinates.
7. Existing Academy House targeted tests remain passing except known unrelated legacy failures.

## Non-goals

Do not:

- migrate to PostgreSQL here;
- implement GIS connectors;
- parse IFC;
- redesign BimWorkspaceView;
- implement robotics runtime;
- add a physics engine.

## Completion evidence

Report:

- files changed;
- schema contracts added;
- compatibility adapters added;
- targeted tests;
- typecheck/build result;
- unresolved migration areas.

Truth label remains **IMPLEMENTED — NOT PHYSICALLY VERIFIED** until exercised in a faithful runtime.
