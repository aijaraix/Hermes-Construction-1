# HERMES Knowledge Graph & Construction Patterns

## Structured Knowledge Graph
HERMES stores construction knowledge entities (`KnowledgeEntity`) with:
- **Type**: `MATERIAL`, `ASSEMBLY`, `ENVIRONMENT`, `METHOD`, `HAZARD`, `FAILURE_MODE`, `CODE_REQUIREMENT`, `PRODUCT`, `SUPPLIER`
- **Promotion Status**: `DISCOVERED` -> `CANDIDATE` -> `CORROBORATED` -> `VERIFIED` -> `APPROVED` -> `DEPRECATED`
- **Provenance & Confidence**: Source document evidence and confidence score (0-100%)

## Postmortems & Lessons Learned
Upon project completion, HERMES extracts structured postmortems detailing what worked, what failed, what required repair, and creates reusable assembly patterns for future Gym exercises.
