# HERMES FND-03 — EXACT FILE-BY-FILE CODEX IMPLEMENTATION HANDOFF

**Controlling ticket:** `docs/HERMES_FND_03_PRODUCTION_PERSISTENCE_POSTGRES_POSTGIS_OBJECT_STORAGE.md`

**Required audit:** `docs/HERMES_FND_03_SOURCE_AUDIT.md`

**Required compatibility matrix:** `docs/HERMES_FND_03_COMPATIBILITY_TEST_MATRIX.md`

## Physical prerequisite

FND-01 commit:

`194ad4473d0e8768cd7f1db34d7e1713447153dd`

FND-02 commit:

`67d592381bd66c0bb2aa3d14361bbc5aed904867`

FND-03 MUST be implemented on top of both commits.

Expected lineage currently exists locally on:

`feature/hermes-fnd-01-canonical-foundation`

If those commits are unavailable, STOP.

Do not implement from old remote `main`.

---

# FIRST

1. Fetch CURRENT remote `main`.
2. Verify both prerequisite commits are ancestors of the worktree.
3. Preserve legitimate newer work.
4. Preserve local visual commit `c1acf19` where present.
5. Inspect `git status`.
6. Preserve all eight runtime-generated modified files.
7. Do NOT reset, add, commit or rewrite those files.
8. Fetch planning branch:
   `planning/hermes-control-layer-2026-09-18`.
9. Read only the four FND-03 control documents listed above plus the foundation master.

Do not merge the planning branch.

---

# OBJECTIVE

Introduce the first production persistence boundary for HERMES:

- canonical persistence interfaces;
- PostgreSQL connection/repository;
- PostGIS-ready foundation schema;
- append-only event storage;
- FND-01 identity/revision/frame storage;
- FND-02 source/evidence/claim storage;
- artifact metadata + object-storage abstraction;
- local artifact-store adapter;
- legacy JSON/sql.js compatibility adapters;
- non-destructive migration/cutover mode.

Do NOT switch production/runtime default away from the current legacy path in this pass.

---

# CRITICAL SOURCE DEFECT TO ACCOUNT FOR

Two existing modules write incompatible root schemas to the same file:

`data/db/hermes_store.json`

Writers:

`server/persistence/persistenceStore.ts`

and

`server/persistence/learningPersistence.ts`

Do NOT bulk import or treat this file as one coherent schema.

Do not attempt to repair the runtime file.

Preserve both legacy producers through explicit adapters.

---

# 1. Package dependency

Add the minimal PostgreSQL driver if absent:

`pg`

and its types as needed.

Do not introduce a heavy ORM unless there is an already established repository dependency that clearly reduces code.

Preferred implementation:

- `pg.Pool`
- ordered SQL migration files
- narrow repository classes

Do not add Kafka, Redis, graph DB or a service framework.

---

# 2. New persistence contracts

Create a narrow canonical persistence module, preferably:

`server/persistence/contracts.ts`

or equivalent.

Define interfaces around FND-01/FND-02 contracts, not old monolithic app state.

At minimum:

```ts
ProjectRepository
EntityRepository
EventRepository
EvidenceRepository
ArtifactMetadataRepository
ArtifactStore
```

Exact interface split may be adjusted for coherence.

Required operations should cover only the acceptance scenarios.

Examples:

### ProjectRepository

- create/get project
- add/get project revision

### EntityRepository

- upsert stable entity identity
- append immutable entity revision
- attach external identity
- read current + historical revisions

### EventRepository

- append event
- list events by project
- get event by ID

No update/delete in normal event API.

### EvidenceRepository

- create/get Source
- create/get Evidence
- create Claim
- supersede/promote Claim according to FND-02 state contract
- query claims by subject

### ArtifactMetadataRepository

- create/read artifact metadata

### ArtifactStore

- put
- stat
- exists
- get read reference/path
- delete only when explicitly allowed

Do not expose SQL from domain callers.

---

# 3. New PostgreSQL connection module

Create:

`server/persistence/postgres.ts`

or equivalent.

Requirements:

- `pg.Pool`
- `DATABASE_URL`
- optional explicit SSL config
- no hardcoded credentials
- no secret logging
- health-check method
- graceful close
- clear unavailable/configuration error

Do not silently fall back to SQLite if driver is configured as postgres.

---

# 4. Persistence driver configuration

Introduce an explicit selector, e.g.:

`HERMES_PERSISTENCE_DRIVER=legacy|postgres`

During FND-03:

- default = legacy unless existing config dictates otherwise;
- tests may explicitly select postgres;
- presence of DATABASE_URL alone must not silently change runtime ownership.

The factory should live in a narrow module such as:

`server/persistence/index.ts`

or `persistenceFactory.ts`.

---

# 5. SQL migrations

Create:

`server/persistence/migrations/`

Start with:

`0001_foundation.sql`

Add a minimal migration runner/schema-version table.

The initial schema should implement only the foundation needed now.

Required tables:

```text
schema_migrations

organizations
projects
project_revisions

entities
entity_revisions
external_identities

spatial_frames
spatial_transforms

events

sources
evidence
claims

artifacts
```

Optional:

`relationships`

only if directly required by the FND-01 entity contract.

Do not implement the entire future schema.

---

# 6. Tenant columns

Foundation rows must support tenant/project isolation.

At minimum:

`organization_id`

on project ownership and enough downstream FK structure to scope data through project.

Use real foreign keys.

Do not create a fake tenant string buried only inside JSONB.

For current Academy/test fixtures, provide a deterministic development organization such as:

`ORG-HERMES-ACADEMY`

through fixture/bootstrap code, not through UI.

---

# 7. Project/revision tables

Persist FND-01 canonical IDs.

Projects:

- project_id
- organization_id
- name/status minimally
- current_revision_id nullable during bootstrap
- created_at
- updated_at

Project revisions:

- revision_id
- project_id
- revision index/version
- supersedes_revision_id
- valid_from / valid_to if contract has them
- recorded_at
- source/event reference if available
- payload/extensions JSONB if necessary

Historical revisions must not be overwritten.

---

# 8. Entity tables

Entities:

- entity_id
- project_id
- entity_class
- name
- current_revision_id
- created_at

Entity revisions:

- entity_revision_id
- entity_id
- project_revision_id
- revision number/index where applicable
- valid time
- recorded time
- canonical payload JSONB

External identities:

- stable row ID
- entity_id
- system/source
- external ID
- source/revision refs

Enforce uniqueness appropriate to external system + external ID + source scope.

Do not make an external identifier the primary HERMES identity.

---

# 9. Spatial frames/transforms

Persist FND-01 frame contracts explicitly.

`spatial_frames`:

- frame_id
- project_id
- parent_frame_id nullable
- frame type
- CRS metadata
- unit metadata
- geodetic/projected/local origin metadata
- revision reference
- payload JSONB only for extensions

`spatial_transforms`:

- transform ID
- project ID
- from/to frame
- translation
- orientation representation
- revision/evidence relation
- recorded time

Use explicit columns or validated JSONB for vectors/orientation according to the implemented FND-01 contract.

Do not invent an SRID for local XYZ.

---

# 10. PostGIS

Migration should request PostGIS safely:

`CREATE EXTENSION IF NOT EXISTS postgis;`

But application/domain logic must not require arbitrary local model coordinates to be stored as Earth GIS geometry.

Use PostGIS columns only where CRS-known geospatial data belongs.

Minimum acceptance may include a nullable geospatial origin/point field for known geodetic/projected frames.

If test Postgres does not have PostGIS available:

- integration test must report the real missing extension;
- do not fake PostGIS support with SQLite.

---

# 11. Event table — APPEND ONLY

Required fields based on actual current FND event contract:

- event_id PK
- project_id FK
- trace_id where present
- attempt/revision scope if present
- sequence
- event_type
- actor metadata
- affected entity IDs
- timestamp/occurred_at
- recorded_at
- project revision ID where present
- payload JSONB
- payload/content hash

Append semantics:

### First insert
insert.

### Exact retry
if same event ID + same canonical hash:
return idempotent success/no-op.

### Conflict
if same event ID but different content:
throw an explicit event-conflict error.

NEVER use:

`INSERT OR REPLACE`

for canonical events.

Do not expose event update/delete through normal repository interface.

---

# 12. Source/evidence/claim tables

Persist the actual FND-02 canonical contracts.

## sources

Real columns for:

- source ID
- authority class
- rights class
- title/owner
- URI
- edition/version
- jurisdiction/scope
- effective dates
- last checked

JSONB only for extensions.

## evidence

- evidence ID
- project ID
- source ID
- revision ID
- artifact ID nullable
- hash
- MIME
- observed/captured/recorded timestamps
- actor/device
- spatial frame
- reality class
- rights/access class
- metadata JSONB

## claims

- claim ID
- project ID
- subject entity/project ref
- predicate
- value JSONB
- unit metadata
- evidence refs
- derivation method
- authority class
- reality class
- status
- valid time
- recorded time
- supersedes/superseded relation
- promoted by / promotion event
- revision refs

Do not weaken FND-02 promotion rules in persistence.

Database storage must not turn a PROPOSED claim into VERIFIED.

---

# 13. Artifact metadata

Add relational `artifacts` table.

Fields:

- artifact_id
- project_id
- source_id/evidence_id nullable
- artifact_class
- object_key
- canonical URI
- sha256
- size_bytes
- mime_type
- project_revision_id
- rights/access classification
- immutable flag
- created_at

Do not store large bytes in this table.

---

# 14. Artifact store

Create:

`server/storage/ArtifactStore.ts`

or equivalent.

Create a local implementation for tests/dev:

`server/storage/LocalArtifactStore.ts`

Requirements:

- root directory configured outside normal source tree where possible;
- content hash;
- deterministic/opaque object key;
- atomic write;
- no overwrite of immutable object with different content;
- stat/exists/read reference;
- safe path handling;
- no directory traversal.

Production object storage should be represented by interface/config.

If you implement S3-compatible adapter now:

- use explicit endpoint/bucket/region/credentials env vars;
- no silent fallback;
- do not upload during tests unless explicitly configured.

It is acceptable in FND-03 to leave production S3 adapter as fail-closed configuration boundary if no cloud environment exists, provided the ArtifactStore interface and local implementation are complete.

---

# 15. Legacy adapters

Create explicit adapters rather than deleting current stores.

At minimum:

### Live House legacy adapter

Wrap the current:

`data/hermesLiveHouseState.json`

behavior.

Do not change its bytes or existing state in this pass.

### sql.js legacy adapter

Keep existing `sqliteAdapter` operational for existing old APIs.

Do not use it as the new foundation repository.

### generic JSON legacy

Keep `PersistenceStore` behavior available.

### learning legacy

Keep `LearningPersistence` available.

Document that PersistenceStore and LearningPersistence currently share the same legacy file and must never be treated as one coherent migration source.

Do not fix that collision by rewriting the runtime file in FND-03.

---

# 16. No automatic dual write

Do NOT make every legacy state mutation write to both legacy and Postgres.

That creates two simultaneous authorities.

Instead:

- existing runtime remains on legacy driver;
- foundation repository can be explicitly exercised using postgres driver;
- cutover comes later after parity/acceptance.

If a bounded migration test copies a fixture into PostgreSQL, make it explicit and one-way.

---

# 17. Migration runner

Create a migration runner that:

- creates schema_migrations;
- runs migrations in ordered transaction where possible;
- records migration checksum/name/time;
- refuses checksum drift for already-applied migration;
- fails closed on migration error.

Do not auto-delete/recreate production DB.

Do not silently continue after failed migration.

---

# 18. Legacy import tooling

Do NOT write an automatic “import every data file” migration.

If useful, create a dry-run inventory/report utility that identifies legacy data owners.

It must not mutate existing runtime state.

No historical runtime file is to be changed.

---

# 19. Tests — always runnable

Create focused unit/contract tests, for example:

`server/__tests__/fnd03_persistence_contract.test.ts`

Required:

### CFG-01
legacy remains default unless postgres explicitly selected.

### CFG-02
postgres selected without DATABASE_URL fails clearly.

### ART-01
local artifact store writes bytes and returns SHA-256 metadata.

### ART-02
immutable artifact cannot be overwritten with different bytes.

### ART-03
path traversal is rejected.

### EVT-01
canonical event exact retry is idempotent.

### EVT-02
same event ID with different content causes conflict.

### EVT-03
normal event repository exposes no update/replace behavior.

### LEGACY-01
legacy live-house adapter can read existing fixture without modifying it.

### LEGACY-02
learning and generic legacy hermes_store schemas are treated as separate owners.

### SCHEMA-01
foundation migration contains required FND-01/FND-02 tables.

### SCHEMA-02
tenant/project foreign-key ownership is represented.

### SPATIAL-01
local spatial frame can persist without fake geodetic SRID semantics.

---

# 20. PostgreSQL integration tests

Create:

`server/__tests__/fnd03_postgres.integration.test.ts`

Run only when:

`HERMES_TEST_DATABASE_URL`

is explicitly provided.

Do not call it passed when unavailable.

When available prove:

### PG-01
migrations apply.

### PG-02
PostGIS extension/version query succeeds.

### PG-03
project + initial revision + root frame + genesis event commit atomically.

### PG-04
entity + entity revision round-trip.

### PG-05
source + evidence + claim round-trip.

### PG-06
event retry idempotency.

### PG-07
event same-ID/different-content conflict.

### PG-08
artifact metadata stores key/hash but not bytes.

### PG-09
organization/project scoping prevents cross-project repository lookup through scoped API.

---

# 21. Regression suite

Run:

- FND-03 unit/contract tests
- FND-02 tests
- FND-01 tests
- Academy House vertical slice
- Phase-1 visual-gate regression
- TypeScript typecheck
- production build

Also run PostgreSQL integration tests if HERMES_TEST_DATABASE_URL is available.

The existing malformed local PDF/XRef synthetic-path failure remains unrelated unless touched by this change.

Do not mutate protected source-document/runtime files to force it green.

---

# 22. Runtime file protection

Before implementation record exact `git status --short`.

At completion verify the pre-existing runtime-generated modified files remain:

- modified
- uncommitted
- not staged
- not reset
- not rewritten by the implementation

If a test changes one, restore it to the exact pre-test local bytes, not remote/main bytes.

Do not use:

`git checkout -- <runtime file>`

if that would destroy pre-existing local state.

---

# 23. Documentation deliverables

Add:

`docs/HERMES_FND_03_MIGRATION_AND_CUTOVER.md`

Document:

- current legacy stores
- target authority
- driver modes
- migration sequence
- rollback
- acceptance gate
- future cleanup
- no-dual-write rule

Do not claim cutover is complete.

---

# 24. Explicit non-goals

DO NOT:

- delete sql.js
- delete JSON persistence
- remove current live-house hydration
- modify the eight runtime files
- move runtime files out of Git yet
- import all historical state
- switch default runtime to postgres
- deploy a database
- deploy S3
- add Redis
- add Kafka
- add graph DB
- split into microservices
- implement FND-04
- implement FND-05
- implement HX work
- modify visual coordinates/UI
- rewrite Academy engines

---

# 25. Branch

Create a new branch from the current FND-02 commit if practical:

`feature/hermes-fnd-03-production-persistence`

Its history MUST include:

`194ad4473d0e8768cd7f1db34d7e1713447153dd`

and

`67d592381bd66c0bb2aa3d14361bbc5aed904867`

Do not merge to main.

---

# 26. Completion report

Return:

```text
FND03_COMPLETE

CURRENT_REMOTE_MAIN:
FND01_COMMIT:
FND02_COMMIT:
IMPLEMENTATION_BRANCH:
IMPLEMENTATION_COMMIT:

FILES_CHANGED:

PERSISTENCE_INTERFACES:
POSTGRES_ADAPTER:
MIGRATIONS:
POSTGIS_STATUS:
ARTIFACT_STORE:

LEGACY_ADAPTERS:
LEGACY_FILES_TOUCHED:

UNIT_TESTS:
POSTGRES_INTEGRATION_TESTS:
FND02_REGRESSION:
FND01_REGRESSION:
ACADEMY_HOUSE:
VISUAL_GATE:
TYPECHECK:
BUILD:

RUNTIME_GENERATED_FILES:

KNOWN_REMAINING_PERSISTENCE_GAPS:

CUTOVER_STATUS:
NOT CUT OVER

TRUTH_LABEL:
IMPLEMENTED — NOT PHYSICALLY VERIFIED
```

STOP after FND-03.
