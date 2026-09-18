# HERMES IMMERSIVE WORKSPACE PRODUCT ARCHITECTURE

**Status:** Owner-directed product architecture  
**Basis:** Physical browser review of Academy House 001 on Railway, September 18, 2026  
**Purpose:** Define HERMES as an immersive, full-screen construction operating application where every tool, inspector, material view, project control, replay surface, and system function exists inside the working world.

## 1. Core product definition

The construction workspace is not a dashboard containing a 3D viewport.

It is the application.

When an operator enters a project, the project world should consume the entire usable application window.

The correct mental model is closer to a desktop CAD/BIM application than a website:

> **THE PROJECT WORLD IS THE APPLICATION SHELL.**

There should be no separate persistent outer dashboard chrome competing with the world.

Every project tool should exist inside that space as:

- floating tools;
- dockable panels;
- contextual inspectors;
- drawers;
- command palettes;
- in-world overlays;
- timelines;
- project/entity browsers;
- temporary modal workspaces.

The operator must always be able to return to an unobstructed edge-to-edge world.

## 2. Two distinct product experiences

HERMES needs two separate viewing paradigms.

### A. Construction / Operations Workspace

Primary audience:

- owner/operator;
- builder;
- architect;
- engineer;
- construction manager;
- inspector;
- internal HERMES operator;
- future robotics/site-computer operators.

Purpose:

- inspect what HERMES designed;
- inspect what HERMES built;
- watch construction happen;
- replay construction;
- examine materials;
- validate systems;
- inspect provenance;
- review clashes;
- examine task sequencing;
- see actors/equipment/logistics;
- view spatial reasoning;
- inspect cost/schedule/material state;
- understand why decisions were made.

This is the primary system being designed now.

### B. Customer / Presentation Experience

Separate mode for:

- customers;
- investors;
- partners;
- presentations;
- guided walkthroughs;
- design reviews.

This experience may prioritize:

- clean architectural presentation;
- narrative;
- guided comparisons;
- approvals;
- options;
- before/after;
- selected engineering explanations.

Do **not** force customer/presentation UI requirements into the construction workspace.

The customer experience can be designed later.

## 3. Owner interaction model

The owner/operator is not manually drafting every wall.

HERMES is doing the building/planning work.

Therefore the human workspace should optimize for:

- observation;
- inspection;
- validation;
- intervention;
- comparison;
- command;
- replay;
- evidence.

The human should be able to ask:

- What did HERMES build?
- Why?
- What material is this?
- Who/what installed it?
- What task created it?
- What source/rule justified it?
- What is hidden behind this wall?
- What is scheduled next?
- What failed?
- What changed?
- What did this cost?
- Where did the material come from?
- Could this have been sequenced differently?
- What does the site look like at another checkpoint?

The workspace must make those questions easy to answer.

## 4. Default application state

When entering a project:

- the 3D construction world fills the application edge-to-edge;
- no persistent left sidebar is open;
- no persistent right sidebar is open;
- no second header exists;
- no tall bottom shelf is open;
- no large task card covers the center;
- no audit/status dashboard competes with the model.

Only minimal floating application controls are visible.

Target:

**approximately 95%+ of the usable application window should remain visually part of the project workspace when no contextual panels are expanded.**

This is stronger than an 80% canvas target.

## 5. Application shell

The project workspace may have a tiny overlay shell rather than conventional page chrome.

Possible persistent elements:

### Top-left
- HERMES mark;
- project name;
- project switcher.

### Top-center
- command/search palette trigger.

### Top-right
- world state/health;
- user/environment;
- notifications if necessary.

These controls float over the world and should consume minimal height.

There should not be a conventional full-width multi-row website header.

## 6. Project navigation inside the world

All project navigation belongs inside the project shell.

A compact launcher/icon rail can expose:

- Model;
- Project;
- Customers;
- Materials;
- Procurement;
- Schedule;
- Tasks;
- Workforce;
- Equipment;
- Logistics;
- Systems;
- Inspections;
- Issues;
- Documents;
- Evidence;
- Academy;
- Analytics;
- Settings.

Selecting an icon opens a drawer or dockable workspace **inside the application space**.

The project world remains underneath.

## 7. Inspector architecture

The inspector is a contextual universal workspace.

Default: closed.

It opens when:

- a component is selected;
- an actor is selected;
- a material batch is selected;
- a task is selected;
- an issue is selected;
- a user explicitly opens the inspector.

Possible inspector tabs:

### Object
- dimensions;
- geometry;
- type;
- location;
- system;
- assembly.

### Material
- specification;
- batch;
- supplier;
- quantity;
- cost;
- inventory/staging;
- substitutions.

### Provenance
- task;
- agent;
- event;
- revision;
- source;
- knowledge/evidence;
- dependency reason.

### Construction
- install state;
- work package;
- predecessors;
- successors;
- inspection;
- rework.

### Spatial
- work zone;
- route;
- clearance;
- payload;
- conflicts;
- future-access implications.

### Systems
- structural;
- plumbing;
- electrical;
- HVAC;
- envelope;
- fire/life safety.

### Commercial
- quantity;
- budget;
- cost;
- procurement;
- lead time.

### Prime / Project
- HERMES status;
- recommendations;
- alerts;
- autonomy decisions.

### Audit
- truth tests;
- evidence;
- validation;
- source status.

Everything currently spread across multiple status cards can converge here.

## 8. Materials workspace

Building materials are a core operating capability, not a secondary dashboard.

The workspace should make it easy to inspect:

- what materials were specified;
- why they were selected;
- required quantity;
- actual quantity;
- supplier/source;
- cost;
- lead time;
- current location;
- delivery state;
- staging;
- assigned task;
- installed components;
- compatibility;
- substitutions;
- remaining inventory;
- waste.

Material interactions should be accessible through both:

- the object/material inspector;
- a dedicated materials drawer.

Where possible, selecting a material highlights:

- all installed instances;
- staged inventory;
- delivery/staging location;
- future consumption.

## 9. Visual construction controls

All view controls should be floating/dockable inside the world.

Modes:

- Architectural;
- Construction;
- X-Ray;
- Section/Cutaway;
- Walkthrough;
- Logistics;
- Spatial/Agent;
- Systems isolation.

Navigation:

- select;
- orbit;
- pan;
- zoom;
- fit;
- measure;
- section plane;
- visibility/isolate;
- view cube.

These should behave like application tools, not webpage navigation buttons.

## 10. Construction timeline

The project timeline is fundamental, but it should live inside the world.

Default:

- thin scrubber overlay;
- play/pause;
- checkpoint;
- speed.

Expanded:

- tasks;
- phases;
- event stream;
- world revisions;
- material deliveries;
- inspections;
- rework;
- actor activity.

The operator should be able to scrub the world through time and see the physical project change.

## 11. Task / mission HUD

Current task information should be compact.

Small floating HUD:

- current phase;
- task;
- progress;
- next action;
- warning if blocked.

Click/expand opens full task information in the inspector.

No giant task panel should cover the working world.

## 12. In-world intelligence

Information with physical meaning should be anchored to the physical world.

Examples:

- task marker at work location;
- selected component label;
- material staging label;
- actor path;
- crane swing zone;
- work-zone boundary;
- clash highlight;
- future-access warning;
- inspection failure;
- sensor observation;
- delivery route;
- inaccessible opening;
- hidden MEP path.

This makes HERMES intelligence spatial rather than dashboard-based.

## 13. Customers and project business data

Even non-spatial project functions should open as internal application workspaces rather than navigating away to unrelated pages.

Examples:

- customer/project brief;
- approvals;
- scope;
- budget;
- schedule;
- procurement;
- documents;
- communications;
- change history.

These may temporarily occupy large portions of the app, but remain inside the same application shell.

Closing the workspace returns directly to the project world.

## 14. Command palette

A universal command surface should be central to HERMES.

Shortcut:

`Ctrl/Cmd + K`

Examples:

- show plumbing;
- isolate structure;
- show materials not yet installed;
- show today’s tasks;
- go to checkpoint 18;
- select roof;
- explain this wall;
- show material source;
- compare current state to design;
- replay foundation;
- show blocked tasks;
- open customer brief;
- show budget;
- show logistics;
- section through kitchen;
- show future constructability conflicts.

Later natural-language commands and AI interaction can use the same surface.

## 15. Full-screen behavior

The web application should support true browser full-screen.

Longer term, it may also be packaged as a desktop application.

Important principle:

**desktop packaging is not required to achieve the desired interaction model.**

The current web app can already behave like a full-screen professional application.

Possible future packaging options may include:

- Progressive Web App;
- Tauri desktop shell;
- Electron desktop shell.

Do not select or implement desktop packaging yet.

First make the web workspace interaction correct.

## 16. Why a desktop app may eventually make sense

A desktop shell may later provide:

- dedicated app window;
- local file access;
- stronger offline behavior;
- native notifications;
- multiple monitors/windows;
- local GPU/inference integration;
- large BIM file workflows;
- site-edge deployment;
- hardware integration.

But packaging a cluttered web UI inside a desktop executable would not solve the real problem.

The full-screen workspace architecture comes first.

## 17. Multi-window future

Professional users may eventually want:

- main 3D world on monitor 1;
- inspector/materials on monitor 2;
- schedule/analytics on monitor 3.

Design dockable panels so they could later become detachable windows.

Do not implement this in the current visual pass.

## 18. Construction vs presentation rendering

The same canonical world should support both experiences.

### Construction workspace
Prioritizes:
- assemblies;
- MEP;
- structure;
- tasks;
- provenance;
- materials;
- work zones;
- actors;
- evidence.

### Presentation mode
Prioritizes:
- finished architecture;
- clean walkthrough;
- customer options;
- storytelling;
- approvals.

Do not create two separate sources of geometry.

One canonical world, different presentation layers.

## 19. Internal data surfaces

The following all belong inside the application workspace:

- project/customer;
- material inventory;
- suppliers;
- procurement;
- tasks;
- schedule;
- cost;
- BIM/model;
- workforce;
- equipment;
- logistics;
- inspections;
- issues;
- documents;
- evidence;
- Academy;
- Prime/autonomy;
- system health.

They should not become a collection of unrelated web pages.

## 20. Visual acceptance requirements

The workspace passes when:

1. Project world extends edge-to-edge across the application.
2. There is no conventional multi-row page header.
3. No left/right drawer is open by default.
4. No tall bottom shelf is open by default.
5. No large card obscures the center.
6. Almost all functions remain reachable through in-world tools/drawers/inspector.
7. Closing tools restores an essentially unobstructed world.
8. Materials, tasks, provenance, and systems can be inspected without leaving the project.
9. Timeline/replay feels part of the world.
10. The product feels like a professional installed application even while running in a browser.

## 21. Implementation sequence

### Slice A — Immersive shell
- remove conventional dashboard chrome;
- make world edge-to-edge;
- minimal floating project shell;
- collapse timeline;
- close side panels by default.

### Slice B — Universal inspector
- migrate Prime/status;
- audit/truth;
- engineering;
- provenance;
- construction;
- materials.

### Slice C — Internal launcher/drawers
- project;
- customers;
- materials;
- schedule;
- workforce;
- logistics;
- documents;
- issues.

### Slice D — Canvas tools
- view modes;
- navigation;
- clipping;
- isolate;
- measure;
- walkthrough.

### Slice E — Timeline/task HUD
- compact replay;
- task/phase HUD;
- expandable event timeline.

### Slice F — In-world intelligence
- labels;
- routes;
- work zones;
- constructability;
- clashes;
- material location;
- task locations.

### Slice G — Command palette
- keyboard shortcuts;
- natural-language/project command entry.

Physical browser acceptance after every slice.

## 22. Non-negotiable rule

No capability should require the operator to abandon the construction application and navigate through a website-style dashboard unless it truly belongs to a different product experience.

The operator should always feel:

> “I am inside this construction project.”

not:

> “I am browsing pages about this construction project.”

## 23. Product feeling

Construction Workspace target:

**AutoCAD / Revit / Navisworks class of immersive working application, but AI-native and centered on a living construction world.**

HERMES does the planning/building work.

The human:

- watches;
- inspects;
- understands;
- validates;
- intervenes;
- commands.

Customer Presentation target:

**separate guided experience built from the same canonical world.**
