import {
  ProjectEventRecord,
  CustomerInteractionRecord,
  PrimeDecisionRecord,
  AgentTaskRecord,
  KnowledgeRequestRecord,
  ConstructionMethodSelectionRecord,
  SpatialActionRecord,
  MaterialStateRecord,
  DeliveryRecord,
  ManagerReviewRecord,
  InspectionTicket,
  IssueRecord,
  RepairRecord,
  BIMComponent,
  DigitalTwinProject
} from '../src/types/hermes';
import { RealityStore } from './realityStore';
import { ConstructionMethodEngine } from './constructionMethodEngine';

export interface ReplayFrameState {
  eventSequence: number;
  totalEvents: number;
  currentEvent: ProjectEventRecord;
  timestamp: string;
  projectSummary: {
    id: string;
    name: string;
    stage: string;
    completionPct: number;
  };
  components: BIMComponent[];
  componentCount: number;
  physicalComponentCount: number;
  referenceEntityCount: number;
  activeTasks: AgentTaskRecord[];
  spatialActions: SpatialActionRecord[];
  materialStates: MaterialStateRecord[];
  inspectionTickets: InspectionTicket[];
  issues: IssueRecord[];
  repairs: RepairRecord[];
  managerReviews: ManagerReviewRecord[];
  knowledgeRequests: KnowledgeRequestRecord[];
  decisions: PrimeDecisionRecord[];
}

export class EventReplayEngine {
  private static playbackState: {
    projectId: string;
    status: 'PLAYING' | 'PAUSED' | 'STEPPING' | 'STOPPED';
    currentSequence: number;
    speedMultiplier: number;
    mode: 'REAL_TIME_EVENT_SPACING' | 'NORMALIZED_TRAINING_PLAYBACK';
  } = {
    projectId: 'REFERENCE-BIM-0001',
    status: 'PAUSED',
    currentSequence: 0,
    speedMultiplier: 1.0,
    mode: 'NORMALIZED_TRAINING_PLAYBACK'
  };

  private static eventStream: ProjectEventRecord[] = [];
  private static initialized = false;

  private static initialize(): void {
    if (this.initialized) return;

    this.eventStream = [
      {
        eventId: 'EVT-001',
        projectId: 'REFERENCE-BIM-0001',
        timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
        eventType: 'PROJECT_STAGE_CHANGED',
        agentId: 'PRIME-ORCHESTRATOR-01',
        message: 'Project Stage initialized to SITE_ANALYSIS',
        payload: { stage: 'SITE_ANALYSIS' }
      },
      {
        eventId: 'EVT-001A',
        projectId: 'REFERENCE-BIM-0001',
        timestamp: new Date(Date.now() - 3600000 * 23).toISOString(),
        eventType: 'BIM_OBJECT_CREATED',
        agentId: 'SITE-SURVEY-SPECIALIST-01',
        message: 'Site Reference Control Grid A1 Established',
        payload: {
          component: {
            id: 'BIM-SURVEY-GRID-01',
            type: 'wall',
            system: 'Site',
            floor: 0,
            room: 'SITE',
            assembly: 'Primary Site Survey Control Lines',
            materials: [{ name: 'Survey Datum Markers', specification: 'AISC-SURVEY-01', quantity: 4, unit: 'pts' }],
            geometry: { position: [0, 0, 0], bounds: { min: [-10, 0, -10], max: [20, 0, 20] } }
          }
        }
      },
      {
        eventId: 'EVT-001B',
        projectId: 'REFERENCE-BIM-0001',
        timestamp: new Date(Date.now() - 3600000 * 22).toISOString(),
        eventType: 'BIM_OBJECT_CREATED',
        agentId: 'SITE-SURVEY-SPECIALIST-01',
        message: 'Site Boundary Control Envelope Set',
        payload: {
          component: {
            id: 'BIM-SITE-BOUNDARY-01',
            type: 'wall',
            system: 'Site',
            floor: 0,
            room: 'SITE',
            assembly: 'Property Setback Line Envelope',
            materials: [{ name: 'Monitored Property Line Boundary', specification: 'FBC-2023-SITE', quantity: 1, unit: 'ls' }],
            geometry: { position: [0, 0, 0], bounds: { min: [-15, 0, -15], max: [25, 10, 25] } }
          }
        }
      },
      {
        eventId: 'EVT-001C',
        projectId: 'REFERENCE-BIM-0001',
        timestamp: new Date(Date.now() - 3600000 * 21).toISOString(),
        eventType: 'BIM_OBJECT_CREATED',
        agentId: 'SITE-SURVEY-SPECIALIST-01',
        message: 'Ground Elevation Benchmark Datum Verified',
        payload: {
          component: {
            id: 'BIM-DATUM-BENCHMARK-01',
            type: 'wall',
            system: 'Site',
            floor: 0,
            room: 'SITE',
            assembly: 'NOAA NAVD88 Elevation Datum Monument',
            materials: [{ name: 'Bronze Datum Pin', specification: 'NOAA-NAVD88', quantity: 1, unit: 'ea' }],
            geometry: { position: [0, 0, 0], bounds: { min: [-0.1, -0.1, -0.1], max: [0.1, 0.1, 0.1] } }
          }
        }
      },
      {
        eventId: 'EVT-002',
        projectId: 'REFERENCE-BIM-0001',
        timestamp: new Date(Date.now() - 3600000 * 20).toISOString(),
        eventType: 'BIM_OBJECT_CREATED',
        agentId: 'SITE-SURVEY-SPECIALIST-01',
        message: 'Foundation Slab Poured and Verified',
        payload: {
          component: {
            id: 'BIM-FOUNDATION-SLAB-01',
            type: 'slab',
            system: 'Structural Foundation',
            floor: 0,
            room: 'GROUND',
            assembly: 'Monolithic Slab on Grade',
            materials: [{ name: '4500 PSI C2 Concrete', specification: 'ACI 318-19', quantity: 120, unit: 'cy' }],
            geometry: { position: [0, 0, 0], bounds: { min: [-10, -0.5, -10], max: [20, 0, 20] } }
          }
        }
      },
      {
        eventId: 'EVT-003',
        projectId: 'REFERENCE-BIM-0001',
        timestamp: new Date(Date.now() - 3600000 * 16).toISOString(),
        eventType: 'PROJECT_STAGE_CHANGED',
        agentId: 'PRIME-ORCHESTRATOR-01',
        message: 'Project Stage advanced to STRUCTURAL_ERECTED',
        payload: { stage: 'STRUCTURAL_ERECTED' }
      },
      {
        eventId: 'EVT-004',
        projectId: 'REFERENCE-BIM-0001',
        timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
        eventType: 'BIM_OBJECT_CREATED',
        agentId: 'STEEL-ERECTION-SPECIALIST-01',
        message: 'Steel Column C1 Erected at Grid A1',
        payload: {
          component: {
            id: 'BIM-COL-C1',
            type: 'column',
            system: 'Structural Steel Frame',
            floor: 1,
            room: 'CORRIDOR-101',
            assembly: 'W8x31 Steel Column',
            materials: [{ name: 'A992 Structural Steel', specification: 'AISC 360', quantity: 1, unit: 'ea' }],
            geometry: { position: [0, 1.5, 0], bounds: { min: [-0.5, 0, -0.5], max: [0.5, 3.5, 0.5] } }
          }
        }
      },
      {
        eventId: 'EVT-005',
        projectId: 'REFERENCE-BIM-0001',
        timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
        eventType: 'PROJECT_STAGE_CHANGED',
        agentId: 'PRIME-ORCHESTRATOR-01',
        message: 'Project Stage advanced to MEP_ROUGH_IN',
        payload: { stage: 'MEP_ROUGH_IN' }
      },
      {
        eventId: 'EVT-006',
        projectId: 'REFERENCE-BIM-0001',
        timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
        eventType: 'BIM_OBJECT_CREATED',
        agentId: 'PLUMBING-SPECIALIST-01',
        message: '3-inch DWV Sanitary Pipe Installed',
        payload: {
          component: {
            id: 'BIM-PIPE-DWV-101',
            type: 'pipe',
            system: 'Plumbing DWV',
            floor: 1,
            room: 'CORRIDOR-101',
            assembly: '3-inch PVC DWV Pipe',
            materials: [{ name: 'Schedule 40 PVC', specification: 'ASTM D2665', quantity: 25, unit: 'ft' }],
            geometry: { position: [2, 2.5, 5], bounds: { min: [0, 2.4, 0], max: [4, 2.6, 10] } }
          }
        }
      }
    ];

    this.initialized = true;
  }

  public static appendEvent(projectId: string, event: Omit<ProjectEventRecord, 'eventId' | 'timestamp'>): ProjectEventRecord {
    this.initialize();
    const eventId = `EVT-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const fullEvent: ProjectEventRecord = {
      eventId,
      projectId,
      timestamp: new Date().toISOString(),
      ...event
    };

    this.eventStream.push(fullEvent);
    return fullEvent;
  }

  public static getEventStream(projectId: string): ProjectEventRecord[] {
    this.initialize();
    return this.eventStream.filter(e => e.projectId === projectId || projectId === 'ALL');
  }

  /**
   * STAGE J: Reconstruct complete state from EMPTY_INITIAL_STATE + EVENT_STREAM[0..targetEventSequence]
   */
  public static reconstructProjectAtEvent(projectId: string, targetEventSequence: number): ReplayFrameState {
    this.initialize();
    const events = this.getEventStream(projectId);
    const totalEvents = events.length;
    const clampedSeq = Math.max(0, Math.min(targetEventSequence, totalEvents - 1));
    const eventsToApply = events.slice(0, clampedSeq + 1);

    // Initial Empty Project State
    const reconstructedComponents: Map<string, BIMComponent> = new Map();
    const activeTasks: Map<string, AgentTaskRecord> = new Map();
    const materialStates: Map<string, MaterialStateRecord> = new Map();
    const inspectionTickets: Map<string, InspectionTicket> = new Map();
    const issues: Map<string, IssueRecord> = new Map();
    const repairs: Map<string, RepairRecord> = new Map();
    const managerReviews: ManagerReviewRecord[] = [];
    const knowledgeRequests: KnowledgeRequestRecord[] = [];
    const decisions: PrimeDecisionRecord[] = [];
    const spatialActions: SpatialActionRecord[] = ConstructionMethodEngine.getSpatialActions();

    let completionPct = 0;
    let currentStage = 'SITE_ANALYSIS';

    // Reduce Event Stream
    eventsToApply.forEach((evt, idx) => {
      if (evt.eventType === 'PROJECT_STAGE_CHANGED' && evt.payload?.stage) {
        currentStage = evt.payload.stage;
        completionPct = Math.min(100, Math.round(((idx + 1) / totalEvents) * 100));
      }

      if (evt.eventType === 'BIM_OBJECT_CREATED' && evt.payload?.component) {
        const comp = evt.payload.component as BIMComponent;
        reconstructedComponents.set(comp.id, comp);
      }

      if (evt.eventType === 'BIM_OBJECT_MODIFIED' && evt.payload?.component) {
        const comp = evt.payload.component as BIMComponent;
        reconstructedComponents.set(comp.id, comp);
      }

      if (evt.eventType === 'BIM_OBJECT_REMOVED' && evt.affectedObjectIds) {
        evt.affectedObjectIds.forEach(id => reconstructedComponents.delete(id));
      }

      if (evt.payload?.task) {
        const t = evt.payload.task as AgentTaskRecord;
        activeTasks.set(t.taskId, t);
      }

      if (evt.payload?.materialState) {
        const m = evt.payload.materialState as MaterialStateRecord;
        materialStates.set(m.id, m);
      }

      if (evt.payload?.inspectionTicket) {
        const ticket = evt.payload.inspectionTicket as InspectionTicket;
        inspectionTickets.set(ticket.id, ticket);
      }

      if (evt.payload?.issue) {
        const iss = evt.payload.issue as IssueRecord;
        issues.set(iss.id, iss);
      }

      if (evt.payload?.repair) {
        const rep = evt.payload.repair as RepairRecord;
        repairs.set(rep.id, rep);
      }

      if (evt.payload?.managerReview) {
        managerReviews.push(evt.payload.managerReview);
      }

      if (evt.payload?.knowledgeRequest) {
        knowledgeRequests.push(evt.payload.knowledgeRequest);
      }

      if (evt.decision) {
        decisions.push({
          id: `DEC-${evt.eventId}`,
          projectId,
          timestamp: evt.timestamp,
          primeRole: evt.agentRole || 'PRIME-ORCHESTRATOR-01',
          decisionType: evt.eventType,
          rationale: evt.decision,
          affectedDisciplines: ['Management', 'Structural']
        });
      }
    });

    const currentEvent = events[clampedSeq] || {
      eventId: 'EVT-INITIAL',
      projectId,
      timestamp: new Date().toISOString(),
      eventType: 'PROJECT_STAGE_CHANGED',
      agentId: 'PRIME-ORCHESTRATOR-01',
      message: 'Project Initialized at Event 0'
    };

    const allCompArray = Array.from(reconstructedComponents.values());
    const physicalComps = allCompArray.filter(c => c.system !== 'Site' && !c.id.includes('GRID') && !c.id.includes('BOUNDARY') && !c.id.includes('DATUM'));
    const referenceEntities = allCompArray.filter(c => c.system === 'Site' || c.id.includes('GRID') || c.id.includes('BOUNDARY') || c.id.includes('DATUM'));

    return {
      eventSequence: clampedSeq,
      totalEvents,
      currentEvent,
      timestamp: currentEvent.timestamp,
      projectSummary: {
        id: projectId,
        name: `Hermes Digital Twin (${projectId})`,
        stage: currentStage,
        completionPct
      },
      components: allCompArray,
      componentCount: allCompArray.length,
      physicalComponentCount: physicalComps.length,
      referenceEntityCount: referenceEntities.length,
      activeTasks: Array.from(activeTasks.values()),
      spatialActions,
      materialStates: Array.from(materialStates.values()),
      inspectionTickets: Array.from(inspectionTickets.values()),
      issues: Array.from(issues.values()),
      repairs: Array.from(repairs.values()),
      managerReviews,
      knowledgeRequests,
      decisions
    };
  }

  public static setPlaybackControls(
    projectId: string,
    action: 'PLAY' | 'PAUSE' | 'STEP_FORWARD' | 'STEP_BACKWARD' | 'SCRUB',
    speedMultiplier?: number,
    scrubSequence?: number
  ): {
    status: string;
    currentSequence: number;
    speedMultiplier: number;
  } {
    const events = this.getEventStream(projectId);
    const maxSeq = Math.max(0, events.length - 1);

    if (action === 'PLAY') {
      this.playbackState.status = 'PLAYING';
    } else if (action === 'PAUSE') {
      this.playbackState.status = 'PAUSED';
    } else if (action === 'STEP_FORWARD') {
      this.playbackState.status = 'PAUSED';
      this.playbackState.currentSequence = Math.min(maxSeq, this.playbackState.currentSequence + 1);
    } else if (action === 'STEP_BACKWARD') {
      this.playbackState.status = 'PAUSED';
      this.playbackState.currentSequence = Math.max(0, this.playbackState.currentSequence - 1);
    } else if (action === 'SCRUB' && typeof scrubSequence === 'number') {
      this.playbackState.status = 'PAUSED';
      this.playbackState.currentSequence = Math.max(0, Math.min(maxSeq, scrubSequence));
    }

    if (speedMultiplier) {
      this.playbackState.speedMultiplier = speedMultiplier;
    }

    return {
      status: this.playbackState.status,
      currentSequence: this.playbackState.currentSequence,
      speedMultiplier: this.playbackState.speedMultiplier
    };
  }
}
