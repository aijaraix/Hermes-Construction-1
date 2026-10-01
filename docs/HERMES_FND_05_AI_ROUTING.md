# FND-05 capability routing and AI provenance

Construction callers use `AgentExecutionService.executeAgentScenario()` with an optional `ai` capability/privacy/project context. They do not select a provider or model. Its default capability is `reasoning.standard`. The service now delegates to `ScenarioAiRuntime` and `CapabilityRouter`, preserves `AgentExecutionRecord`, and returns an optional `AiRun` and proposed FND-02 claims.

## Current authority and availability

The existing Owner governance gate remains deferred. Default composition reads `ReasoningGatingEngine.routingConstraints()`, permits no model execution and no paid execution. Merely finding a provider key does not activate the new central execution path. This campaign does not authorize credentials, provider spending or live model activation.

The Gemini implementation remains available through `GeminiProviderAdapter` and the historical `GeminiReasoningProvider` export. On the routed path the adapter makes exactly one selected-model attempt, with its internal fallback list empty; the router alone chooses fallback. Historical direct callers keep their compatibility behavior. This milestone does not migrate unrelated `geminiService.ts` call sites or rewrite historical records.

`geminiConfig.ts` centralizes the three historical model identifiers used by the old failover view. They are compatibility configuration, not a claim that these models are currently deployed, available, best suited, or independently verified. No live model access was tested.

## Policy and provider contracts

The registry declares capabilities, locality, modalities, structured output, tools, streaming, model tier/version, availability and known cost/context/latency limits. Declarations are copied/frozen on registration. Only reasoning.standard currently has the existing remote adapter. Other capability keys fail explicitly unless a supporting adapter is registered. No local model runtime or weights are installed.

Selection is deterministic by configured priority, provider ID and model ID. Local-only, `LOCAL_ONLY` privacy and `local.private` filter remote providers before selection and before fallback. No local provider means `LOCAL_ONLY_UNAVAILABLE`. Unsupported capabilities are not silently coerced into reasoning. Explicit simulation is not a substitute for a local-model privacy request.

Trusted routing policy intersects capability, role and project tool permissions. Caller-provided or model-produced JSON must not install routing policy or adapters; no HTTP endpoint exposes the composition seam. `configureAiRuntime()` exists for trusted server composition and deterministic tests.

The router bounds attempts (1–5) and overall deadline (default 30 seconds, at most 120 seconds). It passes AbortSignal to providers/tools and does not start overlapping fallback after timeout. An in-process adapter must cooperate with cancellation; this is not an OS sandbox. Costs are unknown unless supplied. A provided cost ceiling rejects unknown estimates and reserves estimates across fallback attempts; estimates are not a metered billing guarantee. Default no-spend policy rejects model adapters unless explicitly declared free, and the Owner model gate remains separately closed.

The deterministic callback seam executes without selecting a provider or creating a fake AiRun. Budget-manager hints remain inputs, not provider selection or spend authority. The old budget report's request/accounting semantics are retained; canonical AiRun is the new execution provenance.

## Truth and review

AiRun records request/project/revision/role, capability/tier, provider/model/adapter versions, local/remote, evidence/source/chunk refs, hashes and task/schema/prompt versions, bounded final output, tools, output refs, timestamps, per-attempt fallback path, selected-result usage source, policy, validator reference and approval boundary. Gemini supplies the full prompt SHA-256 while retaining the historical short promptHash in the legacy result. Usage is `PROVIDER_REPORTED`, `ESTIMATED` or `UNKNOWN`; missing costs remain unknown. Raw request context, credentials and private scratchpad are not canonical audit fields. Prohibited scratchpad/credential output fields are rejected; provider exception bodies are not persisted into new error text.

Explicit simulator/test adapters produce `SIMULATED` runs and non-certifying legacy simulation records. Forced simulation bypasses even an injected eligible model adapter. Controlled quota fixtures remain test-only deferred evidence. A successful model proposal with explicit project/revision/subject/reality context can produce a `MODEL_INFERENCE` / `PROPOSED` claim through FND-02. It cannot become Verified through this router. Simulation/test runs cannot create model-inference claims through the service. Validator results and professional review requirements remain separate; a stronger model grants no authority.

Only these read/calculation tool names are registrable: `evidence.read`, `entity.read`, `artifact.metadata`, `quantity.calculate`, `unit.convert`, `schedule.calculate`. The default runtime registers none. Input hashes, scope, status and output refs are audited, not unrestricted raw inputs. Unknown tools and incomplete permission intersections are denied. Remote tools cannot serve local-only requests. Shell, unrestricted filesystem/network, CAN, hydraulic, motor, ROS2 actuator and equipment control are not registrable. DIRECT_ACTUATION is denied even before deterministic bypass. Future execution still requires independent validation, authorization and safety/controller boundaries; none are implemented here.

## Durable ledger

`PostgresAiRunRepository` is an explicit project-scoped FND-03 composition, with additive migration `0003_ai_runs.sql`. It atomically records the terminal run, tool calls, input/output references, proposed inference claims and event. Existing sources/evidence/claims/artifacts remain their canonical owners. Runs and their references are append-only; exact retry of the same run/proposal bundle is idempotent, changed content conflicts. Referenced canonical objects must exist within scope. A failed reference insert rolls back the bundle. Academy-only runs without project context stay in the legacy in-memory history unless separately bound to an approved project; no fictitious project is assigned.

No startup migration, production cutover, dual write, remote model deployment, provider credentials or live-money activation was introduced. PostgreSQL and live-provider gates are explicitly unverified until run in approved infrastructure.
