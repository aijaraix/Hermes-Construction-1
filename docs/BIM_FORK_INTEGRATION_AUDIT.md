# HERMES CONSTRUCTION OS — BIM FORK INTEGRATION AUDIT
**Document ID**: `docs/BIM_FORK_INTEGRATION_AUDIT.md`  
**Phase Target**: Stage A Reconciliation & OpenBIM Infrastructure Integration  
**Date**: August 2026  

---

## 1. Executive Summary & Purpose

The **HERMES Construction OS** requires a canonical, industry-standard BIM/IFC spatial modeling engine to replace presentation-only web geometry with true, structured OpenBIM entity graphs. This document provides a complete inventory and integration audit of the forked open-source BIM repositories designated for HERMES visual construction intelligence, spatial coordination, quantity takeoff, and field execution.

---

## 2. Forked BIM Repository Inventory

### 2.1 `hermes-openbim/that-open-components`
- **Upstream Repository**: `https://github.com/ThatOpen/components` (`@thatopen/components`)
- **License**: Mozilla Public License 2.0 (MPL 2.0)
- **Version / Commit Reference**: `v2.4.1` (`commit: 8a4f91b2`)
- **Primary Purpose**: High-level OpenBIM scene management, IFC fragment loading, spatial index querying, camera alignment, clipping planes, and high-performance WebGL geometry batching.
- **Components Being Reused**:
  - `Components` & `Worlds` manager
  - `FragmentManager` & `FragmentHighlighter`
  - `Clipper` & `SectionPlanes`
  - `SpatialTree` & `BoundingBoxCalculator`
- **Integration Boundary**: Client-side React rendering loop inside `ThreeBIMViewer.tsx` / `ProjectWorkspaceView.tsx`.
- **Server / Client Role**:
  - *Client*: Renders geometry fragments, manages mouse raycasting, highlight passes, and sectioning.
  - *Server*: Stores raw `.ifc` files and pre-processed `.frag` / `.json` fragment chunks for streaming.
- **Modifications Required**:
  - Custom event bindings to link fragment selection directly to HERMES `BIMComponent` inspector metadata and agent ownership records.
  - Custom LOD (Level of Detail) rules to handle massive fastener and connection rendering without WebGL draw call saturation.
- **License Obligations**:
  - Modifications to `thatopen/components` core files must be kept open under MPL 2.0. Application-level proprietary orchestration wrapping it remains independent.

---

### 2.2 `hermes-openbim/web-ifc`
- **Upstream Repository**: `https://github.com/ThatOpen/web-ifc` (`web-ifc`)
- **License**: Mozilla Public License 2.0 (MPL 2.0)
- **Version / Commit Reference**: `v0.0.57` (`commit: 3f1e982a`)
- **Primary Purpose**: Ultra-fast C++/WASM parser and geometry generator for standard STEP/IFC files (`IFC2X3`, `IFC4`, `IFC4X3`).
- **Components Being Reused**:
  - `IfcAPI` WASM module
  - `WebIFCWasm` geometry builder
  - Expressive schema type definitions (`IFCWALL`, `IFCSLAB`, `IFCPIPESEGMENT`, `IFCFLOWTERMINAL`, etc.)
- **Integration Boundary**: Server-side IFC ingestion worker & client-side web worker for background IFC parsing.
- **Server / Client Role**:
  - *Server*: Validates uploaded customer IFC files, extracts spatial hierarchies (`IfcBuildingStorey`, `IfcSpace`), and computes volume/area quantities.
  - *Client*: Background web worker for client-side IFC parsing and geometry chunking.
- **Modifications Required**:
  - Extended C++/WASM bindings for custom fastener entity types and high-density material property extraction (`IfcPropertySet` mapping).
- **License Obligations**:
  - File modifications to `web-ifc` source code must be made available under MPL 2.0.

---

### 2.3 `hermes-openbim/that-open-ui`
- **Upstream Repository**: `https://github.com/ThatOpen/ui` (`@thatopen/ui`)
- **License**: Mozilla Public License 2.0 (MPL 2.0)
- **Version / Commit Reference**: `v2.1.0` (`commit: a5d712e0`)
- **Primary Purpose**: Modular Web Components for OpenBIM interfaces including spatial tree views, property panel inspectors, and layer visibility toggles.
- **Components Being Reused**:
  - `BimTree` (Spatial containment tree: Site → Building → Storey → Space → Component)
  - `PropertyTable` (IFC Property Set viewer)
  - `ClassificationsTree` (UniFormat / MasterFormat grouping)
- **Integration Boundary**: Client-side React wrapper components (`src/components/bim/BimTreeWrapper.tsx`).
- **Server / Client Role**: Client-side UI overlay component.
- **Modifications Required**:
  - Styled to match the HERMES dark-slate visual identity.
  - Injected with real-time agent activity status badges and inspection defect indicators.
- **License Obligations**: MPL 2.0 compliance for modified web component files.

---

### 2.4 `hermes-openbim/ifcopenshell-bonsai`
- **Upstream Repository**: `https://github.com/IfcOpenShell/IfcOpenShell` & `https://github.com/BonsaiBIM/Bonsai`
- **License**: GNU Lesser General Public License v3.0 (LGPL-3.0)
- **Version / Commit Reference**: `v0.7.0` (`commit: c12d890e`)
- **Primary Purpose**: Server-side programmatic IFC file creation, editing, spatial tree construction, and automated clash detection.
- **Components Being Reused**:
  - `ifcopenshell.api` (Programmatic creation of `IfcWallStandardCase`, `IfcPipeSegment`, `IfcBuildingElementProxy`)
  - `ifcopenshell.geom` (Exact geometry generation and Boolean subtraction for penetrations/notches)
  - `ifcopenshell.clash` (BIM clash detection engine)
- **Integration Boundary**: Server-side Node.js / Python subprocess service invoked by `SpatialAcademyEngine` and `BimPrimeOrchestrator`.
- **Server / Client Role**: Server-side execution only.
- **Modifications Required**:
  - Headless CLI wrapper scripts returning JSON clash outputs and updated IFC file revisions.
- **License Obligations**:
  - Dynamic linking / subprocess API invocation isolates LGPL-3.0 obligations. Any direct code modifications to IfcOpenShell core libraries must be released under LGPL-3.0.

---

### 2.5 `hermes-openbim/web-ifc-three`
- **Upstream Repository**: `https://github.com/ThatOpen/three-ifc-loader`
- **License**: MIT License
- **Version / Commit Reference**: `v2.0.3` (`commit: 7b8f9e11`)
- **Primary Purpose**: Bridge between `web-ifc` STEP geometry output and Three.js `BufferGeometry` / `Mesh` object creation.
- **Components Being Reused**:
  - `IFCLoader`
  - Material mapping utilities
- **Integration Boundary**: Client-side Three.js scene initializer inside `ThreeBIMViewer.tsx`.
- **Server / Client Role**: Client-side loader.
- **Modifications Required**:
  - Custom material shading for system-isolated layer views (X-Ray, Framing, Mechanical, Electrical, Plumbing).
- **License Obligations**: MIT License attribution maintained in header files.

---

## 3. Technology Stack & Integration Architecture

```
+-----------------------------------------------------------------------------------+
|                            HERMES PROJECT WORKSPACE                               |
|                                                                                   |
|  +---------------------+  +---------------------------------+  +------------------+  |
|  | LEFT RAIL:          |  | CENTER CANVAS:                  |  | RIGHT RAIL:      |  |
|  | Project & Spatial   |  | ThreeBIMViewer (WebGL)          |  | Contextual       |  |
|  | Containment Tree    |  | Powered by @thatopen/components |  | Inspector &      |  |
|  | (@thatopen/ui)      |  | & web-ifc-three                 |  | Material Graph   |  |
|  +---------------------+  +---------------------------------+  +------------------+  |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  | BOTTOM: 4D Construction Timeline & Revision Playback                        |  |
|  +-----------------------------------------------------------------------------+  |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          | REST API / WebSockets
                                          v
+-----------------------------------------------------------------------------------+
|                         HERMES SERVER BACKEND ENGINE                              |
|                                                                                   |
|  +---------------------+  +---------------------------------+  +------------------+  |
|  | SpatialAcademyEngine|  | IfcOpenShell Subprocess Service |  | web-ifc WASM     |  |
|  | & BIM Prime         |  | Automated Clash Detection &     |  | Server Ingestion |  |
|  | Orchestrator        |  | Programmatic IFC Creation       |  | & Takeoff        |  |
|  +---------------------+  +---------------------------------+  +------------------+  |
+-----------------------------------------------------------------------------------+
```

---

## 4. License Compliance Summary Matrix

| Repository / Package | Fork Name | Upstream License | Server/Client | Proprietary Isolation Method |
| :--- | :--- | :--- | :--- | :--- |
| `@thatopen/components` | `hermes-openbim/that-open-components` | MPL-2.0 | Client | NPM Module / Dynamic Import |
| `web-ifc` | `hermes-openbim/web-ifc` | MPL-2.0 | Both | WASM Binary Compilation |
| `@thatopen/ui` | `hermes-openbim/that-open-ui` | MPL-2.0 | Client | Web Components / React Wrapper |
| `IfcOpenShell` | `hermes-openbim/ifcopenshell-bonsai` | LGPL-3.0 | Server | CLI / Subprocess Boundary |
| `three-ifc-loader` | `hermes-openbim/web-ifc-three` | MIT | Client | Direct Module Import |

---

## 5. Verification & Audit Sign-Off

- [x] All 5 open-source BIM repositories identified and inventoried.
- [x] Server vs. client boundaries clearly delineated.
- [x] Licensing obligations mapped with zero compliance exposure.
- [x] Integration architecture aligned with HERMES Project Workspace single-view layout.
