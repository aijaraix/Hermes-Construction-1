import React, { useEffect, useState, useRef } from 'react';
import * as THREE from 'three';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Camera,
  User,
  MessageSquare,
  CheckCircle2,
  Sparkles,
  Navigation,
  HelpCircle,
  FileText,
  Building2,
  Activity,
  Layers,
  ChevronRight,
  Maximize2,
  Info
} from 'lucide-react';
import { ProjectEventRecord, EventVisualizationContract } from '../types/hermes';

interface Phase2WorldOverlayProps {
  camera: THREE.PerspectiveCamera | null;
  controls: any;
  containerRef: React.RefObject<HTMLDivElement>;
  activeProjectId: string;
  house0002RawData: any;
  replayEvents: ProjectEventRecord[];
  currentEventIndex: number;
  isPlayingTimeline: boolean;
  setIsPlayingTimeline: (v: boolean) => void;
  setCurrentEventIndex: React.Dispatch<React.SetStateAction<number>>;
  replaySpeed: number;
  setReplaySpeed: (speed: number) => void;
  autoCameraEnabled: boolean;
  setAutoCameraEnabled: (v: boolean) => void;
  scene: THREE.Scene | null;
  onSelectComponent?: (compId: string) => void;
}

// Facility Catalog Mapping with Short Names and Theme Colors
const FACILITY_CATALOG: Record<string, { shortName: string; category: string; color: string; bgColor: string }> = {
  'FACILITY-INTAKE-01': { shortName: 'CUSTOMER BRIEFING', category: 'Executive', color: 'text-amber-600', bgColor: 'bg-amber-500/10 border-amber-500/40 text-amber-300' },
  'FACILITY-OPS-01': { shortName: 'EXECUTIVE & PRIME', category: 'Executive', color: 'text-amber-500', bgColor: 'bg-amber-500/10 border-amber-500/40 text-amber-300' },
  'FACILITY-PM-01': { shortName: 'PM & SCHEDULING', category: 'Management', color: 'text-blue-400', bgColor: 'bg-blue-500/10 border-blue-500/40 text-blue-300' },
  'FACILITY-ARCH-01': { shortName: 'ARCHITECTURE STUDIO', category: 'Design', color: 'text-purple-400', bgColor: 'bg-purple-500/10 border-purple-500/40 text-purple-300' },
  'FACILITY-STRUCT-01': { shortName: 'STRUCTURAL LAB', category: 'Engineering', color: 'text-orange-400', bgColor: 'bg-orange-500/10 border-orange-500/40 text-orange-300' },
  'FACILITY-CIVIL-01': { shortName: 'CIVIL & SURVEY', category: 'Engineering', color: 'text-yellow-400', bgColor: 'bg-yellow-500/10 border-yellow-500/40 text-yellow-300' },
  'FACILITY-CONCRETE-01': { shortName: 'CONCRETE WORKSHOP', category: 'Trades', color: 'text-stone-400', bgColor: 'bg-stone-500/10 border-stone-500/40 text-stone-300' },
  'FACILITY-FRAMING-01': { shortName: 'TIMBER & FRAMING', category: 'Trades', color: 'text-amber-700', bgColor: 'bg-amber-700/10 border-amber-700/40 text-amber-300' },
  'FACILITY-ROOFING-01': { shortName: 'ROOFING & ENVELOPE', category: 'Trades', color: 'text-slate-400', bgColor: 'bg-slate-500/10 border-slate-500/40 text-slate-300' },
  'FACILITY-PLUMBING-01': { shortName: 'PLUMBING OFFICE', category: 'MEP', color: 'text-blue-500', bgColor: 'bg-blue-600/10 border-blue-500/40 text-blue-300' },
  'FACILITY-ELEC-01': { shortName: 'ELECTRICAL & SOLAR', category: 'MEP', color: 'text-yellow-300', bgColor: 'bg-yellow-400/10 border-yellow-400/40 text-yellow-200' },
  'FACILITY-HVAC-01': { shortName: 'HVAC & MECHANICAL', category: 'MEP', color: 'text-cyan-400', bgColor: 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300' },
  'FACILITY-FIRE-01': { shortName: 'FIRE PROTECTION', category: 'Safety', color: 'text-red-400', bgColor: 'bg-red-500/10 border-red-500/40 text-red-300' },
  'FACILITY-FINISH-01': { shortName: 'FINISHES STUDIO', category: 'Interiors', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300' },
  'FACILITY-MAT-01': { shortName: 'MATERIALS STAGING', category: 'Logistics', color: 'text-amber-600', bgColor: 'bg-amber-600/10 border-amber-600/40 text-amber-300' },
  'FACILITY-QUALITY-01': { shortName: 'QUALITY & INSPECTION', category: 'Quality', color: 'text-rose-500', bgColor: 'bg-rose-500/10 border-rose-500/40 text-rose-300' },
  'FACILITY-LEARNING-01': { shortName: 'KNOWLEDGE ACADEMY', category: 'Academy', color: 'text-teal-400', bgColor: 'bg-teal-500/10 border-teal-500/40 text-teal-300' },
  'FACILITY-DIAG-01': { shortName: 'SYSTEM DIAGNOSTICS', category: 'Quality', color: 'text-indigo-400', bgColor: 'bg-indigo-500/10 border-indigo-500/40 text-indigo-300' },
};

export const Phase2WorldOverlay: React.FC<Phase2WorldOverlayProps> = ({
  camera,
  controls,
  containerRef,
  activeProjectId,
  house0002RawData,
  replayEvents,
  currentEventIndex,
  isPlayingTimeline,
  setIsPlayingTimeline,
  setCurrentEventIndex,
  replaySpeed,
  setReplaySpeed,
  autoCameraEnabled,
  setAutoCameraEnabled,
  scene,
  onSelectComponent,
}) => {
  const [screenCoords, setScreenCoords] = useState<Record<string, { x: number; y: number; inFrustum: boolean }>>({});
  const [dimensions, setDimensions] = useState({ width: 1000, height: 700 });
  const [selectedInspectorEvent, setSelectedInspectorEvent] = useState<ProjectEventRecord | null>(null);
  const [showTranscriptModal, setShowTranscriptModal] = useState(false);
  const [eventProgress, setEventProgress] = useState(1.0);
  const [followActiveAgent, setFollowActiveAgent] = useState(false);

  const arcGroupRef = useRef<THREE.Group | null>(null);
  const pathGroupRef = useRef<THREE.Group | null>(null);
  const animatedAgentMeshRef = useRef<THREE.Group | null>(null);

  // Active Replay Event Contract
  const activeEvent: ProjectEventRecord | null = replayEvents.length > 0 ? replayEvents[Math.min(currentEventIndex, replayEvents.length - 1)] : null;
  const contract: EventVisualizationContract | undefined = activeEvent?.visualizationContract;

  // Initialize 3D Arc & Path helper groups
  useEffect(() => {
    if (!scene) return;
    const arcGroup = new THREE.Group();
    arcGroup.name = 'phase2_arcs';
    const pathGroup = new THREE.Group();
    pathGroup.name = 'phase2_paths';

    scene.add(arcGroup);
    scene.add(pathGroup);
    arcGroupRef.current = arcGroup;
    pathGroupRef.current = pathGroup;

    return () => {
      scene.remove(arcGroup);
      scene.remove(pathGroup);
    };
  }, [scene]);

  // Handle Event Transitions & Smooth Camera Director Animation
  useEffect(() => {
    if (!contract) return;

    // Reset progress when event index changes
    setEventProgress(0.0);
    const duration = Math.max(1.0, contract.duration || 3.0) / replaySpeed;
    const startTime = performance.now();

    let rafId: number;
    const updateProgress = () => {
      const elapsed = (performance.now() - startTime) / 1000;
      const progress = Math.min(1.0, elapsed / duration);
      setEventProgress(progress);

      if (progress < 1.0) {
        rafId = requestAnimationFrame(updateProgress);
      }
    };
    rafId = requestAnimationFrame(updateProgress);

    // Auto-Camera Director Smooth Interpolation
    if (autoCameraEnabled && camera && controls && contract.cameraRecommendation) {
      const rec = contract.cameraRecommendation;
      const startCamPos = camera.position.clone();
      const startTarget = controls.target.clone();

      const endCamPos = new THREE.Vector3(...rec.cameraPosition);
      const endTarget = new THREE.Vector3(...rec.targetPosition);

      let camAnimTime = 0;
      const camDuration = 1.2 / replaySpeed;
      const animateCam = () => {
        camAnimTime += 0.016;
        const t = Math.min(1.0, camAnimTime / camDuration);
        const easeT = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

        camera.position.lerpVectors(startCamPos, endCamPos, easeT);
        controls.target.lerpVectors(startTarget, endTarget, easeT);
        controls.update();

        if (t < 1.0) {
          requestAnimationFrame(animateCam);
        }
      };
      animateCam();
    }

    return () => cancelAnimationFrame(rafId);
  }, [currentEventIndex, replaySpeed, autoCameraEnabled]);

  // Build 3D Visual Arcs and Path Overlay for current event
  useEffect(() => {
    if (!arcGroupRef.current || !pathGroupRef.current) return;

    // Clear old visual helpers
    while (arcGroupRef.current.children.length > 0) {
      const child = arcGroupRef.current.children[0];
      arcGroupRef.current.remove(child);
    }
    while (pathGroupRef.current.children.length > 0) {
      const child = pathGroupRef.current.children[0];
      pathGroupRef.current.remove(child);
    }

    if (!contract) return;

    // 1. Draw Dotted Path for MOVE / EXIT_FACILITY / ENTER_FACILITY / TRAVEL
    if (
      ['MOVE', 'EXIT_FACILITY', 'ENTER_FACILITY'].includes(contract.visualizationType) &&
      contract.startWorldPosition &&
      contract.endWorldPosition
    ) {
      const start = new THREE.Vector3(...contract.startWorldPosition);
      const end = new THREE.Vector3(...contract.endWorldPosition);

      // Create ground path geometry
      const points = [start, end];
      const lineGeom = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineDashedMaterial({
        color: 0x38bdf8,
        dashSize: 0.5,
        gapSize: 0.25,
        linewidth: 3,
      });

      const line = new THREE.Line(lineGeom, lineMat);
      line.computeLineDistances();
      pathGroupRef.current.add(line);

      // Ground landing target ring
      const ringGeom = new THREE.RingGeometry(0.6, 0.8, 32);
      ringGeom.rotateX(-Math.PI / 2);
      ringGeom.translate(end.x, 0.05, end.z);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.6 });
      const ringMesh = new THREE.Mesh(ringGeom, ringMat);
      pathGroupRef.current.add(ringMesh);
    }

    // 2. Draw 3D Communication Arcs for COMMUNICATE / QUESTION / ANSWER
    if (
      ['COMMUNICATE', 'QUESTION', 'ANSWER'].includes(contract.visualizationType) &&
      contract.startWorldPosition &&
      contract.endWorldPosition
    ) {
      const start = new THREE.Vector3(...contract.startWorldPosition);
      const end = new THREE.Vector3(...contract.endWorldPosition);

      // Curved quadratic arc height
      const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
      mid.y += Math.max(3.0, start.distanceTo(end) * 0.35);

      const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
      const points = curve.getPoints(30);
      const arcGeom = new THREE.BufferGeometry().setFromPoints(points);

      const arcColor = contract.visualizationType === 'QUESTION' ? 0xf59e0b : contract.visualizationType === 'ANSWER' ? 0x10b981 : 0x06b6d4;
      const arcMat = new THREE.LineBasicMaterial({ color: arcColor, linewidth: 3 });
      const arcLine = new THREE.Line(arcGeom, arcMat);
      arcGroupRef.current.add(arcLine);

      // Pulse sphere along curve
      const sphereGeom = new THREE.SphereGeometry(0.35, 16, 16);
      const sphereMat = new THREE.MeshBasicMaterial({ color: arcColor });
      const pulseSphere = new THREE.Mesh(sphereGeom, sphereMat);
      pulseSphere.position.copy(curve.getPoint(Math.max(0.01, eventProgress)));
      arcGroupRef.current.add(pulseSphere);
    }
  }, [contract, currentEventIndex, eventProgress]);

  // Project 3D Entity Positions to 2D Screen Coordinates on Frame Loop
  useEffect(() => {
    let animId: number;

    const updateProjections = () => {
      if (!containerRef.current || !camera) return;

      const rect = containerRef.current.getBoundingClientRect();
      const w = rect.width || 1000;
      const h = rect.height || 700;
      setDimensions({ width: w, height: h });

      const newCoords: Record<string, { x: number; y: number; inFrustum: boolean }> = {};

      // 1. Facilities
      const spatialEntities = house0002RawData?.spatialEntities || [];
      spatialEntities.forEach((entity: any) => {
        if (entity.positionXYZ) {
          const vec = new THREE.Vector3(entity.positionXYZ[0], (entity.dimensionsXYZ?.[1] || 2.8) + 1.2, entity.positionXYZ[2]);
          vec.project(camera);

          const inFrustum = vec.z < 1.0 && vec.x >= -1.3 && vec.x <= 1.3 && vec.y >= -1.3 && vec.y <= 1.3;
          const x = (vec.x * 0.5 + 0.5) * w;
          const y = (-(vec.y * 0.5) + 0.5) * h;
          newCoords[entity.entityId] = { x, y, inFrustum };
        }
      });

      // 2. Active Agent / Travel Interpolation Position
      if (contract && contract.startWorldPosition && contract.endWorldPosition) {
        const start = new THREE.Vector3(...contract.startWorldPosition);
        const end = new THREE.Vector3(...contract.endWorldPosition);
        const currentPos = new THREE.Vector3().lerpVectors(start, end, eventProgress);

        const vec = currentPos.clone();
        vec.y += 2.0;
        vec.project(camera);

        const inFrustum = vec.z < 1.0 && vec.x >= -1.3 && vec.x <= 1.3 && vec.y >= -1.3 && vec.y <= 1.3;
        const x = (vec.x * 0.5 + 0.5) * w;
        const y = (-(vec.y * 0.5) + 0.5) * h;
        newCoords['ACTIVE_ACTOR'] = { x, y, inFrustum };

        // Lock camera to moving agent if follow mode enabled
        if (followActiveAgent && controls) {
          controls.target.copy(currentPos);
          controls.update();
        }
      }

      setScreenCoords(newCoords);
      animId = requestAnimationFrame(updateProjections);
    };

    animId = requestAnimationFrame(updateProjections);
    return () => cancelAnimationFrame(animId);
  }, [camera, house0002RawData, contract, eventProgress, followActiveAgent, controls]);

  const spatialEntities = house0002RawData?.spatialEntities || [];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-10">
      {/* ============================================================ */}
      {/* PERSISTENT CAUSAL LAYER LEGEND (Requirement D)                */}
      {/* ============================================================ */}
      <div className="absolute top-16 left-4 pointer-events-auto z-40 bg-slate-900/90 border border-slate-700/80 backdrop-blur-md rounded-xl p-2.5 shadow-xl text-[10px] font-mono space-y-1.5 text-slate-200 hidden sm:block">
        <div className="font-bold text-amber-400 uppercase tracking-wider border-b border-slate-800 pb-1 flex items-center gap-1">
          <Layers className="w-3 h-3 text-amber-400" /> Layer Legend
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-sm bg-purple-500 border border-purple-300 opacity-80 shrink-0" />
          <span className="text-purple-200 font-bold">Translucent Purple</span>
          <span className="text-slate-400 text-[9px]">= PROGRAM VOLUMES</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 border border-amber-300 shrink-0" />
          <span className="text-amber-200 font-bold">Solid Material</span>
          <span className="text-slate-400 text-[9px]">= AS-BUILT INSTALLED</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-sm border border-dashed border-sky-400 bg-sky-400/20 shrink-0" />
          <span className="text-sky-200 font-bold">Dashed Wireframe</span>
          <span className="text-slate-400 text-[9px]">= APPROVED DESIGN</span>
        </div>
      </div>

      {/* ============================================================ */}
      {/* PERSISTED OPERATIONAL REASONING SUMMARIES (Requirement E)   */}
      {/* ============================================================ */}
      <div className="absolute top-16 right-4 pointer-events-auto z-40 bg-slate-900/90 border border-purple-500/40 backdrop-blur-md rounded-xl p-2.5 shadow-xl text-[10px] font-mono space-y-1 text-slate-200 max-w-xs hidden lg:block">
        <div className="font-bold text-purple-300 uppercase tracking-wider border-b border-slate-800 pb-1 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-purple-400" /> Engineering Calculations
          </span>
          <span className="text-[9px] px-1 bg-purple-500/20 text-purple-300 rounded">STAGE {currentEventIndex + 1}</span>
        </div>
        <div className="text-slate-300 space-y-1 pt-0.5">
          <div>
            <span className="text-slate-400">ROOM AREA CALC:</span>
            <p className="text-purple-200 font-bold">Target = 1,100 sq ft | Actual = 1,067 sq ft (Δ -33)</p>
          </div>
          <div>
            <span className="text-slate-400">PLUMBING ADJACENCY:</span>
            <p className="text-slate-200">Wet Wall Alignment verified. Branch pipe -3.2m</p>
          </div>
          <div>
            <span className="text-slate-400">STRUCTURAL SELECTION:</span>
            <p className="text-amber-300 font-bold">8" CMU Block + Monolithic Slab (160 MPH Wind)</p>
          </div>
        </div>
      </div>
      {/* ============================================================ */}
      {/* 1. IN-WORLD PERSISTENT FACILITY BILLBOARD LABELS             */}
      {/* ============================================================ */}
      {spatialEntities.map((facility: any) => {
        const coords = screenCoords[facility.entityId];
        if (!coords || !coords.inFrustum) return null;

        const info = FACILITY_CATALOG[facility.entityId] || {
          shortName: facility.name?.toUpperCase() || facility.entityId,
          category: 'Operations',
          color: 'text-slate-300',
          bgColor: 'bg-slate-800/80 border-slate-600 text-slate-200'
        };

        const isTargetOfEvent = contract?.targetEntityIds?.includes(facility.entityId) || contract?.sourceEntityIds?.includes(facility.entityId);

        return (
          <div
            key={facility.entityId}
            style={{
              left: `${coords.x}px`,
              top: `${coords.y}px`,
              transform: 'translate(-50%, -100%)',
            }}
            className="absolute pointer-events-auto transition-transform duration-75 ease-out"
          >
            <div
              onClick={() => onSelectComponent && onSelectComponent(facility.entityId)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border backdrop-blur-md text-[10px] font-mono tracking-wider shadow-lg cursor-pointer transition-all hover:scale-105 hover:z-30 ${
                isTargetOfEvent
                  ? 'bg-amber-500/20 border-amber-400 text-amber-200 ring-2 ring-amber-400/50 animate-pulse'
                  : 'bg-slate-900/85 border-slate-700/80 text-slate-200 hover:border-slate-400'
              }`}
            >
              <Building2 className={`w-3 h-3 ${info.color}`} />
              <div className="flex flex-col">
                <span className="font-bold text-white whitespace-nowrap">{info.shortName}</span>
                <span className="text-[8px] text-slate-400 font-normal">{facility.entityId}</span>
              </div>
            </div>
          </div>
        );
      })}

      {/* ============================================================ */}
      {/* 2. DYNAMIC IN-WORLD ACTION & SPEECH OVERLAY FOR ACTIVE EVENT  */}
      {/* ============================================================ */}
      {contract && screenCoords['ACTIVE_ACTOR'] && screenCoords['ACTIVE_ACTOR'].inFrustum && (
        <div
          style={{
            left: `${screenCoords['ACTIVE_ACTOR'].x}px`,
            top: `${screenCoords['ACTIVE_ACTOR'].y}px`,
            transform: 'translate(-50%, -100%)',
          }}
          className="absolute pointer-events-auto z-40 transition-all duration-100"
        >
          {/* QUESTION OR ANSWER SPEECH BUBBLE */}
          {['QUESTION', 'ANSWER'].includes(contract.visualizationType) && (
            <div className="bg-slate-900/95 border-2 border-amber-400/90 text-white rounded-xl p-3 shadow-2xl max-w-xs text-xs font-sans animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center gap-2 mb-1 border-b border-slate-700/80 pb-1">
                <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-bold text-amber-300 text-[11px] uppercase tracking-wide">
                  {contract.inspectorPayload?.speaker || 'Briefing Dialogue'}
                </span>
              </div>
              <p className="text-slate-100 text-xs italic leading-relaxed font-serif">
                "{contract.inspectorPayload?.text || activeEvent?.message}"
              </p>
            </div>
          )}

          {/* TRAVELING AGENT TAG */}
          {['MOVE', 'EXIT_FACILITY', 'ENTER_FACILITY'].includes(contract.visualizationType) && (
            <div className="flex items-center gap-2 bg-blue-600/90 border border-blue-300 text-white px-3 py-1.5 rounded-full shadow-xl text-xs font-mono backdrop-blur-md">
              <Navigation className="w-3.5 h-3.5 text-blue-200 animate-spin" style={{ animationDuration: '3s' }} />
              <span className="font-bold">{activeEvent?.actorId || 'Agent'}</span>
              <span className="text-blue-200 text-[10px]">
                {Math.round(eventProgress * 100)}%
              </span>
            </div>
          )}

          {/* DECISION CREATED IN-WORLD BADGE */}
          {contract.visualizationType === 'DECIDE' && (
            <div className="bg-gradient-to-r from-amber-600/95 to-amber-700/95 border-2 border-amber-300 text-white rounded-xl p-3 shadow-2xl max-w-sm text-xs font-sans animate-bounce">
              <div className="flex items-center gap-1.5 font-bold text-amber-100 uppercase tracking-wide text-[11px] mb-1">
                <Sparkles className="w-4 h-4 text-amber-200" />
                <span>Prime Structured Decision Recorded</span>
              </div>
              <div className="font-semibold text-white text-xs">
                {contract.inspectorPayload?.selectedOption || activeEvent?.summary}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* 3. EVENT HUD OVERLAY: TOP HUD BANNER                         */}
      {/* ============================================================ */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 pointer-events-auto z-50 flex flex-col items-center gap-2 max-w-2xl w-full px-4">
        <div className="bg-slate-900/90 border border-slate-700/90 backdrop-blur-md text-white rounded-2xl px-4 py-2.5 shadow-2xl w-full flex items-center justify-between gap-3">
          {/* Left: Event Step & Type */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 bg-blue-500/20 border border-blue-400/40 text-blue-300 font-mono font-bold text-[10px] rounded-md uppercase tracking-wider">
                  EVENT {currentEventIndex + 1} / {replayEvents.length || 1}
                </span>
                <span className="font-bold font-mono text-xs text-amber-400">
                  {activeEvent?.eventType || 'READY'}
                </span>
              </div>
              <span className="text-xs text-slate-200 font-medium truncate max-w-md mt-0.5">
                {activeEvent?.summary || 'Phase 2 Live Spatial Operating World'}
              </span>
            </div>
          </div>

          {/* Right: Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Customer Transcript Button */}
            <button
              onClick={() => setShowTranscriptModal(true)}
              title="View Customer Briefing & Interview Transcript"
              className="p-1.5 rounded-lg border border-purple-500/50 bg-purple-500/20 text-purple-300 font-mono text-xs font-bold transition-all flex items-center gap-1 hover:bg-purple-500/30"
            >
              <MessageSquare className="w-3.5 h-3.5 text-purple-300" />
              <span className="hidden sm:inline">TRANSCRIPT</span>
            </button>

            {/* Auto Camera Toggle */}
            <button
              onClick={() => setAutoCameraEnabled(!autoCameraEnabled)}
              title="Toggle In-World Camera Director"
              className={`p-1.5 rounded-lg border text-xs font-mono transition-all flex items-center gap-1 ${
                autoCameraEnabled
                  ? 'bg-amber-500/20 border-amber-400/80 text-amber-300 font-bold'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">CAM</span>
            </button>

            {/* Follow Agent Toggle */}
            <button
              onClick={() => setFollowActiveAgent(!followActiveAgent)}
              title="Follow Active Agent in 3D Space"
              className={`p-1.5 rounded-lg border text-xs font-mono transition-all flex items-center gap-1 ${
                followActiveAgent
                  ? 'bg-blue-500/20 border-blue-400/80 text-blue-300 font-bold'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">FOLLOW</span>
            </button>

            {/* Replay Controls */}
            <div className="flex items-center bg-slate-800/90 border border-slate-700 rounded-lg p-0.5">
              <button
                onClick={() => setCurrentEventIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentEventIndex === 0}
                className="p-1 text-slate-300 hover:text-white disabled:opacity-30 disabled:hover:text-slate-300"
              >
                <SkipBack className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setIsPlayingTimeline(!isPlayingTimeline)}
                className="p-1 px-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded font-bold text-xs flex items-center gap-1"
              >
                {isPlayingTimeline ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              </button>

              <button
                onClick={() => setCurrentEventIndex((prev) => Math.min((replayEvents.length || 1) - 1, prev + 1))}
                disabled={currentEventIndex >= (replayEvents.length || 1) - 1}
                className="p-1 text-slate-300 hover:text-white disabled:opacity-30 disabled:hover:text-slate-300"
              >
                <SkipForward className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Speed selector */}
            <select
              value={replaySpeed}
              onChange={(e) => setReplaySpeed(Number(e.target.value))}
              className="bg-slate-800 border border-slate-700 text-xs text-amber-300 font-mono rounded-lg px-1.5 py-1 focus:outline-none cursor-pointer"
            >
              <option value={0.5}>0.5x</option>
              <option value={1.0}>1.0x</option>
              <option value={2.0}>2.0x</option>
            </select>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-900/60 rounded-full h-1 overflow-hidden border border-slate-800">
          <div
            className="bg-gradient-to-r from-amber-500 to-blue-500 h-full transition-all duration-200"
            style={{ width: `${((currentEventIndex + 1) / Math.max(1, replayEvents.length)) * 100}%` }}
          />
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. BOTTOM ACTION & DIALOGUE DETAIL BANNER                    */}
      {/* ============================================================ */}
      {activeEvent && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-auto z-50 max-w-xl w-full px-4">
          <div className="bg-slate-900/95 border border-slate-700/90 backdrop-blur-md text-white rounded-2xl p-3 shadow-2xl flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400 shrink-0 mt-0.5">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] font-bold text-amber-400 uppercase">
                    ACTOR: {activeEvent.actorId}
                  </span>
                  {activeEvent.truthOrigin && (
                    <span className="text-[9px] font-mono px-1.5 py-0.2 bg-slate-800 text-slate-300 rounded border border-slate-700">
                      {activeEvent.truthOrigin}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-200 mt-0.5 leading-snug">
                  {activeEvent.message || activeEvent.summary}
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedInspectorEvent(activeEvent)}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl text-xs font-mono text-slate-200 flex items-center gap-1 shrink-0 transition-colors"
            >
              <Info className="w-3.5 h-3.5 text-blue-400" />
              <span>Inspect Payload</span>
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 5. EVENT PAYLOAD INSPECTOR MODAL                             */}
      {/* ============================================================ */}
      {selectedInspectorEvent && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 pointer-events-auto">
          <div className="bg-slate-900 border border-slate-700 text-white rounded-2xl max-w-xl w-full p-6 shadow-2xl flex flex-col gap-4 font-sans max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white font-mono">
                  {selectedInspectorEvent.eventId} — {selectedInspectorEvent.eventType}
                </h3>
              </div>
              <button
                onClick={() => setSelectedInspectorEvent(null)}
                className="text-slate-400 hover:text-white text-sm font-bold px-2 py-1 bg-slate-800 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="grid grid-cols-2 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-500">Actor ID:</span>
                  <div className="text-amber-300 font-bold">{selectedInspectorEvent.actorId}</div>
                </div>
                <div>
                  <span className="text-slate-500">Truth Origin:</span>
                  <div className="text-blue-300 font-bold">{selectedInspectorEvent.truthOrigin || 'SIMULATED'}</div>
                </div>
                <div>
                  <span className="text-slate-500">State Before:</span>
                  <div className="text-slate-300">{selectedInspectorEvent.stateBefore || 'N/A'}</div>
                </div>
                <div>
                  <span className="text-slate-500">State After:</span>
                  <div className="text-slate-300">{selectedInspectorEvent.stateAfter || 'N/A'}</div>
                </div>
              </div>

              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">Summary</span>
                <p className="text-slate-200 bg-slate-950 p-3 rounded-xl border border-slate-800 font-sans mt-1">
                  {selectedInspectorEvent.summary || selectedInspectorEvent.message}
                </p>
              </div>

              {selectedInspectorEvent.visualizationContract && (
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                    Visualization Contract Payload
                  </span>
                  <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-300 text-[11px] overflow-x-auto mt-1 leading-relaxed">
                    {JSON.stringify(selectedInspectorEvent.visualizationContract, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedInspectorEvent(null)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 6. FULL CUSTOMER BRIEFING & INTERVIEW TRANSCRIPT MODAL        */}
      {/* ============================================================ */}
      {showTranscriptModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 pointer-events-auto">
          <div className="bg-slate-900 border border-purple-500/40 text-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl flex flex-col gap-4 font-sans max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-purple-400" />
                <div>
                  <h3 className="text-base font-bold text-white font-mono">
                    CUSTOMER BRIEFING & REQUIREMENT TRANSCRIPT
                  </h3>
                  <span className="text-[10px] text-purple-300 font-mono">Project: ACADEMY-HOUSE-0002 • Intake Pavilion</span>
                </div>
              </div>
              <button
                onClick={() => setShowTranscriptModal(false)}
                className="text-slate-400 hover:text-white text-sm font-bold px-2.5 py-1 bg-slate-800 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Original Customer Briefing */}
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-1">
              <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider block">
                Initial Customer Briefing
              </span>
              <p className="text-xs text-slate-200 italic leading-relaxed">
                "I want to build a modest, practical, durable single-family home in the Tampa, Florida area. I need two bedrooms and two bathrooms. I would like approximately 1,000 to 1,200 square feet, good storm resilience, reasonable construction cost, and an efficient layout."
              </p>
            </div>

            {/* Structured Interview Q&A Cards */}
            <div className="space-y-3 text-xs">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                Structured Interview & Requirement Decisions (5 Records)
              </span>

              {(house0002RawData?.customerInteractions || [
                {
                  id: 'CI-H2-001',
                  speaker: 'PROJECT-PRIME',
                  category: 'CUSTOMER_PREFERENCE',
                  questionOrTopic: 'Target Floor Area & Single vs Multi-Story',
                  response: 'Customer confirms preference for a single-story layout of ~1,000 to 1,100 sq ft to optimize storm safety, eliminate stairs, and simplify roofline.'
                },
                {
                  id: 'CI-H2-002',
                  speaker: 'PROJECT-PRIME',
                  category: 'CUSTOMER_PREFERENCE',
                  questionOrTopic: 'Bedrooms & Bathrooms Configuration',
                  response: 'Customer requests 2 Bedrooms (Primary Suite + Guest/Office) and 2 Full Bathrooms (Primary ensuite + Hall bath).'
                },
                {
                  id: 'CI-H2-003',
                  speaker: 'PROJECT-PRIME',
                  category: 'ENGINEERING_DECISION',
                  questionOrTopic: 'Storm Resilience & Shell Structure Selection',
                  response: 'Project Prime selects 8" Reinforced CMU block masonry walls + Monolithic Stem-Wall Slab to withstand 160 MPH coastal hurricane wind loads.'
                },
                {
                  id: 'CI-H2-004',
                  speaker: 'PROJECT-PRIME',
                  category: 'CODE_REQUIREMENT',
                  questionOrTopic: 'Florida Building Code 2023 (HVHZ / Wind Risk)',
                  response: 'Grounded against FBC 2023 Section 1609 & 2508. Wind exposure risk category II, 160 MPH ultimate design wind speed.'
                },
                {
                  id: 'CI-H2-005',
                  speaker: 'PROJECT-PRIME',
                  category: 'ACADEMY_ASSUMPTION',
                  questionOrTopic: 'Simulated Tampa Training Parcel Site Assumptions',
                  response: 'Simulated parcel located in Tampa Bay region (27.9506° N, 82.4572° W), 4.5 ft groundwater table, municipal water/sewer tap available.'
                }
              ]).map((qa: any, idx: number) => (
                <div key={qa.id || idx} className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1 font-mono">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-purple-400">{qa.speaker || 'PROJECT-PRIME'}</span>
                    <span className="px-1.5 py-0.2 bg-purple-500/20 text-purple-300 rounded border border-purple-500/30 text-[9px]">
                      {qa.category}
                    </span>
                  </div>
                  <div className="font-bold text-slate-100 font-sans text-xs">{qa.questionOrTopic}</div>
                  <p className="text-slate-300 font-sans text-xs leading-snug">{qa.response}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowTranscriptModal(false)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs"
              >
                Close Transcript
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
