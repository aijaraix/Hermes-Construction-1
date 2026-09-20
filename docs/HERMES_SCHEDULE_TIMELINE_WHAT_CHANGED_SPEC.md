# HERMES SCHEDULE + TIMELINE + WHAT CHANGED — IMPLEMENTATION SPEC

Status: Source-audited product and implementation architecture
Purpose: Make project history, current work, future work, replay, and schedule understandable from canonical HERMES state.

## 1. Human objective

When the owner opens a project, HERMES must immediately answer:
- What happened since I last looked?
- What is happening now?
- What happens next?
- Where did it happen?
- What changed physically?
- Is the project on a calculated schedule yet?
- Which work is critical path?
- Can I replay the construction world to that point?

## 2. Canonical sources

Live project timeline source: worldState.events.
Current live HermesWorldEvent records include eventId, projectId, traceId, timestamp, monotonic sequence, eventType, actor, entitiesAffected, payload, and visualIntent.

Successful live tasks currently emit TASK_COMPLETED_<TASK_ID> events. Their payload includes taskId, stageName, phase, priority information, human-readable message, assigned agent, work location, equipment deployed, and materials assigned.

Genesis emits WORLD_GENESIS_INITIALIZED.

Current project state also exposes currentCheckpoint, currentPhase, currentTask, nextTask, completedTasks, activeTaskDetails, overallCompletionPct and attemptId.

Calculated scheduling source: worldState.scheduleActivities. It is not populated until the canonical CPM schedule task has executed.

## 3. Keep history and schedule distinct

Timeline/history answers what actually happened in canonical event order.
Schedule answers planned/calculated activity timing.

Do not infer a schedule from event count.
Do not label planned schedule activity as physically executed unless canonical execution state supports it.

## 4. Current ScheduleView truth defects

The existing ScheduleView must not be treated as final human truth because:

1. When scheduleActivities is absent it displays schedule.length * 10 as Critical Path Duration. That is a fabricated duration.
2. CPMActivity uses activityId and name, while the current view often reads id and stageName/activityName.
3. CPMActivity status is PLANNED / IN_PROGRESS / COMPLETED, while the current view compares lowercase completed / in_progress.
4. The current view invents inspection status: completed becomes HERMES_VALIDATED and other work becomes PENDING_CITY_INSPECTION when no inspection field exists.
5. Missing equipment is displayed as Standard Trade Rigging & Safety, which is not canonical evidence.

Repair rule: missing data must display Not yet calculated / Not recorded, not plausible defaults.

## 5. Human timeline model

Normalize every canonical event into:
- sequence
- event ID
- timestamp
- category
- human title
- detail
- phase
- task ID
- actor ID
- affected entity IDs
- work location
- equipment IDs
- material IDs
- camera/focus hints
- raw event reference

Suggested categories:
- PROJECT
- WORK
- DESIGN
- COMPONENT
- MATERIAL
- DELIVERY
- QUALITY
- ISSUE
- REPAIR
- COORDINATION
- DECISION
- OTHER

## 6. Live task event presentation

For TASK_COMPLETED_<TASK_ID>:

Title: Completed: <human task label>
Detail: canonical payload.message
Phase: canonical payload.phase mapped through human phase labels
Actor: payload.embodiedExecution.assignedAgent or event actor
Location: payload.embodiedExecution.workLocationXYZ
Equipment: payload.embodiedExecution.equipmentDeployed
Materials: payload.embodiedExecution.materialsAssigned
Affected entities: entitiesAffected

Do not infer created/modified entity deltas from the full entitiesAffected array. Current live engine populates that array from current building components, so it is not necessarily a change-set.

## 7. What Changed marker

The last-seen marker is user-interface state, not construction truth.

Recommended structure:
- projectId
- attemptId
- eventSequence
- viewedAt

Browser-local persistence is acceptable for the first owner-only version.
Key by projectId + attemptId.

If attemptId changes, treat the current attempt as new and do not reuse the old marker.

Later this marker can become user-account/server state for cross-device continuity.

## 8. What Changed derivation

Given a lastSeen sequence:
- select canonical events whose sequence is greater than lastSeen
- normalize them
- preserve canonical order
- group/count by category for summary
- highlight newest meaningful events

Never compare arbitrary rendered model snapshots to invent a change log when canonical events exist.

Default recap can say, for example:
- 4 construction steps completed
- 1 inspection event
- 1 material event

only when those event types actually exist.

## 9. What Changed UI

Compact button in project shell:
WHAT CHANGED · 3

Expanded drawer:
- Since you last viewed this project
- chronological human event list
- category filters
- Replay from here
- Focus affected location/entity when evidence supports it
- Mark all seen

If there are no unseen events: Up to date.

## 10. Replay

Replay is a view of canonical history.

Collapsed timeline:
- play/pause
- current checkpoint/event
- total events
- scrubber
- speed
- expand

Expanded timeline:
- phases
- event markers
- current event summary
- event category
- actor
- affected objects
- evidence/details

Scrubbing the live world should use the same current reducer/reconstruction logic already present where possible.

Do not alter canonical current state when the user is merely replaying history.

## 11. Current / Next strip

At all times, timeline workspace should pair history with current state:

DONE: latest completed task
NOW: active/current task
NEXT: canonical nextTask

Reuse humanProjectStatus adapter rather than create another label map.

## 12. Schedule adapter

Normalize both canonical CPMActivity and legacy ConstructionTaskSchedule shapes.

Human schedule activity should include:
- ID
- name
- status
- duration
- early/late start/finish when calculated
- float when calculated
- critical-path boolean only when canonical
- predecessors/successors/dependencies
- trade only when recorded
- equipment only when recorded
- component IDs only when recorded

## 13. Schedule availability states

Use:
- NOT_CALCULATED — no canonical schedule activities
- CALCULATED — scheduleActivities exist

Do not use fake interim durations.

Before CPM generation, human UI should say:
Detailed construction schedule has not been calculated yet.

## 14. Critical path

Only display Critical Path Duration when canonical scheduleActivities exist and earlyFinish values support it.

Critical activities are those with canonical isCriticalPath = true.

Never derive criticality from UI order or styling.

## 15. Schedule vs physical completion

Current live CPM activities are generated late in the Academy journey and contain their own PLANNED / IN_PROGRESS / COMPLETED statuses.

Display them as schedule-state truth, but do not use them to rewrite canonical completedTasks.

If future live projects generate schedule earlier, the same adapter remains valid.

## 16. Event focus

When an event has visualIntent.focusEntityIds, allow Focus in world.
When an event has workLocationXYZ, allow Go to work location.
When no spatial evidence exists, do not fabricate a camera target.

## 17. Event detail and evidence

Advanced event details may show:
- eventId
- traceId
- sequence
- taskId
- phase
- priority score/rationale
- actor
- equipment/material assignments
- raw canonical message
- world hash/checkpoint from surrounding state where available

Default owner view should remain concise.

## 18. Reset / new attempt

attemptId is a critical boundary.

When the project resets and a new attemptId is created:
- old last-seen marker does not apply
- current attempt timeline begins at genesis
- previous attempt history may later be available under Attempts/History

Do not merge events from different attempts into one silent timeline.

## 19. First implementation slice — TIMELINE-01

Implement:
- pure timeline/schedule adapter
- compact timeline data contract
- What Changed derivation
- project/attempt last-seen marker contract
- truth-safe schedule normalization
- UI ticket for later implementation

Defer:
- server-side per-user seen markers
- multi-user notifications
- calendar integrations
- automatic email alerts
- full Gantt editor
- schedule mutation

## 20. Acceptance

A user can answer:
1. What changed since last view?
2. Which tasks completed?
3. Who/what performed the work?
4. Where did work happen when spatial evidence exists?
5. What is happening now?
6. What happens next?
7. Is a detailed schedule actually calculated?
8. What is the canonical critical-path duration, if available?
9. Can I replay canonical events without mutating current state?
10. Does a new attempt reset the unseen-event boundary correctly?

No fabricated schedule, inspection, equipment, or change claims are permitted.