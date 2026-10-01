# FND-03 implementation result

Base: `8a78923238c005254fceaf38b1c2446bd31336ca`, the preserved campaign documentation checkpoint. Branch: `feature/fnd-01-canonical-identity`. Initial accepted FND-02 lineage remains `b1cb699637f23b1faf28f0d2eaa90804869d805d`.

Implemented the additive foundation repository contracts and PostgreSQL driver/factory, ordered transactional/checksummed migration runner, PostGIS-aware schema, project/entity/revision/frame/transform/source/evidence/claim/artifact repositories, append-only event hashes and conflict behavior, and immutable local artifact store. Entity revisions and claim promotions/supersessions use atomic transaction boundaries. Claims use existing FND-02 validation with scoped stored evidence; storage cannot grant external professional/AHJ authority.

Legacy remains the runtime default. The new factory is an explicit canonical repository seam; this milestone does not migrate current engines automatically. Original JSON/sql.js producers remain available through lazy compatibility references and read-only owner-specific readers. The shared `hermes_store.json` collision is identified, not bulk-imported or rewritten. No dual write, production cutover, database provisioning, cloud object-store deployment, credential change or UI change occurred.

| Validation | Result / limit |
|---|---|
| FND-03 unit/contract tests | 15 PASS; actual local filesystem operations; mock SQL transaction checks are mocks |
| FND-02 regression | 36 PASS |
| FND-01 regression | 7 PASS |
| Academy vertical slice | 4 PASS |
| Backend visual-gate regression | 6 PASS; not browser acceptance |
| Total executed scoped tests | 68 PASS |
| PostgreSQL/PostGIS integration | **NOT RUN — DATABASE UNAVAILABLE**; seven integration cases skipped because HERMES_TEST_DATABASE_URL absent |
| TypeScript | PASS; npm run lint exit 0 |
| Production build | PASS; npm run build exit 0; existing large-chunk warning |
| Protected runtime/source data | Byte-identical to accepted source in authoring tree; test runtime mutations confined to disposable copy |
| Physical browser | UNVERIFIED; this milestone does not change UI/render behavior |
| Live provider | NOT RUN; not required for this persistence implementation |

Real integration cases are provided for migrations/PostGIS, genesis, identity/revisions, evidence/artifact/claim round trips, tenant scope, concurrent duplicate events, immutable history and claim-promotion rollback. They are not advertised as executed. No SQLite substitute was used. The integration harness requires pre-existing PostGIS and cleans only its unique explicitly created test schema.

The known genuine-reasoning five baseline failures and synthetic PDF page-count mismatch remain unchanged and were not rerun because this milestone does not touch those execution/provider/PDF paths. No entire-suite green claim.

Source delivery: contracts/integrity/Postgres repository/connection/migrations/factory/legacy adapters under `server/persistence`; artifact interface/local store under `server/storage`; two focused test files; pg and types dependencies; `docs/HERMES_FND_03_MIGRATION_AND_CUTOVER.md`; campaign metadata/report.

Remaining gates: real PostgreSQL/PostGIS acceptance; remote object-storage adapter/deployment; later engine cutover after parity/restore approval; wider domain normalization; reference-aware orphan retention/reconciliation; full restart/distributed runtime hardening. Local artifact storage provides atomic publication and integrity checks; it does not claim remote replication or universal power-loss durability.

Truth label: **IMPLEMENTED — NOT PHYSICALLY VERIFIED**. Cutover: **NOT CUT OVER**. The authenticated Gateway checkpoint and independently recovered archive provide the resulting commit/Recovery identity; they cannot be self-embedded inside this commit.
