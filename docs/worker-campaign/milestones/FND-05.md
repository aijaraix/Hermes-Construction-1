# FND-05 — Provider-neutral capability routing and AI provenance

Status at package creation: NOT IMPLEMENTED. Prerequisite: preserved and recovered FND-04. Initial historical FND-01/FND-02 prerequisites are rebound to the campaign's verified FND-02 base, then the immediately preceding Accepted checkpoint. Remain on `feature/fnd-01-canonical-identity`.

## Read only these references and relevant current source

- [HERMES_FOUNDATION_HARDENING_MASTER.md](../references/HERMES_FOUNDATION_HARDENING_MASTER.md)
- [HERMES_FND_05_AI_CAPABILITY_ROUTER_AND_AI_PROVENANCE.md](../references/HERMES_FND_05_AI_CAPABILITY_ROUTER_AND_AI_PROVENANCE.md)
- [HERMES_FND_05_COMPATIBILITY_TEST_MATRIX.md](../references/HERMES_FND_05_COMPATIBILITY_TEST_MATRIX.md)
- [HERMES_FND_05_EXACT_FILE_BY_FILE_CODEX_HANDOFF.md](../references/HERMES_FND_05_EXACT_FILE_BY_FILE_CODEX_HANDOFF.md)
- [HERMES_FND_05_SOURCE_AUDIT.md](../references/HERMES_FND_05_SOURCE_AUDIT.md)

## Current source-backed delivery boundary

Existing: ConstructionReasoningProvider, Gemini adapter, quotas/deferred, execution records, deterministic simulator, validator/manager review.
Gap: no provider registry/capability router/canonical AiRun; agentExecutionService directly instantiates Gemini; provider/model policy still model-specific.
Implement capability request/constraints, provider declarations/registry, routing/fallback, canonical AiRun, permitted tool-call records. Keep current provider via adapter, preserve historical records.
Deterministic math bypasses AI. Local-only excludes remote providers before selection and returns explicit unavailable if no local adapter. Record evidence/context/output claims/model/version/prompt/schema hashes/validation/policy/fallback/usage. No hidden chain-of-thought/secrets.
Fake second provider must be swappable without domain caller changes. Router cannot promote claims or create professional/AHJ approval. Actuator tools unavailable.
Live provider acceptance only with already configured approved access/budget; otherwise mocked routing tests do not imply live acceptance.

## Acceptance and preservation

Execute every applicable focused matrix and required regressions from [acceptance gates](../04_ACCEPTANCE_GATES.md), typecheck/build, and [visual QA](../05_VISUAL_QA_PROTOCOL.md) when relevant. Keep DB/provider/browser gates explicitly separate. Do not call mocked infrastructure physical proof. Record a measured implementation report under `docs/validation/` and update `campaign.json` milestone results before packaging.

Then [checkpoint and recover](../06_CHECKPOINT_AND_RECOVERY_PROTOCOL.md) the exact source. Verify base/child, Forge, immutable Recovery, Accepted Head, archive hash and full-tree closure before proceeding. The current approved campaign supersedes historical per-ticket STOP/new-branch instructions; all technical boundaries and prohibitions remain. Continue only after this stage is durably preserved and required engineering gates pass.
