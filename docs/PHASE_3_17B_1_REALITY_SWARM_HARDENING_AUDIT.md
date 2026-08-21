# PHASE 3.17B.1 — REALITY SWARM HARDENING AUDIT

## Executive Summary
Phase 3.17B.1 transforms the Reality & Data Truth Swarm from a static inspector into a fully dynamic, self-auditing watchdog. All hardcoded production fallbacks (e.g. `132` default role counts, prewritten page audit statistics, and simulated supplier prices) have been completely removed and replaced with dynamic queries against canonical data owners.

---

## Key Technical Changes
1. **Dynamic Role Count Source**: Derived directly from `AgentRegistry.getAllContracts().length`.
2. **Machine-Readable UI Field Registry**: Enumerates major UI fields and maps them to canonical data owners with strict provenance rules.
3. **Procurement Evidence Derivation**: Prices query `ProcurementStore` with active evidence verification and automatic status downgrades when quotes expire or lack evidence.
4. **Security Scanner**: Executes real payload scans using synthetic test markers (`HERMES_TEST_SECRET_DO_NOT_EXPOSE_123`).
5. **Static Code Analysis**: Scans `src/components` for hardcoded production literals.
6. **Meta-Auditing**: The Reality Swarm audits its own dashboard numbers to guarantee self-consistency.
7. **Durable Persistence**: All audit records, repairs, conflicts, and executions are saved to `/data/db/reality_audit_store.json`.
8. **Engineering Protection Invariant**: Reality Swarm auto-repairs presentation bindings but NEVER overwrites engineering data, escalating discrepancies as `DomainConflictRecord`s.
