# HERMES OWNER / RENOVATION LIFECYCLE ARCHITECTURE

**Status:** Future product architecture  
**Purpose:** Extend the same HERMES canonical construction world from professional construction into homeowner, renovation, fixer-upper, small-builder, and property-lifecycle workflows.

## 1. Core product idea

A homeowner should be able to give HERMES an existing property and turn it into a living, editable, understandable construction model.

Inputs may include:

- floor plans;
- PDFs;
- architectural drawings;
- IFC/BIM;
- photos;
- video walkthroughs;
- phone/LiDAR scans;
- manual dimensions;
- inspection reports;
- survey/property information;
- receipts/invoices;
- product specifications.

HERMES reconstructs a canonical model of the existing building.

The homeowner can then explore, edit, renovate, budget, schedule, procure, document, and monitor work from the same object-centric world used by professional HERMES workflows.

## 2. Existing-home reconstruction

Target workflow:

1. Upload drawings/plans.
2. Parse spaces, walls, doors, windows, stairs, fixtures, and major systems.
3. Reconstruct an initial 3D model.
4. Ask the owner for missing dimensions/unknowns.
5. Reconcile photos/scans/video against the model.
6. Label uncertain geometry as estimated/unverified.
7. Create an existing-condition digital twin.

Do not silently fabricate unknown building conditions.

Use truth states such as:

- VERIFIED_FROM_SOURCE;
- MEASURED;
- OBSERVED;
- OWNER_PROVIDED;
- ESTIMATED;
- UNKNOWN;
- PROFESSIONAL_VERIFICATION_REQUIRED.

## 3. Renovation scenario planning

A user should be able to request changes conversationally.

Examples:

- open this wall;
- remodel the kitchen;
- add a bathroom;
- replace all windows;
- convert the garage;
- add a second floor;
- replace the roof;
- change flooring;
- upgrade electrical;
- replace HVAC;
- improve energy efficiency;
- make this accessible;
- modernize the exterior.

HERMES creates a candidate revision rather than directly overwriting the current building.

For every scenario, evaluate:

- geometry impact;
- structural implications;
- MEP impact;
- material quantities;
- estimated cost;
- schedule;
- sequencing;
- permits/professional review;
- constructability;
- demolition;
- disposal/waste;
- procurement;
- downstream dependencies.

## 4. Stage-by-stage renovation experience

The owner should be able to scrub through renovation phases:

- existing condition;
- demolition;
- temporary protection;
- rough structural work;
- plumbing;
- electrical;
- HVAC;
- insulation;
- drywall/close-in;
- finishes;
- fixtures;
- final result.

Each stage should show:

- physical state;
- task list;
- estimated spend;
- material requirements;
- outstanding decisions;
- professional/permit requirements;
- risks.

## 5. Budget / cost planning

A renovation project should maintain a live cost model.

Track:

- quantities;
- materials;
- labor assumptions;
- subcontractors;
- equipment;
- delivery;
- permits/fees;
- taxes where applicable;
- contingency;
- change orders;
- actual invoices;
- owner-paid purchases.

Cost confidence should be explicit.

Possible statuses:

- conceptual estimate;
- regional estimate;
- supplier price;
- contractor quote;
- signed contract;
- actual paid.

The system should distinguish estimate from actual cost.

## 6. Procurement

HERMES can evolve into a purchasing coordinator.

Possible capabilities:

- generate material list;
- compare approved products;
- show alternatives;
- check lead times;
- build order packages;
- place orders after owner approval;
- schedule deliveries;
- track shipments;
- reconcile delivered quantity;
- flag missing/damaged items;
- link purchases to installed components.

No purchase should occur without explicit authorization and appropriate payment controls.

## 7. Live jobsite copilot

The homeowner/contractor should be able to use a phone/tablet/camera while work is happening.

Interaction examples:

- “What are they doing right now?”
- “Is this wall supposed to move?”
- “Should this pipe be here?”
- “What step comes next?”
- “Show me the approved plan.”
- “Is this the right window?”
- “Why are they using this material?”
- “What still needs inspection?”

The system can compare observed field conditions to the planned world.

## 8. Camera / voice interaction

Future jobsite interface:

- phone camera;
- wearable/body camera;
- fixed construction cameras;
- tablet;
- voice.

Pipeline:

`camera/audio → observation → object/space recognition → canonical-world comparison → structured advice/alert`

Examples:

- wrong material visible;
- opening differs from plan;
- installation appears out of sequence;
- required inspection not recorded;
- object installed before prerequisite;
- delivered product does not match specification.

HERMES must express uncertainty.

It should say:

- “I can verify…”
- “I cannot confirm…”
- “This appears inconsistent…”
- “Professional inspection required…”

rather than presenting camera inference as guaranteed truth.

## 9. Conversational field guidance

Voice becomes a natural interface into the project world.

User:

> “What are they doing in the kitchen?”

HERMES:

- identifies current space;
- looks at active tasks;
- compares observations;
- explains current operation;
- shows planned result;
- gives relevant decisions/warnings.

User:

> “Don’t do that. What happens if we move this outlet?”

HERMES creates a proposed change/revision and computes impacts before authorizing it.

## 10. Contractor / trade coordination

The owner experience should not remove contractors.

Instead HERMES can coordinate:

- contractor scope;
- trade assignments;
- work orders;
- schedule;
- photos;
- approvals;
- punch list;
- change orders;
- invoices;
- completion evidence.

This can serve small builders/renovation contractors as well as homeowners.

## 11. Document / financial record

Every property project can retain:

- plans;
- contracts;
- permits;
- inspections;
- invoices;
- receipts;
- product warranties;
- serial numbers;
- supplier records;
- photos;
- change orders;
- payment history;
- material records.

Financial records can be categorized for bookkeeping/accounting workflows.

Tax treatment should be recorded/documented but not assumed; jurisdiction-specific tax/legal treatment may require professional advice.

## 12. Reconciliation

Purchasing and actual construction should reconcile.

Examples:

- ordered 14 windows;
- 14 delivered;
- 13 installed;
- 1 damaged/replacement pending.

Or:

- 120 boxes tile purchased;
- 108 installed;
- 8 retained;
- 4 waste.

This creates real project inventory intelligence.

## 13. Property lifecycle after construction

The model remains valuable after project completion.

It becomes the property's living digital record.

Future use:

- maintenance;
- warranty;
- replacement;
- repair;
- remodel;
- resale;
- insurance documentation;
- appliance/equipment history;
- renovation history;
- utility/energy upgrades.

Example:

> “Which water heater is installed?”

HERMES can show model, specification, install date, warranty, receipt, service history, connected plumbing/electrical, and replacement requirements.

## 14. Design accessibility

The consumer does not need to learn BIM software.

Interaction can be:

- conversation;
- click/select;
- option comparison;
- image/reference style;
- budget constraint;
- direct manipulation when desired.

Example:

> “Make the kitchen larger without moving the exterior wall.”

HERMES generates compliant alternatives and explains cost/structural/MEP impacts.

## 15. Professional review gates

Consumer accessibility does not eliminate regulated expertise.

HERMES must identify when work requires:

- architect;
- structural engineer;
- MEP engineer;
- surveyor;
- geotechnical engineer;
- licensed electrician/plumber/HVAC;
- permit;
- AHJ inspection;
- other local professional review.

The product should make professional handoff easier by giving the professional a structured project model/evidence package.

## 16. Same engine, different depth

Use the same canonical world as professional HERMES.

Consumer view may show:

- “Impact-rated aluminum window — $1,450 installed.”

Professional inspector may expand:

- assembly;
- glazing;
- anchors;
- wind pressure;
- host opening;
- supplier;
- task;
- inspection;
- source/revision.

No second construction engine.

## 17. Renovation service wedge

Potential near-term service:

**HERMES Renovation Planning / Digital Twin Pilot**

Customer supplies:

- floor plan;
- photos;
- desired remodel;
- budget.

HERMES produces:

- editable existing-condition model;
- proposed renovation;
- phased demolition/build plan;
- estimated quantities/cost;
- material list;
- schedule;
- major professional/permit requirements;
- walkthrough/replay;
- structured project package for contractors.

This can be useful before robotics exists.

## 18. Future execution path

Long-term progression:

`OWNER INTENT`
→ `EXISTING DIGITAL TWIN`
→ `DESIGN REVISION`
→ `COST / MATERIAL / SCHEDULE`
→ `PROFESSIONAL REVIEW`
→ `PROCUREMENT`
→ `FIELD EXECUTION`
→ `CAMERA / SENSOR OBSERVATION`
→ `VALIDATION / RECONCILIATION`
→ `AS-BUILT DIGITAL TWIN`
→ `MAINTENANCE / FUTURE RENOVATION`

The same architecture eventually supports robotic execution because each task/object already has spatial and material truth.

## 19. Product rule

HERMES should make sophisticated construction intelligence accessible without making untrained users responsible for operating complex professional software.

The user describes goals and inspects decisions.

HERMES manages the structured construction model.

## 20. Strategic value

This creates a continuum:

- homeowner;
- renovator;
- small contractor;
- builder;
- architect/engineer;
- GC/VDC;
- enterprise;
- future autonomous construction.

All use the same canonical construction intelligence at different levels of depth.
