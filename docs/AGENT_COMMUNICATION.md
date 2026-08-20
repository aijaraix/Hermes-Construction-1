# HERMES CONSTRUCTION — AGENT COMMUNICATION PROTOCOL

## Overview
All inter-agent communication in HERMES Construction is structured, typed, logged, and persisted. Rather than exchanging unstructured prose messages, agents communicate using formal `AgentMessage` objects. Every message records a sender, receiver, message type, scope, component references, engineering reasoning, priority, and resolution state.

---

## Message Schema (`AgentMessage`)

```typescript
export interface AgentMessage {
  messageId: string;                 // "MSG-20260820-0914"
  projectId: string;                 // "RESIDENCE-TAMPA-001"
  senderRoleId: string;              // "ROOM-MANAGER-204"
  receiverRoleId: string;            // "HVAC-SUPPLY-RETURN-DIFFUSER-AGENT"
  messageType: MessageType;          // "CONSULTATION_REQUEST"
  scope: string;                     // "ROOM-204"
  componentIds: string[];            // ["E-204-07", "DUCT-204-02"]
  payload: Record<string, any>;      // { proposedShiftInches: 18, direction: "EAST" }
  reasoning: string;                 // Engineering rationale for the message
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  timestamp: string;
  responseRequired: boolean;
  status: 'OPEN' | 'RESOLVED' | 'ESCALATED';
}
```

---

## Standardized Message Types (`MessageType`)

| Message Type | Usage Context |
| :--- | :--- |
| `TASK_ASSIGNMENT` | Manager assigns a specific trade task or calculation to a specialist. |
| `CONSULTATION_REQUEST` | One trade agent or Room Manager asks another agent to evaluate a spatial or technical conflict. |
| `CONSULTATION_RESPONSE` | Target agent returns `ACCEPT`, `REJECT`, `ALTERNATIVE`, `NEEDS_CALCULATION`, or `NEEDS_ESCALATION`. |
| `DESIGN_PROPOSAL` | Specialist submits a 3D component layout proposal for manager review. |
| `CONFLICT_NOTICE` | Spatial or structural clash detected between two proposed systems. |
| `REVISION_REQUEST` | Room or Discipline Manager requests layout modification. |
| `CALCULATION_REQUEST` | Request for deterministic structural/electrical/HVAC calculation. |
| `KNOWLEDGE_GAP` | Agent reports missing or stale authoritative construction knowledge. |
| `INSPECTION_REQUEST` | Builder requests independent inspection sweep. |
| `FAILURE_NOTICE` | Inspector flags a code or engineering calculation failure. |
| `REPAIR_REQUEST` | Inspector or Manager initiates auto-repair loop. |
| `MANAGER_ESCALATION` | Unresolved dispute elevated to Superintendent or Prime. |

---

## Escalation Hierarchy

```
Level 1: Specialist Agent Self-Resolution (within contract parameters)
   │
Level 2: Room Manager / Area Manager Coordination (cross-trade spatial resolution)
   │
Level 3: Discipline Manager Negotiation (e.g. Electrical Manager vs Mechanical Manager)
   │
Level 4: Project Superintendent Resolution (Field Constructability & Sequencing)
   │
Level 5: Project Executive Resolution (Budget, Milestone, or Scope Impact)
   │
Level 6: HERMES Construction Prime Resolution (Unresolved Core Quality/Risk Conflict)
```
