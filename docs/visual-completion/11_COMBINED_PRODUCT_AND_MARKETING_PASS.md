# AEDRYX Combined Product + Marketing Pass

## Purpose

Run one staged campaign that finishes the current product visual-completion work, adds secure session/logout behavior, refreshes the public landing experience, integrates OpenArt marketing assets, and prepares one final acceptance deployment for external WebGL/browser validation.

This document extends the existing visual-completion package. It does not replace Packet A-F acceptance rules.

## Current governed baseline

Start from the latest Hermes/AEDRYX Accepted Head. At creation time the current governed source is:
`79b1c28708f9c26ae8b9bec7b0203e038b70adbe`

Fresh Gateway truth wins if legitimately newer.

## Stage order

### Stage 1 — Packet A visual reconciliation
- preserve the implemented architectural-legibility geometry;
- remove any remaining proxy-box presentation defects;
- do not falsely mark browser/WebGL acceptance PASS if the Worker browser cannot render WebGL.

### Stage 2 — Packet B: Site Reality
### Stage 3 — Packet C: Construction Progression
### Stage 4 — Packet D: Scale & Activity
### Stage 5 — Packet E: Building Systems
### Stage 6 — Packet F: Work Visibility

After each stage:
`implement → tests → build → available visual QA → commit → checkpoint → Forge → Recovery → Accepted Head → verify exact readback`

Do not hold multiple major stages unpreserved.

### Stage 7 — Session / logout safety
Implement the requirements in `13_SESSION_LOGOUT_SECURITY.md`.

### Stage 8 — Public landing-page refresh
Implement `12_PUBLIC_LANDING_PAGE_STANDARD.md`.

### Stage 9 — OpenArt asset integration
Use only assets approved/available from `14_OPENART_ASSET_LEDGER.md`.

Marketing assets are concept/brand visuals. They must never be presented as actual AEDRYX product screenshots.

### Stage 10 — Final QA package
- full test/regression/typecheck/build;
- mobile + desktop 2D landing/auth QA where available;
- prepare final browser acceptance checklist;
- do not deploy production under Worker authority.

## Final visual-validation strategy

The Astra/Worker browser may lack usable WebGL. This is an environment limitation, not permission to weaken visual acceptance.

Therefore:

1. Worker completes/preserves the full source campaign.
2. Project Agent requests/uses a separate bounded acceptance-deployment authorization.
3. Deploy exact final Accepted Head to the existing AEDRYX acceptance service.
4. Use a WebGL-capable external browser to inspect the live product.
5. Validate Packet A-F states using the in-app timeline/modes from a single deployment.
6. If defects remain, create a remediation Worker from that exact checkpoint.

No packet may be called visually accepted solely because automated tests pass.
