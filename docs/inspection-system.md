# HERMES Independent Inspection & Repair System

## Autonomous Closed-Loop Quality Assurance
HERMES enforces an independent inspection and repair loop:
1. **BUILD**: Swarms construct building components based on location & code standards.
2. **INSPECT**: Independent Inspector agents audit components against Florida Building Code (FBC HVHZ 2023), International Plumbing Code (IPC), ACI 318 Concrete Code, and NEC 2023 Electrical Code.
3. **FAIL**: Open inspection tickets are logged with severity, required standard, and actual condition.
4. **REPAIR**: Assigned Repair Agents adjust geometry or material specifications.
5. **REINSPECT**: Inspector agents perform a second audit.
6. **PASS**: Ticket is marked `verified_closed` and components updated to `repaired`.
