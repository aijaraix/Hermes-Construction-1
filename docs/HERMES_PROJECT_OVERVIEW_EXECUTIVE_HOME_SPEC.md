# HERMES PROJECT OVERVIEW / EXECUTIVE HOME STATE — IMPLEMENTATION SPEC

Status: Source-audited product and implementation architecture
Purpose: Compose the existing truthful HERMES adapters into one immediately understandable project home state inside the immersive 3D workspace.

## 1. Product objective

When a person opens a project, they should understand it in seconds without opening five separate screens.

The project overview must answer:
- What project is this?
- What phase are we in?
- How far along are we?
- What was just completed?
- What is happening now?
- What happens next?
- What changed since I last looked?
- Does anything need my attention?
- What is known about materials and cost?
- Has the detailed schedule actually been calculated?
- What is the current inspection / professional / municipal state?
- What site/jurisdiction facts are actually known?
- What proof supports the summary?

## 2. Existing source truth problems to remove

### ProjectOverviewView
The current view computes verifiedCost as 82% of BOM value. This is fabricated.
It then displays 82% Verified Supplier Quotes and Current Quotes from Local Tampa Suppliers regardless of evidence.

It displays 0 Critical Violations Remaining without deriving that from live canonical quality state.

It labels all changeOrderRisks as Mitigated Risks even when unresolved.

It relies on the fallback DigitalTwinProject environment, which currently hard-codes Tampa jurisdiction, climate, wind, flood, soil and groundwater values.

### App.tsx fallback
The current fallback project initializes multiple scores to 100.0, including structural validation, MEP connectivity, code validation, inspection success, constructability, cost confidence and change-order risk.
These defaults must never power owner-facing project health/readiness claims.

The fallback heartbeat state also defaults unresolvedQuestions, failures, clashes and risk counts to zero and projectScore to 100.0.

### CommandCenterView
The current view falls back to Gemini 3.7 Flash when provider health data is absent and still labels it GATED & ACTIVE.

It also displays 82% Verified quote coverage regardless of evidence.

These developer/system-health concepts should not be part of the default executive project overview.

## 3. Source architecture

The executive overview should compose existing adapters:

- humanProjectStatus.ts
- materialWorkspaceState.ts
- projectTimelineState.ts
- projectAttentionState.ts
- inspectableEntity.ts for drill-down/focus

No duplicate calculations or alternate truth logic.

## 4. Overview sections

Recommended order:

### A. Project identity
- project name
- project/location only when canonical
- current human phase
- overall completion from canonical world state
- live/simulation mode clearly labeled

### B. Done / Doing / Next
Use humanProjectStatus exactly.

### C. Needs Your Attention
Use projectAttentionState exactly.
Show active, blocking and owner-action counts.

### D. What Changed
Use projectTimelineState.whatChanged.
Show unseen count and top recent events.

### E. Materials
Use materialWorkspaceState summary.
Show requirement lines, physical batches, on-site, installed, exceptions and canonical costs when available.

### F. Schedule
Use projectTimelineState.schedule.
If NOT_CALCULATED say so plainly.
If CALCULATED show critical-path duration and activity count.

### G. Quality / approvals
Derived from attention state and live inspection records.
Clearly separate HERMES validation, professional review, AHJ inspection and certificate-of-occupancy status.

### H. Site / jurisdiction
Show only canonical projectParams / jurisdictionTruth / geotechTruth fields that are actually present.
Every field should expose source/truth status where useful.

### I. Evidence
Checkpoint, event count, component count, material batches, inspection count, world-state hash.

## 5. Project identity truth

Use worldState.projectName / projectId.

Location:
Prefer projectParams.location.
If absent, do not fall back to Tampa or any other default in the owner overview.

Mode:
- LIVE_PROJECT → Live Project
- SIMULATION_GYM → Simulation
- REGRESSION_TEST → Test Fixture

Do not hide simulation/test mode behind production-looking UI.

## 6. Cost summary

Allowed owner-facing cost fields:
- canonicalMaterialsCostUSD from costScopeBreakdown.materialsTotalUSD when present
- canonicalTurnkeyCostUSD from costScopeBreakdown.turnkeyTotalUSD when present
- BOM scoped total as a separate label when BOM records exist

Do not derive verified supplier cost percentages.

Suggested states:
- NOT_CALCULATED
- CALCULATED

If costScopeBreakdown is absent:
Turnkey estimate not yet calculated.

## 7. Quality summary

Show:
- inspection result count
- active inspection failure count
- active clash count
- failed component count
- professional review pending count
- AHJ pending count

If inspection result count = 0:
No inspection results recorded yet.

Do not show 0 critical violations remaining unless the relevant quality gates have actually executed and support that statement.

## 8. Site / jurisdiction summary

Possible fields when canonical:
- user-provided location
- geocoded jurisdiction
- code edition
- wind criteria
- flood zone / base flood elevation
- climate zone
- soil class
- bearing capacity
- groundwater
- foundation selected

Each field should retain origin/status:
- VERIFIED_SOURCE
- USER_INPUT
- SIMULATION_FIXTURE
- UNVERIFIED
- VERIFIED_IMPORT
- USER_ASSUMPTION
- SIMULATION_DEFAULT

Do not present SIMULATION_FIXTURE as verified field data.

## 9. Overview interaction

The overview is not a permanent dashboard taking screen space.

It opens as a compact internal workspace/drawer over the 3D world.

Cards/rows should link to:
- attention drawer
- timeline / What Changed
- materials
- schedule
- inspector
- affected objects/locations

Closing returns to unobstructed world.

## 10. Default shell summary

Even when overview is closed, the immersive shell can show:
- phase
- completion
- current work
- attention count
- What Changed count

Everything else remains on demand.

## 11. Readiness/score policy

Do not display an overall project score or readiness score unless there is a canonical current calculation with documented fields and provenance.

Current App.tsx fallback 100.0 scores are presentation defaults, not project truth.

## 12. Developer health separation

Reasoning provider, quota, runtime, model name, queue health and Academy health belong in Developer/System area.

Do not put model-provider health in the owner/project overview unless provider failure is actively blocking the project, in which case it can appear as an attention item backed by canonical runtime state.

## 13. First implementation slice — OVERVIEW-01

Implement:
- projectOverviewState adapter
- compact Project Overview internal workspace
- identity / phase / completion
- Done / Doing / Next
- Needs Attention counts and top items
- What Changed counts and top events
- materials summary
- schedule summary
- cost truth state
- quality/approval truth state
- canonical site/jurisdiction facts
- evidence footer

Defer:
- charts
- predictive analytics
- historical trend graphs
- KPI scoring
- customer presentation mode
- AI-written executive narrative

## 14. Acceptance

A first-time owner can open Project Overview and answer within 30 seconds:
1. What project is this?
2. Is it live, simulation or test?
3. What stage is it in?
4. What percent is complete?
5. What was just completed?
6. What is happening now?
7. What happens next?
8. What changed since last view?
9. What needs attention?
10. What material/cost/schedule/inspection information is actually known?

No fallback default may be presented as verified project truth.