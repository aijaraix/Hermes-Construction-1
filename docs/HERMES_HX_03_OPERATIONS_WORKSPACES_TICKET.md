# HERMES-HX-03 — OPERATIONS WORKSPACES: MATERIALS + SCHEDULE + LOGISTICS

CONTROLLING TICKET: HX-03

## Start condition

HX-02 is physically accepted or owner-authorized to continue.
Continue from the accepted HX-02 branch state.

## Read only

1. docs/HERMES_HUMAN_EXPERIENCE_CONSOLIDATED_IMPLEMENTATION_MASTER.md
2. docs/HERMES_MATERIALS_PROCUREMENT_HUMAN_WORKSPACE_SPEC.md
3. docs/HERMES_SCHEDULE_TIMELINE_WHAT_CHANGED_SPEC.md
4. docs/HERMES_IMMERSIVE_LAUNCHER_WORKSPACE_INTERACTION_SPEC.md

## Objective

Fill the remaining primary operations workspaces with truthful canonical project data.

## Materials

Build MaterialsWorkspace:
- Overview
- Requirements
- On Site
- Procurement lifecycle/state
- Installed
- Exceptions
- canonical cost only
- 3D focus/inspect

Preserve demand truth, physical batch truth and supplier/price evidence as separate layers.

Never show historical RESIDENCE-TAMPA-001 price evidence as live HERMES-LIVE-HOUSE-001 evidence.

## Schedule

Build ScheduleWorkspace from projectTimelineState:
- NOT_CALCULATED state
- calculated activities
- critical path only when canonical
- dependencies/float/trade/equipment only when recorded

Do not duplicate the bottom replay timeline.

## Logistics

Build initial LogisticsWorkspace from canonical:
- equipment entities
- material staging
- work locations
- assigned equipment/materials
- constructability/future-access proof

No invented delivery routes, A*, reservations or robot paths.

## Legacy truth repairs

If still reachable:
- remove BOM percentage-based cost fallback
- remove universal VERIFIED_CURRENT_QUOTE supplier badge
- remove ScheduleView fabricated duration/inspection/equipment defaults

## Developer drawer cleanup

Only after replacements pass physical acceptance:
remove/hide duplicated normal project data engines from Developer/System:
- inspections/quality
- BOM
- procurement
- schedule
- risks

Keep Academy, Prime internals, agents, knowledge, source registry, truth, diagnostics, audit and health.

## Do not

Do not implement purchasing/payment.
Do not add supplier integrations.
Do not add server procurement API in this pass.
Do not implement partial consumption reconciliation.
Do not build robotics/pathfinding.

## Acceptance

1. Materials counts match adapter.
2. PURCHASED + LAYDOWN_YARD is not falsely called verified delivery.
3. Missing cost stays not calculated.
4. Schedule missing state is truthful.
5. Calculated CPM fields render correctly.
6. Logistics shows only canonical spatial/equipment/material facts.
7. 3D focus/inspection bridges work where IDs exist.
8. Developer/System no longer duplicates accepted normal project workspaces.
9. Build/typecheck pass.
10. Physical browser acceptance passes or is truthfully blocked.

Commit one focused HX-03 commit and STOP.