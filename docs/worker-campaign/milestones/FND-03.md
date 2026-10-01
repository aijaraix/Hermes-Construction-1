# FND-03 — Production persistence, PostgreSQL/PostGIS and artifact storage

Status at package creation: NOT IMPLEMENTED. Prerequisite: preserved and recovered CAMPAIGN-DOCS. Initial historical FND-01/FND-02 prerequisites are rebound to the campaign's verified FND-02 base, then the immediately preceding Accepted checkpoint. Remain on `feature/fnd-01-canonical-identity`.

## Read only these references and relevant current source

- [HERMES_FOUNDATION_HARDENING_MASTER.md](../references/HERMES_FOUNDATION_HARDENING_MASTER.md)
- [HERMES_FND_03_COMPATIBILITY_TEST_MATRIX.md](../references/HERMES_FND_03_COMPATIBILITY_TEST_MATRIX.md)
- [HERMES_FND_03_EXACT_FILE_BY_FILE_CODEX_HANDOFF.md](../references/HERMES_FND_03_EXACT_FILE_BY_FILE_CODEX_HANDOFF.md)
- [HERMES_FND_03_PRODUCTION_PERSISTENCE_POSTGRES_POSTGIS_OBJECT_STORAGE.md](../references/HERMES_FND_03_PRODUCTION_PERSISTENCE_POSTGRES_POSTGIS_OBJECT_STORAGE.md)
- [HERMES_FND_03_SOURCE_AUDIT.md](../references/HERMES_FND_03_SOURCE_AUDIT.md)

## Current source-backed delivery boundary

Existing: sql.js/JSON/local files + FND01/FND02 contracts.
Missing: canonical persistence repositories, ordered PostgreSQL migrations, PostGIS boundary, ArtifactStore.
Critical risks: persistenceStore.ts and learningPersistence.ts both write data/db/hermes_store.json with incompatible schemas; SQLite uses INSERT OR REPLACE and malformed-DB unlink paths.
Implement additive repository interfaces and local artifact adapter first; legacy default remains. Explicit postgres selection must fail closed, no automatic fallback/dual-write.
Event retries: identical content idempotent; changed content same ID conflicts. Claim transition+promotion event atomic. Artifact hash/immutability/traversal/project/rights metadata.
Do not assign fake geographic SRID to local XYZ.
Actual DB migration/round-trip acceptance only with explicitly supplied HERMES_TEST_DATABASE_URL/PostGIS; otherwise report NOT RUN — DATABASE UNAVAILABLE. Never substitute SQLite.
No production cutover/bulk ambiguous JSON import.

## Acceptance and preservation

Execute every applicable focused matrix and required regressions from [acceptance gates](../04_ACCEPTANCE_GATES.md), typecheck/build, and [visual QA](../05_VISUAL_QA_PROTOCOL.md) when relevant. Keep DB/provider/browser gates explicitly separate. Do not call mocked infrastructure physical proof. Record a measured implementation report under `docs/validation/` and update `campaign.json` milestone results before packaging.

Then [checkpoint and recover](../06_CHECKPOINT_AND_RECOVERY_PROTOCOL.md) the exact source. Verify base/child, Forge, immutable Recovery, Accepted Head, archive hash and full-tree closure before proceeding. The current approved campaign supersedes historical per-ticket STOP/new-branch instructions; all technical boundaries and prohibitions remain. Continue only after this stage is durably preserved and required engineering gates pass.
