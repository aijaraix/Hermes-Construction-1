# HX-01 measured implementation report

**IMPLEMENTED — NOT PHYSICALLY VERIFIED.** Engineering continuation is conditional under the approved campaign. This report does not grant browser, physical construction, professional, municipal or production acceptance.

Implementation base: Accepted/Forge `67f8f9588c91de65b47c3f24fc2a2b2404ff08e3`. Independently recovered source SHA-256 `b66d4666544ef64ed4acf6a2e95b12ed30f0c87ba7b32fa8a2885a8e5ade7582`; all 344 files matched the FND-05 candidate. Same project, application role and `feature/fnd-01-canonical-identity` branch. No planning branch merge. The external Gateway receipt supplies the resulting commit and Recovery manifest.

## Delivered and scoped review

- Persistent BimWorkspace mount; AppShell suppresses conventional chrome while retaining project/fixture modals and Developer/System compatibility. Page replacement routes are removed from normal navigation; old component files remain.
- Eight ordered launcher controls, one primary workspace, toggle-to-close, Alt+1–8 with typing guards, deterministic Escape priority, mobile primary controls with More. Launcher is 48 CSS pixels on desktop; panels and timeline are absolute overlays. These are source/markup facts, not measured pixels.
- Compact project identity and mode, connection status, canonical phase and Done/Doing/Next. New overview uses the seven prepared adapters, never the fallback DigitalTwinProject environment, heartbeat zeros or 100 scores. Cost, schedule, site and external approvals remain explicitly unavailable when absent.
- Existing Model/Workforce/Systems bodies reused. Search and visibility/isolation controls use existing component records and rendering state. Trace controls traverse only recorded connections in the selected system; they do not infer service direction or certify the system. No IFC parsing, mesh construction, coordinate projection or geometry algorithm changed. Explicit Fit can act even when auto-follow is disabled.
- Legacy inspector is closed/scoped initially; no-selection opening no longer defaults to Prime. Context owns selection/inspector visibility. Prime, audits and legacy replay detail/transcript remain explicit advanced access. Duplicate top banners are suppressed in normal mode without changing world animation or projection.
- Collapsed replay retains play/pause, scrub and speed; expanded controls preserve step/run/reset with an explicit reset confirmation. Final human timeline belongs to HX-02.
- Materials, Schedule, Logistics and Quality expose truthful snapshots pending their planned deeper passes. No fake deliveries, supplier quotes or new backend fields were created.
- Project responses are scoped by project and generation to prevent A→B→A stale responses; switching clears world/selection/inspector and entity-specific filters. Missing completion remains unknown; incomplete BOM pricing no longer sums missing values as zero. Phase completion requires recorded tasks.

Only client presentation/context/types, prepared adapters, focused tests and campaign documentation changed. The constructability proof field is an optional declaration of existing runtime data, not new server behavior. Server foundations, existing test assertions and protected data/reference fixtures are unchanged.

Prepared source blob identities and the three additionally consulted domain specs are frozen under `docs/worker-campaign/references/`. Historical new-branch/STOP instructions are superseded by this approved sequential campaign.

## Executed gates

All runtime/test commands used disposable source copies and omitted provider credentials.

| Gate | Measured result |
|---|---|
| HX-01 focused adapters/navigation/SSR | 18 PASS; includes mode, unknown cost/schedule/completion, external approvals, single initial canvas, closed panels and project-response races |
| FND-01 through FND-05 / Academy / backend visual / quota | 107 PASS; 14 database integration cases skipped |
| Stage-C BIM proof | 8 PASS: empty project, wall geometry/material links, door hosting, pipe graph, save/reload, IFC export, training lock |
| TypeScript | PASS, exit 0 |
| Production build | PASS, exit 0; existing Vite large-chunk warning |
| Disposable production server | Booted on port 3000; inherited PDF/XRef diagnostics present; stopped after visual gate attempt |

Commands:

```sh
node node_modules/vitest/vitest.mjs run --maxWorkers=2 src/lib/__tests__/hx01_immersive.test.tsx
node node_modules/vitest/vitest.mjs run --maxWorkers=2 server/__tests__/fnd05_ai_capability_router.test.ts server/__tests__/fnd05_postgres.integration.test.ts server/__tests__/fnd04_openbim.test.ts server/__tests__/fnd04_postgres.integration.test.ts server/__tests__/fnd03_persistence_contract.test.ts server/__tests__/fnd03_postgres.integration.test.ts server/__tests__/fnd02_evidence_provenance.test.ts server/__tests__/fnd01_canonical_spatial_identity.test.ts server/__tests__/academy_house_001_vertical_slice.test.ts server/__tests__/phase_3_18d_validation005_visual_gate.test.ts server/__tests__/phase_3_18a2_quota_integrity.test.ts
npm run lint
npm run build
```

Stage-C uses the existing `StageCBimProofTests.runAllTests()` in a disposable runner, exits nonzero on any failed result, and runs through `node --import tsx`. The tsx CLI initially hit its unsupported temporary IPC socket; using the normal Node loader executed the same proof without that optional CLI server. No assertion changed.

The FND-05 genuine reasoning comparison remains 6 PASS / 5 pre-existing FAIL; no server reasoning code changed in HX-01, so that unchanged boundary was not rerun. The full repository suite is not claimed green.

## Physical gates and remaining acceptance

**Browser/WebGL: BLOCKED / UNVERIFIED.** Earlier isolated app navigation returned `net::ERR_BLOCKED_BY_CLIENT`. For HX-01, the production app booted, but selecting the existing preview tab was rejected by the cloud browser URL security policy. No workaround, alternate browser or public deployment was attempted. Desktop/mobile screenshots, blank-viewport checks, canvas pixel dimensions, actual focus/keyboard interaction, replay motion and visual dominance remain unverified. SSR markup and source layout tests do not replace these gates.

**NOT RUN — DATABASE UNAVAILABLE.** Real PostgreSQL/PostGIS remains unavailable; no SQLite substitute. **Live-provider gate NOT RUN**; mocks remain mocks. No paid model or provider action occurred.

Legacy Developer/System contains historical demonstration views and duplicate project tools. They remain reachable until replacements pass physical acceptance; their fallback data is isolated from the new owner overview. Exact physical screenshot checklist remains in the frozen HX-01 compatibility matrix and campaign visual protocol.

## Preservation

Full source must be checkpointed through Thin Gateway → Internal Forge → Immutable Recovery → Accepted Head, then independently downloaded and compared. Do not begin HX-02 until that closure passes. Publication may remain PENDING. Final milestone completion remains conditional on outstanding physical gates.
