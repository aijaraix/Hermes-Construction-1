# HERMES CONSTRUCTION PHASE 3.17B — UI INFORMATION ARCHITECTURE AUDIT

## Overview
This document audits the reorganization of the HERMES Construction frontend user interface from an oversized, single-row horizontal tab bar into a structured, responsive application shell with distinct HERMES SYSTEM and PROJECT WORKSPACE conceptual domains.

---

## Page Mapping Audit

| Legacy View / Tab Name | Action | New Navigation Location | Conceptual Domain | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **3D Digital Twin** | **RENAME / REPOSITION** | `CURRENT PROJECT -> Digital Twin (3D)` | Project Workspace | Centralized 3D BIM experience with contextual inspector drawer. |
| **Agent Organization** | **MOVE** | `HERMES INTELLIGENCE -> Agent Organization` | System Domain | Displays full 132-role hierarchy with real competency matrix. |
| **Knowledge & Learning** | **MERGE / MOVE** | `HERMES INTELLIGENCE -> Knowledge Center / Gym` | System Domain | Consolidated code sources, chunks, assertions, and curricula. |
| **Room 204 Coordination** | **REBUILD / GENERALIZE**| `CURRENT PROJECT -> Rooms & Spaces` | Project Workspace | Generalised from hard-coded Room 204 to any floor / space in active project. |
| **Core Readiness Gate** | **MOVE** | `HERMES INTELLIGENCE -> Core Readiness Gate` | System Domain | Core House #1 trade agent certification verification. |
| **HERMES Prime** | **RENAME / MOVE** | `HERMES INTELLIGENCE -> HERMES Prime` | System Domain | Executive decision queue and heartbeat orchestrator view. |
| **Reality Audit Log** | **MERGE** | `SYSTEM & DATA TRUTH -> System Audit Trail` | System Domain | Immutable event log covering all system activities. |
| **BOM & Quantities** | **REPOSITION** | `CURRENT PROJECT -> BOM & Quantities` | Project Workspace | Project-bound BOM with cost confidence breakdown. |
| **Inspectors & Repairs** | **REPOSITION** | `CURRENT PROJECT -> Inspections & Quality` | Project Workspace | Project-specific inspection tickets and repair actions. |
| **Local Supply Chain** | **REPOSITION** | `CURRENT PROJECT -> Procurement & Prices` | Project Workspace | Geospatial Florida suppliers with price truth badges. |
| **4D Schedule** | **REPOSITION** | `CURRENT PROJECT -> 4D Schedule` | Project Workspace | Dependency-aware construction stage timeline. |
| **Change-Order Risks** | **REPOSITION** | `CURRENT PROJECT -> Change-Order Risks` | Project Workspace | Risk exposure analysis and mitigation strategies. |
| **Autonomous Gym** | **MOVE** | `HERMES INTELLIGENCE -> Autonomous Gym` | System Domain | Multi-level benchmark project launcher. |
| **Customizer & Revisions** | **REPOSITION** | `CURRENT PROJECT -> Customizer & Revisions` | Project Workspace | Natural language BIM revision proposal engine. |
| **N/A (New)** | **NEW** | `HERMES COMMAND -> Command Center` | Primary Landing | Real-time system HUD, active project summary, and live activity stream. |
| **N/A (New)** | **NEW** | `CURRENT PROJECT -> Overview` | Project Workspace | High-level project identity, location, building stats, and stage. |
| **N/A (New)** | **NEW** | `CURRENT PROJECT -> Plans & Systems` | Project Workspace | End-to-end system connectivity chains (Electrical, HVAC, DWV). |
| **N/A (New)** | **NEW** | `SYSTEM & DATA TRUTH -> Reality & Data Truth` | System Domain | Swarm audit dashboard, auto-repair logs, domain conflicts, and security check. |
| **N/A (New)** | **NEW** | `SYSTEM & DATA TRUTH -> System Health` | System Domain | Detailed diagnostic health of all 10 platform subsystems. |

---

## Navigation Architecture Principles Enforced
1. **Responsive App Shell**: Left sidebar on desktop (collapsible), top contextual header with project context switcher, slide-over drawer on mobile viewports.
2. **Context Isolation**: Switching `projectId` in top bar updates all `CURRENT PROJECT` views dynamically without leaking cross-project data.
3. **No Decorative Placeholders**: All displayed metrics, counts, and statuses are derived from canonical persistence state.
