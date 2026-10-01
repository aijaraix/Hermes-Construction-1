# Campaign engineering handoff

**FND-03, FND-04, FND-05, HX-01, HX-02 and HX-03 are implemented. Physical acceptance is BLOCKED / UNVERIFIED.** This closing HX-03 source must have a successful external Gateway checkpoint and independent recovery receipt before campaign preservation is complete. Read the live bootstrap and latest `sxc_903F37FR` receipt for that result; do not infer a future head from this document.

Project `hermes-construction`, repository role `application`, repository `aijaraix/Hermes-Construction-1`, source/target branch `feature/fnd-01-canonical-identity`. Initial accepted base `b1cb699637f23b1faf28f0d2eaa90804869d805d`. Source packages and each subsequent milestone followed distinct Forge → immutable Recovery → Accepted checkpoints, then independent complete-source recovery before the next stage.

| Preserved stage | Accepted/Forge commit | Parent |
|---|---|---|
| Execution package | `8a78923238c005254fceaf38b1c2446bd31336ca` | `b1cb699637f23b1faf28f0d2eaa90804869d805d` |
| FND-03 | `8d2de4fdc065e9602e0c03eac66c2b244499db9f` | `8a78923238c005254fceaf38b1c2446bd31336ca` |
| FND-04 | `13c96c8fdafbc68071892e3ac642de5196197787` | `8d2de4fdc065e9602e0c03eac66c2b244499db9f` |
| FND-05 | `67f8f9588c91de65b47c3f24fc2a2b2404ff08e3` | `13c96c8fdafbc68071892e3ac642de5196197787` |
| HX-01 | `886862ce6332f68fda1d4ef43a0c871fc22b9dc5` | `67f8f9588c91de65b47c3f24fc2a2b2404ff08e3` |
| HX-02 | `f9d913838bbdf06fec6399ac949843c53b648247` | `886862ce6332f68fda1d4ef43a0c871fc22b9dc5` |
| HX-03 / this source | External Gateway receipt required | `f9d913838bbdf06fec6399ac949843c53b648247` |

All receipts through HX-02 have full-tree closure PASS, Truth Audit IN_SYNC and GitHub publication PENDING. Their immutable Recovery references and source hashes are embedded in [campaign.json](campaign.json). HX-02 Recovery manifest is `722fc84a1b094bde6bc8d119bfd98ca8531f5dc78adaddc1577935b59fef1db2`; recovered source SHA-256 `7be62590a346989a8f4255460a621cb07176833e64f567d493933cda8efdd4fa`; 375 matching files. This tree cannot embed its own future commit or recovery hash; the external receipt is the final authority.

## Implemented boundaries

- FND-03: explicit transactional PostgreSQL/PostGIS foundation repository, immutable records/events and private artifact storage; no startup database cutover.
- FND-04: bounded actual IFC parser, source/artifact evidence, normalized model revisions and identity-aware diff/reconciliation; no fake parser acceptance.
- FND-05: provider-neutral capabilities, policy/budget/deadline/fallback routing, scoped safe tools and canonical AI provenance; deterministic bypass and explicit simulator boundaries.
- HX-01: persistent 3D shell, eight launcher workspaces, project identity/status and canonical executive overview.
- HX-02: canonical Universal Inspector, separate Attention/Quality authority states, view-only construction timeline and project/attempt What Changed markers.
- HX-03: Materials, Schedule and Logistics, canonical ID bridges, project-scope guards and reachable legacy truth repairs. Developer duplicate cleanup remains deferred pending physical acceptance.

Measured reports are under `docs/validation/HERMES_FND03_IMPLEMENTATION_REPORT.md`, `HERMES_FND04_IMPLEMENTATION_REPORT.md`, `HERMES_FND05_IMPLEMENTATION_REPORT.md`, `HERMES_HX01_IMPLEMENTATION_REPORT.md`, `HERMES_HX02_IMPLEMENTATION_REPORT.md` and `HERMES_HX03_IMPLEMENTATION_REPORT.md`. This last tree passes 60 UI tests, 107 foundation/Academy/quota regressions, eight Stage-C checks, typecheck and production build. Fourteen database cases are skipped. Eleven source-snapshot reducer comparisons preserve geometry/identity/topology; SSR/reducer results do not prove physical pixels.

## Open gates and known defects

- **NOT RUN — DATABASE UNAVAILABLE:** actual PostgreSQL/PostGIS migration, rollback/restart and round-trip evidence remains required; no SQLite substitute.
- **Live-provider gate NOT RUN:** mocks/simulators remain mocks. Approved configured access and an authorized no-spend/budget policy are prerequisites to any live evaluation; this campaign did not authorize spend.
- **Browser/WebGL BLOCKED / UNVERIFIED:** cloud browser security policy rejected the isolated production preview and prohibited bypass. No screenshots or physical UI/Academy acceptance. Faithful access must be available through an allowed environment before executing [visual QA](05_VISUAL_QA_PROTOCOL.md).
- **Pre-existing failures retained:** genuine reasoning 6 PASS / 5 FAIL with unchanged exact baseline comparison; synthetic PDF fixture expected two pages but observed one. No whole-repository PASS claim.
- **Publication PENDING:** GitHub publication does not invalidate preserved Forge/Recovery/Accepted source.

P0 and Owner visual acceptance are not achieved by these six implementations. Model imports, internal proof and simulation records do not establish physical construction, licensed-professional, AHJ, occupancy, legal or production approval. General primitives, swept-volume/pathfinding, distributed restart safety, local model deployment, robotics and broader Academy generalization remain outside scope. No main merge, deployment, production cutover, destructive change, force push, spend or credential/security-authority change was performed.

## Next bounded work

First verify the live Accepted source and this HX-03 checkpoint receipt, then recover/hash/compare exact source before any further work. The existing authorized engineering sequence ends at HX-03. Resolve the actual database, provider and browser access gates without bypass or invented evidence; run only their outstanding acceptance checks in isolated resources. Keep duplicated Developer/System tools until physical replacement acceptance. Any material scope/project/branch change requires its own authorization. Preserve future meaningful source changes through the same checkpoint/recovery protocol.
