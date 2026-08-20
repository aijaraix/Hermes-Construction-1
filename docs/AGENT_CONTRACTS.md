# HERMES CONSTRUCTION — AGENT CONTRACT SPECIFICATION

## Overview
To prevent "generic LLM prompt sprawl", every specialist role in HERMES Construction operates under a formal, machine-readable **Agent Contract**. An agent cannot execute construction tasks or modify BIM components until its contract is verified and its onboarding state reaches `READY_FOR_CONSTRUCTION_WORK`.

---

## Contract Schema (`AgentContract`)

```typescript
export interface AgentContract {
  roleId: string;                     // e.g. "HVAC-DUCT-ROUTING-AGENT"
  roleName: string;                   // "Duct Routing & Friction Loss Specialist"
  managerRoleId: string;              // "MECHANICAL-HVAC-MANAGER"
  discipline: SystemCategory | ...;   // "HVAC"
  responsibilities: string[];         // Bounded list of exact tasks
  inputs: string[];                   // Required input data / BIM state
  outputs: string[];                  // Expected output artifacts
  tools: string[];                    // Permitted calculation & retrieval tools
  knowledgeDomains: string[];         // Assigned curricula topics
  canConsult: string[];               // Allowed peer roles
  cannotDo: string[];                 // Explicit negative constraints
  validationRequirements: string[];   // Mathematical or code checks required
  escalationRules: string[];          // Conditions requiring manager escalation
  knowledgeCurriculum: string[];      // Assigned curriculum topics
  readinessStatus: AgentOnboardingState; // Onboarding lifecycle state
  competencyScore: number;            // Tested score (0-100%)
  knowledgeCoveragePct: number;       // Curriculum coverage (0-100%)
  isCoreHouse1Role: boolean;          // Required for House #1 readiness gate
}
```

---

## Sample Agent Contract: `HVAC-DUCT-ROUTING-AGENT`

```json
{
  "roleId": "HVAC-DUCT-ROUTING-AGENT",
  "roleName": "Duct Routing & Friction Loss Specialist",
  "managerRoleId": "MECHANICAL-HVAC-MANAGER",
  "discipline": "HVAC",
  "responsibilities": [
    "Calculate supply/return duct sizing based on CFM and static pressure loss",
    "Route trunk and branch ducts avoiding structural beams, joists, and plumbing risers",
    "Specify duct material (Galvanized Sheet Metal / R-6 Flex Duct) and insulation",
    "Calculate equivalent length for fittings, elbows, and transitions"
  ],
  "inputs": [
    "Heat gain/loss CFM load calculations from HEATING-COOLING-LOAD-CALC-AGENT",
    "Ceiling cavity depth and structural beam locations from STRUCTURAL-ENGINEERING-MANAGER",
    "Room layout and diffuser positions from ROOM-MANAGER"
  ],
  "outputs": [
    "3D Duct BIM components with dimensions, CFM rating, and pressure drop",
    "Duct fitting schedule with equivalent lengths",
    "Bill of Materials quantity trace for sheet metal / flex duct"
  ],
  "tools": [
    "calculateDuctPressureLoss()",
    "queryBuildingAmericaHVACRules()",
    "checkCeilingClash()"
  ],
  "knowledgeDomains": [
    "Duct friction charts & equal friction method",
    "SMACNA HVAC Duct Construction Standards",
    "FBC 2023 Mechanical Chapter 6",
    "PNNL Building America Duct Sealing & Insulation Rules"
  ],
  "canConsult": [
    "ELECTRICAL-CONDUIT-ROUTING-AGENT",
    "PLUMBING-SANITARY-DRAIN-VENT-AGENT",
    "STRUCTURAL-FRAMING-INSPECTOR"
  ],
  "cannotDo": [
    "Cannot modify structural beam depth or drill joist flanges",
    "Cannot alter room ceiling height without Room Manager approval",
    "Cannot size electrical breaker for HVAC equipment"
  ],
  "validationRequirements": [
    "Static pressure drop must not exceed 0.10 in. w.g. per 100 ft",
    "Duct velocity must remain below 900 FPM in residential branch ducts"
  ],
  "escalationRules": [
    "Escalate to MECHANICAL-HVAC-MANAGER if ceiling cavity height is < 10 inches",
    "Escalate to SPATIAL-COORDINATION-SUPERINTENDENT if duct path conflicts with major steel beam"
  ],
  "knowledgeCurriculum": [
    "HVAC Duct Friction Loss Math",
    "Flexible Duct Compression Losses",
    "Fire/Smoke Damper Penetrations",
    "Condensation Prevention in Unconditioned Spaces"
  ],
  "readinessStatus": "READY_FOR_CONSTRUCTION_WORK",
  "competencyScore": 92.5,
  "knowledgeCoveragePct": 88.0,
  "isCoreHouse1Role": true
}
```
