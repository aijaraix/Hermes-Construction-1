# Approved campaign blueprint

Continuity: sxc_903F37FR, revision 1. Owner approval observed APPROVED at campaign activation.

GOVERNED START
- Project: hermes-construction
- Repository role: application
- Source branch: feature/fnd-01-canonical-identity
- Accepted Head = Internal Forge: b1cb699637f23b1faf28f0d2eaa90804869d805d
- FND-02 Recovery: sha256:569f3c47ca31f220916a891daae61409baf6437a3a4f83f7f4009babba512ac0
- Truth Audit: IN_SYNC
- FND-02 validation: 53 scoped tests PASS; typecheck/build PASS. Existing genuine-reasoning/PDF fixture failures reproduce on unchanged baseline and must not be relabeled green.
- No physical browser acceptance yet.

FIRST CAMPAIGN CHECKPOINT — WRITE THE DURABLE GITHUB EXECUTION PACKAGE
Create docs/worker-campaign/ on the governed branch, based on the accepted source-backed audit and current source, containing at minimum:
00_START_HERE.md
01_PRODUCT_MISSION_AND_NON_NEGOTIABLES.md
02_CURRENT_GOVERNED_STATE.md
03_MASTER_BUILD_SEQUENCE.md
04_ACCEPTANCE_GATES.md
05_VISUAL_QA_PROTOCOL.md
06_CHECKPOINT_AND_RECOVERY_PROTOCOL.md
07_STOP_ESCALATION_RULES.md
08_FINAL_PRODUCT_ACCEPTANCE.md
milestones/FND-03.md
milestones/FND-04.md
milestones/FND-05.md
milestones/HX-01.md
milestones/HX-02.md
milestones/HX-03.md
campaign.json
Checkpoint/preserve these docs before implementation. Thereafter use 00_START_HERE.md as the Worker entrypoint.

CAMPAIGN SEQUENCE
0. Capture Academy browser baseline if faithful local/authorized browser runtime is available. If not available, record PHYSICAL GATE BLOCKED/UNVERIFIED and continue only where campaign allows.
1. FND-03
2. FND-04
3. FND-05
4. HX-01
5. HX-02
6. HX-03
At every stage: recover exact latest Accepted source -> inspect task-specific source/docs only -> implement -> focused tests -> regressions -> typecheck/build -> browser/visual QA when relevant -> Gateway checkpoint -> Internal Forge -> immutable Recovery -> Accepted Head -> re-bootstrap/hash-check -> next stage.
Never carry meaningful work local-only. Pending GitHub publication is not a stop.

FND-03 BOUNDARY
Existing: sql.js/JSON/local files + FND01/FND02 contracts.
Missing: canonical persistence repositories, ordered PostgreSQL migrations, PostGIS boundary, ArtifactStore.
Critical risks: persistenceStore.ts and learningPersistence.ts both write data/db/hermes_store.json with incompatible schemas; SQLite uses INSERT OR REPLACE and malformed-DB unlink paths.
Implement additive repository interfaces and local artifact adapter first; legacy default remains. Explicit postgres selection must fail closed, no automatic fallback/dual-write.
Event retries: identical content idempotent; changed content same ID conflicts. Claim transition+promotion event atomic. Artifact hash/immutability/traversal/project/rights metadata.
Do not assign fake geographic SRID to local XYZ.
Actual DB migration/round-trip acceptance only with explicitly supplied HERMES_TEST_DATABASE_URL/PostGIS; otherwise report NOT RUN — DATABASE UNAVAILABLE. Never substitute SQLite.
No production cutover/bulk ambiguous JSON import.

FND-04 BOUNDARY
Existing: native BIM commands/revisions, FND01 external identity, reference IFC/semantic fixtures, Three.js projection.
Current browser WebIFC dependency is not proof of parser execution; BimWorkspace lacks demonstrated IfcAPI/OpenModel/StreamAllMeshes path.
Implement bounded server IFC parsing using mature parser, isolated process/worker, size/time limits, controlled temp paths, parser version/failure report. Preserve original bytes/hash as evidence. Normalize semantics then atomically reconcile entities/source revisions.
Exact valid source-context GlobalId or explicit mapping may retain identity; name/type similarity requires review.
Separate original IFC / normalized semantics / render mesh / collision proxy / canonical entity. Preserve removals/history.
Tests: hash, parse, GlobalId, reject synthetic alias, Psets, containment, materials/quantities, stable reimport, no name-only merge, added/removed/property/placement/geometry diff, malformed/timeout/size, artifact linkage, persistence when DB exists, no partial commit after failure.
Browser acceptance: reference/imported model load, select/isolate/hide, section/measurement where supported, identity/frame projection, real parse failure surface, no fake fallback geometry.

FND-05 BOUNDARY
Existing: ConstructionReasoningProvider, Gemini adapter, quotas/deferred, execution records, deterministic simulator, validator/manager review.
Gap: no provider registry/capability router/canonical AiRun; agentExecutionService directly instantiates Gemini; provider/model policy still model-specific.
Implement capability request/constraints, provider declarations/registry, routing/fallback, canonical AiRun, permitted tool-call records. Keep current provider via adapter, preserve historical records.
Deterministic math bypasses AI. Local-only excludes remote providers before selection and returns explicit unavailable if no local adapter. Record evidence/context/output claims/model/version/prompt/schema hashes/validation/policy/fallback/usage. No hidden chain-of-thought/secrets.
Fake second provider must be swappable without domain caller changes. Router cannot promote claims or create professional/AHJ approval. Actuator tools unavailable.
Live provider acceptance only with already configured approved access/budget; otherwise mocked routing tests do not imply live acceptance.

HX-01 BOUNDARY
Existing shell/context/BIM/model/workforce/system/project switching.
Gap: page-tab navigation, wide header, both BIM drawers open, PRIME default inspector; planned adapters absent.
Create/import/reconcile seven adapters: humanProjectStatus, inspectableEntity, materialWorkspaceState, projectTimelineState, projectAttentionState, projectOverviewState, immersiveWorkspaceRegistry, updated for FND02 truth.
Persistent world mount; compact identity/HUD; ~48px launcher; exactly one primary overlay among eight workspaces; no canvas resize; inspector closed default; keyboard shortcuts ignore text inputs; mobile usable. Reuse existing Model/Workforce/Systems. Preserve switching/run/step/reset/selection/replay.
Unknown site/cost/quality stays unknown; no fallback 100s. Overview counts equal adapter outputs.
Capture before/after desktop/mobile screenshots and runtime errors.

HX-02 BOUNDARY
Implement Universal Inspector + normalized Attention/Quality + compact What Changed/timeline on HX01 shell.
Selection component/material/actor/equipment resolves correct inspector tabs: Overview/Properties/Construction/Spatial/Quality/Provenance.
Focus/isolate/hide only when supported. Attention counts match real blocking/owner-action data; resolved clashes disappear; zero inspections != passed; HERMES/professional/AHJ/CO distinct.
Timeline 40–48px collapsed; replay view-only; last-seen keyed by project+attempt; missing CPM = not calculated; focus only with spatial evidence. Test reset/switch/deleted selection.
No fabricated server events/repair actions.

HX-03 BOUNDARY
Implement Materials/Schedule/Logistics workspaces from canonical adapters/state.
Materials counts match demand/physical batches; PURCHASED+LAYDOWN_YARD != delivered. Historical residence prices must not leak into live house. Missing cost = not calculated.
Schedule only shows recorded calculated CPM/dependencies/float/resources. Logistics uses equipment/staging/work/future-access evidence, no invented routes.
Repair known UI false truth: BOM fixed-percentage cost fabrication, universal VERIFIED_CURRENT_QUOTE procurement badge, schedule.length*10 fallback, synthetic verifiedDate, fixture geotech labels.
No purchasing/supplier integration/routes beyond evidence-supported existing data.

ACADEMY / VISUAL PROTOCOL
Tests are not pixel proof. Existing parity test compares backend-derived identities and can miss wrong browser project. Long-material current route flag is fixture behavior, not general swept-volume proof.
Faithful physical protocol: run isolated long-lived Node/Express/WebGL runtime; record head/project/attempt/checkpoint-event/camera-view/timestamp. Independently verify browser project identity against API + visible world. Capture empty land, mobilization/equipment/materials, foundation/framing, roof/openings/enclosure, MEP, close-in/finishes/completed, architectural/construction/X-ray/system isolation, walkthrough, section, replay, logistics, actor payload, selected component provenance. Check console/network/responsive controls. Compare visible dimension/location with canonical data including known 1m segment and frame transform. Reset/replay must not mutate history or imply approval.
General spatial acceptance is outside these six ticket completions unless explicitly included in a bounded repair: vary payload dimensions/orientation, doorway/turn space/obstacles and compute passable/blocked cases.

STOPS / HARD GATES
- Required test failure/new regression: repair within current authorized stage; never weaken/relabel.
- Missing browser: mark browser gate blocked/unverified; do not claim physical acceptance.
- Missing HERMES_TEST_DATABASE_URL/PostGIS: NOT RUN — DATABASE UNAVAILABLE; no fake substitute.
- Missing approved provider access/budget: live-provider gate NOT RUN; mocks remain mocks.
- No production deployment/cutover, live money/spend, credentials/security changes, destructive production or DB actions, cross-project access, force push, or main merge.
- Grant denied/revoked/expired or project/role/source branch/material scope change: fail closed.
- Short Worker inactivity is not grant expiry.

DOCUMENT RECONCILIATION
Retain Foundation Hardening Master order/invariants. Historical prerequisite SHAs in FND03–05 docs are stale; rebind to this accepted lineage.
HX Consolidated Master remains three-pass authority; independent older UI/NAV/etc execution orders are superseded.
Current State/Control Index 5e6b174 historical; operational state should use b1cb699 and FND02 result.
Execution Roadmap P0/P1/P2/P3 are outcomes, not ticket completion synonyms.
Visual Construction Master zero-loss and old shell claims are not universally proven.
Validation docs/tests are regression evidence, not physical certification.
Future reusable primitives/general pathfinding/restart-safe distributed runtime/local model deployment/robotics/generalization remain outside this campaign unless explicitly authorized later.

TRUTH LABELS
Use PHYSICALLY VERIFIED, IMPLEMENTED — NOT PHYSICALLY VERIFIED, PARTIAL, SIMULATED, BLOCKED, NOT IMPLEMENTED; absent evidence = UNVERIFIED.
Never let code/test success imply physical construction, professional/AHJ approval, legal approval, production acceptance or browser acceptance.
