# HERMES FND-04 — openBIM SERVER NORMALIZATION & MODEL REVISION PIPELINE

## Objective

Turn IFC/openBIM from a browser file-viewing capability into a versioned interoperability pipeline that produces canonical HERMES entities and evidence.

Do **not** build a custom IFC parser.

## Architecture

Target pipeline:

```text
original IFC
   ↓
immutable source artifact + hash
   ↓
server-side parse / validation
   ↓
normalized semantic graph
   ↓
external identity mapping
   ↓
HERMES ConstructionEntity / relationships
   ↓
validation report
   ↓
derived render artifacts
   ↓
collision/spatial proxies
   ↓
quantity derivations
```

The original source remains immutable.

## Technology position

Browser:

- keep Three.js;
- keep web-ifc / That Open where already working;
- preserve selection/render behavior.

Server:

- integrate a mature IFC implementation such as IfcOpenShell-class tooling;
- use Python worker/service if that is the most practical integration boundary;
- do not make browser parser output the sole source of canonical BIM semantics.

## Required openBIM concepts

Prepare first-class support for:

- IFC 4.x / 4.3 exchange;
- IFC GlobalId external mapping;
- property sets;
- containment/spatial hierarchy;
- type/occurrence;
- systems/connectivity;
- quantities;
- materials/assemblies;
- classifications.

Prepare extension points for:

- IDS validation;
- BCF issue interoperability;
- bSDD/classification mapping.

IDS/BCF/bSDD need not all be fully implemented in this one ticket if doing so would widen scope excessively.

## HERMES mapping

Raw IFC entities are not HERMES canonical business objects.

Map IFC identities to FND-01 `ConstructionEntity`.

HERMES identity survives:

- IFC file replacement;
- source-model revision;
- model federation.

Where stable matching is uncertain, produce an explicit reconciliation state instead of inventing identity continuity.

Suggested reconciliation states:

- exact external-ID match
- deterministic semantic match
- probable match / review required
- new entity
- removed/superseded entity
- unresolved

## Model revision/diff

Support at least:

- source model artifact revision;
- import timestamp;
- hash;
- schema/version;
- element added/removed/changed classification;
- changed properties;
- changed geometry reference;
- HERMES identity mapping result.

Do not mutate prior model revisions destructively.

## Geometry outputs

Separate:

- source/exact geometry reference;
- semantic dimensions/axes/openings;
- render geometry;
- collision/spatial proxy.

Do not force one representation to serve all purposes.

## Worker safety

Treat imported BIM files as untrusted input.

At minimum:

- size limits;
- parsing timeout;
- isolated worker/process;
- controlled filesystem access;
- version-pinned dependencies;
- parse failure evidence;
- no arbitrary source-file execution.

## Acceptance

Use a bounded IFC fixture to prove:

1. Original IFC artifact hash is preserved.
2. Parsed objects map to stable HERMES IDs.
3. Reimport with property change creates new revision, not a new unrelated identity where a deterministic match exists.
4. Added/removed/changed element diff is produced.
5. Property/relationship extraction survives server normalization.
6. Render artifacts remain projections.
7. Invalid/unparseable IFC fails closed with evidence.
8. Browser BIM still works after integration.

## Non-goals

Do not:

- replace Revit or authoring software;
- create a custom IFC syntax parser;
- create exact CAD authoring;
- implement every buildingSMART standard at once;
- rewrite the frontend renderer.
