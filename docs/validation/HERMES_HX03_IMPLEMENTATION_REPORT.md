# HX-03 measured implementation report

**IMPLEMENTED — NOT PHYSICALLY VERIFIED.** All executed required engineering checks pass. Physical browser acceptance is blocked; Owner-authorized conditional continuation does not grant physical, professional or municipal acceptance.

Implementation base: Accepted/Forge `f9d913838bbdf06fec6399ac949843c53b648247`, parent HX-01 `886862ce6332f68fda1d4ef43a0c871fc22b9dc5`. The independent HX-02 recovery matched all 375 source files and SHA-256 `7be62590a346989a8f4255460a621cb07176833e64f567d493933cda8efdd4fa`; Recovery manifest `722fc84a1b094bde6bc8d119bfd98ca8531f5dc78adaddc1577935b59fef1db2`. Same project, application role and `feature/fnd-01-canonical-identity` branch. This tree's resulting commit and Recovery manifest must be read from its external Gateway receipt; a source document cannot contain its own future commit hash.

## Delivered behavior

MaterialsWorkspace has Overview, Requirements, On Site, Procurement, Suppliers & Price Evidence, Installed and Exceptions. It reads current canonical BOM demand and physical batches as separate layers. Requirement search, quantities/units/source, waste/procurement quantity, scoped unit/line estimates and exact component links are available when recorded. Batches expose recorded lifecycle/location, supplier text, legacy verification status, assignment, carrier, staging, dimensions, checkpoint and movement history. Summary counts and On Site use the same predicate; installed/consumed records do not imply partial-consumption accounting.

Missing quantity, unit, cost and source stay unknown. Explicit zero values survive fallback selection, invalid numerical costs are excluded and cents are retained in currency rendering. PURCHASED + LAYDOWN_YARD remains unverified even if a conflicting legacy status says STAGED or DELIVERED. Damage, waste and return states remain visible alongside delivery conflicts. An explicit offsite/transit location is excluded from on-site counts. No fuzzy name joins, inferred orders, purchases or batch-to-demand reconciliation.

Legacy BOM/supplier input requires explicit matching project scope, with matching attempt when provided. Canonical records with conflicting project/attempt IDs are excluded. Historical RESIDENCE-TAMPA-001 records cannot become live HERMES-LIVE-HOUSE-001 prices through fallback. The normal project does not have a connected supplier/PriceEvidenceRecord API: supplier identity and verified price evidence remain **Not connected**, not zero verified quotes. Recorded supplier text and the legacy `verifiedProducts` property do not establish verified quotes. No procurement server API, supplier integration, purchasing or payment was added.

ScheduleWorkspace uses the existing human timeline adapter, with explicit NOT_CALCULATED versus canonical calculated activities. ID/name, status, duration, early/late dates, total float, recorded criticality, dependencies, trade, equipment and component links are shown without fabricated defaults. The schedule horizon is available only if all canonical early finishes are finite and nonnegative. It is labeled as a recorded schedule horizon, not a verified calendar duration. Missing inspection/equipment fields remain unknown. The workspace does not duplicate replay controls or mutate live project history.

LogisticsWorkspace shows current equipment, status and actual assignments, finite work/target positions, material staging, exact zone/batch relationships, active-task required resource IDs, and recorded constructability/future-access proof. Requirements are not represented as allocated resources. Internal access proof is qualified; absent proof remains absent. Routes, reservations, A*, swept-volume solutions and robot paths are not invented.

OperationsRecordLinks resolves existing current canonical IDs before inspection; focus requires a finite recorded position. Unknown/foreign IDs are disabled. Shared context inspection and existing explicit camera focus remain the bridges. Actor renderer aliases, including the unprefixed customer, are used consistently for highlighting/isolate/hide without changing canonical identity. Physical bridge behavior is unverified.

Reachable legacy BOMView, ProcurementView and ScheduleView now reuse canonical workspace bodies, removing fixed-percentage cost splits, universal verified-quote badges, `schedule.length * 10`, synthetic inspection approvals and equipment defaults. Unscoped legacy props do not become current project facts. Their Inspector actions remain available; camera focus is disabled in legacy wrappers that lack a camera bridge.

Generated renderer provenance no longer invents `verifiedDate`; source-provided provenance is retained. Generic geotechnical metadata no longer invents soil/bearing values or a passed inspection. Fixture survey/geotech labels explicitly identify simulation, and the tree label uses the actual record name instead of a fixed 190 kPa claim. Overview qualifies fixture/import geotechnical origins. Mesh generation, spatial coordinates and source topology are preserved.

Developer/System entries for normal project data are **retained**. Their removal is explicitly conditional on physical replacement acceptance, which this Worker cannot establish.

## Measured validation

| Gate | Result |
|---|---|
| HX-03 focused tests | 24 PASS |
| Retained HX-02 and HX-01 tests | 18 + 18 PASS |
| FND-03/04/05, FND-02/01, Academy, backend visual-gate and quota regressions | 107 PASS; 14 PostgreSQL cases skipped |
| Existing Stage-C BIM proof | 8 PASS |
| TypeScript / production build | PASS / PASS; both exit 0 |
| Actual saved live-house snapshot, reducer comparison against accepted HX-02 | 11 checkpoint positions match geometry, identity and topology; provenance/property/inspection metadata excluded intentionally |
| Authoring versus validated implementation/test source | Byte-for-byte match |

Exact commands, exit codes and stdout SHA-256 values are in [HERMES_HX03_GATE_EVIDENCE.json](HERMES_HX03_GATE_EVIDENCE.json). Tests run in a disposable copy; child processes receive PATH, NODE_ENV=test and NO_COLOR, without provider credentials. Production build precedes parser regressions so the actual bounded parser path exists. Final UI tests/typecheck/build were repeated after fixing damage/return visibility under a simultaneous delivery conflict. No existing tests were weakened. Protected source data/persistence bytes and all server source remain unchanged from HX-02. Existing Vite large-chunk warnings remain.

Known unrelated genuine-reasoning results remain **6 PASS / 5 FAIL**, with exact baseline/candidate comparison preserved at FND-05. The legacy synthetic PDF baseline still expected two pages and observed one. No entire-repository green claim is made.

## Physical gates and remaining acceptance

**NOT RUN — DATABASE UNAVAILABLE.** No configured PostgreSQL/PostGIS integration infrastructure; fourteen database cases skipped, no SQLite substitute.

**Live-provider gate NOT RUN.** FND-05 routing tests use test adapters/SDK mocks. No live provider, spend or provider availability claim.

**Browser/WebGL BLOCKED / UNVERIFIED.** HX-01's actual isolated production application was available, but the cloud browser explicitly rejected its URL through security policy and prohibited workarounds. The earlier FND-04 attempt produced `net::ERR_BLOCKED_BY_CLIENT`. This is a browser security restriction, not bot detection. No alternate host, proxy, deployment, raw browser command or other bypass was attempted. No physical screenshots, mobile/desktop geometry, keyboard/pointer/focus, overlay/camera, replay-motion or WebGL acceptance evidence exists. SSR markup and reducer comparisons are code evidence only.

Physical material/schedule/logistics acceptance, independent API-versus-visible-world identity, viewport/pixel checks and Owner visual acceptance remain open under the visual QA protocol. Only after replacements pass that gate may duplicated Developer project tools be removed. Production cutover, professional/AHJ/occupancy acceptance, general spatial primitives/pathfinding, local-model deployment and robotics remain outside this campaign.

## Preservation

Preserve this complete tree through Thin Gateway → Internal Forge → immutable Recovery → Accepted Head. Require the child of `f9d913838bbdf06fec6399ac949843c53b648247`, Forge/Accepted equality, Truth Audit IN_SYNC, independent archive hash and complete path/content/mode closure. Only the resulting Gateway/recovery receipt completes this milestone's preservation gate. GitHub publication PENDING is nonblocking. There is no authorized HX-04 in this sequence.
