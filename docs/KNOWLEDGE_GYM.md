# HERMES CONSTRUCTION — KNOWLEDGE GYM & LEARNING ENGINE

## Overview
The **Knowledge Gym** is a dedicated background training environment managed by the `CONSTRUCTION-KNOWLEDGE-DIRECTOR`. The Knowledge Gym continuously audits agent curricula coverage, ingests approved authoritative source documents, extracts structured knowledge entities, detects source contradictions, and conducts competency testing.

---

## Knowledge Gym Heartbeat Sequence

```
1. Inspect Agent Competency Scores & Curriculum Coverage
   │
2. Identify Unprocessed Approved Sources in Source Registry Queue
   │
3. Execute Document Fetching, Text Extraction & Chunking
   │
4. Perform Entity, Property, Rule, Process & Failure Mode Extraction
   │
5. Build/Update Central Construction Knowledge Graph
   │
6. Generate Agent-Specific Knowledge Packs (e.g. HVAC-DUCT-KP-V001)
   │
7. Generate Agent Learning Reports & Submit to Discipline Managers
   │
8. Execute Deterministic Competency Testing & Shadow Mode Verification
   │
9. Update Agent Onboarding State & Calculate CORE_CONSTRUCTION_READINESS %
```

---

## Quota-Aware Hybrid Execution Strategy
- **When AI Inference Quota is Healthy**: Execute semantic entity extraction, relationship graph building, contradiction analysis, and competency scenario evaluations.
- **When AI Inference Quota is Constrained**: Switch to deterministic tasks — PDF text parsing, SHA-256 deduplication, chunking, keyword tagging, SQLite database storage, and index updating.
- **Outcome**: The Knowledge Gym operates 24/7 without stalling during transient model rate limits.
