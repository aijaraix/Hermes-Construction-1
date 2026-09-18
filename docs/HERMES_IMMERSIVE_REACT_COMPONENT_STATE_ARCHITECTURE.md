# HERMES IMMERSIVE REACT COMPONENT + STATE ARCHITECTURE

**Status:** Source-audited implementation specification  
**Purpose:** Define the exact React component boundaries and state ownership for the immersive HERMES project workspace before any large refactor is handed to Codex.

## 1. Source reality

Current UI responsibilities are concentrated in four areas:

- `src/context/HermesProjectContext.tsx`
- `src/components/AppShell.tsx`
- `src/App.tsx`
- `src/components/BimWorkspaceView.tsx`

The project context already owns important global project/runtime state:

- active project;
- world state;
- connection state;
- playback state;
- playback speed;
- selected entity;
- inspector open state;
- project actions: step/run/reset/intake/simulate;
- project/modal actions.

The current workspace duplicates some of this state locally, especially:

- selected component/entity;
- replay/playback;
- replay speed;
- inspector visibility.

That duplication should be reduced during the immersive UI migration.

## 2. Architectural rule

Do not create another application state system.

Use:

### Canonical project/runtime state
`HermesProjectContext`

### Workspace-only UI state
A new lightweight local workspace controller/hook.

Recommended:

`useImmersiveWorkspaceState()`

Do not put ephemeral panel/tool state into backend world state.

Do not put canonical construction state into UI-only state.

## 3. Component tree

Target project shell:

```
HermesProjectProvider
  └─ ImmersiveProjectShell
      ├─ ConstructionViewport
      │   └─ BimWorldRenderer
      │
      ├─ ProjectIdentityChip
      ├─ ProjectLauncherRail
      ├─ CommandPalette
      ├─ ViewModeToolbar
      ├─ NavigationToolbar
      ├─ ProjectStatusHUD
      ├─ ConstructionTimeline
      │
      ├─ InternalWorkspaceDrawer
      │   ├─ ModelBrowser
      │   ├─ ObjectBrowser
      │   ├─ MaterialBrowser
      │   ├─ ScheduleWorkspace
      │   ├─ WorkforceWorkspace
      │   ├─ LogisticsWorkspace
      │   ├─ QualityIssuesWorkspace
      │   └─ ProjectOverviewWorkspace
      │
      ├─ UniversalInspector
      │   ├─ ObjectTab
      │   ├─ MaterialsTab
      │   ├─ ProvenanceTab
      │   ├─ ConstructionTab
      │   ├─ SpatialTab
      │   ├─ SystemsTab
      │   ├─ CommercialTab
      │   ├─ AnalysisTab
      │   ├─ ProjectPrimeTab
      │   └─ AuditTab
      │
      └─ DeveloperSystemDrawer
```

## 4. Component responsibilities

### 4.1 ImmersiveProjectShell

New component:

`src/components/immersive/ImmersiveProjectShell.tsx`

Responsibilities:

- full-screen relative positioning context;
- render viewport edge-to-edge;
- mount all floating tools;
- mount drawers/inspector;
- keyboard shortcuts;
- manage workspace-only panel state;
- never own canonical project data.

Must not:

- perform BIM reduction;
- create Three.js scene;
- call backend project mutation APIs directly;
- invent project status.

Consumes project context and workspace state.

## 5. ConstructionViewport

New component:

`src/components/immersive/ConstructionViewport.tsx`

Responsibilities:

- reserve 100% available shell area for world;
- host renderer;
- route selection callbacks;
- route camera/tool commands into renderer controller.

Initial implementation should wrap existing BimWorkspace rendering logic rather than rewrite it.

## 6. BimWorldRenderer extraction

Longer-term component:

`src/components/bim/BimWorldRenderer.tsx`

Extract from `BimWorkspaceView.tsx` only after UI shell is stable.

Own:

- Three.js scene;
- camera;
- orbit controls;
- mesh lifecycle;
- clipping planes;
- highlighting;
- visibility;
- raycasting;
- fit-view;
- world-space labels/overlays;
- selected/hovered visual treatment.

Input:

- reduced canonical components;
- visual mode;
- system visibility;
- section settings;
- selected entity ID;
- trace IDs.

Output callbacks:

- `onSelectEntity(id)`
- `onHoverEntity(id)`
- `onCameraChanged(...)`

The renderer must remain construction-state agnostic.

## 7. ProjectIdentityChip

Compact top-left floating control.

Displays:

- project name;
- current phase;
- connection indicator;
- optional environment badge.

Click opens project switcher.

Replaces much of the current conventional `AppShell` header.

Do not show:

- Phase 3.17B labels;
- internal build phase;
- internal validation terminology;
- developer state.

## 8. ProjectLauncherRail

New:

`src/components/immersive/ProjectLauncherRail.tsx`

Default:

- icon-only;
- floating;
- approximately 44–52 px wide;
- does not permanently reserve layout width.

Launchers:

- Project;
- Model;
- Materials;
- Schedule;
- Workforce;
- Logistics;
- Quality;
- Systems;
- Documents;
- Academy;
- Developer.

Click:

`setActiveWorkspace('MATERIALS')`

Click same item again or Esc:

close.

## 9. InternalWorkspaceDrawer

New generic component:

`src/components/immersive/InternalWorkspaceDrawer.tsx`

Props:

```
type WorkspaceKind =
  | 'PROJECT'
  | 'MODEL'
  | 'MATERIALS'
  | 'SCHEDULE'
  | 'WORKFORCE'
  | 'LOGISTICS'
  | 'QUALITY'
  | 'SYSTEMS'
  | 'DOCUMENTS'
  | 'ACADEMY'
  | null
```

Characteristics:

- overlays canvas;
- optional dock/pin later;
- resizable later;
- closed by default;
- does not navigate away from project.

Existing page components may initially be mounted inside this drawer with minimal changes.

This lets us reuse existing work before redesigning each page.

## 10. UniversalInspector

New:

`src/components/immersive/UniversalInspector.tsx`

Default:

closed.

Open automatically when an entity is selected.

Uses:

`selectedEntityId` from `HermesProjectContext`

Primary tabs:

```
OBJECT
MATERIALS
PROVENANCE
CONSTRUCTION
SPATIAL
SYSTEMS
COMMERCIAL
ANALYSIS
PROJECT_PRIME
AUDIT
```

Tab visibility can depend on selected entity.

No selected entity:
- Project/Prime and Audit remain available if explicitly opened.

Selected object:
- Object tab default.

Selected actor:
- Spatial/Construction default.

Selected material:
- Materials default.

## 11. ViewModeToolbar

New:

`src/components/immersive/ViewModeToolbar.tsx`

Workspace-local state:

```
type VisualMode =
  | 'ARCHITECTURAL'
  | 'CONSTRUCTION'
  | 'XRAY'
  | 'SECTION'
  | 'WALKTHROUGH'
  | 'LOGISTICS'
  | 'SPATIAL'
```

Current source already supports:

- ARCHITECTURAL;
- CONSTRUCTION;
- XRAY.

Section/walkthrough behavior should be wired to existing capabilities if present, not faked.

Toolbar should be compact and icon-first.

## 12. NavigationToolbar

New:

`src/components/immersive/NavigationToolbar.tsx`

Tools:

- Select;
- Orbit;
- Pan;
- Fit;
- Measure;
- Section;
- Home/View Cube later.

It emits commands to renderer via a ref/controller, not backend state.

Recommended renderer controller contract:

```
interface BimViewportController {
  fitView(): void
  focusEntity(id: string): void
  setSectionPlane(axis: 'X'|'Y'|'Z', value: number): void
  clearSection(): void
  enterWalkthrough(): void
  exitWalkthrough(): void
}
```

## 13. ProjectStatusHUD

New:

`src/components/immersive/ProjectStatusHUD.tsx`

Derived exclusively from current canonical world state.

Shows only:

- human phase name;
- completion %;
- current work;
- next work;
- blockers count.

Example:

```
FRAMING • 61%

NOW
Exterior west wall framing

NEXT
Roof truss staging

2 items need attention
```

Click opens Project Overview workspace.

No internal agent IDs by default.

## 14. Human status adapter

New pure helper:

`src/lib/humanProjectStatus.ts`

Purpose:

Translate canonical state into human-readable project status.

Input:

`HermesWorldState`

Output:

```
interface HumanProjectStatus {
  phaseLabel: string
  completionPct: number
  currentWorkLabel: string
  nextWorkLabel: string
  blockers: HumanBlocker[]
  completedMilestones: string[]
  currentMilestone: string
  upcomingMilestones: string[]
}
```

This is presentation logic only.

Never mutate canonical state.

Never declare completion unless canonical state supports it.

## 15. ConstructionTimeline

New:

`src/components/immersive/ConstructionTimeline.tsx`

Use project/context playback state rather than duplicate it.

Canonical ownership:

- `playbackState` → HermesProjectContext
- `playbackSpeed` → HermesProjectContext

Workspace-only:

- expanded/collapsed;
- selected replay index if replay is local until context is extended.

Default:

collapsed thin scrubber.

Expanded:

- phases;
- tasks;
- event stream;
- revision markers;
- inspections;
- deliveries.

## 16. CommandPalette

New:

`src/components/immersive/CommandPalette.tsx`

Initial version does not need LLM.

Support deterministic commands first:

- open materials;
- open schedule;
- isolate plumbing;
- isolate electrical;
- fit view;
- show all;
- x-ray;
- construction view;
- go to checkpoint N;
- select entity ID/name.

Later natural-language routing can use same interface.

Keyboard:

`Ctrl/Cmd + K`

## 17. DeveloperSystemDrawer

Keep existing:

`HermesSystemDrawer.tsx`

But move its launcher behind:

- Developer icon;
- keyboard command;
- advanced role.

Do not expose it as normal construction chrome.

Current Academy/system/diagnostic views can remain here.

## 18. State ownership matrix

| State | Current | Target owner |
|---|---|---|
| activeProjectId | HermesProjectContext | HermesProjectContext |
| worldState | HermesProjectContext | HermesProjectContext |
| connectionStatus | HermesProjectContext | HermesProjectContext |
| playbackState | HermesProjectContext | HermesProjectContext |
| playbackSpeed | Context + local duplicate | HermesProjectContext |
| selected entity/component | Context + local duplicate | HermesProjectContext |
| inspector open | Context + local duplicate | HermesProjectContext |
| visualMode | BimWorkspaceView | Immersive workspace state |
| left tree open | BimWorkspaceView | replace with activeWorkspace |
| right inspector tab | BimWorkspaceView | workspace inspector state |
| right inspector open | BimWorkspaceView | HermesProjectContext |
| leftTab | BimWorkspaceView | activeWorkspace / browser state |
| inspectorTab | BimWorkspaceView | UniversalInspector |
| activeTrace | BimWorkspaceView | viewport tool state |
| traced IDs | BimWorkspaceView | viewport tool state |
| section value | BimWorkspaceView | viewport tool state |
| autoCamera | BimWorkspaceView + Context autoFollow | consolidate with context |
| truth modal | BimWorkspaceView | Developer/Audit workspace |
| timeline expanded | n/a/current shelf | workspace-only state |

## 19. New workspace state hook

Recommended:

`src/hooks/useImmersiveWorkspaceState.ts`

State:

```
interface ImmersiveWorkspaceState {
  activeWorkspace: WorkspaceKind
  visualMode: VisualMode
  inspectorTab: InspectorTab
  timelineExpanded: boolean
  commandPaletteOpen: boolean
  developerDrawerOpen: boolean
  sectionMode: boolean
  sectionAxis: 'X'|'Y'|'Z'
  sectionValue: number
  traceMode: TraceMode | null
}
```

This hook should remain UI-only.

## 20. Immediate cleanup opportunities

The current source defaults:

```
leftTreeOpen = true
rightInspectorOpen = true
rightInspectorTab = 'PRIME_AUTONOMY'
```

These defaults directly conflict with the owner-approved immersive workspace.

Target:

- left workspace closed;
- right inspector closed;
- no Prime panel by default.

Do not make Prime status disappear; move it behind contextual access.

## 21. Legacy route migration strategy

Do not rewrite every page at once.

Phase 1:

Reuse existing components in `InternalWorkspaceDrawer`.

Examples:

```
MATERIALS → BOMView
PROCUREMENT → ProcurementView
SCHEDULE → ScheduleView
QUALITY → InspectorView
PROJECT → ProjectOverviewView
SYSTEMS → PlansSystemsView
```

Then improve each workspace incrementally.

This is much cheaper and safer than rewriting all views.

## 22. App.tsx target

Current:

`activeTab` determines which page replaces the project world.

Target:

Project world remains mounted.

`activeWorkspace` determines which internal overlay/drawer is open.

Concept:

```
<ImmersiveProjectShell>
  <ConstructionViewport />

  {activeWorkspace && (
    <InternalWorkspaceDrawer kind={activeWorkspace}>
      {renderWorkspace(activeWorkspace)}
    </InternalWorkspaceDrawer>
  )}
</ImmersiveProjectShell>
```

Developer/regression experiences may remain specialized overlays.

## 23. AppShell target

The existing `AppShell` should eventually either:

A. become `ImmersiveProjectShell`, or

B. remain only for non-project/system contexts.

Do not maintain both as competing project shells.

Preferred path:

- create new immersive shell;
- route live project workspace through it;
- retain AppShell temporarily for legacy/system pages;
- remove legacy shell dependency after physical acceptance.

## 24. BimWorkspaceView target

Do not immediately split its renderer and data reducer.

First pass:

- preserve internal rendering logic;
- remove/move chrome;
- accept externally controlled UI props where necessary.

Second pass:

extract renderer.

This minimizes risk.

## 25. First implementation ticket boundaries

### HERMES-UI-01 — Immersive shell only

Allowed files:

- `src/App.tsx`
- `src/components/AppShell.tsx`
- `src/components/BimWorkspaceView.tsx`
- new files under `src/components/immersive/`
- optional new `src/hooks/useImmersiveWorkspaceState.ts`
- optional `src/lib/humanProjectStatus.ts`

Do not touch:

- server runtime;
- persistence;
- geometry engines;
- task engine;
- BIM command engine;
- Academy logic;
- construction sequencing.

### HERMES-UI-01 acceptance

1. Project world fills browser window edge-to-edge.
2. No conventional multi-row header.
3. Model/workforce tree closed by default.
4. Inspector closed by default.
5. Prime status not visible by default.
6. Timeline thin/collapsed.
7. Project identity/status visible in compact floating form.
8. Architectural/Construction/X-Ray and Fit remain reachable.
9. Existing step/run/reset/project actions still function.
10. Existing component selection still works.
11. No backend/API changes.
12. Typecheck/build pass.
13. Physical browser screenshot confirms the world—not chrome—is visually dominant.

## 26. What ChatGPT can prepare before Codex

Completed:

- immersive product architecture;
- human observability architecture;
- object-centric BIM architecture;
- source ownership audit;
- migration map;
- component/state architecture.

Still possible here before Codex:

- exact UI-01 file-by-file patch plan;
- human phase/status label map;
- component prop interfaces;
- acceptance screenshot checklist;
- review of Codex diff.

Codex should not spend credits making these product decisions.

## 27. Implementation philosophy

The safest route is:

`REORGANIZE EXISTING CAPABILITY → VERIFY → THEN EXTRACT/REFACTOR`

not:

`REWRITE THE FRONTEND → HOPE EVERYTHING STILL WORKS`

The current world/runtime is valuable.

The goal is to expose it through a professional human interface without destabilizing canonical behavior.
