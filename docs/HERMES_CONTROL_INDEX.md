# HERMES CONTROL INDEX

**Purpose:** Minimize rediscovery, contradictory instructions, and unnecessary agent/model spend.

**Canonical repository:** `aijaraix/Hermes-Construction-1`  
**Canonical branch:** `main`  
**Reference implementation checkpoint when this control layer was drafted:** `5e6b174a9b30669595f1496e7160799240132d3c`

> The SHA above is a reference checkpoint only. Every worker must fetch current remote `main` before mutation and preserve legitimate newer work.

## Read-first order for implementation workers

For most implementation assignments, read only these control documents first:

1. `docs/HERMES_CONTROL_INDEX.md`
2. `docs/HERMES_CURRENT_STATE.md`
3. `docs/HERMES_EXECUTION_ROADMAP.md`
4. `docs/HERMES_CODEX_WORK_RULES.md`
5. The single task-specific handoff named in the assignment.

Do **not** crawl the entire `docs/` directory unless the task actually requires it.

Historical phase plans, audits, validation fixtures, and prior handoffs remain evidence/reference material; they are not automatically controlling instructions.

## Human-experience implementation authority

For the immersive human-facing HERMES application, the authoritative execution sequence is:

`docs/HERMES_HUMAN_EXPERIENCE_CONSOLIDATED_IMPLEMENTATION_MASTER.md`

That master consolidates the earlier standalone UI/NAV/Overview/Attention/Timeline/Materials/Inspector planning into three implementation passes:

1. `HERMES-HX-01` — immersive foundation, navigation, executive overview
2. `HERMES-HX-02` — inspector, attention, timeline / What Changed
3. `HERMES-HX-03` — materials, schedule, logistics workspaces

The older standalone implementation tickets remain detailed domain references but must not be executed independently unless the consolidated master is explicitly revised.

## Product definition

HERMES is a **living construction academy and embodied construction operating system**.

Its primary product is a truthful construction world in which:

- site, terrain, temporary works, permanent works, materials, tools, equipment, people, and future robots occupy physical space;
- construction is represented as real process, not only final geometry;
- meaningful visual state is backed by canonical state/events;
- geometry, sequencing, logistics, materials, inspections, cost, schedule, and provenance are linked;
- the digital world is designed to become a future execution language for real site computers, sensors, autonomous equipment, and robots.

The target is **professional CAD/BIM/construction visualization**, not a photorealistic entertainment world.

## Canonical architecture rule

`COMMAND → EVENT → STATE → WORLD → OBSERVATION → VALIDATION → NEXT ACTION`

The renderer is a view of canonical truth. It must not invent independent construction truth.

## Immediate program priorities

1. Physically verify Academy House 001 in a faithful browser-accessible long-lived runtime.
2. Fix only visual/modeling defects proven by that acceptance pass.
3. Establish reusable construction modeling primitives.
4. Deepen spatial/constructability intelligence.
5. Harden the persistent runtime and introduce local-first model routing.
6. Expand Academy process fidelity.
7. Build hardware-neutral robotics interfaces.
8. Scale from house to larger building types after the primitives generalize.

## Non-goals for the current stage

Do not prioritize:

- photorealistic scenery;
- consumer/customer website polish;
- a separate game demo;
- a separate robotics rewrite;
- a one-off hard-coded house renderer;
- broad infrastructure migration before visual/product proof;
- giant LLM dependence for deterministic geometry, physics, quantities, scheduling, or code-rule checks.

## Source-of-truth hierarchy

When instructions conflict, use this order:

1. Current owner instruction for the active task.
2. Current remote source state.
3. These HERMES control documents.
4. Active task-specific handoff.
5. Current architecture/truth documents.
6. Historical audits and phase plans.
7. Old fixture-specific documentation.

Never treat a historical “PASSED” claim as physical proof if the current implementation does not support it.

## Existing reference documents

Use only when relevant:

- `docs/HERMES_ACADEMY_HOUSE_001_VISUAL_RUNTIME_VERTICAL_SLICE.md`
- `docs/LIVE_WORLD_ARCHITECTURE.md`
- `docs/HERMES_VISUAL_CONSTRUCTION_MASTER_RECONCILIATION.md`
- `docs/SYSTEM_REALITY_AUDIT.md`
- `docs/AGENT_CONTRACTS.md`
- `docs/AGENT_ORGANIZATION.md`
- `docs/CONSTRUCTION_CORPUS.md`
- `docs/DATA_PROVENANCE_MATRIX.md`
- validation documents under `docs/validation/`

## Truth labels

Use only:

- **PHYSICALLY VERIFIED**
- **IMPLEMENTED — NOT PHYSICALLY VERIFIED**
- **PARTIAL**
- **SIMULATED**
- **BLOCKED**
- **NOT IMPLEMENTED**

No evidence = **UNVERIFIED**, never automatically PASSED.
