# HERMES AUTONOMOUS LEARNING OPERATIONS
## Continuous Ticker Scheduling, Quota Handling, and Operational Monitoring

### Autonomous Execution Engine
HERMES Construction operates continuously without requiring human users to trigger daily learning cycles manually.

---

### Core Operational Components

#### 1. Unattended Background Heartbeat
- **Ticker Mechanism**: `server.ts` maintains a persistent background interval ticker (`setInterval(..., 10000)`).
- **Execution**: On each tick, `primeOrchestrator.triggerHeartbeat()` executes:
  1. Checks active project state and system pause controls.
  2. Dispatches autonomous learning steps via `KnowledgeIngestionEngine`.
  3. Evaluates open knowledge gaps across registered trade agents.
  4. Triggers Manager Review cycles for completed curricula.
  5. Runs Independent Inspector sweeps across modified BIM models.

#### 2. Provider Quota Resilience
- **Status Monitoring**: Tracks LLM reasoning provider availability (`HEALTHY` vs `DEGRADED` / `QUOTA_LIMIT`).
- **Quota Exceeded Fallback Mode**:
  - Document discovery, HTTP source fetching, SHA-256 hashing, PDF parsing, semantic chunking, and deterministic rule indexing proceed continuously.
  - LLM reasoning jobs enter an internal queue (`pendingReasoningJobs`).
  - Once reasoning quota refreshes, queued jobs are processed in priority order.

#### 3. Morning Learning Trend Report
Generates daily operational metrics summarizing system learning progress:
- Documents Discovered & Ingested
- Total Pages Parsed & Chunks Created
- Assertions Validated & Corroborated
- Active Learning Agents & Competency Tests Run
- Manager Reviews Completed
- Core Construction Readiness Percentage
