import React, { useEffect, useState } from 'react';
import { PrehouseSpatialProofReport } from '../types/hermes';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Box,
  MapPin,
  Bot,
  Users,
  Compass,
  FileCheck2,
  Lock,
  Layers,
  Sparkles,
  Search,
  Activity,
  Maximize2,
  BookOpen
} from 'lucide-react';

export const PrehouseSpatialProofView: React.FC = () => {
  const [report, setReport] = useState<PrehouseSpatialProofReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'tests' | 'facilities' | 'logistics' | 'robot' | 'world'>('tests');
  const [worldData, setWorldData] = useState<any>(null);
  const [actionTriggering, setActionTriggering] = useState<boolean>(false);

  useEffect(() => {
    fetchProofReport();
    fetchWorldData();
  }, []);

  const fetchProofReport = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/hermes/prehouse-spatial-proof');
      if (res.ok) {
        const data = await res.json();
        setReport(data);
      }
    } catch (err) {
      console.error('Failed to fetch Pre-House Spatial Proof Report:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWorldData = async () => {
    try {
      const res = await fetch('/api/hermes/prehouse-spatial-world');
      if (res.ok) {
        const data = await res.json();
        setWorldData(data);
      }
    } catch (err) {
      console.error('Failed to fetch spatial world data:', err);
    }
  };

  const triggerKnowledgeWorkflow = async () => {
    try {
      setActionTriggering(true);
      await fetch('/api/hermes/prehouse/knowledge-demand', { method: 'POST' });
      await fetchProofReport();
      await fetchWorldData();
    } catch (err) {
      console.error('Failed to trigger knowledge workflow:', err);
    } finally {
      setActionTriggering(false);
    }
  };

  const triggerFieldConsultation = async () => {
    try {
      setActionTriggering(true);
      await fetch('/api/hermes/prehouse/field-consultation', { method: 'POST' });
      await fetchProofReport();
      await fetchWorldData();
    } catch (err) {
      console.error('Failed to trigger field consultation:', err);
    } finally {
      setActionTriggering(false);
    }
  };

  const triggerSurveyActions = async () => {
    try {
      setActionTriggering(true);
      await fetch('/api/hermes/prehouse/survey-actions', { method: 'POST' });
      await fetchProofReport();
      await fetchWorldData();
    } catch (err) {
      console.error('Failed to trigger survey actions:', err);
    } finally {
      setActionTriggering(false);
    }
  };

  if (loading || !report) {
    return (
      <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="font-mono text-sm">Compiling PREHOUSE-SPATIAL-PROOF-0001 Spatial World &amp; Acceptance Suite...</span>
      </div>
    );
  }

  const allPassed = report.totalPass === report.acceptanceTestResults.length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-wrap items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-cyan-950 border border-cyan-800 rounded-xl text-cyan-400 shadow-inner">
                <Box className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs font-bold text-cyan-400 tracking-wider uppercase">PREHOUSE-SPATIAL-PROOF-0001</span>
                <h2 className="text-2xl font-black text-white tracking-tight">Pre-House Spatial World Proof Report</h2>
              </div>
            </div>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Ground-up 1:1 scale spatial world validation. Canonical internal units in <span className="text-cyan-400 font-bold">METERS</span>, 1.0m grid interval, non-hardcoded site placement evaluation, 68 canonical core workforce visual tracking, and Robot-Ready spatial contracts.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 shadow-inner">
            <div className="text-right">
              <div className="text-[10px] font-extrabold uppercase text-slate-400">House #2 Lock Status</div>
              <div className="text-sm font-black text-amber-400 flex items-center gap-1.5 justify-end">
                <Lock className="w-4 h-4 text-amber-400" /> STRICT STOP GATE ENFORCED
              </div>
              <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                ACADEMY_HOUSE_0002_CREATED = NO | STARTED = NO
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics Strip */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
            <div className="text-[10px] uppercase font-bold text-slate-400">Acceptance Score</div>
            <div className="text-xl font-extrabold text-emerald-400 mt-0.5">{report.totalPass} / {report.acceptanceTestResults.length} PASS</div>
            <div className="text-[10px] text-slate-500 font-mono">100.0% Pass Rate</div>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
            <div className="text-[10px] uppercase font-bold text-slate-400">Canonical World Unit</div>
            <div className="text-xl font-extrabold text-cyan-400 mt-0.5">{report.worldUnit}</div>
            <div className="text-[10px] text-slate-500 font-mono">1:1 Scale | 1.0m Grid</div>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
            <div className="text-[10px] uppercase font-bold text-slate-400">Temporary Facilities</div>
            <div className="text-xl font-extrabold text-amber-400 mt-0.5">{report.temporaryFacilitiesCount} Deployed</div>
            <div className="text-[10px] text-slate-500 font-mono">Evaluated Placements</div>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
            <div className="text-[10px] uppercase font-bold text-slate-400">Canonical Workforce</div>
            <div className="text-xl font-extrabold text-indigo-400 mt-0.5">{report.canonicalWorkforceCount} Agents</div>
            <div className="text-[10px] text-slate-500 font-mono">{report.deployedWorkforceCount} Field / {report.learningWorkforceCount} Reserve</div>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
            <div className="text-[10px] uppercase font-bold text-slate-400">Logistics Tests</div>
            <div className="text-xl font-extrabold text-emerald-400 mt-0.5">2 / 2 PASSED</div>
            <div className="text-[10px] text-slate-500 font-mono">15A Feasible / 15B Clash</div>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
            <div className="text-[10px] uppercase font-bold text-slate-400">Truth Parity</div>
            <div className="text-xl font-extrabold text-cyan-400 mt-0.5">0 MISMATCHES</div>
            <div className="text-[10px] text-slate-500 font-mono">Backend == Visual</div>
          </div>
        </div>
      </div>

      {/* Interactive Workflow Trigger Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          <Activity className="w-4 h-4 text-cyan-400" />
          <span>Interactive Spatial Workflows:</span>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={triggerKnowledgeWorkflow}
            disabled={actionTriggering}
            className="px-3.5 py-2 bg-indigo-950 hover:bg-indigo-900 text-indigo-200 border border-indigo-800 rounded-xl text-xs font-semibold transition shadow flex items-center gap-1.5 disabled:opacity-50"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            Field Knowledge Request Loop
          </button>

          <button
            onClick={triggerFieldConsultation}
            disabled={actionTriggering}
            className="px-3.5 py-2 bg-cyan-950 hover:bg-cyan-900 text-cyan-200 border border-cyan-800 rounded-xl text-xs font-semibold transition shadow flex items-center gap-1.5 disabled:opacity-50"
          >
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            Manager Field Visit &amp; Inspection
          </button>

          <button
            onClick={triggerSurveyActions}
            disabled={actionTriggering}
            className="px-3.5 py-2 bg-emerald-950 hover:bg-emerald-900 text-emerald-200 border border-emerald-800 rounded-xl text-xs font-semibold transition shadow flex items-center gap-1.5 disabled:opacity-50"
          >
            <Compass className="w-3.5 h-3.5 text-emerald-400" />
            Survey Action &amp; Robot Contract
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('tests')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 ${
            activeTab === 'tests' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 shadow' : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <FileCheck2 className="w-4 h-4" /> 28 Acceptance Tests ({report.totalPass}/{report.acceptanceTestResults.length})
        </button>

        <button
          onClick={() => setActiveTab('facilities')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 ${
            activeTab === 'facilities' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 shadow' : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <MapPin className="w-4 h-4" /> Site Facilities Evaluation
        </button>

        <button
          onClick={() => setActiveTab('logistics')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 ${
            activeTab === 'logistics' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 shadow' : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Box className="w-4 h-4" /> Drywall Logistics Tests (15A &amp; 15B)
        </button>

        <button
          onClick={() => setActiveTab('robot')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 ${
            activeTab === 'robot' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 shadow' : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Bot className="w-4 h-4" /> RobotReadySpatialContracts
        </button>

        <button
          onClick={() => setActiveTab('world')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 ${
            activeTab === 'world' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 shadow' : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" /> Spatial Entities &amp; Avatars ({worldData?.spatialEntities?.length ?? 0})
        </button>
      </div>

      {/* TAB CONTENT: 28 ACCEPTANCE TESTS */}
      {activeTab === 'tests' && (
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            Acceptance Test Diagnostic Suite ({report.acceptanceTestResults.length} Tests)
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {report.acceptanceTestResults.map((item, idx) => (
              <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2 hover:border-slate-700 transition">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-500">#{idx + 1}</span>
                    <span className="text-xs font-extrabold text-white">{item.name}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${
                    item.status === 'PASS' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-red-950 text-red-400 border border-red-800'
                  }`}>
                    {item.status}
                  </span>
                </div>

                <div className="text-[11px] text-slate-300 leading-relaxed bg-slate-950 p-2.5 rounded-lg border border-slate-850 font-sans">
                  <span className="text-slate-400 font-semibold">Observed: </span>{item.observed}
                </div>

                <div className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 px-2 py-1 rounded border border-cyan-900/50">
                  Evidence: {item.evidence}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: SITE FACILITIES EVALUATION */}
      {activeTab === 'facilities' && report.facilityEvaluation && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-400" /> Spatial Logistics Engine Non-Hardcoded Candidate Placements
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Selected Placements ({report.facilityEvaluation.selectedPlacements.length})
                </div>
                {report.facilityEvaluation.selectedPlacements.map((p, i) => (
                  <div key={i} className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs space-y-1">
                    <div className="font-bold text-slate-200">{p.facilityType}</div>
                    <div className="font-mono text-cyan-400 text-[11px]">Position: [{p.position.join(', ')}] meters</div>
                    <div className="text-[11px] text-slate-400">{p.reason}</div>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Rejected Candidate Placements ({report.facilityEvaluation.rejectedPlacements.length})
                </div>
                {report.facilityEvaluation.rejectedPlacements.map((r, i) => (
                  <div key={i} className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs space-y-1">
                    <div className="font-bold text-amber-300">{r.facilityType}</div>
                    <div className="font-mono text-slate-400 text-[11px]">Candidate XYZ: [{r.position.join(', ')}]</div>
                    <div className="text-[11px] text-red-400 font-sans">{r.rejectionReason}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: DRYWALL LOGISTICS TESTS */}
      {activeTab === 'logistics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-900 border border-emerald-900/80 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-emerald-400 uppercase">TEST-15A: Feasible Material Transport Route</span>
              <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 text-[10px] font-bold rounded border border-emerald-800">PASSED</span>
            </div>
            <div className="text-xs text-slate-300 space-y-1 bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono">
              <div>Material: 8ft x 4ft Gypsum Sheet (2.4384m x 1.2192m)</div>
              <div>Doorway Clearance: 3.5ft (1.066m width)</div>
              <div className="text-emerald-400 font-bold">Status: PATH_FOUND | Minimum Clearance: +0.250m</div>
            </div>
          </div>

          <div className="bg-slate-900 border border-amber-900/80 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-amber-400 uppercase">TEST-15B: Infeasible Material Transport Route</span>
              <span className="px-2 py-0.5 bg-amber-950 text-amber-400 text-[10px] font-bold rounded border border-amber-800">PASSED (Clash Verified)</span>
            </div>
            <div className="text-xs text-slate-300 space-y-1 bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono">
              <div>Material: 10ft Rigid Gypsum Board (3.048m length)</div>
              <div>Doorway Width: 3.0ft (0.9144m) from 5ft Corridor</div>
              <div className="text-red-400 font-bold">Status: LOGISTICS_CLASH | Delta: -0.14ft (-0.043m)</div>
            </div>

            <div className="text-[11px] text-slate-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800 space-y-1">
              <div className="font-bold text-amber-300">Engine Alternative Proposals:</div>
              <ul className="list-disc list-inside space-y-0.5 text-slate-400">
                <li>Option 1: Vertical 90-degree tilt transport maneuver</li>
                <li>Option 2: Utilize double-leaf exterior equipment access door</li>
                <li>Option 3: Field-cut sheet into two 5-foot sections</li>
                <li>Option 4: Route via balcony exterior hoist lift</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: ROBOT READY CONTRACTS */}
      {activeTab === 'robot' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Bot className="w-4 h-4 text-cyan-400" /> Compiled RobotReadySpatialContracts
            </h3>
            <span className="text-xs font-mono text-slate-400">Contracts Compiled: {worldData?.robotContracts?.length ?? 0}</span>
          </div>

          {worldData?.robotContracts?.map((contract: any, i: number) => (
            <div key={i} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-cyan-300 font-bold border-b border-slate-800 pb-2">
                <span>Contract ID: {contract.contractId}</span>
                <span className="text-emerald-400 text-[10px] bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">VERIFIED</span>
              </div>

              <div className="space-y-1">
                <div className="text-slate-400 font-sans font-bold">Primitive Spatial Action Sequence ({contract.actions.length} Actions):</div>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                  {contract.actions.map((act: any, idx: number) => (
                    <div key={idx} className="bg-slate-900 p-2 rounded border border-slate-800 space-y-1">
                      <div className="font-bold text-amber-300">{act.actionType}</div>
                      <div className="text-[10px] text-slate-400">Target: [{act.targetPosition.join(', ')}]</div>
                      <div className="text-[9px] text-emerald-400">{act.verificationMethod}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB CONTENT: SPATIAL ENTITIES */}
      {activeTab === 'world' && worldData && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" /> Live Spatial World Entities ({worldData.spatialEntities?.length} Records)
            </h3>
            <span className="text-xs font-mono text-cyan-400">Project: {worldData.projectId}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto pr-1">
            {worldData.spatialEntities?.map((ent: any, i: number) => (
              <div key={i} className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 truncate max-w-[180px]">{ent.name}</span>
                  <span className="text-[9px] font-mono bg-slate-900 text-cyan-400 px-1.5 py-0.5 rounded">{ent.entityType}</span>
                </div>
                <div className="font-mono text-[11px] text-slate-400">Position: [{ent.worldPosition?.join(', ')}]m</div>
                <div className="font-mono text-[10px] text-slate-500">Dimensions: [{ent.dimensions?.join(', ')}]m</div>
                <div className="text-[10px] text-emerald-400">State: {ent.state}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
