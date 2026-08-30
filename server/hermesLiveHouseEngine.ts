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
  projectId: 'HERMES-LIVE-HOUSE-001';
  projectName: 'HERMES Tampa Bay Clean-World Residence';
  attemptId: string;
  currentCheckpoint: number; // 0 to 30
  currentPhase: string;
  currentTask: string;
  activeAgents: string[];
  nextTask: string;
  overallCompletionPct: number;
  projectParams: {
    location: string;
    jurisdiction: string;
    targetSqFt: number;
    bedrooms: number;
    bathrooms: number;
    budgetCap: number;
    windRatingMph: number;
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
  diagnostics: {
    checkpoint: number;
    checkpointName: string;
    autorun: boolean;
    facilityCount: number;
    agentCount: number;
    programSpaceCount: number;
    buildingComponentCount: number;
    clashCount: number;
    worldStateHash: string;
    sceneSignature: string;
    ownerAuthorizationStatus: string;
  };
}

const STORAGE_PATH = path.join(process.cwd(), 'data', 'hermesLiveHouseState.json');

// Master Checkpoint Metadata (0 to 30)
const CHECKPOINT_META: { [cp: number]: { name: string; phase: string; task: string; nextTask: string; activeAgents: string[]; completionPct: number } } = {
  0: { name: 'CHECKPOINT 0 — WORLD GENESIS', phase: 'INITIALIZATION', task: 'Initialize Clean Campus & Station Workforce', nextTask: 'Greet Customer Actor', activeAgents: ['HERMES_PRIME'], completionPct: 0 },
  1: { name: 'CHECKPOINT 1 — CUSTOMER INTAKE STARTED', phase: 'INTAKE', task: 'Customer Arrives at Campus Gate', nextTask: 'Collect Project Parameters', activeAgents: ['CUSTOMER-001', 'HERMES_PRIME'], completionPct: 3 },
  2: { name: 'CHECKPOINT 2 — CUSTOMER BRIEF SUBMITTED', phase: 'INTAKE', task: 'Register 2,400 sq ft Brief & $425k Budget', nextTask: 'Resolve Site & Jurisdiction', activeAgents: ['CUSTOMER-001', 'HERMES_PRIME'], completionPct: 6 },
  3: { name: 'CHECKPOINT 3 — LOCATION & JURISDICTION RESOLVED', phase: 'FEASIBILITY', task: 'Lock Tampa Bay Site & FBC 2023 Rules', nextTask: 'Generate In-World Requirements Board', activeAgents: ['AGENT-CIVIL-001', 'HERMES_PRIME'], completionPct: 10 },
  4: { name: 'CHECKPOINT 4 — REQUIREMENTS BOARD GENERATED', phase: 'FEASIBILITY', task: 'Instantiate In-World Requirements Display', nextTask: 'Deploy Site Survey Team', activeAgents: ['PROJECT-PRIME'], completionPct: 13 },
  5: { name: 'CHECKPOINT 5 — SITE SURVEY STARTED', phase: 'SURVEY', task: 'Deploy Leica TS16 Total Station & RTK Rover', nextTask: 'Set Survey Control Marks', activeAgents: ['AGENT-SURVEY-001'], completionPct: 16 },
  6: { name: 'CHECKPOINT 6 — SURVEY CONTROL MARKS CREATED', phase: 'SURVEY', task: 'Establish 5 Boundary Control Stakes', nextTask: 'Deploy Geotechnical Investigation', activeAgents: ['AGENT-SURVEY-001'], completionPct: 20 },
  7: { name: 'CHECKPOINT 7 — GEOTECHNICAL INVESTIGATION', phase: 'GEOTECH', task: 'Execute SPT Soil Boring #1 (2,200 PSF)', nextTask: 'Compute 3D Buildable Envelope', activeAgents: ['AGENT-GEOTECH-001'], completionPct: 23 },
  8: { name: 'CHECKPOINT 8 — BUILDABLE ENVELOPE COMPUTED', phase: 'DESIGN', task: 'Render Translucent 3D Envelope Overlay', nextTask: 'Synthesize Architectural Program', activeAgents: ['AGENT-CIVIL-001'], completionPct: 26 },
  9: { name: 'CHECKPOINT 9 — ARCHITECTURAL PROGRAMMING', task: 'Generate 14 Program Room Volumes', phase: 'DESIGN', nextTask: 'Solve Space Planning Adjacencies', activeAgents: ['AGENT-ARCH-001'], completionPct: 30 },
  10: { name: 'CHECKPOINT 10 — SPACE PLANNING SOLVER', phase: 'DESIGN', task: 'Optimize Room Orientations & Setbacks', nextTask: 'Solve Building Footprint & Slab', activeAgents: ['AGENT-ARCH-001'], completionPct: 33 },
  11: { name: 'CHECKPOINT 11 — FOOTPRINT & SLAB SOLVED', phase: 'DESIGN', task: 'Lock 2,400 sq ft Monolithic Slab Boundary', nextTask: 'Convert Volumes to Wall Layouts', activeAgents: ['AGENT-STRUCT-001'], completionPct: 36 },
  12: { name: 'CHECKPOINT 12 — ARCHITECTURE CONVERSION', phase: 'DESIGN', task: 'Generate Exterior & Interior Walls', nextTask: 'Order Materials & Stage Laydown Yard', activeAgents: ['AGENT-ARCH-001'], completionPct: 40 },
  13: { name: 'CHECKPOINT 13 — MATERIAL DELIVERY & STAGING', phase: 'LOGISTICS', task: 'Stage 4 Material Pallets in Laydown Yard', nextTask: 'Prepare Pad & Excavate', activeAgents: ['AGENT-LOGISTICS-001'], completionPct: 43 },
  14: { name: 'CHECKPOINT 14 — EXCAVATION & SITE GRADING', phase: 'CIVIL', task: 'Grade Pad & Compact Foundation Base', nextTask: 'Pour Monolithic Slab Foundation', activeAgents: ['AGENT-CIVIL-001'], completionPct: 46 },
  15: { name: 'CHECKPOINT 15 — FOUNDATION POUR', phase: 'CONSTRUCTION', task: 'Pour 2,400 sq ft Post-Tension Concrete Slab', nextTask: 'Erect Exterior Timber Wall Framing', activeAgents: ['AGENT-STRUCT-001'], completionPct: 50 },
  16: { name: 'CHECKPOINT 16 — EXTERIOR WALL FRAMING', phase: 'CONSTRUCTION', task: 'Erect 4 160mph Timber Exterior Wall Assemblies', nextTask: 'Frame Interior Partition Walls', activeAgents: ['AGENT-FRAMING-001'], completionPct: 53 },
  17: { name: 'CHECKPOINT 17 — INTERIOR PARTITIONS', phase: 'CONSTRUCTION', task: 'Frame Interior Partition Walls for 14 Rooms', nextTask: 'Install Roof Trusses & Deck', activeAgents: ['AGENT-FRAMING-001'], completionPct: 56 },
  18: { name: 'CHECKPOINT 18 — ROOF TRUSS & SHEATHING', phase: 'CONSTRUCTION', task: 'Install Timber Trusses & Galvalume Metal Deck', nextTask: 'Dry-In Windows & Exterior Doors', activeAgents: ['AGENT-STRUCT-001'], completionPct: 60 },
  19: { name: 'CHECKPOINT 19 — DRY-IN MILESTONE', phase: 'CONSTRUCTION', task: 'Install Windows & Impact Exterior Doors', nextTask: 'Install Plumbing Rough-In', activeAgents: ['AGENT-ARCH-001'], completionPct: 63 },
  20: { name: 'CHECKPOINT 20 — PLUMBING ROUGH-IN', phase: 'MEP', task: 'Install Main Water Subpanel & PEX Runs', nextTask: 'Install Electrical Panel & Circuits', activeAgents: ['AGENT-PLUMBING-001'], completionPct: 66 },
  21: { name: 'CHECKPOINT 21 — ELECTRICAL ROUGH-IN', phase: 'MEP', task: 'Install 200A Breaker Panel & Branch Circuits', nextTask: 'Install HVAC Compressor & Ductwork', activeAgents: ['AGENT-ELEC-001'], completionPct: 70 },
  22: { name: 'CHECKPOINT 22 — HVAC ROUGH-IN', phase: 'MEP', task: 'Install 4-Ton Heat Pump & Supply Ductwork', nextTask: 'Run Spatial Clash Detection', activeAgents: ['AGENT-HVAC-001'], completionPct: 73 },
  23: { name: 'CHECKPOINT 23 — CLASH DETECTED', phase: 'COORDINATION', task: 'Identify Plumbing Run vs Timber Stud Conflict', nextTask: 'Execute Autonomous Pipe Rerouting', activeAgents: ['AGENT-PLUMBING-001', 'AGENT-STRUCT-001'], completionPct: 76 },
  24: { name: 'CHECKPOINT 24 — AUTONOMOUS CLASH REPAIR', phase: 'COORDINATION', task: 'Reroute PEX Plumbing Line Around Studs', nextTask: 'Extract Quantity Takeoffs', activeAgents: ['AGENT-PLUMBING-001'], completionPct: 80 },
  25: { name: 'CHECKPOINT 25 — QUANTITY TAKEOFF', phase: 'ESTIMATING', task: 'Extract Quantities for All 17 Components', nextTask: 'Compile Bill of Materials', activeAgents: ['AGENT-ESTIMATING-001'], completionPct: 83 },
  26: { name: 'CHECKPOINT 26 — BILL OF MATERIALS', phase: 'ESTIMATING', task: 'Compile Itemized 8-Category BOM ($388,200)', nextTask: 'Verify Cost vs Budget Cap', activeAgents: ['AGENT-ESTIMATING-001'], completionPct: 86 },
  27: { name: 'CHECKPOINT 27 — COST ESTIMATE & BUDGET VERIFICATION', phase: 'ESTIMATING', task: 'Verify $388.2k Cost vs $425k Budget (8.6% Under)', nextTask: 'Generate Primavera P6 CPM Schedule', activeAgents: ['AGENT-ESTIMATING-001'], completionPct: 90 },
  28: { name: 'CHECKPOINT 28 — SCHEDULE & CPM', phase: 'SCHEDULING', task: 'Generate 14-Stage 138-Day CPM Schedule', nextTask: 'Execute Multi-Trade Quality Inspection', activeAgents: ['AGENT-SCHEDULING-001'], completionPct: 93 },
  29: { name: 'CHECKPOINT 29 — QUALITY & SAFETY INSPECTION', phase: 'INSPECTION', task: 'Conduct Multi-Trade Inspection Audit (PASSED)', nextTask: 'Finalize Digital Twin & Owner Authorization', activeAgents: ['AGENT-INSPECT-001'], completionPct: 96 },
  30: { name: 'CHECKPOINT 30 — FINAL DIGITAL TWIN', phase: 'CLOSEOUT', task: 'Owner Authorization Granted & State Lock', nextTask: 'Project Complete — Digital Twin Active', activeAgents: ['CUSTOMER-001', 'HERMES_PRIME'], completionPct: 100 },
};

export class HermesLiveHouseEngine {
  private static currentState: HermesLiveHouseState | null = null;

  public static initialize(): HermesLiveHouseState {
    if (this.currentState) {
      return this.currentState;
    }

    if (fs.existsSync(STORAGE_PATH)) {
      try {
        const raw = fs.readFileSync(STORAGE_PATH, 'utf-8');
        this.currentState = JSON.parse(raw);
        console.log(`[HERMES Live House] Loaded existing state from disk. Checkpoint: ${this.currentState?.currentCheckpoint}`);
        return this.currentState!;
      } catch (err) {
        console.warn('[HERMES Live House] Failed to parse state file, re-initializing genesis state.');
      }
    }

    this.currentState = this.buildInitialState();
    this.saveToDisk();
    return this.currentState;
  }

  private static buildInitialState(): HermesLiveHouseState {
    const attemptId = `ATTEMPT-${Date.now()}`;
    const timestamp = new Date().toISOString();

    // 17 Operations Facilities
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

    // 68 Workforce Agents + Customer Actor
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

    // Populate remaining agents up to 69 total
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
        message: 'Clean HERMES site environment initialized. 0 house components present. 69 agents stationed.',
        siteLocation: 'Tampa Bay Coastal Corridor, Florida',
        jurisdiction: 'Florida Building Code 8th Edition (2023)'
      },
      visualIntent: {
        cameraHint: 'OVERVIEW_SITE',
        emphasis: 'WORLD_GENESIS'
      }
    };

    const initialMeta = CHECKPOINT_META[0];

    const state: HermesLiveHouseState = {
      projectId: 'HERMES-LIVE-HOUSE-001',
      projectName: 'HERMES Tampa Bay Clean-World Residence',
      attemptId,
      currentCheckpoint: 0,
      currentPhase: initialMeta.phase,
      currentTask: initialMeta.task,
      activeAgents: initialMeta.activeAgents,
      nextTask: initialMeta.nextTask,
      overallCompletionPct: initialMeta.completionPct,
      projectParams: {
        location: 'Tampa Bay Coastal Corridor, FL',
        jurisdiction: 'City of Tampa / FBC 2023',
        targetSqFt: 2400,
        bedrooms: 3,
        bathrooms: 2,
        budgetCap: 425000,
        windRatingMph: 160
      },
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
      diagnostics: {
        checkpoint: 0,
        checkpointName: initialMeta.name,
        autorun: false,
        facilityCount: spatialEntities.length,
        agentCount: agentSpatialStates.length,
        programSpaceCount: 0,
        buildingComponentCount: 0,
        clashCount: 0,
        worldStateHash: '',
        sceneSignature: 'SCENE_SIGNATURE_CHECKPOINT_0',
        ownerAuthorizationStatus: 'PENDING_INTAKE'
      }
    };

    state.diagnostics.worldStateHash = this.computeHash(state);
    return state;
  }

  public static getCanonicalWorldState(): HermesLiveHouseState {
    return this.initialize();
  }

  public static advanceToStep(targetStep: number): HermesLiveHouseState {
    const state = this.initialize();
    const step = Math.max(0, Math.min(30, targetStep));

    state.currentCheckpoint = step;
    const meta = CHECKPOINT_META[step] || CHECKPOINT_META[30];
    state.currentPhase = meta.phase;
    state.currentTask = meta.task;
    state.activeAgents = meta.activeAgents;
    state.nextTask = meta.nextTask;
    state.overallCompletionPct = meta.completionPct;

    // Mutate state entities according to current checkpoint
    this.applyCheckpointMutations(state, step);

    // Append World Event
    state.eventSequence += 1;
    const newEvent: HermesWorldEvent = {
      eventId: `EVT-CHECKPOINT-${step.toString().padStart(3, '0')}`,
      projectId: 'HERMES-LIVE-HOUSE-001',
      traceId: `TRACE-STEP-${step}-${Date.now()}`,
      timestamp: new Date().toISOString(),
      sequence: state.eventSequence,
      eventType: `CHECKPOINT_${step}_${meta.phase}_MUTATION`,
      actor: { agentId: meta.activeAgents[0] || 'HERMES_PRIME' },
      entitiesAffected: state.buildingComponents.map(c => c.componentId),
      payload: {
        checkpoint: step,
        checkpointName: meta.name,
        phase: meta.phase,
        task: meta.task,
        completionPct: meta.completionPct
      },
      visualIntent: {
        focusEntityIds: state.buildingComponents.slice(-2).map(c => c.componentId),
        cameraHint: step < 8 ? 'SITE_OVERVIEW' : step < 15 ? 'FOOTPRINT_FOCUS' : 'BUILDING_FOCUS',
        emphasis: meta.phase
      }
    };
    state.events.push(newEvent);

    state.diagnostics = {
      checkpoint: step,
      checkpointName: meta.name,
      autorun: step === 30,
      facilityCount: state.spatialEntities.length,
      agentCount: state.agentSpatialStates.length,
      programSpaceCount: state.programVolumes.length,
      buildingComponentCount: state.buildingComponents.length,
      clashCount: state.clashes.filter(c => c.status === 'ACTIVE').length,
      worldStateHash: '',
      sceneSignature: `SCENE_SIGNATURE_CHECKPOINT_${step}`,
      ownerAuthorizationStatus: step >= 30 ? 'GRANTED_FINAL_TWIN' : step >= 2 ? 'ACTIVE_INTAKE' : 'PENDING_INTAKE'
    };
    state.diagnostics.worldStateHash = this.computeHash(state);

    this.saveToDisk();
    return state;
  }

  public static advanceOneStep(): HermesLiveHouseState {
    const state = this.initialize();
    return this.advanceToStep(state.currentCheckpoint + 1);
  }

  public static resetToGenesis(): HermesLiveHouseState {
    this.currentState = this.buildInitialState();
    this.saveToDisk();
    return this.currentState;
  }

  private static applyCheckpointMutations(state: HermesLiveHouseState, step: number) {
    // 1. Customer position
    const cust = state.agentSpatialStates.find(a => a.agentId === 'CUSTOMER-001');
    if (cust) {
      cust.worldPosition = step < 2 ? [-35.0, 0.0, 25.0] : step < 4 ? [-28.0, 0.0, 0.0] : [-20.0, 0.0, 10.0];
    }

    // 2. Requirements Board (Checkpoints 4+)
    if (step >= 4) {
      state.requirementRecords = [
        { recordId: 'REQ-001', category: 'Project Scope', parameter: 'Target Area', value: '2,400 sq ft (223 m²)', status: 'APPROVED' },
        { recordId: 'REQ-002', category: 'Budget Cap', parameter: 'Turnkey Maximum', value: '$425,000 USD', status: 'APPROVED' },
        { recordId: 'REQ-003', category: 'Building Code', parameter: 'Jurisdiction', value: 'Florida Building Code 2023 (160 mph)', status: 'APPROVED' },
        { recordId: 'REQ-004', category: 'Program', parameter: 'Bedrooms / Baths', value: '3 Bedrooms / 2 Bathrooms + Office', status: 'APPROVED' },
        { recordId: 'REQ-005', category: 'Foundation', parameter: 'Type', value: 'Monolithic Post-Tensioned Concrete Slab', status: 'APPROVED' },
      ];
    } else {
      state.requirementRecords = [];
    }

    // 3. Survey Marks (Checkpoints 6+)
    if (step >= 6) {
      state.surveyMarks = [
        { markId: 'SURVEY-STAKE-01', label: 'North-East Property Corner Stake', elevationFt: 12.5, position: [11.0, 0.4, -15.0] },
        { markId: 'SURVEY-STAKE-02', label: 'North-West Property Corner Stake', elevationFt: 12.4, position: [-11.0, 0.4, -15.0] },
        { markId: 'SURVEY-STAKE-03', label: 'South-East Property Corner Stake', elevationFt: 12.2, position: [11.0, 0.4, 15.0] },
        { markId: 'SURVEY-STAKE-04', label: 'South-West Property Corner Stake', elevationFt: 12.3, position: [-11.0, 0.4, 15.0] },
        { markId: 'SURVEY-STAKE-05', label: 'Site Benchmark Datum (0.00m)', elevationFt: 12.5, position: [0.0, 0.4, -20.0] },
      ];
    } else {
      state.surveyMarks = [];
    }

    // 4. Geotech Boring (Checkpoints 7+)
    if (step >= 7) {
      state.boringSamples = [
        { sampleId: 'SPT-001', depthFt: 15.0, soilClass: 'Medium Dense Fine Sand over Stiff Clay', bearingCapacityPsf: 2200, groundwaterTableFt: 4.5, recommendation: 'Monolithic Post-Tensioned Slab' }
      ];
    } else {
      state.boringSamples = [];
    }

    // 5. Buildable Envelope (Checkpoints 8+)
    if (step >= 8) {
      state.buildableEnvelope = {
        envelopeId: 'ENVELOPE-V6-001',
        dimensionsXYZ: [22.0, 9.0, 30.0],
        positionXYZ: [0.0, 4.5, 0.0],
        maxFootprintSqFt: 5200,
        setbackFrontFt: 15,
        setbackSidesFt: 10
      };
    } else {
      delete state.buildableEnvelope;
    }

    // 6. 14 Program Volumes (Checkpoints 9+)
    if (step >= 9) {
      state.programVolumes = [
        { roomId: 'ROOM-GREAT-ROOM', name: 'Great Room & Living Lounge', areaSqFt: 520, dimensionsXYZ: [7.5, 3.2, 6.5], positionXYZ: [-3.75, 1.6, -2.25] },
        { roomId: 'ROOM-PRIMARY-SUITE', name: 'Primary Bedroom Suite', areaSqFt: 340, dimensionsXYZ: [5.5, 3.0, 5.8], positionXYZ: [4.75, 1.5, -4.0] },
        { roomId: 'ROOM-PRIMARY-BATH', name: 'Primary Ensuite Bathroom', areaSqFt: 150, dimensionsXYZ: [3.8, 2.8, 3.7], positionXYZ: [5.6, 1.4, 1.0] },
        { roomId: 'ROOM-BEDROOM-2', name: 'Guest Bedroom 2', areaSqFt: 180, dimensionsXYZ: [4.2, 2.8, 4.0], positionXYZ: [-6.4, 1.4, 4.0] },
        { roomId: 'ROOM-BEDROOM-3', name: 'Guest Bedroom 3', areaSqFt: 170, dimensionsXYZ: [4.0, 2.8, 3.9], positionXYZ: [-2.0, 1.4, 4.0] },
        { roomId: 'ROOM-GUEST-BATH', name: 'Shared Hall Bathroom', areaSqFt: 90, dimensionsXYZ: [2.8, 2.8, 3.0], positionXYZ: [1.8, 1.4, 3.5] },
        { roomId: 'ROOM-KITCHEN', name: 'Gourmet Kitchen & Island', areaSqFt: 220, dimensionsXYZ: [4.8, 3.0, 4.3], positionXYZ: [-3.8, 1.5, -7.5] },
        { roomId: 'ROOM-DINING', name: 'Dining Area', areaSqFt: 160, dimensionsXYZ: [4.0, 3.0, 3.7], positionXYZ: [1.5, 1.5, -7.5] },
        { roomId: 'ROOM-OFFICE', name: 'Dedicated Home Office', areaSqFt: 140, dimensionsXYZ: [3.6, 2.8, 3.6], positionXYZ: [-7.0, 1.4, -8.0] },
        { roomId: 'ROOM-PANTRY', name: 'Walk-in Pantry', areaSqFt: 50, dimensionsXYZ: [1.8, 2.6, 2.6], positionXYZ: [-6.8, 1.3, -5.0] },
        { roomId: 'ROOM-UTILITY-MEP', name: 'MEP Electrical & Utility Room', areaSqFt: 80, dimensionsXYZ: [2.5, 2.8, 3.0], positionXYZ: [7.2, 1.4, 4.5] },
        { roomId: 'ROOM-LAUNDRY', name: 'Laundry Room', areaSqFt: 70, dimensionsXYZ: [2.2, 2.6, 3.0], positionXYZ: [4.5, 1.3, 4.5] },
        { roomId: 'ROOM-FOYER', name: 'Main Entry Foyer', areaSqFt: 80, dimensionsXYZ: [2.5, 3.0, 3.0], positionXYZ: [-0.5, 1.5, -10.0] },
        { roomId: 'ROOM-LANAI', name: 'Covered Rear Outdoor Lanai', areaSqFt: 200, dimensionsXYZ: [6.5, 3.0, 3.0], positionXYZ: [-1.0, 1.5, 8.0] },
      ];
    } else {
      state.programVolumes = [];
    }

    // 7. Materials Staged (Checkpoints 13+)
    if (step >= 13) {
      state.materialsOnsite = [
        { materialId: 'MAT-CONCRETE-PALLET', name: '4000 PSI Post-Tension Ready Mix Batch', category: 'Concrete', status: 'STAGED', positionXYZ: [18.0, 0.0, -12.0], dimensionsXYZ: [2.0, 1.2, 2.0] },
        { materialId: 'MAT-TIMBER-PALLET-01', name: 'SYP #2 2x6 Framing Lumber Stack', category: 'Timber', status: 'STAGED', positionXYZ: [22.0, 0.0, -12.0], dimensionsXYZ: [3.5, 1.5, 1.8] },
        { materialId: 'MAT-ROOFING-PALLET', name: 'Galvalume Standing Seam Metal Sheets', category: 'Roofing', status: 'STAGED', positionXYZ: [18.0, 0.0, -8.0], dimensionsXYZ: [4.0, 0.8, 1.5] },
        { materialId: 'MAT-MEP-PALLET', name: 'PEX Tubing Reels & Electrical Conduit Pack', category: 'MEP', status: 'STAGED', positionXYZ: [22.0, 0.0, -8.0], dimensionsXYZ: [2.0, 1.5, 1.5] },
      ];
    } else {
      state.materialsOnsite = [];
    }

    // 8. Building Components (Checkpoints 15+)
    const components: any[] = [];
    if (step >= 15) {
      components.push({
        componentId: 'COMP-SLAB-01',
        name: 'Monolithic Post-Tensioned Concrete Slab (2,400 sq ft / 223 m²)',
        category: 'Foundation',
        discipline: 'Civil/Structural',
        ifcType: 'IfcSlab',
        positionXYZ: [-0.5, -0.15, -1.0],
        dimensionsXYZ: [17.5, 0.3, 15.0],
        material: '4000 PSI Concrete + Post-Tension Steel',
        installationPhase: 'FOUNDATION',
        inspectionStatus: 'PASSED'
      });
    }

    if (step >= 16) {
      components.push(
        { componentId: 'COMP-WALL-EXT-NORTH', name: 'North Exterior Timber Wall Assembly (160mph Rated)', category: 'Framing', discipline: 'Structural', ifcType: 'IfcWall', positionXYZ: [-0.5, 1.5, -8.5], dimensionsXYZ: [17.5, 3.0, 0.2], material: 'SYP #2 2x6 Framing', installationPhase: 'SUPERSTRUCTURE', inspectionStatus: 'PASSED' },
        { componentId: 'COMP-WALL-EXT-SOUTH', name: 'South Exterior Timber Wall Assembly (160mph Rated)', category: 'Framing', discipline: 'Structural', ifcType: 'IfcWall', positionXYZ: [-0.5, 1.5, 6.5], dimensionsXYZ: [17.5, 3.0, 0.2], material: 'SYP #2 2x6 Framing', installationPhase: 'SUPERSTRUCTURE', inspectionStatus: 'PASSED' },
        { componentId: 'COMP-WALL-EXT-EAST', name: 'East Exterior Timber Wall Assembly', category: 'Framing', discipline: 'Structural', ifcType: 'IfcWall', positionXYZ: [8.25, 1.5, -1.0], dimensionsXYZ: [0.2, 3.0, 15.0], material: 'SYP #2 2x6 Framing', installationPhase: 'SUPERSTRUCTURE', inspectionStatus: 'PASSED' },
        { componentId: 'COMP-WALL-EXT-WEST', name: 'West Exterior Timber Wall Assembly', category: 'Framing', discipline: 'Structural', ifcType: 'IfcWall', positionXYZ: [-9.25, 1.5, -1.0], dimensionsXYZ: [0.2, 3.0, 15.0], material: 'SYP #2 2x6 Framing', installationPhase: 'SUPERSTRUCTURE', inspectionStatus: 'PASSED' }
      );
    }

    if (step >= 17) {
      components.push(
        { componentId: 'COMP-WALL-INT-PRIMARY', name: 'Primary Suite Interior Partition Wall', category: 'Framing', discipline: 'Architecture', ifcType: 'IfcWall', positionXYZ: [2.0, 1.4, -4.0], dimensionsXYZ: [0.15, 2.8, 5.8], material: '2x4 Wood Stud + Gypsum', installationPhase: 'SUPERSTRUCTURE', inspectionStatus: 'PASSED' },
        { componentId: 'COMP-WALL-INT-KITCHEN', name: 'Kitchen & Great Room Partition Spine', category: 'Framing', discipline: 'Architecture', ifcType: 'IfcWall', positionXYZ: [-3.8, 1.4, -5.3], dimensionsXYZ: [4.8, 2.8, 0.15], material: '2x4 Wood Stud + Gypsum', installationPhase: 'SUPERSTRUCTURE', inspectionStatus: 'PASSED' }
      );
    }

    if (step >= 18) {
      components.push(
        { componentId: 'COMP-ROOF-01', name: 'Engineered Timber Trusses & Galvalume Metal Roof Deck', category: 'Roofing', discipline: 'Structural', ifcType: 'IfcRoof', positionXYZ: [-0.5, 3.6, -1.0], dimensionsXYZ: [18.5, 1.2, 16.0], material: 'Galvalume Steel + Timber Trusses', installationPhase: 'SUPERSTRUCTURE', inspectionStatus: 'PASSED' }
      );
    }

    if (step >= 19) {
      components.push(
        { componentId: 'COMP-DOOR-MAIN', name: 'Impact-Resistant Main Entry Door Assembly', category: 'Openings', discipline: 'Architecture', ifcType: 'IfcDoor', positionXYZ: [-0.5, 1.2, -8.5], dimensionsXYZ: [1.2, 2.2, 0.15], material: 'Fiberglass Glass Impact Rated', installationPhase: 'DRY_IN', inspectionStatus: 'PASSED' },
        { componentId: 'COMP-WINDOW-GREATROOM', name: 'Great Room Low-E Impact Glass Window', category: 'Openings', discipline: 'Architecture', ifcType: 'IfcWindow', positionXYZ: [-4.5, 1.5, -8.5], dimensionsXYZ: [2.4, 1.5, 0.15], material: 'Low-E Impact Glass', installationPhase: 'DRY_IN', inspectionStatus: 'PASSED' }
      );
    }

    if (step >= 20) {
      // Checkpoint 23 has clash! Checkpoint 24 repairs clash.
      const pipePos: [number, number, number] = (step === 23)
        ? [-0.5, 1.5, -8.5] // Clashes directly with North Wall
        : [-0.5, 0.3, -8.2]; // Repaired / offset position

      components.push(
        { componentId: 'COMP-PLUMB-RUN-01', name: 'Main Water Distribution Trunk & DWV Stack (PEX)', category: 'Plumbing', discipline: 'Plumbing', ifcType: 'IfcFlowSegment', positionXYZ: pipePos, dimensionsXYZ: [14.0, 0.1, 0.1], material: 'PEX-A Tubing', installationPhase: 'MEP_ROUGH', inspectionStatus: step === 23 ? 'FAILED' : 'PASSED' }
      );
    }

    if (step >= 21) {
      components.push(
        { componentId: 'COMP-ELEC-PANEL-01', name: '200A Main Electrical Breaker Subpanel', category: 'Electrical', discipline: 'Electrical', ifcType: 'IfcElectricDistributionBoard', positionXYZ: [7.2, 1.5, 4.5], dimensionsXYZ: [0.6, 0.9, 0.2], material: 'NEMA 3R Enclosure', installationPhase: 'MEP_ROUGH', inspectionStatus: 'PASSED' }
      );
    }

    if (step >= 22) {
      components.push(
        { componentId: 'COMP-HVAC-HEAT-PUMP-01', name: '4-Ton High-Efficiency Heat Pump & Duct Unit', category: 'HVAC', discipline: 'HVAC', ifcType: 'IfcUnitaryEquipment', positionXYZ: [7.2, 1.2, -8.0], dimensionsXYZ: [1.2, 1.2, 1.2], material: 'Variable Speed Inverter Compressor', installationPhase: 'MEP_ROUGH', inspectionStatus: 'PASSED' }
      );
    }

    state.buildingComponents = components;

    // 9. Clashes (Checkpoints 23 vs 24)
    if (step === 23) {
      state.clashes = [
        { clashId: 'CLASH-PLUMB-STRUCT-001', componentA: 'COMP-PLUMB-RUN-01', componentB: 'COMP-WALL-EXT-NORTH', description: 'PEX Water Line intersecting exterior timber stud wall framing at North elevation', severity: 'HIGH', status: 'ACTIVE' }
      ];
    } else if (step >= 24) {
      state.clashes = [
        { clashId: 'CLASH-PLUMB-STRUCT-001', componentA: 'COMP-PLUMB-RUN-01', componentB: 'COMP-WALL-EXT-NORTH', description: 'PEX Water Line offset around stud framing', severity: 'HIGH', status: 'RESOLVED_REROUTED' }
      ];
    } else {
      state.clashes = [];
    }

    // 10. BOM Items (Checkpoints 26+)
    if (step >= 26) {
      state.bomItems = [
        { category: 'Foundation & Concrete', description: '4000 PSI Post-Tensioned Concrete & Tendons', costUSD: 42500 },
        { category: 'Structural Framing', description: 'SYP #2 2x6 Wall Studs & Engineered Trusses', costUSD: 88400 },
        { category: 'Exterior Cladding & Stucco', description: '3-Coat Stucco & Vapor Barrier', costUSD: 32000 },
        { category: 'Roofing System', description: 'Galvalume Standing Seam Roof Panels', costUSD: 29500 },
        { category: 'Windows & Doors', description: 'Low-E Impact Glass Windows & Doors', costUSD: 36200 },
        { category: 'Plumbing Systems', description: 'PEX-A Water Lines & Tankless Water Heater', costUSD: 24800 },
        { category: 'Electrical Systems', description: '200A Subpanel, Copper Wiring, LED Fixtures', costUSD: 28600 },
        { category: 'HVAC Systems', description: '4-Ton Variable Speed Heat Pump & Ducting', costUSD: 24200 },
        { category: 'Interior Finishes', description: 'Drywall, Paint, Cabinetry & Flooring', costUSD: 82000 },
      ];
    } else {
      state.bomItems = [];
    }

    // 11. Schedule CPM (Checkpoints 28+)
    if (step >= 28) {
      state.scheduleActivities = [
        { activityId: 'ACT-010', name: 'Site Survey & Soil Boring', durationDays: 5, status: 'COMPLETED' },
        { activityId: 'ACT-020', name: 'Pad Grading & Formwork', durationDays: 8, status: 'COMPLETED' },
        { activityId: 'ACT-030', name: 'Post-Tension Slab Pour', durationDays: 12, status: 'COMPLETED' },
        { activityId: 'ACT-040', name: 'Timber Wall Framing', durationDays: 14, status: 'COMPLETED' },
        { activityId: 'ACT-050', name: 'Roof Truss & Sheathing', durationDays: 10, status: 'COMPLETED' },
        { activityId: 'ACT-060', name: 'Windows & Doors Dry-In', durationDays: 7, status: 'COMPLETED' },
        { activityId: 'ACT-070', name: 'MEP Rough-In Installation', durationDays: 18, status: 'COMPLETED' },
        { activityId: 'ACT-080', name: 'Clash Resolution & Rerouting', durationDays: 2, status: 'COMPLETED' },
        { activityId: 'ACT-090', name: 'Inspections & Quality Sign-Off', durationDays: 5, status: 'COMPLETED' },
      ];
    } else {
      state.scheduleActivities = [];
    }

    // 12. Inspection Tickets (Checkpoints 29+)
    if (step >= 29) {
      state.inspectionTickets = [
        { ticketId: 'INSP-FINAL-001', discipline: 'Multi-Trade Quality & Safety', inspector: 'AGENT-INSPECT-001', status: 'PASSED', date: new Date().toISOString(), notes: 'All 17 components, slab, framing, dry-in, and MEP systems meet FBC 2023 code standards.' }
      ];
    } else {
      state.inspectionTickets = [];
    }
  }

  private static computeHash(state: HermesLiveHouseState): string {
    const payload = JSON.stringify({
      projectId: state.projectId,
      currentCheckpoint: state.currentCheckpoint,
      buildingComponentCount: state.buildingComponents.length,
      programSpaceCount: state.programVolumes.length,
      facilityCount: state.spatialEntities.length,
      agentCount: state.agentSpatialStates.length,
      clashCount: state.clashes.filter(c => c.status === 'ACTIVE').length,
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
      console.error('[HERMES Live House] Failed to save state to disk:', err);
    }
  }
}
