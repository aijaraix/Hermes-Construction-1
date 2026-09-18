# HERMES CANVAS-FIRST WORKSPACE UI ARCHITECTURE

**Status:** Owner-directed visual architecture  
**Basis:** Physical browser review of Academy House 001 on Railway, September 18, 2026  
**Purpose:** Remove dashboard-style noise and make the 3D construction world the primary product surface.

## 1. Owner direction

The current Academy House workspace is visually overloaded.

The problem is not primarily color or styling. The problem is **information architecture**.

Too many controls, status cards, phase controls, audit controls, workforce controls, inspector panes, and playback surfaces compete with the 3D world.

HERMES should feel closer to a professional CAD/BIM/construction application than an admin dashboard.

Core principle:

> **THE WORLD IS THE PRODUCT. UI EXISTS TO INSPECT, COMMAND, FILTER, AND REPLAY THE WORLD.**

The 3D canvas should dominate the viewport.

## 2. Current physical findings

Physical browser review showed:

- two stacked top-navigation/control rows;
- persistent project/status/heartbeat labels;
- architectural/construction/X-ray/section controls outside the world;
- audit/truth/workforce/prime controls outside the world;
- a large central checkpoint/task strip overlapping the world;
- persistent left model/workforce tree;
- persistent right autonomy/status inspector;
- a bottom playback/timeline shelf consuming additional height;
- engineering/status overlays floating over the canvas;
- duplicated information between header, world overlays, side panels, and bottom playback.

Even after manually closing both side panels, the top and bottom chrome still materially reduces the visible world area.

This is a **BLOCKER** for the intended professional construction/BIM experience.

## 3. Target workspace

Use a canvas-first layout:

```
+--------------------------------------------------------------------------------+
| MINIMAL APP BAR                                                               |
| Project | Command/Search | World Mode | Health | User                         |
+--------------------------------------------------------------------------------+
|                                                                                |
|                       FULL 3D CONSTRUCTION CANVAS                              |
|                                                                                |
|  [Floating tool palette]                         [Context / selection HUD]      |
|                                                                                |
|                                                                                |
|                                                                                |
|                                                                                |
|                                                                                |
|                                                                    [View Cube] |
|                                                                                |
| [Collapsible timeline / playback scrubber]                                     |
+--------------------------------------------------------------------------------+
```

Persistent sidebars are not the default.

## 4. What remains outside the world

Only a very small set of global controls may live in the persistent top application bar:

- HERMES identity/logo;
- active project selector;
- command/search entry;
- current world mode;
- compact health indicator;
- user/account/environment access.

Target persistent bar height: approximately 48–56 px.

No second permanent header row.

## 5. What moves into the canvas

The following controls should become compact floating canvas tools:

### View / display tools
- Architectural;
- Construction;
- X-Ray;
- Section / Cutaway;
- Walkthrough;
- Fit View;
- Orbit/Pan/Select.

Prefer icon/tool-group behavior similar to CAD/BIM applications.

### Construction-time controls
- Play/pause;
- checkpoint step;
- scrubber;
- playback speed.

Timeline remains collapsed to a thin bottom strip by default and expands only when requested.

### World status HUD
A small, translucent status chip may show:

- checkpoint;
- phase;
- current task;
- completion %.

Do not use a large banner across the center of the world.

## 6. Left rail

Default state:

**collapsed icon rail only.**

Possible icons:

- Model;
- Systems;
- Tasks;
- Workforce;
- Logistics;
- Issues;
- Academy;
- Files/Evidence.

Clicking an icon opens a temporary/dockable drawer over the canvas.

The drawer should close with:

- X;
- Escape;
- clicking the canvas;
- keyboard shortcut.

Do not permanently reserve 300–400 px for the model tree.

## 7. Right inspector

The right inspector becomes the primary information surface.

Default:

**closed until selection or explicit request.**

Inspector should be contextual and tabbed.

Recommended tabs:

### Selection
- component properties;
- dimensions;
- material;
- assembly;
- system;
- location.

### Provenance
- task;
- agent;
- event;
- revision;
- source;
- dependency reason.

### Construction
- install state;
- sequence;
- work package;
- inspection;
- predecessor/successor.

### Spatial
- work zone;
- access;
- clearance;
- payload;
- route;
- conflicts.

### Systems
- structure;
- plumbing;
- electrical;
- HVAC;
- envelope.

### Project / Prime
- Prime status;
- autonomy;
- current recommendations;
- alerts.

### Audit / Truth
- truth tests;
- validation;
- evidence;
- legacy audit data.

All current “Prime / Status”, “Run Truth Tests”, engineering details, and similar surfaces belong here rather than in the global chrome.

## 8. Bottom shelf

Current bottom shelf/timeline should become:

### Collapsed mode
Thin scrubber, approximately 36–44 px.

Contains:

- play/pause;
- event/checkpoint number;
- scrubber;
- speed.

### Expanded mode
Optional drawer containing:

- event stream;
- task transitions;
- timeline details;
- revision compare;
- replay controls.

Do not permanently display a tall shelf.

## 9. Construction task card

The current large central intake/checkpoint card blocks the world.

Replace with one of:

### Preferred
Small floating task HUD in upper-left canvas corner.

Contains:

- current task title;
- phase;
- one primary action;
- small expand button.

### Expanded
Task details open in right inspector.

The world must remain visible while reading or advancing tasks.

## 10. Engineering calculations

Engineering calculation cards should not permanently float over the model.

Move calculations to:

- right inspector → Engineering/Analysis tab;
- component selection;
- task-specific expanded view.

Only critical warnings should appear as temporary in-world notifications.

## 11. In-world contextual overlays

HERMES may show information inside the world where it has physical meaning.

Examples:

- labels anchored to components;
- route lines;
- work-zone outlines;
- collision volumes;
- staging zones;
- actor paths;
- selected system highlights;
- future constructability warning at actual opening;
- task markers at work location.

This is preferable to detached dashboard cards.

## 12. Default clean mode

On initial load, owner should see:

- project/world title;
- nearly full-screen 3D world;
- tiny collapsed left rail;
- minimal top bar;
- thin collapsed timeline;
- no inspector unless selected.

This should be the default, not an optional “focus mode.”

## 13. Advanced/operator mode

Power users may optionally pin:

- model tree;
- inspector;
- event stream;
- engineering panel.

Docking is allowed.

The key rule:

**advanced panels are opt-in, not permanent default chrome.**

## 14. View modes

Do not represent every mode as a full-width text button.

Use a compact floating mode selector.

Modes:

- Architectural;
- Construction;
- X-Ray;
- Section;
- Walkthrough;
- Logistics;
- Spatial/Agent.

System isolation belongs in a compact layer/filter control.

## 15. Command palette

Add a CAD-style command/search palette.

Examples:

- `isolate plumbing`
- `show structure`
- `go to checkpoint 14`
- `select roof`
- `show task dependencies`
- `hide temporary works`
- `walkthrough`
- `section east-west`

Keyboard shortcut:

`Ctrl/Cmd + K`

Later natural-language HERMES commands can use the same surface.

## 16. Keyboard interaction

Professional desktop use should support shortcuts.

Initial examples:

- Esc — close current drawer/inspector;
- F — fit view;
- 1 — Architectural;
- 2 — Construction;
- 3 — X-Ray;
- 4 — Section;
- W — Walkthrough;
- Space — play/pause;
- Left/Right — previous/next checkpoint;
- M — model drawer;
- I — inspector;
- Ctrl/Cmd+K — command palette.

Shortcuts are secondary to visible controls but improve professional feel.

## 17. Responsive behavior

Desktop is primary for engineering workspace.

Tablet/mobile:

- canvas remains primary;
- side panels become full-height overlays;
- no simultaneous permanent left/right panels;
- bottom timeline becomes gesture-friendly compact control.

Do not attempt to squeeze desktop dashboard density onto mobile.

## 18. Visual hierarchy

Persistent visual hierarchy should be:

1. 3D construction world;
2. selected physical object / active task;
3. compact world controls;
4. contextual inspector;
5. project/audit/admin information.

Current UI reverses this hierarchy too often.

## 19. Information relocation matrix

Move current controls as follows:

| Current surface | New location |
|---|---|
| Architectural / Construction / X-Ray | Floating canvas view toolbar |
| Section / Cutaway | Floating canvas view toolbar |
| Phase Audit | Inspector → Audit |
| Run Truth Tests | Inspector → Audit/Truth |
| Workforce | Left rail drawer / Inspector |
| Prime / Status | Inspector → Project/Prime |
| Fit View | Canvas navigation toolbar |
| Checkpoint / Current task large bar | Compact canvas task HUD |
| Intake/task card | Compact HUD + Inspector expansion |
| Model Tree | Collapsed left rail drawer |
| Workforce tree | Left rail drawer |
| Materials / BIM lists | Left rail Model/Logistics drawer |
| Prime Inspector | Contextual right inspector |
| Engineering calculations | Inspector → Analysis |
| Replay | Collapsed bottom timeline |
| Event stream | Expanded bottom timeline |
| Heartbeat | Compact health indicator / Inspector |
| Technical/Summary/Audit depth selector | Inspector mode / command palette |

## 20. Acceptance benchmark

The redesigned workspace passes when:

1. At least ~80% of the usable desktop viewport is available to the 3D world in default state.
2. No persistent left/right panel is open by default.
3. There is only one persistent top application bar.
4. The timeline is thin/collapsed by default.
5. The current task does not obscure the center of the model.
6. All removed controls remain discoverable through toolbars/drawers/inspector.
7. Selecting a component opens useful contextual information without navigating away.
8. X-Ray, Construction, Section, and Walkthrough are reachable in one or two clicks.
9. Closing all context panels returns immediately to a clean CAD/BIM-style workspace.
10. The UI can be understood as a professional construction modeling workspace without reading every status card.

## 21. Implementation order

Do not rebuild everything at once.

### Slice A — chrome reduction
- merge two header rows;
- remove duplicate controls;
- make canvas fill available space;
- collapse bottom timeline.

### Slice B — contextual panels
- left rail icons;
- right inspector closed by default;
- move Prime/Truth/Audit/Engineering into inspector.

### Slice C — canvas toolbars
- view modes;
- navigation;
- timeline HUD;
- task HUD.

### Slice D — in-world context
- anchored labels;
- spatial warnings;
- work zones/routes;
- future-constructability visualization.

### Slice E — keyboard/command palette
- shortcuts;
- command/search.

Physical browser acceptance after each slice.

## 22. Do not lose functionality

This is an information-architecture cleanup, not a capability deletion.

Do not remove:

- truth tests;
- Prime status;
- engineering calculations;
- workforce;
- model tree;
- provenance;
- replay;
- event stream.

Move them to better contextual locations.

## 23. Final product feeling

The target feeling is:

**professional BIM/CAD construction world first, HERMES intelligence second, administrative telemetry third.**

Not:

**dashboard with a 3D viewport embedded inside it.**
