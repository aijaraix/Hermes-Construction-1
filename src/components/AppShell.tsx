import React, { useState } from 'react';
import {
  DigitalTwinProject,
  PrimeHeartbeatState,
  BIMComponent,
} from '../types/hermes';
import {
  LayoutDashboard,
  Layers,
  Box,
  Cpu,
  ShieldCheck,
  DollarSign,
  Wrench,
  MapPin,
  Calendar,
  ShieldAlert,
  Activity,
  Sparkles,
  Users,
  BookOpen,
  Award,
  Download,
  Menu,
  X,
  ChevronDown,
  Building,
  CheckCircle2,
  AlertTriangle,
  FolderGit2,
  Server,
  FileSearch,
  Settings,
  Eye,
} from 'lucide-react';

export type NavTab =
  | 'command-center'
  | 'project-overview'
  | '3d-twin'
  | 'rooms-spaces'
  | 'plans-systems'
  | 'inspections'
  | 'bom'
  | 'procurement'
  | 'schedule'
  | 'risks'
  | 'decisions'
  | 'project-activity'
  | 'prime'
  | 'agent-org'
  | 'knowledge-center'
  | 'knowledge-gym'
  | 'readiness-gate'
  | 'gym'
  | 'reality-truth'
  | 'audit'
  | 'system-health'
  | 'source-registry'
  | 'customizer';

export type UserExperienceLevel = 'SUMMARY' | 'TECHNICAL' | 'AUDIT';

interface AppShellProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  currentProject: DigitalTwinProject;
  allProjects: DigitalTwinProject[];
  onSelectProject: (projectId: string) => void;
  heartbeatState: PrimeHeartbeatState;
  onTriggerHeartbeat: () => void;
  isTriggering: boolean;
  selectedComponent: BIMComponent | null;
  onCloseInspector: () => void;
  uxLevel: UserExperienceLevel;
  setUxLevel: (level: UserExperienceLevel) => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  activeTab,
  setActiveTab,
  currentProject,
  allProjects,
  onSelectProject,
  heartbeatState,
  onTriggerHeartbeat,
  isTriggering,
  selectedComponent,
  onCloseInspector,
  uxLevel,
  setUxLevel,
  children,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [projectSelectorOpen, setProjectSelectorOpen] = useState(false);

  const navItems = [
    {
      group: 'HERMES COMMAND',
      items: [
        { id: 'command-center' as NavTab, label: 'Command Center', icon: LayoutDashboard },
      ],
    },
    {
      group: 'CURRENT PROJECT',
      items: [
        { id: 'project-overview' as NavTab, label: 'Overview', icon: Building },
        { id: '3d-twin' as NavTab, label: 'Digital Twin (3D)', icon: Layers },
        { id: 'rooms-spaces' as NavTab, label: 'Rooms & Spaces', icon: Box },
        { id: 'plans-systems' as NavTab, label: 'Plans & Systems', icon: Server },
        { id: 'inspections' as NavTab, label: 'Inspections & Quality', icon: Wrench },
        { id: 'bom' as NavTab, label: 'BOM & Quantities', icon: DollarSign },
        { id: 'procurement' as NavTab, label: 'Procurement & Prices', icon: MapPin },
        { id: 'schedule' as NavTab, label: '4D Schedule', icon: Calendar },
        { id: 'risks' as NavTab, label: 'Change-Order Risks', icon: ShieldAlert },
        { id: 'customizer' as NavTab, label: 'Customizer & Revisions', icon: Sparkles },
      ],
    },
    {
      group: 'HERMES INTELLIGENCE',
      items: [
        { id: 'prime' as NavTab, label: 'HERMES Prime', icon: Cpu },
        { id: 'agent-org' as NavTab, label: 'Agent Organization', icon: Users },
        { id: 'knowledge-center' as NavTab, label: 'Knowledge Center', icon: BookOpen },
        { id: 'knowledge-gym' as NavTab, label: 'Knowledge Gym', icon: Award },
        { id: 'readiness-gate' as NavTab, label: 'Core Readiness Gate', icon: ShieldCheck },
        { id: 'gym' as NavTab, label: 'Autonomous Gym', icon: Activity },
      ],
    },
    {
      group: 'SYSTEM & DATA TRUTH',
      items: [
        { id: 'reality-truth' as NavTab, label: 'Reality & Data Truth', icon: ShieldCheck },
        { id: 'audit' as NavTab, label: 'System Audit Trail', icon: FileSearch },
        { id: 'system-health' as NavTab, label: 'System Health', icon: Server },
        { id: 'source-registry' as NavTab, label: 'Source Registry', icon: FolderGit2 },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-cyan-500 selection:text-slate-950">
      {/* Contextual Top Bar */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 shadow-lg">
        <div className="px-4 py-2.5 flex items-center justify-between gap-3">
          {/* Brand & Mobile Hamburger */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-black tracking-tighter text-base shadow-md shadow-cyan-500/20">
                H
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-2">
                  <h1 className="text-sm font-bold text-slate-100 tracking-tight leading-none">
                    HERMES CONSTRUCTION
                  </h1>
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                    Phase 3.17B • 5be9b4b
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">Autonomous Construction OS</p>
              </div>
            </div>
          </div>

          {/* Project Selector Badge */}
          <div className="relative">
            <button
              onClick={() => setProjectSelectorOpen(!projectSelectorOpen)}
              className="flex items-center gap-2 bg-slate-950 hover:bg-slate-800 border border-slate-700/80 px-3 py-1.5 rounded-xl text-xs transition font-mono"
            >
              <Building className="w-3.5 h-3.5 text-cyan-400" />
              <div className="text-left">
                <span className="text-[9px] uppercase text-slate-500 block font-sans">Active Project</span>
                <span className="font-bold text-slate-200 truncate max-w-[180px] sm:max-w-[240px] block">
                  {currentProject.name}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
            </button>

            {projectSelectorOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 p-2 space-y-1">
                <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider font-sans border-b border-slate-800">
                  Select Construction Project
                </div>
                {allProjects.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onSelectProject(p.id);
                      setProjectSelectorOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition flex items-center justify-between ${
                      p.id === currentProject.id
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-bold'
                        : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="truncate">
                      <div className="truncate font-semibold">{p.name}</div>
                      <div className="text-[10px] text-slate-400">{p.id} • {p.buildingType}</div>
                    </div>
                    {p.id === currentProject.id && <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Controls: Depth Selector, Source Download & Heartbeat HUD */}
          <div className="flex items-center gap-2.5">
            {/* UX Depth Level Selector */}
            <div className="hidden md:flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px] font-medium">
              <span className="text-slate-500 px-2 text-[10px] uppercase flex items-center gap-1 font-sans">
                <Eye className="w-3 h-3 text-cyan-400" /> Depth:
              </span>
              {(['SUMMARY', 'TECHNICAL', 'AUDIT'] as UserExperienceLevel[]).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setUxLevel(lvl)}
                  className={`px-2 py-0.5 rounded transition ${
                    uxLevel === lvl
                      ? 'bg-cyan-600 text-white font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>

            {/* Source Bundle Download */}
            <a
              href="/HERMES_SOURCE_BUNDLE.zip"
              download="HERMES_SOURCE_BUNDLE.zip"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-950 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 font-semibold text-xs rounded-xl transition shadow-md"
              title="Download full Phase 3.17B source code bundle"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden lg:inline text-[11px]">Bundle ZIP</span>
            </a>

            {/* Manual Heartbeat Trigger */}
            <button
              onClick={onTriggerHeartbeat}
              disabled={isTriggering}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition flex items-center gap-1.5 shadow-md ${
                isTriggering
                  ? 'bg-slate-800 text-slate-500 cursor-wait'
                  : 'bg-cyan-600 hover:bg-cyan-500 text-slate-950 shadow-cyan-500/20'
              }`}
            >
              <span className={`w-2 h-2 rounded-full bg-slate-950 ${isTriggering ? 'animate-ping' : ''}`} />
              <span className="font-sans text-[11px]">
                {isTriggering ? 'Ticking...' : `Heartbeat #${heartbeatState.heartbeatCount}`}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar (Desktop) / Slide-over (Mobile) */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-slate-900/95 border-r border-slate-800 transform ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          } transition-transform duration-200 ease-in-out flex flex-col justify-between overflow-y-auto shrink-0 select-none`}
        >
          <div className="p-3 space-y-5">
            {navItems.map((grp, gIdx) => (
              <div key={gIdx} className="space-y-1">
                <div className="px-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider font-sans">
                  {grp.group}
                </div>
                {grp.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition text-left ${
                        isActive
                          ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 font-bold shadow-md shadow-cyan-950/50'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? 'text-cyan-400' : 'text-slate-500'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* System Status Footer */}
          <div className="p-3 bg-slate-950/80 border-t border-slate-800/80 text-[11px] space-y-1 font-mono">
            <div className="flex items-center justify-between text-slate-400">
              <span>Prime Engine:</span>
              <span className="text-emerald-400 font-bold">ACTIVE</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Reasoning Provider:</span>
              <span className="text-cyan-400 font-bold">Gemini 3.7</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Reality Swarm:</span>
              <span className="text-emerald-400 font-bold">VERIFIED</span>
            </div>
          </div>
        </aside>

        {/* Mobile Overlay */}
        {mobileMenuOpen && (
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-950/80 z-20 lg:hidden backdrop-blur-sm"
          />
        )}

        {/* Main Workspace Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950 space-y-6">
          {children}
        </main>

        {/* Right Inspector Drawer (if component selected) */}
        {selectedComponent && (
          <aside className="w-80 lg:w-96 bg-slate-900 border-l border-cyan-800/50 p-5 overflow-y-auto shrink-0 z-20 space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <span className="font-mono text-xs text-cyan-400 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                  {selectedComponent.id}
                </span>
                <h3 className="text-sm font-bold text-slate-100 mt-1">{selectedComponent.assembly}</h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Floor {selectedComponent.floor} • Room: {selectedComponent.room}
                </p>
              </div>

              <button
                onClick={onCloseInspector}
                className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">
                  Calculated Quantities
                </span>
                <p className="text-cyan-300 font-bold text-sm">
                  {selectedComponent.quantity.value} {selectedComponent.quantity.unit}
                </p>
                <p className="text-slate-400 text-[11px]">
                  Unit Price: ${selectedComponent.unitCost} / {selectedComponent.quantity.unit}
                </p>
                <p className="text-emerald-400 font-bold text-xs mt-1">
                  Total Cost: ${(selectedComponent.totalCost ?? 0).toLocaleString()}
                </p>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">
                  Inspection Status
                </span>
                <span
                  className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                    selectedComponent.inspectionState === 'passed'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-red-950 text-red-400 border border-red-800'
                  }`}
                >
                  {selectedComponent.inspectionState}
                </span>
                {selectedComponent.inspectionNotes && (
                  <p className="text-slate-300 text-[11px] mt-1">{selectedComponent.inspectionNotes}</p>
                )}
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">
                  Selection Explainability
                </span>
                <p className="text-slate-300 leading-relaxed font-sans text-xs">
                  {selectedComponent.whySelected.reason}
                </p>
                <p className="text-slate-400 text-[11px]">
                  <strong className="text-slate-300">Code Rule:</strong> {selectedComponent.whySelected.codeRule}
                </p>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};
