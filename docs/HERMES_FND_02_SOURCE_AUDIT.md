# HERMES FND-02 SOURCE AUDIT — EVIDENCE, PROVENANCE, SOURCE AUTHORITY & TRUTH CLASSIFICATION

**Audit basis:** remote `main` at `bbc90702a7d62a0092dc2dd914901743c23ec8b5`, plus the completed FND-01 implementation facts reported for commit `194ad4473d0e8768cd7f1db34d7e1713447153dd`.

**Important limitation:** the FND-01 implementation branch is not available through the GitHub connector, so this audit does not claim line-by-line inspection of commit `194ad447...`. FND-02 must preserve the canonical identity/revision/unit/frame contracts created by FND-01.

## Executive finding

HERMES already has several mature provenance concepts:

- authoritative source definitions;
- rights/copyright metadata;
- HTTP fetch records;
- document hashes;
- document parse records;
- knowledge chunks;
- knowledge assertions tied to source/document/page;
- source provenance chains;
- manager review evidence;
- AI execution records with provider/model/prompt hash/citations/tool calls;
- project event streams;
- inspection and approval status separation.

The missing layer is a **general project evidence/claim model** that connects those systems to live project truth.

Today, project facts are frequently stored directly as fields and strings such as:

- `sourceEvidence`
- `evidenceNotes`
- `sourceProvenance`
- `verificationStatus`
- `priceOrigin`
- `priceSource`

without a canonical evidence object or promotion policy.

The correct FND-02 implementation is therefore additive:

1. preserve the source-ingestion stack;
2. formalize canonical `Source`, `Evidence`, `Claim`, and promotion semantics;
3. adapt existing source/document/assertion objects into those contracts;
4. fix places where live project values become “verified” without evidence;
5. expose deterministic truth labels for HX;
6. do not implement FND-03 persistence or FND-05 AI routing yet.

---

## 1. Existing source registry is stronger than expected

`AuthoritativeSourceDefinition` already includes:

- source ID
- title/publisher/organization
- URL
- edition/version
- jurisdiction/geographic scope
- authority level
- access type
- copyright/license status
- bulk ingestion permission
- full-text storage permission
- chunking permission
- citation requirements
- freshness category
- last checked
- priority

This should be preserved and adapted into the FND-02 canonical source model rather than replaced.

### Gap

The current source registry is strongly oriented around **knowledge ingestion**, not project evidence.

A building permit, owner decision, geotechnical report, supplier quote, delivery ticket, field photograph or AHJ inspection needs the same canonical source/evidence language even though it is not part of the learning corpus.

---

## 2. Existing document provenance is strong

`FetchedDocument` already includes:

- sourceId
- original/retrieved URL
- retrieval time
- MIME type
- size
- SHA-256
- storage path/key
- license status
- rights status
- source authority
- page count
- parsed text

`HttpSourceFetchRecord` adds:

- fetch ID
- requested/final URL
- HTTP status
- checksum
- storage path
- fetch status
- etag/last-modified where available

This is a good evidence substrate.

### Gap

These records are not generalized as project `Evidence`.

They are primarily knowledge-ingestion artifacts.

FND-02 should provide adapters; do not duplicate the fetching stack.

---

## 3. KnowledgeAssertion is already close to a claim

`KnowledgeAssertion` already has:

- assertion ID
- subject/predicate/object
- units
- source chunk/document/URL
- page/section
- confidence
- extractor
- validation status
- geographic/building/material scope
- effective date
- version

This is conceptually close to a canonical `Claim`.

### Recommendation

Do not replace `KnowledgeAssertion`.

Create a general `Claim` abstraction and provide a deterministic adapter:

`KnowledgeAssertion → Claim`

The canonical project claim model must additionally support:

- HERMES entity IDs from FND-01;
- evidence IDs;
- project revision ID;
- observed/valid/recorded times;
- derivation method;
- professional-review status;
- promotion status.

---

## 4. TruthOrigin is too overloaded and already violated

Current `TruthOrigin` includes values such as:

- MEASURED
- CALCULATED
- RULE_DERIVED
- MODEL_GENERATED
- LLM_REASONED
- IMPORTED_REFERENCE
- SIMULATED
- ASSUMED

But other source code writes values such as:

- CUSTOMER
- AUTONOMOUS_ENGINE
- HERMES_WORKFORCE
- HUMAN_EXPERT
- ACADEMY_TRAINED

often through casts or `any`.

### Finding

One enum is currently trying to describe at least three different concepts:

1. **derivation method** — measured, calculated, inferred;
2. **actor/source authority** — customer, engineer, HERMES, government;
3. **reality class** — simulation vs live.

These must be separated.

### Recommendation

Keep legacy `TruthOrigin` for compatibility, but introduce separate canonical concepts:

- `DerivationMethod`
- `SourceAuthorityClass`
- `RealityClass`
- `ClaimStatus`

Do not expand `TruthOrigin` into an unbounded catch-all enum.

---

## 5. Critical project-truth defect: jurisdiction verification

In `HermesLiveHouseEngine`, jurisdiction logic currently does approximately:

```ts
const isVerified =
  state.mode === 'LIVE_PROJECT' &&
  Boolean(state.projectParams.location);
```

and then may set:

`status: 'VERIFIED_SOURCE'`

while populating fixed FBC/FEMA-style values and a source-evidence string.

### Problem

A location string is not evidence that:

- geocoding was performed;
- code edition was retrieved;
- wind criteria were retrieved;
- flood zone/BFE were retrieved;
- the referenced FIRM panel applies to the parcel.

### Required FND-02 behavior

A live project with an owner-provided location should initially be classified as owner input / unverified project context.

It may not become `VERIFIED_SOURCE` until canonical evidence supports the claim.

Do not implement FEMA/GIS connectors in FND-02.

Simply make false promotion impossible.

---

## 6. Critical project-truth defect: geotech verification

The live geotech task currently treats:

```ts
LIVE_PROJECT + soilBearingPsf supplied
```

as enough to set:

`dataOrigin: 'VERIFIED_IMPORT'`.

It also writes:

`evidenceNotes: 'Standard Penetration Test N-values per ASTM D1586.'`

without requiring a report, boring artifact, test record or evidence ID.

### Problem

An owner/user-supplied bearing-capacity number is not a verified geotechnical import.

Mentioning ASTM D1586 is not evidence that a test actually occurred.

### Required FND-02 behavior

User-entered soil data should map to owner/user input or assumption unless a professional/project evidence record is attached.

A geotechnical report/boring import may later be classified as verified project evidence if its source/evidence record supports that classification.

Do not implement geotechnical document parsing here.

---

## 7. Critical approval-boundary defect

The live engine can create inspection tickets with:

- `HERMES_VALIDATED`
- `licensedProfessionalApproval: 'REVIEWED'`
- `AHJInspection: 'PASSED'`

inside an internal execution path.

### Problem

An internal HERMES task cannot manufacture:

- licensed-professional review;
- municipal/AHJ inspection;
- statutory approval.

Those statuses require external authoritative evidence.

### Required FND-02 behavior

Preserve the four distinct channels:

1. HERMES validation
2. licensed-professional review
3. AHJ inspection
4. certificate/occupancy status

Only evidence with the corresponding authority class may promote channels 2–4.

Simulation fixtures may represent simulated approval, but must be explicitly `SIMULATION_FIXTURE` and must not render as live external approval.

---

## 8. Material lifecycle vs verification is currently conflated

Current material records can use:

- ESTIMATED
- PURCHASED
- DELIVERED_VERIFIED
- INSTALLED

and live tasks may transition them directly during task execution.

### Finding

These values mix:

- physical lifecycle;
- commercial state;
- evidence verification.

FND-02 should not redesign the material lifecycle; MATERIALS/HX owns the human workflow.

However, evidence semantics must be separate.

Examples:

- `PURCHASED` is a lifecycle/commercial claim.
- `DELIVERED_VERIFIED` implies evidence.
- `INSTALLED` is a physical-state claim.

### Recommendation

Attach evidence/claim references without breaking existing enums.

Legacy state may remain, but canonical truth labels must not imply physical verification unless evidence exists.

---

## 9. Cost/price provenance exists but is not evidence-backed

There are multiple price systems:

`QuantityTakeoffLineItem.priceOrigin`:
- UNIT_PRICE_DATABASE_V1
- SIMULATED_MARKET_INDEX
- CONTRACTOR_BID

`BOMItem.priceSource`:
- VERIFIED CURRENT QUOTE
- PUBLISHED CURRENT PRICE
- SUPPLIER ESTIMATE
- etc.

### Problem

Labels such as “VERIFIED CURRENT QUOTE” are not intrinsically evidence.

The record does not universally require:

- evidence ID
- source document
- supplier
- quote ID
- quote effective date
- expiry
- currency
- project applicability

### FND-02 scope

Add optional evidence/source references and classification helpers.

Do not build procurement or pricing connectors.

Do not rewrite all historical BOM fixtures.

Legacy “verified” labels without evidence should not automatically derive a `Verified` product truth badge.

---

## 10. Rights gate is a good foundation

`HttpSourceFetcher.fetchAndStoreSource()` explicitly checks:

- bulk ingestion
- full-text storage permission
- license/copyright status

and can store metadata-only records instead of full copyrighted content.

This is worth preserving.

### Type/runtime mismatch

The fetcher handles string statuses including concepts like:

- OPEN_LICENSE
- PERMITTED_FULL_TEXT
- RIGHTS_REVIEW_REQUIRED
- RIGHTS_RESTRICTED

while the current `AuthoritativeSourceDefinition.copyrightLicenseStatus` type is narrower.

FND-02 should reconcile the type contract without weakening fail-closed behavior.

---

## 11. Critical rights defect: loadLocalApprovedDocument

`HttpSourceFetcher.loadLocalApprovedDocument()` currently creates a `FetchedDocument` whose:

`licenseStatus = 'PUBLIC_DOMAIN'`

regardless of the actual source definition.

### Problem

“Local approved document” does not mean “public domain.”

A licensed, proprietary or restricted local document may be authorized for internal use while still being copyrighted.

### Required FND-02 repair

Preserve the source's real rights/license classification.

Local availability must never upgrade copyright status.

---

## 12. KnowledgeGraph provenance is string-based and overclaims verification

The knowledge graph stores fields like:

- `provenanceSource: string`
- `confidence: 1.0`
- `verificationStatus: 'VERIFIED'`

for seeded knowledge.

### Problem

A source-title string is not the same as evidence lineage.

A confidence of 1.0 does not make a claim authoritative.

### Recommendation

Do not rebuild the knowledge graph.

Add adapters so seeded/legacy assertions become canonical claims with:

- source classification;
- legacy provenance status;
- evidence refs when available;
- no automatic `Verified` truth badge from confidence alone.

---

## 13. Manager review and AI execution already provide useful provenance

`ManagerReviewRecord` already captures:

- reviewed source IDs
- chunk IDs
- knowledge pack
- execution mode
- test score
- shadow-work result
- decision/reasons/limitations

`AgentExecutionRecord` already captures:

- provider
- model
- scenario
- retrieved chunks
- prompt hash
- raw response
- structured proposal
- citations
- tool calls
- usage metadata
- execution status

These are excellent FND-05 inputs.

### FND-02 treatment

Do not redesign provider routing here.

Only provide claim/evidence adapters so model outputs remain proposals until promoted.

---

## 14. SourceProvenanceChain is valuable but learning-specific

`SourceProvenanceChain` already links:

source → document → hash → page/section → chunk → assertion → knowledge pack → decision.

This is a strong pattern.

### Gap

It is scoped to specialist learning, not live project truth.

FND-02 should generalize the concept through canonical `Evidence` and `Claim` records rather than trying to reuse the exact learning-only structure for everything.

---

## 15. Existing persistence is not FND-02's responsibility

SQLite/JSON persistence already stores:

- model revisions
- inspections
- BOM revisions
- decisions
- corpus sources
- fetched documents
- chunks
- assertions
- project events

FND-02 should define compatible domain records and in-memory/adapter behavior.

FND-03 owns PostgreSQL/PostGIS production persistence.

Do not widen FND-02 into a database migration.

---

## 16. Canonical model recommended by the audit

### SourceAuthorityClass

Examples:

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

### DerivationMethod

Examples:

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

These concepts should remain separate.

---

## 17. Product truth labels for HX

Derive labels, do not store them as arbitrary strings:

- Verified
- Project source
- Observed
- Calculated
- AI inferred
- Assumed
- Simulated
- Stale
- Needs professional review

### Important

`Verified` must require an allowed claim status + evidence/source authority appropriate to the claim.

A source string, confidence score or `LIVE_PROJECT` mode is not sufficient.

---

## 18. Promotion model

Recommended flow:

```text
source / observation / calculation / model output
                    ↓
                 CLAIM
                    ↓
             evidence attached
                    ↓
          policy/validator/reviewer
                    ↓
             PROMOTION EVENT
                    ↓
          canonical project state
```

Promotion must be explicit and auditable.

Examples:

- user location → claim, OWNER_INPUT, not verified jurisdiction
- public soil map → claim, REGIONAL_PUBLIC_DATA, not geotechnical design
- uploaded PE geotech report → professional-project evidence
- AI extracted bearing value → MODEL_INFERENCE/EXTRACTED claim until reviewed/promoted
- deterministic quantity → CALCULATED claim
- municipal inspection record → AHJ_RECORD, may promote AHJ status

---

## 19. Primary source files for FND-02

Expected:

- `src/types/hermes.ts`
- new canonical evidence/provenance helper module(s)
- `server/hermesLiveHouseEngine.ts`
- `server/httpSourceFetcher.ts`
- knowledge assertion/source adapters
- manager review / agent execution adapters only if needed
- focused tests

Potentially relevant:

- `server/sourceRegistry.ts`
- `server/knowledgeIngestionEngine.ts`
- `server/knowledgeGraphEngine.ts`
- `server/bomProvenanceEngine.ts`

Do not broadly rewrite all of them.

---

## 20. FND-02 conclusion

HERMES does **not** need to invent provenance from zero.

It needs to connect two currently separate worlds:

1. the sophisticated knowledge-ingestion provenance stack;
2. the live project world state.

FND-02 should create the canonical bridge between them and make false promotion to “verified” impossible.
