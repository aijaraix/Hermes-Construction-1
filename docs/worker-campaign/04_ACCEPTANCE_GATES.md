# Acceptance gates and result semantics

Every implementation stage must record changed files, base, tests/commands, exit codes, targeted coverage, regressions, typecheck/build and physical evidence. PASS applies only to executed checks. NOT RUN is not PASS; simulated evidence remains simulated.

Required common regression command:
```sh
npx vitest run server/__tests__/fnd02_evidence_provenance.test.ts server/__tests__/fnd01_canonical_spatial_identity.test.ts server/__tests__/academy_house_001_vertical_slice.test.ts server/__tests__/phase_3_18d_validation005_visual_gate.test.ts
npm run lint
npm run build
```
Add the current milestone tests and previously implemented foundation contracts. Run commands in a disposable recovered copy because existing engines/tests mutate tracked state. Preserve source bytes separately and verify runtime/data closure before checkpoint.

| Gate | Required result / unavailable handling |
|---|---|
| Identity/authority | Exact project/role/branch, approved unexpired scoped grant, latest Accepted base |
| Required scoped tests and regressions | PASS; repair safely inside current milestone; stop if unresolved |
| TypeScript + production build | PASS; retain warning detail without relabeling a failed command |
| FND-03 PostgreSQL/PostGIS | Real migrations/round trips only with explicit HERMES_TEST_DATABASE_URL; else NOT RUN — DATABASE UNAVAILABLE |
| FND-04 parser | Execute actual mature parser under bounds; fake parser tests are only unit mocks |
| FND-05 provider | Deterministic/mock routing proves policy only; unavailable approved live access = live-provider gate NOT RUN |
| Browser/WebGL | Real isolated app, real project/API/visible world; unavailable faithful runtime = BLOCKED / UNVERIFIED |
| Durable checkpoint | PRESERVED, exact base/child, Forge and Accepted equal, Recovery digest, Truth Audit IN_SYNC |
| Source recovery | Independently re-bootstrap/download/hash and compare complete source tree with candidate |

Never substitute SQLite for PostgreSQL/PostGIS, source tests for physical browser evidence, or mocked provider responses for live-provider acceptance. Retain genuinely pre-existing unrelated failures with their reproduction evidence and do not advertise a green entire repository suite.

Frozen per-stage matrices define the remaining checks. Their historical prerequisite SHAs are superseded by the governed initial FND-02 lineage and subsequent accepted campaign checkpoints.
