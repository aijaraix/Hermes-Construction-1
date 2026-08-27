import {
  CanonicalProjectStatus,
  ProjectWorldFrame,
  TruthOrigin,
  RuntimeClockState,
  RobotReadySpatialContract,
  AgentSpatialState,
  SpatialEntityRecord,
  AgentCommunicationRecord,
  RequirementQuestionRecord,
  CustomerInteractionRecord,
  RequirementDecisionRecord,
  PrimeDecisionRecord,
  DetailedAgentState
} from '../src/types/hermes.js';

export interface CanonicalAgentProfile {
  agentId: string;
  canonicalRoleId: string;
  roleName: string;
  discipline: string;
  managerId: string;
  competencyProfile: {
    competencyScore: number;
    coveragePct: number;
    certifiedDomain: string;
  };
  globalRuntimeState: DetailedAgentState;
  projectAssignmentState: 'UNASSIGNED' | 'PROJECT_PRESENT';
}

export interface WorkforceHUDDisciplineSummary {
  discipline: string;
  total: number;
  home: number;
  available: number;
  meeting: number;
  assigned: number;
  traveling: number;
  working: number;
  learning: number;
  inspecting: number;
  blocked: number;
}

export interface WorkforceHUDSummary {
  total: number;
  home: number;
  available: number;
  meeting: number;
  assigned: number;
  traveling: number;
  working: number;
  learning: number;
  inspecting: number;
  blocked: number;
  disciplines: Record<string, WorkforceHUDDisciplineSummary>;
}

export interface Phase2ValidationState {
  projectId: string;
  projectName: string;
  buildingType: string;
  status: CanonicalProjectStatus;
  classification: 'GENESIS_LIVE';
  createdAt: string;
  worldFrame: ProjectWorldFrame;
  clock: RuntimeClockState;
  events: any[];
  bimComponents: any[];
  materials: any[];
  surveyMarks: any[];
  spatialEntities: SpatialEntityRecord[];
  activeTasks: any[];
  inspections: any[];
  knowledgeRequests: any[];
  communicationEvents: AgentCommunicationRecord[];
  robotContracts: RobotReadySpatialContract[];
  workforceAssignment: {
    totalAgents: number;
    assignedAgents: number;
    availableAgents: number;
  };
  canonicalRoster: CanonicalAgentProfile[];
  agentSpatialStates: Record<string, AgentSpatialState>;
  requirementQuestions: RequirementQuestionRecord[];
  customerInteractions: CustomerInteractionRecord[];
  requirementDecisions: RequirementDecisionRecord[];
  primeDecisions: PrimeDecisionRecord[];
  customerActor: {
    actorId: string;
    name: string;
    truthOrigin: TruthOrigin;
    worldPosition: [number, number, number];
    currentState: DetailedAgentState;
  };
}

export class Phase2ValidationEngine {
  private static instanceState: Phase2ValidationState | null = null;
  private static initialized = false;

  public static initialize(): Phase2ValidationState {
    if (this.initialized && this.instanceState) {
      return this.instanceState;
    }
    this.initialized = true;

    const projectId = 'LIVE-WORLD-PHASE2-VALIDATION-001';
    const nowISO = new Date().toISOString();
    const nowMs = Date.now();

    const worldFrame: ProjectWorldFrame = {
      projectWorldFrameId: `FRAME-${projectId}-ROOT`,
      projectId,
      surveyOrigin: [27.9506, -82.4572, 0],
      groundDatum: 0.000,
      coordinateReference: 'UTM Zone 17N / LOCAL METRIC WORLD FRAME',
      lengthUnit: 'METERS',
      rotationUnit: 'QUATERNION',
      timeReference: nowISO
    };

    const clock: RuntimeClockState = {
      mode: 'LIVE',
      realTimeMs: nowMs,
      simulationTimeMs: nowMs,
      replayTimeMs: nowMs,
      timeScale: 1.0,
      currentEventIndex: 0,
      totalEvents: 17
    };

    // 1. Build Canonical 68-Agent Workforce Roster
    const canonicalRoster = this.buildCanonicalRoster();

    // 2. Build 18 Spatial Operations Campus Facilities
    const campusFacilities = this.buildOperationsCampus(projectId, nowISO);

    // 3. Build Initial Workforce Spatial States & Facilities occupants
    const { agentSpatialStates, agentEntities } = this.buildWorkforceSpatialStates(projectId, canonicalRoster, nowISO);

    // 4. Build Customer Actor
    const customerActor = {
      actorId: 'MOCK-CUSTOMER-PHASE2-001',
      name: 'Owner / Mock Customer (Phase 2)',
      truthOrigin: 'SIMULATED' as TruthOrigin,
      worldPosition: [-18.0, 0.0, 18.0] as [number, number, number],
      currentState: 'MEETING' as DetailedAgentState
    };

    // 5. Build Event Stream & Interactions (Stages 3-5 Scenario)
    const {
      events,
      communicationEvents,
      requirementQuestions,
      customerInteractions,
      requirementDecisions,
      primeDecisions
    } = this.buildScenarioLedger(projectId, nowISO);

    const allSpatialEntities = [...campusFacilities, ...agentEntities];

    const state: Phase2ValidationState = {
      projectId,
      projectName: 'LIVE-WORLD-PHASE2-VALIDATION-001 (Live Phase 2 Organizational World)',
      buildingType: 'Single-Family Residence (Phase 2 Intake)',
      status: 'NEW',
      classification: 'GENESIS_LIVE',
      createdAt: nowISO,
      worldFrame,
      clock,
      events,
      bimComponents: [], // CRITICAL: 0 BIM components
      materials: [], // CRITICAL: 0 materials
      surveyMarks: [],
      spatialEntities: allSpatialEntities,
      activeTasks: [],
      inspections: [],
      knowledgeRequests: [],
      communicationEvents,
      robotContracts: [],
      workforceAssignment: {
        totalAgents: 68,
        assignedAgents: 6,
        availableAgents: 62
      },
      canonicalRoster,
      agentSpatialStates,
      requirementQuestions,
      customerInteractions,
      requirementDecisions,
      primeDecisions,
      customerActor
    };

    this.instanceState = state;
    return state;
  }

  public static getProject(projectId: string): Phase2ValidationState | undefined {
    this.initialize();
    if (projectId === 'LIVE-WORLD-PHASE2-VALIDATION-001' || projectId === 'PHASE2-VALIDATION') {
      return this.instanceState || undefined;
    }
    return undefined;
  }

  /**
   * Builds the 68 Canonical HERMES Workforce Roster
   */
  private static buildCanonicalRoster(): CanonicalAgentProfile[] {
    const roster: CanonicalAgentProfile[] = [];

    // Executive & Management (8)
    roster.push(
      { agentId: 'AGENT-PRIME-ORCHESTRATOR', canonicalRoleId: 'HERMES-PRIME-ORCHESTRATOR', roleName: 'Executive Prime Orchestrator', discipline: 'Management', managerId: 'NONE', competencyProfile: { competencyScore: 100, coveragePct: 100, certifiedDomain: 'Master Construction Governance' }, globalRuntimeState: 'MEETING', projectAssignmentState: 'PROJECT_PRESENT' },
      { agentId: 'PROJECT-PRIME', canonicalRoleId: 'PROJECT-PRIME-LEAD', roleName: 'Project Prime Leader', discipline: 'Management', managerId: 'AGENT-PRIME-ORCHESTRATOR', competencyProfile: { competencyScore: 98, coveragePct: 98, certifiedDomain: 'Project Intake & Execution' }, globalRuntimeState: 'MEETING', projectAssignmentState: 'PROJECT_PRESENT' },
      { agentId: 'AGENT-ARCH-MANAGER', canonicalRoleId: 'ARCH-MANAGER-LEAD', roleName: 'Architecture Discipline Manager', discipline: 'Architecture', managerId: 'PROJECT-PRIME', competencyProfile: { competencyScore: 96, coveragePct: 95, certifiedDomain: 'Architectural Design' }, globalRuntimeState: 'MEETING', projectAssignmentState: 'PROJECT_PRESENT' },
      { agentId: 'AGENT-STRUCT-MANAGER', canonicalRoleId: 'STRUCT-MANAGER-LEAD', roleName: 'Structural Engineering Manager', discipline: 'Structure', managerId: 'PROJECT-PRIME', competencyProfile: { competencyScore: 97, coveragePct: 96, certifiedDomain: 'Structural Systems & Wind' }, globalRuntimeState: 'MEETING', projectAssignmentState: 'PROJECT_PRESENT' },
      { agentId: 'AGENT-CIVIL-MANAGER', canonicalRoleId: 'CIVIL-MANAGER-LEAD', roleName: 'Site & Civil Manager', discipline: 'Site', managerId: 'PROJECT-PRIME', competencyProfile: { competencyScore: 95, coveragePct: 94, certifiedDomain: 'Site Survey & Earthwork' }, globalRuntimeState: 'MEETING', projectAssignmentState: 'PROJECT_PRESENT' },
      { agentId: 'AGENT-ELEC-MANAGER', canonicalRoleId: 'ELEC-MANAGER-LEAD', roleName: 'Electrical Engineering Manager', discipline: 'Electrical', managerId: 'PROJECT-PRIME', competencyProfile: { competencyScore: 96, coveragePct: 95, certifiedDomain: 'Electrical Systems & Code' }, globalRuntimeState: 'HOME', projectAssignmentState: 'PROJECT_PRESENT' },
      { agentId: 'AGENT-PLUMB-MANAGER', canonicalRoleId: 'PLUMB-MANAGER-LEAD', roleName: 'Plumbing Systems Manager', discipline: 'Plumbing', managerId: 'PROJECT-PRIME', competencyProfile: { competencyScore: 94, coveragePct: 93, certifiedDomain: 'Plumbing & Drainage' }, globalRuntimeState: 'HOME', projectAssignmentState: 'PROJECT_PRESENT' },
      { agentId: 'AGENT-HVAC-MANAGER', canonicalRoleId: 'HVAC-MANAGER-LEAD', roleName: 'HVAC Systems Manager', discipline: 'HVAC', managerId: 'PROJECT-PRIME', competencyProfile: { competencyScore: 95, coveragePct: 94, certifiedDomain: 'Thermal & Airflow Design' }, globalRuntimeState: 'HOME', projectAssignmentState: 'PROJECT_PRESENT' }
    );

    // Architecture Team (3 workers)
    for (let i = 1; i <= 3; i++) {
      roster.push({
        agentId: `AGENT-ARCH-WORKER-0${i}`,
        canonicalRoleId: `ARCH-SPECIALIST-0${i}`,
        roleName: `Architecture Specialist 0${i}`,
        discipline: 'Architecture',
        managerId: 'AGENT-ARCH-MANAGER',
        competencyProfile: { competencyScore: 90, coveragePct: 90, certifiedDomain: 'Spatial Program & Layout' },
        globalRuntimeState: 'HOME',
        projectAssignmentState: 'PROJECT_PRESENT'
      });
    }

    // Structural Team (5 workers)
    for (let i = 1; i <= 5; i++) {
      const state: DetailedAgentState = i === 1 ? 'CONSULTING' : 'HOME';
      roster.push({
        agentId: `AGENT-STRUCT-WORKER-0${i}`,
        canonicalRoleId: `STRUCT-SPECIALIST-0${i}`,
        roleName: `Structural Specialist 0${i}`,
        discipline: 'Structure',
        managerId: 'AGENT-STRUCT-MANAGER',
        competencyProfile: { competencyScore: 92, coveragePct: 91, certifiedDomain: 'Concrete & Masonry Detail' },
        globalRuntimeState: state,
        projectAssignmentState: 'PROJECT_PRESENT'
      });
    }

    // Envelope & Roofing (4 workers)
    for (let i = 1; i <= 4; i++) {
      roster.push({
        agentId: `AGENT-ENVELOPE-0${i}`,
        canonicalRoleId: `ENVELOPE-SPECIALIST-0${i}`,
        roleName: `Envelope Specialist 0${i}`,
        discipline: 'Envelope',
        managerId: 'AGENT-ARCH-MANAGER',
        competencyProfile: { competencyScore: 89, coveragePct: 88, certifiedDomain: 'Waterproofing & Roof Assembly' },
        globalRuntimeState: 'HOME',
        projectAssignmentState: 'PROJECT_PRESENT'
      });
    }

    // Plumbing (3 workers)
    for (let i = 1; i <= 3; i++) {
      roster.push({
        agentId: `AGENT-PLUMB-WORKER-0${i}`,
        canonicalRoleId: `PLUMB-SPECIALIST-0${i}`,
        roleName: `Plumbing Specialist 0${i}`,
        discipline: 'Plumbing',
        managerId: 'AGENT-PLUMB-MANAGER',
        competencyProfile: { competencyScore: 91, coveragePct: 90, certifiedDomain: 'Piping & Sanitary' },
        globalRuntimeState: 'HOME',
        projectAssignmentState: 'PROJECT_PRESENT'
      });
    }

    // Electrical (7 workers)
    for (let i = 1; i <= 7; i++) {
      roster.push({
        agentId: `AGENT-ELEC-WORKER-0${i}`,
        canonicalRoleId: `ELEC-SPECIALIST-0${i}`,
        roleName: `Electrical Specialist 0${i}`,
        discipline: 'Electrical',
        managerId: 'AGENT-ELEC-MANAGER',
        competencyProfile: { competencyScore: 93, coveragePct: 92, certifiedDomain: 'Circuiting & EV/Solar Service' },
        globalRuntimeState: 'HOME',
        projectAssignmentState: 'PROJECT_PRESENT'
      });
    }

    // HVAC (3 workers)
    for (let i = 1; i <= 3; i++) {
      roster.push({
        agentId: `AGENT-HVAC-WORKER-0${i}`,
        canonicalRoleId: `HVAC-SPECIALIST-0${i}`,
        roleName: `HVAC Specialist 0${i}`,
        discipline: 'HVAC',
        managerId: 'AGENT-HVAC-MANAGER',
        competencyProfile: { competencyScore: 90, coveragePct: 89, certifiedDomain: 'Ductwork & Heat Pump Load' },
        globalRuntimeState: 'HOME',
        projectAssignmentState: 'PROJECT_PRESENT'
      });
    }

    // Fire Protection (3 workers)
    for (let i = 1; i <= 3; i++) {
      roster.push({
        agentId: `AGENT-FIRE-0${i}`,
        canonicalRoleId: `FIRE-SPECIALIST-0${i}`,
        roleName: `Fire Protection Specialist 0${i}`,
        discipline: 'Fire Protection',
        managerId: 'AGENT-PLUMB-MANAGER',
        competencyProfile: { competencyScore: 92, coveragePct: 91, certifiedDomain: 'Life Safety & Alarm Layout' },
        globalRuntimeState: 'HOME',
        projectAssignmentState: 'PROJECT_PRESENT'
      });
    }

    // Quality & Inspection (5 agents)
    for (let i = 1; i <= 5; i++) {
      roster.push({
        agentId: `AGENT-INSP-0${i}`,
        canonicalRoleId: `INSPECTOR-0${i}`,
        roleName: `Code Inspection Specialist 0${i}`,
        discipline: 'Quality',
        managerId: 'AGENT-PRIME-ORCHESTRATOR',
        competencyProfile: { competencyScore: 99, coveragePct: 98, certifiedDomain: 'FBC Code Compliance Audit' },
        globalRuntimeState: 'HOME',
        projectAssignmentState: 'PROJECT_PRESENT'
      });
    }

    // Closeout & Procurement & Site (7 agents)
    roster.push(
      { agentId: 'AGENT-CLOSEOUT-01', canonicalRoleId: 'CLOSEOUT-LEAD', roleName: 'Closeout Lead', discipline: 'Closeout', managerId: 'PROJECT-PRIME', competencyProfile: { competencyScore: 95, coveragePct: 95, certifiedDomain: 'Commissioning' }, globalRuntimeState: 'HOME', projectAssignmentState: 'PROJECT_PRESENT' },
      { agentId: 'AGENT-PROC-01', canonicalRoleId: 'PROC-LEAD', roleName: 'Procurement Specialist 01', discipline: 'Procurement', managerId: 'PROJECT-PRIME', competencyProfile: { competencyScore: 94, coveragePct: 94, certifiedDomain: 'Supply Chain & Sourcing' }, globalRuntimeState: 'HOME', projectAssignmentState: 'PROJECT_PRESENT' },
      { agentId: 'AGENT-CIVIL-WORKER-01', canonicalRoleId: 'CIVIL-WORKER-01', roleName: 'Civil & Survey Specialist 01', discipline: 'Site', managerId: 'AGENT-CIVIL-MANAGER', competencyProfile: { competencyScore: 92, coveragePct: 91, certifiedDomain: 'Topographic Layout' }, globalRuntimeState: 'HOME', projectAssignmentState: 'PROJECT_PRESENT' },
      { agentId: 'AGENT-CIVIL-WORKER-02', canonicalRoleId: 'CIVIL-WORKER-02', roleName: 'Civil & Earthwork Specialist 02', discipline: 'Site', managerId: 'AGENT-CIVIL-MANAGER', competencyProfile: { competencyScore: 91, coveragePct: 90, certifiedDomain: 'Grading & Drainage' }, globalRuntimeState: 'HOME', projectAssignmentState: 'PROJECT_PRESENT' },
      { agentId: 'AGENT-DIAG-01', canonicalRoleId: 'SYSTEM-DIAG-01', roleName: 'System Quality Diagnostician 01', discipline: 'System Diagnostics', managerId: 'AGENT-PRIME-ORCHESTRATOR', competencyProfile: { competencyScore: 100, coveragePct: 100, certifiedDomain: 'System Health & Metrics' }, globalRuntimeState: 'HOME', projectAssignmentState: 'PROJECT_PRESENT' },
      { agentId: 'AGENT-DIAG-02', canonicalRoleId: 'SYSTEM-DIAG-02', roleName: 'System Quality Diagnostician 02', discipline: 'System Diagnostics', managerId: 'AGENT-PRIME-ORCHESTRATOR', competencyProfile: { competencyScore: 100, coveragePct: 100, certifiedDomain: 'Continuous Verification' }, globalRuntimeState: 'HOME', projectAssignmentState: 'PROJECT_PRESENT' }
    );

    // Learning Center Reserve Agents (21 agents to complete 68 total)
    for (let i = 1; i <= 21; i++) {
      const padId = i < 10 ? `0${i}` : `${i}`;
      roster.push({
        agentId: `AGENT-LEARNING-${padId}`,
        canonicalRoleId: `LEARNING-RESERVE-${padId}`,
        roleName: `Academy Learning Fellow ${padId}`,
        discipline: 'Learning',
        managerId: 'AGENT-PRIME-ORCHESTRATOR',
        competencyProfile: { competencyScore: 88, coveragePct: 85, certifiedDomain: 'Active Curriculum Training' },
        globalRuntimeState: 'LEARNING',
        projectAssignmentState: 'PROJECT_PRESENT'
      });
    }

    return roster;
  }

  /**
   * Builds the 18 Real-Scale Operations Campus Facilities
   */
  private static buildOperationsCampus(projectId: string, nowISO: string): SpatialEntityRecord[] {
    const facilities: SpatialEntityRecord[] = [
      {
        entityId: 'FACILITY-INTAKE-01',
        projectId,
        name: 'Customer Briefing / Project Intake Pavilion',
        entityType: 'OPERATIONS_FACILITY',
        positionXYZ: [-18.0, 0.0, 18.0],
        rotation: [0, 0, 0],
        dimensionsXYZ: [8.0, 3.0, 6.0],
        boundingEnvelope: [-22.0, -14.0, 15.0, 21.0, 0.0, 3.0],
        truthOrigin: 'SIMULATED' as TruthOrigin,
        currentState: 'ACTIVE',
        creationEventId: `EVT-${projectId}-0000`,
        lastMutationEventId: `EVT-${projectId}-0000`
      },
      {
        entityId: 'FACILITY-OPS-01',
        projectId,
        name: 'Executive & Prime Operations Trailer (40ft)',
        entityType: 'OPERATIONS_FACILITY',
        positionXYZ: [-18.0, 0.0, -18.0],
        rotation: [0, 0, 0],
        dimensionsXYZ: [12.192, 2.896, 2.438],
        boundingEnvelope: [-24.096, -11.904, -19.219, -16.781, 0.0, 2.896],
        truthOrigin: 'SIMULATED' as TruthOrigin,
        currentState: 'ACTIVE',
        creationEventId: `EVT-${projectId}-0000`,
        lastMutationEventId: `EVT-${projectId}-0000`
      },
      {
        entityId: 'FACILITY-PM-01',
        projectId,
        name: 'Project Management & Scheduling Office',
        entityType: 'OPERATIONS_FACILITY',
        positionXYZ: [-18.0, 0.0, -8.0],
        rotation: [0, 0, 0],
        dimensionsXYZ: [10.0, 2.8, 5.0],
        boundingEnvelope: [-23.0, -13.0, -10.5, -5.5, 0.0, 2.8],
        truthOrigin: 'SIMULATED' as TruthOrigin,
        currentState: 'ACTIVE',
        creationEventId: `EVT-${projectId}-0000`,
        lastMutationEventId: `EVT-${projectId}-0000`
      },
      {
        entityId: 'FACILITY-ARCH-01',
        projectId,
        name: 'Architecture & Spatial Design Studio',
        entityType: 'OPERATIONS_FACILITY',
        positionXYZ: [-18.0, 0.0, 0.0],
        rotation: [0, 0, 0],
        dimensionsXYZ: [10.0, 2.8, 5.0],
        boundingEnvelope: [-23.0, -13.0, -2.5, 2.5, 0.0, 2.8],
        truthOrigin: 'SIMULATED' as TruthOrigin,
        currentState: 'ACTIVE',
        creationEventId: `EVT-${projectId}-0000`,
        lastMutationEventId: `EVT-${projectId}-0000`
      },
      {
        entityId: 'FACILITY-STRUCT-01',
        projectId,
        name: 'Structural Engineering & Engineering Lab',
        entityType: 'OPERATIONS_FACILITY',
        positionXYZ: [-18.0, 0.0, 8.0],
        rotation: [0, 0, 0],
        dimensionsXYZ: [10.0, 2.8, 5.0],
        boundingEnvelope: [-23.0, -13.0, 5.5, 10.5, 0.0, 2.8],
        truthOrigin: 'SIMULATED' as TruthOrigin,
        currentState: 'ACTIVE',
        creationEventId: `EVT-${projectId}-0000`,
        lastMutationEventId: `EVT-${projectId}-0000`
      },
      {
        entityId: 'FACILITY-CIVIL-01',
        projectId,
        name: 'Site, Civil & Surveying Command Post',
        entityType: 'OPERATIONS_FACILITY',
        positionXYZ: [-6.0, 0.0, -18.0],
        rotation: [0, 0, 0],
        dimensionsXYZ: [8.0, 2.8, 5.0],
        boundingEnvelope: [-10.0, -2.0, -20.5, -15.5, 0.0, 2.8],
        truthOrigin: 'SIMULATED' as TruthOrigin,
        currentState: 'ACTIVE',
        creationEventId: `EVT-${projectId}-0000`,
        lastMutationEventId: `EVT-${projectId}-0000`
      },
      {
        entityId: 'FACILITY-CONCRETE-01',
        projectId,
        name: 'Concrete & Foundation Engineering Workshop',
        entityType: 'OPERATIONS_FACILITY',
        positionXYZ: [4.0, 0.0, -18.0],
        rotation: [0, 0, 0],
        dimensionsXYZ: [8.0, 2.8, 5.0],
        boundingEnvelope: [0.0, 8.0, -20.5, -15.5, 0.0, 2.8],
        truthOrigin: 'SIMULATED' as TruthOrigin,
        currentState: 'ACTIVE',
        creationEventId: `EVT-${projectId}-0000`,
        lastMutationEventId: `EVT-${projectId}-0000`
      },
      {
        entityId: 'FACILITY-FRAMING-01',
        projectId,
        name: 'Framing & Timber Systems Facility',
        entityType: 'OPERATIONS_FACILITY',
        positionXYZ: [14.0, 0.0, -18.0],
        rotation: [0, 0, 0],
        dimensionsXYZ: [8.0, 2.8, 5.0],
        boundingEnvelope: [10.0, 18.0, -20.5, -15.5, 0.0, 2.8],
        truthOrigin: 'SIMULATED' as TruthOrigin,
        currentState: 'ACTIVE',
        creationEventId: `EVT-${projectId}-0000`,
        lastMutationEventId: `EVT-${projectId}-0000`
      },
      {
        entityId: 'FACILITY-ROOFING-01',
        projectId,
        name: 'Roofing & Building Envelope Testing Lab',
        entityType: 'OPERATIONS_FACILITY',
        positionXYZ: [22.0, 0.0, -18.0],
        rotation: [0, 0, 0],
        dimensionsXYZ: [8.0, 2.8, 5.0],
        boundingEnvelope: [18.0, 26.0, -20.5, -15.5, 0.0, 2.8],
        truthOrigin: 'SIMULATED' as TruthOrigin,
        currentState: 'ACTIVE',
        creationEventId: `EVT-${projectId}-0000`,
        lastMutationEventId: `EVT-${projectId}-0000`
      },
      {
        entityId: 'FACILITY-PLUMBING-01',
        projectId,
        name: 'Plumbing & Hydraulic Systems Office',
        entityType: 'OPERATIONS_FACILITY',
        positionXYZ: [22.0, 0.0, -8.0],
        rotation: [0, 0, 0],
        dimensionsXYZ: [8.0, 2.8, 5.0],
        boundingEnvelope: [18.0, 26.0, -10.5, -5.5, 0.0, 2.8],
        truthOrigin: 'SIMULATED' as TruthOrigin,
        currentState: 'ACTIVE',
        creationEventId: `EVT-${projectId}-0000`,
        lastMutationEventId: `EVT-${projectId}-0000`
      },
      {
        entityId: 'FACILITY-ELEC-01',
        projectId,
        name: 'Electrical Systems & EV/Solar Design Lab',
        entityType: 'OPERATIONS_FACILITY',
        positionXYZ: [22.0, 0.0, 0.0],
        rotation: [0, 0, 0],
        dimensionsXYZ: [8.0, 2.8, 5.0],
        boundingEnvelope: [18.0, 26.0, -2.5, 2.5, 0.0, 2.8],
        truthOrigin: 'SIMULATED' as TruthOrigin,
        currentState: 'ACTIVE',
        creationEventId: `EVT-${projectId}-0000`,
        lastMutationEventId: `EVT-${projectId}-0000`
      },
      {
        entityId: 'FACILITY-HVAC-01',
        projectId,
        name: 'HVAC & Mechanical Systems Studio',
        entityType: 'OPERATIONS_FACILITY',
        positionXYZ: [22.0, 0.0, 8.0],
        rotation: [0, 0, 0],
        dimensionsXYZ: [8.0, 2.8, 5.0],
        boundingEnvelope: [18.0, 26.0, 5.5, 10.5, 0.0, 2.8],
        truthOrigin: 'SIMULATED' as TruthOrigin,
        currentState: 'ACTIVE',
        creationEventId: `EVT-${projectId}-0000`,
        lastMutationEventId: `EVT-${projectId}-0000`
      },
      {
        entityId: 'FACILITY-FIRE-01',
        projectId,
        name: 'Fire Protection & Life Safety Center',
        entityType: 'OPERATIONS_FACILITY',
        positionXYZ: [22.0, 0.0, 16.0],
        rotation: [0, 0, 0],
        dimensionsXYZ: [8.0, 2.8, 5.0],
        boundingEnvelope: [18.0, 26.0, 13.5, 18.5, 0.0, 2.8],
        truthOrigin: 'SIMULATED' as TruthOrigin,
        currentState: 'ACTIVE',
        creationEventId: `EVT-${projectId}-0000`,
        lastMutationEventId: `EVT-${projectId}-0000`
      },
      {
        entityId: 'FACILITY-FINISH-01',
        projectId,
        name: 'Interior & Architectural Finishes Studio',
        entityType: 'OPERATIONS_FACILITY',
        positionXYZ: [14.0, 0.0, 22.0],
        rotation: [0, 0, 0],
        dimensionsXYZ: [8.0, 2.8, 5.0],
        boundingEnvelope: [10.0, 18.0, 19.5, 24.5, 0.0, 2.8],
        truthOrigin: 'SIMULATED' as TruthOrigin,
        currentState: 'ACTIVE',
        creationEventId: `EVT-${projectId}-0000`,
        lastMutationEventId: `EVT-${projectId}-0000`
      },
      {
        entityId: 'FACILITY-MAT-01',
        projectId,
        name: 'Materials & Logistics Staging Compound',
        entityType: 'OPERATIONS_FACILITY',
        positionXYZ: [4.0, 0.0, 22.0],
        rotation: [0, 0, 0],
        dimensionsXYZ: [10.0, 0.1, 8.0],
        boundingEnvelope: [-1.0, 9.0, 18.0, 26.0, 0.0, 0.1],
        truthOrigin: 'SIMULATED' as TruthOrigin,
        currentState: 'ACTIVE',
        creationEventId: `EVT-${projectId}-0000`,
        lastMutationEventId: `EVT-${projectId}-0000`
      },
      {
        entityId: 'FACILITY-QUALITY-01',
        projectId,
        name: 'Quality Assurance & Inspection Command',
        entityType: 'OPERATIONS_FACILITY',
        positionXYZ: [-6.0, 0.0, 22.0],
        rotation: [0, 0, 0],
        dimensionsXYZ: [8.0, 2.8, 5.0],
        boundingEnvelope: [-10.0, -2.0, 19.5, 24.5, 0.0, 2.8],
        truthOrigin: 'SIMULATED' as TruthOrigin,
        currentState: 'ACTIVE',
        creationEventId: `EVT-${projectId}-0000`,
        lastMutationEventId: `EVT-${projectId}-0000`
      },
      {
        entityId: 'FACILITY-LEARNING-01',
        projectId,
        name: 'HERMES Knowledge & Learning Academy Center',
        entityType: 'OPERATIONS_FACILITY',
        positionXYZ: [-18.0, 0.0, 22.0],
        rotation: [0, 0, 0],
        dimensionsXYZ: [12.0, 3.2, 8.0],
        boundingEnvelope: [-24.0, -12.0, 18.0, 26.0, 0.0, 3.2],
        truthOrigin: 'SIMULATED' as TruthOrigin,
        currentState: 'ACTIVE',
        creationEventId: `EVT-${projectId}-0000`,
        lastMutationEventId: `EVT-${projectId}-0000`
      },
      {
        entityId: 'FACILITY-DIAG-01',
        projectId,
        name: 'System Quality & Diagnostics Center',
        entityType: 'OPERATIONS_FACILITY',
        positionXYZ: [6.0, 0.0, 0.0],
        rotation: [0, 0, 0],
        dimensionsXYZ: [6.0, 2.8, 5.0],
        boundingEnvelope: [3.0, 9.0, -2.5, 2.5, 0.0, 2.8],
        truthOrigin: 'SIMULATED' as TruthOrigin,
        currentState: 'ACTIVE',
        creationEventId: `EVT-${projectId}-0000`,
        lastMutationEventId: `EVT-${projectId}-0000`
      }
    ];

    return facilities;
  }

  /**
   * Builds Workforce Spatial States & 3D Avatar Spatial Entities
   */
  private static buildWorkforceSpatialStates(
    projectId: string,
    roster: CanonicalAgentProfile[],
    nowISO: string
  ): { agentSpatialStates: Record<string, AgentSpatialState>; agentEntities: SpatialEntityRecord[] } {
    const agentSpatialStates: Record<string, AgentSpatialState> = {};
    const agentEntities: SpatialEntityRecord[] = [];

    const facilityMap: Record<string, string> = {
      Management: 'FACILITY-OPS-01',
      Architecture: 'FACILITY-ARCH-01',
      Structure: 'FACILITY-STRUCT-01',
      Envelope: 'FACILITY-ROOFING-01',
      Plumbing: 'FACILITY-PLUMBING-01',
      Electrical: 'FACILITY-ELEC-01',
      HVAC: 'FACILITY-HVAC-01',
      'Fire Protection': 'FACILITY-FIRE-01',
      Quality: 'FACILITY-QUALITY-01',
      Closeout: 'FACILITY-PM-01',
      Procurement: 'FACILITY-MAT-01',
      Site: 'FACILITY-CIVIL-01',
      Learning: 'FACILITY-LEARNING-01',
      'System Diagnostics': 'FACILITY-DIAG-01'
    };

    const facilityPosMap: Record<string, [number, number, number]> = {
      'FACILITY-OPS-01': [-18.0, 0.0, -18.0],
      'FACILITY-INTAKE-01': [-18.0, 0.0, 18.0],
      'FACILITY-ARCH-01': [-18.0, 0.0, 0.0],
      'FACILITY-STRUCT-01': [-18.0, 0.0, 8.0],
      'FACILITY-ROOFING-01': [22.0, 0.0, -18.0],
      'FACILITY-PLUMBING-01': [22.0, 0.0, -8.0],
      'FACILITY-ELEC-01': [22.0, 0.0, 0.0],
      'FACILITY-HVAC-01': [22.0, 0.0, 8.0],
      'FACILITY-FIRE-01': [22.0, 0.0, 16.0],
      'FACILITY-QUALITY-01': [-6.0, 0.0, 22.0],
      'FACILITY-PM-01': [-18.0, 0.0, -8.0],
      'FACILITY-MAT-01': [4.0, 0.0, 22.0],
      'FACILITY-CIVIL-01': [-6.0, 0.0, -18.0],
      'FACILITY-LEARNING-01': [-18.0, 0.0, 22.0],
      'FACILITY-DIAG-01': [6.0, 0.0, 0.0]
    };

    roster.forEach((profile, index) => {
      const homeFac = facilityMap[profile.discipline] || 'FACILITY-OPS-01';
      const basePos = facilityPosMap[homeFac] || [-18.0, 0.0, -18.0];

      // Offset position inside/around facility
      const offsetX = (index % 4) * 0.9 - 1.35;
      const offsetZ = Math.floor(index / 4) * 0.9 - 1.35;
      let pos: [number, number, number] = [basePos[0] + offsetX, 0.0, basePos[2] + offsetZ];

      let state = profile.globalRuntimeState;
      if (profile.agentId === 'PROJECT-PRIME' || profile.agentId === 'AGENT-PRIME-ORCHESTRATOR') {
        pos = [-18.0, 0.0, 18.0]; // Inside Briefing pavilion
        state = 'MEETING';
      } else if (profile.agentId === 'AGENT-STRUCT-WORKER-01') {
        pos = [-18.0, 0.0, 18.0]; // Physical consultation meeting area
        state = 'CONSULTING';
      }

      const spatialState: AgentSpatialState = {
        agentId: profile.agentId,
        role: profile.roleName,
        discipline: profile.discipline,
        agentType: profile.discipline === 'Management' || profile.discipline === 'Quality' ? 'INTELLIGENCE' : 'EXECUTION',
        currentState: state,
        currentProjectId: projectId,
        worldPosition: pos,
        worldRotation: [0, 0, 0],
        homeBaseEntityId: homeFac,
        workEnvelope: [0.5, 1.75, 0.5], // Realistic human height 1.75m
        reportsTo: profile.managerId,
        timestamp: nowISO
      };

      agentSpatialStates[profile.agentId] = spatialState;

      agentEntities.push({
        entityId: `ENTITY-AGENT-${profile.agentId}`,
        projectId,
        name: `${profile.roleName} (${profile.agentId})`,
        entityType: 'AGENT_AVATAR',
        positionXYZ: pos,
        rotation: [0, 0, 0],
        dimensionsXYZ: [0.5, 1.75, 0.5],
        boundingEnvelope: [pos[0] - 0.25, pos[0] + 0.25, pos[2] - 0.25, pos[2] + 0.25, 0.0, 1.75],
        truthOrigin: 'SIMULATED' as TruthOrigin,
        currentState: state,
        creationEventId: `EVT-${projectId}-0000`,
        lastMutationEventId: `EVT-${projectId}-0000`
      });
    });

    return { agentSpatialStates, agentEntities };
  }

  /**
   * Builds the Scenario Events, Communications, Requirements, and Decision Records
   */
  private static buildScenarioLedger(projectId: string, nowISO: string) {
    const events: any[] = [];
    const communicationEvents: AgentCommunicationRecord[] = [];
    const requirementQuestions: RequirementQuestionRecord[] = [];
    const customerInteractions: CustomerInteractionRecord[] = [];
    const requirementDecisions: RequirementDecisionRecord[] = [];
    const primeDecisions: PrimeDecisionRecord[] = [];

    // 0. Genesis
    events.push({
      eventId: `EVT-${projectId}-0000`,
      sequenceNum: 0,
      projectId,
      timestamp: nowISO,
      eventType: 'PROJECT_CREATED',
      actorId: 'AGENT-PRIME-ORCHESTRATOR',
      summary: 'Project Genesis initialized for LIVE-WORLD-PHASE2-VALIDATION-001 (Live Phase 2 Organizational World)',
      truthOrigin: 'SIMULATED' as TruthOrigin,
      stateBefore: 'NONE',
      stateAfter: 'NEW'
    });

    // 1. Customer Arrived
    events.push({
      eventId: `EVT-${projectId}-0001`,
      sequenceNum: 1,
      projectId,
      timestamp: new Date(Date.now() - 300000).toISOString(),
      eventType: 'CUSTOMER_ARRIVED',
      actorId: 'MOCK-CUSTOMER-PHASE2-001',
      summary: 'Customer MOCK-CUSTOMER-PHASE2-001 arrived at Briefing Pavilion FACILITY-INTAKE-01',
      truthOrigin: 'SIMULATED' as TruthOrigin,
      stateBefore: 'OUTSIDE_PARCEL',
      stateAfter: 'AT_INTAKE_PAVILION'
    });

    // 2. Project Prime Assigned
    events.push({
      eventId: `EVT-${projectId}-0002`,
      sequenceNum: 2,
      projectId,
      timestamp: new Date(Date.now() - 280000).toISOString(),
      eventType: 'PROJECT_PRIME_ASSIGNED',
      actorId: 'PROJECT-PRIME',
      summary: 'Project Prime assigned to direct intake briefing at Briefing Pavilion',
      truthOrigin: 'SIMULATED' as TruthOrigin,
      stateBefore: 'AVAILABLE',
      stateAfter: 'MEETING'
    });

    // 3. Briefing Started
    events.push({
      eventId: `EVT-${projectId}-0003`,
      sequenceNum: 3,
      projectId,
      timestamp: new Date(Date.now() - 260000).toISOString(),
      eventType: 'BRIEFING_STARTED',
      actorId: 'PROJECT-PRIME',
      summary: 'Customer Briefing started between Customer and Project Prime',
      truthOrigin: 'SIMULATED' as TruthOrigin,
      stateBefore: 'ASSIGNED',
      stateAfter: 'MEETING'
    });

    // 4. Question Asked
    const q1Id = `Q-${projectId}-001`;
    requirementQuestions.push({
      questionId: q1Id,
      projectId,
      category: 'Project Parameters',
      requirementField: 'BuildingTypeAndResilience',
      questionText: 'What is your primary building type, square footage requirement, and hurricane resilience target?',
      askedByAgentId: 'PROJECT-PRIME',
      timestamp: new Date(Date.now() - 240000).toISOString(),
      status: 'ANSWERED',
      followUpQuestionIds: [`Q-${projectId}-002`]
    });

    customerInteractions.push({
      id: `INT-${projectId}-001`,
      projectId,
      timestamp: new Date(Date.now() - 240000).toISOString(),
      type: 'QUESTION',
      sender: 'HERMES_PRIME',
      content: 'What is your primary building type, square footage requirement, and hurricane resilience target?',
      category: 'Project Parameters'
    });

    events.push({
      eventId: `EVT-${projectId}-0004`,
      sequenceNum: 4,
      projectId,
      timestamp: new Date(Date.now() - 240000).toISOString(),
      eventType: 'QUESTION_ASKED',
      actorId: 'PROJECT-PRIME',
      summary: 'Prime asked initial project parameter question to Customer',
      truthOrigin: 'SIMULATED' as TruthOrigin,
      stateBefore: 'MEETING',
      stateAfter: 'MEETING'
    });

    // 5. Customer Responded
    customerInteractions.push({
      id: `INT-${projectId}-002`,
      projectId,
      timestamp: new Date(Date.now() - 220000).toISOString(),
      type: 'RESPONSE',
      sender: 'CUSTOMER',
      content: 'I want a 1,200 sq ft single-family residence with 2 bedrooms, 2 bathrooms, primary suite, and high hurricane resilience for Tampa, FL.',
      category: 'Project Parameters'
    });

    requirementDecisions.push({
      decisionId: `REQDEC-${projectId}-001`,
      projectId,
      requirementField: 'BuildingType',
      selectedOption: 'Single-Family Residence (1,200 sq ft, 2 Bed / 2 Bath)',
      rationale: 'Customer specified target square footage and room count.',
      consultedAgentIds: ['PROJECT-PRIME'],
      approvedByCustomer: true,
      timestamp: new Date(Date.now() - 220000).toISOString(),
      truthOrigin: 'SIMULATED' as TruthOrigin
    });

    events.push({
      eventId: `EVT-${projectId}-0005`,
      sequenceNum: 5,
      projectId,
      timestamp: new Date(Date.now() - 220000).toISOString(),
      eventType: 'CUSTOMER_RESPONDED',
      actorId: 'MOCK-CUSTOMER-PHASE2-001',
      summary: 'Customer specified 1,200 sq ft, 2 Bed / 2 Bath, Primary Suite, and High Hurricane Resilience',
      truthOrigin: 'SIMULATED' as TruthOrigin,
      stateBefore: 'MEETING',
      stateAfter: 'MEETING'
    });

    // 6. Requirement Updated
    events.push({
      eventId: `EVT-${projectId}-0006`,
      sequenceNum: 6,
      projectId,
      timestamp: new Date(Date.now() - 210000).toISOString(),
      eventType: 'REQUIREMENT_UPDATED',
      actorId: 'PROJECT-PRIME',
      summary: 'Requirement field BuildingType set to 1,200 sq ft Single-Family Residence',
      truthOrigin: 'SIMULATED' as TruthOrigin,
      stateBefore: 'MEETING',
      stateAfter: 'MEETING'
    });

    // 7. Dynamic Follow-up Question Engine
    const q2Id = `Q-${projectId}-002`;
    requirementQuestions.push({
      questionId: q2Id,
      projectId,
      category: 'Primary Suite Sub-Requirements',
      requirementField: 'PrimarySuiteFeatures',
      questionText: 'For your primary suite, do you require a walk-in closet, dual vanity, and private toilet compartment?',
      askedByAgentId: 'PROJECT-PRIME',
      timestamp: new Date(Date.now() - 200000).toISOString(),
      status: 'ANSWERED',
      dependsOnQuestionId: q1Id
    });

    customerInteractions.push({
      id: `INT-${projectId}-003`,
      projectId,
      timestamp: new Date(Date.now() - 200000).toISOString(),
      type: 'QUESTION',
      sender: 'HERMES_PRIME',
      content: 'For your primary suite, do you require a walk-in closet, dual vanity, and private toilet compartment?',
      category: 'Primary Suite Sub-Requirements'
    });

    events.push({
      eventId: `EVT-${projectId}-0007`,
      sequenceNum: 7,
      projectId,
      timestamp: new Date(Date.now() - 200000).toISOString(),
      eventType: 'DYNAMIC_FOLLOWUP_ASKED',
      actorId: 'PROJECT-PRIME',
      summary: 'Prime dynamically triggered primary suite sub-requirement question',
      truthOrigin: 'SIMULATED' as TruthOrigin,
      stateBefore: 'MEETING',
      stateAfter: 'MEETING'
    });

    // 8. Customer Responded to Follow-up
    customerInteractions.push({
      id: `INT-${projectId}-004`,
      projectId,
      timestamp: new Date(Date.now() - 180000).toISOString(),
      type: 'RESPONSE',
      sender: 'CUSTOMER',
      content: 'Yes, I require a walk-in closet and dual vanity. A private toilet compartment is optional.',
      category: 'Primary Suite Sub-Requirements'
    });

    events.push({
      eventId: `EVT-${projectId}-0008`,
      sequenceNum: 8,
      projectId,
      timestamp: new Date(Date.now() - 180000).toISOString(),
      eventType: 'CUSTOMER_RESPONDED',
      actorId: 'MOCK-CUSTOMER-PHASE2-001',
      summary: 'Customer confirmed walk-in closet and dual vanity for primary suite',
      truthOrigin: 'SIMULATED' as TruthOrigin,
      stateBefore: 'MEETING',
      stateAfter: 'MEETING'
    });

    // 9. Digital Manager Consultation Request
    const msg1: AgentCommunicationRecord = {
      messageId: `COMM-${projectId}-001`,
      projectId,
      timestamp: new Date(Date.now() - 160000).toISOString(),
      senderAgentId: 'PROJECT-PRIME',
      recipientAgentIds: ['AGENT-ARCH-MANAGER', 'AGENT-STRUCT-MANAGER', 'AGENT-CIVIL-MANAGER'],
      communicationType: 'MANAGER_REQUEST',
      worldLocation: [-18.0, 0.0, 18.0],
      summary: 'Digital consultation request for Tampa Hurricane Resilience & Foundation Strategy',
      messageContent: 'Evaluate structural masonry vs framing options for 140mph wind resilience and flood risk mitigation under 1,200 sq ft budget constraints.',
      relatedRequirementIds: ['BuildingTypeAndResilience'],
      truthOrigin: 'SIMULATED' as TruthOrigin,
      eventId: `EVT-${projectId}-0009`
    };

    communicationEvents.push(msg1);

    events.push({
      eventId: `EVT-${projectId}-0009`,
      sequenceNum: 9,
      projectId,
      timestamp: new Date(Date.now() - 160000).toISOString(),
      eventType: 'PRIME_CONSULTATION_REQUESTED',
      actorId: 'PROJECT-PRIME',
      summary: 'Prime sent digital consultation request to Architecture, Structural, and Civil Managers',
      truthOrigin: 'SIMULATED' as TruthOrigin,
      stateBefore: 'MEETING',
      stateAfter: 'CONSULTING'
    });

    // 10. Digital Manager Responses
    const msg2: AgentCommunicationRecord = {
      messageId: `COMM-${projectId}-002`,
      projectId,
      timestamp: new Date(Date.now() - 140000).toISOString(),
      senderAgentId: 'AGENT-ARCH-MANAGER',
      recipientAgentIds: ['PROJECT-PRIME'],
      communicationType: 'MANAGER_RESPONSE',
      worldLocation: [-18.0, 0.0, 0.0],
      summary: 'Architecture Manager evaluation: Compact 30ft x 40ft rectangular envelope optimal for wind pressure resistance',
      messageContent: 'Recommending a compact 30ft x 40ft footprint with 4:12 roof pitch for high wind performance.',
      responseToMessageId: msg1.messageId,
      truthOrigin: 'SIMULATED' as TruthOrigin,
      eventId: `EVT-${projectId}-0010`
    };

    communicationEvents.push(msg2);

    events.push({
      eventId: `EVT-${projectId}-0010`,
      sequenceNum: 10,
      projectId,
      timestamp: new Date(Date.now() - 140000).toISOString(),
      eventType: 'MANAGER_RESPONDED',
      actorId: 'AGENT-ARCH-MANAGER',
      summary: 'Architecture Manager responded with compact wind-resistant envelope strategy',
      truthOrigin: 'SIMULATED' as TruthOrigin,
      stateBefore: 'CONSULTING',
      stateAfter: 'CONSULTING'
    });

    // 11. Physical Consultation Assigned
    const msg3: AgentCommunicationRecord = {
      messageId: `COMM-${projectId}-003`,
      projectId,
      timestamp: new Date(Date.now() - 120000).toISOString(),
      senderAgentId: 'AGENT-STRUCT-MANAGER',
      recipientAgentIds: ['AGENT-STRUCT-WORKER-01'],
      communicationType: 'TASK_ASSIGNMENT',
      worldLocation: [-18.0, 0.0, 8.0],
      summary: 'Dispatched Structural Specialist AGENT-STRUCT-WORKER-01 for in-person briefing consultation',
      messageContent: 'Report to Briefing Pavilion FACILITY-INTAKE-01 to confirm footing & CMU tie-beam details directly with Prime.',
      truthOrigin: 'SIMULATED' as TruthOrigin,
      eventId: `EVT-${projectId}-0011`
    };

    communicationEvents.push(msg3);

    events.push({
      eventId: `EVT-${projectId}-0011`,
      sequenceNum: 11,
      projectId,
      timestamp: new Date(Date.now() - 120000).toISOString(),
      eventType: 'AGENT_ASSIGNED',
      actorId: 'AGENT-STRUCT-MANAGER',
      summary: 'Assigned AGENT-STRUCT-WORKER-01 for physical site briefing consultation',
      truthOrigin: 'SIMULATED' as TruthOrigin,
      stateBefore: 'AVAILABLE',
      stateAfter: 'ASSIGNED'
    });

    // 12. Physical Agent Travel Started
    events.push({
      eventId: `EVT-${projectId}-0012`,
      sequenceNum: 12,
      projectId,
      timestamp: new Date(Date.now() - 100000).toISOString(),
      eventType: 'AGENT_TRAVEL_STARTED',
      actorId: 'AGENT-STRUCT-WORKER-01',
      summary: 'AGENT-STRUCT-WORKER-01 started physical travel from FACILITY-STRUCT-01 to FACILITY-INTAKE-01',
      truthOrigin: 'SIMULATED' as TruthOrigin,
      stateBefore: 'ASSIGNED',
      stateAfter: 'TRAVELING'
    });

    // 13. Physical Agent Arrived at Briefing Pavilion
    events.push({
      eventId: `EVT-${projectId}-0013`,
      sequenceNum: 13,
      projectId,
      timestamp: new Date(Date.now() - 80000).toISOString(),
      eventType: 'AGENT_ARRIVED',
      actorId: 'AGENT-STRUCT-WORKER-01',
      summary: 'AGENT-STRUCT-WORKER-01 arrived at Briefing Pavilion and entered in-person consultation state',
      truthOrigin: 'SIMULATED' as TruthOrigin,
      stateBefore: 'TRAVELING',
      stateAfter: 'CONSULTING'
    });

    // 14. Prime Structured Decision Created
    const primeDec: PrimeDecisionRecord = {
      id: `DEC-${projectId}-001`,
      decisionId: `DEC-${projectId}-001`,
      projectId,
      timestamp: new Date(Date.now() - 60000).toISOString(),
      primeRole: 'PROJECT-PRIME',
      decisionType: 'STRUCTURAL_SYSTEM_SELECTION',
      rationale: 'Monolithic reinforced concrete slab on grade with 8-inch CMU exterior walls and engineered truss hurricane strapping selected for 140mph ASCE 7-22 wind speed compliance in Tampa, FL.',
      affectedDisciplines: ['Architecture', 'Structure', 'Site', 'Quality'],
      question: 'Which structural wall and foundation assembly provides required 140mph wind resilience while respecting budget limits?',
      candidateOptions: [
        'Monolithic Concrete Slab + Reinforced CMU Masonry + Wind Strapping',
        'Stem Wall + 2x6 Wood Framing + Continuous Sheathing',
        'Poured Concrete Insulated Concrete Forms (ICF)'
      ],
      evidenceIds: ['FBC-2023-WIND-TABLE', 'ASCE-7-22-TAMPA-MAP'],
      requirementIds: ['BuildingTypeAndResilience'],
      managerResponses: [
        { managerId: 'AGENT-ARCH-MANAGER', response: 'Compact 30x40 rectangular envelope with 4:12 pitch approved.' },
        { managerId: 'AGENT-STRUCT-MANAGER', response: 'CMU block walls with #4 vertical rebar @ 32in o.c. and monolithic 4in slab approved.' },
        { managerId: 'AGENT-CIVIL-MANAGER', response: 'Ground elevation datum verified above 100-year flood line.' }
      ],
      constraints: ['Max budget $210,000', 'ASCE 7-22 140mph Wind Zone'],
      blockers: [],
      selectedOption: 'Monolithic Concrete Slab + Reinforced CMU Masonry + Wind Strapping',
      rejectedOptions: [
        'Stem Wall + 2x6 Wood Framing + Continuous Sheathing',
        'Poured Concrete Insulated Concrete Forms (ICF)'
      ],
      rejectionReasons: [
        'Higher labor cost for stem wall forming; wood framing requires extensive hurricane clips.',
        'ICF material lead time exceeds project target schedule.'
      ],
      confidence: 0.98,
      truthOrigin: 'SIMULATED' as TruthOrigin,
      approvedBy: 'MOCK-CUSTOMER-PHASE2-001',
      createdEventId: `EVT-${projectId}-0014`
    };

    primeDecisions.push(primeDec);

    events.push({
      eventId: `EVT-${projectId}-0014`,
      sequenceNum: 14,
      projectId,
      timestamp: new Date(Date.now() - 60000).toISOString(),
      eventType: 'DECISION_CREATED',
      actorId: 'PROJECT-PRIME',
      summary: 'Prime Decision DEC-LIVE-WORLD-PHASE2-VALIDATION-001-001 recorded: Monolithic Slab + CMU Masonry selected',
      truthOrigin: 'SIMULATED' as TruthOrigin,
      stateBefore: 'CONSULTING',
      stateAfter: 'DECIDED'
    });

    // 15. Physical Agent Returning Home
    events.push({
      eventId: `EVT-${projectId}-0015`,
      sequenceNum: 15,
      projectId,
      timestamp: new Date(Date.now() - 40000).toISOString(),
      eventType: 'AGENT_RETURNING_HOME',
      actorId: 'AGENT-STRUCT-WORKER-01',
      summary: 'AGENT-STRUCT-WORKER-01 concluded consultation and returned home to FACILITY-STRUCT-01',
      truthOrigin: 'SIMULATED' as TruthOrigin,
      stateBefore: 'CONSULTING',
      stateAfter: 'HOME'
    });

    // 16. Briefing Completed
    events.push({
      eventId: `EVT-${projectId}-0016`,
      sequenceNum: 16,
      projectId,
      timestamp: new Date(Date.now() - 20000).toISOString(),
      eventType: 'BRIEFING_COMPLETED',
      actorId: 'PROJECT-PRIME',
      summary: 'Customer Briefing concluded. 0 BIM components produced.',
      truthOrigin: 'SIMULATED' as TruthOrigin,
      stateBefore: 'DECIDED',
      stateAfter: 'INTAKE_COMPLETE'
    });

    return {
      events,
      communicationEvents,
      requirementQuestions,
      customerInteractions,
      requirementDecisions,
      primeDecisions
    };
  }

  /**
   * Returns Workforce HUD Summary Grouped by Discipline
   */
  public static getWorkforceHUD(projectId: string): WorkforceHUDSummary {
    const proj = this.getProject(projectId);
    if (!proj) {
      return {
        total: 0, home: 0, available: 0, meeting: 0, assigned: 0,
        traveling: 0, working: 0, learning: 0, inspecting: 0, blocked: 0,
        disciplines: {}
      };
    }

    const summary: WorkforceHUDSummary = {
      total: proj.canonicalRoster.length,
      home: 0,
      available: 0,
      meeting: 0,
      assigned: 0,
      traveling: 0,
      working: 0,
      learning: 0,
      inspecting: 0,
      blocked: 0,
      disciplines: {}
    };

    proj.canonicalRoster.forEach((profile) => {
      const spatial = proj.agentSpatialStates[profile.agentId];
      const st = spatial ? spatial.currentState : profile.globalRuntimeState;

      const discName = profile.discipline;
      if (!summary.disciplines[discName]) {
        summary.disciplines[discName] = {
          discipline: discName,
          total: 0, home: 0, available: 0, meeting: 0, assigned: 0,
          traveling: 0, working: 0, learning: 0, inspecting: 0, blocked: 0
        };
      }
      const discSum = summary.disciplines[discName];
      discSum.total++;

      if (st === 'HOME') { summary.home++; discSum.home++; }
      else if (st === 'AVAILABLE') { summary.available++; discSum.available++; }
      else if (st === 'MEETING') { summary.meeting++; discSum.meeting++; }
      else if (st === 'ASSIGNED') { summary.assigned++; discSum.assigned++; }
      else if (st === 'TRAVELING') { summary.traveling++; discSum.traveling++; }
      else if (st === 'WORKING' || st === 'ACTIVE_PROJECT_TASK') { summary.working++; discSum.working++; }
      else if (st === 'LEARNING' || st === 'ACTIVE_KNOWLEDGE_LEARNING') { summary.learning++; discSum.learning++; }
      else if (st === 'INSPECTING') { summary.inspecting++; discSum.inspecting++; }
      else if (st.startsWith('BLOCKED')) { summary.blocked++; discSum.blocked++; }
      else { summary.available++; discSum.available++; }
    });

    return summary;
  }

  /**
   * Management Chain Traversal
   */
  public static getManagementChain(agentId: string): Array<{ agentId: string; roleName: string; discipline: string }> {
    this.initialize();
    const chain: Array<{ agentId: string; roleName: string; discipline: string }> = [];
    if (!this.instanceState) return chain;

    const rosterMap = new Map<string, CanonicalAgentProfile>();
    this.instanceState.canonicalRoster.forEach(a => rosterMap.set(a.agentId, a));

    let curr: CanonicalAgentProfile | undefined = rosterMap.get(agentId);
    let visited = new Set<string>();

    while (curr && !visited.has(curr.agentId)) {
      visited.add(curr.agentId);
      chain.push({ agentId: curr.agentId, roleName: curr.roleName, discipline: curr.discipline });
      if (!curr.managerId || curr.managerId === 'NONE' || curr.managerId === curr.agentId) {
        break;
      }
      curr = rosterMap.get(curr.managerId);
    }

    return chain;
  }

  /**
   * Reconstructs an immutable frame at a specific event index
   */
  public static getReplayFrameAtEvent(eventIndex: number): Phase2ValidationState {
    this.initialize();
    const live = this.instanceState!;

    const boundedIndex = Math.max(0, Math.min(eventIndex, live.events.length - 1));
    const targetEvent = live.events[boundedIndex];

    const slicedEvents = live.events.slice(0, boundedIndex + 1);
    const slicedComms = live.communicationEvents.filter(c => {
      const commEvtIndex = parseInt(c.eventId.split('-').pop() || '0', 10);
      return commEvtIndex <= boundedIndex;
    });

    // Deep clone to ensure immutability
    const frame: Phase2ValidationState = JSON.parse(JSON.stringify(live));
    frame.clock.mode = 'REPLAY';
    frame.clock.currentEventIndex = boundedIndex;
    frame.events = slicedEvents;
    frame.communicationEvents = slicedComms;

    // Adjust physical state based on event index
    if (boundedIndex < 12) {
      // Before physical travel started
      if (frame.agentSpatialStates['AGENT-STRUCT-WORKER-01']) {
        frame.agentSpatialStates['AGENT-STRUCT-WORKER-01'].currentState = 'HOME';
        frame.agentSpatialStates['AGENT-STRUCT-WORKER-01'].worldPosition = [-18.0, 0.0, 8.0];
      }
    } else if (boundedIndex >= 12 && boundedIndex < 15) {
      // During physical travel / consultation
      if (frame.agentSpatialStates['AGENT-STRUCT-WORKER-01']) {
        frame.agentSpatialStates['AGENT-STRUCT-WORKER-01'].currentState = 'CONSULTING';
        frame.agentSpatialStates['AGENT-STRUCT-WORKER-01'].worldPosition = [-18.0, 0.0, 18.0];
      }
    } else if (boundedIndex >= 15) {
      // Returned home
      if (frame.agentSpatialStates['AGENT-STRUCT-WORKER-01']) {
        frame.agentSpatialStates['AGENT-STRUCT-WORKER-01'].currentState = 'HOME';
        frame.agentSpatialStates['AGENT-STRUCT-WORKER-01'].worldPosition = [-18.0, 0.0, 8.0];
      }
    }

    return frame;
  }
}
