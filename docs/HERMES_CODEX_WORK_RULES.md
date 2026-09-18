# HERMES CODEX WORK RULES

**Purpose:** Reduce Codex spend by preventing rediscovery, scope drift, redundant audits, and unrequested architecture work.

## 1. Start every assignment the same way

1. Fetch current remote `main`.
2. Record current SHA.
3. Preserve legitimate newer work.
4. Read:
   - `docs/HERMES_CONTROL_INDEX.md`
   - `docs/HERMES_CURRENT_STATE.md`
   - `docs/HERMES_EXECUTION_ROADMAP.md`
   - this file
   - the single task-specific handoff
5. Inspect only the files necessary for the assignment.

Do **not** crawl the repository or all docs by default.

## 2. Do not rediscover HERMES

Assume the control layer is intentional.

Do not spend a work session re-explaining:

- what HERMES is;
- whether it should be a game;
- whether robots are a future target;
- whether the 1 m cell replaces precise geometry;
- whether visual truth should follow canonical state;
- whether a small local model is a future goal;
- whether Academy House 001 is the first vertical slice.

Those decisions are already made unless the owner explicitly reopens them.

## 3. Task scope

Every Codex assignment should specify:

- objective;
- allowed files/systems;
- forbidden scope;
- physical acceptance criteria;
- test commands;
- deployment/runtime limits;
- stopping conditions.

If a requirement is unclear and blocks correct implementation, ask one focused question.

Do not turn ambiguity into a broad exploratory refactor.

## 4. Preserve architecture

Do not create:

- `Hermes-Construction-2`;
- a disconnected game demo;
- a separate robot rewrite;
- a second canonical world;
- frontend-only construction truth;
- another orchestrator when one can be repaired;
- duplicate persistence solely for convenience.

Prefer extending existing canonical abstractions.

## 5. Truth standard

Use only:

- PHYSICALLY VERIFIED
- IMPLEMENTED — NOT PHYSICALLY VERIFIED
- PARTIAL
- SIMULATED
- BLOCKED
- NOT IMPLEMENTED

No evidence = UNVERIFIED.

Do not convert source inspection into physical proof.

Do not hard-code pass metrics to satisfy acceptance.

## 6. Visual work

For visual acceptance:

- run the real application;
- inspect the real canonical world;
- use screenshots/browser evidence;
- check console/runtime errors;
- distinguish modeling defect from rendering defect;
- never create a disconnected screenshot-only scene to pass acceptance.

## 7. Runtime-mutated files

Starting HERMES may mutate tracked persistence/reference files.

Do not automatically commit runtime mutation.

Before staging any such file, determine:

- source change?
- deterministic generated artifact that must be versioned?
- runtime state that should remain outside source control?

Report the classification.

## 8. Tests

Use the narrowest relevant validation first:

1. typecheck;
2. targeted tests;
3. production build;
4. relevant integration/runtime test;
5. broader suite only when necessary.

Do not burn time fixing unrelated legacy failures unless they block the current assignment.

Record known unrelated failures separately.

## 9. Commits

Prefer small meaningful commits.

Do not:

- reset legitimate work;
- force-push;
- squash without authorization;
- rewrite accepted history;
- mix runtime-generated state into implementation commits;
- mix broad cleanup into a focused feature commit.

If direct publishing requires owner approval, stop at a clean committed state and report the exact SHA.

## 10. Model/LLM work

Do not use an LLM where deterministic code is the correct solution.

Examples that should normally be deterministic:

- geometry;
- collision;
- quantities;
- coordinate transforms;
- path feasibility;
- schedule math;
- dependency enforcement;
- code thresholds already encoded;
- state transitions.

Use model reasoning for:

- ambiguous structured decisions;
- tool routing;
- extraction;
- interpretation;
- explanation;
- constrained planning;
- uncertain/high-level trade-offs.

## 11. Infrastructure work

Do not redesign deployment because a temporary host has limitations.

For temporary acceptance:

- choose a faithful host;
- make minimal compatibility changes;
- do not migrate databases;
- do not create permanent production infrastructure.

For permanent runtime work:

- follow the roadmap phase;
- measure requirements before selecting infrastructure;
- keep inference modular.

## 12. Robotics work

HERMES is mission/world coordination, not the robot's hard-real-time motor controller.

Never route free-form model output directly into physical actuators.

Future hardware tasks must preserve:

- deterministic safety layer;
- robot-local motion/control;
- telemetry feedback;
- mission-level command boundaries.

## 13. Output discipline

At completion report only what materially matters:

- starting SHA;
- resulting SHA(s);
- files changed;
- tests/builds;
- physical evidence;
- current status;
- blockers;
- next recommended bounded task.

Avoid long re-summaries of HERMES history unless asked.

## 14. Stop conditions

Stop and ask before:

- granting broader third-party repository access;
- production promotion;
- destructive Git operations;
- architecture rewrite;
- permanent paid infrastructure provisioning;
- storing new secrets;
- changing repository/security policy;
- changing owner-controlled business decisions.

## 15. Cost discipline

The purpose of these rules is to reserve Codex for work that benefits from a live coding/runtime environment.

When a task is primarily:

- planning;
- research;
- architecture;
- backlog design;
- documentation;
- source review;
- prompt preparation;
- acceptance design;

hand it back to the planning layer instead of spending a Codex implementation session.
