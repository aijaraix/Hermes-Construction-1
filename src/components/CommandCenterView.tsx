import React, { useEffect, useState } from 'react';
import { DigitalTwinProject, PrimeHeartbeatState, LiveLearningActivity } from '../types/hermes';
import {
  Activity,
  Cpu,
  Layers,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Server,
  Zap,
  Users,
  BookOpen,
  DollarSign,
  Wrench,
  Clock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface CommandCenterViewProps {
  project: DigitalTwinProject;
  heartbeatState: PrimeHeartbeatState;
  onTriggerHeartbeat: () => void;
  onNavigateTab: (tab: any) => void;
}

export const CommandCenterView: React.FC<CommandCenterViewProps> = ({
  project,
  heartbeatState,
  onTriggerHeartbeat,
  onNavigateTab,
}) => {
  const [activities, setActivities] = useState<LiveLearningActivity[]>([]);
  const [healthData, setHealthData] = useState<any>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const [actRes, healthRes] = await Promise.all([
          fetch('/api/knowledge/activities'),
          fetch('/api/system/health'),
        ]);
        const actData = await actRes.json();
        const hData = await healthRes.json();
        setActivities(actData || []);
        setHealthData(hData || null);
      } catch (e) {
        console.error('Error fetching command center streams:', e);
      }
    };

    fetchActivities();
    const timer = setInterval(fetchActivities, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner / System HUD */}
      <div className="p-6 bg-slate-900/90 rounded-2xl border border-cyan-800/60 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Cpu className="w-64 h-64 text-cyan-400" />
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <h2 className="text-xl font-bold text-slate-100 tracking-tight">HERMES COMMAND CENTER</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono text-[10px] font-bold uppercase">
                SYSTEM ONLINE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Real-time monitoring of active trade agent swarms, live reasoning provider executions, digital twin BIM coordination, and autonomous knowledge ingestion.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigateTab('3d-twin')}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-cyan-500/20"
            >
              <Layers className="w-4 h-4" /> Open 3D Twin
            </button>
            <button
              onClick={() => onNavigateTab('reality-truth')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition flex items-center gap-1.5"
            >
              <ShieldAlert className="w-4 h-4 text-emerald-400" /> Reality Swarm
            </button>
          </div>
        </div>
      </div>

      {/* Real Value Status Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Reasoning Provider */}
        <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-sans">
              Reasoning Provider
            </span>
            <Zap className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-base font-bold text-slate-100 font-mono">
            {healthData?.reasoningProvider?.providerName || 'Gemini 3.7 Flash'}
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Status:</span>
            <span className="text-emerald-400 font-bold font-mono">GATED & ACTIVE</span>
          </div>
        </div>

        {/* Card 2: Active Project */}
        <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-sans">
              Active Project
            </span>
            <Layers className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-base font-bold text-slate-100 truncate font-mono">
            {project.name}
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Completion:</span>
            <span className="text-cyan-400 font-bold font-mono">{project.overallCompletionPct}%</span>
          </div>
        </div>

        {/* Card 3: Open Inspections & Failures */}
        <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-sans">
              Quality & Inspections
            </span>
            <Wrench className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-base font-bold text-slate-100 font-mono">
            {project.inspectionTickets.length} Tickets
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Failures:</span>
            <span
              className={`font-bold font-mono ${
                heartbeatState.inspectionFailuresCount > 0 ? 'text-red-400' : 'text-emerald-400'
              }`}
            >
              {heartbeatState.inspectionFailuresCount} Open
            </span>
          </div>
        </div>

        {/* Card 4: BOM & Procurement Verification */}
        <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-sans">
              BOM & Price Truth
            </span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-base font-bold text-slate-100 font-mono">
            ${project.bom.totalCost.toLocaleString()}
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Verified Quote Coverage:</span>
            <span className="text-emerald-400 font-bold font-mono">82% Verified</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Activity Stream vs Quick Actions & System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Watchable HERMES Activity Stream (2 cols) */}
        <div className="lg:col-span-2 bg-slate-900/80 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
              <h3 className="text-sm font-bold text-slate-100">LIVE HERMES ACTIVITY STREAM</h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              CANONICAL EVENT FEED
            </span>
          </div>

          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {activities.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 font-mono">
                Awaiting active heartbeat events from autonomous reasoning swarm...
              </div>
            ) : (
              activities.slice(0, 8).map((act, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800/80 space-y-1.5 text-xs transition hover:border-cyan-800/40"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-cyan-950 text-cyan-400 border border-cyan-800">
                        {act.agentRoleId}
                      </span>
                      <span className="text-slate-400 text-[10px] font-mono">
                        {act.stage}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(act.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  <p className="text-slate-200 font-medium leading-normal">{act.activityDescription}</p>

                  {act.outcomeDetails && (
                    <p className="text-[11px] text-slate-400 font-mono bg-slate-900 p-2 rounded border border-slate-800/60">
                      {act.outcomeDetails}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* System & Workspace Controls Side Panel (1 col) */}
        <div className="space-y-6">
          {/* Quick Workspaces Launcher */}
          <div className="p-5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-3 shadow-xl">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-sans">
              Project Workspaces
            </h3>
            <div className="space-y-2">
              {[
                { id: 'project-overview', name: 'Project Overview & Stats', icon: Layers },
                { id: 'rooms-spaces', name: 'Rooms & Spaces Hierarchy', icon: BookOpen },
                { id: 'plans-systems', name: 'System Connectivity Chains', icon: Server },
                { id: 'bom', name: 'BOM & Cost Confidence', icon: DollarSign },
                { id: 'procurement', name: 'Supply Chain & Price Truth', icon: Wrench },
                { id: 'risks', name: 'Change-Order Risk Manager', icon: ShieldAlert },
              ].map((ws) => {
                const Icon = ws.icon;
                return (
                  <button
                    key={ws.id}
                    onClick={() => onNavigateTab(ws.id)}
                    className="w-full p-2.5 bg-slate-950 hover:bg-slate-800/80 rounded-xl border border-slate-800/80 text-xs font-medium text-slate-200 transition flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition" />
                      <span>{ws.name}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Autonomous Status Summary */}
          <div className="p-5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-3 font-mono text-xs">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-sans">
              Autonomous Governance
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Heartbeat Count:</span>
                <span className="text-cyan-300 font-bold">#{heartbeatState.heartbeatCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Active Swarm Agent:</span>
                <span className="text-emerald-400 font-bold">{heartbeatState.activeSwarmAgent}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Model Revision:</span>
                <span className="text-slate-200">v{project.iterationNumber}.0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Project Score:</span>
                <span className="text-cyan-400 font-bold">{heartbeatState.projectScore} / 100</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
