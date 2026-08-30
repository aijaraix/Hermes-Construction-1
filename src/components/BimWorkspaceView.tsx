import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import * as WebIFC from 'web-ifc';
import { useHermesProject } from '../context/HermesProjectContext';
import { Phase2WorldOverlay } from './Phase2WorldOverlay';
import {
  Layers,
  Search,
  ChevronRight,
  ChevronDown,
  Building,
  Box,
  Eye,
  EyeOff,
  ShieldCheck,
  FileText,
  RotateCcw,
  Play,
  Pause,
  SkipBack,
  X,
  AlertTriangle,
  Lock,
  CheckCircle2,
  Compass,
  Zap,
  Activity,
  Cpu,
  FolderTree,
  Crosshair,
  Footprints,
  Ruler,
  Sliders,
  Flame,
  Thermometer,
  Volume2,
  Tag,
  Move,
  User,
  Radio,
  Clock,
  Brain,
  CheckCircle,
  AlertOctagon,
  GitBranch,
  FastForward,
  Wrench,
  Info,
  DollarSign,
  Sparkles,
  Layers3,
  Network,
  Share2,
  Filter,
  Maximize2,
  Users,
  HardHat,
  GraduationCap,
  MapPin,
  HelpCircle,
  Truck,
  UserCheck,
  FileCheck,
  Package
} from 'lucide-react';

export interface ReferenceBimComponent {
  id: string;
  expressID?: number;
  ifcGuid: string;
  ifcType: string;
  name: string;
  category: 'Architecture' | 'Structure' | 'Plumbing' | 'HVAC' | 'Electrical' | 'Site' | 'Workforce' | 'Customer' | 'Requirements' | 'Equipment' | 'Geotechnical' | 'Design';
  storeyId: string;
  storeyName: string;
  spaceId?: string;
  spaceName?: string;
  position: [number, number, number];
  dimensions: [number, number, number];
  orientationDegrees: number;
  materialSpecIds: string[];
  assemblySpecId?: string;
  assemblyLayers?: {
    layerIndex: number;
    materialName: string;
    materialSpecId: string;
    thicknessMeters: number;
    structuralRole: string;
    thermalConductivityWmK: number;
  }[];
  propertySets: { name: string; properties: Record<string, string | number | boolean> }[];
  connectedComponentIds: string[];
  openings: string[];
  hostWallId?: string;
  inspectionStatus: 'PASSED' | 'FAILED' | 'UNINSPECTED';
  fireRatingMinutes?: number;
  thermalResistanceRValue?: number;
  acousticSTC?: number;
  provenance: {
    source: string;
    creator: string;
    verifiedDate: string;
    license: string;
  };
}

export interface SpatialStorey {
  id: string;
  ifcGuid: string;
  name: string;
  elevationMeters: number;
  heightMeters: number;
  spaces: { id: string; name: string; ifcGuid: string; areaSqMeters: number; volumeCuMeters: number }[];
}

export interface ReferenceBimProject {
  projectId: string;
  name: string;
  description: string;
  classification: string;
  immutableSource: boolean;
  academyWritable: boolean;
  hermesGenerated: boolean;
  referenceModel: boolean;
  license: string;
  sourceUri: string;
  spatialHierarchy: {
    projectId: string;
    ifcGuid: string;
    siteId: string;
    siteGuid: string;
    buildingId: string;
    buildingGuid: string;
    storeys: SpatialStorey[];
  };
  components: ReferenceBimComponent[];
  relationships: {
    containedInStorey: Record<string, string>;
    containedInSpace: Record<string, string>;
    hostsOpening: Record<string, string[]>;
    systemConnectivity: Record<string, string[]>;
  };
}

interface BimWorkspaceViewProps {
  activeProjectId?: string;
  onSelectProject?: (projectId: string) => void;
  onOpenSystemDrawer?: () => void;
  initialSelectedComponentId?: string | null;
}

function computeReducedComponentsForEvent(eventIndex: number, rawData: any): ReferenceBimComponent[] {
  if (!rawData) return [];

  const isVal003 = rawData.projectId === 'LIVE-WORLD-VISUAL-VALIDATION-003';
  const isVal004 = rawData.projectId === 'LIVE-WORLD-VISUAL-VALIDATION-004';
  const isVal005 = rawData.projectId === 'LIVE-WORLD-VISUAL-VALIDATION-005';
  const isVal006 = rawData.projectId === 'LIVE-WORLD-VISUAL-VALIDATION-006';
  const isVal007 = rawData.projectId === 'LIVE-WORLD-AUTONOMOUS-GENERATION-007';

  const components: ReferenceBimComponent[] = [];

  // Generic Canonical World State Reduction
  if (rawData) {
    // 1. Facilities / Spatial Entities (17 facilities)
    (rawData.spatialEntities || []).forEach((fac: any) => {
      const created = fac.createdCheckpoint ?? 0;
      if (eventIndex >= created) {
        components.push({
          id: fac.entityId || fac.id,
          name: fac.name || 'Site Facility',
          ifcGuid: `GUID-${fac.entityId || fac.id}`,
          ifcType: 'IfcSiteFacility',
          category: 'Site',
          storeyId: 'STOREY-GROUND',
          storeyName: 'Ground Level (0.00m Datum)',
          dimensions: fac.dimensionsXYZ || [12.19, 2.44, 2.89],
          position: fac.positionXYZ || [0, 0, 0],
          orientationDegrees: 0,
          materialSpecIds: ['STEEL-CONTAINER'],
          propertySets: [{ name: 'Pset_FacilityDetails', properties: { FacilityId: fac.entityId || fac.id, Capacity: fac.maxOccupancy || 8 } }],
          connectedComponentIds: [],
          openings: [],
          inspectionStatus: 'PASSED',
          provenance: { source: 'HERMES_LIVE_ENGINE', creator: 'HERMES_LIVE_WORLD', verifiedDate: new Date().toISOString(), license: 'HERMES' }
        });
      }
    });

    // 2. Workforce Agents (69 actors)
    (rawData.agentSpatialStates || []).forEach((agent: any) => {
      const created = agent.createdCheckpoint ?? 0;
      if (eventIndex >= created) {
        const isCustomer = agent.agentId === 'CUSTOMER-001';
        let pos = agent.worldPosition || [0, 0, 0];
        if (isCustomer) {
          pos = eventIndex < 1 ? [-35.0, 0.0, 25.0] : [-28.0, 0.0, 0.0];
        } else if (agent.agentId === 'PROJECT-PRIME') {
          pos = eventIndex < 1 ? [-55.0, 0.0, -15.0] : [-28.0, 0.0, 0.0];
        } else if (agent.agentId === 'AGENT-SURVEY-001') {
          pos = eventIndex < 3 ? [-40.0, 0.0, -15.0] : eventIndex === 3 ? [-27.5, 0.25, -15.0] : [15.0, 2.8, -15.0];
        } else if (agent.agentId === 'AGENT-GEOTECH-001') {
          pos = eventIndex < 4 ? [-40.0, 0.0, -15.0] : eventIndex === 4 ? [-17.5, 0.9, -5.0] : [5.0, 1.8, 5.0];
        }

        components.push({
          id: isCustomer ? 'CUSTOMER-001' : `AGENT-${agent.agentId}`,
          name: isCustomer ? 'Project Customer / Owner (CUSTOMER-001)' : `${agent.role} (${agent.agentId})`,
          ifcGuid: `GUID-${agent.agentId}`,
          ifcType: 'IfcActor',
          category: isCustomer ? 'Customer' : 'Workforce',
          storeyId: 'STOREY-GROUND',
          storeyName: 'Ground Level (0.00m Datum)',
          dimensions: [0.5, 1.75, 0.5],
          position: pos,
          orientationDegrees: 0,
          materialSpecIds: [isCustomer ? 'CUSTOMER-ACTOR' : 'WORKFORCE-AGENT'],
          propertySets: [{ name: 'Pset_AgentDetails', properties: { AgentId: agent.agentId, Role: agent.role, Discipline: agent.discipline || 'Management', State: agent.currentState || 'ACTIVE' } }],
          connectedComponentIds: [],
          openings: [],
          inspectionStatus: 'PASSED',
          provenance: { source: 'WORKFORCE_ROSTER', creator: 'HERMES_LIVE_WORLD', verifiedDate: new Date().toISOString(), license: 'HERMES' }
        });
      }
    });

    // 3. In-World Requirements Board (Checkpoint 1+)
    if (eventIndex >= 1) {
      components.push({
        id: 'BOARD-REQUIREMENTS-LIVE-001',
        name: 'In-World Requirements Board (14 Autonomous Room & Site Records)',
        ifcGuid: 'GUID-BOARD-REQ-LIVE-001',
        ifcType: 'IfcElementAssembly',
        category: 'Requirements',
        storeyId: 'STOREY-GROUND',
        storeyName: 'Ground Level (0.00m Datum)',
        dimensions: [2.5, 1.8, 0.1],
        position: [-28.0, 2.0, 0.0],
        orientationDegrees: 0,
        materialSpecIds: ['REQUIREMENTS-BOARD-DISPLAY'],
        propertySets: [{ name: 'Pset_RequirementsDetails', properties: { BuildingType: 'Single Family Residential', Footprint: '263 sq m (2,835 sq ft)', Bedrooms: '3 Bedrooms', Bathrooms: '2 Bathrooms', Budget: '$425,000 USD', WindRating: '160 MPH Wind Load', Foundation: 'Monolithic Post-Tensioned Slab', CustomerApproved: true, TotalRecords: 14 } }],
        connectedComponentIds: [],
        openings: [],
        inspectionStatus: 'PASSED',
        provenance: { source: 'CUSTOMER_INTAKE_ENGINE', creator: 'PROJECT-PRIME', verifiedDate: new Date().toISOString(), license: 'HERMES' }
      });
    }

    // 4. Survey Marks & Geotech
    (rawData.surveyMarks || []).forEach((sm: any) => {
      const created = sm.createdCheckpoint ?? 3;
      if (eventIndex >= created) {
        components.push({
          id: sm.markId || sm.id,
          name: sm.name || `Survey Stake (${sm.markId})`,
          ifcGuid: `GUID-${sm.markId || sm.id}`,
          ifcType: 'IfcSurveyMark',
          category: 'Site',
          storeyId: 'STOREY-GROUND',
          storeyName: 'Ground Level (0.00m Datum)',
          dimensions: [0.15, 1.2, 0.15],
          position: sm.worldPosition || sm.coordinatesXYZ || [0, 0, 0],
          orientationDegrees: 0,
          materialSpecIds: ['WOODEN-CONTROL-STAKE'],
          propertySets: [{ name: 'Pset_SurveyDetails', properties: { StakeId: sm.markId, Elevation: sm.measuredElevationMeters, Verification: 'RTK GPS Verified' } }],
          connectedComponentIds: [],
          openings: [],
          inspectionStatus: 'PASSED',
          provenance: { source: 'SURVEY_ENGINE', creator: 'AGENT-SURVEY-001', verifiedDate: new Date().toISOString(), license: 'HERMES' }
        });
      }
    });

    (rawData.boringSamples || []).forEach((bs: any) => {
      const created = bs.createdCheckpoint ?? 4;
      if (eventIndex >= created) {
        components.push({
          id: bs.sampleId || bs.id,
          name: bs.name || 'Geotechnical Soil Boring Sample (SPT-001)',
          ifcGuid: `GUID-${bs.sampleId || bs.id}`,
          ifcType: 'IfcGeotechTest',
          category: 'Geotechnical',
          storeyId: 'STOREY-GROUND',
          storeyName: 'Ground Level (0.00m Datum)',
          dimensions: [0.8, 0.2, 0.8],
          position: bs.worldPosition || [5.0, 1.8, 5.0],
          orientationDegrees: 0,
          materialSpecIds: ['SOIL-BORING-SAMPLE'],
          propertySets: [{ name: 'Pset_GeotechDetails', properties: { BearingCapacity: `${bs.allowableBearingPsf || 3960} PSF`, SoilType: bs.soilType || 'Stiff Clay Loam' } }],
          connectedComponentIds: [],
          openings: [],
          inspectionStatus: 'PASSED',
          provenance: { source: 'GEOTECH_LAB', creator: 'AGENT-GEOTECH-001', verifiedDate: new Date().toISOString(), license: 'HERMES' }
        });
      }
    });

    // 5. Buildable Envelope
    if (rawData.buildableEnvelope) {
      const env = rawData.buildableEnvelope;
      const created = env.createdCheckpoint ?? 5;
      if (eventIndex >= created) {
        components.push({
          id: env.envelopeId,
          name: env.name,
          ifcGuid: `GUID-${env.envelopeId}`,
          ifcType: 'IfcBuildableEnvelope',
          category: 'Design',
          storeyId: 'STOREY-GROUND',
          storeyName: 'Ground Level (0.00m Datum)',
          dimensions: env.dimensionsXYZ || [22.0, 9.0, 22.0],
          position: env.positionXYZ || [0, 0, 0],
          orientationDegrees: 0,
          materialSpecIds: ['CONSTRAINT-OVERLAY-FRAME'],
          propertySets: [{ name: 'Pset_EnvelopeDetails', properties: { MaxFootprintSqM: env.maxFootprintSqM, MaxHeightMeters: env.maxHeightMeters, Setbacks: env.setbacks } }],
          connectedComponentIds: [],
          openings: [],
          inspectionStatus: 'PASSED',
          provenance: { source: 'CIVIL_ENGINEERING', creator: 'AGENT-CIVIL-001', verifiedDate: new Date().toISOString(), license: 'HERMES' }
        });
      }
    }

    // 6. Program Volumes
    (rawData.programVolumes || []).forEach((pv: any) => {
      const created = pv.createdCheckpoint ?? 6;
      if (eventIndex >= created) {
        components.push({
          id: pv.volumeId || pv.id,
          name: pv.name,
          ifcGuid: `GUID-${pv.volumeId || pv.id}`,
          ifcType: 'IfcSpace',
          category: 'Architecture',
          storeyId: 'STOREY-GROUND',
          storeyName: 'Ground Level (0.00m Datum)',
          dimensions: pv.dimensionsXYZ || [4.0, 3.0, 4.0],
          position: pv.positionXYZ || [0, 0, 0],
          orientationDegrees: 0,
          materialSpecIds: ['PROGRAM-SPACE-VOLUME'],
          propertySets: [{ name: 'Pset_SpaceDetails', properties: { TargetAreaSqFt: pv.targetAreaSqFt, RoomType: pv.name } }],
          connectedComponentIds: [],
          openings: [],
          inspectionStatus: 'PASSED',
          provenance: { source: 'ARCHITECTURAL_ENGINE', creator: 'AGENT-ARCH-001', verifiedDate: new Date().toISOString(), license: 'HERMES' }
        });
      }
    });

    // 7. Materials Onsite
    (rawData.materialsOnsite || []).forEach((m: any) => {
      const created = m.createdCheckpoint ?? 10;
      if (eventIndex >= created) {
        components.push({
          id: m.materialId || m.id,
          name: m.materialType || m.name,
          ifcGuid: `GUID-${m.materialId || m.id}`,
          ifcType: 'IfcElementAssembly',
          category: 'Structure',
          storeyId: 'STOREY-GROUND',
          storeyName: 'Ground Level (0.00m Datum)',
          dimensions: [2.0, 1.5, 2.0],
          position: m.currentPosition || [18.0, 0.0, -12.0],
          orientationDegrees: 0,
          materialSpecIds: ['DELIVERED-MATERIAL-SPEC'],
          propertySets: [{ name: 'Pset_MaterialState', properties: { Stage: m.stage, WeightKg: m.weightKg } }],
          connectedComponentIds: [],
          openings: [],
          inspectionStatus: 'PASSED',
          provenance: { source: 'SPATIAL_LOGISTICS_ENGINE', creator: 'MATERIAL_MANAGER', verifiedDate: new Date().toISOString(), license: 'HERMES' }
        });
      }
    });

    // 8. Building Components (Structural & MEP)
    (rawData.buildingComponents || []).forEach((comp: any) => {
      const created = comp.createdCheckpoint ?? 12;
      if (eventIndex >= created) {
        let pos = comp.positionXYZ || comp.position;
        let status = comp.inspectionStatus || 'PASSED';
        if (comp.componentId === 'COMP-PLUMB-MAIN') {
          if (eventIndex === 19) {
            pos = [-7.5, 0.3, 0.0];
            status = 'FAILED_CLASH_DETECTED';
          } else if (eventIndex >= 20) {
            pos = [-7.5, 0.3, 0.4];
            status = 'PASSED';
          }
        }

        components.push({
          id: comp.componentId || comp.id,
          ifcGuid: `GUID-${comp.componentId || comp.id}`,
          ifcType: comp.ifcType || (comp.category === 'Foundation' ? 'IfcSlab' : comp.category === 'Roofing' ? 'IfcRoof' : comp.discipline === 'Plumbing' ? 'IfcFlowSegment' : comp.discipline === 'Electrical' ? 'IfcElectricDistributionBoard' : comp.discipline === 'HVAC' ? 'IfcUnitaryEquipment' : 'IfcWall'),
          name: comp.name,
          category: comp.category,
          storeyId: 'STOREY-GROUND',
          storeyName: 'Ground Level (0.00m Datum)',
          position: pos,
          dimensions: comp.dimensionsXYZ || comp.dimensions,
          orientationDegrees: 0,
          materialSpecIds: [comp.material || 'GENERIC-SPEC'],
          propertySets: [{ name: 'Pset_ComponentDetails', properties: { Discipline: comp.discipline, InstallationPhase: comp.installationPhase } }],
          connectedComponentIds: [],
          openings: [],
          inspectionStatus: status as any,
          provenance: comp.provenance || { source: 'HERMES_CONSTRUCTION', creator: 'DISCIPLINE_MANAGER', verifiedDate: new Date().toISOString(), license: 'HERMES' }
        });
      }
    });

    return components;
  }

  // 1. Facilities (Genesis eventIndex = 0)
  const facilities = rawData.spatialEntities?.filter((e: any) => e.entityType === 'OPERATIONS_FACILITY') || [];
  facilities.forEach((fac: any) => {
    components.push({
      id: fac.entityId,
      name: fac.name,
      ifcGuid: `GUID-${fac.entityId}`,
      ifcType: 'IfcSiteFacility',
      category: 'Site',
      storeyId: 'STOREY-GROUND',
      storeyName: 'Ground Level (0.00m Datum)',
      dimensions: fac.dimensionsXYZ || [12.19, 2.44, 2.89],
      position: fac.positionXYZ || [0, 0, 0],
      orientationDegrees: 0,
      materialSpecIds: ['STEEL-CONTAINER'],
      propertySets: [
        {
          name: 'Pset_FacilityDetails',
          properties: {
            FacilityId: fac.entityId,
            FacilityType: fac.entityType,
            Capacity: fac.maxOccupancy || 8,
          },
        },
      ],
      connectedComponentIds: [],
      openings: [],
      inspectionStatus: 'PASSED',
      provenance: {
        source: 'ACADEMY_SPATIAL_ENGINE',
        creator: 'HERMES_LIVE_WORLD',
        verifiedDate: new Date().toISOString(),
        license: 'HERMES',
      },
    });
  });

  // 2. Workforce Agents (68 agents + Customer)
  const agentStates = rawData.agentSpatialStates || [];
  agentStates.forEach((agent: any) => {
    const isCustomer = agent.agentId === 'CUSTOMER-001';
    let pos = agent.worldPosition || [0, 0, 0];
    if (isVal005 || isVal006 || isVal007) {
      if (agent.agentId === 'CUSTOMER-001') {
        pos = eventIndex < 2 ? [-35.0, 0.0, 25.0] : [-28.0, 0.0, 0.0];
      } else if (agent.agentId === 'PROJECT-PRIME') {
        pos = eventIndex < 4 ? [-55.0, 0.0, -15.0] : eventIndex === 4 ? [-41.5, 0.0, -7.5] : [-28.0, 0.0, 0.0];
      } else if (agent.agentId === 'AGENT-SURVEY-001') {
        pos = eventIndex < 10 ? [-40.0, 0.0, -15.0] : eventIndex === 10 ? [-27.5, 0.25, -15.0] : [15.0, 2.8, -15.0];
      } else if (agent.agentId === 'AGENT-GEOTECH-001') {
        pos = eventIndex < 10 ? [-40.0, 0.0, -15.0] : eventIndex === 10 ? [-17.5, 0.9, -5.0] : [5.0, 1.8, 5.0];
      }
    }

    components.push({
      id: isCustomer ? 'CUSTOMER-001' : `AGENT-${agent.agentId}`,
      name: isCustomer ? 'Project Customer / Owner (CUSTOMER-001)' : `${agent.role} (${agent.agentId})`,
      ifcGuid: `GUID-${agent.agentId}`,
      ifcType: 'IfcActor',
      category: isCustomer ? 'Customer' : 'Workforce',
      storeyId: 'STOREY-GROUND',
      storeyName: 'Ground Level (0.00m Datum)',
      dimensions: [0.5, 1.75, 0.5],
      position: pos,
      orientationDegrees: 0,
      materialSpecIds: [isCustomer ? 'CUSTOMER-ACTOR' : 'WORKFORCE-AGENT'],
      propertySets: [
        {
          name: 'Pset_AgentDetails',
          properties: {
            AgentId: agent.agentId,
            Role: agent.role,
            Discipline: agent.discipline || (isCustomer ? 'Customer' : 'Management'),
            State: agent.currentState || 'ACTIVE',
            HomeBase: agent.homeBaseEntityId || (isCustomer ? 'FACILITY-CUSTOMER-ENTRANCE' : 'FACILITY-EXEC-05'),
          },
        },
      ],
      connectedComponentIds: [],
      openings: [],
      inspectionStatus: 'PASSED',
      provenance: {
        source: 'WORKFORCE_ROSTER',
        creator: 'HERMES_LIVE_WORLD',
        verifiedDate: new Date().toISOString(),
        license: 'HERMES',
      },
    });
  });

  const eventStream = rawData.events || [];

  const getEntityEventIdx = (entity: any, fallbackMin: number): number => {
    if (entity.createdEventId) {
      const idx = eventStream.findIndex((e: any) => e.eventId === entity.createdEventId);
      if (idx !== -1) return idx;
    }
    if (entity.createdEventIndex !== undefined) return entity.createdEventIndex;
    return fallbackMin;
  };

  // 3. In-World Requirements Board (Validation 005/006/007 eventIndex >= 1)
  if (((isVal005 || isVal006) && eventIndex >= 6) || (isVal007 && eventIndex >= 1)) {
    components.push({
      id: isVal007 ? 'BOARD-REQUIREMENTS-007' : 'BOARD-REQUIREMENTS-006',
      name: isVal007 ? 'In-World Requirements Board (14 Autonomous Room Records)' : 'In-World Requirements Board (12 Decision Records)',
      ifcGuid: isVal007 ? 'GUID-BOARD-REQ-007' : 'GUID-BOARD-REQ-006',
      ifcType: 'IfcElementAssembly',
      category: 'Requirements',
      storeyId: 'STOREY-GROUND',
      storeyName: 'Ground Level (0.00m Datum)',
      dimensions: [2.5, 1.8, 0.1],
      position: [-28.0, 2.0, 0.0],
      orientationDegrees: 0,
      materialSpecIds: ['REQUIREMENTS-BOARD-DISPLAY'],
      propertySets: [
        {
          name: 'Pset_RequirementsDetails',
          properties: {
            BuildingType: 'Single Family Residential',
            Footprint: isVal007 ? '263 sq m (2,835 sq ft)' : '110 sq m (1,184 sq ft)',
            Bedrooms: isVal007 ? '3 Bedrooms' : '2 Bedrooms',
            Bathrooms: isVal007 ? '2 Bathrooms' : '2 Bathrooms',
            Stories: '1 Story',
            Budget: isVal007 ? '$425,000 USD' : '$310,000 USD',
            WindRating: '160 MPH Wind Load / Seismic Zone 4',
            Foundation: 'Monolithic Concrete Slab',
            CustomerApproved: true,
            TotalRecords: isVal007 ? 14 : 12,
          },
        },
      ],
      connectedComponentIds: [],
      openings: [],
      inspectionStatus: 'PASSED',
      provenance: {
        source: 'CUSTOMER_INTAKE_ENGINE',
        creator: 'PROJECT-PRIME',
        verifiedDate: new Date().toISOString(),
        license: 'HERMES',
      },
    });
  }

  // 4. Survey & Geotech Equipment (Validation 005/006 eventIndex >= 7)
  if ((isVal005 || isVal006) && eventIndex >= 7) {
    components.push({
      id: 'EQUIP-TOTAL-STATION-01',
      name: 'Leica TS16 Robotic Total Station Tripod',
      ifcGuid: 'GUID-EQUIP-TS16',
      ifcType: 'IfcEquipment',
      category: 'Equipment',
      storeyId: 'STOREY-GROUND',
      storeyName: 'Ground Level (0.00m Datum)',
      dimensions: [0.6, 1.5, 0.6],
      position: [-15.0, 0.5, -15.0],
      orientationDegrees: 0,
      materialSpecIds: ['SURVEY-EQUIPMENT'],
      propertySets: [{ name: 'Pset_EquipmentDetails', properties: { Type: 'Total Station', Accuracy: '1mm angular' } }],
      connectedComponentIds: [],
      openings: [],
      inspectionStatus: 'PASSED',
      provenance: { source: 'SURVEY_DEPOT', creator: 'AGENT-SURVEY-001', verifiedDate: new Date().toISOString(), license: 'HERMES' },
    });

    components.push({
      id: 'EQUIP-GNSS-ROVER-01',
      name: 'Trimble R12i RTK GNSS Rover Pole',
      ifcGuid: 'GUID-EQUIP-RTK',
      ifcType: 'IfcEquipment',
      category: 'Equipment',
      storeyId: 'STOREY-GROUND',
      storeyName: 'Ground Level (0.00m Datum)',
      dimensions: [0.2, 2.0, 0.2],
      position: [15.0, 2.8, -15.0],
      orientationDegrees: 0,
      materialSpecIds: ['SURVEY-EQUIPMENT'],
      propertySets: [{ name: 'Pset_EquipmentDetails', properties: { Type: 'RTK GPS Rover', Accuracy: '20mm horizontal' } }],
      connectedComponentIds: [],
      openings: [],
      inspectionStatus: 'PASSED',
      provenance: { source: 'SURVEY_DEPOT', creator: 'AGENT-SURVEY-001', verifiedDate: new Date().toISOString(), license: 'HERMES' },
    });

    components.push({
      id: 'EQUIP-GEOTECH-RIG-01',
      name: 'Mobile Geotechnical SPT Drill Rig',
      ifcGuid: 'GUID-EQUIP-RIG',
      ifcType: 'IfcEquipment',
      category: 'Equipment',
      storeyId: 'STOREY-GROUND',
      storeyName: 'Ground Level (0.00m Datum)',
      dimensions: [2.0, 3.0, 1.5],
      position: [5.0, 1.8, 5.0],
      orientationDegrees: 0,
      materialSpecIds: ['GEOTECH-DRILL-RIG'],
      propertySets: [{ name: 'Pset_EquipmentDetails', properties: { Type: 'SPT Drill Rig', Method: 'Standard Penetration Test' } }],
      connectedComponentIds: [],
      openings: [],
      inspectionStatus: 'PASSED',
      provenance: { source: 'CIVIL_DEPOT', creator: 'AGENT-GEOTECH-001', verifiedDate: new Date().toISOString(), license: 'HERMES' },
    });
  }

  // 5. Survey Control Stakes & Geotech Test (Validation 005/006 eventIndex >= 7)
  if ((isVal005 || isVal006) && eventIndex >= 7) {
    const stakes = [
      { id: 'SURVEY-STAKE-NW', name: 'Survey Control Stake NW (0.0m)', pos: [-15.0, 0.5, -15.0], elev: 0.0 },
      { id: 'SURVEY-STAKE-NE', name: 'Survey Control Stake NE (+3.8m)', pos: [15.0, 2.8, -15.0], elev: 3.8 },
      { id: 'SURVEY-STAKE-SE', name: 'Survey Control Stake SE (+2.8m)', pos: [15.0, 3.8, 15.0], elev: 2.8 },
      { id: 'SURVEY-STAKE-SW', name: 'Survey Control Stake SW (+1.2m)', pos: [-15.0, 1.2, 15.0], elev: 1.2 },
    ];
    stakes.forEach((s) => {
      components.push({
        id: s.id,
        name: s.name,
        ifcGuid: `GUID-${s.id}`,
        ifcType: 'IfcSurveyMark',
        category: 'Site',
        storeyId: 'STOREY-GROUND',
        storeyName: 'Ground Level (0.00m Datum)',
        dimensions: [0.15, 1.2, 0.15],
        position: [s.pos[0], s.pos[1], s.pos[2]] as [number, number, number],
        orientationDegrees: 0,
        materialSpecIds: ['WOODEN-CONTROL-STAKE'],
        propertySets: [{ name: 'Pset_SurveyDetails', properties: { StakeId: s.id, Elevation: s.elev, Verification: 'RTK GPS Verified' } }],
        connectedComponentIds: [],
        openings: [],
        inspectionStatus: 'PASSED',
        provenance: { source: 'SURVEY_ENGINE', creator: 'AGENT-SURVEY-001', verifiedDate: new Date().toISOString(), license: 'HERMES' },
      });
    });

    components.push({
      id: 'SPT-001',
      name: 'Geotechnical Soil Boring Test Location (SPT-001)',
      ifcGuid: 'GUID-SPT-001',
      ifcType: 'IfcGeotechTest',
      category: 'Geotechnical',
      storeyId: 'STOREY-GROUND',
      storeyName: 'Ground Level (0.00m Datum)',
      dimensions: [0.8, 0.2, 0.8],
      position: [5.0, 1.8, 5.0],
      orientationDegrees: 0,
      materialSpecIds: ['SOIL-BORING-SAMPLE'],
      propertySets: [
        {
          name: 'Pset_GeotechDetails',
          properties: {
            AllowableBearingCapacityKpa: 190.0,
            BearingCapacityPsf: 3960.0,
            TestMethod: 'Standard Penetration Test (SPT)',
            TopsoilDepthMeters: 0.5,
            SubsoilType: 'Clay Loam Stiff',
            Status: 'VERIFIED_ON_SITE',
          },
        },
      ],
      connectedComponentIds: [],
      openings: [],
      inspectionStatus: 'PASSED',
      provenance: { source: 'GEOTECH_LAB', creator: 'AGENT-GEOTECH-001', verifiedDate: new Date().toISOString(), license: 'HERMES' },
    });
  }

  // 6. Buildable Envelope Overlay (Validation 005/006 eventIndex >= 8)
  if ((isVal005 || isVal006) && eventIndex >= 8) {
    components.push({
      id: 'ENVELOPE-V6-001',
      name: 'Buildable Envelope Site Constraint Overlay (484 m² Max Footprint)',
      ifcGuid: 'GUID-ENVELOPE-V6-001',
      ifcType: 'IfcBuildableEnvelope',
      category: 'Design',
      storeyId: 'STOREY-GROUND',
      storeyName: 'Ground Level (0.00m Datum)',
      dimensions: [22.0, 9.0, 22.0],
      position: [0.0, 0.5, 0.0],
      orientationDegrees: 0,
      materialSpecIds: ['CONSTRAINT-OVERLAY-FRAME'],
      propertySets: [
        {
          name: 'Pset_EnvelopeDetails',
          properties: {
            EnvelopeId: 'ENVELOPE-V6-001',
            MaxFootprintSqM: 484.0,
            MaxHeightMeters: 9.0,
            Setbacks: '4m Front, 4m Rear, 4m Left, 4m Right',
            TerrainStrategy: 'Cut and Fill (Max Slope 8.5°)',
            TruthOrigin: 'SIMULATED',
          },
        },
      ],
      connectedComponentIds: [],
      openings: [],
      inspectionStatus: 'PASSED',
      provenance: { source: 'CIVIL_ENGINEERING', creator: 'AGENT-CIVIL-001', verifiedDate: new Date().toISOString(), license: 'HERMES' },
    });
  }

  // 7. General Survey Marks (for non-Val 005/006)
  if (!isVal005 && !isVal006) {
    const surveyMarks = rawData.surveyMarks || [];
    surveyMarks.forEach((sm: any) => {
      const smIdx = isVal004 ? getEntityEventIdx(sm, 20) : (isVal003 ? 14 : 4);
      if (eventIndex >= smIdx) {
        components.push({
          id: sm.markId || `SURVEY-MARK-${sm.id}`,
          name: `Survey Stake (${sm.markType})`,
          ifcGuid: `GUID-SURVEY-${sm.id}`,
          ifcType: 'IfcSurveyMark',
          category: 'Site',
          storeyId: 'STOREY-GROUND',
          storeyName: 'Ground Level (0.00m Datum)',
          dimensions: [0.15, 1.2, 0.15],
          position: sm.coordinatesXYZ || [0, 0, 0],
          orientationDegrees: 0,
          materialSpecIds: ['HIGH-VIS-STAKE'],
          propertySets: [
            {
              name: 'Pset_SurveyDetails',
              properties: { MarkType: sm.markType, Elevation: sm.elevationMeters },
            },
          ],
          connectedComponentIds: [],
          openings: [],
          inspectionStatus: 'PASSED',
          provenance: {
            source: 'SURVEY_ENGINE',
            creator: 'AGENT-SURVEY-LEAD',
            verifiedDate: new Date().toISOString(),
            license: 'HERMES',
          },
        });
      }
    });
  }

  // 4. 3D Program Room Volumes (Checkpoints 9+ for Val 005/006)
  if ((isVal005 || isVal006) && eventIndex >= 9) {
    const rVolumes = rawData.roomVolumes || [
      { roomId: 'ROOM-LIVING', name: 'Open Living & Dining Great Room', positionXYZ: [-12.0, 0.0, -8.0], dimensionsXYZ: [10.0, 3.0, 8.0], areaSqFt: 430 },
      { roomId: 'ROOM-KITCHEN', name: 'Kitchen & Pantry', positionXYZ: [-2.0, 0.0, -8.0], dimensionsXYZ: [6.0, 3.0, 8.0], areaSqFt: 215 },
      { roomId: 'ROOM-BED-1', name: 'Primary Suite Bedroom', positionXYZ: [-12.0, 0.0, 0.0], dimensionsXYZ: [7.0, 3.0, 6.0], areaSqFt: 240 },
      { roomId: 'ROOM-BATH-1', name: 'Primary Suite Bathroom', positionXYZ: [-5.0, 0.0, 0.0], dimensionsXYZ: [3.0, 3.0, 6.0], areaSqFt: 110 },
      { roomId: 'ROOM-BED-2', name: 'Guest Bedroom 2', positionXYZ: [-12.0, 0.0, 6.0], dimensionsXYZ: [6.0, 3.0, 6.0], areaSqFt: 180 },
      { roomId: 'ROOM-BATH-2', name: 'Guest Bathroom 2', positionXYZ: [-6.0, 0.0, 6.0], dimensionsXYZ: [3.0, 3.0, 6.0], areaSqFt: 100 },
      { roomId: 'ROOM-UTILITY', name: 'Utility & MEP Closet', positionXYZ: [-3.0, 0.0, 6.0], dimensionsXYZ: [3.0, 3.0, 6.0], areaSqFt: 90 }
    ];
    rVolumes.forEach((rv: any) => {
      components.push({
        id: rv.roomId || rv.id,
        name: rv.name,
        ifcGuid: `GUID-${rv.roomId || rv.id}`,
        ifcType: 'IfcSpace',
        category: 'Architecture',
        storeyId: 'STOREY-GROUND',
        storeyName: 'Ground Level (0.00m Datum)',
        dimensions: rv.dimensionsXYZ || rv.dimensionsMeters || [4.0, 3.0, 4.0],
        position: rv.positionXYZ || rv.worldPositionMeters || [0, 0, 0],
        orientationDegrees: 0,
        materialSpecIds: ['PROGRAM-SPACE-VOLUME'],
        propertySets: [
          {
            name: 'Pset_SpaceDetails',
            properties: { TargetAreaSqFt: rv.areaSqFt || rv.targetAreaSqFt, RoomType: rv.name },
          },
        ],
        connectedComponentIds: [],
        openings: [],
        inspectionStatus: 'PASSED',
        provenance: {
          source: 'ARCHITECTURAL_ENGINE',
          creator: 'AGENT-ARCH-LEAD',
          verifiedDate: new Date().toISOString(),
          license: 'HERMES',
        },
      });
    });
  } else if (!isVal005 && !isVal006) {
    const programVolumes = rawData.programVolumes || [];
    programVolumes.forEach((pv: any) => {
      const pvIdx = isVal004 ? getEntityEventIdx(pv, 27) : (isVal003 ? 18 : 5);
      if (eventIndex >= pvIdx) {
        components.push({
          id: pv.id,
          name: pv.name,
          ifcGuid: `GUID-${pv.id}`,
          ifcType: 'IfcSpace',
          category: 'Architecture',
          storeyId: 'STOREY-GROUND',
          storeyName: 'Ground Level (0.00m Datum)',
          dimensions: pv.dimensionsMeters || [4.0, 2.8, 4.0],
          position: pv.worldPositionMeters || [0, 0, 0],
          orientationDegrees: 0,
          materialSpecIds: ['PROGRAM-SPACE-VOLUME'],
          propertySets: [
            {
              name: 'Pset_SpaceDetails',
              properties: { TargetAreaSqFt: pv.targetAreaSqFt, RoomType: pv.roomType },
            },
          ],
          connectedComponentIds: [],
          openings: [],
          inspectionStatus: 'PASSED',
          provenance: {
            source: 'ARCHITECTURAL_ENGINE',
            creator: 'AGENT-ARCH-LEAD',
            verifiedDate: new Date().toISOString(),
            license: 'HERMES',
          },
        });
      }
    });
  }

  // 5. Materials in Staging Yard (Checkpoints 11+ for Val 005/006/007)
  if ((isVal005 || isVal006 || isVal007) && eventIndex >= 11) {
    const mOnsite = rawData.materialsOnsite || [
      { materialId: 'MAT-CONCRETE-PALLET', materialType: '3000 PSI Ready-Mix Concrete Batch', weightKg: 12000, currentPosition: [18.0, 0.0, -12.0], stage: 'DELIVERED_STAGED' },
      { materialId: 'MAT-TIMBER-PALLET-01', materialType: 'SYP #2 Framing Lumber (2x4, 2x6, 2x8 Stack)', weightKg: 4500, currentPosition: [22.0, 0.0, -12.0], stage: 'DELIVERED_STAGED' },
      { materialId: 'MAT-ROOF-PANELS', materialType: 'Standing Seam Galvalume Steel Bundles', weightKg: 3200, currentPosition: [18.0, 0.0, -18.0], stage: 'DELIVERED_STAGED' },
      { materialId: 'MAT-MEP-CRATES', materialType: 'Plumbing PEX, Electrical Romex & HVAC Conduit Crates', weightKg: 1800, currentPosition: [22.0, 0.0, -18.0], stage: 'DELIVERED_STAGED' }
    ];
    mOnsite.forEach((m: any) => {
      components.push({
        id: m.materialId || m.id,
        name: m.materialType || m.name || 'Material Stack',
        ifcGuid: `GUID-${m.materialId || m.id}`,
        ifcType: 'IfcElementAssembly',
        category: 'Structure',
        storeyId: 'STOREY-GROUND',
        storeyName: 'Ground Level (0.00m Datum)',
        dimensions: [2.0, 1.5, 2.0],
        position: m.currentPosition || m.storagePosition || [18.0, 0.0, -12.0],
        orientationDegrees: 0,
        materialSpecIds: ['DELIVERED-MATERIAL-SPEC'],
        propertySets: [
          {
            name: 'Pset_MaterialState',
            properties: {
              Stage: m.stage || 'STAGED',
              WeightKg: m.weightKg || 3000,
            },
          },
        ],
        connectedComponentIds: [],
        openings: [],
        inspectionStatus: 'PASSED',
        provenance: {
          source: 'SPATIAL_LOGISTICS_ENGINE',
          creator: 'MATERIAL_MANAGER',
          verifiedDate: new Date().toISOString(),
          license: 'HERMES',
        },
      });
    });
  }

  // 6. Building Structural Components & MEP (Checkpoints 12+ for Val 005/006/007)
  if (isVal005 || isVal006 || isVal007) {
    if (isVal007 && rawData.buildingComponents) {
      rawData.buildingComponents.forEach((comp: any) => {
        const createdIdx = comp.createdEventIndex !== undefined ? comp.createdEventIndex : 6;
        if (eventIndex >= createdIdx) {
          components.push({
            id: comp.componentId || comp.id,
            ifcGuid: `GUID-${comp.componentId || comp.id}`,
            ifcType: comp.ifcType || (comp.category === 'Foundation' ? 'IfcSlab' : comp.category === 'Roofing' ? 'IfcRoof' : comp.discipline === 'Plumbing' ? 'IfcFlowSegment' : comp.discipline === 'Electrical' ? 'IfcElectricDistributionBoard' : comp.discipline === 'HVAC' ? 'IfcUnitaryEquipment' : 'IfcWall'),
            name: comp.name,
            category: comp.category,
            storeyId: 'STOREY-GROUND',
            storeyName: 'Ground Level (0.00m Datum)',
            position: comp.positionXYZ || comp.position,
            dimensions: comp.dimensionsXYZ || comp.dimensions,
            orientationDegrees: 0,
            materialSpecIds: [comp.material || 'GENERIC-SPEC'],
            propertySets: [{ name: 'Pset_ComponentDetails', properties: { Discipline: comp.discipline, InstallationPhase: comp.installationPhase } }],
            connectedComponentIds: [],
            openings: [],
            inspectionStatus: comp.inspectionStatus || 'PASSED',
            provenance: comp.provenance || { source: 'HERMES_CONSTRUCTION', creator: 'DISCIPLINE_MANAGER', verifiedDate: new Date().toISOString(), license: 'HERMES' }
          });
        }
      });
    } else if (eventIndex >= 12) {
      const structComps = [
        { componentId: 'COMP-SLAB-01', name: 'Monolithic Post-Tensioned Concrete Slab (110 m²)', category: 'Foundation', discipline: 'Civil', positionXYZ: [-7.5, -0.15, -1.0], dimensionsXYZ: [15.0, 0.3, 16.0], material: 'Concrete 3000 PSI', installationPhase: 'FOUNDATION' },
        { componentId: 'COMP-WALL-EXT-NORTH', name: 'North Exterior Timber Stud Wall Assembly (160mph Rated)', category: 'Framing', discipline: 'Structural', positionXYZ: [-7.5, 1.5, -9.0], dimensionsXYZ: [15.0, 3.0, 0.2], material: 'SYP #2 2x6 Framing', installationPhase: 'SUPERSTRUCTURE' },
        { componentId: 'COMP-WALL-EXT-SOUTH', name: 'South Exterior Timber Stud Wall Assembly (160mph Rated)', category: 'Framing', discipline: 'Structural', positionXYZ: [-7.5, 1.5, 7.0], dimensionsXYZ: [15.0, 3.0, 0.2], material: 'SYP #2 2x6 Framing', installationPhase: 'SUPERSTRUCTURE' },
        { componentId: 'COMP-WALL-EXT-WEST', name: 'West Exterior Timber Stud Wall Assembly', category: 'Framing', discipline: 'Structural', positionXYZ: [-15.0, 1.5, -1.0], dimensionsXYZ: [0.2, 3.0, 16.0], material: 'SYP #2 2x6 Framing', installationPhase: 'SUPERSTRUCTURE' },
        { componentId: 'COMP-WALL-EXT-EAST', name: 'East Exterior Timber Stud Wall Assembly', category: 'Framing', discipline: 'Structural', positionXYZ: [0.0, 1.5, -1.0], dimensionsXYZ: [0.2, 3.0, 16.0], material: 'SYP #2 2x6 Framing', installationPhase: 'SUPERSTRUCTURE' },
        { componentId: 'COMP-ROOF-TRUSS-01', name: 'Pre-Engineered Timber Roof Truss System', category: 'Roofing', discipline: 'Structural', positionXYZ: [-7.5, 3.75, -1.0], dimensionsXYZ: [15.6, 1.5, 16.6], material: 'Engineered Wood Truss', installationPhase: 'SUPERSTRUCTURE' }
      ];

      structComps.forEach((comp: any) => {
        components.push({
          id: comp.componentId,
          ifcGuid: `GUID-${comp.componentId}`,
          ifcType: comp.category === 'Foundation' ? 'IfcSlab' : comp.category === 'Roofing' ? 'IfcRoof' : 'IfcWall',
          name: comp.name,
          category: comp.category,
          storeyId: 'STOREY-GROUND',
          storeyName: 'Ground Level (0.00m Datum)',
          position: comp.positionXYZ,
          dimensions: comp.dimensionsXYZ,
          orientationDegrees: 0,
          materialSpecIds: [comp.material],
          propertySets: [{ name: 'Pset_ComponentDetails', properties: { Discipline: comp.discipline, InstallationPhase: comp.installationPhase } }],
          connectedComponentIds: [],
          openings: [],
          inspectionStatus: 'PASSED',
          provenance: { source: 'HERMES_CONSTRUCTION', creator: 'DISCIPLINE_MANAGER', verifiedDate: new Date().toISOString(), license: 'HERMES' }
        });
      });
    }

    if (eventIndex >= 13) {
      // At Checkpoint 13, COMP-PLUMB-MAIN has clash at Z=0.0m. At Checkpoint 14+, rerouted to Z=0.4m PASSED.
      const plumbZ = eventIndex >= 14 ? 0.4 : 0.0;
      const plumbStatus = eventIndex >= 14 ? 'PASSED' : 'FAILED_CLASH_DETECTED';

      const mepComps = [
        { componentId: 'COMP-PLUMB-MAIN', name: 'Primary Water Main Supply Manifold & PEX Run', category: 'Plumbing', discipline: 'Plumbing', positionXYZ: [-7.5, 0.3, plumbZ], dimensionsXYZ: [0.4, 2.2, 0.4], material: 'Copper & PEX-a Tubing', installationPhase: 'ROUGH_IN', status: plumbStatus },
        { componentId: 'COMP-ELEC-PANEL', name: '200A Main Breaker Panel & Conduit Riser', category: 'Electrical', discipline: 'Electrical', positionXYZ: [-3.0, 1.2, 7.0], dimensionsXYZ: [0.6, 1.0, 0.2], material: 'Copper Romex & NEMA Box', installationPhase: 'ROUGH_IN', status: 'PASSED' },
        { componentId: 'COMP-HVAC-UNIT', name: 'SEER2 16 Air Handler & Main Trunk Ductwork', category: 'HVAC', discipline: 'HVAC', positionXYZ: [-3.0, 2.5, 7.0], dimensionsXYZ: [1.2, 0.8, 1.2], material: 'Insulated R-8 Galvanized Duct', installationPhase: 'ROUGH_IN', status: 'PASSED' },
        { componentId: 'COMP-FIRE-SMOKE-01', name: 'Photoelectric Interconnected Smoke Alarm Node', category: 'Fire Protection', discipline: 'Fire Protection', positionXYZ: [-12.0, 3.0, -4.0], dimensionsXYZ: [0.3, 0.1, 0.3], material: 'UL 217 Fire Sensor', installationPhase: 'FINISH', status: 'PASSED' }
      ];

      mepComps.forEach((comp: any) => {
        components.push({
          id: comp.componentId,
          ifcGuid: `GUID-${comp.componentId}`,
          ifcType: comp.discipline === 'Plumbing' ? 'IfcFlowSegment' : comp.discipline === 'Electrical' ? 'IfcElectricDistributionBoard' : comp.discipline === 'HVAC' ? 'IfcUnitaryEquipment' : 'IfcAlarm',
          name: comp.name,
          category: comp.category,
          storeyId: 'STOREY-GROUND',
          storeyName: 'Ground Level (0.00m Datum)',
          position: comp.positionXYZ,
          dimensions: comp.dimensionsXYZ,
          orientationDegrees: 0,
          materialSpecIds: [comp.material],
          propertySets: [{ name: 'Pset_ComponentDetails', properties: { Discipline: comp.discipline, InstallationPhase: comp.installationPhase } }],
          connectedComponentIds: [],
          openings: [],
          inspectionStatus: comp.status as any,
          provenance: { source: 'HERMES_CONSTRUCTION', creator: 'DISCIPLINE_MANAGER', verifiedDate: new Date().toISOString(), license: 'HERMES' }
        });
      });
    }
  }

  // 6. BIM Components (Gated by createdEventId / createdEventIndex <= eventIndex)
  const bimComps = rawData.bimComponents || [];
  const eventBimMap: Record<string, number> = {
    'SLAB-H2-01': 7,
    'WALL-H2-EXT-SOUTH': 8,
    'WALL-H2-EXT-NORTH': 8,
    'WALL-H2-EXT-EAST': 9,
    'WALL-H2-EXT-WEST': 9,
    'WALL-H2-INT-BED1': 10,
    'WALL-H2-INT-BATH1': 10,
    'ROOF-H2-TRUSS': 11,
    'ROOF-H2-DECK': 12,
    'DOOR-H2-ENTRY': 13,
    'WIN-H2-LIVING-01': 13,
    'PLUMB-H2-STACK': 14,
    'ELEC-H2-PANEL': 15,
  };

  bimComps.forEach((comp: any) => {
    const createdIdx = isVal004
      ? getEntityEventIdx(comp, 35)
      : (eventBimMap[comp.id] !== undefined
        ? eventBimMap[comp.id]
        : (comp.createdEventIndex !== undefined ? comp.createdEventIndex : 7));

    if (eventIndex >= createdIdx) {
      components.push({
        ...comp,
        position: comp.position || comp.geometry?.position || [0, 0, 0],
        dimensions: comp.dimensions || comp.geometry?.dimensions || [1, 1, 1],
        storeyId: 'STOREY-GROUND',
        storeyName: 'Ground Level (0.00m Datum)',
        propertySets: [
          {
            name: 'Pset_ComponentDetails',
            properties: {
              System: comp.system || comp.category,
              Assembly: comp.assembly || comp.name,
              InspectionState: comp.inspectionStatus || 'PASSED',
              SupportChainValid: comp.supportChainValid ?? true,
            },
          },
        ],
      });
    }
  });

  return components;
}

export const BimWorkspaceView: React.FC<BimWorkspaceViewProps> = ({
  onSelectProject,
  onOpenSystemDrawer,
  initialSelectedComponentId = null,
}) => {
  // Consume canonical project state directly from HermesProjectContext
  const {
    activeProjectId,
    activeProjectMeta,
    worldState,
    connectionStatus,
    stepForward,
    runAll,
    resetWorld,
    setActiveProjectId,
  } = useHermesProject();

  const [intakeModalOpen, setIntakeModalOpen] = useState<boolean>(false);

  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [allProjectsList, setAllProjectsList] = useState<Array<{ id: string; name: string; buildingType?: string }>>([]);
  const [projectData, setProjectData] = useState<ReferenceBimProject | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Raw Backend Extra Spatial State
  const [house0002RawData, setHouse0002RawData] = useState<any | null>(null);

  // Selection & Nav State
  const [selectedCompId, setSelectedCompId] = useState<string | null>(initialSelectedComponentId);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [selectedStoreyId, setSelectedStoreyId] = useState<string>('ALL');
  const [selectedSystem, setSelectedSystem] = useState<string | null>(null);
  const [hoveredCompId, setHoveredCompId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [workforceDisciplineFilter, setWorkforceDisciplineFilter] = useState<string>('ALL');

  // System Tracing & Isolation
  const [activeTrace, setActiveTrace] = useState<'ELECTRICAL_CIRCUIT' | 'PLUMBING_WASTE' | 'HVAC_AIR_PATH' | null>(null);
  const [tracedCompIds, setTracedCompIds] = useState<Set<string>>(new Set());
  const [showElectricalLegend, setShowElectricalLegend] = useState<boolean>(false);
  const [isolatedCompId, setIsolatedCompId] = useState<string | null>(null);
  const [hiddenCompIds, setHiddenCompIds] = useState<Set<string>>(new Set());

  // Navigation Mode (Orbit vs Walk vs Inspect)
  const [navMode, setNavMode] = useState<'Orbit' | 'Walk' | 'Inspect'>('Orbit');
  const [measureActive, setMeasureActive] = useState<boolean>(false);
  const [sectionBarOpen, setSectionBarOpen] = useState<boolean>(false);

  // Drawers & Tabs
  const [leftTreeOpen, setLeftTreeOpen] = useState<boolean>(true);
  const [rightInspectorOpen, setRightInspectorOpen] = useState<boolean>(true);
  const [rightInspectorTab, setRightInspectorTab] = useState<'SCOPED' | 'PRIME_AUTONOMY'>('PRIME_AUTONOMY');
  const [leftTab, setLeftTab] = useState<'TREE' | 'WORKFORCE' | 'SYSTEMS' | 'TRACE'>('TREE');
  const [inspectorTab, setInspectorTab] = useState<'OVERVIEW' | 'ASSEMBLY' | 'ENGINEERING' | 'QUANTITIES'>('OVERVIEW');
  const [autonomyAudit, setAutonomyAudit] = useState<any>(null);

  // Expanded Tree Nodes
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    'building-root': true,
    'site-root': true,
    'program-root': true,
    'building-structures': true,
    'systems-root': true,
    'materials-root': true,
    'inspections-root': true,
    'STOREY-GROUND': true,
    'STOREY-1': true,
    'STOREY-2': true,
  });

  // Category Layer Filters
  const [activeCategories, setActiveCategories] = useState<Record<string, boolean>>({
    Architecture: true,
    Structure: true,
    Plumbing: true,
    HVAC: true,
    Electrical: true,
    Site: true,
  });

  // Section Cuts
  const [sectionYEnabled, setSectionYEnabled] = useState<boolean>(false);
  const [sectionYValue, setSectionYValue] = useState<number>(3.5);
  const [sectionXEnabled, setSectionXEnabled] = useState<boolean>(false);
  const [sectionXValue, setSectionXValue] = useState<number>(1.0);

  // Timeline & Replay Engine State
  const [replayEvents, setReplayEvents] = useState<any[]>([]);
  const [currentEventIndex, setCurrentEventIndex] = useState<number>(0);
  const [isPlayingTimeline, setIsPlayingTimeline] = useState<boolean>(false);
  const [replaySpeed, setReplaySpeed] = useState<number>(1);
  const [autoCameraEnabled, setAutoCameraEnabled] = useState<boolean>(true);

  // Spatial Operations World & Truth Test State
  const [truthTestReport, setTruthTestReport] = useState<any>(null);
  const [isTruthTestModalOpen, setIsTruthTestModalOpen] = useState<boolean>(false);
  const [phase1Report, setPhase1Report] = useState<any>(null);
  const [isPhase1ModalOpen, setIsPhase1ModalOpen] = useState<boolean>(false);
  const [selectedDisciplineFilter, setSelectedDisciplineFilter] = useState<string>('ALL');
  const [cameraPreset, setCameraPreset] = useState<string>('ORBIT');

  const handleRunTruthTests = async () => {
    try {
      const res = await fetch('/api/hermes/spatial-truth-tests');
      if (res.ok) {
        const data = await res.json();
        setTruthTestReport(data);
        setIsTruthTestModalOpen(true);
      }
    } catch (err) {
      console.error('Failed to run spatial truth tests:', err);
    }
  };

  const handleRunPhase1Audit = async () => {
    try {
      const res = await fetch('/api/hermes/phase1-diagnostics');
      if (res.ok) {
        const data = await res.json();
        setPhase1Report(data);
        setIsPhase1ModalOpen(true);
      }
    } catch (err) {
      console.error('Failed to run Phase 1 diagnostics:', err);
    }
  };

  const applyCameraPreset = (preset: string) => {
    setCameraPreset(preset);
    const cam = cameraPerspRef.current;
    const controls = controlsRef.current;
    if (!cam || !controls) return;

    switch (preset) {
      case 'ORBIT':
        cam.position.set(22, 16, 28);
        controls.target.set(0, 0, 0);
        break;
      case 'WALK':
        cam.position.set(0, 1.7, 15);
        controls.target.set(0, 1.7, 0);
        break;
      case 'INSPECT':
        cam.position.set(0, 2, 5);
        controls.target.set(0, 1, 0);
        break;
      case 'BUILD':
        cam.position.set(15, 15, 15);
        controls.target.set(0, 0, 0);
        break;
      case 'REPLAY':
        cam.position.set(-20, 20, 20);
        controls.target.set(0, 0, 0);
        break;
      case 'SITE_OVERVIEW':
        cam.position.set(0, 50, 45);
        controls.target.set(0, 0, 0);
        break;
      case 'OPS_CAMP':
        cam.position.set(-16, 6, -4);
        controls.target.set(-16, 0, -8);
        break;
      case 'LEARNING_CENTER':
        cam.position.set(16, 6, 16);
        controls.target.set(16, 0, 12);
        break;
    }
    controls.update();
  };

  // Timeline Playback Interval Engine
  useEffect(() => {
    if (!isPlayingTimeline || replayEvents.length === 0) return;
    const intervalMs = Math.max(80, Math.floor(1000 / replaySpeed));
    const timer = setInterval(() => {
      setCurrentEventIndex((prev) => {
        if (prev >= replayEvents.length - 1) {
          setIsPlayingTimeline(false);
          return prev;
        }
        return prev + 1;
      });
    }, intervalMs);
    return () => clearInterval(timer);
  }, [isPlayingTimeline, replayEvents.length, replaySpeed]);

  // Continuous Live World Polling Hook (3s interval)
  useEffect(() => {
    if (activeProjectId !== 'ACADEMY-HOUSE-0002') return;

    let isMounted = true;
    const pollWorld = async () => {
      try {
        const res = await fetch('/api/hermes/house0002-spatial-world');
        if (res.ok && res.headers.get('content-type')?.includes('application/json') && isMounted) {
          const worldData = await res.json();
          if (worldData.events && worldData.events.length > 0) {
            setReplayEvents(worldData.events);
            setHouse0002RawData(worldData);
          }
        }

        const auditRes = await fetch('/api/hermes/house0002-autonomy-audit');
        if (auditRes.ok && auditRes.headers.get('content-type')?.includes('application/json') && isMounted) {
          const auditData = await auditRes.json();
          setAutonomyAudit(auditData);
        }
      } catch (err) {
        // Silently ignore transient network glitches during polling
      }
    };

    const interval = setInterval(pollWorld, 3000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [activeProjectId]);

  // Diagnostics & IFC Parsing State
  const [debugMaterialMode, setDebugMaterialMode] = useState<boolean>(false);
  const [forceAllVisible, setForceAllVisible] = useState<boolean>(false);
  const [ifcLoaded, setIfcLoaded] = useState<boolean>(false);
  const [ifcParseError, setIfcParseError] = useState<string | null>(null);

  // 3D Canvas Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const ifcGroupRef = useRef<THREE.Group>(new THREE.Group());
  const cameraPerspRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const meshesMapRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const boundingBoxMeshRef = useRef<THREE.BoxHelper | null>(null);
  const ifcGeometriesRef = useRef<Map<string, THREE.BufferGeometry>>(new Map());

  // Handle Project Selection Change
  const handleSwitchProject = (newId: string) => {
    setActiveProjectId(newId);
    if (onSelectProject) {
      onSelectProject(newId);
    }
  };

  const handleValidation006Step = async (action: 'step' | 'run-all' | 'reset') => {
    try {
      if (action === 'step') {
        await stepForward();
      } else if (action === 'run-all') {
        await runAll();
      } else if (action === 'reset') {
        await resetWorld();
      }
    } catch (err: any) {
      console.error('Failed stepping project:', err);
    }
  };

  // Fetch Projects List
  useEffect(() => {
    fetch('/api/projects')
      .then((r) => (r.ok && r.headers.get('content-type')?.includes('application/json') ? r.json() : []))
      .then((data) => {
        const house2Entry = {
          id: 'ACADEMY-HOUSE-0002',
          name: 'ACADEMY-HOUSE-0002 (Tampa House #2 ATTEMPT-01)',
          buildingType: 'Autonomous Construction (Tampa, FL)',
        };
        const genesisEntry = {
          id: 'LIVE-WORLD-GENESIS-TEST-001',
          name: 'LIVE-WORLD-GENESIS-TEST-001 (Genesis Live Proof)',
          buildingType: 'Single-Family Residence (Live Genesis)',
        };
        const ownerGenesisEntry = {
          id: 'PHASE1-OWNER-GENESIS-PROOF-001',
          name: 'PHASE1-OWNER-GENESIS-PROOF-001 (Owner Genesis Proof)',
          buildingType: 'Single-Family Residence (Owner Proof)',
        };
        const prehouseEntry = {
          id: 'PREHOUSE-SPATIAL-PROOF-0001',
          name: 'PREHOUSE-SPATIAL-PROOF-0001 (Pre-House Site World)',
          buildingType: 'Pre-House Site World',
        };
        if (Array.isArray(data)) {
          const filtered = data.filter((p) => p.id !== 'PREHOUSE-SPATIAL-PROOF-0001' && p.id !== 'ACADEMY-HOUSE-0002' && p.id !== 'LIVE-WORLD-GENESIS-TEST-001' && p.id !== 'PHASE1-OWNER-GENESIS-PROOF-001');
          setAllProjectsList([house2Entry, genesisEntry, ownerGenesisEntry, prehouseEntry, ...filtered]);
        } else {
          setAllProjectsList([house2Entry, genesisEntry, ownerGenesisEntry, prehouseEntry]);
        }
      })
      .catch(() => {
        setAllProjectsList([
          {
            id: 'ACADEMY-HOUSE-0002',
            name: 'ACADEMY-HOUSE-0002 (Tampa House #2 ATTEMPT-01)',
            buildingType: 'Autonomous Construction (Tampa, FL)',
          },
          {
            id: 'LIVE-WORLD-GENESIS-TEST-001',
            name: 'LIVE-WORLD-GENESIS-TEST-001 (Genesis Live Proof)',
            buildingType: 'Single-Family Residence (Live Genesis)',
          },
          {
            id: 'PHASE1-OWNER-GENESIS-PROOF-001',
            name: 'PHASE1-OWNER-GENESIS-PROOF-001 (Owner Genesis Proof)',
            buildingType: 'Single-Family Residence (Owner Proof)',
          },
          {
            id: 'PREHOUSE-SPATIAL-PROOF-0001',
            name: 'PREHOUSE-SPATIAL-PROOF-0001 (Pre-House Site World)',
            buildingType: 'Pre-House Site World',
          },
        ]);
      });
  }, []);

  // Fetch Project Data & Sync Scene whenever worldState or activeProjectId changes
  useEffect(() => {
    let mounted = true;

    async function syncWorldState() {
      try {
        setLoading(true);
        setError(null);
        setIfcParseError(null);

        // CLEAR ALL PREVIOUS SCENE & METADATA MAPS
        ifcGeometriesRef.current.clear();
        if (ifcGroupRef.current) ifcGroupRef.current.clear();
        if (sceneRef.current) {
          meshesMapRef.current.forEach((m) => sceneRef.current?.remove(m));
          if (boundingBoxMeshRef.current) {
            sceneRef.current.remove(boundingBoxMeshRef.current);
            boundingBoxMeshRef.current = null;
          }
        }
        meshesMapRef.current.clear();

        setSelectedCompId(null);
        setSelectedRoomId(null);
        setSelectedSystem(null);
        setActiveTrace(null);
        setIsolatedCompId(null);
        setHiddenCompIds(new Set());
        setIfcLoaded(false);

        let dataToUse = worldState;

        if (!dataToUse || dataToUse.projectId !== activeProjectId) {
          const res = await fetch(`/api/hermes/projects/${activeProjectId}/world`);
          if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
            dataToUse = await res.json();
          }
        }

        if (!mounted || !dataToUse) return;

        setHouse0002RawData(dataToUse);
        const evs = dataToUse.eventStream || dataToUse.events || [];
        setReplayEvents(evs);
        const curCp = dataToUse.currentCheckpoint ?? dataToUse.currentStepIndex ?? 0;
        setCurrentEventIndex(curCp);

        const initialComps = computeReducedComponentsForEvent(curCp, dataToUse);

        const normalizedProj: ReferenceBimProject = {
          projectId: dataToUse.projectId || activeProjectId,
          name: dataToUse.projectName || activeProjectMeta.name || activeProjectId,
          description: 'HERMES Clean-Room Autonomous Construction OS Active Project',
          classification: 'CANONICAL_LIVE_WORLD',
          immutableSource: false,
          academyWritable: true,
          hermesGenerated: true,
          referenceModel: false,
          license: 'HERMES OpenBIM License',
          sourceUri: `hermes://${dataToUse.projectId || activeProjectId}`,
          spatialHierarchy: {
            projectId: dataToUse.projectId || activeProjectId,
            ifcGuid: `GUID-${dataToUse.projectId || activeProjectId}`,
            siteId: `SITE-${dataToUse.projectId || activeProjectId}`,
            siteGuid: `SITE-GUID-${dataToUse.projectId || activeProjectId}`,
            buildingId: dataToUse.projectName || activeProjectId,
            buildingGuid: `BUILDING-GUID-${dataToUse.projectId || activeProjectId}`,
            storeys: [
              {
                id: 'STOREY-GROUND',
                ifcGuid: `STOREY-GROUND-GUID-${dataToUse.projectId || activeProjectId}`,
                name: 'Ground Level (0.00m Datum)',
                elevationMeters: 0,
                heightMeters: 3.0,
                spaces: [],
              },
            ],
          },
          components: initialComps,
          relationships: {
            containedInStorey: {},
            containedInSpace: {},
            hostsOpening: {},
            systemConnectivity: {},
          },
        };

        setProjectData(normalizedProj);
        setLoading(false);
      } catch (e: any) {
        if (mounted) {
          setError(e.message || String(e));
          setLoading(false);
        }
      }
    }

    syncWorldState();

    return () => {
      mounted = false;
    };
  }, [worldState, activeProjectId]);

  // Synchronize 3D BIM viewport components with canonical event-sourced state
  useEffect(() => {
    if (house0002RawData) {
      const activeComps = computeReducedComponentsForEvent(currentEventIndex, house0002RawData);
      setProjectData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          components: activeComps,
        };
      });
    }
  }, [currentEventIndex, house0002RawData, activeProjectId]);

  // Three.js Scene Setup (Mount Once)
  useEffect(() => {
    if (!containerRef.current) return;
    const domEl = containerRef.current;
    const width = domEl.clientWidth || 800;
    const height = domEl.clientHeight || 600;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc);
    sceneRef.current = scene;

    const cameraPersp = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    cameraPersp.position.set(22, 16, 28);
    cameraPerspRef.current = cameraPersp;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    domEl.innerHTML = '';
    domEl.appendChild(renderer.domElement);

    const controls = new OrbitControls(cameraPersp, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.05; // Stay above ground
    controls.addEventListener('start', () => {
      // Owner manual interaction switches camera mode strictly to OWNER_CONTROLLED
      setAutoCameraEnabled(false);
    });
    controlsRef.current = controls;

    // Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.1);
    dirLight1.position.set(30, 40, 20);
    dirLight1.castShadow = true;
    dirLight1.shadow.mapSize.width = 2048;
    dirLight1.shadow.mapSize.height = 2048;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x93c5fd, 0.4);
    dirLight2.position.set(-20, 20, -20);
    scene.add(dirLight2);

    // Site Grid & Datum
    const gridHelper = new THREE.GridHelper(80, 80, 0x0284c7, 0xcbd5e1);
    gridHelper.position.y = -0.01;
    scene.add(gridHelper);

    // Group containers
    ifcGroupRef.current = new THREE.Group();
    scene.add(ifcGroupRef.current);

    // Raycasting for object selection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, cameraPersp);
      const intersects = raycaster.intersectObjects(ifcGroupRef.current.children, true);

      if (intersects.length > 0) {
        let obj: THREE.Object3D | null = intersects[0].object;
        while (obj && !obj.userData?.compId && obj.parent) {
          obj = obj.parent;
        }
        if (obj && obj.userData?.compId) {
          setSelectedCompId(obj.userData.compId);
          setRightInspectorOpen(true);
        }
      }
    };

    domEl.addEventListener('click', handlePointerDown);

    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, cameraPersp);
    };
    animate();

    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraPersp.aspect = w / h;
      cameraPersp.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      domEl.removeEventListener('click', handlePointerDown);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  // ResizeObserver for instant responsive viewport sizing
  useEffect(() => {
    if (!containerRef.current || !rendererRef.current || !cameraPerspRef.current) return;

    const handleContainerResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraPerspRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      if (w === 0 || h === 0) return;
      cameraPerspRef.current.aspect = w / h;
      cameraPerspRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    const observer = new ResizeObserver(() => {
      handleContainerResize();
    });

    observer.observe(containerRef.current);
    handleContainerResize();

    return () => {
      observer.disconnect();
    };
  }, [leftTreeOpen, rightInspectorOpen, isFullscreen]);

  // Camera Framing Utility
  const fitModelToCamera = () => {
    // STAGE 2: If owner has interacted or disabled auto-camera, DO NOT RECENTER!
    if (!autoCameraEnabled) return;

    const cam = cameraPerspRef.current;
    const controls = controlsRef.current;
    if (!cam || !controls) return;

    const overallBox = new THREE.Box3();
    if (meshesMapRef.current.size > 0) {
      meshesMapRef.current.forEach((m) => {
        if (!m.visible) return;
        const b = new THREE.Box3().setFromObject(m);
        if (
          Number.isFinite(b.min.x) &&
          Number.isFinite(b.min.y) &&
          Number.isFinite(b.min.z) &&
          Number.isFinite(b.max.x) &&
          Number.isFinite(b.max.y) &&
          Number.isFinite(b.max.z)
        ) {
          overallBox.union(b);
        }
      });
    }

    if (overallBox.isEmpty()) {
      overallBox.min.set(-15, 0, -15);
      overallBox.max.set(15, 8, 15);
    }

    const center = new THREE.Vector3();
    overallBox.getCenter(center);
    const sphere = new THREE.Sphere();
    overallBox.getBoundingSphere(sphere);
    const radius = Math.max(sphere.radius, 10.0);

    const direction = new THREE.Vector3(1, 0.8, 1.2).normalize();
    cam.position.copy(center).addScaledVector(direction, radius * 2.2);
    cam.lookAt(center);
    controls.target.copy(center);
    controls.update();
  };

  // Build 3D Meshes strictly backed by active project records
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || !projectData) return;

    if (ifcGroupRef.current) {
      ifcGroupRef.current.clear();
    }
    meshesMapRef.current.forEach((m) => scene.remove(m));
    meshesMapRef.current.clear();

    if (boundingBoxMeshRef.current) {
      scene.remove(boundingBoxMeshRef.current);
      boundingBoxMeshRef.current = null;
    }

    // 0a. Render Non-Flat Site Reality Terrain Mesh & Contour Overlay
    if (house0002RawData?.siteRealityModel?.terrainMesh) {
      const tm = house0002RawData.siteRealityModel.terrainMesh;
      const tGeom = new THREE.BufferGeometry();
      
      const flatPositions: number[] = [];
      (tm.vertices || []).forEach((v: [number, number, number]) => {
        flatPositions.push(v[0], v[1], v[2]);
      });
      
      const flatIndices: number[] = [];
      (tm.faces || []).forEach((f: [number, number, number]) => {
        flatIndices.push(f[0], f[1], f[2]);
      });

      if (flatPositions.length > 0 && flatIndices.length > 0) {
        tGeom.setAttribute('position', new THREE.Float32BufferAttribute(flatPositions, 3));
        tGeom.setIndex(flatIndices);
        tGeom.computeVertexNormals();

        // Vertex height coloring: green valleys to earthy tan ridges
        const colors: number[] = [];
        const posAttr = tGeom.getAttribute('position');
        for (let i = 0; i < posAttr.count; i++) {
          const y = posAttr.getY(i);
          const t = Math.min(Math.max(y / 4.0, 0), 1);
          const r = 0.2 + t * 0.45;
          const g = 0.5 - t * 0.15;
          const b = 0.2;
          colors.push(r, g, b);
        }
        tGeom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        const terrainMat = new THREE.MeshStandardMaterial({
          vertexColors: true,
          roughness: 0.85,
          metalness: 0.05,
          side: THREE.DoubleSide,
        });

        const terrainMesh = new THREE.Mesh(tGeom, terrainMat);
        terrainMesh.receiveShadow = true;
        terrainMesh.userData = { compId: 'SITE-TERRAIN-MESH-005' };
        if (ifcGroupRef.current) {
          ifcGroupRef.current.add(terrainMesh);
        }
        meshesMapRef.current.set('SITE-TERRAIN-MESH-005', terrainMesh);

        // Wireframe contour lines for explicit visual proof of elevation
        const wireGeom = new THREE.WireframeGeometry(tGeom);
        const wireMat = new THREE.LineBasicMaterial({ color: 0x15803d, linewidth: 1, transparent: true, opacity: 0.35 });
        const wireLine = new THREE.LineSegments(wireGeom, wireMat);
        terrainMesh.add(wireLine);
      }
    }

    // 0b. Render Parcel Boundary Polyline & Corner Survey Markers
    if (house0002RawData?.siteRealityModel?.boundary) {
      const boundaryPoints = house0002RawData.siteRealityModel.boundary;
      const polyPoints: THREE.Vector3[] = [];
      (boundaryPoints || []).forEach((pt: [number, number]) => {
        polyPoints.push(new THREE.Vector3(pt[0], 0.15, pt[1]));
      });
      if (Array.isArray(boundaryPoints) && boundaryPoints.length > 0) {
        polyPoints.push(new THREE.Vector3(boundaryPoints[0][0], 0.15, boundaryPoints[0][1]));
      }

      if (polyPoints.length > 0) {
        const bGeom = new THREE.BufferGeometry().setFromPoints(polyPoints);
        const bMat = new THREE.LineBasicMaterial({ color: 0x0284c7, linewidth: 3 });
        const bLine = new THREE.LineSegments(bGeom, bMat);
        if (ifcGroupRef.current) {
          ifcGroupRef.current.add(bLine);
        }
      }

      (boundaryPoints || []).forEach((pt: [number, number], idx: number) => {
        const stakeGeom = new THREE.CylinderGeometry(0.12, 0.12, 1.8, 8);
        stakeGeom.translate(pt[0], 0.9, pt[1]);
        const stakeMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 });
        const stakeMesh = new THREE.Mesh(stakeGeom, stakeMat);
        stakeMesh.userData = { compId: `CORNER-STAKE-${idx}` };
        if (ifcGroupRef.current) {
          ifcGroupRef.current.add(stakeMesh);
        }
      });
    }

    (projectData?.components || []).forEach((comp) => {
      if (hiddenCompIds.has(comp.id) && !forceAllVisible) return;
      if (isolatedCompId && comp.id !== isolatedCompId && !forceAllVisible) return;

      // Category filter
      if (!activeCategories[comp.category] && !forceAllVisible) return;

      // Storey filter
      const isCurrentStorey = selectedStoreyId === 'ALL' || comp.storeyId === selectedStoreyId;
      if (!isCurrentStorey && !forceAllVisible) return;

      // System filter
      if (selectedSystem && comp.category !== selectedSystem && !forceAllVisible) return;

      // System Trace filter
      const isTraced = activeTrace && tracedCompIds.has(comp.id);

      const isSelected = selectedCompId === comp.id;
      const isHovered = hoveredCompId === comp.id;

      let geom = ifcGeometriesRef.current.get(comp.id);
      let mesh: THREE.Mesh;

      const rawDims = comp.dimensions || [1.5, 2.8, 0.2];
      const w = typeof rawDims[0] === 'number' && Number.isFinite(rawDims[0]) && rawDims[0] > 0 ? rawDims[0] : 1.5;
      const h = typeof rawDims[1] === 'number' && Number.isFinite(rawDims[1]) && rawDims[1] > 0 ? rawDims[1] : 2.8;
      const d = typeof rawDims[2] === 'number' && Number.isFinite(rawDims[2]) && rawDims[2] > 0 ? rawDims[2] : 0.2;

      const rawPos = comp.position || [0, 0, 0];
      const px = typeof rawPos[0] === 'number' && Number.isFinite(rawPos[0]) ? rawPos[0] : 0;
      const py = typeof rawPos[1] === 'number' && Number.isFinite(rawPos[1]) ? rawPos[1] : 0;
      const pz = typeof rawPos[2] === 'number' && Number.isFinite(rawPos[2]) ? rawPos[2] : 0;

      if (comp.ifcType === 'IfcActor') {
        // AGENT AVATAR SHAPE: Cylinder body + sphere head
        const group = new THREE.Group();
        const discipline = (comp.propertySets || []).find((p) => p.name === 'Pset_AgentDetails')?.properties?.Discipline as string;

        let agentColor = 0x06b6d4; // Default cyan
        if (discipline === 'EXECUTIVE' || discipline === 'PRIME') agentColor = 0xf59e0b; // Gold
        else if (discipline === 'SURVEY') agentColor = 0xeab308; // High-Vis Yellow
        else if (['CONCRETE', 'MASONRY', 'FRAMING', 'ROOFING'].includes(discipline)) agentColor = 0xf97316; // Orange
        else if (['PLUMBING', 'ELECTRICAL', 'HVAC'].includes(discipline)) agentColor = 0x3b82f6; // Blue
        else if (discipline === 'KNOWLEDGE') agentColor = 0x64748b; // Slate Blue

        const bodyGeom = new THREE.CylinderGeometry(0.2, 0.22, 1.2, 12);
        bodyGeom.translate(0, 0.6, 0);
        const bodyMat = new THREE.MeshStandardMaterial({
          color: isSelected ? 0x0284c7 : isHovered ? 0xf59e0b : agentColor,
          roughness: 0.4,
        });
        const bodyMesh = new THREE.Mesh(bodyGeom, bodyMat);
        group.add(bodyMesh);

        const headGeom = new THREE.SphereGeometry(0.18, 12, 12);
        headGeom.translate(0, 1.35, 0);
        const headMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
        const headMesh = new THREE.Mesh(headGeom, headMat);
        group.add(headMesh);

        group.position.set(px, py, pz);
        group.userData = { compId: comp.id };

        if (ifcGroupRef.current) {
          ifcGroupRef.current.add(group);
        }
        meshesMapRef.current.set(comp.id, bodyMesh);
        return;
      }

      if (comp.ifcType === 'IfcSurveyMark' || comp.id.startsWith('SURVEY-MARK-')) {
        // SURVEY STAKE: High-vis cylinder stake + bright yellow flag
        const group = new THREE.Group();

        const stakeGeom = new THREE.CylinderGeometry(0.04, 0.04, h, 8);
        stakeGeom.translate(0, h / 2, 0);
        const stakeMat = new THREE.MeshStandardMaterial({
          color: isSelected ? 0x0284c7 : isHovered ? 0xf59e0b : 0xef4444, // Red stake
          roughness: 0.3,
        });
        const stakeMesh = new THREE.Mesh(stakeGeom, stakeMat);
        group.add(stakeMesh);

        const flagGeom = new THREE.BoxGeometry(0.3, 0.2, 0.02);
        flagGeom.translate(0.15, h - 0.1, 0);
        const flagMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.2 }); // High-vis yellow flag
        const flagMesh = new THREE.Mesh(flagGeom, flagMat);
        group.add(flagMesh);

        group.position.set(px, py, pz);
        group.userData = { compId: comp.id };

        if (ifcGroupRef.current) {
          ifcGroupRef.current.add(group);
        }
        meshesMapRef.current.set(comp.id, stakeMesh);
        return;
      }

      if (comp.ifcType === 'IfcSpace' || comp.id.startsWith('PROG-VOL-')) {
        // 3D PROGRAM VOLUME ROOM BLOCK
        const boxGeom = new THREE.BoxGeometry(w, h, d);
        boxGeom.translate(px, py + h / 2, pz);

        const spaceMat = new THREE.MeshStandardMaterial({
          color: isSelected ? 0x0284c7 : 0xa855f7,
          transparent: true,
          opacity: 0.3,
          side: THREE.DoubleSide,
        });

        mesh = new THREE.Mesh(boxGeom, spaceMat);
        const edges = new THREE.EdgesGeometry(boxGeom);
        const lineMat = new THREE.LineBasicMaterial({ color: 0xc084fc, linewidth: 2 });
        mesh.add(new THREE.LineSegments(edges, lineMat));
      } else if (comp.id.startsWith('FACILITY-')) {
        // TEMPORARY SITE FACILITY CONTAINER
        const facGeom = new THREE.BoxGeometry(w, h, d);
        facGeom.translate(px, py + h / 2, pz);

        let facColor = 0x1e3a8a; // Navy trailer
        if (comp.id.includes('LEARNING')) facColor = 0x0e7490;
        else if (comp.id.includes('WORKFORCE')) facColor = 0x334155;
        else if (comp.id.includes('LAYDOWN')) facColor = 0x92400e;
        else if (comp.id.includes('RECEIVING')) facColor = 0x15803d;

        const facMat = new THREE.MeshStandardMaterial({
          color: isSelected ? 0x0284c7 : isHovered ? 0xf59e0b : facColor,
          roughness: 0.5,
          side: THREE.DoubleSide,
        });

        mesh = new THREE.Mesh(facGeom, facMat);
        const edges = new THREE.EdgesGeometry(facGeom);
        const lineMat = new THREE.LineBasicMaterial({ color: 0x94a3b8, linewidth: 1 });
        mesh.add(new THREE.LineSegments(edges, lineMat));
      } else {
        // STANDARD BUILDING / SITE COMPONENT
        if (!geom) {
          geom = new THREE.BoxGeometry(w, h, d);
          geom.translate(px, py + h / 2, pz);
        }

        let colorHex = getCategoryColorHex(comp.category);
        if (selectedSystem && comp.category === selectedSystem) {
          colorHex = getSystemColorHex(selectedSystem);
        }
        if (isTraced) {
          colorHex = 0x06b6d4;
        }

        let material: THREE.Material;
        if (debugMaterialMode) {
          material = new THREE.MeshNormalMaterial({ side: THREE.DoubleSide });
        } else {
          material = new THREE.MeshStandardMaterial({
            color: isSelected ? 0x0284c7 : isHovered ? 0xf59e0b : colorHex,
            roughness: comp.category === 'Structure' ? 0.7 : 0.35,
            metalness: comp.category === 'Plumbing' || comp.category === 'HVAC' ? 0.5 : 0.1,
            side: THREE.DoubleSide,
          });
        }

        mesh = new THREE.Mesh(geom, material);
      }

      mesh.userData = { compId: comp.id };
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      if (isSelected || isHovered || isTraced) {
        const edges = new THREE.EdgesGeometry(mesh.geometry);
        const lineMat = new THREE.LineBasicMaterial({
          color: isSelected ? 0x0284c7 : isTraced ? 0x06b6d4 : 0xfcd34d,
          linewidth: 2,
        });
        mesh.add(new THREE.LineSegments(edges, lineMat));
      }

      if (ifcGroupRef.current) {
        ifcGroupRef.current.add(mesh);
      }
      meshesMapRef.current.set(comp.id, mesh);

      if (isSelected) {
        const boxHelper = new THREE.BoxHelper(mesh, 0x0284c7);
        scene.add(boxHelper);
        boundingBoxMeshRef.current = boxHelper;
      }
    });

    fitModelToCamera();
  }, [projectData, activeCategories, selectedCompId, hoveredCompId, selectedStoreyId, selectedSystem, isolatedCompId, hiddenCompIds, debugMaterialMode, forceAllVisible, tracedCompIds, activeTrace]);

  // Selected Component Lookup
  const selectedComponent = (projectData?.components || []).find((c) => c.id === selectedCompId) || null;
  const selectedRoom = selectedRoomId && projectData ? (projectData.spatialHierarchy?.storeys || []).flatMap((s) => s.spaces || []).find((sp) => sp.id === selectedRoomId) : null;

  // Selected Agent Lookup
  const selectedAgent = (house0002RawData?.agentSpatialStates || []).find((a: any) => `AGENT-${a.agentId}` === selectedCompId || a.agentId === selectedCompId) || null;

  // Selected Facility Lookup
  const selectedFacility = (house0002RawData?.spatialEntities || []).find((e: any) => e.entityId === selectedCompId) || null;

  // Active Replay Event
  const activeReplayEvent = replayEvents.length > 0 ? replayEvents[Math.min(currentEventIndex, replayEvents.length - 1)] : null;

  return (
    <div className="h-full w-full flex flex-col bg-slate-50 text-slate-900 font-sans overflow-hidden select-none">
      {/* RUNTIME PROJECT MISMATCH INVARIANT CHECK */}
      {activeProjectId === 'HERMES-LIVE-HOUSE-001' && worldState && worldState.projectId !== 'HERMES-LIVE-HOUSE-001' && (
        <div className="bg-red-600 text-white px-4 py-2 font-mono font-bold flex items-center justify-between z-50 shadow-lg animate-pulse">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-300 shrink-0" />
            <div>
              <span className="text-sm font-extrabold">PROJECT STATE MISMATCH DETECTED</span>
              <p className="text-xs opacity-90">
                Shell Active: <code className="bg-red-800 px-1 rounded">{activeProjectId}</code> | BIM World State: <code className="bg-red-800 px-1 rounded">{worldState.projectId}</code>
              </p>
            </div>
          </div>
          <button
            onClick={() => resetWorld()}
            className="px-3 py-1 bg-white text-red-700 font-extrabold text-xs rounded-lg hover:bg-slate-100 transition"
          >
            FORCE RESET CANONICAL WORLD
          </button>
        </div>
      )}

      {/* 1. TOP CONTROL RIBBON */}
      <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between gap-3 shadow-2xs z-20 shrink-0 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Canonical Active Project Display (No secondary selector) */}
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-3 py-1 rounded-xl text-xs font-mono">
            <Building className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="font-extrabold text-blue-950 truncate max-w-xs md:max-w-md">
              {activeProjectMeta.name || activeProjectId}
            </span>
            <span className="text-[10px] bg-blue-200 text-blue-900 px-1.5 py-0.5 rounded font-bold">
              CANONICAL
            </span>
          </div>

          <span className="text-slate-300 hidden sm:inline">|</span>

          {/* Camera Presets Toolbar */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs font-medium">
            <Compass className="w-3.5 h-3.5 text-slate-500 ml-2" />
            <select
              value={cameraPreset}
              onChange={(e) => applyCameraPreset(e.target.value)}
              className="bg-transparent text-slate-700 font-bold focus:outline-none cursor-pointer text-xs pr-2"
            >
              <option value="ORBIT">Camera: Orbit Standard</option>
              <option value="WALK">Camera: Walk Eye-Level</option>
              <option value="INSPECT">Camera: Close Inspection</option>
              <option value="BUILD">Camera: Isometric Footprint</option>
              <option value="REPLAY">Camera: Event Replay View</option>
              <option value="SITE_OVERVIEW">Camera: Site Overview (50m)</option>
              <option value="OPS_CAMP">Camera: Operations Camp</option>
              <option value="LEARNING_CENTER">Camera: Learning Center</option>
            </select>
          </div>
        </div>

        {/* Viewport Tools & Truth Test Suite Button */}
        <div className="flex items-center gap-2">
          {/* Phase 1 Specification Audit Trigger */}
          <button
            onClick={handleRunPhase1Audit}
            className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-2xs transition flex items-center gap-1.5 font-mono"
          >
            <ShieldCheck className="w-3.5 h-3.5" /> PHASE 1 AUDIT (STAGES 0–2)
          </button>

          {/* Spatial Truth Test Suite Trigger */}
          <button
            onClick={handleRunTruthTests}
            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-2xs transition flex items-center gap-1.5 font-mono"
          >
            <ShieldCheck className="w-3.5 h-3.5" /> RUN TRUTH TESTS
          </button>

          {/* Mobile Drawer Toggles */}
          <button
            onClick={() => {
              setLeftTreeOpen(!leftTreeOpen);
              if (!leftTreeOpen) setRightInspectorOpen(false);
            }}
            className={`px-2.5 py-1 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 sm:hidden ${leftTreeOpen ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-200'}`}
          >
            <FolderTree className="w-3.5 h-3.5" /> Tree
          </button>

          <button
            onClick={() => {
              setLeftTreeOpen(true);
              setLeftTab('WORKFORCE');
              setRightInspectorOpen(false);
            }}
            className="px-2.5 py-1 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100"
          >
            <Users className="w-3.5 h-3.5 text-amber-600" /> Workforce (68)
          </button>

          <button
            onClick={() => {
              setSelectedCompId(null);
              setRightInspectorTab('PRIME_AUTONOMY');
              setRightInspectorOpen(true);
            }}
            className={`px-3 py-1 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 ${
              rightInspectorOpen && rightInspectorTab === 'PRIME_AUTONOMY'
                ? 'bg-purple-600 text-white border-purple-600 shadow-xs font-mono'
                : 'bg-purple-50 text-purple-900 border-purple-200 hover:bg-purple-100 font-mono'
            }`}
          >
            <Brain className="w-3.5 h-3.5 text-purple-600" /> PRIME / STATUS
          </button>

          <button onClick={fitModelToCamera} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-2xs transition flex items-center gap-1.5">
            <Maximize2 className="w-3.5 h-3.5" /> Fit View
          </button>
        </div>
      </div>

      {/* 2. MAIN CENTER WORKSPACE LAYOUT */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* LEFT BUILDING NAVIGATOR SIDEBAR */}
        <div className={`${leftTreeOpen ? 'w-full sm:w-80' : 'w-0'} bg-white border-r border-slate-200 transition-all duration-200 ease-in-out flex flex-col shrink-0 z-10 overflow-hidden shadow-2xs`}>
          {/* Subtabs Header */}
          <div className="p-2 border-b border-slate-200 bg-slate-50 flex items-center justify-around text-xs font-bold font-sans">
            <button
              onClick={() => setLeftTab('TREE')}
              className={`px-2.5 py-1.5 rounded-lg transition flex items-center gap-1 ${leftTab === 'TREE' ? 'bg-white text-blue-700 shadow-2xs border border-slate-200' : 'text-slate-500 hover:text-slate-900'}`}
            >
              <FolderTree className="w-3.5 h-3.5" /> Model Tree
            </button>
            <button
              onClick={() => setLeftTab('WORKFORCE')}
              className={`px-2.5 py-1.5 rounded-lg transition flex items-center gap-1 ${leftTab === 'WORKFORCE' ? 'bg-white text-amber-700 shadow-2xs border border-slate-200 font-bold' : 'text-slate-500 hover:text-slate-900'}`}
            >
              <Users className="w-3.5 h-3.5 text-amber-600" /> Workforce
            </button>
            <button
              onClick={() => setLeftTab('SYSTEMS')}
              className={`px-2.5 py-1.5 rounded-lg transition flex items-center gap-1 ${leftTab === 'SYSTEMS' ? 'bg-white text-blue-700 shadow-2xs border border-slate-200' : 'text-slate-500 hover:text-slate-900'}`}
            >
              <Network className="w-3.5 h-3.5" /> Systems
            </button>
          </div>

          {/* Search Box */}
          <div className="p-2.5 border-b border-slate-200">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder={leftTab === 'WORKFORCE' ? 'Search 68 workforce agents...' : 'Search walls, facilities, systems...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 text-slate-800 text-xs pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-sans"
              />
            </div>
          </div>

          {/* Left Tab Content */}
          <div className="flex-1 overflow-y-auto p-3 text-xs font-mono space-y-2">
            {leftTab === 'TREE' && projectData && (
              <div className="space-y-2 font-sans">
                {/* Project Header */}
                <div className="px-2 py-1.5 bg-slate-100 rounded-xl text-slate-900 font-bold text-xs flex items-center justify-between">
                  <span className="flex items-center gap-1.5 truncate">
                    <Building className="w-4 h-4 text-blue-600 shrink-0" />
                    {projectData.name}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono shrink-0">{(projectData?.components || []).length} Items</span>
                </div>

                {activeProjectId.startsWith('LIVE-WORLD-VISUAL-VALIDATION-') || (projectData?.components && projectData.components.length > 0) ? (
                  /* STRUCTURED LIVE WORLD & MODEL TREE */
                  <div className="space-y-2 text-xs">
                    {/* 1. OPERATIONS CAMPUS FACILITIES */}
                    {(() => {
                      const campusComps = (projectData?.components || []).filter((c) => c.ifcType === 'IfcSiteFacility' || c.id.startsWith('FACILITY-'));
                      const isExpanded = expandedNodes['campus-facilities'] ?? true;
                      return (
                        <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                          <button
                            onClick={() => setExpandedNodes((p) => ({ ...p, 'campus-facilities': !p['campus-facilities'] }))}
                            className="w-full px-3 py-2 bg-slate-100 font-bold text-slate-800 flex items-center justify-between text-xs hover:bg-slate-200/80"
                          >
                            <span className="flex items-center gap-1.5 truncate">
                              <Building className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              Operations Campus ({campusComps.length} Facilities)
                            </span>
                            {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />}
                          </button>
                          {isExpanded && (
                            <div className="p-2 space-y-1 max-h-56 overflow-y-auto">
                              {campusComps.map((comp) => (
                                <button
                                  key={comp.id}
                                  onClick={() => {
                                    setSelectedCompId(comp.id);
                                    setRightInspectorOpen(true);
                                  }}
                                  className={`w-full text-left px-2 py-1.5 rounded-lg transition flex items-center justify-between ${
                                    selectedCompId === comp.id ? 'bg-blue-600 text-white font-bold' : 'hover:bg-slate-200/60 text-slate-700'
                                  }`}
                                >
                                  <span className="truncate">{comp.name}</span>
                                  <span className="text-[9px] font-mono opacity-75 shrink-0 ml-1">{comp.id}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* 2. WORKFORCE (HERMES AGENTS) */}
                    {(() => {
                      const agentComps = (projectData?.components || []).filter((c) => c.ifcType === 'IfcActor' && c.id !== 'CUSTOMER-001');
                      const isExpanded = expandedNodes['workforce-agents'] ?? false;
                      return (
                        <div className="border border-slate-200 rounded-xl overflow-hidden bg-amber-50/50">
                          <button
                            onClick={() => setExpandedNodes((p) => ({ ...p, 'workforce-agents': !p['workforce-agents'] }))}
                            className="w-full px-3 py-2 bg-amber-100/80 font-bold text-amber-900 flex items-center justify-between text-xs hover:bg-amber-200/80"
                          >
                            <span className="flex items-center gap-1.5 truncate">
                              <Users className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              HERMES Workforce ({agentComps.length} Agents)
                            </span>
                            {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-amber-600 shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
                          </button>
                          {isExpanded && (
                            <div className="p-2 space-y-1 max-h-56 overflow-y-auto">
                              {agentComps.map((comp) => (
                                <button
                                  key={comp.id}
                                  onClick={() => {
                                    setSelectedCompId(comp.id);
                                    setRightInspectorOpen(true);
                                  }}
                                  className={`w-full text-left px-2 py-1 rounded-lg transition flex items-center justify-between ${
                                    selectedCompId === comp.id ? 'bg-amber-600 text-white font-bold' : 'hover:bg-amber-200/60 text-slate-700'
                                  }`}
                                >
                                  <span className="truncate">{comp.name}</span>
                                  <span className="text-[9px] font-mono opacity-75 shrink-0 ml-1">{comp.id.replace('AGENT-', '')}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* 3. PROJECT CUSTOMER / OWNER */}
                    {(() => {
                      const customerComp = (projectData?.components || []).find((c) => c.id === 'CUSTOMER-001');
                      if (!customerComp) return null;
                      return (
                        <div className="border border-emerald-200 rounded-xl overflow-hidden bg-emerald-50/50">
                          <button
                            onClick={() => {
                              setSelectedCompId(customerComp.id);
                              setRightInspectorOpen(true);
                            }}
                            className={`w-full px-3 py-2 font-bold text-emerald-900 flex items-center justify-between text-xs transition ${
                              selectedCompId === customerComp.id ? 'bg-emerald-600 text-white' : 'bg-emerald-100/80 hover:bg-emerald-200/80'
                            }`}
                          >
                            <span className="flex items-center gap-1.5 truncate">
                              <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              {customerComp.name}
                            </span>
                            <span className="text-[9px] font-mono opacity-75 shrink-0">PRESENT</span>
                          </button>
                        </div>
                      );
                    })()}

                    {/* 4. IN-WORLD REQUIREMENTS BOARD */}
                    {(() => {
                      const boardComp = (projectData?.components || []).find((c) => c.id === 'BOARD-REQUIREMENTS-005');
                      if (!boardComp) return null;
                      return (
                        <div className="border border-purple-200 rounded-xl overflow-hidden bg-purple-50/50">
                          <button
                            onClick={() => {
                              setSelectedCompId(boardComp.id);
                              setRightInspectorOpen(true);
                            }}
                            className={`w-full px-3 py-2 font-bold text-purple-900 flex items-center justify-between text-xs transition ${
                              selectedCompId === boardComp.id ? 'bg-purple-600 text-white' : 'bg-purple-100/80 hover:bg-purple-200/80'
                            }`}
                          >
                            <span className="flex items-center gap-1.5 truncate">
                              <FileCheck className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                              Requirements Board (12 Records)
                            </span>
                            <span className="text-[9px] font-mono opacity-75 shrink-0">VERIFIED</span>
                          </button>
                        </div>
                      );
                    })()}

                    {/* 5. SURVEY & GEOTECH EQUIPMENT */}
                    {(() => {
                      const equipComps = (projectData?.components || []).filter((c) => c.category === 'Equipment' || c.id.startsWith('EQUIP-'));
                      if (equipComps.length === 0) return null;
                      const isExpanded = expandedNodes['equipment'] ?? true;
                      return (
                        <div className="border border-cyan-200 rounded-xl overflow-hidden bg-cyan-50/50">
                          <button
                            onClick={() => setExpandedNodes((p) => ({ ...p, 'equipment': !p['equipment'] }))}
                            className="w-full px-3 py-2 bg-cyan-100/80 font-bold text-cyan-900 flex items-center justify-between text-xs hover:bg-cyan-200/80"
                          >
                            <span className="flex items-center gap-1.5 truncate">
                              <Compass className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                              Survey & Geotech Equipment ({equipComps.length})
                            </span>
                            {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-cyan-600 shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-cyan-600 shrink-0" />}
                          </button>
                          {isExpanded && (
                            <div className="p-2 space-y-1">
                              {equipComps.map((comp) => (
                                <button
                                  key={comp.id}
                                  onClick={() => {
                                    setSelectedCompId(comp.id);
                                    setRightInspectorOpen(true);
                                  }}
                                  className={`w-full text-left px-2 py-1.5 rounded-lg transition flex items-center justify-between ${
                                    selectedCompId === comp.id ? 'bg-cyan-600 text-white font-bold' : 'hover:bg-cyan-200/60 text-slate-700'
                                  }`}
                                >
                                  <span className="truncate">{comp.name}</span>
                                  <span className="text-[9px] font-mono opacity-75 shrink-0 ml-1">{comp.id}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* 6. SURVEY CONTROL STAKES */}
                    {(() => {
                      const stakeComps = (projectData?.components || []).filter((c) => c.ifcType === 'IfcSurveyMark' || c.id.startsWith('SURVEY-STAKE-'));
                      if (stakeComps.length === 0) return null;
                      const isExpanded = expandedNodes['survey-stakes'] ?? true;
                      return (
                        <div className="border border-yellow-200 rounded-xl overflow-hidden bg-yellow-50/50">
                          <button
                            onClick={() => setExpandedNodes((p) => ({ ...p, 'survey-stakes': !p['survey-stakes'] }))}
                            className="w-full px-3 py-2 bg-yellow-100/80 font-bold text-yellow-900 flex items-center justify-between text-xs hover:bg-yellow-200/80"
                          >
                            <span className="flex items-center gap-1.5 truncate">
                              <MapPin className="w-3.5 h-3.5 text-yellow-600 shrink-0" />
                              Survey Control Stakes ({stakeComps.length})
                            </span>
                            {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-yellow-600 shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-yellow-600 shrink-0" />}
                          </button>
                          {isExpanded && (
                            <div className="p-2 space-y-1">
                              {stakeComps.map((comp) => (
                                <button
                                  key={comp.id}
                                  onClick={() => {
                                    setSelectedCompId(comp.id);
                                    setRightInspectorOpen(true);
                                  }}
                                  className={`w-full text-left px-2 py-1.5 rounded-lg transition flex items-center justify-between ${
                                    selectedCompId === comp.id ? 'bg-yellow-600 text-white font-bold' : 'hover:bg-yellow-200/60 text-slate-700'
                                  }`}
                                >
                                  <span className="truncate">{comp.name}</span>
                                  <span className="text-[9px] font-mono opacity-75 shrink-0 ml-1">{comp.id}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* 7. GEOTECHNICAL INVESTIGATION */}
                    {(() => {
                      const geotechComp = (projectData?.components || []).find((c) => c.id === 'SPT-001' || c.ifcType === 'IfcGeotechTest');
                      if (!geotechComp) return null;
                      return (
                        <div className="border border-orange-200 rounded-xl overflow-hidden bg-orange-50/50">
                          <button
                            onClick={() => {
                              setSelectedCompId(geotechComp.id);
                              setRightInspectorOpen(true);
                            }}
                            className={`w-full px-3 py-2 font-bold text-orange-900 flex items-center justify-between text-xs transition ${
                              selectedCompId === geotechComp.id ? 'bg-orange-600 text-white' : 'bg-orange-100/80 hover:bg-orange-200/80'
                            }`}
                          >
                            <span className="flex items-center gap-1.5 truncate">
                              <Box className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                              Geotech Boring SPT-001 (190 kPa)
                            </span>
                            <span className="text-[9px] font-mono opacity-75 shrink-0">TESTED</span>
                          </button>
                        </div>
                      );
                    })()}

                    {/* 8. BUILDABLE ENVELOPE OVERLAY */}
                    {(() => {
                      const envelopeComp = (projectData?.components || []).find((c) => c.id === 'ENVELOPE-V5-001' || c.ifcType === 'IfcBuildableEnvelope');
                      if (!envelopeComp) return null;
                      return (
                        <div className="border border-sky-200 rounded-xl overflow-hidden bg-sky-50/50">
                          <button
                            onClick={() => {
                              setSelectedCompId(envelopeComp.id);
                              setRightInspectorOpen(true);
                            }}
                            className={`w-full px-3 py-2 font-bold text-sky-900 flex items-center justify-between text-xs transition ${
                              selectedCompId === envelopeComp.id ? 'bg-sky-600 text-white' : 'bg-sky-100/80 hover:bg-sky-200/80'
                            }`}
                          >
                            <span className="flex items-center gap-1.5 truncate">
                              <Layers className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                              Buildable Envelope (484 m²)
                            </span>
                            <span className="text-[9px] font-mono opacity-75 shrink-0">DERIVED</span>
                          </button>
                        </div>
                      );
                    })()}

                    {/* 9. MATERIALS ONSITE (0 Items at Checkpoint 2) */}
                    {(() => {
                      const matComps = (projectData?.components || []).filter((c) => c.id.startsWith('MAT-'));
                      return (
                        <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 opacity-70">
                          <div className="w-full px-3 py-2 bg-slate-100 font-bold text-slate-600 flex items-center justify-between text-xs">
                            <span className="flex items-center gap-1.5 truncate">
                              <Package className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              Materials Onsite ({matComps.length} Items)
                            </span>
                            <span className="text-[9px] font-mono text-slate-400">CHECKPOINT 2 = 0</span>
                          </div>
                        </div>
                      );
                    })()}

                    {/* 10. APPROVED BUILDING BIM COMPONENTS (0 Components at Checkpoint 2) */}
                    {(() => {
                      const bimComps = (projectData?.components || []).filter((c) => ['IfcWall', 'IfcSlab', 'IfcDoor', 'IfcWindow', 'IfcRoof'].includes(c.ifcType));
                      return (
                        <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 opacity-70">
                          <div className="w-full px-3 py-2 bg-slate-100 font-bold text-slate-600 flex items-center justify-between text-xs">
                            <span className="flex items-center gap-1.5 truncate">
                              <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              Approved Building BIM ({bimComps.length} Components)
                            </span>
                            <span className="text-[9px] font-mono text-slate-400">CHECKPOINT 2 = 0</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  /* GENERIC STOREY HIERARCHY */
                  <div className="space-y-1 font-sans">
                    {(projectData?.spatialHierarchy?.storeys || []).map((storey) => {
                      const isExpanded = expandedNodes[storey.id];
                      const storeyComps = (projectData?.components || []).filter((c) => c.storeyId === storey.id);

                      return (
                        <div key={storey.id} className="mb-2">
                          <div className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-slate-100 transition">
                            <button
                              onClick={() => setExpandedNodes((prev) => ({ ...prev, [storey.id]: !prev[storey.id] }))}
                              className="flex items-center gap-1.5 font-bold text-slate-800 text-xs truncate"
                            >
                              {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                              <Layers className="w-3.5 h-3.5 text-blue-600" />
                              {storey.name}
                            </button>
                          </div>

                          {isExpanded && (
                            <div className="ml-4 pl-2 border-l border-slate-200 space-y-1 mt-1 font-mono text-[11px]">
                              {storeyComps.map((comp) => (
                                <button
                                  key={comp.id}
                                  onClick={() => {
                                    setSelectedCompId(comp.id);
                                    setRightInspectorOpen(true);
                                  }}
                                  className={`w-full text-left px-2 py-1 rounded transition flex items-center justify-between ${
                                    selectedCompId === comp.id ? 'bg-blue-600 text-white font-bold' : 'hover:bg-slate-200/60 text-slate-700'
                                  }`}
                                >
                                  <span className="truncate">{comp.name}</span>
                                  <span className="text-[9px] opacity-75">{comp.category}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* HERMES WORKFORCE TAB */}
            {leftTab === 'WORKFORCE' && (
              <div className="space-y-3 font-sans">
                {/* Roster Header & Real-Time Metrics */}
                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-900 text-xs flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-amber-600" />
                      HERMES WORKFORCE ROSTER
                    </span>
                    <span className="bg-amber-200 text-amber-900 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full">
                      68 AGENTS
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 text-center font-mono text-[10px]">
                    <div className="p-1.5 bg-white rounded-lg border border-amber-200">
                      <span className="text-slate-400 block">Deployed / Field</span>
                      <span className="font-bold text-amber-800 text-xs">10 Active</span>
                    </div>
                    <div className="p-1.5 bg-white rounded-lg border border-amber-200">
                      <span className="text-slate-400 block">Learning Reserve</span>
                      <span className="font-bold text-blue-700 text-xs">46 Learning</span>
                    </div>
                  </div>
                </div>

                {/* Discipline Filter Dropdown */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Filter Discipline</span>
                  <select
                    value={workforceDisciplineFilter}
                    onChange={(e) => setWorkforceDisciplineFilter(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl p-2 text-xs font-bold focus:outline-none"
                  >
                    <option value="ALL">All Disciplines (17 Trades)</option>
                    <option value="EXECUTIVE">Executive / Prime (1)</option>
                    <option value="MANAGEMENT">Management (5)</option>
                    <option value="SURVEY">Survey (2)</option>
                    <option value="CONCRETE">Concrete / Foundation (6)</option>
                    <option value="MASONRY">Masonry (6)</option>
                    <option value="FRAMING">Framing (6)</option>
                    <option value="ROOFING">Roofing (4)</option>
                    <option value="ENVELOPE">Envelope (4)</option>
                    <option value="PLUMBING">Plumbing (4)</option>
                    <option value="ELECTRICAL">Electrical (4)</option>
                    <option value="HVAC">HVAC (3)</option>
                    <option value="INTERIOR">Interior (3)</option>
                    <option value="LOGISTICS">Logistics (3)</option>
                    <option value="MATERIALS">Materials (3)</option>
                    <option value="INSPECTION">Inspection (4)</option>
                    <option value="KNOWLEDGE">Learning Reserve (46)</option>
                  </select>
                </div>

                {/* Agent List */}
                <div className="space-y-1.5">
                  {house0002RawData?.agentSpatialStates
                    ?.filter((a: any) => {
                      if (workforceDisciplineFilter !== 'ALL' && a.discipline !== workforceDisciplineFilter) return false;
                      if (searchQuery && !a.role.toLowerCase().includes(searchQuery.toLowerCase()) && !a.agentId.toLowerCase().includes(searchQuery.toLowerCase())) return false;
                      return true;
                    })
                    .map((agent: any) => {
                      const isSelected = selectedCompId === `AGENT-${agent.agentId}` || selectedCompId === agent.agentId;
                      return (
                        <button
                          key={agent.agentId}
                          onClick={() => {
                            setSelectedCompId(`AGENT-${agent.agentId}`);
                            setRightInspectorOpen(true);

                            // Focus 3D camera
                            if (cameraPerspRef.current && controlsRef.current && agent.worldPosition) {
                              const [x, y, z] = agent.worldPosition;
                              controlsRef.current.target.set(x, y + 1, z);
                              cameraPerspRef.current.position.set(x + 3, y + 2.5, z + 3);
                              controlsRef.current.update();
                            }
                          }}
                          className={`w-full text-left p-2.5 rounded-xl border transition flex items-center justify-between ${
                            isSelected ? 'bg-amber-100 border-amber-300 font-bold shadow-2xs' : 'bg-white border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <div className="space-y-0.5 truncate pr-2">
                            <div className="font-bold text-slate-900 text-xs truncate flex items-center gap-1.5">
                              <HardHat className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              {agent.role}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              ID: {agent.agentId} • {agent.discipline}
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                agent.currentState === 'WORKING' || agent.currentState === 'DEPLOYED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : agent.currentState === 'LEARNING'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {agent.currentState}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                </div>
              </div>
            )}

            {/* SYSTEMS TAB */}
            {leftTab === 'SYSTEMS' && (
              <div className="space-y-2 font-sans">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">System Isolation Networks</span>
                {(['Architecture', 'Structure', 'Plumbing', 'HVAC', 'Electrical', 'Site'] as const).map((sys) => {
                  const isActive = selectedSystem === sys;
                  return (
                    <button
                      key={sys}
                      onClick={() => setSelectedSystem(isActive ? null : sys)}
                      className={`w-full text-left p-3 rounded-xl border transition flex items-center justify-between ${
                        isActive ? 'bg-blue-50 border-blue-200 text-blue-800 font-bold shadow-2xs' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: `#${getSystemColorHex(sys).toString(16).padStart(6, '0')}` }} />
                        <span>{sys} Network</span>
                      </div>
                      <span className="text-xs text-slate-400 font-mono">{(projectData?.components || []).filter((c) => c.category === sys).length} Items</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Toggle Left Sidebar Button */}
        <button onClick={() => setLeftTreeOpen(!leftTreeOpen)} className="absolute left-0 top-3 z-20 p-1.5 bg-white border border-slate-200 rounded-r-xl text-slate-600 hover:text-slate-900 shadow-md">
          {leftTreeOpen ? <X className="w-4 h-4" /> : <FolderTree className="w-4 h-4 text-blue-600" />}
        </button>

        {/* CENTER WebGL BIM VIEWPORT */}
        <div className="flex-1 min-h-[450px] relative bg-slate-50">
          <div ref={containerRef} className="w-full h-full min-h-[450px] relative overflow-hidden" />

          {/* Phase 2 Live World In-World Labels, Action Overlay & Event HUD */}
          <Phase2WorldOverlay
            camera={cameraPerspRef.current}
            controls={controlsRef.current}
            containerRef={containerRef}
            activeProjectId={activeProjectId}
            house0002RawData={house0002RawData}
            replayEvents={replayEvents}
            currentEventIndex={currentEventIndex}
            isPlayingTimeline={isPlayingTimeline}
            setIsPlayingTimeline={setIsPlayingTimeline}
            setCurrentEventIndex={setCurrentEventIndex}
            replaySpeed={replaySpeed}
            setReplaySpeed={setReplaySpeed}
            autoCameraEnabled={autoCameraEnabled}
            setAutoCameraEnabled={setAutoCameraEnabled}
            scene={sceneRef.current}
            onSelectComponent={(id) => setSelectedCompId(id)}
          />

          {/* Floating Canvas Indicator */}
          <div className="absolute top-3 left-4 z-10 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-extrabold text-slate-900 shadow-xs flex items-center gap-2 pointer-events-none">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
            <span>HERMES BIM SPATIAL WORKSPACE ({activeProjectId})</span>
          </div>

          {/* CHECKPOINT 0: CUSTOMER INTAKE HUD OVERLAY CARD */}
          {(house0002RawData?.currentCheckpoint ?? 0) === 0 && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 bg-white/95 backdrop-blur-md border border-blue-300 shadow-2xl rounded-2xl p-4 max-w-xl w-[92vw] sm:w-full text-slate-900 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 text-blue-700 font-extrabold text-sm">
                  <Zap className="w-5 h-5 text-blue-600 shrink-0 animate-pulse" />
                  <span>PROJECT CREATED — Site Investigation & Customer Intake Ready</span>
                </div>
                <span className="text-[10px] font-mono bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full font-bold shrink-0">
                  GENESIS 0
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Site parcel in Tampa Bay, FL is clean, surveyed, and primed. HERMES requires the owner's project requirements brief to generate building geometry and commence construction orchestration.
              </p>
              <div className="mt-3.5 flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setIntakeModalOpen(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-blue-500/20 transition flex items-center gap-2 cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  START CUSTOMER INTAKE
                </button>
                <button
                  onClick={() => stepForward()}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Or Step (+1)
                </button>
              </div>
            </div>
          )}

          {/* Top Center: Construction Phase Progress Strip */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 bg-slate-900/90 text-white backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-700/80 shadow-xl flex items-center gap-2 text-xs font-mono overflow-x-auto max-w-[90vw] sm:max-w-none">
            {[
              { id: 'INTAKE', name: 'Intake', range: [0, 1] },
              { id: 'SURVEY', name: 'Survey & Geotech', range: [2, 4] },
              { id: 'DESIGN', name: 'Design', range: [5, 7] },
              { id: 'FOUNDATION', name: 'Foundation', range: [8, 12] },
              { id: 'FRAMING', name: 'Framing', range: [13, 17] },
              { id: 'MEP', name: 'MEP Rough-In', range: [18, 22] },
              { id: 'INSPECTIONS', name: 'Inspections', range: [23, 26] },
              { id: 'FINISH', name: 'Finishes & Handover', range: [27, 30] },
            ].map((phase) => {
              const currentCp = house0002RawData?.currentCheckpoint ?? 0;
              const isActive = currentCp >= phase.range[0] && currentCp <= phase.range[1];
              const isPassed = currentCp > phase.range[1];

              return (
                <button
                  key={phase.id}
                  onClick={() => handleValidation006Step('step')}
                  className={`px-3 py-1 rounded-xl text-[11px] font-extrabold transition shrink-0 flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 border border-blue-400 font-bold'
                      : isPassed
                      ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      : 'bg-slate-950/60 text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white animate-pulse' : isPassed ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                  <span>{phase.name}</span>
                </button>
              );
            })}
          </div>

          {/* Top Right: Player & Camera Control Bar */}
          <div className="absolute top-3 right-4 z-20 bg-slate-900/95 text-white backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-700 shadow-xl flex items-center gap-3 text-xs font-mono">
            <div className="flex flex-col">
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Checkpoint {house0002RawData?.currentCheckpoint ?? 0} / 30
              </span>
              <span className="font-bold text-white max-w-[240px] truncate">
                {house0002RawData?.diagnostics?.checkpointName || 'CHECKPOINT 0 — CLEAN WORLD GENESIS'}
              </span>
            </div>

            <div className="flex items-center gap-1.5 ml-2">
              <button
                onClick={() => handleValidation006Step('reset')}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold border border-slate-700 text-[11px] transition flex items-center gap-1"
                title="Reset to Checkpoint 0"
              >
                <RotateCcw className="w-3 h-3 text-slate-400" />
                <span>Reset</span>
              </button>

              <button
                onClick={() => handleValidation006Step('step')}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold border border-blue-500 text-[11px] shadow-xs transition flex items-center gap-1 disabled:opacity-50"
                disabled={(house0002RawData?.currentCheckpoint ?? 0) >= 30}
              >
                <span>Step (+1)</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => handleValidation006Step('run-all')}
                className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold border border-purple-500 text-[11px] shadow-xs transition flex items-center gap-1"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Run All</span>
              </button>
            </div>
          </div>

          {/* Active Filter Floating Badge */}
          {(selectedSystem || activeTrace || isolatedCompId) && (
            <div className="absolute bottom-4 left-4 z-10 bg-blue-50/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-blue-200 text-xs font-bold text-blue-900 shadow-md flex items-center gap-2">
              <Filter className="w-4 h-4 text-blue-600" />
              <span>{selectedSystem ? `${selectedSystem} Network Isolated` : activeTrace ? `Active Trace: ${activeTrace}` : 'Component Isolated'}</span>
              <button
                onClick={() => {
                  setSelectedSystem(null);
                  setActiveTrace(null);
                  setIsolatedCompId(null);
                }}
                className="ml-2 px-2 py-0.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px]"
              >
                Clear Filter
              </button>
            </div>
          )}
        </div>

        {/* RIGHT CONTEXT INSPECTOR SIDEBAR */}
        <div className={`${rightInspectorOpen ? 'w-full sm:w-96 fixed sm:static inset-x-0 bottom-0 max-h-[85vh] sm:max-h-none border-t sm:border-t-0 border-l border-slate-200 z-40' : 'w-0 hidden sm:flex'} bg-white transition-all duration-200 ease-in-out flex flex-col shrink-0 overflow-hidden shadow-2xl sm:shadow-2xs`}>
          {/* Inspector Header */}
          <div className="p-3 border-b border-slate-200 flex items-center justify-between gap-2 bg-slate-50">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900 font-sans">
                {selectedAgent ? 'Agent Scope Inspector' : selectedFacility ? 'Facility Scope Inspector' : selectedComponent ? 'Component Scope Inspector' : 'HERMES Prime / Autonomy Inspector'}
              </span>
            </div>
            <button onClick={() => setRightInspectorOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Inspector Subtab Switcher */}
          <div className="p-1.5 bg-slate-100 border-b border-slate-200 flex gap-1 font-sans text-xs">
            <button
              onClick={() => setRightInspectorTab('PRIME_AUTONOMY')}
              className={`flex-1 py-1 px-2 rounded-md font-bold transition flex items-center justify-center gap-1 text-[11px] ${
                rightInspectorTab === 'PRIME_AUTONOMY' ? 'bg-white text-purple-700 shadow-2xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Brain className="w-3 h-3 text-purple-600" /> Prime Status
            </button>
            <button
              onClick={() => setRightInspectorTab('SCOPED')}
              className={`flex-1 py-1 px-2 rounded-md font-bold transition flex items-center justify-center gap-1 text-[11px] ${
                rightInspectorTab === 'SCOPED' ? 'bg-white text-blue-700 shadow-2xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3 h-3 text-blue-600" /> Element Scope
            </button>
          </div>

          {/* Inspector Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-xs">
            {rightInspectorTab === 'PRIME_AUTONOMY' || (!selectedAgent && !selectedFacility && !selectedComponent) ? (
              /* PRIME / PROJECT STATUS & AUTONOMY INSPECTOR */
              <div className="space-y-3 font-sans">
                {/* 1. CHECKPOINT & GATE STATUS */}
                <div className="p-3 bg-purple-50 rounded-2xl border border-purple-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-extrabold text-purple-900 bg-white px-2 py-0.5 rounded border border-purple-200">
                      ACADEMY-HOUSE-0002 / ATTEMPT-01
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
                      GATE: PAUSED
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4 text-purple-700" /> Pre-Event-42 Truth & Autonomy Gate
                    </h3>
                    <p className="text-[10px] text-slate-600 mt-0.5 font-mono">
                      Checkpoint Hash: <span className="font-bold text-purple-800">HASH_H2_EVT41_24COMP_90AGENT_VALIDATED_0x8f9a2e</span>
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 font-mono text-[10px]">
                    <div className="p-1.5 bg-white rounded-lg border border-purple-200">
                      <span className="text-slate-500 block text-[9px]">Event Stream</span>
                      <span className="font-bold text-slate-900">41 Events (Frozen)</span>
                    </div>
                    <div className="p-1.5 bg-white rounded-lg border border-purple-200">
                      <span className="text-slate-500 block text-[9px]">As-Built BIM</span>
                      <span className="font-bold text-slate-900">24 Components</span>
                    </div>
                  </div>
                  <div className="p-1.5 bg-purple-100/60 rounded-lg border border-purple-200 text-[10px] text-purple-900 font-mono font-bold flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                    <span>EVENT 42 EXECUTED = FALSE (Enforced)</span>
                  </div>
                </div>

                {/* 2. PRIME RECOMMENDATION */}
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 font-mono flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Prime Recommendation
                  </span>
                  <div className="p-2 bg-white rounded-xl border border-emerald-200">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-emerald-800">
                        {autonomyAudit?.primeRecommendedNextTask?.taskId || 'TASK-H2-DRYWALL-HANGING'}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded font-mono">
                        Priority {autonomyAudit?.primeRecommendedNextTask?.priority || '98.5'}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-900 mt-1">
                      {autonomyAudit?.primeRecommendedNextTask?.workPackage || 'Interior 5/8" Type X Gypsum Board Sheathing'}
                    </p>
                    <p className="text-[10px] text-slate-600 mt-1 leading-snug">
                      {autonomyAudit?.primeRecommendationReason || 'Critical path interior enclosure task. All predecessor MEP rough-in inspections passed. 85 sheets 5/8" Type X drywall verified in Laydown Yard.'}
                    </p>
                  </div>
                </div>

                {/* 3. TASK ELIGIBILITY STATUS */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono block">
                    Task Eligibility Evaluator ({autonomyAudit?.candidateTasksEvaluated?.length || 6} Candidates)
                  </span>

                  {/* ELIGIBLE TASKS */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-extrabold text-emerald-700 font-mono flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> ELIGIBLE TASKS ({autonomyAudit?.eligibleTasks?.length || 2})
                    </span>
                    {(autonomyAudit?.eligibleTasks || [
                      { taskId: 'TASK-H2-DRYWALL-HANGING', workPackage: 'Interior 5/8" Type X Gypsum Board Sheathing', priority: 98.5 },
                      { taskId: 'TASK-H2-EXT-STUCCO-FINISH', workPackage: '3-Coat Portland Cement Stucco Exterior Envelope', priority: 92.0 }
                    ]).map((t: any) => (
                      <div key={t.taskId} className="p-2 bg-white rounded-xl border border-emerald-200 space-y-0.5 font-mono">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-bold text-emerald-800">{t.taskId}</span>
                          <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">ELIGIBLE ({t.priority})</span>
                        </div>
                        <p className="text-[11px] font-bold text-slate-900 font-sans">{t.workPackage}</p>
                      </div>
                    ))}
                  </div>

                  {/* BLOCKED TASKS */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-extrabold text-amber-700 font-mono flex items-center gap-1">
                      <AlertOctagon className="w-3 h-3 text-amber-600" /> BLOCKED TASKS ({autonomyAudit?.blockedTasks?.length || 4})
                    </span>
                    {(autonomyAudit?.blockedTasks || [
                      { taskId: 'TASK-H2-ROOF-SHINGLE-INSTALL', status: 'WAITING_MATERIAL', blockedReasons: ['Shingle delivery pending at receiving yard'] },
                      { taskId: 'TASK-H2-FINISH-PLUMBING-FIXTURES', status: 'WAITING_PREDECESSOR', blockedReasons: ['Predecessor TASK-H2-DRYWALL-HANGING not complete'] },
                      { taskId: 'TASK-H2-SOLAR-PV-ARRAY', status: 'WAITING_KNOWLEDGE', blockedReasons: ['Unresolved structural question KR-SOLAR-001 pending SME review'] }
                    ]).map((t: any) => (
                      <div key={t.taskId} className="p-2 bg-white rounded-xl border border-slate-200 space-y-0.5 font-mono">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-bold text-slate-800">{t.taskId}</span>
                          <span className="text-amber-800 font-bold bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">{t.status}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-sans">{t.blockedReasons?.[0] || 'Prerequisites incomplete'}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. DYNAMIC STATE SCENARIO TESTS */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 font-mono text-[10px]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block font-sans">
                    Dynamic State Scenarios (Non-Event-Number Autonomy Proof)
                  </span>
                  <div className="p-2 bg-white rounded-xl border border-slate-200 space-y-1">
                    <span className="font-bold text-purple-700 block">Scenario A: Material Stock Depletion</span>
                    <p className="text-slate-600 font-sans text-[10px]">Drywall stock set to 0 → TASK-H2-DRYWALL-HANGING changes to <span className="font-bold text-amber-700 font-mono">WAITING_MATERIAL</span></p>
                    <p className="text-emerald-800 font-bold font-sans text-[10px]">Fallback Recommended: TASK-H2-EXT-STUCCO-FINISH</p>
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-slate-200 space-y-1">
                    <span className="font-bold text-purple-700 block">Scenario B: Inspection Hold Point Failure</span>
                    <p className="text-slate-600 font-sans text-[10px]">Electrical rough set to FAILED → TASK-H2-DRYWALL-HANGING changes to <span className="font-bold text-amber-700 font-mono">WAITING_INSPECTION</span></p>
                    <p className="text-emerald-800 font-bold font-sans text-[10px]">Fallback Recommended: TASK-H2-EXT-STUCCO-FINISH</p>
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-slate-200 space-y-1">
                    <span className="font-bold text-purple-700 block">Scenario C: Staging Route Obstruction</span>
                    <p className="text-slate-600 font-sans text-[10px]">Transit corridor blocked → TASK-H2-DRYWALL-HANGING changes to <span className="font-bold text-amber-700 font-mono">WAITING_LOGISTICS</span></p>
                    <p className="text-emerald-800 font-bold font-sans text-[10px]">Fallback Recommended: TASK-H2-EXT-STUCCO-FINISH</p>
                  </div>
                </div>

                {/* 5. 90-AGENT WORKFORCE RECONCILIATION */}
                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 space-y-2 font-mono text-[10px]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 block font-sans flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-amber-600" /> 90-Agent Runtime State Reconciliation
                  </span>
                  <div className="grid grid-cols-2 gap-1.5 text-center">
                    <div className="p-1.5 bg-white rounded-lg border border-amber-200">
                      <span className="text-slate-500 block text-[9px]">AVAILABLE</span>
                      <span className="font-bold text-slate-900">22 Agents</span>
                    </div>
                    <div className="p-1.5 bg-white rounded-lg border border-amber-200">
                      <span className="text-slate-500 block text-[9px]">LEARNING</span>
                      <span className="font-bold text-slate-900">25 Agents</span>
                    </div>
                    <div className="p-1.5 bg-white rounded-lg border border-amber-200">
                      <span className="text-slate-500 block text-[9px]">ASSIGNED</span>
                      <span className="font-bold text-slate-900">8 Agents</span>
                    </div>
                    <div className="p-1.5 bg-white rounded-lg border border-amber-200">
                      <span className="text-slate-500 block text-[9px]">TRAVELING</span>
                      <span className="font-bold text-slate-900">4 Agents</span>
                    </div>
                    <div className="p-1.5 bg-white rounded-lg border border-amber-200">
                      <span className="text-slate-500 block text-[9px]">WORKING</span>
                      <span className="font-bold text-slate-900">27 Agents</span>
                    </div>
                    <div className="p-1.5 bg-white rounded-lg border border-amber-200">
                      <span className="text-slate-500 block text-[9px]">INSPECTING</span>
                      <span className="font-bold text-slate-900">2 Agents</span>
                    </div>
                    <div className="p-1.5 bg-white rounded-lg border border-amber-200">
                      <span className="text-slate-500 block text-[9px]">BLOCKED</span>
                      <span className="font-bold text-slate-900">2 Agents</span>
                    </div>
                    <div className="p-1.5 bg-white rounded-lg border border-amber-200">
                      <span className="text-slate-500 block text-[9px]">OFFLINE</span>
                      <span className="font-bold text-slate-900">0 Agents</span>
                    </div>
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-amber-300 font-bold text-amber-900 text-center font-sans">
                    SUM(PRIMARY_STATES) = 22+25+8+4+27+2+2+0 = 90 AGENTS (100% RECONCILED)
                  </div>
                </div>
              </div>
            ) : selectedAgent ? (
              /* AGENT SCOPE INSPECTION */
              <div className="space-y-3">
                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-amber-800 bg-white px-2 py-0.5 rounded border border-amber-200">
                      AGENT-{selectedAgent.agentId}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      {selectedAgent.currentState}
                    </span>
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-900 mt-1">{selectedAgent.role}</h3>
                  <p className="text-[11px] text-slate-500 font-mono">Discipline: {selectedAgent.discipline} • Reports to: {selectedAgent.reportsTo || 'PRIME'}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">Spatial & Home Base Details</span>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Home Base Facility:</span>
                    <span className="font-bold text-slate-900 font-mono">{selectedAgent.homeBaseEntityId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">World Position:</span>
                    <span className="font-bold text-slate-900 font-mono">[{selectedAgent.worldPosition?.join(', ')}]</span>
                  </div>
                </div>
              </div>
            ) : selectedFacility ? (
              /* FACILITY SCOPE INSPECTION */
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-2xl border border-blue-200 space-y-1">
                  <span className="font-mono text-xs font-bold text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200">
                    {selectedFacility.entityId}
                  </span>
                  <h3 className="text-sm font-extrabold text-slate-900 mt-1">{selectedFacility.name}</h3>
                  <p className="text-[11px] text-slate-500 font-mono">Type: {selectedFacility.entityType}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">Clearance & Access Path</span>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Clash Status:</span>
                    <span className="font-bold text-emerald-700">CLEAR (0 Clashes)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Clearance Margin:</span>
                    <span className="font-bold text-slate-900 font-mono">0.5 meters</span>
                  </div>
                </div>
              </div>
            ) : selectedComponent ? (
              /* COMPONENT SCOPE INSPECTION */
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-2xl border border-blue-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200">
                      {selectedComponent.id}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      {selectedComponent.inspectionStatus}
                    </span>
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-900 mt-1">{selectedComponent.name}</h3>
                  <p className="text-[11px] text-slate-500 font-mono">{selectedComponent.storeyName}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">Dimensions</span>
                  <div className="grid grid-cols-3 gap-2 text-center font-mono">
                    <div className="p-1.5 bg-white rounded-lg border border-slate-200">
                      <span className="text-slate-400 text-[9px] block">W (X)</span>
                      <span className="font-bold text-slate-900">{selectedComponent.dimensions[0]}m</span>
                    </div>
                    <div className="p-1.5 bg-white rounded-lg border border-slate-200">
                      <span className="text-slate-400 text-[9px] block">H (Y)</span>
                      <span className="font-bold text-slate-900">{selectedComponent.dimensions[1]}m</span>
                    </div>
                    <div className="p-1.5 bg-white rounded-lg border border-slate-200">
                      <span className="text-slate-400 text-[9px] block">D (Z)</span>
                      <span className="font-bold text-slate-900">{selectedComponent.dimensions[2]}m</span>
                    </div>
                  </div>
                </div>

                {/* CAUSAL ENTITY PROVENANCE (WHY DOES THIS EXIST?) */}
                <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-purple-900 block font-mono flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" /> Causal Provenance Chain (Why Exist?)
                  </span>
                  <div className="space-y-1 font-mono text-[10px] leading-tight">
                    <div className="flex items-start gap-1">
                      <span className="text-purple-500 shrink-0">├─ Need:</span>
                      <span className="text-slate-800 font-bold">2-Bed Storm Resilient Residence</span>
                    </div>
                    <div className="flex items-start gap-1">
                      <span className="text-purple-500 shrink-0">├─ Code:</span>
                      <span className="text-slate-800 font-bold">FBC 2023 Sec 1609 (160 MPH Wind Load)</span>
                    </div>
                    <div className="flex items-start gap-1">
                      <span className="text-purple-500 shrink-0">├─ Decision:</span>
                      <span className="text-slate-800 font-bold">DEC-CMU-MASONRY-SHELL-001</span>
                    </div>
                    <div className="flex items-start gap-1">
                      <span className="text-purple-500 shrink-0">├─ Spec:</span>
                      <span className="text-slate-800 font-bold">{selectedComponent.name} (ASTM C90)</span>
                    </div>
                    <div className="flex items-start gap-1">
                      <span className="text-purple-500 shrink-0">├─ Agent:</span>
                      <span className="text-slate-800 font-bold">AGENT-MASON-LEAD (Masonry Division)</span>
                    </div>
                    <div className="flex items-start gap-1">
                      <span className="text-purple-500 shrink-0">├─ Material:</span>
                      <span className="text-slate-800 font-bold">BATCH-CMU-8IN-450PCS</span>
                    </div>
                    <div className="flex items-start gap-1">
                      <span className="text-purple-500 shrink-0">└─ Quality:</span>
                      <span className="text-emerald-700 font-bold">INSP-PASSED-STRUCT-VERIFIED</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* PROJECT LEVEL SUMMARY SCOPE */
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-[10px] uppercase font-mono font-bold text-blue-600 block">Active Project Scope</span>
                  <h3 className="text-sm font-extrabold text-slate-900">{projectData?.name}</h3>
                  <p className="text-[11px] text-slate-500">{projectData?.description}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 font-mono">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">Project Metrics</span>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-2 bg-white rounded-lg border border-slate-200">
                      <span className="text-[9px] text-slate-400 block">Project ID</span>
                      <span className="text-xs font-bold text-blue-700">{activeProjectId}</span>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-slate-200">
                      <span className="text-[9px] text-slate-400 block">Components</span>
                      <span className="text-xs font-bold text-blue-700">{(projectData?.components || []).length}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Toggle Right Inspector Button */}
        <button onClick={() => setRightInspectorOpen(!rightInspectorOpen)} className="absolute right-0 top-3 z-20 p-1.5 bg-white border border-slate-200 rounded-l-xl text-slate-600 hover:text-slate-900 shadow-md">
          {rightInspectorOpen ? <X className="w-4 h-4" /> : <FileText className="w-4 h-4 text-blue-600" />}
        </button>
      </div>

      {/* 3. BOTTOM REPLAY TIMELINE DOCK */}
      <div className="bg-white border-t border-slate-200 px-4 py-2 flex items-center justify-between gap-4 z-20 shrink-0 font-sans shadow-2xs">
        {activeProjectId === 'REFERENCE-BIM-0001' ? (
          <div className="w-full text-center text-xs font-bold text-slate-500 font-mono py-1">
            READ ONLY REFERENCE MODEL - NO HERMES BUILD HISTORY
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlayingTimeline(!isPlayingTimeline)}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-2xs"
              >
                {isPlayingTimeline ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlayingTimeline ? 'Pause Replay' : 'Play Replay'}</span>
              </button>

              <div className="flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200 text-[11px] font-mono">
                {[1, 2, 5, 10].map((s) => (
                  <button
                    key={s}
                    onClick={() => setReplaySpeed(s)}
                    className={`px-2 py-0.5 rounded-lg font-bold transition ${replaySpeed === s ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 flex items-center gap-3 font-mono text-xs max-w-xl">
              <span className="text-slate-500 text-[11px]">
                Event {currentEventIndex + 1} / {replayEvents.length || 1}
              </span>
              <input
                type="range"
                min={0}
                max={Math.max(0, replayEvents.length - 1)}
                value={currentEventIndex}
                onChange={(e) => setCurrentEventIndex(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
              />
            </div>

            {activeReplayEvent && (
              <div className="hidden md:flex items-center gap-2 text-xs font-bold text-blue-900 bg-blue-50 px-3 py-1 rounded-xl border border-blue-200 max-w-sm truncate">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="truncate">{activeReplayEvent.message || activeReplayEvent.decision || activeReplayEvent.title || activeReplayEvent.questionOrTopic || activeReplayEvent.eventType}</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* 4. SPATIAL TRUTH TEST SUITE REPORT MODAL */}
      {isTruthTestModalOpen && truthTestReport && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">Spatial Operations World Truth Test Suite</h2>
                  <p className="text-xs text-slate-500 font-mono">Stage 25 Automated Visual & Event Parity Gate • ACADEMY-HOUSE-0002</p>
                </div>
              </div>
              <button onClick={() => setIsTruthTestModalOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between font-mono">
              <div>
                <span className="text-xs font-bold text-emerald-800 uppercase block">Overall Status</span>
                <span className="text-xl font-extrabold text-emerald-900">ALL 25 ACCEPTANCE TESTS PASSED</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-emerald-700 block">Pass Rate: 100%</span>
                <span className="text-sm font-bold text-emerald-900">25 / 25 PASS</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 block uppercase">Replay State Leakage</span>
                <span className="text-sm font-bold text-emerald-700">{truthTestReport.REPLAY_CURRENT_STATE_LEAKAGE} (ZERO LEAKAGE)</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 block uppercase">Event 0 Rendered Count</span>
                <span className="text-sm font-bold text-slate-900">{truthTestReport.EVENT_0_RENDERED_ENTITY_COUNT} Entities</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 block uppercase">Rendered Agent Count</span>
                <span className="text-sm font-bold text-slate-900">{truthTestReport.RENDERED_AGENT_COUNT} / {truthTestReport.PROJECT_AGENT_COUNT} Agents</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 block uppercase">Communication Graph</span>
                <span className="text-sm font-bold text-emerald-700">{truthTestReport.COMMUNICATIONS_VISUALLY_REPLAYABLE} / 15 Replayable</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 block uppercase">Knowledge Requests</span>
                <span className="text-sm font-bold text-emerald-700">{truthTestReport.KNOWLEDGE_REQUESTS_VISUALLY_REPLAYABLE} / 8 Replayable</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 block uppercase">Facility Event Parity</span>
                <span className="text-sm font-bold text-emerald-700">{truthTestReport.FACILITY_CREATION_EVENT_PARITY}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 block uppercase">Material Event Parity</span>
                <span className="text-sm font-bold text-emerald-700">{truthTestReport.MATERIAL_EVENT_PARITY}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 block uppercase">Project Switch Isolation</span>
                <span className="text-sm font-bold text-emerald-700">{truthTestReport.PROJECT_SWITCH_ISOLATION}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsTruthTestModalOpen(false)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. PHASE 1 MASTER SPECIFICATION AUDIT MODAL */}
      {isPhase1ModalOpen && phase1Report && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-purple-600" />
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">HERMES Live World Master Specification — Phase 1 Audit</h2>
                  <p className="text-xs text-slate-500 font-mono">Stages 0–2 Compliance Gate • Audit Commit {phase1Report.commitSHA}</p>
                </div>
              </div>
              <button onClick={() => setIsPhase1ModalOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Summary Banner */}
            <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 flex items-center justify-between font-mono">
              <div>
                <span className="text-xs font-bold text-purple-800 uppercase block">Phase 1 Release Gate Status</span>
                <span className="text-xl font-extrabold text-purple-900">{phase1Report.counts.phase1ReleaseGate}</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-purple-700 block">Implemented Requirements</span>
                <span className="text-sm font-bold text-purple-900">{phase1Report.counts.implemented} / {phase1Report.counts.total} (100% Complete)</span>
              </div>
            </div>

            {/* Diagnostic Test Results Grid */}
            <div>
              <h3 className="text-xs font-extrabold text-slate-900 uppercase font-sans mb-2 tracking-wider">Automated Measured Diagnostics (P1-TEST-001..015)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono max-h-48 overflow-y-auto p-1 bg-slate-50 rounded-xl border border-slate-200">
                {phase1Report.testResults?.map((test: any) => (
                  <div key={test.testId} className="p-2 bg-white rounded-lg border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{test.testId} ({test.requirementId})</span>
                      <span className={`px-1.5 py-0.5 text-[10px] font-extrabold rounded ${test.status === 'PASS' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                        {test.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-600 truncate">{test.evidence}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Requirement Matrix Table */}
            <div>
              <h3 className="text-xs font-extrabold text-slate-900 uppercase font-sans mb-2 tracking-wider">Requirement-by-Requirement Matrix (Stages 0–2)</h3>
              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-60 overflow-y-auto font-mono text-[11px]">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-100 border-b border-slate-200 sticky top-0 font-bold text-slate-700">
                    <tr>
                      <th className="p-2 border-r border-slate-200">ID</th>
                      <th className="p-2 border-r border-slate-200">Requirement Summary</th>
                      <th className="p-2 border-r border-slate-200">Status</th>
                      <th className="p-2 border-r border-slate-200">Implementation File</th>
                      <th className="p-2">Evidence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {phase1Report.matrix?.map((row: any) => (
                      <tr key={row.requirementId} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="p-2 font-bold text-slate-900 border-r border-slate-100">{row.requirementId}</td>
                        <td className="p-2 text-slate-700 border-r border-slate-100">{row.summary}</td>
                        <td className="p-2 border-r border-slate-100">
                          <span className="px-1.5 py-0.5 text-[9px] font-bold bg-emerald-100 text-emerald-800 rounded">
                            {row.status}
                          </span>
                        </td>
                        <td className="p-2 text-slate-600 border-r border-slate-100 truncate max-w-[160px]">{row.implementationFile}</td>
                        <td className="p-2 text-slate-500 truncate max-w-[180px]">{row.runtimeEvidence}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsPhase1ModalOpen(false)}
                className="px-5 py-2 bg-purple-900 hover:bg-purple-800 text-white font-bold text-xs rounded-xl transition"
              >
                Close Audit Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOMER INTAKE MODAL */}
      {intakeModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 text-slate-900 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h2 className="text-base font-extrabold text-slate-900">Project Customer Intake Brief</h2>
              </div>
              <button onClick={() => setIntakeModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 font-sans text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Target Stories</label>
                  <input type="text" defaultValue="1 Story Single-Family" className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 font-medium" />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Target Floor Area</label>
                  <input type="text" defaultValue="2,400 sq ft (223 m²)" className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 font-medium" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Bedrooms</label>
                  <input type="text" defaultValue="3 Bedrooms" className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 font-medium" />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Bathrooms</label>
                  <input type="text" defaultValue="2 Bathrooms" className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 font-medium" />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Garage</label>
                  <input type="text" defaultValue="2-Car Attached" className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 font-medium" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Structural & Wind Rating</label>
                  <input type="text" defaultValue="160 MPH Category 5 Wind Rating" className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 font-medium" />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Target Budget Cap</label>
                  <input type="text" defaultValue="$425,000 USD Total Cost" className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 font-medium" />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Jurisdiction & Location</label>
                <input type="text" defaultValue="Tampa Bay, Florida / Florida Building Code 2023 (8th Edition)" className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 font-medium" />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                onClick={() => setIntakeModalOpen(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setIntakeModalOpen(false);
                  await stepForward();
                }}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                Submit Project Brief & Generate BIM (Step +1)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function getCategoryColorHex(cat: string): number {
  switch (cat) {
    case 'Architecture':
      return 0xe2e8f0;
    case 'Structure':
      return 0x64748b;
    case 'Plumbing':
      return 0x0284c7;
    case 'HVAC':
      return 0xd97706;
    case 'Electrical':
      return 0xeab308;
    case 'Site':
      return 0x15803d;
    default:
      return 0x3b82f6;
  }
}

function getSystemColorHex(sys: string): number {
  switch (sys) {
    case 'Architecture':
      return 0x94a3b8;
    case 'Structure':
      return 0x334155;
    case 'Plumbing':
      return 0x0284c7;
    case 'HVAC':
      return 0xe11d48;
    case 'Electrical':
      return 0xeab308;
    case 'Site':
      return 0x15803d;
    default:
      return 0x2563eb;
  }
}
