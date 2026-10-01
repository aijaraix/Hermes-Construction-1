# FND-04 — openBIM normalization and immutable model revision pipeline

Status at package creation: NOT IMPLEMENTED. Prerequisite: preserved and recovered FND-03. Initial historical FND-01/FND-02 prerequisites are rebound to the campaign's verified FND-02 base, then the immediately preceding Accepted checkpoint. Remain on `feature/fnd-01-canonical-identity`.

## Read only these references and relevant current source

- [HERMES_FOUNDATION_HARDENING_MASTER.md](../references/HERMES_FOUNDATION_HARDENING_MASTER.md)
- [HERMES_FND_04_COMPATIBILITY_TEST_MATRIX.md](../references/HERMES_FND_04_COMPATIBILITY_TEST_MATRIX.md)
- [HERMES_FND_04_EXACT_FILE_BY_FILE_CODEX_HANDOFF.md](../references/HERMES_FND_04_EXACT_FILE_BY_FILE_CODEX_HANDOFF.md)
- [HERMES_FND_04_OPENBIM_SERVER_NORMALIZATION_MODEL_REVISION_PIPELINE.md](../references/HERMES_FND_04_OPENBIM_SERVER_NORMALIZATION_MODEL_REVISION_PIPELINE.md)
- [HERMES_FND_04_SOURCE_AUDIT.md](../references/HERMES_FND_04_SOURCE_AUDIT.md)

## Current source-backed delivery boundary

Existing: native BIM commands/revisions, FND01 external identity, reference IFC/semantic fixtures, Three.js projection.
Current browser WebIFC dependency is not proof of parser execution; BimWorkspace lacks demonstrated IfcAPI/OpenModel/StreamAllMeshes path.
Implement bounded server IFC parsing using mature parser, isolated process/worker, size/time limits, controlled temp paths, parser version/failure report. Preserve original bytes/hash as evidence. Normalize semantics then atomically reconcile entities/source revisions.
Exact valid source-context GlobalId or explicit mapping may retain identity; name/type similarity requires review.
Separate original IFC / normalized semantics / render mesh / collision proxy / canonical entity. Preserve removals/history.
Tests: hash, parse, GlobalId, reject synthetic alias, Psets, containment, materials/quantities, stable reimport, no name-only merge, added/removed/property/placement/geometry diff, malformed/timeout/size, artifact linkage, persistence when DB exists, no partial commit after failure.
Browser acceptance: reference/imported model load, select/isolate/hide, section/measurement where supported, identity/frame projection, real parse failure surface, no fake fallback geometry.

## Acceptance and preservation

Execute every applicable focused matrix and required regressions from [acceptance gates](../04_ACCEPTANCE_GATES.md), typecheck/build, and [visual QA](../05_VISUAL_QA_PROTOCOL.md) when relevant. Keep DB/provider/browser gates explicitly separate. Do not call mocked infrastructure physical proof. Record a measured implementation report under `docs/validation/` and update `campaign.json` milestone results before packaging.

Then [checkpoint and recover](../06_CHECKPOINT_AND_RECOVERY_PROTOCOL.md) the exact source. Verify base/child, Forge, immutable Recovery, Accepted Head, archive hash and full-tree closure before proceeding. The current approved campaign supersedes historical per-ticket STOP/new-branch instructions; all technical boundaries and prohibitions remain. Continue only after this stage is durably preserved and required engineering gates pass.
