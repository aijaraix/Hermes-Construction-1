# HERMES HUMAN STATUS LAYER — IMPLEMENTATION SPEC

Status: Source-audited implementation specification
Purpose: Convert canonical HERMES world state into an immediately understandable human project summary without fabricating project facts.

## 1. Source truth

The current canonical HermesWorldState already exposes project identity, current checkpoint, current phase, current task, active agents, next task, overall completion, project status/mode, components, materials, clashes, BOM, schedule, inspections, events, completed tasks, active task details, pending questions, constructability proof, and diagnostics.

The human status layer must derive from these canonical fields only.

## 2. Current canonical phase order

1. INTAKE — Project Brief
2. FEASIBILITY — Site & Code Feasibility
3. SURVEY — Site Survey
4. GEOTECH — Geotechnical
5. FOUNDATION_DESIGN — Foundation Design
6. ARCHITECTURAL_DESIGN — Architectural Design
7. STRUCTURAL_ENGINEERING — Structural Engineering
8. MOBILIZATION — Site Mobilization
9. CONSTRUCTION_SUBSTRUCTURE — Foundation & Substructure
10. CONSTRUCTION_SUPERSTRUCTURE — Framing & Structure
11. ENCLOSURE — Building Enclosure
12. MEP_COORDINATION — MEP Rough-In & Coordination
13. CLOSE_IN — Insulation & Close-In
14. FINISHES — Finishes & Fixtures
15. ESTIMATING — Quantity & Cost Finalization
16. SCHEDULING — Schedule & Logistics
17. INSPECTION — Final Inspections
18. CLOSEOUT — Project Closeout

Unknown phases should be formatted conservatively rather than mapped to invented meaning.

## 3. Human task map

INTAKE_COMPLETE — Validate project brief
RESOLVE_JURISDICTION — Resolve jurisdiction and code requirements
SITE_SURVEY_CONTROL — Establish site survey control
GEOTECHNICAL_INVESTIGATION — Complete geotechnical investigation
FOUNDATION_SELECTION_ENGINE — Select foundation system
SPACE_PLANNING_SOLVER — Develop architectural layout
STRUCTURAL_ANALYSIS_LAYER — Complete structural analysis
MOBILIZE_SITE_OPERATIONS — Mobilize construction site
EXCAVATE_PAD_AND_TRENCHES — Excavate building pad and footings
ASSEMBLE_SLAB_FORMWORK — Assemble slab formwork
INSTALL_REBAR_AND_PT_TENDONS — Install reinforcing and post-tensioning
POUR_FOUNDATION_CONCRETE — Place foundation concrete
CONSTRUCT_FOUNDATION_MESH — Complete foundation assembly
EVALUATE_ENVIRONMENTAL_CURING — Verify concrete curing readiness
STAGE_LONG_MATERIAL_BEFORE_CLOSURE — Stage long material before access closes
SUPERSTRUCTURE_FRAMING — Frame walls and roof structure
ENCLOSE_BUILDING_AND_INSTALL_OPENINGS — Install enclosure, windows and doors
MEP_ROUTING_AND_CLASH_DETECTION — Install and coordinate MEP rough-in
REPAIR-CLASH-001 — Resolve MEP coordination conflict
INSULATE_AND_CLOSE_IN — Inspect rough-in, insulate and close walls
INSTALL_FINISHES_AND_FIXTURES — Install finishes and fixtures
CALCULATED_BOM_AND_TAKEOFF — Finalize quantities and cost
CPM_SCHEDULE_GENERATION — Generate construction schedule
LOGISTICS_RESILIENCE_GATE — Validate logistics and supply-chain resilience
MULTI_TRADE_INSPECTION_GATE — Complete multi-trade inspection
CLOSEOUT_DIGITAL_TWIN — Complete project closeout

## 4. Output contract

HumanProjectStatus should expose projectId, projectName, statusLabel, phaseLabel, completionPct, Done, Doing, Next, attention items, evidence counts, and phase progress.

Done: latest canonical completedTasks entry and total completed task count.
Doing: activeTaskDetails when present, otherwise currentTask; include canonical active agents, work location, equipment and materials when present.
Next: canonical nextTask.
Attention: derive only from project BLOCKED state, pendingQuestion, blocked/failed constructability proof, inspection FAIL/INSUFFICIENT_INFORMATION, and current clash records.
Evidence: checkpoint, event count, component count, material batch count, inspection count, and worldStateHash.

## 5. Attention rules

Project BLOCKED: show Project work is blocked. Do not invent the cause.
Pending question: show Decision required and use the canonical prompt.
Constructability BLOCKED/FAILED: show Future access / constructability issue and canonical rationale.
Inspection FAIL: show Inspection failed.
Inspection INSUFFICIENT_INFORMATION: show Inspection needs more information.
Clashes: if current records exist but resolution schema is unclear, say Coordination records require review rather than claiming an unresolved failure.

## 6. Status labels

PENDING_INTAKE — Waiting for project information
CUSTOMER_DECISION_REQUIRED — Owner decision required
IN_PROGRESS — In progress
COMPLETED — Complete
BLOCKED — Blocked

## 7. Phase progress

For each known phase:
- COMPLETE if all known base tasks in that phase are in completedTasks, or if the canonical current phase has advanced past it.
- CURRENT if it matches currentPhase.
- UPCOMING otherwise.

Do not invent phase percentages.

## 8. Human UI

Compact default HUD should show:

FOUNDATION & SUBSTRUCTURE · 31%
NOW — Install reinforcing and post-tensioning
NEXT — Place foundation concrete
1 item needs attention

Expanded project status shows Done / Doing / Next / Attention / phase timeline / evidence.

## 9. What Changed

The existing canonical event stream should power a later What changed? feature. It should compare event sequence, not arbitrary UI snapshots.

## 10. Truth standard

Never produce green owner-facing status from hard-coded defaults, static fixture hashes, fake fallback counts, or historical test strings.

Every human status must either derive from canonical current state or say unavailable.

## 11. Acceptance

At genesis: show Project Brief, canonical completion, current intake task, correct next task, and no fabricated blocker.
During construction: show correct human phase, canonical current/next work, actual active agents, actual attention items.
At completion: show Project Closeout / Complete, and 100% only if canonical state says 100.