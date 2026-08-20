# HERMES Construction Architecture Documentation

## Overview
HERMES Construction is an autonomous construction intelligence and digital building system built on a full-stack React + Express + TypeScript platform.

## High-Level Components
1. **HERMES Prime Orchestrator (`server/primeOrchestrator.ts`)**: The central system supervisor executing heartbeat turns, managing project states, and driving training curricula.
2. **Durable Persistence Engine (`server/persistence/persistenceStore.ts`)**: Manages disk serialization (`data/db/hermes_store.json`), ensuring state survival across server reboots.
3. **Task Dependency Graph (`server/taskGraphEngine.ts`)**: Controls discrete 20-stage construction tasks and triggers intermediate 3D BIM twin snapshots.
4. **Swarm Agent Registry (`server/agentRegistry.ts`)**: Tracks 13 domain-specialized agents (Site, Structural, Plumbing, HVAC, Electrical, Inspector, Repair, Quantity, Procurement, Risk, Knowledge).
5. **Deterministic Geometry & Quantity Engine (`server/deterministicGeometryEngine.ts`)**: Computes exact material quantities, costs, and revision impacts directly from 3D BIM geometry.
6. **Model Service Abstraction (`server/geminiService.ts`)**: Interfaces with Gemini 3.7 Flash for deep construction reasoning and topic research, with full offline deterministic fallback.
7. **3D BIM Twin Viewer (`src/components/ThreeBIMViewer.tsx`)**: Interactive WebGL rendering powered by Three.js with 4D timeline scrubbing, systems toggles, and inspection heatmaps.

## API Endpoints
- `GET /api/system` - System state, counters, quotas, pause status
- `POST /api/system/pause` - Set pause/resume controls
- `GET /api/heartbeat` - Current HUD state
- `POST /api/heartbeat/tick` - Trigger heartbeat turn
- `GET /api/projects` - List digital twin projects
- `GET /api/projects/:id` - Fetch single project
- `GET /api/tasks/:projectId` - Fetch task graph for project
- `GET /api/agents` - Fetch swarm agent status
- `GET /api/snapshots/:projectId` - Fetch 3D BIM model snapshots
- `POST /api/projects/gym/create` - Launch Gym exercise
- `POST /api/projects/:id/repair-ticket` - Repair code ticket
- `POST /api/projects/:id/propose-revision` - Evaluate revision
- `POST /api/projects/:id/apply-revision` - Apply revision to digital twin
