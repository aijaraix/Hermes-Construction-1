# HERMES CONSTRUCTION — CONSTRUCTION KNOWLEDGE CORPUS

## Overview
The **Construction Knowledge Corpus** is the shared structured knowledge repository powering HERMES Construction. Knowledge is extracted from high-authority government, engineering, and manufacturer sources into normalized chunks, entities, property tables, and process graphs.

---

## Entity & Rule Structure

```typescript
export interface KnowledgeChunk {
  chunkId: string;             // "CHUNK-FPL-GTR282-P142"
  sourceId: string;            // "USDA-FPL-GTR282"
  pageOrSection: string;       // "Chapter 8: Fasteners"
  headingHierarchy: string[];  // ["Wood Handbook", "Fasteners", "Nail Withdrawal"]
  rawText: string;             // Unaltered source text
  normalizedText: string;      // Normalized clean text
  topic: string;               // "Wood Fastener Capacity"
  discipline: string;          // "Structure"
  agentTags: string[];         // ["FASTENER-UPLIFT-AGENT", "WOOD-FRAME-AGENT"]
  materialTags: string[];      // ["Southern Yellow Pine", "316 Stainless Steel"]
  processTags: string[];       // ["Nailing", "Lumber Framing"]
  jurisdictionTags: string[];  // ["NATIONAL", "FLORIDA"]
  version: string;             // "v1.0"
  sourceURL: string;
  retrievalTimestamp: string;
  rightsStatus: string;        // "PUBLIC_DOMAIN"
}
```

---

## Knowledge Types (`KnowledgeEntity`)
1. `MATERIAL_PROPERTY`: Yield strength, modulus of elasticity, moisture expansion coefficient.
2. `PHYSICAL_FACT`: Unit weight of reinforced concrete ($150\text{ pcf}$), density of SYP lumber ($35\text{ pcf}$).
3. `ENGINEERING_PROPERTY`: Allowable tension load for $5/8"$ Grade 316 SS bolt in 4000 PSI concrete ($1,250\text{ LBF}$).
4. `CODE_RULE`: FBC 2023 Section 1609 wind load calculation rules; NEC 2023 Article 210 GFCI protection distance ($6\text{ ft}$ from sink edge).
5. `MANUFACTURER_PRODUCT_DATA`: SIMPSON Strong-Tie Hurricane Tie H2.5A allowable uplift load ($595\text{ LBF}$).
6. `INSTALLATION_REQUIREMENT`: Stego Wrap vapor retarder $6"\text{ overlap}$ at seams, sealed with Stego Tape.
7. `FAILURE_HISTORY`: Galvanized fastener zinc depletion in salt air ($< 3.0\text{ miles}$ from ocean) causing premature shear failure.
