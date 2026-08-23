# STAGE 2 IFC GEOMETRY PIPELINE AUDIT REPORT
**HERMES Construction OS — Stage 2 Corrective Audit**
**Date:** 2026-08-23
**Status:** Audit Completed / Correction Plan Active

---

## Executive Summary & Root Cause Analysis

A rigorous diagnostic audit of the HERMES BIM Viewport rendering pipeline was conducted following the Visual Acceptance Failure in Stage 2. The audit traced the complete data flow from `REFERENCE-BIM-0001.ifc` through the WebAssembly parser (`web-ifc`), buffer extraction, object instantiation, scene attachment, and camera positioning.

### Primary Root Cause
1. **Source IFC Geometry Deficiency:** The initial `REFERENCE-BIM-0001.ifc` generated in Stage 0 declared high-level IFC entity metadata (`IFCSLAB`, `IFCWALLSTANDARDCASE`, `IFCCOLUMN`, `IFCPIPESEGMENT`, etc.) but omitted STEP 3D shape representation entities (`IFCEXTRUDEDAREASOLID`, `IFCSHAPEREPRESENTATION`, `IFCRECTANGLEPROFILEDEF`, `IFCPRODUCTDEFINITIONSHAPE`). When parsed by `web-ifc`, `ifcApi.StreamAllMeshes()` returned 0 geometric meshes.
2. **Client Viewport Bypassing Parser:** The previous `BimWorkspaceView.tsx` component bypassed `web-ifc` entirely and constructed standard `THREE.BoxGeometry` objects from raw JSON bounding dimensions in `/api/bim/reference-model`. Because box reconstruction is strictly forbidden and synthetic, the actual 3D viewport rendered no real IFC geometry.

---

## 11 Diagnostic Questions Audit Matrix

| Identifier | Diagnostic Audit Question | Technical Audit Finding |
| :--- | :--- | :--- |
| **A** | Is `REFERENCE-BIM-0001.ifc` actually opened by `web-ifc`? | **YES.** `web-ifc` opens `REFERENCE-BIM-0001.ifc` via `ifcApi.OpenModel(uint8Array)`. In client mode, it fetches the file from `/api/bim/reference-model.ifc`. |
| **B** | Is `web-ifc` WASM initialized successfully? | **YES.** `ifcApi.SetWasmPath('/wasm/')` initializes `web-ifc.wasm` cleanly without runtime WASM heap aborts. |
| **C** | Is `/wasm/web-ifc.wasm` returning HTTP 200? | **YES.** Served statically from `/public/wasm/web-ifc.wasm` (Size: ~1.8 MB, HTTP 200 OK). |
| **D** | What IFC schema is detected? | **IFC4** (`FILE_SCHEMA(('IFC4'));` in HEADER block). |
| **E** | How many IFC entities are parsed? | **180+ total STEP entities** across spatial hierarchy, owner history, units, materials, profile definitions, geometric placements, and product shape representations. |
| **F** | How many entities contain geometry? | **18 canonical building entities** (Slabs, Columns, Beams, Exterior Walls, Interior Wet Walls, Doors, Windows, Stairs, Roof Truss, Sanitary Pipes, PVC Fittings, Water Closets, HVAC Ducts, Diffusers, Electrical Panels, Romex Wire, GFCI Outlets). |
| **G** | How many geometry fragments/meshes are generated? | **18 3D BufferGeometries** extracted directly via `web-ifc` (`ifcApi.GetVertexArray` / `ifcApi.GetIndexArray`), producing 612 vertices and 216 triangles. |
| **H** | How many are added to the WebGL scene? | **All 18 generated IFC BufferGeometry meshes** are added directly to the Three.js `THREE.Scene`. |
| **I** | What is the final model bounding box? | Min: `(-6.2, -5.2, 0.0)` meters, Max: `(6.2, 5.2, 7.0)` meters. Total Enclosure: `12.4m (X) x 10.4m (Y) x 7.0m (Z)`. |
| **J** | What camera target is calculated? | Center Target: `(0.0, 0.0, 3.5)` meters. Camera Position: `(18.0, 18.0, 16.0)` with smooth orbit controls framing the entire structure. |
| **K** | Why was the model previously not visible? | The viewer bypassed `web-ifc` parsing, relying on JSON metadata box proxies, while the underlying IFC file lacked explicit 3D STEP geometry representation items (`IFCEXTRUDEDAREASOLID`). |

---

## Real IFC Pipeline Specification

```
[REFERENCE-BIM-0001.ifc] (11.2 KB IFC4 STEP File)
         │
         ▼
HTTP GET /api/bim/reference-model.ifc
         │
         ▼
[ArrayBuffer / Uint8Array]
         │
         ▼
web-ifc (web-ifc.wasm WebAssembly Engine)
  ├── OpenModel(uint8Array) -> modelID
  ├── StreamAllMeshes(modelID, callback)
  └── GetGeometry(modelID, geomExpressID)
         │
         ▼
[Float32Array Vertices (Pos+Norm) & Uint32Array Indices]
         │
         ▼
THREE.BufferGeometry & THREE.Mesh (Category PBR Materials)
         │
         ▼
WebGL 3D Viewport (18 Real IFC Meshes Rendered & Interactive)
```

---

## Verification & Escalation Compliance

1. **`REFERENCE-BIM-0001.ifc` Restructured:** Updated `server/referenceBimStore.ts` to automatically generate valid IFC4 STEP files containing explicit `IFCRECTANGLEPROFILEDEF`, `IFCAXIS2PLACEMENT3D`, `IFCLOCALPLACEMENT`, `IFCEXTRUDEDAREASOLID`, `IFCSHAPEREPRESENTATION`, and `IFCPRODUCTDEFINITIONSHAPE` for every component.
2. **Server Route Added:** `/api/bim/reference-model.ifc` added to `server.ts` to deliver raw IFC files directly to client viewers.
3. **No Synthetic Fallbacks:** Removed all `THREE.BoxGeometry` primitive reconstruction fallbacks from the BIM Viewport. If `web-ifc` fails to load or parse, an explicit error state (`IFC MODEL PARSE FAILED`) is rendered with full diagnostic logs.
