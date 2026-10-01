# FND-04 internal openBIM import pipeline

The normalizer uses pinned `web-ifc 0.0.77` in a child process. It does not implement a STEP parser, execute source code, accept user filesystem paths, start imports automatically, or replace native BIM authoring/reference fixtures. `BimCommandEngine.exportToIfcJson()` remains a compatibility/debug JSON API, not a standards-compliant IFC export.

## Explicit composition

`server/bim/openBim.ts` exports `createOpenBimService(artifactStore, foundationRepository?)`. The build also emits `dist/openBim.cjs` and `dist/ifcWorker.cjs`, so a trusted internal caller can use the service without a TypeScript runner. Retain the pinned runtime dependencies. Run from the application root.

Call `service.import({model, projectRevisionId, bytes, source, realityClass, explicitMappings?})` after the server has resolved project authorization and source rights. No public upload route is exposed by this milestone. The input is copied before asynchronous operations. Model/source/project identity and byte-storage rights must agree. Existing source records are immutable; use a new source record when its attribution, version or rights changes.

Without a foundation repository, the result has `mode: ISOLATED` and `NORMALIZED_ONLY` (or FAILED) status. Immutable original/semantic/report artifacts are written through the provided store, but no canonical entities are promoted. With an explicitly configured FND-03 PostgreSQL repository, the mode is `PERSISTED`; inspect the revision's IMPORTED/FAILED status. PERSISTED does not mean physical acceptance.

## Safety and representation

Default limits are 64 MiB input, 30-second child deadline, 256 MiB JS heap, 256 MiB web-ifc data-memory reservation, 500,000 parsed lines, 100,000 normalized objects and 32 MiB serialized output. These are process/resource bounds, not a claim of an operating-system security sandbox or a universal RSS cap. Parent-configured limits may be lowered; timeout has a 120-second hard ceiling. The generated temp directory is private, contains only input/output, and is removed after child exit. The child receives no provider credentials and is killed on timeout. There are no imported-code or network execution hooks. Large input transport must itself be bounded by any future upload adapter before buffering.

STEP framing, schema/project presence, resolvable relationships, parser success, finite data and output limits are checked. This is not a full IFC conformance/MVD validator. IDS validation, BCF issues and classification dictionaries have interfaces only; no bSDD network access is enabled.

Five distinct representations remain separate:

- Original IFC: immutable bytes, SHA-256 and artifact/evidence metadata.
- Normalized semantics: parser version/schema, source hierarchy, properties, material/type/quantity associations, classifications/groups/connectivity through relationship endpoints, raw extensions and warnings.
- Derived render reference: geometry fingerprint, mesh count and web-ifc transforms; no mesh buffers in canonical entity JSON.
- Collision aid: AABB only, in explicitly labelled **WEB_IFC_RENDER_Y_UP_METERS**, never a verified collision/clearance result. Fixture tests check metre and millimetre source units. Original placements retain source-unit semantics. No Academy/survey transform is fabricated.
- Canonical entity: FND-01 identity and entity revisions, with source revision/evidence links. Source hierarchy gets separate revision-local FND-01 frame identities, with no invented georeferencing or placement transform.

Only a parsed valid compressed IFC GlobalId is registered as an IFC external identity. Identity includes project plus source model. Historical mappings retain identity after removal/reappearance. Duplicate GUIDs are unresolved, invalid aliases remain raw metadata, and name/type similarity gets a fresh review-required identity. Explicit mappings must reference this source model's history and be one-to-one. No cross-model name matching occurs.

Diffs distinguish added, removed, property, placement, geometry, relationships, unchanged and identity review. Removed canonical records receive a historical source-removal revision; no records are deleted. Source quantities are separate `IMPORTED` / `PROPOSED` claims. They neither overwrite deterministic quantities nor imply a verified measurement.

## Persistence and recovery

Apply `0002_openbim.sql` only through the explicit FND-03 migration runner. Never modify already accepted `0001_foundation.sql`. Legacy persistence remains the runtime default. No production cutover or remote object-store activation occurs here.

The original artifact, evidence and IMPORTING revision are recorded before parsing. A private project transaction promotes entities/revisions, mappings, source quantities, frames, diff, `MODEL_IMPORTED` event and source head together. The prior head is checked after acquiring project/model locks. A stale concurrent import fails rather than silently overwriting the new head. Completed source revisions/mappings/diffs are immutable. Failures retain the original and failure report and append `MODEL_IMPORT_FAILED`, with zero committed entities and no head advancement.

The immutable parse-report artifact always says `committedEntityCount: 0`: it proves normalization only. Canonical commit is evidenced separately by the terminal database revision and event. Failed commits may retain normalized artifacts for diagnosis without promoting their entities. A failure to record source/evidence (for example an unavailable database or conflicting immutable source metadata) throws; it does not silently fall back to legacy storage. Infrastructure recovery must inspect IMPORTING records after a crash and explicitly mark them failed or retry under a new revision; no destructive startup reset exists.

PostgreSQL integration and browser/WebGL acceptance remain separate gates. See the measured implementation report.
