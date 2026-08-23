# HERMES AGENT MASTER CURRICULA
## Hierarchical Multi-Topic Curriculum Framework for Specialist Trade Agents

### Structure of Master Curricula
Every registered agent contract in HERMES possesses a structured, machine-readable `AgentCurriculum` comprising core topics across domain physics, building codes, material specifications, construction processes, deterministic calculations, and failure modes.

---

### Topic Criticality & Progress Lifecycle
Topics are classified by importance:
- **CRITICAL**: Mandatory 100% mastery required for House #1 safety-critical roles (e.g., footing bearing capacity, truss uplift anchors, electrical panel sizing).
- **HIGH**: Essential operational knowledge required for trade coordination and BIM component placement.
- **MEDIUM / ELECTIVE**: Supplementary materials and optimization techniques.

Topic Progress States:
- `NO_EVIDENCE`: Initial state prior to document discovery.
- `SOURCE_IDENTIFIED`: Relevant primary source listed in agent Source Plan.
- `INGESTING`: Document text parsed and chunked into memory.
- `KNOWLEDGE_EXTRACTED`: Assertions and rules extracted from chunks.
- `VALIDATED`: Corroborated across multiple independent sources.
- `KNOWLEDGE_TESTED`: Agent passed scenario-based competency evaluation.
- `PRACTICAL_TESTED`: Passed specialist sandbox deterministic math simulation.
- `MANAGER_APPROVED`: Reviewed and certified by Discipline Manager.
- `MASTERED_WITHIN_SCOPE`: Reached 100% topic competency within certified jurisdiction.

---

### Core Trade Agent Curricula Summary

#### 1. Shallow Footing & Foundation Specialist (`SHALLOW-FOOTING-DESIGN-AGENT`)
- **Foundational Geotechnical**: Soil bearing capacity (PSF), water table interaction, soil classification (USCS).
- **FBC 2023 & ACI 318**: Chapter 18 Foundations, minimum embedment depth (12 inches below undisturbed ground), concrete compressive strength (fc' >= 3000 PSI).
- **Calculations**: Footing area $A = \frac{P_{total}}{q_{allowable}}$, punching shear capacity, rebar placement.

#### 2. HVAC Supply & Return Diffuser Specialist (`HVAC-SUPPLY-RETURN-DIFFUSER-AGENT`)
- **Thermodynamics & Air Distribution**: CFM calculation based on room heat load, throw distance, noise criteria (NC 25-35).
- **FBC Mechanical 2023**: Chapter 6 Duct Systems, minimum outdoor air requirements (ASHRAE 62.2).
- **Calculations**: $CFM = \frac{Q_{sensible}}{1.08 \times \Delta T}$, velocity $V = \frac{CFM}{Area_{neck}}$.

#### 3. Branch Circuit & Device Placement Specialist (`BRANCH-CIRCUIT-RECEPTACLE-AGENT`)
- **Electrical Standards**: NFPA 70 / NEC 2023 Article 210, FBC Residential Chapter 39.
- **Device Rules**: Receptacle spacing max 12 ft along wall lines, GFCI protection for wet locations (kitchen, bathroom, exterior), AFCI for sleeping areas.
- **Calculations**: Voltage drop $V_{drop} = \frac{2 \times K \times I \times D}{CM} \le 3\%$, circuit loading limit $80\%$ continuous load.
