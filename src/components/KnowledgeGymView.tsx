import React, { useEffect, useState } from 'react';
import { AuthoritativeSourceDefinition, KnowledgeChunk, KnowledgeEntity, AgentLearningReport, KnowledgeGapItem } from '../types/hermes';
import { BookOpen, Database, RefreshCw, FileText, CheckCircle2, ShieldCheck, AlertCircle, ArrowUpRight, Play, Sparkles } from 'lucide-react';

export const KnowledgeGymView: React.FC = () => {
  const [sources, setSources] = useState<AuthoritativeSourceDefinition[]>([]);
  const [chunks, setChunks] = useState<KnowledgeChunk[]>([]);
  const [entities, setEntities] = useState<KnowledgeEntity[]>([]);
  const [reports, setReports] = useState<AgentLearningReport[]>([]);
  const [gaps, setGaps] = useState<KnowledgeGapItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isIngesting, setIsIngesting] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'sources' | 'chunks' | 'entities' | 'reports' | 'gaps'>('sources');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sourcesRes, chunksRes, entitiesRes, reportsRes, gapsRes] = await Promise.all([
        fetch('/api/knowledge/sources'),
        fetch('/api/knowledge/chunks'),
        fetch('/api/knowledge/entities'),
        fetch('/api/knowledge/reports'),
        fetch('/api/knowledge/gaps')
      ]);

      const sourcesData = await sourcesRes.json();
      const chunksData = await chunksRes.json();
      const entitiesData = await entitiesRes.json();
      const reportsData = await reportsRes.json();
      const gapsData = await gapsRes.json();

      setSources(sourcesData || []);
      setChunks(chunksData || []);
      setEntities(entitiesData || []);
      setReports(reportsData || []);
      setGaps(gapsData || []);
    } catch (e) {
      console.error('Failed to load Knowledge Gym data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleRunIngestion = async () => {
    try {
      setIsIngesting(true);
      const res = await fetch('/api/knowledge/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentRoleId: 'HVAC-DUCT-ROUTING-AGENT' })
      });
      const newReport = await res.json();
      setReports(prev => [newReport, ...prev]);
      await fetchData();
    } catch (e) {
      console.error('Ingestion worker error:', e);
    } finally {
      setIsIngesting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        <span>Connecting to HERMES Construction Knowledge Gym & Corpus...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Knowledge Gym Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-950 border border-blue-800 rounded-xl text-blue-400">
                <BookOpen className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-extrabold text-white tracking-tight">HERMES Construction Knowledge Gym & Corpus</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Continuous 24/7 background learning engine governed by the Construction Knowledge Director. Ingesting government technical specifications, building codes, and material science into structured agent knowledge packs.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRunIngestion}
              disabled={isIngesting}
              className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2 disabled:opacity-50"
            >
              <Play className={`w-4 h-4 ${isIngesting ? 'animate-spin' : ''}`} />
              <span>{isIngesting ? 'Ingesting Sources...' : 'Trigger Ingestion Worker'}</span>
            </button>
          </div>
        </div>

        {/* Gym Corpus Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-4 border-t border-slate-800/80">
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
            <div className="text-[10px] uppercase font-semibold text-slate-400">Registered Sources</div>
            <div className="text-lg font-black text-blue-400">{sources.length} Primary</div>
          </div>
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
            <div className="text-[10px] uppercase font-semibold text-slate-400">Parsed Chunks</div>
            <div className="text-lg font-black text-cyan-400">{chunks.length} Chunks</div>
          </div>
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
            <div className="text-[10px] uppercase font-semibold text-slate-400">Knowledge Entities</div>
            <div className="text-lg font-black text-emerald-400">{entities.length} Entities</div>
          </div>
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
            <div className="text-[10px] uppercase font-semibold text-slate-400">Learning Reports</div>
            <div className="text-lg font-black text-purple-400">{reports.length} Reports</div>
          </div>
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
            <div className="text-[10px] uppercase font-semibold text-slate-400">Active Gaps</div>
            <div className="text-lg font-black text-amber-400">{gaps.length} Resolved</div>
          </div>
        </div>
      </div>

      {/* View Selector Tabs */}
      <div className="flex border-b border-slate-800 gap-4">
        {[
          { id: 'sources', label: `Authoritative Sources (${sources.length})` },
          { id: 'chunks', label: `Parsed Chunks (${chunks.length})` },
          { id: 'entities', label: `Knowledge Graph (${entities.length})` },
          { id: 'reports', label: `Learning Reports (${reports.length})` },
          { id: 'gaps', label: `Knowledge Gaps (${gaps.length})` },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 text-xs font-bold transition border-b-2 ${
              activeTab === tab.id
                ? 'text-cyan-400 border-cyan-500'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content Display */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        {activeTab === 'sources' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Authoritative Source Registry</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sources.map(src => (
                <div key={src.sourceId} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-cyan-400 font-mono">{src.sourceId}</span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                      {src.copyrightLicenseStatus}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-white">{src.title}</div>
                  <div className="text-xs text-slate-400">{src.publisher} • {src.agencyOrOrganization}</div>
                  <div className="text-xs text-slate-300 font-mono">Discipline: {src.discipline}</div>
                  <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800/80">
                    Topics: {src.topics.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'chunks' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Parsed Knowledge Chunks</h3>
            <div className="space-y-3">
              {chunks.map(chunk => (
                <div key={chunk.chunkId} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-cyan-400">
                    <span>{chunk.chunkId} • {chunk.sourceId}</span>
                    <span className="text-slate-400">{chunk.pageOrSection}</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-200">{chunk.headingHierarchy.join(' > ')}</div>
                  <p className="text-xs text-slate-300 bg-slate-900 p-3 rounded-lg border border-slate-800 italic">
                    "{chunk.rawText}"
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {chunk.agentTags.map((tag, i) => (
                      <span key={i} className="px-2 py-0.5 rounded text-[9px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'entities' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Construction Knowledge Graph Entities</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {entities.map(ent => (
                <div key={ent.entityId} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-purple-400">{ent.entityId}</span>
                    <span className="text-xs font-bold text-emerald-400">Confidence: {(ent.confidence * 100).toFixed(0)}%</span>
                  </div>
                  <div className="text-sm font-bold text-white">{ent.name}</div>
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-xs font-mono space-y-1">
                    {Object.entries(ent.properties).map(([k, v]) => (
                      <div key={k} className="flex justify-between">
                        <span className="text-slate-400">{k}:</span>
                        <span className="text-cyan-300 font-bold">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Agent Learning Reports</h3>
            {reports.length === 0 ? (
              <div className="text-xs text-slate-400 italic">No learning reports generated yet. Click "Trigger Ingestion Worker" above.</div>
            ) : (
              reports.map(rep => (
                <div key={rep.reportId} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-cyan-400">
                    <span>{rep.reportId} • Agent: {rep.agentRoleId}</span>
                    <span className="text-emerald-400 font-bold">{rep.managerReviewResult}</span>
                  </div>
                  <div className="text-xs text-slate-300 font-semibold">{rep.knowledgeObjective}</div>
                  <div className="grid grid-cols-3 gap-2 bg-slate-900 p-2 rounded-lg text-[10px] text-slate-300 font-mono text-center">
                    <div>Chunks: <span className="text-cyan-400 font-bold">{rep.chunksCreated}</span></div>
                    <div>Entities: <span className="text-purple-400 font-bold">{rep.entitiesExtracted}</span></div>
                    <div>Coverage: <span className="text-emerald-400 font-bold">{rep.coverageAfter.toFixed(1)}%</span></div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'gaps' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Knowledge Gaps Log</h3>
            {gaps.map(gap => (
              <div key={gap.gapId} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-amber-400">
                  <span>{gap.gapId} • Role: {gap.agentRoleId}</span>
                  <span className="text-emerald-400 font-bold">{gap.status}</span>
                </div>
                <div className="text-xs font-bold text-white">{gap.topic}</div>
                <div className="text-xs text-slate-300">Q: {gap.question}</div>
                <div className="text-xs text-emerald-300 bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-900/60">
                  Resolution: {gap.resolutionNote}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
