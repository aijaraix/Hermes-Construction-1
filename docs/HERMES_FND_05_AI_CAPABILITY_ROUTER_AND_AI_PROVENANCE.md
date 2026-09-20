# HERMES FND-05 — PROVIDER-NEUTRAL AI CAPABILITY ROUTER & AI PROVENANCE

## Objective

Decouple construction logic and agent roles from a single AI provider/model.

HERMES should request a **capability**, not a hardcoded model.

## Target tiering

- **Tier 0 — deterministic:** geometry, CPM, quantities, permissions, safety vetoes, unit conversion, hashes, rules.
- **Tier 1 — small/local:** extraction, classification, low-cost summarization, offline assistance.
- **Tier 2 — larger/local:** private document reasoning / stronger offline planning.
- **Tier 3 — remote frontier:** difficult multidisciplinary reasoning, coding, multimodal analysis, agentic research.
- **Human/professional:** licensed judgment, safety-critical exceptions, contractual/project authorization.

The router must never use AI when deterministic truth is sufficient.

## Capability contract

Initial capability keys should be provider-neutral, for example:

```text
reasoning.high
reasoning.standard
vision.construction
document.extract
ocr
code
embedding
rerank
speech.realtime
local.private
```

Exact names may follow repo conventions.

## Provider abstraction

Create a provider-neutral interface supporting:

- capability declaration;
- model identifier/version;
- modalities;
- structured output;
- tools/function calling;
- streaming where required;
- cost metadata;
- latency/availability metadata;
- local/remote classification;
- privacy constraints;
- fallback policy.

The current provider should become one adapter, not the architecture.

## Agent architecture rule

Prime, structural reviewer, procurement, scheduler, safety reviewer, etc. should normally be:

```text
shared model pool
+ role policy
+ discipline context
+ allowed tools
+ project evidence
+ structured output contract
```

Do not create a permanently separate model process for every role without a measured reason.

## AI provenance

Every meaningful AI execution should be recordable as:

```ts
AiRun {
  runId
  projectId
  capability
  provider
  model
  modelVersion?
  localOrRemote
  inputEvidenceRefs[]
  toolCalls[]
  outputArtifactOrClaimRefs[]
  startedAt
  completedAt
  tokenOrUsageMetadata?
  estimatedCost?
  policyDecision
  approvalStatus?
}
```

Do not require storage of private hidden chain-of-thought.

Store useful audit material:

- model/provider/version;
- user/system task contract where permitted;
- source/evidence references;
- tool invocations/results;
- structured final output;
- validation outcome;
- human/professional approval.

## Promotion boundary

AI output is a proposal/claim until canonical project policy promotes it.

This ticket must integrate with FND-02.

Examples:

- AI document extraction → proposed claims
- AI schedule suggestion → proposal, then deterministic CPM recomputation
- AI material alternative → proposal with source evidence
- AI safety observation → issue/proposal, not machine safety clearance

## Model selection policy

Routing may consider:

- capability quality/evals;
- data sensitivity;
- local-only requirement;
- context size;
- modality;
- latency;
- price;
- rate limits;
- availability;
- customer/provider policy.

Do not hardcode temporary model-market rankings into construction-domain logic.

## Local model support

Add the contract and evaluation hooks now.

Do not download weights into Git.

Local model deployment is a separate runtime task.

## Safety boundary

Explicitly prohibit:

`LLM response → actuator command`

Future machine control must pass:

`AI/planner proposal → deterministic validator → authorization → local planner/controller → safety system → actuator`

## Acceptance

Tests should prove:

1. Construction service requests a capability, not provider/model name.
2. Provider can be swapped without changing construction-domain caller.
3. Local-only request cannot silently route to remote provider.
4. Deterministic Tier-0 path bypasses LLM.
5. Failed provider can follow explicit fallback policy.
6. AI run records provider/model/tools/evidence/structured result.
7. AI claim cannot silently become canonical project truth.
8. Existing provider behavior remains available through an adapter.

## Non-goals

Do not:

- benchmark every model in this ticket;
- deploy local model weights;
- replace all AI call sites at once if a compatibility bridge is safer;
- implement robotics control;
- store hidden chain-of-thought.
