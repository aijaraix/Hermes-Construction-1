# HERMES OVERVIEW-01 — EXACT IMPLEMENTATION TICKET

Status: Ready for future bounded implementation
Purpose: Replace the current dashboard-style Project Overview with one truthful immersive executive home state composed from canonical adapters.

## 1. Read first

- docs/HERMES_PROJECT_OVERVIEW_EXECUTIVE_HOME_SPEC.md
- src/lib/projectOverviewState.ts
- src/lib/humanProjectStatus.ts
- src/lib/projectAttentionState.ts
- src/lib/projectTimelineState.ts
- src/lib/materialWorkspaceState.ts
- docs/HERMES_HUMAN_OBSERVABILITY_PROJECT_CONTROL_ARCHITECTURE.md

## 2. Scope

Implement OVERVIEW-01 only.

Create a Project Overview internal workspace/drawer that opens over the 3D world.

Required:
- project identity / mode / location if known
- phase / completion
- Done / Doing / Next
- Needs Attention counts / top items
- What Changed count / top events
- Materials summary
- Schedule state
- Cost state
- Quality / approvals summary
- Site / jurisdiction facts
- Evidence footer

Do not build charts, predictions or new scoring.

## 3. Truth repairs

Do not preserve:
- 82% verified quote assumptions
- computed verifiedCost = totalCost * 0.82
- 0 Critical Violations Remaining unless proven
- Mitigated Risks label for unresolved risks
- fallback 100/100 project/readiness score
- fallback Tampa environmental facts as live truth
- fallback Gemini provider health in project overview

Unknown remains unknown.

## 4. UI structure

Suggested:

Header:
- project name
- mode badge: Live Project / Simulation / Test Fixture
- canonical location when known
- phase
- completion

Primary row:
- Done
- Doing
- Next

Attention:
- active / blocking / your decisions
- top 3 items
- Open all

What Changed:
- unseen count
- top 3 recent unseen canonical events
- Replay

Materials / Cost / Schedule / Quality:
- compact linked cards
- each card opens its dedicated internal workspace

Site facts:
- show canonical facts with truth-origin badges when useful

Evidence footer:
- checkpoint
- event count
- component count
- material batch count
- inspection count
- world hash truncated visually but full on copy/details

## 5. Cost states

If projectOverviewState.cost.state = NOT_CALCULATED:
show Turnkey estimate not yet calculated.

If available:
- show canonical turnkey total
- canonical material total
- BOM scoped total separately

Do not invent supplier verification coverage.

## 6. Schedule states

If NOT_CALCULATED:
show Detailed construction schedule not yet calculated.

If CALCULATED:
- activity count
- critical path duration when available
- critical activity count

## 7. Quality states

If no inspection records:
No inspection results recorded yet.

If HERMES checks exist but external review/AHJ remains:
HERMES checks recorded; external approvals remain.

If failures/clashes exist:
Quality issues require attention.

Never collapse professional/AHJ status into HERMES internal validation.

## 8. Site truth

Do not read owner-facing site data from the current defaultFallbackProject.

Use projectOverviewState.site only.

Simulation fixture facts must be visibly labeled as simulation/fixture origin.

## 9. Interaction

Card clicks:
- Attention → Attention drawer
- What Changed → What Changed drawer/timeline
- Materials → Materials workspace
- Schedule → Timeline/schedule workspace
- Quality → Attention filtered to quality/approval
- Site fact → optional technical inspector/details

No page navigation away from the project world.

## 10. Allowed files

Preferred:
- src/components/immersive/ProjectOverviewWorkspace.tsx
- src/lib/projectOverviewState.ts
- immersive workspace registry/shell integration

Legacy ProjectOverviewView can remain until physical acceptance.

Do not touch server runtime in OVERVIEW-01.

## 11. Acceptance

Pass when:
1. Project Overview opens over the world.
2. No hard-coded score/quote percentage is visible.
3. Live/simulation/test mode is clear.
4. Done/Doing/Next exactly matches adapter.
5. Attention counts match adapter.
6. What Changed count matches adapter.
7. Missing cost/schedule says not calculated.
8. Quality empty state does not claim pass without evidence.
9. Site fields come only from canonical state and preserve truth origin.
10. Closing overview returns to unobstructed world.

## 12. Stop

Stop after OVERVIEW-01.
Do not continue into charts, AI narratives, customer mode, or predictive project scoring.