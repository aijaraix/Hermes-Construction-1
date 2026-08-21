# HERMES CONSTRUCTION — PROJECT WORKSPACE ARCHITECTURE

## Overview
This document specifies the data model separation and hierarchy between **SYSTEM DATA** and **PROJECT DATA** in the HERMES Construction OS.

---

## 1. System vs Project Data Hierarchy

```
[ HERMES SYSTEM ]
  ├── Agent Registry (132 Contracts)
  ├── Knowledge Center (FBC 2023, ACI 318, ASCE 7, DOE Guides)
  ├── Reasoning Provider (Google Gemini 3.7 Flash)
  ├── System Health & Subsystem Diagnostics
  ├── Reality & Data Truth Swarm
  └── Global Audit Trail

      │
      ▼ (Scoped by projectId)

[ PROJECT WORKSPACE: RESIDENCE-TAMPA-001 ]
  ├── Site / Environment Profile (Tampa Bay, 160 MPH Wind, Zone 2A)
  ├── Building Spatial Model
  │     ├── Site
  │     ├── Building
  │     ├── Floor (Floor 1, Floor 2)
  │     ├── Zone / Room (Living Room 101, Mechanical Room 204, etc.)
  │     ├── System (Structure, MEP, Envelope, Finish)
  │     └── Component (SLAB-1-001, WALL-1-EXT-01, DIFFUSER-204-1, etc.)
  ├── Digital Twin 3D BIM Model
  ├── Rooms & Spaces Hierarchy
  ├── System Connectivity Chains
  ├── Inspection Tickets & Quality Audits
  ├── Bill of Materials (BOM) & Quantities
  ├── Procurement & Local Supply Chain
  ├── 4D Construction Schedule
  ├── Change-Order Risk Registry
  ├── Customizer & Revisions
  └── Project Activity Feed
```

---

## 2. Project Isolation Guarantees
1. **Dynamic Resolution**: All project-specific endpoints (`/api/projects/:id`, `/api/records/decisions?projectId=...`) enforce scoping by `projectId`.
2. **Context Switching**: Changing the selected project in the top header instantly updates Digital Twin, Rooms, BOM, Inspections, Schedule, Sourcing, Risks, and Activity Feed.
3. **No Data Leakage**: Components and rooms are strictly filtered by `projectId` and `roomId`. Room 204 exists solely as a room within a specific project context, not as a global application tab.
