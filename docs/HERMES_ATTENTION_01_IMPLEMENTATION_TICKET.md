# HERMES ATTENTION-01 — EXACT IMPLEMENTATION TICKET

Status: Ready for future bounded implementation
Purpose: Add one truthful Needs Your Attention control and drawer to the immersive HERMES project workspace.

## 1. Read first

- docs/HERMES_NEEDS_YOUR_ATTENTION_IMPLEMENTATION_SPEC.md
- src/lib/projectAttentionState.ts
- src/lib/humanProjectStatus.ts
- src/lib/inspectableEntity.ts
- docs/HERMES_UNIVERSAL_INSPECTOR_IMPLEMENTATION_SPEC.md

## 2. Scope

Implement ATTENTION-01 only.

Required:
- compact Needs Attention chip in immersive shell
- active count
- blocking count
- owner-action count
- expandable attention drawer
- pending owner question
- project BLOCKED state
- constructability BLOCKED/FAILED
- active clashes
- failed component inspection state
- live HERMES inspection statuses
- professional review gate
- AHJ / CO gates
- optional existing legacy inspection/change-risk input only when actually connected

Do not implement repairs, professional signing, AHJ submission, notifications, or due dates.

## 3. Truth repairs

Do not preserve current InspectorView behavior that says all systems passed merely because there are zero open tickets.

Use:
- No inspection results recorded yet, when no canonical inspection result exists
- No open inspection failures, only after inspection records exist and none are failing

Do not label onTriggerHeartbeat as Run Inspection Sweep unless it genuinely runs an inspection sweep.

Do not preserve ChangeOrderView label Prevented Cost Exposure for unresolved risks.
Use Potential Cost Exposure.

## 4. UI

Compact shell chip examples:
- NEEDS ATTENTION · 3
- 1 BLOCKING
- 1 DECISION

If zero active items:
- show no badge or a subtle No active issues
- do not say All inspections passed unless evidence supports it

## 5. Drawer grouping

Group:
1. Blocking
2. Your decisions
3. Inspection & quality
4. Professional / municipal
5. Coordination
6. Risks

Resolved/history hidden by default.

## 6. Attention item

Show:
- severity
- title
- detail
- status
- blocking badge
- owner-action badge
- related objects
- supported action buttons

Supported actions:
- Focus in world
- Open inspector
- View evidence
- Answer decision if a real intake/decision action exists

Do not display Fix/Approve buttons without backend support.

## 7. 3D integration

If item has relatedEntityIds:
- allow highlight/focus

If item has worldPosition:
- allow camera focus to that point when renderer supports it

No fuzzy matching.

## 8. Owner decision

pendingQuestion is the first real owner-action source.

Opening the item should reuse the existing intake/question workflow if present.
Do not invent a generic approval endpoint.

## 9. Professional / AHJ language

HERMES internal validation must remain clearly separate from:
- licensed professional approval
- municipal/AHJ inspection
- certificate of occupancy

Examples:
HERMES internal validation complete — city inspection still pending.
Licensed professional review required.

## 10. Allowed files

Preferred:
- src/components/immersive/AttentionChip.tsx
- src/components/immersive/AttentionDrawer.tsx
- src/lib/projectAttentionState.ts
- immersive shell integration
- inspector/selection bridge if necessary

Only modify legacy InspectorView / ChangeOrderView if those views remain user-reachable and need truth-label repair.

Do not touch server runtime in ATTENTION-01.

## 11. Acceptance

Pass when:
1. Owner question appears as owner action.
2. Active clash appears and resolved reroute does not.
3. Failed component appears as quality issue.
4. HERMES_VALIDATED does not imply AHJ approval.
5. Pending city inspection appears separately.
6. Pending professional review appears separately.
7. Zero inspection tickets does not claim a pass.
8. Unresolved change risk is Potential Cost Exposure, not prevented cost.
9. Related entities can be inspected/focused when IDs exist.
10. Badge counts exactly match adapter output.

## 12. Stop

Stop after ATTENTION-01.
Do not continue into repair automation, notifications, permitting integrations, or multi-user assignment.