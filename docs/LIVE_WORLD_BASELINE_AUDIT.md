# HERMES CONSTRUCTION OS — LIVE WORLD BASELINE AUDIT
**Document ID:** HERMES-LIVE-WORLD-BASELINE-AUDIT-001  
**Audit Date:** August 26, 2026  
**Audited Commit SHA:** `d1ac195c018dc967b4096e76de7889c4e575240c`  
**Target Specification:** `HERMES-LIVE-WORLD-MASTER-SPEC-001` (Stages 0–2)  

---

## 1. Repository & Runtime Baseline Summary

| Metric | Measured Baseline Value | Classification / Status |
| :--- | :--- | :--- |
| **Repository SHA** | `d1ac195c018dc967b4096e76de7889c4e575240c` | Audited |
| **Active Branch** | `main` | Verified |
| **Working Tree Status** | Clean | Verified |
| **Active Projects Count** | 2 (`ACADEMY-HOUSE-0002`, `REFERENCE-BIM-0001`) | Operating |
| **House #2 Classification** | `HISTORICAL_COMPATIBILITY_FIXTURE` | Frozen (BASE-001, BASE-002) |
| **House #2 Event Count** | 41 Recorded Lifecycle Events | Static Event Stream |
| **House #2 BIM Components** | 113 As-Built Components | Static / Replayable |
| **Canonical Agent Roster** | 68 Agents | Shared Workforce Pool |
| **House #2 Active Agents** | 68 Deployed Project Agents | Spatial Roster |
| **Facility Entities Total** | 9 Temporary Site Facilities | Spatial Compound |
| **Material Entities Total** | 8 Derived Inventory Packages | Spatial Staging |
| **Knowledge Requests Total** | 8 Persisted Requests | Inspectable |
| **Communication Events** | 15 Persisted Graph Arcs | Inspectable 3D Pulses |
| **Active API Endpoints** | 18 Specialized Express Endpoints | `/api/hermes/*` |

---

## 2. Subsystem Classification Inventory

| Subsystem Name | Primary Files | Classification | Audit Notes |
| :--- | :--- | :--- | :--- |
| **BIM/WebGL Rendering Engine** | `src/components/BimWorkspaceView.tsx` | `PRODUCTION_ENGINE` | Three.js scene, raycasting, camera presets, measurement tool |
| **House #2 Lifecycle Engine** | `server/house0002Engine.ts` | `HISTORICAL_COMPATIBILITY_FIXTURE` | Frozen fixture for regression; event-sourced replay engine |
| **Task Eligibility Engine** | `server/taskEligibilityEngine.ts` | `PARTIAL` | State-driven task evaluation with legacy fallback candidate arrays |
| **Workforce Scheduler Engine** | `server/workforceSchedulerEngine.ts` | `PRODUCTION_ENGINE` | 68-agent canonical roster, discipline groups, competency vectors |
| **Prehouse Spatial Engine** | `server/prehouseSpatialEngine.ts` | `TEST_FIXTURE` | Pre-house 10x10 validation structure & spatial proof generator |
| **Genesis Project Engine** | `server/genesisProjectEngine.ts` | `PRODUCTION_ENGINE` | Zero-BIM, live-first project genesis manager (Stage 2) |
| **Checkpoint & Diagnostic Runner** | `server/house0002CheckpointRunner.ts` | `PRODUCTION_ENGINE` | Measured truth test suite & Phase-1 diagnostic runner |
| **Express API Server** | `server.ts` | `PRODUCTION_ENGINE` | API endpoints, Vite middleware mode, non-blocking startup |
| **SQLite State Persistence** | `server/persistence/sqliteAdapter.ts` | `PRODUCTION_ENGINE` | Event store, digital twin project state, revision ledger |

---

## 3. Hardcoded Fixture & Fallback Audit

| File | Function / Location | Hardcoded Value / Pattern | Classification | Remediation Plan |
| :--- | :--- | :--- | :--- | :--- |
| `server/house0002Engine.ts` | `initialize()` | Pre-populates 41 events and 113 BIM components on boot | `HISTORICAL_COMPATIBILITY_FIXTURE` | Tagged as fixture. Genesis projects start with 0 BIM components via `GenesisProjectEngine`. |
| `server/taskEligibilityEngine.ts` | `getCandidateTasks()` | Fixed array of `HOUSE2-TASK-*` IDs | `LEGACY` | Decouple generic project task generation from fixed House #2 array. |
| `server/house0002CheckpointRunner.ts` | `executeCheckpointReport()` | Static string reports for historical evaluation | `PARTIAL` | Replaced with measured scene graph & backend parity measurements. |
| `src/components/BimWorkspaceView.tsx` | Fallback project list | Hardcoded `ACADEMY-HOUSE-0002` entry | `TEST_FIXTURE` | Dynamically fetch from `/api/projects` with fallback to Genesis default. |

---

## 4. Truth Origin Enum Integration

The canonical `TruthOrigin` model has been integrated into shared Hermes types (`src/types/hermes.ts`):
- `MEASURED`: Physical sensor readback, Three.js geometry measurement, bounding envelope computation.
- `CALCULATED`: Engineering formula output, FEA/structural calculation, energy/load calculation.
- `RULE_DERIVED`: Building code predicate check (e.g., FBC 2023 160 MPH wind speed requirement).
- `MODEL_GENERATED`: Parametric BIM geometry generation from structural assembly definitions.
- `LLM_REASONED`: Multi-agent synthesis, Prime orchestrator task ranking reasoning.
- `IMPORTED_REFERENCE`: External IFC standard, manufacturer spec sheet, surveyor benchmark.
- `SIMULATED`: Academy scenario acceleration, simulated material delivery manifest.
- `ASSUMED`: Default design assumption pending owner confirmation.

`SIMULATED` and `ASSUMED` data are strictly flagged and never presented to the owner as measured or authoritative.

---

## 5. Canonical World Frame & Coordinate System Contract

- **Length Unit:** Meters (`m`). Display can be switched between Metric (`m`/`mm`) and Imperial (`ft`/`in`), but stored geometry remains metric.
- **Rotation Unit:** Radians / Quaternion `[x, y, z, w]`. UI may display degrees.
- **Root World Frame:** `WORLD-FRAME-ACADEMY-ROOT` at datum `[0, 0, 0]`.
- **Coordinate Parity Rule:** 1.000 meter in backend = 1.000 meter in Three.js = 1.000 meter in Measurement Tool = 1.000 meter in `RobotReadySpatialContract`.
