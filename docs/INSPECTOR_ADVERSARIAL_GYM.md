# HERMES INSPECTOR ADVERSARIAL GYM
## Independent Quality Inspection, Defect Injection, and Repair Workflows

### Overview
The Inspector Adversarial Gym evaluates building quality through independent, non-authoring inspector agents (`INDEPENDENT-STRUCTURAL-INSPECTOR`, `INDEPENDENT-MEP-INSPECTOR`, `INDEPENDENT-ENVELOPE-INSPECTOR`). Inspectors run automated sweeps against candidate BIM models to discover code violations, spatial clashes, and material defects.

---

### Defect Injection & Inspection Sweeps

#### 1. Inspection Rule Evaluation
Inspectors test BIM components against deterministic rules:
- **Structural**: Rebar cover minimums, anchor bolt embedment, footing depth vs frost line/soil bearing.
- **Electrical**: Receptacle spacing max 12ft, wet location GFCI requirements, panel clearance (36 in. front depth).
- **HVAC**: Duct sizing velocity limits (max 1000 FPM residential branch), CFM balance.
- **Envelope**: Continuous air barrier integrity, flashing lap directions, insulation R-value minimums.

#### 2. Ticket Issuance & Repair Workflow
1. When a failure is detected, the inspector issues an `InspectionTicket` detailing the exact component ID, rule violated, mathematical proof of failure, and severity (`CRITICAL`, `MAJOR`, `MINOR`).
2. The ticket is assigned to the responsible trade agent and discipline manager.
3. The trade agent calculates a revised component configuration in the sandbox environment.
4. The discipline manager approves the fix.
5. The independent inspector re-evaluates the component (`reinspection_status`).
6. Upon passing, the ticket transitions to `PASSED` state.
