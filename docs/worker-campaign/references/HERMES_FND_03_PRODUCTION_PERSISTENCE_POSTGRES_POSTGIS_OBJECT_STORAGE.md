# HERMES FND-03 — PRODUCTION PERSISTENCE, POSTGRESQL/POSTGIS & OBJECT STORAGE

## Objective

Replace prototype-only persistence **architecturally and incrementally** with a production-ready persistence boundary while preserving the existing Academy House runtime.

This ticket does not authorize a destructive cutover.

## Target architecture

Primary authoritative datastore:

**PostgreSQL + PostGIS**

Large immutable artifacts:

**S3-compatible object storage**

Initial event transport:

**append-only database events + durable job queue**

Do not introduce Kafka, a graph database or a large microservice topology without measured need.

## Core production schema

Design/migrate toward:

```text
organization
user
membership
project
project_revision

entity
entity_revision
external_identity
relationship
classification
spatial_frame
spatial_transform
geometry_artifact

event
observation
source
evidence
claim
document
document_revision

task
task_dependency
work_package
schedule_activity

material_spec
product_spec
material_batch
procurement_record
delivery
installation_record

issue
clash
inspection
approval
hold_point

equipment
actor
resource_assignment

sensor
telemetry_stream

ai_run
ai_claim
ai_tool_call
decision
human_approval
```

Do not blindly implement all tables if current code does not yet require them. Establish migration-ready boundaries and implement the minimum subset needed to prove the architecture.

## Required work

### 1. Persistence interface

Extract canonical storage behind interfaces/repositories so domain logic does not directly depend on JSON files or SQL.

### 2. Database migration strategy

Define:

- schema migrations;
- dev/test database behavior;
- production connection configuration;
- transaction boundaries;
- migration rollback policy;
- fixture/bootstrap behavior.

### 3. PostGIS readiness

Spatial records from FND-01 must be persistable with explicit:

- CRS/frame semantics;
- geometry types;
- spatial indexes where justified.

Do not collapse local building coordinates and geodetic GIS coordinates into one ambiguous column.

### 4. Event persistence

Canonical event stream should be append-only.

Preserve:

- project ID;
- trace ID;
- sequence/order;
- actor;
- affected entities;
- payload;
- timestamp;
- revision relation.

Idempotency and ordering rules must be explicit.

### 5. Temporal state

Support valid/recorded-time semantics from FND-01/FND-02 where implemented.

### 6. Object storage boundary

Define artifact storage for:

- IFC originals;
- drawings/PDFs;
- photos;
- video;
- LAS/LAZ/E57/point clouds;
- derived render assets;
- derived geometry;
- signed reports.

Relational records hold:

- URI/key;
- hash;
- size;
- MIME/type;
- source;
- revision;
- evidence relation;
- access classification.

Do not store multi-gigabyte project artifacts inside normal Git or relational blob fields by default.

### 7. Compatibility bridge

Keep the current JSON persistence path available behind an adapter until database acceptance is physically proven.

Do not delete or reset runtime-generated state merely to make tests green.

## Security minimum

Plan for:

- organization/project tenant keys;
- server-side tenant scoping;
- DB least privilege;
- secrets from environment/secret manager;
- signed object-storage access;
- audit events for privileged mutation.

Enterprise identity itself may be a later implementation ticket, but schema cannot make tenant isolation impossible.

## Acceptance

Demonstrate with targeted tests/integration test:

1. Create project/entity/revision/event and reload from database.
2. Spatial record persists with frame/CRS semantics.
3. Append-only event cannot be silently rewritten through normal repository API.
4. Idempotent repeated write does not duplicate canonical event.
5. Artifact metadata points to object storage while bytes remain external.
6. Tenant/project scope is present on canonical records.
7. Existing JSON adapter remains functional until authorized cutover.
8. Academy House behavior remains available.

## Non-goals

Do not:

- migrate every historical file in one pass;
- create a microservice fleet;
- add graph DB;
- add Kafka;
- remove current persistence before physical verification;
- change visual UX.

## Deliverable

Implementation should produce:

- persistence contract;
- migration files;
- minimal working Postgres/PostGIS adapter;
- object-storage interface;
- fixture/test strategy;
- migration/cutover document;
- evidence of build/typecheck/tests.
