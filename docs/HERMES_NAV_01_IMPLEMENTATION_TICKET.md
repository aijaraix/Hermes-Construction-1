# HERMES NAV-01 — EXACT IMPLEMENTATION TICKET

Status: Ready for bounded implementation
Purpose: Create the immersive project launcher rail and unify project navigation without rebuilding existing workspace bodies.

## 1. Read first

- docs/HERMES_IMMERSIVE_LAUNCHER_WORKSPACE_INTERACTION_SPEC.md
- src/lib/immersiveWorkspaceRegistry.ts
- docs/HERMES_CANVAS_FIRST_WORKSPACE_UI_ARCHITECTURE.md
- docs/HERMES_IMMERSIVE_REACT_COMPONENT_STATE_ARCHITECTURE.md
- docs/HERMES_UI_01_EXACT_FILE_BY_FILE_PATCH_PLAN.md

## 2. Scope

Implement NAV-01 only.

Required:
- 48 px left launcher rail
- exact eight project items from registry
- one active primary workspace at a time
- overlay workspace surface
- reuse existing Model Tree
- reuse existing Workforce panel
- reuse existing Systems/Trace panel
- Project Overview target
- placeholder/mount targets for Materials, Schedule, Logistics, Quality if their bodies are not yet implemented
- separated Developer/System control
- Escape behavior
- Alt+1..8 behavior

Do not rebuild renderer or project state.

## 3. Exact launcher order

1 Project
2 Model
3 Materials
4 Schedule
5 Workforce
6 Logistics
7 Quality
8 Systems

Developer/System separated at bottom.

## 4. Existing content reuse

MODEL:
extract/rehost existing BimWorkspace TREE content.

WORKFORCE:
extract/rehost existing BimWorkspace WORKFORCE content.

SYSTEMS:
extract/rehost existing BimWorkspace SYSTEMS + TRACE content.

Do not duplicate these views.

## 5. Project work vs developer work

Project data engines must conceptually move out of HermesSystemDrawer.

Do not delete legacy entries in NAV-01 if doing so risks regression.
But new project launcher must not route normal project work through Developer/System.

Developer/System remains for Academy, Prime internals, agent roster, knowledge, diagnostics, audit and health.

## 6. Overlay behavior

Launcher rail may consume its ~48 px edge.

Primary workspace content must be position:absolute/fixed overlay within immersive shell.

Opening a workspace must NOT change the renderer container width/height.

Inspector must be able to open simultaneously.
Timeline must be able to expand simultaneously.

## 7. Keyboard

Alt+1..8 toggles exact workspace.

Escape closes topmost in order:
1 modal/menu
2 inspector
3 active primary workspace
4 expanded timeline

Shortcuts disabled when typing in input/textarea/select/contenteditable.

## 8. State

Use lightweight UI state.
Do not add another canonical project store.

At minimum:
- activeWorkspaceId
- width by workspace
- launcher pin state
- developer drawer open

Project switch:
- clear entity selection/inspector
- preserve generic active workspace if safe
- do not preserve entity-specific filters to missing IDs.

## 9. Suggested files

New:
- src/components/immersive/ProjectLauncherRail.tsx
- src/components/immersive/InternalWorkspaceSurface.tsx
- src/lib/immersiveWorkspaceRegistry.ts
- optional src/hooks/useImmersiveWorkspaceState.ts

Modify as needed:
- src/App.tsx
- src/components/BimWorkspaceView.tsx
- src/components/immersive/ImmersiveProjectShell.tsx

Do not modify server code.

## 10. Visual acceptance

Desktop:
- rail appears as narrow professional tool strip
- no permanent text sidebar
- active item visually clear
- tooltips provide labels
- project world still dominates

Open Model:
- model browser overlays left
- viewport does not resize

Open Workforce:
- Model closes, Workforce opens
- viewport does not resize

Select component:
- right inspector can open while left workspace remains

Expand timeline:
- bottom overlay can coexist

Developer/System:
- opens separately and is visually distinct from project tools.

## 11. Mobile

Do not force full desktop rail onto narrow screens.

Initial mobile acceptance:
- compact launcher control
- Project, Model, Materials, Quality accessible directly
- remaining tools under More
- workspace becomes sheet/overlay
- world remains mounted.

## 12. Stop

Stop after navigation shell works.

Do not continue into MATERIALS-01, TIMELINE-01, ATTENTION-01 or OVERVIEW-01 body implementation unless separately assigned.