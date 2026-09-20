# HERMES TIMELINE-01 — EXACT IMPLEMENTATION TICKET

Status: Ready for future bounded implementation
Purpose: Add truthful compact timeline, replay context, calculated schedule visibility, and What Changed to the immersive HERMES workspace.

## 1. Read first

- docs/HERMES_SCHEDULE_TIMELINE_WHAT_CHANGED_SPEC.md
- src/lib/projectTimelineState.ts
- src/lib/humanProjectStatus.ts
- docs/HERMES_HUMAN_STATUS_LAYER_IMPLEMENTATION_SPEC.md
- docs/HERMES_IMMERSIVE_REACT_COMPONENT_STATE_ARCHITECTURE.md

## 2. Scope

Implement TIMELINE-01 only.

Required:
- compact bottom timeline overlay
- current checkpoint/event display
- play/pause/scrub/speed using existing replay state
- expandable event list
- What Changed button/count
- project-attempt last-seen marker in browser storage
- schedule availability and critical-path display only when canonical schedule is calculated
- Done / Now / Next from humanProjectStatus

Do not build a Gantt editor or mutate the schedule.

## 3. Truth repairs

Do not preserve these current ScheduleView fallbacks:
- schedule.length * 10 critical path duration
- invented HERMES_VALIDATED / PENDING_CITY_INSPECTION status
- Standard Trade Rigging & Safety equipment fallback

Handle canonical CPM fields correctly:
- activityId
- name
- PLANNED / IN_PROGRESS / COMPLETED

## 4. Last-seen marker

Persist only UI observation state.
Suggested key: hermes:last-seen:<projectId>:<attemptId>

Stored object must include projectId, attemptId, eventSequence and viewedAt.

If attemptId changes, old marker must not suppress events from the new attempt.

Mark all seen only after the user opens/acknowledges the change view or explicitly chooses Mark seen. Do not auto-mark on background polling.

## 5. Compact timeline

Default collapsed height target: approximately 40–48 px.

Show:
- play/pause
- current event/checkpoint
- total events
- scrubber
- speed
- expand
- What Changed badge

Must overlay the canvas rather than reduce the 3D viewport height.

## 6. Expanded timeline

Show normalized events from projectTimelineState.

Each row:
- sequence
- title
- phase
- timestamp when meaningful
- actor
- detail
- category

Actions only when supported:
- Focus entities using focusEntityIds
- Go to work location using workLocationXYZ
- replay/select event

## 7. What Changed

Show unseen canonical events after lastSeen sequence.

Summary by category.
Do not claim model-object change deltas from live entitiesAffected because current live task events populate that array from the current component collection, not necessarily only changed objects.

Use canonical event detail/payload message.

## 8. Schedule

If projectTimelineState.schedule.availability = NOT_CALCULATED:
show Detailed construction schedule has not been calculated yet.

If CALCULATED:
- show critical path duration only if present
- show activity names/statuses
- show critical activities from canonical isCriticalPath
- show float only when recorded
- show trade/equipment only when recorded

## 9. Replay safety

Replay is view-only.
Do not mutate canonical world state when scrubbing.

Current live world should remain recoverable by returning to latest event.

## 10. Allowed files

Preferred:
- src/components/immersive/ConstructionTimeline.tsx
- src/components/immersive/WhatChangedDrawer.tsx
- src/lib/projectTimelineState.ts
- src/components/BimWorkspaceView.tsx only for integration with existing replay controls
- immersive shell/workspace state only as required

Do not touch server event generation in TIMELINE-01.

## 11. Acceptance

Pass when:
1. Timeline is collapsed by default.
2. Canvas size does not change when timeline expands.
3. Replay controls still work.
4. What Changed counts only events after valid marker.
5. Reset/new attempt does not reuse prior marker.
6. Human event titles are understandable.
7. Missing detailed schedule says not calculated.
8. No fabricated critical path duration appears.
9. Canonical CPM names/statuses render correctly when schedule exists.
10. Focus/location actions appear only with spatial evidence.

## 12. Stop

Stop after TIMELINE-01.
Do not continue into schedule editing, notifications, calendar sync, or multi-user collaboration.