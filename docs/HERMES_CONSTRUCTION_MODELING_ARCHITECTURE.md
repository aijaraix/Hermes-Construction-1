# HERMES CONSTRUCTION MODELING ARCHITECTURE

**Status:** Planning specification  
**Purpose:** Define the reusable construction-modeling layer that turns Academy House 001 from a one-off vertical slice into a general construction world.

## 1. Objective

HERMES must be able to create, modify, inspect, sequence, and later physically execute construction from reusable parametric building primitives.

The target is not photorealistic scene generation.

The target is:

> **truthful construction geometry + assemblies + materials + topology + process + provenance**

A visual house, hotel, warehouse, or other building must be a view of the same canonical construction model used by HERMES agents for planning and spatial reasoning.

## 2. Current implementation reality

Current source already contains useful foundations:

- `BIMComponent` with type/system/materials/geometry/provenance fields;
- `BimCommandEngine` commands for walls, slabs, doors, windows, pipe, electrical, duct, openings, penetrations, movement, resize, material/assembly assignment;
- IFC/OpenBIM identifiers and spatial-container concepts;
- program volumes;
- live building components;
- Three.js rendering;
- material knowledge;
- provenance fields;
- revision concepts.

Current limitations include:

- many live-house components are still generated as coarse rectangular envelopes;
- several assemblies are created by fixture/task-specific literals;
- current `BIMComponent.geometry` primarily assumes position + dimensions + rotation;
- roof geometry is still too coarse for general roof design;
- hosted openings are not yet a first-class geometric constraint system across all live components;
- assembly layers are not consistently geometric;
- MEP connectivity is not yet a fully enforced canonical topology;
- visual geometry and engineering/process semantics are not yet unified under one reusable component contract.

The goal is to deepen existing architecture, not replace it.

## 3. Canonical modeling hierarchy

Use this hierarchy:

`Project → Site → Building → Storey → Space/Zone → Assembly → Component → Subcomponent/Connection`

Examples:

- Site
  - grading surface
  - access road
  - temporary trailer
  - laydown zone
- Building
  - Storey 01
    - Room 101
      - Wall A
        - framing
        - sheathing
        - insulation
        - gypsum
        - fasteners
      - Door D101
      - Receptacle R101
      - Duct branch D101

Every object must know its parent spatial container where applicable.

## 4. Units and coordinate truth

Canonical world coordinates use meters.

Never rely on visual scale factors as construction truth.

Each component must preserve:

- world transform;
- local transform relative to parent;
- real dimensions;
- orientation;
- geometric representation type;
- tolerances/clearance where relevant.

Display units may be imperial or metric without changing canonical coordinates.

## 5. Component contract

The current `BIMComponent` should evolve toward a stronger common contract.

Conceptually:

```
ConstructionComponent
  identity
  classification
  spatialContainer
  geometryDefinition
  transform
  assembly
  materials
  connections
  hostedObjects
  constraints
  constructionState
  inspectionState
  costQuantity
  provenance
  revisions
```

### Required identity

- componentId;
- projectId;
- type;
- system/discipline;
- IFC classification where applicable;
- human-readable name.

### Required geometry

Do not force every object into one box representation.

Support geometry definitions such as:

- linear extrusion;
- rectangular prism;
- polygon extrusion;
- profile extrusion;
- plane/roof face;
- cylinder;
- polyline sweep;
- parametric fitting;
- imported IFC mesh;
- imported GLTF/display mesh linked to canonical geometry.

### Required process state

Examples:

- PLANNED;
- PROCURED;
- DELIVERED;
- STAGED;
- INSTALLING;
- INSTALLED;
- INSPECTED;
- FAILED;
- REWORK_REQUIRED;
- COMPLETE.

Visual state should derive from this process state.

## 6. Walls

A wall must not be merely a rendered box.

Canonical wall definition should include:

- start point;
- end point;
- base elevation;
- height;
- overall thickness;
- orientation;
- exterior/interior role;
- load-bearing role;
- fire/acoustic requirements;
- assembly specification;
- hosted openings;
- top/bottom constraints;
- storey/space relationships.

Derived geometry:

- wall body;
- layer bodies;
- framing zone;
- opening voids;
- finish surfaces.

### Wall assembly layers

Example:

```
Exterior Wall
  exterior finish
  weather barrier
  sheathing
  stud cavity
  insulation
  vapor/air control layer
  gypsum
```

Each layer should have:

- material;
- thickness;
- side/order;
- purpose;
- source/specification.

Fasteners need not all be individually rendered at normal zoom, but the canonical assembly must be able to represent connection requirements.

## 7. Openings, doors, and windows

Openings are hosted constraints, not floating components.

A canonical opening must know:

- host component;
- offset along host;
- sill/base height;
- clear width;
- clear height;
- rough opening;
- orientation;
- opening type.

Door/window objects attach to openings.

Changing:

- wall length;
- wall height;
- opening position;
- opening size;

must regenerate affected geometry and detect invalid placement.

## 8. Floors, slabs, footings, foundations

Support polygonal footprint rather than only rectangular dimensions.

Canonical slab/floor:

- footprint polygon;
- elevation;
- thickness;
- slopes/depressions where relevant;
- openings;
- material/assembly;
- reinforcement/structural metadata;
- supporting relationships.

Foundations should support:

- slab-on-grade;
- thickened edges;
- strip footings;
- isolated footings;
- stem walls;
- grade beams;
- piers/piles as later primitives.

Foundation selection belongs to engineering/site truth; geometry is generated from the selected system.

## 9. Roof modeling

Roof capability is a major acceptance requirement.

Do not model all roofs as one bounding box.

Support a roof as connected parametric faces.

Minimum roof primitives:

- shed;
- gable;
- hip;
- flat/low-slope;
- intersecting roof groups later.

Roof definition should include:

- footprint or wall support polygon;
- roof type;
- pitch/slope;
- ridge direction;
- overhang;
- eave height;
- ridge height derived from geometry;
- valleys/hips/ridges;
- openings/penetrations;
- drainage direction;
- roof assembly.

Derived structural model may include:

- rafters;
- trusses;
- ridge;
- hips/valleys;
- sheathing/deck;
- underlayment;
- finish roofing.

Changing roof pitch/type must trigger:

- geometry regeneration;
- affected material quantity;
- drainage implications;
- structural dependency flags;
- opening/penetration revalidation;
- visual regeneration.

## 10. Beams, columns, and structural framing

Support linear members with:

- start/end or base/top;
- section/profile;
- material;
- orientation;
- connection endpoints;
- supported/supported-by relationships.

Wood framing should eventually support:

- stud layouts;
- plates;
- headers;
- joists;
- rafters/trusses;
- blocking.

Do not require individual-stud rendering at every zoom level.

Use level-of-detail:

- assembly envelope far away;
- framing detail when isolated/zoomed.

## 11. Rooms and spaces

Program volumes are not enough by themselves.

Canonical spaces should include:

- boundary references;
- floor/storey;
- finished floor elevation;
- ceiling height;
- use/type;
- area;
- volume;
- adjacency;
- required access/egress;
- environmental/service requirements.

Room geometry should be derived from enclosing construction or explicit planning boundaries and later reconciled with built geometry.

Changing room layout must propagate to:

- walls;
- openings;
- finishes;
- MEP service points;
- quantities;
- constructability checks.

## 12. Plumbing

Pipe must use real centerline + diameter geometry.

Canonical pipe segment:

- start;
- end/path;
- outside diameter;
- nominal size;
- material;
- slope where required;
- system;
- fluid/service;
- fittings/connections;
- insulation where applicable;
- clearance/installation zone.

Use swept cylindrical geometry for display/collision rather than generic boxes.

Connectivity must be a graph.

A plumbing system is not valid merely because all pipes are visible.

Validate:

- connected endpoints;
- compatible sizes/fittings;
- slope/flow rules where applicable;
- fixture/source/destination topology.

## 13. Electrical

Separate:

- panel/equipment;
- devices;
- conduit/pathway;
- cable/conductor logical circuits.

Conduit geometry:

- routed centerline/polyline;
- real diameter/profile;
- bends;
- junctions;
- clearances.

Electrical logical connectivity must not depend only on physical mesh contact.

Track circuit topology separately but link it to physical pathways/components.

## 14. HVAC

Canonical HVAC supports:

- equipment;
- supply/return/exhaust systems;
- ducts;
- fittings;
- diffusers/grilles;
- piping where applicable.

Duct geometry:

- centerline/path;
- width/height or diameter;
- fitting type;
- insulation thickness;
- required service clearance.

Connectivity graph is mandatory.

## 15. Temporary construction objects

Temporary works are first-class construction objects.

Examples:

- trailers/containers;
- fencing;
- temporary power;
- temporary water;
- temporary sanitation;
- access roads;
- crane pads;
- scaffolding;
- shoring;
- formwork;
- laydown/staging;
- waste/debris zones;
- erosion controls.

They need:

- geometry;
- active time interval;
- owner/task;
- access/clearance requirements;
- install/remove events.

Temporary objects matter because they constrain real construction space.

## 16. Materials and physical inventory

Distinguish:

### Material specification

What the material is.

### Material batch/inventory

A real project quantity at a location.

### Installed component

What consumes the material.

A material bundle should be capable of moving:

`OFFSITE → IN_TRANSIT → DELIVERED → STAGED → CARRIED → INSTALLED`

Its real dimensions/weight should be available for logistics reasoning.

## 17. Connections and topology

Introduce explicit connection relationships.

Examples:

- WALL supported_by SLAB;
- BEAM supported_by COLUMN;
- DOOR hosted_by WALL;
- PIPE connected_to FITTING;
- DUCT connected_to DIFFUSER;
- CIRCUIT feeds DEVICE;
- TRUSS bears_on WALL;
- MATERIAL_BATCH consumed_by COMPONENT.

These relationships are as important as meshes.

## 18. Constraint system

Geometry generation should produce and consume constraints.

Examples:

- hosted opening must remain within host boundary;
- door needs clear opening;
- wall endpoints join;
- roof bears on supported perimeter;
- MEP must preserve clearance;
- installed systems cannot occupy conflicting volumes;
- equipment needs service access;
- future tasks may require preserved access.

Constraints should have:

- ID;
- type;
- participating entities;
- severity;
- validation method;
- current result;
- evidence.

## 19. Revision/regeneration model

A parameter change must create a revision, not silently overwrite history.

Example:

`ROOF pitch 4:12 → 7:12`

Expected:

1. command accepted;
2. affected components identified;
3. candidate geometry generated;
4. constraints re-evaluated;
5. quantities/cost/schedule impacts recomputed;
6. revision recorded;
7. world updated only if accepted.

Preserve command/event/revision provenance.

## 20. Rendering architecture

Canonical geometry and display geometry may differ in complexity.

Allowed:

- simplified LOD;
- instancing;
- optimized meshes;
- merged framing geometry;
- decorative material shaders.

Not allowed:

- display geometry contradicting canonical geometry;
- a pretty roof unrelated to canonical roof dimensions;
- fake MEP paths used only for screenshots.

Renderer remains replaceable.

Three.js is the current interactive construction renderer.

## 21. IFC/OpenBIM relationship

IFC is important, but HERMES should not make every internal algorithm depend on parsing IFC text.

Use:

- HERMES canonical component graph for active reasoning;
- stable IFC mappings/IDs for interoperability/export/import;
- IFC import to populate canonical components;
- IFC export generated from canonical truth.

Preserve:

- IFC type;
- GlobalId;
- spatial containment;
- host relationships;
- systems;
- properties.

## 22. Construction generation pipeline

Target pipeline:

```
Project intent
→ site constraints
→ program/spaces
→ structural strategy
→ building layout
→ canonical construction primitives
→ assemblies/materials
→ MEP routing
→ spatial/constructability validation
→ quantities/cost/schedule
→ construction task graph
→ renderable scene
```

Do not make the renderable scene the starting source of truth.

## 23. First implementation slices after visual acceptance

Do not attempt the entire modeling system at once.

Recommended order:

### Slice 1 — Wall + opening + door/window
Prove:

- parametric wall;
- assembly thickness;
- hosted openings;
- resize/move regeneration.

### Slice 2 — Parametric roof
Prove:

- gable + hip;
- pitch;
- overhang;
- ridge/eave correctness;
- visual acceptance.

### Slice 3 — Floor/slab polygon
Prove non-rectangular footprint support.

### Slice 4 — MEP path geometry
Replace box-like MEP segments with routed sweeps and explicit connectivity.

### Slice 5 — component dependency propagation
Change room/wall/roof and recompute affected model.

Only then generalize Academy House creation.

## 24. Acceptance benchmark: Second House

P1 is successful when HERMES can produce a second small house using the same primitives but different:

- footprint;
- room layout;
- openings;
- roof type/pitch;
- foundation assumptions;

without hand-authoring a second fixture-specific geometry set.

## 25. Future hotel compatibility

Do not build the hotel now.

However, every modeling primitive should avoid assumptions such as:

- exactly one storey;
- exactly one dwelling;
- fixed room IDs;
- residential-only corridor logic;
- one roof;
- fixed exterior-wall count.

A future hotel is a larger graph of the same truthful primitives plus additional building systems and rules.
