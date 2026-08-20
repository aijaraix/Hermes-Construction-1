import React from 'react';
import { PrimeHeartbeatState } from '../types/hermes';
import { Activity, ShieldAlert, Cpu, Layers, DollarSign, Calendar, Wrench, MapPin, RefreshCw, Sparkles } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  heartbeatState: PrimeHeartbeatState;
  onTriggerHeartbeat: () => void;
  isTriggering: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  heartbeatState,
  onTriggerHeartbeat,
  isTriggering,
}) => {
  const tabs = [
    { id: '3d-twin', label: '3D Digital Twin', icon: Layers },
    { id: 'dashboard', label: 'HERMES Prime', icon: Cpu },
    { id: 'bom', label: 'BOM & Quantities', icon: DollarSign },
    { id: 'inspector', label: 'Inspectors & Repairs', icon: Wrench },
    { id: 'sourcing', label: 'Local Supply Chain', icon: MapPin },
    { id: 'schedule', label: '4D Schedule', icon: Calendar },
    { id: 'risks', label: 'Change-Order Risks', icon: ShieldAlert },
    { id: 'gym', label: 'Autonomous Gym', icon: Activity },
    { id: 'customizer', label: 'Customizer & Revisions', icon: Sparkles },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-black tracking-tighter text-lg shadow-lg shadow-cyan-500/20">
            H
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-100 tracking-tight">HERMES CONSTRUCTION</h1>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
                Prime Autonomous v2.4
              </span>
            </div>
            <p className="text-xs text-slate-400">Autonomous Construction Intelligence & Digital Building System</p>
          </div>
        </div>

        {/* Live Heartbeat Indicator HUD */}
        <div className="hidden lg:flex items-center gap-6 bg-slate-950/80 px-4 py-2 rounded-xl border border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Heartbeat #{heartbeatState.heartbeatCount}</span>
              <span className="text-emerald-400 font-semibold">{heartbeatState.activeSwarmAgent}</span>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-800" />

          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Completion</span>
            <span className="text-slate-200 font-bold">{heartbeatState.overallCompletionPct}%</span>
          </div>

          <div className="h-6 w-px bg-slate-800" />

          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Failures</span>
            <span className={`font-bold ${heartbeatState.inspectionFailuresCount > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              {heartbeatState.inspectionFailuresCount} Open
            </span>
          </div>

          <div className="h-6 w-px bg-slate-800" />

          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Score</span>
            <span className="text-cyan-400 font-bold">{heartbeatState.projectScore} / 100</span>
          </div>
        </div>

        {/* Prime Heartbeat Trigger Action */}
        <button
          onClick={onTriggerHeartbeat}
          disabled={isTriggering}
          className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs rounded-xl transition shadow-md shadow-cyan-600/20 flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isTriggering ? 'animate-spin' : ''}`} />
          {isTriggering ? 'Swarm Heartbeat Active...' : 'Trigger Heartbeat Turn'}
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 overflow-x-auto scrollbar-none flex gap-1 border-t border-slate-800/80 pt-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2.5 text-xs font-medium whitespace-nowrap rounded-t-lg transition flex items-center gap-2 border-b-2 ${
                isActive
                  ? 'bg-slate-800/90 text-cyan-400 border-cyan-500 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
              {tab.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
