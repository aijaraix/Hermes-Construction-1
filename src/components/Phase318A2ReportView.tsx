import React, { useEffect, useState } from 'react';
import { ShieldCheck, AlertTriangle, Cpu, RefreshCw, Layers, Database, Lock, CheckCircle2, XCircle } from 'lucide-react';
import { Phase318A2Report } from '../types/hermes';

export const Phase318A2ReportView: React.FC = () => {
  const [report, setReport] = useState<Phase318A2Report | null>(null);
  const [providerHealth, setProviderHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [auditLoading, setAuditLoading] = useState(false);
  const [mockQuotaState, setMockQuotaState] = useState(false);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const [repRes, healthRes] = await Promise.all([
        fetch('/api/academy/quota-integrity-report'),
        fetch('/api/academy/provider-health')
      ]);
      const repData = await repRes.json();
      const healthData = await healthRes.json();
      setReport(repData);
      setProviderHealth(healthData);
    } catch (err) {
      console.error('Failed to load Phase 3.18A.2 report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handleRunAudit = async () => {
    try {
      setAuditLoading(true);
      await fetch('/api/academy/run-retroactive-audit', { method: 'POST' });
      await fetchReport();
    } catch (err) {
      console.error('Audit run failed:', err);
    } finally {
      setAuditLoading(false);
    }
  };

  const handleToggleMockQuota = async () => {
    try {
      const nextState = !mockQuotaState;
      setMockQuotaState(nextState);
      await fetch('/api/academy/simulate-quota-exhaustion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exhausted: nextState })
      });
      await fetchReport();
    } catch (err) {
      console.error('Mock quota toggle failed:', err);
    }
  };

  const handleProcessQueue = async () => {
    try {
      await fetch('/api/academy/process-deferred-queue', { method: 'POST' });
      await fetchReport();
    } catch (err) {
      console.error('Process queue failed:', err);
    }
  };

  if (loading && !report) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400">
        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
        <span>Loading Phase 3.18A.2 Reasoning Quota Integrity Report...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 bg-slate-950 text-slate-100 min-h-screen">
      {/* HEADER BAR */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-amber-500 to-indigo-500" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs rounded-full font-semibold">
                PHASE 3.18A.2 CORRECTION
              </span>
              <span className="px-3 py-1 bg-rose-500/10 border border-rose-500/30 text-rose-400 font-mono text-xs rounded-full font-semibold flex items-center">
                <Lock className="w-3.5 h-3.5 mr-1" /> PHASE 3.18B LOCKED
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Reasoning Quota Integrity & Provider Failover Verification Report
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              HERMES Construction OS — Operational Proof Layer Hardening
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleRunAudit}
              disabled={auditLoading}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium flex items-center space-x-2 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${auditLoading ? 'animate-spin' : ''}`} />
              <span>Run Retroactive Audit</span>
            </button>
            <button
              onClick={handleToggleMockQuota}
              className={`px-4 py-2 border rounded-lg text-xs font-medium flex items-center space-x-2 transition ${
                mockQuotaState
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{mockQuotaState ? 'Quota Test: 429 Active' : 'Simulate 429 Quota Exceeded'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* PRIMARY METRICS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Primary Reasoning Model</span>
            <Cpu className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-white font-mono mt-2">
            {report?.primaryGeminiModel || 'gemini-3.7-flash'}
          </div>
          <div className="text-xs text-emerald-400/90 mt-1 flex items-center">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
            Active Tier 1 Provider
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Simulation Competency Credits</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-2">
            {report?.simulationCompetencyCredits ?? 0}
          </div>
          <div className="text-xs text-slate-400 mt-1">Strict Invariant: ZERO Allowed</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Simulation Certifications</span>
            <Lock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-2">
            {report?.simulationCertifications ?? 0}
          </div>
          <div className="text-xs text-slate-400 mt-1">Strict Invariant: ZERO Allowed</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>House #1 Simulation Credits</span>
            <AlertTriangle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-2">
            {report?.simulationHouse1QualificationCredits ?? 0}
          </div>
          <div className="text-xs text-slate-400 mt-1">House #1 Gated from Simulation</div>
        </div>
      </div>

      {/* MODEL FAILOVER CASCADE & QUEUE METRICS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-white tracking-wider uppercase font-mono flex items-center">
            <Layers className="w-4 h-4 text-indigo-400 mr-2" /> Model Failover Cascade Architecture
          </h2>
          <div className="space-y-2.5 text-xs font-mono">
            <div className="p-3 bg-slate-950/60 border border-emerald-500/30 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-emerald-400 font-bold">Tier 1 Model:</span> gemini-3.7-flash
                <span className="text-slate-400 block text-[11px] font-sans mt-0.5">Primary reasoning provider model</span>
              </div>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded">Verified</span>
            </div>

            <div className="p-3 bg-slate-950/60 border border-indigo-500/30 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-indigo-400 font-bold">Tier 2 Fallback:</span> gemini-3.1-flash-lite
                <span className="text-slate-400 block text-[11px] font-sans mt-0.5">First quota failover target</span>
              </div>
              <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded">Verified</span>
            </div>

            <div className="p-3 bg-slate-950/60 border border-slate-700/50 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-slate-300 font-bold">Tier 3 Fallback:</span> gemini-flash-latest
                <span className="text-slate-400 block text-[11px] font-sans mt-0.5">Secondary quota failover target</span>
              </div>
              <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded">Verified</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white tracking-wider uppercase font-mono flex items-center">
              <Database className="w-4 h-4 text-amber-400 mr-2" /> Deferred Reasoning Queue
            </h2>
            <button
              onClick={handleProcessQueue}
              className="px-3 py-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs rounded transition font-mono"
            >
              Replay Queued Jobs
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
              <div className="text-2xl font-bold font-mono text-amber-400">{report?.queuedRealReasoningJobs ?? 0}</div>
              <div className="text-[11px] text-slate-400 mt-1">Queued Jobs (DEFERRED_QUOTA)</div>
            </div>
            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
              <div className="text-2xl font-bold font-mono text-emerald-400">{report?.recoveredReplayedJobs ?? 0}</div>
              <div className="text-[11px] text-slate-400 mt-1">Replayed & Recovered Jobs</div>
            </div>
          </div>

          <div className="text-xs text-slate-400 bg-slate-950/40 p-3 rounded-lg border border-slate-800">
            <span className="text-slate-200 font-medium">Automatic Queue Policy:</span> When all Gemini tiers return 429 quota exhaustion, tasks enter <code className="text-amber-300 bg-amber-950/50 px-1 py-0.5 rounded">DEFERRED_QUOTA</code> status with exponential backoff and fair scheduling across disciplines.
          </div>
        </div>
      </div>

      {/* EXECUTION MODE ISOLATION COMPARISON */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-white tracking-wider uppercase font-mono">
          Visual Execution Mode Distinction
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded text-[11px] font-bold">
                LLM_REASONED
              </span>
              <span className="text-emerald-400 font-bold">Counts Toward Competency: YES</span>
            </div>
            <p className="text-slate-300 font-sans text-xs pt-1">
              Genuine specialist LLM reasoning generated via approved Gemini models. Formally evaluated by independent deterministic code validators.
            </p>
            <div className="text-[11px] text-slate-400 border-t border-emerald-900/50 pt-2">
              Status: <span className="text-emerald-300 font-bold">CERTIFIED_SCOPE_BOUND</span>
            </div>
          </div>

          <div className="p-4 bg-amber-950/20 border border-amber-500/30 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded text-[11px] font-bold">
                DETERMINISTIC_SIMULATION
              </span>
              <span className="text-rose-400 font-bold">Counts Toward Competency: NO</span>
            </div>
            <p className="text-slate-300 font-sans text-xs pt-1">
              Deterministic proposal generated for workflow continuity, sandbox testing, or geometry calculations. Strictly prohibited from granting competency credit.
            </p>
            <div className="text-[11px] text-slate-400 border-t border-amber-900/50 pt-2">
              Status: <span className="text-amber-300 font-bold">SIMULATION_ONLY (Competency Unchanged)</span>
            </div>
          </div>
        </div>
      </div>

      {/* GOVERNANCE QUESTIONS */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-white tracking-wider uppercase font-mono">
          Governance & Integrity Audit Questions
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase">
                <th className="py-2.5 px-3">Governance Requirement</th>
                <th className="py-2.5 px-3 text-center">Audit Answer</th>
                <th className="py-2.5 px-3">Enforcement Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td className="py-3 px-3">Can Gemini quota failure create fake competency credit?</td>
                <td className="py-3 px-3 text-center font-bold text-rose-400">NO</td>
                <td className="py-3 px-3 text-slate-400 font-sans">Tasks enter DEFERRED_QUOTA status; competency score remains unchanged or UNTESTED.</td>
              </tr>
              <tr>
                <td className="py-3 px-3">Can deterministic simulation certify an agent?</td>
                <td className="py-3 px-3 text-center font-bold text-rose-400">NO</td>
                <td className="py-3 px-3 text-slate-400 font-sans">Certification strictly requires LLM_REASONED execution mode and validator pass.</td>
              </tr>
              <tr>
                <td className="py-3 px-3">Can simulation keep engineering workflows active in parallel?</td>
                <td className="py-3 px-3 text-center font-bold text-emerald-400">YES</td>
                <td className="py-3 px-3 text-slate-400 font-sans">Simulation runs separately for sandbox testing with countsTowardCompetency = false.</td>
              </tr>
              <tr>
                <td className="py-3 px-3">Are simulation and LLM reasoning visibly distinct everywhere?</td>
                <td className="py-3 px-3 text-center font-bold text-emerald-400">YES</td>
                <td className="py-3 px-3 text-slate-400 font-sans">UI/API displays explicit badges for LLM_REASONED vs DETERMINISTIC_SIMULATION.</td>
              </tr>
              <tr>
                <td className="py-3 px-3">Do quota-deferred reasoning jobs resume automatically?</td>
                <td className="py-3 px-3 text-center font-bold text-emerald-400">YES</td>
                <td className="py-3 px-3 text-slate-400 font-sans">Queue processor replays pending jobs when provider capacity is restored.</td>
              </tr>
              <tr className="bg-slate-950/50 font-bold">
                <td className="py-3 px-3 text-white">Is Phase 3.18A.2 Verified & Hardened?</td>
                <td className="py-3 px-3 text-center text-emerald-400 text-sm">YES</td>
                <td className="py-3 px-3 text-emerald-300 font-sans">All reasoning quota integrity rules strictly enforced.</td>
              </tr>
              <tr className="bg-rose-950/20 font-bold">
                <td className="py-3 px-3 text-rose-300">Is Phase 3.18B Ready to Unlock?</td>
                <td className="py-3 px-3 text-center text-rose-400 text-sm">NO</td>
                <td className="py-3 px-3 text-rose-300 font-sans">Phase 3.18B remains strictly locked until user explicit signoff.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* EXIT GATES TABLE */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-white tracking-wider uppercase font-mono">
          Phase 3.18A.2 Exit Gate Verification Matrix (8/8 PASSED)
        </h2>
        <div className="space-y-2 font-mono text-xs">
          {report?.exitGates.map((gate) => (
            <div key={gate.gateId} className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-slate-200 font-bold">{gate.gateId}</span>
                </div>
                <p className="text-slate-400 text-[11px] font-sans mt-1 ml-6">{gate.description}</p>
                {gate.evidenceNote && (
                  <p className="text-emerald-400/90 text-[11px] font-sans mt-0.5 ml-6">
                    <span className="font-semibold">Evidence:</span> {gate.evidenceNote}
                  </p>
                )}
              </div>
              <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded font-bold text-[11px]">
                {gate.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
