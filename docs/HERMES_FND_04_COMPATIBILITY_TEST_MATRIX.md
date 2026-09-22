# HERMES FND-04 COMPATIBILITY & TEST MATRIX

## Existing BIM/openBIM systems

| Current area | Current role | Risk/gap | FND-04 treatment |
|---|---|---|---|
| web-ifc browser | IFC WASM parsing/render geometry | browser-only cannot own canonical import truth | keep browser path; add server normalizer |
| That Open packages | BIM UI/components ecosystem | not canonical server truth | preserve; no rewrite |
| ReferenceBimStore JSON | protected semantic reference fixture | HERMES-authored fixture, not arbitrary IFC normalization | preserve read-only/reference role |
| generated TECHNICAL IFC | test geometry proof | derived/generated artifact can be mistaken for source model | classify as HERMES-generated fixture |
| REFERENCE-BIM IFC | protected reference model path | tracked file + initialization side effects | preserve; tests use temp copies |
| BimCommandEngine | native HERMES BIM command/revision path | not IFC import; pseudo/synthetic IFC aliases | preserve; imported IFC uses separate pipeline |
| exportToIfcJson | debug/semantic JSON | name may imply standards IFC export | keep compatibility, clarify semantics |
| BimRevisionRecord | command snapshot revision | not source model revision | preserve; new SourceModelRevision separate |
| FND-01 external identity | stable HERMES identity mapping | must not trust invalid IFC aliases | only validated source GlobalId gets IFC identity |
| FND-02 Evidence/Claim | provenance/promotion | needs import source lineage | IFC artifact/import becomes evidence-backed |
| FND-03 ArtifactStore | immutable artifacts | not yet used for BIM import | source/derived IFC artifacts use it |
| FND-03 PostgreSQL | foundation persistence, not cut over | physically unverified DB | optional integration when test DB exists |
| BimWorkspaceView | persistent visual world | must not become import authority | renderer remains projection |

## Identity rules

| Case | Result |
|---|---|
| same source-context valid IFC GlobalId | exact external identity match |
| same entity with deterministic explicit mapping | deterministic match |
| same name/type only | NOT sufficient |
| invalid/synthetic local alias | not registered as verified IFC GlobalId |
| probable semantic match | review required |
| source element disappears | removed/superseded in source revision; HERMES history preserved |

## Model diff rules

Required change classes:

- ADDED
- REMOVED
- PROPERTY_CHANGED
- PLACEMENT_CHANGED
- GEOMETRY_CHANGED
- RELATIONSHIP_CHANGED
- UNCHANGED
- IDENTITY_REVIEW_REQUIRED

Diff operates on reconciled identity + semantic/geometry fingerprints.

## Geometry truth

| Representation | Authority |
|---|---|
| original IFC bytes | immutable source artifact |
| normalized semantics | server parser result with provenance |
| render mesh | derived projection |
| collision proxy | derived spatial aid |
| canonical HERMES entity | HERMES identity/business state |

No render mesh becomes canonical business truth by itself.

## Failure rules

1. malformed IFC fails closed.
2. oversize IFC rejected before parse.
3. timeout terminates parser worker.
4. parse errors recorded.
5. no partial entity promotion on failed revision.
6. source artifact remains auditable.
7. browser parse failure does not synthesize fake IFC box geometry.

## Extension seams only in FND-04

| Standard | FND-04 scope |
|---|---|
| IFC | implement normalization |
| IDS | interface/seam only |
| BCF | adapter seam only |
| bSDD | classification/dictionary seam only |
| COBie | deferred |
| full MVD engine | deferred |

## Required tests

| ID | Proof |
|---|---|
| IFC-01 | source artifact hash immutable |
| IFC-02 | schema/elements parsed server-side |
| IFC-03 | valid GlobalId external identity |
| IFC-04 | synthetic alias not promoted |
| IFC-05 | Pset preserved |
| IFC-06 | containment preserved |
| IFC-07 | material/quantity preserved where fixture contains it |
| ID-01 | stable HERMES ID across reimport |
| ID-02 | name-only uncertain match does not merge |
| DIFF-01 | added detected |
| DIFF-02 | removed detected |
| DIFF-03 | changed property/placement/geometry detected |
| REV-01 | old source revision immutable |
| FAIL-01 | malformed IFC fails closed |
| FAIL-02 | timeout/size gate |
| ART-01 | normalization report links source artifact/evidence |
| QTY-01 | imported vs deterministic quantity provenance separated |
| PERSIST-01 | Postgres round-trip when DB available |

## Do-not-break invariants

1. FND-01 canonical identity/frame/unit contracts remain intact.
2. FND-02 source/evidence/claim contracts remain intact.
3. FND-03 persistence/artifact contracts remain intact.
4. legacy persistence remains default.
5. Academy House world remains unchanged.
6. current browser reference IFC remains usable.
7. reference model remains read-only.
8. no tracked runtime/reference files changed by tests.
9. no UI redesign.
10. no production DB or object-store cutover.

## Physical verification

Code/tests can establish:

**IMPLEMENTED — NOT PHYSICALLY VERIFIED**

Physical verification additionally requires:

- faithful browser load of reference/imported model;
- selection/section/isolation/measurement smoke check;
- if Postgres acceptance is desired, real Postgres/PostGIS integration run.
