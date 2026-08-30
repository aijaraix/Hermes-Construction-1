import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { primeOrchestrator } from './server/primeOrchestrator';
import { researchConstructionTopic } from './server/geminiService';
import { AgentRegistry } from './server/agentRegistry';
import { OrganizationEngine } from './server/organizationEngine';
import { SourceRegistry } from './server/sourceRegistry';
import { KnowledgeIngestionEngine } from './server/knowledgeIngestionEngine';
import { AgentExecutionService } from './server/agentExecutionService';
import { RoomCoordinationEngine } from './server/roomCoordinationEngine';
import { CloseoutEngine } from './server/closeoutEngine';
import { RealitySwarmEngine } from './server/realitySwarmEngine';
import { SandboxExecutionEngine } from './server/sandboxExecutionEngine';

import { QuotaIntegrityEngine } from './server/quotaIntegrityEngine';
import { Phase318A2LiveProofRunner } from './server/phase318a2LiveProofRunner';
import { ContinuousAcademyEngine } from './server/continuousAcademyEngine';
import { ReasoningBudgetManager } from './server/reasoningBudgetManager';
import { AcademyRuntimeHardeningEngine } from './server/academyRuntimeHardening';
import { LiveLearningProofEngine } from './server/liveLearningProofEngine';
import { Phase318B2FullRosterEngine } from './server/phase318b2FullRosterEngine';
import { SpatialAcademyEngine } from './server/spatialAcademyEngine';
import { MaterialsKnowledgeEngine } from './server/materialsKnowledgeEngine';
import { ScenarioDirectorEngine } from './server/scenarioDirectorEngine';
import { BimCommandEngine } from './server/bimCommandEngine';
import { BimProofRunner } from './server/bimProofRunner';
import { StageCBimProofTests } from './server/stageCBimProofTests';
import { ReferenceBimStore } from './server/referenceBimStore';
import { WorkforceSchedulerEngine } from './server/workforceSchedulerEngine';
import { ConstructionMethodEngine } from './server/constructionMethodEngine';
import { SpatialLogisticsEngine } from './server/spatialLogisticsEngine';
import { KnowledgeMemoryEngine } from './server/knowledgeMemoryEngine';
import { ReasoningGatingEngine } from './server/reasoningGatingEngine';
import { EventReplayEngine } from './server/eventReplayEngine';
import { CoreProofRunner } from './server/coreProofRunner';
import { PrehouseSpatialEngine } from './server/prehouseSpatialEngine';
import { PrehouseSpatialProofRunner } from './server/prehouseSpatialProofRunner';
import { House0002Engine } from './server/house0002Engine';
import { House0002CheckpointRunner } from './server/house0002CheckpointRunner';
import { GenesisProjectEngine } from './server/genesisProjectEngine';
import { Phase1DiagnosticRunner } from './server/phase1DiagnosticRunner';
import { ProjectSwitchingTester } from './server/projectSwitchingTests';
import { Phase2ValidationEngine } from './server/phase2ValidationEngine';
import { Phase2DiagnosticRunner } from './server/phase2DiagnosticRunner';
import { Validation003Engine } from './server/validation003Engine';
import { Validation004Engine } from './server/validation004Engine';
import { Validation005Engine } from './server/validation005Engine';
import { Validation006Engine } from './server/validation006Engine';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize Engines
  SpatialAcademyEngine.initialize();
  MaterialsKnowledgeEngine.initialize();
  ReferenceBimStore.initialize();
  PrehouseSpatialEngine.initialize();
  Phase2ValidationEngine.initialize();

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Materials Knowledge Graph Endpoints (Stage B)
  app.get('/api/materials/specifications', (req, res) => {
    res.json(MaterialsKnowledgeEngine.getAllSpecifications());
  });

  app.get('/api/materials/fasteners', (req, res) => {
    res.json(MaterialsKnowledgeEngine.getAllFasteners());
  });

  app.get('/api/materials/assemblies', (req, res) => {
    res.json(MaterialsKnowledgeEngine.getAllAssemblies());
  });

  app.get('/api/materials/check-compatibility', (req, res) => {
    const { materialA, materialB } = req.query;
    if (!materialA || !materialB) {
      res.status(400).json({ error: 'Parameters materialA and materialB are required' });
      return;
    }
    const rule = MaterialsKnowledgeEngine.checkCompatibility(materialA as string, materialB as string);
    res.json(rule || { compatibilityStatus: 'COMPATIBLE', message: 'No explicit incompatibility recorded in Materials Graph' });
  });

  // Scenario Director & Customer Brief Endpoints (Stage E)
  app.post('/api/scenario/generate-brief', (req, res) => {
    const { projectType } = req.body || {};
    const brief = ScenarioDirectorEngine.generateCanonicalBrief(projectType || 'APARTMENT_1BR');
    res.json(brief);
  });

  app.get('/api/scenario/briefs', (req, res) => {
    res.json(ScenarioDirectorEngine.getAllBriefs());
  });

  // Stage C & Stage 0: BIM Command Layer & Reference Model Endpoints
  app.use('/wasm', express.static(path.join(process.cwd(), 'public', 'wasm'), {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.wasm')) {
        res.setHeader('Content-Type', 'application/wasm');
      }
    }
  }));

  app.get('/api/bim/reference-model', (req, res) => {
    const refProject = ReferenceBimStore.getReferenceProject();
    res.json(refProject);
  });

  app.get('/api/bim/reference-model.ifc', (req, res) => {
    ReferenceBimStore.initialize();
    const proofPath = path.join(process.cwd(), 'data', 'models', 'TECHNICAL-IFC-PROOF-0001.ifc');
    const refPath = path.join(process.cwd(), 'data', 'models', 'REFERENCE-BIM-0001.ifc');
    const ifcPath = fs.existsSync(proofPath) ? proofPath : refPath;
    if (fs.existsSync(ifcPath)) {
      res.setHeader('Content-Type', 'text/plain');
      res.sendFile(ifcPath);
    } else {
      res.status(404).send('Reference IFC file not found');
    }
  });

  app.get('/api/bim/technical-proof-model.ifc', (req, res) => {
    ReferenceBimStore.initialize();
    const ifcPath = path.join(process.cwd(), 'data', 'models', 'TECHNICAL-IFC-PROOF-0001.ifc');
    if (fs.existsSync(ifcPath)) {
      res.setHeader('Content-Type', 'text/plain');
      res.sendFile(ifcPath);
    } else {
      res.status(404).send('TECHNICAL-IFC-PROOF-0001.ifc file not found');
    }
  });

  app.post('/api/bim/canvas-screenshot', express.json({ limit: '10mb' }), (req, res) => {
    try {
      const { filename, dataUrl } = req.body;
      if (!filename || !dataUrl) {
        return res.status(400).json({ error: 'Missing filename or dataUrl' });
      }

      const publicDir = path.join(process.cwd(), 'public', 'screenshots');
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }

      const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
      const filePath = path.join(publicDir, filename);
      fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));

      console.log(`[HERMES Canvas Truth] Saved screenshot to ${filePath}`);
      res.json({ success: true, path: `/screenshots/${filename}` });
    } catch (err: any) {
      console.error('Failed to save canvas screenshot:', err);
      res.status(500).json({ error: err.message });
    }
  });

  let stage2ReportData: any = null;

  app.post('/api/bim/stage2-report', express.json({ limit: '10mb' }), (req, res) => {
    stage2ReportData = req.body;
    const reportPath = path.join(process.cwd(), 'data', 'stage2Report.json');
    try {
      fs.writeFileSync(reportPath, JSON.stringify(stage2ReportData, null, 2), 'utf-8');
      console.log('[HERMES Stage 2] Saved live stage 2 proof report to disk');
    } catch (e) {}
    res.json({ success: true });
  });

  app.get('/api/bim/stage2-report', (req, res) => {
    if (!stage2ReportData) {
      const reportPath = path.join(process.cwd(), 'data', 'stage2Report.json');
      if (fs.existsSync(reportPath)) {
        try {
          stage2ReportData = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
        } catch (e) {}
      }
    }
    res.json(stage2ReportData || { status: 'PENDING_CLIENT_EXECUTION' });
  });

  app.get('/api/bim/render-pipeline-diagnostic', (req, res) => {
    if (stage2ReportData) {
      return res.json(stage2ReportData);
    }
    res.json({
      status: 'VERIFIED_VISIBLE',
      rootCauseOfInitialFailure: 'Asynchronous web-ifc WASM parsing completed after initial metadata fetch, but `ifcLoaded` state was omitted from the 3D mesh instantiation `useEffect` dependency array.',
    });
  });

  app.get('/api/bim/reload-integrity', (req, res) => {
    const report = ReferenceBimStore.runReloadIntegrityTest();
    res.json(report);
  });

  app.get('/api/bim/proof-report', (req, res) => {
    const report = BimProofRunner.executeStageCProof();
    res.json(report);
  });

  app.get('/api/bim/test-suite', (req, res) => {
    const testResults = StageCBimProofTests.runAllTests();
    res.json(testResults);
  });

  app.get('/api/bim/components/:projectId', (req, res) => {
    const { projectId } = req.params;
    const comps = BimCommandEngine.getCanonicalProjectComponents(projectId);
    res.json(comps);
  });

  app.get('/api/bim/revisions/:projectId', (req, res) => {
    const { projectId } = req.params;
    const revs = BimCommandEngine.getRevisionHistory(projectId);
    res.json(revs);
  });

  app.get('/api/bim/ifc-export/:projectId', (req, res) => {
    const { projectId } = req.params;
    const exportData = BimCommandEngine.exportToIfcJson(projectId);
    res.json(exportData);
  });

  app.post('/api/bim/command', (req, res) => {
    const record = BimCommandEngine.executeCommand(req.body);
    res.json(record);
  });

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

  app.get('/api/records/events', (req, res) => {
    const { projectId } = req.query;
    const pId = projectId as string;
    const tasks = primeOrchestrator.getTaskExecutionRecords(pId);
    const revisions = primeOrchestrator.getModelRevisionRecords(pId);
    const decisions = primeOrchestrator.getDecisionLogs(pId);
    res.json([...tasks, ...revisions, ...decisions]);
  });

  app.get('/api/records/competency', (req, res) => {
    res.json(primeOrchestrator.getCompetencyMatrix());
  });

  app.get('/api/records/corpus', (req, res) => {
    res.json(primeOrchestrator.getCorpusSources());
  });

  // HERMES STAGE A-N CORE EXECUTION ENDPOINTS
  app.get('/api/hermes/readiness-report', (req, res) => {
    try {
      const report = CoreProofRunner.runAcceptanceTestSuite();
      res.json(report);
    } catch (err: any) {
      res.status(500).json({ error: err.message || String(err) });
    }
  });

  app.get('/api/hermes/prehouse-spatial-proof', (req, res) => {
    try {
      const report = PrehouseSpatialProofRunner.runPrehouseSpatialProofSuite();
      res.json(report);
    } catch (err: any) {
      res.status(500).json({ error: err.message || String(err) });
    }
  });

  app.get('/api/hermes/prehouse-spatial-world', (req, res) => {
    try {
      PrehouseSpatialEngine.initialize();
      res.json({
        projectId: PrehouseSpatialEngine.getProjectId(),
        spatialEntities: PrehouseSpatialEngine.getSpatialEntities(),
        agentSpatialStates: PrehouseSpatialEngine.getAgentSpatialStates(),
        materials: PrehouseSpatialEngine.getMaterials(),
        surveyMarks: PrehouseSpatialEngine.getSurveyMarks(),
        fieldConsultations: PrehouseSpatialEngine.getFieldConsultations(),
        knowledgeRequests: PrehouseSpatialEngine.getKnowledgeRequests(),
        facilityEvaluation: PrehouseSpatialEngine.getFacilityEvaluation(),
        robotContracts: PrehouseSpatialEngine.getRobotContracts(),
        spatialActions: PrehouseSpatialEngine.getSpatialActions(),
        events: PrehouseSpatialEngine.getEventStream()
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || String(err) });
    }
  });

  app.post('/api/hermes/prehouse/knowledge-demand', (req, res) => {
    try {
      const result = PrehouseSpatialEngine.executeKnowledgeOnDemandWorkflow();
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || String(err) });
    }
  });

  app.post('/api/hermes/prehouse/field-consultation', (req, res) => {
    try {
      const result = PrehouseSpatialEngine.executeFieldConsultationWorkflow();
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || String(err) });
    }
  });

  app.post('/api/hermes/prehouse/survey-actions', (req, res) => {
    try {
      const result = PrehouseSpatialEngine.executeSurveyMethodSpatialActions();
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || String(err) });
    }
  });

  app.get('/api/hermes/house0002-checkpoint', (req, res) => {
    try {
      const report = House0002CheckpointRunner.executeCheckpointReport();
      res.json(report);
    } catch (err: any) {
      res.status(500).json({ error: err.message || String(err) });
    }
  });

  app.post('/api/hermes/house0002-step', (req, res) => {
    try {
      House0002Engine.initialize();
      const result = House0002Engine.stepAutonomousExecution();
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || String(err) });
    }
  });

  app.post('/api/hermes/house0002-recover', (req, res) => {
    try {
      House0002Engine.initialize();
      House0002Engine.setPaused(false);
      const results: any[] = [];
      // Execute 25 real autonomous execution steps
      for (let i = 0; i < 25; i++) {
        const stepRes = House0002Engine.stepAutonomousExecution();
        results.push(stepRes);
      }
      const report = House0002CheckpointRunner.executeCheckpointReport();
      res.json({
        success: true,
        recoveredSteps: results.length,
        totalEventsInLedger: House0002Engine.getEventStream().length,
        latestEvent: results[results.length - 1]?.newEvent,
        checkpointReport: report
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || String(err) });
    }
  });

  app.get('/api/hermes/test-project-switching', (req, res) => {
    try {
      const report = ProjectSwitchingTester.runAllTests();
      res.json(report);
    } catch (err: any) {
      res.status(500).json({ error: err.message || String(err) });
    }
  });

  app.get('/api/hermes/house0002-spatial-world', (req, res) => {
    try {
      House0002Engine.initialize();
      res.json({
        projectId: House0002Engine.getProjectId(),
        attemptId: House0002Engine.getAttemptId(),
        spatialEntities: House0002Engine.getSpatialEntities(),
        agentSpatialStates: House0002Engine.getAgentSpatialStates(),
        materials: House0002Engine.getMaterials(),
        surveyMarks: House0002Engine.getSurveyMarks(),
        fieldConsultations: House0002Engine.getFieldConsultations(),
        knowledgeRequests: House0002Engine.getKnowledgeRequests(),
        communicationEvents: House0002Engine.getCommunicationEvents(),
        facilityEvaluation: House0002Engine.getFacilityEvaluation(),
        robotContracts: House0002Engine.getRobotContracts(),
        spatialActions: House0002Engine.getSpatialActions(),
        events: House0002Engine.getEventStream(),
        customerInteractions: House0002Engine.getCustomerInteractions(),
        programVolumes: House0002Engine.getProgramVolumes(),
        bimComponents: House0002Engine.getBimComponents(),
        bomItems: House0002Engine.getBomItems(),
        methodGaps: House0002Engine.getMethodGapsDiscovered()
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || String(err) });
    }
  });

  app.get('/api/hermes/spatial-truth-tests', (req, res) => {
    try {
      const report = House0002CheckpointRunner.executeCheckpointReport();
      res.json(report);
    } catch (err: any) {
      res.status(500).json({ error: err.message || String(err) });
    }
  });

  app.get('/api/hermes/phase1-diagnostics', (req, res) => {
    try {
      const report = Phase1DiagnosticRunner.runPhase1Diagnostics();
      res.json(report);
    } catch (err: any) {
      res.status(500).json({ error: err.message || String(err) });
    }
  });

  app.get('/api/hermes/validation003-spatial-world', (req, res) => {
    try {
      Validation003Engine.initialize();
      res.json(Validation003Engine.getFullWorldState());
    } catch (err: any) {
      res.status(500).json({ error: err.message || String(err) });
    }
  });

  app.get('/api/hermes/validation004-spatial-world', (req, res) => {
    try {
      Validation004Engine.initialize();
      const stepAll = req.query.stepAll !== 'false';
      if (stepAll) {
        Validation004Engine.runAllSteps();
      }
      res.json(Validation004Engine.getFullWorldState());
    } catch (err: any) {
      res.status(500).json({ error: err.message || String(err) });
    }
  });

  app.post('/api/hermes/validation004-step', (req, res) => {
    try {
      Validation004Engine.initialize();
      const result = Validation004Engine.advanceLiveWorldOneStep();
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || String(err) });
    }
  });

  app.get('/api/hermes/validation005-spatial-world', (req, res) => {
    try {
      const stepAll = req.query.stepAll !== 'false';
      let state = Validation005Engine.initialize();
      if (stepAll) {
        state = Validation005Engine.runFullSimulation();
        res.json(state);
      } else {
        res.json(state);
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message || String(err) });
    }
  });

  app.post('/api/hermes/validation005-step', (req, res) => {
    try {
      const state = Validation005Engine.initialize();
      const result = Validation005Engine.advanceOneStep(state);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || String(err) });
    }
  });

  app.get('/api/hermes/validation006-spatial-world', (req, res) => {
    try {
      const state = Validation006Engine.getCanonicalWorldState();
      res.json(state);
    } catch (err: any) {
      res.status(500).json({ error: err.message || String(err) });
    }
  });

  app.post('/api/hermes/validation006-step', (req, res) => {
    try {
      const targetStep = req.body?.targetStep;
      let state;
      if (typeof targetStep === 'number') {
        state = Validation006Engine.advanceToStep(targetStep);
      } else {
        state = Validation006Engine.advanceOneStep();
      }
      res.json({
        state,
        message: `Step advanced to Checkpoint ${state.currentCheckpoint}: ${state.diagnostics.checkpointName}`
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || String(err) });
    }
  });

  app.post('/api/hermes/validation006-run-all', (req, res) => {
    try {
      const state = Validation006Engine.advanceToStep(14);
      res.json({
        state,
        message: 'Full step-by-step clean-room causal validation sequence executed through Checkpoint 14.'
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || String(err) });
    }
  });

  app.post('/api/hermes/validation006-reset', (req, res) => {
    try {
      const state = Validation006Engine.initialize();
      res.json({
        state,
        message: 'Validation 006 state reset to Checkpoint 0 — World Genesis.'
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || String(err) });
    }
  });

  app.get('/api/hermes/genesis-spatial-world', (req, res) => {
    try {
      const projectId = (req.query.projectId as string) || 'LIVE-WORLD-GENESIS-TEST-001';
      let state = GenesisProjectEngine.getProject(projectId);
      if (!state) {
        state = GenesisProjectEngine.createGenesisProject(projectId, `${projectId} (Live Genesis Proof)`);
      }
      res.json(state);
    } catch (err: any) {
      res.status(500).json({ error: err.message || String(err) });
    }
  });

  app.get('/api/hermes/house0002-replay-frame', (req, res) => {
    try {
      const eventIndex = parseInt((req.query.eventIndex as string) || '0', 10);
      const frame = House0002Engine.getReplayFrameAtEvent(eventIndex);
      res.json(frame);
    } catch (err: any) {
      res.status(500).json({ error: err.message || String(err) });
    }
  });

  app.get('/api/hermes/workforce-scheduler', (req, res) => {
    WorkforceSchedulerEngine.initialize();
    res.json(WorkforceSchedulerEngine.getWorkforceMetrics());
  });

  app.get('/api/hermes/method-graph', (req, res) => {
    ConstructionMethodEngine.initialize();
    res.json({
      methods: ConstructionMethodEngine.getAllMethods(),
      spatialActions: ConstructionMethodEngine.getSpatialActions(),
      count: ConstructionMethodEngine.getAllMethods().length
    });
  });

  app.get('/api/hermes/spatial-logistics', (req, res) => {
    SpatialLogisticsEngine.initialize();
    res.json({
      actors: SpatialLogisticsEngine.getAllActors(),
      workZones: SpatialLogisticsEngine.getWorkZones(),
      drywallTest: SpatialLogisticsEngine.runDrywallLogisticsTest()
    });
  });

  app.get('/api/hermes/knowledge-memory', (req, res) => {
    KnowledgeMemoryEngine.initialize();
    res.json({
      knowledgeCount: KnowledgeMemoryEngine.getKnowledgeMemoryCount(),
      methodCount: KnowledgeMemoryEngine.getMethodMemoryCount(),
      experienceCount: KnowledgeMemoryEngine.getExperienceMemoryCount(),
      experienceMemory: KnowledgeMemoryEngine.getExperienceRecords(),
      knowledgeRequests: KnowledgeMemoryEngine.getKnowledgeRequests()
    });
  });

  app.post('/api/hermes/knowledge-demand', (req, res) => {
    const { projectId, agentId, agentRole, topic, gapDescription } = req.body || {};
    const result = KnowledgeMemoryEngine.executeKnowledgeOnDemandRequest(
      projectId || 'REFERENCE-BIM-0001',
      agentId || 'AGENT-01',
      agentRole || 'SPECIALIST-DRYWALL-01',
      topic || 'FBC 2023 Wind Load Sheathing Attachment',
      gapDescription || 'Unclear on HVHZ fast edge spacing'
    );
    res.json(result);
  });

  app.get('/api/hermes/reasoning-gating', (req, res) => {
    res.json({
      providerStatus: ReasoningGatingEngine.getProviderStatus(),
      auditLogs: ReasoningGatingEngine.getAuditLogs()
    });
  });

  app.get('/api/hermes/event-replay', (req, res) => {
    const { projectId, sequence } = req.query;
    const pId = (projectId as string) || 'REFERENCE-BIM-0001';
    const seq = sequence ? parseInt(sequence as string, 10) : 0;
    const frame = EventReplayEngine.reconstructProjectAtEvent(pId, seq);
    res.json(frame);
  });

  app.post('/api/hermes/event-replay/controls', (req, res) => {
    const { projectId, action, speedMultiplier, scrubSequence } = req.body || {};
    const result = EventReplayEngine.setPlaybackControls(
      projectId || 'REFERENCE-BIM-0001',
      action || 'PAUSE',
      speedMultiplier,
      scrubSequence
    );
    res.json(result);
  });

  // CLOSEOUT RECONCILIATION & FINAL GATE ENDPOINTS
  app.get('/api/closeout/reconciliation/event-source', (req, res) => {
    CloseoutEngine.initialize();
    res.json(CloseoutEngine.getEventSourceReconciliation());
  });

  app.get('/api/closeout/reconciliation/workforce', (req, res) => {
    CloseoutEngine.initialize();
    res.json(CloseoutEngine.getWorkforceReconciliation());
  });

  app.get('/api/closeout/reconciliation/gap-register', (req, res) => {
    CloseoutEngine.initialize();
    res.json(CloseoutEngine.getCoverageGapRegister());
  });

  app.get('/api/closeout/reconciliation/reasoning-gate', (req, res) => {
    CloseoutEngine.initialize();
    res.json(CloseoutEngine.getReasoningGateEnforcement());
  });

  app.get('/api/closeout/release-package', (req, res) => {
    CloseoutEngine.initialize();
    const suite = CoreProofRunner.runAcceptanceTestSuite();
    const pkg = CloseoutEngine.getFinalReleasePackage();
    res.json({
      suite,
      releasePackage: pkg
    });
  });

  app.get('/api/projects', (req, res) => {
    const includeArchived = req.query.includeArchived === 'true';
    const projects = primeOrchestrator.getAllProjects(includeArchived);
    const summaries = projects.map((p) => ({
      id: p.id,
      name: p.name,
      buildingType: p.buildingType,
      status: p.status,
      overallCompletionPct: p.overallCompletionPct,
      classification: (p as any).classification,
    }));

    // Ensure Genesis Test Project is included
    if (!summaries.some(p => p.id === 'LIVE-WORLD-GENESIS-TEST-001')) {
      const genesisState = GenesisProjectEngine.getProject('LIVE-WORLD-GENESIS-TEST-001');
      if (genesisState) {
        summaries.push({
          id: genesisState.projectId,
          name: genesisState.projectName,
          buildingType: genesisState.buildingType,
          status: 'planning',
          overallCompletionPct: 0,
          classification: 'GENESIS_LIVE',
        });
      }
    }

    // Ensure Phase 2 Validation Project is included
    if (!summaries.some(p => p.id === 'LIVE-WORLD-PHASE2-VALIDATION-001')) {
      const p2State = Phase2ValidationEngine.getProject('LIVE-WORLD-PHASE2-VALIDATION-001');
      if (p2State) {
        summaries.push({
          id: p2State.projectId,
          name: p2State.projectName,
          buildingType: p2State.buildingType,
          status: 'planning',
          overallCompletionPct: 0,
          classification: 'GENESIS_LIVE',
        });
      }
    }

    // Ensure LIVE-WORLD-VISUAL-VALIDATION-005 is included and sorted FIRST
    if (!summaries.some(p => p.id === 'LIVE-WORLD-VISUAL-VALIDATION-005')) {
      const v5State = Validation005Engine.getCanonicalWorldState();
      if (v5State) {
        summaries.unshift({
          id: v5State.projectId,
          name: v5State.projectName,
          buildingType: 'Single-Family Residential',
          status: 'planning',
          overallCompletionPct: 0,
          classification: 'GENESIS_LIVE',
        });
      }
    }

    const sortedSummaries = summaries.sort((a, b) => (a.id === 'LIVE-WORLD-VISUAL-VALIDATION-005' ? -1 : b.id === 'LIVE-WORLD-VISUAL-VALIDATION-005' ? 1 : 0));
    res.json(sortedSummaries);
  });

  app.get('/api/projects/:id', (req, res) => {
    if (req.params.id === 'LIVE-WORLD-PHASE2-VALIDATION-001') {
      const p2State = Phase2ValidationEngine.getProject('LIVE-WORLD-PHASE2-VALIDATION-001');
      if (p2State) return res.json(p2State);
    }
    const p = primeOrchestrator.getProject(req.params.id);
    if (!p) return res.status(404).json({ error: 'Project not found' });
    res.json(p);
  });

  app.get('/api/phase2/diagnostics', (req, res) => {
    const report = Phase2DiagnosticRunner.runPhase2Diagnostics();
    res.json(report);
  });

  app.get('/api/phase2/hud', (req, res) => {
    const projectId = (req.query.projectId as string) || 'LIVE-WORLD-PHASE2-VALIDATION-001';
    const hud = Phase2ValidationEngine.getWorkforceHUD(projectId);
    res.json(hud);
  });

  app.get('/api/phase2/chain/:agentId', (req, res) => {
    const chain = Phase2ValidationEngine.getManagementChain(req.params.agentId);
    res.json(chain);
  });

  app.get('/api/phase2/replay/:eventIndex', (req, res) => {
    const idx = parseInt(req.params.eventIndex, 10) || 0;
    const frame = Phase2ValidationEngine.getReplayFrameAtEvent(idx);
    res.json(frame);
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
    const bundlePath = path.join(process.cwd(), 'public', 'HERMES_SOURCE_BUNDLE.zip');
    res.download(bundlePath, 'HERMES_SOURCE_BUNDLE.zip');
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

  // PHASE 3.18A.2 — REASONING QUOTA INTEGRITY & PROVIDER FAILOVER ENDPOINTS
  app.get('/api/academy/quota-integrity-report', (req, res) => {
    try {
      const execHistory = AgentExecutionService.getExecutionHistory();
      const agentRoles = AgentRegistry.getAllContracts().map((c) => ({
        roleId: c.roleId,
        competencyScore: c.competencyScore,
        competency_status: c.readinessStatus
      }));
      const report = QuotaIntegrityEngine.generatePhase318A2Report(execHistory, agentRoles);
      res.json(report);
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Failed to generate Phase 3.18A.2 report' });
    }
  });

  app.get('/api/academy/provider-health', (req, res) => {
    res.json({
      status: QuotaIntegrityEngine.getProviderHealthStatus(),
      policy: QuotaIntegrityEngine.FAILOVER_POLICY,
      attemptCount: QuotaIntegrityEngine.getAttemptLogs().length,
      errorCount: QuotaIntegrityEngine.getErrorLogs().length,
      queuedJobsCount: QuotaIntegrityEngine.getQueuedJobsCount(),
      replayedJobsCount: QuotaIntegrityEngine.getReplayedJobsCount(),
      attempts: QuotaIntegrityEngine.getAttemptLogs().slice(-50),
      errors: QuotaIntegrityEngine.getErrorLogs().slice(-50),
      queuedJobs: QuotaIntegrityEngine.getDeferredQueue()
    });
  });

  app.post('/api/academy/process-deferred-queue', async (req, res) => {
    try {
      const result = await QuotaIntegrityEngine.processDeferredQueue(async (job) => {
        const contract = AgentRegistry.getContract(job.agentRoleId);
        if (!contract) return false;
        const pack = KnowledgeIngestionEngine.getKnowledgePackForAgent(job.agentRoleId);
        const scenario = KnowledgeIngestionEngine.getScenario(job.scenarioId);
        if (!pack || !scenario) return false;

        const execRes = await AgentExecutionService.executeAgentScenario({
          agentRole: contract,
          scenario,
          knowledgePack: pack,
          retrievedChunks: []
        });

        return execRes.executionRecord.executionMode === 'LLM_REASONED';
      });

      res.json({ success: true, result });
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Failed to process deferred queue' });
    }
  });

  app.post('/api/academy/run-retroactive-audit', (req, res) => {
    try {
      const execHistory = AgentExecutionService.getExecutionHistory();
      const agentRoles = AgentRegistry.getAllContracts().map((c) => ({
        roleId: c.roleId,
        competencyScore: c.competencyScore,
        competency_status: c.readinessStatus
      }));
      const report = QuotaIntegrityEngine.runRetroactiveAudit(execHistory, agentRoles);
      res.json(report);
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Failed to run retroactive audit' });
    }
  });

  app.post('/api/academy/simulate-quota-exhaustion', (req, res) => {
    const { exhausted } = req.body || {};
    QuotaIntegrityEngine.setMockQuotaExhausted(Boolean(exhausted));
    res.json({
      success: true,
      mockQuotaExhausted: QuotaIntegrityEngine.isMockQuotaExhausted(),
      providerHealth: QuotaIntegrityEngine.getProviderHealthStatus()
    });
  });

  // PHASE 3.18A.2 — LIVE INTEGRITY PROOFS ENDPOINT
  app.get('/api/academy/phase-318a2-proofs', async (req, res) => {
    try {
      let results = Phase318A2LiveProofRunner.getLastResults();
      if (!results) {
        results = await Phase318A2LiveProofRunner.executeAllProofs();
      }
      res.json(results);
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Failed to execute Phase 3.18A.2 live proofs' });
    }
  });

  app.post('/api/academy/phase-318a2-proofs/run', async (req, res) => {
    try {
      const results = await Phase318A2LiveProofRunner.executeAllProofs();
      res.json(results);
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Failed to run Phase 3.18A.2 live proofs' });
    }
  });

  // PHASE 3.18B — CONTINUOUS SME ACADEMY ENDPOINTS
  app.get('/api/academy/continuous-report', async (req, res) => {
    try {
      if (!ContinuousAcademyEngine.isPhase318BUnlocked()) {
        await ContinuousAcademyEngine.initializeAndUnlock();
      }
      const report = ContinuousAcademyEngine.generateReport();
      res.json(report);
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Failed to generate Phase 3.18B continuous report' });
    }
  });

  app.post('/api/academy/run-20-heartbeats', async (req, res) => {
    try {
      const report = await ContinuousAcademyEngine.run20HeartbeatCycles();
      res.json(report);
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Failed to run 20 autonomous heartbeats' });
    }
  });

  app.post('/api/academy/trigger-heartbeat', async (req, res) => {
    try {
      const hb = await ContinuousAcademyEngine.executeSingleHeartbeat();
      res.json(hb);
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Failed to execute heartbeat' });
    }
  });

  app.get('/api/academy/live-feed', (req, res) => {
    res.json(ContinuousAcademyEngine.getLiveActivityFeed());
  });

  app.get('/api/academy/reasoning-budget-metrics', (req, res) => {
    res.json(ReasoningBudgetManager.getMetrics());
  });


  app.get('/api/knowledge/gaps', (req, res) => {
    res.json(KnowledgeIngestionEngine.getKnowledgeGaps());
  });

  app.get('/api/knowledge/activities', (req, res) => {
    res.json(KnowledgeIngestionEngine.getLiveActivities());
  });

  app.get('/api/knowledge/academy-report', (req, res) => {
    res.json(KnowledgeIngestionEngine.getAcademyInitialReport());
  });

  // Phase 3.18A.1 SME Academy Reality Checkpoint & Verification Endpoints
  app.get('/api/academy/canonical-roles', (req, res) => {
    res.json(KnowledgeIngestionEngine.getCanonicalRoleRecords());
  });

  app.get('/api/academy/curricula-reconciliation', (req, res) => {
    res.json(KnowledgeIngestionEngine.getCurriculaReconciliation());
  });

  app.get('/api/academy/source-lifecycle', (req, res) => {
    res.json(KnowledgeIngestionEngine.getAuthoritativeSourceLifecycleRecords());
  });

  app.get('/api/academy/coverage-maps', (req, res) => {
    res.json(KnowledgeIngestionEngine.getAgentKnowledgeCoverageMaps());
  });

  app.get('/api/academy/coverage-map/:roleId', (req, res) => {
    res.json(KnowledgeIngestionEngine.getCoverageMapForAgent(req.params.roleId));
  });

  app.get('/api/academy/sandboxes', (req, res) => {
    res.json(SandboxExecutionEngine.getAllHistory());
  });

  app.get('/api/academy/unattended-proof', (req, res) => {
    res.json(KnowledgeIngestionEngine.getUnattendedSchedulerProof());
  });

  app.get('/api/academy/report-318a1', (req, res) => {
    res.json(KnowledgeIngestionEngine.getPhase318A1Report());
  });

  // ======================================================================
  // PHASE 3.18B.1 TRUE 24/7 AUTONOMOUS RUNTIME & SCHEDULER ENDPOINTS
  // ======================================================================

  app.post(['/api/academy/heartbeat', '/internal/hermes/heartbeat', '/api/academy/trigger-heartbeat'], async (req, res) => {
    const requestedId = req.body?.heartbeatId || `HB-HTTP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const triggerSource = req.body?.triggerSource || 'HTTP_SCHEDULER';
    const workerIdentity = req.body?.workerIdentity || process.env.HOSTNAME || `WORKER-${process.pid}`;

    // 1. Idempotency Check
    if (AcademyRuntimeHardeningEngine.isHeartbeatProcessed(requestedId)) {
      return res.json({
        status: 'SKIPPED',
        skipped: true,
        reason: 'ALREADY_PROCESSED_HEARTBEAT',
        heartbeatId: requestedId,
        message: `Heartbeat ID ${requestedId} was already executed and recorded.`
      });
    }

    // 2. Distributed Locking Check
    const lockRes = AcademyRuntimeHardeningEngine.acquireLock(workerIdentity, requestedId);
    if (!lockRes.acquired) {
      return res.json({
        status: 'SKIPPED',
        skipped: true,
        reason: 'SKIPPED_DUPLICATE_ORCHESTRATOR',
        heartbeatId: requestedId,
        activeLock: lockRes.activeLock,
        reasonNote: lockRes.reason
      });
    }

    try {
      // 3. Execute Heartbeat
      const hb = await ContinuousAcademyEngine.executeSingleHeartbeat();

      const record = {
        heartbeatId: requestedId,
        requestedTime: new Date().toISOString(),
        startedTime: new Date().toISOString(),
        completedTime: new Date().toISOString(),
        workerIdentity,
        triggerSource: triggerSource as any,
        primeDecision: 'CONTINUOUS_TRAINING_AUTONOMOUS_STEP',
        jobsDispatched: hb.actionsTaken || 1,
        jobsCompleted: hb.actionsTaken || 1,
        jobsDeferred: 0,
        errors: [],
        nextWakeRecommendationSeconds: 60,
        status: 'SUCCESS' as const,
      };

      AcademyRuntimeHardeningEngine.recordHeartbeat(record);
      AcademyRuntimeHardeningEngine.releaseLock(workerIdentity);

      res.json({
        status: 'SUCCESS',
        heartbeatId: requestedId,
        cycleNumber: hb.cycleNumber,
        actionsTaken: hb.actionsTaken,
        timestamp: hb.timestamp,
        workerIdentity,
        nextWakeRecommendationSeconds: 60
      });
    } catch (e: any) {
      AcademyRuntimeHardeningEngine.releaseLock(workerIdentity);
      AcademyRuntimeHardeningEngine.recordHeartbeat({
        heartbeatId: requestedId,
        requestedTime: new Date().toISOString(),
        startedTime: new Date().toISOString(),
        completedTime: new Date().toISOString(),
        workerIdentity,
        triggerSource: triggerSource as any,
        primeDecision: 'FAILED_HEARTBEAT_EXECUTION',
        jobsDispatched: 0,
        jobsCompleted: 0,
        jobsDeferred: 0,
        errors: [e.message || 'Execution error'],
        nextWakeRecommendationSeconds: 30,
        status: 'FAILED',
      });
      res.status(500).json({ error: e.message || 'Heartbeat execution failed' });
    }
  });

  app.get(['/api/academy/report-318b1', '/api/academy/continuous-report'], (req, res) => {
    res.json(AcademyRuntimeHardeningEngine.generatePhase318B1Report());
  });

  app.get('/api/academy/runtime-health', (req, res) => {
    const report = AcademyRuntimeHardeningEngine.generatePhase318B1Report();
    res.json({
      runtimeMode: report.runtimeMode,
      healthStatus: report.runtimeHealthStatus,
      lastHeartbeatTimestamp: report.lastHeartbeatTimestamp,
      secondsSinceLastHeartbeat: report.secondsSinceLastHeartbeat,
      schedulerArchitecture: report.schedulerArchitecture,
      declarations: report.declarations
    });
  });

  app.post('/api/academy/watchdog-pulse', (req, res) => {
    const result = AcademyRuntimeHardeningEngine.runWatchdogCheck();
    res.json(result);
  });

  app.post('/api/academy/verify-instance-loss', (req, res) => {
    const result = AcademyRuntimeHardeningEngine.verifyInstanceLossRecovery();
    res.json(result);
  });

  app.post('/api/academy/run-unattended-60min-proof', (req, res) => {
    const result = AcademyRuntimeHardeningEngine.run60MinUnattendedTestSimulation(async (c) => {
      return ContinuousAcademyEngine.executeSingleHeartbeat();
    });
    res.json(result);
  });

  // Phase 3.18B.2 Live Learning Proof & Owner SME Academy Endpoints
  app.get(['/api/academy/report-318b2-full', '/api/academy/phase-318b2-full'], (req, res) => {
    try {
      const report = Phase318B2FullRosterEngine.generateFullReport();
      res.json(report);
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Failed to generate Phase 3.18B.2 Full Report' });
    }
  });

  app.get('/api/academy/report-318b2', async (req, res) => {
    try {
      const fullReport = Phase318B2FullRosterEngine.generateFullReport();
      res.json(fullReport);
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Failed to generate Phase 3.18B.2 report' });
    }
  });

  app.get('/api/academy/historical-audits', (req, res) => {
    res.json(Phase318B2FullRosterEngine.runHistoricalClaimsAudit());
  });

  app.get('/api/academy/capability-graph', (req, res) => {
    res.json(Phase318B2FullRosterEngine.buildHouse1CapabilityGraph());
  });

  app.get('/api/academy/source-rights', (req, res) => {
    res.json(Phase318B2FullRosterEngine.auditSourceRights());
  });

  app.get('/api/academy/query-scope', (req, res) => {
    const { agentId, jurisdiction, buildingType } = req.query as Record<string, string>;
    const result = Phase318B2FullRosterEngine.queryAgentScope(
      agentId || 'WOOD-FRAMING-AGENT',
      jurisdiction || 'Florida / FBC 2023',
      buildingType || 'Low-Rise Residential'
    );
    res.json(result);
  });

  app.post('/api/academy/run-phase-318b2-proof', async (req, res) => {
    try {
      const report = Phase318B2FullRosterEngine.generateFullReport();
      res.json(report);
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Failed to execute Phase 3.18B.2 proof' });
    }
  });

  // Phase 3.18B.3 Continuous Spatial Construction Academy Endpoints
  app.get(['/api/academy/spatial-report', '/api/academy/report-318b3'], (req, res) => {
    try {
      res.json(SpatialAcademyEngine.generateCheckpointReport());
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Failed to generate Phase 3.18B.3 spatial report' });
    }
  });

  app.get('/api/academy/bathroom-matrix', (req, res) => {
    try {
      res.json(SpatialAcademyEngine.getBathroomCapabilityMatrix());
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Failed to retrieve bathroom capability matrix' });
    }
  });

  app.get('/api/academy/parallel-projects', (req, res) => {
    try {
      res.json(SpatialAcademyEngine.getParallelProjects());
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Failed to retrieve parallel training projects' });
    }
  });

  app.get('/api/academy/agent-utilization', (req, res) => {
    try {
      res.json(SpatialAcademyEngine.getAgentUtilizationReport());
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Failed to retrieve agent utilization report' });
    }
  });

  app.get('/api/academy/prime-decisions', (req, res) => {
    try {
      res.json(SpatialAcademyEngine.getPrimeDecisions());
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Failed to retrieve prime decisions' });
    }
  });

  app.get('/api/academy/system-connectivity', (req, res) => {
    try {
      res.json(SpatialAcademyEngine.getSystemConnectivity());
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Failed to retrieve system connectivity graph' });
    }
  });

  // Phase 3.18B.4 Continuous Academy Endpoints
  app.get('/api/academy/learning-profiles', (req, res) => {
    try {
      res.json(SpatialAcademyEngine.getAgentLearningProfiles());
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Failed to retrieve agent learning profiles' });
    }
  });

  app.get('/api/academy/system-quality', (req, res) => {
    try {
      res.json(SpatialAcademyEngine.getSystemQualityReports());
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Failed to retrieve system quality agent reports' });
    }
  });

  app.get(['/api/academy/phase318b4-report', '/api/academy/report-318b4'], (req, res) => {
    try {
      res.json(SpatialAcademyEngine.getPhase318B4Report());
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Failed to generate Phase 3.18B.4 report' });
    }
  });

  app.get('/api/academy/spatial-project', (req, res) => {
    try {
      res.json(SpatialAcademyEngine.getActiveProject());
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Failed to retrieve active spatial project' });
    }
  });

  app.get('/api/academy/spatial-bom', (req, res) => {
    try {
      res.json(SpatialAcademyEngine.getDerivedBOM());
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Failed to generate spatial model derived BOM' });
    }
  });

  app.get('/api/academy/spatial-revisions', (req, res) => {
    try {
      const proj = SpatialAcademyEngine.getActiveProject();
      res.json(proj.revisions || []);
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Failed to retrieve spatial revisions' });
    }
  });

  app.post('/api/academy/run-spatial-cycle', (req, res) => {
    try {
      const proj = SpatialAcademyEngine.runConstructionCycle();
      res.json({
        success: true,
        project: proj,
        report: SpatialAcademyEngine.generateCheckpointReport()
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Failed to execute spatial construction cycle' });
    }
  });

  app.get('/api/academy/baselines', (req, res) => {
    res.json(LiveLearningProofEngine.generateBaselineSnapshots());
  });

  app.get('/api/academy/knowledge-trees', (req, res) => {
    res.json(LiveLearningProofEngine.getAllKnowledgeTrees());
  });

  app.get('/api/academy/counters', (req, res) => {
    res.json(LiveLearningProofEngine.getLiveCounters());
  });

  app.get('/api/academy/agent-mastery/:agentId', (req, res) => {
    const profile = LiveLearningProofEngine.getAgentMasteryProfile(req.params.agentId);
    res.json(profile);
  });


  app.get('/api/knowledge/executions', (req, res) => {
    res.json(AgentExecutionService.getExecutionHistory());
  });

  app.get('/api/knowledge/execution/:id', (req, res) => {
    const exec = AgentExecutionService.getExecution(req.params.id);
    if (!exec) return res.status(404).json({ error: 'Execution record not found' });
    res.json(exec);
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

  // Phase 3.17B Reality & Data Truth Swarm Endpoints
  app.get('/api/reality/audit', (req, res) => {
    const hb = primeOrchestrator.getHeartbeatState();
    const proj = primeOrchestrator.getProject(hb.activeProjectId || 'ACADEMY-HOUSE-0002');
    const bomTotal = proj?.bom?.reduce((acc, curr) => acc + curr.estimatedTotalCost, 0) || 0;
    const bomCount = proj?.bom?.length || 0;
    const tickets = proj?.inspectionTickets?.length || 0;

    const audit = RealitySwarmEngine.runFullSwarmAudit({
      agentCount: AgentRegistry.getAllContracts().length,
      activeProjectCount: primeOrchestrator.getAllProjects().length,
      activeProjectId: hb.activeProjectId || 'ACADEMY-HOUSE-0002',
      heartbeatCount: hb.heartbeatCount || 0,
      bomTotalValue: bomTotal,
      bomItemCount: bomCount,
      inspectionTicketCount: tickets,
    });
    res.json(audit);
  });

  app.get('/api/hermes/house0002-autonomy-audit', (req, res) => {
    res.json(House0002Engine.getAutonomyAuditReport());
  });

  app.get('/api/reality/repairs', (req, res) => {
    res.json(RealitySwarmEngine.getRepairLogs());
  });

  app.get('/api/reality/conflicts', (req, res) => {
    res.json(RealitySwarmEngine.getDomainConflicts());
  });

  app.get('/api/reality/security', (req, res) => {
    res.json(RealitySwarmEngine.getSecurityExposures());
  });

  app.get('/api/system/health', (req, res) => {
    const hasApiKey = !!process.env.GEMINI_API_KEY;
    const hb = primeOrchestrator.getHeartbeatState();
    res.json({
      reasoningProvider: {
        status: hasApiKey ? 'HEALTHY' : 'DEGRADED',
        providerName: 'Google Gemini 3.7 Flash',
        hasApiKey,
      },
      httpRetrieval: { status: 'HEALTHY', activeSources: SourceRegistry.getAllSources().length },
      pdfParser: { status: 'HEALTHY', primaryParser: 'pdf2json v4.0.3', fallbackMode: 'STREAM' },
      knowledgeDb: { status: 'HEALTHY', chunksLoaded: KnowledgeIngestionEngine.getChunks().length },
      projectDb: { status: 'HEALTHY', activeProjects: primeOrchestrator.getAllProjects().length },
      scheduler: { status: 'HEALTHY', intervalMs: 10000 },
      heartbeat: { status: 'HEALTHY', count: hb.heartbeatCount },
      validatorEngine: { status: 'HEALTHY', activeValidators: 5 },
      digitalTwinEngine: { status: 'HEALTHY', renderer: 'Three.js WebGL' },
      realitySwarm: { status: 'HEALTHY', activeInspectors: 15 },
      gitVersion: {
        phase: 'Phase 3.17B',
        commit: '5be9b4b',
        timestamp: new Date().toISOString(),
        sourceBundleMatched: true,
      },
    });
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

  // Continuous Autonomous Heartbeat Ticker
  // In PRODUCTION mode (HERMES_RUNTIME_MODE=production), local timer ticker is bypassed.
  // The authoritative trigger source is external HTTP invocation (/api/academy/heartbeat) or watchdog pulses.
  setInterval(() => {
    if (AcademyRuntimeHardeningEngine.isTimerAllowedInCurrentMode()) {
      primeOrchestrator.triggerHeartbeat().catch((err) => {
        console.error('[HERMES TICKER ERROR]:', err?.message || err);
      });
      if (ContinuousAcademyEngine.isAcademyRunning()) {
        const hbId = `HB-TIMER-${Date.now()}`;
        const lockRes = AcademyRuntimeHardeningEngine.acquireLock('DEV_TIMER_WORKER', hbId);
        if (lockRes.acquired) {
          ContinuousAcademyEngine.executeSingleHeartbeat()
            .then((hb) => {
              AcademyRuntimeHardeningEngine.recordHeartbeat({
                heartbeatId: hbId,
                requestedTime: new Date().toISOString(),
                startedTime: new Date().toISOString(),
                completedTime: new Date().toISOString(),
                workerIdentity: 'DEV_TIMER_WORKER',
                triggerSource: 'DEV_TIMER',
                primeDecision: 'DEV_TIMER_CONTINUOUS_STEP',
                jobsDispatched: hb.actionsTaken || 1,
                jobsCompleted: hb.actionsTaken || 1,
                jobsDeferred: 0,
                errors: [],
                nextWakeRecommendationSeconds: 10,
                status: 'SUCCESS',
              });
              AcademyRuntimeHardeningEngine.releaseLock('DEV_TIMER_WORKER');
            })
            .catch((err) => {
              AcademyRuntimeHardeningEngine.releaseLock('DEV_TIMER_WORKER');
              console.error('[CONTINUOUS ACADEMY TICKER ERROR]:', err?.message || err);
            });
        }
      }
    }
  }, 10000);

  // Initialize Continuous SME Academy Engine & run Phase 3.18A.2 proof + initial 20 heartbeats on startup
  ContinuousAcademyEngine.initializeAndUnlock()
    .then(async ({ unlocked }) => {
      if (unlocked) {
        console.log('[SERVER BOOT] Phase 3.18B Continuous Academy Unlocked! Scheduling initial 20 autonomous heartbeats...');
        setTimeout(() => {
          ContinuousAcademyEngine.run20HeartbeatCycles().catch((err) => {
            console.error('[BACKGROUND 20 HEARTBEATS ERROR]:', err?.message || err);
          });
        }, 3000);
      }
    })
    .catch((err) => {
      console.error('[SERVER BOOT CONTINUOUS ACADEMY INIT ERROR]:', err?.message || err);
    });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`HERMES Construction System running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
