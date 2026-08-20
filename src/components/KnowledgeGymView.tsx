import React, { useEffect, useState } from 'react';
import { AuthoritativeSourceDefinition, FetchedDocument, KnowledgeChunk, KnowledgeAssertion, KnowledgeContradiction, AgentLearningReport, KnowledgeGapItem } from '../types/hermes';
import { BookOpen, Database, RefreshCw, FileText, CheckCircle2, ShieldCheck, AlertCircle, ArrowUpRight, Play, Sparkles, Layers, ShieldAlert, Cpu } from 'lucide-react';

export const KnowledgeGymView: React.FC = () => {
  const [sources, setSources] = useState<AuthoritativeSourceDefinition[]>([]);
  const [documents, setDocuments] = useState<FetchedDocument[]>([]);
  const [chunks, setChunks] = useState<KnowledgeChunk[]>([]);
  const [assertions, setAssertions] = useState<KnowledgeAssertion[]>([]);
  const [contradictions, setContradictions] = useState<KnowledgeContradiction[]>([]);
  const [reports, setReports] = useState<AgentLearningReport[]>([]);
  const [gaps, setGaps] = useState<KnowledgeGapItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isIngesting, setIsIngesting] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'sources' | 'documents' | 'chunks' | 'assertions' | 'contradictions' | 'reports' | 'gaps'>('sources');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sourcesRes, docsRes, chunksRes, assertionsRes, contraRes, reportsRes, gapsRes] = await Promise.all([
        fetch('/api/knowledge/sources'),
        fetch('/api/knowledge/documents'),
        fetch('/api/knowledge/chunks'),
        fetch('/api/knowledge/assertions'),
        fetch('/api/knowledge/contradictions'),
        fetch('/api/knowledge/reports'),
        fetch('/api/knowledge/gaps')
      ]);

      const sourcesData = await sourcesRes.json();
      const docsData = await docsRes.json();
      const chunksData = await chunksRes.json();
      const assertionsData = await assertionsRes.json();
      const contraData = await contraRes.json();
      const reportsData = await reportsRes.json();
      const gapsData = await gapsRes.json();

      setSources(sourcesData || []);
      setDocuments(docsData || []);
      setChunks(chunksData || []);
      setAssertions(assertionsData || []);
      setContradictions(contraData || []);
      setReports(reportsData || []);
      setGaps(gapsData || []);
    } catch (e) {
      console.error('Failed to load Knowledge Gym data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleRunAutonomousStep = async () => {
    try {
      setIsIngesting(true);
      const res = await fetch('/api/knowledge/learn-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentRoleId: 'SHALLOW-FOOTING-DESIGN-AGENT' })
      });
      const newReport = await res.json();
      setReports(prev => [newReport, ...prev]);
      await fetchData();
    } catch (e) {
      console.error('Learning step error:', e);
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
      {/* Knowledge Gym Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-950 border border-blue-800 rounded-xl text-blue-400">
                <BookOpen className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-extrabold text-white tracking-tight">HERMES Construction Knowledge Gym & Real Learning Engine</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Continuous background learning engine governed by the Construction Knowledge Director. Ingests government specifications, building codes, and material science, extracting structured facts and passing deterministic competency tests.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRunAutonomousStep}
              disabled={isIngesting}
              className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2 disabled:opacity-50"
            >
              <Play className={`w-4 h-4 ${isIngesting ? 'animate-spin' : ''}`} />
              <span>{isIngesting ? 'Executing Learning Cycle...' : 'Execute Autonomous Learning Step'}</span>
            </button>
            <button
              onClick={fetchData}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition border border-slate-700"
              title="Refresh Knowledge State"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Real Metrics Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-400 font-medium uppercase">Sources</div>
            <div className="text-lg font-bold text-white mt-0.5">{sources.length}</div>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-400 font-medium uppercase">Fetched Documents</div>
            <div className="text-lg font-bold text-cyan-400 mt-0.5">{documents.length}</div>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-400 font-medium uppercase">Parsed Chunks</div>
            <div className="text-lg font-bold text-indigo-400 mt-0.5">{chunks.length}</div>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-400 font-medium uppercase">Structured Assertions</div>
            <div className="text-lg font-bold text-emerald-400 mt-0.5">{assertions.length}</div>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-400 font-medium uppercase">Learning Reports</div>
            <div className="text-lg font-bold text-purple-400 mt-0.5">{reports.length}</div>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-400 font-medium uppercase">Contradictions</div>
            <div className="text-lg font-bold text-amber-400 mt-0.5">{contradictions.length}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 space-x-2">
        <button
          onClick={() => setActiveTab('sources')}
          className={`pb-3 px-4 font-semibold text-xs border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'sources' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Authoritative Sources ({sources.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('documents')}
          className={`pb-3 px-4 font-semibold text-xs border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'documents' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Fetched Documents ({documents.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('chunks')}
          className={`pb-3 px-4 font-semibold text-xs border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'chunks' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Parsed Chunks ({chunks.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('assertions')}
          className={`pb-3 px-4 font-semibold text-xs border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'assertions' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Assertions ({assertions.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`pb-3 px-4 font-semibold text-xs border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'reports' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Learning Reports ({reports.length})</span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'sources' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sources.map(src => (
            <div key={src.sourceId} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="px-2 py-0.5 bg-blue-950 text-blue-400 text-[10px] font-bold rounded border border-blue-800">
                    {src.sourceId}
                  </span>
                  <h3 className="text-sm font-bold text-white mt-1.5">{src.title}</h3>
                  <div className="text-xs text-slate-400 mt-0.5">{src.publisher} • {src.agencyOrOrganization}</div>
                </div>
                <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 text-[10px] font-medium rounded border border-emerald-800">
                  {src.authorityLevel}
                </span>
              </div>
              <div className="mt-3 text-xs text-slate-300 line-clamp-2">
                <strong>Topics:</strong> {src.topics.join(', ')}
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span>Rights: {src.copyrightLicenseStatus}</span>
                <a href={src.URL} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline flex items-center gap-1">
                  <span>Source URL</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="space-y-4">
          {documents.map(doc => (
            <div key={doc.documentId} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono font-bold text-cyan-400">{doc.documentId}</span>
                  <span className="ml-2 text-xs text-slate-400">SHA-256: {doc.checksumSha256.substring(0, 16)}...</span>
                </div>
                <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 text-[10px] font-bold rounded border border-emerald-800">
                  {doc.rightsStatus}
                </span>
              </div>
              <div className="mt-3 p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs text-slate-300 whitespace-pre-wrap max-h-48 overflow-y-auto">
                {doc.parsedText}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'chunks' && (
        <div className="space-y-3">
          {chunks.map(chk => (
            <div key={chk.chunkId} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-cyan-400 font-bold">{chk.chunkId}</span>
                <span className="text-slate-400">{chk.pageOrSection}</span>
              </div>
              <p className="text-xs text-slate-300 mt-2">{chk.rawText}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {chk.agentTags.map(tag => (
                  <span key={tag} className="px-1.5 py-0.5 bg-slate-800 text-slate-400 text-[9px] rounded">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'assertions' && (
        <div className="space-y-3">
          {assertions.map(ast => (
            <div key={ast.assertionId} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
              <div>
                <span className="font-mono text-xs text-indigo-400 font-bold">{ast.subject}</span>
                <div className="text-xs text-white font-medium mt-0.5">
                  {ast.predicate} = <span className="text-cyan-400 font-bold">{ast.objectValue} {ast.units || ''}</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Source: {ast.sectionTitle} (Confidence: {(ast.confidence * 100).toFixed(0)}%)
                </div>
              </div>
              <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 text-[10px] font-bold rounded border border-emerald-800">
                {ast.validationStatus}
              </span>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="space-y-4">
          {reports.map(rep => (
            <div key={rep.reportId} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-sm text-white">{rep.knowledgeObjective}</span>
                  <div className="text-xs text-slate-400">Agent: {rep.agentRoleId} • Evaluated by {rep.managerRoleId}</div>
                </div>
                <span className="px-2 py-0.5 bg-cyan-950 text-cyan-400 text-[10px] font-bold rounded border border-cyan-800">
                  {rep.managerReviewResult}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2 mt-4 text-center text-xs">
                <div className="p-2 bg-slate-950 rounded border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Chunks Created</div>
                  <div className="font-bold text-white mt-0.5">{rep.chunksCreated}</div>
                </div>
                <div className="p-2 bg-slate-950 rounded border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Assertions</div>
                  <div className="font-bold text-emerald-400 mt-0.5">{rep.entitiesExtracted}</div>
                </div>
                <div className="p-2 bg-slate-950 rounded border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Coverage Before</div>
                  <div className="font-bold text-slate-300 mt-0.5">{rep.coverageBefore}%</div>
                </div>
                <div className="p-2 bg-slate-950 rounded border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Coverage After</div>
                  <div className="font-bold text-cyan-400 mt-0.5">{rep.coverageAfter}%</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
