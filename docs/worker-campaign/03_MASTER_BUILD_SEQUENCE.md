# Master build sequence

| Stage | Deliverable | Required preservation before next stage |
|---|---|---|
| CAMPAIGN-DOCS | This repo-native execution package and frozen authoritative references | Distinct documentation checkpoint |
| FND-03 | Persistence contracts, PostgreSQL/PostGIS migration/repository, local ArtifactStore and legacy boundaries | Focused tests, regressions, typecheck/build; conditional real DB gate |
| FND-04 | Bounded mature IFC parser, normalization, immutable source revision/diff/reconciliation | Tests, regressions, typecheck/build, applicable browser gate; conditional DB gate |
| FND-05 | Capability routing, provider registry/adapters, canonical AiRun/tool provenance | Tests, regressions, typecheck/build; live-provider gate separately recorded |
| HX-01 | Persistent world shell, seven adapters, launcher and overview | Browser/visual QA plus tests/build and checkpoint |
| HX-02 | Universal Inspector, Attention/Quality, timeline/What Changed | Browser/visual QA plus tests/build and checkpoint |
| HX-03 | Materials/Schedule/Logistics and legacy UI truth repairs | Browser/visual QA plus tests/build and checkpoint |

At each boundary: recover exact latest Accepted source → inspect current milestone and relevant source → implement → focused tests → required regressions → typecheck → production build → applicable browser/visual QA → Thin checkpoint → Internal Forge → immutable Recovery → Accepted Head → recover/hash/full-tree verification → continue.

Attempt an Academy browser baseline before renderer/UI changes when a faithful already-authorized isolated runtime is available. Missing browser is BLOCKED / UNVERIFIED and does not manufacture P0 acceptance. The current Owner campaign authorizes sequential engineering continuation with the specified unavailable-gate labels; it does not authorize removing legacy UI replacements that are expressly conditional on physical acceptance.

Do not silently fold milestones together or claim P0/P1/P2/P3 outcomes from ticket completion. No HX-04 is planned. General primitives/pathfinding, distributed restart safety, local-model deployment, robotics and broader Academy generalization remain later work.
