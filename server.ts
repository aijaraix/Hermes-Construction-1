import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { primeOrchestrator } from './server/primeOrchestrator';
import { researchConstructionTopic } from './server/geminiService';
import { AgentRegistry } from './server/agentRegistry';
import { OrganizationEngine } from './server/organizationEngine';
import { SourceRegistry } from './server/sourceRegistry';
import { KnowledgeIngestionEngine } from './server/knowledgeIngestionEngine';
import { RoomCoordinationEngine } from './server/roomCoordinationEngine';
import { CloseoutEngine } from './server/closeoutEngine';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Endpoints
  app.get('/api/system', (req, res) => {
    res.json(primeOrchestrator.getSystemState());
  });

  app.post('/api/system/pause', (req, res) => {
    try {
      const controls = req.body || {};
      const updatedState = primeOrchestrator.setPauseControls(controls);
      res.json(updatedState);
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Failed to update pause controls' });
    }
  });

  app.get('/api/tasks/:projectId', (req, res) => {
    res.json(primeOrchestrator.getProjectTasks(req.params.projectId));
  });

  app.get('/api/agents', (req, res) => {
    res.json(primeOrchestrator.getAgents());
  });

  app.get('/api/snapshots/:projectId', (req, res) => {
    const p = primeOrchestrator.getProject(req.params.projectId);
    res.json(p?.snapshots || []);
  });

  app.get('/api/heartbeat', (req, res) => {
    res.json(primeOrchestrator.getHeartbeatState());
  });

  // PART 4 Durable Scheduler Internal Endpoint
  app.post('/internal/hermes/heartbeat', async (req, res) => {
    try {
      const { projectId } = req.body || {};
      const state = await primeOrchestrator.triggerHeartbeat(projectId);
      res.json({
        success: true,
        heartbeat_id: `HB-${Date.now()}`,
        status: state,
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Internal Heartbeat execution error' });
    }
  });

  app.post('/api/heartbeat/tick', async (req, res) => {
    try {
      const { projectId } = req.body || {};
      const state = await primeOrchestrator.triggerHeartbeat(projectId);
      res.json(state);
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Heartbeat execution error' });
    }
  });

  // Auditable Record Endpoints (PART 3)
  app.get('/api/records/heartbeats', (req, res) => {
    res.json(primeOrchestrator.getHeartbeatRecords());
  });

  app.get('/api/records/tasks', (req, res) => {
    const { projectId } = req.query;
    res.json(primeOrchestrator.getTaskExecutionRecords(projectId as string));
  });

  app.get('/api/records/revisions', (req, res) => {
    const { projectId } = req.query;
    res.json(primeOrchestrator.getModelRevisionRecords(projectId as string));
  });

  app.get('/api/records/inspections', (req, res) => {
    const { projectId } = req.query;
    res.json(primeOrchestrator.getInspectionAuditRecords(projectId as string));
  });

  app.get('/api/records/bom-revisions', (req, res) => {
    const { projectId } = req.query;
    res.json(primeOrchestrator.getBOMRevisionRecords(projectId as string));
  });

  app.get('/api/records/decisions', (req, res) => {
    const { projectId } = req.query;
    res.json(primeOrchestrator.getDecisionLogs(projectId as string));
  });

  app.get('/api/records/competency', (req, res) => {
    res.json(primeOrchestrator.getCompetencyMatrix());
  });

  app.get('/api/records/corpus', (req, res) => {
    res.json(primeOrchestrator.getCorpusSources());
  });

  app.get('/api/projects', (req, res) => {
    res.json(primeOrchestrator.getAllProjects());
  });

  app.get('/api/projects/:id', (req, res) => {
    const p = primeOrchestrator.getProject(req.params.id);
    if (!p) return res.status(404).json({ error: 'Project not found' });
    res.json(p);
  });

  app.post('/api/projects/set-active', (req, res) => {
    const { id } = req.body;
    primeOrchestrator.setActiveProject(id);
    res.json(primeOrchestrator.getHeartbeatState());
  });

  app.post('/api/projects/gym/create', async (req, res) => {
    try {
      const { level, prompt } = req.body;
      const project = await primeOrchestrator.createGymProject(level || 3, prompt);
      res.json(project);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/projects/:id/propose-revision', (req, res) => {
    try {
      const { prompt } = req.body;
      const revision = primeOrchestrator.proposeRevision(req.params.id, prompt);
      res.json(revision);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/projects/:id/apply-revision', (req, res) => {
    try {
      const { prompt } = req.body;
      const project = primeOrchestrator.applyRevision(req.params.id, prompt);
      res.json(project);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/projects/:id/repair-ticket', async (req, res) => {
    try {
      const { ticketId } = req.body;
      const project = await primeOrchestrator.repairTicket(req.params.id, ticketId);
      res.json(project);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get('/api/knowledge-graph', (req, res) => {
    res.json(primeOrchestrator.getKnowledgeGraph());
  });

  app.get('/api/learned-lessons', (req, res) => {
    res.json(primeOrchestrator.getLearnedLessons());
  });

  // Source Bundle & Remote Audit Endpoints
  app.get('/api/download-source-bundle', (req, res) => {
    const bundlePath = path.join(process.cwd(), 'public', 'hermes-construction-source.zip');
    res.download(bundlePath, 'hermes-construction-source-4186755.zip');
  });

  app.get('/api/commit-manifest', (req, res) => {
    const manifestPath = path.join(process.cwd(), 'public', 'COMMIT_MANIFEST.txt');
    res.sendFile(manifestPath);
  });

  app.post('/api/research', async (req, res) => {
    try {
      const { query, location } = req.body;
      const result = await researchConstructionTopic(query, location);
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Phase 3.15 & 3.16 Autonomous Organization & Knowledge API Endpoints
  app.get('/api/organization/contracts', (req, res) => {
    res.json(AgentRegistry.getAllContracts());
  });

  app.get('/api/organization/messages', (req, res) => {
    res.json(OrganizationEngine.getAllMessages());
  });

  app.get('/api/organization/readiness', (req, res) => {
    res.json(primeOrchestrator.getCoreReadinessGate());
  });

  app.get('/api/readiness-gate', (req, res) => {
    res.json(primeOrchestrator.getCoreReadinessGate());
  });

  app.get('/api/knowledge/sources', (req, res) => {
    res.json(SourceRegistry.getAllSources());
  });

  app.get('/api/knowledge/fetches', (req, res) => {
    res.json(KnowledgeIngestionEngine.getFetchRecords());
  });

  app.get('/api/knowledge/parses', (req, res) => {
    res.json(KnowledgeIngestionEngine.getParseRecords());
  });

  app.get('/api/knowledge/documents', (req, res) => {
    res.json(KnowledgeIngestionEngine.getDocuments());
  });

  app.get('/api/knowledge/chunks', (req, res) => {
    res.json(KnowledgeIngestionEngine.getChunks());
  });

  app.get('/api/knowledge/chunk/:chunkId', (req, res) => {
    const chunk = KnowledgeIngestionEngine.getChunk(req.params.chunkId);
    if (!chunk) return res.status(404).json({ error: 'Chunk not found' });
    res.json(chunk);
  });

  app.get('/api/knowledge/assertions', (req, res) => {
    res.json(KnowledgeIngestionEngine.getAssertions());
  });

  app.get('/api/knowledge/curriculum/:agentRoleId', (req, res) => {
    res.json(KnowledgeIngestionEngine.getCurriculum(req.params.agentRoleId) || null);
  });

  app.get('/api/knowledge/curricula', (req, res) => {
    res.json(KnowledgeIngestionEngine.getCurricula());
  });

  app.get('/api/knowledge/packs', (req, res) => {
    res.json(KnowledgeIngestionEngine.getKnowledgePacks());
  });

  app.get('/api/knowledge/test-results', (req, res) => {
    res.json(KnowledgeIngestionEngine.getTestResults());
  });

  app.get('/api/knowledge/manager-reviews', (req, res) => {
    res.json(KnowledgeIngestionEngine.getManagerReviews());
  });

  app.get('/api/knowledge/shadow-proposals', (req, res) => {
    res.json(KnowledgeIngestionEngine.getShadowProposals());
  });

  app.get('/api/knowledge/audit-traces', (req, res) => {
    res.json(KnowledgeIngestionEngine.getAllAuditTraces());
  });

  app.get('/api/knowledge/audit-trace/:agentRoleId', (req, res) => {
    const trace = KnowledgeIngestionEngine.getAuditTrace(req.params.agentRoleId);
    if (!trace) return res.status(404).json({ error: 'Audit trace not found' });
    res.json(trace);
  });

  app.get('/api/knowledge/gaps', (req, res) => {
    res.json(KnowledgeIngestionEngine.getKnowledgeGaps());
  });

  app.post('/api/knowledge/ingest', (req, res) => {
    try {
      const { agentRoleId } = req.body || {};
      const report = KnowledgeIngestionEngine.triggerAutonomousLearningStep(agentRoleId);
      res.json(report);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/knowledge/learn-step', (req, res) => {
    try {
      const { agentRoleId } = req.body || {};
      const report = KnowledgeIngestionEngine.triggerAutonomousLearningStep(agentRoleId);
      res.json(report);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get('/api/room/scope', (req, res) => {
    const roomId = (req.query.roomId as string) || 'ROOM-204';
    res.json(RoomCoordinationEngine.getRoomScope(roomId));
  });

  app.post('/api/room/coordinate', (req, res) => {
    try {
      const { roomId } = req.body || { roomId: 'ROOM-204' };
      const result = RoomCoordinationEngine.executeRoomCoordinationCycle(roomId);
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get('/api/closeout/audits', (req, res) => {
    res.json(CloseoutEngine.getCloseoutAudits());
  });

  // Vite Middleware in Development vs Static Production Serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Continuous Autonomous Heartbeat Ticker (Runs every 10 seconds)
  setInterval(() => {
    primeOrchestrator.triggerHeartbeat().catch((err) => {
      console.error('[HERMES TICKER ERROR]:', err?.message || err);
    });
  }, 10000);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`HERMES Construction System running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
