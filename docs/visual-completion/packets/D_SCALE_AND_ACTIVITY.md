# Packet D — Scale & Activity

## Objective

Make people, equipment, materials, and active work visibly believable at real-world scale.

## Required actor model

Every rendered actor/equipment item must have canonical or explicitly declared:
- physical dimensions;
- pose;
- orientation;
- occupancy/bounds;
- current work zone;
- activity state.

## Initial visual assets

Use professional low/medium-detail assets or procedurally generated recognizable forms for:
- human worker;
- survey actor/equipment;
- excavator;
- forklift/telehandler where applicable;
- delivery/truck proxy;
- ladder/scaffold where applicable;
- material pallet;
- lumber bundle;
- pipe/duct bundle.

No asset may use arbitrary scale independent of its canonical dimensions.

## Activity

Where the operation state supports it, show:
- actor at current work zone;
- staged materials at staging location;
- equipment at active operation;
- movement/path visualization when useful;
- current task focus.

Do not create decorative wandering animations disconnected from canonical work state.

## Clearance foundation

Use existing actor/payload bounds where available.

For constrained movement cases, preserve the path to future swept-volume reasoning. Do not fake successful traversal through blocked geometry.

## Visual gate

A user should be able to compare a person, door, wall, vehicle, and building and find the proportions believable.
