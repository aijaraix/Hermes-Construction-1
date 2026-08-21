# DOMAIN CONFLICT ESCALATION ROUTING

When a technical or engineering discrepancy is discovered between displayed UI values, BIM geometry, or specialist trade outputs, the Reality Swarm creates a `DomainConflictRecord` and routes it through the governance chain:

```
[Reality Inspector]
       │ (Detects Engineering Discrepancy)
       ▼
[REALITY_PRIME]
       │ (Generates DomainConflictRecord & Preserves Engineering Value)
       ▼
[HERMES_PRIME]
       │ (Routes Conflict To Discipline Manager)
       ▼
[DISCIPLINE_MANAGER] (e.g. Structural Engineering Manager / HVAC Manager)
       │ (Reviews Trade Proof & Code Rationale)
       ▼
[SPECIALIST_VALIDATOR]
```

## Immutable Protection Boundary
Under no circumstances will Reality Swarm overwrite an engineering value. All engineering resolutions require explicit specialist re-evaluation and trade manager signoff.
