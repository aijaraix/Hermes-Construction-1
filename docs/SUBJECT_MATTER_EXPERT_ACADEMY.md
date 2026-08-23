# HERMES SUBJECT-MATTER EXPERT ACADEMY
## Autonomous Continuous Knowledge Ingestion & Domain Mastery Framework

### Overview
The Subject-Matter Expert Academy is HERMES Construction's continuous knowledge acquisition engine. Managed jointly by `HERMES-LEARNING-EXECUTIVE` and `CONSTRUCTION-KNOWLEDGE-DIRECTOR`, the Academy discovers, fetches, parses, chunks, and indexes primary technical sources to train specialist trade agents across all construction disciplines.

---

### Knowledge Ingestion Pipeline
1. **Source Discovery**: Ingests authoritative sources from `SourceRegistry` (Primary Government, National Labs, Academic Research, Consensus Standards, Manufacturer Specs).
2. **Rights & Clearance Check**: Validates license status (`PUBLIC_DOMAIN`, `PERMITTED_OPEN`, `COPYRIGHT_METADATA_ONLY`).
3. **HTTP / File Retrieval**: Fetches original document buffers and computes SHA-256 integrity checksums.
4. **Document Storage**: Registers documents in the permanent HERMES Document Library with full metadata (page count, authority, target agents, materials).
5. **Multi-Format Parsing**: Extracts text via `pdf2json` stream parsers or fallback HTML/Text parsers.
6. **Semantic Chunking**: Segments text into structured 500-1000 token chunks retaining page numbers, section headers, and citation references.
7. **Assertion Extraction**: Extracts structured triples (`subject`, `predicate`, `objectValue`, `units`, `codeRule`) with citation grounding.
8. **Shared Knowledge Graph Integration**: Links assertions to shared materials, failure modes, assemblies, and deterministic engineering calculations.
9. **Knowledge Pack Invalidation & Versioning**: Generates versioned Agent Knowledge Packs (`KP-v1.0.0`, `KP-v1.1.0`) upon manager signoff.

---

### Quota-Aware & Unattended Execution
- **Provider Quota Resilience**: If LLM reasoning APIs return rate limits (HTTP 429 / quota exceeded), the Academy continues all non-LLM operations—fetching, parsing, chunking, hashing, indexing, and deduplicating documents—without halting.
- **Unattended Server Heartbeat**: The server background ticker (`setInterval`) regularly dispatches learning cycles for agents with open knowledge gaps, ensuring continuous autonomous operation without manual button clicks.
