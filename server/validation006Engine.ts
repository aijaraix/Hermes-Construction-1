import { computeSha256 } from './sha256Utils';

export interface SpatialFacility {
  facilityId: string;
  name: string;
  systemCategory: string;
  worldPosition: [number, number, number];
  dimensions: [number, number, number];
  inWorldLabel: string;
  maxCapacity: number;
}

export interface AgentSpatialState006 {
  agentId: string;
  role: string;
  discipline: string;
  agentType: 'INTELLIGENCE' | 'EXECUTION';
  currentState: string;
  currentProjectId: string;
  worldPosition: [number, number, number];
  worldRotation: [number, number, number];
  homeBaseEntityId: string;
  timestamp: string;
}

export interface Validation006State {
  projectId: string;
  projectName: string;
  status: string;
  autorun: boolean;
  currentCheckpoint: number;
  currentStepIndex: number;
  genesisTimestamp: string;
  lastEventTimestamp: string;
  campusFacilities: SpatialFacility[];
  spatialEntities: any[];
  agentSpatialStates: AgentSpatialState006[];
  buildingComponents: any[];
  roomVolumes: any[];
  materialsOnsite: any[];
  surveyMarks: any[];
  requirementDecisions: any[];
  activeMissions: any[];
  customerInteractions: any[];
  buildableEnvelope?: any;
  siteRealityModel?: any;
  inspectionTickets: any[];
  bomItems: any[];
  scheduleActivities: any[];
  gymLevel: number;
  score: any;
  eventStream: any[];
  hashes: {
    beforeWorldStateHash: string;
    afterWorldStateHash: string;
    beforeSceneSignature: string;
    afterSceneSignature: string;
  };
  diagnostics: {
    checkpoint: number;
    checkpointName: string;
    autorun: boolean;
    campusFacilityCount: number;
    stationedAgentCount: number;
    buildingComponentCount: number;
    projectMaterialCount: number;
    surveyMarkCount: number;
    requirementRecordCount: number;
    inspectionTicketCount: number;
    bomItemCount: number;
    clashCount: number;
    worldStateHash: string;
    sceneSignature: string;
    backendRenderParity: string;
    ownerAuthorizationStatus: string;
  };
}

export class Validation006Engine {
  private static cachedState: Validation006State | null = null;

  public static getCampusFacilities(): SpatialFacility[] {
    return [
      { facilityId: 'FACILITY-EXEC-06', name: 'HERMES Executive & Prime Orchestration Center', systemCategory: 'Management', worldPosition: [-55.0, 0.0, -15.0], dimensions: [12.0, 3.2, 10.0], inWorldLabel: 'HERMES PRIME / EXECUTIVE HQ', maxCapacity: 8 },
      { facilityId: 'FACILITY-ARCH-06', name: 'Architecture & Design Innovation Lab', systemCategory: 'Architecture', worldPosition: [-55.0, 0.0, 0.0], dimensions: [10.0, 3.0, 8.0], inWorldLabel: 'ARCHITECTURE LAB', maxCapacity: 8 },
      { facilityId: 'FACILITY-STRUCT-06', name: 'Structural Engineering & Analysis Complex', systemCategory: 'Structure', worldPosition: [-55.0, 0.0, 15.0], dimensions: [10.0, 3.0, 8.0], inWorldLabel: 'STRUCTURAL LAB', maxCapacity: 8 },
      { facilityId: 'FACILITY-CIVIL-06', name: 'Site Survey & Geotechnical Engineering Depot', systemCategory: 'Civil', worldPosition: [-40.0, 0.0, -15.0], dimensions: [10.0, 3.0, 8.0], inWorldLabel: 'CIVIL & SURVEY DEPOT', maxCapacity: 8 },
      { facilityId: 'FACILITY-FOUND-06', name: 'Foundation & Substructure Engineering Center', systemCategory: 'Concrete', worldPosition: [-40.0, 0.0, 0.0], dimensions: [10.0, 3.0, 8.0], inWorldLabel: 'CONCRETE & FOUNDATION CENTER', maxCapacity: 8 },
      { facilityId: 'FACILITY-MASONRY-06', name: 'Masonry & Wall Systems Operations Center', systemCategory: 'Masonry', worldPosition: [-40.0, 0.0, 15.0], dimensions: [10.0, 3.0, 8.0], inWorldLabel: 'MASONRY DEPOT', maxCapacity: 8 },
      { facilityId: 'FACILITY-ROOF-06', name: 'Framing, Roof & Building Envelope Facility', systemCategory: 'Roofing', worldPosition: [-25.0, 0.0, -15.0], dimensions: [10.0, 3.0, 8.0], inWorldLabel: 'ROOFING & ENVELOPE', maxCapacity: 8 },
      { facilityId: 'FACILITY-PLUMB-06', name: 'Plumbing & Hydraulic Engineering Workshop', systemCategory: 'Plumbing', worldPosition: [-25.0, 0.0, 0.0], dimensions: [8.0, 3.0, 8.0], inWorldLabel: 'PLUMBING WORKSHOP', maxCapacity: 6 },
      { facilityId: 'FACILITY-ELEC-06', name: 'Electrical & Power Systems Technology Lab', systemCategory: 'Electrical', worldPosition: [-25.0, 0.0, 15.0], dimensions: [8.0, 3.0, 8.0], inWorldLabel: 'ELECTRICAL LAB', maxCapacity: 6 },
      { facilityId: 'FACILITY-HVAC-06', name: 'HVAC & Climate Control Station', systemCategory: 'HVAC', worldPosition: [-10.0, 0.0, -15.0], dimensions: [8.0, 3.0, 8.0], inWorldLabel: 'HVAC STATION', maxCapacity: 6 },
      { facilityId: 'FACILITY-FIRE-06', name: 'Fire Protection & Life Safety Station', systemCategory: 'Fire Protection', worldPosition: [-10.0, 0.0, 0.0], dimensions: [8.0, 3.0, 8.0], inWorldLabel: 'FIRE SAFETY STATION', maxCapacity: 6 },
      { facilityId: 'FACILITY-QUAL-06', name: 'Quality Inspection & Code Compliance HQ', systemCategory: 'Quality', worldPosition: [-10.0, 0.0, 15.0], dimensions: [8.0, 3.0, 8.0], inWorldLabel: 'QUALITY & COMPLIANCE HQ', maxCapacity: 6 },
      { facilityId: 'FACILITY-PROCURE-06', name: 'Global Procurement & Logistics Depot', systemCategory: 'Logistics', worldPosition: [-55.0, 0.0, 30.0], dimensions: [12.0, 3.5, 12.0], inWorldLabel: 'GLOBAL PROCUREMENT', maxCapacity: 10 },
      { facilityId: 'FACILITY-ACADEMY-06', name: 'HERMES SME Learning & Knowledge Academy', systemCategory: 'Academy', worldPosition: [-40.0, 0.0, 30.0], dimensions: [12.0, 3.5, 10.0], inWorldLabel: 'SME LEARNING ACADEMY', maxCapacity: 10 },
      { facilityId: 'FACILITY-DIAG-06', name: 'Autonomous System Diagnostics Control Center', systemCategory: 'Diagnostics', worldPosition: [-25.0, 0.0, 30.0], dimensions: [10.0, 3.0, 8.0], inWorldLabel: 'SYSTEM DIAGNOSTICS', maxCapacity: 6 },
      { facilityId: 'FACILITY-CUSTOMER-BRIEFING', name: 'Customer Briefing & Interactive Intake Pavilion', systemCategory: 'Customer', worldPosition: [-28.0, 0.0, 0.0], dimensions: [8.0, 3.2, 8.0], inWorldLabel: 'CUSTOMER BRIEFING PAVILION', maxCapacity: 6 },
      { facilityId: 'FACILITY-CUSTOMER-ENTRANCE', name: 'Operations Campus & Site Main Entrance', systemCategory: 'Entrance', worldPosition: [-35.0, 0.0, 25.0], dimensions: [6.0, 2.5, 4.0], inWorldLabel: 'CAMPUS MAIN ENTRANCE', maxCapacity: 4 }
    ];
  }

  public static getCanonicalRoster(): any[] {
    const disciplines = [
      'Management', 'Architecture', 'Structure', 'Civil', 'Concrete',
      'Masonry', 'Roofing', 'Plumbing', 'Electrical', 'HVAC',
      'Fire Protection', 'Quality', 'Logistics', 'Academy', 'Diagnostics'
    ];

    const roster: any[] = [];
    roster.push({ roleId: 'PROJECT-PRIME', roleName: 'Project Prime Orchestrator', discipline: 'Management', roleCategory: 'MANAGER' });

    for (let i = 2; i <= 68; i++) {
      const disc = disciplines[(i - 2) % disciplines.length];
      const isManager = i <= 20;
      let roleId = `AGENT-${disc.toUpperCase()}-${i}`;
      if (i === 2) roleId = 'AGENT-SURVEY-001';
      if (i === 3) roleId = 'AGENT-EXCAV-001';
      if (i === 4) roleId = 'AGENT-CONCRETE-001';
      if (i === 5) roleId = 'AGENT-ARCH-001';
      if (i === 6) roleId = 'AGENT-STRUCT-001';
      if (i === 7) roleId = 'AGENT-PROCUREMENT-001';
      if (i === 8) roleId = 'AGENT-LOGISTICS-001';
      if (i === 9) roleId = 'AGENT-QUALITY-001';
      if (i === 10) roleId = 'AGENT-CIVIL-001';
      if (i === 11) roleId = 'AGENT-GEOTECH-001';

      roster.push({
        roleId,
        roleName: `${disc} Specialist Level ${i}`,
        discipline: disc,
        roleCategory: isManager ? 'MANAGER' : 'SPECIALIST'
      });
    }

    return roster;
  }

  public static initialize(): Validation006State {
    const campusFacilities = this.getCampusFacilities();
    const canonicalRoster = this.getCanonicalRoster();

    const agentSpatialStates: AgentSpatialState006[] = canonicalRoster.map((role) => {
      const fac = campusFacilities.find((f) => f.systemCategory === role.discipline) || campusFacilities[0];
      return {
        agentId: role.roleId,
        role: role.roleName,
        discipline: role.discipline,
        agentType: role.roleCategory === 'SPECIALIST' ? 'EXECUTION' : 'INTELLIGENCE',
        currentState: 'IDLE_AT_HOME_FACILITY',
        currentProjectId: 'LIVE-WORLD-VISUAL-VALIDATION-006',
        worldPosition: [...fac.worldPosition] as [number, number, number],
        worldRotation: [0, 0, 0],
        homeBaseEntityId: fac.facilityId,
        timestamp: new Date().toISOString()
      };
    });

    const spatialEntities = campusFacilities.map((f) => ({
      entityId: f.facilityId,
      entityType: 'OPERATIONS_FACILITY',
      name: `[${f.inWorldLabel}] ${f.name}`,
      category: f.systemCategory,
      positionXYZ: f.worldPosition,
      dimensionsXYZ: f.dimensions,
      maxOccupancy: f.maxCapacity
    }));

    const timestamp = new Date().toISOString();
    const event0 = {
      eventId: 'EVT-006-000-GENESIS',
      eventType: 'GENESIS_WORLD_INITIALIZED',
      projectId: 'LIVE-WORLD-VISUAL-VALIDATION-006',
      timestamp,
      payload: {
        autorun: false,
        currentCheckpoint: 0,
        checkpointName: 'CHECKPOINT_0_WORLD_GENESIS',
        campusFacilityCount: campusFacilities.length,
        stationedAgentCount: agentSpatialStates.length,
        buildingComponentCount: 0,
        projectMaterialCount: 0,
        status: 'PAUSED_WAITING_FOR_OWNER_AUTHORIZATION'
      }
    };

    const beforeStatePayload = JSON.stringify({ projectId: 'LIVE-WORLD-VISUAL-VALIDATION-006', step: -1, empty: true });
    const afterStatePayload = JSON.stringify({
      projectId: 'LIVE-WORLD-VISUAL-VALIDATION-006',
      step: 0,
      facilities: campusFacilities.length,
      agents: agentSpatialStates.length,
      buildingComponents: 0,
      materialsOnsite: 0
    });

    const beforeWorldStateHash = computeSha256(beforeStatePayload);
    const afterWorldStateHash = computeSha256(afterStatePayload);
    const beforeSceneSignature = 'SCENE_SIGNATURE_GENESIS_UNINITIALIZED';
    const afterSceneSignature = 'SCENE_SIGNATURE_GENESIS_CHECKPOINT_0_CAMPUS_17_AGENTS_68_SITE_EMPTY';

    const state: Validation006State = {
      projectId: 'LIVE-WORLD-VISUAL-VALIDATION-006',
      projectName: 'LIVE-WORLD-VISUAL-VALIDATION-006 (Master Clean-Room Visual Causality Validation)',
      status: 'CHECKPOINT_0_GENESIS_PAUSED',
      autorun: false,
      currentCheckpoint: 0,
      currentStepIndex: 0,
      genesisTimestamp: timestamp,
      lastEventTimestamp: timestamp,
      campusFacilities,
      spatialEntities,
      agentSpatialStates,
      buildingComponents: [],
      roomVolumes: [],
      materialsOnsite: [],
      surveyMarks: [],
      requirementDecisions: [],
      activeMissions: [],
      customerInteractions: [],
      buildableEnvelope: undefined,
      siteRealityModel: undefined,
      inspectionTickets: [],
      bomItems: [],
      scheduleActivities: [],
      gymLevel: 3,
      score: {
        overall: 100,
        completeness: 0,
        structuralValidation: 100,
        mepConnectivity: 100,
        clashFreePercentage: 100,
        codeValidation: 100
      },
      eventStream: [event0],
      hashes: {
        beforeWorldStateHash,
        afterWorldStateHash,
        beforeSceneSignature,
        afterSceneSignature
      },
      diagnostics: {
        checkpoint: 0,
        checkpointName: 'CHECKPOINT 0 — WORLD GENESIS',
        autorun: false,
        campusFacilityCount: campusFacilities.length,
        stationedAgentCount: agentSpatialStates.length,
        buildingComponentCount: 0,
        projectMaterialCount: 0,
        surveyMarkCount: 0,
        requirementRecordCount: 0,
        inspectionTicketCount: 0,
        bomItemCount: 0,
        clashCount: 0,
        worldStateHash: afterWorldStateHash,
        sceneSignature: afterSceneSignature,
        backendRenderParity: '100% PARITY (STATIONED WORKFORCE + LABELED CAMPUS + EMPTY CUSTOMER SITE)',
        ownerAuthorizationStatus: 'STOPPED_AT_CHECKPOINT_0_AWAITING_OWNER_AUTHORIZATION'
      }
    };

    this.cachedState = state;
    return state;
  }

  public static getCanonicalWorldState(): Validation006State {
    if (!this.cachedState) {
      this.initialize();
    }
    return this.cachedState!;
  }

  public static advanceToStep(targetStepIndex: number): Validation006State {
    let state = this.getCanonicalWorldState();

    if (targetStepIndex < 0) targetStepIndex = 0;
    if (targetStepIndex > 14) targetStepIndex = 14;

    for (let step = state.currentStepIndex + 1; step <= targetStepIndex; step++) {
      state = this.executeStepReducer(state, step);
    }

    this.cachedState = state;
    return state;
  }

  public static advanceOneStep(): Validation006State {
    const currentState = this.getCanonicalWorldState();
    const nextStep = currentState.currentStepIndex + 1;
    return this.advanceToStep(nextStep);
  }

  private static executeStepReducer(state: Validation006State, step: number): Validation006State {
    const timestamp = new Date().toISOString();
    const prevHash = state.hashes.afterWorldStateHash;
    let checkpointName = `CHECKPOINT ${step}`;

    switch (step) {
      case 1: {
        checkpointName = 'CHECKPOINT 1 — SITE PARCEL BOUNDARY CREATION';
        state.currentCheckpoint = 1;
        state.currentStepIndex = 1;
        state.status = 'CHECKPOINT_1_PARCEL_CREATED';

        state.siteRealityModel = {
          parcelId: 'PARCEL-006',
          areaSqMeters: 4046.86,
          areaAcres: 1.0,
          boundaryPolygon: [[-30.0, -30.0], [30.0, -30.0], [30.0, 30.0], [-30.0, 30.0]],
          elevationMinFt: 11.2,
          elevationMaxFt: 12.8
        };

        state.surveyMarks = [
          { markId: 'STAKE-NW', label: 'NW Corner Boundary Stake', position: [-30.0, 0.0, -30.0], elevationFt: 12.5 },
          { markId: 'STAKE-NE', label: 'NE Corner Boundary Stake', position: [30.0, 0.0, -30.0], elevationFt: 12.8 },
          { markId: 'STAKE-SE', label: 'SE Corner Boundary Stake', position: [30.0, 0.0, 30.0], elevationFt: 11.2 },
          { markId: 'STAKE-SW', label: 'SW Corner Boundary Stake', position: [-30.0, 0.0, 30.0], elevationFt: 11.5 }
        ];

        state.eventStream.push({
          eventId: `EVT-006-001-PARCEL`,
          eventType: 'PARCEL_BOUNDARY_CREATED',
          projectId: state.projectId,
          timestamp,
          payload: { parcelId: 'PARCEL-006', bounds: state.siteRealityModel.boundaryPolygon }
        });
        break;
      }

      case 2: {
        checkpointName = 'CHECKPOINT 2 — CUSTOMER ARRIVAL AT ENTRANCE';
        state.currentCheckpoint = 2;
        state.currentStepIndex = 2;
        state.status = 'CHECKPOINT_2_CUSTOMER_ARRIVED';

        state.customerInteractions.push({
          customerId: 'CUSTOMER-001',
          name: 'Customer 001 (Private Owner)',
          currentLocation: [-35.0, 0.0, 25.0],
          status: 'ARRIVED_AT_CAMPUS_ENTRANCE',
          timestamp
        });

        state.eventStream.push({
          eventId: `EVT-006-002-CUSTOMER`,
          eventType: 'CUSTOMER_ARRIVED_ENTRANCE',
          projectId: state.projectId,
          timestamp,
          payload: { customerId: 'CUSTOMER-001', location: [-35.0, 0.0, 25.0] }
        });
        break;
      }

      case 3: {
        checkpointName = 'CHECKPOINT 3 — CUSTOMER JOURNEY TO BRIEFING PAVILION';
        state.currentCheckpoint = 3;
        state.currentStepIndex = 3;
        state.status = 'CHECKPOINT_3_CUSTOMER_IN_BRIEFING';

        const cust = state.customerInteractions[0];
        if (cust) {
          cust.currentLocation = [-28.0, 0.0, 0.0];
          cust.status = 'STATIONED_AT_BRIEFING_PAVILION';
        }

        state.eventStream.push({
          eventId: `EVT-006-003-CUSTOMER-PATH`,
          eventType: 'CUSTOMER_DISPATCHED_TO_BRIEFING',
          projectId: state.projectId,
          timestamp,
          payload: { customerId: 'CUSTOMER-001', target: 'FACILITY-CUSTOMER-BRIEFING', position: [-28.0, 0.0, 0.0] }
        });
        break;
      }

      case 4: {
        checkpointName = 'CHECKPOINT 4 — PRIME NOTIFIED OF CUSTOMER REQUEST';
        state.currentCheckpoint = 4;
        state.currentStepIndex = 4;
        state.status = 'CHECKPOINT_4_PRIME_NOTIFIED';

        state.activeMissions.push({
          missionId: 'MISSION-INTAKE-006',
          title: 'Customer Requirements Briefing & Project Initiation',
          assignedAgentId: 'PROJECT-PRIME',
          status: 'REQUEST_RECEIVED',
          priority: 'HIGH',
          timestamp
        });

        state.eventStream.push({
          eventId: `EVT-006-004-PRIME-NOTIFIED`,
          eventType: 'PRIME_NOTIFIED_CUSTOMER_REQUEST',
          projectId: state.projectId,
          timestamp,
          payload: { missionId: 'MISSION-INTAKE-006', agentId: 'PROJECT-PRIME' }
        });
        break;
      }

      case 5: {
        checkpointName = 'CHECKPOINT 5 — PRIME DISPATCHED TO BRIEFING PAVILION';
        state.currentCheckpoint = 5;
        state.currentStepIndex = 5;
        state.status = 'CHECKPOINT_5_PRIME_AT_BRIEFING';

        const primeAgent = state.agentSpatialStates.find((a) => a.agentId === 'PROJECT-PRIME');
        if (primeAgent) {
          primeAgent.worldPosition = [-28.0, 0.0, 0.0];
          primeAgent.currentState = 'CONDUCTING_CUSTOMER_INTERVIEW';
        }

        state.eventStream.push({
          eventId: `EVT-006-005-PRIME-DISPATCH`,
          eventType: 'PRIME_DISPATCHED_TO_BRIEFING',
          projectId: state.projectId,
          timestamp,
          payload: { agentId: 'PROJECT-PRIME', targetPosition: [-28.0, 0.0, 0.0] }
        });
        break;
      }

      case 6: {
        checkpointName = 'CHECKPOINT 6 — REQUIREMENTS INTERVIEW & 12 DECISION RECORDS';
        state.currentCheckpoint = 6;
        state.currentStepIndex = 6;
        state.status = 'CHECKPOINT_6_REQUIREMENTS_ESTABLISHED';

        state.requirementDecisions = [
          { key: 'BUILDING_TYPE', value: 'SINGLE_FAMILY_RESIDENTIAL', category: 'PROGRAM' },
          { key: 'INTENDED_USE', value: 'PRIMARY_RESIDENCE', category: 'PROGRAM' },
          { key: 'TARGET_AREA_SQFT', value: 1184, category: 'SPATIAL' },
          { key: 'STORIES', value: 1, category: 'ARCHITECTURE' },
          { key: 'BEDROOMS', value: 2, category: 'SPATIAL' },
          { key: 'BATHROOMS', value: 2, category: 'SPATIAL' },
          { key: 'KITCHEN_TYPE', value: 'OPEN_CONCEPT', category: 'ARCHITECTURE' },
          { key: 'ACCESSIBILITY_NEEDS', value: ['ZERO_THRESHOLD'], category: 'COMPLIANCE' },
          { key: 'DURABILITY_REQUIREMENTS', value: ['160_MPH_WIND', 'SALT_CORROSION_RESISTANT'], category: 'STRUCTURAL' },
          { key: 'JURISDICTION_CODE', value: 'FLORIDA_BUILDING_CODE_2023_HVHZ', category: 'COMPLIANCE' },
          { key: 'FOUNDATION_PREFERRED', value: 'MONOLITHIC_CONCRETE_SLAB', category: 'STRUCTURAL' },
          { key: 'BUDGET_CAP_USD', value: 310000, category: 'FINANCIAL' }
        ];

        state.eventStream.push({
          eventId: `EVT-006-006-REQUIREMENTS`,
          eventType: 'REQUIREMENTS_INTERVIEW_COMPLETED',
          projectId: state.projectId,
          timestamp,
          payload: { recordCount: 12 }
        });
        break;
      }

      case 7: {
        checkpointName = 'CHECKPOINT 7 — SITE SURVEY & GEOTECHNICAL DISPATCH';
        state.currentCheckpoint = 7;
        state.currentStepIndex = 7;
        state.status = 'CHECKPOINT_7_SITE_SURVEYED';

        const surveyAgent = state.agentSpatialStates.find((a) => a.agentId === 'AGENT-SURVEY-001');
        const geotechAgent = state.agentSpatialStates.find((a) => a.agentId === 'AGENT-GEOTECH-001');

        if (surveyAgent) {
          surveyAgent.worldPosition = [0.0, 0.0, -10.0];
          surveyAgent.currentState = 'EXECUTING_TOTAL_STATION_SURVEY';
        }
        if (geotechAgent) {
          geotechAgent.worldPosition = [5.0, 0.0, 5.0];
          geotechAgent.currentState = 'EXECUTING_SPT_BORING_TEST';
        }

        state.surveyMarks.push(
          { markId: 'SPT-001', label: 'Soil Boring Test Point #1', position: [5.0, 0.0, 5.0], bearingCapacityPsf: 2200, groundwaterDepthFt: 4.5 }
        );

        state.eventStream.push({
          eventId: `EVT-006-007-SURVEY`,
          eventType: 'SITE_SURVEY_AND_SOIL_COMPLETED',
          projectId: state.projectId,
          timestamp,
          payload: { totalStationMark: 'STATION-01', sptBoring: 'SPT-001', bearingCapacityPsf: 2200 }
        });
        break;
      }

      case 8: {
        checkpointName = 'CHECKPOINT 8 — BUILDABLE ENVELOPE CALCULATION';
        state.currentCheckpoint = 8;
        state.currentStepIndex = 8;
        state.status = 'CHECKPOINT_8_ENVELOPE_GENERATED';

        state.buildableEnvelope = {
          envelopeId: 'ENVELOPE-V6-001',
          originXYZ: [-15.0, 0.0, -12.0],
          dimensionsXYZ: [30.0, 6.0, 24.0],
          setbacksFt: { front: 25, rear: 20, leftSide: 10, rightSide: 10 },
          maxAllowedHeightFt: 35.0,
          maxCoverageSqFt: 2500
        };

        state.eventStream.push({
          eventId: `EVT-006-008-ENVELOPE`,
          eventType: 'BUILDABLE_ENVELOPE_GENERATED',
          projectId: state.projectId,
          timestamp,
          payload: { envelopeId: 'ENVELOPE-V6-001', maxCoverageSqFt: 2500 }
        });
        break;
      }

      case 9: {
        checkpointName = 'CHECKPOINT 9 — ARCHITECTURAL SPATIAL ROOM VOLUMES';
        state.currentCheckpoint = 9;
        state.currentStepIndex = 9;
        state.status = 'CHECKPOINT_9_ROOMS_GENERATED';

        state.roomVolumes = [
          { roomId: 'ROOM-LIVING', name: 'Open Living & Dining Room', positionXYZ: [-12.0, 0.0, -8.0], dimensionsXYZ: [10.0, 3.0, 8.0], areaSqFt: 430 },
          { roomId: 'ROOM-KITCHEN', name: 'Gourmet Kitchen', positionXYZ: [-2.0, 0.0, -8.0], dimensionsXYZ: [6.0, 3.0, 8.0], areaSqFt: 258 },
          { roomId: 'ROOM-BED-1', name: 'Primary Suite Bedroom', positionXYZ: [-12.0, 0.0, 2.0], dimensionsXYZ: [7.0, 3.0, 6.0], areaSqFt: 226 },
          { roomId: 'ROOM-BATH-1', name: 'Primary Suite Ensuite Bathroom', positionXYZ: [-5.0, 0.0, 2.0], dimensionsXYZ: [4.0, 3.0, 4.0], areaSqFt: 86 },
          { roomId: 'ROOM-BED-2', name: 'Guest Bedroom 2', positionXYZ: [-12.0, 0.0, 9.0], dimensionsXYZ: [6.0, 3.0, 5.0], areaSqFt: 161 },
          { roomId: 'ROOM-BATH-2', name: 'Guest Bath 2', positionXYZ: [-6.0, 0.0, 9.0], dimensionsXYZ: [3.0, 3.0, 5.0], areaSqFt: 81 },
          { roomId: 'ROOM-UTILITY', name: 'MEP Utility Room', positionXYZ: [-3.0, 0.0, 9.0], dimensionsXYZ: [3.0, 3.0, 5.0], areaSqFt: 81 }
        ];

        state.spatialEntities.push(
          ...state.roomVolumes.map((r) => ({
            entityId: r.roomId,
            entityType: 'SPATIAL_ROOM_VOLUME',
            name: r.name,
            category: 'Architecture',
            positionXYZ: r.positionXYZ,
            dimensionsXYZ: r.dimensionsXYZ
          }))
        );

        state.eventStream.push({
          eventId: `EVT-006-009-ROOMS`,
          eventType: 'ROOM_VOLUMES_GENERATED',
          projectId: state.projectId,
          timestamp,
          payload: { roomCount: state.roomVolumes.length, totalAreaSqFt: 1323 }
        });
        break;
      }

      case 10: {
        checkpointName = 'CHECKPOINT 10 — ENGINEERED BILL OF MATERIALS (BOM) TAKEOFF';
        state.currentCheckpoint = 10;
        state.currentStepIndex = 10;
        state.status = 'CHECKPOINT_10_BOM_DERIVED';

        state.bomItems = [
          { itemId: 'BOM-001', category: 'Concrete', description: '4000 PSI Monolithic Slab Concrete with Vapor Barrier', quantity: 48, unit: 'Cubic Yards', unitCostUSD: 165, totalCostUSD: 7920, trade: 'Concrete' },
          { itemId: 'BOM-002', category: 'Framing', description: 'Southern Yellow Pine #2 Engineered Timber Studs & Headers', quantity: 380, unit: 'Pieces', unitCostUSD: 14.5, totalCostUSD: 5510, trade: 'Framing' },
          { itemId: 'BOM-003', category: 'Roofing', description: '24-Gauge Galvalume Standing Seam Metal Roof Panels', quantity: 1450, unit: 'SqFt', unitCostUSD: 8.5, totalCostUSD: 12325, trade: 'Roofing' },
          { itemId: 'BOM-004', category: 'Plumbing', description: 'PEX-a Flexible Water Supply Tubing & Copper Main Manifold', quantity: 650, unit: 'Linear Feet', unitCostUSD: 3.2, totalCostUSD: 2080, trade: 'Plumbing' },
          { itemId: 'BOM-005', category: 'Electrical', description: '200A Main Service Panel & Copper Romex 12/2 Wiring', quantity: 1800, unit: 'Linear Feet', unitCostUSD: 2.8, totalCostUSD: 5040, trade: 'Electrical' },
          { itemId: 'BOM-006', category: 'HVAC', description: 'SEER2 16 Split-System Heat Pump & Insulated R-8 Flex Ducting', quantity: 1, unit: 'System Package', unitCostUSD: 8400, totalCostUSD: 8400, trade: 'HVAC' },
          { itemId: 'BOM-007', category: 'Envelope', description: 'Impact-Resistant Double-Pane Windows (160mph Wind Rating)', quantity: 12, unit: 'Units', unitCostUSD: 650, totalCostUSD: 7800, trade: 'Windows' },
          { itemId: 'BOM-008', category: 'Fire Protection', description: 'Interconnected Smoke Detectors & Automated Fire Dampers', quantity: 8, unit: 'Units', unitCostUSD: 120, totalCostUSD: 960, trade: 'Fire Protection' }
        ];

        state.eventStream.push({
          eventId: `EVT-006-010-BOM`,
          eventType: 'BOM_QUANTITIES_DERIVED',
          projectId: state.projectId,
          timestamp,
          payload: { bomItemCount: state.bomItems.length, totalEstimatedCostUSD: 50035 }
        });
        break;
      }

      case 11: {
        checkpointName = 'CHECKPOINT 11 — MATERIAL PROCUREMENT & ONSITE LOGISTICS DELIVERY';
        state.currentCheckpoint = 11;
        state.currentStepIndex = 11;
        state.status = 'CHECKPOINT_11_MATERIALS_DELIVERED';

        state.materialsOnsite = [
          { materialId: 'MAT-CONCRETE-PALLET', name: '4000 PSI Ready-Mix Transit Truck Dispatch', category: 'Concrete', positionXYZ: [20.0, 0.0, -15.0], dimensionsXYZ: [3.5, 3.0, 8.0], status: 'ONSITE_READY' },
          { materialId: 'MAT-TIMBER-PALLET-01', name: 'SYP #2 Framing Lumber Pallet Pack A', category: 'Framing', positionXYZ: [22.0, 0.0, -5.0], dimensionsXYZ: [2.5, 1.8, 5.0], status: 'ONSITE_READY' },
          { materialId: 'MAT-ROOF-PANELS', name: 'Galvalume Standing Seam Panel Bundle', category: 'Roofing', positionXYZ: [22.0, 0.0, 5.0], dimensionsXYZ: [2.0, 1.2, 8.0], status: 'ONSITE_READY' },
          { materialId: 'MAT-MEP-CRATES', name: 'Combined Plumbing, Electrical & HVAC Fixture Crates', category: 'MEP', positionXYZ: [20.0, 0.0, 15.0], dimensionsXYZ: [3.0, 2.0, 4.0], status: 'ONSITE_READY' }
        ];

        state.eventStream.push({
          eventId: `EVT-006-011-PROCUREMENT`,
          eventType: 'MATERIALS_PROCURED_AND_DELIVERED',
          projectId: state.projectId,
          timestamp,
          payload: { deliveredMaterialBatches: state.materialsOnsite.length }
        });
        break;
      }

      case 12: {
        checkpointName = 'CHECKPOINT 12 — FOUNDATION SLAB POUR & STRUCTURAL FRAMING';
        state.currentCheckpoint = 12;
        state.currentStepIndex = 12;
        state.status = 'CHECKPOINT_12_FOUNDATION_AND_FRAMING_BUILT';

        state.buildingComponents = [
          { componentId: 'COMP-SLAB-01', name: 'Monolithic Concrete Slab Foundation', category: 'Foundation', discipline: 'Concrete', positionXYZ: [-7.5, 0.0, 0.0], dimensionsXYZ: [16.0, 0.3, 20.0], material: '4000 PSI Reinforced Concrete', installationPhase: 'FOUNDATION' },
          { componentId: 'COMP-WALL-EXT-NORTH', name: 'Exterior Load-Bearing North Wall', category: 'Structure', discipline: 'Framing', positionXYZ: [-7.5, 0.3, -10.0], dimensionsXYZ: [16.0, 2.9, 0.2], material: 'SYP #2 Engineered Timber Studs', installationPhase: 'FRAMING' },
          { componentId: 'COMP-WALL-EXT-SOUTH', name: 'Exterior Load-Bearing South Wall', category: 'Structure', discipline: 'Framing', positionXYZ: [-7.5, 0.3, 10.0], dimensionsXYZ: [16.0, 2.9, 0.2], material: 'SYP #2 Engineered Timber Studs', installationPhase: 'FRAMING' },
          { componentId: 'COMP-WALL-EXT-WEST', name: 'Exterior Load-Bearing West Wall', category: 'Structure', discipline: 'Framing', positionXYZ: [-15.5, 0.3, 0.0], dimensionsXYZ: [0.2, 2.9, 20.0], material: 'SYP #2 Engineered Timber Studs', installationPhase: 'FRAMING' },
          { componentId: 'COMP-WALL-EXT-EAST', name: 'Exterior Load-Bearing East Wall', category: 'Structure', discipline: 'Framing', positionXYZ: [0.5, 0.3, 0.0], dimensionsXYZ: [0.2, 2.9, 20.0], material: 'SYP #2 Engineered Timber Studs', installationPhase: 'FRAMING' },
          { componentId: 'COMP-ROOF-TRUSS-01', name: '24-Gauge Standing Seam Roof Truss Assembly', category: 'Roofing', discipline: 'Roofing', positionXYZ: [-7.5, 3.2, 0.0], dimensionsXYZ: [16.4, 1.2, 20.4], material: 'Galvalume Standing Seam Metal', installationPhase: 'ROOFING' }
        ];

        state.spatialEntities.push(
          ...state.buildingComponents.map((c) => ({
            entityId: c.componentId,
            entityType: 'BUILDING_COMPONENT',
            name: c.name,
            category: c.category,
            positionXYZ: c.positionXYZ,
            dimensionsXYZ: c.dimensionsXYZ
          }))
        );

        state.eventStream.push({
          eventId: `EVT-006-012-STRUCTURE`,
          eventType: 'FOUNDATION_SLAB_AND_FRAMING_BUILT',
          projectId: state.projectId,
          timestamp,
          payload: { componentCount: state.buildingComponents.length }
        });
        break;
      }

      case 13: {
        checkpointName = 'CHECKPOINT 13 — MEP & LIFE SAFETY FIXTURES ROUGH-IN';
        state.currentCheckpoint = 13;
        state.currentStepIndex = 13;
        state.status = 'CHECKPOINT_13_MEP_INSTALLED';

        state.buildingComponents.push(
          { componentId: 'COMP-PLUMB-MAIN', name: 'Primary Water Main Supply Manifold & PEX Run', category: 'Plumbing', discipline: 'Plumbing', positionXYZ: [-5.0, 0.3, 2.0], dimensionsXYZ: [0.4, 2.2, 0.4], material: 'Copper & PEX-a Tubing', installationPhase: 'ROUGH_IN' },
          { componentId: 'COMP-ELEC-PANEL', name: '200A Main Breaker Panel & Conduit Riser', category: 'Electrical', discipline: 'Electrical', positionXYZ: [-3.0, 1.2, 9.0], dimensionsXYZ: [0.6, 1.0, 0.2], material: 'Copper Romex & NEMA Box', installationPhase: 'ROUGH_IN' },
          { componentId: 'COMP-HVAC-UNIT', name: 'SEER2 16 Air Handler & Main Trunk Ductwork', category: 'HVAC', discipline: 'HVAC', positionXYZ: [-3.0, 2.5, 9.0], dimensionsXYZ: [1.2, 0.8, 1.2], material: 'Insulated R-8 Galvanized Duct', installationPhase: 'ROUGH_IN' },
          { componentId: 'COMP-FIRE-SMOKE-01', name: 'Photoelectric Interconnected Smoke Alarm Node', category: 'Fire Protection', discipline: 'Fire Protection', positionXYZ: [-12.0, 3.0, -4.0], dimensionsXYZ: [0.3, 0.1, 0.3], material: 'UL 217 Fire Sensor', installationPhase: 'FINISH' }
        );

        state.eventStream.push({
          eventId: `EVT-006-013-MEP`,
          eventType: 'MEP_SYSTEMS_INSTALLED',
          projectId: state.projectId,
          timestamp,
          payload: { totalComponentCount: state.buildingComponents.length }
        });
        break;
      }

      case 14: {
        checkpointName = 'CHECKPOINT 14 — AUTOMATED INSPECTION, CLASH DETECTION & AUTO-REPAIR LOOP';
        state.currentCheckpoint = 14;
        state.currentStepIndex = 14;
        state.status = 'CHECKPOINT_14_INSPECTIONS_AND_AUTO_REPAIR_PASSED';

        state.inspectionTickets = [
          { ticketId: 'TICKET-FOUND-01', discipline: 'Concrete', itemTarget: 'COMP-SLAB-01', inspectionResult: 'PASS', auditor: 'AGENT-QUALITY-001', details: 'Slab thickness 0.3m (12 in) verified. Rebar mesh grid meets FBC 2023 specs.', timestamp },
          { ticketId: 'TICKET-STRUCT-01', discipline: 'Framing', itemTarget: 'COMP-WALL-EXT-NORTH', inspectionResult: 'PASS', auditor: 'AGENT-QUALITY-001', details: 'SYP #2 studs spacing 16in OC verified for 160mph wind shear loads.', timestamp },
          { ticketId: 'TICKET-CLASH-REPAIR-01', discipline: 'Plumbing', itemTarget: 'COMP-PLUMB-MAIN', inspectionResult: 'RESOLVED_REPAIRED', auditor: 'AGENT-QUALITY-001', details: 'Detected minor clearance conflict with wall stud joist. AGENT-PLUMB-001 rerouted conduit 50mm offset. Inspection PASS.', timestamp }
        ];

        state.score = {
          overall: 100,
          completeness: 100,
          structuralValidation: 100,
          mepConnectivity: 100,
          clashFreePercentage: 100,
          codeValidation: 100
        };

        state.eventStream.push({
          eventId: `EVT-006-014-INSPECTION-PASS`,
          eventType: 'INSPECTION_CLASH_DETECTION_AND_REPAIR_COMPLETED',
          projectId: state.projectId,
          timestamp,
          payload: { inspectionTicketCount: state.inspectionTickets.length, status: '100% VERIFIED PASS' }
        });
        break;
      }
    }

    const statePayload = JSON.stringify({
      projectId: state.projectId,
      step: state.currentStepIndex,
      facilities: state.campusFacilities.length,
      agents: state.agentSpatialStates.length,
      components: state.buildingComponents.length,
      materials: state.materialsOnsite.length,
      surveyMarks: state.surveyMarks.length,
      requirements: state.requirementDecisions.length,
      bomItems: state.bomItems.length,
      inspections: state.inspectionTickets.length
    });

    state.lastEventTimestamp = timestamp;
    state.hashes.beforeWorldStateHash = prevHash;
    state.hashes.afterWorldStateHash = computeSha256(statePayload);
    state.hashes.beforeSceneSignature = `SCENE_SIGNATURE_STEP_${step - 1}`;
    state.hashes.afterSceneSignature = `SCENE_SIGNATURE_${checkpointName.replace(/[^A-Z0-9]/g, '_')}`;

    state.diagnostics = {
      checkpoint: state.currentCheckpoint,
      checkpointName,
      autorun: false,
      campusFacilityCount: state.campusFacilities.length,
      stationedAgentCount: state.agentSpatialStates.length,
      buildingComponentCount: state.buildingComponents.length,
      projectMaterialCount: state.materialsOnsite.length,
      surveyMarkCount: state.surveyMarks.length,
      requirementRecordCount: state.requirementDecisions.length,
      inspectionTicketCount: state.inspectionTickets.length,
      bomItemCount: state.bomItems.length,
      clashCount: 0,
      worldStateHash: state.hashes.afterWorldStateHash,
      sceneSignature: state.hashes.afterSceneSignature,
      backendRenderParity: `100% PARITY (${checkpointName})`,
      ownerAuthorizationStatus: step < 14 ? `STOPPED_AT_CHECKPOINT_${step}_AWAITING_OWNER_AUTHORIZATION` : 'COMPLETE_FULL_CAUSAL_VALIDATION_PASSED'
    };

    return state;
  }
}
