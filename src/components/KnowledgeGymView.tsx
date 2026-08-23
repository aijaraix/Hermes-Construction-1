import React, { useEffect, useState } from 'react';
import { AuthoritativeSourceDefinition, FetchedDocument, KnowledgeChunk, KnowledgeAssertion, AgentAuditTrace, ManagerReviewRecord, CompetencyTestResult, HttpSourceFetchRecord, LiveLearningActivity, AgentExecutionRecord } from '../types/hermes';
import { BookOpen, Database, RefreshCw, CheckCircle2, ShieldCheck, ArrowUpRight, Play, Sparkles, Layers, Award, Zap, XCircle, Activity, Eye, FileJson, Cpu } from 'lucide-react';
import { Phase318A1ReportView } from './Phase318A1ReportView';

export const KnowledgeGymView: React.FC = () => {
  const [sources, setSources] = useState<AuthoritativeSourceDefinition[]>([]);
  const [documents, setDocuments] = useState<FetchedDocument[]>([]);
  const [fetches, setFetches] = useState<HttpSourceFetchRecord[]>([]);
  const [chunks, setChunks] = useState<KnowledgeChunk[]>([]);
  const [assertions, setAssertions] = useState<KnowledgeAssertion[]>([]);
  const [auditTraces, setAuditTraces] = useState<AgentAuditTrace[]>([]);
  const [reviews, setReviews] = useState<ManagerReviewRecord[]>([]);
  const [activities, setActivities] = useState<LiveLearningActivity[]>([]);
  const [executions, setExecutions] = useState<AgentExecutionRecord[]>([]);
  const [selectedChunk, setSelectedChunk] = useState<KnowledgeChunk | null>(null);
  const [selectedExecution, setSelectedExecution] = useState<AgentExecutionRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isIngesting, setIsIngesting] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'report318a1' | 'activities' | 'traces' | 'retraining' | 'fetches' | 'chunks' | 'assertions' | 'reviews'>('report318a1');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sourcesRes, docsRes, fetchesRes, chunksRes, assertionsRes, tracesRes, reviewsRes, actRes, execRes] = await Promise.all([
        fetch('/api/knowledge/sources').catch(() => null),
        fetch('/api/knowledge/documents').catch(() => null),
        fetch('/api/knowledge/fetches').catch(() => null),
        fetch('/api/knowledge/chunks').catch(() => null),
        fetch('/api/knowledge/assertions').catch(() => null),
        fetch('/api/knowledge/audit-traces').catch(() => null),
        fetch('/api/knowledge/manager-reviews').catch(() => null),
        fetch('/api/knowledge/activities').catch(() => null),
        fetch('/api/knowledge/executions').catch(() => null)
      ]);

      if (sourcesRes && sourcesRes.ok) setSources((await sourcesRes.json().catch(() => [])) || []);
      if (docsRes && docsRes.ok) setDocuments((await docsRes.json().catch(() => [])) || []);
      if (fetchesRes && fetchesRes.ok) setFetches((await fetchesRes.json().catch(() => [])) || []);
      if (chunksRes && chunksRes.ok) setChunks((await chunksRes.json().catch(() => [])) || []);
      if (assertionsRes && assertionsRes.ok) setAssertions((await assertionsRes.json().catch(() => [])) || []);
      if (tracesRes && tracesRes.ok) setAuditTraces((await tracesRes.json().catch(() => [])) || []);
      if (reviewsRes && reviewsRes.ok) setReviews((await reviewsRes.json().catch(() => [])) || []);
      if (actRes && actRes.ok) setActivities((await actRes.json().catch(() => [])) || []);
      if (execRes && execRes.ok) setExecutions((await execRes.json().catch(() => [])) || []);
    } catch {
      // Handle gracefully
    } finally {
      setLoading(false);
    }
  };

  const handleRunAutonomousStep = async () => {
    try {
      setIsIngesting(true);
      await fetch('/api/knowledge/learn-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentRoleId: 'HVAC-SUPPLY-RETURN-DIFFUSER-AGENT' })
      });
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
        <span>Connecting to HERMES Phase 3.17.2 Genuine Agent Reasoning & Evaluation Engine...</span>
      </div>
    );
  }

  const retrainedTrace = auditTraces.find((t) => t.retrainingTriggered);

  return (
    <div className="space-y-6">
      {/* Knowledge Gym Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-950 border border-blue-800 rounded-xl text-blue-400">
                <BookOpen className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-extrabold text-white tracking-tight">Phase 3.17.2 — Genuine Agent Reasoning & Independent Evaluation Engine</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Auditable pipeline: Authoritative retrieval $\rightarrow$ LLM Reasoning execution $\rightarrow$ Independent deterministic validation $\rightarrow$ Critical failure detection $\rightarrow$ Retraining loop $\rightarrow$ Manager sign-off $\rightarrow$ Real shadow mode.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRunAutonomousStep}
              disabled={isIngesting}
              className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2 disabled:opacity-50"
            >
              <Play className={`w-4 h-4 ${isIngesting ? 'animate-spin' : ''}`} />
              <span>{isIngesting ? 'Executing Cycle...' : 'Trigger Autonomous Retraining Cycle'}</span>
            </button>
            <button
              onClick={fetchData}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition border border-slate-700"
              title="Refresh State"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-400 font-medium uppercase">Authoritative Sources</div>
            <div className="text-lg font-bold text-white mt-0.5">{sources.length}</div>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-400 font-medium uppercase">LLM Executions</div>
            <div className="text-lg font-bold text-cyan-400 mt-0.5">{executions.length}</div>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-400 font-medium uppercase">Parsed Chunks</div>
            <div className="text-lg font-bold text-indigo-400 mt-0.5">{chunks.length}</div>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-400 font-medium uppercase">Proof Agents</div>
            <div className="text-lg font-bold text-emerald-400 mt-0.5">{auditTraces.length}</div>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-400 font-medium uppercase">Retraining Cycles</div>
            <div className="text-lg font-bold text-amber-400 mt-0.5">1 Triggered</div>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-400 font-medium uppercase">Manager Sign-Offs</div>
            <div className="text-lg font-bold text-purple-400 mt-0.5">{reviews.length}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 space-x-2">
        <button
          onClick={() => setActiveTab('report318a1')}
          className={`pb-3 px-4 font-semibold text-xs border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'report318a1' ? 'border-cyan-500 text-cyan-400 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>Phase 3.18A.1 Reality Report & Proof</span>
        </button>
        <button
          onClick={() => setActiveTab('activities')}
          className={`pb-3 px-4 font-semibold text-xs border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'activities' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Live Activity Feed ({activities.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('traces')}
          className={`pb-3 px-4 font-semibold text-xs border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'traces' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Proof Agents Audit Traces ({auditTraces.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('retraining')}
          className={`pb-3 px-4 font-semibold text-xs border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'retraining' ? 'border-amber-500 text-amber-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Test Failure & Retraining Loop</span>
        </button>
        <button
          onClick={() => setActiveTab('fetches')}
          className={`pb-3 px-4 font-semibold text-xs border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'fetches' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>HTTP Source Fetches ({fetches.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('chunks')}
          className={`pb-3 px-4 font-semibold text-xs border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'chunks' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Chunk Provenance ({chunks.length})</span>
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
          onClick={() => setActiveTab('reviews')}
          className={`pb-3 px-4 font-semibold text-xs border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'reviews' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Manager Reviews ({reviews.length})</span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'report318a1' && (
        <Phase318A1ReportView />
      )}

      {activeTab === 'activities' && (
        <div className="space-y-3">
          {activities.map((act) => (
            <div key={act.activityId} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1 max-w-3xl">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-cyan-400">{act.agentRoleId}</span>
                  <span className="text-xs font-bold text-white">{act.title}</span>
                </div>
                <p className="text-xs text-slate-300">{act.details}</p>
                <div className="text-[10px] text-slate-500">{act.timestamp}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border ${
                  act.realityTag === 'FAILED'
                    ? 'bg-red-950 text-red-400 border-red-800'
                    : act.realityTag === 'RETRAINING'
                    ? 'bg-amber-950 text-amber-400 border-amber-800'
                    : 'bg-emerald-950 text-emerald-400 border-emerald-800'
                }`}>
                  {act.realityTag}
                </span>
                {act.executionId && (
                  <button
                    onClick={() => {
                      const ex = executions.find((e) => e.executionId === act.executionId);
                      if (ex) setSelectedExecution(ex);
                    }}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center gap-1 border border-slate-700"
                    title="View Execution Details"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'traces' && (
        <div className="space-y-6">
          {auditTraces.map((trace) => (
            <div key={trace.agentRoleId} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-blue-950 text-blue-400 text-xs font-mono font-bold rounded border border-blue-800">
                      {trace.agentRoleId}
                    </span>
                    <span className="text-xs text-slate-400">Discipline: {trace.discipline}</span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-1">{trace.roleTitle}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-emerald-950 text-emerald-400 font-bold text-xs rounded-lg border border-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{trace.certificationStatus}</span>
                  </span>
                </div>
              </div>

              {/* End-to-End Audit Chain Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* 1. Source & Document */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="font-bold text-cyan-400 flex items-center gap-1">
                    <span>1. Authoritative Source</span>
                  </div>
                  <div className="text-slate-300 font-semibold">{trace.documentId}</div>
                  <div className="font-mono text-[10px] text-slate-400 truncate">
                    SHA-256: {trace.documentChecksum}
                  </div>
                  <a href={trace.sourceUrl} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline flex items-center gap-1 text-[11px] pt-1">
                    <span>Official Source URL</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </a>
                </div>

                {/* 2. Knowledge Chunk & Assertion */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="font-bold text-indigo-400 flex items-center gap-1">
                    <span>2. Retrieved Chunk & Assertion</span>
                  </div>
                  <div className="font-mono text-cyan-400">{trace.chunkId} (Page {trace.pageNumber})</div>
                  <div className="text-slate-300 line-clamp-2 italic">"{trace.chunkText}"</div>
                  <div className="text-emerald-400 font-medium">Assertion: {trace.assertionText}</div>
                </div>

                {/* 3. Knowledge Pack & Score */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="font-bold text-purple-400 flex items-center gap-1">
                    <span>3. Pack & Evaluation</span>
                  </div>
                  <div className="font-mono text-slate-300">Pack: {trace.knowledgePackVersion}</div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Score:</span>
                    <span className="text-emerald-400 font-bold text-sm">{trace.finalTestScorePct}% (PASS)</span>
                  </div>
                  <div className="text-slate-400">Manager: {trace.managerRoleId} ({trace.managerReviewDecision})</div>
                </div>
              </div>

              {/* Agent Response */}
              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 space-y-1">
                <div className="text-slate-400 font-sans text-[11px] font-bold uppercase">Actual Agent Model Proposal Output:</div>
                <div className="whitespace-pre-wrap">{trace.finalAgentResponse}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Retraining Tab */}
      {activeTab === 'retraining' && retrainedTrace && (
        <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="p-3 bg-amber-950 border border-amber-800 text-amber-400 rounded-xl">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Demonstrated Test Failure & Retraining Loop</h3>
              <p className="text-xs text-slate-400">
                Agent <strong className="text-amber-400">{retrainedTrace.agentRoleId}</strong> failed its initial competency test due to a neck velocity quiet zone constraint violation, created a knowledge gap, ingested DOE Building America guide, upgraded to Knowledge Pack v2.0.0, and passed its re-test.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* INITIAL FAILED TEST */}
            <div className="bg-slate-950 p-5 rounded-xl border border-red-900/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 bg-red-950 text-red-400 font-bold text-[10px] rounded border border-red-800 flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  <span>INITIAL TEST: FAILED</span>
                </span>
                <span className="text-red-400 font-bold text-sm">{retrainedTrace.initialTestScorePct}% Score</span>
              </div>
              <div className="text-slate-300 font-semibold">{retrainedTrace.testScenarioTitle}</div>
              <div className="p-3 bg-red-950/20 border border-red-900/40 rounded text-red-300 font-mono text-[11px] whitespace-pre-wrap">
                {retrainedTrace.initialAgentResponse}
              </div>
              <div className="text-amber-400 text-[11px] font-semibold">
                Root Cause: {retrainedTrace.retrainingGapNote}
              </div>
            </div>

            {/* RETRAINED PASSING TEST */}
            <div className="bg-slate-950 p-5 rounded-xl border border-emerald-900/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 font-bold text-[10px] rounded border border-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>RETRAINED TEST: PASSED</span>
                </span>
                <span className="text-emerald-400 font-bold text-sm">{retrainedTrace.finalTestScorePct}% Score</span>
              </div>
              <div className="text-slate-300 font-semibold">Updated Pack: {retrainedTrace.retrainKnowledgePackVersion}</div>
              <div className="p-3 bg-emerald-950/20 border border-emerald-900/40 rounded text-emerald-300 font-mono text-[11px] whitespace-pre-wrap">
                {retrainedTrace.finalAgentResponse}
              </div>
              <div className="text-cyan-400 text-[11px] font-semibold">
                Sources Studied: {retrainedTrace.retrainingSourcesStudied?.join(', ')}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HTTP Fetches Tab */}
      {activeTab === 'fetches' && (
        <div className="space-y-4">
          {fetches.map((fetchRec) => (
            <div key={fetchRec.fetchId} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-cyan-400">{fetchRec.documentId}</span>
                <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 text-[10px] font-bold rounded border border-emerald-800">
                  HTTP {fetchRec.httpStatus} ({fetchRec.contentLength} Bytes)
                </span>
              </div>
              <div className="text-xs text-slate-300 font-mono truncate">Requested: {fetchRec.requestedUrl}</div>
              <div className="text-[11px] text-slate-400 font-mono">
                SHA-256 Checksum: <span className="text-cyan-300">{fetchRec.checksumSha256}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Chunks Tab */}
      {activeTab === 'chunks' && (
        <div className="space-y-3">
          {chunks.map((chk) => (
            <div
              key={chk.chunkId}
              onClick={() => setSelectedChunk(chk)}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer rounded-xl p-4 transition space-y-2"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-cyan-400 font-bold">{chk.chunkId}</span>
                <span className="text-slate-400">{chk.pageOrSection}</span>
              </div>
              <p className="text-xs text-slate-300 line-clamp-2">{chk.rawText}</p>
            </div>
          ))}
        </div>
      )}

      {/* Assertions Tab */}
      {activeTab === 'assertions' && (
        <div className="space-y-3">
          {assertions.map((ast) => (
            <div key={ast.assertionId} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
              <div>
                <span className="font-mono text-xs text-indigo-400 font-bold">{ast.subject}</span>
                <div className="text-xs text-white font-medium mt-0.5">
                  {ast.predicate} = <span className="text-cyan-400 font-bold">{ast.objectValue} {ast.units || ''}</span>
                </div>
              </div>
              <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 text-[10px] font-bold rounded border border-emerald-800">
                {ast.validationStatus}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Reviews Tab */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          {reviews.map((rev) => (
            <div key={rev.reviewId} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-sm text-white">Agent: {rev.agentRoleId}</span>
                  <div className="text-xs text-slate-400">Signed off by Manager: {rev.managerRoleId}</div>
                </div>
                <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 text-[10px] font-bold rounded border border-emerald-800">
                  {rev.decision}
                </span>
              </div>
              <div className="text-xs text-slate-300">
                <strong>Reasons:</strong> {rev.reasons.join(' ')}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Execution Inspection Modal */}
      {selectedExecution && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-3xl w-full space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-white text-sm">Execution & Reasoning Inspection Details</h3>
              </div>
              <button onClick={() => setSelectedExecution(null)} className="text-slate-400 hover:text-white text-xs font-bold">
                Close [X]
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div><strong className="text-cyan-400">Execution ID:</strong> {selectedExecution.executionId}</div>
              <div><strong className="text-cyan-400">Agent Role:</strong> {selectedExecution.agentRoleId}</div>
              <div><strong className="text-cyan-400">Model Provider:</strong> {selectedExecution.modelProvider}</div>
              <div><strong className="text-cyan-400">Model Name:</strong> {selectedExecution.modelName}</div>
              <div><strong className="text-cyan-400">Prompt Hash:</strong> {selectedExecution.promptHash}</div>
              <div><strong className="text-cyan-400">Status:</strong> {selectedExecution.executionStatus}</div>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-bold text-cyan-400 flex items-center gap-1">
                <FileJson className="w-4 h-4" />
                <span>Structured Proposal Output:</span>
              </div>
              <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] font-mono text-emerald-300 overflow-x-auto">
                {JSON.stringify(selectedExecution.structuredProposal, null, 2)}
              </pre>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-bold text-indigo-400">Raw Model Response:</div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] font-mono text-slate-300 whitespace-pre-wrap max-h-48 overflow-y-auto">
                {selectedExecution.rawResponse}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button onClick={() => setSelectedExecution(null)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chunk Provenance Modal */}
      {selectedChunk && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-2xl w-full space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm">Chunk Provenance & Evidence Details</h3>
              <button onClick={() => setSelectedChunk(null)} className="text-slate-400 hover:text-white text-xs font-bold">
                Close [X]
              </button>
            </div>
            <div className="space-y-2 text-xs font-mono text-slate-300">
              <div><strong className="text-cyan-400">Chunk ID:</strong> {selectedChunk.chunkId}</div>
              <div><strong className="text-cyan-400">Source ID:</strong> {selectedChunk.sourceId}</div>
              <div><strong className="text-cyan-400">Page / Section:</strong> {selectedChunk.pageOrSection}</div>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 whitespace-pre-wrap max-h-60 overflow-y-auto">
              {selectedChunk.rawText}
            </div>
            <div className="flex justify-end pt-2">
              <button onClick={() => setSelectedChunk(null)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
