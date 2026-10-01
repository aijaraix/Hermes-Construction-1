# FND-03 persistence boundary — NOT CUT OVER

The active runtime remains on its existing legacy paths. `HERMES_PERSISTENCE_DRIVER` defaults to `legacy`; merely supplying `DATABASE_URL` does not change ownership. The new `createPersistence(serverScope, env)` factory is an explicit integration seam, not automatic hydration, migration or dual write. PostgreSQL selection without valid configuration fails closed. It never falls back to JSON/sql.js.

Canonical contracts are in `server/persistence/contracts.ts`. `PostgresFoundationRepository` requires a server-supplied organization/project scope; it checks project ownership inside transactions and uses project-composite foreign keys. This is a data isolation boundary, not a new identity/RBAC system. Do not accept browser-supplied tenant IDs as authorization. Reads/writes preserve the FND-01/02 objects with real relational ownership, revision, source/evidence, status and timestamp columns; JSONB retains evolving payload detail.

Ordered SQL files are under `server/persistence/migrations/`. `migrateFoundation(pool, directory)` is invoked explicitly by an authorized caller. It uses an advisory transaction lock, ordered history and SHA-256 checksums; missing/drifted/out-of-order applied files or SQL failure roll back. Ordinary application startup does not migrate. Package the SQL directory with any future server deployment; a missing directory fails clearly. No destructive down migration or corrupted-state reset exists.

`DATABASE_URL` configures `pg.Pool`; optional `HERMES_DATABASE_SSL=require` uses certificate verification. No credentials are logged or committed. The returned PostgreSQL factory exposes health and graceful pool close. PostGIS is required by migration; local XYZ remains framed metric data and receives no CRS/SRID. Only an explicitly GEODETIC/EPSG:4326 origin is stored as a known-CRS geometry. Other projected systems remain explicit metadata until a bounded adapter is added.

Transactions cover project/revision/frame/event genesis; entity/current revision/external identity/event; evidence plus artifact metadata; claim promotion plus promotion event; claim supersession. Event identity retries use canonical content hashes: an exact retry is idempotent, different content conflicts, and sequence collisions are explicit. Database triggers reject event and immutable revision updates/deletes. Claim creation cannot bypass FND-02 promotion. Promotion loads its evidence/sources from the scoped repository, validates them through existing policy and writes the event with the status transition in one transaction.

Artifacts: `LocalArtifactStore` is development/test filesystem storage, not verified cloud object storage. It stores bytes and metadata in an atomically published directory, hashes bytes, rejects traversal/project mismatch/symlinks and immutable collisions, checks rights before storing bytes, and verifies content on reads. Metadata retains project/revision/source/evidence, MIME, hash, size, rights and confidentiality. Ordinary APIs expose no deletion. Remote storage remains an explicit unconfigured seam that fails rather than falling back.

Write immutable bytes before an evidence/metadata transaction. If that transaction fails, already-published bytes may be an unreferenced immutable artifact; keep them for reconciliation. Never delete a possibly committed artifact as compensation. Staged temporary directories are cleaned by the writer. A future authorized garbage collector must check references and retention before deleting orphans. This pass does not claim power-loss durability or remote replication.

Legacy owners remain unchanged:

| Owner | Legacy path | Treatment |
|---|---|---|
| LiveHouse | data/hermesLiveHouseState.json | Read-only migration adapter; original engine behavior retained |
| sql.js | data/db/hermes_sqlite.db | Existing API remains lazy-loadable; no canonical foundation writes |
| PersistenceStore | data/db/hermes_store.json | Explicit generic producer reader |
| LearningPersistence | data/db/hermes_store.json | Separate learning producer reader |

The last two paths collide with incompatible schemas. The inventory reports both owners and readers reject the wrong producer shape. No bulk import, file normalization, deletion, default change, source-file cleanup or runtime-state mutation is performed. Other Academy/audit/source/model stores remain their existing owners.

Future cutover (separate approval): inventory/backup exact bytes; resolve producer ownership; provision approved PostgreSQL/PostGIS/object storage; run real integration and parity checks; test restore/rollback; freeze a bounded write boundary; explicitly switch a single owner; observe; retain legacy backups until retention approval. Rollback restores the authorized driver and preserved snapshot after reconciling newer canonical writes; it never blindly resets history. Normal dual writing is prohibited.

Real database tests require explicit `HERMES_TEST_DATABASE_URL` pointing to an isolated test database with PostGIS already available. They create and clean only a unique test schema, verify migrations, transactions, scoped round trips, idempotent/concurrent events and promotion rollback. Without that setting report **NOT RUN — DATABASE UNAVAILABLE**. Unit tests with mocked SQL are not PostgreSQL/PostGIS evidence. No database was provisioned or production cutover performed by this milestone.
