import React from 'react';
import { ChangeOrderRisk } from '../types/hermes';
import { ShieldAlert, AlertTriangle, CheckCircle2, DollarSign, Calendar } from 'lucide-react';

interface ChangeOrderViewProps {
  risks: ChangeOrderRisk[];
}

export const ChangeOrderView: React.FC<ChangeOrderViewProps> = ({ risks }) => {
  const unresolved = risks.filter((r) => !r.resolved);
  const totalPotentialCost = unresolved.reduce((a, b) => a + b.potentialCost, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-400" /> Change-Order Prevention Engine
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Aggressive preconstruction failure hunt to eliminate trade conflicts, missing scope, and costly field rework before construction.
            </p>
          </div>

          <div className="bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase text-slate-400 block">Prevented Cost Exposure</span>
            <span className="text-2xl font-black text-rose-400">${(totalPotentialCost ?? 0).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Risk Register List */}
      <div className="space-y-4">
        {risks.map((risk) => (
          <div key={risk.id} className={`p-5 bg-slate-900 rounded-2xl border shadow-xl space-y-3 ${risk.resolved ? 'border-slate-800' : 'border-rose-500/40'}`}>
            <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-slate-950 text-slate-300 border border-slate-800">
                  {risk.id}
                </span>
                <span className="text-xs font-bold uppercase text-slate-400">Affected Trades: {risk.affectedTrades.join(', ')}</span>
              </div>

              <span
                className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                  risk.resolved
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : 'bg-rose-950 text-rose-400 border border-rose-800'
                }`}
              >
                {risk.resolved ? 'RESOLVED' : `RISK: ${risk.probability}`}
              </span>
            </div>

            <p className="text-sm font-semibold text-slate-100">{risk.issue}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Cost & Schedule Exposure</span>
                <p className="text-slate-200 font-bold mt-0.5">
                  ${(risk.potentialCost ?? 0).toLocaleString()} • {risk.scheduleImpactDays} Days Schedule Delay
                </p>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase font-bold block text-cyan-400">Recommended Mitigation</span>
                <p className="text-slate-200 mt-0.5">{risk.recommendedMitigation}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
