# HERMES FND-02 COMPATIBILITY & TEST MATRIX

## Purpose

Preserve working provenance and Academy behavior while preventing unsupported information from becoming verified project truth.

| Existing system | Current useful behavior | Current risk/gap | FND-02 treatment |
|---|---|---|---|
| TruthOrigin | distinguishes measured/calculated/simulated/etc. | overloaded; invalid extra values used through casts | retain legacy, map into separated authority/derivation/reality |
| AuthoritativeSourceDefinition | rich source authority + rights metadata | learning-specific; rights enum narrower than runtime | adapt to canonical Source; reconcile types fail-closed |
| HttpSourceFetcher | checksum, fetch status, rights gate | local approved path forces PUBLIC_DOMAIN | preserve gate; repair license inheritance |
| FetchedDocument | hash, source, URI, rights, parser substrate | not general project Evidence | adapter to Evidence |
| KnowledgeChunk | source/page/retrieval linkage | knowledge-specific | keep; evidence lineage input |
| KnowledgeAssertion | subject/predicate/value/source/page/confidence/status | no canonical project entity/revision/evidence IDs | adapt to Claim |
| SourceProvenanceChain | excellent end-to-end learning lineage | specialist-learning-specific | reference/adapt, do not reuse as universal schema |
| AgentExecutionRecord | provider/model/prompt hash/citations/tools | output can exist without project claim promotion semantics | map output to MODEL_INFERENCE claim/provenance |
| ManagerReviewRecord | reviewed evidence and decision | internal manager may be mistaken for professional authority | classify authority explicitly |
| JurisdictionTruth | status + sourceEvidence | LIVE + location can become VERIFIED_SOURCE | require canonical evidence/promotion |
| GeotechTruth | origin + evidenceNotes | user bearing can become VERIFIED_IMPORT; ASTM note can imply test | user input stays assumption until project evidence |
| FoundationSelectionTruth | deterministic selection | can inherit false verified engineering state | derivation remains calculated; authority follows evidence |
| HermesInspectionTicket | separates HERMES/professional/AHJ/CO | internal task can populate external approval fields | authority-gated promotion |
| Material verificationStatus | lifecycle progression | verification and lifecycle conflated | retain enum; attach evidence/claim semantics |
| BOM priceSource | human-readable price provenance | “VERIFIED” labels may have no evidence | legacy label does not equal canonical Verified |
| QuantityTakeoff priceOrigin | source category | no evidence refs | optional evidence/source refs |
| KnowledgeGraph | provenanceSource/confidence/verification | string provenance + 1.0 confidence overstates evidence | adapter only; no automatic project Verified |
| SQLite project events | current audit persistence | not production evidence store | keep; FND-03 later |
| FND-01 canonical identity | stable identity/revisions/frames/units | unavailable on remote main | must be preserved as prerequisite |

## Critical promotion rules

### Verified is never derived from

- LIVE_PROJECT mode alone
- a non-empty location
- a confidence score
- a source title string
- a user-entered engineering value
- an AI model response
- a simulation fixture
- an internal HERMES manager
- a legacy label containing the word VERIFIED

### Professional approval requires

- explicit professional authority class
- evidence
- project/revision applicability
- promotion/review event

### AHJ approval requires

- AHJ authority/evidence
- project applicability
- promotion event

### Geotechnical project truth requires

For project-specific verified design conclusions:

- project-specific lab/field/professional evidence

Regional public soil data may support planning context only.

## Do-not-break invariants

1. FND-01 canonical IDs/revisions/units/frames remain intact.
2. Academy House task/event sequence remains intact.
3. LVL future-constructability proof remains intact.
4. Existing knowledge ingestion rights gate remains fail-closed.
5. Existing document hashes/checksums remain stable.
6. Existing learning/source audit trails remain inspectable.
7. Existing event stream remains canonical audit history.
8. Runtime-generated files remain untouched unless explicitly authorized.
9. No database migration.
10. No frontend redesign.

## Required focused tests

| ID | Expected proof |
|---|---|
| SRC-01 | source adapter retains authority/rights/version |
| RIGHTS-01 | local restricted document remains restricted |
| RIGHTS-02 | reference-only source cannot become full-text cacheable |
| CLAIM-01 | model inference cannot directly become Verified |
| CLAIM-02 | superseded claim remains historically available |
| TRUTH-01 | simulation cannot derive Verified |
| TRUTH-02 | owner location cannot derive verified jurisdiction |
| GEO-01 | user bearing != verified geotech import |
| GEO-02 | regional soil != professional geotech conclusion |
| PRO-01 | internal manager != licensed professional |
| AHJ-01 | HERMES validation != AHJ approval |
| AHJ-02 | AHJ evidence can support AHJ promotion |
| PRICE-01 | verified-looking price string without evidence != canonical Verified |
| EVID-01 | fetched document becomes hash-backed Evidence |
| ASSERT-01 | KnowledgeAssertion adapts to Claim |
| ORIGIN-01 | legacy aliases map to separate truth axes |
| HX-01 | truth labels are deterministic |

## Deferred

FND-03:
- persistent canonical Source/Evidence/Claim tables
- object storage

FND-04:
- IFC source/model evidence and revision normalization

FND-05:
- provider-neutral AI routing and full AiRun provenance integration

HX:
- user-facing badges, evidence drawer, provenance inspector
