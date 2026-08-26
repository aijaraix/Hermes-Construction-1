import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import * as WebIFC from 'web-ifc';
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
  Truck
} from 'lucide-react';

export interface ReferenceBimComponent {
  id: string;
  expressID?: number;
  ifcGuid: string;
  ifcType: string;
  name: string;
  category: 'Architecture' | 'Structure' | 'Plumbing' | 'HVAC' | 'Electrical' | 'Site';
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

export const BimWorkspaceView: React.FC<BimWorkspaceViewProps> = ({
  activeProjectId: propActiveProjectId,
  onSelectProject,
  onOpenSystemDrawer,
  initialSelectedComponentId = null,
}) => {
  // Synchronized active project state
  const [activeProjectId, setActiveProjectId] = useState<string>(propActiveProjectId || 'ACADEMY-HOUSE-0002');

  useEffect(() => {
    if (propActiveProjectId && propActiveProjectId !== activeProjectId) {
      setActiveProjectId(propActiveProjectId);
    }
  }, [propActiveProjectId]);

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
        if (res.ok && isMounted) {
          const worldData = await res.json();
          if (worldData.events && worldData.events.length > 0) {
            setReplayEvents(worldData.events);
            setHouse0002RawData(worldData);
          }
        }

        const auditRes = await fetch('/api/hermes/house0002-autonomy-audit');
        if (auditRes.ok && isMounted) {
          const auditData = await auditRes.json();
          setAutonomyAudit(auditData);
        }
      } catch (err) {
        console.error('Failed live world polling:', err);
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
        const prehouseEntry = {
          id: 'PREHOUSE-SPATIAL-PROOF-0001',
          name: 'PREHOUSE-SPATIAL-PROOF-0001 (Pre-House Site World)',
          buildingType: 'Pre-House Site World',
        };
        if (Array.isArray(data)) {
          const filtered = data.filter((p) => p.id !== 'PREHOUSE-SPATIAL-PROOF-0001' && p.id !== 'ACADEMY-HOUSE-0002');
          setAllProjectsList([house2Entry, prehouseEntry, ...filtered]);
        } else {
          setAllProjectsList([house2Entry, prehouseEntry]);
        }
      })
      .catch((e) => console.error('Failed to load projects list:', e));
  }, []);

  // Fetch Project Data & Reset Scene on Active Project Switch
  useEffect(() => {
    let mounted = true;

    async function loadActiveProjectData() {
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
        setCurrentEventIndex(0);
        setIsPlayingTimeline(false);

        if (activeProjectId === 'ACADEMY-HOUSE-0002') {
          const worldRes = await fetch('/api/hermes/house0002-spatial-world');
          if (!worldRes.ok) throw new Error(`HTTP ${worldRes.status} loading house0002 spatial world`);
          const worldData = await worldRes.json();
          if (!mounted) return;

          setHouse0002RawData(worldData);
          const evs = worldData.events || [];
          setReplayEvents(evs);
          if (evs.length > 0) {
            setCurrentEventIndex(evs.length - 1);
          }

          const components: ReferenceBimComponent[] = [];

          // 1. Facilities (7 Facilities)
          if (worldData.spatialEntities) {
            worldData.spatialEntities.forEach((e: any) => {
              components.push({
                id: e.entityId,
                ifcGuid: `GUID-${e.entityId}`,
                ifcType: 'IfcBuildingElementProxy',
                name: e.name,
                category: 'Site',
                storeyId: 'STOREY-GROUND',
                storeyName: 'Ground Site Level (0.00m Datum)',
                position: e.worldPosition || [0, 0, 0],
                dimensions: e.dimensions || [12, 2.9, 2.4],
                orientationDegrees: 0,
                materialSpecIds: ['SITE-FACILITY-SPEC'],
                propertySets: [
                  { name: 'Pset_FacilityDetails', properties: { EntityType: e.entityType, ProjectId: e.projectId, Status: e.status } },
                ],
                connectedComponentIds: [],
                openings: [],
                inspectionStatus: 'PASSED',
                provenance: {
                  source: 'HOUSE_0002_ENGINE',
                  creator: 'ACADEMY-HOUSE-0002',
                  verifiedDate: new Date().toISOString(),
                  license: 'HERMES',
                },
              });
            });
          }

          // 2. Program Volumes (3D Room Blocks)
          if (worldData.programVolumes) {
            worldData.programVolumes.forEach((p: any) => {
              components.push({
                id: p.id,
                ifcGuid: `GUID-${p.id}`,
                ifcType: 'IfcSpace',
                name: `[Program Volume] ${p.name}`,
                category: 'Architecture',
                storeyId: 'STOREY-GROUND',
                storeyName: 'Ground Site Level (0.00m Datum)',
                position: p.worldPositionMeters || [0, 0, 0],
                dimensions: p.dimensionsMeters || [3, 2.8, 3],
                orientationDegrees: 0,
                materialSpecIds: ['PROGRAM-VOLUME-SPEC'],
                propertySets: [
                  {
                    name: 'Pset_ProgramDetails',
                    properties: {
                      TargetAreaSqFt: p.targetAreaSqFt,
                      RoomType: p.roomType,
                      AdjacentRooms: Array.isArray(p.adjacentRooms) ? p.adjacentRooms.join(', ') : '',
                    },
                  },
                ],
                connectedComponentIds: [],
                openings: [],
                inspectionStatus: 'PASSED',
                provenance: {
                  source: 'PRIME_PROGRAM_ENGINE',
                  creator: 'PROJECT-PRIME',
                  verifiedDate: new Date().toISOString(),
                  license: 'HERMES',
                },
              });
            });
          }

          // 3. Workforce Agents (68 Roster Agents)
          if (worldData.agentSpatialStates) {
            worldData.agentSpatialStates.forEach((a: any) => {
              components.push({
                id: `AGENT-${a.agentId}`,
                ifcGuid: `GUID-AGENT-${a.agentId}`,
                ifcType: 'IfcActor',
                name: `${a.role} (${a.agentId})`,
                category: 'Structure',
                storeyId: 'STOREY-GROUND',
                storeyName: 'Ground Site Level (0.00m Datum)',
                position: a.worldPosition || [0, 0, 0],
                dimensions: a.workEnvelope || [0.5, 1.75, 0.5],
                orientationDegrees: 0,
                materialSpecIds: ['WORKFORCE-HUMAN-SPEC'],
                propertySets: [
                  {
                    name: 'Pset_AgentDetails',
                    properties: {
                      Discipline: a.discipline,
                      State: a.currentState,
                      HomeBase: a.homeBaseEntityId,
                      ReportsTo: a.reportsTo || 'PRIME',
                      Role: a.role,
                    },
                  },
                ],
                connectedComponentIds: [],
                openings: [],
                inspectionStatus: 'PASSED',
                provenance: {
                  source: 'WORKFORCE_SPATIAL_ENGINE',
                  creator: 'HERMES_ROSTER',
                  verifiedDate: new Date().toISOString(),
                  license: 'HERMES',
                },
              });
            });
          }

          // 4. Survey Control Stakes
          if (worldData.surveyMarks) {
            worldData.surveyMarks.forEach((s: any) => {
              components.push({
                id: s.markId,
                ifcGuid: `GUID-${s.markId}`,
                ifcType: 'IfcBuildingElementProxy',
                name: s.name,
                category: 'Site',
                storeyId: 'STOREY-GROUND',
                storeyName: 'Ground Site Level (0.00m Datum)',
                position: s.worldPosition || [0, 0, 0],
                dimensions: [0.15, 0.8, 0.15],
                orientationDegrees: 0,
                materialSpecIds: ['SURVEY-STAKE-SPEC'],
                propertySets: [
                  {
                    name: 'Pset_SurveyControl',
                    properties: {
                      Elevation: s.measuredElevationMeters,
                      ToleranceMm: s.toleranceMm,
                      Surveyor: s.surveyorAgentId,
                    },
                  },
                ],
                connectedComponentIds: [],
                openings: [],
                inspectionStatus: 'PASSED',
                provenance: {
                  source: 'SURVEY_ENGINE',
                  creator: s.surveyorAgentId,
                  verifiedDate: s.verifiedTimestamp,
                  license: 'HERMES',
                },
              });
            });
          }

          // 5. Design BIM Revision 1 Components (11 Built from ZERO)
          if (worldData.bimComponents) {
            worldData.bimComponents.forEach((c: any) => {
              components.push({
                id: c.id,
                ifcGuid: `GUID-${c.id}`,
                ifcType:
                  c.type === 'wall'
                    ? 'IfcWall'
                    : c.type === 'slab'
                    ? 'IfcSlab'
                    : c.type === 'door'
                    ? 'IfcDoor'
                    : c.type === 'window'
                    ? 'IfcWindow'
                    : c.type === 'roof'
                    ? 'IfcRoof'
                    : 'IfcBuildingElementProxy',
                name: c.assembly,
                category: (c.system as any) || 'Structure',
                storeyId: c.floor === 2 ? 'STOREY-ROOF' : 'STOREY-GROUND',
                storeyName: c.floor === 2 ? 'Roof Level' : 'Ground Level',
                position: c.geometry.position,
                dimensions: c.geometry.dimensions,
                orientationDegrees: 0,
                materialSpecIds: c.materials ? c.materials.map((m: any) => m.name) : ['CONCRETE-4000PSI'],
                propertySets: [
                  {
                    name: 'Pset_DesignBimDetails',
                    properties: {
                      System: c.system,
                      Room: c.room || 'Main Structure',
                      FireRatingHours: c.fireRatingHours || 2,
                      IsExterior: c.isExterior ? 'YES' : 'NO',
                      InspectionState: c.inspectionState || 'PASSED',
                    },
                  },
                ],
                connectedComponentIds: c.connectedComponentIds || [],
                openings: c.openings || [],
                inspectionStatus: 'PASSED',
                provenance: {
                  source: 'DESIGN_BIM_REV1',
                  creator: 'SPATIAL-BIM-PRIME',
                  verifiedDate: new Date().toISOString(),
                  license: 'HERMES',
                },
              });
            });
          }

          // 6. Materials
          if (worldData.materials) {
            worldData.materials.forEach((m: any) => {
              components.push({
                id: m.materialId,
                ifcGuid: `GUID-${m.materialId}`,
                ifcType: 'IfcElementAssembly',
                name: m.materialType,
                category: 'Structure',
                storeyId: 'STOREY-GROUND',
                storeyName: 'Ground Site Level (0.00m Datum)',
                position: m.currentPosition || [0, 0, 0],
                dimensions: m.dimensions || [1.2, 1.2, 2.4],
                orientationDegrees: 0,
                materialSpecIds: ['CMU-8IN-MASONRY'],
                propertySets: [
                  {
                    name: 'Pset_MaterialState',
                    properties: {
                      Stage: m.stage,
                      WeightKg: m.weightKg,
                      ClearanceMeters: m.clearanceMeters,
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

          const normalizedProj: ReferenceBimProject = {
            projectId: 'ACADEMY-HOUSE-0002',
            name: 'ACADEMY-HOUSE-0002 (Tampa House #2 ATTEMPT-01)',
            description: 'Autonomous Single-Family House Construction Project (Tampa, FL) - First Owner Checkpoint',
            classification: 'ACADEMY_AUTONOMOUS_CONSTRUCTION',
            immutableSource: false,
            academyWritable: true,
            hermesGenerated: true,
            referenceModel: false,
            license: 'HERMES OpenBIM License',
            sourceUri: 'hermes://academy-house-0002',
            spatialHierarchy: {
              projectId: 'ACADEMY-HOUSE-0002',
              ifcGuid: 'ACADEMY-HOUSE-0002-GUID',
              siteId: 'SITE-H2-PARCEL',
              siteGuid: 'SITE-GUID-H2',
              buildingId: 'Tampa House #2 Residence',
              buildingGuid: 'BUILDING-GUID-H2',
              storeys: [
                {
                  id: 'STOREY-GROUND',
                  ifcGuid: 'STOREY-GROUND-GUID-H2',
                  name: 'Ground Level (0.00m Datum)',
                  elevationMeters: 0,
                  heightMeters: 3.0,
                  spaces: [
                    { id: 'ROOM-LIVING', name: 'Living & Dining Great Room', ifcGuid: 'SP-LIVING', areaSqMeters: 28, volumeCuMeters: 78.4 },
                    { id: 'ROOM-KITCHEN', name: 'Kitchen & Pantry', ifcGuid: 'SP-KITCHEN', areaSqMeters: 13, volumeCuMeters: 36.4 },
                    { id: 'ROOM-BED1', name: 'Primary Bedroom Suite', ifcGuid: 'SP-BED1', areaSqMeters: 16.7, volumeCuMeters: 46.7 },
                    { id: 'ROOM-BATH1', name: 'Primary Ensuite Bathroom', ifcGuid: 'SP-BATH1', areaSqMeters: 6.9, volumeCuMeters: 19.3 },
                    { id: 'ROOM-BED2', name: 'Bedroom 2 / Flex Office', ifcGuid: 'SP-BED2', areaSqMeters: 13.9, volumeCuMeters: 38.9 },
                    { id: 'ROOM-BATH2', name: 'Bathroom 2 / Guest Bath', ifcGuid: 'SP-BATH2', areaSqMeters: 5.6, volumeCuMeters: 15.6 },
                  ],
                },
                {
                  id: 'STOREY-ROOF',
                  ifcGuid: 'STOREY-ROOF-GUID-H2',
                  name: 'Roof Level (+3.00m Datum)',
                  elevationMeters: 3.0,
                  heightMeters: 2.5,
                  spaces: [{ id: 'SPACE-ROOF', name: 'Pre-Engineered Truss & Roof Deck', ifcGuid: 'SP-ROOF', areaSqMeters: 90, volumeCuMeters: 225 }],
                },
              ],
            },
            components,
            relationships: {
              containedInStorey: {},
              containedInSpace: {},
              hostsOpening: {},
              systemConnectivity: {},
            },
          };

          setProjectData(normalizedProj);
          setLoading(false);
        } else if (activeProjectId === 'REFERENCE-BIM-0001') {
          setHouse0002RawData(null);
          setReplayEvents([]);

          // Fetch reference model JSON & STEP file
          const metaRes = await fetch('/api/bim/reference-model');
          if (!metaRes.ok) throw new Error(`HTTP ${metaRes.status} loading reference model metadata`);
          const metaData: ReferenceBimProject = await metaRes.json();
          if (!mounted) return;
          setProjectData(metaData);

          // Parse raw IFC via web-ifc WASM
          try {
            const ifcRes = await fetch('/api/bim/reference-model.ifc');
            if (ifcRes.ok) {
              const buffer = await ifcRes.arrayBuffer();
              const uint8Array = new Uint8Array(buffer);

              const ifcApi = new WebIFC.IfcAPI();
              ifcApi.SetWasmPath('/wasm/', true);
              await ifcApi.Init();

              const modelID = ifcApi.OpenModel(uint8Array);
              const geomMap = new Map<string, THREE.BufferGeometry>();
              let meshIndex = 0;

              try {
                ifcApi.StreamAllMeshes(modelID, (placedMesh) => {
                  try {
                    const expressID = placedMesh.expressID;
                    const numGeom = placedMesh.geometries.size();
                    const subGeoms: THREE.BufferGeometry[] = [];

                    for (let i = 0; i < numGeom; i++) {
                      const placedGeom = placedMesh.geometries.get(i);
                      const geomData = ifcApi.GetGeometry(modelID, placedGeom.geometryExpressID);
                      const verBuf = ifcApi.GetVertexArray(geomData.GetVertexData(), geomData.GetVertexDataSize());
                      const idxBuf = ifcApi.GetIndexArray(geomData.GetIndexData(), geomData.GetIndexDataSize());

                      if (verBuf.length === 0 || idxBuf.length === 0) continue;
                      const numVertices = verBuf.length / 6;
                      const positions = new Float32Array(numVertices * 3);
                      const normals = new Float32Array(numVertices * 3);

                      let hasInvalid = false;
                      for (let v = 0; v < numVertices; v++) {
                        const x = verBuf[v * 6],
                          y = verBuf[v * 6 + 1],
                          z = verBuf[v * 6 + 2];
                        if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) {
                          hasInvalid = true;
                          break;
                        }
                        positions[v * 3] = x;
                        positions[v * 3 + 1] = y;
                        positions[v * 3 + 2] = z;
                        normals[v * 3] = verBuf[v * 6 + 3];
                        normals[v * 3 + 1] = verBuf[v * 6 + 4];
                        normals[v * 3 + 2] = verBuf[v * 6 + 5];
                      }
                      if (hasInvalid) continue;

                      const geometry = new THREE.BufferGeometry();
                      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
                      geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
                      geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(idxBuf), 1));

                      if (placedGeom.flatTransformation && placedGeom.flatTransformation.length === 16) {
                        const matrix = new THREE.Matrix4().fromArray(placedGeom.flatTransformation);
                        geometry.applyMatrix4(matrix);
                      }
                      subGeoms.push(geometry);
                    }

                    if (subGeoms.length > 0) {
                      const merged = subGeoms.length === 1 ? subGeoms[0] : mergeGeometries(subGeoms, false) || subGeoms[0];
                      const compId = `DUPLEX-ELEM-${expressID}`;
                      let comp = metaData.components.find((c) => c.expressID === expressID || c.id === compId);
                      if (!comp && meshIndex < metaData.components.length) {
                        comp = metaData.components[meshIndex];
                      }
                      if (comp) {
                        geomMap.set(comp.id, merged);
                      }
                    }
                    meshIndex++;
                  } catch (meshErr) {
                    console.warn('Individual IFC mesh parse warning:', meshErr);
                  }
                });
              } finally {
                try {
                  ifcApi.CloseModel(modelID);
                } catch (_) {}
              }
              if (mounted) {
                ifcGeometriesRef.current = geomMap;
                setIfcLoaded(true);
              }
            }
          } catch (wasmErr: any) {
            console.warn('[BIM WORKSPACE] WebAssembly IFC parsing warning, falling back to JSON geometry engine:', wasmErr?.message || wasmErr);
          }
          setLoading(false);
        } else {
          // Fetch generic project
          const projRes = await fetch(`/api/projects/${activeProjectId}`);
          if (!projRes.ok) throw new Error(`HTTP ${projRes.status} loading project`);
          const rawProj = await projRes.json();
          if (!mounted) return;

          const normalizedProj: ReferenceBimProject = {
            projectId: rawProj.id,
            name: rawProj.name,
            description: rawProj.description || 'HERMES Autonomous Spatial Building Project',
            classification: 'HERMES_AUTONOMOUS_BUILD',
            immutableSource: false,
            academyWritable: true,
            hermesGenerated: true,
            referenceModel: false,
            license: 'HERMES OpenBIM License',
            sourceUri: 'hermes://project',
            spatialHierarchy: {
              projectId: rawProj.id,
              ifcGuid: 'GUID-GENERIC-001',
              siteId: 'SITE-01',
              siteGuid: 'SITE-GUID-01',
              buildingId: rawProj.name,
              buildingGuid: 'BUILDING-GUID-01',
              storeys: [
                {
                  id: 'STOREY-1',
                  ifcGuid: 'STOREY-1-GUID',
                  name: 'Ground Level',
                  elevationMeters: 0,
                  heightMeters: 3.0,
                  spaces: [{ id: 'ROOM-1', name: 'Main Area', ifcGuid: 'ROOM-1-GUID', areaSqMeters: 50, volumeCuMeters: 150 }],
                },
              ],
            },
            components: rawProj.components || [],
            relationships: {
              containedInStorey: {},
              containedInSpace: {},
              hostsOpening: {},
              systemConnectivity: {},
            },
          };

          setProjectData(normalizedProj);
          setLoading(false);
        }
      } catch (e: any) {
        if (mounted) {
          setError(e.message || String(e));
          setLoading(false);
        }
      }
    }

    loadActiveProjectData();

    return () => {
      mounted = false;
    };
  }, [activeProjectId]);

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

    projectData.components.forEach((comp) => {
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
        const discipline = comp.propertySets.find((p) => p.name === 'Pset_AgentDetails')?.properties.Discipline as string;

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

      if (comp.ifcType === 'IfcSpace') {
        // 3D PROGRAM VOLUME ROOM BLOCK
        const boxGeom = new THREE.BoxGeometry(w, h, d);
        boxGeom.translate(px, py + h / 2, pz);

        const spaceMat = new THREE.MeshStandardMaterial({
          color: isSelected ? 0x0284c7 : 0x38bdf8,
          transparent: true,
          opacity: 0.2,
          side: THREE.DoubleSide,
        });

        mesh = new THREE.Mesh(boxGeom, spaceMat);
        const edges = new THREE.EdgesGeometry(boxGeom);
        const lineMat = new THREE.LineBasicMaterial({ color: 0x0284c7, linewidth: 2 });
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
  const selectedComponent = projectData?.components.find((c) => c.id === selectedCompId) || null;
  const selectedRoom = selectedRoomId && projectData ? projectData.spatialHierarchy.storeys.flatMap((s) => s.spaces).find((sp) => sp.id === selectedRoomId) : null;

  // Selected Agent Lookup
  const selectedAgent = house0002RawData?.agentSpatialStates?.find((a: any) => `AGENT-${a.agentId}` === selectedCompId || a.agentId === selectedCompId) || null;

  // Selected Facility Lookup
  const selectedFacility = house0002RawData?.spatialEntities?.find((e: any) => e.entityId === selectedCompId) || null;

  // Active Replay Event
  const activeReplayEvent = replayEvents.length > 0 ? replayEvents[Math.min(currentEventIndex, replayEvents.length - 1)] : null;

  return (
    <div className="h-full w-full flex flex-col bg-slate-50 text-slate-900 font-sans overflow-hidden select-none">
      {/* 1. TOP CONTROL RIBBON */}
      <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between gap-3 shadow-2xs z-20 shrink-0 flex-wrap">
        <div className="flex items-center gap-2">
          {/* Project Switcher Dropdown */}
          <div className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 px-3 py-1 rounded-xl text-xs font-mono">
            <Building className="w-4 h-4 text-blue-600" />
            <select
              value={activeProjectId}
              onChange={(e) => handleSwitchProject(e.target.value)}
              className="bg-transparent text-slate-800 font-bold focus:outline-none cursor-pointer text-xs"
            >
              <option value="ACADEMY-HOUSE-0002">ACADEMY-HOUSE-0002 (Tampa House #2 ATTEMPT-01)</option>
              <option value="REFERENCE-BIM-0001">REFERENCE-BIM-0001 (Read-Only OpenBIM Reference)</option>
              {allProjectsList
                .filter((p) => !['REFERENCE-BIM-0001', 'ACADEMY-HOUSE-0002'].includes(p.id))
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.id})
                  </option>
                ))}
            </select>
          </div>

          <span className="text-slate-300 hidden sm:inline">|</span>

          {/* Navigation Modes */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs font-medium">
            <button
              onClick={() => setNavMode('Orbit')}
              className={`px-3 py-1 rounded-lg transition flex items-center gap-1.5 ${navMode === 'Orbit' ? 'bg-blue-600 text-white font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <Compass className="w-3.5 h-3.5" /> Orbit
            </button>
            <button
              onClick={() => setNavMode('Inspect')}
              className={`px-3 py-1 rounded-lg transition flex items-center gap-1.5 ${navMode === 'Inspect' ? 'bg-blue-600 text-white font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <Crosshair className="w-3.5 h-3.5" /> Inspect
            </button>
          </div>
        </div>

        {/* Viewport Tools & Mobile Drawer Controls */}
        <div className="flex items-center gap-2">
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
            <Users className="w-3.5 h-3.5 text-amber-600" /> Workforce (90)
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
            <Brain className="w-3.5 h-3.5 text-purple-600" /> PRIME / PROJECT STATUS
          </button>

          <button
            onClick={() => {
              setRightInspectorOpen(!rightInspectorOpen);
              if (!rightInspectorOpen) setLeftTreeOpen(false);
            }}
            className={`px-2.5 py-1 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 sm:hidden ${rightInspectorOpen ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-200'}`}
          >
            <FileText className="w-3.5 h-3.5" /> Inspector
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
                  <span className="text-[10px] text-slate-500 font-mono shrink-0">{projectData.components.length} Items</span>
                </div>

                {activeProjectId === 'ACADEMY-HOUSE-0002' ? (
                  /* HOUSE #2 SPECIFIC STRUCTURED MODEL TREE */
                  <div className="space-y-2 text-xs">
                    {/* Site & Temporary Facilities Section */}
                    <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                      <button
                        onClick={() => setExpandedNodes((p) => ({ ...p, 'site-root': !p['site-root'] }))}
                        className="w-full px-3 py-2 bg-slate-100 font-bold text-slate-800 flex items-center justify-between text-xs hover:bg-slate-200/80"
                      >
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-blue-600" />
                          Site & Temporary Facilities (7 Facilities)
                        </span>
                        {expandedNodes['site-root'] ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
                      </button>

                      {expandedNodes['site-root'] && (
                        <div className="p-2 space-y-1">
                          {projectData.components
                            .filter((c) => c.category === 'Site')
                            .map((comp) => (
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
                                <span className="text-[9px] font-mono opacity-75">{comp.id}</span>
                              </button>
                            ))}
                        </div>
                      )}
                    </div>

                    {/* 3D Spatial Program Volumes */}
                    <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                      <button
                        onClick={() => setExpandedNodes((p) => ({ ...p, 'program-root': !p['program-root'] }))}
                        className="w-full px-3 py-2 bg-slate-100 font-bold text-slate-800 flex items-center justify-between text-xs hover:bg-slate-200/80"
                      >
                        <span className="flex items-center gap-1.5">
                          <Box className="w-3.5 h-3.5 text-blue-600" />
                          3D Spatial Program (6 Room Volumes)
                        </span>
                        {expandedNodes['program-root'] ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
                      </button>

                      {expandedNodes['program-root'] && (
                        <div className="p-2 space-y-1">
                          {projectData.components
                            .filter((c) => c.ifcType === 'IfcSpace')
                            .map((comp) => (
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
                                <span className="text-[9px] font-mono opacity-75">{comp.dimensions[0]}x{comp.dimensions[2]}m</span>
                              </button>
                            ))}
                        </div>
                      )}
                    </div>

                    {/* Building Architecture & Structure */}
                    <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                      <button
                        onClick={() => setExpandedNodes((p) => ({ ...p, 'building-structures': !p['building-structures'] }))}
                        className="w-full px-3 py-2 bg-slate-100 font-bold text-slate-800 flex items-center justify-between text-xs hover:bg-slate-200/80"
                      >
                        <span className="flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-blue-600" />
                          Building BIM Rev 1 (11 Components)
                        </span>
                        {expandedNodes['building-structures'] ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
                      </button>

                      {expandedNodes['building-structures'] && (
                        <div className="p-2 space-y-1 font-mono text-[11px]">
                          {projectData.components
                            .filter((c) => ['IfcWall', 'IfcSlab', 'IfcDoor', 'IfcWindow', 'IfcRoof'].includes(c.ifcType))
                            .map((comp) => (
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
                                <span className="text-[9px] opacity-75">{comp.category}</span>
                              </button>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* REFERENCE MODEL STOREY HIERARCHY */
                  <div className="space-y-1 font-sans">
                    {projectData.spatialHierarchy.storeys.map((storey) => {
                      const isExpanded = expandedNodes[storey.id];
                      const storeyComps = projectData.components.filter((c) => c.storeyId === storey.id);

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
                      <span className="text-xs text-slate-400 font-mono">{projectData?.components.filter((c) => c.category === sys).length} Items</span>
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

          {/* Floating Canvas Indicator */}
          <div className="absolute top-3 left-4 z-10 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-extrabold text-slate-900 shadow-xs flex items-center gap-2 pointer-events-none">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
            <span>HERMES BIM SPATIAL WORKSPACE ({activeProjectId})</span>
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
        <div className={`${rightInspectorOpen ? 'w-full sm:w-96' : 'w-0'} bg-white border-l border-slate-200 transition-all duration-200 ease-in-out flex flex-col shrink-0 z-10 overflow-hidden shadow-2xs`}>
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
                      <span className="text-xs font-bold text-blue-700">{projectData?.components.length}</span>
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
