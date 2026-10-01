# FND-04 measured implementation report

Status: **IMPLEMENTED — NOT PHYSICALLY VERIFIED**. Engineering continuation is conditional on the campaign's explicit unavailable-gate policy.

Implementation base: `8d2de4fdc065e9602e0c03eac66c2b244499db9f`, independently recovered from Accepted/Forge with source SHA-256 `fe33dcbb0e99ffeff8c1566a4f8ab5c33e326ca591328c8c6b75f851ba271ffd`; full 311-file source closure PASS. Project `hermes-construction`, role `application`, branch `feature/fnd-01-canonical-identity` unchanged. The final commit/Recovery digest is in the external Gateway receipt; this report does not predict its own commit hash.

## Delivered scope

Bounded real server-side web-ifc process; owned IFC revision fixtures; immutable original/normalized/report artifacts; parsed semantic/geometry provenance; source-context reconciliation including removal/reappearance; semantic/placement/geometry/relationship diffs; isolated default service mode; explicit PostgreSQL import unit of work; additive migration 0002; proposed imported quantity claims; versioned source frames without invented global transforms; IDS/BCF/dictionary seams; production CommonJS service/worker bundle. See `../HERMES_FND_04_IMPORT_PIPELINE.md` for the internal API and bounds.

Source-backed correction retained: installed browser web-ifc and historical diagnostics do not establish an executing browser parse path in the current UI. This pass implements the server service. It does not claim a new public upload UI, browser import renderer, full IFC conformance validator, full mesh export, real collision solver, live model execution or production persistence cutover.

## Executed engineering gates

Verification used an isolated copy; authoring source data/runtime files remain the recovered bytes.

| Gate | Measured result |
|---|---|
| FND-04 focused tests | 15 PASS; real web-ifc WASM fixture parsing executed |
| Prior required contracts/regressions | 68 PASS: FND-03 15, FND-02 36, FND-01 7, Academy 4, visual-gate backend 6 |
| Combined scoped tests | 83 PASS; 11 real database cases skipped |
| `npm run lint` | PASS, exit 0 |
| `npm run build` | PASS, exit 0; existing Vite large-chunk warning retained |
| Production service/worker package smoke | Real parser from built CommonJS service/worker, with source modules absent; recorded separately before checkpoint |

Focused cases cover IFC-01..07, ID-01/02, DIFF-01..03, REV-01, FAIL-01/02, ART-01 and QTY-01. They check immutable hash/bytes, parse-report linkage, valid/invalid/duplicate GUIDs, federation isolation, Psets, hierarchy, material/type/quantity extraction, derived geometry and metre/mm units, revisions and removal/reappearance, name-only review, one-to-one explicit mappings, malformed input, real child timeout, size rejection, caller-buffer mutation, and transaction reuse. The in-memory import repository and SQL transaction doubles are explicitly mocks, not database evidence.

Command:
```sh
npx vitest run server/__tests__/fnd04_openbim.test.ts server/__tests__/fnd04_postgres.integration.test.ts server/__tests__/fnd03_persistence_contract.test.ts server/__tests__/fnd03_postgres.integration.test.ts server/__tests__/fnd02_evidence_provenance.test.ts server/__tests__/fnd01_canonical_spatial_identity.test.ts server/__tests__/academy_house_001_vertical_slice.test.ts server/__tests__/phase_3_18d_validation005_visual_gate.test.ts
npm run lint
npm run build
```

## Unavailable physical gates

**NOT RUN — DATABASE UNAVAILABLE**: no `HERMES_TEST_DATABASE_URL`. Seven FND-03 and four FND-04 PostgreSQL/PostGIS cases were skipped. FND-04's real tests cover persistence, immutable prior revisions, injected SQL failure after entity writes/atomic rollback, and organization scope. Their presence is not proof they passed. No SQLite substitute was used; the existing application may initialize its legacy SQLite adapter during normal boot, which is unrelated to PostgreSQL acceptance.

**Browser/WebGL BLOCKED / UNVERIFIED**: the isolated production Node/Express app booted on port 3000 with provider credentials omitted and the runtime timer disabled by its existing production-mode setting. Chrome could not open `http://127.0.0.1:3000`: `net::ERR_BLOCKED_BY_CLIENT`. No network-policy bypass was attempted. The preview was stopped. No reference/imported model selection/isolation/section/measurement, canonical-to-render parity, viewport or camera evidence was captured. No physical acceptance is claimed. Startup also exposed pre-existing synthetic PDF-parser diagnostics and kept provider proof/continuous Academy locked; no live provider was used.

Live-provider gate: NOT RUN / not needed for server IFC normalization. Known historical genuine-reasoning failures and PDF fixture mismatch are retained and were not called green; their source boundary is unchanged by this milestone.

## Preservation

Submit the complete source tree through Thin Gateway, verify Internal Forge = Accepted Head, Recovery manifest and Truth Audit IN_SYNC, then independently recover/hash/compare every source path. Runtime data and migration 0001 must match the previous Accepted source. GitHub publication may remain PENDING. FND-05 may begin only after that recovery closure succeeds.
