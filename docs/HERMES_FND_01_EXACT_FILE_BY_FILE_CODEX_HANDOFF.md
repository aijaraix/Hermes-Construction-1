# HERMES FND-01 — EXACT FILE-BY-FILE CODEX IMPLEMENTATION HANDOFF

**Controlling foundation ticket:** `docs/HERMES_FND_01_CANONICAL_IDENTITY_REVISION_UNITS_SPATIAL_FRAMES.md`

**Required audit:** `docs/HERMES_FND_01_SOURCE_AUDIT.md`

## FIRST ACTION

Fetch CURRENT remote `main`.

Do not assume the audit checkpoint remains current.

Preserve all legitimate newer work.

Create/continue a dedicated implementation branch from current main.

Do not work directly on the planning branch.

Do not commit runtime-generated persistence files.

---

# 1. Objective

Implement the minimum canonical identity/revision/unit/spatial-frame layer required by FND-01 while preserving Academy House and current renderer behavior.

This is an **additive compatibility pass**, not a global migration.

Do not change visual coordinates merely to make types cleaner.

---

# 2. File: src/types/hermes.ts

## Add canonical branded/type aliases

Add an appropriately named group for:

- `ConstructionEntityId`
- `ProjectRevisionId`
- `EntityRevisionId`
- `SpatialFrameId`
- `EvidenceRefId` placeholder/reference type if useful for future compatibility

Do not mechanically replace every existing `string` in the repo.

## Add ExternalIdentity

Minimum:

```ts
interface ExternalIdentity {
  system:
    | 'HERMES'
    | 'IFC'
    | 'REVIT'
    | 'GIS'
    | 'MANUFACTURER'
    | 'SERIAL'
    | 'SENSOR'
    | 'BCF'
    | 'OTHER';
  externalId: string;
  sourceId?: string;
  revisionId?: string;
}
```

Permit extension without hardcoding every future connector.

## Add canonical entity contract

Create a small `ConstructionEntity` / `CanonicalEntityRef` contract containing:

- stable HERMES ID
- project ID
- entity class
- name
- current revision ID
- external identities
- optional classification references
- lifecycle/construction state

Do not force every existing domain interface to extend it yet.

## Add revision contracts

Add:

- `ProjectRevision`
- `EntityRevision`

Minimum semantics:

- ID
- project/entity
- revision index/version
- created/recorded timestamp
- optional valid-from/valid-to
- supersedes
- source/event relation

Keep existing `BimRevisionRecord` and `ModelRevisionRecord` temporarily.

## Add unit types

Add explicit types/enums for:

- meter / foot / inch
- square meter / square foot
- cubic meter / cubic foot / cubic yard
- kilogram / pound
- radian / degree
- seconds/minutes/hours/days as needed

Do not rewrite all domain-specific fields.

Create conversion helpers in a separate file rather than bloating the type file.

## Add canonical spatial types

Add:

```ts
type Vector3 = [number, number, number];
type EulerRadians = [number, number, number];
type Quaternion = [number, number, number, number];

interface AxisAlignedSizeMeters {
  x: number;
  y: number;
  z: number;
}

type PoseAnchor =
  | 'BASE_INSERTION'
  | 'CENTER'
  | 'ACTOR_ORIGIN'
  | 'SENSOR_ORIGIN'
  | 'SOURCE_DEFINED'
  | 'LEGACY_UNSPECIFIED';

interface CanonicalPose {
  frameId: SpatialFrameId;
  positionMeters: Vector3;
  orientation:
    | { kind: 'EULER_XYZ_RADIANS'; value: EulerRadians }
    | { kind: 'QUATERNION_XYZW'; value: Quaternion };
  anchor: PoseAnchor;
}
```

Exact naming may follow repo conventions.

## Repair ProjectWorldFrame contract

Do not keep one ambiguous `surveyOrigin` tuple as the only location contract.

Add structured:

- geodetic origin;
- projected origin;
- local metric frame definition.

Retain legacy `surveyOrigin` temporarily if required by old consumers and mark it deprecated/source-compatible.

Do not call a three-element Euler tuple a quaternion.

## Consolidate duplicate RobotReadySpatialContract

There are currently two declarations.

Replace with one explicit merged contract containing all fields required by existing consumers.

Do not drop fields silently.

## BIMComponent compatibility

Add optional explicit geometry-unit metadata.

Example:

```ts
geometry: {
  ...
  lengthUnit?: 'METER' | 'FOOT';
  positionAnchor?: PoseAnchor;
  frameId?: SpatialFrameId;
}
```

Do not force all legacy records to populate these immediately.

---

# 3. New file: src/lib/physicalUnits.ts or equivalent

Implement pure deterministic conversion helpers.

Minimum tests/functions:

- meters ↔ feet
- meters ↔ inches if needed
- square meters ↔ square feet
- cubic meters ↔ cubic feet
- cubic meters ↔ cubic yards
- radians ↔ degrees

No AI.

No implicit conversion based on object name.

Conversions must require explicit source unit.

---

# 4. New file: src/lib/canonicalSpatial.ts or equivalent

Implement canonical spatial compatibility helpers.

Minimum responsibilities:

- construct canonical pose;
- normalize explicit XYZ metric dimensions;
- convert legacy L/W/H dimensions through an explicit adapter;
- validate finite numeric vectors;
- transform between parent/child local frames for the initial translation/rotation subset;
- invert supported transforms;
- project canonical pose to renderer-local coordinates.

For FND-01, frame math can remain bounded to the transform representations already needed by HERMES.

Do not build a GIS projection engine.

## Important legacy dimension rule

Do **not** globally reinterpret existing tuples.

Provide explicit adapters such as:

- `fromLegacyLengthWidthHeightMeters(...)`
- `fromXyzMeters(...)`

The caller must choose.

---

# 5. New file: src/lib/canonicalIdentity.ts or equivalent

Implement compatibility utilities:

- construct stable canonical entity reference from an existing domain record;
- attach external identities;
- validate duplicate external identity conflicts;
- preserve canonical ID when external aliases change.

No database required.

No IFC matching heuristics beyond exact explicit mapping.

---

# 6. File: server/genesisProjectEngine.ts

## Repair frame metadata

Current `surveyOrigin` values are latitude/longitude-like while the coordinate-reference string also says UTM/local metric.

Make the metadata truthful.

Recommended compatibility direction:

- preserve local metric world frame used by current rendering;
- represent Tampa-like geodetic fixture origin explicitly as geodetic metadata;
- do not claim those numbers are UTM easting/northing;
- use Euler radians for current 3-tuple rotations, or provide an actual 4-element quaternion if switching the representation.

Prefer the minimal non-breaking correction.

## Add revision identity

Genesis project should expose an initial project revision ID.

Do not reinterpret `attemptId` as revision ID.

---

# 7. File: server/hermesLiveHouseEngine.ts

Do not rewrite the entire state interface.

## Add project-level frame/revision metadata

Add minimum optional/required current fields as safe:

- project revision ID;
- project world-frame ID / world-frame metadata.

## Add compatibility decorators

When genesis state is built, assign canonical metadata to current live records where unambiguous:

Facilities:
- canonical entity ID = current entityId
- frame = project local frame
- explicit XYZ metric dimension adapter
- preserve current numeric position

Equipment:
- canonical entity ID mapped from equipmentId
- frame = project local frame
- metric size/pose metadata

Materials:
- canonical entity ID mapped from materialBatchId
- frame = project local frame
- metric size/pose metadata

Actors:
- canonical entity ID mapped from agentId
- frame = project local frame

Building components:
- do not guess units/anchors where source semantics are unclear
- preserve raw data
- allow canonical adapter to mark legacy/source-defined semantics

## Do not move objects

No coordinate-number changes solely for canonicalization.

---

# 8. File: server/bimCommandEngine.ts

## Canonical identity

For newly created BIM objects:

- set canonical HERMES entity identity explicitly;
- retain existing `id`;
- retain `ifcGlobalId` compatibility field.

## IFC ID truth repair

Do not describe the locally generated pseudo-ID as a standards-compliant IFC compressed GlobalId.

Options for FND-01:

A. rename internal generator/metadata semantics to `SOURCE_LOCAL_IFC_ALIAS` while retaining field compatibility; or

B. use a correct IFC GlobalId utility only if a current dependency already provides it and implementation is narrow.

Do not add a large IFC dependency solely for this ticket.

FND-04 owns real IFC normalization.

## Geometry unit

Every object created from meter-named command parameters must write:

- explicit `lengthUnit: 'METER'`;
- explicit frame ID where project frame is known;
- explicit anchor.

## Revision

Preserve existing revision snapshots.

Add canonical project/entity revision references where practical.

Do not replace the in-memory store here; FND-03 owns persistence.

---

# 9. File: server/deterministicGeometryEngine.ts

This file contains the most dangerous unit mismatch.

Current behavior assumes every `BIMComponent.geometry.dimensions` tuple is feet.

## Required change

Use explicit geometry unit metadata when present.

Compatibility rule:

- if `lengthUnit === 'METER'`, compute quantities with correct metric-to-output conversion;
- if `lengthUnit === 'FOOT'`, preserve existing imperial behavior;
- if legacy unit is absent, preserve existing historical behavior but mark/use a clearly named legacy default.

Do not silently reinterpret all old BIM components as meters.

## Wall dimension semantics

Audit the current wall tuple ordering.

The command engine stores approximately:

`[thickness, height, length]`

while legacy quantity logic historically uses `w * h` as wall area.

Do not propagate this error into the canonical layer.

Add a narrow semantic helper or use explicit geometry metadata so wall surface quantity uses:

`length × height`.

Do not change unrelated estimating behavior beyond what is required to make units/dimension semantics correct.

## Price/supplier fabrication

Do not broaden this ticket into BOM price-truth repair except where a test is directly broken.

Materials/HX tickets already own those UI/data truth repairs.

---

# 10. File: src/components/BimWorkspaceView.tsx

FND-01 should make minimal frontend changes.

## Do

Introduce/use canonical-to-render helper only at a narrow boundary where practical.

Current local-meter fixtures may remain identity projection.

## Do not

- restructure UI;
- move panels;
- change shell;
- alter visual coordinates;
- implement HX work;
- bulk-migrate all raw records.

The goal is to establish the projection boundary, not refactor the renderer.

---

# 11. File: src/components/ThreeBIMViewer.tsx

Preserve existing base-insertion behavior:

`mesh.position.y = sourceY + height / 2`

Do not change existing visual output.

If canonical pose metadata is used, convert it to the legacy renderer expectation through an adapter.

Add no new layout/UI.

---

# 12. File: server/phase1DiagnosticRunner.ts

Update misleading diagnostics only if necessary.

Specifically, do not claim:

`rotationUnit = QUATERNION`

while the system stores three-element Euler tuples.

Keep the intent:

- canonical metric;
- named root frame;
- explicit rotation representation.

Do not loosen existing checks merely to pass.

---

# 13. Tests

Create a focused test file such as:

`server/__tests__/fnd01_canonical_spatial_identity.test.ts`

Required tests:

### ID-01
Changing an external alias does not change canonical entity ID.

### ID-02
Two external systems may map to the same HERMES entity.

### REV-01
Project revision N and N+1 coexist historically.

### REV-02
Entity revision can supersede previous revision without deleting history.

### UNIT-01
1 meter ↔ 3.280839895... feet round-trips within tolerance.

### UNIT-02
Metric command-created wall area is calculated from length × height and converted correctly.

### UNIT-03
Legacy feet geometry retains historical unit path.

### DIM-01
Legacy trailer L/W/H adapter maps to canonical XYZ as:
- x = length
- y = height
- z = width

without changing the stored legacy tuple.

### FRAME-01
Local child-frame translation resolves deterministically to parent/world coordinates.

### FRAME-02
Supported transform inverse restores original pose within tolerance.

### ROT-01
Euler-radian and quaternion types cannot be confused structurally.

### RENDER-01
Canonical local-meter base insertion projects to the same Three-space position expected by current renderer.

### LIVE-01
Academy/live facility numeric world positions remain unchanged after compatibility metadata is added.

### IFC-01
Locally generated legacy IFC alias is not falsely validated as an IFC compressed GlobalId.

---

# 14. Targeted regression suite

At minimum run:

- new FND-01 tests;
- `academy_house_001_vertical_slice.test.ts`;
- current relevant phase-1 spatial diagnostics/tests;
- TypeScript typecheck;
- production build.

Report known unrelated failures separately.

Do not alter legacy tests merely to silence real semantic failures.

---

# 15. Files explicitly out of scope

Do not modify unless required for compilation:

- persistence/database implementation;
- authentication;
- Aedryx landing/access work;
- HX immersive UI files;
- source ingestion;
- model providers;
- robotics runtime;
- GIS connectors;
- knowledge corpus;
- supplier integrations.

---

# 16. Stop condition

Stop when FND-01 contracts/adapters/tests are implemented and current runtime remains behaviorally intact.

Do not continue to:

- FND-02 evidence;
- FND-03 PostgreSQL;
- FND-04 IFC import;
- FND-05 AI router;
- HX-01.

Return:

- current-main SHA used;
- implementation commit SHA;
- exact files changed;
- typecheck/build/test results;
- any remaining ambiguous legacy coordinate/unit sources;
- whether physical visuals changed;
- truth label.

Expected truth label after code/tests only:

**IMPLEMENTED — NOT PHYSICALLY VERIFIED**
