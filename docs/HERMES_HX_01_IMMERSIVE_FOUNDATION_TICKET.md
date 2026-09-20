# HERMES-HX-01 — IMMERSIVE FOUNDATION + NAVIGATION + EXECUTIVE OVERVIEW

CONTROLLING TICKET: HX-01

## Read only

1. docs/HERMES_HUMAN_EXPERIENCE_CONSOLIDATED_IMPLEMENTATION_MASTER.md
2. docs/HERMES_UI_01_EXACT_FILE_BY_FILE_PATCH_PLAN.md
3. docs/HERMES_IMMERSIVE_LAUNCHER_WORKSPACE_INTERACTION_SPEC.md
4. docs/HERMES_PROJECT_OVERVIEW_EXECUTIVE_HOME_SPEC.md
5. docs/HERMES_IMMERSIVE_REACT_COMPONENT_STATE_ARCHITECTURE.md

Do not crawl other planning docs.

## First action

Fetch CURRENT remote main.
Preserve legitimate newer work.
Create/continue feature/hermes-immersive-human-experience from current main.

Bring these prepared files from planning/hermes-control-layer-2026-09-18 into the implementation branch:
- src/lib/humanProjectStatus.ts
- src/lib/inspectableEntity.ts
- src/lib/materialWorkspaceState.ts
- src/lib/projectTimelineState.ts
- src/lib/projectAttentionState.ts
- src/lib/projectOverviewState.ts
- src/lib/immersiveWorkspaceRegistry.ts

Typecheck them. Narrow compile fixes are allowed.

## Objective

Perform the shell restructuring ONCE.

Deliver:
- edge-to-edge world
- no conventional live-project header
- left/right legacy panels closed by default
- Prime not default visible
- 48 px project launcher
- eight registry items
- one primary workspace at a time
- Model / Workforce / Systems reuse
- separated Developer/System
- compact project identity/status
- Project Overview workspace from projectOverviewState
- Done/Doing/Next
- Attention + What Changed summary counts
- launcher placeholders for remaining bodies
- timeline preserved/collapsed
- existing selection/runtime actions preserved

## Do not

Do not build full Universal Inspector.
Do not build full Attention drawer.
Do not build final ConstructionTimeline/What Changed drawer.
Do not build full Materials/Schedule/Logistics bodies.
Do not refactor renderer math/geometry.
Do not touch server runtime.

## Key source files

- src/App.tsx
- src/components/AppShell.tsx
- src/components/BimWorkspaceView.tsx
- new src/components/immersive/* shell/rail/overview components

## Acceptance

1. World visually dominates.
2. Rail is narrow and professional.
3. Project Overview opens over world.
4. Model/Workforce/Systems open as overlays and do not resize world.
5. Overview contains no fabricated 82% quotes, 100 scores, Tampa fallback truth or fake green quality.
6. Mode Live/Simulation/Test is clear.
7. Done/Doing/Next matches adapter.
8. Existing step/run/reset and selection still function.
9. Developer/System remains reachable.
10. Build/typecheck pass.
11. Physical screenshot acceptance performed or truthfully blocked.

Commit one focused HX-01 commit and STOP.