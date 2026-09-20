# HERMES MATERIALS + PROCUREMENT HUMAN WORKSPACE — IMPLEMENTATION SPEC

Status: Source-audited product and implementation architecture
Purpose: Turn HERMES material demand, physical material state, supplier/price evidence, cost, and installation linkage into one human-readable construction workspace without collapsing distinct truth layers.

## 1. Product objective

A person opening Materials should immediately be able to answer:
- What does this project need?
- How much is required?
- What has actually been purchased?
- What is in transit?
- What is physically on site?
- Where is it staged?
- What has been installed?
- What task/component is it for?
- Who supplied it?
- What price is actually verified?
- What is only estimated?
- What is missing, delayed, damaged, wasted, or unverified?

Selecting a physical batch or material line should connect back to the 3D world when canonical links exist.

## 2. Preserve three truth layers

HERMES currently has three related but different material truth layers.

### A. Demand / quantity truth
Canonical sources include worldState.bomItems and the older BOMItem contract.
These describe what the modeled project requires, the quantity source, units, waste/procurement quantity where supported, cost inputs, price origin, and source components.

### B. Physical batch truth
Canonical sources include worldState.materialsOnsite / MaterialStagingEntity and MaterialSpatialRecord.
These describe actual tracked batches, quantity, location, world position, dimensions, target component, supplier, verification state, assigned task/carrier, and movement history where available.

### C. Supplier / price evidence truth
Canonical sources include SupplierSource and ProcurementStore PriceEvidenceRecord.
These describe supplier identity, distance/lead time/products and separate price evidence with source document, retrieval date, verification classification, expiration, and project scope.

Do NOT merge these three layers into a single invented material record unless a canonical identifier/evidence relationship exists.

## 3. Current source reality

Current live MaterialStagingEntity supports:
- materialBatchId
- name
- category
- quantity / unit
- currentLocation: OFFSITE_SUPPLIER / TRANSIT_TRUCK / LAYDOWN_YARD / INSTALLED_BUILDING
- worldPosition / dimensionsXYZ
- targetComponentId
- supplierName
- verificationStatus: ESTIMATED / PURCHASED / DELIVERED_VERIFIED / INSTALLED
- createdCheckpoint

General MaterialSpatialRecord additionally supports:
- status: PLANNED / ORDERED / IN_TRANSIT / DELIVERED / STAGED / ALLOCATED / CARRIED / INSTALLED / CONSUMED / DAMAGED / WASTE / RETURNED
- stagingZoneId
- assignedTaskId
- carriedByAgentId
- movementHistory

Current live BOM/QTO line supports:
- itemId
- category / description
- quantity / unitOfMeasure
- quantitySource
- materialUnitCostUSD
- laborUnitCostUSD
- equipmentUnitCostUSD
- extendedCostUSD
- costScope
- priceOrigin

Older BOMItem additionally supports procurement quantity, waste, supplier, lead time, price source/date, confidence, and source component IDs.

## 4. Critical truth repairs

### BOMView fabricated fallback
The current BOMView synthesizes a full turnkey cost breakdown by percentages when canonical costScopeBreakdown is missing.
This must be removed from the future workspace.

Rule: if canonical cost breakdown does not exist, show Not yet calculated.

### ProcurementView universal verification badge
The current ProcurementView displays VERIFIED_CURRENT_QUOTE on every supplier card regardless of evidence.
This must be removed.

Rule: price verification badges must come from actual PriceEvidenceRecord / price source truth.

### Physical location vs verification
A current live batch can say currentLocation = LAYDOWN_YARD while verificationStatus = PURCHASED.
Do not silently convert that into Delivered verified.

Human label should make the distinction explicit, for example:
- On site location recorded — delivery not verified

## 5. Human lifecycle

Human-facing lifecycle should support these normalized stages where canonical data supports them:

REQUIRED
PRICED
PURCHASED
IN_TRANSIT
DELIVERED
STAGED
ALLOCATED
CARRIED
INSTALLED
CONSUMED
DAMAGED
WASTE
RETURNED
UNKNOWN

Additional display qualifier:
UNVERIFIED

Do not force every project through every stage when the current data model does not record it.

## 6. Workspace layout

Materials opens as an internal HERMES workspace over the construction world, not a separate website page.

Recommended top-level tabs:
1. Overview
2. Requirements
3. On Site
4. Procurement
5. Suppliers & Price Evidence
6. Installed
7. Exceptions

## 7. Overview

Show only canonical/derived-safe summary values:
- material requirement line count
- physical batch count
- batches on site
- installed batches
- in-transit batches
- damaged/waste batches
- known supplier count
- verified price evidence count
- material cost total only when canonical price data supports it
- attention count

No fabricated turnkey estimate.

## 8. Requirements tab

Use BOM/QTO demand records.

Columns:
- Material / description
- Category
- Required quantity
- Unit
- Quantity source
- Procurement quantity when canonical
- Waste factor when canonical
- Material unit cost when canonical
- Price origin / evidence
- Linked components when canonical
- Status of matching physical supply only if an explicit relationship exists

Action:
- View linked components in 3D

Do not join a demand line to a physical batch by fuzzy name alone.

## 9. On Site tab

Use physical batch records.

For each batch show:
- name / batch ID
- quantity / unit
- category
- human lifecycle
- verification status
- current physical location
- supplier
- target component
- assigned task where supported
- world coordinates
- created checkpoint

Actions:
- Focus in world
- Highlight staging location
- Highlight target component
- Open material inspector

## 10. Procurement tab

This is the operational flow view.

Group records by current known state:
- Required / not ordered
- Purchased
- In transit
- Delivered
- Staged
- Installed
- Exceptions

Only show a bucket when records support it.

Future actions may include:
- Prepare RFQ
- Compare approved alternatives
- Prepare order
- Approve purchase
- Track shipment
- Record delivery
- Reconcile receipt

Purchasing actions must require explicit user authorization.

## 11. Suppliers & Price Evidence

Supplier identity and price evidence are separate.

Supplier card may show:
- supplier
- category
- address
- distance
- lead time
- products / availability

Price evidence row may show:
- specification
- amount / unit
- verification classification
- source document
- retrieved date
- expiration date
- expired/current status
- project scope

Never display VERIFIED CURRENT QUOTE unless evidence says it.

## 12. Installed tab

Show batches/components where canonical state says installed.

Link:
- material batch
- target component
- installation task
- actor/agent where supported
- inspection state of the component

Do not infer inspection from material installation.

## 13. Exceptions

Surface only canonical exceptions:
- required but no physical supply linked when explicit mapping exists
- in-transit delay when schedule/evidence exists
- damaged
- waste
- returned
- verification mismatch
- missing/expired price evidence
- material required by active task but unavailable

Current live engine does not yet model all these states. Unsupported exception types must not be fabricated.

## 14. Material truth badges

Suggested display taxonomy:
- MODELED — quantity derived from model
- ESTIMATE — price/quantity is estimated
- PURCHASED — purchase state recorded
- DELIVERY VERIFIED — physical receipt verified
- STAGED — physical location recorded on site
- INSTALLED — canonical install state
- PRICE VERIFIED — evidence-backed current price
- PRICE EXPIRED — previously evidenced price no longer current
- UNVERIFIED — record exists but evidence is incomplete

## 15. 3D integration

Materials must remain spatial.

Selecting a batch can highlight:
- batch/staging geometry
- target component
- assigned work location
- route/history later

Selecting a BOM requirement can highlight source/linked model components when IDs exist.

## 16. Reconciliation model

Long-term target:
required → approved procurement → ordered → in transit → delivered → staged → allocated → installed → inspected

with side paths:
damaged / waste / returned / substituted

Reconciliation should eventually answer:
- ordered quantity
- received quantity
- installed quantity
- remaining quantity
- waste/damage
- variance

Current live MaterialStagingEntity has one quantity per batch and does not yet support partial consumption accounting. The UI must not pretend it does.

## 17. Cost truth

Current live world has costScopeBreakdown only after the QTO/cost task executes.

Before that:
- show Not yet calculated for absent totals
- do not generate percentage-based fallback costs

For BOM lines distinguish:
- material unit cost
- labor unit cost
- equipment unit cost
- extended scoped cost
- price origin

Do not label extended cost as pure material cost when it includes other scopes.

## 18. Implementation architecture

Recommended:
- src/lib/materialWorkspaceState.ts — normalized human adapter
- future src/components/immersive/MaterialsWorkspace.tsx
- reuse UniversalInspector for selected material
- reuse existing BOMView/ProcurementView only temporarily after truth defects are removed

## 19. First implementation slice — MATERIALS-01

Implement:
- Overview
- Requirements
- On Site
- lifecycle/verification badges
- Focus in 3D
- canonical cost visibility
- exceptions for data conflicts

Defer:
- ordering actions
- payment
- live supplier integrations
- automated purchasing
- invoice reconciliation
- tax treatment
- partial batch consumption

## 20. Acceptance

A user can open Materials and answer:
1. What materials are currently modeled/required?
2. What physical batches exist?
3. Which batches are actually on site?
4. Which are installed?
5. Which supplier is recorded?
6. Which price is verified vs estimated?
7. Which component/task is the material linked to?
8. Where is the batch in the 3D world?
9. What material/cost data is not yet known?
10. Are there any truth mismatches requiring attention?

Unknown information must remain visibly unknown.