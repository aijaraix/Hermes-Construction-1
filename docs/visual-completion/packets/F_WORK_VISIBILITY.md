# Packet F — Work Visibility

## Objective

Make the live product answer “what is happening right now?” without requiring a separate chat.

## Main-view status

Expose, visually and interactively:

### Now
Current active task/workfront.

### Recently Changed
Most recent meaningful physical/project changes.

### Next
Immediate upcoming executable work.

### Blocked
Current blockers and hold points.

### Agents / Crews
Who or what is assigned to current work.

### Materials
Delivered, staged, required, missing.

### Progress
Current phase and meaningful completion state.

## Interaction

Selecting a visible object or active work item should open the Universal Inspector or equivalent detailed view with:
- identity;
- state;
- dimensions;
- material/assembly;
- provenance/truth class;
- current/recent operations;
- linked inspection/attention items where available.

## Timeline/replay

The user must be able to inspect meaningful historical project states and understand what changed.

## No fake liveliness

Do not add random motion, fake workers, fake progress bars, or looping activity merely to make the product appear busy.

Visible activity must derive from canonical project state or clearly labeled simulation.

## Final visual gate

A user opening AEDRYX should be able to answer, without developer explanation:
- What are we building?
- Where are we in the build?
- What changed?
- What is happening now?
- What happens next?
- What is blocked?
- Where are the people/equipment/materials?
- Can I inspect the underlying truth?
