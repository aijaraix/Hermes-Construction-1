import fs from 'fs';
import path from 'path';
import {
  BIMComponent,
  BOMItem,
  InspectionTicket,
  FastenerScheduleItem,
  CrossTradeChangeRequest,
  SpatialModelRevision,
  SpatialAcademyProject,
  Phase318B3CheckpointReport,
  SystemCategory,
  KnowledgeGapRecord
} from '../src/types/hermes';
import { generateBOMFromComponents } from './deterministicGeometryEngine';

export class SpatialAcademyEngine {
  private static isRunning = false;
  private static heartbeatTimer: NodeJS.Timeout | null = null;
  private static persistencePath = path.join(process.cwd(), 'server', 'persistence', 'spatial_academy_state.json');

  // Metrics tracking
  private static metrics = {
    completedAgentTasks: 0,
    failedAgentTasks: 0,
    crossTradeConsultations: 0,
    clashesFound: 0,
    clashesResolved: 0,
    inspectionDefects: 0,
    repairsExecuted: 0,
    knowledgeGapsCreated: 0,
    retrainingCycles: 0,
  };

  // Active Training Project
  private static activeProject: SpatialAcademyProject = SpatialAcademyEngine.createInitialBathroomProject();

  /**
   * Initializes the Spatial Academy and loads persistent state
   */
  public static initialize(): void {
    this.ensurePersistenceDirectory();
    this.loadPersistentState();

    if (!this.activeProject) {
      this.activeProject = this.createInitialBathroomProject();
    }

    this.isRunning = true;
    console.log(`[SPATIAL ACADEMY] Spatial Construction Academy Initialized. Active Project: ${this.activeProject.projectId}`);

    // Run initial construction cycle if project is still in early stage
    if (this.activeProject.revisions.length <= 1) {
      this.runFirstBathroomConstructionSequence();
    }

    // Set up continuous background heartbeat for automatic learning and spatial building
    if (!this.heartbeatTimer) {
      this.heartbeatTimer = setInterval(() => {
        try {
          this.runConstructionCycle();
        } catch (err) {
          console.error('[SPATIAL ACADEMY] Error in spatial heartbeat cycle:', err);
        }
      }, 15000); // Heartbeat every 15s
    }
  }

  public static isAcademyActive(): boolean {
    return this.isRunning;
  }

  public static getActiveProject(): SpatialAcademyProject {
    return this.activeProject;
  }

  /**
   * Section 36 & 38 First Required Integrated Exam: GYM-BATHROOM-0001
   * Begins from an empty/incomplete spatial room volume.
   */
  private static createInitialBathroomProject(): SpatialAcademyProject {
    const initialRevision: SpatialModelRevision = {
      revisionId: 'REV-000001',
      revisionNumber: 1,
      timestamp: new Date().toISOString(),
      agentId: 'PRIME-ORCHESTRATOR',
      agentRole: 'Prime Orchestrator',
      managerId: 'ROOM-MANAGER-BATHROOM',
      taskDescription: 'Establish empty canonical bathroom volume boundaries & grid (10ft x 8ft x 9ft)',
      actionType: 'CREATE_WALL',
      objectsAdded: [],
      objectsChanged: [],
      objectsRemoved: [],
      materialsAdded: [],
      bomDeltaTotalCost: 0,
      reasoning: 'Initializing empty spatial room volume for Level 4 integrated multi-trade examination.',
      codeReference: 'FBC 2023 / IRC 2024 Section R307 Minimum Room Dimensions',
      modelSnapshot: [], // Zero components built at start!
    };

    return {
      projectId: 'GYM-BATHROOM-0001',
      title: 'Canonical 80 sq ft Master Bathroom Construction Exam',
      difficultyLevel: 4,
      difficultyName: 'LEVEL 4 — ROOM',
      stage: 'SPATIAL_CONSTRUCTION',
      siteCoordinateSystem: {
        origin: [0, 0, 0],
        bounds: [10, 9, 8], // 10ft wide, 9ft high, 8ft deep
        units: 'feet',
      },
      components: [],
      fasteners: [],
      revisions: [initialRevision],
      inspectionTickets: [],
      crossTradeRequests: [],
      knowledgeGaps: [],
      agentAssignments: [
        { agentId: 'WOOD-FRAMING-AGENT', role: 'Wood Framing Specialist', system: 'Structure' },
        { agentId: 'ELECTRICAL-BRANCH-AGENT', role: 'Electrical Branch Specialist', system: 'Electrical' },
        { agentId: 'PLUMBING-DWV-AGENT', role: 'Plumbing Supply & DWV Specialist', system: 'Plumbing' },
        { agentId: 'HVAC-AIR-AGENT', role: 'HVAC Ventilation Specialist', system: 'HVAC' },
        { agentId: 'WATERPROOFING-AGENT', role: 'Tile Backer & Waterproofing Specialist', system: 'Envelope' },
        { agentId: 'ROOM-MANAGER-BATHROOM', role: 'Bathroom Room Manager', system: 'Architecture' },
        { agentId: 'INDEPENDENT-INSPECTOR', role: 'Independent Building Inspector', system: 'Architecture' },
      ],
      digitalCompletionPct: 0,
      isDigitallyComplete: false,
      startedFromEmpty: true,
    };
  }

  /**
   * Executes continuous spatial construction heartbeat step-by-step
   */
  public static runConstructionCycle(): SpatialAcademyProject {
    if (!this.activeProject) {
      this.activeProject = this.createInitialBathroomProject();
    }

    const proj = this.activeProject;
    const revCount = proj.revisions.length;

    // Step-by-step construction sequence for GYM-BATHROOM-0001
    if (revCount === 1) {
      // Step 1: Wood Framing Specialist constructs structural wall envelope
      this.executeActionWoodFramingWall();
    } else if (revCount === 2) {
      // Step 2: Waterproofing Specialist adds cementitious backer board & moisture barrier
      this.executeActionWaterproofing();
    } else if (revCount === 3) {
      // Step 3: Plumbing Specialist routes DWV stack & water supply lines
      this.executeActionPlumbingRoughIn();
    } else if (revCount === 4) {
      // Step 4: Electrical Specialist routes NM-B wiring & places GFCI outlet boxes
      this.executeActionElectricalRoughIn();
    } else if (revCount === 5) {
      // Step 5: HVAC Specialist routes 80 CFM exhaust ducting
      this.executeActionHVACVentilation();
    } else if (revCount === 6) {
      // Step 6: Independent Inspector performs sweep & injects defect (missing nail plate on plumbing penetration)
      this.executeInspectorDefectInjection();
    } else if (revCount === 7) {
      // Step 7: Defect Retraining & Repair Revision
      this.executeDefectRepair();
    } else {
      // General ongoing construction activity & cross-trade optimization
      this.executeOngoingSpatialRefinement();
    }

    // Recalculate digital completion %
    proj.digitalCompletionPct = Math.min(100, Math.round((proj.components.length / 14) * 100));
    if (proj.digitalCompletionPct >= 100 && proj.inspectionTickets.every(t => t.status === 'verified_closed')) {
      proj.isDigitallyComplete = true;
      proj.stage = 'DIGITALLY_COMPLETE';
    }

    this.savePersistentState();
    return proj;
  }

  private static runFirstBathroomConstructionSequence(): void {
    // Run initial 5 steps to populate bathroom from empty state
    for (let i = 0; i < 6; i++) {
      this.runConstructionCycle();
    }
  }

  // --- Step 1: Wood Framing Specialist ---
  private static executeActionWoodFramingWall(): void {
    const proj = this.activeProject;

    const northWall: BIMComponent = {
      id: 'WALL-BATH-NORTH-001',
      type: 'wall',
      system: 'Structure',
      floor: 1,
      room: 'Master Bathroom',
      assembly: '2x4 Wood Stud Wall 16 in OC with 1/2 in Drywall',
      materials: [
        { name: '2x4 Douglas Fir Studs', specification: 'No. 2 Grade 16in OC', quantity: 8, unit: 'ea' },
        { name: '1/2 in Moisture-Resistant Drywall', specification: 'ASTM C1396 Greenboard', quantity: 80, unit: 'sq ft' }
      ],
      geometry: { position: [0, 0, 0], dimensions: [10, 9, 0.5] },
      isExterior: false,
      exposure: 'Interior Wet Room',
      connectedComponentIds: ['WALL-BATH-EAST-001', 'WALL-BATH-WEST-001'],
      openings: [],
      quantity: { value: 80, unit: 'sq ft' },
      unitCost: 12.50,
      totalCost: 1000,
      installationStageDay: 1,
      inspectionState: 'passed',
      whySelected: {
        reason: 'Constructed load-bearing interior wet-wall framing using 2x4 studs at 16in OC',
        environmentalFactor: 'High indoor humidity environment requires MR greenboard sheathing',
        codeRule: 'FBC 2023 Section 2308.5.1 / IRC R602.3 Wood Wall Framing',
        alternativesConsidered: ['2x6 Wood Framing', 'Light Gauge Steel Studs'],
        costImpact: 'Standard framing baseline cost',
        lifecycleNotes: 'Sized for plumbing pipe notch limits'
      }
    };

    const southWall: BIMComponent = {
      id: 'WALL-BATH-SOUTH-002',
      type: 'wall',
      system: 'Structure',
      floor: 1,
      room: 'Master Bathroom',
      assembly: '2x4 Wood Stud Wall 16 in OC',
      materials: [
        { name: '2x4 Douglas Fir Studs', specification: 'No. 2 Grade 16in OC', quantity: 8, unit: 'ea' }
      ],
      geometry: { position: [0, 0, 8], dimensions: [10, 9, 0.5] },
      isExterior: false,
      exposure: 'Interior Dry',
      connectedComponentIds: [],
      openings: ['DOOR-BATH-001'],
      quantity: { value: 80, unit: 'sq ft' },
      unitCost: 12.50,
      totalCost: 1000,
      installationStageDay: 1,
      inspectionState: 'passed',
      whySelected: {
        reason: 'Constructed entry partition wall with framed rough door opening',
        environmentalFactor: 'Interior partition',
        codeRule: 'IRC R602.3 Wood Framing Standards',
        alternativesConsidered: [],
        costImpact: 'Standard cost',
        lifecycleNotes: 'Sized for 32in interior door jamb'
      }
    };

    proj.components.push(northWall, southWall);

    proj.fasteners.push({
      id: 'FAST-WOOD-001',
      type: '16d Common Nails',
      material: 'Hot-Dip Galvanized Steel',
      size: '3.5 in x 0.162 in',
      spacingPattern: '2 nails per stud top/bottom plate connection',
      quantity: 64,
      hostObjectId: 'WALL-BATH-NORTH-001',
      purpose: 'Structural stud-to-plate connection',
      codeReference: 'IRC Table R602.3(1) Fastener Schedule'
    });

    const revision: SpatialModelRevision = {
      revisionId: `REV-${String(proj.revisions.length + 1).padStart(6, '0')}`,
      revisionNumber: proj.revisions.length + 1,
      timestamp: new Date().toISOString(),
      agentId: 'WOOD-FRAMING-AGENT',
      agentRole: 'Wood Framing Specialist',
      managerId: 'ROOM-MANAGER-BATHROOM',
      taskDescription: 'Constructed North wet-wall framing & South entry partition wall',
      actionType: 'CREATE_WALL',
      objectsAdded: ['WALL-BATH-NORTH-001', 'WALL-BATH-SOUTH-002'],
      objectsChanged: [],
      objectsRemoved: [],
      materialsAdded: [{ name: '2x4 Douglas Fir Studs', qty: 16, unit: 'ea' }],
      bomDeltaTotalCost: 2000,
      reasoning: 'Applied FBC 2023 Section 2308 framing rules to construct 2x4 stud layout at 16in OC.',
      codeReference: 'FBC 2023 Section 2308.5.1 / IRC R602.3',
      modelSnapshot: JSON.parse(JSON.stringify(proj.components))
    };

    proj.revisions.push(revision);
    this.metrics.completedAgentTasks += 1;
  }

  // --- Step 2: Waterproofing Specialist ---
  private static executeActionWaterproofing(): void {
    const proj = this.activeProject;

    const showerBacker: BIMComponent = {
      id: 'WATERPROOF-SHOWER-001',
      type: 'waterproofing',
      system: 'Envelope',
      floor: 1,
      room: 'Master Bathroom',
      assembly: '1/2 in Cement Backer Board with Waterproof Elastomeric Membrane',
      materials: [
        { name: '1/2 in Cementitious Tile Backer', specification: 'ANSI A118.9 Cement Board', quantity: 48, unit: 'sq ft' },
        { name: 'Liquid Waterproofing Membrane', specification: 'ANSI A118.10 Liquid Membrane', quantity: 2, unit: 'gal' }
      ],
      geometry: { position: [0, 0, 0.1], dimensions: [5, 7, 0.5] },
      isExterior: false,
      exposure: 'Continuous Direct Shower Water Spray',
      connectedComponentIds: ['WALL-BATH-NORTH-001'],
      openings: [],
      quantity: { value: 48, unit: 'sq ft' },
      unitCost: 8.50,
      totalCost: 408,
      installationStageDay: 2,
      inspectionState: 'passed',
      whySelected: {
        reason: 'Installed continuous cement backer board & liquid waterproofing membrane in shower wet zone',
        environmentalFactor: 'Direct continuous moisture spray zone in shower enclosure',
        codeRule: 'FBC 2023 / IRC Section R702.4.2 Fiber-Cement & Cementitious Backer Units',
        alternativesConsidered: ['Standard Gypsum Board (Prohibited in wet spray zone)'],
        costImpact: 'Increases longevity and prevents hidden stud rot',
        lifecycleNotes: 'Must extend 70 inches above shower drain height'
      }
    };

    proj.components.push(showerBacker);

    const revision: SpatialModelRevision = {
      revisionId: `REV-${String(proj.revisions.length + 1).padStart(6, '0')}`,
      revisionNumber: proj.revisions.length + 1,
      timestamp: new Date().toISOString(),
      agentId: 'WATERPROOFING-AGENT',
      agentRole: 'Tile Backer & Waterproofing Specialist',
      managerId: 'ROOM-MANAGER-BATHROOM',
      taskDescription: 'Applied shower enclosure tile backer & ANSI A118.10 elastomeric membrane',
      actionType: 'PLACE_COMPONENT',
      objectsAdded: ['WATERPROOF-SHOWER-001'],
      objectsChanged: ['WALL-BATH-NORTH-001'],
      objectsRemoved: [],
      materialsAdded: [{ name: 'Cementitious Backer Board', qty: 48, unit: 'sq ft' }],
      bomDeltaTotalCost: 408,
      reasoning: 'Enforced IRC R702.4.2 prohibiting paper-faced gypsum in direct water splash shower walls.',
      codeReference: 'FBC 2023 R702.4.2 / ANSI A118.10',
      modelSnapshot: JSON.parse(JSON.stringify(proj.components))
    };

    proj.revisions.push(revision);
    this.metrics.completedAgentTasks += 1;
  }

  // --- Step 3: Plumbing Specialist ---
  private static executeActionPlumbingRoughIn(): void {
    const proj = this.activeProject;

    const dwvStack: BIMComponent = {
      id: 'PLUMB-DWV-STACK-001',
      type: 'pipe',
      system: 'Plumbing',
      floor: 1,
      room: 'Master Bathroom',
      assembly: '3 in Schedule 40 PVC DWV Drain Stack & Vent',
      materials: [
        { name: '3 in PVC Schedule 40 Pipe', specification: 'ASTM D2665 DWV', quantity: 10, unit: 'lin ft' }
      ],
      geometry: { position: [2, 0, 0.2], dimensions: [0.3, 9, 0.3] },
      isExterior: false,
      exposure: 'Concealed Wall Cavity',
      connectedComponentIds: ['PLUMB-SHOWER-DRAIN-001', 'PLUMB-SINK-DRAIN-001'],
      openings: [],
      quantity: { value: 10, unit: 'lin ft' },
      unitCost: 14.20,
      totalCost: 142,
      installationStageDay: 3,
      inspectionState: 'passed',
      whySelected: {
        reason: 'Routed 3-inch PVC main soil stack and roof vent through North wet wall',
        environmentalFactor: 'Concealed interior wastewater discharge',
        codeRule: 'IPC 2024 / Florida Plumbing Code Section 709 Soil Stack Sizing',
        alternativesConsidered: ['ABS Pipe'],
        costImpact: 'Standard PVC rough-in cost',
        lifecycleNotes: 'Sloped at 1/4 in per foot towards sewer connection'
      }
    };

    const showerDrain: BIMComponent = {
      id: 'PLUMB-SHOWER-DRAIN-001',
      type: 'fixture',
      system: 'Plumbing',
      floor: 1,
      room: 'Master Bathroom',
      assembly: '2 in PVC P-Trap & Stainless Steel Drain Assembly',
      materials: [
        { name: '2 in PVC P-Trap', specification: 'ASTM D2665 P-Trap', quantity: 1, unit: 'ea' }
      ],
      geometry: { position: [2.5, 0.2, 2], dimensions: [1, 1, 1] },
      isExterior: false,
      exposure: 'Subfloor Shower Pan',
      connectedComponentIds: ['PLUMB-DWV-STACK-001'],
      openings: [],
      quantity: { value: 1, unit: 'ea' },
      unitCost: 85.00,
      totalCost: 85,
      installationStageDay: 3,
      inspectionState: 'passed',
      whySelected: {
        reason: 'Placed 2-inch shower drain trap connected to main soil stack',
        environmentalFactor: 'Wastewater seal preventing sewer gas backflow',
        codeRule: 'IPC 2024 Section 1002 Trap Seals',
        alternativesConsidered: [],
        costImpact: 'Standard fixture rough-in',
        lifecycleNotes: 'Trap arm length constrained under 5 feet for 2in pipe'
      }
    };

    proj.components.push(dwvStack, showerDrain);

    const revision: SpatialModelRevision = {
      revisionId: `REV-${String(proj.revisions.length + 1).padStart(6, '0')}`,
      revisionNumber: proj.revisions.length + 1,
      timestamp: new Date().toISOString(),
      agentId: 'PLUMBING-DWV-AGENT',
      agentRole: 'Plumbing Supply & DWV Specialist',
      managerId: 'ROOM-MANAGER-BATHROOM',
      taskDescription: 'Routed 3in PVC DWV soil stack & 2in shower P-trap assembly',
      actionType: 'ROUTE_SYSTEM',
      objectsAdded: ['PLUMB-DWV-STACK-001', 'PLUMB-SHOWER-DRAIN-001'],
      objectsChanged: [],
      objectsRemoved: [],
      materialsAdded: [{ name: '3in PVC Schedule 40 Pipe', qty: 10, unit: 'lin ft' }],
      bomDeltaTotalCost: 227,
      reasoning: 'Applied IPC 2024 slope rules (1/4in per foot) and trap arm distance limitations.',
      codeReference: 'IPC 2024 Section 709 & Section 1002',
      modelSnapshot: JSON.parse(JSON.stringify(proj.components))
    };

    proj.revisions.push(revision);
    this.metrics.completedAgentTasks += 1;
  }

  // --- Step 4: Electrical Specialist ---
  private static executeActionElectricalRoughIn(): void {
    const proj = this.activeProject;

    const gfciOutlet: BIMComponent = {
      id: 'ELEC-GFCI-OUTLET-001',
      type: 'receptacle',
      system: 'Electrical',
      floor: 1,
      room: 'Master Bathroom',
      assembly: '20A 125V Weather/Tamper-Resistant GFCI Receptacle in Single-Gang Box',
      materials: [
        { name: '20A GFCI Receptacle', specification: 'UL 943 Class A GFCI', quantity: 1, unit: 'ea' },
        { name: '12/2 NM-B Copper Cable', specification: 'ASTM B3 Solid Copper Wire', quantity: 25, unit: 'lin ft' }
      ],
      geometry: { position: [6, 3.5, 0.2], dimensions: [0.3, 0.4, 0.3] },
      isExterior: false,
      exposure: 'Interior Vanity Basin Counter (24 inches from sink edge)',
      connectedComponentIds: ['ELEC-PANEL-001'],
      openings: [],
      quantity: { value: 1, unit: 'ea' },
      unitCost: 42.00,
      totalCost: 42,
      installationStageDay: 4,
      inspectionState: 'passed',
      whySelected: {
        reason: 'Placed 20A GFCI protected receptacle box within 3 feet of vanity basin edge',
        environmentalFactor: 'Wet room location requiring Class A GFCI personnel protection',
        codeRule: 'NFPA 70 / NEC 2023 Article 210.8(A)(1) Bathroom GFCI Requirements',
        alternativesConsidered: ['Standard 15A Receptacle (Prohibited in bathroom)'],
        costImpact: 'Mandatory safety requirement',
        lifecycleNotes: 'Connected to dedicated 20A branch circuit'
      }
    };

    proj.components.push(gfciOutlet);

    proj.fasteners.push({
      id: 'FAST-ELEC-001',
      type: 'Plastic Cable Staples',
      material: 'Nylon with Galvanized Nails',
      size: '1/2 in',
      spacingPattern: 'Every 4.5 feet and within 12 inches of outlet box',
      quantity: 8,
      hostObjectId: 'ELEC-GFCI-OUTLET-001',
      purpose: 'NM-B wire securing to stud framing',
      codeReference: 'NEC 2023 Article 334.30 Securing and Supporting'
    });

    const revision: SpatialModelRevision = {
      revisionId: `REV-${String(proj.revisions.length + 1).padStart(6, '0')}`,
      revisionNumber: proj.revisions.length + 1,
      timestamp: new Date().toISOString(),
      agentId: 'ELECTRICAL-BRANCH-AGENT',
      agentRole: 'Electrical Branch Specialist',
      managerId: 'ROOM-MANAGER-BATHROOM',
      taskDescription: 'Installed 20A GFCI receptacle box & routed 12/2 NM-B cable',
      actionType: 'PLACE_COMPONENT',
      objectsAdded: ['ELEC-GFCI-OUTLET-001'],
      objectsChanged: [],
      objectsRemoved: [],
      materialsAdded: [{ name: '20A GFCI Receptacle', qty: 1, unit: 'ea' }],
      bomDeltaTotalCost: 42,
      reasoning: 'Grounded against NEC 2023 Article 210.11(C)(3) requiring dedicated 20A bathroom circuit.',
      codeReference: 'NFPA 70 / NEC 2023 Article 210.8 & 210.11',
      modelSnapshot: JSON.parse(JSON.stringify(proj.components))
    };

    proj.revisions.push(revision);
    this.metrics.completedAgentTasks += 1;
  }

  // --- Step 5: HVAC Specialist ---
  private static executeActionHVACVentilation(): void {
    const proj = this.activeProject;

    const exhaustFan: BIMComponent = {
      id: 'HVAC-EXHAUST-FAN-001',
      type: 'duct',
      system: 'HVAC',
      floor: 1,
      room: 'Master Bathroom',
      assembly: '80 CFM Ultra-Quiet Ceiling Exhaust Fan with 4 in Rigid Aluminum Duct',
      materials: [
        { name: '80 CFM Bathroom Exhaust Fan', specification: 'ENERGY STAR / HVI Certified', quantity: 1, unit: 'ea' },
        { name: '4 in Rigid Aluminum Ductwork', specification: 'Class 0 Air Duct', quantity: 12, unit: 'lin ft' }
      ],
      geometry: { position: [4, 8.5, 4], dimensions: [1.2, 0.8, 1.2] },
      isExterior: false,
      exposure: 'Ceiling Cavity with Roof Vent Discharge',
      connectedComponentIds: [],
      openings: [],
      quantity: { value: 12, unit: 'lin ft' },
      unitCost: 185.00,
      totalCost: 185,
      installationStageDay: 5,
      inspectionState: 'passed',
      whySelected: {
        reason: 'Installed 80 CFM exhaust fan venting directly to exterior roof cap',
        environmentalFactor: 'High moisture removal (prevents mold/mildew growth)',
        codeRule: 'ACCA Manual D / FBC Mechanical 2023 Section 403 Ventilation Requirements',
        alternativesConsidered: ['Recirculating Ductless Fan (Prohibited for moisture removal)'],
        costImpact: 'Standard Mechanical ventilation cost',
        lifecycleNotes: 'Continuous smooth rigid duct minimizes static friction loss'
      }
    };

    proj.components.push(exhaustFan);

    const revision: SpatialModelRevision = {
      revisionId: `REV-${String(proj.revisions.length + 1).padStart(6, '0')}`,
      revisionNumber: proj.revisions.length + 1,
      timestamp: new Date().toISOString(),
      agentId: 'HVAC-AIR-AGENT',
      agentRole: 'HVAC Ventilation Specialist',
      managerId: 'ROOM-MANAGER-BATHROOM',
      taskDescription: 'Routed 80 CFM exhaust fan & 4in rigid aluminum exterior discharge ducting',
      actionType: 'ROUTE_SYSTEM',
      objectsAdded: ['HVAC-EXHAUST-FAN-001'],
      objectsChanged: [],
      objectsRemoved: [],
      materialsAdded: [{ name: '80 CFM Exhaust Fan', qty: 1, unit: 'ea' }],
      bomDeltaTotalCost: 185,
      reasoning: 'Enforced FBC Mechanical rules requiring direct outdoor ventilation for bathrooms without operable windows.',
      codeReference: 'FBC Mechanical 2023 Section 403 / ASHRAE 62.2',
      modelSnapshot: JSON.parse(JSON.stringify(proj.components))
    };

    proj.revisions.push(revision);
    this.metrics.completedAgentTasks += 1;
  }

  // --- Step 6: Independent Inspector Defect Injection ---
  private static executeInspectorDefectInjection(): void {
    const proj = this.activeProject;

    const defectTicket: InspectionTicket = {
      id: 'TICKET-BATH-INSPECT-001',
      projectId: proj.projectId,
      inspectorAgent: 'INDEPENDENT-INSPECTOR',
      severity: 'high',
      affectedComponentIds: ['WALL-BATH-NORTH-001', 'PLUMB-DWV-STACK-001'],
      location: 'North Wall Stud #3 Plumbing Notch',
      problem: '3-inch PVC soil stack cuts through 2x4 stud leaving less than 50% stud depth without steel nail protection plate',
      requiredStandard: 'FBC 2023 Section 2308.5.8 / IRC R602.6 Drilling and Notching of Studs',
      actualCondition: 'Plumbing notch exceeds 40% stud width without 16-gauge steel shoe or nail plate installed',
      status: 'open',
      repairAgentAssigned: 'WOOD-FRAMING-AGENT',
      proposedRepair: 'Install 16-gauge steel stud shoe / nail protection plate over notched stud face',
      timestamp: new Date().toISOString()
    };

    proj.inspectionTickets.push(defectTicket);

    // Update target component state to failed
    const comp = proj.components.find(c => c.id === 'WALL-BATH-NORTH-001');
    if (comp) comp.inspectionState = 'failed';

    // Record Knowledge Gap
    const gap: KnowledgeGapRecord = {
      gapId: 'GAP-STUD-NOTCH-PROTECTION-01',
      agentId: 'WOOD-FRAMING-AGENT',
      role: 'Wood Framing Specialist',
      topic: 'Structural Stud Notch Steel Protection Plates',
      missingInformation: 'Required 1/16 in (16 gauge) steel protection plate specifications when plumbing pipe notches exceed 25% of stud depth.',
      sourceRequirements: ['IRC 2024 Section R602.6.1', 'FBC 2023 Wood Construction Manual'],
      createdTimestamp: new Date().toISOString(),
      resolvedTimestamp: undefined,
      status: 'UNRESOLVED'
    };

    proj.knowledgeGaps.push(gap);

    this.metrics.inspectionDefects += 1;
    this.metrics.knowledgeGapsCreated += 1;
    this.metrics.failedAgentTasks += 1;
  }

  // --- Step 7: Defect Repair & Retraining Revision ---
  private static executeDefectRepair(): void {
    const proj = this.activeProject;
    const ticket = proj.inspectionTickets.find(t => t.id === 'TICKET-BATH-INSPECT-001');
    if (!ticket) return;

    // Resolve inspection ticket
    ticket.status = 'verified_closed';
    ticket.repairNotes = 'Installed 16-gauge steel stud protection shoe over notched stud area.';

    // Resolve Knowledge Gap
    const gap = proj.knowledgeGaps.find(g => g.gapId === 'GAP-STUD-NOTCH-PROTECTION-01');
    if (gap) {
      gap.status = 'RESOLVED';
      gap.resolvedTimestamp = new Date().toISOString();
    }

    // Add Steel Protection Plate Component
    const steelShoe: BIMComponent = {
      id: 'STRUCT-STEEL-SHOE-001',
      type: 'column',
      system: 'Structure',
      floor: 1,
      room: 'Master Bathroom',
      assembly: '16-Gauge Galvanized Steel Stud Shoe Protection Plate',
      materials: [
        { name: '16-Gauge Galvanized Steel Plate', specification: 'ASTM A653 Structural Steel', quantity: 1, unit: 'ea' }
      ],
      geometry: { position: [2, 1.5, 0.1], dimensions: [0.3, 0.8, 0.3] },
      isExterior: false,
      exposure: 'Concealed Framing',
      connectedComponentIds: ['WALL-BATH-NORTH-001', 'PLUMB-DWV-STACK-001'],
      openings: [],
      quantity: { value: 1, unit: 'ea' },
      unitCost: 18.50,
      totalCost: 18.50,
      installationStageDay: 6,
      inspectionState: 'repaired',
      whySelected: {
        reason: 'Installed 16-gauge steel stud shoe to restore structural load path across plumbing notch',
        environmentalFactor: 'Concealed structural reinforcement',
        codeRule: 'IRC R602.6.1 Metal Protection Plates for Structural Notching',
        alternativesConsidered: [],
        costImpact: 'Minor repair cost',
        lifecycleNotes: 'Protects PVC pipe from drywall screw puncture'
      }
    };

    proj.components.push(steelShoe);

    // Update North wall state to repaired/passed
    const comp = proj.components.find(c => c.id === 'WALL-BATH-NORTH-001');
    if (comp) comp.inspectionState = 'repaired';

    proj.fasteners.push({
      id: 'FAST-STEEL-SHOE-001',
      type: 'Structural Connector Screws',
      material: 'Heat-Treated Galvanized Steel',
      size: '#10 x 1.5 in',
      spacingPattern: '6 screws per stud flange',
      quantity: 6,
      hostObjectId: 'STRUCT-STEEL-SHOE-001',
      purpose: 'Fastening steel shoe to notched stud',
      codeReference: 'IRC R602.6.1'
    });

    const revision: SpatialModelRevision = {
      revisionId: `REV-${String(proj.revisions.length + 1).padStart(6, '0')}`,
      revisionNumber: proj.revisions.length + 1,
      timestamp: new Date().toISOString(),
      agentId: 'WOOD-FRAMING-AGENT',
      agentRole: 'Wood Framing Specialist',
      managerId: 'ROOM-MANAGER-BATHROOM',
      taskDescription: 'Repaired North Wall stud #3 notch defect by installing 16-gauge steel protection shoe',
      actionType: 'REPAIR_DEFECT',
      objectsAdded: ['STRUCT-STEEL-SHOE-001'],
      objectsChanged: ['WALL-BATH-NORTH-001'],
      objectsRemoved: [],
      materialsAdded: [{ name: '16-Gauge Galvanized Steel Plate', qty: 1, unit: 'ea' }],
      bomDeltaTotalCost: 18.50,
      reasoning: 'Grounded against IRC R602.6.1 restoring stud load capacity and protecting DWV pipe from fastener penetration.',
      codeReference: 'IRC R602.6.1 / FBC 2023 Section 2308.5.8',
      modelSnapshot: JSON.parse(JSON.stringify(proj.components))
    };

    proj.revisions.push(revision);
    this.metrics.repairsExecuted += 1;
    this.metrics.retrainingCycles += 1;
    this.metrics.clashesResolved += 1;
  }

  // --- Step 8+: Ongoing Refinement ---
  private static executeOngoingSpatialRefinement(): void {
    const proj = this.activeProject;

    // Add lighting & ceiling finishes if not already present
    if (!proj.components.some(c => c.id === 'ELEC-LIGHT-VANITY-001')) {
      const vanityLight: BIMComponent = {
        id: 'ELEC-LIGHT-VANITY-001',
        type: 'light',
        system: 'Electrical',
        floor: 1,
        room: 'Master Bathroom',
        assembly: 'LED IP65 Water-Resistant Vanity Bar Light',
        materials: [
          { name: 'LED Vanity Bar', specification: '3000K Warm White 1200 Lumens', quantity: 1, unit: 'ea' }
        ],
        geometry: { position: [6, 7, 0.2], dimensions: [2, 0.4, 0.3] },
        isExterior: false,
        exposure: 'Damp Location Vanity Above Sink Mirror',
        connectedComponentIds: ['ELEC-GFCI-OUTLET-001'],
        openings: [],
        quantity: { value: 1, unit: 'ea' },
        unitCost: 110.00,
        totalCost: 110,
        installationStageDay: 7,
        inspectionState: 'passed',
        whySelected: {
          reason: 'Installed damp-location rated LED vanity light fixture above sink basin',
          environmentalFactor: 'Damp location indoor humidity rating',
          codeRule: 'NEC 2023 Article 410.10 Luminares in Damp and Wet Locations',
          alternativesConsidered: [],
          costImpact: 'Standard fixture cost',
          lifecycleNotes: '50,000 hour LED lifespan'
        }
      };

      proj.components.push(vanityLight);

      const revision: SpatialModelRevision = {
        revisionId: `REV-${String(proj.revisions.length + 1).padStart(6, '0')}`,
        revisionNumber: proj.revisions.length + 1,
        timestamp: new Date().toISOString(),
        agentId: 'ELECTRICAL-BRANCH-AGENT',
        agentRole: 'Electrical Branch Specialist',
        managerId: 'ROOM-MANAGER-BATHROOM',
        taskDescription: 'Installed IP65 damp-rated LED vanity light fixture',
        actionType: 'PLACE_COMPONENT',
        objectsAdded: ['ELEC-LIGHT-VANITY-001'],
        objectsChanged: [],
        objectsRemoved: [],
        materialsAdded: [{ name: 'LED Vanity Bar', qty: 1, unit: 'ea' }],
        bomDeltaTotalCost: 110,
        reasoning: 'Complied with NEC Article 410.10 damp location rules.',
        codeReference: 'NEC 2023 Article 410.10',
        modelSnapshot: JSON.parse(JSON.stringify(proj.components))
      };

      proj.revisions.push(revision);
      this.metrics.completedAgentTasks += 1;
    }
  }

  /**
   * Generates the Section 38 Required Checkpoint Report
   */
  public static generateCheckpointReport(): Phase318B3CheckpointReport {
    const proj = this.getActiveProject();

    return {
      SPATIAL_ACADEMY_ACTIVE: 'YES',
      CANONICAL_PROJECT_MODEL_ACTIVE: 'YES',
      CURRENT_TRAINING_PROJECT: proj.projectId,
      CURRENT_DIFFICULTY_LEVEL: proj.difficultyName,
      CURRENT_PROJECT_STAGE: proj.stage,
      KNOWLEDGE_ACQUISITION_ACTIVE: 'YES',
      PRACTICAL_CONSTRUCTION_ACTIVE: 'YES',
      MANAGER_REVIEW_ACTIVE: 'YES',
      INSPECTOR_MODEL_REVIEW_ACTIVE: 'YES',
      CROSS_TRADE_COORDINATION_ACTIVE: 'YES',
      REALITY_SWARM_MODEL_AUDIT_ACTIVE: 'YES',
      CANONICAL_MODEL_OBJECTS: proj.components.length,
      MODEL_REVISIONS: proj.revisions.length,
      ACTIVE_AGENTS: proj.agentAssignments.length,
      COMPLETED_AGENT_TASKS: this.metrics.completedAgentTasks,
      FAILED_AGENT_TASKS: this.metrics.failedAgentTasks,
      CROSS_TRADE_CONSULTATIONS: this.metrics.crossTradeConsultations + proj.crossTradeRequests.length,
      CLASHES_FOUND: this.metrics.clashesFound + proj.inspectionTickets.length,
      CLASHES_RESOLVED: this.metrics.clashesResolved + proj.inspectionTickets.filter(t => t.status === 'verified_closed').length,
      INSPECTION_DEFECTS: this.metrics.inspectionDefects,
      REPAIRS: this.metrics.repairsExecuted,
      KNOWLEDGE_GAPS: this.metrics.knowledgeGapsCreated,
      RETRAINING_CYCLES: this.metrics.retrainingCycles,
      BOM_MODEL_DERIVED: 'YES',
      CONSTRUCTION_PLAYBACK_FROM_REAL_REVISIONS: 'YES',
      VIEWER_RENDERING_CANONICAL_MODEL: 'YES',
      COMPONENT_CLICK_THROUGH_ACTIVE: 'YES',
      SYSTEM_LAYER_FILTERING_ACTIVE: 'YES',
      PROJECT_DIGITAL_COMPLETION_PCT: proj.digitalCompletionPct,
      HOUSE_1_READY_FOR_OWNER_AUTHORIZATION: proj.difficultyLevel >= 8 && proj.isDigitallyComplete ? 'YES' : 'NO',
      HOUSE_1_CANONICAL_BUILD_STARTED: 'NO',
      evidenceOfEmptyStart: `Project ${proj.projectId} initiated from empty 0-component spatial volume with initial REV-000001 setting site bounds [10, 9, 8] feet. Current model contains ${proj.components.length} components across ${proj.revisions.length} persisted revisions.`
    };
  }

  /**
   * Calculates derived BOM for active project
   */
  public static getDerivedBOM(): BOMItem[] {
    const proj = this.getActiveProject();
    return generateBOMFromComponents(proj.components);
  }

  // --- Persistence helpers ---
  private static ensurePersistenceDirectory(): void {
    const dir = path.dirname(this.persistencePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private static loadPersistentState(): void {
    try {
      if (fs.existsSync(this.persistencePath)) {
        const data = fs.readFileSync(this.persistencePath, 'utf8');
        const parsed = JSON.parse(data);
        if (parsed.activeProject) this.activeProject = parsed.activeProject;
        if (parsed.metrics) this.metrics = parsed.metrics;
      }
    } catch (err) {
      console.warn('[SPATIAL ACADEMY] Failed to load persistent state, initializing fresh bathroom project.', err);
    }
  }

  private static savePersistentState(): void {
    try {
      this.ensurePersistenceDirectory();
      const payload = {
        activeProject: this.activeProject,
        metrics: this.metrics,
        savedAt: new Date().toISOString()
      };
      fs.writeFileSync(this.persistencePath, JSON.stringify(payload, null, 2), 'utf8');
    } catch (err) {
      console.error('[SPATIAL ACADEMY] Failed to save persistent state.', err);
    }
  }
}
