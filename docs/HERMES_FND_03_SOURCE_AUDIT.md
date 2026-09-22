# HERMES FND-03 SOURCE AUDIT — PRODUCTION PERSISTENCE / POSTGRESQL / POSTGIS / OBJECT STORAGE

**Audit basis:** remote `main` at `bbc90702a7d62a0092dc2dd914901743c23ec8b5`, plus completed local FND-01 commit `194ad4473d0e8768cd7f1db34d7e1713447153dd` and FND-02 commit `67d592381bd66c0bb2aa3d14361bbc5aed904867`.

**Important limitation:** FND-01/FND-02 implementation commits are local to the Codex workspace and are not visible through the GitHub connector. FND-03 must preserve their canonical identity/revision/unit/frame and source/evidence/claim contracts exactly as implemented.

## Executive finding

HERMES currently has **multiple persistence systems with overlapping ownership**:

1. `server/persistence/sqliteAdapter.ts`
   - sql.js / SQLite WASM
   - persisted to `data/db/hermes_sqlite.db`
   - system state, projects, tasks, agents, heartbeats, task executions, model revisions, inspections, BOM revisions, decisions, corpus/knowledge records, project events.

2. `server/persistence/persistenceStore.ts`
   - JSON durable store
   - `data/db/hermes_store.json`
   - system state, projects, tasks, agents, knowledge, lessons, assembly patterns, activity logs.

3. `server/persistence/learningPersistence.ts`
   - ALSO writes `data/db/hermes_store.json`
   - but with a completely different root schema:
     scenarios, executions, validations, knowledge gaps, reviews, shadow proposals, packs, audit traces, activities.

4. `server/hermesLiveHouseEngine.ts`
   - direct JSON read/write
   - `data/hermesLiveHouseState.json`
   - Academy House/live world state.

5. `server/realityStore.ts`
   - `data/db/reality_audit_store.json`
   - truth audits, repairs, conflicts, security, page audits, executions.

6. `server/spatialAcademyEngine.ts`
   - separate spatial academy JSON persistence.

7. `server/continuousAcademyEngine.ts`
   - `server/persistence/academy_continuous_state.json`
   - continuous academy metrics/activity.

8. `server/phase318b2FullRosterEngine.ts`
   - `data/db/phase_318b2_live_learning_proof_state.json`.

9. `server/referenceBimStore.ts`
   - JSON reference BIM plus generated IFC files on local disk.

10. `server/httpSourceFetcher.ts`
    - downloaded source documents in `data/source-documents/`.

This architecture proved many vertical slices, but it is not safe as a commercial canonical persistence model.

The most serious defect is not SQLite itself.

It is **unclear data ownership and overlapping stores**.

---

# 1. Critical collision: hermes_store.json has two owners

`PersistenceStore` writes `HermesDurableStoreData` to:

`data/db/hermes_store.json`

`LearningPersistence` independently writes `PersistedLearningStore` to exactly the same path:

`data/db/hermes_store.json`

These structures are incompatible.

Therefore:

- one subsystem can overwrite another subsystem's state;
- hydration meaning depends on which writer ran last;
- the file cannot be considered one canonical schema;
- migration code must not import it as if it were one coherent database.

## FND-03 rule

Do **not** bulk-import `hermes_store.json` into PostgreSQL.

Treat it as a legacy multi-owner artifact requiring source-specific migration/adapters.

---

# 2. SQLite is real but not truly authoritative

`sqliteAdapter.ts` is materially implemented and useful.

It creates tables for:

- system state
- projects
- tasks
- agents
- heartbeats
- task execution
- model revisions
- inspections
- BOM revisions
- decisions
- knowledge entities
- learned lessons
- corpus sources
- competency
- fetched documents
- chunks
- assertions
- curricula
- knowledge packs
- test results
- contradictions
- learning reports
- project events

However:

- rows commonly store the full object again inside a generic `data TEXT` JSON blob;
- many domain systems also persist separate JSON versions;
- `INSERT OR REPLACE` allows silent replacement of records that should be append-only;
- project event writes use `INSERT OR REPLACE`, which is incompatible with a strict append-only event truth model;
- no DB-level tenant boundary exists;
- no DB-level foreign keys/relations enforce FND-01 identity or FND-02 evidence lineage;
- spatial values are JSON/text, not PostGIS-ready canonical geometry.

## Conclusion

The SQLite adapter is a compatibility source, not the schema to mechanically port.

---

# 3. Event persistence is currently mutable at the database boundary

The current project event table has:

`event_id TEXT PRIMARY KEY`

and `insertProjectEvent()` executes:

`INSERT OR REPLACE`.

That means the same event ID can replace prior persisted event content.

This conflicts with the canonical rule:

**event history is append-only.**

FND-03 must use idempotent append semantics:

- first insert succeeds;
- repeated exact same event may no-op;
- same event ID with different content must fail/conflict;
- existing event rows must not be silently replaced.

---

# 4. Live House state is a monolithic snapshot

`HermesLiveHouseEngine` directly reads/writes:

`data/hermesLiveHouseState.json`

using atomic temp-file rename.

This is good prototype crash-safety behavior.

But the file combines:

- project metadata;
- live status;
- spatial entities;
- actors;
- equipment;
- survey;
- geotech;
- building components;
- materials;
- BOM;
- CPM;
- inspections;
- events;
- diagnostics;
- constructability proof;
- disruptions;
- evidence-like fields.

It is both state snapshot and partial history.

## FND-03 treatment

Do not remove this path yet.

Wrap it behind a legacy adapter and preserve hydration until PostgreSQL parity is physically proven.

---

# 5. Runtime-generated files are tracked in Git

Current remote `main` contains runtime/generated state including:

- `data/hermesLiveHouseState.json`
- `data/spatial_academy_state.json`
- `data/db/academy_runtime_hardening_state.json`
- `data/db/hermes_sqlite.db`
- `data/db/hermes_store.json`
- `data/db/phase_318b2_live_learning_proof_state.json`
- `data/db/reality_audit_store.json`
- `server/persistence/academy_continuous_state.json`
- `server/persistence/spatial_academy_state.json`

This explains why runtime activity dirties the worktree.

The owner has repeatedly required that the eight modified runtime-generated files remain untouched.

## FND-03 rule

Do not delete, reset, migrate, rewrite, normalize, or recommit existing runtime files in this pass.

A future explicit repository-cleanup/cutover may move runtime state out of Git tracking after backups and migration are accepted.

FND-03 should only create the replacement boundary.

---

# 6. Source documents are being stored in repository-local filesystem

`HttpSourceFetcher` persists retrieved bytes under:

`data/source-documents/`

This is appropriate for prototype source-ingestion testing but not as the final artifact architecture.

The same issue applies to:

- IFC originals;
- generated IFC/reference model artifacts;
- PDFs;
- imagery;
- scans;
- future point clouds/video.

## FND-03 target

Large/immutable artifacts belong behind an `ArtifactStore` interface.

Metadata belongs in PostgreSQL.

Bytes belong in:

- local filesystem adapter for development/test;
- S3-compatible object storage in production.

Do not require AWS specifically.

Do not vendor artifacts into normal Git.

---

# 7. No S3/object-storage implementation currently exists

The repo contains conceptual references to persistent asset storage but no canonical object-storage abstraction.

FND-03 should introduce the abstraction now.

Minimum artifact metadata:

- artifact ID
- project ID
- source/evidence ID
- object key / URI
- SHA-256
- size bytes
- MIME type
- artifact class
- created/recorded timestamp
- project revision
- rights/access classification
- immutable flag

Do not place artifact bytes in PostgreSQL by default.

---

# 8. Data ownership must be established before migration

Recommended canonical owners after FND-03:

## PostgreSQL canonical relational state

- organizations / tenant boundary
- projects
- project revisions
- canonical entities
- entity revisions
- external identities
- relationships
- spatial frames/transforms
- events
- sources
- evidence
- claims
- artifact metadata

These tables directly support FND-01 and FND-02.

## Keep domain tables deferred unless needed

Do not immediately normalize every Academy subsystem into tables.

Later:

- tasks/work packages
- schedules
- materials/products/batches
- procurement/deliveries
- issues/clashes
- inspections/approvals
- actors/equipment/resources
- sensors/telemetry
- AI runs

can be introduced when their domain contract is ready.

The first migration should prove the persistence architecture, not model the entire company.

---

# 9. Tenant boundary must exist from the beginning

Even before enterprise auth exists, every commercial canonical record should be structurally capable of tenant/project scoping.

Minimum:

- organization_id
- project_id where applicable

Do not rely on UI or query parameters for tenant isolation.

FND-03 does not need full RBAC/OIDC implementation.

It does need schema ownership that makes tenant isolation enforceable later.

---

# 10. Recommended minimum PostgreSQL schema

FND-03 should initially implement only the foundation tables needed for FND-01/FND-02:

```text
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

Optional if required by implementation:

`relationships`

Do not implement 30 tables just because the long-term plan lists them.

---

# 11. PostGIS strategy

PostGIS is valuable for project/site/geospatial state but must not be abused.

## Store geospatial/projected geometry in PostGIS where appropriate

Examples later:

- parcel geometry
- survey/geodetic points
- site hazards
- terrain references
- GIS overlays

## Do not force every local BIM/component pose into Earth geometry

Local building/component frames remain explicit FND-01 transforms.

Recommended schema distinction:

- `spatial_frames` owns frame identity and CRS metadata;
- optional PostGIS geometry/geography fields represent coordinates only when a known CRS exists;
- local XYZ stays canonical numeric coordinates + frame ID.

Do not fake SRID for arbitrary local model space.

---

# 12. Migration system

Use ordered SQL migration files.

Recommended:

`server/persistence/migrations/0001_foundation.sql`

and a minimal migration runner.

Do not adopt a heavy ORM solely for migrations.

A direct PostgreSQL driver + SQL migrations is sufficient.

The implementation may choose an existing light migration package if already present, but should not create unnecessary framework lock-in.

---

# 13. PostgreSQL driver

No PostgreSQL client library is present on current `main`.

Recommended minimal dependency:

`pg`

Use a connection pool.

Environment:

`DATABASE_URL`

Optional:

`HERMES_DATABASE_SSL`

Do not hardcode credentials.

Do not commit connection strings.

---

# 14. Transaction boundaries

At minimum, these should be atomic:

### Project genesis

- project
- initial project revision
- root spatial frame
- genesis event

### Entity revision

- entity/current revision pointer
- new immutable entity revision
- any external ID updates
- event

### Claim promotion

- claim status transition
- promotion event
- canonical target state if persisted in same operation

### Evidence + artifact metadata

- evidence record
- artifact metadata link

Bytes should be uploaded/staged before metadata commits when practical, with cleanup rules for failed metadata transaction.

---

# 15. Object storage interface

Recommended interface semantics:

```ts
ArtifactStore {
  put(...)
  stat(...)
  getReadReference(...)
  exists(...)
  delete(...)
}
```

Production can use S3-compatible storage later.

FND-03 should provide:

- interface;
- local filesystem implementation for development/tests;
- production adapter contract/config boundary.

If an S3 adapter can be implemented narrowly without forcing environment-specific credentials, it is acceptable; otherwise interface + local adapter + explicit production-not-configured failure is better than a fake cloud implementation.

Never silently fall back from production S3 configuration to local disk.

---

# 16. Legacy compatibility adapters

Required legacy owners:

### Live house

`HermesLiveHouseJsonStore`

preserves current read/write behavior.

### sql.js

Keep `sqliteAdapter` callable for existing old APIs until cutover.

Do not make new FND-03 foundation domain writes dual-write to SQLite and Postgres by default.

Dual-write creates split-brain risk.

### hermes_store.json

Because two incompatible owners exist, create separate legacy adapters/migration readers by producer type if migration is later required.

Do not treat the file as one source.

---

# 17. Read/write cutover strategy

Use explicit mode configuration.

Suggested:

`HERMES_PERSISTENCE_DRIVER=legacy|postgres`

Default during this pass should preserve existing runtime behavior unless test environment explicitly enables postgres.

Do not silently pick a database based on whether `DATABASE_URL` happens to exist.

After PostgreSQL physical acceptance, default may be changed in a separately authorized cutover.

---

# 18. Migration/recovery safety

FND-03 should not perform destructive automatic migration on application startup.

Startup may:

- verify schema version;
- run explicitly authorized forward migrations if configured;
- fail clearly if incompatible.

Do not:

- delete legacy files;
- reset malformed legacy DBs as part of Postgres migration;
- import all historical fixture files automatically.

---

# 19. Current sql.js corruption behavior is unsafe for production truth

`sqliteAdapter.init()` may delete a malformed database and recreate it.

That was practical for Academy/prototype use.

Production canonical persistence must never silently discard project truth due to corruption.

PostgreSQL adapter should fail closed and report the incident.

Do not port auto-delete/reset semantics.

---

# 20. Existing JSON safe-parse behavior

Some stores attempt to sanitize malformed JSON escape sequences and continue.

This is useful for preserving old fixture behavior.

Canonical PostgreSQL records should not use silent data repair on read.

Invalid canonical data should fail validation and remain auditable.

Keep legacy sanitizers in legacy adapters only.

---

# 21. Event ordering

Existing event models contain sequence/order concepts.

PostgreSQL event storage should enforce:

- unique event ID;
- project ID;
- trace ID where available;
- sequence number;
- event type;
- event timestamp;
- actor;
- affected entities;
- revision relation;
- payload JSONB;
- recorded_at.

Recommended uniqueness:

`UNIQUE(project_id, sequence)`

where canonical event sequence guarantees one sequence per project/attempt.

If attempt-level sequences restart, include attempt/revision scope in the uniqueness key.

Use the actual FND-01/FND-02 event contract from the local implementation rather than assuming old main.

---

# 22. JSONB use

JSONB is appropriate for:

- evolving event payloads;
- source-specific extensions;
- claim values that are structurally heterogeneous;
- compatibility data.

Do not store every entire domain object only as JSONB.

Identity, tenant, revision, timestamps, source/evidence foreign keys and spatial-frame relationships should be real columns.

---

# 23. Postgres should not become artifact storage

Never store by default:

- IFC bytes
- PDF bytes
- images
- video
- point cloud bytes

inside relational rows.

Store metadata + checksum + object key.

Small JSON derived metadata is fine.

---

# 24. Testing without a production PostgreSQL service

Codex/test workspace may not provide a running PostgreSQL/PostGIS service.

FND-03 should therefore have two test tiers:

## Always-run unit/contract tests

- repository interface behavior
- legacy adapter behavior
- event append conflict behavior using a test repository/fake
- artifact local adapter
- SQL migration contents/schema assertions
- configuration fail-closed behavior

## Integration tests when database is available

Guard with explicit:

`HERMES_TEST_DATABASE_URL`

If absent, report integration test as **NOT RUN — DATABASE UNAVAILABLE**, not passed.

Do not substitute SQLite and call it PostgreSQL verification.

Physical PostgreSQL/PostGIS acceptance remains separate.

---

# 25. Eight runtime files

The current Codex workspace reports eight runtime-generated files modified and intentionally uncommitted.

FND-03 must:

- inspect `git status`;
- record them;
- not modify/reset/add/commit them;
- ensure tests restore any temporary mutations they cause.

Do not use the migration pass as an excuse to clean the worktree.

---

# 26. FND-03 implementation scope conclusion

The correct FND-03 pass is:

1. introduce canonical persistence interfaces;
2. implement minimal PostgreSQL foundation repository;
3. introduce SQL migrations and schema versioning;
4. introduce artifact-store abstraction + local test/dev adapter;
5. preserve current JSON/sql.js systems behind legacy adapters;
6. prove append-only/idempotent event semantics;
7. prove FND-01/FND-02 records can round-trip when PostgreSQL is available;
8. stop before destructive cutover.

It is **not**:

- migrate everything;
- delete SQLite;
- delete JSON;
- normalize every Academy subsystem;
- move runtime files;
- introduce Kafka/graph DB/microservices.

