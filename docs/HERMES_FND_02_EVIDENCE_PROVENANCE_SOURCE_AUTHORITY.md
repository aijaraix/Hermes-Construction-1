# HERMES FND-02 — EVIDENCE, PROVENANCE, SOURCE AUTHORITY & TRUTH CLASSIFICATION

## Objective

Make every important HERMES claim capable of answering:

> Where did this come from, how authoritative is it, when was it valid, and who/what promoted it into project truth?

This ticket builds on FND-01 identity/revision semantics.

## Required concepts

### 1. Source registry

Create a canonical source registry.

Minimum fields:

```ts
Source {
  sourceId
  sourceType
  owner/maintainer?
  title
  uri?
  jurisdiction?
  edition/version?
  effectiveFrom?
  effectiveTo?
  licenseStatus
  rightsClassification
  updateCadence?
  authorityClass
}
```

### 2. Truth / authority classes

Support explicit source classes such as:

- `REGIONAL_PUBLIC_DATA`
- `SITE_REMOTE_SENSING`
- `PROJECT_SURVEY`
- `FIELD_OBSERVATION`
- `LAB_TEST`
- `LICENSED_PROFESSIONAL_REPORT`
- `CONTRACT_DOCUMENT`
- `AHJ_RECORD`
- `MANUFACTURER_DATA`
- `SUPPLIER_QUOTE`
- `OWNER_INPUT`
- `DETERMINISTIC_CALCULATION`
- `MODEL_INFERENCE`
- `SIMULATION_FIXTURE`

Exact naming may follow current enum conventions.

### 3. Evidence

Minimum model:

```ts
Evidence {
  evidenceId
  projectId
  sourceId
  artifactUri?
  artifactHash?
  mimeType?
  capturedAt?
  observedAt?
  recordedAt
  authorOrDevice?
  spatialFrameId?
  pose?
  projectRevisionId?
  rightsClassification?
  confidentiality?
  retentionPolicy?
}
```

### 4. Claim

A claim is not automatically canonical truth.

Minimum semantics:

```ts
Claim {
  claimId
  subjectEntityId
  predicate
  value
  units?
  validFrom?
  validTo?
  confidence?
  evidenceIds[]
  derivationMethod
  softwareOrModelVersion?
  status
  approvedBy?
}
```

Suggested statuses:

- proposed
- observed
- calculated
- verified
- rejected
- stale
- superseded
- professional-review-required

### 5. Promotion boundary

Define the explicit path by which:

- AI extraction;
- computer vision;
- public datasets;
- field observation;
- deterministic calculations

may propose a claim.

A proposed claim does **not** silently mutate canonical entity state.

Promotion must follow project policy and create an auditable event.

### 6. Product truth labels

Provide normalized labels usable by HX:

- Verified
- Project source
- Observed
- Calculated
- AI inferred
- Assumed
- Simulated
- Stale
- Needs professional review

These labels should be derivable from canonical source/claim state rather than hardcoded UI prose.

### 7. Professional/AHJ separation

Preserve and generalize the existing distinction between:

- HERMES validation;
- licensed-professional approval;
- AHJ inspection/approval;
- certificate-of-occupancy / legal completion state.

Never promote internal HERMES validation into external statutory approval.

## Rights/licensing fields

The source registry should permit:

- `REDISTRIBUTABLE`
- `CACHE_ALLOWED`
- `REFERENCE_ONLY`
- `LICENSE_REVIEW_REQUIRED`
- `DO_NOT_STORE`

Do not ingest copyrighted standards merely because a URL exists.

## Compatibility

Integrate with:

- current event records;
- existing inspection/approval structures;
- current geotech origin fields;
- material verification states;
- cost price-origin semantics;
- HX inspector/status adapters.

Avoid mass-migrating old fixtures in one pass.

## Acceptance

Tests must show:

1. Simulation assumptions cannot present as verified project evidence.
2. Regional public soil data cannot become a professional geotechnical conclusion.
3. AI-extracted claim remains proposed until promotion policy passes.
4. Evidence can be attached to entity/task/material/inspection claims.
5. Superseded claims remain historically inspectable.
6. HERMES validation remains distinct from professional/AHJ status.
7. Truth labels are deterministically derived.

## Non-goals

Do not implement:

- OCR provider integration;
- reality capture;
- large document storage;
- legal interpretation engine;
- full standards ingestion.

Those depend on this contract later.
