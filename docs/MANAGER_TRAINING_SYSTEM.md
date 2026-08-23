# HERMES MANAGER TRAINING SYSTEM
## Discipline Manager Oversight, Submittal Review, and Delegation Governance

### Manager Role Hierarchy
In HERMES, every trade specialist reports directly to a certified Discipline Manager:
- **Site & Civil Manager**: Supervises Topography, Geotechnical, Stormwater, Utility Trenching agents.
- **Structural Engineering Manager**: Supervises Shallow Footings, Concrete Slab, Wood Framing, Fasteners, CMU agents.
- **Building Envelope Manager**: Supervises Waterproofing, Insulation, Standing Seam Roofing agents.
- **Plumbing Systems Manager**: Supervises Domestic Water, Sanitary Venting agents.
- **Electrical Systems Manager**: Supervises Main Service Panel, Branch Circuit, Lighting agents.
- **Mechanical HVAC Manager**: Supervises Heating/Cooling Load, Duct Routing, Diffuser agents.
- **Spatial Coordination Superintendent**: Supervises Level Floor Managers and Room Managers.
- **Quality & Inspection Director**: Supervises Independent Structural, MEP, and Envelope Inspectors.

---

### Manager Submittal Review Process
When a specialist agent submits a trade design or BIM component placement, the manager executes a structured review:
1. **Curriculum & Knowledge Pack Check**: Verify that the specialist agent is operating on an active, manager-approved Knowledge Pack (`KP-v1.0.0`+).
2. **Deterministic Calculation Audit**: Check closed-form calculation proof scores ($100\%$ required).
3. **Hidden Validation Rule Check**: Test proposal against undisclosed edge-case scenarios (e.g., high groundwater table, extreme wind speed).
4. **Cross-Trade Clash Detection**: Coordinate with neighboring discipline managers for spatial or systemic interferences.
5. **Decision Issuance**:
   - `APPROVED`: Proposal incorporated into active project BIM model and BOM.
   - `APPROVED_WITH_LIMITS`: Approved within restricted operational scope.
   - `RETRAINING_REQUIRED`: Issue specific knowledge gap notes and trigger re-study cycle.
   - `REJECTED`: Violates building code or structural safety.
