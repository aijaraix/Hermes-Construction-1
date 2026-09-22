# HERMES FND-05 COMPATIBILITY & TEST MATRIX

## Existing AI/runtime systems

| Current area | Useful behavior | Current risk/gap | FND-05 treatment |
|---|---|---|---|
| ConstructionReasoningProvider | provider interface exists | too narrow / reasoning-centric | retain compatibility, introduce richer AiProviderAdapter |
| GeminiReasoningProvider | real provider call + structured JSON + citations | model/fallback policy embedded in adapter | preserve through Gemini adapter |
| AgentExecutionService | central scenario execution + validation | hardcoded Gemini provider instance | route by capability |
| AgentExecutionRecord | strong provider/model/prompt/citation provenance | lacks capability/router/privacy/output refs | adapt to AiRun |
| QuotaIntegrityEngine | attempts, errors, deferred queue, replay | failover policy Gemini/model specific | capability/provider-neutral fallback |
| ReasoningBudgetManager | deterministic-vs-LLM accounting | can become parallel selection authority | use as policy input only |
| ReasoningGatingEngine | provider-disabled governance | overlaps selection responsibility | retain compatibility/policy input |
| DeterministicProposalSimulator | test/simulation continuity | must never look like real AI | explicit SIMULATION |
| ManagerReviewService | non-executed/critical-failure gating | model quality could be mistaken for authority | preserve authority boundaries |
| FND-02 Claim | proposal/promotion boundary | must receive AI output correctly | MODEL_INFERENCE + PROPOSED |
| FND-03 persistence | canonical DB/artifact seam | AI tables not guaranteed | optional 0003 migration |
| RobotReadySpatialContract | machine-ready contract abstraction | future misuse from model output | enforce AI→validator→authorization boundary |
| hardware control | currently PLANNED | direct AI actuator risk | explicitly not exposable |

## Capability routing rules

| Request | Router outcome |
|---|---|
| deterministic calculation available | TIER_0_DETERMINISTIC / bypass AI |
| reasoning.standard, remote allowed | eligible registered reasoning provider |
| local.private / localOnly | local providers only |
| localOnly with no local provider | explicit unavailable result |
| unsupported capability | explicit unsupported/no-provider |
| provider fails and fallback allowed | next eligible provider |
| provider fails and fallback forbidden | fail/defer |
| safety-critical output | proposal + deterministic/review gate |
| direct actuator request | denied |

## Provider-neutrality invariants

1. construction caller does not name Gemini.
2. construction caller does not name a model.
3. roles are not permanently bound to model processes.
4. provider/model selection is policy/config.
5. local-only never silently becomes remote.
6. deterministic work does not invoke AI.
7. simulation is not real model execution.
8. high-capability model does not gain approval authority.

## AiRun required provenance

- run ID
- project/revision context
- agent/role
- capability
- tier
- provider
- model/version
- adapter version
- local/remote
- evidence/context refs
- task/prompt/schema hash/version
- tool calls
- output claim/artifact refs
- start/end
- usage metadata + source
- cost if known
- policy decision
- fallback path
- validation
- approval
- execution status

## Forbidden provenance

Do not store:

- hidden chain-of-thought
- model scratchpad
- provider secrets
- raw unrestricted tool credentials

## Safety invariants

1. no actuator/CAN/hydraulic/motor tool in AI registry.
2. AI output remains proposal.
3. deterministic validator can veto.
4. authorization is separate.
5. professional review remains separate.
6. router cannot mark FND-02 claim Verified.
7. router cannot create AHJ/professional approval.

## Required tests

| ID | Proof |
|---|---|
| ROUTE-01 | caller requests capability not provider |
| ROUTE-02 | provider swap without domain caller change |
| ROUTE-03 | unsupported capability fails clearly |
| LOCAL-01 | localOnly filters all remote providers |
| LOCAL-02 | no local provider returns explicit unavailable |
| TIER0-01 | deterministic bypass |
| FALLBACK-01 | explicit fallback works |
| FALLBACK-02 | prohibited fallback is honored |
| SIM-01 | simulator remains simulation/non-certifying |
| RUN-01 | AiRun complete provenance |
| RUN-02 | usage source distinguished |
| TOOL-01 | allowed tool call audited |
| TOOL-02 | unknown tool denied |
| SAFETY-01 | actuator tool impossible through AI registry |
| CLAIM-01 | AI output → MODEL_INFERENCE PROPOSED |
| CLAIM-02 | router cannot promote to Verified |
| REVIEW-01 | professional review boundary preserved |
| COMPAT-01 | existing Gemini path remains compatible |
| PERSIST-01 | DB round-trip when test DB available |

## Do-not-break invariants

1. FND-01 identity/frame/unit contracts intact.
2. FND-02 claim/promotion contracts intact.
3. FND-03 persistence contracts intact.
4. FND-04 openBIM import contracts intact.
5. Academy House unchanged.
6. legacy runtime remains default where applicable.
7. existing Gemini provider behavior remains available.
8. quota/deferred jobs remain truthful.
9. current manager/validator gating remains.
10. eight runtime files untouched.
11. reference IFC fixtures untouched.
12. no UI redesign.

## Deferred beyond FND-05

- real local model deployment
- model weights
- continuous model benchmarking
- enterprise provider policy UI
- multimodal production connectors
- speech runtime
- vector DB redesign
- robotics controllers
- ROS2/MoveIt runtime
- actuator integrations
- physical machine safety certification

## Foundation completion meaning

After FND-05 code/tests pass:

**FOUNDATION HARDENING = IMPLEMENTED — NOT PHYSICALLY VERIFIED**

Physical verification still separately requires, where applicable:

- real PostgreSQL/PostGIS integration;
- faithful browser acceptance;
- real provider integration under configured credentials;
- later object-storage/runtime acceptance.
