import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { primeOrchestrator } from './server/primeOrchestrator';
import { researchConstructionTopic } from './server/geminiService';

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

  app.post('/api/research', async (req, res) => {
    try {
      const { query, location } = req.body;
      const result = await researchConstructionTopic(query, location);
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
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
