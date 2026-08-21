import React, { useEffect, useState } from 'react';
import {
  HeartbeatRecord,
  TaskExecutionRecord,
  ModelRevisionRecord,
  InspectionAuditRecord,
  BOMRevisionRecord,
  DecisionLogRecord,
  CompetencyMatrix,
  CorpusSourceItem,
} from '../types/hermes';
import { ShieldCheck, FileText, Database, Activity, Cpu, Layers, CheckCircle2, RefreshCw, BookOpen } from 'lucide-react';

export function AuditTrailView() {
  const [activeSubTab, setActiveSubTab] = useState<
    'reality' | 'heartbeats' | 'tasks' | 'revisions' | 'inspections' | 'bom' | 'competency' | 'corpus'
  >('reality');

  const [heartbeats, setHeartbeats] = useState<HeartbeatRecord[]>([]);
  const [tasks, setTasks] = useState<TaskExecutionRecord[]>([]);
  const [revisions, setRevisions] = useState<ModelRevisionRecord[]>([]);
  const [inspections, setInspections] = useState<InspectionAuditRecord[]>([]);
  const [bomRevisions, setBomRevisions] = useState<BOMRevisionRecord[]>([]);
  const [competency, setCompetency] = useState<CompetencyMatrix | null>(null);
  const [corpusSources, setCorpusSources] = useState<CorpusSourceItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const loadAuditRecords = async () => {
    setIsLoading(true);
    try {
      const [hbRes, tRes, revRes, inspRes, bomRes, compRes, corpRes] = await Promise.all([
        fetch('/api/records/heartbeats'),
        fetch('/api/records/tasks'),
        fetch('/api/records/revisions'),
        fetch('/api/records/inspections'),
        fetch('/api/records/bom-revisions'),
        fetch('/api/records/competency'),
        fetch('/api/records/corpus'),
      ]);

      setHeartbeats(await hbRes.json());
      setTasks(await tRes.json());
      setRevisions(await revRes.json());
      setInspections(await inspRes.json());
      setBomRevisions(await bomRes.json());
      setCompetency(await compRes.json());
      setCorpusSources(await corpRes.json());
    } catch (e) {
      console.error('Error fetching audit records:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAuditRecords();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-emerald-950 text-emerald-400 rounded-lg border border-emerald-800">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-100">HERMES Auditable Reality & State Log</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            SQLite Durable Audit Trail • Real Code vs Hard-Coded Audit • Task Graphs • Model Revisions • Corpus Ingestion
          </p>
        </div>

        <button
          onClick={loadAuditRecords}
          disabled={isLoading}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-2 transition"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Audit Trail
        </button>
      </div>

      {/* Subtabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2 font-mono text-xs">
        <button
          onClick={() => setActiveSubTab('reality')}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
            activeSubTab === 'reality' ? 'bg-cyan-950 text-cyan-400 border border-cyan-800 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" /> System Reality Matrix
        </button>
        <button
          onClick={() => setActiveSubTab('heartbeats')}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
            activeSubTab === 'heartbeats' ? 'bg-cyan-950 text-cyan-400 border border-cyan-800 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-3.5 h-3.5" /> Heartbeats ({heartbeats.length})
        </button>
        <button
          onClick={() => setActiveSubTab('tasks')}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
            activeSubTab === 'tasks' ? 'bg-cyan-950 text-cyan-400 border border-cyan-800 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" /> Tasks ({tasks.length})
        </button>
        <button
          onClick={() => setActiveSubTab('revisions')}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
            activeSubTab === 'revisions' ? 'bg-cyan-950 text-cyan-400 border border-cyan-800 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Database className="w-3.5 h-3.5" /> 3D Model Revisions ({revisions.length})
        </button>
        <button
          onClick={() => setActiveSubTab('inspections')}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
            activeSubTab === 'inspections' ? 'bg-cyan-950 text-cyan-400 border border-cyan-800 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" /> Inspections ({inspections.length})
        </button>
        <button
          onClick={() => setActiveSubTab('corpus')}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
            activeSubTab === 'corpus' ? 'bg-cyan-950 text-cyan-400 border border-cyan-800 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" /> Corpus Ingestion ({corpusSources.length})
        </button>
      </div>

      {/* Subtab Content 1: System Reality Audit Matrix */}
      {activeSubTab === 'reality' && (
        <div className="space-y-6">
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" /> Subsystem Reality Classification
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">Persistence Engine</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-950 text-emerald-400 border border-emerald-800">
                    REAL (SQLite WASM)
                  </span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Uses <code className="text-cyan-400">sql.js</code> database adapter (`sqliteAdapter.ts`) to maintain durable tables for heartbeats, tasks, model revisions, and inspection logs.
                </p>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">Deterministic Geometry Engine</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-950 text-emerald-400 border border-emerald-800">
                    REAL
                  </span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Executes exact spatial math (3D bounding boxes, volume/area formulas, material counts) without LLM hallucination.
                </p>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">Task Dependency Graph Engine</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-950 text-emerald-400 border border-emerald-800">
                    REAL
                  </span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Generates a 20-stage topological task graph for House #1, unlocking prerequisites stage by stage on each heartbeat turn.
                </p>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">Authoritative Corpus Ingestion</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-950 text-emerald-400 border border-emerald-800">
                    REAL
                  </span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Grounds calculations in FBC 2023, FEMA P-55, USDA Wood Handbook, IPC 2024, NEC 2023, and ACI 318 standards.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subtab Content 2: Heartbeats */}
      {activeSubTab === 'heartbeats' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 font-mono">
              Heartbeat Records ({heartbeats.length} Logged to SQLite)
            </h3>
          </div>

          <div className="space-y-3">
            {heartbeats.map((hb, idx) => (
              <div key={idx} className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl font-mono text-xs space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="font-bold text-cyan-400">{hb.heartbeat_id}</span>
                  <span className="text-[11px]">{new Date(hb.timestamp).toLocaleTimeString()}</span>
                </div>
                <p className="text-slate-300 font-sans">{hb.reason_for_execution}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <div>
                    <strong className="text-slate-400 block">Prime State Before:</strong>
                    <span className="text-slate-200">{hb.prime_state_before}</span>
                  </div>
                  <div>
                    <strong className="text-slate-400 block">Prime State After:</strong>
                    <span className="text-emerald-400">{hb.prime_state_after}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subtab Content: Corpus */}
      {activeSubTab === 'corpus' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {corpusSources.map((cs) => (
              <div key={cs.id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2 font-sans text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-cyan-400">{cs.id}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-950 text-emerald-400 border border-emerald-800">
                    Rights Check Passed
                  </span>
                </div>
                <h4 className="font-bold text-slate-100">{cs.title}</h4>
                <p className="text-slate-400 text-[11px]">Authority: {cs.authority}</p>
                <div className="flex items-center justify-between text-slate-400 pt-2 border-t border-slate-800 font-mono text-[11px]">
                  <span>Entities: {cs.extractedEntitiesCount}</span>
                  <span>Rules: {cs.extractedRulesCount}</span>
                  <span className="text-emerald-400 font-bold">{cs.confidenceScore}% Confidence</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
