# HERMES FND-03 COMPATIBILITY & MIGRATION MATRIX

## Existing persistence ownership

| Store / file | Current writer(s) | Data role | Canonical after FND-03? | FND-03 treatment |
|---|---|---|---|---|
| data/hermesLiveHouseState.json | HermesLiveHouseEngine | live/Academy world snapshot + events | NO | preserve behind legacy adapter |
| data/db/hermes_sqlite.db | sqliteAdapter | many prototype/domain records | NO for new foundation | keep legacy APIs; do not port schema mechanically |
| data/db/hermes_store.json | PersistenceStore AND LearningPersistence | two incompatible root schemas | NO | treat as two legacy owners; never bulk-import |
| data/db/reality_audit_store.json | RealityStore | reality/audit state | NO | preserve |
| data/spatial_academy_state.json | proof/academy paths | Academy spatial snapshot | NO | preserve |
| server/persistence/spatial_academy_state.json | SpatialAcademyEngine | spatial Academy state | NO | preserve |
| server/persistence/academy_continuous_state.json | ContinuousAcademyEngine | continuous Academy metrics | NO | preserve |
| data/db/phase_318b2_live_learning_proof_state.json | Phase318B2 engine | learning proof state | NO | preserve |
| data/db/academy_runtime_hardening_state.json | runtime hardening | runtime proof state | NO | preserve |
| data/source-documents/* | HttpSourceFetcher | downloaded source bytes | future artifact store | preserve; no bulk move |
| data/models/* | reference BIM/model code | BIM/reference assets | future artifact store + FND-04 | preserve |

## Target authority after eventual cutover

| Domain | Target owner |
|---|---|
| organization/project identity | PostgreSQL |
| project revisions | PostgreSQL |
| entity identity/revisions | PostgreSQL |
| external identities | PostgreSQL |
| spatial frame/transform metadata | PostgreSQL/PostGIS where CRS-known |
| canonical events | PostgreSQL append-only |
| sources/evidence/claims | PostgreSQL |
| artifact metadata | PostgreSQL |
| artifact bytes | S3-compatible object storage |
| live snapshot projection | rebuild/read model from canonical repositories + caches |
| legacy Academy stores | compatibility/history until retired |

## FND-03 does NOT perform final cutover

During FND-03:

`legacy` remains default runtime driver.

`postgres` is explicit opt-in.

No normal dual-write.

No destructive migration.

## Critical invariants

1. FND-01 identity/revision/unit/frame contracts remain unchanged.
2. FND-02 source/evidence/claim/promotion contracts remain unchanged.
3. Academy House current legacy hydration remains functional.
4. Eight pre-existing runtime-modified files remain untouched.
5. Canonical events become append-only in the PostgreSQL repository.
6. Exact event retry is idempotent.
7. Same event ID with different content is conflict, never replacement.
8. Local XYZ is never assigned fake geographic SRID.
9. Large artifacts are not stored in database rows.
10. Postgres unavailability must fail clearly when postgres mode is selected.
11. No production driver silently falls back to legacy.
12. No migration auto-deletes corrupted historical state.
13. Runtime state is not cleaned from Git in this pass.
14. Artifact storage does not silently fall back from production remote configuration to local disk.

## Minimum PostgreSQL foundation schema

- schema_migrations
- organizations
- projects
- project_revisions
- entities
- entity_revisions
- external_identities
- spatial_frames
- spatial_transforms
- events
- sources
- evidence
- claims
- artifacts

## Deferred normalization

- tasks/work packages
- schedules
- materials/products/batches
- procurement
- deliveries
- issues/clashes
- inspections/approvals
- equipment/actors
- telemetry
- AI runs
- knowledge academy tables

Existing legacy stores remain owners of these until later migration tickets.

## Test matrix

| Test | Required |
|---|---|
| legacy default driver | YES |
| explicit postgres config gate | YES |
| local artifact hash/write | YES |
| immutable artifact collision | YES |
| traversal rejection | YES |
| event idempotent retry | YES |
| event content conflict | YES |
| legacy live-house read no mutation | YES |
| hermes_store dual-owner detection | YES |
| migration required table audit | YES |
| tenant/project FK audit | YES |
| local frame no fake SRID | YES |
| real PostgreSQL migrations | WHEN DB AVAILABLE |
| real PostGIS extension | WHEN DB AVAILABLE |
| project/revision round-trip | WHEN DB AVAILABLE |
| FND-01 entity/revision round-trip | WHEN DB AVAILABLE |
| FND-02 source/evidence/claim round-trip | WHEN DB AVAILABLE |
| Academy House regression | YES |
| Phase-1 visual-gate regression | YES |
| TypeScript | YES |
| production build | YES |

## Physical acceptance later

FND-03 is not PHYSICALLY VERIFIED until a real PostgreSQL/PostGIS instance is provisioned and the integration suite is run against it.

A local unit test or generated SQL inspection is not physical database acceptance.
