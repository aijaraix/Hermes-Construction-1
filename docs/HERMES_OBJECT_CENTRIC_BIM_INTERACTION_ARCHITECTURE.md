# HERMES OBJECT-CENTRIC BIM INTERACTION ARCHITECTURE

**Status:** Owner-directed product/model architecture  
**Purpose:** Make every physical construction element deeply inspectable, traceable, searchable, comparable, and viewable inside the HERMES project application.

## 1. Principle

HERMES should not treat a building as a collection of rendered meshes.

Every meaningful physical element is a semantic construction object.

Examples:

- window;
- door;
- wall;
- slab;
- footing;
- beam;
- column;
- roof;
- pipe;
- valve;
- conduit;
- panel;
- outlet;
- duct;
- diffuser;
- air handler;
- fixture;
- fastener/connection;
- equipment;
- temporary facility;
- material batch.

The geometry is one representation of the object.

The object also contains construction meaning.

## 2. Interaction model

The operator should be able to interact with the building by object, category, system, material, task, or location.

Examples:

- Show all windows.
- Isolate all windows.
- Hide everything except windows.
- List all window types.
- Select one window in the model.
- Open that window in a dedicated inspection view.
- Rotate it independently.
- Explode its assembly.
- Inspect frame, glazing, seals, fasteners, flashing, anchors, coatings, and hardware.
- See its type vs instance properties.
- See which room/wall hosts it.
- See its material specifications.
- See supplier/procurement information.
- See quantity and cost.
- See installation task.
- See who/what installed it.
- See event/revision provenance.
- See inspection state.
- See performance requirements.
- See replacement/substitution options.
- See every other instance of the same type.

This interaction must remain inside the HERMES application shell.

## 3. Object identity

Each construction object needs:

- stable component ID;
- type/category;
- discipline/system;
- human-readable name;
- project/building/storey/space location;
- IFC type/GlobalId where applicable;
- type/family definition;
- instance definition;
- current revision;
- lifecycle state.

## 4. Type vs instance

Preserve the distinction between:

### Type / family
Properties shared by a class of components.

Example window type:

- manufacturer/model;
- frame profile;
- glazing makeup;
- nominal width/height;
- U-factor;
- SHGC;
- wind rating;
- impact rating;
- finish;
- standard assembly;
- approved substitutions.

### Instance
Properties unique to one installed occurrence.

Example:

- WINDOW-W101;
- host wall;
- level;
- room;
- sill height;
- exact world pose;
- opening size;
- installation task;
- batch/serial;
- inspection result;
- field deviation.

Changing a type may affect many instances.

Changing an instance affects only that object unless explicitly propagated.

## 5. Category browsing

The object browser should allow category queries such as:

- all windows;
- all exterior doors;
- all plumbing valves;
- all roof components;
- all 2x6 framed walls;
- all uninspected components;
- all materials not installed;
- all components from supplier X;
- all components created during checkpoint 14;
- all objects affected by a revision.

Selecting a result highlights it in the world.

## 6. Schedules / object tables

Every object class should be able to generate a live table/schedule from canonical state.

Example window schedule columns:

- mark;
- type;
- width;
- height;
- room;
- host wall;
- glazing;
- frame;
- performance;
- quantity;
- cost;
- supplier;
- lead time;
- install status;
- inspection status.

Clicking a schedule row selects the physical object in the 3D world.

Selecting an object can scroll/focus the schedule row.

## 7. Dedicated object inspection view

Any selected component should support:

`Open Object View`

This does not navigate away from the project.

It temporarily creates an isolated 3D inspection workspace for the object.

Controls:

- orbit;
- zoom;
- section;
- explode assembly;
- transparency;
- isolate subcomponents;
- dimensions;
- annotations;
- materials;
- connections;
- compare type/instance;
- show installation orientation;
- show host relationships.

Closing returns to the original world/camera.

## 8. Assembly explosion

Where canonical assembly data exists, the operator should be able to explode the object conceptually.

Example window:

```
Window
  ├─ Frame
  ├─ Sash
  ├─ IGU glazing
  │   ├─ Exterior lite
  │   ├─ Interlayer / gap
  │   └─ Interior lite
  ├─ Spacer/seal
  ├─ Hardware
  ├─ Anchors
  ├─ Flashing
  ├─ Perimeter sealant
  └─ Host opening interface
```

This should be derived from canonical assembly/subcomponent data, not invented by the renderer.

Level of detail can increase as HERMES knowledge/modeling improves.

## 9. Material depth

Every component can link to one or more material specifications.

Material information may include:

- generic material;
- grade/class;
- manufacturer/product;
- dimensions;
- density;
- strength;
- thermal properties;
- corrosion/durability;
- fire properties;
- moisture behavior;
- coatings;
- compatibility;
- installation method;
- source/standard;
- supplier;
- cost;
- lead time;
- batch.

A component can therefore be inspected both geometrically and materially.

## 10. Relationships

Objects should expose relationships such as:

- hosted_by;
- supports;
- supported_by;
- connected_to;
- penetrates;
- serves;
- feeds;
- drains_to;
- belongs_to_system;
- consumes_material_batch;
- installed_by_task;
- inspected_by;
- affected_by_revision.

These relationships make the building a graph, not only a mesh.

## 11. Traceability

For any object, the operator should be able to answer:

- Why does it exist?
- Who/what created it?
- Which task installed it?
- Which revision changed it?
- Which material batch was used?
- Which source/spec justified it?
- Which inspector validated it?
- Which dependencies required it?
- What downstream systems rely on it?
- What would change if it were removed/replaced?

## 12. Construction state

Object lifecycle should be visible:

- designed;
- approved;
- procured;
- in transit;
- delivered;
- staged;
- installing;
- installed;
- inspected;
- failed;
- rework;
- complete.

The same physical object may have a planned state and an executed/observed state.

## 13. Compare modes

Support comparisons such as:

- design vs as-built;
- current vs previous revision;
- type A vs type B;
- specified material vs proposed substitution;
- planned location vs observed location;
- installed object vs inspection tolerance.

Differences should highlight in the world and inspector.

## 14. System isolation

Objects participate in systems.

Examples:

- all windows;
- envelope;
- structure;
- plumbing;
- electrical;
- HVAC;
- fire/life safety;
- temporary works.

System/category isolation should be one-click.

The operator can then select any element within the isolated system.

## 15. Search

Universal search/command palette should understand object queries:

- `windows`
- `all windows on level 2`
- `impact-rated windows`
- `windows not inspected`
- `window W103`
- `show glazing material`
- `show everything supplied by X`

Search results should link directly to canonical objects.

## 16. Levels of detail

HERMES does not need photorealistic manufacturer-grade geometry for every object initially.

Use progressive detail:

### LOD A
Correct envelope/size/position/type.

### LOD B
Assembly layers/subcomponents.

### LOD C
Connections, fittings, hardware, fasteners where relevant.

### LOD D
Manufacturer/product geometry or scanned/as-built detail where justified.

Semantic depth can exceed visual mesh depth.

A simple-looking window may still have deep material, procurement, task, and provenance information.

## 17. Object editing philosophy

HERMES is AI-native.

The owner/operator may inspect or command changes without manually drafting every object.

Examples:

- `replace these windows with impact-rated aluminum units`
- `make all bedroom windows 100 mm wider if code/structure allows`
- `show three lower-cost compliant alternatives`

Workflow:

1. request;
2. HERMES evaluates;
3. candidate revision generated;
4. constraints/cost/schedule/constructability recalculated;
5. visual preview;
6. human approval where required;
7. revision committed.

Manual modeling tools may still exist for professionals, but they are not the only interaction model.

## 18. Deep inspection workflow example: window

1. Operator selects **Windows** category.
2. All windows highlight.
3. Object drawer lists 14 instances / 4 types.
4. Operator selects W-107.
5. Camera focuses W-107.
6. Right inspector opens.
7. Tabs show:
   - Geometry;
   - Type;
   - Materials;
   - Performance;
   - Procurement;
   - Construction;
   - Provenance;
   - Inspection.
8. Operator clicks **Open Object View**.
9. W-107 opens in isolated orbitable view.
10. Operator clicks **Explode Assembly**.
11. Canonical frame/glazing/flashing/anchors separate visually.
12. Operator selects glazing.
13. Material card shows makeup, performance, source/spec and supplier.
14. Close returns to original project view with W-107 still selected.

## 19. Data model implication

HERMES must progressively move from flat geometry records toward:

```
ComponentInstance
  → ComponentType
  → Assembly
  → Subcomponents
  → Materials
  → Connections
  → Systems
  → Tasks
  → Events/Revisions
  → Procurement
  → Inspections
  → Evidence
```

Not every relationship must be implemented at once.

The architecture must allow it.

## 20. Rendering implication

The renderer needs:

- selection/highlight;
- category isolation;
- system isolation;
- ghost/transparency;
- object focus;
- local orbit;
- assembly explode transforms;
- section;
- measurement;
- compare overlays.

These are application behaviors around canonical objects.

## 21. Acceptance benchmark

The object-centric architecture is successful when a user can:

1. ask for all windows;
2. see all window instances highlighted;
3. open a window schedule/list;
4. select one instance;
5. focus it in the world;
6. inspect type and instance properties;
7. inspect material/specification data;
8. open an isolated rotatable object view;
9. inspect assembly/subcomponents where modeled;
10. see task/provenance/inspection;
11. return to the full project without leaving the application.

The same interaction pattern should generalize to doors, walls, structural members, MEP components, equipment, and materials.

## 22. Product rule

The construction world must be **semantically deep even when it is visually simple**.

Visual fidelity can increase over time.

Traceability and object intelligence should be foundational from the beginning.
