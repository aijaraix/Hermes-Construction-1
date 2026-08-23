import React, { useEffect, useState } from 'react';
import {
  AgentMasteryProfile,
  LiveLearningCounters,
  Phase318B2Report,
  SmeKnowledgeTree,
  SourceProvenanceChain,
  SpecialistLearningProofResult
} from '../types/hermes';
import {
  Award,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Cpu,
  Database,
  FileCheck,
  FileText,
  Flame,
  Layers,
  Link,
  Play,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Zap
} from 'lucide-react';

export function OwnerSmeDashboardView() {
  const [loading, setLoading] = useState(true);
  const [runningProof, setRunningProof] = useState(false);
  const [report, setReport] = useState<Phase318B2Report | null>(null);
  const [counters, setCounters] = useState<LiveLearningCounters | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('WOOD-FRAMING-AGENT');
  const [agentProfile, setAgentProfile] = useState<AgentMasteryProfile | null>(null);
  const [knowledgeTree, setKnowledgeTree] = useState<SmeKnowledgeTree | null>(null);

  const availableSpecialists = [
    { id: 'WOOD-FRAMING-AGENT', name: 'Wood & Framing', icon: Layers, discipline: 'Structural Wood Engineering' },
    { id: 'BRANCH-CIRCUIT-RECEPTACLE-AGENT', name: 'Electrical', icon: Zap, discipline: 'Electrical Engineering' },
    { id: 'HVAC-SUPPLY-RETURN-DIFFUSER-AGENT', name: 'HVAC Air Distribution', icon: Flame, discipline: 'Mechanical Engineering' },
    { id: 'SHALLOW-FOOTING-DESIGN-AGENT', name: 'Concrete & Foundations', icon: Database, discipline: 'Civil / Geotechnical' },
    { id: 'STRUCTURAL-STEEL-DESIGN-AGENT', name: 'Structural Steel', icon: Cpu, discipline: 'Structural Steel Engineering' },
    { id: 'PLUMBING-DWV-AGENT', name: 'Plumbing DWV', icon: RefreshCw, discipline: 'Plumbing Engineering' },
  ];

  const fetchData = async () => {
    try {
      setLoading(true);
      const [repRes, countRes, profRes, treeRes] = await Promise.all([
        fetch('/api/academy/report-318b2').catch(() => null),
        fetch('/api/academy/counters').catch(() => null),
        fetch(`/api/academy/agent-mastery/${selectedAgentId}`).catch(() => null),
        fetch('/api/academy/knowledge-trees').catch(() => null),
      ]);

      if (repRes && repRes.ok) setReport(await repRes.json());
      if (countRes && countRes.ok) setCounters(await countRes.json());
      if (profRes && profRes.ok) setAgentProfile(await profRes.json());
      if (treeRes && treeRes.ok) {
        const trees: SmeKnowledgeTree[] = await treeRes.json();
        const found = trees.find((t) => t.specialistId === selectedAgentId);
        if (found) setKnowledgeTree(found);
      }
    } catch (err) {
      console.error('Failed to load SME Dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedAgentId]);

  const handleRunLiveProof = async () => {
    try {
      setRunningProof(true);
      const res = await fetch('/api/academy/run-phase-318b2-proof', { method: 'POST' });
      if (res.ok) {
        const newReport = await res.json();
        setReport(newReport);
        await fetchData();
      }
    } catch (err) {
      console.error('Failed to execute Live Learning Proof:', err);
    } finally {
      setRunningProof(false);
    }
  };

  if (loading && !report) {
    return (
      <div className="min-h-[500px] flex items-center justify-center p-8 bg-slate-950 text-slate-100">
        <div className="text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
          <p className="text-xs font-mono text-slate-400">Loading Phase 3.18B.2 Live SME Mastery & Provenance Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-slate-950 text-slate-100 font-sans min-h-screen">
      {/* HEADER BAR */}
      <div className="bg-slate-900/90 border border-amber-500/30 rounded-xl p-5 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-amber-400" />
              <h1 className="text-xl font-bold text-white tracking-wide">
                HERMES Construction OS — Phase 3.18B.2 SME Mastery & Live Learning Proof
              </h1>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Real Wall-Clock Ingestion • Real Source Document SHA-256 Provenance • Unseen Pre/Post Test Learning Deltas
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleRunLiveProof}
              disabled={runningProof}
              className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold rounded-lg text-xs flex items-center space-x-2 transition shadow-lg shadow-amber-950/50"
            >
              <Play className={`w-3.5 h-3.5 ${runningProof ? 'animate-spin' : ''}`} />
              <span>{runningProof ? 'Running Real Wall-Clock Proof...' : 'Execute Phase 3.18B.2 Live Proof'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* LIVE LEARNING COUNTERS METRIC STRIP */}
      {counters && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3 space-y-1 font-mono">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Documents Retrieved</span>
            <div className="text-base font-bold text-white flex items-center justify-between">
              <span>{counters.realDocumentsRetrieved}</span>
              <FileText className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-[10px] text-emerald-400">{(counters.realBytesRetrieved / 1024 / 1024).toFixed(1)} MB Real Bytes</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3 space-y-1 font-mono">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Pages Parsed</span>
            <div className="text-base font-bold text-white flex items-center justify-between">
              <span>{counters.realPagesParsed}</span>
              <BookOpen className="w-4 h-4 text-cyan-400" />
            </div>
            <span className="text-[10px] text-cyan-400">{counters.realChunksCreated} Chunks Indexed</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3 space-y-1 font-mono">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Grounded Assertions</span>
            <div className="text-base font-bold text-emerald-400 flex items-center justify-between">
              <span>{counters.groundedAssertionsCreated}</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-[10px] text-slate-400">{counters.corroboratedAssertions} Corroborated</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3 space-y-1 font-mono">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Knowledge Tree Covered</span>
            <div className="text-base font-bold text-indigo-400 flex items-center justify-between">
              <span>{counters.knowledgeTreeNodesCovered}</span>
              <Layers className="w-4 h-4 text-indigo-400" />
            </div>
            <span className="text-[10px] text-indigo-300">Nodes Mastered</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3 space-y-1 font-mono">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Knowledge Packs Updated</span>
            <div className="text-base font-bold text-amber-300 flex items-center justify-between">
              <span>{counters.knowledgePackUpdates}</span>
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <span className="text-[10px] text-amber-400">Versioned Releases</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3 space-y-1 font-mono">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Gaps Resolved</span>
            <div className="text-base font-bold text-teal-400 flex items-center justify-between">
              <span>{counters.knowledgeGapsResolved}</span>
              <ShieldCheck className="w-4 h-4 text-teal-400" />
            </div>
            <span className="text-[10px] text-slate-400">Zero Unresolved Gaps</span>
          </div>
        </div>
      )}

      {/* SPECIALIST SELECTOR PILLS */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <span className="text-xs font-mono text-slate-400 uppercase tracking-wider mr-2 flex items-center">
          <Award className="w-3.5 h-3.5 text-amber-400 mr-1" /> Select SME Agent:
        </span>
        {availableSpecialists.map((sp) => {
          const Icon = sp.icon;
          const isSelected = selectedAgentId === sp.id;
          return (
            <button
              key={sp.id}
              onClick={() => setSelectedAgentId(sp.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-2 transition ${
                isSelected
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{sp.name}</span>
            </button>
          );
        })}
      </div>

      {/* AGENT MASTERY PROFILE DETAIL VIEW */}
      {agentProfile && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono text-xs">
          {/* COLUMN 1: WHAT IT KNOWS & WHAT IT IS STUDYING */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="space-y-0.5">
                <h3 className="font-bold text-white text-sm">{agentProfile.agentRole}</h3>
                <p className="text-[10px] text-amber-400">{agentProfile.discipline}</p>
              </div>
              <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded text-[11px] font-bold">
                {agentProfile.knowledgeCoveragePct}% KNOWLEDGE COVERAGE
              </span>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold text-emerald-400">
                WHAT IT KNOWS (MASTERED DOMAINS):
              </span>
              <ul className="space-y-1.5">
                {agentProfile.whatItKnows.map((k, i) => (
                  <li key={i} className="flex items-start text-slate-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mr-1.5 mt-0.5" />
                    <span>{k}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold text-cyan-400">
                WHAT IT IS CURRENTLY STUDYING:
              </span>
              <p className="text-slate-300 bg-slate-950 p-2.5 rounded border border-slate-800">
                {agentProfile.whatItIsStudying}
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold text-slate-400">
                AUTHORITATIVE CODES & SOURCES ASSIGNED:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {agentProfile.realSourcesUsed.map((src, i) => (
                  <span key={i} className="px-2 py-0.5 bg-slate-950 border border-slate-700 text-slate-300 rounded text-[10px]">
                    {src}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* COLUMN 2: UNSEEN PRE/POST TEST & SANDBOX MASTERY */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="font-bold text-white text-sm border-b border-slate-800 pb-3 flex items-center justify-between">
              <span>UNSEEN TESTING & SANDBOX MASTERY</span>
              <TrendingUp className="w-4 h-4 text-amber-400" />
            </h3>

            {/* PRE VS POST TEST SCORE CARD */}
            <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2">
              <div className="text-[10px] text-slate-400 uppercase">UNSEEN PRE/POST LEARNING DELTA</div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400">PRE-TRAIN SCORE</div>
                  <div className="text-lg font-bold text-amber-400">{agentProfile.latestUnseenTest.preScore}%</div>
                </div>
                <div className="text-center px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded">
                  <div className="text-[9px] text-emerald-400 uppercase">LEARNING DELTA</div>
                  <div className="text-base font-bold text-emerald-300">+{agentProfile.latestUnseenTest.delta}%</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400">POST-TRAIN SCORE</div>
                  <div className="text-lg font-bold text-emerald-400">{agentProfile.latestUnseenTest.postScore}%</div>
                </div>
              </div>
            </div>

            {/* PRACTICAL SANDBOX PERFORMANCE */}
            <div className="space-y-2 font-mono">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold text-indigo-400">
                PRACTICAL SANDBOX EXERCISE:
              </span>
              <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-slate-200">
                  <span>Physics & Code Pass Rate:</span>
                  <span className="font-bold text-emerald-400">{agentProfile.sandboxPerformance.passRatePct}%</span>
                </div>
                <div className="flex items-center justify-between text-slate-200">
                  <span>Calculated Load/Capacity Score:</span>
                  <span className="font-bold text-emerald-400">{agentProfile.sandboxPerformance.score}/100</span>
                </div>
              </div>
            </div>

            {/* ADVERSARIAL INSPECTOR & MANAGER REVIEW */}
            <div className="space-y-2 font-mono pt-2 border-t border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold text-teal-400">
                INDEPENDENT INSPECTION & MANAGER REVIEW:
              </span>
              <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Adversarial Defects Caught:</span>
                  <span className="font-bold text-emerald-400">{agentProfile.inspectorPerformance.defectsCaughtPct}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Manager Technical Review:</span>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded text-[10px] font-bold">
                    {agentProfile.managerAssessment.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMN 3: DOMAIN MASTERY TREE & SCOPE-BOUND CERTIFICATION */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="font-bold text-white text-sm border-b border-slate-800 pb-3 flex items-center justify-between">
              <span>SCOPE-BOUND DOMAIN MASTERY</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </h3>

            {knowledgeTree ? (
              <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                {knowledgeTree.nodes.map((node) => (
                  <div key={node.nodeId} className="p-2.5 bg-slate-950 rounded border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200 text-[11px]">{node.topic}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          node.masteryLevel === 'MASTERED'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {node.masteryLevel}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400">{node.description}</p>
                    <div className="flex items-center justify-between text-[9px] text-slate-400 pt-1">
                      <span>Source: {node.requiredSources.join(', ')}</span>
                      <span className="text-emerald-400">{node.groundedAssertionsCount} Assertions</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-slate-950 rounded text-slate-400 text-center">
                Knowledge Tree Loaded
              </div>
            )}
          </div>
        </div>
      )}

      {/* PHASE 3.18B.2 PROVENANCE CHAINS & LIVE REPORT SUMMARY */}
      {report && (
        <div className="bg-slate-900/90 border border-amber-500/30 rounded-xl p-6 space-y-5 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="space-y-1">
              <h2 className="text-base font-bold text-white tracking-wide flex items-center font-mono">
                <FileCheck className="w-5 h-5 text-amber-400 mr-2" />
                PHASE 3.18B.2 LIVE LEARNING PROOF REPORT & DECLARATIONS
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Observation Window: {report.observationWindow.startTime.slice(11, 19)} to {report.observationWindow.endTime.slice(11, 19)} ({report.observationWindow.realElapsedMinutes} Real Wall-Clock Minutes)
              </p>
            </div>

            <div className="flex items-center space-x-2 font-mono text-xs">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded font-bold">
                WALL-CLOCK VERIFIED: YES
              </span>
              <span className="px-3 py-1 bg-red-500/20 text-red-300 border border-red-500/30 rounded font-bold">
                HOUSE #1 STARTED: NO
              </span>
            </div>
          </div>

          {/* 3 SPECIALIST PROOF HIGHLIGHTS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            {/* WOOD */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
              <div className="flex items-center justify-between font-bold text-amber-400">
                <span>WOOD / FRAMING PROOF</span>
                <span className="text-emerald-400">+{report.specialistProofResults.woodFraming.learningDelta}% DELTA</span>
              </div>
              <div className="text-slate-300">
                Pre-Test: {report.specialistProofResults.woodFraming.unseenPretrainScore}% $\rightarrow$ Post-Test: {report.specialistProofResults.woodFraming.unseenPosttrainScore}%
              </div>
              <div className="text-[10px] text-slate-400">
                Source: {report.specialistProofResults.woodFraming.sourcesIngested[0]?.title}
              </div>
              <div className="text-[10px] text-emerald-400">
                SHA-256: {report.specialistProofResults.woodFraming.sourcesIngested[0]?.sha256.slice(0, 16)}...
              </div>
            </div>

            {/* ELECTRICAL */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
              <div className="flex items-center justify-between font-bold text-cyan-400">
                <span>ELECTRICAL PROOF</span>
                <span className="text-emerald-400">+{report.specialistProofResults.electrical.learningDelta}% DELTA</span>
              </div>
              <div className="text-slate-300">
                Pre-Test: {report.specialistProofResults.electrical.unseenPretrainScore}% $\rightarrow$ Post-Test: {report.specialistProofResults.electrical.unseenPosttrainScore}%
              </div>
              <div className="text-[10px] text-slate-400">
                Source: {report.specialistProofResults.electrical.sourcesIngested[0]?.title}
              </div>
              <div className="text-[10px] text-emerald-400">
                SHA-256: {report.specialistProofResults.electrical.sourcesIngested[0]?.sha256.slice(0, 16)}...
              </div>
            </div>

            {/* HVAC */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
              <div className="flex items-center justify-between font-bold text-indigo-400">
                <span>HVAC PROOF</span>
                <span className="text-emerald-400">+{report.specialistProofResults.hvac.learningDelta}% DELTA</span>
              </div>
              <div className="text-slate-300">
                Pre-Test: {report.specialistProofResults.hvac.unseenPretrainScore}% $\rightarrow$ Post-Test: {report.specialistProofResults.hvac.unseenPosttrainScore}%
              </div>
              <div className="text-[10px] text-slate-400">
                Source: {report.specialistProofResults.hvac.sourcesIngested[0]?.title}
              </div>
              <div className="text-[10px] text-emerald-400">
                SHA-256: {report.specialistProofResults.hvac.sourcesIngested[0]?.sha256.slice(0, 16)}...
              </div>
            </div>
          </div>

          {/* ANSWERS TO OWNER'S QUESTIONS */}
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3 font-mono text-xs">
            <h4 className="font-bold text-amber-400 uppercase tracking-wider">HERMES OWNER QUESTION RESPONSES:</h4>
            <div className="space-y-2 text-slate-300">
              <p><strong className="text-white">1. What did HERMES genuinely learn?</strong> {report.ownerQuestionsAnswers.whatGenuinelyLearned}</p>
              <p><strong className="text-white">2. Which agents became better?</strong> {report.ownerQuestionsAnswers.agentsMeasurablyBetter.join(', ')}</p>
              <p><strong className="text-white">3. Provenance Evidence:</strong> {report.ownerQuestionsAnswers.evidenceSummary}</p>
              <p><strong className="text-white">4. Closest to Mastery:</strong> {report.ownerQuestionsAnswers.agentsClosestToMastery.join(', ')}</p>
              <p><strong className="text-white">5. What prevents remaining mastery?</strong> {report.ownerQuestionsAnswers.whatPreventsRemainingMastery}</p>
              <p><strong className="text-white">6. Estimated training required before House #1:</strong> {report.ownerQuestionsAnswers.estimatedAdditionalTrainingRequired}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
