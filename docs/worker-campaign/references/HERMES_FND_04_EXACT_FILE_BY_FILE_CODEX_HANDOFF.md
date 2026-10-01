# HERMES FND-04 — EXACT FILE-BY-FILE CODEX IMPLEMENTATION HANDOFF

**Controlling ticket:** `docs/HERMES_FND_04_OPENBIM_SERVER_NORMALIZATION_MODEL_REVISION_PIPELINE.md`

**Required audit:** `docs/HERMES_FND_04_SOURCE_AUDIT.md`

**Required compatibility matrix:** `docs/HERMES_FND_04_COMPATIBILITY_TEST_MATRIX.md`

## Physical prerequisite lineage

FND-01:

`194ad4473d0e8768cd7f1db34d7e1713447153dd`

FND-02:

`67d592381bd66c0bb2aa3d14361bbc5aed904867`

FND-03:

`e478120c9de0489ab9ef48dbf57df1bf15d24398`

FND-04 must be implemented on top of all three.

If FND-03 is unavailable in the Codex workspace, STOP.

Do not implement from old `main`.

---

# FIRST

1. Verify all three prerequisite commits are ancestors of HEAD.
2. Fetch CURRENT remote `main`.
3. Record `git status --short`.
4. Preserve all legitimate newer work.
5. Preserve the existing visual commit `c1acf19`.
6. Preserve the eight runtime-generated modified files exactly.
7. Do not stage/reset/commit those runtime files.
8. Fetch planning branch:
   `planning/hermes-control-layer-2026-09-18`.
9. Read only:
   - FND-04 exact handoff
   - FND-04 source audit
   - FND-04 compatibility matrix
   - FND-04 architecture ticket
   - foundation hardening master

Do not merge planning branch.

---

# OBJECTIVE

Implement FND-04 only:

IMMUTABLE IFC SOURCE ARTIFACT
+
SERVER-SIDE IFC NORMALIZATION
+
NORMALIZED SEMANTIC GRAPH
+
FND-01 CANONICAL ENTITY RECONCILIATION
+
FND-02 EVIDENCE / SOURCE LINEAGE
+
SOURCE MODEL REVISIONS
+
MODEL DIFF
+
DERIVED GEOMETRY REFERENCES
+
FAIL-CLOSED UNTRUSTED IFC PROCESSING

Preserve the existing browser BIM viewer.

Do not redesign the UI.

---

# TECHNOLOGY DECISION

Use a parser abstraction.

Create something equivalent to:

`IfcNormalizer`

The first concrete implementation should prefer the **existing installed `web-ifc` dependency server-side** because it is already part of the repository and avoids unnecessary infrastructure.

Implement it in an isolated worker/process.

Do NOT write a custom IFC STEP parser.

Keep the abstraction open for a future:

`IfcOpenShellNormalizer`

Do not add Python/IfcOpenShell merely to claim compliance unless you can actually install, execute and test it reliably in this environment.

If you determine existing `web-ifc` cannot satisfy the required semantic extraction server-side, STOP and report the exact blocker before adding a heavyweight replacement.

---

# EXISTING BROWSER STACK

Preserve:

- React
- Three.js
- web-ifc browser parsing
- That Open dependencies
- WASM build copying
- current reference-model routes
- selection/render behavior

Browser output remains a visual projection.

Server normalization becomes the canonical import interpretation.

Do not move IFC parsing entirely out of the browser in this pass.

---

# REFERENCE BIM RULE

Keep:

`server/referenceBimStore.ts`

as a protected technical/reference fixture.

Do NOT turn it into the production import service.

Do NOT rewrite:

`data/models/REFERENCE-BIM-0001.json`

`data/models/REFERENCE-BIM-0001.ifc`

`data/models/TECHNICAL-IFC-PROOF-0001.ifc`

as part of normal FND-04 implementation.

If tests need a fixture, copy bytes into a temporary/test artifact location.

Preserve tracked fixture bytes.

---

# SOURCE IFC ARTIFACT

Every imported IFC must first become an immutable artifact through the FND-03 ArtifactStore boundary.

Required metadata:

artifact ID
project ID
source ID
object key / URI
SHA-256
size
MIME/type
project revision context
rights/access class
created time
immutable=true

Never normalize directly from an arbitrary user filesystem path.

The immutable artifact/hash is the import source of record.

---

# SOURCE MODEL TYPES

Add narrow canonical types, names may vary:

`SourceModel`

`SourceModelRevision`

`NormalizedIfcEntity`

`IfcNormalizationReport`

`IfcReconciliationResult`

`ModelRevisionDiff`

Minimum SourceModelRevision:

- source model ID
- project ID
- artifact ID
- revision ID
- source hash
- imported at
- IFC schema
- parser implementation
- parser version
- normalization status
- entity count
- warnings/errors
- prior revision ID optional
- project revision relation
- evidence ID

Do not overload BimCommandEngine revision snapshots.

---

# NORMALIZED IFC ENTITY

Extract at minimum when present:

- expressID
- validated IFC GlobalId
- IFC type
- name
- description
- object/type relationship
- storey/spatial containment
- space containment
- property sets
- material associations
- quantity sets
- classifications
- groups/systems
- connectivity references where accessible
- local placement / transform
- geometry fingerprint/reference
- source artifact ID
- source model revision ID

Keep unknown properties in structured extensions.

Do not discard unsupported IFC properties silently.

Record parse warnings for unsupported concepts.

---

# IFC GLOBALID TRUTH

Only a parsed, validated IFC GlobalId from the imported IFC may be registered as external identity:

system = IFC

Do NOT convert legacy synthetic aliases into IFC GlobalIds.

Do NOT rewrite historical synthetic fields.

If validation fails:

- preserve the raw source value as source metadata;
- do not classify it as verified IFC external identity.

---

# ENTITY RECONCILIATION

Map normalized IFC elements to FND-01 canonical ConstructionEntity identity.

Required reconciliation states:

EXACT_EXTERNAL_ID

DETERMINISTIC_MATCH

PROBABLE_REVIEW_REQUIRED

NEW_ENTITY

REMOVED_OR_SUPERSEDED

UNRESOLVED

Priority:

1. existing exact source-context IFC external identity
2. deterministic mapping rules
3. otherwise review/new/unresolved

Do not match solely on name.

Do not silently merge uncertain entities.

==================================================
SOURCE CONTEXT / FEDERATION
==================================================

Do not assume one IFC GlobalId is globally unique across all unrelated source models.

External identity lookup must respect the actual FND-01/FND-03 project/source context.

Preserve model federation capability.

---

# REVISION IMPORT FLOW

Required flow:

```text
IFC BYTES
↓
ArtifactStore immutable source artifact
↓
Source/Evidence record
↓
SourceModelRevision = IMPORTING
↓
isolated parser
↓
normalized entity set
↓
identity reconciliation
↓
semantic/geometry fingerprints
↓
diff against prior source model revision
↓
atomic persistence
↓
MODEL_IMPORTED event
```

If normalization fails:

- no partial canonical entity promotion
- source artifact remains
- failed SourceModelRevision remains auditable
- failure Evidence/report remains
- emit/import failure event if current event contract supports it

---

# MODEL DIFF

Produce deterministic diff categories:

ADDED

REMOVED

PROPERTY_CHANGED

PLACEMENT_CHANGED

GEOMETRY_CHANGED

RELATIONSHIP_CHANGED

UNCHANGED

IDENTITY_REVIEW_REQUIRED

One entity may have more than one change flag.

Store fingerprints/hashes sufficient to reproduce the classification.

Do not rely only on entity counts.

---

# PROPERTIES / MATERIALS / QUANTITIES

Properties:

extract property sets without hardcoding only Pset_* names.

Materials:

extract IFC material associations where available.

Quantities:

extract source quantity sets when present.

Imported quantity is a source claim.

It must not silently replace deterministic HERMES quantity.

If both exist, preserve both with distinct provenance.

Do not redesign BOM/cost here.

---

# SPATIAL HIERARCHY

Normalize:

IfcProject
IfcSite
IfcBuilding
IfcBuildingStorey
IfcSpace

and containment relationships when present.

Map source placements into FND-01 frame/transform contracts.

Do not assign fake geographic CRS to local IFC coordinates.

If IFC georeferencing exists and parser exposes it, preserve it as source metadata/evidence.

Do not build full GIS transformation in FND-04.

---

# GEOMETRY REPRESENTATIONS

Maintain separation:

SOURCE IFC:
immutable exact source artifact.

SEMANTIC:
placement, dimensions/bounds, openings/relations as extracted.

RENDER:
derived browser/server render geometry artifact/reference.

COLLISION:
simplified proxy/bounds/reference for future spatial reasoning.

FND-04 does not need a production collision engine.

At minimum create the artifact/reference contracts and a deterministic broad-phase bounds/proxy where safely derivable.

Do not force mesh bytes into canonical entity JSON.

---

# SERVER PARSER ISOLATION

Imported IFC is untrusted input.

Do not parse in the Express request event loop.

Use:

worker thread
OR
child process

with:

- maximum input size
- timeout
- temp directory
- controlled input artifact
- parser process termination
- memory-safe bounded configuration where available
- warning/error capture
- cleanup
- no arbitrary filesystem paths
- parser version in report

Recommended env/config:

HERMES_IFC_MAX_BYTES

HERMES_IFC_PARSE_TIMEOUT_MS

Use conservative defaults.

---

# NORMALIZATION ATOMICITY

A source revision must not partially mutate canonical project truth.

Perform parse/reconciliation/diff first.

Commit normalized model revision/entity mapping together through FND-03 transaction/repository boundaries where database driver supports it.

In legacy mode, keep normalization result isolated from live canonical world unless explicit import/commit method is called.

Do not auto-import reference IFC during application startup.

---

# FND-03 PERSISTENCE EXTENSION

If narrow migration extension is appropriate, add a new ordered migration, e.g.:

`0002_openbim.sql`

Possible tables:

source_models

source_model_revisions

model_entity_mappings

model_revision_diffs

Do not edit the checksum/content of already-applied:

`0001_foundation.sql`

Migration 0001 is immutable.

Do not create redundant entity/source/evidence tables already owned by FND-03.

---

# ARTIFACT REFERENCES

Use FND-03 artifacts for:

- original IFC
- normalization report JSON
- derived render geometry if produced
- collision proxy if produced

Do not require full derived mesh generation if that widens scope.

A fingerprint/reference is sufficient for acceptance if browser rendering remains unchanged.

---

# API/SERVICE BOUNDARY

Implement a service method first.

If adding HTTP endpoints, keep them narrow/internal.

Potential:

POST /api/bim/import

GET /api/bim/import/:revisionId

GET /api/bim/model-diff/:revisionId

Do NOT build upload UI.

Do NOT expose arbitrary filesystem path import.

If multipart upload infrastructure is absent, unit/service tests may call the import service directly using fixture bytes.

Do not add a large upload framework just for FND-04.

---

# IDS / BCF / bSDD

Do NOT fully implement them.

Add extension seams/interfaces only.

Examples:

`InformationRequirementValidator`

`IssueExchangeAdapter`

`ClassificationDictionaryAdapter`

No live network dependency is required.

No BCF ZIP implementation required.

No bSDD API call required.

No full IDS parser required.

---

# BimCommandEngine COMPATIBILITY

Preserve native HERMES BIM command behavior.

Do not make imported IFC own BimCommandEngine.

Clarify/debug-label:

`exportToIfcJson()`

as a JSON/debug representation, not standards-compliant IFC STEP export.

Do not rename public APIs incompatibly unless an alias is retained.

---

# BROWSER REGRESSION

Do not remove current reference IFC browser path.

Do not reintroduce synthetic source-IFC BoxGeometry fallback.

Imported/reference IFC parse failure must remain visible/fail-closed.

HERMES-native canonical objects may still use procedural geometry.

Do not change current Academy House visual coordinates.

---

# REQUIRED TEST FIXTURES

Create bounded test IFC fixtures under a test-fixture location, not runtime state.

Prefer very small text IFC files checked into source only if license/ownership is clear and they are HERMES-authored test fixtures.

Required fixture pair:

REV-A:
- small valid IFC
- at least project/site/building/storey
- at least 2-3 elements
- valid IFC GlobalIds
- property set
- material or quantity relation where practical

REV-B:
- same stable GlobalId for one modified element
- one new element
- one removed element
- one property or placement change

Also create one malformed IFC fixture.

No copyrighted third-party model required.

---

# TESTS

Create focused FND-04 tests, e.g.:

`server/__tests__/fnd04_openbim_normalization.test.ts`

Required:

### IFC-01
source IFC SHA-256 is preserved as immutable artifact metadata.

### IFC-02
server parser extracts schema + element identities.

### IFC-03
valid source IFC GlobalId maps to IFC external identity.

### IFC-04
synthetic/invalid IFC alias is not promoted to valid IFC GlobalId.

### IFC-05
property set survives normalization.

### IFC-06
spatial containment survives normalization.

### IFC-07
material/quantity source data survives when present.

### ID-01
reimport with same valid IFC GlobalId retains HERMES entity ID.

### ID-02
uncertain/no-ID match does not silently merge by name.

### DIFF-01
added element detected.

### DIFF-02
removed element detected.

### DIFF-03
property/placement/geometry change detected.

### REV-01
prior source model revision remains immutable.

### FAIL-01
malformed IFC fails closed and records normalization failure.

### FAIL-02
parse timeout/size gate returns bounded failure.

### ART-01
derived normalization report references source artifact/evidence.

### QTY-01
imported quantity and HERMES deterministic quantity remain separate provenance channels.

### PERSIST-01
when postgres test DB available, source model revision/mapping/diff round-trip.

---

# POSTGRES INTEGRATION

Use existing FND-03:

`HERMES_TEST_DATABASE_URL`

If unavailable:

report:

NOT RUN — DATABASE UNAVAILABLE

Do not fake DB acceptance.

If available, apply:

0001_foundation.sql
+
0002_openbim.sql

and verify persistence.

Do not cut runtime over to postgres.

---

# REGRESSION

Run:

FND-04 tests

FND-03 tests

FND-02 tests

FND-01 tests

Academy House vertical slice

Phase-1 visual-gate regression

existing BIM Stage-C/proof tests relevant to changed code

TypeScript typecheck

production build

Browser physical verification only if browser runtime is available.

Do not call it physically verified without that evidence.

---

# RUNTIME FILE PROTECTION

Preserve the eight existing runtime-generated modified files exactly.

Also do not rewrite tracked reference model files during tests.

If current `ReferenceBimStore.initialize()` writes technical IFC as a side effect during tests, ensure FND-04 tests operate on temporary paths or restore exact pre-test local bytes.

Do not reset to remote/main if local runtime bytes differ.

---

# BRANCH

Create:

`feature/hermes-fnd-04-openbim-normalization`

from FND-03 commit:

`e478120c9de0489ab9ef48dbf57df1bf15d24398`

History must include FND-01/FND-02/FND-03.

Do not merge to main.

---

# NON-GOALS

DO NOT:

- rewrite React/Three.js
- replace browser web-ifc
- build custom IFC parser
- implement Revit authoring
- implement exact CAD authoring
- implement full IDS
- implement full BCF
- implement live bSDD
- implement full clash engine
- implement FND-05
- implement HX work
- cut over PostgreSQL
- deploy S3
- migrate historical IFC/reference files
- rewrite Academy House geometry
- change visual coordinates

---

# FINAL REPORT

Return:

```text
FND04_COMPLETE

CURRENT_REMOTE_MAIN:
FND01_COMMIT:
FND02_COMMIT:
FND03_COMMIT:
IMPLEMENTATION_BRANCH:
IMPLEMENTATION_COMMIT:

FILES_CHANGED:

IFC_NORMALIZER:
PARSER_IMPLEMENTATION:
PARSER_ISOLATION:
SOURCE_ARTIFACT_FLOW:
SOURCE_MODEL_REVISION:
ENTITY_RECONCILIATION:
MODEL_DIFF:
GEOMETRY_ARTIFACTS:
IDS_BCF_BSDD_SEAMS:

MIGRATION:
POSTGRES_INTEGRATION:

FND04_TESTS:
FND03_REGRESSION:
FND02_REGRESSION:
FND01_REGRESSION:
ACADEMY_HOUSE:
VISUAL_GATE:
BIM_REGRESSION:
TYPECHECK:
BUILD:

RUNTIME_FILES:
REFERENCE_MODEL_FILES_TOUCHED:

KNOWN_REMAINING_OPENBIM_GAPS:

PHYSICAL_BROWSER_VERIFICATION:

TRUTH_LABEL:
IMPLEMENTED — NOT PHYSICALLY VERIFIED
```

STOP after FND-04.
