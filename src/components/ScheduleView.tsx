import React from 'react';
import { ConstructionTaskSchedule } from '../types/hermes';
import { Calendar, CheckCircle2, Clock, Wrench, HardHat, AlertCircle, ShieldCheck } from 'lucide-react';
import { useHermesProject } from '../context/HermesProjectContext';

interface ScheduleViewProps {
  schedule: ConstructionTaskSchedule[];
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({ schedule }) => {
  const { worldState } = useHermesProject();
  const scheduleActivities = worldState?.scheduleActivities || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-cyan-400" /> Primavera P6 CPM 4D Construction Sequence
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Dependency-aware forward/backward pass CPM algorithm determining critical path, total float, and trade handoffs.
            </p>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
            <span className="text-slate-400">Critical Path Duration:</span>
            <span className="text-cyan-400 font-bold">
              {scheduleActivities.length > 0
                ? Math.max(...scheduleActivities.map((a) => a.earlyFinish))
                : schedule.length * 10}{' '}
              Calendar Days
            </span>
          </div>
        </div>
      </div>

      {/* CPM Activity Schedule List */}
      <div className="space-y-4 font-mono text-xs">
        {(scheduleActivities.length > 0 ? scheduleActivities : schedule).map((act: any) => {
          const isCpmActivity = 'earlyStart' in act;
          const isCritical = isCpmActivity ? act.isCriticalPath : false;

          return (
            <div
              key={act.id}
              className={`p-5 rounded-2xl border shadow-xl space-y-3 transition ${
                isCritical
                  ? 'bg-slate-900 border-amber-500/50 shadow-amber-500/10'
                  : 'bg-slate-900 border-slate-800'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800 font-sans">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded font-mono font-bold text-xs bg-slate-950 text-cyan-400 border border-slate-800">
                    {isCpmActivity ? `Day ${act.earlyStart} – Day ${act.earlyFinish}` : `Day ${act.dayStart} – Day ${act.dayEnd}`}
                  </span>
                  <h3 className="text-sm font-bold text-slate-100">{act.stageName || act.activityName}</h3>
                  {isCritical && (
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-950 text-amber-400 border border-amber-800 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> CRITICAL PATH
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                      act.status === 'completed'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : act.status === 'in_progress'
                        ? 'bg-cyan-950 text-cyan-400 border border-cyan-800 animate-pulse'
                        : 'bg-slate-950 text-slate-400 border border-slate-800'
                    }`}
                  >
                    {act.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              {/* CPM Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block font-sans">Early Start / Early Finish</span>
                  <span className="text-slate-200 font-bold">
                    {isCpmActivity ? `Day ${act.earlyStart} / Day ${act.earlyFinish}` : `Day ${act.dayStart} / Day ${act.dayEnd}`}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block font-sans">Late Start / Late Finish</span>
                  <span className="text-slate-200 font-bold">
                    {isCpmActivity ? `Day ${act.lateStart} / Day ${act.lateFinish}` : `Day ${act.dayStart} / Day ${act.dayEnd}`}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block font-sans">Total Float (Slack)</span>
                  <span className={`font-bold ${isCritical ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {isCpmActivity ? `${act.totalFloat} Days` : '0 Days'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block font-sans">Inspection Status</span>
                  <span className="text-cyan-400 font-bold text-[10px] flex items-center gap-1 font-sans">
                    <ShieldCheck className="w-3 h-3 text-cyan-400" />
                    {act.inspectionStatus || (act.status === 'completed' ? 'HERMES_VALIDATED' : 'PENDING_CITY_INSPECTION')}
                  </span>
                </div>
              </div>

              {/* Trade & Equipment */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block flex items-center gap-1">
                    <HardHat className="w-3 h-3 text-cyan-400" /> Assigned Lead Trade
                  </span>
                  <p className="text-slate-200 font-medium mt-0.5">{act.trade || act.tradeSubcontractor}</p>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block flex items-center gap-1">
                    <Wrench className="w-3 h-3 text-amber-400" /> Equipment & Temporary Works Required
                  </span>
                  <p className="text-slate-300 font-mono mt-0.5">
                    {Array.isArray(act.equipmentRequired) ? act.equipmentRequired.join(', ') : 'Standard Trade Rigging & Safety'}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
