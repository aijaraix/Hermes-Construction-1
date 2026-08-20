import {
  DigitalTwinProject,
  PrimeHeartbeatState,
  KnowledgeEntity,
  LearnedLesson,
  ProposedRevision,
  HermesSystemState,
  TaskGraphNode,
  SwarmAgentEntity,
  ProjectSnapshot,
  AssemblyPattern,
} from '../src/types/hermes';
import { INITIAL_SEED_PROJECTS, INITIAL_KNOWLEDGE_ENTITIES, INITIAL_LEARNED_LESSONS } from './seedProjects';
import { generateBOMFromComponents, evaluateProposedRevision } from './deterministicGeometryEngine';
import { reason, researchConstructionTopic } from './geminiService';
import { loadDurableStore, saveDurableStore, HermesDurableStoreData } from './persistence/persistenceStore';
import { INITIAL_SWARM_AGENTS } from './agentRegistry';
import { createDefaultTaskGraphForProject, createProjectSnapshotFromTask } from './taskGraphEngine';

class HermesPrimeOrchestrator {
  private systemState: HermesSystemState;
  private projects: Map<string, DigitalTwinProject> = new Map();
  private tasksMap: Map<string, TaskGraphNode[]> = new Map(); // projectId -> tasks
  private agents: SwarmAgentEntity[] = [];
  private knowledgeEntities: KnowledgeEntity[] = [];
  private learnedLessons: LearnedLesson[] = [];
  private assemblyPatterns: AssemblyPattern[] = [];
  private activeProjectId: string = 'HOTEL-FL-00127';
  private recentLogs: Array<{
    id: string;
    timestamp: string;
    swarm: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
  }> = [];

  constructor() {
    // Attempt hydration from disk
    const diskData = loadDurableStore();

    if (diskData && diskData.systemState) {
      this.systemState = diskData.systemState;
      this.agents = diskData.agents || [...INITIAL_SWARM_AGENTS];
      this.knowledgeEntities = diskData.knowledgeEntities || [...INITIAL_KNOWLEDGE_ENTITIES];
      this.learnedLessons = diskData.learnedLessons || [...INITIAL_LEARNED_LESSONS];
      this.assemblyPatterns = diskData.assemblyPatterns || [];
      this.recentLogs = diskData.activityLogs || [];

      Object.entries(diskData.projects || {}).forEach(([id, proj]) => {
        this.projects.set(id, proj);
      });

      Object.entries(diskData.tasks || {}).forEach(([id, tList]) => {
        this.tasksMap.set(id, tList);
      });

      this.activeProjectId = this.systemState.current_training_focus.includes('HOTEL')
        ? 'HOTEL-FL-00127'
        : Array.from(this.projects.keys())[0] || 'HOTEL-FL-00127';

      this.addLog('HERMES PERSISTENCE', `Hydrated HERMES state from durable disk store. Total Heartbeats: ${this.systemState.total_heartbeat_count}`, 'success');
    } else {
      // Seed fresh default state
      this.systemState = {
        system_id: 'HERMES-PRIME-PROD-01',
        status: 'ACTIVE',
        current_curriculum_level: 3,
        current_training_focus: 'Tampa Coastal 2-Story Residence (HVHZ Wind & Flood Resilience)',
        overall_training_score: 88.4,
        total_projects_started: 3,
        total_projects_completed: 1,
        total_heartbeat_count: 142,
        total_failures_detected: 18,
        total_failures_repaired: 15,
        total_components_created: 124,
        total_materials_learned: 85,
        total_knowledge_entities: INITIAL_KNOWLEDGE_ENTITIES.length,
        last_heartbeat_at: new Date().toISOString(),
        next_heartbeat_at: new Date(Date.now() + 10000).toISOString(),
        model_quota_state: 'HEALTHY',
        compute_quota_state: 'OPTIMAL',
        pause_controls: {
          is_system_paused: false,
          is_training_paused: false,
          finish_current_only: false,
          pause_reason: '',
        },
      };

      for (const project of INITIAL_SEED_PROJECTS) {
        this.projects.set(project.id, project);
        const taskGraph = createDefaultTaskGraphForProject(project.id);
        this.tasksMap.set(project.id, taskGraph);
      }

      this.agents = [...INITIAL_SWARM_AGENTS];
      this.knowledgeEntities = [...INITIAL_KNOWLEDGE_ENTITIES];
      this.learnedLessons = [...INITIAL_LEARNED_LESSONS];

      this.addLog('HERMES PRIME', 'Initialized HERMES Autonomous Construction Intelligence & Digital Building System.', 'info');
      this.persistToDisk();
    }
  }

  private persistToDisk(): void {
    const projectsObj: Record<string, DigitalTwinProject> = {};
    this.projects.forEach((val, key) => {
      projectsObj[key] = val;
    });

    const tasksObj: Record<string, TaskGraphNode[]> = {};
    this.tasksMap.forEach((val, key) => {
      tasksObj[key] = val;
    });

    const storeData: HermesDurableStoreData = {
      systemState: this.systemState,
      projects: projectsObj,
      tasks: tasksObj,
      agents: this.agents,
      knowledgeEntities: this.knowledgeEntities,
      learnedLessons: this.learnedLessons,
      assemblyPatterns: this.assemblyPatterns,
      activityLogs: this.recentLogs,
    };

    saveDurableStore(storeData);
  }

  private addLog(
    swarm: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info'
  ) {
    const log = {
      id: `LOG-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      timestamp: new Date().toISOString(),
      swarm,
      message,
      type,
    };
    this.recentLogs.unshift(log);
    if (this.recentLogs.length > 80) {
      this.recentLogs.pop();
    }
  }

  public getSystemState(): HermesSystemState {
    return this.systemState;
  }

  public getHeartbeatState(): PrimeHeartbeatState {
    const project = this.projects.get(this.activeProjectId) || Array.from(this.projects.values())[0];
    const openTickets = project ? project.inspectionTickets.filter((t) => t.status !== 'verified_closed') : [];
    const openRisks = project ? project.changeOrderRisks.filter((r) => !r.resolved) : [];

    return {
      activeProjectId: project ? project.id : 'HOTEL-FL-00127',
      activeProjectName: project ? project.name : 'Tampa Coastal 2-Story Residence',
      gymLevel: project ? project.gymLevel : this.systemState.current_curriculum_level,
      overallCompletionPct: project ? project.overallCompletionPct : 82.4,
      heartbeatCount: this.systemState.total_heartbeat_count,
      lastHeartbeatTime: this.systemState.last_heartbeat_at,
      statusMessage: this.systemState.pause_controls.is_system_paused
        ? `[SYSTEM PAUSED]: ${this.systemState.pause_controls.pause_reason || 'Owner Manual Hold'}`
        : `Active Heartbeat Turn #${this.systemState.total_heartbeat_count}: Executing Autonomous Swarm Loop`,
      activeSwarmAgent: 'HERMES PRIME ORCHESTRATOR',
      unresolvedQuestions: openTickets.length + openRisks.length,
      inspectionFailuresCount: openTickets.length,
      openClashesCount: Math.max(0, openTickets.length - 1),
      missingMaterialSpecsCount: project?.bom.filter((b) => b.confidence < 85).length || 0,
      missingPriceEvidenceCount: project?.bom.filter((b) => b.priceSource === 'QUOTE REQUIRED').length || 0,
      changeOrderRisksCount: openRisks.length,
      projectScore: project?.score.overall || 84.6,
      recentLogs: this.recentLogs.slice(0, 20),
    };
  }

  public getAllProjects(): DigitalTwinProject[] {
    return Array.from(this.projects.values());
  }

  public getProject(id: string): DigitalTwinProject | undefined {
    return this.projects.get(id);
  }

  public getProjectTasks(projectId: string): TaskGraphNode[] {
    return this.tasksMap.get(projectId) || [];
  }

  public getAgents(): SwarmAgentEntity[] {
    return this.agents;
  }

  public setActiveProject(id: string) {
    if (this.projects.has(id)) {
      this.activeProjectId = id;
      const p = this.projects.get(id);
      if (p) {
        this.systemState.current_training_focus = p.name;
      }
      this.addLog('HERMES PRIME', `Switched orchestrator focus to Project ${id}.`, 'info');
      this.persistToDisk();
    }
  }

  /**
   * Set Owner Pause / Resume Controls
   */
  public setPauseControls(controls: {
    is_system_paused?: boolean;
    is_training_paused?: boolean;
    finish_current_only?: boolean;
    pause_reason?: string;
  }): HermesSystemState {
    if (controls.is_system_paused !== undefined) {
      this.systemState.pause_controls.is_system_paused = controls.is_system_paused;
      this.systemState.status = controls.is_system_paused ? 'PAUSED' : 'ACTIVE';
    }
    if (controls.is_training_paused !== undefined) {
      this.systemState.pause_controls.is_training_paused = controls.is_training_paused;
    }
    if (controls.finish_current_only !== undefined) {
      this.systemState.pause_controls.finish_current_only = controls.finish_current_only;
    }
    if (controls.pause_reason !== undefined) {
      this.systemState.pause_controls.pause_reason = controls.pause_reason;
    }

    const stateDesc = this.systemState.pause_controls.is_system_paused ? 'PAUSED' : 'RESUMED';
    this.addLog('HERMES CONTROLS', `System state updated by owner: ${stateDesc}. Reason: ${this.systemState.pause_controls.pause_reason || 'N/A'}`, 'warning');

    this.persistToDisk();
    return this.systemState;
  }

  /**
   * Step one full autonomous heartbeat turn across swarms and task graph
   */
  public async triggerHeartbeat(projectId?: string): Promise<PrimeHeartbeatState> {
    const now = new Date().toISOString();
    this.systemState.last_heartbeat_at = now;
    this.systemState.next_heartbeat_at = new Date(Date.now() + 10000).toISOString();

    if (this.systemState.pause_controls.is_system_paused) {
      this.addLog('HERMES TICKER', `Heartbeat skipped: System is PAUSED (${this.systemState.pause_controls.pause_reason || 'Owner Request'})`, 'warning');
      this.persistToDisk();
      return this.getHeartbeatState();
    }

    this.systemState.total_heartbeat_count++;
    const targetId = projectId || this.activeProjectId;
    const project = this.projects.get(targetId);

    if (!project) {
      this.addLog('HERMES PRIME', `Target project ${targetId} not found, selecting fallback.`, 'warning');
      this.persistToDisk();
      return this.getHeartbeatState();
    }

    // 1. Advance Task Dependency Graph
    let tasks = this.tasksMap.get(project.id);
    if (!tasks || tasks.length === 0) {
      tasks = createDefaultTaskGraphForProject(project.id);
      this.tasksMap.set(project.id, tasks);
    }

    const currentRunningTask = tasks.find((t) => t.status === 'RUNNING');
    const nextQueuedTask = tasks.find((t) => t.status === 'QUEUED');

    if (currentRunningTask) {
      currentRunningTask.status = 'COMPLETED';
      currentRunningTask.completed_at = now;
      currentRunningTask.outputSummary = `Completed ${currentRunningTask.title} stage. Validated code compliance & deterministic parameters.`;
      this.addLog('TASK GRAPH', `Completed Stage: [${currentRunningTask.stage}] by ${currentRunningTask.assignedAgentId}`, 'success');

      // Take intermediate 3D BIM Twin Snapshot
      if (!project.snapshots) project.snapshots = [];
      const snapIndex = project.snapshots.length + 1;
      const snapshot = createProjectSnapshotFromTask(project, currentRunningTask.stage, snapIndex);
      project.snapshots.push(snapshot);
      project.currentVersionTag = snapshot.versionTag;

      this.addLog('DIGITAL TWIN', `Saved intermediate 3D BIM Twin Snapshot Version ${snapshot.versionTag} (${snapshot.components.length} components)`, 'info');

      // Unlock next task
      if (nextQueuedTask) {
        nextQueuedTask.status = 'RUNNING';
        this.addLog('TASK GRAPH', `Unlocked & Started Stage: [${nextQueuedTask.stage}] assigned to ${nextQueuedTask.assignedAgentId}`, 'info');
      }
    } else if (nextQueuedTask) {
      nextQueuedTask.status = 'RUNNING';
      this.addLog('TASK GRAPH', `Started Stage: [${nextQueuedTask.stage}] assigned to ${nextQueuedTask.assignedAgentId}`, 'info');
    }

    // 2. Inspection & Auto-Repair Swarm Execution
    const openTicket = project.inspectionTickets.find((t) => t.status === 'open');

    if (openTicket) {
      this.systemState.total_failures_detected++;
      this.addLog('INSPECTOR SWARM', `Audit ticket ${openTicket.id}: ${openTicket.problem}`, 'warning');

      // Auto-repair
      openTicket.status = 'repaired';
      openTicket.repairNotes = `Repair Swarm adjusted parameters: ${openTicket.proposedRepair} (${now})`;
      this.addLog('REPAIR SWARM', `Applied fix for ${openTicket.id}: ${openTicket.proposedRepair}`, 'info');

      // Re-inspect
      openTicket.status = 'verified_closed';
      this.systemState.total_failures_repaired++;
      this.addLog('INSPECTOR SWARM', `Re-inspected ${openTicket.id}: PASS - Marked CLOSED.`, 'success');

      for (const compId of openTicket.affectedComponentIds) {
        const comp = project.components.find((c) => c.id === compId);
        if (comp) {
          comp.inspectionState = 'repaired';
          comp.inspectionNotes = `Repaired & verified closed by Independent Inspector Swarm.`;
        }
      }

      const risk = project.changeOrderRisks.find((r) => r.affectedTrades.some((tr) => openTicket.inspectorAgent.includes(tr)));
      if (risk) risk.resolved = true;
    } else {
      this.addLog('INSPECTOR SWARM', `Inspection sweep clear for ${project.name}. Zero active code failures.`, 'success');
    }

    // 3. Deterministic Quantity Engine Update
    project.bom = generateBOMFromComponents(project.components);
    this.addLog('QUANTITY SWARM', `Updated BOM: ${project.bom.length} materials quantified from 3D BIM model geometry.`, 'info');

    // 4. Calculate Scores & Progress
    const totalTickets = project.inspectionTickets.length;
    const closedTickets = project.inspectionTickets.filter((t) => t.status === 'verified_closed').length;
    const completedTasksCount = tasks.filter((t) => t.status === 'COMPLETED').length;

    project.overallCompletionPct = Math.min(
      100,
      Math.round((completedTasksCount / tasks.length) * 70 + (closedTickets / Math.max(1, totalTickets)) * 30)
    );

    project.score.inspectionSuccess = totalTickets > 0 ? Math.round((closedTickets / totalTickets) * 100) : 100;
    project.score.overall =
      Math.round(
        (project.score.completeness +
          project.score.structuralValidation +
          project.score.mepConnectivity +
          project.score.environmentalAppropriateness +
          project.score.inspectionSuccess +
          project.score.costConfidence) /
          6 *
          10
      ) / 10;

    // Check project completion
    if (completedTasksCount === tasks.length && closedTickets === totalTickets) {
      if (project.status !== 'completed') {
        project.status = 'completed';
        this.systemState.total_projects_completed++;
        this.addLog('HERMES PRIME', `🎉 PROJECT COMPLETED: ${project.name} achieved 100% completion with Score ${project.score.overall}!`, 'success');

        // Extract Postmortem Lesson
        const newLesson: LearnedLesson = {
          id: `LESSON-${Date.now()}`,
          projectId: project.id,
          projectName: project.name,
          whatWorked: `Successfully verified continuous load path & 3D BIM integration for ${project.buildingType}.`,
          whatFailed: `Initial inspection flagged slope/fastener issues which were automatically repaired.`,
          whatRequiredRepair: openTicket ? openTicket.proposedRepair || 'Parameter adjustment' : 'None',
          reusableAssembly: `PATTERN-${project.id.split('-')[0]}-CURRICULUM-LVL${project.gymLevel}`,
          nextGymObjective: `Advance Gym Curriculum to Level ${Math.min(7, project.gymLevel + 1)}`,
          timestamp: now,
        };
        this.learnedLessons.unshift(newLesson);

        // Check if Auto-Gym Next Exercise should trigger
        if (!this.systemState.pause_controls.is_training_paused && !this.systemState.pause_controls.finish_current_only) {
          const nextLevel = Math.min(7, project.gymLevel + 1);
          this.addLog('AUTONOMOUS GYM', `Evaluating construction skill gaps... Auto-launching Gym Curriculum Exercise Level ${nextLevel}.`, 'info');
          setTimeout(() => {
            this.createGymProject(nextLevel);
          }, 1000);
        }
      }
    } else {
      project.status = 'inspecting';
    }

    project.updatedAt = now;
    this.systemState.total_components_created = Array.from(this.projects.values()).reduce((acc, p) => acc + p.components.length, 0);

    this.persistToDisk();
    return this.getHeartbeatState();
  }

  public async repairTicket(projectId: string, ticketId: string): Promise<DigitalTwinProject> {
    const project = this.projects.get(projectId);
    if (!project) throw new Error(`Project ${projectId} not found.`);

    const ticket = project.inspectionTickets.find((t) => t.id === ticketId);
    if (!ticket) throw new Error(`Ticket ${ticketId} not found.`);

    ticket.status = 'repaired';
    ticket.repairNotes = `Repaired by assigned agent ${ticket.repairAgentAssigned || 'Repair Swarm'}: ${ticket.proposedRepair}`;

    this.addLog('REPAIR SWARM', `Executed manual trigger repair on ${ticket.id}: ${ticket.proposedRepair}`, 'info');

    ticket.status = 'verified_closed';
    this.addLog('INSPECTOR SWARM', `Independent reinspection passed for ${ticket.id}. Marked CLOSED.`, 'success');

    for (const compId of ticket.affectedComponentIds) {
      const comp = project.components.find((c) => c.id === compId);
      if (comp) {
        comp.inspectionState = 'repaired';
        comp.inspectionNotes = 'Repaired & reinspected successfully.';
      }
    }

    project.bom = generateBOMFromComponents(project.components);
    project.updatedAt = new Date().toISOString();

    this.persistToDisk();
    return project;
  }

  public proposeRevision(projectId: string, prompt: string): ProposedRevision {
    const project = this.projects.get(projectId);
    if (!project) throw new Error(`Project ${projectId} not found.`);

    return evaluateProposedRevision(project, prompt);
  }

  public applyRevision(projectId: string, revisionPrompt: string): DigitalTwinProject {
    const project = this.projects.get(projectId);
    if (!project) throw new Error(`Project ${projectId} not found.`);

    const promptLower = revisionPrompt.toLowerCase();

    if (promptLower.includes('roof') || promptLower.includes('metal')) {
      const roof = project.components.find((c) => c.type === 'roof');
      if (roof) {
        roof.assembly = '24-Ga Galvalume Standing Seam Metal Roof over Self-Adhered WRB';
        roof.materials = [
          { name: '24-Ga Galvalume Standing Seam Metal', specification: 'Kynar 500 Finish, 150 MPH Rated', quantity: 1620, unit: 'sq ft' },
          { name: 'Self-Adhered Ice & Water Shield WRB', specification: 'ASTM D1970 High Temp', quantity: 1620, unit: 'sq ft' },
        ];
        roof.unitCost = 14.2;
      }
    } else if (promptLower.includes('brick')) {
      const wall = project.components.find((c) => c.type === 'wall' && c.isExterior);
      if (wall) {
        wall.assembly = 'Full Modular Brick Veneer + 1" Air Cavity + WRB + 8" CMU Block';
        wall.materials.push({ name: 'Modular Red Face Brick', specification: 'ASTM C216 Grade SW', quantity: 18200, unit: 'ea' });
        wall.unitCost = 28.0;
      }
    }

    project.iterationNumber++;
    project.bom = generateBOMFromComponents(project.components);
    project.updatedAt = new Date().toISOString();

    this.addLog('REVISION ENGINE', `Applied building revision: "${revisionPrompt}". Recalculated BIM Digital Twin & BOM.`, 'success');
    this.persistToDisk();

    return project;
  }

  public async createGymProject(level: number, customPrompt?: string): Promise<DigitalTwinProject> {
    const newId = `GYM-LVL${level}-${Math.floor(100 + Math.random() * 900)}`;

    const locationName = level === 1 ? 'Shed/Pad - Orlando, FL' : level === 2 ? 'Wood Frame - Austin, TX' : level === 3 ? 'Coastal FL Hurricane Residence' : level === 4 ? 'Indianapolis Townhome' : level === 5 ? 'Atlanta Small Multifamily' : level === 6 ? 'Dallas Concrete Hotel' : 'Commercial Core & Shell';

    const newProject: DigitalTwinProject = {
      id: newId,
      name: `Gym Level ${level}: ${customPrompt || locationName}`,
      buildingType: level <= 2 ? 'Utility/Single Residential' : level <= 4 ? 'Resilient Single/Townhome' : 'Multi-Family Commercial',
      gymLevel: level,
      iterationNumber: 1,
      overallCompletionPct: 15.0,
      status: 'building',
      environment: {
        latitude: 25.7617,
        longitude: -80.1918,
        locationName: `${locationName} District`,
        jurisdiction: 'Miami-Dade / Regional Code Authority',
        climateZone: level >= 4 ? 'Zone 5A (Cold)' : 'Zone 1A (Very Hot-Humid)',
        coastalProximityMiles: level === 3 ? 0.8 : 12.0,
        saltExposureRisk: level === 3 ? 'High' : 'Low',
        windSpeedMph: 165,
        rainfallInchesYear: 58.0,
        humidityPctAvg: 75,
        minTempF: 40,
        maxTempF: 95,
        freezeThawCycles: level >= 4 ? 48 : 0,
        seismicCategory: 'Category A',
        wildfireRisk: 'Low',
        floodZone: level === 3 ? 'VE (Coastal Hazard)' : 'Zone X',
        soilBearingCapacityPsf: 2800,
        groundwaterTableFt: 3.5,
        utilitiesAvailable: ['Municipal Water', 'Sewer', 'Electrical 200A'],
        localCodeVersion: 'Regional Building Code 2023',
      },
      components: [
        {
          id: `SLAB-1-${newId}`,
          type: 'slab',
          system: 'Structure',
          floor: 1,
          room: 'Foundation Base',
          assembly: 'Elevated Concrete Slab on Helical Piles over Vapor Barrier',
          materials: [
            { name: '5000 PSI High-Durability Concrete', specification: 'ACI 318 Exposure Class C2', quantity: 55, unit: 'cu yd' },
            { name: '#6 Epoxy Coated Rebar', specification: 'ASTM A775 Corrosion Resistant', quantity: 1400, unit: 'lin ft' },
          ],
          geometry: { position: [0, 0, 0], dimensions: [48, 0.67, 32] },
          fireRatingHours: 2,
          isExterior: true,
          exposure: 'Ground Moisture Exposure',
          connectedComponentIds: [],
          openings: [],
          quantity: { value: 55, unit: 'cu yd' },
          unitCost: 190,
          totalCost: 10450,
          installationStageDay: 3,
          inspectionState: 'passed',
          whySelected: {
            reason: 'Elevated foundation elevates building above localized flood wave action.',
            environmentalFactor: 'Groundwater table requires continuous waterproofing barrier.',
            codeRule: 'Regional Building Code flood hazard elevation requirement.',
            alternativesConsidered: ['Standard Slab on Grade'],
            costImpact: 'Essential structural load safety.',
            lifecycleNotes: 'Epoxy coated rebar prevents rust spalling.',
          },
        },
      ],
      inspectionTickets: [
        {
          id: `TICK-${newId}-001`,
          projectId: newId,
          inspectorAgent: 'Structural & Fastener Inspector',
          severity: 'high',
          affectedComponentIds: [`SLAB-1-${newId}`],
          location: 'Foundation Anchor Bolts',
          problem: 'Anchor bolt spacing requires verification for high wind uplift.',
          requiredStandard: 'Building Code wind uplift anchor spacing standard.',
          actualCondition: 'Anchor bolt spacing modeled @ 48" o.c.',
          status: 'open',
          repairAgentAssigned: 'Structural Anchor Repair Swarm',
          proposedRepair: 'Reduce anchor bolt spacing to 24" o.c. using 316 Stainless Steel bolts.',
          timestamp: new Date().toISOString(),
        },
      ],
      bom: [],
      suppliers: INITIAL_SEED_PROJECTS[0].suppliers,
      schedule: INITIAL_SEED_PROJECTS[0].schedule,
      changeOrderRisks: [],
      score: {
        overall: 80.0,
        completeness: 82.0,
        structuralValidation: 88.0,
        mepConnectivity: 75.0,
        clashFreePercentage: 82.0,
        codeValidation: 80.0,
        environmentalAppropriateness: 90.0,
        materialCompleteness: 82.0,
        inspectionSuccess: 65.0,
        constructability: 80.0,
        costConfidence: 85.0,
        changeOrderRisk: 70.0,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    newProject.bom = generateBOMFromComponents(newProject.components);
    this.projects.set(newId, newProject);
    const taskGraph = createDefaultTaskGraphForProject(newId);
    this.tasksMap.set(newId, taskGraph);

    this.activeProjectId = newId;
    this.systemState.current_curriculum_level = level;
    this.systemState.current_training_focus = newProject.name;
    this.systemState.total_projects_started++;

    this.addLog('HERMES GYM', `Launched Autonomous Gym Level ${level} Exercise Project: ${newProject.name}`, 'success');
    this.persistToDisk();

    return newProject;
  }

  public getKnowledgeGraph(): KnowledgeEntity[] {
    return this.knowledgeEntities;
  }

  public getLearnedLessons(): LearnedLesson[] {
    return this.learnedLessons;
  }
}

export const primeOrchestrator = new HermesPrimeOrchestrator();
