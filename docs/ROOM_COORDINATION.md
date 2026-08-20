# HERMES CONSTRUCTION — ROOM-LEVEL SPATIAL COORDINATION

## Overview
HERMES Construction enforces **Room-Level Thoughtful Coordination**. Objects are never placed purely based on code minimums or default template grids. Every component inside a room (e.g. `ROOM-204`) is evaluated by a dedicated `ROOM-MANAGER` for practical construction, device ergonomics, accessibility, maintenance clearances, and multi-trade clash prevention.

---

## The Room Construction Manager Protocol (`ROOM-MANAGER-204`)

When trade specialists propose components inside Room 204 (e.g. Master Bedroom / Office Zone):

```
                       TRADE PROPOSALS
   (Electrical Receptacles, HVAC Diffusers, Lighting, Plumbing)
                               │
                               ▼
                      ROOM-MANAGER-204
                 (Spatial & Practical Evaluation)
                               │
     ┌─────────────────────────┼─────────────────────────┐
     │                         │                         │
DEVICE ACCESSIBILITY    CEILING CAVITY CLASH     MAINTENANCE CLEARANCE
 (e.g. blocked by doors?  (e.g. diffuser vs       (e.g. access panel to
  wall space served?)      joists/sprinkler)       HVAC damper clear?)
     │                         │                         │
     └─────────────────────────┼─────────────────────────┘
                               │
                               ▼
               EVALUATION & RATIONALE RECORD
              (ACCEPT or REVISION_REQUEST Issued)
```

---

## Multi-Trade Coordination Case Study: Room 204

### Scenario
1. **Electrical Specialist** proposes Receptacle `E-204-07` on North Wall at $X=12.5\text{ ft}, Y=8.0\text{ ft}, Z=1.5\text{ ft}$.
2. **HVAC Specialist** proposes Return Air Grille `H-204-02` on North Wall at $X=12.0\text{ ft}, Y=8.0\text{ ft}, Z=1.2\text{ ft}$.
3. **Clash Detection**: Spatial clash detected — Receptacle and Return Grille overlap within $6\text{ inches}$.

### Resolution Sequence
1. `ROOM-MANAGER-204` issues `CONSULTATION_REQUEST` to `HVAC-SUPPLY-RETURN-DIFFUSER-AGENT`:
   - *"Electrical device E-204-07 conflicts with return grille H-204-02 location. Can return move 18 inches EAST ($X=13.5\text{ ft}$) without degrading room airflow or static pressure?"*
2. `HVAC-SUPPLY-RETURN-DIFFUSER-AGENT` evaluates:
   - Recalculates room airflow velocity and throw. Airflow remains within 50 FPM comfort zone; pressure drop unchanged ($0.02\text{ in. w.g.}$).
3. **Response Issued**: `CONSULTATION_RESPONSE` with status `ACCEPT` and revised placement coordinates ($X=13.5\text{ ft}$).
4. **System Connectivity Verification**:
   - `E-204-07` $\rightarrow$ Branch Circuit `BC-204-01` $\rightarrow$ Panel `PANEL-A` $\rightarrow$ Feeder `FDR-01` $\rightarrow$ Main Utility Service.
   - `H-204-02` $\rightarrow$ Flex Return Branch `DR-204` $\rightarrow$ Main Return Trunk `TRK-L02` $\rightarrow$ Air Handler `AHU-01`.
5. **Outcome**: Zero orphan objects; 100% spatial and systemic continuity validated.
