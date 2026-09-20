# HERMES UNIVERSAL INSPECTOR — IMPLEMENTATION SPEC

Status: Source-audited architecture specification
Purpose: Create one contextual inspector for every meaningful entity in the HERMES world while preserving object traceability, spatial context, construction state and human readability.

## 1. Product rule

The inspector is the bridge between what the human sees and what HERMES actually knows.
If the inspector shows a fact, canonical state must support it.

Default state: closed.
Selecting an entity opens it.
No selection: project-level inspector opens only when explicitly requested.

## 2. Current entity sources

PROJECT: HermesWorldState.

COMPONENT: current live buildingComponents plus existing BIMComponent / ReferenceBimComponent fields. Current records support identity, category, discipline, IFC type, position, dimensions, material, installation phase, inspection state, source task and creating agent. Existing BIM contracts add floor/room, assembly, material arrays/spec IDs, cost/quantity, connected components, openings, host wall, revision, provenance, fire/acoustic fields and IFC GUIDs.

MATERIAL: current material batches support ID, name, category, quantity, unit, location, world position, dimensions, target component, supplier, verification state and checkpoint. General spatial material contracts also support lifecycle state, staging zone, task, carrier and movement history.

ACTOR: current agent state supports role, discipline, state, world position, body/tool/payload envelopes, safety clearance, carried material, unsafe-block state and current mission/task.

EQUIPMENT: current EquipmentEntity supports ID, name, equipment type, depot, world position, dimensions, operational state, assigned actor/task, target location, model and clearance radius.

FACILITY / SITE: current spatial entities support identity, type, world position, dimensions and operational state.

## 3. Normalize before rendering

Create an InspectableEntity adapter rather than teaching the UI every raw schema.

InspectableEntity fields:
- id
- kind: PROJECT / COMPONENT / MATERIAL / ACTOR / EQUIPMENT / FACILITY / SPACE / SITE / UNKNOWN
- name
- category
- discipline
- status
- spatial position/dimensions/rotation/storey/space/host
- normalized properties
- normalized relationships
- sourceRecord reference

## 4. Universal tabs

Potential tabs:
1. Overview
2. Properties
3. Materials
4. Construction
5. Spatial
6. Systems / Relationships
7. Quality
8. Commercial
9. Provenance
10. Evidence

Only show tabs supported by canonical data.

## 5. Overview

Show name, ID, kind/category, discipline/system, current status, known location, and a concise human-readable summary.
Do not expose raw JSON by default.

## 6. Properties

Components: dimensions, orientation, IFC type, storey, room/space, ratings, assembly/type information, property sets.
Actors: role, discipline, state, body/tool/payload envelope, safety clearance.
Equipment: model, type, operational state, clearance radius.
Materials: category, quantity, unit, dimensions, verification state.

## 7. Materials

For components use material, materials, materialSpecIds, assemblyLayers, assemblySpecId and fastenerSpecId when present.
For batches show quantity, supplier, current location, target component, lifecycle and verification state.
Do not invent manufacturer/product fields.

## 8. Construction

Component: installation phase, source/created task, creating actor, status, installation stage day, revision.
Actor: current task/mission, tools, carried material, current state.
Equipment: assigned task/actor, operational state, target location.
Material: assigned task, current/staging location, target component, movement history.

## 9. Spatial

Component: world position, dimensions, host, storey/space, connections.
Actor: position, body/tool/payload envelope, combined envelope where present, safety clearance, blocked unsafe state.
Equipment: current/target position, dimensions, clearance radius.
Material: world position, dimensions, staging/current location.

Spatial actions: Focus, Isolate, Hide, Show connected, Show work zone, Show route/path only if canonical route evidence exists.

## 10. Relationships

Normalize relationships such as HOSTED_BY, HOSTS, CONNECTED_TO, PART_OF_SYSTEM, LOCATED_IN, CREATED_BY_TASK, CREATED_BY_ACTOR, TARGETS_COMPONENT, ASSIGNED_TO_TASK, CARRIED_BY, SUPPLIED_BY.

Current source fields already support many through connectedComponentIds, openings, hostWallId, sourceTaskId, createdByTaskId, createdByAgentId, assignedTaskId, targetComponentId and supplierName.

Clicking a relationship should select/focus the related entity.

## 11. Quality

Show inspectionStatus / inspectionState, notes, matching inspection tickets, failures and rework state.
Preserve canonical distinctions: PASSED, FAILED/FAIL, WARNING, UNINSPECTED, INSUFFICIENT_INFORMATION, pending professional/AHJ review.
Never present HERMES validation as licensed professional approval.

## 12. Commercial

Only show canonical values.
Components may show quantity, unit, unit cost and total cost.
Project may show costScopeBreakdown and canonical BOM totals.
No placeholder dollar amounts.

## 13. Provenance

Show source task, creating actor, revision, source provenance, IFC IDs, truth/verification state, project/attempt and relevant creation/modification events.

The provenance tab must answer: Why does this object exist, and what evidence supports it?

## 14. Evidence

May include event records, inspection evidence, calculations, source records, revision/world hash, and later photo/sensor evidence.
Human summary first; technical expansion second.

## 15. Project-level inspector

Explicitly opened with no selected entity:
- Project
- Progress
- Materials
- Quality
- Prime
- Evidence
- Developer/Audit only in advanced mode

Prime/Autonomy must not be the default owner-facing inspector.

## 16. Entity-specific default

COMPONENT → Overview
MATERIAL → Materials
ACTOR → Construction
EQUIPMENT → Construction
FACILITY → Overview
SPACE → Overview
PROJECT → Project/Progress

## 17. Selection

On 3D click:
1. set selectedEntityId
2. resolve InspectableEntity
3. open inspector
4. highlight object
5. preserve camera unless the user explicitly chooses Focus

Do not automatically recenter on every selection.

## 18. Header actions

Focus
Isolate
Hide
Explain
Close

Future: Open Object View, Compare, Section, Explode Assembly.
Only enable supported actions.

## 19. Explain

Initial Explain can be deterministic from inspector data: what it is, why it is here, source task, material, relationships, inspection state and evidence.
LLM explanation is optional later.

## 20. Missing data

Never fill gaps with plausible construction knowledge.
Use Not recorded / Not yet modeled / Not available for this object / Professional review required as appropriate.

## 21. Progressive disclosure

Default: readable labels, concise values, critical state.
Advanced: canonical IDs, IFC IDs, raw property sets, event IDs, source paths and technical evidence.

## 22. First implementation slice — INSPECTOR-01

Normalize COMPONENT, MATERIAL, ACTOR and EQUIPMENT.
Implement inspector overlay with Overview, Properties, Construction, Spatial, Quality and Provenance.

Defer Commercial depth, evidence graph, Open Object View, exploded assemblies, LLM Explain and detached windows.

## 23. Acceptance

Selecting a component should answer what it is, where it is, dimensions, known material/spec data, construction task, actor/agent provenance, inspection state, connections/host and evidence.

Selecting a material batch should answer what it is, quantity, location, supplier, delivered/staged/installed state and target task/component.

Selecting an actor/equipment entity should show current task, position and physical envelope/clearance.