# HERMES FND-05 SOURCE AUDIT — PROVIDER-NEUTRAL AI CAPABILITY ROUTER & AI PROVENANCE

**Audit basis:** remote `main` at `bbc90702a7d62a0092dc2dd914901743c23ec8b5`, plus completed local foundation lineage:

- FND-01 `194ad4473d0e8768cd7f1db34d7e1713447153dd`
- FND-02 `67d592381bd66c0bb2aa3d14361bbc5aed904867`
- FND-03 `e478120c9de0489ab9ef48dbf57df1bf15d24398`
- FND-04 `08183ab87522f167ed32f75c692dcafac5e11008`

**Important limitation:** those implementation branches are local to Codex and not directly inspectable through this GitHub connector. FND-05 must preserve their implemented contracts exactly.

## Executive finding

HERMES already contains several important AI-governance primitives:

- `ConstructionReasoningProvider` abstraction;
- `GeminiReasoningProvider`;
- deterministic simulation fallback;
- `AgentExecutionService`;
- `AgentExecutionRecord`;
- provider/model/usage/citation/prompt-hash fields;
- quota/failover tracking;
- deferred reasoning queue;
- deterministic validators;
- manager-review gating;
- explicit distinction between LLM execution and deterministic simulation;
- explicit current truth that direct actuator control is not implemented.

The main problem is that the architecture is only **partially provider-neutral**.

The current execution path still effectively looks like:

```text
AgentExecutionService
      ↓
new GeminiReasoningProvider()
      ↓
Gemini-specific model/fallback logic
```

That means HERMES has a provider interface, but not yet a **capability router**.

The correct FND-05 implementation is therefore evolutionary, not a rewrite.

---

# 1. Current provider abstraction exists but is not the architecture

`server/reasoningProvider.ts` defines:

`ConstructionReasoningProvider`

with:

- providerName
- modelName
- generateReasoning(...)

This is useful.

However `AgentExecutionService` currently hardcodes:

```ts
private static provider = new GeminiReasoningProvider();
```

Therefore callers are still indirectly tied to one concrete provider.

## FND-05 requirement

Construction-domain callers should ask for:

**capability + constraints**

not:

provider/model.

---

# 2. Model selection is provider-specific and hardcoded

`GeminiReasoningProvider` currently embeds:

- primary model
- fallback model list

and `QuotaIntegrityEngine.FAILOVER_POLICY` also embeds Gemini model names.

This creates duplicated model-market policy.

### Risk

Temporary provider/model choices can leak into:

- competency logic;
- failover policy;
- tests;
- UI/status;
- Academy readiness.

### FND-05 rule

Model names belong in provider adapter/config/evaluation data.

Construction-domain logic should not depend on:

- Gemini
- a specific model version
- model ranking order

except through router policy.

---

# 3. Current reasoning provider interface is too narrow

The existing interface is centered on one reasoning task.

A production capability router needs provider declarations for:

- capability keys
- local/remote
- supported modalities
- structured output
- tool calling
- streaming if relevant
- context limits
- privacy/data boundary
- availability
- estimated latency/cost
- model/version identity

Do not overbuild all modalities now.

Implement the contract even if only one existing adapter is active.

---

# 4. Current AgentExecutionRecord is a strong starting point

Existing execution records already capture:

- execution ID
- agent role
- execution mode
- model provider
- model name
- scenario
- knowledge pack
- retrieved chunks
- prompt hash
- raw response
- structured proposal
- citations
- tool calls
- timestamps
- usage metadata
- response status
- execution status

This should be adapted into the canonical `AiRun` model rather than replaced.

### Missing/weak fields for FND-05

Add or derive:

- capability requested
- routing policy decision
- provider adapter ID
- model version if distinct
- local/remote classification
- privacy class / local-only constraint
- input evidence refs
- output claim/artifact refs
- validation outcome
- fallback reason/path
- estimated/actual cost if available
- approval status
- project/revision context

Do not store hidden chain-of-thought.

---

# 5. Current provider fallback semantics mix several concepts

Today the provider layer can produce execution modes such as:

- LLM_REASONED
- DETERMINISTIC_SIMULATION
- DEFERRED_QUOTA
- FAILED_PROVIDER
- EXECUTION_DEFERRED_NO_PROVIDER

These distinctions are valuable.

But fallback is still implemented mostly inside the Gemini adapter.

## FND-05 rule

Separate:

1. provider adapter execution
2. router policy
3. fallback policy
4. deterministic Tier-0 bypass
5. simulation/test fallback

A provider should report capability/health/result.

The router should decide whether another provider/model is eligible.

---

# 6. Deterministic Tier-0 path must bypass AI completely

HERMES already contains deterministic:

- geometry
- quantities
- validators
- rules
- hashing
- unit conversion
- scheduling/CPM concepts
- safety/review gates

FND-05 should formalize:

`tier = DETERMINISTIC`

for tasks that do not require AI.

### Important

Do not route deterministic math through a model for convenience.

Do not record a fake AI run for a deterministic calculation.

Record a deterministic execution/provenance record if needed, but do not label it AI.

---

# 7. Capability keys should be stable and provider-neutral

Recommended initial keys:

- `reasoning.standard`
- `reasoning.high`
- `document.extract`
- `vision.construction`
- `code`
- `embedding`
- `rerank`
- `ocr`
- `speech.realtime`
- `local.private`

Only implement routing logic for capabilities currently exercised.

Unknown/unimplemented capabilities should fail clearly or remain unregistered.

Do not silently map everything to Gemini text reasoning.

---

# 8. Agent architecture is already role/context based

HERMES `AgentContract` already carries:

- role ID/name
- discipline
- responsibilities
- inputs/outputs
- tools
- knowledge domains
- consultation limits
- escalation rules
- curriculum

That is exactly the right basis for shared-model routing.

## FND-05 rule

Role != model.

A structural agent, procurement agent and scheduler may request different capabilities/policies while sharing providers/model pools.

Do not create one permanent model process per role.

---

# 9. QuotaIntegrityEngine is useful but too provider-specific

Current quota infrastructure already tracks:

- provider attempts
- errors
- deferred queue
- replay
- failover policy

This is useful.

But `ProviderFailoverPolicy` currently carries concrete model tiers rather than provider-neutral capability policy.

### Recommendation

Preserve current quota/deferred mechanics.

Refactor the policy layer to express:

- capability
- eligible providers
- privacy/local-only constraints
- retryability
- fallback order
- whether simulation fallback is allowed
- maximum attempts/backoff

Do not delete existing historical records.

---

# 10. ReasoningGatingEngine overlaps router responsibility

`ReasoningGatingEngine` currently reports a deferred provider status and routes certain requests into deterministic execution semantics.

This was useful during provider-disabled phases.

FND-05 must avoid creating two independent routing authorities.

### Recommendation

Retain it as:

- compatibility/governance adapter
- policy source

but make the new router the single execution selection point for new capability requests.

Do not let both modules make conflicting provider-selection decisions.

---

# 11. ReasoningBudgetManager should influence routing, not own provider identity

Current budget manager distinguishes work types and tracks deterministic vs LLM activity.

This is useful.

FND-05 can use it as an input to policy:

- deterministic available?
- grounded reuse available?
- LLM needed?
- budget/priority?

But the budget manager should not hardcode provider/model identity.

---

# 12. Existing manager/validator boundary is worth preserving

`ManagerReviewService` already enforces that:

- failed/non-executed reasoning cannot be treated as genuine approval;
- critical deterministic validator failures cannot be overridden;
- professional review is required at hard boundaries.

FND-05 must preserve these rules.

### Important

A more capable model must not gain authority merely because the router selected it.

Routing changes capability access, not approval authority.

---

# 13. FND-02 promotion boundary already solves AI truth promotion

FND-02 established:

AI/model inference = proposal/claim until promoted.

FND-05 must integrate rather than duplicate that.

Recommended:

```text
AiRun
  ↓
structured output
  ↓
MODEL_INFERENCE Claim(s)
  ↓
validator / evidence / review
  ↓
FND-02 promotion
  ↓
canonical truth
```

Do not allow router/provider code to mutate canonical project truth directly.

---

# 14. Tool calls are currently mostly empty

`AgentExecutionRecord.toolCalls` exists, but current `AgentExecutionService` populates:

`toolCalls: []`

for the observed reasoning path.

FND-05 should create a structured tool-call contract now.

Minimum:

- tool call ID
- tool name
- capability/permission scope
- input hash or bounded input summary
- started/completed timestamps
- status
- output/evidence/artifact refs
- error summary

Do not store secrets.

Do not store hidden chain-of-thought.

---

# 15. Prompt provenance is partial

Current execution records store `promptHash`, which is valuable.

However useful audit also needs:

- task contract/schema version
- role policy version
- evidence/context references
- capability requested

Do not require full raw system prompt retention if privacy/security policy disallows it.

Hash/version/reference is sufficient for many audit needs.

---

# 16. Usage metadata exists but cost is not normalized

Gemini response usage metadata is recorded.

Fallback estimates may be synthesized from string length.

FND-05 should distinguish:

- PROVIDER_REPORTED
- ESTIMATED
- UNKNOWN

for usage/cost metadata.

Do not present estimated token/cost numbers as provider-reported fact.

---

# 17. Local model support is currently conceptual/test-oriented

The source audit found references to:

- LocalReasoningEngine in tests/docs
- deterministic simulator
- local solver labels

but no production local-model runtime/weights infrastructure.

FND-05 should add the adapter contract and registration seam only.

No model weights.

No local inference server deployment.

A local-only request with no eligible local provider must fail/defer.

It must never silently route remote.

---

# 18. Privacy/local-only constraint must be hard

Required request constraint:

`localOnly: true`

or equivalent.

Router behavior:

- filter out remote providers before scoring;
- if no eligible local provider remains, return explicit NO_ELIGIBLE_PROVIDER / DEFERRED_LOCAL_PROVIDER;
- do not fall back remote.

This must be tested.

---

# 19. Capability quality/evaluation should be configuration, not source-code folklore

Do not encode temporary claims like:

“model X is best for structural reasoning”

inside domain code.

Router may use provider registration metadata/evals.

The initial FND-05 pass can use static configuration records.

Future evaluation infrastructure can replace them.

---

# 20. Robotics safety boundary must become explicit code contract

The source audit confirms:

- RobotReadySpatialContract exists;
- current hardware control is marked PLANNED;
- ROS2/direct actuator control is not implemented.

FND-05 must formalize:

**AI output cannot directly emit an actuator command through the router.**

Required boundary:

```text
AI proposal
→ deterministic validation
→ authorization
→ execution contract
→ local planner/controller
→ independent safety system
→ actuator
```

The router/tool registry must not expose actuator/CAN/hydraulic/motor tools.

Future control adapters belong beyond a deterministic authorization boundary.

---

# 21. Safety-critical capability should require policy escalation

Capabilities involving:

- safety
- structural/life safety
- professional approval
- machine execution

must carry a policy result such as:

- ALLOWED_AS_PROPOSAL
- REQUIRES_DETERMINISTIC_VALIDATION
- REQUIRES_HUMAN_REVIEW
- REQUIRES_PROFESSIONAL_REVIEW
- DENIED

The selected model/provider does not change this policy.

---

# 22. Recommended new modules

Likely:

- `server/ai/capabilities.ts`
- `server/ai/provider.ts`
- `server/ai/providerRegistry.ts`
- `server/ai/capabilityRouter.ts`
- `server/ai/policy.ts`
- `server/ai/aiRun.ts`
- `server/ai/providers/geminiAdapter.ts`

Exact paths may follow repo conventions.

Keep compatibility exports where safer.

---

# 23. Gemini adapter migration

Existing `GeminiReasoningProvider` behavior should become an adapter.

Preserve:

- structured JSON output
- citation extraction
- quota attempt logging
- model fallback behavior where still policy-authorized
- execution-mode truth
- error/deferred paths

But move provider selection out of `AgentExecutionService`.

Do not delete existing behavior until compatibility tests pass.

---

# 24. AgentExecutionService target

Target:

```text
AgentExecutionService
  ↓
request capability + constraints
  ↓
CapabilityRouter
  ↓
selected ProviderAdapter
  ↓
AiRun / result
  ↓
deterministic validation
  ↓
FND-02 Claim proposal
```

The service should not instantiate a concrete provider.

---

# 25. FND-03 persistence integration

FND-03 planned future `ai_run` / AI tables but did not necessarily implement them.

FND-05 may add a new immutable migration such as:

`0003_ai_runs.sql`

only if narrow and consistent with the implemented FND-03 repository pattern.

Do not edit 0001/0002 migration contents.

Potential tables:

- ai_runs
- ai_tool_calls
- ai_run_inputs / refs
- ai_run_outputs / refs

Keep claim/evidence canonical ownership in existing FND-02/FND-03 tables.

---

# 26. No hidden chain-of-thought persistence

Do not add fields intended to store:

- hidden reasoning tokens
- private chain-of-thought
- model scratchpad

Persist:

- structured output
- cited evidence
- tool calls
- validation results
- policy decisions
- prompt/task hashes/versions
- provider/model/version

---

# 27. Provider health/fallback semantics

Required explicit outcomes:

- SELECTED
- NO_ELIGIBLE_PROVIDER
- LOCAL_ONLY_UNAVAILABLE
- PROVIDER_UNAVAILABLE
- RATE_LIMITED_DEFERRED
- FALLBACK_SELECTED
- POLICY_DENIED

Do not collapse every failure into generic API_ERROR.

---

# 28. Backward compatibility

Preserve old APIs and historical execution records.

Where possible:

- keep `ConstructionReasoningProvider` as a compatibility interface or alias;
- keep `GeminiReasoningProvider` export during transition;
- adapt old `executeAgentScenario()` callers to default capability `reasoning.standard`.

Do not migrate every AI call site in one pass.

Focus on the central execution path.

---

# 29. Tests must distinguish simulation from AI

Existing deterministic simulator is useful.

It must remain:

- simulation/test fallback
- non-certifying where current rules require real reasoning
- visibly distinct in AiRun

Do not allow simulator output to be reported as remote/local AI model execution.

---

# 30. FND-05 conclusion

The correct implementation is:

1. keep current provider behavior through an adapter;
2. add provider registry + capability router;
3. make AgentExecutionService request capabilities;
4. formalize deterministic Tier 0 bypass;
5. enforce local-only/privacy constraints;
6. record canonical AiRun provenance;
7. connect AI output to FND-02 claims;
8. preserve validator/manager/professional gates;
9. prohibit LLM→actuator paths;
10. stop before deploying local models or robotics.

This completes the foundation hardening program.
