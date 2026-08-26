import {
  CanonicalProjectStatus,
  ProjectWorldFrame,
  TruthOrigin,
  RuntimeClockState,
  RobotReadySpatialContract
} from '../src/types/hermes.js';

export interface GenesisProjectState {
  projectId: string;
  projectName: string;
  buildingType: string;
  status: CanonicalProjectStatus;
  classification: 'GENESIS_LIVE' | 'ACADEMY_REAL' | 'REFERENCE';
  createdAt: string;
  worldFrame: ProjectWorldFrame;
  clock: RuntimeClockState;
  events: any[];
  bimComponents: any[];
  materials: any[];
  surveyMarks: any[];
  spatialEntities: any[];
  activeTasks: any[];
  inspections: any[];
  knowledgeRequests: any[];
  communicationEvents: any[];
  robotContracts: RobotReadySpatialContract[];
  workforceAssignment: {
    totalAgents: number;
    assignedAgents: number;
    availableAgents: number;
  };
}

export class GenesisProjectEngine {
  private static projectsMap = new Map<string, GenesisProjectState>();
  private static initialized = false;

  public static initialize() {
    if (this.initialized) return;
    this.initialized = true;

    // Register initial disposable test genesis project (LIVE-WORLD-GENESIS-TEST-001)
    this.createGenesisProject('LIVE-WORLD-GENESIS-TEST-001', 'LIVE-WORLD-GENESIS-TEST-001 (Genesis Live Proof)');
  }

  public static createGenesisProject(projectId: string, name: string): GenesisProjectState {
    const nowISO = new Date().toISOString();
    const nowMs = Date.now();

    const worldFrame: ProjectWorldFrame = {
      projectWorldFrameId: `FRAME-${projectId}-ROOT`,
      projectId,
      surveyOrigin: [27.9506, -82.4572, 0], // Tampa Datum Metric Origin
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
      totalEvents: 1
    };

    const genesisEvent = {
      eventId: `EVT-${projectId}-0000`,
      sequenceNum: 0,
      projectId,
      timestamp: nowISO,
      eventType: 'PROJECT_CREATED',
      actorId: 'PRIME-EXECUTIVE',
      summary: `Project Genesis initialized for ${name}`,
      truthOrigin: 'MEASURED' as TruthOrigin,
      stateBefore: 'NONE',
      stateAfter: 'NEW'
    };

    const newState: GenesisProjectState = {
      projectId,
      projectName: name,
      buildingType: 'Single-Family Residence (Live Genesis)',
      status: 'NEW',
      classification: 'GENESIS_LIVE',
      createdAt: nowISO,
      worldFrame,
      clock,
      events: [genesisEvent],
      bimComponents: [], // CRITICAL: 0 BIM components at genesis
      materials: [], // CRITICAL: 0 materials at genesis
      surveyMarks: [], // CRITICAL: 0 survey marks at genesis
      spatialEntities: [
        {
          entityId: `SITE-${projectId}-PARCEL`,
          projectId,
          frameId: worldFrame.projectWorldFrameId,
          parentFrameId: 'WORLD-ROOT',
          entityType: 'SITE_PARCEL',
          name: 'Site Boundary Parcel (60m x 60m)',
          positionXYZ: [0, 0, 0], // [x, y, z] in METERS
          rotation: [0, 0, 0],
          dimensionsXYZ: [60, 0.1, 60],
          boundingEnvelope: [-30, 30, -30, 30, 0, 0.1],
          creationEventId: genesisEvent.eventId,
          lastMutationEventId: genesisEvent.eventId,
          currentState: 'ACTIVE',
          truthOrigin: 'MEASURED' as TruthOrigin
        }
      ],
      activeTasks: [],
      inspections: [],
      knowledgeRequests: [],
      communicationEvents: [],
      robotContracts: [],
      workforceAssignment: {
        totalAgents: 68,
        assignedAgents: 0,
        availableAgents: 68
      }
    };

    this.projectsMap.set(projectId, newState);
    return newState;
  }

  public static getProject(projectId: string): GenesisProjectState | undefined {
    this.initialize();
    return this.projectsMap.get(projectId);
  }

  public static getAllGenesisProjects(): GenesisProjectState[] {
    this.initialize();
    return Array.from(this.projectsMap.values());
  }

  public static deleteGenesisProject(projectId: string): boolean {
    this.initialize();
    return this.projectsMap.delete(projectId);
  }
}
