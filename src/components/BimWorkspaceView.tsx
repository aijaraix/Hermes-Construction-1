import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
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
  Scissors,
  Crosshair,
  Footprints,
  Maximize,
  Ruler,
  Sliders,
  Flame,
  Thermometer,
  Volume2,
  Tag,
  Grid,
  Move
} from 'lucide-react';

export interface ReferenceBimComponent {
  id: string;
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
  initialSelectedComponentId = null
}) => {
  const [projectData, setProjectData] = useState<ReferenceBimProject | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Selection & UI State
  const [selectedCompId, setSelectedCompId] = useState<string | null>(initialSelectedComponentId);
  const [hoveredCompId, setHoveredCompId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Isolate & Hide Maps
  const [isolatedCompId, setIsolatedCompId] = useState<string | null>(null);
  const [hiddenCompIds, setHiddenCompIds] = useState<Set<string>>(new Set());

  // Drawer / Sidebar states
  const [leftTreeOpen, setLeftTreeOpen] = useState<boolean>(true);
  const [rightInspectorOpen, setRightInspectorOpen] = useState<boolean>(true);
  const [bottomTimelineOpen, setBottomTimelineOpen] = useState<boolean>(true);
  const [sectionBarOpen, setSectionBarOpen] = useState<boolean>(false);
  
  // Tree Expansion
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    'building-root': true,
    'STOREY-REF-1': true,
    'STOREY-REF-2': true,
  });

  // Category Layer Filters
  const [activeCategories, setActiveCategories] = useState<Record<string, boolean>>({
    Architecture: true,
    Structure: true,
    Plumbing: true,
    HVAC: true,
    Electrical: true,
  });

  // Storey Isolation Filter
  const [selectedStoreyId, setSelectedStoreyId] = useState<string>('ALL');
  const [ghostOtherStoreys, setGhostOtherStoreys] = useState<boolean>(true);

  // Shading & Material Mode
  const [colorByMode, setColorByMode] = useState<'Category' | 'Material' | 'Inspection' | 'XRay' | 'Wireframe'>('Category');

  // Camera & Navigation State
  const [cameraType, setCameraType] = useState<'Perspective' | 'Orthographic'>('Perspective');
  const [navMode, setNavMode] = useState<'Orbit' | 'Walk'>('Orbit');

  // Real-Time Section Clipping Planes State
  const [sectionYEnabled, setSectionYEnabled] = useState<boolean>(false);
  const [sectionYValue, setSectionYValue] = useState<number>(4.2); // height in meters
  const [sectionXEnabled, setSectionXEnabled] = useState<boolean>(false);
  const [sectionXValue, setSectionXValue] = useState<number>(1.0);
  const [sectionZEnabled, setSectionZEnabled] = useState<boolean>(false);
  const [sectionZValue, setSectionZValue] = useState<number>(2.0);

  // Timeline & Revision scrubbing
  const [revisionIndex, setRevisionIndex] = useState<number>(10);
  const [isPlayingTimeline, setIsPlayingTimeline] = useState<boolean>(false);

  // Live Performance Telemetry
  const [fps, setFps] = useState<number>(60);
  const [trianglesCount, setTrianglesCount] = useState<number>(0);
  const [drawCallsCount, setDrawCallsCount] = useState<number>(0);
  const [geometriesCount, setGeometriesCount] = useState<number>(0);

  // Inspector Active Tab
  const [inspectorTab, setInspectorTab] = useState<'IDENTITY' | 'GEOMETRY' | 'ASSEMBLY' | 'PROPERTYSETS' | 'CONNECTIVITY' | 'INSPECTION'>('IDENTITY');

  // 3D Canvas Refs & web-ifc Geometry Store
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraPerspRef = useRef<THREE.PerspectiveCamera | null>(null);
  const cameraOrthoRef = useRef<THREE.OrthographicCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const meshesMapRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const boundingBoxMeshRef = useRef<THREE.BoxHelper | null>(null);
  const clippingPlanesRef = useRef<THREE.Plane[]>([]);
  const ifcGeometriesRef = useRef<Map<string, THREE.BufferGeometry>>(new Map());

  const [ifcLoaded, setIfcLoaded] = useState<boolean>(false);
  const [ifcParseError, setIfcParseError] = useState<string | null>(null);
  const [ifcStats, setIfcStats] = useState<{ meshesCount: number; verticesCount: number; trianglesCount: number } | null>(null);

  // Fetch Reference Model Metadata & Parse Raw IFC via web-ifc WASM
  useEffect(() => {
    let mounted = true;

    async function loadReferenceModelAndIfc() {
      try {
        setLoading(true);
        setError(null);
        setIfcParseError(null);

        // 1. Fetch metadata JSON
        const metaRes = await fetch('/api/bim/reference-model');
        if (!metaRes.ok) throw new Error(`HTTP ${metaRes.status} loading model metadata`);
        const metaData: ReferenceBimProject = await metaRes.json();
        if (!mounted) return;
        setProjectData(metaData);

        // 2. Fetch raw IFC STEP file
        const ifcRes = await fetch('/api/bim/reference-model.ifc');
        if (!ifcRes.ok) throw new Error(`HTTP ${ifcRes.status} loading raw REFERENCE-BIM-0001.ifc`);
        const buffer = await ifcRes.arrayBuffer();
        const uint8Array = new Uint8Array(buffer);

        // 3. Initialize web-ifc WASM engine
        const ifcApi = new WebIFC.IfcAPI();
        ifcApi.SetWasmPath('/wasm/');
        await ifcApi.Init();

        // 4. Open IFC Model
        const modelID = ifcApi.OpenModel(uint8Array);

        const geomMap = new Map<string, THREE.BufferGeometry>();
        let totalVerts = 0;
        let totalTris = 0;
        let meshIndex = 0;

        // Stream all geometric meshes parsed by web-ifc
        ifcApi.StreamAllMeshes(modelID, (placedMesh) => {
          const numGeom = placedMesh.geometries.size();
          for (let i = 0; i < numGeom; i++) {
            const placedGeom = placedMesh.geometries.get(i);
            const geomData = ifcApi.GetGeometry(modelID, placedGeom.geometryExpressID);

            const verBuf = ifcApi.GetVertexArray(geomData.GetVertexData(), geomData.GetVertexDataSize());
            const idxBuf = ifcApi.GetIndexArray(geomData.GetIndexData(), geomData.GetIndexDataSize());

            if (verBuf.length === 0 || idxBuf.length === 0) continue;

            const numVertices = verBuf.length / 6; // Float32Array stride = 6 (pos + normal)
            const positions = new Float32Array(numVertices * 3);
            const normals = new Float32Array(numVertices * 3);

            for (let v = 0; v < numVertices; v++) {
              positions[v * 3] = verBuf[v * 6];
              positions[v * 3 + 1] = verBuf[v * 6 + 1];
              positions[v * 3 + 2] = verBuf[v * 6 + 2];

              normals[v * 3] = verBuf[v * 6 + 3];
              normals[v * 3 + 1] = verBuf[v * 6 + 4];
              normals[v * 3 + 2] = verBuf[v * 6 + 5];
            }

            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
            geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(idxBuf), 1));

            // Apply matrix transformation from web-ifc
            if (placedGeom.flatTransformation && placedGeom.flatTransformation.length === 16) {
              const matrix = new THREE.Matrix4().fromArray(placedGeom.flatTransformation);
              geometry.applyMatrix4(matrix);
            }

            // Map to corresponding component metadata
            const comp = metaData.components[meshIndex];
            if (comp) {
              geomMap.set(comp.id, geometry);
            }

            totalVerts += numVertices;
            totalTris += idxBuf.length / 3;
          }
          meshIndex++;
        });

        ifcApi.CloseModel(modelID);

        if (!mounted) return;

        if (geomMap.size === 0) {
          setIfcParseError('web-ifc parsed 0 3D geometric meshes from REFERENCE-BIM-0001.ifc.');
        } else {
          ifcGeometriesRef.current = geomMap;
          setIfcLoaded(true);
          setIfcStats({ meshesCount: meshIndex, verticesCount: totalVerts, trianglesCount: totalTris });
        }

        setLoading(false);
      } catch (err: any) {
        if (mounted) {
          console.error('Failed to parse IFC model with web-ifc:', err);
          setIfcParseError('IFC MODEL PARSE FAILED: ' + (err.message || String(err)));
          setLoading(false);
        }
      }
    }

    loadReferenceModelAndIfc();

    return () => {
      mounted = false;
    };
  }, []);

  // Initialize WebGL 3D Scene
  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#070a12'); // Deep CAD viewport navy-black
    sceneRef.current = scene;

    // Cameras
    const cameraPersp = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    cameraPersp.position.set(22, 16, 26);
    cameraPerspRef.current = cameraPersp;

    const aspect = width / height;
    const orthoSize = 15;
    const cameraOrtho = new THREE.OrthographicCamera(
      -orthoSize * aspect,
      orthoSize * aspect,
      orthoSize,
      -orthoSize,
      0.1,
      1000
    );
    cameraOrtho.position.set(22, 16, 26);
    cameraOrthoRef.current = cameraOrtho;

    const activeCamera = cameraType === 'Orthographic' ? cameraOrtho : cameraPersp;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.localClippingEnabled = true; // Enable local section clipping planes
    rendererRef.current = renderer;

    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);

    // Orbit Controls
    const controls = new OrbitControls(activeCamera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 3, 0);
    controlsRef.current = controls;

    // Architectural Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const mainSun = new THREE.DirectionalLight(0xfffdf0, 1.5);
    mainSun.position.set(35, 50, 30);
    mainSun.castShadow = true;
    mainSun.shadow.mapSize.width = 2048;
    mainSun.shadow.mapSize.height = 2048;
    mainSun.shadow.camera.near = 0.5;
    mainSun.shadow.camera.far = 150;
    mainSun.shadow.camera.left = -25;
    mainSun.shadow.camera.right = 25;
    mainSun.shadow.camera.top = 25;
    mainSun.shadow.camera.bottom = -25;
    mainSun.shadow.bias = -0.0001;
    scene.add(mainSun);

    const fillSky = new THREE.DirectionalLight(0x38bdf8, 0.6);
    fillSky.position.set(-30, 35, -25);
    scene.add(fillSky);

    const groundBounce = new THREE.DirectionalLight(0x64748b, 0.3);
    groundBounce.position.set(0, -25, 0);
    scene.add(groundBounce);

    // Architectural Ground Grid
    const gridHelper = new THREE.GridHelper(60, 60, 0x0284c7, 0x1e293b);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    // Raycaster for object picking
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerMove = (e: MouseEvent) => {
      if (!containerRef.current || !sceneRef.current) return;
      const cam = cameraType === 'Orthographic' ? cameraOrthoRef.current : cameraPerspRef.current;
      if (!cam) return;

      const rect = containerRef.current.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / containerRef.current.clientWidth) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / containerRef.current.clientHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, cam);
      const meshes = (Array.from(meshesMapRef.current.values()) as THREE.Mesh[]).filter((m) => m.visible);
      const intersects = raycaster.intersectObjects(meshes);

      if (intersects.length > 0) {
        const hitMesh = intersects[0].object as THREE.Mesh;
        const compId = hitMesh.userData.compId;
        setHoveredCompId(compId);
        containerRef.current.style.cursor = 'pointer';
      } else {
        setHoveredCompId(null);
        containerRef.current.style.cursor = 'default';
      }
    };

    const handlePointerDown = (e: MouseEvent) => {
      if (!containerRef.current || !sceneRef.current) return;
      const cam = cameraType === 'Orthographic' ? cameraOrthoRef.current : cameraPerspRef.current;
      if (!cam) return;

      const rect = containerRef.current.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / containerRef.current.clientWidth) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / containerRef.current.clientHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, cam);
      const meshes = (Array.from(meshesMapRef.current.values()) as THREE.Mesh[]).filter((m) => m.visible);
      const intersects = raycaster.intersectObjects(meshes);

      if (intersects.length > 0) {
        const hitMesh = intersects[0].object as THREE.Mesh;
        const compId = hitMesh.userData.compId;
        setSelectedCompId(compId);
      }
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('mousemove', handlePointerMove);
    domEl.addEventListener('click', handlePointerDown);

    // FPS / Performance Monitoring Loop
    let animId: number;
    let lastTime = performance.now();
    let frameCount = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Measure FPS
      const now = performance.now();
      frameCount++;
      if (now >= lastTime + 1000) {
        setFps(Math.round((frameCount * 1000) / (now - lastTime)));
        frameCount = 0;
        lastTime = now;

        if (rendererRef.current) {
          const info = rendererRef.current.info;
          setTrianglesCount(info.render.triangles);
          setDrawCallsCount(info.render.calls);
          setGeometriesCount(info.memory.geometries);
        }
      }

      const activeCam = cameraType === 'Orthographic' ? cameraOrthoRef.current : cameraPerspRef.current;
      if (controlsRef.current && activeCam) {
        controlsRef.current.update();
        renderer.render(scene, activeCam);
      }
    };
    animate();

    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries[0] || !rendererRef.current) return;
      const { width: w, height: h } = entries[0].contentRect;

      if (cameraPerspRef.current) {
        cameraPerspRef.current.aspect = w / h;
        cameraPerspRef.current.updateProjectionMatrix();
      }
      if (cameraOrthoRef.current) {
        const asp = w / h;
        cameraOrthoRef.current.left = -orthoSize * asp;
        cameraOrthoRef.current.right = orthoSize * asp;
        cameraOrthoRef.current.top = orthoSize;
        cameraOrthoRef.current.bottom = -orthoSize;
        cameraOrthoRef.current.updateProjectionMatrix();
      }
      rendererRef.current.setSize(w, h);
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      cancelAnimationFrame(animId);
      domEl.removeEventListener('mousemove', handlePointerMove);
      domEl.removeEventListener('click', handlePointerDown);
      resizeObserver.disconnect();
      renderer.dispose();
    };
  }, [cameraType]);

  // Update Section Clipping Planes
  useEffect(() => {
    const planes: THREE.Plane[] = [];

    // Cut Y (Horizontal Floor Cut)
    if (sectionYEnabled) {
      planes.push(new THREE.Plane(new THREE.Vector3(0, -1, 0), sectionYValue));
    }
    // Cut X (Transverse Cut)
    if (sectionXEnabled) {
      planes.push(new THREE.Plane(new THREE.Vector3(-1, 0, 0), sectionXValue));
    }
    // Cut Z (Longitudinal Cut)
    if (sectionZEnabled) {
      planes.push(new THREE.Plane(new THREE.Vector3(0, 0, -1), sectionZValue));
    }

    clippingPlanesRef.current = planes;

    // Apply clipping planes to all active meshes
    meshesMapRef.current.forEach((mesh) => {
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach((mat) => {
          mat.clippingPlanes = planes;
          mat.clipShadows = true;
          mat.needsUpdate = true;
        });
      } else if (mesh.material) {
        mesh.material.clippingPlanes = planes;
        mesh.material.clipShadows = true;
        mesh.material.needsUpdate = true;
      }
    });
  }, [sectionYEnabled, sectionYValue, sectionXEnabled, sectionXValue, sectionZEnabled, sectionZValue]);

  // Re-build 3D Meshes from Project Data & Filters
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || !projectData) return;

    // Clear existing meshes
    meshesMapRef.current.forEach((m) => scene.remove(m));
    meshesMapRef.current.clear();

    if (boundingBoxMeshRef.current) {
      scene.remove(boundingBoxMeshRef.current);
      boundingBoxMeshRef.current = null;
    }

    projectData.components.forEach((comp) => {
      // Hide if user explicitly hidden
      if (hiddenCompIds.has(comp.id)) return;

      // Check Isolate filter
      if (isolatedCompId && comp.id !== isolatedCompId) return;

      // Check Category visibility
      const categoryVisible = activeCategories[comp.category] !== false;
      if (!categoryVisible) return;

      // Storey Isolation Logic
      const isCurrentStorey = selectedStoreyId === 'ALL' || comp.storeyId === selectedStoreyId;
      if (!isCurrentStorey && !ghostOtherStoreys) return;

      const [dimX, dimY, dimZ] = comp.dimensions;
      const [posX, posY, posZ] = comp.position;

      // Retrieve real 3D geometry parsed by web-ifc WASM engine
      const geom = ifcGeometriesRef.current.get(comp.id);
      if (!geom) {
        console.warn(`[HERMES BIM Viewport] No web-ifc BufferGeometry found for component ID ${comp.id}`);
        return;
      }

      // Shading / Color Logic
      let colorHex = getCategoryColorHex(comp.category);
      if (colorByMode === 'Inspection') {
        colorHex = comp.inspectionStatus === 'PASSED' ? 0x10b981 : 0xef4444;
      } else if (colorByMode === 'Material') {
        colorHex = getMaterialColorHex(comp.materialSpecIds[0]);
      } else if (colorByMode === 'XRay') {
        colorHex = comp.category === 'Structure' ? 0x64748b : getCategoryColorHex(comp.category);
      }

      const isSelected = selectedCompId === comp.id;
      const isHovered = hoveredCompId === comp.id;

      let opacity = 1.0;
      let transparent = false;

      // Storey ghosting
      if (!isCurrentStorey && ghostOtherStoreys) {
        opacity = 0.15; // Glass ghost
        transparent = true;
      } else if (colorByMode === 'XRay' && (comp.ifcType === 'IfcWallStandardCase' || comp.ifcType === 'IfcRoof')) {
        opacity = 0.25;
        transparent = true;
      } else if (comp.ifcType === 'IfcWallStandardCase' && !isSelected && !isHovered) {
        opacity = 0.88;
        transparent = true;
      }

      const isWireframe = colorByMode === 'Wireframe' || isSelected;

      const material = new THREE.MeshStandardMaterial({
        color: isSelected ? 0x06b6d4 : isHovered ? 0xf59e0b : colorHex,
        roughness: comp.category === 'Structure' ? 0.75 : 0.3,
        metalness: comp.category === 'Plumbing' || comp.category === 'HVAC' ? 0.6 : 0.1,
        transparent,
        opacity,
        wireframe: isWireframe,
        clippingPlanes: clippingPlanesRef.current,
        clipShadows: true,
      });

      const mesh = new THREE.Mesh(geom, material);
      mesh.userData = { compId: comp.id };
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      // Crisp Architectural CAD Edges
      const edges = new THREE.EdgesGeometry(geom);
      const lineMat = new THREE.LineBasicMaterial({
        color: isSelected ? 0x22d3ee : isHovered ? 0xfcd34d : 0x334155,
        linewidth: isSelected ? 2 : 1
      });
      const line = new THREE.LineSegments(edges, lineMat);
      mesh.add(line);

      scene.add(mesh);
      meshesMapRef.current.set(comp.id, mesh);

      // Selected Bounding Box
      if (isSelected) {
        const boxHelper = new THREE.BoxHelper(mesh, 0x06b6d4);
        scene.add(boxHelper);
        boundingBoxMeshRef.current = boxHelper;
      }
    });

    // Auto calculate overall building bounding box and adjust camera target
    if (meshesMapRef.current.size > 0 && controlsRef.current) {
      const overallBox = new THREE.Box3();
      meshesMapRef.current.forEach((m) => {
        m.geometry.computeBoundingBox();
        if (m.geometry.boundingBox) {
          overallBox.union(m.geometry.boundingBox);
        }
      });

      const center = new THREE.Vector3();
      overallBox.getCenter(center);
      controlsRef.current.target.copy(center);
    }
  }, [
    projectData,
    activeCategories,
    selectedCompId,
    hoveredCompId,
    colorByMode,
    selectedStoreyId,
    ghostOtherStoreys,
    isolatedCompId,
    hiddenCompIds
  ]);

  // Handle Revision Timeline Animation Loop
  useEffect(() => {
    let interval: any;
    if (isPlayingTimeline) {
      interval = setInterval(() => {
        setRevisionIndex((prev) => {
          if (prev >= 10) {
            setIsPlayingTimeline(false);
            return 10;
          }
          return prev + 1;
        });
      }, 600);
    }
    return () => clearInterval(interval);
  }, [isPlayingTimeline]);

  // Lookups
  const selectedComponent = projectData?.components.find((c) => c.id === selectedCompId) || null;

  // Camera Presets
  const setPresetView = (preset: 'isometric' | 'top' | 'front' | 'back' | 'left' | 'right') => {
    const cam = cameraType === 'Orthographic' ? cameraOrthoRef.current : cameraPerspRef.current;
    if (!cam || !controlsRef.current) return;

    const target = controlsRef.current.target;
    switch (preset) {
      case 'isometric':
        cam.position.set(22, 16, 26);
        target.set(0, 3, 0);
        break;
      case 'top':
        cam.position.set(0, 35, 0.01);
        target.set(0, 2, 0);
        break;
      case 'front': // South Elevation
        cam.position.set(0, 3, 30);
        target.set(0, 3, 0);
        break;
      case 'back': // North Elevation
        cam.position.set(0, 3, -30);
        target.set(0, 3, 0);
        break;
      case 'left': // West Elevation
        cam.position.set(-30, 3, 0);
        target.set(0, 3, 0);
        break;
      case 'right': // East Elevation
        cam.position.set(30, 3, 0);
        target.set(0, 3, 0);
        break;
    }
    controlsRef.current.update();
  };

  // Focus Camera on Selected Component
  const handleFocusComponent = () => {
    if (!selectedComponent || !controlsRef.current) return;
    const [x, y, z] = selectedComponent.position;
    const [, h] = selectedComponent.dimensions;
    const cam = cameraType === 'Orthographic' ? cameraOrthoRef.current : cameraPerspRef.current;
    if (!cam) return;

    controlsRef.current.target.set(x, y + h / 2, z);
    cam.position.set(x + 8, y + h / 2 + 6, z + 8);
    controlsRef.current.update();
  };

  // Quick Isolate & Hide Actions
  const handleIsolateSelected = () => {
    if (selectedCompId) setIsolatedCompId(selectedCompId === isolatedCompId ? null : selectedCompId);
  };

  const handleHideSelected = () => {
    if (selectedCompId) {
      setHiddenCompIds((prev) => new Set(prev).add(selectedCompId));
    }
  };

  const handleUnhideAll = () => {
    setHiddenCompIds(new Set());
    setIsolatedCompId(null);
  };

  // Toggle Category
  const toggleCategory = (cat: string) => {
    setActiveCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  // Toggle Node in Tree
  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 flex items-center justify-center p-6 font-sans">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-600 animate-spin mx-auto flex items-center justify-center font-bold text-white shadow-lg shadow-cyan-500/20">
            H
          </div>
          <p className="text-sm font-bold text-slate-200">Loading REFERENCE-BIM-0001 OpenBIM Workspace...</p>
          <p className="text-xs text-slate-400 font-mono">Parsing canonical IFC geometry, spatial tree & materials graph</p>
        </div>
      </div>
    );
  }

  if (error || !projectData) {
    return (
      <div className="p-6 bg-slate-950 text-red-400 font-mono text-sm border border-red-800 rounded-xl">
        <AlertTriangle className="w-5 h-5 mb-2" />
        {error || 'Failed to initialize OpenBIM project data.'}
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 flex flex-col font-sans select-none overflow-hidden">
      {/* 1. TOP PROFESSIONAL CAD COMMAND BAR */}
      <div className="bg-slate-900 border-b border-slate-800 px-3 py-1.5 flex items-center justify-between gap-3 shrink-0 z-20 overflow-x-auto">
        {/* Left Toolbar Groups */}
        <div className="flex items-center gap-2 text-xs font-mono shrink-0">
          {/* Project Identity Badge */}
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-700/80 px-2.5 py-1 rounded-lg">
            <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="font-bold text-slate-200 truncate max-w-[160px] sm:max-w-[220px]">
              {projectData.projectId}
            </span>
            <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800/60 font-sans">
              READ ONLY REFERENCE
            </span>
          </div>

          <div className="h-4 w-px bg-slate-800 mx-1 hidden sm:block" />

          {/* Storey Selector Filter */}
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
            <span className="text-slate-500 px-1.5 text-[10px] uppercase font-sans">Storey:</span>
            <select
              value={selectedStoreyId}
              onChange={(e) => setSelectedStoreyId(e.target.value)}
              className="bg-slate-900 text-cyan-300 font-bold text-xs px-2 py-0.5 rounded border border-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Levels (Full Building)</option>
              {projectData.spatialHierarchy.storeys.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name} ({st.elevationMeters}m)
                </option>
              ))}
            </select>
            <button
              onClick={() => setGhostOtherStoreys(!ghostOtherStoreys)}
              className={`ml-1 px-1.5 py-0.5 text-[10px] rounded transition ${
                ghostOtherStoreys ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'bg-slate-900 text-slate-500'
              }`}
              title="Ghost non-selected storeys for spatial context"
            >
              {ghostOtherStoreys ? 'Ghost ON' : 'Hide Others'}
            </button>
          </div>

          <div className="h-4 w-px bg-slate-800 mx-1 hidden md:block" />

          {/* Camera View Presets */}
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
            <span className="text-slate-500 px-1.5 text-[10px] uppercase font-sans">View:</span>
            {(['isometric', 'top', 'front', 'left'] as const).map((preset) => (
              <button
                key={preset}
                onClick={() => setPresetView(preset)}
                className="px-2 py-0.5 rounded text-slate-300 hover:text-white hover:bg-slate-800 capitalize transition text-[11px]"
              >
                {preset}
              </button>
            ))}
            <button
              onClick={() => setCameraType(cameraType === 'Perspective' ? 'Orthographic' : 'Perspective')}
              className={`ml-1 px-2 py-0.5 rounded text-[10px] font-bold transition ${
                cameraType === 'Orthographic' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
              title="Toggle Perspective vs Orthographic Camera"
            >
              {cameraType}
            </button>
          </div>

          {/* Shading Color Mode */}
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
            <span className="text-slate-500 px-1.5 text-[10px] uppercase font-sans">Shading:</span>
            {(['Category', 'Material', 'Inspection', 'XRay', 'Wireframe'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setColorByMode(mode)}
                className={`px-2 py-0.5 rounded transition ${
                  colorByMode === mode ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Section Cut Drawer Toggle */}
          <button
            onClick={() => setSectionBarOpen(!sectionBarOpen)}
            className={`px-2.5 py-1 rounded-lg border text-xs font-bold transition flex items-center gap-1.5 ${
              sectionBarOpen || sectionYEnabled || sectionXEnabled || sectionZEnabled
                ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
            }`}
            title="Toggle Interactive Sectioning Planes"
          >
            <Scissors className="w-3.5 h-3.5 text-amber-400" />
            <span>Sectioning</span>
          </button>
        </div>

        {/* Right Action Launcher & Telemetry */}
        <div className="flex items-center gap-2 shrink-0 font-mono text-xs">
          {/* Live Telemetry Badge */}
          <div className="hidden lg:flex items-center gap-3 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-[10px] text-slate-400">
            <span className="flex items-center gap-1 text-emerald-400 font-bold">
              <Activity className="w-3 h-3" /> {fps} FPS
            </span>
            <span>Tris: {(trianglesCount / 1000).toFixed(1)}k</span>
            <span>Calls: {drawCallsCount}</span>
          </div>

          {onOpenSystemDrawer && (
            <button
              onClick={onOpenSystemDrawer}
              className="px-3 py-1 bg-slate-950 hover:bg-slate-800 border border-cyan-800/80 text-cyan-300 font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-md shadow-cyan-950/40"
            >
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>HERMES SYSTEM ⚙</span>
            </button>
          )}
        </div>
      </div>

      {/* 1B. INTERACTIVE SECTION CUTTING CONTROL DRAWER */}
      {sectionBarOpen && (
        <div className="bg-slate-900/95 border-b border-amber-900/60 px-4 py-2 flex flex-wrap items-center gap-6 text-xs font-mono z-20 shrink-0">
          <span className="text-amber-400 font-bold flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
            <Scissors className="w-4 h-4" /> Real-time BIM Section Planes:
          </span>

          {/* Cut Y (Top/Floor Cut) */}
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            <input
              type="checkbox"
              id="cutY"
              checked={sectionYEnabled}
              onChange={(e) => setSectionYEnabled(e.target.checked)}
              className="accent-amber-500 cursor-pointer"
            />
            <label htmlFor="cutY" className="text-slate-200 font-bold cursor-pointer">
              Y Cut (Height):
            </label>
            <input
              type="range"
              min={0}
              max={8}
              step={0.1}
              value={sectionYValue}
              onChange={(e) => setSectionYValue(Number(e.target.value))}
              disabled={!sectionYEnabled}
              className="w-28 accent-amber-500 cursor-pointer disabled:opacity-40"
            />
            <span className="text-amber-300 font-bold w-12">{sectionYValue.toFixed(1)}m</span>
          </div>

          {/* Cut X (Transverse Cut) */}
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            <input
              type="checkbox"
              id="cutX"
              checked={sectionXEnabled}
              onChange={(e) => setSectionXEnabled(e.target.checked)}
              className="accent-amber-500 cursor-pointer"
            />
            <label htmlFor="cutX" className="text-slate-200 font-bold cursor-pointer">
              X Cut:
            </label>
            <input
              type="range"
              min={-8}
              max={8}
              step={0.1}
              value={sectionXValue}
              onChange={(e) => setSectionXValue(Number(e.target.value))}
              disabled={!sectionXEnabled}
              className="w-28 accent-amber-500 cursor-pointer disabled:opacity-40"
            />
            <span className="text-amber-300 font-bold w-12">{sectionXValue.toFixed(1)}m</span>
          </div>

          {/* Cut Z (Longitudinal Cut) */}
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            <input
              type="checkbox"
              id="cutZ"
              checked={sectionZEnabled}
              onChange={(e) => setSectionZEnabled(e.target.checked)}
              className="accent-amber-500 cursor-pointer"
            />
            <label htmlFor="cutZ" className="text-slate-200 font-bold cursor-pointer">
              Z Cut:
            </label>
            <input
              type="range"
              min={-8}
              max={8}
              step={0.1}
              value={sectionZValue}
              onChange={(e) => setSectionZValue(Number(e.target.value))}
              disabled={!sectionZEnabled}
              className="w-28 accent-amber-500 cursor-pointer disabled:opacity-40"
            />
            <span className="text-amber-300 font-bold w-12">{sectionZValue.toFixed(1)}m</span>
          </div>

          <button
            onClick={() => {
              setSectionYEnabled(false);
              setSectionXEnabled(false);
              setSectionZEnabled(false);
            }}
            className="text-[10px] text-slate-400 hover:text-white underline"
          >
            Clear Section Cuts
          </button>
        </div>
      )}

      {/* 2. MAIN FULL-BLEED WORKSPACE AREA */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* LEFT MODEL TREE SIDEBAR */}
        <div
          className={`${
            leftTreeOpen ? 'w-72 sm:w-80' : 'w-0'
          } bg-slate-900 border-r border-slate-800 transition-all duration-200 ease-in-out flex flex-col shrink-0 z-10 overflow-hidden`}
        >
          {/* Tree Header */}
          <div className="p-3 border-b border-slate-800 flex items-center justify-between gap-2 bg-slate-950/50">
            <div className="flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">IFC Spatial Tree</span>
            </div>
            <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
              {projectData.components.length} Entities
            </span>
          </div>

          {/* Search Box */}
          <div className="p-2 border-b border-slate-800">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search entities or IFC types..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 text-slate-200 text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-800 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          {/* Canonical Hierarchy Tree */}
          <div className="flex-1 overflow-y-auto p-2 text-xs font-mono space-y-1">
            {/* Root Building Node */}
            <div>
              <button
                onClick={() => toggleNode('building-root')}
                className="w-full text-left px-2 py-1.5 rounded hover:bg-slate-800 flex items-center gap-1.5 text-cyan-300 font-bold"
              >
                {expandedNodes['building-root'] ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
                <Building className="w-3.5 h-3.5 text-cyan-400" />
                <span className="truncate">{projectData.spatialHierarchy.buildingId}</span>
              </button>

              {expandedNodes['building-root'] && (
                <div className="ml-4 pl-2 border-l border-slate-800 space-y-1 mt-1">
                  {projectData.spatialHierarchy.storeys.map((storey) => {
                    const storeyCompList = projectData.components.filter((c) => c.storeyId === storey.id);
                    const isExpanded = expandedNodes[storey.id];

                    return (
                      <div key={storey.id}>
                        <button
                          onClick={() => toggleNode(storey.id)}
                          className={`w-full text-left px-2 py-1.5 rounded hover:bg-slate-800 flex items-center justify-between text-slate-300 ${
                            selectedStoreyId === storey.id ? 'bg-cyan-950/60 border border-cyan-800/60 font-bold' : ''
                          }`}
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            {isExpanded ? (
                              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                            )}
                            <Layers className="w-3.5 h-3.5 text-amber-400" />
                            <span className="truncate font-semibold">{storey.name}</span>
                          </div>
                          <span className="text-[10px] text-slate-500">{storeyCompList.length}</span>
                        </button>

                        {isExpanded && (
                          <div className="ml-4 pl-2 border-l border-slate-800 space-y-0.5 mt-0.5">
                            {storeyCompList
                              .filter(
                                (c) =>
                                  !searchQuery ||
                                  c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                  c.ifcType.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                  c.id.toLowerCase().includes(searchQuery.toLowerCase())
                              )
                              .map((comp) => {
                                const isSelected = selectedCompId === comp.id;
                                return (
                                  <button
                                    key={comp.id}
                                    onClick={() => setSelectedCompId(comp.id)}
                                    className={`w-full text-left px-2 py-1.5 rounded text-[11px] flex items-center justify-between transition ${
                                      isSelected
                                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/80 font-bold'
                                        : 'hover:bg-slate-800/60 text-slate-400'
                                    }`}
                                  >
                                    <div className="truncate flex items-center gap-1.5">
                                      <div
                                        className="w-2 h-2 rounded-full shrink-0"
                                        style={{ backgroundColor: `#${getCategoryColorHex(comp.category).toString(16)}` }}
                                      />
                                      <span className="truncate">{comp.name}</span>
                                    </div>
                                    <span className="text-[9px] text-slate-500 ml-1 shrink-0">
                                      {comp.ifcType.replace('Ifc', '')}
                                    </span>
                                  </button>
                                );
                              })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Toggle Left Tree Button */}
        <button
          onClick={() => setLeftTreeOpen(!leftTreeOpen)}
          className="absolute left-0 top-3 z-20 p-1.5 bg-slate-900 border border-slate-700 rounded-r-lg text-slate-400 hover:text-slate-200 shadow-xl"
          title={leftTreeOpen ? 'Collapse Model Tree' : 'Expand Model Tree'}
        >
          {leftTreeOpen ? <X className="w-4 h-4" /> : <FolderTree className="w-4 h-4 text-cyan-400" />}
        </button>

        {/* CENTER WebGL BIM VIEWPORT */}
        <div className="flex-1 relative bg-slate-950">
          <div ref={containerRef} className="w-full h-full relative" />

          {/* Diagnostic IFC Model Parse Error Overlay */}
          {ifcParseError && (
            <div className="absolute inset-0 z-30 flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-lg">
              <div className="max-w-xl w-full p-6 bg-red-950/40 border border-red-500/50 rounded-2xl shadow-2xl text-red-200">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="w-7 h-7 text-red-400 shrink-0" />
                  <div>
                    <h3 className="text-lg font-bold font-mono tracking-wider text-red-300">IFC MODEL PARSE FAILED</h3>
                    <p className="text-xs font-mono text-red-400/80">web-ifc WebAssembly Geometry Pipeline Diagnostic</p>
                  </div>
                </div>
                <div className="p-4 bg-slate-900/90 rounded-xl border border-red-900/60 font-mono text-xs text-red-300 whitespace-pre-wrap overflow-x-auto mb-4">
                  {ifcParseError}
                </div>
                <div className="text-[11px] font-mono text-slate-400">
                  Direct primitive BoxGeometry fallback is strictly disabled per Hermes Architecture Directives. Please ensure valid IFC4 3D geometry representations exist in REFERENCE-BIM-0001.ifc.
                </div>
              </div>
            </div>
          )}

          {/* Floating System Category Filter Overlay */}
          <div className="absolute top-3 left-4 z-10 flex flex-wrap gap-1.5 p-2 bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-800 shadow-xl max-w-xl">
            {(['Architecture', 'Structure', 'Plumbing', 'HVAC', 'Electrical'] as const).map((cat) => {
              const active = activeCategories[cat];
              return (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`px-2.5 py-1 text-[11px] font-mono rounded-lg border transition-all flex items-center gap-1.5 ${
                    active
                      ? 'bg-slate-800 text-slate-100 border-cyan-500/40 shadow-sm'
                      : 'bg-slate-950/60 text-slate-500 border-slate-800 hover:text-slate-300'
                  }`}
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: active ? `#${getCategoryColorHex(cat).toString(16)}` : '#64748b' }}
                  />
                  <span>{cat}</span>
                  {active ? <Eye className="w-3 h-3 text-cyan-400" /> : <EyeOff className="w-3 h-3 text-slate-600" />}
                </button>
              );
            })}
          </div>

          {/* Floating Hover HUD Badge */}
          {hoveredCompId && (
            <div className="absolute bottom-4 left-4 z-10 bg-slate-900/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-700 text-xs font-mono text-amber-300 shadow-xl flex items-center gap-2">
              <Box className="w-4 h-4 text-amber-400" />
              <span>Hover: {hoveredCompId}</span>
            </div>
          )}

          {/* Unhide / Isolate Floating Action Indicator */}
          {(isolatedCompId || hiddenCompIds.size > 0) && (
            <div className="absolute bottom-4 right-4 z-10 bg-amber-950/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-amber-800 text-xs font-mono text-amber-300 shadow-xl flex items-center gap-2">
              <span>Filter: {isolatedCompId ? '1 Entity Isolated' : `${hiddenCompIds.size} Hidden`}</span>
              <button
                onClick={handleUnhideAll}
                className="px-2 py-0.5 bg-amber-900 hover:bg-amber-800 text-white font-bold rounded text-[10px]"
              >
                Reset Visibility
              </button>
            </div>
          )}
        </div>

        {/* RIGHT CONTEXTUAL PROPERTY INSPECTOR SIDEBAR */}
        <div
          className={`${
            rightInspectorOpen ? 'w-80 sm:w-96' : 'w-0'
          } bg-slate-900 border-l border-slate-800 transition-all duration-200 ease-in-out flex flex-col shrink-0 z-10 overflow-hidden`}
        >
          {/* Header */}
          <div className="p-3 border-b border-slate-800 flex items-center justify-between gap-2 bg-slate-950/50">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                {selectedComponent ? 'BIM Property Inspector' : 'Project Summary'}
              </span>
            </div>
            <button
              onClick={() => setRightInspectorOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-200 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Inspector Content */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 font-mono text-xs">
            {!selectedComponent ? (
              /* Project Summary View when nothing is selected */
              <div className="space-y-4">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                    <Building className="w-4 h-4" />
                    <span>{projectData.name}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans">{projectData.description}</p>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">
                    Classification & Provenance
                  </span>
                  <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                    <Lock className="w-3.5 h-3.5" />
                    <span>{projectData.classification}</span>
                  </div>
                  <p className="text-[10px] text-slate-400">{projectData.license}</p>
                  <p className="text-[10px] text-slate-500">Source: {projectData.sourceUri}</p>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">
                    Spatial Hierarchy Metrics
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 bg-slate-900 rounded border border-slate-800">
                      <span className="text-slate-500 block text-[9px]">Storeys</span>
                      <span className="text-cyan-300 font-bold text-sm">
                        {projectData.spatialHierarchy.storeys.length}
                      </span>
                    </div>
                    <div className="p-2 bg-slate-900 rounded border border-slate-800">
                      <span className="text-slate-500 block text-[9px]">Spaces</span>
                      <span className="text-cyan-300 font-bold text-sm">
                        {projectData.spatialHierarchy.storeys.reduce((s, st) => s + st.spaces.length, 0)}
                      </span>
                    </div>
                    <div className="p-2 bg-slate-900 rounded border border-slate-800">
                      <span className="text-slate-500 block text-[9px]">Components</span>
                      <span className="text-emerald-300 font-bold text-sm">{projectData.components.length}</span>
                    </div>
                    <div className="p-2 bg-slate-900 rounded border border-slate-800">
                      <span className="text-slate-500 block text-[9px]">PropertySets</span>
                      <span className="text-amber-300 font-bold text-sm">
                        {projectData.components.reduce((s, c) => s + c.propertySets.length, 0)}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 text-center font-sans">
                  Click any object in the 3D viewport or Model Tree to inspect deep canonical BIM properties.
                </p>
              </div>
            ) : (
              /* Selected Component Inspector */
              <div className="space-y-3">
                {/* Entity Identity & Quick Actions */}
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-cyan-400 font-bold text-sm">{selectedComponent.id}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-900 text-amber-300 border border-slate-800">
                      {selectedComponent.ifcType}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-100 font-sans">{selectedComponent.name}</h4>
                  <p className="text-[11px] text-slate-400">
                    Storey: {selectedComponent.storeyName} • Space: {selectedComponent.spaceName || 'Building Frame'}
                  </p>

                  {/* Toolbar Actions for Selected Component */}
                  <div className="pt-2 border-t border-slate-800/80 flex flex-wrap gap-1.5 text-[10px]">
                    <button
                      onClick={handleFocusComponent}
                      className="px-2 py-1 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 rounded border border-cyan-800 font-bold flex items-center gap-1"
                    >
                      <Crosshair className="w-3 h-3 text-cyan-400" /> Focus View
                    </button>
                    <button
                      onClick={handleIsolateSelected}
                      className={`px-2 py-1 rounded border font-bold flex items-center gap-1 ${
                        isolatedCompId === selectedCompId
                          ? 'bg-amber-950 text-amber-300 border-amber-800'
                          : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      <Eye className="w-3 h-3 text-amber-400" /> Isolate
                    </button>
                    <button
                      onClick={handleHideSelected}
                      className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-slate-400 rounded border border-slate-800 flex items-center gap-1"
                    >
                      <EyeOff className="w-3 h-3" /> Hide
                    </button>
                  </div>
                </div>

                {/* Tabbed Navigation Bar */}
                <div className="flex border-b border-slate-800 text-[10px] font-bold overflow-x-auto">
                  <button
                    onClick={() => setInspectorTab('IDENTITY')}
                    className={`px-2.5 py-1.5 border-b-2 transition ${
                      inspectorTab === 'IDENTITY'
                        ? 'border-cyan-500 text-cyan-300'
                        : 'border-transparent text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    Identity
                  </button>
                  <button
                    onClick={() => setInspectorTab('GEOMETRY')}
                    className={`px-2.5 py-1.5 border-b-2 transition ${
                      inspectorTab === 'GEOMETRY'
                        ? 'border-cyan-500 text-cyan-300'
                        : 'border-transparent text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    Metrics
                  </button>
                  <button
                    onClick={() => setInspectorTab('ASSEMBLY')}
                    className={`px-2.5 py-1.5 border-b-2 transition ${
                      inspectorTab === 'ASSEMBLY'
                        ? 'border-cyan-500 text-cyan-300'
                        : 'border-transparent text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    Assembly
                  </button>
                  <button
                    onClick={() => setInspectorTab('PROPERTYSETS')}
                    className={`px-2.5 py-1.5 border-b-2 transition ${
                      inspectorTab === 'PROPERTYSETS'
                        ? 'border-cyan-500 text-cyan-300'
                        : 'border-transparent text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    Psets
                  </button>
                  <button
                    onClick={() => setInspectorTab('INSPECTION')}
                    className={`px-2.5 py-1.5 border-b-2 transition ${
                      inspectorTab === 'INSPECTION'
                        ? 'border-cyan-500 text-cyan-300'
                        : 'border-transparent text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    Quality
                  </button>
                </div>

                {/* Tab Content Panels */}
                {inspectorTab === 'IDENTITY' && (
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">
                      IFC Identification & Provenance
                    </span>
                    <div className="space-y-1 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-slate-500">IFC GUID:</span>
                        <span className="text-slate-200 font-mono text-[10px]">{selectedComponent.ifcGuid}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Category:</span>
                        <span className="text-cyan-300 font-bold">{selectedComponent.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Host Wall:</span>
                        <span className="text-slate-300">{selectedComponent.hostWallId || 'None'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Source:</span>
                        <span className="text-slate-300">{selectedComponent.provenance.source}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Verified Date:</span>
                        <span className="text-slate-300">{selectedComponent.provenance.verifiedDate}</span>
                      </div>
                    </div>
                  </div>
                )}

                {inspectorTab === 'GEOMETRY' && (
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">
                      Bounding Box & Spatial Coordinates
                    </span>
                    <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                      <div className="p-1.5 bg-slate-900 rounded border border-slate-800">
                        <span className="text-slate-500 text-[9px] block">X-Width</span>
                        <span className="text-slate-200 font-bold">{selectedComponent.dimensions[0]}m</span>
                      </div>
                      <div className="p-1.5 bg-slate-900 rounded border border-slate-800">
                        <span className="text-slate-500 text-[9px] block">Y-Height</span>
                        <span className="text-slate-200 font-bold">{selectedComponent.dimensions[1]}m</span>
                      </div>
                      <div className="p-1.5 bg-slate-900 rounded border border-slate-800">
                        <span className="text-slate-500 text-[9px] block">Z-Length</span>
                        <span className="text-slate-200 font-bold">{selectedComponent.dimensions[2]}m</span>
                      </div>
                    </div>
                    <div className="p-2 bg-slate-900 rounded border border-slate-800 text-[10px] space-y-0.5">
                      <div className="flex justify-between">
                        <span className="text-slate-500">World XYZ Position:</span>
                        <span className="text-cyan-300 font-bold">[{selectedComponent.position.join(', ')}]</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Orientation:</span>
                        <span className="text-slate-200 font-bold">{selectedComponent.orientationDegrees}°</span>
                      </div>
                    </div>
                  </div>
                )}

                {inspectorTab === 'ASSEMBLY' && (
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">
                      Material Specs & Multi-Layer Assembly
                    </span>

                    <div className="space-y-1 text-[11px]">
                      <span className="text-slate-500 block text-[10px]">Material Spec IDs:</span>
                      <div className="flex flex-wrap gap-1">
                        {selectedComponent.materialSpecIds.map((mat) => (
                          <span
                            key={mat}
                            className="px-2 py-0.5 rounded bg-slate-900 text-amber-300 border border-slate-800 text-[10px]"
                          >
                            {mat}
                          </span>
                        ))}
                      </div>
                    </div>

                    {selectedComponent.assemblyLayers && selectedComponent.assemblyLayers.length > 0 ? (
                      <div className="space-y-1.5 pt-2 border-t border-slate-800">
                        <span className="text-[10px] text-cyan-400 font-bold block">
                          Assembly Spec: {selectedComponent.assemblySpecId}
                        </span>
                        {selectedComponent.assemblyLayers.map((layer) => (
                          <div key={layer.layerIndex} className="p-2 bg-slate-900 rounded border border-slate-800 space-y-0.5">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-slate-200 font-bold">
                                L{layer.layerIndex}: {layer.materialName}
                              </span>
                              <span className="text-cyan-400 font-bold">
                                {(layer.thicknessMeters * 1000).toFixed(0)}mm
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 font-sans">Role: {layer.structuralRole}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-500 italic pt-1">Single solid component material representation.</p>
                    )}
                  </div>
                )}

                {inspectorTab === 'PROPERTYSETS' && (
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">
                      Canonical Property Sets ({selectedComponent.propertySets.length})
                    </span>
                    {selectedComponent.propertySets.map((pset, pIdx) => (
                      <div key={pIdx} className="p-2 bg-slate-900 rounded border border-slate-800 space-y-1">
                        <span className="text-[10px] text-cyan-300 font-bold block">{pset.name}</span>
                        <div className="space-y-0.5 text-[10px]">
                          {Object.entries(pset.properties).map(([k, v]) => (
                            <div key={k} className="flex justify-between">
                              <span className="text-slate-400">{k}:</span>
                              <span className="text-slate-200 font-bold">{String(v)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {inspectorTab === 'INSPECTION' && (
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">
                      Quality Control & Performance Ratings
                    </span>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Inspection Status:</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold text-[10px]">
                        {selectedComponent.inspectionStatus}
                      </span>
                    </div>
                    {selectedComponent.fireRatingMinutes && (
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Fire Rating:</span>
                        <span className="text-amber-300 font-bold">{selectedComponent.fireRatingMinutes} mins</span>
                      </div>
                    )}
                    {selectedComponent.thermalResistanceRValue && (
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Thermal Resistance:</span>
                        <span className="text-cyan-300 font-bold">R-{selectedComponent.thermalResistanceRValue}</span>
                      </div>
                    )}
                    {selectedComponent.acousticSTC && (
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Acoustic STC Rating:</span>
                        <span className="text-emerald-300 font-bold">STC {selectedComponent.acousticSTC}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Toggle Right Inspector Button */}
        <button
          onClick={() => setRightInspectorOpen(!rightInspectorOpen)}
          className="absolute right-0 top-3 z-20 p-1.5 bg-slate-900 border border-slate-700 rounded-l-lg text-slate-400 hover:text-slate-200 shadow-xl"
          title={rightInspectorOpen ? 'Collapse Inspector' : 'Expand Inspector'}
        >
          {rightInspectorOpen ? <X className="w-4 h-4" /> : <FileText className="w-4 h-4 text-cyan-400" />}
        </button>
      </div>

      {/* 3. BOTTOM REVISION & CONSTRUCTION TIMELINE DOCK */}
      <div
        className={`${
          bottomTimelineOpen ? 'h-14' : 'h-8'
        } bg-slate-900 border-t border-slate-800 px-4 transition-all duration-200 flex items-center justify-between gap-4 z-20 shrink-0`}
      >
        <button
          onClick={() => setBottomTimelineOpen(!bottomTimelineOpen)}
          className="text-[10px] text-slate-500 hover:text-slate-300 font-mono uppercase tracking-wider flex items-center gap-1 shrink-0"
        >
          {bottomTimelineOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          <span>4D Revision Timeline (REV-{String(revisionIndex).padStart(4, '0')})</span>
        </button>

        {bottomTimelineOpen && (
          <>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsPlayingTimeline(!isPlayingTimeline)}
                className="p-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-lg transition text-xs flex items-center gap-1 font-mono"
              >
                {isPlayingTimeline ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlayingTimeline ? 'Pause' : 'Play Revisions'}</span>
              </button>
              <button
                onClick={() => setRevisionIndex(1)}
                className="p-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 text-xs"
                title="Reset to REV-0001"
              >
                <SkipBack className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex-1 flex items-center gap-3 max-w-xl font-mono text-xs">
              <span className="text-slate-400 shrink-0">REV-{String(revisionIndex).padStart(4, '0')} / REV-0010</span>
              <input
                type="range"
                min={1}
                max={10}
                value={revisionIndex}
                onChange={(e) => setRevisionIndex(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer h-1.5 bg-slate-950 rounded-lg"
              />
            </div>

            <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5 shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Full Canonical Snapshot Verified</span>
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
      return 0x94a3b8; // Slate Light
    case 'Structure':
      return 0x64748b; // Concrete Charcoal
    case 'Plumbing':
      return 0x0284c7; // Deep Cyan Blue
    case 'HVAC':
      return 0xd97706; // Warm Amber Metallic
    case 'Electrical':
      return 0xeab308; // Vivid Gold Yellow
    default:
      return 0x38bdf8;
  }
}

function getMaterialColorHex(specId?: string): number {
  if (!specId) return 0x94a3b8;
  if (specId.includes('CONC')) return 0x64748b;
  if (specId.includes('WOOD') || specId.includes('SPF') || specId.includes('PLY')) return 0xb45309;
  if (specId.includes('STEEL')) return 0x475569;
  if (specId.includes('PVC') || specId.includes('GLASS')) return 0x0284c7;
  return 0x059669;
}
