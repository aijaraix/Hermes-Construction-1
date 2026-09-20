# HERMES IMMERSIVE LAUNCHER + INTERNAL WORKSPACE INTERACTION SPEC

Status: Source-audited interaction architecture
Purpose: Replace page-style navigation with a stable CAD/BIM-style launcher rail and internal workspaces that preserve the 3D world as the primary application surface.

## 1. Core interaction rule

The world stays mounted.

Project tools open over the world.
Object details open in the inspector.
Time/replay lives at the bottom.
Developer/runtime internals live behind one separate System entry.

The application should never feel like navigating between unrelated website pages.

## 2. Current source reality

AppShell currently defines many NavTab values, but visible customer navigation has already collapsed to a single BIM Workspace entry.

BimWorkspaceView currently contains its own left-side concepts:
- TREE
- WORKFORCE
- SYSTEMS
- TRACE

and its own right-side inspector concepts.

HermesSystemDrawer currently mixes:
- Academy/training
- agent/system orchestration
- knowledge/truth
- diagnostics
- and project data engines such as inspections, BOM, procurement, schedule and risks.

That last category should move out of Developer/System because those are normal project workspaces.

## 3. Launcher rail

Desktop target width: 48 px collapsed icon rail.
Optional expanded labels on hover/pin: 176–208 px.

Primary order:

1. PROJECT
2. MODEL
3. MATERIALS
4. SCHEDULE
5. WORKFORCE
6. LOGISTICS
7. QUALITY
8. SYSTEMS

Bottom-separated controls:
- Developer / System
- Settings / Help later

Timeline is not a launcher item; it remains bottom-mounted.
Inspector is not a launcher item; it is contextual to selection.

## 4. PROJECT

Icon concept: LayoutDashboard / Home / Building2

Opens:
Project Overview workspace.

Contains:
- identity
- phase/completion
- Done / Doing / Next
- attention
- What Changed
- materials summary
- schedule summary
- cost
- quality/approvals
- site/jurisdiction
- evidence

Source:
projectOverviewState.ts

## 5. MODEL

Icon concept: Layers / Boxes / FolderTree

Opens:
Model Browser panel.

Reuse current BimWorkspace TREE functionality:
- project/site/building hierarchy
- storeys
- spaces
- categories
- components
- search
- visibility
- isolation

Model Browser is a left overlay panel, not a page and not layout-consuming.

Default width: 360 px.
Resizable target: 300–480 px.

Selecting an object opens Universal Inspector on the right without closing Model Browser.

## 6. MATERIALS

Icon concept: Package / Boxes

Opens:
Materials workspace.

Uses:
materialWorkspaceState.ts

Contains:
- Overview
- Requirements
- On Site
- Procurement
- Installed
- Exceptions

Default presentation:
wide left workspace drawer, approximately 640–760 px on desktop.

3D world remains visible behind/to the side.

## 7. SCHEDULE

Icon concept: CalendarClock / CalendarDays

Opens:
Schedule workspace.

Uses:
projectTimelineState.ts

Contains:
- calculated schedule state
- activities
- dependencies
- critical path when canonical
- float when canonical
- current/next work

Timeline/replay remains the bottom control even when Schedule workspace is open.

Default width: 640–760 px.

## 8. WORKFORCE

Icon concept: Users / HardHat

Opens:
Workforce panel.

Reuse current BimWorkspace WORKFORCE functionality.

Show:
- active actors
- role
- discipline
- current state
- current task
- location
- selected actor inspector

Default width: 380–440 px.

Selecting actor opens Universal Inspector in ACTOR mode.

## 9. LOGISTICS

Icon concept: Truck / Route

Opens:
Logistics workspace.

Initial truthful scope:
- equipment entities
- physical material staging
- laydown locations
- assigned equipment
- assigned material batches
- work locations
- constructability/future-access proof

Future scope:
- routes
- delivery tracking
- spatial reservations
- crane/equipment paths
- robot-ready movement planning

Do not fabricate routes or deliveries when canonical data does not exist.

Default width: 560–700 px.

## 10. QUALITY

Icon concept: ShieldCheck / ClipboardCheck

Opens:
Quality & Attention workspace.

Uses:
projectAttentionState.ts

Default tabs/filters:
- Needs Attention
- Inspections
- Coordination / Clashes
- Professional Review
- AHJ / Occupancy
- Resolved History later

Default width: 520–640 px.

Clicking a related entity focuses/selects it in world.

## 11. SYSTEMS

Icon concept: Network / GitBranch

Opens:
Building Systems / Trace panel.

Reuse current BimWorkspace SYSTEMS and TRACE behavior.

Contains:
- architectural/structural/system category filters
- electrical circuit traces
- plumbing waste paths
- HVAC air paths
- connected-object graph
- system isolate/show/hide

This is a project/model workspace.
It is NOT the developer/runtime system drawer.

Default width: 380–480 px.

## 12. Developer / System control

Separate from the eight project launcher items.

Icon concept: Cpu / Terminal / Settings

Opens:
HERMES System Developer Area.

Keep here:
- Spatial Academy
- Continuous Academy
- Autonomous Training Gym
- owner SME proofs
- HERMES Prime internals
- Agent Roster
- readiness / quota integrity
- Knowledge Center
- Source Registry
- Reality/Data Truth
- Spatial Diagnostics
- Audit Trail
- System Health

Remove normal project workspaces from the developer drawer over time:
- inspections
- BOM
- procurement
- schedule
- risks
- revisions/customizer where appropriate

These belong in the project application.

## 13. Contextual right inspector

Right side is reserved for Universal Inspector.

Default: closed.

Opening a left workspace does not open the inspector unless an entity is selected.

Selecting:
- component
- material
- actor
- equipment
- facility
- space

opens the inspector.

Desktop width target: 360–420 px.
Resizable target: 320–520 px.

Inspector overlays world; it never changes renderer dimensions.

## 14. Timeline bottom zone

Bottom reserved for ConstructionTimeline.

Collapsed height: 40–48 px.
Expanded overlay: up to 240–320 px.

Timeline overlay does not resize world.

## 15. Workspace exclusivity

Only one primary left/wide project workspace should be open at a time.

Examples:
MODEL → then MATERIALS closes MODEL and opens MATERIALS.

Inspector can remain open simultaneously.
Timeline can remain open simultaneously.
Developer/System drawer is modal/exclusive and temporarily covers project workspaces.

## 16. Workspace persistence

Remember within current browser session:
- last primary workspace
- pinned/unpinned rail state
- panel width
- last workspace subtab

Do not persist a workspace as open across a project switch unless it remains valid.

On project switch:
- keep launcher rail
- close inspector
- clear entity selection
- keep selected primary workspace only if it is project-generic
- reset project-specific filters that would point to missing IDs.

## 17. Workspace presentation modes

Use three presentation classes:

PANEL:
- 320–480 px
- Model
- Workforce
- Systems

WORKSPACE:
- 520–760 px
- Project
- Materials
- Schedule
- Logistics
- Quality

MODAL:
- Developer/System
- future destructive confirmations

All PANEL and WORKSPACE surfaces overlay the world.

## 18. Desktop layout zones

Left edge:
- 48 px launcher rail
- optional open project workspace adjacent/overlayed

Center:
- uninterrupted 3D world

Right:
- contextual inspector

Bottom:
- timeline

Top:
- compact project identity/status
- view/navigation toolbar
- no full-width application header

## 19. Mobile

Mobile launcher becomes a compact bottom/side launcher button or 4–5 primary icons plus More.

Recommended primary mobile items:
- Project
- Model
- Materials
- Quality
- More

Schedule / Workforce / Logistics / Systems live under More when width is limited.

Opening a workspace becomes a bottom sheet or near-full-screen sheet.

World remains mounted behind it.

Inspector becomes a bottom sheet.

## 20. Keyboard interaction

Global:
- Escape: close topmost non-destructive overlay
- Ctrl/Cmd+K: future command palette

Suggested launcher shortcuts:
- Alt+1 Project
- Alt+2 Model
- Alt+3 Materials
- Alt+4 Schedule
- Alt+5 Workforce
- Alt+6 Logistics
- Alt+7 Quality
- Alt+8 Systems

Selection shortcuts when canvas is focused:
- F: Focus selected entity
- I: Toggle inspector
- H: Hide selected
- Shift+H: Unhide all later

Single-key shortcuts must be disabled while typing in input/search fields.

## 21. Open/close behavior

Click closed launcher item:
- open it.

Click active launcher item:
- close it.

Click another launcher item:
- swap primary workspace without changing 3D world state.

Escape order:
1. close modal/menu
2. close inspector
3. close primary workspace
4. collapse timeline if expanded

Do not use Escape for reset/destructive project actions.

## 22. Rail badges

Only actionable counts:

PROJECT:
- What Changed unseen count may appear as subtle dot/count.

MATERIALS:
- material exception count.

QUALITY:
- active attention count.

WORKFORCE:
- no count unless a meaningful canonical alert exists.

Do not show decorative badges.

## 23. Project selector

Project switching should be a compact project identity chip/dropdown in the immersive shell.

Do not keep the current large header selector.

Regression fixtures belong behind Developer/System or a clearly marked test-mode selector, not mixed visually with customer/live projects by default.

## 24. UX depth

Current SUMMARY / TECHNICAL / AUDIT concept can survive as a display preference, but not as permanent top-bar chrome.

Move it into:
- Project settings/preferences, or
- an Advanced/Depth menu.

Default user-facing mode:
SUMMARY / PROFESSIONAL readable.

## 25. Legacy NavTab migration

Current page tabs should migrate approximately as follows:

bim-workspace → base world
project-overview → PROJECT
rooms-spaces → MODEL / inspector
plans-systems → SYSTEMS
inspections → QUALITY
bom → MATERIALS
procurement → MATERIALS / LOGISTICS
schedule → SCHEDULE
risks → QUALITY / PROJECT
project-activity → timeline / What Changed
decisions → PROJECT / QUALITY
customizer → future Project/Design workspace, not Developer by default

command-center → retire from normal project navigation; useful pieces migrate to PROJECT or Developer/System
3d-twin → retire as separate page; world is always present

prime / agent-org / academy / knowledge / audit / health → Developer/System

## 26. State architecture

Recommended UI-only state:

- activeWorkspaceId
- workspaceOpen
- workspaceWidthById
- workspaceSubtabById
- launcherPinned
- developerDrawerOpen

Canonical state remains in HermesProjectContext.

Do not create a second project truth store.

## 27. First implementation slice — NAV-01

Implement:
- 48 px ProjectLauncherRail
- workspace registry
- one-primary-workspace-at-a-time state
- Project / Model / Workforce / Systems launch targets using existing content
- Developer/System button separation
- Escape behavior
- Alt+1..8 routing

Do not implement every new workspace body in NAV-01.

Materials/Schedule/Quality can initially open placeholders wired to their approved implementation tickets until their components are built.

## 28. Acceptance

Pass when:
1. World remains mounted at all times.
2. Rail occupies ~48 px, not a sidebar.
3. Only one primary workspace opens at a time.
4. Opening any workspace does not resize the Three.js viewport.
5. Inspector can coexist with left workspace.
6. Timeline can coexist with both.
7. Developer/System is visually separated from project tools.
8. Model, Workforce and Systems reuse existing capabilities rather than duplicate them.
9. Normal project workspaces are no longer conceptually buried in Developer.
10. Escape and Alt+1..8 behavior is deterministic.