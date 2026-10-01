# Packet B — Site Reality

## Objective

Make the project visibly exist on a real-scale construction site rather than an abstract ground plane.

## Required outcomes

Render from canonical state:
- parcel extent;
- terrain/grade;
- building footprint;
- buildable envelope when enabled;
- site access;
- construction access corridor;
- material staging;
- equipment/work zones;
- setbacks when enabled;
- existing obstructions/vegetation where modeled.

## Mutable ground

Ground must change when construction changes it.

At minimum:
- grading changes elevation;
- excavation removes/depresses terrain;
- fill raises terrain;
- foundation bears on the resulting ground state.

Do not represent excavation only as a text event.

## Parcel honesty

Never silently enlarge the actual parcel.

If a simulated construction work envelope extends beyond the parcel:
- show it distinctly;
- label it as temporary/off-site/assumed;
- expose the workspace deficit.

## Tests

Verify:
- parcel dimensions/area;
- terrain updates;
- build/work envelope separation;
- staging/access occupancy;
- no unsupported parcel expansion.

## Visual gate

Evidence must make clear:
- where the lot is;
- where the house is;
- where access occurs;
- where materials/equipment stage;
- and how excavation/grade changed the site.
