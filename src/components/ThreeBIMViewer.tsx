import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { BIMComponent, SystemCategory } from '../types/hermes';
import { Eye, EyeOff, Layers, Play, Pause, RotateCcw, AlertTriangle, CheckCircle, Info, ShieldCheck, DollarSign } from 'lucide-react';

interface ThreeBIMViewerProps {
  components: BIMComponent[];
  selectedComponentId?: string | null;
  onSelectComponent: (comp: BIMComponent | null) => void;
  highlightCategory?: string | null;
  onRepairTicket?: (ticketId: string) => void;
}

export const ThreeBIMViewer: React.FC<ThreeBIMViewerProps> = ({
  components,
  selectedComponentId,
  onSelectComponent,
  highlightCategory,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const meshesMapRef = useRef<Map<string, THREE.Mesh>>(new Map());

  // Controls & Layers
  const [activeLayerFilters, setActiveLayerFilters] = useState<Record<SystemCategory, boolean>>({
    Architecture: true,
    Structure: true,
    Plumbing: true,
    HVAC: true,
    Electrical: true,
    'Fire Protection': true,
    Envelope: true,
    Site: true,
  });

  const [heatmapMode, setHeatmapMode] = useState<boolean>(false);
  const [constructionDay, setConstructionDay] = useState<number>(30);
  const [isPlayingSequence, setIsPlayingSequence] = useState<boolean>(false);
  const [hoveredComp, setHoveredComp] = useState<BIMComponent | null>(null);

  // Initialize Three.js Scene
  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0f172a'); // Sophisticated dark navy canvas
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(35, 25, 45);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
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
    controls.maxPolarAngle = Math.PI / 2 + 0.1; // Don't go far below ground

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(40, 60, 30);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.4);
    fillLight.position.set(-30, 20, -30);
    scene.add(fillLight);

    // Ground Grid & Site Pad
    const gridHelper = new THREE.GridHelper(100, 50, 0x3b82f6, 0x1e293b);
    gridHelper.position.y = -0.01;
    scene.add(gridHelper);

    // Raycaster for object clicking
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerMove = (event: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / containerRef.current.clientWidth) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / containerRef.current.clientHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const meshes = (Array.from(meshesMapRef.current.values()) as THREE.Mesh[]).filter((m) => m.visible);
      const intersects = raycaster.intersectObjects(meshes);

      if (intersects.length > 0) {
        const hitMesh = intersects[0].object as THREE.Mesh;
        const compId = hitMesh.userData.compId;
        const comp = components.find((c) => c.id === compId);
        setHoveredComp(comp || null);
        containerRef.current.style.cursor = 'pointer';
      } else {
        setHoveredComp(null);
        containerRef.current.style.cursor = 'default';
      }
    };

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / containerRef.current.clientWidth) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / containerRef.current.clientHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const meshes = (Array.from(meshesMapRef.current.values()) as THREE.Mesh[]).filter((m) => m.visible);
      const intersects = raycaster.intersectObjects(meshes);

      if (intersects.length > 0) {
        const hitMesh = intersects[0].object as THREE.Mesh;
        const compId = hitMesh.userData.compId;
        const comp = components.find((c) => c.id === compId);
        if (comp) onSelectComponent(comp);
      }
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('mousemove', handlePointerMove);
    domEl.addEventListener('click', handlePointerDown);

    // Animation loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries[0] || !rendererRef.current || !cameraRef.current) return;
      const { width: w, height: h } = entries[0].contentRect;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      cancelAnimationFrame(animationFrameId);
      domEl.removeEventListener('mousemove', handlePointerMove);
      domEl.removeEventListener('click', handlePointerDown);
      resizeObserver.disconnect();
      renderer.dispose();
    };
  }, []);

  // Update Meshes when Components or Filters change
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Clear old component meshes
    meshesMapRef.current.forEach((mesh) => scene.remove(mesh));
    meshesMapRef.current.clear();

    components.forEach((comp) => {
      const visibleLayer = activeLayerFilters[comp.system] !== false;
      const visibleTimeline = comp.installationStageDay <= constructionDay;

      if (!visibleLayer || !visibleTimeline) return;

      const rawDims = comp.geometry?.dimensions || [1, 1, 1];
      const rawPos = comp.geometry?.position || [0, 0, 0];

      const w = typeof rawDims[0] === 'number' && Number.isFinite(rawDims[0]) && rawDims[0] > 0 ? rawDims[0] : 1;
      const h = typeof rawDims[1] === 'number' && Number.isFinite(rawDims[1]) && rawDims[1] > 0 ? rawDims[1] : 1;
      const d = typeof rawDims[2] === 'number' && Number.isFinite(rawDims[2]) && rawDims[2] > 0 ? rawDims[2] : 1;

      const x = typeof rawPos[0] === 'number' && Number.isFinite(rawPos[0]) ? rawPos[0] : 0;
      const y = typeof rawPos[1] === 'number' && Number.isFinite(rawPos[1]) ? rawPos[1] : 0;
      const z = typeof rawPos[2] === 'number' && Number.isFinite(rawPos[2]) ? rawPos[2] : 0;

      let geom: THREE.BufferGeometry;
      if (comp.type === 'pipe' || comp.type === 'conduit') {
        const radius = Math.max(0.05, w / 2);
        const cylHeight = Math.max(0.1, d);
        geom = new THREE.CylinderGeometry(radius, radius, cylHeight, 12);
      } else if (comp.type === 'duct') {
        geom = new THREE.BoxGeometry(w, h, Math.max(0.1, d));
      } else {
        geom = new THREE.BoxGeometry(w, h, d);
      }

      // Material color selection
      let colorHex = getSystemColorHex(comp.system);
      if (heatmapMode) {
        if (comp.inspectionState === 'failed') colorHex = 0xef4444; // Red
        else if (comp.inspectionState === 'repaired') colorHex = 0x3b82f6; // Blue
        else colorHex = 0x22c55e; // Green
      } else if (highlightCategory && comp.materials.some((m) => m.name.toLowerCase().includes(highlightCategory.toLowerCase()))) {
        colorHex = 0xf59e0b; // Vibrant Amber
      }

      const isSelected = selectedComponentId === comp.id;

      const mat = new THREE.MeshStandardMaterial({
        color: colorHex,
        roughness: comp.system === 'Structure' ? 0.8 : 0.3,
        metalness: comp.system === 'HVAC' || comp.system === 'Plumbing' ? 0.6 : 0.1,
        transparent: comp.type === 'wall' && !isSelected,
        opacity: comp.type === 'wall' && !isSelected ? 0.75 : 1.0,
        wireframe: isSelected,
      });

      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.set(x, y + h / 2, z);
      mesh.userData = { compId: comp.id };
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      scene.add(mesh);
      meshesMapRef.current.set(comp.id, mesh);
    });
  }, [components, activeLayerFilters, heatmapMode, constructionDay, selectedComponentId, highlightCategory]);

  // 4D Timeline animation player
  useEffect(() => {
    let interval: any;
    if (isPlayingSequence) {
      interval = setInterval(() => {
        setConstructionDay((prev) => {
          if (prev >= 30) {
            setIsPlayingSequence(false);
            return 30;
          }
          return prev + 1;
        });
      }, 300);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPlayingSequence]);

  const toggleLayer = (cat: SystemCategory) => {
    setActiveLayerFilters((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  return (
    <div className="relative w-full h-[620px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl flex flex-col">
      {/* 3D Canvas Area */}
      <div ref={containerRef} className="w-full h-full relative flex-1" />

      {/* Floating Header HUD */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2 items-center bg-slate-900/90 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-700/80 shadow-lg text-slate-200">
        <span className="text-xs font-semibold tracking-wider uppercase text-cyan-400 flex items-center gap-1.5">
          <Layers className="w-4 h-4" /> 3D Digital Twin Viewer
        </span>
        <div className="h-4 w-px bg-slate-700 mx-1" />
        <span className="text-xs text-slate-400">Objects: {components.length}</span>

        {hoveredComp && (
          <div className="text-xs bg-slate-800 px-2.5 py-1 rounded border border-slate-600 text-amber-300 font-mono">
            Hover: {hoveredComp.id} ({hoveredComp.system})
          </div>
        )}
      </div>

      {/* Floating Inspection Heatmap Toggle */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button
          onClick={() => setHeatmapMode(!heatmapMode)}
          className={`px-3 py-2 text-xs font-medium rounded-xl border shadow-md transition-all flex items-center gap-2 ${
            heatmapMode
              ? 'bg-red-500/20 text-red-300 border-red-500/50 ring-2 ring-red-500/30'
              : 'bg-slate-900/90 text-slate-300 border-slate-700 hover:bg-slate-800'
          }`}
        >
          {heatmapMode ? <AlertTriangle className="w-4 h-4 text-red-400 animate-pulse" /> : <ShieldCheck className="w-4 h-4 text-emerald-400" />}
          {heatmapMode ? 'Inspection Heatmap ON' : 'Normal View'}
        </button>
      </div>

      {/* System Layer Filter Bar */}
      <div className="absolute bottom-16 left-4 z-10 flex flex-wrap gap-1.5 p-2 bg-slate-900/95 backdrop-blur-md rounded-xl border border-slate-800 max-w-2xl shadow-xl">
        {(['Architecture', 'Structure', 'Plumbing', 'HVAC', 'Electrical', 'Envelope'] as SystemCategory[]).map((sys) => {
          const active = activeLayerFilters[sys];
          return (
            <button
              key={sys}
              onClick={() => toggleLayer(sys)}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-all flex items-center gap-1.5 ${
                active
                  ? 'bg-slate-800 text-slate-100 border-cyan-500/40 shadow-sm'
                  : 'bg-slate-950/60 text-slate-500 border-slate-800 hover:text-slate-300'
              }`}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: active ? `#${getSystemColorHex(sys).toString(16)}` : '#64748b' }}
              />
              {sys}
              {active ? <Eye className="w-3 h-3 text-cyan-400" /> : <EyeOff className="w-3 h-3 text-slate-600" />}
            </button>
          );
        })}
      </div>

      {/* 4D Construction Timeline Control Bar */}
      <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-4 z-10">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlayingSequence(!isPlayingSequence)}
            className="p-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition shadow flex items-center gap-1.5 text-xs font-semibold"
          >
            {isPlayingSequence ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isPlayingSequence ? 'Pause Build' : '4D Build Play'}
          </button>
          <button
            onClick={() => {
              setConstructionDay(1);
              setIsPlayingSequence(false);
            }}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition text-xs flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Day 1
          </button>
        </div>

        <div className="flex-1 flex items-center gap-3">
          <span className="text-xs text-slate-400 font-mono w-24">Build Day: {constructionDay} / 30</span>
          <input
            type="range"
            min={1}
            max={30}
            value={constructionDay}
            onChange={(e) => setConstructionDay(Number(e.target.value))}
            className="w-full accent-cyan-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
          />
        </div>

        <div className="text-xs text-slate-400 flex items-center gap-3">
          <span className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded bg-emerald-500" /> Passed</span>
          <span className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded bg-red-500" /> Ticket</span>
          <span className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded bg-blue-500" /> Repaired</span>
        </div>
      </div>
    </div>
  );
};

function getSystemColorHex(system: SystemCategory): number {
  switch (system) {
    case 'Architecture':
      return 0x94a3b8; // Slate Light
    case 'Structure':
      return 0x64748b; // Concrete Charcoal
    case 'Plumbing':
      return 0x0284c7; // Deep Marine Blue
    case 'HVAC':
      return 0xd97706; // Warm Amber Metallic
    case 'Electrical':
      return 0xeab308; // Vivid Gold Yellow
    case 'Fire Protection':
      return 0xdc2626; // Fire Crimson
    case 'Envelope':
      return 0x059669; // Emerald Water Barrier
    case 'Site':
      return 0x475569;
    default:
      return 0x38bdf8;
  }
}
