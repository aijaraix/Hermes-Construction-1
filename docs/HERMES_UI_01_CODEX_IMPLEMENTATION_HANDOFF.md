# HERMES UI-01 CODEX IMPLEMENTATION HANDOFF

## CONTEXT

Repository:

\`aijaraix/Hermes-Construction-1\`

Canonical branch:

\`main\`

Planning branch contains the owner-approved architecture and exact UI-01 specification:

\`planning/hermes-control-layer-2026-09-18\`

Read these documents FIRST and treat them as controlling requirements:

1. \`docs/HERMES_CANVAS_FIRST_WORKSPACE_UI_ARCHITECTURE.md\`
2. \`docs/HERMES_HUMAN_OBSERVABILITY_PROJECT_CONTROL_ARCHITECTURE.md\`
3. \`docs/HERMES_IMMERSIVE_REACT_COMPONENT_STATE_ARCHITECTURE.md\`
4. \`docs/HERMES_IMMERSIVE_UI_MIGRATION_MAP.md\`
5. \`docs/HERMES_UI_01_EXACT_FILE_BY_FILE_PATCH_PLAN.md\`
6. \`docs/HERMES_ACCESS_GATE_DOMAIN_ARCHITECTURE.md\`

## FIRST ACTION

Fetch CURRENT remote \`main\`.

Do not assume the previously observed SHA remains HEAD.

Preserve all legitimate newer work.

Do not reset, discard, overwrite, or force-push legitimate work.

## OBJECTIVE

Implement **HERMES-UI-01 only**.

The live HERMES project must stop feeling like a dashboard around a 3D viewer and begin feeling like a professional full-screen construction application.

The project world must visually dominate the browser window.

This is a presentation-architecture pass.

It is NOT a geometry, backend, Academy, model-routing, persistence, or construction-engine pass.

## REQUIRED RESULT

For the live BIM workspace:

- world fills the usable browser window edge-to-edge;
- no conventional multi-row application header;
- no persistent layout-consuming left sidebar;
- no persistent layout-consuming right inspector;
- left/model panel CLOSED by default;
- right inspector CLOSED by default;
- Prime/Autonomy status NOT visible by default;
- side panels overlay the world when opened rather than shrinking the viewport;
- project identity/status appears as compact floating UI;
- Architectural / Construction / X-Ray remain reachable;
- Section/Cutaway remains reachable;
- Fit View remains reachable;
- Workforce/model access remains reachable through compact controls;
- Phase Audit and Truth Tests remain reachable through an Advanced/Developer control, but not permanent primary chrome;
- replay/timeline is compact/collapsed by default;
- current task/status does not cover the center of the world;
- developer/system area remains reachable;
- existing rendering and runtime behavior is preserved.

## IMPLEMENTATION BOUNDARY

Preferred modified files:

- \`src/App.tsx\`
- \`src/components/AppShell.tsx\`
- \`src/components/BimWorkspaceView.tsx\`

Allowed new files:

- \`src/components/immersive/ImmersiveProjectShell.tsx\`
- \`src/components/immersive/ProjectIdentityChip.tsx\`
- \`src/components/immersive/ViewModeToolbar.tsx\`
- \`src/components/immersive/ProjectStatusHUD.tsx\`
- optional \`src/lib/humanProjectStatus.ts\`

Change no other files unless compilation proves it necessary.

If another file must be changed, explain why before broadening scope.

## DO NOT TOUCH

Do not modify:

- server runtime behavior;
- persistence;
- canonical world semantics;
- construction sequence;
- Academy logic;
- reasoning/model architecture;
- IFC parsing;
- BIM geometry generation;
- roof/window/door modeling logic;
- task engine;
- spatial engine;
- database;
- API contracts;
- Railway architecture.

Do not use UI-01 as an excuse to refactor the entire frontend.

## IMPORTANT SOURCE REALITY

Current \`BimWorkspaceView.tsx\` defaults both major project panels open.

Change the effective UI behavior so:

- model/tree is closed on entry;
- inspector is closed on entry;
- scoped object inspection is the normal selected-object mode;
- Prime/Autonomy is not the default visible state.

Preserve the underlying content.

## ACCESS / DOMAIN REQUIREMENT

The owner has selected \`aedryx.com\` as the simple entry point.

Do NOT hard-code or commit the owner PIN.

If the access gate is included in this implementation environment:

- read PIN from \`HERMES_ACCESS_PIN\`;
- verify server-side;
- do not log it;
- issue HTTP-only session cookie;
- protect workspace/private project APIs;
- add basic failed-attempt rate limiting.

If implementing the access gate would require server/API changes that broaden UI-01 materially, STOP and leave it as a separate ACCESS-01 ticket rather than contaminating UI-01.

Do not modify DNS.

## UI RULES

Use existing Tailwind.

Do not introduce another UI framework.

Professional application aesthetic:

- compact;
- neutral;
- icon-first;
- minimal chrome;
- clear hierarchy;
- canvas dominant.

Do not copy Autodesk/Revit UI pixel-for-pixel.

Use familiar professional CAD/BIM interaction principles.

## HUMAN STATUS

Use only canonical world state.

Human-facing status may format canonical labels for readability, but must not fabricate completion, schedule, blockers, costs, or inspection results.

Examples:

\`GENESIS_INTAKE\` → \`Genesis Intake\`

\`CONSTRUCTION_SUBSTRUCTURE\` → \`Substructure\`

Internal IDs can remain in advanced views.

## TESTING

Run the repository-supported equivalents of:

\`\`\`
npm ci
npm run lint
npm run build
npm test -- --run server/__tests__/academy_house_001_vertical_slice.test.ts
\`\`\`

If an unrelated legacy test fails, report it separately.

Do not silently repair unrelated legacy failures during this ticket.

## PHYSICAL BROWSER ACCEPTANCE

Verify in a real browser:

1. Genesis opens with essentially unobstructed world.
2. Project identity/status is visible but compact.
3. Model tree opens as overlay and closes.
4. Workforce opens and closes.
5. Opening panels does NOT resize/shrink the 3D viewport.
6. Selecting a component opens inspection while preserving world size.
7. Architectural works.
8. Construction works.
9. X-Ray works.
10. Fit View works.
11. Section/Cutaway opens/closes.
12. Timeline is collapsed by default and still usable.
13. Advanced menu exposes Truth Tests / Phase Audit.
14. Developer/System drawer still opens.
15. Step/run/reset behavior is unchanged.
16. No browser console errors caused by the refactor.

Capture screenshots for:

- clean genesis;
- model drawer open;
- selected-object inspector open;
- construction/framing state with clean shell.

## STOP CONDITION

Stop after UI-01 is physically verified.

Do NOT continue into:

- UI-02;
- universal inspector redesign;
- materials redesign;
- command palette;
- new modeling primitives;
- geometry fixes;
- robotics;
- local model routing;
- deployment/domain cutover.

## OUTPUT

Return:

1. fetched starting main SHA;
2. files changed;
3. new files;
4. tests/build results;
5. physical browser acceptance results;
6. screenshots/evidence paths;
7. final commit SHA;
8. any blocker requiring owner input.

Do not return another design proposal.

Implement the approved UI-01 specification.
