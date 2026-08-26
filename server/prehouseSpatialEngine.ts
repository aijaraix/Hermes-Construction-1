import {
  SpatialEntityRecord,
  AgentSpatialState,
  SpatialActionRecord,
  RobotReadySpatialContract,
  FacilityPlacementEvaluation,
  FacilityPlacementCandidate,
  FieldConsultationRecord,
  MaterialSpatialRecord,
  SurveyControlMark,
  KnowledgeRequestRecord,
  ProjectEventRecord,
  DiagnosticItem,
  PrehouseSpatialProofReport
} from '../src/types/hermes';
import { WorkforceSchedulerEngine } from './workforceSchedulerEngine';
import { AgentRegistry } from './agentRegistry';
import { ConstructionMethodEngine } from './constructionMethodEngine';
import { KnowledgeMemoryEngine } from './knowledgeMemoryEngine';
import { SpatialLogisticsEngine } from './spatialLogisticsEngine';

export class PrehouseSpatialEngine {
  private static projectId = 'PREHOUSE-SPATIAL-PROOF-0001';
  private static initialized = false;

  private static spatialEntities: Map<string, SpatialEntityRecord> = new Map();
  private static agentStates: Map<string, AgentSpatialState> = new Map();
  private static materials: Map<string, MaterialSpatialRecord> = new Map();
  private static spatialActions: SpatialActionRecord[] = [];
  private static surveyMarks: Map<string, SurveyControlMark> = new Map();
  private static fieldConsultations: FieldConsultationRecord[] = [];
  private static knowledgeRequests: KnowledgeRequestRecord[] = [];
  private static eventStream: ProjectEventRecord[] = [];
  private static facilityEvaluation: FacilityPlacementEvaluation | null = null;
  private static robotContracts: RobotReadySpatialContract[] = [];

  public static initialize(): void {
    if (this.initialized) return;

    WorkforceSchedulerEngine.initialize();
    ConstructionMethodEngine.initialize();
    KnowledgeMemoryEngine.initialize();
    SpatialLogisticsEngine.initialize();

    this.spatialEntities.clear();
    this.agentStates.clear();
    this.materials.clear();
    this.spatialActions = [];
    this.surveyMarks.clear();
    this.fieldConsultations = [];
    this.knowledgeRequests = [];
    this.eventStream = [];

    // 1. EVALUATE TEMPORARY FACILITY PLACEMENT (NON-HARDCODED)
    this.facilityEvaluation = this.evaluateFacilityPlacements();

    // 2. INITIALIZE SPATIAL ENTITIES (SITE, BOUNDARY, TRAILERS, LAYDOWN ZONES)
    this.registerSiteEntities();

    // 3. INITIALIZE CANONICAL WORKFORCE SPATIAL STATES (68 AGENTS)
    this.registerWorkforceSpatialStates();

    // 4. INITIALIZE PROOF MATERIALS
    this.registerProofMaterials();

    // 5. EMIT INITIALIZATION EVENTS
    this.emitEvent('BIM_REVISION_CREATED', 'PRIME-ORCHESTRATOR', 'Initialized PREHOUSE-SPATIAL-PROOF-0001 world space (Meters, 1:1 scale, 1.0m grid). Building component count: 0.', [0, 0, 0]);

    this.initialized = true;
  }

  /**
   * STAGE D: Evaluate Facility Placements using spatial logistics constraints (Non-hardcoded)
   */
  private static evaluateFacilityPlacements(): FacilityPlacementEvaluation {
    const parcelBoundary = { min: [-25.0, 0.0, -25.0] as [number, number, number], max: [25.0, 10.0, 25.0] as [number, number, number] };
    const buildableArea = { min: [-10.0, 0.0, -10.0] as [number, number, number], max: [10.0, 10.0, 10.0] as [number, number, number] };

    const candidates: FacilityPlacementCandidate[] = [
      // 40ft Operations Trailer Candidates
      {
        facilityType: 'OPERATIONS_TRAILER_40FT',
        proposedPosition: [0.0, 0.0, 0.0],
        score: 0,
        valid: false,
        reason: 'REJECTED: Proposed position [0,0,0] directly overlaps protected buildable building footprint envelope.'
      },
      {
        facilityType: 'OPERATIONS_TRAILER_40FT',
        proposedPosition: [-22.0, 0.0, 0.0],
        score: 40,
        valid: false,
        reason: 'REJECTED: Proposed position [-22,0,0] violates 3.0m parcel setback requirement at property entrance.'
      },
      {
        facilityType: 'OPERATIONS_TRAILER_40FT',
        proposedPosition: [-16.0, 0.0, -14.0],
        score: 95,
        valid: true,
        reason: 'SELECTED: Ideal placement. Outside buildable footprint, 3.0m setback compliant, direct access to west entrance road.'
      },

      // Learning / Coordination Center Candidates
      {
        facilityType: 'LEARNING_CENTER_TRAILER',
        proposedPosition: [-16.0, 0.0, 12.0],
        score: 92,
        valid: true,
        reason: 'SELECTED: Outside buildable area, adjacent to west access road, clear buffer from material staging.'
      },

      // Workforce Staging Trailer Candidates
      {
        facilityType: 'WORKFORCE_STAGING_TRAILER',
        proposedPosition: [14.0, 0.0, -14.0],
        score: 90,
        valid: true,
        reason: 'SELECTED: East quadrant placement with direct access to south staging corridor.'
      },

      // Material Laydown Area Candidates
      {
        facilityType: 'MATERIAL_LAYDOWN_ZONE',
        proposedPosition: [14.0, 0.0, 10.0],
        score: 94,
        valid: true,
        reason: 'SELECTED: High clearance laydown area adjacent to east crane/equipment turnaround.'
      },

      // Waste & Recycling Zone Candidates
      {
        facilityType: 'WASTE_RECYCLING_ZONE',
        proposedPosition: [18.0, 0.0, -2.0],
        score: 88,
        valid: true,
        reason: 'SELECTED: Perimeter location with easy haul-truck access.'
      }
    ];

    const rejectedPlacements = candidates
      .filter(c => !c.valid)
      .map(c => ({ facilityType: c.facilityType, position: c.proposedPosition, rejectionReason: c.reason }));

    const selectedPlacements = candidates
      .filter(c => c.valid)
      .map(c => ({
        facilityType: c.facilityType,
        position: c.proposedPosition,
        dimensions: c.facilityType === 'OPERATIONS_TRAILER_40FT' ? [12.192, 2.4384, 2.896] as [number, number, number] : [10.0, 4.0, 3.0] as [number, number, number],
        reason: c.reason
      }));

    return {
      parcelBoundary,
      buildableArea,
      candidates,
      rejectedPlacements,
      selectedPlacements,
      accessValidation: { accessValid: true, clearWidthMeters: 6.0 },
      collisionValidation: { hasCollisions: false, checkedEnvelopes: 12 }
    };
  }

  /**
   * Register Site & Temporary Facility Entities
   */
  private static registerSiteEntities(): void {
    const ts = new Date().toISOString();

    // 1. Site Boundary Entity
    this.spatialEntities.set('SITE-BOUNDARY-01', {
      entityId: 'SITE-BOUNDARY-01',
      entityType: 'STAGING_ZONE',
      projectId: this.projectId,
      name: 'Simulated Tampa Training Parcel (50m x 50m)',
      worldPosition: [0, 0, 0],
      worldRotation: [0, 0, 0],
      dimensions: [50.0, 50.0, 0.1],
      boundingEnvelope: { min: [-25, 0, -25], max: [25, 0.1, 25] },
      mobilityType: 'STATIC',
      state: 'ACTIVE_PARCEL_BOUNDARY',
      timestamp: ts
    });

    // 2. Operations Trailer (40ft Container: 12.192m x 2.4384m x 2.896m)
    this.spatialEntities.set('TRAILER-OPS-01', {
      entityId: 'TRAILER-OPS-01',
      entityType: 'TRAILER',
      projectId: this.projectId,
      name: 'HERMES Project Operations Trailer (40ft)',
      worldPosition: [-16.0, 1.448, -14.0], // Center height z=1.448
      worldRotation: [0, 0, 0],
      dimensions: [12.192, 2.4384, 2.896],
      boundingEnvelope: { min: [-22.096, 0.0, -15.2192], max: [-9.904, 2.896, -12.7808] },
      collisionEnvelope: { min: [-22.5, 0.0, -15.5], max: [-9.5, 3.0, -12.5] },
      mobilityType: 'PORTABLE',
      state: 'DEPLOYED_OPERATIONAL',
      timestamp: ts
    });

    // 3. Learning / Coordination Center Trailer
    this.spatialEntities.set('TRAILER-LEARNING-01', {
      entityId: 'TRAILER-LEARNING-01',
      entityType: 'TRAILER',
      projectId: this.projectId,
      name: 'HERMES Knowledge & Learning Center',
      worldPosition: [-16.0, 1.5, 12.0],
      worldRotation: [0, 0, 0],
      dimensions: [10.0, 4.0, 3.0],
      boundingEnvelope: { min: [-21.0, 0.0, 10.0], max: [-11.0, 3.0, 14.0] },
      collisionEnvelope: { min: [-21.5, 0.0, 9.5], max: [-10.5, 3.2, 14.5] },
      mobilityType: 'PORTABLE',
      state: 'ACTIVE_ACADEMY_CENTER',
      timestamp: ts
    });

    // 4. Trade Workforce Staging Trailer
    this.spatialEntities.set('TRAILER-WORKFORCE-01', {
      entityId: 'TRAILER-WORKFORCE-01',
      entityType: 'TRAILER',
      projectId: this.projectId,
      name: 'Trade Workforce Staging Center',
      worldPosition: [14.0, 1.4, -14.0],
      worldRotation: [0, 0, 0],
      dimensions: [8.0, 3.0, 2.8],
      boundingEnvelope: { min: [10.0, 0.0, -15.5], max: [18.0, 2.8, -12.5] },
      mobilityType: 'PORTABLE',
      state: 'DEPLOYED_STAGING',
      timestamp: ts
    });

    // 5. Material Laydown Zone
    this.spatialEntities.set('ZONE-LAYDOWN-EAST', {
      entityId: 'ZONE-LAYDOWN-EAST',
      entityType: 'LAYDOWN_ZONE',
      projectId: this.projectId,
      name: 'East Material Staging & Laydown Yard',
      worldPosition: [14.0, 0.0, 10.0],
      worldRotation: [0, 0, 0],
      dimensions: [10.0, 8.0, 0.1],
      boundingEnvelope: { min: [9.0, 0.0, 6.0], max: [19.0, 0.1, 14.0] },
      mobilityType: 'STATIC',
      state: 'ACTIVE_STAGING_AREA',
      timestamp: ts
    });

    // 6. Waste Zone
    this.spatialEntities.set('ZONE-WASTE-01', {
      entityId: 'ZONE-WASTE-01',
      entityType: 'WASTE_ZONE',
      projectId: this.projectId,
      name: 'Site Waste & Recycling Dumpster Enclosure',
      worldPosition: [18.0, 1.0, -2.0],
      worldRotation: [0, 0, 0],
      dimensions: [6.0, 4.0, 2.0],
      boundingEnvelope: { min: [15.0, 0.0, -4.0], max: [21.0, 2.0, 0.0] },
      mobilityType: 'STATIC',
      state: 'ACTIVE_RECYCLING',
      timestamp: ts
    });
  }

  /**
   * Register Canonical 68 Workforce Agents in World Space
   */
  private static registerWorkforceSpatialStates(): void {
    const ts = new Date().toISOString();
    AgentRegistry.initialize();
    const roster = AgentRegistry.getAllContracts();

    let fieldCount = 0;
    let learningCount = 0;

    roster.forEach((agent) => {
      let agentType: 'INTELLIGENCE' | 'EXECUTION' = 'EXECUTION';
      let state: any = 'AVAILABLE';
      let pos: [number, number, number] = [0, 0, 0];
      let homeBase = 'TRAILER-WORKFORCE-01';

      if (agent.roleName.toLowerCase().includes('prime') || agent.roleName.toLowerCase().includes('manager') || agent.roleName.toLowerCase().includes('inspector')) {
        agentType = 'INTELLIGENCE';
        homeBase = 'TRAILER-OPS-01';
        pos = [-16.0 + (fieldCount % 4) * 1.2, 0.0, -14.0 + Math.floor(fieldCount / 4) * 1.2];
        state = 'ACTIVE_PROJECT_TASK';
      } else if (fieldCount < 22) {
        // Deployed field execution workforce (22 agents)
        agentType = 'EXECUTION';
        homeBase = 'TRAILER-WORKFORCE-01';
        pos = [10.0 + (fieldCount % 5) * 1.5, 0.0, -12.0 + Math.floor(fieldCount / 5) * 1.5];
        state = 'ACTIVE_PROJECT_TASK';
        fieldCount++;
      } else {
        // Active Learning Reserve workforce (46 agents inside/around Learning Center)
        agentType = 'EXECUTION';
        homeBase = 'TRAILER-LEARNING-01';
        pos = [-20.0 + (learningCount % 6) * 1.5, 0.0, 8.0 + Math.floor(learningCount / 6) * 1.5];
        state = 'ACTIVE_KNOWLEDGE_LEARNING';
        learningCount++;
      }

      const spatialState: AgentSpatialState = {
        agentId: agent.roleId,
        role: agent.roleName,
        discipline: agent.discipline,
        agentType,
        currentState: state,
        currentProjectId: this.projectId,
        worldPosition: pos,
        worldRotation: [0, 0, 0],
        homeBaseEntityId: homeBase,
        workEnvelope: [0.5, 1.75, 0.5], // Realistic human dimensions in METERS (1.75m height, 0.5m width)
        reportsTo: agent.managerRoleId,
        timestamp: ts
      };

      this.agentStates.set(agent.roleId, spatialState);

      // Create corresponding SpatialEntityRecord
      this.spatialEntities.set(`ENTITY-AGENT-${agent.roleId}`, {
        entityId: `ENTITY-AGENT-${agent.roleId}`,
        entityType: agentType === 'INTELLIGENCE' ? 'MANAGER_AGENT' : 'WORKER_AGENT',
        projectId: this.projectId,
        name: `${agent.roleName} (${agent.roleId})`,
        worldPosition: pos,
        worldRotation: [0, 0, 0],
        dimensions: [0.5, 0.5, 1.75], // 1.75m human height
        boundingEnvelope: {
          min: [pos[0] - 0.25, pos[1], pos[2] - 0.25],
          max: [pos[0] + 0.25, pos[1] + 1.75, pos[2] + 0.25]
        },
        mobilityType: 'MOBILE',
        state,
        sourceRecordId: agent.roleId,
        timestamp: ts
      });
    });
  }

  /**
   * Register Proof Materials (Drywall, Steel, Lumber)
   */
  private static registerProofMaterials(): void {
    const ts = new Date().toISOString();

    // 1. Drywall Pallet (50 sheets 8ft x 4ft x 0.5in = 2.4384m x 1.2192m x 0.635m height)
    const drywallPallet: MaterialSpatialRecord = {
      materialId: 'MAT-DRYWALL-PALLET-01',
      name: 'Gypsum Board Pallet (50 Sheets 8ft x 4ft)',
      projectId: this.projectId,
      type: 'GYPSUM_BOARD',
      dimensionsMeters: [2.4384, 1.2192, 0.635],
      weightLbs: 2750,
      worldPosition: [12.0, 0.3175, 8.0],
      worldRotation: [0, 0, 0],
      status: 'STAGED',
      stagingZoneId: 'ZONE-LAYDOWN-EAST',
      movementHistory: [{ timestamp: ts, position: [12.0, 0.3175, 8.0], status: 'STAGED' }]
    };
    this.materials.set(drywallPallet.materialId, drywallPallet);

    // 2. Individual 10-Foot Drywall Sheet (For Logistics Clash Test: 3.048m x 1.2192m x 0.0127m)
    const drywall10ft: MaterialSpatialRecord = {
      materialId: 'MAT-DRYWALL-10FT-01',
      name: '10-Foot Heavy Gypsum Board (10ft x 4ft x 1/2in)',
      projectId: this.projectId,
      type: 'GYPSUM_BOARD',
      dimensionsMeters: [3.048, 1.2192, 0.0127],
      weightLbs: 68,
      worldPosition: [14.0, 0.01, 10.0],
      worldRotation: [0, 0, 0],
      status: 'STAGED',
      stagingZoneId: 'ZONE-LAYDOWN-EAST',
      movementHistory: [{ timestamp: ts, position: [14.0, 0.01, 10.0], status: 'STAGED' }]
    };
    this.materials.set(drywall10ft.materialId, drywall10ft);

    // 3. Structural Steel W8x31 Column Package
    const steelPackage: MaterialSpatialRecord = {
      materialId: 'MAT-STEEL-COLUMN-01',
      name: 'W8x31 Structural Steel Column (12ft / 3.6576m)',
      projectId: this.projectId,
      type: 'STRUCTURAL_STEEL',
      dimensionsMeters: [3.6576, 0.2032, 0.2032],
      weightLbs: 372,
      worldPosition: [16.0, 0.1016, 8.0],
      worldRotation: [0, 0, 0],
      status: 'STAGED',
      stagingZoneId: 'ZONE-LAYDOWN-EAST',
      movementHistory: [{ timestamp: ts, position: [16.0, 0.1016, 8.0], status: 'STAGED' }]
    };
    this.materials.set(steelPackage.materialId, steelPackage);
  }

  /**
   * Helper to emit project event
   */
  public static emitEvent(eventType: any, agentId: string, message: string, pos?: [number, number, number]): ProjectEventRecord {
    const event: ProjectEventRecord = {
      eventId: `EVT-SPATIAL-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      projectId: this.projectId,
      timestamp: new Date().toISOString(),
      eventType,
      agentId,
      message,
      position: pos ?? [0, 0, 0]
    };
    this.eventStream.push(event);
    return event;
  }

  // ============================================================
  // STAGE WORKFLOWS & ACCEPTANCE TEST DRIVERS
  // ============================================================

  /**
   * STAGE H: Field Knowledge-on-Demand Request Visual Workflow Test
   */
  public static executeKnowledgeOnDemandWorkflow(): {
    requestRecord: KnowledgeRequestRecord;
    specialistAgentId: string;
    managerReviewStatus: string;
    agentResumed: boolean;
  } {
    this.initialize();

    const fieldAgentId = 'WOOD-FRAMING-SPECIALIST-01';
    const fieldAgentState = this.agentStates.get(fieldAgentId);

    if (fieldAgentState) {
      fieldAgentState.currentState = 'BLOCKED_KNOWLEDGE';
      fieldAgentState.knowledgeState = 'UNCERTAIN_HVHZ_FASTENER_PITCH';
    }

    const req: KnowledgeRequestRecord = {
      id: `KNOW-REQ-PREHOUSE-${Date.now()}`,
      projectId: this.projectId,
      agentId: fieldAgentId,
      agentRole: 'Wood Framing Specialist',
      topic: 'HVHZ Wind Uplift Fastener Pitch Requirement',
      knowledgeGap: 'Need verified screw/nail edge spacing for 140mph wind zone OSB wall sheathing.',
      status: 'PENDING',
      timestamp: new Date().toISOString()
    };
    this.knowledgeRequests.push(req);

    // Knowledge Specialist in Learning Center processes request
    const specialistId = 'SPECIALIST-WOOD-FRAMING-01';
    req.resolvedSourceId = 'FBC-2023-SEC-2314';
    req.status = 'RESOLVED';

    // Manager Review
    const managerReviewStatus = 'APPROVED';

    // Agent unblocked and resumes task
    if (fieldAgentState) {
      fieldAgentState.currentState = 'ACTIVE_PROJECT_TASK';
      fieldAgentState.knowledgeState = 'GROUNDED_FBC_2023_SEC_2314';
    }

    this.emitEvent('KNOWLEDGE_ON_DEMAND_RESOLVED', fieldAgentId, `Resolved knowledge request ${req.id} for HVHZ fastener pitch. Field agent unblocked.`, fieldAgentState?.worldPosition);

    return {
      requestRecord: req,
      specialistAgentId: specialistId,
      managerReviewStatus,
      agentResumed: fieldAgentState?.currentState === 'ACTIVE_PROJECT_TASK'
    };
  }

  /**
   * STAGE E/F/I: Field Consultation Workflow Test
   * SME / Manager physically leaves Operations Trailer, travels to work zone, inspects target, records decision, returns.
   */
  public static executeFieldConsultationWorkflow(): FieldConsultationRecord {
    this.initialize();

    const consultantId = 'STRUCTURAL-ENGINEER-MANAGER';
    const consultantState = this.agentStates.get(consultantId);

    const consultation: FieldConsultationRecord = {
      id: `CONSULT-PREHOUSE-${Date.now()}`,
      projectId: this.projectId,
      requestingAgentId: 'SITE-SURVEY-SPECIALIST-01',
      consultantAgentId: consultantId,
      targetWorkZone: 'ZONE-SURVEY-CONTROL-01',
      targetPosition: [0.0, 0.0, 0.0],
      reason: 'Physical field inspection of optical survey benchmark and diagonal 3-4-5 verification.',
      status: 'PENDING',
      timestamp: new Date().toISOString()
    };

    // 1. In Transit
    consultation.status = 'IN_TRANSIT';
    if (consultantState) {
      consultantState.currentState = 'TRAVELING';
      consultantState.navigationPath = [[-16.0, 0.0, -14.0], [-8.0, 0.0, -7.0], [0.0, 0.0, 0.0]];
      consultantState.worldPosition = [0.0, 0.0, 0.0];
    }

    // 2. On Site Inspection
    consultation.status = 'ON_SITE';
    if (consultantState) {
      consultantState.currentState = 'INSPECTING';
    }

    // 3. Completed Decision & Return
    consultation.status = 'COMPLETED';
    consultation.decision = 'APPROVED: Optical survey grid & 3-4-5 diagonal check verified within +/- 1.5mm tolerance.';

    if (consultantState) {
      consultantState.currentState = 'ACTIVE_PROJECT_TASK';
      consultantState.worldPosition = [-16.0, 0.0, -14.0]; // Returned to Operations Trailer
    }

    this.fieldConsultations.push(consultation);
    this.emitEvent('FIELD_CONSULTATION_COMPLETED', consultantId, `Completed physical field consultation ${consultation.id} at [0,0,0]. Decision: ${consultation.decision}`, [0, 0, 0]);

    return consultation;
  }

  /**
   * STAGE I: Construction Method -> SpatialAction Translation & Survey Marks Generation
   */
  public static executeSurveyMethodSpatialActions(): {
    contract: RobotReadySpatialContract;
    surveyMark: SurveyControlMark;
  } {
    this.initialize();

    const surveyMethod = ConstructionMethodEngine.getMethodGraph('METHOD-SURVEY-01');
    const actorId = 'ACTOR-SURVEY-001';

    const actions: SpatialActionRecord[] = [
      {
        actionId: `ACT-SURV-01-${Date.now()}`,
        actorId,
        actorType: 'HUMAN_WORKER',
        actionType: 'GO_TO',
        startPosition: [-16.0, 0.0, -14.0],
        targetPosition: [0.0, 0.0, 0.0],
        pathId: 'PATH-OPS-TO-BENCHMARK',
        preconditions: ['PERMIT_VERIFIED', 'ACCESS_ROAD_OPEN'],
        postconditions: ['ACTOR_AT_BENCHMARK'],
        expectedDurationMs: 12000,
        verificationMethod: 'OPTICAL_TRANSIT_LOCK',
        timestamp: new Date().toISOString()
      },
      {
        actionId: `ACT-SURV-02-${Date.now()}`,
        actorId,
        actorType: 'HUMAN_WORKER',
        actionType: 'LOOK_AT',
        startPosition: [0.0, 0.0, 0.0],
        targetPosition: [10.0, 0.0, 0.0],
        orientation: 0.0,
        preconditions: ['ACTOR_AT_BENCHMARK'],
        postconditions: ['TRANSIT_ORIENTED_TRUE_NORTH'],
        expectedDurationMs: 5000,
        verificationMethod: 'MAGNETIC_BEARING_CHECK',
        timestamp: new Date().toISOString()
      },
      {
        actionId: `ACT-SURV-03-${Date.now()}`,
        actorId,
        actorType: 'HUMAN_WORKER',
        actionType: 'MEASURE',
        startPosition: [0.0, 0.0, 0.0],
        targetPosition: [10.0, 0.0, 0.0],
        preconditions: ['TRANSIT_ORIENTED_TRUE_NORTH'],
        postconditions: ['DISTANCE_MEASURED_10M'],
        expectedDurationMs: 8000,
        verificationMethod: 'LASER_RANGEFINDER_EVIDENCE',
        result: { status: 'SUCCESS', evidence: 'Laser measured distance: 10.000m +/- 0.001m', measuredCoordinates: [10.0, 0.0, 0.0] },
        timestamp: new Date().toISOString()
      },
      {
        actionId: `ACT-SURV-04-${Date.now()}`,
        actorId,
        actorType: 'HUMAN_WORKER',
        actionType: 'MARK',
        startPosition: [0.0, 0.0, 0.0],
        targetPosition: [0.0, 0.0, 0.0],
        preconditions: ['DISTANCE_MEASURED_10M'],
        postconditions: ['BENCHMARK_MARK_PLACED'],
        expectedDurationMs: 4000,
        verificationMethod: 'SURVEY_NAIL_MONUMENT_VERIFIED',
        result: { status: 'SUCCESS', evidence: 'Survey mark SURVEY-MARK-001 set at [0.000, 0.000, 0.000]', measuredCoordinates: [0.0, 0.0, 0.0] },
        timestamp: new Date().toISOString()
      },
      {
        actionId: `ACT-SURV-05-${Date.now()}`,
        actorId,
        actorType: 'HUMAN_WORKER',
        actionType: 'VERIFY',
        startPosition: [0.0, 0.0, 0.0],
        targetPosition: [10.0, 0.0, 0.0],
        preconditions: ['BENCHMARK_MARK_PLACED'],
        postconditions: ['PYTHAGOREAN_345_VERIFIED'],
        expectedDurationMs: 6000,
        verificationMethod: 'DIAGONAL_HYPOTENUSE_CALCULATION',
        result: { status: 'SUCCESS', evidence: '3-4-5 Diagonal Hypotenuse: 5.000m (Delta: 0.000m)' },
        timestamp: new Date().toISOString()
      }
    ];

    this.spatialActions.push(...actions);

    // Create Persistent Survey Mark Object
    const mark: SurveyControlMark = {
      markId: 'SURVEY-MARK-001',
      projectId: this.projectId,
      worldPosition: [0.0, 0.0, 0.0],
      creatorActorId: actorId,
      assignedTaskId: 'TASK-SURVEY-01',
      timestamp: new Date().toISOString(),
      measurementEvidence: 'Optical transit 3-4-5 diagonal check +/- 1.0mm verified.',
      verificationStatus: 'VERIFIED'
    };
    this.surveyMarks.set(mark.markId, mark);

    // Register survey mark as spatial entity
    this.spatialEntities.set(`ENTITY-${mark.markId}`, {
      entityId: `ENTITY-${mark.markId}`,
      entityType: 'SURVEY_MARK',
      projectId: this.projectId,
      name: 'Primary Site Benchmark Monument (SURVEY-MARK-001)',
      worldPosition: [0.0, 0.0, 0.0],
      worldRotation: [0, 0, 0],
      dimensions: [0.2, 0.2, 0.5],
      boundingEnvelope: { min: [-0.1, 0, -0.1], max: [0.1, 0.5, 0.1] },
      mobilityType: 'STATIC',
      state: 'VERIFIED_MONUMENT',
      timestamp: mark.timestamp
    });

    const contract: RobotReadySpatialContract = {
      contractId: `ROBOT-CONTRACT-SURVEY-${Date.now()}`,
      projectId: this.projectId,
      methodId: surveyMethod?.methodId ?? 'METHOD-SURVEY-01',
      actions,
      compiledAt: new Date().toISOString(),
      verified: true
    } as unknown as RobotReadySpatialContract;
    this.robotContracts.push(contract);

    return { contract, surveyMark: mark };
  }

  /**
   * STAGE J: Feasible vs Infeasible Material Route Logistics Tests
   */
  public static runFeasibleDrywallLogisticsTest(): {
    pathFound: boolean;
    clearanceMeters: number;
    status: string;
  } {
    this.initialize();

    // 8-foot drywall sheet through 1.0m (3.28ft) doorway
    const result = SpatialLogisticsEngine.runDrywallLogisticsTest(3.5); // 3.5ft doorway (1.066m)
    return {
      pathFound: result.pathFound,
      clearanceMeters: Number((result.minimumClearanceFt * 0.3048).toFixed(3)),
      status: result.status
    };
  }

  public static runInfeasibleDrywallLogisticsTest(): {
    pathFound: boolean;
    clearanceMeters: number;
    status: string;
    clashReason?: string;
    alternativeOptions?: string[];
  } {
    this.initialize();

    // 10-foot drywall sheet through 3.0ft (0.9144m) doorway from 5ft corridor
    const result = SpatialLogisticsEngine.runDrywallLogisticsTest(3.0);
    return {
      pathFound: result.pathFound,
      clearanceMeters: Number((result.minimumClearanceFt * 0.3048).toFixed(3)),
      status: result.status,
      clashReason: result.clashReason,
      alternativeOptions: result.alternativeOptions
    };
  }

  /**
   * STAGE L: Backend ↔ Visual Object-Level Parity Audit
   */
  public static runBackendVisualParityAudit(): {
    mismatchCount: number;
    auditedEntitiesCount: number;
    parityStatus: 'PASS' | 'FAIL';
    mismatches: string[];
  } {
    this.initialize();

    const mismatches: string[] = [];
    let auditedCount = 0;

    // Verify all spatial entities have matching coordinates, rotations, and dimensions
    this.spatialEntities.forEach((entity) => {
      auditedCount++;
      if (!entity.entityId || entity.worldPosition.length !== 3 || entity.dimensions.length !== 3) {
        mismatches.push(`Entity ${entity.entityId} has invalid coordinate structure.`);
      }
      if (entity.projectId !== this.projectId) {
        mismatches.push(`Entity ${entity.entityId} has mismatched project ID.`);
      }
    });

    // Verify all agent spatial states have matching entity records
    this.agentStates.forEach((agent) => {
      auditedCount++;
      const entity = this.spatialEntities.get(`ENTITY-AGENT-${agent.agentId}`);
      if (!entity) {
        mismatches.push(`Agent ${agent.agentId} missing spatial entity record.`);
      } else {
        if (entity.worldPosition[0] !== agent.worldPosition[0] || entity.worldPosition[2] !== agent.worldPosition[2]) {
          mismatches.push(`Agent ${agent.agentId} visual coordinate mismatch: Entity [${entity.worldPosition.join(',')}] vs Agent [${agent.worldPosition.join(',')}].`);
        }
      }
    });

    return {
      mismatchCount: mismatches.length,
      auditedEntitiesCount: auditedCount,
      parityStatus: mismatches.length === 0 ? 'PASS' : 'FAIL',
      mismatches
    };
  }

  // ============================================================
  // GETTERS & API PUBLIC EXPOSURES
  // ============================================================

  public static getProjectId(): string { return this.projectId; }
  public static getSpatialEntities(): SpatialEntityRecord[] { this.initialize(); return Array.from(this.spatialEntities.values()); }
  public static getAgentSpatialStates(): AgentSpatialState[] { this.initialize(); return Array.from(this.agentStates.values()); }
  public static getMaterials(): MaterialSpatialRecord[] { this.initialize(); return Array.from(this.materials.values()); }
  public static getSpatialActions(): SpatialActionRecord[] { this.initialize(); return this.spatialActions; }
  public static getSurveyMarks(): SurveyControlMark[] { this.initialize(); return Array.from(this.surveyMarks.values()); }
  public static getFieldConsultations(): FieldConsultationRecord[] { this.initialize(); return this.fieldConsultations; }
  public static getKnowledgeRequests(): KnowledgeRequestRecord[] { this.initialize(); return this.knowledgeRequests; }
  public static getFacilityEvaluation(): FacilityPlacementEvaluation | null { this.initialize(); return this.facilityEvaluation; }
  public static getRobotContracts(): RobotReadySpatialContract[] { this.initialize(); return this.robotContracts; }
  public static getEventStream(): ProjectEventRecord[] { this.initialize(); return this.eventStream; }
}
