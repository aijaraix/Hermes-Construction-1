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
  BIMComponent,
  BOMItem
} from '../src/types/hermes';
import { WorkforceSchedulerEngine } from './workforceSchedulerEngine';
import { AgentRegistry } from './agentRegistry';
import { ConstructionMethodEngine } from './constructionMethodEngine';
import { KnowledgeMemoryEngine } from './knowledgeMemoryEngine';
import { SpatialLogisticsEngine } from './spatialLogisticsEngine';

export interface CustomerInteractionRecord {
  id: string;
  timestamp: string;
  speaker: 'MOCK-CUSTOMER-HOUSE-0002' | 'PROJECT-PRIME' | 'SYSTEM';
  category: 'CUSTOMER_PREFERENCE' | 'ENGINEERING_DECISION' | 'CODE_REQUIREMENT' | 'ACADEMY_ASSUMPTION';
  questionOrTopic: string;
  response: string;
  status: 'PERSISTED' | 'VERIFIED';
}

export interface ProgramVolumeRecord {
  id: string;
  name: string;
  targetAreaSqFt: number;
  dimensionsMeters: [number, number, number];
  worldPositionMeters: [number, number, number];
  colorHex: string;
  roomType: string;
  adjacentRooms: string[];
}

export class House0002Engine {
  private static projectId = 'ACADEMY-HOUSE-0002';
  private static attemptId = 'ATTEMPT-01';
  private static projectType = 'ACADEMY_AUTONOMOUS_CONSTRUCTION';
  private static startTime = new Date().toISOString();
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

  private static customerInteractions: CustomerInteractionRecord[] = [];
  private static programVolumes: ProgramVolumeRecord[] = [];
  private static bimComponents: BIMComponent[] = [];
  private static bomItems: BOMItem[] = [];
  private static methodGapsDiscovered: string[] = [];

  private static programApproved = false;
  private static structuralSystemSelected = 'CMU Perimeter + Monolithic Stem-Wall Slab + Engineered Wood Trusses';
  private static structuralSystemReason = 'Optimized for Tampa Bay High-Velocity Hurricane Zone (160 MPH wind shear), high groundwater table (4.5 ft), salt corrosion resistance, termite immunity, and local mason trade availability.';
  private static foundationMethod = 'Monolithic Post-Tensioned Concrete Slab with Perimeter Stem Wall & 15-mil Stego Wrap Vapor Barrier';

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
    this.customerInteractions = [];
    this.programVolumes = [];
    this.bimComponents = [];
    this.bomItems = [];
    this.methodGapsDiscovered = [];

    // 1. CALCULATE TEMPORARY FACILITY PLACEMENT FOR HOUSE #2 PARCEL
    this.facilityEvaluation = this.evaluateFacilityPlacements();

    // 2. INITIALIZE HOUSE #2 SITE ENTITIES
    this.registerSiteEntities();

    // 3. REGISTER 68 WORKFORCE AGENTS
    this.registerWorkforceSpatialStates();

    // 4. EVENT 1: MOCK CUSTOMER ARRIVES
    this.recordCustomerArrival();

    // 5. CUSTOMER INTERVIEW
    this.executeCustomerInterview();

    // 6. PROGRAM CREATION & 3D PROGRAM VOLUMES
    this.createSpatialProgram();

    // 7. MOCK CUSTOMER REVIEWS & APPROVES PROGRAM
    this.approveProgram();

    // 8. PRE-DESIGN SITE ANALYSIS & STRUCTURAL DECISION
    this.recordPreDesignAnalysis();

    // 9. RECALL / REGISTER GAP REGISTER
    this.registerMethodGaps();

    // 10. GENERATE DESIGN BIM REVISION 1 (BUILT FROM ZERO!)
    this.createDesignBimRevision1();

    // 11. DERIVE BOM FROM MODEL
    this.deriveBomFromModel();

    // 12. REGISTER WORLD MATERIALS & LOGISTICS
    this.registerHouseMaterials();

    // 13. EXECUTE PHYSICAL SITE SURVEY & CONTROL MARK ACTIONS
    this.executeSiteControlActions();

    // 14. EXECUTE FIELD CONSULTATION
    this.executeFieldConsultation();

    // 15. EXECUTE KNOWLEDGE ON DEMAND WORKFLOW
    this.executeKnowledgeOnDemand();

    // 16. EXECUTE INITIAL FOUNDATION & WALL MASONRY ACTIONS
    this.executeInitialPhysicalConstruction();

    this.initialized = true;
  }

  private static evaluateFacilityPlacements(): FacilityPlacementEvaluation {
    const parcelBoundary = { min: [-30.0, 0.0, -30.0] as [number, number, number], max: [30.0, 10.0, 30.0] as [number, number, number] };
    const buildableArea = { min: [-8.0, 0.0, -6.0] as [number, number, number], max: [8.0, 10.0, 6.0] as [number, number, number] };

    const candidates: FacilityPlacementCandidate[] = [
      {
        id: 'FACILITY-OPS-02',
        facilityId: 'FACILITY-OPS-02',
        facilityType: 'OPERATIONS_TRAILER',
        proposedPosition: [-18.0, 0.0, -15.0],
        dimensions: [12.192, 2.896, 2.438],
        clearanceMeters: 0.5,
        accessPathId: 'ACCESS-OPS-H2',
        clashStatus: 'CLEAR',
        evaluationScore: 98,
        selected: true,
        reason: 'Optimal site entry sightline, 0.5m clearance, 0% slope.'
      } as any,
      {
        id: 'FACILITY-LEARNING-02',
        facilityId: 'FACILITY-LEARNING-02',
        facilityType: 'LEARNING_CENTER',
        proposedPosition: [18.0, 0.0, -15.0],
        dimensions: [12.192, 2.896, 2.438],
        clearanceMeters: 0.5,
        accessPathId: 'ACCESS-LEARN-H2',
        clashStatus: 'CLEAR',
        evaluationScore: 96,
        selected: true,
        reason: 'Quiet perimeter zone adjacent to workforce staging.'
      } as any,
      {
        id: 'FACILITY-WORKFORCE-02',
        facilityId: 'FACILITY-WORKFORCE-02',
        facilityType: 'WORKFORCE_STAGING',
        proposedPosition: [0.0, 0.0, -18.0],
        dimensions: [10.0, 0.0, 10.0],
        clearanceMeters: 1.0,
        accessPathId: 'ACCESS-STAG-H2',
        clashStatus: 'CLEAR',
        evaluationScore: 95,
        selected: true,
        reason: 'Central staging dispatch hub aligned with house main access.'
      } as any,
      {
        id: 'FACILITY-LAYDOWN-02',
        facilityId: 'FACILITY-LAYDOWN-02',
        facilityType: 'MATERIAL_LAYDOWN',
        proposedPosition: [-18.0, 0.0, 12.0],
        dimensions: [15.0, 0.0, 15.0],
        clearanceMeters: 1.0,
        accessPathId: 'ACCESS-LAYD-H2',
        clashStatus: 'CLEAR',
        evaluationScore: 97,
        selected: true,
        reason: 'Direct access to delivery zone, clear crane swing radius.'
      } as any,
      {
        id: 'FACILITY-RECEIVING-02',
        facilityId: 'FACILITY-RECEIVING-02',
        facilityType: 'DELIVERY_RECEIVING',
        proposedPosition: [-22.0, 0.0, -22.0],
        dimensions: [12.0, 0.0, 8.0],
        clearanceMeters: 1.5,
        accessPathId: 'ACCESS-RECV-H2',
        clashStatus: 'CLEAR',
        evaluationScore: 99,
        selected: true,
        reason: 'Direct main gate alignment with 14m truck turning radius.'
      } as any,
      {
        id: 'FACILITY-EQUIPMENT-02',
        facilityId: 'FACILITY-EQUIPMENT-02',
        facilityType: 'EQUIPMENT_STAGING',
        proposedPosition: [18.0, 0.0, 12.0],
        dimensions: [12.0, 0.0, 10.0],
        clearanceMeters: 1.0,
        accessPathId: 'ACCESS-EQPT-H2',
        clashStatus: 'CLEAR',
        evaluationScore: 94,
        selected: true,
        reason: 'High bearing capacity ground soil (2200 psf).'
      } as any,
      {
        id: 'FACILITY-WASTE-02',
        facilityId: 'FACILITY-WASTE-02',
        facilityType: 'WASTE_SALVAGE',
        proposedPosition: [22.0, 0.0, 22.0],
        dimensions: [8.0, 0.0, 6.0],
        clearanceMeters: 1.0,
        accessPathId: 'ACCESS-WSTE-H2',
        clashStatus: 'CLEAR',
        evaluationScore: 92,
        selected: true,
        reason: 'Downwind perimeter location with easy haul-off access.'
      } as any
    ];

    return {
      evaluatedCandidateCount: 35,
      rejectedCandidateCount: 28,
      selectedCandidates: candidates,
      rejectionSummary: [
        { reason: 'Boundary Encroachment (<2m setback)', count: 8 },
        { reason: 'House Footprint Overlap', count: 11 },
        { reason: 'Turning Radius Bottleneck (<12m)', count: 5 },
        { reason: 'High Noise Corridor', count: 4 }
      ],
      parcelBoundary,
      buildableArea
    } as any;
  }

  private static registerSiteEntities(): void {
    const siteEntities: SpatialEntityRecord[] = [
      {
        entityId: 'SITE-H2-PARCEL',
        name: 'ACADEMY-HOUSE-0002 Training Parcel (Tampa, FL)',
        entityType: 'BUILDING_ZONE',
        projectId: this.projectId,
        worldPosition: [0.0, 0.0, 0.0],
        dimensions: [60.0, 0.0, 60.0],
        layer: 'SITE',
        occupancyState: 'FREE',
        allowedActors: ['HUMAN_WORKER', 'TRACKED_WORKER', 'ROBOT'],
        clearanceZoneMeters: 0.0
      } as any,
      {
        entityId: 'SITE-H2-FOOTPRINT',
        name: 'House #2 Building Footprint (12m x 8m = 96 sq m / 1,033 sq ft)',
        entityType: 'CONTAINER_ZONE',
        projectId: this.projectId,
        worldPosition: [0.0, 0.0, 0.0],
        dimensions: [12.0, 0.3, 8.0],
        layer: 'FOUNDATION',
        occupancyState: 'RESERVED',
        allowedActors: ['HUMAN_WORKER', 'TRACKED_WORKER', 'ROBOT'],
        clearanceZoneMeters: 1.0
      } as any,
      {
        entityId: 'FACILITY-OPS-02',
        name: 'House #2 Operations Trailer (OPS-02)',
        entityType: 'BUILDING_ZONE',
        projectId: this.projectId,
        worldPosition: [-18.0, 0.0, -15.0],
        dimensions: [12.192, 2.896, 2.438],
        layer: 'FACILITY',
        occupancyState: 'OCCUPIED',
        allowedActors: ['HUMAN_WORKER'],
        clearanceZoneMeters: 0.5
      } as any,
      {
        entityId: 'FACILITY-LEARNING-02',
        name: 'House #2 Active Learning Center (ACADEMY-02)',
        entityType: 'BUILDING_ZONE',
        projectId: this.projectId,
        worldPosition: [18.0, 0.0, -15.0],
        dimensions: [12.192, 2.896, 2.438],
        layer: 'FACILITY',
        occupancyState: 'OCCUPIED',
        allowedActors: ['HUMAN_WORKER'],
        clearanceZoneMeters: 0.5
      } as any,
      {
        entityId: 'FACILITY-WORKFORCE-02',
        name: 'House #2 Workforce Staging Area (STAGING-02)',
        entityType: 'BUILDING_ZONE',
        projectId: this.projectId,
        worldPosition: [0.0, 0.0, -18.0],
        dimensions: [10.0, 0.0, 10.0],
        layer: 'FACILITY',
        occupancyState: 'OCCUPIED',
        allowedActors: ['HUMAN_WORKER'],
        clearanceZoneMeters: 1.0
      } as any,
      {
        entityId: 'FACILITY-LAYDOWN-02',
        name: 'House #2 Material Laydown Yard (LAYDOWN-02)',
        entityType: 'BUILDING_ZONE',
        projectId: this.projectId,
        worldPosition: [-18.0, 0.0, 12.0],
        dimensions: [15.0, 0.0, 15.0],
        layer: 'FACILITY',
        occupancyState: 'OCCUPIED',
        allowedActors: ['HUMAN_WORKER', 'TRACKED_WORKER', 'ROBOT'],
        clearanceZoneMeters: 1.0
      } as any,
      {
        entityId: 'FACILITY-RECEIVING-02',
        name: 'House #2 Delivery Receiving Area (RECEIVING-02)',
        entityType: 'BUILDING_ZONE',
        projectId: this.projectId,
        worldPosition: [-22.0, 0.0, -22.0],
        dimensions: [12.0, 0.0, 8.0],
        layer: 'FACILITY',
        occupancyState: 'FREE',
        allowedActors: ['HUMAN_WORKER', 'TRACKED_WORKER'],
        clearanceZoneMeters: 1.5
      } as any
    ];

    siteEntities.forEach(e => this.spatialEntities.set(e.entityId, e));
  }

  private static registerWorkforceSpatialStates(): void {
    const fullRoster = AgentRegistry.getAllContracts();

    fullRoster.forEach((contract: any, index) => {
      let homeBase = 'FACILITY-WORKFORCE-02';
      let currentZone = 'ZONE-STAGING-02';
      let worldPos: [number, number, number] = [0.0 + (index % 5) * 0.8, 0.0, -18.0 + Math.floor(index / 5) * 0.8];
      let currentState: any = 'ENGAGED';

      if (contract.agentType === 'EXECUTIVE' || contract.discipline === 'Management') {
        homeBase = 'FACILITY-OPS-02';
        currentZone = 'ZONE-OPS-H2';
        worldPos = [-18.0 + (index % 3) * 1.0, 0.0, -15.0 + Math.floor(index / 3) * 1.0];
        currentState = 'ENGAGED';
      } else if (contract.agentType === 'SPECIALIST' || contract.discipline === 'Quality') {
        homeBase = 'FACILITY-LEARNING-02';
        currentZone = 'ZONE-ACADEMY-H2';
        worldPos = [18.0 + (index % 3) * 1.0, 0.0, -15.0 + Math.floor(index / 3) * 1.0];
        currentState = 'ENGAGED';
      } else if (index >= 22) {
        // Active Learning Reserve (46 agents) stationed inside Learning Center
        const learnIdx = index - 22;
        homeBase = 'FACILITY-LEARNING-02';
        currentZone = 'ZONE-ACADEMY-H2';
        worldPos = [16.0 + (learnIdx % 6) * 1.2, 0.0, -13.0 + Math.floor(learnIdx / 6) * 1.2];
        currentState = 'ENGAGED';
      }

      // Deployed field workers (e.g. Survey, Structural, Masonry, Quality)
      const agentId = contract.id || contract.agentId;
      if (agentId === 'AGENT-SURVEY-01' || agentId === 'AGENT-EXEC-01' || agentId === 'AGENT-EXEC-02' || agentId === 'AGENT-INSP-01') {
        currentState = 'ENGAGED';
        worldPos = [2.0 + (index % 4) * 1.5, 0.0, 2.0];
        currentZone = 'ZONE-WORK-FOUNDATION-02';
      }

      const spatialState: AgentSpatialState = {
        agentId: agentId || `AGENT-${index}`,
        role: contract.role || contract.name || 'Agent',
        discipline: contract.discipline || 'Structure',
        agentType: contract.agentType || 'EXECUTION',
        worldPosition: worldPos,
        homeBaseEntityId: homeBase,
        currentWorkZoneId: currentZone,
        currentState,
        assignedTaskId: currentState === 'ENGAGED' ? 'TASK-H2-FOUNDATION-SURVEY' : null,
        workEnvelope: [0.5, 1.75, 0.5],
        reportsTo: contract.reportsTo || 'PROJECT-PRIME'
      } as any;

      this.agentStates.set(spatialState.agentId, spatialState);
    });
  }

  private static recordCustomerArrival(): void {
    const arrivalEvent: ProjectEventRecord = {
      eventId: 'EVT-H2-0001',
      projectId: this.projectId,
      timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
      eventType: 'CUSTOMER_BRIEF_RECEIVED',
      agentId: 'MOCK-CUSTOMER-HOUSE-0002',
      agentRole: 'Owner / Mock Customer',
      message: 'I want to build a modest, practical, durable single-family home in the Tampa, Florida area. I need two bedrooms and two bathrooms. I would like approximately 1,000 to 1,200 square feet, good storm resilience, reasonable construction cost, and an efficient layout.',
      decision: 'CUSTOMER_BRIEF_SUBMITTED',
      status: 'RECEIVED'
    };

    this.eventStream.push(arrivalEvent);
  }

  private static executeCustomerInterview(): void {
    const QAs: CustomerInteractionRecord[] = [
      {
        id: 'CI-H2-001',
        timestamp: new Date(Date.now() - 3600000 * 4.8).toISOString(),
        speaker: 'PROJECT-PRIME',
        category: 'CUSTOMER_PREFERENCE',
        questionOrTopic: 'Target Floor Area & Single vs Multi-Story',
        response: 'Customer confirms preference for a single-story layout of ~1,000 to 1,100 sq ft to optimize storm safety, eliminate stairs, and simplify roofline.',
        status: 'VERIFIED'
      },
      {
        id: 'CI-H2-002',
        timestamp: new Date(Date.now() - 3600000 * 4.6).toISOString(),
        speaker: 'PROJECT-PRIME',
        category: 'CUSTOMER_PREFERENCE',
        questionOrTopic: 'Bedrooms & Bathrooms Configuration',
        response: 'Customer requests 2 Bedrooms (Primary Suite + Guest/Office) and 2 Full Bathrooms (Primary ensuite + Hall bath).',
        status: 'VERIFIED'
      },
      {
        id: 'CI-H2-003',
        timestamp: new Date(Date.now() - 3600000 * 4.4).toISOString(),
        speaker: 'PROJECT-PRIME',
        category: 'ENGINEERING_DECISION',
        questionOrTopic: 'Storm Resilience & Shell Structure Selection',
        response: 'Project Prime selects 8" Reinforced CMU block masonry walls + Monolithic Stem-Wall Slab to withstand 160 MPH coastal hurricane wind loads.',
        status: 'VERIFIED'
      },
      {
        id: 'CI-H2-004',
        timestamp: new Date(Date.now() - 3600000 * 4.2).toISOString(),
        speaker: 'PROJECT-PRIME',
        category: 'CODE_REQUIREMENT',
        questionOrTopic: 'Florida Building Code 2023 (HVHZ / Wind Risk)',
        response: 'Grounded against FBC 2023 Section 1609 & 2508. Wind exposure risk category II, 160 MPH ultimate design wind speed.',
        status: 'VERIFIED'
      },
      {
        id: 'CI-H2-005',
        timestamp: new Date(Date.now() - 3600000 * 4.0).toISOString(),
        speaker: 'PROJECT-PRIME',
        category: 'ACADEMY_ASSUMPTION',
        questionOrTopic: 'Simulated Tampa Training Parcel Site Assumptions',
        response: 'Simulated parcel located in Tampa Bay region (27.9506° N, 82.4572° W), 4.5 ft groundwater table, municipal water/sewer tap available.',
        status: 'VERIFIED'
      }
    ];

    this.customerInteractions = QAs;

    QAs.forEach(qa => {
      (this.eventStream as any).push({
        eventId: `EVT-H2-${qa.id}`,
        projectId: this.projectId,
        timestamp: qa.timestamp,
        eventType: 'CUSTOMER_INTERVIEW_QA',
        agentId: 'PROJECT-PRIME',
        agentRole: 'Project Orchestrator',
        message: `[${qa.category}] ${qa.questionOrTopic}: ${qa.response}`,
        decision: 'RECORD_CUSTOMER_REQUIREMENT',
        status: 'VERIFIED'
      });
    });
  }

  private static createSpatialProgram(): void {
    // Program volumes (Room blocks) before detailed construction BIM
    const volumes: ProgramVolumeRecord[] = [
      {
        id: 'PROG-VOL-LIVING',
        name: 'Living & Dining Great Room',
        targetAreaSqFt: 300,
        dimensionsMeters: [6.0, 2.8, 4.64],
        worldPositionMeters: [-2.5, 1.4, -1.0],
        colorHex: '#3B82F6',
        roomType: 'LIVING',
        adjacentRooms: ['Kitchen', 'Primary Bedroom', 'Hallway']
      },
      {
        id: 'PROG-VOL-KITCHEN',
        name: 'Kitchen & Pantry',
        targetAreaSqFt: 140,
        dimensionsMeters: [3.36, 2.8, 3.86],
        worldPositionMeters: [3.32, 1.4, -1.39],
        colorHex: '#10B981',
        roomType: 'KITCHEN',
        adjacentRooms: ['Living Room', 'Laundry/Mech']
      },
      {
        id: 'PROG-VOL-BED1',
        name: 'Primary Bedroom Suite',
        targetAreaSqFt: 180,
        dimensionsMeters: [4.5, 2.8, 3.71],
        worldPositionMeters: [-3.25, 1.4, 1.95],
        colorHex: '#8B5CF6',
        roomType: 'BEDROOM',
        adjacentRooms: ['Primary Bathroom', 'Hallway']
      },
      {
        id: 'PROG-VOL-BATH1',
        name: 'Primary Ensuite Bathroom',
        targetAreaSqFt: 75,
        dimensionsMeters: [2.5, 2.8, 2.78],
        worldPositionMeters: [0.25, 1.4, 2.41],
        colorHex: '#EC4899',
        roomType: 'BATHROOM',
        adjacentRooms: ['Primary Bedroom']
      },
      {
        id: 'PROG-VOL-BED2',
        name: 'Bedroom 2 / Flex Office',
        targetAreaSqFt: 150,
        dimensionsMeters: [3.8, 2.8, 3.66],
        worldPositionMeters: [3.4, 1.4, 1.97],
        colorHex: '#F59E0B',
        roomType: 'BEDROOM',
        adjacentRooms: ['Hallway', 'Bathroom 2']
      },
      {
        id: 'PROG-VOL-BATH2',
        name: 'Bathroom 2 / Guest Bath',
        targetAreaSqFt: 60,
        dimensionsMeters: [2.0, 2.8, 2.78],
        worldPositionMeters: [1.5, 1.4, -0.85],
        colorHex: '#06B6D4',
        roomType: 'BATHROOM',
        adjacentRooms: ['Hallway', 'Bedroom 2']
      },
      {
        id: 'PROG-VOL-MECH',
        name: 'Laundry & Mechanical Closet',
        targetAreaSqFt: 45,
        dimensionsMeters: [1.8, 2.8, 2.32],
        worldPositionMeters: [0.4, 1.4, -2.18],
        colorHex: '#64748B',
        roomType: 'MECHANICAL',
        adjacentRooms: ['Kitchen', 'Living Room']
      }
    ];

    this.programVolumes = volumes;

    (this.eventStream as any).push({
      eventId: 'EVT-H2-PROG-01',
      projectId: this.projectId,
      timestamp: new Date(Date.now() - 3600000 * 3.8).toISOString(),
      eventType: 'PROGRAM_CREATED',
      agentId: 'PROJECT-PRIME',
      agentRole: 'Project Orchestrator',
      message: 'Created 3D Spatial Program Volumes (7 rooms, 950 sq ft conditioned, 1,033 sq ft total footprint).',
      decision: 'PROPOSE_SPATIAL_PROGRAM',
      status: 'PROPOSED'
    });
  }

  private static approveProgram(): void {
    this.programApproved = true;

    (this.eventStream as any).push({
      eventId: 'EVT-H2-PROG-APPROVE',
      projectId: this.projectId,
      timestamp: new Date(Date.now() - 3600000 * 3.5).toISOString(),
      eventType: 'CUSTOMER_LAYOUT_REVIEW',
      agentId: 'MOCK-CUSTOMER-HOUSE-0002',
      agentRole: 'Owner / Mock Customer',
      message: 'Mock Customer reviews proposed 3D spatial program blocks and APPROVES layout without changes.',
      decision: 'APPROVE_SPATIAL_PROGRAM',
      status: 'APPROVED'
    });
  }

  private static recordPreDesignAnalysis(): void {
    (this.eventStream as any).push({
      eventId: 'EVT-H2-SITE-ANALYSIS',
      projectId: this.projectId,
      timestamp: new Date(Date.now() - 3600000 * 3.2).toISOString(),
      eventType: 'PRE_DESIGN_SITE_ANALYSIS',
      agentId: 'AGENT-SME-04',
      agentRole: 'Geotechnical & Site SME',
      message: 'Pre-design site analysis complete: Soil bearing capacity 2,200 psf, groundwater table 4.5 ft, coastal exposure category C, 160 MPH ultimate wind speed.',
      decision: 'SELECT_CMU_STEMWALL_SYSTEM',
      status: 'APPROVED'
    });
  }

  private static registerMethodGaps(): void {
    this.methodGapsDiscovered = [
      'GAP-ROOF-01: Engineered truss hurricane clip wind uplift capacity verification',
      'GAP-ENV-01: Elastomeric liquid-applied waterproofing membrane at stem wall transition',
      'GAP-FEN-01: Impact-resistant window buck anchorage into grouted CMU blocks',
      'GAP-PERM-01: FBC 2023 local jurisdiction site control mark verification process'
    ];

    (this.eventStream as any).push({
      eventId: 'EVT-H2-GAPS-DISCOVERED',
      projectId: this.projectId,
      timestamp: new Date(Date.now() - 3600000 * 3.0).toISOString(),
      eventType: 'GAP_REGISTER_UPDATED',
      agentId: 'AGENT-PRIME-01',
      agentRole: 'Prime Orchestrator',
      message: `Registered ${this.methodGapsDiscovered.length} Method Knowledge Gaps needing grounded SME development during Attempt 1.`,
      decision: 'LOG_METHOD_GAPS',
      status: 'REGISTERED'
    });
  }

  private static createDesignBimRevision1(): void {
    // Initial Coordinated Design BIM components created from ZERO
    const dummyWhySelected = {
      reason: 'Specified in Design BIM Rev 1 for House #2.',
      environmentalFactor: 'Tampa Bay coastal wind and humidity exposure.',
      codeRule: 'FBC 2023 Coastal High-Velocity Hurricane Zone.',
      alternativesConsidered: [],
      costImpact: 'Optimized via automated procurement.',
      lifecycleNotes: '50-year design life.'
    };

    const components: BIMComponent[] = [
      {
        id: 'SLAB-H2-01',
        type: 'slab',
        system: 'Structure',
        floor: 1,
        room: 'Building Foundation Base',
        assembly: '6" Monolithic Concrete Slab over 15-mil Stego Wrap Vapor Barrier with Integrated Perimeter Stem Wall',
        materials: [
          { name: '4000 PSI Ready-Mix Concrete', specification: 'ACI 318 Exposure C2', quantity: 38, unit: 'cu yd' },
          { name: '#5 Rebar Grade 60', specification: 'ASTM A615', quantity: 620, unit: 'lin ft' }
        ],
        geometry: { position: [0, 0.15, 0], dimensions: [12.0, 0.3, 8.0] },
        fireRatingHours: 2,
        isExterior: true,
        exposure: 'Ground Contact / Coastal Soil',
        connectedComponentIds: ['WALL-H2-EXT-SOUTH', 'WALL-H2-EXT-NORTH', 'WALL-H2-EXT-EAST', 'WALL-H2-EXT-WEST'],
        openings: [],
        quantity: { value: 38, unit: 'cu yd' },
        unitCost: 175,
        totalCost: 6650,
        installationStageDay: 2,
        inspectionState: 'passed',
        whySelected: dummyWhySelected
      },
      {
        id: 'WALL-H2-EXT-SOUTH',
        type: 'wall',
        system: 'Structure',
        floor: 1,
        room: 'South Elevation Wall',
        assembly: '8" CMU Masonry + Vert Rebar @ 24" o.c. + Grout Fill + Stucco Finish',
        materials: [
          { name: '8x8x16 CMU Block', specification: 'ASTM C90 Grade N', quantity: 230, unit: 'ea' }
        ],
        geometry: { position: [0, 1.55, -3.9], dimensions: [12.0, 2.8, 0.2] },
        fireRatingHours: 2,
        isExterior: true,
        exposure: 'South Coastal Wind Exposure',
        connectedComponentIds: ['SLAB-H2-01', 'DOOR-H2-ENTRY', 'WIN-H2-LIVING-01'],
        openings: ['DOOR-H2-ENTRY', 'WIN-H2-LIVING-01'],
        quantity: { value: 33.6, unit: 'sq m' },
        unitCost: 20,
        totalCost: 6720,
        installationStageDay: 4,
        inspectionState: 'passed',
        whySelected: dummyWhySelected
      },
      {
        id: 'WALL-H2-EXT-NORTH',
        type: 'wall',
        system: 'Structure',
        floor: 1,
        room: 'North Elevation Wall',
        assembly: '8" CMU Masonry + Vert Rebar @ 24" o.c. + Grout Fill',
        materials: [
          { name: '8x8x16 CMU Block', specification: 'ASTM C90 Grade N', quantity: 230, unit: 'ea' }
        ],
        geometry: { position: [0, 1.55, 3.9], dimensions: [12.0, 2.8, 0.2] },
        fireRatingHours: 2,
        isExterior: true,
        exposure: 'North Coastal Exposure',
        connectedComponentIds: ['SLAB-H2-01'],
        openings: [],
        quantity: { value: 33.6, unit: 'sq m' },
        unitCost: 20,
        totalCost: 6720,
        installationStageDay: 4,
        inspectionState: 'passed',
        whySelected: dummyWhySelected
      },
      {
        id: 'WALL-H2-EXT-EAST',
        type: 'wall',
        system: 'Structure',
        floor: 1,
        room: 'East Elevation Wall',
        assembly: '8" CMU Masonry + Vert Rebar @ 24" o.c. + Grout Fill',
        materials: [
          { name: '8x8x16 CMU Block', specification: 'ASTM C90 Grade N', quantity: 155, unit: 'ea' }
        ],
        geometry: { position: [5.9, 1.55, 0], dimensions: [0.2, 2.8, 8.0] },
        fireRatingHours: 2,
        isExterior: true,
        exposure: 'East Coastal Exposure',
        connectedComponentIds: ['SLAB-H2-01'],
        openings: [],
        quantity: { value: 22.4, unit: 'sq m' },
        unitCost: 20,
        totalCost: 4480,
        installationStageDay: 5,
        inspectionState: 'passed',
        whySelected: dummyWhySelected
      },
      {
        id: 'WALL-H2-EXT-WEST',
        type: 'wall',
        system: 'Structure',
        floor: 1,
        room: 'West Elevation Wall',
        assembly: '8" CMU Masonry + Vert Rebar @ 24" o.c. + Grout Fill',
        materials: [
          { name: '8x8x16 CMU Block', specification: 'ASTM C90 Grade N', quantity: 155, unit: 'ea' }
        ],
        geometry: { position: [-5.9, 1.55, 0], dimensions: [0.2, 2.8, 8.0] },
        fireRatingHours: 2,
        isExterior: true,
        exposure: 'West Coastal Exposure',
        connectedComponentIds: ['SLAB-H2-01'],
        openings: [],
        quantity: { value: 22.4, unit: 'sq m' },
        unitCost: 20,
        totalCost: 4480,
        installationStageDay: 5,
        inspectionState: 'passed',
        whySelected: dummyWhySelected
      },
      {
        id: 'WALL-H2-INT-DIVIDER',
        type: 'wall',
        system: 'Architecture',
        floor: 1,
        room: 'Living / Bedroom Divider',
        assembly: '2x4 Wood Stud Interior Wall @ 16" o.c. + 5/8" Type-X Gypsum Board',
        materials: [
          { name: '2x4 SPF Studs', specification: 'No. 2 Grade', quantity: 24, unit: 'pcs' },
          { name: '5/8" Type X Gypsum', specification: 'ASTM C1396', quantity: 420, unit: 'sq ft' }
        ],
        geometry: { position: [0.0, 1.45, 0.0], dimensions: [0.12, 2.6, 7.6] },
        fireRatingHours: 1,
        isExterior: false,
        exposure: 'Interior Climate Controlled',
        connectedComponentIds: ['SLAB-H2-01'],
        openings: [],
        quantity: { value: 19.8, unit: 'sq m' },
        unitCost: 10,
        totalCost: 1980,
        installationStageDay: 8,
        inspectionState: 'passed',
        whySelected: dummyWhySelected
      },
      {
        id: 'DOOR-H2-ENTRY',
        type: 'door',
        system: 'Architecture',
        floor: 1,
        room: 'Front Entry Corridor',
        assembly: 'Fiberglass Impact-Rated Exterior Entry Door',
        materials: [
          { name: 'Fiberglass Door Assembly', specification: 'HVHZ Impact ASTM E1996', quantity: 1, unit: 'ea' }
        ],
        geometry: { position: [-2.0, 1.2, -3.9], dimensions: [0.9, 2.1, 0.1] },
        isExterior: true,
        exposure: 'HVHZ Wind/Impact Zone',
        connectedComponentIds: ['WALL-H2-EXT-SOUTH'],
        openings: [],
        quantity: { value: 1, unit: 'ea' },
        unitCost: 1200,
        totalCost: 1200,
        installationStageDay: 9,
        inspectionState: 'passed',
        whySelected: dummyWhySelected
      },
      {
        id: 'WIN-H2-LIVING-01',
        type: 'window',
        system: 'Architecture',
        floor: 1,
        room: 'Living Room',
        assembly: 'Double-Hung Aluminum Impact Window',
        materials: [
          { name: 'Impact Glass Window Assembly', specification: 'Design Pressure +70/-70 PSF', quantity: 1, unit: 'ea' }
        ],
        geometry: { position: [2.0, 1.5, -3.9], dimensions: [1.2, 1.2, 0.1] },
        isExterior: true,
        exposure: 'HVHZ Wind/Impact Zone',
        connectedComponentIds: ['WALL-H2-EXT-SOUTH'],
        openings: [],
        quantity: { value: 1, unit: 'ea' },
        unitCost: 850,
        totalCost: 850,
        installationStageDay: 9,
        inspectionState: 'passed',
        whySelected: dummyWhySelected
      },
      {
        id: 'ROOF-H2-TRUSS-SET',
        type: 'roof',
        system: 'Structure',
        floor: 2,
        room: 'Roof System Envelope',
        assembly: 'Pre-Engineered Timber Roof Trusses @ 24" o.c. + 5/8" OSB Sheathing + Standing Seam Metal Roof',
        materials: [
          { name: 'Engineered Wood Trusses', specification: 'ANSI/TPI 1', quantity: 18, unit: 'ea' },
          { name: 'Standing Seam Metal Panels', specification: '24-Gauge Galvalume', quantity: 1350, unit: 'sq ft' }
        ],
        geometry: { position: [0, 3.7, 0], dimensions: [12.4, 1.5, 8.4] },
        fireRatingHours: 1,
        isExterior: true,
        exposure: '160 MPH Wind Exposure',
        connectedComponentIds: ['WALL-H2-EXT-SOUTH', 'WALL-H2-EXT-NORTH'],
        openings: [],
        quantity: { value: 104, unit: 'sq m' },
        unitCost: 65,
        totalCost: 6760,
        installationStageDay: 10,
        inspectionState: 'passed',
        whySelected: dummyWhySelected
      },
      {
        id: 'PLUMB-H2-MAIN',
        type: 'pipe',
        system: 'Plumbing',
        floor: 1,
        room: 'Wet Wall Utility Spine',
        assembly: '4" Schedule 40 PVC Sanitary Drain Stack + 3/4" PEX-a Potable Water Supply',
        materials: [
          { name: '4" PVC Sch 40 Drain Pipe', specification: 'ASTM D2665', quantity: 60, unit: 'lin ft' },
          { name: '3/4" PEX-a Tubing', specification: 'ASTM F876', quantity: 180, unit: 'lin ft' }
        ],
        geometry: { position: [0.3, 1.2, 1.2], dimensions: [0.1, 2.4, 3.0] },
        isExterior: false,
        exposure: 'Concealed Interior Utility Spine',
        connectedComponentIds: ['SLAB-H2-01', 'WALL-H2-INT-DIVIDER'],
        openings: [],
        quantity: { value: 240, unit: 'lin ft' },
        unitCost: 8.5,
        totalCost: 2040,
        installationStageDay: 7,
        inspectionState: 'passed',
        whySelected: dummyWhySelected
      },
      {
        id: 'ELEC-H2-PANEL',
        type: 'receptacle',
        system: 'Electrical',
        floor: 1,
        room: 'Mechanical Closet',
        assembly: '200A Main Service Breaker Panelboard + THHN Copper Conduits',
        materials: [
          { name: '200A Main Breaker Panel', specification: 'NEMA 1 Indoor Enclosure', quantity: 1, unit: 'ea' }
        ],
        geometry: { position: [0.4, 1.5, -2.18], dimensions: [0.4, 0.8, 0.2] },
        isExterior: false,
        exposure: 'Interior Mechanical Space',
        connectedComponentIds: ['WALL-H2-INT-DIVIDER'],
        openings: [],
        quantity: { value: 1, unit: 'ea' },
        unitCost: 1850,
        totalCost: 1850,
        installationStageDay: 8,
        inspectionState: 'passed',
        whySelected: dummyWhySelected
      }
    ];

    this.bimComponents = components;

    this.eventStream.push({
      eventId: 'EVT-H2-BIM-REV1',
      projectId: this.projectId,
      timestamp: new Date(Date.now() - 3600000 * 2.5).toISOString(),
      eventType: 'BIM_REVISION_CREATED',
      agentId: 'SPATIAL-BIM-PRIME',
      agentRole: 'Spatial BIM Prime',
      message: 'Created Design BIM Revision 1 (11 Coordinated Components built from ZERO: Slab, CMU Perimeter Walls, Interior Partition, Impact Door/Window, Roof Trusses, Plumbing & Electrical Spine).',
      decision: 'APPROVE_DESIGN_BIM_REV1',
      status: 'APPROVED'
    });
  }

  private static deriveBomFromModel(): void {
    const bom: BOMItem[] = [
      { id: 'BOM-H2-01', itemCode: 'CONC-4000-C2', description: '4000 PSI Ready-Mix Concrete (Stemwall Slab)', category: 'Structure', quantity: 38, unit: 'cu yd', unitPrice: 175, extendedPrice: 6650, leadTimeDays: 2, status: 'QUANTIFIED' } as any,
      { id: 'BOM-H2-02', itemCode: 'CMU-8816-C90', description: '8x8x16 CMU Concrete Masonry Block', category: 'Structure', quantity: 770, unit: 'ea', unitPrice: 2.8, extendedPrice: 2156, leadTimeDays: 3, status: 'QUANTIFIED' } as any,
      { id: 'BOM-H2-03', itemCode: 'REBAR-05-GR60', description: '#5 Grade 60 Reinforcing Steel Rebar', category: 'Structure', quantity: 620, unit: 'lin ft', unitPrice: 1.4, extendedPrice: 868, leadTimeDays: 2, status: 'QUANTIFIED' } as any,
      { id: 'BOM-H2-04', itemCode: 'TRUSS-TIMBER-01', description: 'Pre-Engineered Timber Roof Trusses 24" o.c.', category: 'Envelope', quantity: 18, unit: 'ea', unitPrice: 220, extendedPrice: 3960, leadTimeDays: 7, status: 'QUANTIFIED' } as any,
      { id: 'BOM-H2-05', itemCode: 'GYP-58-TYPEX', description: '5/8" Type X Fire-Rated Gypsum Board', category: 'Architecture', quantity: 420, unit: 'sq ft', unitPrice: 0.85, extendedPrice: 357, leadTimeDays: 1, status: 'QUANTIFIED' } as any,
      { id: 'BOM-H2-06', itemCode: 'PVC-4IN-SCH40', description: '4" Schedule 40 PVC DWV Piping', category: 'Plumbing', quantity: 60, unit: 'lin ft', unitPrice: 6.5, extendedPrice: 390, leadTimeDays: 1, status: 'QUANTIFIED' } as any
    ];

    this.bomItems = bom;

    (this.eventStream as any).push({
      eventId: 'EVT-H2-BOM-DERIVED',
      projectId: this.projectId,
      timestamp: new Date(Date.now() - 3600000 * 2.2).toISOString(),
      eventType: 'BIM_REVISION_CREATED',
      agentId: 'MATERIALS-PRIME',
      agentRole: 'Materials & Procurement Prime',
      message: 'Derived Model-Derived Bill of Materials (BOM) containing 6 line items totaling $14,381 in shell material costs.',
      decision: 'APPROVE_BOM_REVISION',
      status: 'APPROVED'
    });
  }

  private static registerHouseMaterials(): void {
    const matRecords: MaterialSpatialRecord[] = [
      {
        materialId: 'MAT-CMU-PALLET-H2',
        projectId: this.projectId,
        materialType: '8x8x16 CMU Masonry Block Pallet (200 Blocks)',
        stage: 'STAGED',
        currentPosition: [-18.0, 0.0, 12.0],
        dimensions: [1.22, 1.22, 1.22],
        weightKg: 1800,
        clearanceMeters: 0.8,
        chainOfCustody: [
          { timestamp: new Date(Date.now() - 3600000 * 2.0).toISOString(), actorId: 'DRIVER-DELIVERY-01', action: 'DELIVERED', location: [-22.0, 0.0, -22.0] },
          { timestamp: new Date(Date.now() - 3600000 * 1.8).toISOString(), actorId: 'AGENT-EXEC-08', action: 'STAGED', location: [-18.0, 0.0, 12.0] }
        ]
      } as any,
      {
        materialId: 'MAT-REBAR-H2',
        projectId: this.projectId,
        materialType: '#5 Grade 60 Rebar Bundle (620 lin ft)',
        stage: 'ALLOCATED',
        currentPosition: [2.0, 0.0, 2.0],
        dimensions: [6.0, 0.3, 0.3],
        weightKg: 650,
        clearanceMeters: 0.5,
        chainOfCustody: [
          { timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString(), actorId: 'AGENT-EXEC-08', action: 'CARRIED', location: [2.0, 0.0, 2.0] }
        ]
      } as any
    ];

    matRecords.forEach(m => this.materials.set(m.materialId, m));
  }

  private static executeSiteControlActions(): void {
    const mark1: SurveyControlMark = {
      markId: 'MARK-SURVEY-STAKE-H2-01',
      projectId: this.projectId,
      name: 'House #2 SW Building Corner Benchmark (0,0 Datum)',
      worldPosition: [-6.0, 0.0, -4.0],
      measuredElevationMeters: 0.0,
      toleranceMm: 0.5,
      surveyorAgentId: 'AGENT-SURVEY-01',
      verifiedTimestamp: new Date(Date.now() - 3600000 * 1.6).toISOString()
    } as any;

    const mark2: SurveyControlMark = {
      markId: 'MARK-SURVEY-STAKE-H2-02',
      projectId: this.projectId,
      name: 'House #2 NE Building Corner Benchmark (+12m, +8m)',
      worldPosition: [6.0, 0.0, 4.0],
      measuredElevationMeters: 0.0,
      toleranceMm: 0.5,
      surveyorAgentId: 'AGENT-SURVEY-01',
      verifiedTimestamp: new Date(Date.now() - 3600000 * 1.5).toISOString()
    } as any;

    this.surveyMarks.set(mark1.markId, mark1);
    this.surveyMarks.set(mark2.markId, mark2);

    (this.eventStream as any).push({
      eventId: 'EVT-H2-SURVEY-MARKS',
      projectId: this.projectId,
      timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString(),
      eventType: 'SPATIAL_SURVEY_COMPLETED',
      agentId: 'AGENT-SURVEY-01',
      agentRole: 'Site Control & Survey Specialist',
      message: 'Placed and verified 2 persistent physical 3D survey control stakes (MARK-SURVEY-STAKE-H2-01, MARK-SURVEY-STAKE-H2-02) with 0.5mm laser total station precision.',
      decision: 'ESTABLISH_SITE_CONTROL',
      status: 'VERIFIED'
    });
  }

  private static executeFieldConsultation(): void {
    const consultRecord: FieldConsultationRecord = {
      consultationId: 'CONSULT-H2-001',
      projectId: this.projectId,
      requestingAgentId: 'AGENT-MGR-03',
      consultantAgentId: 'AGENT-SME-01',
      workZoneId: 'ZONE-WORK-FOUNDATION-02',
      targetEntityId: 'SLAB-H2-01',
      travelPath: [[-18.0, 0.0, -15.0], [0.0, 0.0, -5.0], [2.0, 0.0, 2.0]],
      travelDistanceMeters: 23.5,
      status: 'COMPLETED',
      findings: 'Verified stem wall rebar overlap clearance of 24 bar diameters meets ACI 318 exposure C2 requirements.',
      decision: 'DEC-CONSULT-PASS-H2',
      timestamp: new Date(Date.now() - 3600000 * 1.2).toISOString()
    } as any;

    this.fieldConsultations.push(consultRecord);

    (this.eventStream as any).push({
      eventId: 'EVT-H2-CONSULT',
      projectId: this.projectId,
      timestamp: consultRecord.timestamp,
      eventType: 'FIELD_CONSULTATION_COMPLETED',
      agentId: 'AGENT-SME-01',
      agentRole: 'Structural SME',
      message: 'Structural SME traveled 23.5m from Learning Center to Foundation Work Zone to physically consult on stem wall rebar splice clearance. PASSED.',
      decision: 'APPROVE_REBAR_SPLICE',
      status: 'PASSED'
    });
  }

  private static executeKnowledgeOnDemand(): void {
    const req: KnowledgeRequestRecord = {
      requestId: 'REQ-KNOW-H2-FBC-2508',
      projectId: this.projectId,
      blockedAgentId: 'AGENT-EXEC-02',
      blockedTaskId: 'TASK-H2-WALL-FASTEN',
      discipline: 'MASONRY_AND_STRUCTURE',
      queryTopic: 'FBC 2023 High-Wind Fastener Uplift Spacing for CMU Lintels',
      routingTrail: ['AGENT-EXEC-02', 'AGENT-MGR-01', 'AGENT-PRIME-01', 'AGENT-SME-05', 'FBC_2023_SEC_1609'],
      retrievedSourceId: 'FLORIDA_BUILDING_CODE_2023_SEC_1609',
      groundedSection: 'Section 1609.1.1 #5 Rebar Placement in Grouted CMU Cells @ 24" o.c. max',
      status: 'RESOLVED',
      resolvedTimestamp: new Date(Date.now() - 3600000 * 0.8).toISOString()
    } as any;

    this.knowledgeRequests.push(req);

    (this.eventStream as any).push({
      eventId: 'EVT-H2-KNOW-RESOLVED',
      projectId: this.projectId,
      timestamp: (req as any).resolvedTimestamp || new Date().toISOString(),
      eventType: 'KNOWLEDGE_ON_DEMAND_RESOLVED',
      agentId: 'AGENT-SME-05',
      agentRole: 'Code Compliance SME',
      message: 'On-demand knowledge request REQ-KNOW-H2-FBC-2508 resolved via FBC 2023 Section 1609. Unblocked task TASK-H2-WALL-FASTEN.',
      decision: 'UNBLOCK_FIELD_TASK',
      status: 'RESOLVED'
    });
  }

  private static executeInitialPhysicalConstruction(): void {
    // Spatial Actions representing real physical construction operations
    const actions: SpatialActionRecord[] = [
      {
        actionId: 'ACT-H2-001',
        actorId: 'AGENT-SURVEY-01',
        actionType: 'MEASURE',
        targetEntityId: 'MARK-SURVEY-STAKE-H2-01',
        startPose: [-6.0, 0.0, -4.0],
        endPose: [-6.0, 0.0, -4.0],
        timestamp: new Date(Date.now() - 3600000 * 1.6).toISOString(),
        status: 'COMPLETED'
      } as any,
      {
        actionId: 'ACT-H2-002',
        actorId: 'AGENT-EXEC-01',
        actionType: 'EXCAVATE',
        targetEntityId: 'SITE-H2-FOOTPRINT',
        startPose: [-6.0, 0.0, -4.0],
        endPose: [6.0, 0.0, 4.0],
        timestamp: new Date(Date.now() - 3600000 * 1.4).toISOString(),
        status: 'COMPLETED'
      } as any,
      {
        actionId: 'ACT-H2-003',
        actorId: 'AGENT-EXEC-01',
        actionType: 'POUR',
        targetEntityId: 'SLAB-H2-01',
        startPose: [-6.0, 0.0, -4.0],
        endPose: [6.0, 0.3, 4.0],
        timestamp: new Date(Date.now() - 3600000 * 1.0).toISOString(),
        status: 'COMPLETED'
      } as any,
      {
        actionId: 'ACT-H2-004',
        actorId: 'AGENT-EXEC-02',
        actionType: 'SET_BLOCK',
        targetEntityId: 'WALL-H2-EXT-SOUTH',
        startPose: [0.0, 0.3, -3.9],
        endPose: [0.0, 1.55, -3.9],
        timestamp: new Date(Date.now() - 3600000 * 0.5).toISOString(),
        status: 'COMPLETED'
      } as any,
      {
        actionId: 'ACT-H2-005',
        actorId: 'AGENT-INSP-01',
        actionType: 'INSPECT',
        targetEntityId: 'WALL-H2-EXT-SOUTH',
        startPose: [0.0, 1.55, -3.0],
        endPose: [0.0, 1.55, -3.0],
        timestamp: new Date(Date.now() - 3600000 * 0.2).toISOString(),
        status: 'COMPLETED'
      } as any
    ];

    this.spatialActions = actions;

    // RobotReadySpatialContract payload for automated fastening operation
    const robotContract: RobotReadySpatialContract = {
      contractId: 'RRSC-H2-REBAR-TIE-001',
      actorAbstraction: 'UNIVERSAL_ACTOR',
      startPose: [2.0, 0.3, 2.0],
      targetPose: [2.0, 0.3, 2.0],
      path: [[2.0, 0.0, 2.0], [2.0, 0.3, 2.0]],
      targetEntityId: 'SLAB-H2-01',
      toolId: 'REBAR-TIER-AUTOMATED-01',
      actionType: 'REBAR_TIE',
      preconditions: ['STEMWALL_REBAR_POSITIONED', 'CLEARANCE_VERIFIED_24_BAR_DIA'],
      postconditions: ['TIE_WIRE_TORQUE_VERIFIED'],
      toleranceMeters: 0.001,
      verificationMethod: 'OPTICAL_LASER_SCAN'
    } as any;

    this.robotContracts = [robotContract];

    (this.eventStream as any).push({
      eventId: 'EVT-H2-CHECKPOINT-1',
      projectId: this.projectId,
      timestamp: new Date().toISOString(),
      eventType: 'FIRST_OWNER_CHECKPOINT_REACHED',
      agentId: 'PROJECT-PRIME',
      agentRole: 'Project Orchestrator',
      message: 'ACADEMY-HOUSE-0002 ATTEMPT-01 First Owner Checkpoint reached. Site setup complete, customer interview complete, program approved, design BIM Revision 1 created from zero, BOM derived, initial physical survey and foundation/wall construction actions recorded. PAUSED awaiting owner review.',
      decision: 'STOP_AT_FIRST_OWNER_CHECKPOINT',
      status: 'PAUSED_AWAITING_REVIEW'
    });
  }

  // Getters
  public static getProjectId() { return this.projectId; }
  public static getAttemptId() { return this.attemptId; }
  public static getProjectType() { return this.projectType; }
  public static getStartTime() { return this.startTime; }
  public static getSpatialEntities() { return Array.from(this.spatialEntities.values()); }
  public static getAgentSpatialStates() { return Array.from(this.agentStates.values()); }
  public static getMaterials() { return Array.from(this.materials.values()); }
  public static getSpatialActions() { return this.spatialActions; }
  public static getSurveyMarks() { return Array.from(this.surveyMarks.values()); }
  public static getFieldConsultations() { return this.fieldConsultations; }
  public static getKnowledgeRequests() { return this.knowledgeRequests; }
  public static getEventStream() { return this.eventStream; }
  public static getFacilityEvaluation() { return this.facilityEvaluation; }
  public static getRobotContracts() { return this.robotContracts; }
  public static getCustomerInteractions() { return this.customerInteractions; }
  public static getProgramVolumes() { return this.programVolumes; }
  public static getBimComponents() { return this.bimComponents; }
  public static getBomItems() { return this.bomItems; }
  public static getMethodGapsDiscovered() { return this.methodGapsDiscovered; }
  public static isProgramApproved() { return this.programApproved; }
  public static getStructuralSystemSelected() { return this.structuralSystemSelected; }
  public static getStructuralSystemReason() { return this.structuralSystemReason; }
  public static getFoundationMethod() { return this.foundationMethod; }
}
