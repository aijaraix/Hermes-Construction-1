# HERMES HUMAN EXPERIENCE — CONSOLIDATED IMPLEMENTATION MASTER

Status: AUTHORITATIVE execution sequence for the immersive human-facing HERMES UI
Purpose: Consolidate overlapping UI planning into the smallest safe Codex implementation sequence.

## 1. Authority and precedence

For human-experience implementation sequencing, this document supersedes the standalone execution order implied by:
- HERMES_UI_01_EXACT_FILE_BY_FILE_PATCH_PLAN.md
- HERMES_NAV_01_IMPLEMENTATION_TICKET.md
- HERMES_OVERVIEW_01_IMPLEMENTATION_TICKET.md
- HERMES_ATTENTION_01_IMPLEMENTATION_TICKET.md
- HERMES_TIMELINE_01_IMPLEMENTATION_TICKET.md
- HERMES_MATERIALS_01_IMPLEMENTATION_TICKET.md
- the INSPECTOR-01 slice described in HERMES_UNIVERSAL_INSPECTOR_IMPLEMENTATION_SPEC.md

Those documents remain authoritative detailed specifications for their domains.
They are NOT to be run as seven independent Codex passes.

If there is a sequencing/file-ownership conflict:
1. Current physical canonical runtime/source truth wins.
2. This consolidated master wins for implementation sequence and pass boundaries.
3. Domain implementation specs define behavior and truth requirements.
4. Older standalone implementation tickets provide detail only.

## 2. Why consolidation is required

UI-01 and NAV-01 both modify the same high-risk files:
- src/App.tsx
- src/components/AppShell.tsx
- src/components/BimWorkspaceView.tsx
- new immersive shell components

OVERVIEW-01 also integrates into that same shell.

ATTENTION-01, TIMELINE-01 and INSPECTOR-01 all need selection, overlay and shell integration.

Running each independently would repeatedly:
- rediscover the same source;
- move the same JSX multiple times;
- re-open renderer-adjacent code;
- re-test the same shell;
- increase merge/conflict risk;
- consume unnecessary Codex credits.

## 3. Prepared source adapters

The planning branch already contains reusable source adapters:

- src/lib/humanProjectStatus.ts
- src/lib/inspectableEntity.ts
- src/lib/materialWorkspaceState.ts
- src/lib/projectTimelineState.ts
- src/lib/projectAttentionState.ts
- src/lib/projectOverviewState.ts
- src/lib/immersiveWorkspaceRegistry.ts

These are implementation accelerators, not alternate canonical truth stores.

They must be typechecked against CURRENT main during HX-01.
Narrow compile fixes to these adapters are allowed.
Do not redesign them unless current source proves a mismatch.

## 4. Branch strategy

Do not merge the entire planning branch blindly into main.

For implementation:
1. Fetch CURRENT remote main.
2. Create an implementation branch from CURRENT main.
3. Bring in the seven approved src/lib adapters from the planning branch.
4. Read only this master plus the domain specs named by the active HX pass.
5. Implement one HX pass.
6. Build/typecheck/test/physically inspect.
7. Commit one focused pass commit.
8. Stop.

Suggested implementation branch:
feature/hermes-immersive-human-experience

Do not modify main until physical acceptance and owner-approved merge timing.

## 5. Three-pass implementation sequence

### HX-01 — Immersive Foundation + Navigation + Executive Overview

Consolidates:
- UI-01
- NAV-01
- OVERVIEW-01
- human status HUD foundation

Why together:
These all touch App.tsx / AppShell.tsx / BimWorkspaceView.tsx / ImmersiveProjectShell and should be implemented once.

Deliver:
- full-screen immersive world shell
- conventional header removed from live BIM workspace
- 48 px launcher rail
- one-primary-workspace overlay behavior
- Project / Model / Materials / Schedule / Workforce / Logistics / Quality / Systems launcher targets
- reuse current Model / Workforce / Systems content
- separated Developer/System control
- compact project identity/status
- Project Overview workspace using projectOverviewState
- Done / Doing / Next
- summary Attention and What Changed counts
- placeholder/mount surfaces for bodies not yet built
- existing inspector closed by default
- existing timeline preserved/collapsed pending HX-02

Do not build full Universal Inspector, full Attention drawer, full What Changed drawer, or full Materials workspace in HX-01.

### HX-02 — Observability: Inspector + Attention + Timeline

Consolidates:
- INSPECTOR-01
- ATTENTION-01
- TIMELINE-01

Why together:
They share selected-entity state, focus/isolation actions, shell overlays, event context and human evidence display.

Deliver:
- Universal Inspector
- inspectable entity normalization integration
- component/material/actor/equipment inspection
- Quality/Attention workspace and drawer
- owner decision / blockers / clashes / inspections / professional / AHJ states
- compact ConstructionTimeline
- expanded timeline/replay
- What Changed drawer
- project+attempt last-seen marker
- truth-safe schedule normalization/display
- focus actions only where canonical spatial evidence exists

At end of HX-02, the human can understand state, inspect objects, see what changed and see what requires action.

### HX-03 — Operations Workspaces: Materials + Schedule + Logistics

Consolidates:
- MATERIALS-01
- detailed Schedule workspace body already backed by projectTimelineState
- initial Logistics workspace
- migration of normal project data tools out of Developer/System after replacement verification

Deliver:
- Materials workspace
- Requirements / On Site / Procurement-state / Installed / Exceptions
- canonical cost truth
- Schedule workspace using calculated schedule only
- Logistics workspace using equipment, material staging, work locations and constructability proof
- no fabricated routes/deliveries
- 3D focus/selection bridges
- truth repairs for any legacy BOM/Procurement/Schedule UI still reachable
- remove/hide duplicated normal project workspaces from Developer/System only after replacements pass acceptance

## 6. No fourth planned implementation pass

There is no planned HX-04 for the initial human shell.

Physical acceptance defects discovered after HX-01/02/03 should be fixed as bounded repair commits.

Future product work such as command palette, customer presentation mode, purchasing actions, desktop packaging, predictive analytics and robotics are separate roadmap items.

## 7. Overlap/conflict resolutions

### UI-01 vs NAV-01
Resolution: HX-01 owns both shell restructuring and launcher extraction.
Do not implement UI-01 first and then restructure again for NAV-01.

### Legacy right inspector vs Universal Inspector
Resolution:
- HX-01 closes legacy inspector by default and preserves functionality.
- HX-02 replaces the normal selected-entity experience with Universal Inspector.

### Legacy BimWorkspace timeline vs ConstructionTimeline
Resolution:
- HX-01 preserves a collapsed functional timeline without redesigning it deeply.
- HX-02 owns final compact/expanded ConstructionTimeline and What Changed.

### Project Overview vs Attention/Timeline/Materials bodies
Resolution:
- HX-01 may render overview summaries immediately because the adapters already exist.
- Deep drawers/workspaces are implemented in HX-02/HX-03.

### Materials vs Procurement vs Logistics
Resolution:
- MATERIALS owns demand, physical batches and procurement lifecycle/status.
- LOGISTICS owns spatial staging/equipment/work-location/route concepts.
- Supplier/price evidence remains separate truth and may display Not connected for live project.

### Systems vs Developer/System
Resolution:
- SYSTEMS launcher means building systems and traces.
- Developer/System means HERMES internals, Academy, knowledge, audits and health.

### Project data engines in HermesSystemDrawer
Resolution:
Do not remove them early.
Once replacement project workspaces physically pass, remove/hide duplicated project-data entries from Developer/System.

## 8. File ownership by pass

HX-01 primary hotspots:
- src/App.tsx
- src/components/AppShell.tsx
- src/components/BimWorkspaceView.tsx
- src/components/immersive/ImmersiveProjectShell.tsx
- src/components/immersive/ProjectLauncherRail.tsx
- src/components/immersive/InternalWorkspaceSurface.tsx
- src/components/immersive/ProjectIdentityChip.tsx
- src/components/immersive/ProjectStatusHUD.tsx
- src/components/immersive/ProjectOverviewWorkspace.tsx
- seven prepared src/lib adapters

HX-02 primary hotspots:
- src/components/immersive/UniversalInspector.tsx
- inspector tabs/components
- src/components/immersive/AttentionChip.tsx
- src/components/immersive/AttentionDrawer.tsx
- src/components/immersive/ConstructionTimeline.tsx
- src/components/immersive/WhatChangedDrawer.tsx
- BimWorkspace selection/replay integration only as required

HX-03 primary hotspots:
- src/components/immersive/MaterialsWorkspace.tsx
- src/components/immersive/ScheduleWorkspace.tsx
- src/components/immersive/LogisticsWorkspace.tsx
- optional legacy BOMView/ProcurementView/ScheduleView truth repairs
- HermesSystemDrawer cleanup only after replacement acceptance

## 9. Credit-conservation rules

Codex must not crawl the full docs directory.

For each pass, read:
1. this master
2. the merged HX ticket
3. only the domain specs named in that ticket
4. current source files being modified

Do not ask Codex to rediscover product architecture.

Do not let Codex independently choose navigation, labels, truth policy, workspace hierarchy or pass boundaries.

## 10. Adapter dependency graph

humanProjectStatus
  → projectTimelineState

materialWorkspaceState

projectAttentionState

projectTimelineState + projectAttentionState + materialWorkspaceState + humanProjectStatus
  → projectOverviewState

inspectableEntity
  → Universal Inspector

immersiveWorkspaceRegistry
  → launcher/shell

Therefore HX-01 should import/typecheck all prepared adapters once.

## 11. Acceptance cadence

Every HX pass must:
- build/typecheck;
- run relevant existing tests;
- preserve Academy House runtime behavior;
- avoid committing runtime-generated persistence files;
- produce physical browser screenshots when possible;
- truthfully report if WebGL/browser acceptance is blocked;
- stop at pass boundary.

Do not accept a pass from build success alone.

## 12. Merge cadence

Preferred:
- one focused commit per HX pass on the same implementation branch;
- preview after each pass;
- owner visual acceptance;
- merge timing decided after acceptance.

Do not create seven branches for seven old tickets.

## 13. Implementation order

AUTHORITATIVE ORDER:

1. HERMES-HX-01
2. HERMES-HX-02
3. HERMES-HX-03

No standalone UI-01/NAV-01/OVERVIEW-01/ATTENTION-01/TIMELINE-01/MATERIALS-01/INSPECTOR-01 execution should occur outside these consolidated passes unless this master is explicitly revised.