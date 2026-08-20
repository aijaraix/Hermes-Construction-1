import React, { useState } from 'react';
import { InspectionTicket } from '../types/hermes';
import { AlertTriangle, CheckCircle2, Wrench, ShieldCheck, ArrowRight, RefreshCw, Clock } from 'lucide-react';

interface InspectorViewProps {
  tickets: InspectionTicket[];
  onRepairTicket: (ticketId: string) => void;
  onTriggerHeartbeat: () => void;
}

export const InspectorView: React.FC<InspectorViewProps> = ({
  tickets,
  onRepairTicket,
  onTriggerHeartbeat,
}) => {
  const [repairingId, setRepairingId] = useState<string | null>(null);

  const openTickets = tickets.filter((t) => t.status !== 'verified_closed');
  const closedTickets = tickets.filter((t) => t.status === 'verified_closed');

  const handleRepairClick = async (id: string) => {
    setRepairingId(id);
    await onRepairTicket(id);
    setRepairingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl flex flex-wrap items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-widest text-red-400 bg-red-950 px-2.5 py-0.5 rounded-full border border-red-800">
              INDEPENDENT INSPECTOR SWARM
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-cyan-400" /> Inspection & Auto-Repair Sub-System
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            The builder does NOT grade itself. Independent inspector agents attempt to find failures and assign dedicated repair swarms.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-slate-950 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400 block text-[10px] uppercase">Open Failures</span>
            <span className={`font-bold text-lg ${openTickets.length > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              {openTickets.length} Active
            </span>
          </div>
          <button
            onClick={onTriggerHeartbeat}
            className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs rounded-xl transition shadow flex items-center gap-1.5"
          >
            <RefreshCw className="w-4 h-4" /> Run Inspection Sweep
          </button>
        </div>
      </div>

      {/* Active Failure Tickets List */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400" /> Active Inspection Failure Tickets ({openTickets.length})
        </h3>

        {openTickets.length === 0 ? (
          <div className="p-8 bg-slate-900/60 rounded-2xl border border-slate-800 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h4 className="text-base font-bold text-slate-200">Zero Active Inspection Failures</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              All digital building systems have passed independent inspection checks across Florida Building Code & IPC standards.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {openTickets.map((ticket) => (
              <div key={ticket.id} className="p-5 bg-slate-900 rounded-2xl border border-red-500/40 shadow-xl space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded font-mono font-bold text-xs bg-red-950 text-red-300 border border-red-800">
                      {ticket.id}
                    </span>
                    <span className="text-xs font-bold text-slate-200">{ticket.inspectorAgent}</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-red-900/40 text-red-400 border border-red-700">
                    SEVERITY: {ticket.severity}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1 bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Location & Affected Objects</span>
                    <p className="text-slate-200 font-medium">{ticket.location}</p>
                    <p className="text-red-400 font-semibold mt-1">{ticket.problem}</p>
                  </div>

                  <div className="space-y-1 bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Required Building Standard</span>
                    <p className="text-cyan-300">{ticket.requiredStandard}</p>
                  </div>
                </div>

                {/* Proposed Repair Action */}
                <div className="p-3 bg-slate-950/80 rounded-xl border border-cyan-800/40 flex flex-wrap items-center justify-between gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block flex items-center gap-1">
                      <Wrench className="w-3 h-3 text-cyan-400" /> Assigned Repair Agent: {ticket.repairAgentAssigned}
                    </span>
                    <p className="text-slate-200 font-medium mt-0.5">{ticket.proposedRepair}</p>
                  </div>

                  <button
                    onClick={() => handleRepairClick(ticket.id)}
                    disabled={repairingId === ticket.id}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-semibold text-xs rounded-xl transition shadow flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Wrench className={`w-3.5 h-3.5 ${repairingId === ticket.id ? 'animate-spin' : ''}`} />
                    {repairingId === ticket.id ? 'Repairing & Reinspecting...' : 'Auto-Repair & Reinspect'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Closed Verified Tickets Log */}
      {closedTickets.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-slate-800">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Closed & Verified Repairs ({closedTickets.length})
          </h3>
          <div className="space-y-2">
            {closedTickets.map((t) => (
              <div key={t.id} className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center justify-between gap-4 text-xs">
                <div>
                  <span className="font-mono text-emerald-400 font-bold mr-2">{t.id}</span>
                  <span className="text-slate-300">{t.problem}</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                  VERIFIED CLOSED
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
