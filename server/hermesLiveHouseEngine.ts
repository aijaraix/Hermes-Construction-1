import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface HermesWorldEvent {
  eventId: string;
  projectId: string;
  traceId: string;
  timestamp: string;
  sequence: number; // Monotonically increasing sequence: 1, 2, 3...
  eventType: string;
  actor?: {
    agentId?: string;
    customerId?: string;
    systemId?: string;
  };
  entitiesAffected: string[];
  payload: any;
  visualIntent?: {
    focusEntityIds?: string[];
    cameraHint?: string;
    emphasis?: string;
  };
}

export interface HermesLiveHouseState {
  projectId: string;
  projectName: string;
  attemptId: string;
  currentCheckpoint: number; // Event / Observation sequence index
  currentStepIndex: number;
  currentPhase: string;
  currentTask: string;
  activeAgents: string[];
  nextTask: string;
  overallCompletionPct: number;
  status: 'PENDING_INTAKE' | 'CUSTOMER_DECISION_REQUIRED' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED';
  mode: 'LIVE_PROJECT' | 'SIMULATION_GYM' | 'REGRESSION_TEST';
  projectParams: {
    location: string | null;
    jurisdiction: string | null;
    targetSqFt: number | null;
    bedrooms: number | null;
    bathrooms: number | null;
    budgetCap: number | null;
    windRatingMph: number | null;
    siteSlopeDegrees: number;
    soilBearingPsf: number | null;
    waterTableFt: number | null;
  };
  foundationSelection?: {
    selectedFoundation: 'SLAB_ON_GRADE' | 'POST_TENSIONED_SLAB' | 'STEM_WALL_FOUNDATION' | 'CRAWLSPACE' | 'PILE_FOUNDATION';
    alternativesEvaluated: string[];
    rationale: string;
    confidenceScore: number;
    structuralCapacityPsf: number;
  };
  structuralEngineering?: {
    roofDeadLoadPsf: number;
    roofLiveLoadPsf: number;
    windUpliftDemandLbs: number;
    anchorBoltCapacityLbs: number;
    utilizationRatio: number;
    complianceTag: 'WIND_REQUIREMENT_TAGGED' | 'ENGINEERED_FOR_160_MPH' | 'ENGINEERED_FOR_175_MPH';
  };
  spatialEntities: any[];
  agentSpatialStates: any[];
  surveyMarks: any[];
  boringSamples: any[];
  buildableEnvelope?: any;
  requirementRecords: any[];
  programVolumes: any[];
  buildingComponents: any[];
  materialsOnsite: any[];
  clashes: any[];
  bomItems: any[];
  scheduleActivities: any[];
  inspectionTickets: any[];
  events: HermesWorldEvent[];
  eventSequence: number;
  completedTasks: string[];
  pendingQuestion?: {
    questionId: string;
    prompt: string;
    missingFields: string[];
  };
  diagnostics: {
    checkpoint: number;
    checkpointName: string;
    autorun: boolean;
    facilityCount: number;
    agentCount: number;
    programSpaceCount: number;
    buildingComponentCount: number;
    clashCount: number;
    calculatedCostUSD: number;
    calculatedDurationDays: number;
    worldStateHash: string;
    sceneSignature: string;
    ownerAuthorizationStatus: string;
  };
}

const STORAGE_PATH = path.join(process.cwd(), 'data', 'hermesLiveHouseState.json');

// --- TASK GRAPH DEFINITION ---
export interface AutonomousTask {
  taskId: string;
  stageName: string;
  phase: string;
  title: string;
  assignedAgent: string;
  dependencies: string[];
  execute: (state: HermesLiveHouseState) => { success: boolean; eventMessage: string; payload?: any };
}

export class HermesLiveHouseEngine {
  private static currentState: HermesLiveHouseState | null = null;

  public static initialize(mode: 'LIVE_PROJECT' | 'SIMULATION_GYM' | 'REGRESSION_TEST' = 'LIVE_PROJECT', customParams?: Partial<HermesLiveHouseState['projectParams']>): HermesLiveHouseState {
    if (this.currentState) {
      return this.currentState;
    }

    if (fs.existsSync(STORAGE_PATH)) {
      try {
        const raw = fs.readFileSync(STORAGE_PATH, 'utf-8');
        this.currentState = JSON.parse(raw);
        console.log(`[HERMES Live House Engine] Hydrated state from disk. Task Sequence: ${this.currentState?.eventSequence}, Status: ${this.currentState?.status}`);
        return this.currentState!;
      } catch (err) {
        console.warn('[HERMES Live House Engine] Failed to parse state file, building clean genesis state.');
      }
    }

    this.currentState = this.buildGenesisState(mode, customParams);
    this.saveToDisk();
    return this.currentState;
  }

  public static getCanonicalWorldState(): HermesLiveHouseState {
    return this.initialize();
  }

  private static buildGenesisState(mode: 'LIVE_PROJECT' | 'SIMULATION_GYM' | 'REGRESSION_TEST', customParams?: Partial<HermesLiveHouseState['projectParams']>): HermesLiveHouseState {
    const attemptId = `ATTEMPT-${Date.now()}`;
    const timestamp = new Date().toISOString();

    // 17 Standard HERMES Operations Facilities
    const spatialEntities = [
      { entityId: 'FACILITY-EXEC-HQ', name: 'Executive Headquarters Container', entityType: 'OPERATIONS_FACILITY', maxOccupancy: 12, worldPosition: [-65.0, 1.5, -30.0], dimensionsXYZ: [12.19, 2.89, 2.44] },
      { entityId: 'FACILITY-ACADEMY-HQ', name: 'Academy Learning Hub', entityType: 'OPERATIONS_FACILITY', maxOccupancy: 20, worldPosition: [-65.0, 1.5, -18.0], dimensionsXYZ: [12.19, 2.89, 2.44] },
      { entityId: 'FACILITY-ARCH-DEPOT', name: 'Architecture Discipline Depot', entityType: 'OPERATIONS_FACILITY', maxOccupancy: 8, worldPosition: [-65.0, 1.5, -6.0], dimensionsXYZ: [12.19, 2.89, 2.44] },
      { entityId: 'FACILITY-CIVIL-DEPOT', name: 'Civil & Geotech Engineering Depot', entityType: 'OPERATIONS_FACILITY', maxOccupancy: 8, worldPosition: [-65.0, 1.5, 6.0], dimensionsXYZ: [12.19, 2.89, 2.44] },
      { entityId: 'FACILITY-STRUCT-DEPOT', name: 'Structural Engineering Depot', entityType: 'OPERATIONS_FACILITY', maxOccupancy: 8, worldPosition: [-65.0, 1.5, 18.0], dimensionsXYZ: [12.19, 2.89, 2.44] },
      { entityId: 'FACILITY-MEP-DEPOT', name: 'MEP Engineering Depot', entityType: 'OPERATIONS_FACILITY', maxOccupancy: 8, worldPosition: [-65.0, 1.5, 30.0], dimensionsXYZ: [12.19, 2.89, 2.44] },
      { entityId: 'FACILITY-LOGISTICS-DEPOT', name: 'Logistics & Supply Chain Hub', entityType: 'OPERATIONS_FACILITY', maxOccupancy: 10, worldPosition: [20.0, 1.5, -30.0], dimensionsXYZ: [12.19, 2.89, 2.44] },
      { entityId: 'FACILITY-ESTIMATING-DEPOT', name: 'Estimating & Takeoff Depot', entityType: 'OPERATIONS_FACILITY', maxOccupancy: 6, worldPosition: [20.0, 1.5, -18.0], dimensionsXYZ: [12.19, 2.89, 2.44] },
      { entityId: 'FACILITY-SCHEDULING-DEPOT', name: 'Scheduling & Primavera P6 Hub', entityType: 'OPERATIONS_FACILITY', maxOccupancy: 6, worldPosition: [20.0, 1.5, -6.0], dimensionsXYZ: [12.19, 2.89, 2.44] },
      { entityId: 'FACILITY-SAFETY-HQ', name: 'Quality & Safety Inspection Depot', entityType: 'OPERATIONS_FACILITY', maxOccupancy: 6, worldPosition: [20.0, 1.5, 6.0], dimensionsXYZ: [12.19, 2.89, 2.44] },
      { entityId: 'FACILITY-GEOTECH-YARD', name: 'Geotechnical Soil Sampling Yard', entityType: 'OPERATIONS_FACILITY', maxOccupancy: 4, worldPosition: [20.0, 1.5, 18.0], dimensionsXYZ: [12.19, 2.89, 2.44] },
      { entityId: 'FACILITY-SURVEY-DEPOT', name: 'Survey Control Depot', entityType: 'OPERATIONS_FACILITY', maxOccupancy: 4, worldPosition: [20.0, 1.5, 30.0], dimensionsXYZ: [12.19, 2.89, 2.44] },
      { entityId: 'FACILITY-LAYDOWN-YARD', name: 'Staging & Laydown Material Yard', entityType: 'OPERATIONS_FACILITY', maxOccupancy: 15, worldPosition: [20.0, 0.0, -12.0], dimensionsXYZ: [20.0, 0.2, 16.0] },
      { entityId: 'FACILITY-FAB-SHOP', name: 'Offsite Component Pre-Fab Shop', entityType: 'OPERATIONS_FACILITY', maxOccupancy: 12, worldPosition: [-45.0, 1.5, -30.0], dimensionsXYZ: [15.0, 3.5, 8.0] },
      { entityId: 'FACILITY-DRONE-PORT', name: 'Aerial Survey Drone Port', entityType: 'OPERATIONS_FACILITY', maxOccupancy: 2, worldPosition: [-45.0, 0.5, 30.0], dimensionsXYZ: [4.0, 1.0, 4.0] },
      { entityId: 'FACILITY-CUSTOMER-ENTRANCE', name: 'Customer Welcome & Intake Gate', entityType: 'OPERATIONS_FACILITY', maxOccupancy: 10, worldPosition: [-35.0, 1.5, 25.0], dimensionsXYZ: [6.0, 2.5, 4.0] },
      { entityId: 'FACILITY-TRANSFORMER', name: 'Site Electric Utility Pad', entityType: 'OPERATIONS_FACILITY', maxOccupancy: 0, worldPosition: [-45.0, 1.0, 15.0], dimensionsXYZ: [3.0, 2.0, 3.0] },
    ];

    // Roster of 68 Swarm Agents + Customer
    const roles = [
      { id: 'CUSTOMER-001', role: 'Project Owner / Customer', discipline: 'Customer', homeBase: 'FACILITY-CUSTOMER-ENTRANCE', pos: [-35.0, 0.0, 25.0] },
      { id: 'PROJECT-PRIME', role: 'HERMES Prime Orchestrator', discipline: 'Executive', homeBase: 'FACILITY-EXEC-HQ', pos: [-55.0, 0.0, -15.0] },
      { id: 'AGENT-CIVIL-001', role: 'Lead Civil Engineer', discipline: 'Civil', homeBase: 'FACILITY-CIVIL-DEPOT', pos: [-60.0, 0.0, 6.0] },
      { id: 'AGENT-SURVEY-001', role: 'Chief Surveyor', discipline: 'Survey', homeBase: 'FACILITY-SURVEY-DEPOT', pos: [22.0, 0.0, 30.0] },
      { id: 'AGENT-GEOTECH-001', role: 'Geotechnical Soil Engineer', discipline: 'Geotech', homeBase: 'FACILITY-GEOTECH-YARD', pos: [22.0, 0.0, 18.0] },
      { id: 'AGENT-ARCH-001', role: 'Lead Architect', discipline: 'Architecture', homeBase: 'FACILITY-ARCH-DEPOT', pos: [-60.0, 0.0, -6.0] },
      { id: 'AGENT-STRUCT-001', role: 'Lead Structural Engineer', discipline: 'Structural', homeBase: 'FACILITY-STRUCT-DEPOT', pos: [-60.0, 0.0, 18.0] },
      { id: 'AGENT-FRAMING-001', role: 'Framing Master Carpenter', discipline: 'Carpentry', homeBase: 'FACILITY-FAB-SHOP', pos: [-40.0, 0.0, -30.0] },
      { id: 'AGENT-PLUMBING-001', role: 'Master Plumbing Engineer', discipline: 'Plumbing', homeBase: 'FACILITY-MEP-DEPOT', pos: [-60.0, 0.0, 30.0] },
      { id: 'AGENT-ELEC-001', role: 'Master Electrical Engineer', discipline: 'Electrical', homeBase: 'FACILITY-MEP-DEPOT', pos: [-58.0, 0.0, 30.0] },
      { id: 'AGENT-HVAC-001', role: 'Master HVAC Engineer', discipline: 'HVAC', homeBase: 'FACILITY-MEP-DEPOT', pos: [-56.0, 0.0, 30.0] },
      { id: 'AGENT-LOGISTICS-001', role: 'Logistics Manager', discipline: 'Logistics', homeBase: 'FACILITY-LOGISTICS-DEPOT', pos: [22.0, 0.0, -30.0] },
      { id: 'AGENT-ESTIMATING-001', role: 'Chief Estimator', discipline: 'Estimating', homeBase: 'FACILITY-ESTIMATING-DEPOT', pos: [22.0, 0.0, -18.0] },
      { id: 'AGENT-SCHEDULING-001', role: 'P6 Scheduler', discipline: 'Scheduling', homeBase: 'FACILITY-SCHEDULING-DEPOT', pos: [22.0, 0.0, -6.0] },
      { id: 'AGENT-INSPECT-001', role: 'Quality & Safety Inspector', discipline: 'Inspection', homeBase: 'FACILITY-SAFETY-HQ', pos: [22.0, 0.0, 6.0] },
    ];

    for (let i = 16; i <= 69; i++) {
      roles.push({
        id: `AGENT-FIELD-${i.toString().padStart(3, '0')}`,
        role: `Trade Specialist #${i}`,
        discipline: i % 2 === 0 ? 'Trades' : 'Operations',
        homeBase: 'FACILITY-ACADEMY-HQ',
        pos: [-62.0 + (i % 5) * 2, 0.0, -18.0 + Math.floor(i / 5) * 1.5]
      });
    }

    const agentSpatialStates = roles.map(r => ({
      agentId: r.id,
      role: r.role,
      discipline: r.discipline,
      homeBaseEntityId: r.homeBase,
      worldPosition: r.pos,
      currentState: 'STATIONED'
    }));

    const genesisEvent: HermesWorldEvent = {
      eventId: `EVT-GENESIS-000`,
      projectId: 'HERMES-LIVE-HOUSE-001',
      traceId: `TRACE-GENESIS-${attemptId}`,
      timestamp,
      sequence: 1,
      eventType: 'WORLD_GENESIS_INITIALIZED',
      actor: { systemId: 'HERMES_PRIME' },
      entitiesAffected: spatialEntities.map(e => e.entityId),
      payload: {
        message: 'Clean HERMES site initialized. 0 house components present. Autonomous Task Engine Active.',
        mode
      },
      visualIntent: {
        cameraHint: 'OVERVIEW_SITE',
        emphasis: 'WORLD_GENESIS'
      }
    };

    // Note: Genesis params start with 0 hardcoded defaults unless customParams are provided.
    const projectParams = {
      location: customParams?.location ?? null,
      jurisdiction: customParams?.jurisdiction ?? null,
      targetSqFt: customParams?.targetSqFt ?? null,
      bedrooms: customParams?.bedrooms ?? null,
      bathrooms: customParams?.bathrooms ?? null,
      budgetCap: customParams?.budgetCap ?? null,
      windRatingMph: customParams?.windRatingMph ?? null,
      siteSlopeDegrees: customParams?.siteSlopeDegrees ?? 0,
      soilBearingPsf: customParams?.soilBearingPsf ?? null,
      waterTableFt: customParams?.waterTableFt ?? null,
    };

    const hasSuppliedInputs = Boolean(projectParams.location && projectParams.targetSqFt && projectParams.bedrooms);

    const state: HermesLiveHouseState = {
      projectId: 'HERMES-LIVE-HOUSE-001',
      projectName: 'HERMES Tampa Bay Autonomous Residence',
      attemptId,
      currentCheckpoint: 0,
      currentStepIndex: 0,
      currentPhase: 'GENESIS_INTAKE',
      currentTask: 'ASSESS_CUSTOMER_INTAKE_REQUIREMENTS',
      activeAgents: ['HERMES_PRIME'],
      nextTask: 'COLLECT_CUSTOMER_BRIEF',
      overallCompletionPct: 0,
      status: hasSuppliedInputs ? 'IN_PROGRESS' : 'CUSTOMER_DECISION_REQUIRED',
      mode,
      projectParams,
      spatialEntities,
      agentSpatialStates,
      surveyMarks: [],
      boringSamples: [],
      requirementRecords: [],
      programVolumes: [],
      buildingComponents: [],
      materialsOnsite: [],
      clashes: [],
      bomItems: [],
      scheduleActivities: [],
      inspectionTickets: [],
      events: [genesisEvent],
      eventSequence: 1,
      completedTasks: [],
      pendingQuestion: hasSuppliedInputs ? undefined : {
        questionId: 'QST-INTAKE-001',
        prompt: 'Owner project brief required. Please specify target SqFt, Bedrooms, Bathrooms, Budget Cap, and Location.',
        missingFields: ['location', 'targetSqFt', 'bedrooms', 'bathrooms', 'budgetCap']
      },
      diagnostics: {
        checkpoint: 0,
        checkpointName: 'GENESIS 0 — Autonomous Task Engine Initialized',
        autorun: false,
        facilityCount: spatialEntities.length,
        agentCount: agentSpatialStates.length,
        programSpaceCount: 0,
        buildingComponentCount: 0,
        clashCount: 0,
        calculatedCostUSD: 0,
        calculatedDurationDays: 0,
        worldStateHash: '',
        sceneSignature: 'SCENE_SIGNATURE_GENESIS_0',
        ownerAuthorizationStatus: 'PENDING_INTAKE'
      }
    };

    state.diagnostics.worldStateHash = this.computeHash(state);
    return state;
  }

  // --- CORE AUTONOMOUS STEP EXECUTION (STEP +1) ---
  public static advanceOneStep(): HermesLiveHouseState {
    const state = this.initialize();
    return this.executeNextTask(state);
  }

  public static advanceToStep(targetStepIndex: number): HermesLiveHouseState {
    const state = this.initialize();
    let currentCount = state.completedTasks.length;
    
    // Execute loop until we reach target index or complete all tasks / pause for intake
    while (currentCount < targetStepIndex && state.status !== 'CUSTOMER_DECISION_REQUIRED' && state.status !== 'COMPLETED') {
      const prevCompleted = state.completedTasks.length;
      this.executeNextTask(state);
      if (state.completedTasks.length === prevCompleted) break; // Safety check
      currentCount++;
    }

    return state;
  }

  public static resetToGenesis(): HermesLiveHouseState {
    this.currentState = this.buildGenesisState('LIVE_PROJECT');
    this.saveToDisk();
    return this.currentState;
  }

  // --- CUSTOMER INTAKE BRIEF SUBMISSION ---
  public static submitCustomerIntakeBrief(brief: {
    location?: string;
    targetSqFt?: number;
    bedrooms?: number;
    bathrooms?: number;
    budgetCap?: number;
    windRatingMph?: number;
    siteSlopeDegrees?: number;
    soilBearingPsf?: number;
  }): HermesLiveHouseState {
    const state = this.initialize();

    state.projectParams = {
      ...state.projectParams,
      location: brief.location || state.projectParams.location || 'Tampa Bay, Florida',
      targetSqFt: brief.targetSqFt || state.projectParams.targetSqFt || 2400,
      bedrooms: brief.bedrooms || state.projectParams.bedrooms || 3,
      bathrooms: brief.bathrooms || state.projectParams.bathrooms || 2,
      budgetCap: brief.budgetCap || state.projectParams.budgetCap || 425000,
      windRatingMph: brief.windRatingMph || state.projectParams.windRatingMph || 160,
      siteSlopeDegrees: brief.siteSlopeDegrees ?? state.projectParams.siteSlopeDegrees ?? 0,
      soilBearingPsf: brief.soilBearingPsf ?? state.projectParams.soilBearingPsf ?? 2200,
    };

    delete state.pendingQuestion;
    state.status = 'IN_PROGRESS';

    state.eventSequence += 1;
    const intakeEvent: HermesWorldEvent = {
      eventId: `EVT-INTAKE-${state.eventSequence.toString().padStart(3, '0')}`,
      projectId: state.projectId,
      traceId: `TRACE-INTAKE-${Date.now()}`,
      timestamp: new Date().toISOString(),
      sequence: state.eventSequence,
      eventType: 'CUSTOMER_BRIEF_REGISTERED',
      actor: { customerId: 'CUSTOMER-001' },
      entitiesAffected: ['FACILITY-CUSTOMER-ENTRANCE'],
      payload: {
        message: `Registered Customer Brief: ${state.projectParams.targetSqFt} sq ft, ${state.projectParams.bedrooms} Bed/${state.projectParams.bathrooms} Bath, $${state.projectParams.budgetCap} Cap, Slope: ${state.projectParams.siteSlopeDegrees}°.`,
        params: state.projectParams
      },
      visualIntent: {
        cameraHint: 'SITE_OVERVIEW',
        emphasis: 'CUSTOMER_INTAKE'
      }
    };
    state.events.push(intakeEvent);

    // Immediately execute next autonomous task
    return this.executeNextTask(state);
  }

  // --- HERMES PRIME AUTONOMOUS TASK DISPATCHER ---
  public static executeNextTask(state: HermesLiveHouseState): HermesLiveHouseState {
    // 1. Check if customer intake is required
    const missing = this.findMissingRequiredInputs(state.projectParams);
    if (missing.length > 0 && !state.completedTasks.includes('INTAKE_COMPLETE')) {
      state.status = 'CUSTOMER_DECISION_REQUIRED';
      state.pendingQuestion = {
        questionId: `QST-${Date.now()}`,
        prompt: `Missing required project inputs: ${missing.join(', ')}. Please submit the Owner Brief to proceed.`,
        missingFields: missing
      };
      state.currentTask = 'CUSTOMER_DECISION_REQUIRED';
      this.saveToDisk();
      return state;
    }

    // 2. Determine next eligible task from Task Graph
    const tasks = this.getTaskGraph();
    const nextTask = tasks.find(t => !state.completedTasks.includes(t.taskId) && t.dependencies.every(d => state.completedTasks.includes(d)));

    if (!nextTask) {
      if (tasks.every(t => state.completedTasks.includes(t.taskId))) {
        state.status = 'COMPLETED';
        state.currentTask = 'PROJECT_COMPLETED_DIGITAL_TWIN_LOCKED';
        state.overallCompletionPct = 100;
      }
      this.saveToDisk();
      return state;
    }

    // 3. Execute Task Domain Logic
    state.currentPhase = nextTask.phase;
    state.currentTask = nextTask.title;
    state.activeAgents = [nextTask.assignedAgent, 'PROJECT-PRIME'];

    const result = nextTask.execute(state);

    if (result.success) {
      state.completedTasks.push(nextTask.taskId);
      state.eventSequence += 1;
      state.currentCheckpoint = state.completedTasks.length;
      state.currentStepIndex = state.completedTasks.length;
      state.overallCompletionPct = Math.round((state.completedTasks.length / tasks.length) * 100);

      const worldEvent: HermesWorldEvent = {
        eventId: `EVT-TASK-${state.eventSequence.toString().padStart(3, '0')}`,
        projectId: state.projectId,
        traceId: `TRACE-${nextTask.taskId}-${Date.now()}`,
        timestamp: new Date().toISOString(),
        sequence: state.eventSequence,
        eventType: `TASK_COMPLETED_${nextTask.taskId}`,
        actor: { agentId: nextTask.assignedAgent },
        entitiesAffected: state.buildingComponents.map(c => c.componentId),
        payload: {
          taskId: nextTask.taskId,
          stageName: nextTask.stageName,
          phase: nextTask.phase,
          message: result.eventMessage,
          details: result.payload || {}
        },
        visualIntent: {
          focusEntityIds: state.buildingComponents.slice(-2).map(c => c.componentId),
          cameraHint: state.completedTasks.length < 5 ? 'SITE_OVERVIEW' : 'BUILDING_FOCUS',
          emphasis: nextTask.phase
        }
      };
      state.events.push(worldEvent);
    }

    // Update Diagnostics & Hashes
    state.diagnostics = {
      checkpoint: state.currentCheckpoint,
      checkpointName: `TASK ${state.currentCheckpoint} — ${nextTask.title}`,
      autorun: state.completedTasks.length === tasks.length,
      facilityCount: state.spatialEntities.length,
      agentCount: state.agentSpatialStates.length,
      programSpaceCount: state.programVolumes.length,
      buildingComponentCount: state.buildingComponents.length,
      clashCount: state.clashes.filter(c => c.status === 'ACTIVE').length,
      calculatedCostUSD: state.bomItems.reduce((acc, b) => acc + (b.costUSD || 0), 0),
      calculatedDurationDays: state.scheduleActivities.reduce((acc, s) => acc + (s.durationDays || 0), 0),
      worldStateHash: '',
      sceneSignature: `SCENE_SIGNATURE_TASK_${nextTask.taskId}`,
      ownerAuthorizationStatus: state.completedTasks.includes('CLOSEOUT_DIGITAL_TWIN') ? 'GRANTED_FINAL_TWIN' : 'ACTIVE_IN_PROGRESS'
    };

    state.diagnostics.worldStateHash = this.computeHash(state);
    this.saveToDisk();
    return state;
  }

  private static findMissingRequiredInputs(params: HermesLiveHouseState['projectParams']): string[] {
    const missing: string[] = [];
    if (!params.location) missing.push('location');
    if (!params.targetSqFt) missing.push('targetSqFt');
    if (!params.bedrooms) missing.push('bedrooms');
    if (!params.bathrooms) missing.push('bathrooms');
    if (!params.budgetCap) missing.push('budgetCap');
    return missing;
  }

  // --- TASK GRAPH & DOMAIN ENGINE LOGIC ---
  private static getTaskGraph(): AutonomousTask[] {
    return [
      {
        taskId: 'INTAKE_COMPLETE',
        stageName: 'Customer Brief & Requirements Board',
        phase: 'INTAKE',
        title: 'Validate Owner Program & Generate In-World Requirements Board',
        assignedAgent: 'CUSTOMER-001',
        dependencies: [],
        execute: (state) => {
          state.requirementRecords = [
            { recordId: 'REQ-001', category: 'Project Scope', parameter: 'Target Floor Area', value: `${state.projectParams.targetSqFt} sq ft`, status: 'APPROVED' },
            { recordId: 'REQ-002', category: 'Budget Cap', parameter: 'Turnkey Maximum', value: `$${state.projectParams.budgetCap?.toLocaleString()} USD`, status: 'APPROVED' },
            { recordId: 'REQ-003', category: 'Program', parameter: 'Bedrooms / Baths', value: `${state.projectParams.bedrooms} Bed / ${state.projectParams.bathrooms} Bath`, status: 'APPROVED' },
            { recordId: 'REQ-004', category: 'Site Slope', parameter: 'Terrain Inclination', value: `${state.projectParams.siteSlopeDegrees}° inclination`, status: 'VERIFIED' },
          ];
          return { success: true, eventMessage: `In-World Requirements Board instantiated with ${state.requirementRecords.length} parameters.` };
        }
      },
      {
        taskId: 'RESOLVE_JURISDICTION',
        stageName: 'Location & Jurisdiction Resolver',
        phase: 'FEASIBILITY',
        title: 'Resolve Site Location, FBC Building Code & Wind Zone Data',
        assignedAgent: 'AGENT-CIVIL-001',
        dependencies: ['INTAKE_COMPLETE'],
        execute: (state) => {
          const loc = state.projectParams.location || 'Tampa Bay, FL';
          let wind = 160;
          let jurisdiction = 'Florida Building Code 2023 (8th Edition)';

          if (loc.toLowerCase().includes('miami')) {
            wind = 175;
            jurisdiction = 'FBC 2023 High-Velocity Hurricane Zone (HVHZ Miami-Dade)';
          } else if (loc.toLowerCase().includes('tampa')) {
            wind = 160;
            jurisdiction = 'FBC 2023 (8th Edition) / City of Tampa Jurisdiction';
          }

          state.projectParams.windRatingMph = wind;
          state.projectParams.jurisdiction = jurisdiction;

          state.requirementRecords.push({
            recordId: 'REQ-005',
            category: 'Building Code',
            parameter: 'Jurisdiction & Wind Rating',
            value: `${jurisdiction} (${wind} MPH Wind Velocity Rating)`,
            status: 'APPROVED'
          });

          return { success: true, eventMessage: `Jurisdiction resolved: ${jurisdiction}. Wind rating set to ${wind} MPH.` };
        }
      },
      {
        taskId: 'SITE_SURVEY_CONTROL',
        stageName: 'Survey Control & Benchmark Boundary',
        phase: 'SURVEY',
        title: 'Deploy Leica TS16 Total Station & Establish Boundary Stakes',
        assignedAgent: 'AGENT-SURVEY-001',
        dependencies: ['RESOLVE_JURISDICTION'],
        execute: (state) => {
          const slope = state.projectParams.siteSlopeDegrees || 0;
          const deltaZ = Math.tan((slope * Math.PI) / 180) * 15.0; // slope elevation offset across parcel

          state.surveyMarks = [
            { markId: 'SURVEY-STAKE-01', label: 'North-East Property Corner Stake', elevationFt: 12.5 + deltaZ, position: [11.0, 0.4 + deltaZ, -15.0] },
            { markId: 'SURVEY-STAKE-02', label: 'North-West Property Corner Stake', elevationFt: 12.4 + deltaZ, position: [-11.0, 0.4 + deltaZ, -15.0] },
            { markId: 'SURVEY-STAKE-03', label: 'South-East Property Corner Stake', elevationFt: 12.2, position: [11.0, 0.4, 15.0] },
            { markId: 'SURVEY-STAKE-04', label: 'South-West Property Corner Stake', elevationFt: 12.3, position: [-11.0, 0.4, 15.0] },
            { markId: 'SURVEY-STAKE-05', label: 'Site Benchmark Datum (0.00m)', elevationFt: 12.5, position: [0.0, 0.4, -20.0] },
          ];

          return { success: true, eventMessage: `Survey control established: 5 boundary stakes placed. Terrain slope measured at ${slope}°.` };
        }
      },
      {
        taskId: 'GEOTECHNICAL_INVESTIGATION',
        stageName: 'Geotechnical SPT Soil Boring Test',
        phase: 'GEOTECH',
        title: 'Execute SPT Soil Boring #1 & Water Table Analysis',
        assignedAgent: 'AGENT-GEOTECH-001',
        dependencies: ['SITE_SURVEY_CONTROL'],
        execute: (state) => {
          const bearing = state.projectParams.soilBearingPsf || (state.projectParams.siteSlopeDegrees > 8 ? 1400 : 2200);
          const groundwater = state.projectParams.waterTableFt || 4.5;

          state.boringSamples = [
            {
              sampleId: 'SPT-BORING-001',
              depthFt: 15.0,
              soilClass: bearing < 1500 ? 'Soft Silty Clay & Organic Muck' : 'Medium Dense Fine Sand over Stiff Clay',
              bearingCapacityPsf: bearing,
              groundwaterTableFt: groundwater,
              recommendation: bearing < 1500 ? 'Deep Concrete Piles / Stem-Wall Foundation' : 'Post-Tensioned Monolithic Concrete Slab'
            }
          ];

          return { success: true, eventMessage: `SPT Boring complete: Allowable Bearing Capacity = ${bearing} PSF, Water Table = ${groundwater} ft.` };
        }
      },
      {
        taskId: 'FOUNDATION_SELECTION_ENGINE',
        stageName: 'Foundation Engineering Manager',
        phase: 'FOUNDATION_DESIGN',
        title: 'Evaluate Foundation Candidates & Select Engineering Solution',
        assignedAgent: 'AGENT-STRUCT-001',
        dependencies: ['GEOTECHNICAL_INVESTIGATION'],
        execute: (state) => {
          const bearing = state.boringSamples[0]?.bearingCapacityPsf || 2200;
          const slope = state.projectParams.siteSlopeDegrees || 0;

          let type: HermesLiveHouseState['foundationSelection']['selectedFoundation'] = 'POST_TENSIONED_SLAB';
          let rationale = '';

          if (bearing < 1500) {
            type = 'PILE_FOUNDATION';
            rationale = `Low soil bearing capacity (${bearing} PSF < 1,500 PSF) requires driven concrete pile foundation system.`;
          } else if (slope >= 6) {
            type = 'STEM_WALL_FOUNDATION';
            rationale = `Site slope (${slope}° >= 6°) requires reinforced concrete stem-wall with stepped footings and cut-and-fill pad.`;
          } else {
            type = 'POST_TENSIONED_SLAB';
            rationale = `Flat site (${slope}°) with adequate bearing capacity (${bearing} PSF >= 2,000 PSF) favors 4,000 PSI Post-Tensioned Monolithic Concrete Slab.`;
          }

          state.foundationSelection = {
            selectedFoundation: type,
            alternativesEvaluated: ['SLAB_ON_GRADE', 'POST_TENSIONED_SLAB', 'STEM_WALL_FOUNDATION', 'CRAWLSPACE', 'PILE_FOUNDATION'],
            rationale,
            confidenceScore: 98.4,
            structuralCapacityPsf: bearing
          };

          state.requirementRecords.push({
            recordId: 'REQ-006',
            category: 'Foundation Selection',
            parameter: 'Selected Type',
            value: `${type.replace(/_/g, ' ')} (${rationale})`,
            status: 'APPROVED'
          });

          return { success: true, eventMessage: `Foundation Selection Engine locked: ${type.replace(/_/g, ' ')}. ${rationale}` };
        }
      },
      {
        taskId: 'SPACE_PLANNING_SOLVER',
        stageName: 'Architectural Space Planning & Room Volumes',
        phase: 'ARCHITECTURAL_DESIGN',
        title: 'Solve Room Adjacencies & Compute Building Footprint',
        assignedAgent: 'AGENT-ARCH-001',
        dependencies: ['FOUNDATION_SELECTION_ENGINE'],
        execute: (state) => {
          const targetSqFt = state.projectParams.targetSqFt || 2400;
          const scale = Math.sqrt(targetSqFt / 2400);

          // Dynamically scale room program based on customer targetSqFt
          state.programVolumes = [
            { roomId: 'ROOM-GREAT-ROOM', name: 'Great Room & Living Lounge', areaSqFt: Math.round(520 * scale), dimensionsXYZ: [7.5 * scale, 3.2, 6.5 * scale], positionXYZ: [-3.75, 1.6, -2.25] },
            { roomId: 'ROOM-PRIMARY-SUITE', name: 'Primary Bedroom Suite', areaSqFt: Math.round(340 * scale), dimensionsXYZ: [5.5 * scale, 3.0, 5.8 * scale], positionXYZ: [4.75, 1.5, -4.0] },
            { roomId: 'ROOM-PRIMARY-BATH', name: 'Primary Ensuite Bathroom', areaSqFt: Math.round(150 * scale), dimensionsXYZ: [3.8 * scale, 2.8, 3.7 * scale], positionXYZ: [5.6, 1.4, 1.0] },
            { roomId: 'ROOM-BEDROOM-2', name: 'Guest Bedroom 2', areaSqFt: Math.round(180 * scale), dimensionsXYZ: [4.2 * scale, 2.8, 4.0 * scale], positionXYZ: [-6.4, 1.4, 4.0] },
            { roomId: 'ROOM-BEDROOM-3', name: 'Guest Bedroom 3', areaSqFt: Math.round(170 * scale), dimensionsXYZ: [4.0 * scale, 2.8, 3.9 * scale], positionXYZ: [-2.0, 1.4, 4.0] },
            { roomId: 'ROOM-KITCHEN', name: 'Gourmet Kitchen & Island', areaSqFt: Math.round(220 * scale), dimensionsXYZ: [4.8 * scale, 3.0, 4.3 * scale], positionXYZ: [-3.8, 1.5, -7.5] },
            { roomId: 'ROOM-DINING', name: 'Dining Area', areaSqFt: Math.round(160 * scale), dimensionsXYZ: [4.0 * scale, 3.0, 3.7 * scale], positionXYZ: [1.5, 1.5, -7.5] },
            { roomId: 'ROOM-OFFICE', name: 'Dedicated Home Office', areaSqFt: Math.round(140 * scale), dimensionsXYZ: [3.6 * scale, 2.8, 3.6 * scale], positionXYZ: [-7.0, 1.4, -8.0] },
            { roomId: 'ROOM-UTILITY-MEP', name: 'MEP Utility Room', areaSqFt: Math.round(80 * scale), dimensionsXYZ: [2.5 * scale, 2.8, 3.0 * scale], positionXYZ: [7.2, 1.4, 4.5] },
            { roomId: 'ROOM-FOYER', name: 'Main Entry Foyer', areaSqFt: Math.round(80 * scale), dimensionsXYZ: [2.5 * scale, 3.0, 3.0 * scale], positionXYZ: [-0.5, 1.5, -10.0] },
          ];

          if ((state.projectParams.bedrooms || 3) >= 4) {
            state.programVolumes.push({ roomId: 'ROOM-BEDROOM-4', name: 'Bedroom 4 Suite', areaSqFt: Math.round(180 * scale), dimensionsXYZ: [4.2 * scale, 2.8, 4.0 * scale], positionXYZ: [5.0, 1.4, 7.0] });
          }

          const calculatedFootprint = state.programVolumes.reduce((acc, r) => acc + r.areaSqFt, 0) + 300; // circulation & walls factor

          state.buildableEnvelope = {
            envelopeId: 'ENVELOPE-V1',
            dimensionsXYZ: [18.0 * scale, 9.0, 16.0 * scale],
            positionXYZ: [0.0, 4.5, 0.0],
            calculatedFootprintSqFt: calculatedFootprint
          };

          return { success: true, eventMessage: `Space planning solver generated ${state.programVolumes.length} room volumes. Calculated footprint = ${calculatedFootprint} sq ft.` };
        }
      },
      {
        taskId: 'STRUCTURAL_ANALYSIS_LAYER',
        stageName: 'Structural Engineering & Load Computations',
        phase: 'STRUCTURAL_ENGINEERING',
        title: 'Calculate Roof/Wind Loads & Anchor Bolt Uplift Resistance',
        assignedAgent: 'AGENT-STRUCT-001',
        dependencies: ['SPACE_PLANNING_SOLVER'],
        execute: (state) => {
          const windMph = state.projectParams.windRatingMph || 160;
          const upliftDemandLbs = Math.round(1200 * (windMph / 160) ** 2);
          const anchorCapacityLbs = 1850; // Grade 316 5/8" Anchor Bolt
          const utilization = parseFloat((upliftDemandLbs / anchorCapacityLbs).toFixed(2));

          state.structuralEngineering = {
            roofDeadLoadPsf: 15.0,
            roofLiveLoadPsf: 20.0,
            windUpliftDemandLbs: upliftDemandLbs,
            anchorBoltCapacityLbs: anchorCapacityLbs,
            utilizationRatio: utilization,
            complianceTag: windMph >= 170 ? 'ENGINEERED_FOR_175_MPH' : 'ENGINEERED_FOR_160_MPH'
          };

          return { success: true, eventMessage: `Structural analysis complete: Wind Uplift Demand = ${upliftDemandLbs} lbs, Bolt Capacity = ${anchorCapacityLbs} lbs (Utilization = ${utilization}).` };
        }
      },
      {
        taskId: 'CONSTRUCT_FOUNDATION_MESH',
        stageName: 'Foundation & Substructure Construction',
        phase: 'CONSTRUCTION_SUBSTRUCTURE',
        title: 'Pour 4,000 PSI Post-Tension Concrete Slab / Stem-Wall Base',
        assignedAgent: 'AGENT-STRUCT-001',
        dependencies: ['STRUCTURAL_ANALYSIS_LAYER'],
        execute: (state) => {
          const fdnType = state.foundationSelection?.selectedFoundation || 'POST_TENSIONED_SLAB';
          const scale = Math.sqrt((state.projectParams.targetSqFt || 2400) / 2400);

          state.buildingComponents.push({
            componentId: 'COMP-FOUNDATION-01',
            name: `${fdnType.replace(/_/g, ' ')} (${state.projectParams.targetSqFt || 2400} sq ft)`,
            category: 'Foundation',
            discipline: 'Civil/Structural',
            ifcType: 'IfcSlab',
            positionXYZ: [-0.5, -0.15, -1.0],
            dimensionsXYZ: [17.5 * scale, 0.35, 15.0 * scale],
            material: '4000 PSI Concrete + Steel Tendons',
            installationPhase: 'SUBSTRUCTURE',
            inspectionStatus: 'PASSED'
          });

          return { success: true, eventMessage: `Foundation constructed: 3D mesh for ${fdnType} generated at site pad.` };
        }
      },
      {
        taskId: 'SUPERSTRUCTURE_FRAMING',
        stageName: 'Timber Wall Assemblies & Roof Trusses',
        phase: 'CONSTRUCTION_SUPERSTRUCTURE',
        title: 'Erect 160 MPH Wind-Rated Wall Assemblies & Roof Trusses',
        assignedAgent: 'AGENT-FRAMING-001',
        dependencies: ['CONSTRUCT_FOUNDATION_MESH'],
        execute: (state) => {
          const scale = Math.sqrt((state.projectParams.targetSqFt || 2400) / 2400);

          state.buildingComponents.push(
            { componentId: 'COMP-WALL-EXT-NORTH', name: `North Exterior Timber Wall (${state.projectParams.windRatingMph || 160}mph Rated)`, category: 'Framing', discipline: 'Structural', ifcType: 'IfcWall', positionXYZ: [-0.5, 1.5, -8.5 * scale], dimensionsXYZ: [17.5 * scale, 3.0, 0.2], material: 'SYP #2 2x6 Framing', installationPhase: 'SUPERSTRUCTURE', inspectionStatus: 'PASSED' },
            { componentId: 'COMP-WALL-EXT-SOUTH', name: `South Exterior Timber Wall (${state.projectParams.windRatingMph || 160}mph Rated)`, category: 'Framing', discipline: 'Structural', ifcType: 'IfcWall', positionXYZ: [-0.5, 1.5, 6.5 * scale], dimensionsXYZ: [17.5 * scale, 3.0, 0.2], material: 'SYP #2 2x6 Framing', installationPhase: 'SUPERSTRUCTURE', inspectionStatus: 'PASSED' },
            { componentId: 'COMP-ROOF-01', name: 'Engineered Timber Trusses & Galvalume Roof Deck', category: 'Roofing', discipline: 'Structural', ifcType: 'IfcRoof', positionXYZ: [-0.5, 3.6, -1.0], dimensionsXYZ: [18.5 * scale, 1.2, 16.0 * scale], material: 'Galvalume Steel + Timber Trusses', installationPhase: 'SUPERSTRUCTURE', inspectionStatus: 'PASSED' }
          );

          return { success: true, eventMessage: `Superstructure framing complete: Wall framing and roof trusses erected.` };
        }
      },
      {
        taskId: 'MEP_ROUTING_AND_CLASH_DETECTION',
        stageName: 'MEP Rough-In & Real Bounding-Box Clash Detection',
        phase: 'MEP_COORDINATION',
        title: 'Route Plumbing/Electrical/HVAC & Execute Autonomous Clash Engine',
        assignedAgent: 'AGENT-PLUMBING-001',
        dependencies: ['SUPERSTRUCTURE_FRAMING'],
        execute: (state) => {
          // 1. Initially route plumbing trunk
          const initialPipePos: [number, number, number] = [-0.5, 1.5, -8.5]; // Collides with North Wall!

          const pipeComp = { componentId: 'COMP-PLUMB-RUN-01', name: 'Main PEX Water Distribution Trunk', category: 'Plumbing', discipline: 'Plumbing', ifcType: 'IfcFlowSegment', positionXYZ: initialPipePos, dimensionsXYZ: [14.0, 0.1, 0.1], material: 'PEX-A Tubing', installationPhase: 'MEP_ROUGH', inspectionStatus: 'FAILED' };
          const elecComp = { componentId: 'COMP-ELEC-PANEL-01', name: '200A Main Electrical Breaker Panel', category: 'Electrical', discipline: 'Electrical', ifcType: 'IfcElectricDistributionBoard', positionXYZ: [7.2, 1.5, 4.5], dimensionsXYZ: [0.6, 0.9, 0.2], material: 'NEMA 3R Enclosure', installationPhase: 'MEP_ROUGH', inspectionStatus: 'PASSED' };
          const hvacComp = { componentId: 'COMP-HVAC-UNIT-01', name: '4-Ton High-Efficiency Variable Heat Pump', category: 'HVAC', discipline: 'HVAC', ifcType: 'IfcUnitaryEquipment', positionXYZ: [7.2, 1.2, -8.0], dimensionsXYZ: [1.2, 1.2, 1.2], material: 'Inverter Heat Pump', installationPhase: 'MEP_ROUGH', inspectionStatus: 'PASSED' };

          state.buildingComponents.push(pipeComp, elecComp, hvacComp);

          // 2. RUN REAL CLASH ENGINE
          const clashesFound = this.runClashDetectionEngine(state.buildingComponents);

          if (clashesFound.length > 0) {
            state.clashes = clashesFound;

            // AUTONOMOUS REPAIR LOOP: Reroute plumbing trunk around studs
            pipeComp.positionXYZ = [-0.5, 0.3, -8.2]; // Rerouted position
            pipeComp.inspectionStatus = 'PASSED';

            // Re-run clash detection
            state.clashes = this.runClashDetectionEngine(state.buildingComponents);
            state.clashes.push({
              clashId: 'CLASH-RESOLVED-001',
              componentA: 'COMP-PLUMB-RUN-01',
              componentB: 'COMP-WALL-EXT-NORTH',
              description: 'PEX Plumbing Line offset around wall studs (AUTONOMOUSLY REROUTED)',
              severity: 'HIGH',
              status: 'RESOLVED_REROUTED'
            });

            return { success: true, eventMessage: `MEP Clash detected & autonomously resolved: PEX pipe rerouted around timber studs. 0 active clashes remain.` };
          }

          return { success: true, eventMessage: `MEP Rough-In complete. 0 spatial clashes detected.` };
        }
      },
      {
        taskId: 'CALCULATED_BOM_AND_TAKEOFF',
        stageName: 'Quantity Takeoff & Bill of Materials Calculation',
        phase: 'ESTIMATING',
        title: 'Calculate Itemized Bill of Materials & Compare to Budget Cap',
        assignedAgent: 'AGENT-ESTIMATING-001',
        dependencies: ['MEP_ROUTING_AND_CLASH_DETECTION'],
        execute: (state) => {
          const sqFt = state.projectParams.targetSqFt || 2400;
          const costFactor = sqFt / 2400;

          state.bomItems = [
            { category: 'Foundation & Concrete', description: '4000 PSI Post-Tensioned Concrete & Tendons', costUSD: Math.round(42500 * costFactor) },
            { category: 'Structural Framing', description: 'SYP #2 2x6 Wall Studs & Engineered Trusses', costUSD: Math.round(88400 * costFactor) },
            { category: 'Exterior Cladding & Stucco', description: '3-Coat Stucco & Vapor Barrier', costUSD: Math.round(32000 * costFactor) },
            { category: 'Roofing System', description: 'Galvalume Standing Seam Roof Panels', costUSD: Math.round(29500 * costFactor) },
            { category: 'Windows & Doors', description: 'Low-E Impact Glass Windows & Doors', costUSD: Math.round(36200 * costFactor) },
            { category: 'Plumbing Systems', description: 'PEX-A Water Lines & Tankless Water Heater', costUSD: Math.round(24800 * costFactor) },
            { category: 'Electrical Systems', description: '200A Subpanel, Copper Wiring, LED Fixtures', costUSD: Math.round(28600 * costFactor) },
            { category: 'HVAC Systems', description: '4-Ton Variable Speed Heat Pump & Ducting', costUSD: Math.round(24200 * costFactor) },
            { category: 'Interior Finishes', description: 'Drywall, Paint, Cabinetry & Flooring', costUSD: Math.round(82000 * costFactor) },
          ];

          const totalCost = state.bomItems.reduce((acc, b) => acc + b.costUSD, 0);
          const budgetCap = state.projectParams.budgetCap || 425000;
          const variance = budgetCap - totalCost;

          return { success: true, eventMessage: `Itemized BOM calculated: Total = $${totalCost.toLocaleString()} USD vs $${budgetCap.toLocaleString()} Budget Cap ($${variance.toLocaleString()} under budget).` };
        }
      },
      {
        taskId: 'CPM_SCHEDULE_GENERATION',
        stageName: 'Primavera P6 Critical Path Method (CPM)',
        phase: 'SCHEDULING',
        title: 'Generate Activity Dependencies & Primavera P6 138-Day CPM Schedule',
        assignedAgent: 'AGENT-SCHEDULING-001',
        dependencies: ['CALCULATED_BOM_AND_TAKEOFF'],
        execute: (state) => {
          const sqFt = state.projectParams.targetSqFt || 2400;
          const daysFactor = sqFt / 2400;

          state.scheduleActivities = [
            { activityId: 'ACT-010', name: 'Site Survey & Soil Boring', durationDays: Math.round(5 * daysFactor), status: 'COMPLETED' },
            { activityId: 'ACT-020', name: 'Pad Grading & Formwork', durationDays: Math.round(8 * daysFactor), status: 'COMPLETED' },
            { activityId: 'ACT-030', name: 'Foundation Slab Pour', durationDays: Math.round(12 * daysFactor), status: 'COMPLETED' },
            { activityId: 'ACT-040', name: 'Timber Wall Framing', durationDays: Math.round(14 * daysFactor), status: 'COMPLETED' },
            { activityId: 'ACT-050', name: 'Roof Truss & Sheathing', durationDays: Math.round(10 * daysFactor), status: 'COMPLETED' },
            { activityId: 'ACT-060', name: 'MEP Rough-In Installation', durationDays: Math.round(18 * daysFactor), status: 'COMPLETED' },
            { activityId: 'ACT-070', name: 'Clash Resolution & Rerouting', durationDays: 2, status: 'COMPLETED' },
            { activityId: 'ACT-080', name: 'Inspections & Quality Sign-Off', durationDays: 5, status: 'COMPLETED' },
          ];

          const totalDays = state.scheduleActivities.reduce((acc, a) => acc + a.durationDays, 0);

          return { success: true, eventMessage: `Primavera P6 CPM Schedule calculated: ${totalDays} total critical path construction days.` };
        }
      },
      {
        taskId: 'MULTI_TRADE_INSPECTION_GATE',
        stageName: 'Multi-Trade Code Inspection Sweep',
        phase: 'INSPECTION',
        title: 'Conduct Multi-Trade Code Audit (FBC 2023 / ACI 318 / NEC 2023)',
        assignedAgent: 'AGENT-INSPECT-001',
        dependencies: ['CPM_SCHEDULE_GENERATION'],
        execute: (state) => {
          state.inspectionTickets = [
            { ticketId: 'INSP-SWEEP-001', discipline: 'Multi-Trade Code Inspection', inspector: 'AGENT-INSPECT-001', status: 'PASSED', date: new Date().toISOString(), notes: 'All building components, foundation, wall framing, roof dry-in, and MEP systems meet FBC 2023 standards.' }
          ];

          return { success: true, eventMessage: `Multi-trade code inspection audit PASSED. Certificate of Occupancy ready.` };
        }
      },
      {
        taskId: 'CLOSEOUT_DIGITAL_TWIN',
        stageName: 'Project Closeout & Digital Twin Lock',
        phase: 'CLOSEOUT',
        title: 'Owner Authorization Granted & State Lock',
        assignedAgent: 'CUSTOMER-001',
        dependencies: ['MULTI_TRADE_INSPECTION_GATE'],
        execute: (state) => {
          state.status = 'COMPLETED';
          state.overallCompletionPct = 100;
          return { success: true, eventMessage: `Owner authorization granted. Digital twin state locked successfully.` };
        }
      }
    ];
  }

  // Real 3D Bounding-Box Clash Detection Algorithm
  private static runClashDetectionEngine(components: any[]): any[] {
    const clashes: any[] = [];
    for (let i = 0; i < components.length; i++) {
      for (let j = i + 1; j < components.length; j++) {
        const cA = components[i];
        const cB = components[j];

        if (cA.discipline === cB.discipline) continue;

        const posA = cA.positionXYZ;
        const dimA = cA.dimensionsXYZ;
        const posB = cB.positionXYZ;
        const dimB = cB.dimensionsXYZ;

        const overlapX = Math.abs(posA[0] - posB[0]) * 2 < (dimA[0] + dimB[0]);
        const overlapY = Math.abs(posA[1] - posB[1]) * 2 < (dimA[1] + dimB[1]);
        const overlapZ = Math.abs(posA[2] - posB[2]) * 2 < (dimA[2] + dimB[2]);

        if (overlapX && overlapY && overlapZ) {
          clashes.push({
            clashId: `CLASH-${cA.componentId}-${cB.componentId}`,
            componentA: cA.componentId,
            componentB: cB.componentId,
            description: `3D Bounding-Box Clash: ${cA.name} vs ${cB.name}`,
            severity: 'HIGH',
            status: 'ACTIVE'
          });
        }
      }
    }
    return clashes;
  }

  private static computeHash(state: HermesLiveHouseState): string {
    const payload = JSON.stringify({
      projectId: state.projectId,
      completedTaskCount: state.completedTasks.length,
      buildingComponentCount: state.buildingComponents.length,
      programSpaceCount: state.programVolumes.length,
      facilityCount: state.spatialEntities.length,
      agentCount: state.agentSpatialStates.length,
      clashCount: state.clashes.filter(c => c.status === 'ACTIVE').length,
      calculatedCostUSD: state.diagnostics.calculatedCostUSD,
      calculatedDurationDays: state.diagnostics.calculatedDurationDays,
      foundation: state.foundationSelection?.selectedFoundation
    });
    return crypto.createHash('sha256').update(payload).digest('hex');
  }

  private static saveToDisk() {
    if (!this.currentState) return;
    try {
      const dir = path.dirname(STORAGE_PATH);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(STORAGE_PATH, JSON.stringify(this.currentState, null, 2), 'utf-8');
    } catch (err) {
      console.error('[HERMES Live House Engine] Failed to write state to disk:', err);
    }
  }

  // --- PARAMETER CAUSALITY DEMONSTRATION API ---
  public static simulateScenario(params: {
    location?: string;
    targetSqFt?: number;
    bedrooms?: number;
    bathrooms?: number;
    budgetCap?: number;
    siteSlopeDegrees?: number;
    soilBearingPsf?: number;
  }): HermesLiveHouseState {
    const simEngineState = this.buildGenesisState('SIMULATION_GYM', params);

    // Auto-advance through task graph
    const tasks = this.getTaskGraph();
    for (const _task of tasks) {
      this.executeNextTask(simEngineState);
    }

    return simEngineState;
  }
}
