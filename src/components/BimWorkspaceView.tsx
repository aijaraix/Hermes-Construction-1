import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
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
  Wrench,
  Info,
  Maximize2,
  RotateCcw,
  Sliders,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  X,
  FileText,
  Activity,
  Cpu,
  Sparkles,
  MapPin,
  Tag,
  Ruler,
  FolderTree,
  AlertTriangle,
  Lock,
  CheckCircle2,
  Compass,
  Zap,
  Flame,
  Thermometer,
  Volume2
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
  
  // Drawer / Sheet states
  const [leftTreeOpen, setLeftTreeOpen] = useState<boolean>(true);
  const [rightInspectorOpen, setRightInspectorOpen] = useState<boolean>(true);
  const [bottomTimelineOpen, setBottomTimelineOpen] = useState<boolean>(true);
  
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

  // Timeline & Revision scrubbing
  const [revisionIndex, setRevisionIndex] = useState<number>(10);
  const [isPlayingTimeline, setIsPlayingTimeline] = useState<boolean>(false);

  // Viewport mode
  const [cameraMode, setCameraMode] = useState<'Perspective' | 'Orthographic'>('Perspective');
  const [colorByMode, setColorByMode] = useState<'Default' | 'System' | 'Inspection' | 'Material'>('System');

  // 3D Canvas Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const meshesMapRef = useRef<Map<string, THREE.Mesh>>(new Map());

  // Fetch Reference Model Data
  useEffect(() => {
    let mounted = true;
    fetch('/api/bim/reference-model')
      .then((res) => res.json())
      .then((data: ReferenceBimProject) => {
        if (mounted) {
          setProjectData(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError('Failed to load REFERENCE-BIM-0001 dataset: ' + err.message);
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  // WebGL 3D Scene Initialization
  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#090d16'); // Professional dark CAD viewport canvas
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(22, 16, 26);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 3, 0);
    controlsRef.current = controls;

    // Architectural Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const mainSun = new THREE.DirectionalLight(0xfffbeb, 1.4);
    mainSun.position.set(30, 45, 25);
    mainSun.castShadow = true;
    mainSun.shadow.mapSize.width = 2048;
    mainSun.shadow.mapSize.height = 2048;
    mainSun.shadow.bias = -0.0001;
    scene.add(mainSun);

    const skyFill = new THREE.DirectionalLight(0x38bdf8, 0.5);
    skyFill.position.set(-25, 30, -20);
    scene.add(skyFill);

    const groundBounce = new THREE.DirectionalLight(0x64748b, 0.25);
    groundBounce.position.set(0, -20, 0);
    scene.add(groundBounce);

    // Grid Floor
    const gridHelper = new THREE.GridHelper(60, 60, 0x0284c7, 0x1e293b);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    // Raycaster for object picking
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerMove = (e: MouseEvent) => {
      if (!containerRef.current || !sceneRef.current || !cameraRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / containerRef.current.clientWidth) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / containerRef.current.clientHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, cameraRef.current);
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
      if (!containerRef.current || !sceneRef.current || !cameraRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / containerRef.current.clientWidth) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / containerRef.current.clientHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, cameraRef.current);
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

    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries[0] || !rendererRef.current || !cameraRef.current) return;
      const { width: w, height: h } = entries[0].contentRect;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
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
  }, []);

  // Update 3D Meshes from Project Data & Filters
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || !projectData) return;

    // Clear existing
    meshesMapRef.current.forEach((m) => scene.remove(m));
    meshesMapRef.current.clear();

    projectData.components.forEach((comp) => {
      const categoryVisible = activeCategories[comp.category] !== false;
      if (!categoryVisible) return;

      const [dimX, dimY, dimZ] = comp.dimensions;
      const [posX, posY, posZ] = comp.position;

      let geom: THREE.BufferGeometry;
      if (comp.ifcType === 'IfcPipeSegment' || comp.ifcType === 'IfcCableSegment') {
        geom = new THREE.CylinderGeometry(dimX / 2 || 0.05, dimX / 2 || 0.05, dimY || 2.0, 16);
      } else if (comp.ifcType === 'IfcDuctSegment') {
        geom = new THREE.BoxGeometry(dimX || 0.3, dimY || 0.2, dimZ || 3.0);
      } else if (comp.ifcType === 'IfcColumn') {
        geom = new THREE.BoxGeometry(dimX || 0.15, dimY || 3.0, dimZ || 0.15);
      } else {
        geom = new THREE.BoxGeometry(dimX || 1.0, dimY || 1.0, dimZ || 1.0);
      }

      // Color mapping
      let colorHex = getCategoryColorHex(comp.category);
      if (colorByMode === 'Inspection') {
        colorHex = comp.inspectionStatus === 'PASSED' ? 0x10b981 : 0xef4444;
      } else if (colorByMode === 'Material') {
        colorHex = getMaterialColorHex(comp.materialSpecIds[0]);
      }

      const isSelected = selectedCompId === comp.id;
      const isHovered = hoveredCompId === comp.id;

      let opacity = 1.0;
      let transparent = false;
      if (comp.ifcType === 'IfcWallStandardCase' && !isSelected && !isHovered) {
        opacity = 0.85;
        transparent = true;
      }

      const material = new THREE.MeshStandardMaterial({
        color: isSelected ? 0x06b6d4 : isHovered ? 0xf59e0b : colorHex,
        roughness: comp.category === 'Structure' ? 0.7 : 0.3,
        metalness: comp.category === 'Plumbing' || comp.category === 'HVAC' ? 0.5 : 0.1,
        transparent,
        opacity,
        wireframe: isSelected
      });

      const mesh = new THREE.Mesh(geom, material);
      mesh.position.set(posX, posY + (dimY || 1.0) / 2, posZ);
      if (comp.orientationDegrees) {
        mesh.rotation.y = (comp.orientationDegrees * Math.PI) / 180;
      }
      mesh.userData = { compId: comp.id };
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      // Architectural Edge Outline
      const edges = new THREE.EdgesGeometry(geom);
      const lineMat = new THREE.LineBasicMaterial({
        color: isSelected ? 0x22d3ee : 0x334155,
        linewidth: isSelected ? 2 : 1
      });
      const line = new THREE.LineSegments(edges, lineMat);
      mesh.add(line);

      scene.add(mesh);
      meshesMapRef.current.set(comp.id, mesh);
    });
  }, [projectData, activeCategories, selectedCompId, hoveredCompId, colorByMode]);

  // Handle Timeline Playback
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
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isPlayingTimeline]);

  // Selected Component Lookup
  const selectedComponent = projectData?.components.find((c) => c.id === selectedCompId) || null;

  // Toggle Category Filter
  const toggleCategory = (cat: string) => {
    setActiveCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  // Toggle Tree Expansion
  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  // Reset Camera View
  const handleResetCamera = () => {
    if (controlsRef.current && cameraRef.current) {
      cameraRef.current.position.set(22, 16, 26);
      controlsRef.current.target.set(0, 3, 0);
      controlsRef.current.update();
    }
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
      {/* 1. TOP COMPACT CAD COMMAND BAR */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between gap-3 shrink-0 z-20">
        {/* Left Toolbar Groups */}
        <div className="flex items-center gap-2 overflow-x-auto text-xs font-mono">
          {/* Project Selector Badge */}
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-700/80 px-2.5 py-1 rounded-lg">
            <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="font-bold text-slate-200 truncate max-w-[200px]">{projectData.projectId}</span>
            <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800/60 font-sans">
              READ ONLY REFERENCE
            </span>
          </div>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          {/* View Modes */}
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
            <span className="text-slate-500 px-2 text-[10px] uppercase font-sans">View:</span>
            <button
              onClick={() => setCameraMode('Perspective')}
              className={`px-2 py-0.5 rounded transition ${
                cameraMode === 'Perspective' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Perspective
            </button>
            <button
              onClick={() => setCameraMode('Orthographic')}
              className={`px-2 py-0.5 rounded transition ${
                cameraMode === 'Orthographic' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Ortho
            </button>
          </div>

          {/* Color Shader Mode */}
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
            <span className="text-slate-500 px-2 text-[10px] uppercase font-sans">Color By:</span>
            {(['System', 'Inspection', 'Material'] as const).map((mode) => (
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

          <button
            onClick={handleResetCamera}
            className="p-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 transition flex items-center gap-1 text-[11px]"
            title="Reset Camera Position"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset View
          </button>
        </div>

        {/* Right System Drawer Launcher */}
        <div className="flex items-center gap-2">
          {onOpenSystemDrawer && (
            <button
              onClick={onOpenSystemDrawer}
              className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-cyan-800/60 text-cyan-300 font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-md shadow-cyan-950/40 font-mono"
            >
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>HERMES SYSTEM ⚙</span>
            </button>
          )}
        </div>
      </div>

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
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">IFC Model Tree</span>
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
                placeholder="Search BIM entities..."
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
                {expandedNodes['building-root'] ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
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
                          className="w-full text-left px-2 py-1.5 rounded hover:bg-slate-800 flex items-center justify-between text-slate-300"
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
                            <Layers className="w-3.5 h-3.5 text-amber-400" />
                            <span className="truncate font-semibold">{storey.name}</span>
                          </div>
                          <span className="text-[10px] text-slate-500">{storeyCompList.length}</span>
                        </button>

                        {isExpanded && (
                          <div className="ml-4 pl-2 border-l border-slate-800 space-y-0.5 mt-0.5">
                            {storeyCompList
                              .filter((c) => !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.ifcType.toLowerCase().includes(searchQuery.toLowerCase()))
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
                                    <span className="text-[9px] text-slate-500 ml-1 shrink-0">{comp.ifcType.replace('Ifc', '')}</span>
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

        {/* CENTER WebGL BIM VIEWPORT (70-85% Usable Attention) */}
        <div className="flex-1 relative bg-slate-950">
          <div ref={containerRef} className="w-full h-full relative" />

          {/* Floating Category Filter Overlay */}
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

          {/* Hover HUD Badge */}
          {hoveredCompId && (
            <div className="absolute bottom-4 left-4 z-10 bg-slate-900/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 text-xs font-mono text-amber-300 shadow-xl flex items-center gap-2">
              <Box className="w-3.5 h-3.5 text-amber-400" />
              <span>Hover: {hoveredCompId}</span>
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
                {selectedComponent ? 'Entity Inspector' : 'Project Summary'}
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
          <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs">
            {!selectedComponent ? (
              /* Project Context View when nothing is selected */
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
                    Protection & License
                  </span>
                  <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                    <Lock className="w-3.5 h-3.5" />
                    <span>{projectData.classification}</span>
                  </div>
                  <p className="text-[10px] text-slate-400">{projectData.license}</p>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">
                    Spatial Hierarchy Metrics
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 bg-slate-900 rounded border border-slate-800">
                      <span className="text-slate-500 block text-[9px]">Storeys</span>
                      <span className="text-cyan-300 font-bold text-sm">{projectData.spatialHierarchy.storeys.length}</span>
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
                      <span className="text-slate-500 block text-[9px]">Systems</span>
                      <span className="text-amber-300 font-bold text-sm">5 Category</span>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 text-center font-sans">
                  Click any object in the 3D viewport or Model Tree to inspect deep canonical BIM properties.
                </p>
              </div>
            ) : (
              /* Selected Component Inspector */
              <div className="space-y-4">
                {/* Identity Header */}
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-cyan-400 font-bold">{selectedComponent.id}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-900 text-amber-300 border border-slate-800">
                      {selectedComponent.ifcType}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-100 font-sans mt-1">{selectedComponent.name}</h4>
                  <p className="text-[11px] text-slate-400">
                    Storey: {selectedComponent.storeyName} • Space: {selectedComponent.spaceName || 'Building Frame'}
                  </p>
                </div>

                {/* Metric Dimensions & Coordinates */}
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">
                    Geometry & Location
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
                      <span className="text-slate-500 text-[9px] block">Z-Depth</span>
                      <span className="text-slate-200 font-bold">{selectedComponent.dimensions[2]}m</span>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-400 pt-1">
                    World Position: [{selectedComponent.position.join(', ')}]
                  </div>
                </div>

                {/* Assembly Breakdown (if present) */}
                {selectedComponent.assemblyLayers && selectedComponent.assemblyLayers.length > 0 && (
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">
                      Assembly Layer Specifications ({selectedComponent.assemblySpecId})
                    </span>
                    <div className="space-y-1.5">
                      {selectedComponent.assemblyLayers.map((layer) => (
                        <div key={layer.layerIndex} className="p-2 bg-slate-900 rounded border border-slate-800 space-y-0.5">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-200 font-bold">
                              Layer {layer.layerIndex}: {layer.materialName}
                            </span>
                            <span className="text-cyan-400 font-bold">{layer.thicknessMeters * 1000}mm</span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-sans">Role: {layer.structuralRole}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* PropertySets */}
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

                {/* Quality, Ratings & Provenance */}
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">
                    Inspection & Provenance
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Status:</span>
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
                  <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-900">
                    Creator: {selectedComponent.provenance.creator} ({selectedComponent.provenance.verifiedDate})
                  </div>
                </div>
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
          bottomTimelineOpen ? 'h-16' : 'h-8'
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

            <div className="flex-1 flex items-center gap-3 max-w-2xl font-mono text-xs">
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
      return 0x94a3b8; // Slate
    case 'Structure':
      return 0x64748b; // Concrete
    case 'Plumbing':
      return 0x0284c7; // Blue
    case 'HVAC':
      return 0xd97706; // Amber
    case 'Electrical':
      return 0xeab308; // Gold
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
