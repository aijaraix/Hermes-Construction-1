import React, { useEffect, useState } from 'react';
import { CoreReadinessGate } from '../types/hermes';
import { Award, ShieldAlert, CheckCircle2, AlertTriangle, Cpu, Lock, ArrowUpRight } from 'lucide-react';

export const ReadinessGateView: React.FC = () => {
  const [gate, setGate] = useState<CoreReadinessGate | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchGateData();
  }, []);

  const fetchGateData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/organization/readiness');
      const data = await res.json();
      setGate(data);
    } catch (e) {
      console.error('Failed to load Readiness Gate metrics:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !gate) {
    return (
      <div className="p-8 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        <span>Calculating Core Construction Readiness Gate Metrics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Readiness Gate Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-cyan-950 border border-cyan-800 rounded-xl text-cyan-400">
                <Award className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-extrabold text-white tracking-tight">Core Construction Readiness Gate</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Strict Gate Enforcement per Phase 3.15 Directives. House #1 (*Tampa Coastal 2-Story Residence*) validation hold remains active until &ge; 85.0% of core House #1 specialist agent roles achieve certification.
            </p>
          </div>

          <div className="bg-slate-950 px-6 py-4 rounded-2xl border border-slate-800 text-right space-y-1">
            <div className="text-[10px] uppercase font-bold text-slate-400">Core Readiness Percentage</div>
            <div className="text-3xl font-black text-cyan-400">{gate.coreConstructionReadinessPct.toFixed(1)}%</div>
            <div className="text-[10px] text-slate-400">
              Required Threshold: <span className="text-emerald-400 font-bold">85.0%</span> ({gate.requiredCertificationThreshold} Roles)
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 space-y-2">
          <div className="flex justify-between text-xs font-bold text-slate-300">
            <span>Readiness Progress</span>
            <span>{gate.certifiedCount} / {gate.totalCoreHouse1Roles} Certified Core Roles</span>
          </div>
          <div className="w-full h-4 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                gate.coreConstructionReadinessPct >= 85.0
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-500'
                  : 'bg-gradient-to-r from-amber-500 to-cyan-500'
              }`}
              style={{ width: `${Math.min(100, gate.coreConstructionReadinessPct)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Gym Block State Indicator Card */}
      <div className={`p-6 rounded-2xl border shadow-xl flex items-start gap-4 ${
        gate.isGymBlocked
          ? 'bg-amber-950/30 border-amber-900/80 text-amber-200'
          : 'bg-emerald-950/30 border-emerald-900/80 text-emerald-200'
      }`}>
        <div className={`p-3 rounded-xl border ${
          gate.isGymBlocked ? 'bg-amber-950 border-amber-800 text-amber-400' : 'bg-emerald-950 border-emerald-800 text-emerald-400'
        }`}>
          {gate.isGymBlocked ? <Lock className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span>CONSTRUCTION GYM STATUS: {gate.isGymBlocked ? 'BLOCKED (HELD AT LEVEL 3)' : 'UNBLOCKED / READY'}</span>
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed font-mono">
            {gate.gymBlockReason}
          </p>
        </div>
      </div>

      {/* Breakdown Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">Total Defined System Roles</div>
          <div className="text-2xl font-black text-white">{gate.totalDefinedRoles} Roles</div>
          <div className="text-[10px] text-slate-400">Entire HERMES Swarm</div>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">Curricula Assigned</div>
          <div className="text-2xl font-black text-cyan-400">{gate.curriculumAssignedCount} Roles</div>
          <div className="text-[10px] text-slate-400">Study Packs Operating</div>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">Manager Reviewed</div>
          <div className="text-2xl font-black text-purple-400">{gate.managerReviewedCount} Roles</div>
          <div className="text-[10px] text-slate-400">Discipline Signoff Passed</div>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">Shadow Mode Tested</div>
          <div className="text-2xl font-black text-emerald-400">{gate.shadowTestedCount} Roles</div>
          <div className="text-[10px] text-slate-400">Parallel Validation Passed</div>
        </div>
      </div>
    </div>
  );
};
