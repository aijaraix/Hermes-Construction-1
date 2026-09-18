# HERMES UI-01 EXACT FILE-BY-FILE PATCH PLAN

**Status:** Implementation-ready planning specification  
**Purpose:** Give Codex a bounded, low-discovery implementation assignment for the first immersive UI pass.

## 0. Scope

This ticket changes presentation architecture only.

It must NOT change:

- server runtime;
- persistence;
- API contracts;
- world-state semantics;
- geometry generation;
- task sequencing;
- Academy logic;
- construction modeling;
- IFC parsing;
- truth-test behavior;
- Railway/deployment architecture.

Primary source checkpoint when this plan was authored:

\`5e6b174a9b30669595f1496e7160799240132d3c\`

Always fetch current \`main\` first and preserve legitimate newer work.

## 1. Goal

Convert the current dashboard-style project view into the first version of the immersive HERMES project shell.

After UI-01:

- the project world fills the usable browser window;
- conventional dashboard chrome is gone from the live-project experience;
- both left and right project panels are closed by default;
- project identity/status is a small floating overlay;
- view controls are compact floating tools;
- existing rendering/runtime behavior remains intact;
- existing project actions remain available;
- system/developer views remain accessible but are not default chrome.

This ticket is intentionally limited.

Do not build the final universal inspector, command palette, or full materials workspace yet.

## 2. Files to modify

Required:

1. \`src/App.tsx\`
2. \`src/components/AppShell.tsx\`
3. \`src/components/BimWorkspaceView.tsx\`

New files allowed:

4. \`src/components/immersive/ImmersiveProjectShell.tsx\`
5. \`src/components/immersive/ProjectIdentityChip.tsx\`
6. \`src/components/immersive/ViewModeToolbar.tsx\`
7. \`src/components/immersive/ProjectStatusHUD.tsx\`
8. optional \`src/lib/humanProjectStatus.ts\`

No other file should be changed unless a compile error proves it necessary.

## 3. App.tsx exact plan

### Current problem

\`App.tsx\` uses \`activeTab\` as page replacement navigation.

For the live project, \`BimWorkspaceView\` is mounted inside \`AppShell\`, while numerous other views replace it.

### UI-01 target

For the live project path:

- keep \`BimWorkspaceView\` as the always-mounted project world;
- wrap it in \`ImmersiveProjectShell\`;
- keep existing system/developer drawer behavior;
- do not migrate all legacy views yet.

### Change

Introduce a simple distinction:

\`\`\`
const isImmersiveProject = activeTab === 'bim-workspace'
\`\`\`

When true:

\`\`\`
<ImmersiveProjectShell
  onOpenSystemDrawer={() => setIsSystemDrawerOpen(true)}
>
  <BimWorkspaceView
    onOpenSystemDrawer={() => setIsSystemDrawerOpen(true)}
    initialSelectedComponentId={selectedComponent?.id}
  />
</ImmersiveProjectShell>
\`\`\`

When false:

retain the existing \`AppShell\` path for legacy/system workspaces temporarily.

### Why

This avoids forcing the legacy shell to serve two incompatible purposes.

It also means UI-01 can be verified without rewriting all existing internal pages.

### Do not

- delete \`AppShell\`;
- delete legacy route components;
- remove system views;
- alter \`activeTab\` semantics beyond the live BIM workspace path;
- alter backend actions.

## 4. ImmersiveProjectShell.tsx

Create:

\`src/components/immersive/ImmersiveProjectShell.tsx\`

### Props

\`\`\`ts
interface ImmersiveProjectShellProps {
  children: React.ReactNode;
  onOpenSystemDrawer?: () => void;
}
\`\`\`

### Responsibilities

- \`h-screen w-screen\`;
- dark/neutral application background;
- relative positioning context;
- render children full size;
- render minimal floating shell controls only;
- no normal page header;
- no normal page sidebar;
- no content padding.

### Layout

\`\`\`
<div className="h-screen w-screen overflow-hidden relative">
  <div className="absolute inset-0">
    {children}
  </div>

  <ProjectIdentityChip ... />
  <ProjectStatusHUD ... />

  <button ...>Developer/System</button>
</div>
\`\`\`

The developer/system launcher should be small and visually secondary.

## 5. ProjectIdentityChip.tsx

Create:

\`src/components/immersive/ProjectIdentityChip.tsx\`

### Data source

Use \`useHermesProject()\`.

Consumes:

- \`activeProjectMeta\`
- \`connectionStatus\`
- \`worldState\`

### Default display

Compact floating top-left chip:

- project name;
- location or building type in smaller text;
- connection dot;
- optional completion %.

Do NOT display:

- “Phase 3.17B”;
- “Clean World”;
- reasoning provider;
- raw revision;
- regression/technical terminology unless fixture mode.

### Interaction

Clicking may open existing project selector later.

For UI-01, it may remain non-interactive if moving selector safely is too large.

Do not lose project switching completely.

## 6. ProjectStatusHUD.tsx

Create:

\`src/components/immersive/ProjectStatusHUD.tsx\`

### Data source

Use current \`worldState\`.

### Minimum display

Compact upper-left or upper-center overlay:

- human-readable phase;
- completion %;
- current task;
- next task.

Example:

\`\`\`
FOUNDATION • 31%
Now: Form and reinforce slab
Next: Concrete placement
\`\`\`

### Translation

For UI-01, simple presentation cleanup is sufficient:

- replace underscores with spaces;
- title case;
- strip technical prefixes if safe.

Do not fabricate schedule times or blockers.

If no data:

show \`Awaiting project state\`.

## 7. AppShell.tsx exact plan

### Current live-project problem

The current shell contains:

- full-width persistent header;
- brand;
- internal phase badge;
- project selector;
- connection/revision badge;
- UX-depth selector;
- heartbeat control;
- sidebar;
- system status footer;
- duplicate right inspector.

This is the main source of the “website/dashboard around the world” feeling.

### UI-01 change

Do NOT use \`AppShell\` for \`activeTab === 'bim-workspace'\`.

Because \`App.tsx\` routes the immersive project outside it, very little destructive editing is required here.

### Keep

Retain existing AppShell for:

- legacy page views;
- developer/system workflows;
- existing modal/project-support behavior.

### Optional cleanup

If \`AppShell\` currently owns global modals that the immersive route needs, either:

A. keep a tiny outer wrapper that mounts modals without layout chrome, or

B. move modal mounting to \`App.tsx\`.

Choose the smaller change.

### Important

Do not delete current AppShell inspector code in UI-01.

It may still be used by legacy views.

## 8. BimWorkspaceView.tsx exact plan

This is the most important file.

### 8.1 Defaults

Change:

\`\`\`ts
const [leftTreeOpen, setLeftTreeOpen] = useState<boolean>(true);
const [rightInspectorOpen, setRightInspectorOpen] = useState<boolean>(true);
const [rightInspectorTab, setRightInspectorTab] =
  useState<'SCOPED' | 'PRIME_AUTONOMY'>('PRIME_AUTONOMY');
\`\`\`

to:

\`\`\`ts
const [leftTreeOpen, setLeftTreeOpen] = useState<boolean>(false);
const [rightInspectorOpen, setRightInspectorOpen] = useState<boolean>(false);
const [rightInspectorTab, setRightInspectorTab] =
  useState<'SCOPED' | 'PRIME_AUTONOMY'>('SCOPED');
\`\`\`

This removes major default clutter.

### 8.2 Root container

Current root:

\`\`\`
h-full w-full flex flex-col ...
\`\`\`

Keep full-size behavior, but remove assumptions that top ribbon consumes permanent layout height.

Viewport should become the visual base layer.

Preferred structure:

\`\`\`
<div className="h-full w-full relative overflow-hidden">
  <WORLD />
  <FLOATING TOOLS />
  <OPTIONAL PANELS />
</div>
\`\`\`

### 8.3 Runtime mismatch warning

Keep the red canonical mismatch invariant.

Reason:

This is a genuine safety/truth warning.

But change from normal document-flow bar to a temporary overlay:

\`\`\`
absolute top-3 left-1/2 -translate-x-1/2 z-50
\`\`\`

Do not consume permanent viewport height.

### 8.4 Remove top ribbon from document flow

Current source block:

\`{/* 1. TOP CONTROL RIBBON */}\`

Do not retain it as a full-width row.

Split its contents.

#### Move to ViewModeToolbar

- ARCHITECTURAL;
- CONSTRUCTION;
- X-RAY;
- Section/Cutaway;
- Fit View.

#### Move out of default UI

- PHASE 1 AUDIT;
- RUN TRUTH TESTS.

These should be reachable through a small Advanced/Developer control or existing system drawer.

For UI-01, simplest safe option:

place both inside a compact floating \`More / Advanced\` menu, closed by default.

Do not delete their handlers.

#### Workforce

Do not keep large “Workforce (68)” button in top ribbon.

Use a compact icon button that opens existing left panel with \`WORKFORCE\`.

### 8.5 ViewModeToolbar.tsx

Create:

\`src/components/immersive/ViewModeToolbar.tsx\`

To minimize refactor risk in UI-01, it may be a presentation component receiving callbacks from \`BimWorkspaceView\`.

Props:

\`\`\`ts
interface ViewModeToolbarProps {
  visualMode: 'ARCHITECTURAL' | 'CONSTRUCTION' | 'XRAY';
  onVisualModeChange: (mode: 'ARCHITECTURAL' | 'CONSTRUCTION' | 'XRAY') => void;
  sectionActive: boolean;
  onToggleSection: () => void;
  onFitView: () => void;
  onToggleModelBrowser: () => void;
  onToggleWorkforce: () => void;
  onOpenAdvanced?: () => void;
}
\`\`\`

Position:

floating inside world, e.g. top-center or upper-left below identity/status.

### 8.6 Main center layout

Current:

\`\`\`
<div className="flex-1 flex overflow-hidden relative">
  LEFT SIDEBAR
  CENTER VIEW
  RIGHT INSPECTOR
</div>
\`\`\`

Target:

\`\`\`
<div className="absolute inset-0">
  CENTER VIEW FULL SIZE
</div>

{leftTreeOpen && (
  <div className="absolute left-3 top-16 bottom-14 ...">
    EXISTING LEFT CONTENT
  </div>
)}

{rightInspectorOpen && (
  <div className="absolute right-3 top-16 bottom-14 ...">
    EXISTING RIGHT CONTENT
  </div>
)}
\`\`\`

Key point:

panels overlay the viewport instead of shrinking it.

This preserves almost all current JSX and behavior.

### 8.7 Left Building Navigator

Current behavior uses a flex child with width 320px when open.

Change it to an overlay panel.

Desktop:

- width approximately 320 px;
- max height inside viewport;
- rounded;
- shadow;
- translucent/solid application surface.

Mobile:

- full-height/full-width overlay acceptable.

Keep current tabs:

- TREE;
- WORKFORCE;
- SYSTEMS;
- TRACE.

Do not rewrite tree contents in UI-01.

### 8.8 Right Inspector

Current panel participates in flex layout and shrinks viewport.

Change to overlay.

Default closed.

Keep existing tabs/content for UI-01.

Do not build final UniversalInspector yet.

Behavior:

- clicking an object may still open it automatically;
- X closes;
- Esc should close if easy to add.

### 8.9 Right Inspector toggle

Keep a compact floating icon when inspector is closed.

When inspector is open, close control belongs in panel header.

Avoid always-visible large text.

### 8.10 Section controls

Current section bar may remain as a floating mini-panel.

Do not consume permanent page height.

Position near ViewModeToolbar.

### 8.11 Center status/task overlays

Any large current checkpoint/task banner that spans significant viewport width should be reduced.

UI-01 rule:

- move to compact floating status card;
- max width approximately 320–420 px;
- no center-screen obstruction.

If a large intake card is essential at genesis:

- keep it;
- place it as a floating task card;
- allow collapse;
- do not span viewport.

### 8.12 Timeline/replay

Current timeline/replay should be collapsed by default.

UI-01 minimum:

- bottom overlay;
- approximately 40–48 px collapsed height;
- play/pause;
- checkpoint/event progress;
- speed;
- expand chevron.

Do not redesign event stream yet.

If current timeline code is too entangled for extraction:

- retain the existing logic;
- wrap it in a CSS-collapsed bottom overlay;
- preserve all callbacks.

### 8.13 Truth-test modal

Keep current modal behavior.

Remove default top-ribbon buttons and expose them from Advanced/Developer menu.

Do not change truth-test APIs.

### 8.14 Camera controls

Keep:

- camera presets;
- fit view;
- orbit behavior;
- auto camera behavior.

Move camera preset selector into compact floating toolbar/menu.

Do not alter camera math in UI-01.

### 8.15 Renderer

Do NOT modify:

- Three.js scene creation;
- mesh construction;
- roof/window/door rendering logic;
- raycasting;
- material logic;
- clipping math;
- reduced canonical component logic;
- IFC geometry parsing.

UI-01 is not the geometry pass.

## 9. Existing state to preserve

Do not remove:

- \`visualMode\`
- \`sectionXEnabled\`
- \`sectionYEnabled\`
- \`sectionXValue\`
- \`sectionYValue\`
- \`measureActive\`
- \`activeTrace\`
- \`tracedCompIds\`
- \`replayEvents\`
- \`currentEventIndex\`
- \`isPlayingTimeline\`
- \`replaySpeed\`
- \`autoCameraEnabled\`
- \`selectedCompId\`
- \`selectedRoomId\`
- \`selectedSystem\`
- \`isolatedCompId\`
- \`hiddenCompIds\`
- \`truthTestReport\`
- existing audit handlers.

Only relocate their controls.

## 10. Context consolidation allowed in UI-01

If safe:

### Selected entity

When \`selectedCompId\` changes:

also call context \`selectEntity(id)\`.

When context selectedEntity changes externally:

sync local selectedCompId.

This creates compatibility without forcing full state migration now.

### Inspector open

When object selected:

- local right inspector opens;
- context inspector may also open.

Full ownership migration can occur in UI-03.

### Playback

Do not refactor replay engine ownership in UI-01 unless needed.

Avoid unnecessary risk.

## 11. New component prop contracts

### ProjectIdentityChip

\`\`\`ts
interface ProjectIdentityChipProps {
  projectName: string;
  projectLocation?: string;
  connectionStatus: 'CONNECTED' | 'SYNCING' | 'ERROR';
  completionPct?: number;
  onClick?: () => void;
}
\`\`\`

### ProjectStatusHUD

\`\`\`ts
interface ProjectStatusHUDProps {
  phase: string;
  completionPct: number;
  currentTask: string;
  nextTask?: string;
  onOpenDetails?: () => void;
}
\`\`\`

### ViewModeToolbar

Defined above.

## 12. Styling rules

Use existing Tailwind setup.

Do not introduce another UI framework.

Visual rules:

- neutral/slate application surfaces;
- subtle translucency allowed;
- small shadows;
- rounded but professional;
- avoid giant pills;
- avoid multiple colored status bars;
- icon-first;
- text appears when useful;
- canvas remains dominant.

Do not over-design.

## 13. Responsive rules

Desktop:

- viewport always full;
- overlay panels approximately 320–400 px;
- no reserved sidebar widths.

Mobile/tablet:

- panel may cover most/all viewport when open;
- controls collapse;
- one major panel at a time.

Do not block UI-01 on perfect mobile polishing.

## 14. Human-readable phase display

For UI-01 use a conservative formatter.

Example helper:

\`\`\`ts
function formatCanonicalLabel(value?: string): string {
  if (!value) return 'Awaiting project state';
  return value
    .replace(/^PROJECT_/, '')
    .replace(/^CONSTRUCTION_/, '')
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\\b\\w/g, (c) => c.toUpperCase());
}
\`\`\`

Do not map canonical states to claims that are not supported.

Examples:

\`GENESIS_INTAKE → Genesis Intake\`

\`CONSTRUCTION_SUBSTRUCTURE → Substructure\`

\`CLOSEOUT → Closeout\`

A richer phase taxonomy can come later.

## 15. Keyboard behavior

UI-01 minimal shortcuts if low risk:

- Esc → close left/right overlay;
- F → fit view;
- Space → play/pause only when focus is not in an input.

Do not add broad shortcuts yet.

## 16. Advanced menu

For UI-01, create one compact overflow button in the viewport.

Contains:

- Phase 1 Audit;
- Run Truth Tests;
- Open HERMES System/Developer area.

This removes technical controls from the normal workspace without deleting them.

## 17. Exact non-goals

UI-01 does NOT include:

- final universal inspector;
- final object browser;
- materials redesign;
- command palette;
- customer mode;
- presentation mode;
- new BIM geometry;
- roof fixes;
- MEP modeling fixes;
- spatial pathfinding;
- local AI;
- desktop packaging;
- PWA;
- Electron/Tauri.

## 18. Test plan

Run:

\`\`\`
npm ci
npm run lint
npm run build
npm test -- --run server/__tests__/academy_house_001_vertical_slice.test.ts
\`\`\`

Use the repository’s actually supported targeted-test invocation if Vitest syntax differs.

Do not fail UI-01 over unrelated legacy failures.

## 19. Browser acceptance matrix

At genesis:

- screenshot with no panels open;
- world visibly dominates;
- project/status chip readable;
- toolbar reachable.

Open model tree:

- overlays world;
- close works;
- world size does not change.

Open workforce:

- overlays world;
- close works.

Select object:

- inspector opens;
- world remains same size.

Switch:

- Architectural;
- Construction;
- X-Ray.

Fit View:

- works.

Section:

- opens/closes.

Timeline:

- collapsed default;
- play/pause usable.

Advanced:

- truth-test actions still reachable.

Developer:

- system drawer still opens.

## 20. Success definition

UI-01 is successful if the same canonical HERMES functionality now feels like an application rather than a dashboard.

The visible change should be dramatic even though backend behavior is unchanged.

## 21. Codex implementation instruction

When this ticket is handed to Codex, the instruction should be:

> Implement this document exactly. Do not redesign it, broaden it, or move to UI-02. Preserve renderer/runtime behavior. Stop after browser evidence for UI-01.

That is the intended credit-saving boundary.
