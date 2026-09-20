# HERMES NEEDS-YOUR-ATTENTION — IMPLEMENTATION SPEC

Status: Source-audited product and implementation architecture
Purpose: Give the owner one truthful attention queue for anything that requires a decision, blocks work, fails validation, needs professional/AHJ review, or creates material project risk.

## 1. Product objective

The owner should never have to hunt through inspections, clashes, Prime status, risks, and project questions to figure out whether something needs action.

One compact control should answer:
- Does anything need me?
- Is construction blocked?
- Did an inspection fail?
- Is there an unresolved clash?
- Is a professional review still required?
- Is an AHJ inspection still pending?
- Is HERMES waiting on an owner decision?
- Is there a material/constructability problem?

Default shell example:
NEEDS ATTENTION · 2

## 2. Canonical live sources

### Owner decisions
worldState.pendingQuestion contains questionId, prompt and missingFields.

### Project blocked state
worldState.status can be BLOCKED.

### Constructability
worldState.constructabilityProof includes status, materialId, closureComponentId, route feasibility and rationale.

### Spatial clashes
worldState.clashes currently uses clashId, componentA, componentB, description, severity and status.
Current live active status is ACTIVE.
Resolved repair evidence uses RESOLVED_REROUTED.

### Component quality
worldState.buildingComponents may include inspectionStatus such as PASSED or FAILED.

### Live inspection gate
worldState.inspectionTickets currently supports live HermesInspectionTicket fields:
- ticketId
- discipline
- inspector
- status: HERMES_VALIDATED / FAIL / WARNING / INSUFFICIENT_INFORMATION
- licensedProfessionalApproval: PENDING / REVIEWED / NOT_APPLICABLE
- AHJInspection: PENDING_CITY_INSPECTION / PASSED / NOT_SUBMITTED
- certificateOfOccupancyStatus: PENDING_AHJ_FINAL_WALK / ISSUED / NOT_ELIGIBLE
- date
- notes

### Legacy project inspection tickets
Older DigitalTwinProject InspectionTicket supports severity, affected component IDs, location, problem, required standard, actual condition, repair state and timestamps.

### Change-order risk
Legacy ChangeOrderRisk supports probability, severity, potentialCost, scheduleImpactDays, affectedTrades, mitigation and resolved.
This is not currently part of the live HermesWorldState, so it must be treated as optional external/legacy project context.

### Manager reviews
ManagerReviewRecord supports APPROVED, APPROVED_WITH_LIMITS, RETRAINING_REQUIRED, MORE_EVIDENCE_REQUIRED, REJECTED and PROFESSIONAL_REVIEW_REQUIRED decisions.
These reviews are not currently wired into live HermesWorldState. Use only when explicitly supplied.

## 3. Current UI truth defects

### InspectorView
The current InspectorView treats zero open tickets as proof that all digital systems have passed independent inspection.
That is false when no inspection has been performed.

Rule:
- zero tickets before an inspection event means No inspection results recorded yet
- zero open failures after canonical inspection evidence may mean No open inspection failures

The current button labeled Run Inspection Sweep calls onTriggerHeartbeat rather than a dedicated inspection action. Do not preserve that label/action mismatch.

### ChangeOrderView
The current ChangeOrderView sums unresolved risk exposure but labels it Prevented Cost Exposure.
Unresolved exposure is not prevented.

Rule:
- unresolved sum = Potential Cost Exposure
- prevented/avoided cost may be shown only with canonical resolved/avoided evidence

## 4. Normalized attention item

Each human item should expose:
- id
- category
- severity
- title
- detail
- status
- requiresOwnerAction
- blocking
- source
- related entity IDs
- task ID if known
- world position if known
- recommended next action only when supported by canonical data
- raw source record

Categories:
- OWNER_DECISION
- PROJECT_BLOCKER
- CONSTRUCTABILITY
- CLASH
- INSPECTION
- PROFESSIONAL_REVIEW
- AHJ
- QUALITY
- CHANGE_RISK
- MANAGER_REVIEW
- OTHER

Severities:
- CRITICAL
- HIGH
- MEDIUM
- LOW
- INFO

## 5. Owner decision rules

If pendingQuestion exists:
- category OWNER_DECISION
- HIGH
- requiresOwnerAction = true
- blocking = worldState.status is CUSTOMER_DECISION_REQUIRED or BLOCKED
- title = Owner decision required
- detail = canonical prompt

Use missingFields only as supporting detail.

## 6. Project blocked rule

If worldState.status = BLOCKED:
- category PROJECT_BLOCKER
- HIGH
- blocking = true
- title = Project work is blocked

Do not invent a reason.
If another specific item explains the block, the UI may visually group them, but the adapter should preserve source truth.

## 7. Constructability rules

If constructabilityProof status is FAILED:
- HIGH
- blocking = true

If BLOCKED:
- HIGH
- blocking = true

If UNVERIFIED:
- do not automatically surface as an error
- may be INFO only when the current/next task depends on that proof

If PASSED:
- not an attention item.

Use canonical rationale.
Related IDs: materialId and closureComponentId.

## 8. Clash rules

Only status ACTIVE is actionable by default.

ACTIVE:
- category CLASH
- use canonical severity when recognizable
- blocking if current downstream logic is blocked or severity is HIGH/CRITICAL
- related IDs componentA/componentB

RESOLVED_REROUTED:
- not an active attention item
- may appear in resolved history.

Unknown clash status:
- do not call it resolved or active without evidence
- use review-required informational state.

## 9. Component quality rules

If a current building component has inspectionStatus FAILED:
- category QUALITY
- HIGH
- related entity = componentId
- title = Component inspection failed

If a matching active clash/inspection ticket already represents the same issue, the UI may deduplicate visually later.

PASSED is not an attention item.

## 10. Live inspection rules

FAIL:
- HIGH
- blocking may be true when phase/dependencies imply an inspection gate

INSUFFICIENT_INFORMATION:
- MEDIUM
- requires evidence/review

WARNING:
- LOW or MEDIUM depending on context

HERMES_VALIDATED:
- not a failure
- but professional/AHJ/CO sub-gates must still be evaluated separately.

Never describe HERMES_VALIDATED as a licensed professional or municipal approval.

## 11. Professional review rules

For live inspection ticket:
licensedProfessionalApproval = PENDING:
- PROFESSIONAL_REVIEW
- MEDIUM
- title = Professional review pending

REVIEWED:
- no professional-review attention item.

NOT_APPLICABLE:
- none.

For ManagerReviewRecord decision PROFESSIONAL_REVIEW_REQUIRED:
- PROFESSIONAL_REVIEW
- HIGH
- use reasons/limitations when supplied.

MORE_EVIDENCE_REQUIRED or RETRAINING_REQUIRED:
- MANAGER_REVIEW
- MEDIUM/HIGH
- not owner-action unless the record explicitly requires the owner.

## 12. AHJ / occupancy rules

AHJInspection = PENDING_CITY_INSPECTION:
- category AHJ
- MEDIUM
- title = Municipal inspection pending

AHJInspection = NOT_SUBMITTED:
- INFO or MEDIUM depending on project phase
- title = Municipal inspection not submitted

certificateOfOccupancyStatus = PENDING_AHJ_FINAL_WALK:
- category AHJ
- MEDIUM during closeout
- title = Final occupancy inspection pending

ISSUED:
- no attention.

NOT_ELIGIBLE:
- HIGH when project is attempting closeout.

## 13. Legacy inspection ticket rules

status open:
- active issue
- severity from canonical ticket severity

status repaired:
- MEDIUM until verified closed if verification is still required

status verified_closed:
- resolved history only.

Never treat absence of tickets as proof of passing.

## 14. Change-order risk rules

Only unresolved risks are active.

Use canonical severity/probability.
Potential cost and schedule impact can be displayed exactly as recorded.

Label:
Potential Cost Exposure
not Prevented Cost Exposure.

Resolved risks belong in history.

## 15. Action model

Supported actions should be contextual:
- Answer decision
- Focus in world
- Open object
- Open inspection
- Open issue
- Show related components
- View evidence
- View repair

Do not show Fix / Approve buttons unless an actual backend action exists.

## 16. Attention drawer

Default compact chip:
NEEDS ATTENTION · N

Expanded:
- Blocking
- Needs decision
- Inspection / quality
- Professional / AHJ
- Coordination
- Risks

Sort:
1. blocking critical/high
2. owner decisions
3. inspection/professional/AHJ
4. other high
5. medium
6. low/info

Resolved items should be hidden by default and available under History.

## 17. Empty states

Do not show All clear merely because arrays are empty.

Use truth-sensitive empty states:
- No active issues recorded
- No inspection results recorded yet
- No owner decisions pending
- No active clashes

A global All clear is allowed only if all relevant gates have actually run and none are active.

## 18. Relationship to human status HUD

humanProjectStatus.attention can remain a lightweight summary.

projectAttentionState becomes the detailed canonical queue.

ProjectStatusHUD should use:
- active attention count
- blocking count
- owner-action count

and open this drawer.

## 19. First implementation slice — ATTENTION-01

Implement:
- normalized adapter
- attention chip/count
- attention drawer
- pending owner question
- project blocker
- constructability failure/block
- active clashes
- failed component inspection states
- live inspection sub-gates
- optional legacy inspection/change risks

Defer:
- executing repairs
- municipal integrations
- professional e-sign/stamping
- notifications/email/SMS
- multi-user assignment
- due dates/SLA

## 20. Acceptance

A user can answer:
1. Does anything need my attention?
2. Which items block construction?
3. Does HERMES need a decision from me?
4. Did a component/inspection fail?
5. Are there unresolved clashes?
6. Is a professional review pending?
7. Is municipal inspection/CO pending?
8. What objects/location are involved?
9. What evidence supports the warning?
10. What is truly resolved versus merely not recorded?

No green status may be inferred from missing evidence.