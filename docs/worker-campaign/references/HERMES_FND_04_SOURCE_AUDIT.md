# HERMES FND-04 SOURCE AUDIT — openBIM SERVER NORMALIZATION / MODEL REVISION PIPELINE

**Audit basis:** remote `main` at `bbc90702a7d62a0092dc2dd914901743c23ec8b5`, plus completed local foundation lineage:

- FND-01 `194ad4473d0e8768cd7f1db34d7e1713447153dd`
- FND-02 `67d592381bd66c0bb2aa3d14361bbc5aed904867`
- FND-03 `e478120c9de0489ab9ef48dbf57df1bf15d24398`

**Important limitation:** those implementation branches are local to the Codex workspace and are not visible through this GitHub connector. FND-04 must preserve their implemented contracts exactly.

## Executive finding

HERMES already has a meaningful browser BIM stack:

- React + Three.js
- `web-ifc`
- That Open Components/UI dependencies
- IFC WASM copied into the public build
- a reference IFC route
- browser parse diagnostics
- BIM command/revision prototypes
- reference-model semantic JSON
- existing Stage-2 IFC geometry audit history

But the current system still conflates at least four different things:

1. **reference fixture JSON**
2. **generated technical IFC fixtures**
3. **browser-rendered IFC geometry**
4. **canonical HERMES BIM/project objects**

FND-04 should establish a server-side import/normalization pipeline that makes these boundaries explicit.

The correct implementation is not a frontend rewrite and not a custom IFC parser.

---

# 1. Browser IFC support already exists and should remain

Current package dependencies include:

- `web-ifc ^0.0.77`
- `@thatopen/components ^3.4.8`
- `@thatopen/ui ^3.4.10`
- Three.js

The build copies `web-ifc` WASM into `public/wasm`.

`BimWorkspaceView.tsx` contains browser IFC parsing state such as:

- `ifcLoaded`
- `ifcParseError`

Historical Stage-2 diagnostics describe:

- fetching `/api/bim/reference-model.ifc`
- `OpenModel`
- `StreamAllMeshes`
- `GetGeometry`
- attaching real parsed geometry to the Three.js scene

This browser path is useful and should not be replaced.

FND-04 should preserve it as a **render/interaction projection**.

---

# 2. That Open is installed but is not the canonical semantic backend

That Open dependencies are present, but the source audit does not show them acting as the canonical server-side source of project semantics.

Therefore FND-04 should not assume That Open currently owns:

- canonical object identity;
- revisions;
- evidence;
- source-model lineage;
- model diffs.

Those belong to FND-01/FND-02/FND-03 contracts.

---

# 3. ReferenceBimStore is a fixture generator, not a production IFC import pipeline

`server/referenceBimStore.ts` currently:

- owns a hand-built `ReferenceBimProject` JSON model;
- stores it at `data/models/REFERENCE-BIM-0001.json`;
- generates IFC STEP text programmatically;
- writes `TECHNICAL-IFC-PROOF-0001.ifc`;
- may copy `Duplex.ifc` into the reference path if present;
- performs reload integrity checks against its own JSON representation.

This is useful for technical proof and UI/reference behavior.

It is not production import normalization because:

- the semantic JSON is authored by HERMES rather than extracted from an arbitrary IFC;
- IFC generation is local fixture generation;
- reload integrity compares HERMES JSON to itself, not arbitrary IFC parse/reimport lineage;
- no immutable import artifact revision/evidence chain exists;
- no canonical FND-01 entity reconciliation occurs.

## FND-04 treatment

Keep `ReferenceBimStore` as a legacy/reference fixture.

Do not promote it into the new import pipeline.

Do not mutate its tracked IFC/JSON files during tests unless the existing test explicitly owns a temporary copy.

---

# 4. Generated technical IFC is not equivalent to source IFC

`ReferenceBimStore.generateStandardIfcStepFile()` creates a technical proof model.

The IFC header identifies web-ifc / IfcOpenShell engine language, but the repository does not currently contain an IfcOpenShell runtime dependency or a server IfcOpenShell worker.

Therefore FND-04 must not claim IfcOpenShell processing unless it is actually implemented.

The generated technical IFC should be classified as:

**HERMES-generated test/derived artifact**

not:

**external immutable source model**.

---

# 5. Current reference IFC GUIDs are frequently synthetic/non-standard

The reference JSON includes identifiers such as:

- `1a111111-2222-3333-4444-555555555501`
- `0f8A1_B2_FoundationStorey`

These are not reliably valid IFC compressed 22-character GlobalIds.

`BimCommandEngine` historically generated aliases such as:

`WALL-<timestamp>-<counter>`

FND-01 already repaired the truth labeling around these locally generated aliases.

## FND-04 rule

Only an identifier parsed from a real IFC `GlobalId` field and validated as a valid IFC GlobalId should be registered as an external identity with system `IFC`.

Synthetic fixture/local aliases must remain separately classified.

Do not rewrite historical fixture IDs.

---

# 6. Browser fallback/synthetic geometry history requires a hard boundary

The Stage-2 audit records a prior defect where JSON bounding boxes were rendered as synthetic Three.js boxes instead of real IFC geometry.

Later work reportedly removed the synthetic fallback for the protected reference model and required parse failure to be explicit.

However the wider HERMES world still legitimately renders HERMES-native components from canonical geometry.

Therefore FND-04 must distinguish:

### Imported IFC render geometry

Must derive from the IFC normalization/render pipeline.

### HERMES-native construction geometry

May be generated from canonical HERMES semantic geometry.

Do not ban all procedural Three.js geometry globally.

Do not allow an imported IFC object to silently fall back to a box while claiming it represents source IFC geometry.

---

# 7. BimCommandEngine is a native HERMES authoring/proof path

`server/bimCommandEngine.ts` already provides:

- project-local component creation;
- revision snapshots;
- IFC-like type labels;
- external/synthetic ID fields;
- in-memory canonical component store;
- `exportToIfcJson()`.

This is not an IFC import engine.

Its `exportToIfcJson()` is JSON describing IFC-like entities, not a standards-compliant IFC STEP export.

## FND-04 rule

Do not rename or present `exportToIfcJson()` as a standards-compliant IFC file export.

Keep it as a compatibility/debug export until a real export adapter exists.

---

# 8. Revision support already exists but is not source-model revisioning

`BimCommandEngine` has `BimRevisionRecord` snapshots and per-project revision history.

FND-01/FND-03 now provide stronger project/entity revision and persistence contracts.

FND-04 needs a separate source-model import revision concept:

- source artifact ID/hash
- source model revision ID
- import timestamp
- IFC schema/version
- parser version
- normalized entity set
- identity reconciliation result
- diff from prior source model revision
- validation report
- derived artifact references

Do not overload old command revisions to mean imported-model revisions.

---

# 9. Current API serves raw IFC but has no import endpoint

`server.ts` serves:

- `/api/bim/reference-model`
- `/api/bim/reference-model.ifc`
- revision/proof routes
- BIM command routes

The audit did not find a general authenticated/bounded endpoint for:

- uploading/importing arbitrary IFC;
- registering immutable source artifact;
- server normalization;
- import status;
- revision diff.

FND-04 should add a narrow internal/service-level import pipeline first.

A public production upload UI is not required.

---

# 10. No server-side parser dependency is currently established

Current production dependencies include `web-ifc`, which can be reused for server-side normalization in Node/WASM if practical.

The repository does not currently include an IfcOpenShell Python dependency.

## Recommendation

For the minimum FND-04 pass:

1. introduce an `IfcNormalizer` abstraction;
2. implement a bounded server-side normalizer using the existing `web-ifc` package in an isolated worker/process;
3. keep the abstraction compatible with a future IfcOpenShell adapter;
4. do not add Python/IfcOpenShell merely to satisfy an architecture diagram unless the Codex environment can install and test it cleanly.

This minimizes new infrastructure while achieving the server-authoritative boundary.

IfcOpenShell can be added later where exact semantic/export capabilities justify it.

---

# 11. Imported IFC must become evidence-backed source input

FND-02 requires source/evidence/claim truth.

FND-03 now provides artifact metadata and persistence boundaries.

FND-04 should use those contracts:

```text
source IFC bytes
→ immutable Artifact
→ Evidence
→ SourceModelRevision
→ parse/normalize
→ canonical entity reconciliation
→ import event
```

The source IFC bytes must never be overwritten.

Derived artifacts must have their own IDs/hashes and reference the source revision.

---

# 12. Required normalized semantic representation

The normalization result should capture at minimum:

- IFC schema/version
- express ID
- GlobalId if valid
- IFC entity type
- name/description where available
- spatial containment
- type relationship
- property sets
- material associations
- quantities if present
- classification associations where present
- system/group relationships where present
- connectivity references where accessible
- placement/transform
- source geometry reference / geometry bounds
- source artifact/revision provenance

Do not force every IFC concept into a bespoke HERMES field in FND-04.

Preserve unknown/source-specific properties as structured extensions.

---

# 13. Canonical HERMES mapping

Imported IFC entities should reconcile to FND-01 `ConstructionEntity`.

Identity priority:

1. existing exact external identity mapping for valid IFC GlobalId + source context;
2. deterministic source-revision mapping when known;
3. deterministic semantic match only where rules are explicit and high confidence;
4. otherwise review-required/new/unresolved.

Never invent identity continuity just because two elements have the same name/type.

Recommended reconciliation enum:

- EXACT_EXTERNAL_ID
- DETERMINISTIC_MATCH
- PROBABLE_REVIEW_REQUIRED
- NEW_ENTITY
- REMOVED_OR_SUPERSEDED
- UNRESOLVED

---

# 14. Federation/source context matters

The same IFC GlobalId should not be assumed globally unique across every unrelated source ecosystem without source/project context.

External identity uniqueness should include appropriate:

- project
- source artifact/model
- IFC GlobalId/system

according to the FND-01/FND-03 implemented external identity schema.

Do not collapse federated models incorrectly.

---

# 15. Model diff needs semantic and geometry layers

FND-04 diff should distinguish:

### Added
new normalized source element.

### Removed
previous source element absent in new revision.

### Changed properties
same reconciled HERMES entity; property set/material/classification changed.

### Changed placement/geometry
same reconciled HERMES entity; placement or geometry fingerprint changed.

### Unchanged
same semantic/geometry fingerprints.

### Identity uncertainty
probable/unresolved match requiring review.

A simple component-count delta is not enough.

---

# 16. Geometry separation

FND-04 must preserve the research architecture:

- source/exact IFC artifact
- semantic geometry/placement
- render geometry
- collision/spatial proxy

The source audit shows current browser web-ifc can create mesh geometry.

FND-04 should create references/fingerprints for derived geometry rather than force all mesh bytes into canonical entity records.

FND-03 ArtifactStore is the correct future owner for derived geometry artifacts.

---

# 17. Quantities

Current HERMES quantity engines derive quantities from HERMES component geometry.

IFC may also contain `IfcElementQuantity` / quantity sets.

FND-04 should:

- extract source-provided quantities when present;
- label them as imported source claims/evidence;
- keep deterministic HERMES quantities separate;
- never silently overwrite deterministic quantities with imported values;
- allow later comparison/reconciliation.

Do not redesign cost/BOM in this ticket.

---

# 18. IDS / BCF / bSDD

The source audit found no current first-class IDS, BCF or bSDD implementation.

FND-04 should only create extension interfaces/registries.

Recommended:

- `InformationRequirementValidator` interface for future IDS;
- BCF external identity/issue adapter seam;
- classification/dictionary reference seam for bSDD.

Do not implement full IDS XML, BCF zip workflows or bSDD network integration in this pass.

---

# 19. Worker/process safety

Imported IFC is untrusted input.

The parser must not run unbounded in the main request loop.

Minimum:

- maximum file size;
- parser timeout;
- isolated worker thread/child process;
- controlled temp directory;
- no arbitrary path access;
- parser version recorded;
- parse warnings/errors captured;
- process termination on timeout;
- no execution of source-provided code;
- cleanup of temp derived files;
- fail-closed status.

Do not parse arbitrary user file paths supplied directly by request.

---

# 20. Failure evidence

A failed import is still an auditable event/evidence record.

Record:

- source artifact hash
- parser implementation/version
- start/completion/failure time
- failure category
- warnings/errors
- whether any normalized entities were committed

Recommended rule:

**normalization commit is atomic.**

Do not partially promote half-parsed elements into canonical project truth unless the import explicitly supports partial status and review.

Minimum FND-04 should fail the revision atomically.

---

# 21. FND-03 persistence integration

FND-04 should persist through the new FND-03 repositories when postgres mode is explicitly enabled.

Legacy mode must remain usable.

Do not make FND-04 the PostgreSQL production cutover.

If FND-03 PostgreSQL integration remains physically unverified, FND-04 can still unit-test normalization and repository contracts.

---

# 22. Reference model should remain read-only fixture

`REFERENCE-BIM-0001` is currently treated as a protected/read-only reference project in parts of the UI.

Preserve that behavior.

Do not import it into the live project automatically.

A bounded copy of a small IFC fixture may be used for FND-04 tests.

---

# 23. Browser acceptance

FND-04 must not break:

- current reference IFC load;
- current Academy House world;
- selection;
- isolation;
- section/measurement behavior already working;
- canonical-to-render FND-01 projection.

No visual redesign.

Physical browser verification is separate from unit/build success.

---

# 24. Main implementation areas

Expected new modules:

- `server/bim/IfcNormalizer.ts`
- `server/bim/WebIfcServerNormalizer.ts`
- `server/bim/ifcWorker.ts` or isolated child-process equivalent
- `server/bim/modelImportService.ts`
- `server/bim/modelReconciliation.ts`
- `server/bim/modelDiff.ts`

Potential types:

- source model revision
- normalized IFC entity
- normalization report
- reconciliation result
- model diff

Potential persistence/migration extension:

- source_models
- source_model_revisions
- model_entity_mappings
- model_diffs

Only add tables if FND-03 repository/migration structure makes this narrow and safe.

---

# 25. FND-04 conclusion

The correct pass is:

1. keep browser IFC rendering;
2. add server normalization using a mature existing parser;
3. make imported IFC an immutable evidence-backed artifact;
4. map source identities to stable HERMES entities;
5. version imports;
6. diff revisions;
7. keep source/render/collision representations separate;
8. fail closed on invalid/untrusted input;
9. prepare but do not fully implement IDS/BCF/bSDD.

This is an interoperability hardening pass, not a BIM-authoring rewrite.
