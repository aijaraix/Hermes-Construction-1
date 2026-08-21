# HERMES CONSTRUCTION — DATA PROVENANCE MATRIX

This document outlines the canonical source, provenance classification, validation status, and responsible engineering domain for all primary displayed fields across the HERMES Construction application.

---

## Provenance Matrix Table

| Page / Workspace | Displayed Field | Canonical Backend Source | Provenance Type | Validation Status | Responsible Domain |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Command Center** | Active Project | `PrimeOrchestrator.getActiveProject()` | `DATABASE_RECORD` | `VERIFIED` | Core System |
| **Command Center** | Reasoning Provider | `process.env.GEMINI_API_KEY` + `GoogleGenAI` | `EXTERNAL_VERIFIED` | `VERIFIED` | AI Architecture |
| **Command Center** | Heartbeat Count | `PrimeOrchestrator.getHeartbeatState()` | `RUNTIME_CALCULATED` | `CALCULATED` | Prime Orchestrator |
| **Project Overview** | Floor Count & Rooms | `DigitalTwinProject.components` | `RUNTIME_CALCULATED` | `CALCULATED` | Spatial / BIM |
| **Project Overview** | Wind Speed (160 MPH) | `DigitalTwinProject.environment` | `CONFIGURATION` | `VERIFIED` | Jurisdiction & Environment |
| **Digital Twin (3D)** | Component Geometry | `BIMComponent.geometry` | `DATABASE_RECORD` | `VALIDATED` | Spatial / BIM |
| **Digital Twin (3D)** | Inspection Status | `BIMComponent.inspectionState` | `AGENT_GENERATED_VALIDATED` | `VALIDATED` | Quality & Inspection |
| **Rooms & Spaces** | Room Components | Filtered by `BIMComponent.room` | `DATABASE_RECORD` | `VERIFIED` | Spatial / BIM |
| **Plans & Systems** | Connectivity Chains | `PlansSystemsView` Circuit Chains | `RUNTIME_CALCULATED` | `VALIDATED` | MEP Systems |
| **BOM & Quantities** | Modeled Material Value | `DigitalTwinProject.bom.totalCost` | `RUNTIME_CALCULATED` | `CALCULATED` | Quantity Engine |
| **BOM & Quantities** | Verified Cost ($) | `BOM.lineItems` with verified quotes | `EXTERNAL_VERIFIED` | `VERIFIED` | Procurement |
| **Procurement** | Supplier Quotes | `DigitalTwinProject.suppliers` | `EXTERNAL_VERIFIED` | `VERIFIED` | Procurement |
| **Schedule** | Stage Progress | `DigitalTwinProject.schedule` | `DATABASE_RECORD` | `VALIDATED` | Project Management |
| **Agent Organization**| Total Agent Roles (132)| `AgentRegistry.getAllContracts()` | `RUNTIME_CALCULATED` | `VERIFIED` | Agent Structure |
| **System Health** | Subsystem Diagnostics | `/api/system/health` | `RUNTIME_CALCULATED` | `VERIFIED` | System Operations |
| **Reality Data Truth**| Security Exposures | `RealitySwarmEngine.auditSecurityExposures()`| `RUNTIME_CALCULATED` | `VERIFIED` | Application Integrity |
