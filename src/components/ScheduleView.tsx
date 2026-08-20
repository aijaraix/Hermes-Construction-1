import React from 'react';
import { ConstructionTaskSchedule } from '../types/hermes';
import { Calendar, CheckCircle2, Clock, Wrench, HardHat } from 'lucide-react';

interface ScheduleViewProps {
  schedule: ConstructionTaskSchedule[];
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({ schedule }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl space-y-2">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-cyan-400" /> 4D Construction Sequence & Jobsite Schedule
        </h2>
        <p className="text-xs text-slate-400">
          Dependency-aware construction task timeline modeled from means & methods, cure times, and trade sequencing.
        </p>
      </div>

      {/* Task Schedule Timeline List */}
      <div className="space-y-4">
        {schedule.map((task) => (
          <div key={task.id} className="p-5 bg-slate-900 rounded-2xl border border-slate-800 shadow-xl space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded font-mono font-bold text-xs bg-slate-950 text-cyan-400 border border-slate-800">
                  Day {task.dayStart} – Day {task.dayEnd}
                </span>
                <h3 className="text-sm font-bold text-slate-100">{task.stageName}</h3>
              </div>

              <span
                className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                  task.status === 'completed'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : task.status === 'in_progress'
                    ? 'bg-cyan-950 text-cyan-400 border border-cyan-800 animate-pulse'
                    : 'bg-slate-950 text-slate-400 border border-slate-800'
                }`}
              >
                {task.status.replace('_', ' ')}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase font-bold block flex items-center gap-1">
                  <HardHat className="w-3 h-3 text-cyan-400" /> Lead Trade
                </span>
                <p className="text-slate-200 font-medium mt-0.5">{task.trade}</p>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase font-bold block flex items-center gap-1">
                  <Wrench className="w-3 h-3 text-amber-400" /> Equipment & Temporary Works Required
                </span>
                <p className="text-slate-300 font-mono mt-0.5">{task.equipmentRequired.join(', ')}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
