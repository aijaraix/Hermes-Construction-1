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
  | 'bim-workspace'
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
  | 'continuous-academy'
  | 'spatial-academy'
  | 'owner-sme-dashboard'
  | 'reality-truth'
  | 'audit'
  | 'system-health'
  | 'source-registry'
  | 'quota-integrity'
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
  onOpenSystemDrawer?: () => void;
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
  onOpenSystemDrawer,
  children,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [projectSelectorOpen, setProjectSelectorOpen] = useState(false);

  const navItems = [
    {
      group: 'CUSTOMER WORKSPACE',
      items: [
        { id: 'bim-workspace' as NavTab, label: 'BIM Workspace (OpenBIM)', icon: Building },
      ],
    },
  ];

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-50 text-slate-900 font-sans flex flex-col selection:bg-blue-500 selection:text-white">
      {/* Contextual Top Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="px-4 py-2 flex items-center justify-between gap-3">
          {/* Brand & Mobile Hamburger */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black tracking-tighter text-base shadow-md shadow-blue-500/20">
                H
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-2">
                  <h1 className="text-sm font-extrabold text-slate-900 tracking-tight leading-none">
                    HERMES CONSTRUCTION
                  </h1>
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                    Phase 3.17B • Clean White OS
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">Autonomous Spatial Building System</p>
              </div>
            </div>
          </div>

          {/* Project Selector Badge */}
          <div className="relative">
            <button
              onClick={() => setProjectSelectorOpen(!projectSelectorOpen)}
              className="flex items-center gap-2.5 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 px-3.5 py-1.5 rounded-xl text-xs transition font-mono shadow-xs"
            >
              <Building className="w-4 h-4 text-blue-600" />
              <div className="text-left">
                <span className="text-[9px] uppercase font-bold text-slate-400 block font-sans">Active Project</span>
                <span className="font-bold text-slate-800 truncate max-w-[180px] sm:max-w-[260px] block">
                  {currentProject.name}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 ml-1" />
            </button>

            {projectSelectorOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 p-2 space-y-1">
                <div className="px-3 py-1.5 text-[10px] uppercase font-extrabold text-slate-400 tracking-wider font-sans border-b border-slate-100">
                  Select Project
                </div>
                {allProjects.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onSelectProject(p.id);
                      setProjectSelectorOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-mono transition flex items-center justify-between ${
                      p.id === currentProject.id
                        ? 'bg-blue-50 text-blue-800 border border-blue-200/80 font-bold shadow-xs'
                        : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="truncate">
                      <div className="truncate font-bold text-slate-900">{p.name}</div>
                      <div className="text-[10px] text-slate-500">{p.id} • {p.buildingType}</div>
                    </div>
                    {p.id === currentProject.id && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Controls: Depth Selector & Heartbeat HUD */}
          <div className="flex items-center gap-2.5">
            {/* UX Depth Level Selector */}
            <div className="hidden md:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-[11px] font-medium">
              <span className="text-slate-500 px-2 text-[10px] uppercase flex items-center gap-1 font-sans font-bold">
                <Eye className="w-3 h-3 text-blue-600" /> Depth:
              </span>
              {(['SUMMARY', 'TECHNICAL', 'AUDIT'] as UserExperienceLevel[]).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setUxLevel(lvl)}
                  className={`px-2.5 py-0.5 rounded-lg transition text-xs ${
                    uxLevel === lvl
                      ? 'bg-blue-600 text-white font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>

            {/* Manual Heartbeat Trigger */}
            <button
              onClick={onTriggerHeartbeat}
              disabled={isTriggering}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition flex items-center gap-1.5 shadow-sm ${
                isTriggering
                  ? 'bg-slate-200 text-slate-500 cursor-wait'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
              }`}
            >
              <span className={`w-2 h-2 rounded-full bg-white ${isTriggering ? 'animate-ping' : ''}`} />
              <span className="font-sans text-[11px]">
                {isTriggering ? 'Ticking...' : `Heartbeat #${heartbeatState.heartbeatCount}`}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar (Mobile Only when activeTab === bim-workspace, or Desktop for legacy subtabs) */}
        <aside
          className={`fixed ${activeTab === 'bim-workspace' ? 'lg:hidden' : 'lg:static'} inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 transform ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          } transition-transform duration-200 ease-in-out flex flex-col justify-between overflow-y-auto shrink-0 select-none shadow-xs`}
        >
          <div className="p-3 space-y-5">
            {navItems.map((grp, gIdx) => (
              <div key={gIdx} className="space-y-1">
                <div className="px-3 text-[10px] uppercase font-extrabold text-slate-400 tracking-wider font-sans">
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
                          ? 'bg-blue-50 text-blue-700 border border-blue-200/80 font-bold shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? 'text-blue-600' : 'text-slate-400'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* HERMES System Developer Area Button */}
          {onOpenSystemDrawer && (
            <div className="px-3 pt-2 pb-1 border-t border-slate-100">
              <button
                onClick={onOpenSystemDrawer}
                className="w-full flex items-center justify-between px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-slate-700 font-mono font-bold text-xs transition shadow-xs group"
              >
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-blue-600 group-hover:rotate-45 transition-transform duration-300" />
                  <span>HERMES System ⚙</span>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 bg-blue-100 text-blue-700 font-bold rounded border border-blue-200">
                  DEV
                </span>
              </button>
            </div>
          )}

          {/* System Status Footer */}
          <div className="p-3 bg-slate-50 border-t border-slate-200 text-[11px] space-y-1 font-mono">
            <div className="flex items-center justify-between text-slate-500">
              <span>Prime Engine:</span>
              <span className="text-emerald-600 font-bold">ACTIVE</span>
            </div>
            <div className="flex items-center justify-between text-slate-500">
              <span>Reasoning Provider:</span>
              <span className="text-blue-600 font-bold">Gemini 3.7</span>
            </div>
            <div className="flex items-center justify-between text-slate-500">
              <span>Reality Swarm:</span>
              <span className="text-emerald-600 font-bold">VERIFIED</span>
            </div>
          </div>
        </aside>

        {/* Mobile Overlay */}
        {mobileMenuOpen && (
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/40 z-20 lg:hidden backdrop-blur-xs"
          />
        )}

        {/* Main Workspace Area */}
        <main className={`flex-1 ${activeTab === 'bim-workspace' ? 'p-0 overflow-hidden flex flex-col h-full' : 'overflow-y-auto p-4 sm:p-6 space-y-6'} bg-slate-50`}>
          {children}
        </main>

        {/* Right Inspector Drawer (if component selected) */}
        {selectedComponent && (
          <aside className="w-80 lg:w-96 bg-white border-l border-slate-200 p-5 overflow-y-auto shrink-0 z-20 space-y-4 shadow-xl animate-fadeIn">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-200">
              <div>
                <span className="font-mono text-xs text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {selectedComponent.id}
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-1">{selectedComponent.assembly}</h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Floor {selectedComponent.floor} • Room: {selectedComponent.room}
                </p>
              </div>

              <button
                onClick={onCloseInspector}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 block font-sans">
                  Calculated Quantities
                </span>
                <p className="text-blue-700 font-bold text-sm">
                  {selectedComponent.quantity.value} {selectedComponent.quantity.unit}
                </p>
                <p className="text-slate-600 text-[11px]">
                  Unit Price: ${selectedComponent.unitCost} / {selectedComponent.quantity.unit}
                </p>
                <p className="text-emerald-600 font-bold text-xs mt-1">
                  Total Cost: ${(selectedComponent.totalCost ?? 0).toLocaleString()}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 block font-sans">
                  Inspection Status
                </span>
                <span
                  className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                    selectedComponent.inspectionState === 'passed'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-red-100 text-red-800 border border-red-300'
                  }`}
                >
                  {selectedComponent.inspectionState}
                </span>
                {selectedComponent.inspectionNotes && (
                  <p className="text-slate-700 text-[11px] mt-1">{selectedComponent.inspectionNotes}</p>
                )}
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-500 block font-sans">
                  Selection Explainability
                </span>
                <p className="text-slate-700 leading-relaxed font-sans text-xs">
                  {selectedComponent.whySelected.reason}
                </p>
                <p className="text-slate-600 text-[11px]">
                  <strong className="text-slate-900">Code Rule:</strong> {selectedComponent.whySelected.codeRule}
                </p>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};
