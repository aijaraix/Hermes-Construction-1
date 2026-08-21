# DATA TRUTH CANONICAL OWNERS

| Canonical Data Key | Owner Name | Retrieval Method | Allowed Provenance |
| :--- | :--- | :--- | :--- |
| `AGENT_ROLE_COUNT` | AgentRegistry | `AgentRegistry.getAllContracts().length` | `RUNTIME_CALCULATED`, `DATABASE_RECORD` |
| `CERTIFIED_AGENT_COUNT` | Knowledge Engine | `KnowledgeIngestionEngine.getCertifiedCount()` | `RUNTIME_CALCULATED`, `DATABASE_RECORD` |
| `PROJECT_COUNT` | ProjectRepository | `ProjectRepository.getAllProjects().length` | `RUNTIME_CALCULATED`, `DATABASE_RECORD` |
| `BOM_TOTAL` | BOM Store | `BOMStore.calculateTotalCost()` | `RUNTIME_CALCULATED`, `AGENT_GENERATED_VALIDATED` |
| `ROOM_COUNT` | Spatial BIM Model | `Project.components.reduce(rooms)` | `RUNTIME_CALCULATED` |
| `INSPECTION_COUNT` | Inspection Repository | `InspectionStore.getTickets()` | `RUNTIME_CALCULATED`, `DATABASE_RECORD` |
| `PRICE` | Procurement Evidence Store | `ProcurementStore.getRecord()` | `EXTERNAL_VERIFIED` |
| `BUILD_METADATA` | BuildMetadata | `BuildMetadata.get()` | `CONFIGURATION`, `RUNTIME_CALCULATED` |
