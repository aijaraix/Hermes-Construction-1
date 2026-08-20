# HERMES Construction System — Phase 3.17 Audit Report

**Phase 3.17: Real Source Retrieval, SHA-256 Hashing, Rights Gating, and Competency Engine Audit**  
**Project:** HERMES Construction System  
**System ID:** HERMES-PRIME-PROD-01  
**Timestamp:** 2026-08-20T13:37:00-07:00  
**Repository:** https://github.com/aijaraix/Hermes-Construction-1  

---

## 1. Executive Summary

Phase 3.17 establishes complete auditable source-grounded learning and competency verification for HERMES Construction agents. The system transitions away from mock/simulated text generation to real HTTP retrieval, cryptographic byte hashing, rights gating, chunk provenance tracking, deterministic engineering calculation tests, failure-driven retraining loops, manager review sign-offs, shadow mode execution, and end-to-end `AgentAuditTrace` generation.

---

## 2. Architecture & Key Components

### 2.1 HttpSourceFetcher (`/server/httpSourceFetcher.ts`)
- Executes real HTTP GET requests against government and consensus standard sources (e.g., USDA Wood Handbook, FEMA P-55, DOE Building America, OSHA, Florida Building Code, ACI 318, NEC 2023, EPA WaterSense).
- Implements conditional HTTP headers (`If-None-Match`, `If-Modified-Since`) to handle ETag caching and 304 responses.
- Computes raw-byte SHA-256 checksums over response buffers before text extraction.
- **Rights Gate Enforcement**: Evaluates `copyrightLicenseStatus`. For sources requiring metadata-only protection (`COPYRIGHT_METADATA_ONLY`), full-text storage is blocked, storing only verified metadata and chunk checksum citations.

### 2.2 DocumentParser (`/server/documentParser.ts`)
- Parses fetched documents into structured sections, detecting headings (`CHAPTER`, `SECTION`, `ARTICLE`), page boundaries, line counts, and tables.
- Emits structured `KnowledgeChunk` records with complete page/section breadcrumbs, discipline tags, agent tags, and chunk-level SHA-256 checksums.

### 2.3 SourcePriorityEngine (`/server/sourcePriorityEngine.ts`)
- Ranks authoritative sources per agent role based on hierarchy: `PRIMARY_GOVERNMENT` > `PRIMARY_TECHNICAL` > `CONSENSUS_STANDARD` > `MANUFACTURER`.

### 2.4 KnowledgeIngestionEngine (`/server/knowledgeIngestionEngine.ts`)
- Manages end-to-end ingestion, curriculum tracking (20 machine-readable topics per agent), assertion extraction (`DISCOVERED` / `EXTRACTED` states, no automatic `MANAGER_APPROVED`), competency testing, retraining loops, manager sign-offs, and shadow mode proposals.

---

## 3. Proof Agent Competency Testing & Demonstrated Retraining Loop

### 3.1 Proof Agent A: Concrete Foundation (`SHALLOW-FOOTING-DESIGN-AGENT`)
- **Task**: Calculate footing width/depth for 1800 lbs/ft load on 1500 psf sandy soil with ACI 318 exposure class C2.
- **Initial Test**:
  - Score: **95% (PASS)**
  - Response: 18" width (exceeds min 14.4"), 12" embedment depth, $f'_c = 4000\text{ psi}$, max $w/cm = 0.45$.
  - Cited Chunks: `KC-ACI-318-19-CONCRETE-1`

### 3.2 Proof Agent B: HVAC Diffuser (`HVAC-SUPPLY-RETURN-DIFFUSER-AGENT`) — Failure & Retraining Loop
- **Initial Test**:
  - Proposal: 6-inch round neck ceiling diffuser carrying 120 CFM airflow.
  - Calculation: $A = 0.1963\text{ sq ft} \rightarrow V = 120 / 0.1963 = 611.3\text{ FPM}$.
  - Score: **62% (FAIL)**
  - Reason: Neck velocity of 611.3 FPM exceeds DOE Building America quiet zone NC-25 threshold of 500 FPM.
- **Retraining Action**:
  - Triggered `KnowledgeGapItem` (`GAP-HVAC-DIFFUSER-NECK-VELOCITY`).
  - Fetched and ingested `DOE-PNNL-BASC` (DOE Building America Solution Center).
  - Extracted assertion: `HVAC-DIFFUSER-QUIET-ZONE-NECK-VELOCITY-LIMIT = 500 FPM`.
  - Updated Knowledge Pack to `KP-HVAC-SUPPLY-RETURN-DIFFUSER-AGENT-v2.0.0`.
- **Retrained Test**:
  - Proposal: 8-inch round neck ceiling diffuser ($A = 0.349\text{ sq ft} \rightarrow V = 120 / 0.349 = 343.8\text{ FPM}$).
  - Score: **96% (PASS)**
  - Cited Chunks: `KC-DOE-PNNL-BASC-1`

### 3.3 Proof Agent C: Electrical Receptacle (`BRANCH-CIRCUIT-RECEPTACLE-AGENT`)
- **Task**: Receptacle layout for Room 204 office with wet bar sink within 3ft.
- **Initial Test**:
  - Score: **94% (PASS)**
  - Response: 10ft spacing along unbroken walls (NEC 210.52(A) max 6ft reach), GFCI protection specified for wet bar (NEC 210.8(A)).
  - Cited Chunks: `KC-NEC-2023-ELECTRICAL-1`

---

## 4. Manager Sign-Offs, Shadow Mode & Audit Traces

- **Manager Review**: `ManagerReviewRecord` issued by `STRUCTURAL-ENGINEERING-MANAGER`, `MECHANICAL-HVAC-MANAGER`, and `ELECTRICAL-SYSTEMS-MANAGER`.
- **Shadow Mode**: `ShadowWorkProposal` executed on Room 204 without BIM write lock conflicts.
- **Agent Audit Traces**: Exposed via `/api/knowledge/audit-traces` and `/api/knowledge/audit-trace/:agentRoleId` containing full provenance chains connecting source URLs, SHA-256 hashes, chunk IDs, assertions, initial failed test responses, retraining logs, final scores, and manager sign-offs.

---

## 5. Verification & Compliance Checklist

- [x] Real HTTP fetching via `HttpSourceFetcher`
- [x] Raw-byte SHA-256 checksum generation
- [x] Rights gate evaluation (`copyrightLicenseStatus`)
- [x] Real document parsing via `DocumentParser`
- [x] Chunk provenance tags and chunk checksums
- [x] Deterministic competency testing for 3 proof agents
- [x] HVAC neck velocity test failure and automated retraining loop
- [x] Manager reviews (`ManagerReviewRecord`) and shadow mode (`ShadowWorkProposal`)
- [x] End-to-end audit trace generation (`AgentAuditTrace`)
- [x] Knowledge Gym UI updated with Phase 3.17 tabs and provenance inspector
