# AEDRYX Visual Truth and Scale Contract

## Canonical units

All physical world state is expressed in real units. Internal canonical length is meters unless an existing contract explicitly says otherwise.

Renderer transforms are derived from canonical world state. The renderer must not independently invent scale.

## Object contract

Every rendered physical object must be traceable to canonical data containing, directly or by derivation:

- stable identity;
- type/class;
- geometry;
- pose;
- real dimensions;
- material/assembly classification where known;
- construction state;
- project revision/time;
- provenance/truth classification.

Where applicable also include:
- mass/weight;
- support relationship;
- host relationship;
- connected components;
- work envelope;
- movement/clearance envelope;
- staging state;
- inspection status.

## Scale invariants

Examples:
- a 6 ft person must be 1.8288 m tall in world coordinates;
- an 8 ft board must be 2.4384 m long;
- a 7 ft door opening must be approximately 2.1336 m high;
- a 10 ft wall must remain 3.048 m high everywhere in the system.

Do not enlarge or shrink objects merely to make them more visible.

Use UI labels, highlights, outlines, transparency, camera controls, and focus modes instead.

## Geometry rules

Do not use a generic rectangular box when the object's physical form materially affects user understanding.

Required examples:
- walls use actual wall runs/thickness/height and openings;
- roofs use actual slope/planes/ridges/eaves;
- excavation modifies terrain;
- doors/windows create openings;
- framing uses members rather than opaque wall blocks in framing mode;
- MEP systems use routed geometry;
- trees/obstructions use recognizable visual proxies plus physical envelopes;
- equipment uses real-scale bounds.

## Site/workspace truth

Distinguish:
- actual parcel;
- buildable envelope;
- building footprint;
- temporary construction work envelope;
- staging areas;
- access routes;
- any simulated extension outside the real parcel.

Never silently enlarge a real parcel.

If the building or construction process requires more work area than available, the UI must report the deficit or clearly mark off-site/temporary assumptions.

## Spatial cells

A cell/grid representation may be used for occupancy, routing, clearance, planning, or simulation.

It is **not** the visible building geometry.

Cell resolution must be fine enough for the question being answered and may be adaptive:
- coarse across large open site areas;
- finer near openings, active work, equipment, MEP, and constrained spaces.

## Physical behavior

At minimum:
- walls and closed assemblies block traversal;
- openings permit traversal only if actor/payload geometry fits;
- excavation changes ground occupancy;
- staged materials occupy space;
- equipment occupies and reserves operational space;
- carried objects affect movement feasibility;
- future closure may invalidate routes.

## Truth labels

A visually convincing scene must not imply stronger truth than the data supports.

Maintain distinctions among:
- simulated;
- imported/model-derived;
- measured;
- physically verified;
- professional review required;
- AHJ/inspection approval;
- completed/as-built.

Visual polish never upgrades evidence status.
