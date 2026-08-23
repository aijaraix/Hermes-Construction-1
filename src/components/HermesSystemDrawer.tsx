import React, { useState } from 'react';
import {
  X,
  Cpu,
  Users,
  BookOpen,
  ShieldCheck,
  FileSearch,
  Server,
  FolderGit2,
  Activity,
  Box,
  Layers,
  Sparkles,
  Award,
  Wrench,
  DollarSign,
  MapPin,
  Calendar,
  ShieldAlert,
  FolderTree,
  Terminal,
  Database,
  Lock
} from 'lucide-react';
import { NavTab } from './AppShell';

interface HermesSystemDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeSystemSubtab: NavTab;
  setActiveSystemSubtab: (tab: NavTab) => void;
  children: React.ReactNode;
}

export const HermesSystemDrawer: React.FC<HermesSystemDrawerProps> = ({
  isOpen,
  onClose,
  activeSystemSubtab,
  setActiveSystemSubtab,
  children
}) => {
  if (!isOpen) return null;

  const systemCategories = [
    {
      title: 'ACADEMY & TRAINING GYM',
      items: [
        { id: 'spatial-academy' as NavTab, label: '3.18B.3 Spatial Academy', icon: Box },
        { id: 'continuous-academy' as NavTab, label: '3.18B Continuous Academy', icon: Sparkles },
        { id: 'owner-sme-dashboard' as NavTab, label: '3.18B.2 Live SME Proof', icon: Award },
        { id: 'gym' as NavTab, label: 'Autonomous Training Gym', icon: Layers },
      ]
    },
    {
      title: 'AGENT & SYSTEM ORCHESTRATION',
      items: [
        { id: 'prime' as NavTab, label: 'HERMES Prime Orchestrator', icon: Cpu },
        { id: 'agent-org' as NavTab, label: 'Agent Roster (118 Contracts)', icon: Users },
        { id: 'readiness-gate' as NavTab, label: 'Core Readiness Gate', icon: ShieldCheck },
        { id: 'quota-integrity' as NavTab, label: 'Quota & Reasoning Integrity', icon: ShieldCheck },
      ]
    },
    {
      title: 'KNOWLEDGE & TRUTH',
      items: [
        { id: 'knowledge-center' as NavTab, label: 'Knowledge Ingestion Center', icon: BookOpen },
        { id: 'source-registry' as NavTab, label: 'Authoritative Source Registry', icon: FolderGit2 },
        { id: 'reality-truth' as NavTab, label: 'Reality & Data Truth Swarm', icon: ShieldCheck },
      ]
    },
    {
      title: 'AUDIT & DIAGNOSTICS',
      items: [
        { id: 'audit' as NavTab, label: 'System Audit Trail', icon: FileSearch },
        { id: 'system-health' as NavTab, label: 'System Health & Subsystems', icon: Server },
      ]
    },
    {
      title: 'PROJECT DATA ENGINES',
      items: [
        { id: 'inspections' as NavTab, label: 'Inspections & Defect QA', icon: Wrench },
        { id: 'bom' as NavTab, label: 'Model-Derived BOM', icon: DollarSign },
        { id: 'procurement' as NavTab, label: 'Materials & Procurement', icon: MapPin },
        { id: 'schedule' as NavTab, label: '4D Construction Schedule', icon: Calendar },
        { id: 'risks' as NavTab, label: 'Change-Order Risks', icon: ShieldAlert },
        { id: 'customizer' as NavTab, label: 'Customizer & Revisions', icon: Wrench },
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex justify-end animate-fadeIn font-sans selection:bg-cyan-500 selection:text-slate-950">
      <div className="w-full max-w-6xl bg-slate-900 border-l border-cyan-800/60 shadow-2xl flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-600 flex items-center justify-center text-slate-950 font-black text-sm">
              ⚙
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100">HERMES System Developer Area</h2>
                <span className="text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  DEVELOPER / INTERNAL PORTAL
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">Consolidated access to underlying engines, academies, and diagnostics</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition flex items-center gap-1 text-xs font-mono font-bold"
          >
            <X className="w-4 h-4" />
            <span>Close System Area</span>
          </button>
        </div>

        {/* Sub-Navigation & Sub-View Container */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sub-Navigation Rail */}
          <aside className="w-64 bg-slate-950 border-r border-slate-800 p-3 overflow-y-auto shrink-0 space-y-4 text-xs font-mono select-none">
            {systemCategories.map((cat, cIdx) => (
              <div key={cIdx} className="space-y-1">
                <div className="px-2 text-[10px] uppercase font-bold text-slate-500 tracking-wider font-sans">
                  {cat.title}
                </div>
                {cat.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSystemSubtab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSystemSubtab(item.id)}
                      className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition text-left ${
                        isActive
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/80 font-bold shadow-md'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </aside>

          {/* Sub-View Content Workspace */}
          <main className="flex-1 overflow-y-auto p-6 bg-slate-900">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};
