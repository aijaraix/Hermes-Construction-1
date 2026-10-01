# Hermes / AEDRYX — preserved FND-02 and remaining build campaign

30 September 2026. Decision record based on governed source, not roadmap completion claims.

## Decision

FND-02 is implemented and durably preserved. FND-03, FND-04, FND-05 and HX-01–03 still require implementation on this governed lineage. Their precursor systems exist and should be adapted. Academy House has a working deterministic vertical slice, but physical browser acceptance and general spatial proof remain outstanding.

Recommended next campaign: capture an Academy browser baseline; implement FND-03 → FND-04 → FND-05; then HX-01 → HX-02 → HX-03, with focused preservation after every stage and browser checks wherever the renderer or UI is touched. A single Worker can perform this sequence under an appropriately bounded future campaign grant. The current grant ends at FND-02 source changes; this report does not extend it.

## Governed result and durability

| Field | Verified result |
|---|---|
| Project / role | hermes-construction / application |
| Branch | feature/fnd-01-canonical-identity |
| Recovered prerequisite | 27e62a714a33236d785cd410ca11a12b02fafa96 |
| Accepted Head and Internal Forge | b1cb699637f23b1faf28f0d2eaa90804869d805d |
| Immutable Recovery manifest SHA-256 | 569f3c47ca31f220916a891daae61409baf6437a3a4f83f7f4009babba512ac0 |
| Truth Audit | IN_SYNC |
| GitHub publication | PENDING; Gateway says not required for preservation |
| Recovered accepted-source SHA-256 | cd77b8c0e6da0caa674728f060184aac94ce81bec83b9ddf5c940ee68ecda105 |

The existing authenticated Worker session resumed without another Owner authorization. Gateway returned PRESERVED. An independent bootstrap returned the new head as ACCEPTED_AND_FORGE. The accepted archive was downloaded again, its SHA-256 verified, and all eight changed files compared byte-for-byte with the submitted candidate. Original tracked runtime/data files remained byte-identical to the prerequisite archive. No deployment or production cutover occurred.

FND-02 changes are in `src/types/hermes.ts`, new `src/lib/projectEvidence.ts`, `evidenceAdapters.ts`, `truthLabels.ts`, `server/httpSourceFetcher.ts`, `server/hermesLiveHouseEngine.ts`, the new focused test, and `docs/validation/HERMES_FND02_IMPLEMENTATION_REPORT.md`.

They separate authority, derivation, reality and claim status; require matched substantive evidence and promotion history for Verified labels; preserve legacy origins through adapters; retain rights classifications and fail-closed ingestion; prevent owner location/user geotech/internal execution from manufacturing jurisdiction, engineering, professional or AHJ verification. Legacy unsupported verification is downgraded in memory with original values retained as history. Task events link unverified canonical claims. This is an additive contract/policy layer, not an external document authenticity service or production evidence database.

### Validation actually performed

| Check | Result and limit |
|---|---|
| FND-02 focused tests | 36 PASS |
| FND-01 identity/spatial regressions | 7 PASS |
| Academy House 001 vertical slice | 4 PASS |
| Phase 3.18d visual-gate regression | 6 PASS; backend assertions, not browser evidence |
| Total scoped Vitest tests | 53 PASS |
| TypeScript `npm run lint` | PASS |
| Production `npm run build` | PASS; existing large-chunk warning |
| Phase1DiagnosticRunner | 15 reported PASS; mixed measured/static assertions, not independent physical acceptance |
| Genuine agent reasoning | 6 PASS / 5 FAIL on both untouched base and candidate |
| Synthetic path elimination | Fetch failure and source-rights checks pass; PDF fixture expects 2 pages and observes 1 on both base and candidate; later checks not reached |

The five genuine-reasoning failures cover foundation agent proof, HVAC learning/retraining, electrical proof, shadow execution, and extraction/quarantine. These are baseline failures, not passing checks. Do not advertise a green entire repository suite. Tests used disposable source copies; no paid/provider calls or credential changes were introduced to force success.

Reproduction for the scoped suite:

```sh
npx vitest run server/__tests__/fnd02_evidence_provenance.test.ts server/__tests__/fnd01_canonical_spatial_identity.test.ts server/__tests__/academy_house_001_vertical_slice.test.ts server/__tests__/phase_3_18d_validation005_visual_gate.test.ts
npm run lint
npm run build
```

Use a disposable recovered checkout: existing runtime/tests can write tracked fixture files. Test success does not mean physical construction, code approval, professional approval or AHJ approval.

## Source-backed remaining-work map

All source paths below refer to Accepted Head `b1cb699…`. Searches covered current `src`, `server`, package declarations and relevant tests. Absence findings describe this governed snapshot, not every historical branch. Planning references were read from `planning/hermes-control-layer-2026-09-18`; they were not merged into runtime source.

| Stage | Already implemented | Partial or missing | Dependency / decision |
|---|---|---|---|
| FND-03 | sql.js persistence, JSON stores, local source/model files; FND-01 identity and FND-02 evidence contracts | No PostgreSQL driver/dependency, canonical foundation repository, ordered Postgres migrations, PostGIS boundary or ArtifactStore implementation in the inspected tree | Build additive repositories and local artifact adapter first; preserve legacy default. Real DB acceptance is separate from interface tests |
| FND-04 | Native BIM commands/revisions; FND-01 external-identity rules; generated reference IFC and JSON semantic fixtures; Three.js component projection | No server normalizer/import service, isolated IFC parser, immutable source-model revision/reconciliation/diff pipeline. Browser WebIFC execution itself needs verification | Consume FND-03 artifact/repository seams and FND-02 evidence. Preserve native commands and protected fixtures |
| FND-05 | ConstructionReasoningProvider, Gemini adapter, quota/deferred mechanisms, execution records, deterministic simulator, validator/manager review | No provider registry/capability router/canonical AiRun pipeline; central caller still directly creates Gemini provider | Route capability requests through policy; adapt existing provider. Preserve FND-02 promotion and external-authority separation |
| HX-01 | App shell, project context, BIM scene, model/workforce/system panels, project switching | Still page-tab navigation, wide header, both BIM drawers open by default, Prime default inspector. Seven planned adapters and immersive shell absent from governed `src/lib`/components | Import and reconcile approved planning adapters once; keep world mounted, overlay workspaces; remove fallback truth from executive overview |
| HX-02 | Legacy selection/inspector/replay/event UI and inspection fields | No Universal Inspector, normalized Attention/Quality surface, compact final timeline or project+attempt What Changed marker | Depends on HX-01 shell and canonical selection. Consume FND-02 labels; do not change server event generation |
| HX-03 | Legacy BOM, Procurement, Schedule and spatial equipment/material state | No dedicated Materials/Schedule/Logistics workspaces; remaining legacy cost/quote/schedule fabrication | Depends on HX-02 bridges and planning adapters; no purchasing, routes or supplier integrations in scope |
| Academy physical/visual acceptance | Empty genesis, task progression, mobilization, finishes, actor/payload fields, views and section controls; four runtime tests pass | No physical browser evidence collected in this pass. Long-material case is a fixture-level dependency demonstration, not a general swept-volume solver | Capture faithful running Node/Express/WebGL evidence before calling P0 accepted; preserve this baseline through every stage |

### FND-03 — persistence risks and precise delivery boundary

`server/persistence/persistenceStore.ts` and `learningPersistence.ts` both write `data/db/hermes_store.json` with different root schemas. That collision is present, not merely historical documentation. `sqliteAdapter.ts` uses `INSERT OR REPLACE` for project events and many records, and can unlink a malformed SQLite database during initialization. Porting those semantics would permit history replacement or loss.

Introduce canonical organizations/projects/revisions/entities/external identities/frames/transforms/events/sources/evidence/claims/artifact metadata repositories and immutable ordered SQL migrations. Use real columns for ownership and lineage, not only opaque JSON. Event retry must be idempotent for identical content and conflict for changed content under the same ID. Claim transition plus promotion event must be atomic. Use explicit persistence-driver selection, legacy by default, with no automatic dual-write or fallback when postgres is selected.

Local artifact storage needs content hashes, immutable collision detection, project/rights metadata, traversal rejection and safe failed-transaction handling. Remote storage may remain an explicit unconfigured seam; never label local disk as verified object storage. Local XYZ must keep its FND-01 frame, not acquire a fake geographic SRID. Preserve existing runtime files; do not bulk-import the ambiguous shared JSON store.

Required gates: driver default and fail-closed configuration; artifact hash/immutable collision/traversal tests; event retry/conflict tests; legacy read without mutation; dual-owner detection; table/FK/tenant-scope checks; no-fake-SRID checks; FND-01/02 round trips. Run actual migrations and project/entity/evidence round trips against explicitly supplied `HERMES_TEST_DATABASE_URL`, including PostGIS. Without it report **NOT RUN — DATABASE UNAVAILABLE**, never substitute SQLite. Add transaction rollback and concurrent duplicate-event tests to validate the high-risk boundary. Production cutover/legacy cleanup is outside FND-03.

### FND-04 — actual BIM evidence is weaker than the planning shorthand

`server/referenceBimStore.ts` generates a HERMES reference IFC and semantic JSON fixture. `server/bimCommandEngine.ts` owns native commands and an `exportToIfcJson` debug/semantic representation with an `IFC-HASH-…` value; that is not a cryptographic hash of imported IFC bytes. Neither is an arbitrary IFC normalization service.

The current `BimWorkspaceView.tsx` imports WebIFC, but the inspected source has no `IfcAPI`, `OpenModel` or `StreamAllMeshes` call. Its rendering path constructs Three.js meshes from component data, including boxes and specialized roof/window/door geometry. Dependencies and WASM copying alone do not establish a functioning browser IFC parser. Reverify the actual reference model path in the browser; do not carry forward the planning audit's broad “browser IFC parsing” claim as proven.

Implement bounded server parsing with an existing mature parser, isolated worker/process, size limit, timeout termination, controlled temporary paths, parser version and failure report. Preserve original bytes/hash as evidence, normalize semantics, then atomically reconcile entities and source revisions. Exact valid source-context GlobalId or explicit mapping can retain identity; name/type resemblance must require review. Separate original IFC, normalized semantics, render mesh, collision proxy and canonical business entity. Preserve source revisions and removals as history.

Required matrix: IFC-01–07 (hash, server parse, valid GlobalId, reject synthetic alias, Psets, containment, materials/quantities); ID-01/02 (stable reimport, no name-only merge); DIFF-01–03 (added, removed, changed property/placement/geometry); REV-01; FAIL-01/02 (malformed, timeout/size); ART-01; QTY-01; PERSIST-01 when database exists. Also cover relationship/unchanged/review-required diff classes and no partial commit after failure. Browser acceptance must load reference and imported models, select/isolate/hide, section and measure supported geometry, verify identity/frame projection, and expose parse failure without fake replacement geometry. IDS/BCF/bSDD are seams only.

### FND-05 — evolve the existing reasoning path

`server/agentExecutionService.ts` directly instantiates `new GeminiReasoningProvider()` and starts execution records with `toolCalls: []`. `reasoningProvider.ts` and `quotaIntegrityEngine.ts` retain model-specific selection/failover policy. These substantiate a partial provider abstraction, not provider-neutral routing.

Add capability request/constraints, provider declarations/registry, routing and fallback policy, canonical AiRun and structured permitted tool-call records. Keep the current provider through an adapter and historical execution records readable. Deterministic math bypasses AI; simulation remains non-certifying. Local-only must exclude remote providers before selection and return explicit unavailable when no local adapter exists. Record evidence/context, output claims, model/version, prompt/schema hashes, validation, policy/fallback and provider-reported versus estimated usage. Do not persist hidden chain-of-thought or secrets.

Required gates: ROUTE-01–03, LOCAL-01/02, TIER0-01, FALLBACK-01/02, SIM-01, RUN-01/02, TOOL-01/02, SAFETY-01, CLAIM-01/02, REVIEW-01, COMPAT-01 and optional DB PERSIST-01 from the matrix. A second fake provider must be swappable without changing domain callers. A router result cannot promote a claim or create professional/AHJ approval. Actuator tools must be unavailable through this registry. Mocked routing tests are not live-provider acceptance; live calls require already configured approved access and budget. Real local-model deployment and weights remain later work.

### HX-01–03 — substantial reusable UI, no completed immersive program

`src/App.tsx` still conditionally mounts pages through `activeTab`. Its fallback project supplies Tampa jurisdiction/environment and numerous 100.0 scores. `BimWorkspaceView.tsx` initializes both side panels open and defaults to `PRIME_AUTONOMY`. Those are direct HX-01 targets. Existing `HermesProjectContext` should remain the state owner; import the seven planned adapters (`humanProjectStatus`, `inspectableEntity`, `materialWorkspaceState`, `projectTimelineState`, `projectAttentionState`, `projectOverviewState`, `immersiveWorkspaceRegistry`) and reconcile them with the new FND-02 types, rather than copying planning assumptions unchanged.

HX-01 gates: persistent world mount; compact identity/HUD; approximately 48px launcher; exactly one primary overlay among eight workspaces; no canvas resize; default closed inspector; keyboard shortcuts ignore text-entry controls; mobile controls usable; Model/Workforce/Systems reuse existing functionality; project switching, run/step/reset, selection and replay preserved. Unknown site/cost/quality must stay unknown. Overview counts must equal adapter outputs. Capture before/after desktop and mobile screenshots and runtime errors.

HX-02 gates: selection of component/material/actor/equipment resolves the correct inspector with Overview/Properties/Construction/Spatial/Quality/Provenance; focus/isolate/hide only when supported. Attention counts match blocking/owner-action data, resolved clashes disappear, zero inspections does not mean passed, internal/professional/AHJ/CO states remain separate. Timeline is a 40–48px collapsed overlay with view-only replay; last-seen marker keyed by project and attempt; missing CPM says not calculated; focus only with spatial evidence. Test attempt reset/switch and unknown/deleted selection. No server event fabrication or repair-action implementation.

HX-03 gates: Materials Requirements/On Site/Procurement/Installed/Exceptions counts match canonical demand and physical batches; PURCHASED plus LAYDOWN_YARD does not prove delivery. Historical residence price evidence must not leak into the live-house project. Missing cost stays not calculated. Schedule shows only recorded calculated CPM/dependencies/float/resources; Logistics uses equipment/staging/work locations/future-access evidence, without invented routes. Validate selection/focus bridges. Only remove duplicated Developer/System project tools after replacements pass browser acceptance.

Confirmed legacy truth repairs still needed: `BOMView.tsx` derives cost categories from fixed percentages when canonical breakdown is absent; `ProcurementView.tsx` prints a universal `VERIFIED_CURRENT_QUOTE` badge; `ScheduleView.tsx` falls back to `schedule.length * 10` calendar days. `BimWorkspaceView.tsx` creates provenance `verifiedDate: new Date().toISOString()` and displays fixture geotech labels. HX must consume evidence-derived labels and distinguish historical/simulated fixtures. FND-02 does not claim those UI surfaces were already rewritten.

## Academy physical acceptance and spatial proof

The four Academy tests check empty genesis, advance-to-completion, long-material ordering/envelope fields and no active clashes at closeout. They do not inspect pixels, navigate a camera, validate openings, or establish observed physical construction.

Two particularly important proof gaps:

1. `phase_3_18d_validation005_visual_gate.test.ts` sets requested/API/world/rendered IDs from the same backend state in its parity test. It cannot catch a browser displaying the wrong project.
2. `hermesLiveHouseEngine.ts` initializes `routeAfterClosureFeasible: false`, a fixed route and combined envelope. The staging task checks that flag, updates actor/material state and sets PASSED. The test verifies ordering and field sizes. This is useful fixture behavior, but not independently computed swept-volume feasibility. A long object versus doorway width alone does not settle maneuverability.

`phase1DiagnosticRunner.ts` also embeds an old commit SHA, checks a literal list length for origin completeness and substitutes expected trailer dimensions when geometry is absent. Its 15 PASS results must not be elevated into current physical proof.

Physical acceptance protocol: run the unmodified long-lived Node/Express app from an isolated source/runtime copy with WebGL; record head, project, attempt, checkpoint/event, camera/view and timestamp for each artifact. Verify browser project identity against actual API requests and visible world, independently. Capture empty land; mobilization/equipment/materials; foundation/framing; roof/openings/enclosure; MEP; close-in/finishes/completed residence; architectural/construction/X-ray/system-isolation; walkthrough; section; replay; logistics; actor payload; selected component provenance. Check console/network failures and responsive controls. Compare visible dimensions/locations against canonical data, including a known 1m segment and frame transform. Verify reset and replay do not mutate historical truth or imply approvals.

For general spatial acceptance, vary payload length/cross-section/orientation, doorway width, turning space and obstacles; compute the route/envelope result rather than seed it. Include both passable and blocked cases, equipment egress, MEP-before-ceiling and a concurrently blocked route. These are future P1/P2 or bounded acceptance-repair tasks, not changes silently included in FND-02 or HX.

No browser/visual QA was executed in this read-only reconciliation. Status is **IMPLEMENTED — NOT PHYSICALLY VERIFIED** for the vertical-slice runtime, **PARTIAL** for reusable geometry/spatial intelligence, and **UNVERIFIED** for P0 physical acceptance. A source-only review cannot certify aesthetic credibility or physical dimensions.

## One long-running Worker: safe sequence and stops

| Boundary | Can continue autonomously under a future campaign grant? | Required evidence / stop condition |
|---|---|---|
| Current FND-02 → later source changes | No under this grant | Current scope explicitly ends at FND-02. Future assignment must name remaining stages and branch/base |
| Academy baseline inspection | Yes if faithful local/authorized browser runtime is available | Record defects; browser unavailable means physical gate blocked, not implementation failure |
| FND-03 → FND-04 → FND-05 code | Yes, sequentially with separate focused checkpoints | Interfaces/tests must pass; missing DB/provider infrastructure leaves named physical gates open. No silent production cutover |
| FND-05 → HX-01 | Yes when campaign includes HX and foundation contracts are stable | Preserve Academy baseline, import planning adapters narrowly |
| HX-01 → HX-02 → HX-03 | Technically yes, same Worker | Current HX tickets require previous physical acceptance or Owner-authorized continuation. A future campaign may explicitly authorize conditional continuation with unresolved physical gates recorded; otherwise stop at those boundaries |
| Failed required tests/new regressions | Repair within authorized stage | Do not weaken tests or relabel failures. Compare genuine baseline failures and preserve evidence |
| Deploy, production migration/cutover, spend, credentials/security, live money, destructive actions | No | Separate genuine hard gates; no implied permission from source implementation |
| Grant revoked/denied/expired or material branch/project/scope change | No | Fail closed on actual grant state. Short Worker inactivity alone is not grant expiry |

At every meaningful stage: recover exact accepted source; implement only that stage; run targeted/new regression tests, typecheck and build; inspect browser when relevant; preserve Internal Forge + immutable Recovery + Accepted Head; re-bootstrap and recover/hash-check before continuing. Pending GitHub publication alone is not a stop. Context recovery should use these durable records, not restart the product or rebuild Runner bindings.

A proposed campaign grant should explicitly distinguish code completion from physical DB/provider/browser acceptance, retain all production hard gates, and name whether HX continuation may proceed when browser infrastructure is unavailable. The Project Agent prepares that bounded handoff; the Worker handles any genuinely new assignment authorization. No new assignment was created or activated by this report.

## Document reconciliation

| Document(s) | Current disposition |
|---|---|
| Foundation Hardening Master | Retain FND order and invariants. Its generic fetch-main instruction is superseded by this task's exact governed branch/base. Foundation done condition remains unmet until later code and physical persistence proofs exist |
| FND-03/04/05 source audits and handoffs | Useful design and gate references. Their prerequisite SHAs `194ad…`, `67d592…`, `e478…`, `08183…` are historical workspace lineage, not this accepted branch. Rebind to actual contracts before implementation; do not recover those commits as substitutes |
| HX-01 source audit | Statement “FND-01 through FND-05 are code-accepted” at `422328…` is not supported by this snapshot. Core UX findings remain reproducible |
| HX Consolidated Master | Retain three-pass ownership and domain requirements. Supersedes independent UI-01/NAV-01/OVERVIEW-01/ATTENTION-01/TIMELINE-01/MATERIALS-01/INSPECTOR-01 execution orders. Generic main/new-branch recipe cannot override Gateway assignment |
| Current State / Control Index | `5e6b174…` is historical. P0 physical acceptance is still unresolved. Update future operational state to the new accepted head and actual FND-02 result; do not label the entire foundation complete |
| Execution Roadmap | P0/P1/P2/P3 are program outcomes, not equivalents of FND/HX ticket completion. FND-03 is a persistence boundary, not full restart-safe distributed runtime; FND-05 is routing, not deployed local inference; HX is presentation, not reusable geometry or pathfinding |
| Visual Construction Master Reconciliation | Older top/left/right shell plan yields to HX master. “Zero Loss Guarantee” is not supported by mutable event inserts and database-reset paths. Roster/fixture claims must remain scoped to their historical evidence |
| Academy House Vertical Slice | Keep physical experience and evidence requirements. Its broad fetch-main/deployment sequence is not active authorization here; general constructability and runtime hardening claims require new measured proof |
| Existing validation documents/tests | Preserve as regression evidence, not universal certification. Current scoped pass counts and known baseline failures above supersede any blanket green statement |

The roadmap's later reusable primitives, genuine spatial reasoning, restart-safe leases/cross-process locking, local inference deployment, Academy uncertainty, robotics and scale generalization remain outside this campaign's FND/HX implementation scope. Completing six tickets alone cannot certify those outcomes.

## Evidence references

Source evidence is recoverable through Gateway at the exact accepted head above. Key paths: `src/types/hermes.ts`; `src/lib/{canonicalIdentity,canonicalSpatial,physicalUnits,projectEvidence,evidenceAdapters,truthLabels}.ts`; `server/hermesLiveHouseEngine.ts`; `server/httpSourceFetcher.ts`; `server/persistence/{sqliteAdapter,persistenceStore,learningPersistence}.ts`; `server/{referenceBimStore,bimCommandEngine,agentExecutionService,reasoningProvider,quotaIntegrityEngine,phase1DiagnosticRunner}.ts`; `src/App.tsx`; `src/components/{AppShell,BimWorkspaceView,BOMView,ProcurementView,ScheduleView}.tsx`; `src/context/HermesProjectContext.tsx`; `package.json`; focused test paths listed above.

Planning basis: [control documents branch](https://github.com/aijaraix/Hermes-Construction-1/tree/planning/hermes-control-layer-2026-09-18/docs), including Control Index, Current State, Execution Roadmap, Foundation Hardening Master, FND-03–05 audits/tickets/exact handoffs/test matrices, HX consolidated master and HX-01 audit/HX-02–03 tickets, Visual Construction Master Reconciliation and Academy House Visual Runtime Vertical Slice. Planning tree inspected at `ef41f8b62934a9ad1d9aebe1979b7b4b3836913a`; roadmap blob `36b97020ac078423ca734acf7e0a241039107ed8`, foundation-master blob `d0c2d99aff43af985e93c954561993eca42b981d`.

This report is a read-only continuation blueprint. No FND-03+, HX, deployment, main merge, spend or production/security changes were performed.
