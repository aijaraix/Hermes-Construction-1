# HERMES CONSTRUCTION — AGENT ORGANIZATION ARCHITECTURE

## Executive Summary
HERMES Construction operates as a multi-tier, hierarchical autonomous construction intelligence system. Instead of relying on a single monolithic LLM prompt to manage complex building projects, HERMES structures work like an enterprise construction firm, dividing responsibilities between Prime Leadership, Project Executives, Superintendents, Discipline Managers, Spatial (Floor/Room) Managers, Trade Specialists, and Independent Inspection Swarms.

---

## Organizational Chart

```
                        HERMES CONSTRUCTION PRIME
                                    │
                            PROJECT EXECUTIVE
                                    │
                       PROJECT SUPERINTENDENT (01)
                                    │
    ┌───────────────────────────────┼──────────────────────────────┐
    │                               │                              │
DISCIPLINE MANAGERS          SPATIAL MANAGERS               PROJECT CONTROLS
(Site, Structural, MEP,      (Floor & Room Managers)        (Cost, Schedule, Procurement)
Envelope, Quality, Closeout)        │                              │
    │                               ▼                              ▼
    │                     ROOM CONSTRUCTION MANAGERS       SPECIALIST TRADE AGENTS
    │                     (e.g. ROOM-MANAGER-204)          (125+ Logical Specialist Roles)
    │                               │                              │
    └───────────────────────────────┴──────────────────────────────┘
                                    │
                                    ▼
                       INDEPENDENT INSPECTION SWARM
                                    │
                        REPAIR & CORRECTION SWARM
```

---

## Tier Responsibilities

### 1. Prime Leadership (`HERMES-CONSTRUCTION-PRIME`)
- **Focus**: Global mission governance, gym curriculum readiness, overall project risk, quality threshold validation, and resource allocation.
- **Intervention Model**: Receives summarized reports from Project Executives. Intervenes only when unresolved cross-discipline conflicts or critical inspection failures persist.

### 2. Project Executive (`PROJECT-EXECUTIVE-01`)
- **Focus**: Strategic project alignment, delivery scope, construction method selection, budget targets, schedule milestones, and regional location compliance.

### 3. Project Superintendent (`PROJECT-SUPERINTENDENT-01`)
- **Focus**: Field constructability, means and methods, master trade sequencing, site access, crane/lift logistics, staging, and trade conflict resolution.
- **Governing Directive**: *"Can this building actually be constructed in this exact sequence safely and efficiently?"*

### 4. Discipline Managers
- **16 Core Managers**: Site/Civil, Environmental, Architectural Construction, Structural, Building Envelope, Plumbing, Electrical, HVAC/Mechanical, Fire/Life Safety, Low Voltage/Controls, Materials, Means & Methods, Quantity/Estimating, Procurement/Logistics, Quality/Inspection, Commissioning/Closeout.

### 5. Spatial Managers (Floor & Room Managers)
- **Floor Managers** (`FLOOR-MANAGER-L01`, `L02`): Coordinate corridors, shafts, stairs, floor penetrations, MEP risers, and structural boundaries.
- **Room Construction Managers** (`ROOM-MANAGER-204`): Coordinate room-level trade placements (switches, diffusers, pipes, fixtures) for usability, serviceability, and clash prevention.

### 6. Specialist Trade & Material Agents (125+ Roles)
- Bounded specialists executing specific calculations, code checks, or trade layout proposals (e.g., `HVAC-DUCT-ROUTING-AGENT`, `FASTENER-UPLIFT-AGENT`, `CONCRETE-MATERIALS-SPECIALIST`).

### 7. Independent Inspection Swarm
- Completely detached inspectors who re-derive calculations and audit BIM components against FBC 2023, NEC 2023, and ASCE 7-22 independently.
