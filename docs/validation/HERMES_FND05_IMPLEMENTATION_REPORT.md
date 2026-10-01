# FND-05 measured implementation report

**FOUNDATION HARDENING = IMPLEMENTED — NOT PHYSICALLY VERIFIED.** FND-05 engineering is conditionally complete under the campaign's unavailable-gate rules; no model, database, professional or physical acceptance is implied.

Base: `13c96c8fdafbc68071892e3ac642de5196197787`, independently recovered Accepted/Forge source SHA-256 `2ddfe62296f2c95da70e9c9666493032b735533fbf9d295014e44ba3ba5eeaa6`; complete 327-file closure PASS. Project/application/authorized branch unchanged. Final commit/Recovery manifest comes from the external Gateway receipt, not a guessed self-hash.

## Delivered

Provider-neutral capability/request/registry/policy contracts; deterministic bypass; hard local-only filtering; bounded fallback/deadline/cost estimates; Gemini single-attempt adapter and compatibility export; explicit simulation adapter; central service routing; canonical AiRun and tool-call audit; FND-02 proposed model claims; retained validator/manager/professional boundaries; no direct actuator tools; additive immutable AI audit tables/repository. The Owner's deferred model-execution gate and no-spend default remain closed. See `../HERMES_FND_05_AI_ROUTING.md` for APIs and limitations.

## Executed gates

All tests ran in disposable copies with provider credentials omitted. The Gemini compatibility test mocks the SDK explicitly; it is not live-provider evidence. No tests were weakened.

| Gate | Result |
|---|---|
| FND-05 focused | 19 PASS, including provider swap, privacy, Tier 0, fallback/budget/deadline, simulation, provenance, tools, claims and professional/manager vetoes |
| FND-04 focused | 15 PASS, actual web-ifc parser fixtures |
| FND-03 focused | 15 PASS |
| FND-02 / FND-01 | 36 / 7 PASS |
| Academy / backend visual gate | 4 / 6 PASS; backend tests are not browser pixels |
| Existing quota/failover regression | 5 PASS, historical compatibility model policy view retained |
| Combined scoped suite | 107 PASS; 14 real database cases skipped |
| TypeScript / production build | PASS / PASS, exit 0; existing Vite large-chunk warning retained |
| Genuine reasoning regression | **6 PASS / 5 FAIL**, exactly the unchanged Accepted-base failures; see below |

Command:
```sh
npx vitest run --maxWorkers=2 server/__tests__/fnd05_ai_capability_router.test.ts server/__tests__/fnd05_postgres.integration.test.ts server/__tests__/fnd04_openbim.test.ts server/__tests__/fnd04_postgres.integration.test.ts server/__tests__/fnd03_persistence_contract.test.ts server/__tests__/fnd03_postgres.integration.test.ts server/__tests__/fnd02_evidence_provenance.test.ts server/__tests__/fnd01_canonical_spatial_identity.test.ts server/__tests__/academy_house_001_vertical_slice.test.ts server/__tests__/phase_3_18d_validation005_visual_gate.test.ts server/__tests__/phase_3_18a2_quota_integrity.test.ts
npx vitest run server/__tests__/genuine_agent_reasoning.test.ts server/__tests__/phase_3_18a2_quota_integrity.test.ts
npm run lint
npm run build
```

An initial run concurrent with the production build hit the existing 5-second Vitest timeout during FND-04's multi-import revision test. The final combined run used two workers after the build finished, retaining every assertion and the original timeout. No test was weakened.

The second command exits 1 both before and after FND-05. Comparison used fresh copies of the exact Accepted baseline and candidate with matching original data. The failing names are identical:

- 4. Real Foundation Agent Proof Run Verification — finalTestPassed false.
- 5. Real HVAC Agent Failure, Knowledge Gap, Retrieval, Retraining & Fresh Pass Run — finalTestPassed false.
- 6. Real Electrical Agent Proof Run Verification — finalTestPassed false.
- 8. Real Shadow Mode Execution with Distinct Scenario ID & Bounded Evaluation — FAILED_SHADOW, not PASSED_SHADOW.
- 10. Knowledge Extraction, Candidate Assertion & Quarantine Logic — zero assertions.

These failures were already frozen in the approved blueprint. They are not a new regression, not a green full suite, and were not repaired by fabricating genuine inference, granting simulation competency, spending money, or changing test expectations. Existing synthetic PDF diagnostics remain visible; no PDF parser source was changed.

## Physical gates

**NOT RUN — DATABASE UNAVAILABLE**: no explicit `HERMES_TEST_DATABASE_URL`. Seven FND-03, four FND-04 and three FND-05 real integration cases skipped. FND-05 cases cover immutable run/tool/claim/event roundtrip, exact retries, FK rollback and organization/promotion boundaries. No SQLite substitute.

**Live-provider gate NOT RUN**: no authorized live model execution or spending. Provider-swap/local/SDK tests remain mocks. No local weights or provider gateway deployed. Historical model identifiers are not current-provider availability proof.

Browser/WebGL remains **BLOCKED / UNVERIFIED** from the FND-04 real app attempt (`net::ERR_BLOCKED_BY_CLIENT` for localhost); this milestone changes no UI. Database, browser, remote artifact-store and real provider acceptance remain separate foundation gates.

## Preservation and next stage

Protected runtime/data/reference bytes and accepted SQL migrations 0001/0002 are unchanged. Submit the full source tree through Thin Gateway; verify Forge = Accepted, Recovery manifest, Truth Audit IN_SYNC and independent recovered source hash/full-tree closure. Publication may remain PENDING. Begin HX-01 only after preservation and recovery succeed. Do not remove legacy project tools later until their physical replacements pass.
