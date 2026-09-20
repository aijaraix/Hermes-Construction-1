# HERMES FND-01 COMPATIBILITY & TEST MATRIX

## Purpose

This matrix exists to prevent FND-01 from accidentally breaking existing spatial/visual behavior while correcting the canonical contracts.

| Current source family | Existing ID | Position convention | Dimension convention | Unit state | Frame state | FND-01 treatment |
|---|---|---|---|---|---|---|
| SpatialEntityRecord | entityId | worldPosition / positionXYZ | dimensions / dimensionsXYZ | documented meters | frameId optional | adapt into canonical entity/pose; preserve raw |
| Genesis site parcel | entityId | local XYZ | dimensionsXYZ | meters | explicit project frame | make frame metadata truthful; keep coordinates |
| House0002 spatial facilities | entityId | local world | legacy dimensions | metric evidence | root frame asserted by diagnostics | explicit legacy dimension adapter |
| HermesLiveHouse facilities | entityId | local world | dimensionsXYZ intended XYZ | effectively meters | frame absent | attach project-frame metadata without moving |
| HermesLiveHouse equipment | equipmentId | worldPosition | dimensionsXYZ | metric by values/clearanceMeters | frame absent | canonical alias + frame metadata |
| HermesLiveHouse material batch | materialBatchId | worldPosition | dimensionsXYZ | metric spatial values; quantity unit separate | frame absent | canonical alias + frame metadata |
| AgentSpatialState | agentId | worldPosition | body/work envelopes | meters | implicit project world | attach frame identity |
| SurveyControlMark | markId | worldPosition | n/a | meters | implicit | attach frame identity |
| BIMComponent | id | geometry.position | geometry.dimensions | **ambiguous** | absent | add explicit geometry unit/frame metadata |
| BimCommandEngine component | id + ifcGlobalId | meter-named inputs | [thickness,height,length] etc | numeric meters, downstream ambiguity | absent | set meter/frame/anchor explicitly |
| Legacy deterministic geometry | component id | uses BIM geometry | assumes [w,h,d] feet | feet | n/a | branch on explicit unit, legacy default only when absent |
| ThreeBIMViewer | comp.id | treats source Y as base datum | [w,h,d] renderer XYZ | renderer units | none | preserve projection behavior |
| BimWorkspaceView | mixed IDs | raw source positions | mixed aliases | source-dependent | none | bounded canonical projection helper only |
| BimRevisionRecord | revisionId | n/a | n/a | n/a | n/a | adapt to ProjectRevision/EntityRevision |
| ModelRevisionRecord | revision string | n/a | n/a | n/a | n/a | retain legacy; no forced deletion |
| HermesWorldEvent | eventId | work locations in payload | n/a | often metric but not typed | absent | optional projectRevision/frame references later in pass |

## Explicit do-not-break invariants

1. Academy House objects do not visually jump.
2. The 12-ft LVL future-constructability proof retains the same geometry and sequence.
3. Existing event order/checkpoints do not change.
4. Existing material/equipment IDs remain usable by task dependencies.
5. Existing component IDs remain usable by clashes and inspector links.
6. Existing renderer can continue consuming raw legacy records during migration.
7. Attempt IDs keep their current meaning and are not renamed into revision IDs.
8. Existing JSON persistence format remains readable.
9. No database is required for FND-01.
10. No IFC import behavior is expanded beyond identity metadata.

## Semantic defects FND-01 must expose or correct

- ambiguous degrees-vs-radians rotation comment;
- quaternion label paired with 3-element rotations;
- geodetic-looking survey origin paired with UTM/local wording;
- dimensions tuple order inconsistency;
- meter-generated BIM consumed by feet-assuming quantity engine;
- pseudo IFC ID represented as if it were a true IFC GlobalId;
- duplicate RobotReadySpatialContract declarations;
- live spatial records without explicit frame identity;
- attempt identity conflated with revision risk;
- renderer-local coordinates lacking explicit projection boundary.

## Deferred deliberately

FND-02:
- evidence / claims / authority

FND-03:
- database persistence

FND-04:
- true IFC normalization, GlobalId reconciliation, model diff

FND-05:
- provider/model routing

HX:
- human-facing display of frame/unit/provenance details
