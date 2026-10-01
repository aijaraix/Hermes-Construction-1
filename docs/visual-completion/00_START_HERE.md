# AEDRYX Visual Completion Program — Start Here

## Purpose

This package is the controlling implementation plan for making AEDRYX visually trustworthy as a real-scale construction twin.

The current governed product already contains substantial backend architecture, spatial state, agent organization, construction-method logic, material intelligence, provenance, BIM/IFC support, and operational workspaces. The immediate product gap is that the live visual output still reads as proxy geometry and abstract boxes rather than a believable construction project.

The next engineering priority is therefore **visual completeness tied to canonical physical truth**.

## Governing source

This program was created from the exact Git tree currently deployed for AEDRYX acceptance. The deployment branch tree is byte-identical to governed Accepted Head `2e4b4fb9cffcef9f123366df6c8ede6be5e1bc46`.

## Core product rule

A feature is not visually accepted merely because code exists, tests pass, or a backend record says the work happened.

For this program:

> If a physical construction action, object, or state matters to the user, the live visual twin must show it in a recognizable, correctly scaled, spatially coherent way.

## Execution order

Execute packets in this order:

1. Packet A — Architectural Legibility
2. Packet B — Site Reality
3. Packet C — Construction Progression
4. Packet D — Scale & Activity
5. Packet E — Building Systems
6. Packet F — Work Visibility

Each packet must be independently tested, visually inspected, committed, preserved, and reconciled before the next packet begins.

Do not collapse all work into one unpreserved implementation session.

## Non-goals

Do not use this campaign to redesign:
- the Control Plane;
- AI routing;
- the database architecture;
- unrelated dashboards;
- generalized robotics;
- a new UI framework;
- photorealistic rendering;
- furniture/interior decoration.

Only change backend architecture when a current visual acceptance criterion cannot be satisfied correctly without it.

## Mandatory companion documents

Read:
- `01_VISUAL_COMPLETION_MASTER.md`
- `02_VISUAL_TRUTH_AND_SCALE_CONTRACT.md`
- `03_ACADEMY_HOUSE_REFERENCE_STANDARD.md`
- `09_SCREENSHOT_ACCEPTANCE_MATRIX.md`
- `10_ASTRA_EXECUTION_RULES.md`
- every packet file under `docs/visual-completion/packets/`

## Final acceptance condition

The program is successful only when a non-developer can open AEDRYX and immediately understand:
- what is being built;
- where it is being built;
- what stage it is in;
- what changed;
- what is happening now;
- what is blocked;
- where people/equipment/materials are;
- and that all visible objects share believable real-world scale.
