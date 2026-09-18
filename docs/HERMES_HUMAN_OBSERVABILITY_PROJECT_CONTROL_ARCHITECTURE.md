# HERMES HUMAN OBSERVABILITY + PROJECT CONTROL ARCHITECTURE

**Status:** Owner-directed product requirement  
**Purpose:** Make HERMES immediately understandable to a human operator at every stage of a project without requiring technical interpretation of internal AI/runtime state.

## 1. Core principle

HERMES must be **human-observable by default**.

A technically correct canonical world is not enough.

A human opening HERMES must be able to understand the project state within seconds.

The operator should not need to ask another person or AI:

- Is it running?
- Is it done?
- What stage are we in?
- What happened?
- What is next?
- What is blocked?
- What changed?
- What should I look at?

The product itself must answer those questions visibly.

## 2. Interaction philosophy

Use familiar interaction patterns from professional construction/design software rather than exposing internal system terminology directly.

Reference interaction patterns conceptually from:

- Revit / BIM: object tree, properties, schedules, type/instance behavior;
- Navisworks / coordination: model isolation, clash/issues, viewpoints, timeline;
- Procore / project controls: RFIs, submittals, issues, photos, project records;
- Primavera / scheduling: phase/task timeline and critical path;
- Bluebeam / markup: visual issue/evidence annotation;
- Autodesk Construction Cloud: model coordination and issue context.

Do not copy proprietary UI pixel-for-pixel.

Reuse the human interaction concepts professionals already understand.

## 3. At-a-glance project state

Every project should expose one compact, plain-language **Project Status** surface inside the immersive workspace.

It must answer:

### Overall
- project name;
- current phase;
- overall completion;
- current active work;
- next major milestone;
- project health.

### Progress
- completed stages;
- current stage;
- upcoming stages;
- blocked stages.

### Attention
- blockers;
- failed inspections;
- unresolved clashes;
- missing decisions;
- overdue material;
- schedule risk;
- budget risk.

### Evidence
- last verified event;
- current world revision;
- last inspection/validation;
- most recent change.

## 4. Plain-language statuses

Do not make the user interpret raw internal states such as:

- checkpoint 17;
- event 284;
- CAP-X;
- execution mode;
- internal agent IDs.

Those may remain available in advanced detail.

Primary UI should translate them into understandable labels.

Example:

Instead of:

`CHECKPOINT 17 / TASK-MEP-ROUGH-004 / EVENT 228`

Show:

> **Electrical & Plumbing Rough-In — 68% complete**

Advanced inspector may expose the canonical IDs.

## 5. Project phase navigator

The user should always be able to see the whole construction journey.

Example:

```
✓ Brief & Site
✓ Survey / Geotech
✓ Design
✓ Mobilization
✓ Foundation
● Framing
○ Enclosure
○ MEP
○ Inspections
○ Close-In
○ Finishes
○ Commissioning
○ Handoff
```

Selecting a phase:

- moves the timeline;
- filters model objects;
- opens phase details;
- shows tasks/materials/issues associated with that phase.

This becomes the human-readable index into the canonical event stream.

## 6. Current work indicator

Inside the world, show a small **Now** HUD.

Example:

> **NOW**  
> Framing exterior west wall  
> 3 actors active  
> 2 material batches in use  
> Expected completion: 42 min simulation time  
> Next: roof truss staging

Clicking opens details.

## 7. Done / Doing / Next

Every project should support an extremely simple summary:

### DONE
What was completed and verified.

### DOING
What HERMES is working on right now.

### NEXT
What will happen next and what prerequisites remain.

This is the default owner/executive view.

## 8. Blockers

Blockers must be highly visible and understandable.

Examples:

> **Blocked — Window delivery delayed 4 days**

> **Blocked — Structural review required before opening wall**

> **Blocked — LVL must enter room before wall closure**

Clicking a blocker should:

- focus affected objects/location;
- explain why;
- show dependent tasks;
- show options;
- show who/what can resolve it.

## 9. Visual state colors

Use consistent visual semantics.

Suggested:

- complete/verified;
- active/in progress;
- planned;
- blocked;
- warning;
- failed/rework;
- unknown/unverified.

Do not rely on color alone; pair with icon/text.

The same status semantics should appear across:

- model;
- timeline;
- task list;
- materials;
- inspections;
- issues.

## 10. World annotations

Important project state should appear spatially.

Examples:

- active work zone;
- material arriving here;
- inspection required here;
- clash here;
- blocked access here;
- next task here;
- completed task here;
- waiting material here.

Click annotation → inspector.

The physical world should explain project state, not only a separate table.

## 11. Project Overview workspace

A compact project overview can open inside the immersive app.

It may include:

### Progress
- percent complete;
- phase progress;
- milestone status.

### Time
- planned duration;
- current schedule;
- delays;
- critical path items.

### Cost
- budget;
- committed;
- spent;
- forecast;
- contingency.

### Materials
- ordered;
- delivered;
- staged;
- installed;
- shortages.

### Quality
- inspections passed;
- open issues;
- rework.

### Decisions
- owner decisions pending;
- professional reviews pending.

Every card must link back to affected physical world objects/tasks.

No dead dashboard numbers.

## 12. Task browser

Tasks should be organized like project work, not internal agent execution logs.

Human-facing fields:

- title;
- phase;
- location;
- status;
- owner/actor;
- start;
- finish;
- dependencies;
- materials;
- equipment;
- inspection;
- cost;
- progress.

Advanced fields may expose:

- internal task ID;
- event IDs;
- model provider;
- validator records.

## 13. Materials browser

Human-readable material state should show:

- needed;
- ordered;
- delivered;
- staged;
- installed;
- remaining;
- damaged/waste;
- cost;
- supplier;
- affected tasks.

Selecting a material highlights:

- staged batches;
- installed components;
- future consumption.

## 14. Issues and quality

Use an issue workflow familiar to construction teams.

Issue record:

- location;
- object;
- description;
- severity;
- responsible party;
- evidence/photo;
- opened;
- due;
- status;
- resolution;
- reinspection.

Click issue → focus world location/object.

## 15. Schedule readability

Do not require users to understand raw event streams.

Provide:

### Simple timeline
Phase/milestone view.

### Detailed schedule
Tasks, dependencies, critical path, delays.

### Replay
Physical world synchronized with schedule.

A user can drag the timeline and watch the building physically change.

## 16. Explain button

Every important object/task/decision should support:

`Explain`

HERMES should answer in context:

- what it is;
- why it exists;
- why it is here;
- why now;
- materials;
- dependencies;
- risks;
- evidence.

This is a core AI-native advantage.

## 17. "What changed?" mode

The owner should be able to open HERMES after hours/days and immediately ask:

> What changed since I last looked?

Show:

- new components;
- completed tasks;
- material deliveries;
- inspections;
- issues;
- revisions;
- cost changes;
- schedule changes.

Highlight changed objects directly in the world.

## 18. "Show me today's work"

For real projects later:

- tasks completed today;
- work currently active;
- work scheduled next;
- photos/observations;
- material deliveries;
- inspections.

The same concept works in simulation time for Academy.

## 19. Owner / executive depth

Default information depth:

- plain language;
- concise;
- outcome-oriented.

Examples:

> Foundation complete and inspected.

> Framing is 61% complete.

> Two items need attention.

Do not show internal telemetry unless expanded.

## 20. Professional depth

Professionals can expand into:

- object properties;
- assemblies;
- model revisions;
- engineering calculations;
- constraints;
- schedules;
- procurement;
- evidence;
- source standards;
- spatial routing.

One system, progressive disclosure.

## 21. Developer / system depth

Internal diagnostics should remain available but separate:

- runtime;
- queues;
- model provider;
- events;
- hashes;
- logs;
- capability truth;
- test evidence.

Do not mix developer diagnostics into the normal construction workspace.

## 22. Status hierarchy

Three layers:

### Layer 1 — Human
“Framing — 61% complete”

### Layer 2 — Project
Tasks, materials, blockers, inspections.

### Layer 3 — System
Canonical IDs, events, hashes, runtime/model telemetry.

Default to Layer 1.

Progressively disclose 2 and 3.

## 23. Continuous visual proof

A major HERMES requirement:

The owner should never need to trust a text claim that construction progressed.

Progress must be visible through:

- changed physical world;
- timeline;
- task status;
- event/evidence;
- material consumption;
- inspection.

The system should make claims and proof adjacent.

## 24. Completion definition

A project/phase/task is not “done” because an agent says so.

Human UI should reflect completion only when its canonical completion gate is satisfied.

Possible gates:

- geometry/state updated;
- material consumed/installed;
- task completion event;
- validation;
- inspection/evidence.

This prevents false green dashboards.

## 25. Project home state

When a user opens HERMES, default view should immediately show:

- full project world;
- current phase;
- overall %;
- current task;
- next milestone;
- blockers count;
- one-click “What changed?”;
- one-click “Replay progress”.

All other detail is inside the application.

## 26. Acceptance test

A first-time user should be able to open a project and, without instruction, answer within 30 seconds:

1. What is this project?
2. What stage is it in?
3. How far along is it?
4. What is happening now?
5. What happens next?
6. Is anything blocked?
7. Where in the building is the current work?
8. Can I replay how we got here?
9. Can I inspect an object?
10. Can I see proof that work was completed?

If not, the UI is not human-observable enough.

## 27. Product rule

HERMES must never become a system where:

> “The AI understands it, but the human cannot.”

The canonical world exists for machines **and** people.

The machine representation may be dense.

The human representation must be legible.
