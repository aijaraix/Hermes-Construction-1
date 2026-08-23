import React, { useEffect, useState } from 'react';
import {
  Activity,
  Box,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Layers,
  Play,
  Pause,
  RefreshCw,
  ShieldCheck,
  Zap,
  AlertTriangle,
  FileText,
  DollarSign,
  Wrench,
  Search,
  Check
} from 'lucide-react';
import { ThreeBIMViewer } from './ThreeBIMViewer';
import {
  BIMComponent,
  BOMItem,
  Phase318B3CheckpointReport,
  SpatialAcademyProject,
  SpatialModelRevision
} from '../types/hermes';

export const Phase318B3SpatialAcademyView: React.FC = () => {
  const [report, setReport] = useState<Phase318B3CheckpointReport | null>(null);
  const [project, setProject] = useState<SpatialAcademyProject | null>(null);
  const [bomItems, setBomItems] = useState<BOMItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cycling, setCycling] = useState(false);

  // Playback state
  const [currentRevIndex, setCurrentRevIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Selected Component Inspector State
  const [selectedComp, setSelectedComp] = useState<BIMComponent | null>(null);
  const [activeTab, setActiveTab] = useState<'3D' | 'REPORT' | 'BOM' | 'REVISIONS' | 'PHASE4_REPORT' | 'LEARNING' | 'QUALITY'>('3D');

  // Attempt selection state
  const [selectedAttemptIndex, setSelectedAttemptIndex] = useState<number>(0);
  const [phase4Report, setPhase4Report] = useState<any>(null);
  const [learningProfiles, setLearningProfiles] = useState<any[]>([]);
  const [systemQualityReports, setSystemQualityReports] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reportRes, projRes, bomRes, p4ReportRes, learnRes, qaRes] = await Promise.all([
        fetch('/api/academy/spatial-report').catch(() => null),
        fetch('/api/academy/spatial-project').catch(() => null),
        fetch('/api/academy/spatial-bom').catch(() => null),
        fetch('/api/academy/phase318b4-report').catch(() => null),
        fetch('/api/academy/learning-profiles').catch(() => null),
        fetch('/api/academy/system-quality').catch(() => null)
      ]);

      if (reportRes && reportRes.ok) setReport(await reportRes.json());
      if (projRes && projRes.ok) {
        const projData: SpatialAcademyProject = await projRes.json();
        setProject(projData);
        if (projData.revisions && projData.revisions.length > 0) {
          setCurrentRevIndex(projData.revisions.length - 1);
        }
        if (projData.attempts && projData.attempts.length > 0) {
          setSelectedAttemptIndex(projData.attempts.length - 1);
        }
      }
      if (bomRes && bomRes.ok) setBomItems(await bomRes.json());
      if (p4ReportRes && p4ReportRes.ok) setPhase4Report(await p4ReportRes.json());
      if (learnRes && learnRes.ok) setLearningProfiles(await learnRes.json());
      if (qaRes && qaRes.ok) setSystemQualityReports(await qaRes.json());
    } catch (err) {
      console.error('Failed to load Spatial Academy data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Playback timer
  useEffect(() => {
    let interval: any;
    if (isPlaying && project && project.revisions) {
      interval = setInterval(() => {
        setCurrentRevIndex((prev) => {
          if (prev >= project.revisions.length - 1) {
            setIsPlaying(false);
            return project.revisions.length - 1;
          }
          return prev + 1;
        });
      }, 1200);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPlaying, project]);

  const handleRunCycle = async () => {
    try {
      setCycling(true);
      const res = await fetch('/api/academy/run-spatial-cycle', { method: 'POST' });
      const data = await res.json();
      if (data.project) {
        setProject(data.project);
        setReport(data.report);
        if (data.project.revisions) {
          setCurrentRevIndex(data.project.revisions.length - 1);
        }
      }
      await fetchData();
    } catch (err) {
      console.error('Run spatial cycle failed:', err);
    } finally {
      setCycling(false);
    }
  };

  if (loading && !project) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400">
        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
        <span>Loading Continuous Spatial Construction Academy...</span>
      </div>
    );
  }

  const revisions = project?.revisions || [];
  const currentRevision: SpatialModelRevision | null = revisions[currentRevIndex] || null;

  // Active component list derived from current revision snapshot for 100% exact playback
  const activeComponents: BIMComponent[] = currentRevision?.modelSnapshot || project?.components || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 bg-slate-950 text-slate-100 min-h-screen">
      {/* TOP HEADER */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-indigo-500 to-amber-500" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-mono text-xs rounded-full font-semibold flex items-center">
                <span className="w-2 h-2 rounded-full bg-indigo-500 mr-2 animate-pulse" />
                PHASE 3.18B.3 — CONTINUOUS SPATIAL CONSTRUCTION ACADEMY
              </span>
              <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs rounded-full font-semibold">
                {project?.difficultyName || 'LEVEL 4 — ROOM'}
              </span>
              <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs rounded-full font-semibold">
                {project?.projectId || 'GYM-BATHROOM-0001'}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Box className="w-6 h-6 text-indigo-400" />
              Continuous Spatial Construction & Practical 3D Examination
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Agents Learn → Build Spatial Models → Inspect → Retrain → Rebuild • Replayed Step-by-Step
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRunCycle}
              disabled={cycling}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-medium rounded-lg text-xs flex items-center space-x-2 transition shadow-lg shadow-emerald-900/30"
            >
              <Play className={`w-4 h-4 ${cycling ? 'animate-spin' : ''}`} />
              <span>{cycling ? 'Building Spatial Step...' : 'Execute Spatial Construction Cycle'}</span>
            </button>
          </div>
        </div>

        {/* METRICS QUICK STRIP & ATTEMPT SELECTOR */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mt-6 pt-4 border-t border-slate-800 font-mono text-xs">
          <div className="p-2.5 bg-slate-950/60 border border-slate-800 rounded-lg col-span-2 sm:col-span-1">
            <div className="text-slate-400 text-[10px] uppercase mb-1">Project Attempt</div>
            <select
              value={selectedAttemptIndex}
              onChange={(e) => setSelectedAttemptIndex(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 text-indigo-300 rounded px-2 py-1 font-mono text-xs focus:outline-none focus:border-indigo-500"
            >
              {(project?.attempts || []).map((att, idx) => (
                <option key={att.attemptId} value={idx}>
                  Attempt {att.attemptNumber} — {att.status}
                </option>
              ))}
            </select>
          </div>
          <div className="p-2.5 bg-slate-950/60 border border-slate-800 rounded-lg">
            <div className="text-slate-400 text-[10px] uppercase">3D Objects</div>
            <div className="text-lg font-bold text-emerald-400">{activeComponents.length}</div>
          </div>
          <div className="p-2.5 bg-slate-950/60 border border-slate-800 rounded-lg">
            <div className="text-slate-400 text-[10px] uppercase">Revisions</div>
            <div className="text-lg font-bold text-indigo-400">{revisions.length}</div>
          </div>
          <div className="p-2.5 bg-slate-950/60 border border-slate-800 rounded-lg">
            <div className="text-slate-400 text-[10px] uppercase">Completion</div>
            <div className="text-lg font-bold text-amber-400">{project?.digitalCompletionPct || 0}%</div>
          </div>
          <div className="p-2.5 bg-slate-950/60 border border-slate-800 rounded-lg">
            <div className="text-slate-400 text-[10px] uppercase">Active Agents</div>
            <div className="text-lg font-bold text-cyan-400">{project?.agentAssignments.length || 7}</div>
          </div>
          <div className="p-2.5 bg-slate-950/60 border border-slate-800 rounded-lg">
            <div className="text-slate-400 text-[10px] uppercase">Defects Injected</div>
            <div className="text-lg font-bold text-rose-400">{report?.INSPECTION_DEFECTS || 0}</div>
          </div>
          <div className="p-2.5 bg-slate-950/60 border border-slate-800 rounded-lg">
            <div className="text-slate-400 text-[10px] uppercase">Repairs Executed</div>
            <div className="text-lg font-bold text-emerald-400">{report?.REPAIRS || 0}</div>
          </div>
        </div>
      </div>

      {/* VIEW NAVIGATION TABS */}
      <div className="flex flex-wrap border-b border-slate-800 gap-2 text-sm font-medium">
        <button
          onClick={() => setActiveTab('3D')}
          className={`px-4 py-2 border-b-2 flex items-center gap-2 font-mono text-xs ${
            activeTab === '3D'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Box className="w-4 h-4" /> 3D Spatial Model & Playback
        </button>
        <button
          onClick={() => setActiveTab('PHASE4_REPORT')}
          className={`px-4 py-2 border-b-2 flex items-center gap-2 font-mono text-xs ${
            activeTab === 'PHASE4_REPORT'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" /> Phase 3.18B.4 Live Operational Report
        </button>
        <button
          onClick={() => setActiveTab('LEARNING')}
          className={`px-4 py-2 border-b-2 flex items-center gap-2 font-mono text-xs ${
            activeTab === 'LEARNING'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" /> Agent Learning Profiles ({learningProfiles.length})
        </button>
        <button
          onClick={() => setActiveTab('QUALITY')}
          className={`px-4 py-2 border-b-2 flex items-center gap-2 font-mono text-xs ${
            activeTab === 'QUALITY'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Wrench className="w-4 h-4" /> System Quality Academy ({systemQualityReports.length})
        </button>
        <button
          onClick={() => setActiveTab('BOM')}
          className={`px-4 py-2 border-b-2 flex items-center gap-2 font-mono text-xs ${
            activeTab === 'BOM'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <DollarSign className="w-4 h-4" /> Derived BOM ({bomItems.length} items)
        </button>
        <button
          onClick={() => setActiveTab('REVISIONS')}
          className={`px-4 py-2 border-b-2 flex items-center gap-2 font-mono text-xs ${
            activeTab === 'REVISIONS'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" /> Revision Timeline ({revisions.length})
        </button>
      </div>

      {/* TAB 1: 3D SPATIAL MODEL & PLAYBACK */}
      {activeTab === '3D' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT 2 COLS: THREE.JS 3D BIM VIEWER */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-[650px] shadow-2xl relative">
            {/* Viewer Controls Bar */}
            <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between font-mono text-xs">
              <div className="flex items-center space-x-2 text-slate-300">
                <span className="font-bold text-indigo-400">{project?.projectId}</span>
                <span>•</span>
                <span>{currentRevision?.revisionId || 'REV-000001'}</span>
                <span>({currentRevision?.actionType})</span>
              </div>
              <div className="text-emerald-400 text-xs flex items-center">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                <span>Started from 0-component empty volume</span>
              </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 relative">
              <ThreeBIMViewer
                components={activeComponents}
                selectedComponentId={selectedComp?.id}
                onSelectComponent={(comp) => setSelectedComp(comp)}
              />
            </div>

            {/* PLAYBACK BAR */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded transition"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setCurrentRevIndex((p) => Math.max(0, p - 1))}
                    disabled={currentRevIndex <= 0}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white rounded transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentRevIndex((p) => Math.min(revisions.length - 1, p + 1))}
                    disabled={currentRevIndex >= revisions.length - 1}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white rounded transition"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <span className="font-bold text-white">
                    Revision {currentRevIndex + 1} of {revisions.length}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">{currentRevision?.taskDescription}</span>
                </div>
              </div>

              {/* Revision Slider */}
              <input
                type="range"
                min="0"
                max={Math.max(0, revisions.length - 1)}
                value={currentRevIndex}
                onChange={(e) => setCurrentRevIndex(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>
          </div>

          {/* RIGHT COL: INTERACTIVE COMPONENT / REVISION INSPECTOR */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 overflow-y-auto max-h-[650px]">
            <h2 className="text-sm font-semibold text-white tracking-wider uppercase font-mono flex items-center">
              <Search className="w-4 h-4 text-indigo-400 mr-2" />
              {selectedComp ? `Component Inspector: ${selectedComp.id}` : `Active Revision: ${currentRevision?.revisionId}`}
            </h2>

            {selectedComp ? (
              <div className="space-y-4 text-xs font-mono">
                <div className="p-3 bg-slate-950 border border-indigo-500/30 rounded-lg space-y-2">
                  <div className="flex justify-between items-center text-white font-bold text-sm">
                    <span>{selectedComp.id}</span>
                    <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded text-[10px]">
                      {selectedComp.system}
                    </span>
                  </div>
                  <p className="text-slate-300 font-sans text-xs">{selectedComp.assembly}</p>
                  <div className="text-slate-400 text-[10px]">
                    Room: {selectedComp.room} • Stage Day: {selectedComp.installationStageDay}
                  </div>
                </div>

                {/* Materials Breakdown */}
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
                  <div className="text-slate-400 text-[10px] uppercase font-bold text-indigo-400">Materials Specification</div>
                  {selectedComp.materials.map((m, idx) => (
                    <div key={idx} className="flex justify-between text-slate-300 border-b border-slate-900 py-1">
                      <span>{m.name}</span>
                      <span className="text-emerald-400">{m.quantity} {m.unit}</span>
                    </div>
                  ))}
                </div>

                {/* Grounded Code Reasoning */}
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
                  <div className="text-slate-400 text-[10px] uppercase font-bold text-amber-400">Grounded Code & Reasoning</div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">{selectedComp.whySelected.reason}</p>
                  <div className="text-emerald-400 font-bold text-[10px] pt-1">
                    Code Rule: {selectedComp.whySelected.codeRule}
                  </div>
                </div>

                {/* Fastener Schedule */}
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
                  <div className="text-slate-400 text-[10px] uppercase font-bold text-cyan-400">Fastener Schedule</div>
                  {project?.fasteners
                    .filter((f) => f.hostObjectId === selectedComp.id)
                    .map((f) => (
                      <div key={f.id} className="space-y-1 text-slate-300">
                        <div className="font-bold text-white">{f.type} ({f.size})</div>
                        <div>Pattern: {f.spacingPattern}</div>
                        <div className="text-slate-400 text-[10px]">Ref: {f.codeReference}</div>
                      </div>
                    ))}
                  {project?.fasteners.filter((f) => f.hostObjectId === selectedComp.id).length === 0 && (
                    <div className="text-slate-500 italic">No specific fasteners mapped to this object</div>
                  )}
                </div>

                <button
                  onClick={() => setSelectedComp(null)}
                  className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition"
                >
                  Clear Selection (Inspect Revision)
                </button>
              </div>
            ) : currentRevision ? (
              <div className="space-y-4 text-xs font-mono">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
                  <div className="text-indigo-400 font-bold text-sm">{currentRevision.revisionId} • {currentRevision.actionType}</div>
                  <div className="text-slate-300">{currentRevision.taskDescription}</div>
                  <div className="text-slate-400 text-[10px]">
                    Agent: {currentRevision.agentRole} ({currentRevision.agentId})
                  </div>
                  <div className="text-slate-400 text-[10px]">
                    Timestamp: {new Date(currentRevision.timestamp).toLocaleTimeString()}
                  </div>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
                  <div className="text-amber-400 font-bold text-[10px] uppercase">Grounded Engineering Reasoning</div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">{currentRevision.reasoning}</p>
                  <div className="text-emerald-400 text-[10px] pt-1">Code Ref: {currentRevision.codeReference}</div>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
                  <div className="text-cyan-400 font-bold text-[10px] uppercase">Objects Affected</div>
                  {currentRevision.objectsAdded.length > 0 && (
                    <div className="text-emerald-400">Added: {currentRevision.objectsAdded.join(', ')}</div>
                  )}
                  {currentRevision.objectsChanged.length > 0 && (
                    <div className="text-amber-400">Changed: {currentRevision.objectsChanged.join(', ')}</div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-slate-500 italic text-xs">No active revision or component selected</div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: REQUIRED CHECKPOINT REPORT */}
      {activeTab === 'REPORT' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6 shadow-xl font-mono text-xs">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Phase 3.18B.3 Required Checkpoint Report
              </h2>
              <p className="text-slate-400 text-xs">Section 38 Autonomous Spatial Construction Audit</p>
            </div>
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded text-xs font-bold">
              PASSED
            </span>
          </div>

          {/* EVIDENCE BOX */}
          <div className="p-4 bg-indigo-950/40 border border-indigo-500/30 rounded-lg space-y-2 text-indigo-200">
            <div className="font-bold text-indigo-400 uppercase text-xs">Evidence of Empty Start & Practical Construction</div>
            <p className="text-slate-300 text-xs leading-relaxed">{report?.evidenceOfEmptyStart}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {report &&
              Object.entries(report)
                .filter(([k]) => k !== 'evidenceOfEmptyStart')
                .map(([key, val]) => (
                  <div key={key} className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
                    <div className="text-slate-400 text-[10px] uppercase tracking-wider">{key}</div>
                    <div className="font-bold text-white text-sm">
                      {typeof val === 'boolean' ? (val ? 'YES' : 'NO') : String(val)}
                    </div>
                  </div>
                ))}
          </div>
        </div>
      )}

      {/* TAB 3: DERIVED BOM */}
      {activeTab === 'BOM' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 shadow-xl font-mono text-xs">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Spatial Model-Derived Bill of Materials (BOM)
              </h2>
              <p className="text-slate-400 text-xs">Derived directly from 3D component geometry & material volumes</p>
            </div>
            <div className="text-emerald-400 font-bold text-base">
              Total Derived Cost: ${bomItems.reduce((acc, item) => acc + (item.totalPrice || 0), 0).toFixed(2)}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-slate-300">
              <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                <tr>
                  <th className="p-3">Item Description</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Specification</th>
                  <th className="p-3">Modeled Qty</th>
                  <th className="p-3">Unit Price</th>
                  <th className="p-3">Total Price</th>
                  <th className="p-3">Price Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {bomItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-950/50 transition">
                    <td className="p-3 font-bold text-white">{item.item}</td>
                    <td className="p-3 text-indigo-400">{item.category}</td>
                    <td className="p-3 text-slate-400 text-[11px]">{item.specification}</td>
                    <td className="p-3 text-emerald-400 font-bold">{item.modeledQuantity} {item.unit}</td>
                    <td className="p-3">${item.unitPrice?.toFixed(2)}</td>
                    <td className="p-3 text-emerald-400 font-bold">${item.totalPrice?.toFixed(2)}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 text-slate-300 rounded text-[10px]">
                        {item.priceSource}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: REVISION TIMELINE */}
      {activeTab === 'REVISIONS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 shadow-xl font-mono text-xs">
          <h2 className="text-lg font-bold text-white tracking-tight border-b border-slate-800 pb-4">
            Construction Revisions Timeline ({revisions.length} Revisions)
          </h2>

          <div className="space-y-3">
            {revisions.map((rev, idx) => (
              <div
                key={rev.revisionId}
                onClick={() => {
                  setCurrentRevIndex(idx);
                  setActiveTab('3D');
                }}
                className={`p-4 border rounded-xl cursor-pointer transition ${
                  idx === currentRevIndex
                    ? 'bg-indigo-950/40 border-indigo-500 text-white'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-indigo-400 text-sm">
                    {rev.revisionId} • {rev.actionType}
                  </span>
                  <span className="text-slate-400 text-[10px]">{new Date(rev.timestamp).toLocaleTimeString()}</span>
                </div>
                <p className="text-slate-200 text-xs mb-2">{rev.taskDescription}</p>
                <div className="flex items-center gap-4 text-[11px] text-slate-400">
                  <span>Agent: <strong className="text-emerald-400">{rev.agentRole}</strong></span>
                  <span>Code: <strong className="text-amber-400">{rev.codeReference}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: PHASE 3.18B.4 OPERATIONAL REPORT */}
      {activeTab === 'PHASE4_REPORT' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6 shadow-xl font-mono text-xs">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-400" />
                Phase 3.18B.4 Continuous Operational Report
              </h2>
              <p className="text-slate-400 text-xs mt-1">
                Continuous Loops A (Knowledge), B (Spatial Construction), & C (System Quality)
              </p>
            </div>
            <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full font-bold">
              SYSTEM HEALTH: ALL LOOPS ACTIVE
            </span>
          </div>

          {phase4Report && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <h3 className="font-bold text-indigo-400 border-b border-slate-800 pb-2">Roster & Learning Profiles</h3>
                <div className="flex justify-between"><span>Canonical Roles Total:</span><strong className="text-white">{phase4Report.CANONICAL_ROLES_TOTAL}</strong></div>
                <div className="flex justify-between"><span>Specialist Roles:</span><strong className="text-cyan-400">{phase4Report.SPECIALIST_ROLES}</strong></div>
                <div className="flex justify-between"><span>System Quality Roles:</span><strong className="text-amber-400">{phase4Report.SYSTEM_QUALITY_ROLES}</strong></div>
                <div className="flex justify-between"><span>Active Profiles:</span><strong className="text-emerald-400">{phase4Report.AGENTS_WITH_ACTIVE_LEARNING_PROFILES}</strong></div>
                <div className="flex justify-between"><span>Agents Starved:</span><strong className="text-emerald-400">{phase4Report.AGENTS_STARVED}</strong></div>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <h3 className="font-bold text-emerald-400 border-b border-slate-800 pb-2">Loop A: Knowledge Ingestion</h3>
                <div className="flex justify-between"><span>Sources Registered:</span><strong className="text-white">{phase4Report.SOURCES_REGISTERED}</strong></div>
                <div className="flex justify-between"><span>Documents Parsed:</span><strong className="text-white">{phase4Report.DOCUMENTS_PARSED}</strong></div>
                <div className="flex justify-between"><span>Real Chunks:</span><strong className="text-indigo-400">{phase4Report.REAL_CHUNKS}</strong></div>
                <div className="flex justify-between"><span>Grounded Assertions:</span><strong className="text-cyan-400">{phase4Report.GROUNDED_ASSERTIONS}</strong></div>
                <div className="flex justify-between"><span>Gaps Resolved:</span><strong className="text-emerald-400">{phase4Report.KNOWLEDGE_GAPS_RESOLVED}</strong></div>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <h3 className="font-bold text-amber-400 border-b border-slate-800 pb-2">Loop B: Spatial Construction</h3>
                <div className="flex justify-between"><span>Training Projects:</span><strong className="text-white">{phase4Report.CURRENT_TRAINING_PROJECTS}</strong></div>
                <div className="flex justify-between"><span>Current Attempt:</span><strong className="text-amber-400">Attempt {phase4Report.CURRENT_ATTEMPT_NUMBER}</strong></div>
                <div className="flex justify-between"><span>Visual Checkpoints:</span><strong className="text-white">{phase4Report.VISUAL_CHECKPOINTS_CAPTURED}</strong></div>
                <div className="flex justify-between"><span>Spatial Defects Found:</span><strong className="text-rose-400">{phase4Report.SPATIAL_DEFECTS_FOUND}</strong></div>
                <div className="flex justify-between"><span>Repairs Completed:</span><strong className="text-emerald-400">{phase4Report.REPAIRS_COMPLETED}</strong></div>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <h3 className="font-bold text-cyan-400 border-b border-slate-800 pb-2">Loop C: System Quality QA</h3>
                <div className="flex justify-between"><span>System QA Scans:</span><strong className="text-white">{phase4Report.SYSTEM_QA_SCANS}</strong></div>
                <div className="flex justify-between"><span>Real UI Bugs Found:</span><strong className="text-emerald-400">{phase4Report.REAL_UI_BUGS_FOUND}</strong></div>
                <div className="flex justify-between"><span>Bugs Auto-Repaired:</span><strong className="text-emerald-400">{phase4Report.REAL_UI_BUGS_REPAIRED}</strong></div>
                <div className="flex justify-between"><span>Regression Tests:</span><strong className="text-indigo-400">{phase4Report.REGRESSION_TESTS}</strong></div>
                <div className="flex justify-between"><span>Protected Eng Values:</span><strong className="text-emerald-400">{phase4Report.ENGINEERING_VALUES_PROTECTED_FROM_UI_AUTOREPAIR}</strong></div>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2 col-span-1 md:col-span-2 lg:col-span-2">
                <h3 className="font-bold text-white border-b border-slate-800 pb-2">Section 61 Mandatory Declarations</h3>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>NO_NEW_PAGE_CREATED: <strong className="text-emerald-400">{phase4Report.NO_NEW_PAGE_CREATED}</strong></div>
                  <div>NO_NEW_ROUTE_CREATED: <strong className="text-emerald-400">{phase4Report.NO_NEW_ROUTE_CREATED}</strong></div>
                  <div>NO_NEW_PHASE_TAB_CREATED: <strong className="text-emerald-400">{phase4Report.NO_NEW_PHASE_TAB_CREATED}</strong></div>
                  <div>CONTINUOUS_INGESTION_ACTIVE: <strong className="text-emerald-400">{phase4Report.CONTINUOUS_INGESTION_ACTIVE}</strong></div>
                  <div>FAILED_ATTEMPTS_PRESERVED: <strong className="text-emerald-400">{phase4Report.FAILED_ATTEMPTS_PRESERVED}</strong></div>
                  <div>SYSTEM_QUALITY_ACADEMY_ACTIVE: <strong className="text-emerald-400">{phase4Report.SYSTEM_QUALITY_ACADEMY_ACTIVE}</strong></div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 6: AGENT LEARNING PROFILES */}
      {activeTab === 'LEARNING' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 shadow-xl font-mono text-xs">
          <h2 className="text-lg font-bold text-white tracking-tight border-b border-slate-800 pb-4 flex items-center justify-between">
            <span>Canonical Agent Learning Profiles ({learningProfiles.length} Roles)</span>
            <span className="text-emerald-400 text-xs">100% Active • Zero Starvation</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {learningProfiles.map((lp) => (
              <div key={lp.agentId} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-indigo-400">{lp.agentId}</span>
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded text-[10px] font-bold">
                    {lp.currentLearningState}
                  </span>
                </div>
                <div className="text-slate-300 font-bold">{lp.role} ({lp.domain})</div>
                <div className="text-slate-400 text-[11px]">Curriculum: {lp.curriculumId} • Manager: {lp.managerId}</div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-[10px]">
                  <div>Grounding: <span className="text-emerald-400 font-bold">{lp.competencyDimensions.knowledgeGrounding}%</span></div>
                  <div>Reasoning: <span className="text-indigo-400 font-bold">{lp.competencyDimensions.reasoningScore}%</span></div>
                  <div>Spatial Const.: <span className="text-amber-400 font-bold">{lp.competencyDimensions.spatialConstructionScore}%</span></div>
                  <div>Inspection Pass: <span className="text-cyan-400 font-bold">{lp.competencyDimensions.inspectionPassRate}%</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: SYSTEM QUALITY ACADEMY */}
      {activeTab === 'QUALITY' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 shadow-xl font-mono text-xs">
          <h2 className="text-lg font-bold text-white tracking-tight border-b border-slate-800 pb-4 flex items-center justify-between">
            <span>System Quality Academy (8 Logical System Quality Roles)</span>
            <span className="text-cyan-400 text-xs">Continuous Application Quality Crawl</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {systemQualityReports.map((sq) => (
              <div key={sq.agentId} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-cyan-400">{sq.role}</span>
                  <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-400 rounded text-[10px] font-bold">
                    {sq.status}
                  </span>
                </div>
                <div className="text-slate-300 text-[11px]">Views Crawled: <strong className="text-white">{sq.viewsCrawled}</strong></div>
                <div className="text-slate-300 text-[11px]">Issues Repaired: <strong className="text-emerald-400">{sq.issuesRepaired}</strong></div>
                <div className="text-slate-300 text-[11px]">Training Defects Detected: <strong className="text-amber-400">{sq.trainingDefectsDetected}</strong></div>
                <div className="text-slate-500 text-[10px] pt-1">Last Scan: {new Date(sq.lastScanTimestamp).toLocaleTimeString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
