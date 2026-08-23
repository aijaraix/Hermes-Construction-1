# HERMES SPECIALIST SANDBOX ARCHITECTURE
## Isolated Simulation Environments & Deterministic Engineering Validation

### Overview
Specialist Sandboxes are isolated digital simulation environments where trade agents generate, evaluate, and refine construction proposals prior to submission for manager review.

---

### Sandbox Types & Deterministic Engines

#### 1. Geotechnical & Structural Sandbox
- **Engine**: `EngineeringCalculationEngine`
- **Evaluations**: Shallow footing bearing pressure, soil settlement, wind uplift force ($q_z = 0.00256 K_z K_{zt} K_d K_e V^2$), beam deflection ($\delta = \frac{5 w L^4}{384 E I}$).
- **Validation**: Strict pass/fail based on ACI 318-19 and ASCE 7-22 limits.

#### 2. Thermal & MEP Sandbox
- **Engine**: `EngineeringCalculationEngine`
- **Evaluations**: Room sensible/latent heat gains, duct static pressure drop, electrical voltage drop, pipe flow velocity.
- **Validation**: Compliance with Florida Energy Conservation Code 2023 and NEC 2023.

#### 3. Spatial & Ergonomic Sandbox
- **Engine**: `DeterministicGeometryEngine` & `RoomCoordinationEngine`
- **Evaluations**: 3D bounding box collision detection, ADA clearance zones, door swing clearances, maintenance access corridors.
- **Validation**: Zero spatial interferences between structural, MEP, and architectural elements.

---

### Sandbox Workflow
1. Agent pulls active project BIM model state and room scope.
2. Agent executes domain proposal inside isolated sandbox sandbox state.
3. Sandbox runs closed-form deterministic math functions against proposal.
4. Output score generated ($0-100\%$).
5. If math checks pass, proposal advances to Manager Review queue; if checks fail, feedback notes are issued for automated re-calculation.
