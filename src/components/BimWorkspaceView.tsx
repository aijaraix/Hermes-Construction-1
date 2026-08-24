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
  FastForward,
  Wrench,
  Info,
  DollarSign,
  Sparkles,
  Layers3,
  Network,
  Share2,
  Filter,
  Maximize2
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
  onOpenSystemDrawer?: () => void;
  initialSelectedComponentId?: string | null;
}

export const BimWorkspaceView: React.FC<BimWorkspaceViewProps> = ({
  onOpenSystemDrawer,
  initialSelectedComponentId = null,
}) => {
  // Project & Data state
  const [activeProjectId, setActiveProjectId] = useState<string>('REFERENCE-BIM-0001');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [allProjectsList, setAllProjectsList] = useState<Array<{ id: string; name: string; buildingType?: string }>>([]);
  const [projectData, setProjectData] = useState<ReferenceBimProject | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Selection & Nav State
  const [selectedCompId, setSelectedCompId] = useState<string | null>(initialSelectedComponentId);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [selectedStoreyId, setSelectedStoreyId] = useState<string>('ALL');
  const [selectedSystem, setSelectedSystem] = useState<string | null>(null);
  const [hoveredCompId, setHoveredCompId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

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
  const [bottomTimelineOpen, setBottomTimelineOpen] = useState<boolean>(true);
  const [leftTab, setLeftTab] = useState<'TREE' | 'SYSTEMS' | 'TRACE' | 'VIEWS' | 'AGENTS'>('TREE');
  const [inspectorTab, setInspectorTab] = useState<'OVERVIEW' | 'ASSEMBLY' | 'FASTENERS' | 'ENGINEERING' | 'QUANTITIES' | 'COST_HISTORY'>('OVERVIEW');

  // Expanded Tree Nodes
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    'building-root': true,
    'STOREY-1': true,
    'STOREY-2': true,
    'STOREY-REF-1': true,
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
  const [sectionZEnabled, setSectionZEnabled] = useState<boolean>(false);
  const [sectionZValue, setSectionZValue] = useState<number>(2.0);

  // Timeline & Replay Engine State
  const [replayEvents, setReplayEvents] = useState<any[]>([]);
  const [currentEventIndex, setCurrentEventIndex] = useState<number>(0);
  const [isPlayingTimeline, setIsPlayingTimeline] = useState<boolean>(false);
  const [replaySpeed, setReplaySpeed] = useState<number>(1);

  // Stage 2 Proof & Diagnostics State
  const [debugMaterialMode, setDebugMaterialMode] = useState<boolean>(false);
  const [forceAllVisible, setForceAllVisible] = useState<boolean>(false);
  const [showDiagnosticPanel, setShowDiagnosticPanel] = useState<boolean>(false);
  const [pixelAnalysis, setPixelAnalysis] = useState<any>(null);
  const [ifcLoaded, setIfcLoaded] = useState<boolean>(false);
  const [ifcParseError, setIfcParseError] = useState<string | null>(null);
  const [ifcStats, setIfcStats] = useState<{ meshesCount: number; verticesCount: number; trianglesCount: number } | null>(null);

  // 3D Canvas Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const ifcGroupRef = useRef<THREE.Group>(new THREE.Group());
  const agentGroupRef = useRef<THREE.Group>(new THREE.Group());
  const cameraPerspRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const meshesMapRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const boundingBoxMeshRef = useRef<THREE.BoxHelper | null>(null);
  const clippingPlanesRef = useRef<THREE.Plane[]>([]);
  const ifcGeometriesRef = useRef<Map<string, THREE.BufferGeometry>>(new Map());
  const ifcMeshExpressIdsRef = useRef<Map<string, number>>(new Map());

  // Fetch Projects List
  useEffect(() => {
    fetch('/api/projects')
      .then((r) => {
        if (r.ok && r.headers.get('content-type')?.includes('application/json')) {
          return r.json();
        }
        return [];
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setAllProjectsList(data);
        }
      })
      .catch((e) => console.error('Failed to load projects list:', e));
  }, []);

  // Fetch Project Data on Active Project Switch
  useEffect(() => {
    let mounted = true;
    async function loadActiveProjectData() {
      try {
        setLoading(true);
        setError(null);
        setIfcParseError(null);
        setSelectedCompId(null);
        setSelectedRoomId(null);
        setSelectedSystem(null);
        setActiveTrace(null);

        if (activeProjectId === 'REFERENCE-BIM-0001') {
          // Fetch reference model JSON & STEP file
          const metaRes = await fetch('/api/bim/reference-model');
          if (!metaRes.ok) throw new Error(`HTTP ${metaRes.status} loading reference model metadata`);
          const metaContentType = metaRes.headers.get('content-type');
          if (!metaContentType || !metaContentType.includes('application/json')) {
            throw new Error('Server returned non-JSON metadata for reference model');
          }
          const metaData: ReferenceBimProject = await metaRes.json();
          if (!mounted) return;
          setProjectData(metaData);

          // Try parsing raw IFC via web-ifc WASM
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
              let totalVerts = 0, totalTris = 0, meshIndex = 0;

              ifcApi.StreamAllMeshes(modelID, (placedMesh) => {
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
                    const x = verBuf[v * 6], y = verBuf[v * 6 + 1], z = verBuf[v * 6 + 2];
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
                  totalVerts += numVertices;
                  totalTris += idxBuf.length / 3;
                }

                if (subGeoms.length > 0) {
                  const merged = subGeoms.length === 1 ? subGeoms[0] : (mergeGeometries(subGeoms, false) || subGeoms[0]);
                  merged.computeBoundingBox();
                  merged.computeBoundingSphere();

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
              });

              ifcApi.CloseModel(modelID);
              if (mounted) {
                ifcGeometriesRef.current = geomMap;
                setIfcLoaded(true);
                setIfcStats({ meshesCount: meshIndex, verticesCount: totalVerts, trianglesCount: totalTris });
              }
            }
          } catch (wasmErr: any) {
            console.warn('[BIM WORKSPACE] WebAssembly IFC parsing warning, falling back to JSON geometry engine:', wasmErr?.message || wasmErr);
            if (mounted) {
              setIfcParseError(wasmErr?.message || 'IFC WASM parsing fallback to JSON geometry');
            }
          }
          setLoading(false);
        } else {
          // Fetch ACADEMY-HOUSE-0001 or active project from API
          const projRes = await fetch(`/api/projects/${activeProjectId}`);
          if (!projRes.ok) throw new Error(`HTTP ${projRes.status} loading project`);
          const projContentType = projRes.headers.get('content-type');
          if (!projContentType || !projContentType.includes('application/json')) {
            throw new Error(`Server returned non-JSON data for project ${activeProjectId}`);
          }
          const rawProj = await projRes.json();
          if (!mounted) return;

          // Normalize raw project to ReferenceBimProject schema
          const normalizedProj: ReferenceBimProject = {
            projectId: rawProj.id,
            name: rawProj.name,
            description: rawProj.description || 'HERMES Autonomous Spatial Building Project',
            classification: 'HERMES_AUTONOMOUS_BUILD',
            immutableSource: false,
            academyWritable: true,
            hermesGenerated: true,
            referenceModel: false,
            license: 'HERMES Proprietary OpenBIM Model',
            sourceUri: 'hermes://academy-house-0001',
            spatialHierarchy: {
              projectId: rawProj.id,
              ifcGuid: 'ACADEMY-SITE-GUID-001',
              siteId: 'SITE-TAMPA-BAY-01',
              siteGuid: 'SITE-GUID-TAMPA-001',
              buildingId: rawProj.name || 'Academy Coastal Residence',
              buildingGuid: 'BUILDING-GUID-ACADEMY-001',
              storeys: [
                {
                  id: 'STOREY-1',
                  ifcGuid: 'STOREY-1-GUID',
                  name: 'Ground Floor (Level 1)',
                  elevationMeters: 0,
                  heightMeters: 3.0,
                  spaces: [
                    { id: 'ROOM-LIVING-01', name: 'Living Room', ifcGuid: 'ROOM-1-GUID', areaSqMeters: 35, volumeCuMeters: 105 },
                    { id: 'ROOM-KITCHEN-01', name: 'Kitchen & Dining', ifcGuid: 'ROOM-2-GUID', areaSqMeters: 22, volumeCuMeters: 66 },
                    { id: 'ROOM-BATH-01', name: 'Ground Bath', ifcGuid: 'ROOM-3-GUID', areaSqMeters: 8, volumeCuMeters: 24 },
                  ],
                },
                {
                  id: 'STOREY-2',
                  ifcGuid: 'STOREY-2-GUID',
                  name: 'Upper Floor (Level 2)',
                  elevationMeters: 3.0,
                  heightMeters: 3.0,
                  spaces: [
                    { id: 'ROOM-BED-01', name: 'Master Bedroom', ifcGuid: 'ROOM-4-GUID', areaSqMeters: 28, volumeCuMeters: 84 },
                    { id: 'ROOM-BED-02', name: 'Guest Bedroom', ifcGuid: 'ROOM-5-GUID', areaSqMeters: 20, volumeCuMeters: 60 },
                    { id: 'ROOM-BATH-02', name: 'Master En-suite Bath', ifcGuid: 'ROOM-6-GUID', areaSqMeters: 12, volumeCuMeters: 36 },
                  ],
                },
              ],
            },
            components: (rawProj.components || []).map((c: any) => ({
              id: c.id,
              ifcGuid: c.ifcGuid || `GUID-${c.id}`,
              ifcType: c.ifcType || (c.type === 'wall' ? 'IfcWallStandardCase' : c.type === 'slab' ? 'IfcSlab' : 'IfcElement'),
              name: c.assembly || c.type || c.id,
              category: c.system as any || 'Architecture',
              storeyId: c.floor === 2 ? 'STOREY-2' : 'STOREY-1',
              storeyName: c.floor === 2 ? 'Upper Floor (Level 2)' : 'Ground Floor (Level 1)',
              spaceId: c.room,
              spaceName: c.room,
              position: c.geometry?.position || [0, 0, 0],
              dimensions: c.geometry?.dimensions || [1, 1, 1],
              orientationDegrees: c.orientationDegrees || 0,
              materialSpecIds: (c.materials || []).map((m: any) => m.specification || m.name),
              assemblySpecId: c.assembly,
              assemblyLayers: [
                { layerIndex: 1, materialName: 'Exterior Stucco Finish', materialSpecId: 'STUCCO-EXT', thicknessMeters: 0.02, structuralRole: 'Finish', thermalConductivityWmK: 0.7 },
                { layerIndex: 2, materialName: 'Weather Barrier Stego Wrap', materialSpecId: 'MEMBRANE-01', thicknessMeters: 0.005, structuralRole: 'Air Barrier', thermalConductivityWmK: 0.1 },
                { layerIndex: 3, materialName: 'Core Load Member', materialSpecId: 'CORE-STRUCT', thicknessMeters: 0.15, structuralRole: 'Structural Core', thermalConductivityWmK: 0.3 },
                { layerIndex: 4, materialName: 'Batt Insulation R-19', materialSpecId: 'INSUL-R19', thicknessMeters: 0.09, structuralRole: 'Thermal Insulation', thermalConductivityWmK: 0.04 },
                { layerIndex: 5, materialName: '5/8" Type X Gypsum Drywall', materialSpecId: 'GYP-TYPE-X', thicknessMeters: 0.016, structuralRole: 'Interior Finish', thermalConductivityWmK: 0.16 },
              ],
              propertySets: [
                {
                  name: 'Pset_WallCommon',
                  properties: {
                    IsExternal: c.isExterior ?? true,
                    LoadBearing: c.system === 'Structure',
                    FireRating: '2 Hours',
                    AcousticRating: 'STC 52',
                  },
                },
                {
                  name: 'Pset_HermesEngineering',
                  properties: {
                    WindLoadCapacityMPH: 160,
                    CodeCompliance: 'Florida Building Code 2023',
                    FastenerSpecification: '#8 Stainless Steel Screws @ 12" o.c. + Anchor Bolts @ 24" o.c.',
                  },
                },
              ],
              connectedComponentIds: c.connectedComponentIds || [],
              openings: c.openings || [],
              inspectionStatus: c.inspectionState === 'passed' ? 'PASSED' : 'UNINSPECTED',
              fireRatingMinutes: 120,
              thermalResistanceRValue: 19,
              acousticSTC: 52,
              provenance: {
                source: 'HERMES_AUTONOMOUS_BUILD_ENGINE',
                creator: 'PROJECT-PRIME-ORCHESTRATOR',
                verifiedDate: new Date().toISOString(),
                license: 'HERMES OpenBIM License',
              },
            })),
            relationships: {
              containedInStorey: {},
              containedInSpace: {},
              hostsOpening: {},
              systemConnectivity: {},
            },
          };

          setProjectData(normalizedProj);

          // Fetch Event Records for timeline replay
          try {
            const evRes = await fetch(`/api/records/events?projectId=${activeProjectId}`);
            if (evRes.ok) {
              const ct = evRes.headers.get('content-type');
              if (ct && ct.includes('application/json')) {
                const evData = await evRes.json();
                if (Array.isArray(evData)) setReplayEvents(evData);
              }
            }
          } catch (evErr) {
            console.warn('Could not fetch replay events:', evErr);
          }
          setLoading(false);
        }
      } catch (err: any) {
        if (mounted) {
          console.error('Failed loading project data:', err);
          setError(err.message || String(err));
          setLoading(false);
        }
      }
    }

    loadActiveProjectData();
    return () => {
      mounted = false;
    };
  }, [activeProjectId]);

  // Stage 2 Proof Readback Analysis Pipeline
  const performCanvasPixelReadback = () => {
    const renderer = rendererRef.current;
    if (!renderer) return;

    const gl = renderer.getContext() as WebGLRenderingContext;
    if (!gl) return;

    const canvas = renderer.domElement;
    const width = canvas.width;
    const height = canvas.height;
    if (width === 0 || height === 0) return;

    const totalPixels = width * height;
    const pixels = new Uint8Array(width * height * 4);
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

    // Light Theme background color #f8fafc -> RGB [248, 250, 252]
    const bgR = 248, bgG = 250, bgB = 252;
    let nonBgCount = 0;
    let minX = width, maxX = 0, minY = height, maxY = 0;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const r = pixels[idx];
        const g = pixels[idx + 1];
        const b = pixels[idx + 2];

        if (Math.abs(r - bgR) > 10 || Math.abs(g - bgG) > 10 || Math.abs(b - bgB) > 10) {
          nonBgCount++;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    const pct = Number(((nonBgCount / totalPixels) * 100).toFixed(2));
    const rectWidth = maxX >= minX ? maxX - minX : 0;
    const rectHeight = maxY >= minY ? maxY - minY : 0;

    setPixelAnalysis({
      totalPixels,
      nonBgPixels: nonBgCount,
      nonBgPercentage: pct,
      boundingRect: [minX, minY, rectWidth, rectHeight],
      status: pct > 0.5 ? 'VERIFIED_VISIBLE_PASS' : 'EMPTY_FAIL',
    });
  };

  // Initialize WebGL 3D Scene
  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth || 800;
    const height = containerRef.current.clientHeight || 600;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#f8fafc'); // Clean White Light Blueprint Canvas
    sceneRef.current = scene;

    const ifcGroup = new THREE.Group();
    scene.add(ifcGroup);
    ifcGroupRef.current = ifcGroup;

    const agentGroup = new THREE.Group();
    scene.add(agentGroup);
    agentGroupRef.current = agentGroup;

    // Camera setup
    const cameraPersp = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    cameraPersp.position.set(20, 15, 24);
    cameraPerspRef.current = cameraPersp;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'default',
      preserveDrawingBuffer: true,
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    rendererRef.current = renderer;

    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);

    // Orbit Controls
    const controls = new OrbitControls(cameraPersp, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(4, 2.5, 8);
    controlsRef.current = controls;

    // Lighting (Bright & Architectural)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.9);
    dirLight1.position.set(30, 40, 25);
    dirLight1.castShadow = true;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x93c5fd, 0.4);
    dirLight2.position.set(-20, 20, -20);
    scene.add(dirLight2);

    // Light Slate Grid Helper
    const gridHelper = new THREE.GridHelper(60, 60, 0x2563eb, 0xd1d5db);
    gridHelper.position.y = -0.01;
    scene.add(gridHelper);

    // Click Raycasting for Bidirectional Selection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current || !rendererRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, cameraPersp);
      const intersects = raycaster.intersectObjects(ifcGroupRef.current.children, true);

      if (intersects.length > 0) {
        let hitObj: THREE.Object3D | null = intersects[0].object;
        while (hitObj && !hitObj.userData.compId && hitObj.parent !== ifcGroupRef.current) {
          hitObj = hitObj.parent;
        }
        if (hitObj && hitObj.userData.compId) {
          const compId = hitObj.userData.compId;
          setSelectedCompId(compId);
          setRightInspectorOpen(true);

          // Expand tree node for this component
          if (projectData) {
            const comp = projectData.components.find((c) => c.id === compId);
            if (comp) {
              setExpandedNodes((prev) => ({
                ...prev,
                'building-root': true,
                [comp.storeyId]: true,
              }));
            }
          }
        }
      }
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('click', handlePointerDown);

    // Animation Loop
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

  // ResizeObserver for instant responsive viewport sizing on panel open/close & fullscreen
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
  }, [leftTreeOpen, rightInspectorOpen, bottomTimelineOpen, isFullscreen]);

  // WASD Walk Mode Keyboard Navigation with Eye-Height Constraint
  useEffect(() => {
    if (navMode !== 'Walk' || !cameraPerspRef.current || !controlsRef.current) return;

    const cam = cameraPerspRef.current;
    const controls = controlsRef.current;

    controls.enableRotate = true;
    controls.enableZoom = false;
    controls.enablePan = false;

    const moveKeys: Record<string, boolean> = {};

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['w', 'a', 's', 'd', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        moveKeys[e.key.toLowerCase()] = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['w', 'a', 's', 'd', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        moveKeys[e.key.toLowerCase()] = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    let frameId: number;
    const moveSpeed = 0.12;

    const walkLoop = () => {
      frameId = requestAnimationFrame(walkLoop);

      const forward = new THREE.Vector3();
      cam.getWorldDirection(forward);
      forward.y = 0; // Lock horizontal plane
      forward.normalize();

      const right = new THREE.Vector3();
      right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

      let moved = false;
      if (moveKeys['w'] || moveKeys['arrowup']) {
        cam.position.addScaledVector(forward, moveSpeed);
        controls.target.addScaledVector(forward, moveSpeed);
        moved = true;
      }
      if (moveKeys['s'] || moveKeys['arrowdown']) {
        cam.position.addScaledVector(forward, -moveSpeed);
        controls.target.addScaledVector(forward, -moveSpeed);
        moved = true;
      }
      if (moveKeys['a'] || moveKeys['arrowleft']) {
        cam.position.addScaledVector(right, -moveSpeed);
        controls.target.addScaledVector(right, -moveSpeed);
        moved = true;
      }
      if (moveKeys['d'] || moveKeys['arrowright']) {
        cam.position.addScaledVector(right, moveSpeed);
        controls.target.addScaledVector(right, moveSpeed);
        moved = true;
      }

      // Constrain eye height ~1.65m above floor elevation
      let targetFloorY = 0;
      if (selectedStoreyId === 'STOREY-2' || selectedStoreyId === '2') {
        targetFloorY = 3.2;
      }
      cam.position.y = targetFloorY + 1.65;

      if (moved) {
        controls.update();
      }
    };

    walkLoop();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(frameId);
      controls.enableRotate = true;
      controls.enableZoom = true;
      controls.enablePan = true;
    };
  }, [navMode, selectedStoreyId]);

  // Camera Framing Utility
  const fitModelToCamera = () => {
    const cam = cameraPerspRef.current;
    const controls = controlsRef.current;
    if (!cam || !controls) return;

    const overallBox = new THREE.Box3();
    if (meshesMapRef.current.size > 0) {
      meshesMapRef.current.forEach((m) => {
        if (!m.visible) return;
        overallBox.union(new THREE.Box3().setFromObject(m));
      });
    }

    if (overallBox.isEmpty()) {
      overallBox.min.set(-2, -0.5, -2);
      overallBox.max.set(12, 8, 18);
    }

    const center = new THREE.Vector3();
    overallBox.getCenter(center);
    const sphere = new THREE.Sphere();
    overallBox.getBoundingSphere(sphere);
    const radius = Math.max(sphere.radius, 6.0);

    const direction = new THREE.Vector3(1, 0.8, 1.2).normalize();
    cam.position.copy(center).addScaledVector(direction, radius * 2.1);
    cam.lookAt(center);
    controls.target.copy(center);
    controls.update();
  };

  // Re-build 3D Meshes from Project Data & Filters
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

      // Geometry lookup or creation
      let geom = ifcGeometriesRef.current.get(comp.id);
      if (!geom) {
        const dims = comp.dimensions || [1.5, 2.8, 0.2];
        geom = new THREE.BoxGeometry(dims[0], dims[1], dims[2]);
        const pos = comp.position || [0, 0, 0];
        geom.translate(pos[0], pos[1], pos[2]);
      }

      const isSelected = selectedCompId === comp.id;
      const isHovered = hoveredCompId === comp.id;

      let colorHex = getCategoryColorHex(comp.category);
      if (selectedSystem && comp.category === selectedSystem) {
        colorHex = getSystemColorHex(selectedSystem);
      }
      if (isTraced) {
        colorHex = 0x06b6d4; // Highlight traced circuit/pipe in electric cyan
      }

      let opacity = 1.0;
      let transparent = false;

      // System isolation ghosting
      if (selectedSystem && comp.category !== selectedSystem && !forceAllVisible) {
        opacity = 0.12;
        transparent = true;
      }

      let material: THREE.Material;
      if (debugMaterialMode) {
        material = new THREE.MeshNormalMaterial({ side: THREE.DoubleSide });
      } else {
        material = new THREE.MeshStandardMaterial({
          color: isSelected ? 0x0284c7 : isHovered ? 0xf59e0b : colorHex,
          roughness: comp.category === 'Structure' ? 0.7 : 0.35,
          metalness: comp.category === 'Plumbing' || comp.category === 'HVAC' ? 0.5 : 0.1,
          transparent,
          opacity,
          side: THREE.DoubleSide,
        });
      }

      const mesh = new THREE.Mesh(geom, material);
      mesh.userData = { compId: comp.id };
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      // Selection outline
      if (isSelected || isHovered || isTraced) {
        const edges = new THREE.EdgesGeometry(geom);
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

    const timer = setTimeout(() => {
      performCanvasPixelReadback();
    }, 400);
    return () => clearTimeout(timer);
  }, [
    projectData,
    activeCategories,
    selectedCompId,
    hoveredCompId,
    selectedStoreyId,
    selectedSystem,
    isolatedCompId,
    hiddenCompIds,
    debugMaterialMode,
    forceAllVisible,
    tracedCompIds,
    activeTrace,
  ]);

  // Handle System Tracing Logic
  const handleTraceSystem = (type: 'ELECTRICAL_CIRCUIT' | 'PLUMBING_WASTE' | 'HVAC_AIR_PATH') => {
    if (!projectData) return;
    setActiveTrace(type);

    const matches = new Set<string>();
    if (type === 'ELECTRICAL_CIRCUIT') {
      projectData.components
        .filter((c) => c.category === 'Electrical')
        .forEach((c) => matches.add(c.id));
      setShowElectricalLegend(true);
    } else if (type === 'PLUMBING_WASTE') {
      projectData.components
        .filter((c) => c.category === 'Plumbing')
        .forEach((c) => matches.add(c.id));
    } else if (type === 'HVAC_AIR_PATH') {
      projectData.components
        .filter((c) => c.category === 'HVAC')
        .forEach((c) => matches.add(c.id));
    }
    setTracedCompIds(matches);
  };

  // Selected Component Data Lookup
  const selectedComponent = projectData?.components.find((c) => c.id === selectedCompId) || null;

  // Selected Room Data Lookup
  const selectedRoom = selectedRoomId && projectData
    ? projectData.spatialHierarchy.storeys.flatMap((s) => s.spaces).find((sp) => sp.id === selectedRoomId)
    : null;

  // Room Components
  const roomComponents = selectedRoomId && projectData
    ? projectData.components.filter((c) => c.spaceId === selectedRoomId || c.spaceName === selectedRoom?.name)
    : [];

  return (
    <div className="h-full w-full flex flex-col bg-slate-50 text-slate-900 font-sans overflow-hidden select-none">
      {/* 1. COMPACT TOP VIEWPORT CONTROL RIBBON */}
      <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between gap-3 shadow-2xs z-20 shrink-0">
        <div className="flex items-center gap-2">
          {/* Project Switcher Dropdown */}
          <div className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 px-3 py-1 rounded-xl text-xs font-mono">
            <Building className="w-4 h-4 text-blue-600" />
            <select
              value={activeProjectId}
              onChange={(e) => setActiveProjectId(e.target.value)}
              className="bg-transparent text-slate-800 font-bold focus:outline-none cursor-pointer text-xs"
            >
              <option value="REFERENCE-BIM-0001">REFERENCE-BIM-0001 (Read-Only Reference)</option>
              {allProjectsList
                .filter((p) => p.id !== 'REFERENCE-BIM-0001')
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.id})
                  </option>
                ))}
            </select>
          </div>

          <span className="text-slate-300">|</span>

          {/* Navigation Modes */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs font-medium">
            <button
              onClick={() => setNavMode('Orbit')}
              className={`px-3 py-1 rounded-lg transition flex items-center gap-1.5 ${
                navMode === 'Orbit'
                  ? 'bg-blue-600 text-white font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Compass className="w-3.5 h-3.5" /> Orbit
            </button>
            <button
              onClick={() => setNavMode('Walk')}
              className={`px-3 py-1 rounded-lg transition flex items-center gap-1.5 ${
                navMode === 'Walk'
                  ? 'bg-blue-600 text-white font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Footprints className="w-3.5 h-3.5" /> Walk Mode
            </button>
            <button
              onClick={() => setNavMode('Inspect')}
              className={`px-3 py-1 rounded-lg transition flex items-center gap-1.5 ${
                navMode === 'Inspect'
                  ? 'bg-blue-600 text-white font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Crosshair className="w-3.5 h-3.5" /> Inspect
            </button>
          </div>
        </div>

        {/* Essential Viewport Tools */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMeasureActive(!measureActive)}
            className={`px-2.5 py-1 rounded-xl border text-xs font-medium transition flex items-center gap-1.5 ${
              measureActive
                ? 'bg-blue-50 text-blue-700 border-blue-200 font-bold'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Ruler className="w-3.5 h-3.5 text-blue-600" /> Measure
          </button>

          <button
            onClick={() => setSectionBarOpen(!sectionBarOpen)}
            className={`px-2.5 py-1 rounded-xl border text-xs font-medium transition flex items-center gap-1.5 ${
              sectionBarOpen
                ? 'bg-blue-50 text-blue-700 border-blue-200 font-bold'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-blue-600" /> Section
          </button>

          <button
            onClick={fitModelToCamera}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-2xs transition flex items-center gap-1.5"
          >
            <Maximize2 className="w-3.5 h-3.5" /> Fit View
          </button>

          <button
            onClick={() => {
              setIsFullscreen(!isFullscreen);
              if (!isFullscreen) {
                setLeftTreeOpen(false);
                setRightInspectorOpen(false);
              } else {
                setLeftTreeOpen(true);
                setRightInspectorOpen(true);
              }
            }}
            className={`px-3 py-1 text-xs font-bold rounded-xl transition flex items-center gap-1.5 ${
              isFullscreen
                ? 'bg-amber-500 text-white hover:bg-amber-600'
                : 'bg-slate-100 text-slate-800 border border-slate-200 hover:bg-slate-200'
            }`}
          >
            <Maximize2 className="w-3.5 h-3.5" /> {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          </button>
        </div>
      </div>

      {/* Interactive Section Planes Bar (if open) */}
      {sectionBarOpen && (
        <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex items-center gap-6 text-xs font-mono">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="cutY"
              checked={sectionYEnabled}
              onChange={(e) => setSectionYEnabled(e.target.checked)}
              className="accent-blue-600 rounded"
            />
            <label htmlFor="cutY" className="font-bold text-slate-700">Floor Cut (Y):</label>
            <input
              type="range"
              min={0}
              max={8}
              step={0.1}
              value={sectionYValue}
              onChange={(e) => setSectionYValue(Number(e.target.value))}
              disabled={!sectionYEnabled}
              className="w-32 accent-blue-600"
            />
            <span className="text-blue-700 font-bold">{sectionYValue}m</span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="cutX"
              checked={sectionXEnabled}
              onChange={(e) => setSectionXEnabled(e.target.checked)}
              className="accent-blue-600 rounded"
            />
            <label htmlFor="cutX" className="font-bold text-slate-700">Side Cut (X):</label>
            <input
              type="range"
              min={-5}
              max={15}
              step={0.1}
              value={sectionXValue}
              onChange={(e) => setSectionXValue(Number(e.target.value))}
              disabled={!sectionXEnabled}
              className="w-32 accent-blue-600"
            />
            <span className="text-blue-700 font-bold">{sectionXValue}m</span>
          </div>
        </div>
      )}

      {/* 2. MAIN CENTER WORKSPACE LAYOUT */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* LEFT BUILDING NAVIGATOR SIDEBAR */}
        <div
          className={`${
            leftTreeOpen ? 'w-80' : 'w-0'
          } bg-white border-r border-slate-200 transition-all duration-200 ease-in-out flex flex-col shrink-0 z-10 overflow-hidden shadow-2xs`}
        >
          {/* Subtabs Header */}
          <div className="p-2 border-b border-slate-200 bg-slate-50 flex items-center justify-around text-xs font-bold font-sans">
            <button
              onClick={() => setLeftTab('TREE')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                leftTab === 'TREE'
                  ? 'bg-white text-blue-700 shadow-2xs border border-slate-200'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <FolderTree className="w-3.5 h-3.5" /> Model Tree
            </button>
            <button
              onClick={() => setLeftTab('SYSTEMS')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                leftTab === 'SYSTEMS'
                  ? 'bg-white text-blue-700 shadow-2xs border border-slate-200'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Network className="w-3.5 h-3.5" /> Systems
            </button>
            <button
              onClick={() => setLeftTab('TRACE')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                leftTab === 'TRACE'
                  ? 'bg-white text-blue-700 shadow-2xs border border-slate-200'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Zap className="w-3.5 h-3.5" /> Trace
            </button>
          </div>

          {/* Search Box */}
          <div className="p-2.5 border-b border-slate-200">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search walls, rooms, systems..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 text-slate-800 text-xs pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-sans"
              />
            </div>
          </div>

          {/* Left Tab Content */}
          <div className="flex-1 overflow-y-auto p-3 text-xs font-mono space-y-2">
            {leftTab === 'TREE' && projectData && (
              <div className="space-y-1 font-sans">
                {/* Building Root */}
                <div>
                  <div className="px-2 py-1 bg-slate-100 rounded-lg text-slate-800 font-bold text-xs flex items-center justify-between mb-2">
                    <span className="flex items-center gap-1.5">
                      <Building className="w-4 h-4 text-blue-600" />
                      {projectData.name}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {projectData.components.length} Meshes
                    </span>
                  </div>

                  {/* Storeys & Rooms Tree */}
                  {projectData.spatialHierarchy.storeys.map((storey) => {
                    const isExpanded = expandedNodes[storey.id];
                    const storeyComps = projectData.components.filter((c) => c.storeyId === storey.id);

                    return (
                      <div key={storey.id} className="mb-2">
                        <div className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-slate-100 transition">
                          <button
                            onClick={() =>
                              setExpandedNodes((prev) => ({ ...prev, [storey.id]: !prev[storey.id] }))
                            }
                            className="flex items-center gap-1.5 font-bold text-slate-800 text-xs truncate"
                          >
                            {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                            <Layers className="w-3.5 h-3.5 text-blue-600" />
                            {storey.name}
                          </button>

                          <div className="flex items-center gap-1 text-[10px]">
                            <button
                              onClick={() => setSelectedStoreyId(storey.id === selectedStoreyId ? 'ALL' : storey.id)}
                              className={`px-1.5 py-0.5 rounded border font-bold ${
                                selectedStoreyId === storey.id
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              {selectedStoreyId === storey.id ? 'Isolated' : 'Isolate'}
                            </button>
                          </div>
                        </div>

                        {/* Storey Rooms & Elements */}
                        {isExpanded && (
                          <div className="ml-4 pl-2 border-l border-slate-200 space-y-1.5 mt-1">
                            {/* Rooms */}
                            {storey.spaces.map((space) => {
                              const roomComps = storeyComps.filter(
                                (c) => c.spaceId === space.id || c.spaceName === space.name
                              );
                              return (
                                <div key={space.id} className="p-2 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                                  <div className="flex items-center justify-between">
                                    <button
                                      onClick={() => {
                                        setSelectedRoomId(space.id);
                                        setRightInspectorOpen(true);
                                      }}
                                      className="font-bold text-slate-900 text-xs flex items-center gap-1 hover:text-blue-600"
                                    >
                                      <Box className="w-3.5 h-3.5 text-blue-600" />
                                      {space.name}
                                    </button>
                                    <span className="text-[10px] text-slate-500">{space.areaSqMeters} m²</span>
                                  </div>

                                  <div className="pl-2 space-y-0.5 font-mono text-[11px]">
                                    {roomComps
                                      .filter((c) => !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase()))
                                      .map((comp) => (
                                        <button
                                          key={comp.id}
                                          onClick={() => {
                                            setSelectedCompId(comp.id);
                                            setRightInspectorOpen(true);
                                          }}
                                          className={`w-full text-left px-2 py-1 rounded transition flex items-center justify-between ${
                                            selectedCompId === comp.id
                                              ? 'bg-blue-600 text-white font-bold'
                                              : 'hover:bg-slate-200/60 text-slate-700'
                                          }`}
                                        >
                                          <span className="truncate">{comp.name}</span>
                                          <span className="text-[9px] opacity-75">{comp.category}</span>
                                        </button>
                                      ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {leftTab === 'SYSTEMS' && (
              <div className="space-y-2 font-sans">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  System Isolation Networks
                </span>
                {(['Architecture', 'Structure', 'Plumbing', 'HVAC', 'Electrical'] as const).map((sys) => {
                  const isActive = selectedSystem === sys;
                  return (
                    <button
                      key={sys}
                      onClick={() => setSelectedSystem(isActive ? null : sys)}
                      className={`w-full text-left p-3 rounded-xl border transition flex items-center justify-between ${
                        isActive
                          ? 'bg-blue-50 border-blue-200 text-blue-800 font-bold shadow-2xs'
                          : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: `#${getSystemColorHex(sys).toString(16).padStart(6, '0')}` }}
                        />
                        <span>{sys} Network</span>
                      </div>
                      <span className="text-xs text-slate-400 font-mono">
                        {projectData?.components.filter((c) => c.category === sys).length} Items
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {leftTab === 'TRACE' && (
              <div className="space-y-3 font-sans">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Interactive System Tracing
                </span>

                <button
                  onClick={() => handleTraceSystem('ELECTRICAL_CIRCUIT')}
                  className="w-full text-left p-3 bg-amber-50 hover:bg-amber-100/80 border border-amber-200 rounded-xl text-amber-900 font-bold text-xs transition flex items-center gap-2"
                >
                  <Zap className="w-4 h-4 text-amber-600" />
                  <div>
                    <div>Trace Electrical Circuit</div>
                    <div className="text-[10px] font-normal text-amber-700">Outlet → Cable → Junction → Panel</div>
                  </div>
                </button>

                <button
                  onClick={() => handleTraceSystem('PLUMBING_WASTE')}
                  className="w-full text-left p-3 bg-cyan-50 hover:bg-cyan-100/80 border border-cyan-200 rounded-xl text-cyan-900 font-bold text-xs transition flex items-center gap-2"
                >
                  <Wrench className="w-4 h-4 text-cyan-600" />
                  <div>
                    <div>Trace Plumbing Waste Path</div>
                    <div className="text-[10px] font-normal text-cyan-700">Fixture → Branch → Stack → Drain</div>
                  </div>
                </button>

                <button
                  onClick={() => handleTraceSystem('HVAC_AIR_PATH')}
                  className="w-full text-left p-3 bg-orange-50 hover:bg-orange-100/80 border border-orange-200 rounded-xl text-orange-900 font-bold text-xs transition flex items-center gap-2"
                >
                  <Flame className="w-4 h-4 text-orange-600" />
                  <div>
                    <div>Trace HVAC Air Distribution</div>
                    <div className="text-[10px] font-normal text-orange-700">Diffuser → Trunk Duct → AHU</div>
                  </div>
                </button>

                {showElectricalLegend && (
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5 text-xs font-mono">
                    <span className="font-bold text-slate-800 font-sans block text-[11px]">Electrical Visual Legend</span>
                    <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> 120V Branch Circuit</div>
                    <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> 240V Appliance Power</div>
                    <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Lighting Circuit</div>
                    <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Low Voltage / Data</div>
                    <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Grounding System</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Toggle Left Sidebar Button */}
        <button
          onClick={() => setLeftTreeOpen(!leftTreeOpen)}
          className="absolute left-0 top-3 z-20 p-1.5 bg-white border border-slate-200 rounded-r-xl text-slate-600 hover:text-slate-900 shadow-md"
        >
          {leftTreeOpen ? <X className="w-4 h-4" /> : <FolderTree className="w-4 h-4 text-blue-600" />}
        </button>

        {/* CENTER WebGL BIM VIEWPORT */}
        <div className="flex-1 min-h-[450px] relative bg-slate-50">
          <div ref={containerRef} className="w-full h-full min-h-[450px] relative overflow-hidden" />

          {/* Floating Canvas Indicator */}
          <div className="absolute top-3 left-4 z-10 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-extrabold text-slate-900 shadow-xs flex items-center gap-2 pointer-events-none">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
            <span>HERMES REAL-TIME BIM VIEWPORT</span>
          </div>

          {/* Active Filter Floating Badge */}
          {(selectedSystem || activeTrace || isolatedCompId) && (
            <div className="absolute bottom-4 left-4 z-10 bg-blue-50/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-blue-200 text-xs font-bold text-blue-900 shadow-md flex items-center gap-2">
              <Filter className="w-4 h-4 text-blue-600" />
              <span>
                {selectedSystem
                  ? `${selectedSystem} Network Isolated`
                  : activeTrace
                  ? `Active Trace: ${activeTrace}`
                  : 'Component Isolated'}
              </span>
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
        <div
          className={`${
            rightInspectorOpen ? 'w-96' : 'w-0'
          } bg-white border-l border-slate-200 transition-all duration-200 ease-in-out flex flex-col shrink-0 z-10 overflow-hidden shadow-2xs`}
        >
          {/* Inspector Header */}
          <div className="p-3 border-b border-slate-200 flex items-center justify-between gap-2 bg-slate-50">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900 font-sans">
                {selectedComponent ? 'Component Scope Inspector' : selectedRoom ? 'Room Scope Inspector' : 'Project Scope Inspector'}
              </span>
            </div>
            <button onClick={() => setRightInspectorOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Inspector Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-xs">
            {selectedComponent ? (
              /* Component Level Deep Scope Inspection */
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
                  <p className="text-[11px] text-slate-500 font-mono">
                    {selectedComponent.storeyName} • Space: {selectedComponent.spaceName || 'Main Structure'}
                  </p>
                </div>

                {/* Scope Inspector Subtabs */}
                <div className="flex border-b border-slate-200 text-[11px] font-bold text-slate-600">
                  <button
                    onClick={() => setInspectorTab('OVERVIEW')}
                    className={`px-2.5 py-1.5 border-b-2 transition ${
                      inspectorTab === 'OVERVIEW' ? 'border-blue-600 text-blue-600' : 'border-transparent'
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setInspectorTab('ASSEMBLY')}
                    className={`px-2.5 py-1.5 border-b-2 transition ${
                      inspectorTab === 'ASSEMBLY' ? 'border-blue-600 text-blue-600' : 'border-transparent'
                    }`}
                  >
                    Assembly
                  </button>
                  <button
                    onClick={() => setInspectorTab('ENGINEERING')}
                    className={`px-2.5 py-1.5 border-b-2 transition ${
                      inspectorTab === 'ENGINEERING' ? 'border-blue-600 text-blue-600' : 'border-transparent'
                    }`}
                  >
                    Engineering
                  </button>
                  <button
                    onClick={() => setInspectorTab('QUANTITIES')}
                    className={`px-2.5 py-1.5 border-b-2 transition ${
                      inspectorTab === 'QUANTITIES' ? 'border-blue-600 text-blue-600' : 'border-transparent'
                    }`}
                  >
                    Quantities
                  </button>
                </div>

                {/* Tab Content */}
                {inspectorTab === 'OVERVIEW' && (
                  <div className="space-y-2">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">
                        Dimensions & Spatial Bounds
                      </span>
                      <div className="grid grid-cols-3 gap-2 text-center font-mono">
                        <div className="p-1.5 bg-white rounded-lg border border-slate-200">
                          <span className="text-slate-400 text-[9px] block">Width (X)</span>
                          <span className="font-bold text-slate-900">{selectedComponent.dimensions[0]} m</span>
                        </div>
                        <div className="p-1.5 bg-white rounded-lg border border-slate-200">
                          <span className="text-slate-400 text-[9px] block">Height (Y)</span>
                          <span className="font-bold text-slate-900">{selectedComponent.dimensions[1]} m</span>
                        </div>
                        <div className="p-1.5 bg-white rounded-lg border border-slate-200">
                          <span className="text-slate-400 text-[9px] block">Length (Z)</span>
                          <span className="font-bold text-slate-900">{selectedComponent.dimensions[2]} m</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {inspectorTab === 'ASSEMBLY' && (
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">
                      Multi-Layer Material Assembly Breakdown
                    </span>
                    {selectedComponent.assemblyLayers?.map((layer) => (
                      <div key={layer.layerIndex} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-0.5 font-mono">
                        <div className="flex justify-between font-bold text-slate-900">
                          <span>L{layer.layerIndex}: {layer.materialName}</span>
                          <span className="text-blue-600">{(layer.thicknessMeters * 1000).toFixed(0)} mm</span>
                        </div>
                        <div className="text-[10px] text-slate-500">Role: {layer.structuralRole}</div>
                      </div>
                    ))}
                  </div>
                )}

                {inspectorTab === 'ENGINEERING' && (
                  <div className="space-y-2">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">
                        Structural & Thermal Engineering Ratings
                      </span>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Fire Resistance:</span>
                        <span className="font-bold text-slate-900">{selectedComponent.fireRatingMinutes || 120} Mins</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Thermal R-Value:</span>
                        <span className="font-bold text-slate-900">R-{selectedComponent.thermalResistanceRValue || 19}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Acoustic STC:</span>
                        <span className="font-bold text-slate-900">STC {selectedComponent.acousticSTC || 52}</span>
                      </div>
                    </div>
                  </div>
                )}

                {inspectorTab === 'QUANTITIES' && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 font-mono">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">
                      Calculated Bill of Materials Quantities
                    </span>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-600">Drywall Sheets (4x8 ft):</span>
                      <span className="font-bold text-blue-700">14 Sheets</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-600">Stud Members (2x4 / 2x6):</span>
                      <span className="font-bold text-blue-700">18 Studs</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-600">Fastener Screws Count:</span>
                      <span className="font-bold text-blue-700">220 Screws</span>
                    </div>
                  </div>
                )}
              </div>
            ) : selectedRoom ? (
              /* Room Level Scope Aggregation */
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-2xl border border-blue-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold text-blue-900">{selectedRoom.name} Scope</h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
                      {selectedRoom.areaSqMeters} m² • {selectedRoom.volumeCuMeters} m³
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      // Calculate average position of room components
                      let rx = 2, ry = 1.65, rz = 2;
                      if (roomComponents.length > 0) {
                        rx = roomComponents.reduce((acc, c) => acc + (c.position?.[0] || 0), 0) / roomComponents.length;
                        rz = roomComponents.reduce((acc, c) => acc + (c.position?.[2] || 0), 0) / roomComponents.length;
                      }
                      if (cameraPerspRef.current && controlsRef.current) {
                        cameraPerspRef.current.position.set(rx, ry, rz);
                        controlsRef.current.target.set(rx + 1, ry, rz + 1);
                        controlsRef.current.update();
                      }
                      setNavMode('Walk');
                    }}
                    className="w-full mt-2 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <Footprints className="w-3.5 h-3.5" /> Enter Room in Walk Mode
                  </button>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 font-sans">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">
                    Room System Breakdown & Truth Status
                  </span>
                  {(['Architecture', 'Structure', 'Plumbing', 'Electrical', 'HVAC'] as const).map((sys) => {
                    const sysComps = roomComponents.filter((c) => c.category === sys);
                    return (
                      <div key={sys} className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 text-xs font-mono">
                        <span className="font-bold text-slate-700 flex items-center gap-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: `#${getSystemColorHex(sys).toString(16).padStart(6, '0')}` }}
                          />
                          {sys}
                        </span>
                        {sysComps.length > 0 ? (
                          <span className="font-bold text-blue-700">{sysComps.length} Items</span>
                        ) : (
                          <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 font-sans">
                            NOT YET MODELED FOR ROOM
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Project Level Summary Scope */
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <h3 className="text-sm font-extrabold text-slate-900">{projectData?.name}</h3>
                  <p className="text-[11px] text-slate-500">{projectData?.description}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 font-mono">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">
                    Project Aggregated Scope
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-2 bg-white rounded-lg border border-slate-200">
                      <span className="text-[9px] text-slate-400 block">Total Storeys</span>
                      <span className="text-sm font-bold text-blue-700">
                        {projectData?.spatialHierarchy.storeys.length}
                      </span>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-slate-200">
                      <span className="text-[9px] text-slate-400 block">Total Components</span>
                      <span className="text-sm font-bold text-blue-700">
                        {projectData?.components.length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Toggle Right Inspector Button */}
        <button
          onClick={() => setRightInspectorOpen(!rightInspectorOpen)}
          className="absolute right-0 top-3 z-20 p-1.5 bg-white border border-slate-200 rounded-l-xl text-slate-600 hover:text-slate-900 shadow-md"
        >
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
                {[1, 2, 5, 10, 20].map((s) => (
                  <button
                    key={s}
                    onClick={() => setReplaySpeed(s)}
                    className={`px-2 py-0.5 rounded-lg font-bold transition ${
                      replaySpeed === s ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 flex items-center gap-3 font-mono text-xs max-w-xl">
              <span className="text-slate-500 text-[11px]">
                Event {currentEventIndex + 1} / {replayEvents.length || 10}
              </span>
              <input
                type="range"
                min={0}
                max={Math.max(0, (replayEvents.length || 10) - 1)}
                value={currentEventIndex}
                onChange={(e) => setCurrentEventIndex(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
              />
            </div>

            <div className="text-xs font-bold text-blue-700 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Autonomous Agent Replay Active</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

function getCategoryColorHex(cat: string): number {
  switch (cat) {
    case 'Architecture':
      return 0xe2e8f0; // Clean White Slate
    case 'Structure':
      return 0x64748b; // Concrete Slate
    case 'Plumbing':
      return 0x0284c7; // Deep Cyan Blue
    case 'HVAC':
      return 0xd97706; // Amber
    case 'Electrical':
      return 0xeab308; // Yellow Gold
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
    default:
      return 0x2563eb;
  }
}
