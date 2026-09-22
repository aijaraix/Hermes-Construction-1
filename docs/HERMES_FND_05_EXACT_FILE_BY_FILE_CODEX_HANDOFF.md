# HERMES FND-05 — EXACT FILE-BY-FILE CODEX IMPLEMENTATION HANDOFF

**Controlling ticket:** `docs/HERMES_FND_05_AI_CAPABILITY_ROUTER_AND_AI_PROVENANCE.md`

**Required audit:** `docs/HERMES_FND_05_SOURCE_AUDIT.md`

**Required compatibility matrix:** `docs/HERMES_FND_05_COMPATIBILITY_TEST_MATRIX.md`

## Physical prerequisite lineage

FND-01:

`194ad4473d0e8768cd7f1db34d7e1713447153dd`

FND-02:

`67d592381bd66c0bb2aa3d14361bbc5aed904867`

FND-03:

`e478120c9de0489ab9ef48dbf57df1bf15d24398`

FND-04:

`08183ab87522f167ed32f75c692dcafac5e11008`

FND-05 must be implemented on top of all four.

If FND-04 is unavailable locally, STOP.

Do not implement from old remote `main`.

---

# FIRST

1. Verify all four prerequisite commits are ancestors of HEAD.
2. Fetch CURRENT remote `main`.
3. Record `git status --short`.
4. Preserve all legitimate newer work.
5. Preserve visual commit `c1acf19`.
6. Preserve the eight runtime-generated modified files exactly.
7. Preserve protected BIM/reference fixtures.
8. Fetch planning branch:
   `planning/hermes-control-layer-2026-09-18`.
9. Read only:
   - FND-05 exact handoff
   - FND-05 source audit
   - FND-05 compatibility matrix
   - FND-05 architecture ticket
   - foundation hardening master

Do not merge the planning branch.

---

# OBJECTIVE

Implement FND-05 only:

PROVIDER-NEUTRAL CAPABILITY ROUTER
+
PROVIDER REGISTRY
+
CAPABILITY/PRIVACY POLICY
+
DETERMINISTIC TIER-0 BYPASS
+
EXISTING GEMINI BEHAVIOR AS ADAPTER
+
LOCAL-PROVIDER CONTRACT
+
AI RUN PROVENANCE
+
TOOL-CALL PROVENANCE
+
FND-02 CLAIM PROMOTION INTEGRATION
+
EXPLICIT NO LLM→ACTUATOR BOUNDARY

Do not deploy local model weights.

Do not implement robotics control.

Do not redesign UI.

---

# CURRENT SOURCE REALITY

Existing:

`ConstructionReasoningProvider`

`GeminiReasoningProvider`

`AgentExecutionService`

`AgentExecutionRecord`

`QuotaIntegrityEngine`

`ReasoningBudgetManager`

`ReasoningGatingEngine`

`ManagerReviewService`

deterministic validators

deterministic simulator

The architecture is PARTIALLY provider-neutral.

Critical hardcoded path today:

```ts
AgentExecutionService
  → new GeminiReasoningProvider()
```

FND-05 removes that coupling.

---

# CAPABILITY CONTRACT

Create provider-neutral capability keys.

Minimum initial set:

```text
reasoning.standard
reasoning.high
document.extract
vision.construction
code
embedding
rerank
ocr
speech.realtime
local.private
```

Only some may have providers registered now.

Unregistered capability must fail clearly.

Do not map every capability to text reasoning.

---

# AI TIER CONTRACT

Add explicit tiers:

```text
TIER_0_DETERMINISTIC
TIER_1_LOCAL_SMALL
TIER_2_LOCAL_LARGE
TIER_3_REMOTE_FRONTIER
HUMAN_PROFESSIONAL
```

Exact enum names may vary.

The router must be capable of returning:

DETERMINISTIC_BYPASS

for Tier-0 tasks.

Do not call a model when deterministic execution satisfies the request.

---

# NEW PROVIDER CONTRACT

Create something equivalent to:

`AiProviderAdapter`

Required provider metadata:

- provider ID
- adapter ID/version
- local or remote
- supported capabilities
- supported modalities
- structured-output support
- tool-call support
- streaming support where relevant
- context limit if known
- privacy classification
- model descriptors
- availability/health
- cost/latency metadata where known

Required execution method should accept:

- capability
- role/policy context
- structured output schema
- evidence/context refs or bounded content
- tool permissions
- privacy/local-only constraints
- timeout/budget hints

Do not bake construction roles into provider adapter logic.

---

# PROVIDER REGISTRY

Create:

`ProviderRegistry`

Responsibilities:

- register adapters
- enumerate eligible providers by capability
- report provider health/capabilities
- never instantiate provider based on construction role name

Register existing Gemini behavior through:

`GeminiProviderAdapter`

or equivalent.

Keep compatibility export for `GeminiReasoningProvider` if current callers/tests need it.

---

# CAPABILITY ROUTER

Create:

`CapabilityRouter`

Inputs:

- capability
- tier preference/constraint
- localOnly
- privacy class
- structured-output required?
- tools required?
- max latency/cost if provided
- fallback policy
- project/tenant provider policy if available

Outputs:

- routing decision
- selected provider/model
- fallback path
- policy decision
- failure reason if none eligible

Router decisions must be deterministic given same registered provider state/policy inputs.

---

# HARD LOCAL-ONLY RULE

If request says:

`localOnly = true`

remote providers MUST be filtered out before scoring.

If no local provider supports the capability:

return explicit:

`LOCAL_ONLY_UNAVAILABLE`

or equivalent.

Do NOT silently route to Gemini or any remote provider.

---

# GEMINI ADAPTER

Move/adapt current `GeminiReasoningProvider` behavior into provider adapter architecture.

Preserve:

- provider calls
- structured JSON output
- citation extraction
- usage metadata
- quota attempt records
- error handling
- model identity
- execution-mode truth

Move model/fallback selection under router/policy ownership where practical.

Do not leave two independent fallback authorities.

---

# MODEL CONFIGURATION

Remove model-market choices from construction-domain logic.

Model identifiers may exist in:

- provider adapter config
- provider registration metadata
- explicit test fixtures

They must not be embedded in:

- structural agent code
- procurement logic
- scheduler logic
- construction-domain services

---

# AGENT EXECUTION SERVICE

Refactor:

`AgentExecutionService`

so it does NOT instantiate:

`new GeminiReasoningProvider()`

Instead:

1. determine/request capability
2. ask CapabilityRouter
3. execute selected adapter
4. produce AiRun
5. create legacy-compatible AgentExecutionRecord
6. run existing deterministic validators
7. convert output to FND-02 MODEL_INFERENCE claim(s) where appropriate

Default compatibility for existing scenario caller:

`reasoning.standard`

unless explicit policy requests higher capability.

---

# DETERMINISTIC TIER-0

Implement an explicit bypass seam.

For deterministic capabilities:

- no provider selection
- no AI provider call
- no fake AiRun claiming model execution

If an audit record is created, classify it as deterministic execution, not AI.

Test this.

---

# AI RUN CONTRACT

Create canonical `AiRun`.

Minimum:

- runId
- projectId optional where Academy-only execution has no project
- project revision ID optional
- agent/role ID
- capability
- tier
- provider
- model
- model version optional
- adapter version
- local/remote
- input evidence refs
- retrieved chunk/source refs
- task/prompt/schema hash/version
- tool calls
- output claim refs
- output artifact refs
- startedAt
- completedAt
- usage metadata
- usage source: PROVIDER_REPORTED | ESTIMATED | UNKNOWN
- estimated/actual cost optional
- routing policy decision
- fallback path
- validation status/result ref
- approval status
- execution status

Do NOT add hidden chain-of-thought fields.

---

# LEGACY AGENTEXECUTIONRECORD

Preserve existing `AgentExecutionRecord`.

Add compatibility adapter:

`AiRun → AgentExecutionRecord`

and/or:

`AgentExecutionRecord → AiRun`

as needed.

Do not break current Academy screens/tests that consume:

- modelProvider
- modelName
- promptHash
- rawResponse
- structuredProposal
- citations
- executionMode

---

# TOOL CALL CONTRACT

Create structured `AiToolCall`.

Minimum:

- toolCallId
- runId
- toolName
- permissionScope
- inputHash or bounded input summary
- startedAt
- completedAt
- status
- output evidence/artifact refs
- error summary

No secrets.

No hidden scratchpad.

No unrestricted filesystem/shell/network tool registration.

---

# TOOL POLICY

Provider tool-calling must only access an allowlisted tool registry.

Tool permissions must come from:

- capability policy
- agent role policy
- project policy

Do not let model output invent new executable tool names.

Unknown tool request = denied.

---

# ROBOTICS / ACTUATOR HARD BOUNDARY

The AI router/tool registry MUST NOT expose:

- CAN bus control
- hydraulic control
- motor command
- actuator command
- ROS2 actuator publisher
- direct equipment control

Formalize boundary equivalent to:

```text
AI proposal
→ deterministic validator
→ authorization
→ RobotReady/Spatial Execution Contract
→ local planner/controller
→ independent safety system
→ actuator
```

Add a test proving no AI provider/tool path can directly produce or invoke an actuator tool.

Do not implement downstream robotics runtime.

---

# FND-02 CLAIM INTEGRATION

Meaningful AI structured output should become:

`MODEL_INFERENCE`

Claim proposal(s).

Default claim status:

`PROPOSED`

or equivalent from FND-02.

The router/provider MUST NOT promote the claim to VERIFIED.

Promotion remains governed by FND-02 policy.

---

# PROFESSIONAL / SAFETY POLICY

Add policy outcomes equivalent to:

- ALLOWED
- ALLOWED_AS_PROPOSAL
- REQUIRES_DETERMINISTIC_VALIDATION
- REQUIRES_HUMAN_REVIEW
- REQUIRES_PROFESSIONAL_REVIEW
- DENIED

Safety/life-safety/structural/professional/machine-execution tasks may require stronger outcomes.

A higher-capability model does not bypass review.

---

# QUOTA / FAILOVER

Preserve existing deferred queue and quota attempt records.

Refactor failover policy to operate on:

capability
+
eligible provider adapters
+
constraints

rather than hardcoded Gemini tier model names in domain logic.

Provider adapter may still advertise model options.

Router/policy chooses eligible fallback.

Simulation fallback must remain explicitly:

SIMULATION

and retain current non-certification restrictions.

---

# REASONINGGATINGENGINE

Do not delete it.

Convert it to compatibility/governance input if possible.

The new CapabilityRouter should be the single provider-selection authority for new execution paths.

Avoid two modules independently choosing provider/model.

---

# REASONINGBUDGETMANAGER

Preserve it.

Use outputs as routing policy inputs:

- deterministic available
- grounded reuse available
- priority
- budget
- whether model reasoning is actually required

Do not let it select provider/model directly.

---

# USAGE / COST TRUTH

Normalize usage metadata source:

PROVIDER_REPORTED
ESTIMATED
UNKNOWN

Current fallback token estimates must be labeled ESTIMATED.

Do not present estimate as exact provider usage.

Cost metadata can remain null/unknown if provider does not report it.

Do not fabricate dollar costs.

---

# LOCAL MODEL SUPPORT

Create provider adapter contract/registration seam for local models.

Do not deploy weights.

Do not add model files to Git.

A test local adapter/fake may be used.

Local-only request with no local registered adapter must fail explicitly.

---

# FND-03 PERSISTENCE

If narrow and consistent with FND-03, add immutable migration:

`0003_ai_runs.sql`

DO NOT edit:

0001_foundation.sql
0002_openbim.sql

Potential tables:

- ai_runs
- ai_tool_calls
- ai_run_input_refs
- ai_run_output_refs

Reuse:

- sources
- evidence
- claims
- artifacts
- events

Do not duplicate canonical claim/evidence storage.

If test PostgreSQL is unavailable:

report:

NOT RUN — DATABASE UNAVAILABLE

Do not fake persistence acceptance.

---

# TEST PROVIDERS

Create deterministic fake adapters for tests, e.g.:

RemoteReasoningTestProvider

LocalPrivateTestProvider

FailedProvider

Do not call real external APIs in unit tests.

Provider selection/failover tests must be deterministic.

---

# REQUIRED FND-05 TESTS

Create focused tests, e.g.:

`server/__tests__/fnd05_ai_capability_router.test.ts`

Required:

### ROUTE-01
construction caller requests capability, not provider/model name.

### ROUTE-02
provider adapter can be swapped without changing AgentExecutionService caller.

### ROUTE-03
unsupported capability fails explicitly.

### LOCAL-01
localOnly request never routes to remote provider.

### LOCAL-02
localOnly with no local provider returns LOCAL_ONLY_UNAVAILABLE.

### TIER0-01
deterministic Tier-0 request bypasses provider execution.

### FALLBACK-01
failed eligible provider follows explicit fallback policy.

### FALLBACK-02
policy can prohibit fallback.

### SIM-01
simulation fallback remains visibly SIMULATION and non-certifying.

### RUN-01
AiRun records capability/provider/model/localRemote/evidence/usage/policy.

### RUN-02
provider-reported vs estimated usage is distinguishable.

### TOOL-01
allowlisted tool call is recorded.

### TOOL-02
unknown tool request is denied.

### SAFETY-01
no actuator/direct machine-control tool is registrable through AI tool registry.

### CLAIM-01
AI output produces MODEL_INFERENCE PROPOSED claim.

### CLAIM-02
AI provider/router cannot directly promote claim to VERIFIED.

### REVIEW-01
professional-review policy remains required where configured.

### COMPAT-01
existing GeminiReasoningProvider behavior remains available through adapter/compatibility export.

### PERSIST-01
when Postgres available, AiRun/tool-call refs round-trip without duplicating claim/evidence ownership.

---

# REGRESSION

Run:

FND-05 focused tests

FND-04 tests

FND-03 tests

FND-02 tests

FND-01 tests

Academy House vertical slice

Phase-1 visual-gate regression

genuine-agent-reasoning tests

quota/failover tests

manager-review tests

TypeScript typecheck

production build

Do not require real Gemini credentials for unit test success.

If live provider credentials are absent, report live-provider integration as NOT RUN.

---

# RUNTIME FILE PROTECTION

Preserve the eight runtime-generated modified files exactly.

Preserve protected BIM/reference fixtures.

No test may commit or reset them.

If test execution mutates them, restore exact pre-test local bytes.

---

# BRANCH

Create:

`feature/hermes-fnd-05-ai-capability-router`

from FND-04 commit:

`08183ab87522f167ed32f75c692dcafac5e11008`

History must include FND-01 through FND-04.

Do not merge to main.

---

# NON-GOALS

DO NOT:

- deploy local model weights
- benchmark every model
- replace every AI call site
- implement robotics runtime
- expose actuator tools
- store chain-of-thought
- implement HX
- redesign UI
- cut over PostgreSQL
- deploy production model gateway
- add provider credentials to source
- change Academy geometry
- change visual coordinates

---

# FINAL REPORT

Return exactly:

```text
FND05_COMPLETE

CURRENT_REMOTE_MAIN:
FND01_COMMIT:
FND02_COMMIT:
FND03_COMMIT:
FND04_COMMIT:
IMPLEMENTATION_BRANCH:
IMPLEMENTATION_COMMIT:

FILES_CHANGED:

CAPABILITY_CONTRACT:
PROVIDER_REGISTRY:
CAPABILITY_ROUTER:
GEMINI_ADAPTER:
LOCAL_PROVIDER_SEAM:
DETERMINISTIC_TIER0:
AI_RUN_PROVENANCE:
TOOL_CALL_PROVENANCE:
CLAIM_INTEGRATION:
SAFETY_BOUNDARY:

MIGRATION:
POSTGRES_INTEGRATION:
LIVE_PROVIDER_INTEGRATION:

FND05_TESTS:
FND04_REGRESSION:
FND03_REGRESSION:
FND02_REGRESSION:
FND01_REGRESSION:
ACADEMY_HOUSE:
VISUAL_GATE:
REASONING_REGRESSION:
QUOTA_REGRESSION:
TYPECHECK:
BUILD:

RUNTIME_FILES:
REFERENCE_FILES:

KNOWN_REMAINING_AI_GAPS:

FOUNDATION_HARDENING_STATUS:

TRUTH_LABEL:
IMPLEMENTED — NOT PHYSICALLY VERIFIED
```

STOP after FND-05.
