# HERMES FND-02 — EXACT FILE-BY-FILE CODEX IMPLEMENTATION HANDOFF

**Controlling ticket:** `docs/HERMES_FND_02_EVIDENCE_PROVENANCE_SOURCE_AUTHORITY.md`

**Required source audit:** `docs/HERMES_FND_02_SOURCE_AUDIT.md`

**Required matrix:** `docs/HERMES_FND_02_COMPATIBILITY_TEST_MATRIX.md`

## Prerequisite

FND-01 is complete at implementation commit:

`194ad4473d0e8768cd7f1db34d7e1713447153dd`

FND-02 must be implemented **on top of FND-01**.

If that commit/branch is not available in the Codex workspace, STOP.

Do not silently implement FND-02 from old `main`.

The expected local prerequisite branch is:

`feature/hermes-fnd-01-canonical-foundation`

Preserve:

- FND-01 canonical identity/revision/unit/frame work;
- local visual commit `c1acf19` if it is part of the current preserved worktree lineage;
- the eight runtime-generated modified files;
- all legitimate newer work.

Do not reset or commit runtime-generated files.

---

# 1. Objective

Implement a canonical evidence/provenance/source-authority layer that can answer:

> Where did this claim come from, how authoritative is it, when was it valid, and how was it promoted into project truth?

This is an additive compatibility pass.

Do not perform database migration.

Do not implement external GIS/weather/geotech/procurement connectors.

---

# 2. Read first

Read only:

1. `docs/HERMES_FOUNDATION_HARDENING_MASTER.md`
2. `docs/HERMES_FND_02_EVIDENCE_PROVENANCE_SOURCE_AUTHORITY.md`
3. `docs/HERMES_FND_02_SOURCE_AUDIT.md`
4. `docs/HERMES_FND_02_COMPATIBILITY_TEST_MATRIX.md`

Do not crawl the whole docs directory.

---

# 3. File: src/types/hermes.ts

Preserve all FND-01 canonical types.

## Add separate canonical concepts

### SourceAuthorityClass

At minimum support:

- REGIONAL_PUBLIC_DATA
- SITE_REMOTE_SENSING
- PROJECT_SURVEY
- FIELD_OBSERVATION
- LAB_TEST
- LICENSED_PROFESSIONAL_REPORT
- CONTRACT_DOCUMENT
- AHJ_RECORD
- MANUFACTURER_DATA
- SUPPLIER_QUOTE
- OWNER_INPUT
- HERMES_INTERNAL
- SIMULATION_FIXTURE

Permit extension where current source requires it.

### DerivationMethod

At minimum:

- DIRECT_SOURCE
- MEASURED
- OBSERVED
- IMPORTED
- DETERMINISTIC_CALCULATION
- RULE_DERIVED
- MODEL_INFERENCE
- HUMAN_INTERPRETATION
- SIMULATED

### RealityClass

- LIVE
- SIMULATION
- REGRESSION_FIXTURE
- HISTORICAL_REFERENCE

### ClaimStatus

- PROPOSED
- OBSERVED
- CALCULATED
- VERIFIED
- REJECTED
- STALE
- SUPERSEDED
- PROFESSIONAL_REVIEW_REQUIRED

Do not expand legacy `TruthOrigin` to carry all these concepts.

Keep it for compatibility.

## Add canonical Source record

Adapt current `AuthoritativeSourceDefinition`; do not replace it.

Minimum canonical source semantics:

- source ID
- source type/class
- title
- owner/maintainer
- URI
- jurisdiction/geographic scope
- edition/version
- effective dates
- authority class
- rights classification
- license status
- caching/storage policy
- last checked/update cadence

## Add Evidence record

Use FND-01 IDs/types where available.

Minimum:

- evidenceId
- projectId
- sourceId
- related entity IDs
- related task/inspection/material IDs where useful
- artifact URI/key optional
- artifact SHA-256 optional
- MIME type
- captured/observed/recorded timestamps
- author/device/actor
- spatial frame/pose optional
- project revision ID
- rights classification
- confidentiality/retention placeholders
- reality class

## Add Claim record

Minimum:

- claimId
- projectId
- subjectEntityId or scoped project subject
- predicate
- typed/serializable value
- unit metadata when applicable
- valid-from/valid-to
- observed/recorded time
- confidence optional
- evidence IDs
- derivation method
- source authority class
- reality class
- software/model version optional
- claim status
- approved/promoted by optional
- supersedes/superseded-by optional
- project/entity revision reference where available

## Rights contracts

Reconcile current source rights enums with actual runtime statuses.

Do not weaken the fail-closed ingestion gate.

Support explicit concepts equivalent to:

- REDISTRIBUTABLE
- CACHE_ALLOWED
- REFERENCE_ONLY
- LICENSE_REVIEW_REQUIRED
- DO_NOT_STORE

Map legacy values through adapters.

---

# 4. New file: src/lib/projectEvidence.ts or equivalent

Implement pure deterministic helpers.

Required responsibilities:

- create/validate canonical evidence records;
- create canonical claims;
- adapt legacy `TruthOrigin`;
- derive product truth label;
- validate whether a claim may be promoted;
- supersede a prior claim without deleting it;
- require evidence for `VERIFIED` where policy demands;
- enforce authority-specific promotion rules.

No AI.

No database.

No web calls.

## Promotion policy minimum

Examples:

### Jurisdiction

OWNER_INPUT location:
- allowed as project input
- cannot promote jurisdiction/code/wind/flood claims to VERIFIED

REGIONAL_PUBLIC_DATA with valid source/evidence:
- may support verified contextual jurisdiction/hazard claim
- does not become AHJ approval

### Geotech

OWNER_INPUT bearing value:
- cannot promote to VERIFIED_IMPORT or licensed geotechnical conclusion

REGIONAL_PUBLIC_DATA soil:
- preliminary/context only

LICENSED_PROFESSIONAL_REPORT / LAB_TEST:
- may support verified project geotechnical claim

### Professional/AHJ

Only:

- LICENSED_PROFESSIONAL_REPORT / signed professional evidence

may promote professional-review status.

Only:

- AHJ_RECORD

may promote AHJ inspection/approval state.

### AI

MODEL_INFERENCE cannot directly promote to VERIFIED project truth without configured validation/reviewer path.

### Simulation

SIMULATION_FIXTURE may never derive a live Verified product truth label.

---

# 5. New file: src/lib/truthLabels.ts or equivalent

If separation is cleaner, create a small deterministic truth-label adapter.

Output labels:

- Verified
- Project source
- Observed
- Calculated
- AI inferred
- Assumed
- Simulated
- Stale
- Needs professional review

Do not store these as canonical free-form labels.

Derive them.

This helper is intended for later HX consumption.

Do not implement UI in this ticket.

---

# 6. File: server/hermesLiveHouseEngine.ts

Make the smallest truth-promotion repairs.

## Jurisdiction

Current behavior can mark jurisdiction as `VERIFIED_SOURCE` merely because:

- mode is LIVE_PROJECT
- location exists

Remove that promotion rule.

Owner-provided location may create an OWNER_INPUT claim/evidence stub.

Until a real source/evidence adapter exists, jurisdiction/code/wind/flood values must remain:

- USER_INPUT
- UNVERIFIED
- or SIMULATION_FIXTURE

as appropriate.

Do not implement real geocoding/FEMA/FBC retrieval here.

## Geotech

Current behavior can mark supplied `soilBearingPsf` as `VERIFIED_IMPORT`.

Do not.

User-supplied/custom params should map to OWNER_INPUT / USER_ASSUMPTION.

Only explicit project evidence with suitable authority may produce VERIFIED_IMPORT.

Do not claim an SPT occurred merely by writing an ASTM D1586 evidence note.

If no real imported report/test exists, preserve the simulation/planning behavior but classify truth correctly.

## Foundation selection

Do not allow a foundation-selection data origin to become `VERIFIED_ENGINEERING` solely because geotech was user-entered.

Preserve deterministic selection but label source appropriately.

## Inspections

Do not allow internal task execution to fabricate:

- licensed professional review;
- AHJ passed status;
- certificate/legal approval.

Internal checks may set `HERMES_VALIDATED`.

For live project paths without external evidence:

- licensed professional should remain pending/not applicable according to real scope;
- AHJ should remain NOT_SUBMITTED or PENDING;
- CO remains pending/not eligible.

Regression/simulation fixtures may preserve simulated statuses only if explicitly tagged as simulation and not exposed as live truth.

## Material verification

Do not redesign lifecycle enums.

Where existing task transitions occur, attach/create canonical claims/evidence metadata when practical.

Do not call lifecycle state “Verified” unless the promotion helper permits it.

## Events

Promotion of a claim into canonical truth should emit or return an auditable promotion event.

Use existing event architecture.

Do not implement persistence changes.

---

# 7. File: server/httpSourceFetcher.ts

Preserve the current fail-closed rights gate.

## Repair loadLocalApprovedDocument()

Current logic can assign:

`licenseStatus: 'PUBLIC_DOMAIN'`

because the document is local/approved.

This is incorrect.

Local availability does not change copyright status.

Derive the fetched document license/rights classification from the source definition.

A proprietary internal-use document must remain proprietary/restricted even when locally available.

## Reconcile rights enum/status behavior

Current runtime handles statuses broader than the TypeScript source definition.

Align types/adapters.

Do not widen rights in a way that permits full-text ingestion where previously blocked.

---

# 8. Source registry / knowledge adapters

Prefer new adapter files rather than invasive rewrites.

Required adapters should support:

`AuthoritativeSourceDefinition → canonical Source`

`FetchedDocument / HttpSourceFetchRecord → canonical Evidence`

`KnowledgeAssertion → canonical Claim`

`SourceProvenanceChain → evidence/claim lineage reference`

Do not duplicate full document text.

Do not rewrite knowledge ingestion.

---

# 9. Knowledge graph compatibility

Do not rebuild `KnowledgeGraphEngine`.

Legacy:

- provenanceSource string
- confidence
- VERIFIED

must not automatically derive a canonical Verified project-truth label.

Provide adapter behavior.

Seeded knowledge without evidence IDs should classify as legacy/reference knowledge unless a canonical source/evidence chain is available.

---

# 10. Agent/manager compatibility

Do not implement FND-05.

Use existing records as provenance inputs only.

Possible adapters:

`AgentExecutionRecord → MODEL_INFERENCE claim provenance`

`ManagerReviewRecord → review/promotion evidence`

Important:

Manager approval is not licensed professional approval unless the review mode/source explicitly represents a real licensed professional and evidence exists.

An internal HERMES manager cannot promote AHJ status.

---

# 11. Cost/material source compatibility

Add optional canonical evidence/source references where narrow and non-breaking.

Do not rebuild BOM or procurement.

Legacy labels such as:

- VERIFIED CURRENT QUOTE
- PUBLISHED CURRENT PRICE
- CONTRACTOR_BID

must not automatically generate canonical `Verified` unless supporting evidence exists.

Preserve old fields for compatibility.

---

# 12. Legacy TruthOrigin compatibility

Create deterministic mapping for existing legal values.

For invalid historical values found through `any`/casts such as:

- CUSTOMER
- AUTONOMOUS_ENGINE
- HERMES_WORKFORCE
- HUMAN_EXPERT
- ACADEMY_TRAINED

do not silently add all of them to `TruthOrigin`.

Map them into the new separated concepts.

Example:

CUSTOMER:
- authority = OWNER_INPUT
- derivation = DIRECT_SOURCE / HUMAN_INTERPRETATION as appropriate

AUTONOMOUS_ENGINE:
- authority = HERMES_INTERNAL
- derivation = DETERMINISTIC_CALCULATION or MODEL_INFERENCE based on actual producer

ACADEMY_TRAINED:
- authority = HERMES_INTERNAL
- reality class = SIMULATION / training context as applicable

Fail closed for unknown values.

---

# 13. Tests

Create focused tests such as:

`server/__tests__/fnd02_evidence_provenance.test.ts`

Required cases:

### SRC-01
AuthoritativeSourceDefinition adapts without losing rights or authority metadata.

### RIGHTS-01
Local approved proprietary/restricted document does NOT become PUBLIC_DOMAIN.

### RIGHTS-02
Reference-only source cannot be full-text promoted by adapter.

### CLAIM-01
AI/model-inferred claim starts PROPOSED and cannot become VERIFIED directly.

### CLAIM-02
Superseding a claim preserves prior history.

### TRUTH-01
SIMULATION_FIXTURE cannot derive Verified.

### TRUTH-02
OWNER_INPUT location does not derive verified jurisdiction/code/flood/wind.

### GEO-01
User-entered bearing capacity does not become VERIFIED_IMPORT geotech.

### GEO-02
Regional public soil source cannot become licensed professional geotech conclusion.

### PRO-01
Internal HERMES review cannot promote licensed-professional approval.

### AHJ-01
Internal HERMES inspection cannot promote AHJ PASSED.

### AHJ-02
AHJ_RECORD evidence may promote AHJ state.

### PRICE-01
Legacy `VERIFIED CURRENT QUOTE` label without evidence does not derive canonical Verified.

### EVID-01
Fetched document SHA/source metadata adapts into Evidence.

### ASSERT-01
KnowledgeAssertion maps to Claim with source/evidence linkage.

### ORIGIN-01
Legacy invalid truth-origin aliases map to separated authority/derivation/reality fields.

### HX-01
Truth-label derivation returns deterministic product labels.

---

# 14. Regression

Run:

- FND-02 tests
- FND-01 tests
- Academy House vertical-slice test
- Phase-1 spatial/visual-gate regression
- existing synthetic-path/source-rights tests
- existing genuine-agent-reasoning tests where practical
- TypeScript typecheck
- production build

Do not change tests to preserve a false verification path.

If old fixture tests expect simulated AHJ/professional approval, update only when the fixture truth is explicitly simulation-labeled and explain the change.

---

# 15. Files explicitly out of scope

Do not implement:

- PostgreSQL/PostGIS
- S3/object storage migration
- real FEMA/USGS/NOAA connectors
- OCR
- reality capture
- IFC server normalization
- AI capability router
- local model runtime
- HX shell/UI
- purchasing
- robotics
- legal interpretation
- full standards ingestion

---

# 16. Stop condition

Stop after FND-02.

Return:

- prerequisite FND-01 commit verified
- branch used
- implementation commit
- exact files changed
- new canonical source/evidence/claim contracts
- promotion policy behavior
- false-verification paths repaired
- rights-gate repair
- tests/typecheck/build results
- runtime-generated files status
- any remaining legacy evidence strings without canonical refs
- physical visual behavior change, if any

Expected truth label after code/tests only:

**IMPLEMENTED — NOT PHYSICALLY VERIFIED**
