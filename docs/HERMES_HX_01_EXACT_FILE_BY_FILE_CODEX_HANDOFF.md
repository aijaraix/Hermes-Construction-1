# HERMES HX-01 — EXACT FILE-BY-FILE CODEX IMPLEMENTATION HANDOFF

## Authority

Read only:

1. `docs/HERMES_HUMAN_EXPERIENCE_CONSOLIDATED_IMPLEMENTATION_MASTER.md`
2. `docs/HERMES_HX_01_IMMERSIVE_FOUNDATION_TICKET.md`
3. `docs/HERMES_HX_01_SOURCE_AUDIT.md`
4. `docs/HERMES_HX_01_COMPATIBILITY_TEST_MATRIX.md`
5. `docs/HERMES_UI_01_EXACT_FILE_BY_FILE_PATCH_PLAN.md`
6. `docs/HERMES_IMMERSIVE_LAUNCHER_WORKSPACE_INTERACTION_SPEC.md`
7. `docs/HERMES_PROJECT_OVERVIEW_EXECUTIVE_HOME_SPEC.md`
8. `docs/HERMES_IMMERSIVE_REACT_COMPONENT_STATE_ARCHITECTURE.md`

Do not crawl other planning docs.

## Physical prerequisite

Accepted foundation head:

`422328945c76982da1689ae5f8671874d9e7dcef`

Foundation branch:

`feature/hermes-fnd-05-ai-capability-router`

FND-01 through FND-05 must be ancestors of HEAD.

Foundation acceptance state:

`FOUNDATION_CODE_ACCEPTED`

Browser/Postgres physical verification remains separate and does not authorize redesign.

---

# FIRST

1. Fetch CURRENT remote `main`.
2. Verify foundation head `422328945c76982da1689ae5f8671874d9e7dcef` is present locally.
3. Record `git status --short`.
4. Preserve visual commit `c1acf19`.
5. Preserve all eight runtime-generated modified files exactly.
6. Preserve protected BIM/reference fixtures.
7. Create:

`feature/hermes-immersive-human-experience`

from accepted foundation head, not old main.

8. Fetch planning branch:
   `planning/hermes-control-layer-2026-09-18`.

Bring ONLY these prepared adapters from planning branch:

- `src/lib/humanProjectStatus.ts`
- `src/lib/inspectableEntity.ts`
- `src/lib/materialWorkspaceState.ts`
- `src/lib/projectTimelineState.ts`
- `src/lib/projectAttentionState.ts`
- `src/lib/projectOverviewState.ts`
- `src/lib/immersiveWorkspaceRegistry.ts`

Do not merge the planning branch.

Typecheck adapters against current post-foundation source.

Only narrow compile/truth compatibility fixes are allowed.

---

# OBJECTIVE

Implement HX-01 only:

IMMERSIVE FULL-SCREEN WORLD SHELL
+
48PX PROJECT LAUNCHER
+
ONE PRIMARY WORKSPACE AT A TIME
+
COMPACT PROJECT IDENTITY / STATUS
+
PROJECT OVERVIEW
+
MODEL / WORKFORCE / SYSTEMS REUSE
+
DEVELOPER/SYSTEM SEPARATION
+
COLLAPSED EXISTING TIMELINE
+
INSPECTOR CLOSED BY DEFAULT

Do NOT implement HX-02 or HX-03.

---

# FILE: src/App.tsx

## Remove normal project dependence on page-style tabs

Current `activeTab` page replacement should no longer drive the normal live project experience.

Target:

- immersive shell stays mounted;
- `BimWorkspaceView` stays mounted;
- project workspaces are overlays.

Retain compatibility page routing only where needed for Developer/System or legacy non-project surfaces.

Do not delete old views in HX-01.

## Remove owner-facing fallback truth dependency

Do not feed Project Overview from the current fallback `DigitalTwinProject` score/environment defaults.

The immersive project overview must derive from:

`worldState`

through:

`deriveProjectOverviewState(...)`

If required secondary legacy project arguments are missing, pass empty/unknown structures rather than fabricated truth.

Do not delete fallback objects if Developer/legacy views still require them.

Keep them isolated from the executive project overview.

---

# FILE: src/components/AppShell.tsx

For immersive project workspace:

- remove/suppress conventional full-width header;
- remove conventional page/sidebar feel;
- allow child immersive shell to own project chrome.

Preserve:

- new project modal access
- regression fixture modal access
- mobile fallback
- Developer/System access

Do not break legacy shell for non-immersive/system screens if still used.

---

# NEW: src/components/immersive/ImmersiveProjectShell.tsx

Own UI-only shell state:

- activeWorkspaceId
- launcherPinned
- workspaceWidthById
- workspaceSubtabById
- developerDrawerOpen

Do not copy project/world state into this component.

Use `HermesProjectContext`.

Layout:

LEFT:
48px launcher rail
+
optional overlay workspace

CENTER:
continuously mounted `BimWorkspaceView`

RIGHT:
legacy/context inspector only when explicitly open

BOTTOM:
existing timeline/replay layer

TOP:
compact project identity/status + minimal view controls

No full-width conventional header.

---

# NEW: ProjectLauncherRail.tsx

Use `IMMERSIVE_WORKSPACES`.

Render exact order:

PROJECT
MODEL
MATERIALS
SCHEDULE
WORKFORCE
LOGISTICS
QUALITY
SYSTEMS

Bottom-separated:

Developer/System

Rules:

- ~48px desktop rail
- icon-first
- tooltip/label access
- active state
- actionable badges only
- one primary workspace at a time
- clicking active closes it
- Alt+1..8
- ignore shortcuts while typing
- no decorative counts

Use registry badge semantics only where adapter data exists.

---

# NEW: InternalWorkspaceSurface.tsx

Reusable overlay shell.

Requirements:

- position over world
- must NOT resize Three.js viewport
- PANEL vs WORKSPACE widths from registry
- close control
- title/subtitle
- optional resizable seam if low risk
- responsive mobile sheet behavior

No independent project state.

---

# NEW: ProjectIdentityChip.tsx

Compact top-left/top-center project identity.

Show only canonical/current:

- project name
- optional location only when actually available
- mode: Live Project / Simulation / Test Fixture
- connection status

Project switching:

- compact dropdown
- live projects normally visible
- regression fixtures clearly separated/marked
- switching clears contextual selection through existing context behavior

Do not use large AppShell selector.

---

# NEW: ProjectStatusHUD.tsx

Use `deriveHumanProjectStatus(worldState)`.

Collapsed HUD:

- phase label
- canonical completion %
- NOW
- NEXT
- attention count when >0

No fabricated scores.

No provider/model status.

---

# NEW: ProjectOverviewWorkspace.tsx

Use `deriveProjectOverviewState`.

Sections in this order:

1. Project identity / mode / phase / completion
2. Done / Doing / Next
3. Needs Attention summary
4. What Changed summary
5. Materials summary
6. Schedule state
7. Cost state
8. Quality / approvals
9. Site / jurisdiction
10. Evidence footer

Truth rules:

- no 82% verified quotes
- no fallback Tampa claims
- no 100.0 readiness/quality defaults
- no fake green “0 critical violations”
- no unresolved risks labeled mitigated
- no overall project score unless current canonical/provenanced field exists
- simulation/test must be visibly labeled

If schedule/cost unavailable:

say so.

---

# BimWorkspaceView integration

Do not refactor renderer math.

Do not change IFC parsing.

Do not change coordinate projection.

Change only shell-related behavior:

Default:

```ts
leftTreeOpen = false
rightInspectorOpen = false
rightInspectorTab = 'SCOPED'
```

Expose/reuse current content for:

MODEL → TREE
WORKFORCE → WORKFORCE
SYSTEMS → SYSTEMS / TRACE

Preferred implementation:

- extract existing left-panel bodies into reusable components/functions;
- OR expose a controlled workspace-mode prop;
- avoid duplicating the underlying tree/workforce/system logic.

The new shell owns open/close state.

Opening a workspace must not change canvas dimensions.

---

# MODEL WORKSPACE

Reuse current TREE body.

Do not build a new tree engine.

Overlay width from registry.

Selection behavior remains current.

Universal Inspector is deferred HX-02.

---

# WORKFORCE WORKSPACE

Reuse current WORKFORCE body.

Do not create another workforce data source.

Selection remains current.

---

# SYSTEMS WORKSPACE

Reuse current SYSTEMS and TRACE capability.

Do not confuse this with Developer/System.

Preserve current isolate/trace behavior.

---

# MATERIALS / SCHEDULE / LOGISTICS / QUALITY IN HX-01

Do NOT implement full bodies.

Provide truthful placeholder/snapshot surfaces.

Examples:

MATERIALS:
summary from `materialWorkspaceState` and note “Detailed workspace arrives in HX-03.”

SCHEDULE:
calculated/not-calculated summary from `projectTimelineState`.

LOGISTICS:
show only canonical high-level counts if trivial; otherwise “Detailed logistics workspace arrives in HX-03.”

QUALITY:
attention summary count/top items from `projectAttentionState`; full drawer/workspace deferred HX-02.

No fake routes, prices, inspection passes or schedule values.

---

# TIMELINE

Preserve existing timeline/replay behavior.

HX-01 should:

- keep it collapsed/thin by default;
- overlay rather than resize world;
- preserve step/run/reset/replay actions.

Do not implement final ConstructionTimeline or What Changed drawer.

HX-02 owns that.

---

# INSPECTOR

Do not implement Universal Inspector.

Current/legacy inspector:

- default closed
- `SCOPED` rather than Prime by default
- remains functional when explicitly opened

Prime/autonomy internals belong Developer/System.

---

# DEVELOPER / SYSTEM

Keep HermesSystemDrawer reachable through bottom-separated rail control.

Do NOT remove duplicated BOM/procurement/schedule/etc entries yet.

HX-03 cleanup occurs only after replacement workspace acceptance.

---

# ESCAPE ORDER

Implement deterministic shell Escape behavior:

1. close modal/menu if shell-owned
2. close inspector
3. close primary workspace
4. collapse timeline if expanded

Do not use Escape for reset/destructive actions.

---

# SHORTCUTS

Use:

Alt+1 Project
Alt+2 Model
Alt+3 Materials
Alt+4 Schedule
Alt+5 Workforce
Alt+6 Logistics
Alt+7 Quality
Alt+8 Systems

Use `shouldIgnoreGlobalWorkspaceShortcut`.

Do not trigger while typing.

---

# PROJECT SWITCH

On project switch:

- keep rail
- close inspector
- clear selection
- preserve primary workspace only if project-generic
- clear entity-specific UI state
- no cross-project component selection
- no viewport/project state leakage

Use existing context selection clearing.

---

# FOUNDATION TRUTH INTEGRATION

FND-01:
do not invent alternate entity IDs/frames.

FND-02:
truth labels/verified claims must remain evidence-driven.

FND-03:
no persistence driver/cutover changes.

FND-04:
do not alter openBIM normalization/browser parsing.

FND-05:
do not surface Gemini/model names in normal executive overview.

---

# DO NOT TOUCH SERVER RUNTIME

HX-01 should be frontend-only except an unavoidable compile/type compatibility change.

Do not modify:

- persistence
- AI router
- IFC normalizer
- event semantics
- Academy task logic
- spatial coordinates
- server data

If frontend requires missing canonical data, show unavailable rather than adding fake backend data.

---

# TESTS

Add focused UI/state tests where practical:

### NAV-01
workspace registry order = 8 exact project items.

### NAV-02
only one primary workspace active.

### NAV-03
active workspace toggles closed.

### NAV-04
Alt+1..8 mapping correct.

### NAV-05
typing/input ignores launcher shortcuts.

### OVERVIEW-01
simulation/test mode clearly labeled.

### OVERVIEW-02
missing cost shows NOT_CALCULATED / unavailable.

### OVERVIEW-03
missing schedule does not fabricate duration.

### OVERVIEW-04
no fallback 82%/100/Tampa owner claims in new overview.

### STATUS-01
Done/Doing/Next derives from canonical state.

### SHELL-01
legacy inspector initial state closed/scoped.

### SHELL-02
opening workspace does not drive page navigation away from BIM world.

Do not create brittle pixel snapshot tests if existing test stack is not suited.

---

# REGRESSION

Run:

HX-01 focused tests

FND-05 tests

FND-04 tests

FND-03 tests

FND-02 tests

FND-01 tests

Academy House vertical slice

Phase-1 visual gate

BIM Stage-C/proof regression

TypeScript typecheck

production build

Do not mutate malformed PDF/XRef fixture.

---

# PHYSICAL VISUAL ACCEPTANCE

If a faithful browser/disposable preview is available:

capture desktop screenshots of:

1. world with all workspaces closed
2. Project Overview open
3. Model panel open
4. Workforce panel open
5. Systems panel open
6. Developer/System open

Also verify:

- launcher ~48px
- world remains visually dominant
- overlays do not resize world
- no blank WebGL/IFC viewport
- no top dashboard header
- no legacy inspector open by default
- no Prime/autonomy default panel
- Project Overview contains no fabricated truth

If browser unavailable:

report:

`PHYSICAL_BROWSER_VERIFICATION: NOT RUN — BROWSER CAPABILITY UNAVAILABLE`

Do not claim physical acceptance from screenshots generated by code or unit tests.

---

# RUNTIME FILE PROTECTION

Preserve eight runtime-generated files exactly:

- modified
- unstaged
- uncommitted
- SHA-256 unchanged

Preserve reference IFC/JSON files.

No tests may overwrite them permanently.

---

# COMMIT

One focused HX-01 commit only.

Branch:

`feature/hermes-immersive-human-experience`

Do not merge to main.

Do not start HX-02.

---

# FINAL REPORT

Return:

```text
HX01_COMPLETE

CURRENT_REMOTE_MAIN:
FOUNDATION_BASE:
IMPLEMENTATION_BRANCH:
IMPLEMENTATION_COMMIT:

FILES_CHANGED:

IMMERSIVE_SHELL:
LAUNCHER:
PROJECT_IDENTITY:
STATUS_HUD:
PROJECT_OVERVIEW:
MODEL_REUSE:
WORKFORCE_REUSE:
SYSTEMS_REUSE:
PLACEHOLDER_WORKSPACES:
TIMELINE:
INSPECTOR_DEFAULT:
DEVELOPER_SYSTEM:

TRUTH_REPAIRS:

HX01_TESTS:
FOUNDATION_REGRESSION:
ACADEMY_HOUSE:
VISUAL_GATE:
BIM_REGRESSION:
TYPECHECK:
BUILD:

RUNTIME_FILES:
REFERENCE_FILES:

PHYSICAL_BROWSER_VERIFICATION:
SCREENSHOTS:

KNOWN_REMAINING_HX01_GAPS:

TRUTH_LABEL:
IMPLEMENTED — NOT PHYSICALLY VERIFIED
```

STOP after HX-01.
