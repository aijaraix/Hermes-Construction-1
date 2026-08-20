# HERMES CONSTRUCTION — SHADOW MODE PROTOCOL

## Overview
When a specialist agent passes initial competency testing ($\ge 85.0\%$), it transitions to **Shadow Mode** (`READY_FOR_SHADOW_WORK`). In Shadow Mode, the agent runs in parallel with active project tasks, generating proposals and calculations that are logged and audited, but **not automatically applied** to the active production BIM or project database.

---

## Shadow Mode Lifecycle

```
Agent Reaches Competency Threshold (>= 85.0%)
   │
   ▼
Status Set to READY_FOR_SHADOW_WORK
   │
   ▼
Agent Receives Real Project Tasks in Parallel
   │
   ▼
Agent Produces Design Proposals / Calculations
   │
   ▼
Shadow Audit Engine Compares Agent Output against Verified Benchmark / Manager Decision
   │
   ├─────────── Match Score >= 90.0% ────────────┐
   │                                            │
   ▼                                            ▼
Shadow Counter Increments                    Shadow Failure Triggered
(e.g. 5/5 Consecutive Successes)             Retraining Required -> RESEARCHING
   │
   ▼
Discipline Manager Signs Off
   │
   ▼
Status Set to READY_FOR_CONSTRUCTION_WORK
```

---

## Benefits
- Prevents unverified agents from corrupting BIM models or introducing bad structural/MEP parameters.
- Provides verifiable audit trails showing exact shadow test performance before an agent receives construction authority.
