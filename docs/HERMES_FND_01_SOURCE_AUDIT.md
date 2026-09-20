# HERMES FND-01 SOURCE AUDIT — IDENTITY, REVISION, UNITS & SPATIAL FRAMES

**Audit basis:** current remote `main` at `bbc90702a7d62a0092dc2dd914901743c23ec8b5`.

**Purpose:** establish the exact current source reality before implementing FND-01.

## Executive finding

HERMES already contains several of the right primitives:

- `SpatialEntityRecord.entityId`;
- `frameId` / `parentFrameId`;
- `ProjectWorldFrame`;
- `TruthOrigin`;
- event-linked creation/mutation IDs;
- `BIMComponent.ifcGlobalId`;
- component revision IDs;
- append-only in-memory BIM revision snapshots;
- metric world coordinates in several spatial subsystems.

The problem is not total absence. The problem is **fragmentation and incompatible semantics**.

The first FND-01 implementation should therefore be additive and compatibility-oriented.

Do **not** bulk-rewrite current fixtures or renderer positions.

---

## 1. Identity audit

### Existing identity families

Current source uses distinct primary IDs:

- spatial entity → `entityId`
- BIM component → `id` or live-house `componentId`
- material → `materialId` / `materialBatchId`
- equipment → `equipmentId`
- agent → `agentId`
- room → `roomId`
- survey mark → `markId`
- task → `taskId`
- event → `eventId`
- model revision → `revisionId` or legacy `revision`

These are useful domain IDs but there is no single canonical cross-domain HERMES identity contract.

### Existing external identity

`BIMComponent` already has:

- `ifcType`
- `ifcGlobalId`
- storey/space/container IDs
- created/current revision IDs

This is directionally correct.

### Current risk

`BimCommandEngine` generates IDs using time/random values. They are stable only after the object exists in the current store; there is no external-identity reconciliation layer for re-imported BIM.

The field `ifcGlobalId` is documented as a 22-character GUID, but `generateIfcGuid()` currently produces strings such as a type prefix plus timestamp/counter. That is **not an IFC compressed GlobalId contract**.

FND-01 should not mislabel this value as standards-compliant.

FND-04 will own true IFC import/global-ID reconciliation.

### Recommendation

Introduce a canonical `ConstructionEntityId` plus `ExternalIdentity[]`.

Do not delete existing domain IDs.

Initial compatibility rule:

- existing object ID remains usable;
- canonical entity ID may initially equal the existing domain ID;
- external identifiers are mapped separately;
- later imports can reconcile many external IDs to one stable HERMES entity.

---

## 2. Revision audit

### Existing revision mechanisms

`BimCommandEngine` has:

- `BimCommandExecutionRecord.revisionId`
- `BimRevisionRecord`
- per-project revision history
- deep-cloned component snapshots
- append-style revision creation
- `BIMComponent.createdRevisionId`
- `BIMComponent.currentRevisionId`

This is a good prototype.

### Existing competing schema

`src/types/hermes.ts` also defines a separate `ModelRevisionRecord` using:

- `revision`
- `timestamp`
- `project`
- triggering task
- component counts
- quantity/cost/inspection delta
- model asset location

These two revision concepts are not unified.

### Live-house gap

`HermesLiveHouseState` has `attemptId`, checkpoint and event sequence, but no explicit project revision ID.

`attemptId` is an execution/attempt boundary and must not become a substitute for model/project revision.

`HermesWorldEvent` does not currently carry a project/entity revision reference.

### Persistence limitation

The BIM revision store is in memory.

FND-01 should define the contract; FND-03 will productionize persistence.

### Recommendation

Create:

- `ProjectRevisionId`
- `EntityRevisionId`
- `ProjectRevision`
- `EntityRevision`

Keep old `BimRevisionRecord` through a compatibility adapter.

Add optional revision references to new events/entities without forcing a historical-data rewrite.

---

## 3. Unit audit

### Metric spatial world

`SpatialEntityRecord` documents:

- `worldPosition` in meters
- `dimensions` in meters

`AgentSpatialState.worldPosition`, `SurveyControlMark.worldPosition`, `MaterialSpatialRecord.dimensionsMeters` and many constructability fields are explicitly metric.

This is the right direction.

### Legacy BIM geometry is unit-ambiguous

`BIMComponent.geometry` contains numeric tuples with no length-unit property.

`BimCommandEngine` creates walls/slabs using meter-named inputs:

- `thicknessMeters`
- `heightMeters`
- `offsetAlongWallMeters`

and produces quantities labeled in metric such as `m²`.

However, `deterministicGeometryEngine.calculateComponentQuantities()` explicitly interprets:

`comp.geometry.dimensions` as **feet**.

This means newly generated command-engine BIM components can be numerically metric while the downstream legacy quantity engine interprets the same tuple as imperial.

This is a critical semantic defect.

### Additional mixed-unit fields

Current source intentionally contains explicit imperial quantities such as:

- feet
- inches
- pounds
- psf
- psi
- mph

These are not inherently wrong because their field names/units are explicit.

The unsafe case is an unlabeled generic tuple or scalar whose unit is inferred from caller context.

### Recommendation

Do not convert every value to metric in one destructive pass.

Instead introduce explicit canonical quantity types and conversion helpers.

For generic geometry/spatial truth, use an explicit unit.

Legacy adapters must preserve historical behavior while making the assumption visible.

Suggested compatibility:

- new canonical spatial geometry → meters;
- new `BimCommandEngine` geometry → mark explicitly as meters;
- legacy `BIMComponent` with no unit → classify as `LEGACY_UNSPECIFIED` or source-specific known unit;
- `deterministicGeometryEngine` must stop blindly assuming every future BIM component uses feet.

---

## 4. Dimension-order audit

There are multiple tuple conventions.

### `BIMComponent.geometry.dimensions`

Renderer and comments use an effective:

`[x width, y height, z depth/length]`

### `SpatialEntityRecord.dimensions`

The comment says:

`[length, width, height]`

which is not the same semantic ordering as XYZ.

### Academy trailer evidence

The phase-1 diagnostic expects a 40-foot trailer tuple:

`[12.192, 2.438, 2.896]`

which reads naturally as:

`[length, width, height]`.

### Live-house facilities

Live house facilities use:

`[12.19, 2.89, 2.44]`

which appears intended as:

`[x length, y height, z width]`.

Therefore the repository currently contains at least two dimension orders.

### Recommendation

New canonical code must not use ambiguous raw dimension tuples.

Introduce:

```ts
interface AxisAlignedSizeMeters {
  x: number;
  y: number;
  z: number;
}
```

or an equivalent strongly named type.

Keep legacy tuple fields unchanged for fixture compatibility.

Use source-specific adapters.

Do not globally reinterpret existing tuples.

---

## 5. Position-anchor audit

`ThreeBIMViewer` positions a BIM mesh at:

`y + h / 2`

which means the incoming BIM geometry position is treated as a **base insertion/datum** position.

Other world records are not consistently explicit about whether `worldPosition.y` is:

- base;
- center;
- sensor/actor pose;
- source-defined anchor.

Examples in live-house materials/facilities often resemble center-height placement.

### Recommendation

Canonical `Pose` needs an explicit anchor/reference point, e.g.:

- `BASE_INSERTION`
- `CENTER`
- `ACTOR_ORIGIN`
- `SENSOR_ORIGIN`
- `SOURCE_DEFINED`
- `LEGACY_UNSPECIFIED`

Do not move existing objects in FND-01.

Adapters should preserve current rendering while labeling the legacy anchor semantics.

---

## 6. Rotation audit

### Current contradiction

`SpatialEntityRecord.worldRotation` is documented as:

> degrees or radians

That is not a valid canonical contract.

`ProjectWorldFrame.rotationUnit` permits:

- `RADIANS`
- `QUATERNION`

but the actual rotation values used throughout current source are commonly three-element tuples.

A quaternion requires four scalar components.

Genesis currently sets:

`rotationUnit: 'QUATERNION'`

while entities use:

`rotation: [0, 0, 0]`.

### BIM rotation

`BimCommandEngine` uses `Math.atan2(...)`, therefore its Euler rotation is in radians.

### Recommendation

For FND-01:

- define Euler XYZ radians explicitly;
- define quaternion separately as a 4-tuple for future use;
- do not call a 3-vector quaternion;
- change new/current genesis frame metadata to match actual representation;
- preserve old fixture fields through compatibility adapters.

---

## 7. Coordinate-reference audit

### Existing good concepts

`ProjectWorldFrame` and `SiteRealityModel` already contain:

- world-frame IDs;
- coordinate-reference strings;
- survey datum;
- metric local-world concepts.

### Current ambiguity

Genesis uses:

`surveyOrigin: [27.9506, -82.4572, 0]`

which looks like latitude/longitude/elevation.

At the same time `coordinateReference` says:

`UTM Zone 17N / LOCAL METRIC WORLD FRAME`.

A latitude/longitude tuple is not a UTM easting/northing coordinate tuple.

The interface comment itself allows either lat/lon-style or northing/easting-style values in the same array.

This is exactly the ambiguity FND-01 must remove.

### Recommendation

Separate:

```ts
GeodeticOrigin {
  latitudeDeg
  longitudeDeg
  elevationMeters
}

ProjectedOrigin {
  crs
  eastingMeters
  northingMeters
  elevationMeters
}
```

A local project frame may be defined relative to either one, but the types cannot share an ambiguous numeric tuple.

No GIS transformation engine is required in FND-01.

---

## 8. Frame-coverage audit

### Existing frame-aware areas

- `SpatialEntityRecord`
- `ProjectWorldFrame`
- `SiteRealityModel`
- robot-ready spatial contract
- some Academy/phase validation engines

### Frame gaps in the active live-house engine

`HermesLiveHouseState` currently uses `any[]` for several collections.

Live:

- facilities
- agents
- equipment
- materials
- building components
- work locations

generally carry positions but do not consistently carry `frameId`.

Therefore the live vertical slice is metric-ish but not uniformly frame-addressable.

### Recommendation

Add a compatibility canonicalizer rather than rewriting each engine immediately.

Every live spatial object exposed through new canonical contracts should acquire:

- canonical entity ID;
- frame ID;
- unit;
- anchor;
- pose;
- size/envelope;
- revision reference where available.

Existing raw fields remain available until downstream migration is complete.

---

## 9. Renderer-boundary audit

Current frontend code frequently passes raw source positions directly into Three.js vectors.

That is acceptable only because today's fixtures already live in a renderer-friendly local coordinate space.

It will fail once HERMES ingests:

- geodetic coordinates;
- survey eastings/northings;
- federated BIM offsets;
- equipment-local frames;
- sensor frames.

### Recommendation

FND-01 should create a canonical-to-render projection API.

Initially it may be identity-transform for current Academy/local-meter fixtures.

The critical rule is architectural:

**renderer coordinates are derived, never authoritative.**

---

## 10. Duplicate type defect

`src/types/hermes.ts` declares `RobotReadySpatialContract` twice.

TypeScript interface merging makes this especially dangerous because the duplicate declaration can silently produce a combined contract rather than a clear error.

FND-01 should consolidate this into one explicit interface while preserving all currently required fields.

---

## 11. Current live-state typing gap

`HermesLiveHouseState` uses `any[]` for important canonical collections including spatial entities, agents, survey/boring/program/building-component records.

FND-01 should **not** attempt to fully type the whole engine.

It should replace only the pieces needed to establish canonical identity/spatial contracts, using compatibility intersections/adapters where necessary.

---

## 12. Existing revision behavior limitation

The command enum includes mutation concepts such as:

- `MOVE_COMPONENT`
- `RESIZE_COMPONENT`

but the source audit did not find corresponding mature mutation/revision handling comparable to the create paths.

Do not expand command functionality in FND-01 merely to satisfy the schema.

Revision-contract tests can use explicit synthetic revisions.

---

## 13. FND-01 migration strategy

Use a three-layer approach:

### Layer A — new canonical contracts

Strongly typed, unit-aware, frame-aware and revision-aware.

### Layer B — legacy adapters

Convert current live/Academy/BIM records into canonical views without rewriting fixture data.

### Layer C — renderer/domain consumers

Migrate incrementally.

HX and future FND work should consume Layer A where available.

Do not delete Layer B until all live consumers are migrated and physically accepted.

---

## 14. Source files that matter most

Primary:

- `src/types/hermes.ts`
- `server/genesisProjectEngine.ts`
- `server/hermesLiveHouseEngine.ts`
- `server/bimCommandEngine.ts`
- `server/deterministicGeometryEngine.ts`
- `src/components/BimWorkspaceView.tsx`
- `src/components/ThreeBIMViewer.tsx`

Tests/reference:

- `server/phase1DiagnosticRunner.ts`
- `server/__tests__/academy_house_001_vertical_slice.test.ts`
- existing phase/world validation tests

Secondary later:

- prehouse/validation engines
- IFC normalization pipeline
- persistence layer

---

## 15. FND-01 conclusion

The correct implementation is **not** “invent spatial identity from scratch.”

It is:

1. formalize what already exists;
2. resolve contradictory unit/frame contracts;
3. introduce stable cross-domain identity;
4. provide adapters for legacy fixtures;
5. preserve rendering/runtime behavior;
6. give FND-02/FND-03/FND-04/HX a clean canonical boundary.

This can be done as a bounded compatibility pass without rebuilding HERMES.
