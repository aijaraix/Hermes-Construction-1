# HERMES HX-01 SOURCE AUDIT — IMMERSIVE FOUNDATION / NAVIGATION / EXECUTIVE OVERVIEW

**Audit basis:** remote `main` at `bbc90702a7d62a0092dc2dd914901743c23ec8b5`, plus accepted foundation implementation head `422328945c76982da1689ae5f8671874d9e7dcef`.

**Foundation state:** FND-01 through FND-05 are code-accepted. Browser/Postgres/live-provider physical verification remains separate. HX-01 must consume those foundation contracts and must not create a parallel truth model.

## Executive finding

The current product still behaves like a conventional React dashboard wrapped around a 3D workspace.

The source already contains enough runtime capability to implement the intended world-first shell without rewriting rendering or backend logic.

The largest UX problems are structural:

1. `App.tsx` still owns page-style `activeTab` routing.
2. `AppShell.tsx` still renders a full-width conventional header.
3. `BimWorkspaceView.tsx` opens both left tree and right inspector by default.
4. Prime/autonomy is the default inspector tab.
5. project tools are fragmented across page views, BimWorkspace drawers and Developer/System.
6. owner-facing fallback data in `App.tsx` contains fabricated/default project truth.
7. the 3D world loses visual priority to chrome.

HX-01 should restructure the shell once while preserving all renderer/runtime behavior.

---

# 1. Current App.tsx is page-router oriented

`src/App.tsx` maintains:

`activeTab: NavTab`

and conditionally mounts separate pages:

- bim-workspace
- command-center
- project-overview
- 3d-twin
- rooms-spaces
- plans-systems
- inspections
- bom
- procurement
- schedule
- risks
- customizer

This means the product still conceptually navigates away from the world.

## HX-01 requirement

The normal project experience should mount the world once and open project workspaces over it.

Legacy `NavTab` behavior may remain behind compatibility paths/Developer System where needed.

Do not remove useful legacy components yet.

---

# 2. App.tsx contains unsafe owner-facing fallback truth

The current fallback `DigitalTwinProject` includes hard-coded:

- Tampa location/jurisdiction
- climate
- wind
- flood
- soil
- groundwater
- many score values at 100.0

The fallback heartbeat also initializes:

- unresolved questions = 0
- failures = 0
- clashes = 0
- risks = 0
- projectScore = 100.0

These values are presentation scaffolding, not canonical project truth.

## HX-01 requirement

The immersive executive overview must not consume these fallback claims.

Use current `worldState` and approved adapters.

Unknown must remain unknown/not calculated/not recorded.

---

# 3. AppShell remains conventional website chrome

`AppShell.tsx` currently renders a sticky full-width header with:

- HERMES brand block
- phase/status badge
- project selector
- additional controls

The sidebar is hidden on the BIM workspace, but the top header remains.

## HX-01 requirement

For live BIM/project workspace:

- remove conventional full-width header from the normal world experience;
- replace with compact identity/status controls over the world;
- preserve mobile access and project switching;
- keep Developer/System reachable.

Do not remove application branding globally if needed outside project workspace.

---

# 4. Current project selector mixes live and fixture concerns

The shell owns a large project selector.

`HermesProjectContext` separately tracks:

- liveProjects
- regressionFixtures
- activeProjectMeta
- activeProjectId

This is good underlying separation.

## HX-01 requirement

Use a compact `ProjectIdentityChip`.

Normal project selector should prefer live/current project context.

Regression fixture switching remains clearly marked and may live behind Developer/System or fixture control.

Do not make regression fixtures look like ordinary customer projects.

---

# 5. BimWorkspace starts cluttered

Current defaults:

```ts
leftTreeOpen = true
rightInspectorOpen = true
rightInspectorTab = 'PRIME_AUTONOMY'
leftTab = 'TREE'
```

This violates the world-first product objective.

## HX-01 target defaults

- left legacy workspace closed
- right inspector closed
- Prime/autonomy not default visible
- 3D world occupies the visual majority immediately

The current left modes:

- TREE
- WORKFORCE
- SYSTEMS
- TRACE

are valuable and should be reused rather than duplicated.

---

# 6. Current BimWorkspace mixes workspace navigation and renderer logic

`BimWorkspaceView.tsx` is large and includes:

- 3D scene/runtime
- IFC rendering
- selection
- model conversion
- workforce/facility rendering
- system/trace interactions
- left drawer UI
- right inspector UI
- replay/timeline UI
- simulation/test overlays

This file is high risk.

## HX-01 rule

Do not refactor renderer math, geometry, IFC parsing or world-state projection.

Move/extract only shell/chrome/workspace presentation needed for HX-01.

Prefer controlled adapters/props over deep renderer restructuring.

---

# 7. Canonical UI state already exists in HermesProjectContext

`HermesProjectContext` owns:

- active project
- live projects / fixtures
- world state
- connection status
- playback
- camera zone
- selection
- inspector open state
- project actions
- modals

This should remain the canonical application context.

## HX-01 rule

Do not create a second project truth store.

New UI-only state may include:

- activeWorkspaceId
- workspace width
- launcher pinned
- workspace subtab
- developer drawer open

Selection/project truth remains in context.

---

# 8. Prepared planning adapters are usable and should be brought forward

Planning branch contains:

- `humanProjectStatus.ts`
- `inspectableEntity.ts`
- `materialWorkspaceState.ts`
- `projectTimelineState.ts`
- `projectAttentionState.ts`
- `projectOverviewState.ts`
- `immersiveWorkspaceRegistry.ts`

These are not alternate truth stores.

They derive human-readable state from canonical runtime data.

## HX-01

Bring all seven onto the implementation branch and typecheck against post-foundation source.

Use:

- humanProjectStatus
- projectOverviewState
- immersiveWorkspaceRegistry

directly in HX-01.

The others should compile now so HX-02/HX-03 do not require another integration pass.

---

# 9. ProjectOverviewView is not safe as the executive home

Current `ProjectOverviewView` contains hardcoded claims such as:

`82% Verified Supplier Quotes`

and historically relies on fallback data.

Do not reuse its truth logic.

## HX-01 requirement

Create `ProjectOverviewWorkspace` backed by `projectOverviewState.ts`.

Allowed overview data:

- project identity
- live/simulation/test mode
- phase/completion
- Done / Doing / Next
- attention summary
- What Changed summary
- materials summary
- schedule calculation state
- canonical cost fields
- quality/external approval distinctions
- site facts with truth status
- evidence counts/hash

No project health score unless canonical/provenanced.

---

# 10. Existing workspace registry already matches product direction

`immersiveWorkspaceRegistry.ts` defines exactly eight workspaces:

1. PROJECT
2. MODEL
3. MATERIALS
4. SCHEDULE
5. WORKFORCE
6. LOGISTICS
7. QUALITY
8. SYSTEMS

It also defines:

- panel/workspace presentation class
- widths
- keyboard shortcuts
- mobile priority
- badge kinds
- one-active-workspace toggle
- shortcut filtering

This should be reused, not redesigned.

---

# 11. HX-01 should implement only the shell bodies it owns

Implement fully in HX-01:

- PROJECT overview
- MODEL reuse
- WORKFORCE reuse
- SYSTEMS reuse

For:

- MATERIALS
- SCHEDULE
- LOGISTICS
- QUALITY

mount truthful placeholders/summaries only.

Do not implement HX-02/HX-03 bodies early.

---

# 12. Model workspace

Reuse existing TREE functionality.

Target presentation:

- left overlay panel
- default ~360px
- no viewport resize
- world remains mounted

Do not rebuild model tree semantics.

---

# 13. Workforce workspace

Reuse existing WORKFORCE functionality.

Do not build new workforce state.

Presentation only:

- left overlay panel
- world remains visible

Universal Inspector behavior comes in HX-02.

---

# 14. Systems workspace

Reuse existing SYSTEMS/TRACE behavior.

This means project building systems, not Developer/System internals.

Keep:

- category/system filters
- traces
- isolation/show/hide behavior

Developer/System remains separate.

---

# 15. Timeline in HX-01

Current timeline/replay controls remain functional.

Do not implement final ConstructionTimeline yet.

Target:

- collapsed/thin bottom presence
- does not resize world
- existing replay/step/run/reset functions remain intact

HX-02 owns final timeline/What Changed behavior.

---

# 16. Inspector in HX-01

Do not build Universal Inspector yet.

Current right inspector should:

- default closed
- remain reachable where needed
- not show Prime/autonomy by default
- not force layout width

HX-02 replaces normal object inspection experience.

---

# 17. Developer/System

Keep Developer/System separate from eight project workspaces.

Do not remove existing project-data items from HermesSystemDrawer yet.

HX-03 will clean duplicated entries after replacements are physically accepted.

---

# 18. Foundation integration requirements

HX-01 must respect:

## FND-01
Use canonical identity/frame/revision semantics where surfaced.
Do not fabricate renderer/local identity.

## FND-02
Owner-facing truth must use evidence/truth status.
No fake Verified labels.

## FND-03
No persistence cutover/UI dependence on Postgres.

## FND-04
Browser/openBIM rendering remains a projection.
Do not alter IFC pipeline.

## FND-05
Provider/model health belongs in Developer/System unless project-blocking.
Do not put model branding into executive project overview.

---

# 19. High-risk files

Primary:

- `src/App.tsx`
- `src/components/AppShell.tsx`
- `src/components/BimWorkspaceView.tsx`

New shell components:

- `src/components/immersive/ImmersiveProjectShell.tsx`
- `ProjectLauncherRail.tsx`
- `InternalWorkspaceSurface.tsx`
- `ProjectIdentityChip.tsx`
- `ProjectStatusHUD.tsx`
- `ProjectOverviewWorkspace.tsx`

Do not unnecessarily touch server files.

---

# 20. Acceptance focus

HX-01 passes when:

- the world visibly dominates;
- project workspace no longer resembles a dashboard website;
- launcher rail is narrow (~48px);
- only one project workspace opens at a time;
- workspaces overlay rather than resize the world;
- Project Overview is truthful;
- Model/Workforce/Systems reuse current capability;
- Developer/System remains separate;
- inspector starts closed;
- timeline remains functional/collapsed;
- step/run/reset/project switching/selection are not broken;
- no new truth fabrication is introduced.

Physical screenshot acceptance remains required when browser access exists.

---

# 21. Conclusion

HX-01 should be a **presentation architecture pass** over an already functioning world.

Do not change domain logic to make the new shell easier.

The correct move is to make the current canonical world understandable while keeping the renderer continuously mounted.
