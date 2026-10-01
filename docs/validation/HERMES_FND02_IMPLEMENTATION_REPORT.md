# HERMES FND-02 implementation and validation

Status: IMPLEMENTED — NOT PHYSICALLY VERIFIED.

Authorized project: hermes-construction / application. Branch: feature/fnd-01-canonical-identity.
Governed prerequisite: 27e62a714a33236d785cd410ca11a12b02fafa96 (Accepted and Internal Forge, recovered through the existing approved Thin Worker session).
Source archive SHA-256: a9b7f19b001968c9900d75082aa693f6955c2fb894d4d58753161d78c598ae79.

The Owner's current exact branch/base supersedes older prerequisite identifiers in the planning handoff. Controlling documents were read from planning/hermes-control-layer-2026-09-18: foundation master, FND-02 ticket, exact file handoff, source audit and compatibility matrix. No main source fallback was used.

## Implemented

- Independent authority, derivation, reality and claim status contracts; canonical Source, Evidence and Claim reuse FND-01 entity/revision/frame types.
- Deterministic creation, validation, promotion and supersession helpers. Verification requires substantive hash-backed evidence, explicit predicate/value/unit support, matching project/revision/entity, current validity, appropriate external authority and an auditable reviewer/event. Model inference requires an explicit validation record; external approvals cannot be inferred/calculated. Simulation and metadata-only evidence cannot verify live claims.
- Truth labels derived from claims. A Verified status alone is insufficient: a matching promotion event and valid evidence registry are required. Adapters are policy helpers, not a replacement for authentication or proof that an uploaded document is genuine.
- Additive adapters for source definitions, fetched documents/fetch records, assertions, provenance chains, legacy knowledge/price records, agent executions and manager reviews. Full text is not copied into canonical evidence. No manager mode or confidence score manufactures external authority.
- Live-house jurisdiction stays USER_INPUT, geotech USER_ASSUMPTION, and foundation selection CALCULATED_UNVERIFIED. No claimed physical SPT. Internal inspections leave professional/AHJ/CO statuses pending/not submitted/not eligible. Simulation reality is explicit.
- Task events reference canonical unverified claims for jurisdiction, geotech, foundation selection, inspection, material lifecycle and cost estimates. Existing task sequencing and lifecycle enums remain compatible.
- Hydrated legacy verification assertions are downgraded in memory; original values remain in legacyUnverifiedTruth. No runtime data migration.
- Local documents retain actual license classification. Both local and HTTP paths use a shared fail-closed rights policy; reference-only/review/restricted sources cannot gain full-text ingestion through local availability.

## Validation

All four scoped Vitest suites passed, 53 tests total:
- FND-02 evidence/provenance: 36.
- FND-01 identity/spatial: 7.
- Academy House 001 vertical slice: 4.
- Phase 3.18d visual gate: 6.

TypeScript: npm run lint PASS. Production compilation: npm run build PASS. Existing large-chunk warning remains. No deployment or physical browser acceptance is implied.
Phase1DiagnosticRunner returned 15 PASS results. This diagnostic contains declared/static evidence in places; it is not independent browser or robot/physical acceptance.

### Pre-existing integration failures, explicitly not counted as passing

The genuine_agent_reasoning suite produced 6 passes / 5 failures on BOTH the untouched governed FND-01 baseline and the candidate. Identical failing cases: foundation agent proof; HVAC learning/retraining proof; electrical agent proof; shadow execution; extraction/quarantine. Current execution does not provide the expected real extracted/provider-backed results. No provider credentials, paid calls or authority changes were introduced to satisfy these tests.

The standalone synthetic_path_elimination script passes its fetch-failure and source-rights checks, then fails at its existing PDF fixture expectation: expected 2 pages, observed 1. The same failure reproduces on untouched FND-01. The full script is NOT PASS; later checks were not reached. FND-02 additionally tests source-rights preservation and blocked HTTP retrieval directly.

Validation was repeated in disposable source copies. All original tracked runtime/data files are byte-identical to the recovered base in the preservation candidate. Test-generated artifacts, dependencies and build outputs are excluded.

## Boundaries and remaining compatibility work

Canonical contracts/adapters are additive. Historical sourceEvidence/evidenceNotes/provenance strings and old BOM/material labels remain inspectable but do not confer canonical verification. Existing UI has not been redesigned to consume all new claim labels. Production canonical evidence persistence belongs to FND-03; external ingestion/signature validation and professional/AHJ workflows require real integrations and evidence. FND-04 normalization, FND-05 routing and HX UI are not implemented by this checkpoint.

No production changes, merge, deployment, FND-03+ source work, spend, infrastructure or credential/security change occurred.
