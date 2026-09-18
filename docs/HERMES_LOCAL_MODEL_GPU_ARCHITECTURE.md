# HERMES LOCAL MODEL + GPU ARCHITECTURE

**Status:** Planning specification  
**Purpose:** Make HERMES local-first and model-provider-independent without turning the LLM into the source of construction truth.

## 1. Core principle

HERMES owns intelligence through:

- canonical world state;
- geometry;
- construction process;
- knowledge retrieval;
- materials;
- constraints;
- deterministic tools;
- validators;
- memory;
- provenance.

The language model receives a bounded task.

Do not expect a small model to memorize the construction universe.

## 2. Current source reality

Existing source already defines `ConstructionReasoningProvider`.

This is a strong foundation.

Current coupling still exists because:

- `AgentExecutionService` instantiates `GeminiReasoningProvider` directly;
- `geminiService.ts` contains additional direct Gemini paths;
- some fallback responses return plausible-looking deterministic text/default approvals without necessarily proving the underlying conclusion.

The migration target is a router, not a wholesale rewrite.

## 3. Reasoning tiers

Preferred ladder:

### Tier 0 — deterministic

No language model.

Use for:

- geometry;
- transforms;
- collision;
- quantities;
- path feasibility;
- schedules/CPM;
- state machines;
- dependency enforcement;
- known code-rule thresholds;
- material arithmetic;
- validation.

### Tier 1 — small local model

Target class:

**approximately 2–4B parameters, quantized**

Use for:

- tool selection;
- structured extraction;
- routing;
- short planning;
- schema-constrained proposals;
- summarization;
- classification;
- explanation;
- missing-information detection;
- bounded specialist decisions.

This should become the normal HERMES model tier if benchmark results support it.

### Tier 2 — larger local model

Optional.

Target class may be approximately 7–14B depending on hardware/benchmark.

Use for:

- harder multi-constraint reasoning;
- difficult coordination;
- more complex synthesis.

Do not load/use this tier for routine tasks if Tier 1 is sufficient.

### Tier 3 — remote frontier

Use only for:

- novel ambiguity;
- difficult research/synthesis;
- exceptional reasoning;
- development support.

Remote provider is an escalation resource, not required operating infrastructure.

### Tier 4 — human/professional

Required for:

- owner decisions;
- legal/professional approvals;
- unresolved uncertainty;
- licensed engineering/AHJ items;
- safety-critical exceptions.

## 4. Model router

Introduce a provider-neutral router.

Concept:

```
ReasoningRequest
  ↓
TaskClassifier
  ↓
DETERMINISTIC?
  ├─ yes → tool/solver
  └─ no
       ↓
LOCAL_FAST
       ↓ validation/confidence
       ├─ sufficient → accept
       └─ insufficient
            ↓
       LOCAL_DEEP
            ↓
       validate
            ├─ sufficient → accept
            └─ insufficient → REMOTE/HUMAN
```

Router result records:

- selected tier;
- provider;
- model;
- prompt hash;
- context IDs;
- latency;
- token/compute metrics;
- validator result;
- escalation reason.

## 5. Provider interface

Keep `ConstructionReasoningProvider`.

Add implementations conceptually:

- `LocalOpenAICompatibleProvider`;
- `GeminiReasoningProvider`;
- optional other remote providers later;
- `DeterministicReasoningProvider` only where it truly executes deterministic logic.

Do not present canned text as if a deterministic engineering solver ran.

## 6. Local inference service boundary

Do not embed model runtime deeply into HERMES application code.

Run local inference behind an HTTP endpoint.

Preferred interface:

OpenAI-compatible request/response where practical.

Example topology:

```
HERMES API/Workers
      ↓ localhost/private network
Local Inference Server
      ↓
GPU / CPU
```

Benefits:

- swap model without changing agents;
- move inference to second machine later;
- run site-edge model later;
- independent restart/monitoring;
- benchmark multiple engines.

Possible inference engines can be evaluated later; architecture must not depend on one.

## 7. Context compiler

The local model should not receive the whole project.

Build task-specific context.

Inputs may include:

- agent role;
- task/scenario;
- relevant world entities;
- relevant room/zone;
- current phase;
- retrieved source chunks;
- applicable constraints;
- tool schemas;
- required output schema;
- uncertainties.

Exclude unrelated project history.

This improves:

- speed;
- accuracy;
- privacy;
- context length;
- small-model viability.

## 8. Structured output

Default local-agent output should be structured.

Examples:

- action proposal;
- selected tool;
- missing information;
- alternatives;
- assumptions;
- cited chunk IDs;
- confidence;
- escalation request.

Validate JSON/schema before any downstream action.

Invalid structured output is a model failure, not a reason to guess.

## 9. Tool-first agents

Small models become capable when tools own hard computation.

Example structural task:

model decides:

`CALL load_solver(inputs)`

not:

`mentally calculate every load and invent result`

Example logistics:

model decides:

`CHECK_ROUTE(actor,payload,start,goal)`

Spatial engine returns feasibility.

This is the intended architecture.

## 10. Validation

Independent validators remain mandatory.

A model proposal should not become truth because the model is confident.

Validation dimensions:

- schema;
- math;
- geometry;
- constraints;
- source citations;
- code rules;
- spatial feasibility;
- authority/professional-review requirement.

## 11. Confidence/escalation

Do not trust model self-reported confidence alone.

Escalation can consider:

- validator failure;
- missing source;
- contradictory evidence;
- repeated tool error;
- out-of-distribution task;
- high consequence;
- low routing benchmark score.

## 12. Truthful fallback

Current/future fallback must never fabricate success.

Bad:

- “valid: true, confidence: 94” merely because no model key exists.

Preferred:

- `NOT_EXECUTED_NO_PROVIDER`;
- `DETERMINISTIC_VALIDATION_ONLY`;
- `INSUFFICIENT_INFORMATION`;
- `ESCALATION_REQUIRED`.

Simulation fallback must remain explicitly SIMULATION.

## 13. GPU role

The server GPU is primarily for:

- local LLM inference;
- local vision/perception;
- embeddings/reranking;
- later simulation/perception workloads.

It is not required to render the interactive Three.js house; the browser GPU handles that.

## 14. GPU sizing strategy

Do not select permanent GPU based only on model parameter count.

Measure:

- VRAM;
- context/KV cache;
- concurrency;
- tokens/sec;
- latency target;
- vision model needs;
- background Academy workload.

Initial preference:

- run small local model first;
- keep larger model optional;
- avoid paying continuously for unused capacity.

A modest GPU with enough VRAM for the winning 2–4B quantized model plus context/concurrency may be sufficient for the initial runtime.

Only move upward after benchmark evidence.

## 15. CPU fallback

Keep CPU-compatible inference possible for:

- development;
- low-volume background jobs;
- degraded mode.

GPU should improve throughput/latency, not become a single architectural point of failure.

## 16. Vision/perception tier

Do not send every site frame to a giant multimodal model.

Pipeline:

```
camera / sensor
→ deterministic/local CV
→ detection/segmentation/depth/OCR
→ structured observations
→ world reconciliation
→ local VLM only when semantic interpretation is needed
→ frontier vision only on escalation
```

This will matter later for real construction sites.

## 17. Embeddings/RAG

Knowledge retrieval should be separate from generative model selection.

Pipeline:

- ingest;
- rights check;
- parse;
- chunk;
- embed/index;
- retrieve;
- optionally rerank;
- compile context;
- reason.

The small model should see authoritative retrieved evidence, not rely on memory.

## 18. Model benchmark suite

Before choosing the default local model, create a HERMES benchmark.

Suggested minimum 100 cases:

- 15 tool-routing;
- 15 structured extraction;
- 15 construction sequence;
- 15 source-grounded specialist reasoning;
- 15 spatial/constructability;
- 10 business/logistics;
- 10 uncertainty/escalation;
- 5 adversarial/schema failure.

Metrics:

- valid schema %;
- correct tool %;
- deterministic validator pass %;
- citation grounding;
- constraint compliance;
- unsupported claim rate;
- latency;
- tokens/sec;
- RAM/VRAM;
- escalation quality.

## 19. Per-agent model assignment

Do not permanently assign unique models to every agent at first.

Most roles share inference service.

Role specialization comes from:

- contract;
- tool permissions;
- knowledge pack;
- context;
- validators;
- authority.

Later evidence may justify special models for vision/code/etc.

## 20. Scheduler/concurrency

Agents should enqueue model jobs rather than independently overload inference.

Inference scheduler considers:

- priority;
- task consequence;
- estimated context size;
- model tier;
- batching/concurrency;
- timeout;
- cancellation.

Construction state must survive model service restart.

## 21. Telemetry

Track:

- model;
- quantization;
- inference engine;
- hardware;
- latency;
- prompt tokens;
- output tokens;
- queue wait;
- validation result;
- retry/escalation;
- energy/cost where practical.

Then infrastructure decisions become evidence-based.

## 22. Deployment topology

Future initial deployment may be:

```
GPU VPS / server
  ├─ HERMES API
  ├─ HERMES worker
  ├─ database
  ├─ queue/lease mechanism
  └─ local inference service
```

Keep boundaries clean enough to split later:

```
HERMES server
   ↓
Inference GPU node
```

or:

```
Central HERMES
   ↓
Site edge GPU
```

## 23. Security

- model service private by default;
- no unrestricted public inference endpoint;
- secrets outside source;
- tool permissions enforced by HERMES;
- model cannot grant itself permissions;
- model cannot bypass validators.

## 24. First implementation slices

Do not begin until P0 visual acceptance is closed.

### Slice 1
Replace direct `new GeminiReasoningProvider()` with dependency-injected/provider-router contract.

No behavior change required yet.

### Slice 2
Add local OpenAI-compatible provider.

### Slice 3
Run one small local quantized model.

### Slice 4
Build benchmark harness.

### Slice 5
Route selected low-risk Academy tasks locally.

### Slice 6
Add escalation to current remote provider.

### Slice 7
Measure and choose permanent GPU.

## 25. Exit criterion

P3 model-routing work succeeds when:

- HERMES can run core Academy reasoning without a required Gemini key;
- deterministic tasks avoid LLM calls;
- local model handles benchmark-approved task classes;
- validators gate proposals;
- difficult tasks escalate cleanly;
- model service can restart without corrupting world/task state;
- provider changes do not require rewriting agent architecture.
