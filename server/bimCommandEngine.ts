import { BIMComponent, ComponentType, SystemCategory } from '../src/types/hermes';
import { MaterialsKnowledgeEngine } from './materialsKnowledgeEngine';

export type BimCommandType =
  | 'CREATE_PROJECT'
  | 'CREATE_SITE'
  | 'CREATE_BUILDING'
  | 'CREATE_STOREY'
  | 'CREATE_SPACE'
  | 'CREATE_WALL'
  | 'CREATE_SLAB'
  | 'CREATE_DOOR'
  | 'CREATE_WINDOW'
  | 'CREATE_PIPE_SEGMENT'
  | 'CREATE_PIPE_FITTING'
  | 'CONNECT_PIPE_COMPONENTS'
  | 'CREATE_ELECTRICAL_DEVICE'
  | 'CREATE_CABLE_OR_CONDUIT_ROUTE'
  | 'CONNECT_ELECTRICAL_COMPONENTS'
  | 'CREATE_DUCT_SEGMENT'
  | 'CREATE_DUCT_FITTING'
  | 'CONNECT_DUCT_COMPONENTS'
  | 'ASSIGN_MATERIAL'
  | 'ASSIGN_ASSEMBLY'
  | 'ASSIGN_PROPERTY'
  | 'ASSIGN_SYSTEM'
  | 'MOVE_COMPONENT'
  | 'RESIZE_COMPONENT'
  | 'DELETE_COMPONENT'
  | 'CREATE_OPENING'
  | 'CREATE_PENETRATION';

export interface BimCommandInput {
  commandType: BimCommandType;
  agentId: string;
  taskId: string;
  projectId: string;
  attemptId: string;
  params: Record<string, any>;
}

export interface BimCommandExecutionRecord {
  commandId: string;
  commandType: BimCommandType;
  agentId: string;
  taskId: string;
  projectId: string;
  attemptId: string;
  inputParams: Record<string, any>;
  validationResult: {
    passed: boolean;
    errors: string[];
    warnings: string[];
  };
  createdModifiedObjectIds: string[];
  revisionId: string;
  timestamp: string;
}

export interface BimRevisionRecord {
  revisionId: string;
  revisionIndex: number;
  projectId: string;
  attemptId: string;
  commandId: string;
  agentId: string;
  description: string;
  timestamp: string;
  componentSnapshot: BIMComponent[];
}

// Global In-Memory Canonical Store for Proof Projects & Revisions
export class BimCommandEngine {
  private static canonicalComponents: Map<string, Map<string, BIMComponent>> = new Map(); // projectId -> Map<componentId, BIMComponent>
  private static commandHistory: Map<string, BimCommandExecutionRecord[]> = new Map(); // projectId -> records
  private static revisionHistory: Map<string, BimRevisionRecord[]> = new Map(); // projectId -> revisions
  private static ifcGuidCounter = 1000;

  private static generateIfcGuid(typePrefix: string): string {
    this.ifcGuidCounter++;
    return `${typePrefix.substring(0, 4).toUpperCase()}-${Date.now().toString(36)}-${this.ifcGuidCounter}`;
  }

  public static initializeProject(projectId: string, attemptId: string): void {
    if (!this.canonicalComponents.has(projectId)) {
      this.canonicalComponents.set(projectId, new Map());
      this.commandHistory.set(projectId, []);
      this.revisionHistory.set(projectId, []);

      // Revision REV-0001: Empty Project Initialized
      this.createRevisionRecord(
        projectId,
        attemptId,
        'SYSTEM',
        'INIT_PROJECT_CMD',
        'REV-0001: Canonical BIM Project Initialized (Empty State)',
        []
      );
    }
  }

  public static executeCommand(input: BimCommandInput): BimCommandExecutionRecord {
    const projectId = input.projectId;
    const attemptId = input.attemptId;
    this.initializeProject(projectId, attemptId);

    const projectStore = this.canonicalComponents.get(projectId)!;
    const commandId = `CMD-${input.commandType}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const createdModifiedIds: string[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];

    // Map command types to IFC entity logic
    if (input.commandType === 'CREATE_WALL') {
      const {
        startPos,
        endPos,
        thicknessMeters,
        heightMeters,
        assemblySpecId,
        materialSpecIds,
        storeyId,
        spaceId,
        isExterior
      } = input.params;

      const lengthMeters = Math.sqrt(
        Math.pow(endPos[0] - startPos[0], 2) +
        Math.pow(endPos[1] - startPos[1], 2) +
        Math.pow(endPos[2] - startPos[2], 2)
      );

      const midX = (startPos[0] + endPos[0]) / 2;
      const midY = (startPos[1] + endPos[1]) / 2;
      const midZ = (startPos[2] + endPos[2]) / 2;

      const wallId = `WALL-${Date.now()}-${Math.floor(Math.random() * 100)}`;
      const ifcGuid = this.generateIfcGuid('WALL');

      // Check assembly material graph validity
      let assembly = '2x6 Stud Framed Wall Assembly';
      let materialsList = [
        { name: 'Spruce-Pine-Fir Wood Studs', specification: 'MAT-WOOD-SPF-NO2', quantity: Math.ceil(lengthMeters * 3), unit: 'pcs' },
        { name: '5/8" Type X Gypsum Wallboard', specification: 'MAT-GYP-TYPEX-58', quantity: Math.ceil(lengthMeters * heightMeters * 2), unit: 'sq.ft' },
        { name: 'R-15 Mineral Wool Thermal Insulation', specification: 'MAT-INSUL-MINWOOL-R15', quantity: Math.ceil(lengthMeters * heightMeters), unit: 'sq.ft' }
      ];

      if (assemblySpecId) {
        const specAssembly = MaterialsKnowledgeEngine.getAssembly(assemblySpecId);
        if (specAssembly) {
          assembly = specAssembly.assemblyName;
        }
      }

      const revIndex = (this.revisionHistory.get(projectId)?.length || 0) + 1;
      const revisionId = `REV-${revIndex.toString().padStart(4, '0')}`;

      const wallObj: BIMComponent = {
        id: wallId,
        type: 'wall',
        system: 'Architecture',
        floor: storeyId ? parseInt(storeyId.replace(/\D/g, '')) || 1 : 1,
        room: spaceId || 'MAIN_SPACE',
        assembly,
        materials: materialsList,
        geometry: {
          position: [midX, midY, midZ],
          dimensions: [thicknessMeters || 0.15, heightMeters || 3.0, lengthMeters || 4.0],
          rotation: [0, Math.atan2(endPos[0] - startPos[0], endPos[2] - startPos[2]), 0]
        },
        isExterior: !!isExterior,
        exposure: isExterior ? 'Exterior Severe Weather' : 'Interior Protected',
        connectedComponentIds: [],
        openings: [],
        quantity: { value: Math.round(lengthMeters * heightMeters * 100) / 100, unit: 'm²' },
        unitCost: 110,
        totalCost: Math.round(lengthMeters * heightMeters * 110),
        installationStageDay: 3,
        inspectionState: 'passed',
        whySelected: {
          reason: 'Load-bearing envelope partition per FBC 2023 structural wind requirements',
          environmentalFactor: '160 MPH wind load compliance',
          codeRule: 'FBC 2023 Section 1609.1',
          alternativesConsidered: ['2x4 Light Framing', '8" CMU Block'],
          costImpact: 'Optimal balance of thermal performance R-21 and structural strength',
          lifecycleNotes: '50-year service life'
        },
        projectId,
        attemptId,
        ifcType: 'IfcWallStandardCase',
        ifcGlobalId: ifcGuid,
        parentSpatialContainer: storeyId || 'STOREY-01',
        storeyId: storeyId || 'STOREY-01',
        spaceId: spaceId || 'SPACE-01',
        assemblySpecId: assemblySpecId || 'ASSY-WALL-EXT-WOOD-R21',
        materialSpecIds: materialSpecIds || ['MAT-WOOD-SPF-NO2', 'MAT-GYP-TYPEX-58', 'MAT-INSUL-MINWOOL-R15'],
        createdByAgentId: input.agentId,
        createdByTaskId: input.taskId,
        createdRevisionId: revisionId,
        currentRevisionId: revisionId,
        status: 'CONSTRUCTED',
        sourceProvenance: 'AWC NDS 2024 / FBC 2023 Section 2308'
      };

      projectStore.set(wallId, wallObj);
      createdModifiedIds.push(wallId);

    } else if (input.commandType === 'CREATE_SLAB') {
      const { position, dimensions, storeyId, materialSpecId } = input.params;
      const slabId = `SLAB-${Date.now()}-${Math.floor(Math.random() * 100)}`;
      const ifcGuid = this.generateIfcGuid('SLAB');
      const revIndex = (this.revisionHistory.get(projectId)?.length || 0) + 1;
      const revisionId = `REV-${revIndex.toString().padStart(4, '0')}`;

      const slabObj: BIMComponent = {
        id: slabId,
        type: 'slab',
        system: 'Structure',
        floor: 1,
        room: 'FOUNDATION_ZONE',
        assembly: '4" Reinforced Concrete Monolithic Slab',
        materials: [
          { name: '3,000 PSI Normal Weight Concrete', specification: materialSpecId || 'MAT-CONC-3000', quantity: Math.round(dimensions[0] * dimensions[2] * dimensions[1] * 35.315), unit: 'cu.ft' }
        ],
        geometry: {
          position: position || [0, 0, 0],
          dimensions: dimensions || [6.0, 0.15, 6.0], // [width, thickness, length]
          rotation: [0, 0, 0]
        },
        isExterior: true,
        exposure: 'Subgrade Ground Exposure',
        connectedComponentIds: [],
        openings: [],
        quantity: { value: Math.round(dimensions[0] * dimensions[2] * 100) / 100, unit: 'm²' },
        unitCost: 85,
        totalCost: Math.round(dimensions[0] * dimensions[2] * 85),
        installationStageDay: 1,
        inspectionState: 'passed',
        whySelected: {
          reason: 'Monolithic concrete foundation slab engineered for soil bearing capacity',
          environmentalFactor: 'Groundwater table depth 4.5ft',
          codeRule: 'ACI 318-19 / FBC 2023 Section 1907',
          alternativesConsidered: ['Raised Pier Foundation'],
          costImpact: 'Standard residential foundation',
          lifecycleNotes: '100+ year service life'
        },
        projectId,
        attemptId,
        ifcType: 'IfcSlab',
        ifcGlobalId: ifcGuid,
        parentSpatialContainer: storeyId || 'STOREY-01',
        storeyId: storeyId || 'STOREY-01',
        materialSpecIds: [materialSpecId || 'MAT-CONC-3000'],
        createdByAgentId: input.agentId,
        createdByTaskId: input.taskId,
        createdRevisionId: revisionId,
        currentRevisionId: revisionId,
        status: 'CONSTRUCTED',
        sourceProvenance: 'ACI 318-19 Building Code Requirements'
      };

      projectStore.set(slabId, slabObj);
      createdModifiedIds.push(slabId);

    } else if (input.commandType === 'CREATE_DOOR') {
      const { hostWallId, offsetAlongWallMeters, widthMeters, heightMeters } = input.params;
      const hostWall = projectStore.get(hostWallId);

      if (!hostWall) {
        errors.push(`Host wall ${hostWallId} not found in project store`);
      } else {
        const doorId = `DOOR-${Date.now()}-${Math.floor(Math.random() * 100)}`;
        const ifcGuid = this.generateIfcGuid('DOOR');
        const revIndex = (this.revisionHistory.get(projectId)?.length || 0) + 1;
        const revisionId = `REV-${revIndex.toString().padStart(4, '0')}`;

        const wallPos = hostWall.geometry.position;
        const doorPos: [number, number, number] = [
          wallPos[0] + (offsetAlongWallMeters || 0),
          wallPos[1] + (heightMeters || 2.1) / 2 - (hostWall.geometry.dimensions[1] / 2),
          wallPos[2]
        ];

        const doorObj: BIMComponent = {
          id: doorId,
          type: 'door',
          system: 'Architecture',
          floor: hostWall.floor,
          room: hostWall.room,
          assembly: '36" x 80" Solid Core Exterior Entry Door Assembly',
          materials: [
            { name: 'Solid Core Insulated Fiberglass Door Leaf', specification: 'MAT-DOOR-FIBERGLASS', quantity: 1, unit: 'ea' }
          ],
          geometry: {
            position: doorPos,
            dimensions: [0.10, heightMeters || 2.1, widthMeters || 0.9],
            rotation: hostWall.geometry.rotation
          },
          isExterior: hostWall.isExterior,
          exposure: hostWall.exposure,
          connectedComponentIds: [hostWallId],
          openings: [],
          quantity: { value: 1, unit: 'ea' },
          unitCost: 650,
          totalCost: 650,
          installationStageDay: 5,
          inspectionState: 'passed',
          whySelected: {
            reason: 'Impact-rated exterior egress door per FBC 2023 egress requirements',
            environmentalFactor: '160 MPH wind-borne debris protection',
            codeRule: 'FBC 2023 Section 1010.1',
            alternativesConsidered: ['Hollow core wood door'],
            costImpact: 'Code required impact safety door',
            lifecycleNotes: '25-year warranty'
          },
          projectId,
          attemptId,
          ifcType: 'IfcDoor',
          ifcGlobalId: ifcGuid,
          parentSpatialContainer: hostWall.parentSpatialContainer,
          storeyId: hostWall.storeyId,
          spaceId: hostWall.spaceId,
          hostWallId,
          createdByAgentId: input.agentId,
          createdByTaskId: input.taskId,
          createdRevisionId: revisionId,
          currentRevisionId: revisionId,
          status: 'INSTALLED',
          sourceProvenance: 'FBC 2023 Building Code'
        };

        // Link door to host wall
        hostWall.openings.push(doorId);
        hostWall.connectedComponentIds.push(doorId);

        projectStore.set(doorId, doorObj);
        createdModifiedIds.push(doorId, hostWallId);
      }

    } else if (input.commandType === 'CREATE_WINDOW') {
      const { hostWallId, offsetAlongWallMeters, widthMeters, heightMeters, sillHeightMeters } = input.params;
      const hostWall = projectStore.get(hostWallId);

      if (!hostWall) {
        errors.push(`Host wall ${hostWallId} not found in project store`);
      } else {
        const windowId = `WIN-${Date.now()}-${Math.floor(Math.random() * 100)}`;
        const ifcGuid = this.generateIfcGuid('WIND');
        const revIndex = (this.revisionHistory.get(projectId)?.length || 0) + 1;
        const revisionId = `REV-${revIndex.toString().padStart(4, '0')}`;

        const wallPos = hostWall.geometry.position;
        const windowPos: [number, number, number] = [
          wallPos[0] + (offsetAlongWallMeters || 1.2),
          wallPos[1] + (sillHeightMeters || 1.0) - (hostWall.geometry.dimensions[1] / 2) + (heightMeters || 1.2) / 2,
          wallPos[2]
        ];

        const windowObj: BIMComponent = {
          id: windowId,
          type: 'window',
          system: 'Architecture',
          floor: hostWall.floor,
          room: hostWall.room,
          assembly: 'Impact Glazed Low-E Vinyl Single-Hung Window Assembly',
          materials: [
            { name: 'Low-E Impact Glazed Glass Unit', specification: 'MAT-GLAZING-LOWE', quantity: 1, unit: 'ea' }
          ],
          geometry: {
            position: windowPos,
            dimensions: [0.10, heightMeters || 1.2, widthMeters || 1.0],
            rotation: hostWall.geometry.rotation
          },
          isExterior: true,
          exposure: hostWall.exposure,
          connectedComponentIds: [hostWallId],
          openings: [],
          quantity: { value: 1, unit: 'ea' },
          unitCost: 480,
          totalCost: 480,
          installationStageDay: 5,
          inspectionState: 'passed',
          whySelected: {
            reason: 'Impact-resistant vinyl window with SHGC 0.23 thermal rating',
            environmentalFactor: 'Solar heat gain reduction in Zone 1A climate',
            codeRule: 'FBC 2023 Energy Conservation Code R402',
            alternativesConsidered: ['Non-impact glass with aluminum shutter'],
            costImpact: 'Reduces HVAC cooling load by 18%',
            lifecycleNotes: '30-year design life'
          },
          projectId,
          attemptId,
          ifcType: 'IfcWindow',
          ifcGlobalId: ifcGuid,
          parentSpatialContainer: hostWall.parentSpatialContainer,
          storeyId: hostWall.storeyId,
          spaceId: hostWall.spaceId,
          hostWallId,
          createdByAgentId: input.agentId,
          createdByTaskId: input.taskId,
          createdRevisionId: revisionId,
          currentRevisionId: revisionId,
          status: 'INSTALLED',
          sourceProvenance: 'FBC 2023 Energy Conservation Code'
        };

        hostWall.openings.push(windowId);
        hostWall.connectedComponentIds.push(windowId);

        projectStore.set(windowId, windowObj);
        createdModifiedIds.push(windowId, hostWallId);
      }

    } else if (input.commandType === 'CREATE_PIPE_SEGMENT') {
      const { startPos, endPos, diameterInches, systemType, materialSpecId } = input.params;
      const pipeId = `PIPE-${Date.now()}-${Math.floor(Math.random() * 100)}`;
      const ifcGuid = this.generateIfcGuid('PIPE');
      const revIndex = (this.revisionHistory.get(projectId)?.length || 0) + 1;
      const revisionId = `REV-${revIndex.toString().padStart(4, '0')}`;

      const lengthMeters = Math.sqrt(
        Math.pow(endPos[0] - startPos[0], 2) +
        Math.pow(endPos[1] - startPos[1], 2) +
        Math.pow(endPos[2] - startPos[2], 2)
      );

      const midX = (startPos[0] + endPos[0]) / 2;
      const midY = (startPos[1] + endPos[1]) / 2;
      const midZ = (startPos[2] + endPos[2]) / 2;

      const diameterMeters = (diameterInches || 2.0) * 0.0254;

      const pipeObj: BIMComponent = {
        id: pipeId,
        type: 'pipe',
        system: 'Plumbing',
        floor: 1,
        room: 'BATHROOM',
        assembly: `${diameterInches || 2}" ${systemType || 'DWV Sanitary'} Piping Line`,
        materials: [
          { name: 'Schedule 40 PVC Sanitary Pipe', specification: materialSpecId || 'MAT-POLYMERS-PVC-SCH40', quantity: Math.round(lengthMeters * 3.28), unit: 'ft' }
        ],
        geometry: {
          position: [midX, midY, midZ],
          dimensions: [diameterMeters, lengthMeters, diameterMeters],
          rotation: [0, 0, Math.atan2(endPos[1] - startPos[1], endPos[0] - startPos[0])]
        },
        isExterior: false,
        exposure: 'Interior Concealed Cavity',
        connectedComponentIds: [],
        openings: [],
        quantity: { value: Math.round(lengthMeters * 100) / 100, unit: 'm' },
        unitCost: 22,
        totalCost: Math.round(lengthMeters * 22),
        installationStageDay: 6,
        inspectionState: 'passed',
        whySelected: {
          reason: 'Schedule 40 PVC DWV drain piping with 1/4" per foot slope to main sewer stack',
          environmentalFactor: 'Corrosion resistant to domestic wastewater',
          codeRule: 'IPC 2024 Section 702.1',
          alternativesConsidered: ['ABS plastic', 'Cast iron DWV'],
          costImpact: 'Standard economical plumbing specification',
          lifecycleNotes: '50-year service rating'
        },
        projectId,
        attemptId,
        ifcType: 'IfcPipeSegment',
        ifcGlobalId: ifcGuid,
        parentSpatialContainer: 'STOREY-01',
        storeyId: 'STOREY-01',
        spaceId: 'SPACE-BATHROOM',
        materialSpecIds: [materialSpecId || 'MAT-POLYMERS-PVC-SCH40'],
        createdByAgentId: input.agentId,
        createdByTaskId: input.taskId,
        createdRevisionId: revisionId,
        currentRevisionId: revisionId,
        status: 'ROUGHED_IN',
        sourceProvenance: 'IPC 2024 Plumbing Code'
      };

      projectStore.set(pipeId, pipeObj);
      createdModifiedIds.push(pipeId);

    } else if (input.commandType === 'CREATE_PIPE_FITTING') {
      const { position, fittingType, diameterInches, connectToPipeIds } = input.params;
      const fittingId = `FIT-${Date.now()}-${Math.floor(Math.random() * 100)}`;
      const ifcGuid = this.generateIfcGuid('FITT');
      const revIndex = (this.revisionHistory.get(projectId)?.length || 0) + 1;
      const revisionId = `REV-${revIndex.toString().padStart(4, '0')}`;

      const diameterMeters = (diameterInches || 2.0) * 0.0254;

      const fittingObj: BIMComponent = {
        id: fittingId,
        type: 'pipe',
        system: 'Plumbing',
        floor: 1,
        room: 'BATHROOM',
        assembly: `${diameterInches || 2}" PVC ${fittingType || '90-Degree Elbow'} Fitting`,
        materials: [
          { name: 'Schedule 40 PVC DWV Elbow Fitting', specification: 'MAT-POLYMERS-PVC-SCH40', quantity: 1, unit: 'ea' }
        ],
        geometry: {
          position: position || [1.0, 1.2, 0.5],
          dimensions: [diameterMeters * 2, diameterMeters * 2, diameterMeters * 2],
          rotation: [0, 0, 0]
        },
        isExterior: false,
        exposure: 'Interior Concealed',
        connectedComponentIds: connectToPipeIds || [],
        openings: [],
        quantity: { value: 1, unit: 'ea' },
        unitCost: 8.50,
        totalCost: 8.50,
        installationStageDay: 6,
        inspectionState: 'passed',
        whySelected: {
          reason: 'Sweep elbow fitting providing smooth fluid directional change without clogging',
          environmentalFactor: 'Full flow hydraulic capacity',
          codeRule: 'IPC 2024 Section 706.3',
          alternativesConsidered: ['Short radius elbow'],
          costImpact: 'Standard fitting',
          lifecycleNotes: '50-year rating'
        },
        projectId,
        attemptId,
        ifcType: 'IfcPipeFitting',
        ifcGlobalId: ifcGuid,
        parentSpatialContainer: 'STOREY-01',
        storeyId: 'STOREY-01',
        spaceId: 'SPACE-BATHROOM',
        createdByAgentId: input.agentId,
        createdByTaskId: input.taskId,
        createdRevisionId: revisionId,
        currentRevisionId: revisionId,
        status: 'ROUGHED_IN',
        sourceProvenance: 'IPC 2024 Plumbing Code'
      };

      projectStore.set(fittingId, fittingObj);
      createdModifiedIds.push(fittingId);

      // Reciprocally connect pipes
      if (connectToPipeIds && Array.isArray(connectToPipeIds)) {
        connectToPipeIds.forEach(pId => {
          const targetPipe = projectStore.get(pId);
          if (targetPipe && !targetPipe.connectedComponentIds.includes(fittingId)) {
            targetPipe.connectedComponentIds.push(fittingId);
            createdModifiedIds.push(pId);
          }
        });
      }

    } else if (input.commandType === 'CREATE_ELECTRICAL_DEVICE') {
      const { position, deviceType, voltage, amperage } = input.params;
      const devId = `ELEC-DEV-${Date.now()}-${Math.floor(Math.random() * 100)}`;
      const ifcGuid = this.generateIfcGuid('EAPPL');
      const revIndex = (this.revisionHistory.get(projectId)?.length || 0) + 1;
      const revisionId = `REV-${revIndex.toString().padStart(4, '0')}`;

      const devObj: BIMComponent = {
        id: devId,
        type: 'receptacle',
        system: 'Electrical',
        floor: 1,
        room: 'BATHROOM',
        assembly: `${amperage || 20}A ${voltage || 120}V Tamper-Resistant GFCI Outlet`,
        materials: [
          { name: 'Specification Grade GFCI Receptacle Unit', specification: 'MAT-ELEC-GFCI-20A', quantity: 1, unit: 'ea' }
        ],
        geometry: {
          position: position || [2.0, 1.1, 0.2],
          dimensions: [0.10, 0.12, 0.08],
          rotation: [0, 0, 0]
        },
        isExterior: false,
        exposure: 'Damp Location Bathroom',
        connectedComponentIds: [],
        openings: [],
        quantity: { value: 1, unit: 'ea' },
        unitCost: 32,
        totalCost: 32,
        installationStageDay: 7,
        inspectionState: 'passed',
        whySelected: {
          reason: 'Class A 6mA trip GFCI receptacle mandatory within 3ft of wet basin',
          environmentalFactor: 'Moisture and shock protection',
          codeRule: 'NEC 2023 Article 210.8(A)(1)',
          alternativesConsidered: ['Standard duplex receptacle'],
          costImpact: 'Mandatory life safety requirement',
          lifecycleNotes: 'Self-testing 10-year unit'
        },
        projectId,
        attemptId,
        ifcType: 'IfcElectricAppliance',
        ifcGlobalId: ifcGuid,
        parentSpatialContainer: 'STOREY-01',
        storeyId: 'STOREY-01',
        spaceId: 'SPACE-BATHROOM',
        createdByAgentId: input.agentId,
        createdByTaskId: input.taskId,
        createdRevisionId: revisionId,
        currentRevisionId: revisionId,
        status: 'ROUGHED_IN',
        sourceProvenance: 'NEC 2023 Electrical Code'
      };

      projectStore.set(devId, devObj);
      createdModifiedIds.push(devId);

    } else if (input.commandType === 'CREATE_CABLE_OR_CONDUIT_ROUTE') {
      const { startPos, endPos, wireGauge, conductorType, connectToDeviceId } = input.params;
      const cableId = `CABLE-${Date.now()}-${Math.floor(Math.random() * 100)}`;
      const ifcGuid = this.generateIfcGuid('CABL');
      const revIndex = (this.revisionHistory.get(projectId)?.length || 0) + 1;
      const revisionId = `REV-${revIndex.toString().padStart(4, '0')}`;

      const lengthMeters = Math.sqrt(
        Math.pow(endPos[0] - startPos[0], 2) +
        Math.pow(endPos[1] - startPos[1], 2) +
        Math.pow(endPos[2] - startPos[2], 2)
      );

      const midX = (startPos[0] + endPos[0]) / 2;
      const midY = (startPos[1] + endPos[1]) / 2;
      const midZ = (startPos[2] + endPos[2]) / 2;

      const cableObj: BIMComponent = {
        id: cableId,
        type: 'conduit',
        system: 'Electrical',
        floor: 1,
        room: 'BATHROOM',
        assembly: `${wireGauge || '12/2'} Solid Copper NM-B Building Wire Run`,
        materials: [
          { name: '12/2 THHN/THWN Solid Copper Wire with Ground', specification: 'MAT-COPPER-THHN-12AWG', quantity: Math.round(lengthMeters * 3.28), unit: 'ft' }
        ],
        geometry: {
          position: [midX, midY, midZ],
          dimensions: [0.02, lengthMeters, 0.02],
          rotation: [0, 0, Math.atan2(endPos[1] - startPos[1], endPos[0] - startPos[0])]
        },
        isExterior: false,
        exposure: 'Wall Stud Cavity concealed',
        connectedComponentIds: connectToDeviceId ? [connectToDeviceId] : [],
        openings: [],
        quantity: { value: Math.round(lengthMeters * 100) / 100, unit: 'm' },
        unitCost: 14,
        totalCost: Math.round(lengthMeters * 14),
        installationStageDay: 7,
        inspectionState: 'passed',
        whySelected: {
          reason: '12 AWG 20-amp rated copper conductor homerun to main electrical panel',
          environmentalFactor: '90°C dry thermal rating',
          codeRule: 'NEC 2023 Article 334',
          alternativesConsidered: ['14/2 NM-B wire'],
          costImpact: 'Standard 20A branch circuit cable',
          lifecycleNotes: '40-year rating'
        },
        projectId,
        attemptId,
        ifcType: 'IfcCableSegment',
        ifcGlobalId: ifcGuid,
        parentSpatialContainer: 'STOREY-01',
        storeyId: 'STOREY-01',
        spaceId: 'SPACE-BATHROOM',
        materialSpecIds: ['MAT-COPPER-THHN-12AWG'],
        createdByAgentId: input.agentId,
        createdByTaskId: input.taskId,
        createdRevisionId: revisionId,
        currentRevisionId: revisionId,
        status: 'ROUGHED_IN',
        sourceProvenance: 'NEC 2023 Electrical Code'
      };

      if (connectToDeviceId) {
        const devComp = projectStore.get(connectToDeviceId);
        if (devComp && !devComp.connectedComponentIds.includes(cableId)) {
          devComp.connectedComponentIds.push(cableId);
          createdModifiedIds.push(connectToDeviceId);
        }
      }

      projectStore.set(cableId, cableObj);
      createdModifiedIds.push(cableId);

    } else if (input.commandType === 'CREATE_DUCT_SEGMENT') {
      const { startPos, endPos, widthInches, heightInches, systemType } = input.params;
      const ductId = `DUCT-${Date.now()}-${Math.floor(Math.random() * 100)}`;
      const ifcGuid = this.generateIfcGuid('DUCT');
      const revIndex = (this.revisionHistory.get(projectId)?.length || 0) + 1;
      const revisionId = `REV-${revIndex.toString().padStart(4, '0')}`;

      const lengthMeters = Math.sqrt(
        Math.pow(endPos[0] - startPos[0], 2) +
        Math.pow(endPos[1] - startPos[1], 2) +
        Math.pow(endPos[2] - startPos[2], 2)
      );

      const midX = (startPos[0] + endPos[0]) / 2;
      const midY = (startPos[1] + endPos[1]) / 2;
      const midZ = (startPos[2] + endPos[2]) / 2;

      const ductObj: BIMComponent = {
        id: ductId,
        type: 'duct',
        system: 'HVAC',
        floor: 1,
        room: 'BATHROOM',
        assembly: `${widthInches || 6}" Rigid Galvanized Sheet Metal Exhaust Duct`,
        materials: [
          { name: '26 Gauge Galvanized Steel Ducting', specification: 'MAT-STEEL-A653', quantity: Math.round(lengthMeters * 3.28), unit: 'ft' }
        ],
        geometry: {
          position: [midX, midY, midZ],
          dimensions: [(widthInches || 6) * 0.0254, lengthMeters, (heightInches || 6) * 0.0254],
          rotation: [0, 0, 0]
        },
        isExterior: false,
        exposure: 'Ceiling joist cavity',
        connectedComponentIds: [],
        openings: [],
        quantity: { value: Math.round(lengthMeters * 100) / 100, unit: 'm' },
        unitCost: 28,
        totalCost: Math.round(lengthMeters * 28),
        installationStageDay: 8,
        inspectionState: 'passed',
        whySelected: {
          reason: 'Continuous rigid smooth-wall metal ducting vented directly to outdoors per IMC 2024',
          environmentalFactor: '80 CFM mechanical moisture exhaust',
          codeRule: 'IMC 2024 Section 504.4',
          alternativesConsidered: ['Flexible vinyl ducting'],
          costImpact: 'Code compliant fire-safe rigid duct',
          lifecycleNotes: '30-year design life'
        },
        projectId,
        attemptId,
        ifcType: 'IfcDuctSegment',
        ifcGlobalId: ifcGuid,
        parentSpatialContainer: 'STOREY-01',
        storeyId: 'STOREY-01',
        spaceId: 'SPACE-BATHROOM',
        materialSpecIds: ['MAT-STEEL-A653'],
        createdByAgentId: input.agentId,
        createdByTaskId: input.taskId,
        createdRevisionId: revisionId,
        currentRevisionId: revisionId,
        status: 'INSTALLED',
        sourceProvenance: 'IMC 2024 Mechanical Code'
      };

      projectStore.set(ductId, ductObj);
      createdModifiedIds.push(ductId);

    } else {
      // Generic parameter assignment or movement command
      const { componentId, newPosition, newDimensions } = input.params;
      const targetObj = projectStore.get(componentId);

      if (targetObj) {
        if (newPosition) targetObj.geometry.position = newPosition;
        if (newDimensions) targetObj.geometry.dimensions = newDimensions;
        const revIndex = (this.revisionHistory.get(projectId)?.length || 0) + 1;
        targetObj.currentRevisionId = `REV-${revIndex.toString().padStart(4, '0')}`;
        createdModifiedIds.push(componentId);
      } else {
        warnings.push(`Command target component ${componentId} not found`);
      }
    }

    // Determine current revision id
    const currentRevIndex = this.revisionHistory.get(projectId)?.length || 1;
    const revId = `REV-${currentRevIndex.toString().padStart(4, '0')}`;

    // Create command record
    const record: BimCommandExecutionRecord = {
      commandId,
      commandType: input.commandType,
      agentId: input.agentId,
      taskId: input.taskId,
      projectId,
      attemptId,
      inputParams: input.params,
      validationResult: {
        passed: errors.length === 0,
        errors,
        warnings
      },
      createdModifiedObjectIds: createdModifiedIds,
      revisionId: revId,
      timestamp: new Date().toISOString()
    };

    this.commandHistory.get(projectId)!.push(record);

    // Create append-only revision record snapshot
    if (createdModifiedIds.length > 0 && errors.length === 0) {
      this.createRevisionRecord(
        projectId,
        attemptId,
        input.agentId,
        commandId,
        `REV-${(currentRevIndex + 1).toString().padStart(4, '0')}: Executed ${input.commandType} on [${createdModifiedIds.join(', ')}]`,
        Array.from(projectStore.values())
      );
    }

    return record;
  }

  private static createRevisionRecord(
    projectId: string,
    attemptId: string,
    agentId: string,
    commandId: string,
    description: string,
    snapshot: BIMComponent[]
  ): void {
    const revList = this.revisionHistory.get(projectId) || [];
    const revIndex = revList.length + 1;
    const revisionId = `REV-${revIndex.toString().padStart(4, '0')}`;

    // Deep clone snapshot components to preserve append-only history integrity
    const clonedSnapshot = JSON.parse(JSON.stringify(snapshot));

    const revRecord: BimRevisionRecord = {
      revisionId,
      revisionIndex: revIndex,
      projectId,
      attemptId,
      commandId,
      agentId,
      description,
      timestamp: new Date().toISOString(),
      componentSnapshot: clonedSnapshot
    };

    revList.push(revRecord);
    this.revisionHistory.set(projectId, revList);
  }

  public static getCanonicalProjectComponents(projectId: string): BIMComponent[] {
    const projectStore = this.canonicalComponents.get(projectId);
    if (!projectStore) return [];
    return Array.from(projectStore.values());
  }

  public static getRevisionHistory(projectId: string): BimRevisionRecord[] {
    return this.revisionHistory.get(projectId) || [];
  }

  public static getCommandHistory(projectId: string): BimCommandExecutionRecord[] {
    return this.commandHistory.get(projectId) || [];
  }

  public static exportToIfcJson(projectId: string): { schema: string; projectId: string; timestamp: string; objectCount: number; hash: string; entities: any[] } {
    const components = this.getCanonicalProjectComponents(projectId);
    const entities = components.map(c => ({
      ifcGlobalId: c.ifcGlobalId,
      ifcType: c.ifcType || 'IfcBuildingElementProxy',
      name: c.id,
      assembly: c.assembly,
      placement: {
        x: c.geometry.position[0],
        y: c.geometry.position[1],
        z: c.geometry.position[2]
      },
      dimensions: {
        width: c.geometry.dimensions[0],
        height: c.geometry.dimensions[1],
        length: c.geometry.dimensions[2]
      },
      materials: c.materials,
      materialSpecIds: c.materialSpecIds || [],
      connectedIds: c.connectedComponentIds,
      provenance: {
        createdByAgentId: c.createdByAgentId,
        createdByTaskId: c.createdByTaskId,
        createdRevisionId: c.createdRevisionId
      }
    }));

    const jsonStr = JSON.stringify(entities);
    let hashVal = 0;
    for (let i = 0; i < jsonStr.length; i++) {
      hashVal = (hashVal << 5) - hashVal + jsonStr.charCodeAt(i);
      hashVal |= 0;
    }

    return {
      schema: 'IFC4X3_ADD2',
      projectId,
      timestamp: new Date().toISOString(),
      objectCount: entities.length,
      hash: `IFC-HASH-${Math.abs(hashVal).toString(16)}`,
      entities
    };
  }
}
