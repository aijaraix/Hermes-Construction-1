# HERMES CONSTRUCTION — INTERNET RESEARCH POLICY

## Overview
Internet access in HERMES Construction is tightly controlled, bounded, and role-restricted. General builder specialist agents query the internal **HERMES Construction Knowledge Graph** first. Web research is conducted exclusively by authorized research roles when knowledge is missing, stale, or location-specific.

---

## Research-Capable Roles
- `CONSTRUCTION-KNOWLEDGE-DIRECTOR`
- `KNOWLEDGE-RIGHTS-GOVERNANCE-AGENT`
- `JURISDICTION-LOCAL-AMENDMENT-AGENT`
- `SUPPLIER-DISCOVERY-PRICING-AGENT`
- `MANUFACTURER-RESEARCH-AGENT`

---

## Research Workflow & Provenance Capture

```
1. Specialist Agent Encounters Knowledge Gap
   │
2. Issues KNOWLEDGE_GAP Event to Knowledge Director
   │
3. Knowledge Director Assigns Target Query to Research Role
   │
4. Research Agent Fetches Document / Web Resource
   │
5. KNOWLEDGE-RIGHTS-GOVERNANCE-AGENT Validates Usage Rights
   │
6. Ingestion Pipeline Chunks Document & Extracts Structured Facts
   │
7. Fact Stored in Construction Knowledge Graph with Full Provenance:
   - Source URL
   - Publisher / Agency
   - Retrieval Timestamp
   - Rights Category
   - Citation Format
   │
8. Agent Knowledge Pack Updated & Knowledge Gap Closed
```
