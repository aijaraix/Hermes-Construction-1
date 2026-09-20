# HERMES MATERIALS-01 — EXACT IMPLEMENTATION TICKET

Status: Ready for future bounded implementation
Purpose: Build the first truthful human materials workspace using the source-audited adapters already committed on the planning branch.

## 1. Read first

- docs/HERMES_MATERIALS_PROCUREMENT_HUMAN_WORKSPACE_SPEC.md
- src/lib/materialWorkspaceState.ts
- docs/HERMES_UNIVERSAL_INSPECTOR_IMPLEMENTATION_SPEC.md
- src/lib/inspectableEntity.ts
- docs/HERMES_HUMAN_STATUS_LAYER_IMPLEMENTATION_SPEC.md

## 2. Scope

Implement MATERIALS-01 only.

Required capabilities:
- Materials workspace opens inside immersive HERMES project shell
- Overview
- Requirements
- On Site
- lifecycle / verification badges
- truth warnings
- canonical cost values only
- View/Focus in 3D when canonical IDs exist
- select batch → universal inspector compatibility

Do NOT implement ordering, payment, live supplier integrations, invoices, tax, partial batch consumption, or autonomous purchasing.

## 3. Current source facts

Live project world currently exposes physical material batches through worldState.materialsOnsite.
Live QTO/BOM is created later through worldState.bomItems.
Live costScopeBreakdown is created later through canonical QTO/cost execution.

Current App.tsx fallback project has bom: [] and suppliers: [].
Current ProcurementView receives currentProject.suppliers and therefore has no live-project supplier data by default.

ProcurementStore currently contains seeded PriceEvidenceRecord data but no exposed live-project procurement API was found during audit.
Those seeded records are scoped to historical RESIDENCE-TAMPA-001, not HERMES-LIVE-HOUSE-001.

Do not surface those historical records as if they are live-project supplier evidence.

## 4. Truth repairs required

### BOMView
Remove or bypass the percentage-based fabricated costScopeBreakdown fallback.
If canonical costScopeBreakdown is absent, show Not yet calculated.

### ProcurementView
Do not display VERIFIED_CURRENT_QUOTE universally.
Verification badges require actual evidence.

### Material batch status
Do not equate currentLocation = LAYDOWN_YARD with verified delivery when verificationStatus is only PURCHASED.
Use the adapter's STAGED_UNVERIFIED state and warning.

## 5. Allowed files

Preferred:
- src/components/immersive/MaterialsWorkspace.tsx
- src/lib/materialWorkspaceState.ts
- src/components/BOMView.tsx only if needed to remove false fallback
- src/components/ProcurementView.tsx only if needed to remove false badge
- src/App.tsx or immersive workspace registry only to mount the internal workspace
- Universal inspector selection bridge if already implemented

Do not touch server runtime unless separately authorized.

## 6. UI

Overview cards:
- Requirements
- Physical batches
- On site
- Installed
- In transit
- Needs attention
- Canonical material cost when available
- Canonical turnkey cost when available

Tabs:
- Requirements
- On Site
- Procurement
- Installed
- Exceptions

For MATERIALS-01, Suppliers & Price Evidence may show Not connected for this live project rather than old historical data.

## 7. Requirements table

Columns:
- Material
- Category
- Required quantity
- Unit
- Quantity source
- Unit material cost if canonical
- Price origin
- Extended scoped cost
- Linked 3D objects

Do not call extended scoped cost pure material cost if labor/equipment are included.

## 8. On Site table/cards

Show:
- batch name / ID
- quantity
- stage label
- verification
- physical location
- supplier name from batch record
- target component
- task when present
- world location
- warning badge when lifecycle truth conflicts

Actions:
- Focus in world
- Highlight target component
- Inspect

## 9. Procurement tab

Use only canonical physical lifecycle information available from batches.
Do not invent purchase orders.

Buckets can include:
- Purchased
- In transit
- Delivered / staged
- Installed
- Exceptions

## 10. Exceptions

Surface adapter attention items.

Do not infer missing inventory shortages without an explicit demand-to-batch relationship.

## 11. Supplier evidence gap

Until a live-project supplier/price API exists:
- do not use historical ProcurementStore records
- do not claim verified quote coverage
- show Supplier price evidence not connected for this live project where appropriate

A later PROCUREMENT-01 server ticket should expose project-scoped price evidence.

## 12. 3D integration

Batch selection should use material batch ID.
If the world renderer already represents that batch, focus/highlight it.
If targetComponentId exists, expose a separate Highlight target action.

Do not fuzzy match names.

## 13. Acceptance

Pass when:
1. Materials opens without leaving the project application.
2. Summary counts match materialWorkspaceState.
3. No fake cost breakdown appears before canonical calculation.
4. PURCHASED + LAYDOWN_YARD is visibly marked as unverified staging, not verified delivery.
5. Installed batches reflect canonical install state.
6. BOM/QTO values are canonical.
7. Historical supplier evidence is not shown as live.
8. 3D focus works when IDs exist.
9. Selecting a batch opens/feeds the inspector.
10. Empty/unknown values remain unknown.

## 14. Stop condition

Stop after MATERIALS-01.
Do not continue into purchasing actions, supplier APIs, invoicing, bookkeeping, or robotics.