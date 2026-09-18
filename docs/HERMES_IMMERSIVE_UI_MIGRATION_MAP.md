# HERMES IMMERSIVE UI MIGRATION MAP

**Status:** Source-audited implementation map  
**Purpose:** Reduce Codex spend by identifying exactly where the current dashboard-style UI lives and how to migrate it into the immersive project application.

## 1. Primary UI owners

### src/components/AppShell.tsx
Owns the conventional application chrome:
- persistent header;
- brand block;
- project selector;
- world-live/revision badge;
- UX depth selector;
- mobile navigation;
- system status footer;
- shell-level navigation assumptions.

Target:
- reduce to minimal floating application shell;
- remove conventional multi-row/dashboard feeling;
- retain project switching, health, and access to internal workspaces;
- do not reserve large persistent vertical/horizontal regions.

### src/App.tsx
Owns top-level route/view switching and legacy workspace mounting.

Current architecture mounts separate page-style workspaces:
- Command Center;
- Project Overview;
- 3D Twin;
- Rooms & Spaces;
- Plans & Systems;
- Inspections;
- BOM;
- Procurement;
- Schedule;
- Risks;
- Customizer;
- knowledge/system/academy views.

Target:
- BIM/immersive world becomes the permanent project shell;
- these capabilities become internal drawers, modal workspaces, inspectors, or application panels rather than unrelated page navigation;
- developer/system views remain accessible but separate from default construction UX.

### src/components/BimWorkspaceView.tsx
Owns most visible in-world clutter and most of the actual immersive experience.

Current source contains:
- Architectural / Construction / X-Ray mode buttons;
- model tree;
- workforce tab;
- Prime Status;
- scoped/right inspector;
- Run Truth Tests;
- Fit View;
- timeline/replay state;
- checkpoint/task UI;
- world/rendering;
- selected component state;
- truth-test output;
- numerous engineering/diagnostic overlays.

Target:
- preserve rendering/world logic;
- reorganize UI into compact floating tools and contextual panels;
- default to edge-to-edge world;
- side panels closed by default;
- timeline collapsed by default;
- task HUD compact;
- diagnostics moved behind inspector/system depth.

### src/components/Phase2WorldOverlay.tsx
Owns replay/world overlay behavior for one historical/phase view.

Target:
- preserve useful replay mechanics;
- converge controls into the same common timeline/HUD architecture where feasible;
- avoid adding another permanent overlay system.

### src/components/HermesSystemDrawer.tsx
Already represents the correct general concept for advanced/system functions: a drawer rather than permanent default chrome.

Target:
- reuse/extend this interaction pattern;
- keep developer/system functions out of normal owner/construction view.

## 2. Current control → target destination

| Current control/surface | Current owner | Target |
|---|---|---|
| HERMES brand / project | AppShell | Minimal floating top-left shell |
| Project selector | AppShell | Compact project switcher inside immersive shell |
| World live / revision | AppShell | Small health chip, advanced detail in Inspector |
| UX Depth | AppShell | Inspector depth / role setting, not permanent header control |
| Model Tree | BimWorkspaceView | Collapsed left icon → Model drawer |
| Workforce | BimWorkspaceView | Left icon → Workforce drawer / selected actor Inspector |
| Architectural / Construction / X-Ray | BimWorkspaceView | Floating canvas mode toolbar |
| Section / Cutaway | BimWorkspaceView | Floating canvas tool |
| Fit View | BimWorkspaceView | Compact navigation toolbar |
| Run Truth Tests | BimWorkspaceView | Inspector → Audit / Developer depth |
| Prime Status | BimWorkspaceView | Inspector → Project / Prime |
| Scoped inspector | BimWorkspaceView | Universal right Inspector |
| Engineering calculations | BimWorkspaceView | Inspector → Analysis |
| Checkpoint / current task | BimWorkspaceView | Small “Now” HUD |
| Timeline / Replay | BimWorkspaceView | Thin bottom scrubber; expandable timeline |
| Event details | BimWorkspaceView | Expanded timeline / Inspector |
| Phase Audit | BimWorkspaceView | Inspector → Audit |
| BOM | App route | Materials/Quantities internal workspace |
| Procurement | App route | Materials/Procurement internal workspace |
| Schedule | App route | Timeline/Schedule internal workspace |
| Inspections | App route | Issues/Quality internal workspace |
| Risks | App route | Project/Risk internal workspace |
| Rooms & Spaces | App route | Model/Spaces internal drawer/workspace |
| Plans & Systems | App route | Systems internal drawer |
| Command Center | App route | Project/Prime internal workspace |
| Project Overview | App route | Human-observability project overview drawer |
| Developer/system tools | App/HermesSystemDrawer | Developer drawer only |

## 3. High-value low-risk work ChatGPT can do directly

The following work does not require Codex rediscovery:

### A. Product/UI architecture
Already completed in planning docs.

### B. Source ownership audit
Completed in this document.

### C. Component decomposition specification
Can be authored here before implementation.

Recommended new components:
- ImmersiveProjectShell
- ProjectLauncherRail
- UniversalInspector
- ViewModeToolbar
- NavigationToolbar
- ProjectStatusHUD
- ConstructionTimeline
- CommandPalette
- InternalWorkspaceDrawer
- ObjectBrowser
- MaterialBrowser

### D. State contract
Can define which existing BimWorkspace state moves into which component without changing backend APIs.

### E. Human-facing label map
Can translate internal phase/task/checkpoint terminology to owner-facing status.

### F. Acceptance tests
Can define browser screenshot and interaction checklist before implementation.

### G. Code review
After Codex changes files, ChatGPT can review exact diff and screenshots before another Codex iteration.

## 4. Work better reserved for Codex

Codex should be used narrowly for:

- extracting large JSX regions from BimWorkspaceView without breaking renderer state;
- multi-file React refactor;
- running typecheck/build/tests;
- browser interaction;
- fixing actual runtime regressions;
- deployment of the refactored branch.

Do not use Codex to decide the layout or rediscover requirements.

## 5. Recommended implementation slices

### UI-01 — Immersive shell
Files:
- AppShell.tsx
- App.tsx
- BimWorkspaceView.tsx

Goal:
- world fills viewport;
- remove conventional page header footprint;
- sidebars closed default;
- minimal floating project shell;
- preserve all functionality.

### UI-02 — Canvas tools
Extract:
- view modes;
- fit/orbit/section/walkthrough;
- layer/system controls.

Goal:
- small floating toolbars.

### UI-03 — Universal inspector
Move:
- Prime Status;
- selected component;
- provenance;
- engineering;
- audit/truth;
- spatial information.

### UI-04 — Human project status
Create:
- current phase;
- % complete;
- Done / Doing / Next;
- blockers;
- “What changed?”

All values derived from canonical state.

### UI-05 — Timeline
Replace tall shelf with collapsed scrubber + expandable timeline.

### UI-06 — Internal workspaces
Convert existing page routes progressively into in-app drawers/workspaces:
- materials/BOM;
- procurement;
- schedule;
- issues/inspections;
- project overview;
- systems.

## 6. Do not delete working functionality

During migration:
- hide/move first;
- preserve backend calls;
- preserve canonical state;
- preserve truth tests;
- preserve legacy views until replacements are physically verified.

Remove legacy presentation code only after replacement passes.

## 7. First-pass acceptance

After UI-01 only:

1. HERMES opens directly into full project world.
2. No persistent left/right panel.
3. No multi-row conventional header.
4. No tall bottom shelf.
5. Existing tools remain reachable.
6. No renderer/runtime behavior changes.
7. Typecheck/build pass.
8. Physical browser screenshot shows a professional application shell rather than dashboard chrome.

This is the smallest high-value Codex implementation assignment after the current acceptance review.
