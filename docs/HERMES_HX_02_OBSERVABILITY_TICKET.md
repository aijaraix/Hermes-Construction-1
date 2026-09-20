# HERMES-HX-02 — OBSERVABILITY: INSPECTOR + ATTENTION + TIMELINE

CONTROLLING TICKET: HX-02

## Start condition

HX-01 is physically accepted or owner-authorized to continue.
Continue from the accepted HX-01 implementation branch state.

## Read only

1. docs/HERMES_HUMAN_EXPERIENCE_CONSOLIDATED_IMPLEMENTATION_MASTER.md
2. docs/HERMES_UNIVERSAL_INSPECTOR_IMPLEMENTATION_SPEC.md
3. docs/HERMES_NEEDS_YOUR_ATTENTION_IMPLEMENTATION_SPEC.md
4. docs/HERMES_SCHEDULE_TIMELINE_WHAT_CHANGED_SPEC.md

## Objective

Make the immersive world understandable and inspectable without adding new project truth.

## Deliver

Universal Inspector:
- COMPONENT / MATERIAL / ACTOR / EQUIPMENT
- Overview / Properties / Construction / Spatial / Quality / Provenance
- Focus / Isolate / Hide only where supported
- default closed

Attention:
- Needs Attention chip
- blocking/owner-action counts
- owner question
- blocked project
- constructability
- active clashes
- failed component states
- HERMES inspection distinctions
- professional review
- AHJ/CO
- Quality workspace/drawer

Timeline:
- 40–48 px collapsed bottom overlay
- play/pause/scrub/speed
- expanded event list
- What Changed
- last-seen marker keyed by projectId + attemptId
- truth-safe schedule availability/CPM display
- focus/location action only with evidence

## Truth repairs

Zero inspection tickets must not mean passed.
HERMES_VALIDATED must not mean professional/AHJ approval.
No fake critical path duration.
No invented inspection/equipment schedule values.
Resolved reroute clash must not remain active.

## Do not

Do not modify server event generation.
Do not implement repair actions.
Do not build Materials workspace body.
Do not build purchasing.
Do not create LLM explanations.

## Acceptance

1. Selecting a component/material/actor/equipment opens correct inspector.
2. World size remains unchanged.
3. Attention counts exactly match adapter.
4. Owner question appears correctly.
5. Professional/AHJ states are separate.
6. Timeline replay is view-only.
7. What Changed respects attempt boundary.
8. Schedule says not calculated when absent.
9. Existing world/runtime behavior preserved.
10. Build/typecheck and physical browser acceptance pass or are truthfully blocked.

Commit one focused HX-02 commit and STOP.