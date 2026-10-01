# HERMES HX-01 COMPATIBILITY & TEST MATRIX

## Current-to-target UI mapping

| Current source | Current role | HX-01 target |
|---|---|---|
| App.tsx activeTab | page replacement | normal project world remains mounted |
| AppShell header | conventional website chrome | compact immersive identity/status |
| BimWorkspace TREE | left drawer | MODEL overlay |
| BimWorkspace WORKFORCE | left drawer | WORKFORCE overlay |
| BimWorkspace SYSTEMS/TRACE | left drawer | SYSTEMS overlay |
| BimWorkspace right inspector | always-open default/Prime | closed default; scoped compatibility |
| BimWorkspace replay/timeline | bottom controls | preserved, collapsed |
| ProjectOverviewView | page with fabricated truth | replaced by adapter-backed ProjectOverviewWorkspace |
| HermesSystemDrawer | developer + project tools mixed | Developer/System remains separate; cleanup deferred HX-03 |
| HermesProjectContext | canonical project UI context | preserve as state authority |
| immersiveWorkspaceRegistry | planning adapter | launcher source of truth |
| projectOverviewState | planning adapter | executive overview source |
| humanProjectStatus | planning adapter | status HUD source |

## Required launcher order

1. PROJECT
2. MODEL
3. MATERIALS
4. SCHEDULE
5. WORKFORCE
6. LOGISTICS
7. QUALITY
8. SYSTEMS

Developer/System is visually separated.

## Presentation rules

| Workspace | HX-01 body |
|---|---|
| Project | full initial overview |
| Model | reuse current TREE |
| Materials | truthful summary/placeholder |
| Schedule | truthful summary/placeholder |
| Workforce | reuse current WORKFORCE |
| Logistics | truthful placeholder |
| Quality | attention summary/placeholder |
| Systems | reuse current SYSTEMS/TRACE |

## Truth invariants

1. no hard-coded 82% verified quote coverage.
2. no fallback 100.0 project health.
3. no fallback Tampa owner truth when canonical location absent.
4. no provider/model branding in normal project overview.
5. no simulation fixture presented as live.
6. no project score unless canonical/provenanced.
7. no schedule duration when not calculated.
8. no cost when not calculated.
9. HERMES/professional/AHJ statuses remain distinct.
10. unknown remains unavailable.

## Renderer invariants

1. Three.js world stays mounted.
2. IFC browser path unchanged.
3. no geometry math changes.
4. no coordinate changes.
5. workspace overlay does not resize canvas.
6. selection remains functional.
7. system traces/isolation remain functional.
8. step/run/reset remain functional.

## Shell invariants

1. conventional project header removed/suppressed.
2. launcher approx 48px.
3. one primary workspace active.
4. inspector default closed.
5. Prime/autonomy not default.
6. timeline collapsed/preserved.
7. Developer/System separate.
8. Escape order deterministic.
9. Alt+1..8 works.
10. shortcuts ignored in input/editable fields.

## Foundation invariants

- FND-01 identity/frame/revision untouched
- FND-02 evidence/claim truth untouched
- FND-03 persistence/cutover untouched
- FND-04 openBIM pipeline untouched
- FND-05 AI routing untouched

## Required tests

| ID | Proof |
|---|---|
| NAV-01 | exact 8-item registry/order |
| NAV-02 | one workspace only |
| NAV-03 | active item toggles closed |
| NAV-04 | Alt+1..8 mapping |
| NAV-05 | input typing suppresses shortcut |
| OVERVIEW-01 | mode label truthful |
| OVERVIEW-02 | missing cost not fabricated |
| OVERVIEW-03 | missing schedule not fabricated |
| OVERVIEW-04 | no 82%/100/Tampa fallback in immersive overview |
| STATUS-01 | Done/Doing/Next canonical |
| SHELL-01 | inspector closed/scoped default |
| SHELL-02 | project workspace is overlay, not page replacement |

## Deferred to HX-02

- Universal Inspector
- detailed Attention drawer
- final ConstructionTimeline
- What Changed drawer
- last-seen persistence
- focus/isolate inspector actions

## Deferred to HX-03

- detailed Materials
- detailed Schedule
- detailed Logistics
- project-tool cleanup from Developer/System

## Physical acceptance targets

A valid desktop acceptance should show:

- edge-to-edge world
- narrow launcher
- compact identity/status
- no dashboard header
- Project Overview overlay
- Model overlay
- Workforce overlay
- Systems overlay
- unobstructed world when closed
- Developer/System separate

If browser unavailable, truth state remains:

**IMPLEMENTED — NOT PHYSICALLY VERIFIED**
