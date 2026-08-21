# UI FIELD AUDIT REGISTRY

| Field ID | Route | Component | Field Name | Canonical Key | Repair Policy | Criticality |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `UI-ORG-AGENT-COUNT` | `/agent-org` | `AgentCountBadge` | `totalAgentRoles` | `AGENT_ROLE_COUNT` | `AUTO_FIX_BINDING` | `CRITICAL` |
| `UI-ORG-CERTIFIED-COUNT` | `/agent-org` | `AgentCertificationCard` | `certifiedAgents` | `CERTIFIED_AGENT_COUNT` | `AUTO_FIX_BINDING` | `MAJOR` |
| `UI-CMD-PROJECT-COUNT` | `/` | `CommandCenterHUD` | `activeProjects` | `PROJECT_COUNT` | `AUTO_FIX_BINDING` | `MAJOR` |
| `UI-OVERVIEW-BOM-TOTAL` | `/overview` | `ProjectOverviewView` | `totalCost` | `BOM_TOTAL` | `AUTO_FIX_BINDING` | `CRITICAL` |
| `UI-BOM-SUM-TOTAL` | `/bom` | `BOMView` | `totalEstimatedMaterialCost` | `BOM_TOTAL` | `AUTO_FIX_BINDING` | `CRITICAL` |
| `UI-PROC-CONCRETE-PRICE` | `/procurement` | `SupplierPriceCard` | `concretePricePerYd` | `PRICE` | `DOWNGRADE_STATUS` | `MAJOR` |
| `UI-APP-BUILD-VERSION` | `*` | `AppShellHeader` | `headerBuildVersion` | `BUILD_METADATA` | `AUTO_FIX_BINDING` | `MAJOR` |
| `UI-ROOMS-COUNT` | `/rooms` | `RoomsSpacesView` | `totalRoomCount` | `ROOM_COUNT` | `AUTO_FIX_BINDING` | `MINOR` |
| `UI-INSPECTION-OPEN-COUNT` | `/inspections` | `InspectionsView` | `openTickets` | `INSPECTION_COUNT` | `AUTO_FIX_BINDING` | `MAJOR` |
