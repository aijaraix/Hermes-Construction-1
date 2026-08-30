# HERMES LIVE WORLD ARCHITECTURE

## Overview
HERMES Construction OS operates on a **Canonical Command → Event → State → World** event-sourced architecture.
The 3D BIM viewport is a strictly deterministic **VIEW** of canonical state; it does not contain independent construction state or fictional animation timers.

```
+------------------+     Commands     +------------------------+
|  Operator / UI   | ---------------> |  HermesLiveHouseEngine |
+------------------+                  +------------------------+
                                                  |
                                            Produces Event
                                                  v
                                      +------------------------+
                                      |    World Event Bus     |
                                      +------------------------+
                                                  |
                                         State Reducer (Hash)
                                                  v
                                      +------------------------+
                                      |  Canonical World State |
                                      +------------------------+
                                                  |
                                          Renders Entities
                                                  v
                                      +------------------------+
                                      |   3D BIM Viewport      |
                                      +------------------------+
```

## Architectural Principles
1. **Single Source of Truth**: `HermesLiveHouseEngine` manages canonical project entities (`spatialEntities`, `agentSpatialStates`, `requirementRecords`, `surveyMarks`, `boringSamples`, `buildableEnvelope`, `programVolumes`, `materialsOnsite`, `buildingComponents`, `clashes`).
2. **Deterministic State Hash**: Every checkpoint progression computes a SHA-256 state hash ensuring replay stability across server reboots.
3. **Decoupled Speed Control**: Playback speed and manual stepping adjust presentation controls without altering underlying engineering calculations or sequence logic.
4. **Isolated Legacy Fixtures**: Historical validation suites (`Validation005`, `Validation006`, `Validation007`) are preserved as protected regression tests while `HERMES-LIVE-HOUSE-001` serves as the live default project.
