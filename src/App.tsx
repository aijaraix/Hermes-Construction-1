import React, { useEffect, useState } from 'react';
import { DigitalTwinProject, PrimeHeartbeatState, BIMComponent, ProposedRevision, LearnedLesson } from './types/hermes';
import { Navbar } from './components/Navbar';
import { ThreeBIMViewer } from './components/ThreeBIMViewer';
import { DashboardView } from './components/DashboardView';
import { BOMView } from './components/BOMView';
import { InspectorView } from './components/InspectorView';
import { SourcingView } from './components/SourcingView';
import { ScheduleView } from './components/ScheduleView';
import { ChangeOrderView } from './components/ChangeOrderView';
import { GymView } from './components/GymView';
import { CustomizerView } from './components/CustomizerView';
import { X, Info, CheckCircle2, AlertTriangle, ShieldCheck, DollarSign, Layers } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('3d-twin');
  const [heartbeatState, setHeartbeatState] = useState<PrimeHeartbeatState | null>(null);
  const [currentProject, setCurrentProject] = useState<DigitalTwinProject | null>(null);
  const [allProjects, setAllProjects] = useState<DigitalTwinProject[]>([]);
  const [learnedLessons, setLearnedLessons] = useState<LearnedLesson[]>([]);
  
  const [selectedComponent, setSelectedComponent] = useState<BIMComponent | null>(null);
  const [highlightCategory, setHighlightCategory] = useState<string | null>(null);
  const [isTriggering, setIsTriggering] = useState<boolean>(false);

  // Fetch initial data
  const fetchData = async () => {
    try {
      const [hbRes, projRes, lessonsRes] = await Promise.all([
        fetch('/api/heartbeat'),
        fetch('/api/projects'),
        fetch('/api/learned-lessons'),
      ]);

      const hbData: PrimeHeartbeatState = await hbRes.json();
      const projData: DigitalTwinProject[] = await projRes.json();
      const lessonsData: LearnedLesson[] = await lessonsRes.json();

      setHeartbeatState(hbData);
      setAllProjects(projData);
      setLearnedLessons(lessonsData);

      const active = projData.find((p) => p.id === hbData.activeProjectId) || projData[0];
      setCurrentProject(active || null);
    } catch (e) {
      console.error('Error fetching initial HERMES state:', e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTriggerHeartbeat = async () => {
    setIsTriggering(true);
    try {
      const res = await fetch('/api/heartbeat/tick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: currentProject?.id }),
      });
      const newHbState: PrimeHeartbeatState = await res.json();
      setHeartbeatState(newHbState);

      // Refresh active project data
      if (currentProject) {
        const pRes = await fetch(`/api/projects/${currentProject.id}`);
        const updatedProject = await pRes.json();
        setCurrentProject(updatedProject);
      }
    } catch (e) {
      console.error('Error triggering heartbeat:', e);
    } finally {
      setIsTriggering(false);
    }
  };

  const handleRepairTicket = async (ticketId: string) => {
    if (!currentProject) return;
    try {
      const res = await fetch(`/api/projects/${currentProject.id}/repair-ticket`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId }),
      });
      const updated = await res.json();
      setCurrentProject(updated);

      // Refresh heartbeat state
      const hbRes = await fetch('/api/heartbeat');
      setHeartbeatState(await hbRes.json());
    } catch (e) {
      console.error('Error repairing ticket:', e);
    }
  };

  const handleProposeRevision = async (prompt: string): Promise<ProposedRevision> => {
    if (!currentProject) throw new Error('No active project');
    const res = await fetch(`/api/projects/${currentProject.id}/propose-revision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    return res.json();
  };

  const handleApplyRevision = async (prompt: string) => {
    if (!currentProject) return;
    const res = await fetch(`/api/projects/${currentProject.id}/apply-revision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    const updated = await res.json();
    setCurrentProject(updated);

    const hbRes = await fetch('/api/heartbeat');
    setHeartbeatState(await hbRes.json());
  };

  const handleCreateGymProject = async (level: number, prompt: string) => {
    try {
      const res = await fetch('/api/projects/gym/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level, prompt }),
      });
      const newProj = await res.json();
      setCurrentProject(newProj);
      setActiveTab('3d-twin');

      const hbRes = await fetch('/api/heartbeat');
      setHeartbeatState(await hbRes.json());
    } catch (e) {
      console.error('Error launching gym project:', e);
    }
  };

  const handleHighlightComponents = (compIds: string[], itemName: string) => {
    setHighlightCategory(itemName);
    setActiveTab('3d-twin');
  };

  if (!currentProject || !heartbeatState) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 font-sans">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-600 animate-spin mx-auto flex items-center justify-center font-bold text-lg text-white">
            H
          </div>
          <h2 className="text-lg font-bold text-slate-200">Initializing HERMES Construction Intelligence...</h2>
          <p className="text-xs text-slate-400">Loading persistent 3D BIM digital twin models & multi-agent swarms</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-cyan-500 selection:text-slate-950">
      {/* Header Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        heartbeatState={heartbeatState}
        onTriggerHeartbeat={handleTriggerHeartbeat}
        isTriggering={isTriggering}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl w-full mx-auto p-4 md:p-6 flex-1 space-y-6">
        {/* Tab 1: 3D Digital Twin Viewer */}
        {activeTab === '3d-twin' && (
          <div className="space-y-6">
            <ThreeBIMViewer
              components={currentProject.components}
              selectedComponentId={selectedComponent?.id}
              onSelectComponent={setSelectedComponent}
              highlightCategory={highlightCategory}
            />

            {/* Click Anything - Selected Component Technical Spec Drawer */}
            {selectedComponent && (
              <div className="p-6 bg-slate-900 rounded-2xl border border-cyan-500/50 shadow-2xl space-y-4 animate-fadeIn">
                <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-cyan-400 bg-slate-950 px-2.5 py-0.5 rounded border border-slate-800">
                        {selectedComponent.id}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">{selectedComponent.system} System</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-100 mt-1">{selectedComponent.assembly}</h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">Floor {selectedComponent.floor} • Room: {selectedComponent.room}</p>
                  </div>

                  <button
                    onClick={() => setSelectedComponent(null)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1 font-sans">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Calculated Quantities</span>
                    <p className="font-mono text-cyan-300 font-bold text-sm">
                      {selectedComponent.quantity.value} {selectedComponent.quantity.unit}
                    </p>
                    <p className="text-slate-400 text-[11px]">Unit Price: ${selectedComponent.unitCost} / {selectedComponent.quantity.unit}</p>
                    <p className="text-emerald-400 font-bold text-xs mt-1">Total Cost: ${selectedComponent.totalCost.toLocaleString()}</p>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1 font-sans">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Inspection Status</span>
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                        selectedComponent.inspectionState === 'passed'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : selectedComponent.inspectionState === 'repaired'
                          ? 'bg-blue-950 text-blue-400 border border-blue-800'
                          : 'bg-red-950 text-red-400 border border-red-800'
                      }`}
                    >
                      {selectedComponent.inspectionState}
                    </span>
                    {selectedComponent.inspectionNotes && (
                      <p className="text-slate-300 text-[11px] mt-1">{selectedComponent.inspectionNotes}</p>
                    )}
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1 font-sans">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Materials Breakdown</span>
                    <ul className="list-disc list-inside text-slate-300 text-[11px] space-y-0.5">
                      {selectedComponent.materials.map((m, i) => (
                        <li key={i}>
                          {m.name} ({m.quantity} {m.unit})
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* WHY WAS THIS SELECTED? Explainability Panel */}
                <div className="p-4 bg-slate-950/90 rounded-xl border border-cyan-800/40 space-y-2 text-xs">
                  <h4 className="font-bold text-cyan-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Info className="w-4 h-4" /> WHY WAS THIS SELECTED? (Explainability Engine)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-300 leading-relaxed">
                    <div>
                      <strong className="text-slate-100 block font-semibold">Design Reason:</strong>
                      {selectedComponent.whySelected.reason}
                    </div>
                    <div>
                      <strong className="text-slate-100 block font-semibold">Environmental Factor:</strong>
                      {selectedComponent.whySelected.environmentalFactor}
                    </div>
                    <div>
                      <strong className="text-slate-100 block font-semibold">Building Code Rule:</strong>
                      {selectedComponent.whySelected.codeRule}
                    </div>
                    <div>
                      <strong className="text-slate-100 block font-semibold">Alternatives Considered:</strong>
                      {selectedComponent.whySelected.alternativesConsidered.join(', ')}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Dashboard */}
        {activeTab === 'dashboard' && (
          <DashboardView
            project={currentProject}
            heartbeatState={heartbeatState}
            onTriggerHeartbeat={handleTriggerHeartbeat}
          />
        )}

        {/* Tab 3: BOM */}
        {activeTab === 'bom' && (
          <BOMView bom={currentProject.bom} onHighlightComponents={handleHighlightComponents} />
        )}

        {/* Tab 4: Inspector */}
        {activeTab === 'inspector' && (
          <InspectorView
            tickets={currentProject.inspectionTickets}
            onRepairTicket={handleRepairTicket}
            onTriggerHeartbeat={handleTriggerHeartbeat}
          />
        )}

        {/* Tab 5: Local Sourcing */}
        {activeTab === 'sourcing' && <SourcingView suppliers={currentProject.suppliers} />}

        {/* Tab 6: 4D Schedule */}
        {activeTab === 'schedule' && <ScheduleView schedule={currentProject.schedule} />}

        {/* Tab 7: Change-Order Risks */}
        {activeTab === 'risks' && <ChangeOrderView risks={currentProject.changeOrderRisks} />}

        {/* Tab 8: Gym & Lab */}
        {activeTab === 'gym' && (
          <GymView
            projects={allProjects}
            lessons={learnedLessons}
            onSelectProject={(id) => {
              const p = allProjects.find((x) => x.id === id);
              if (p) setCurrentProject(p);
            }}
            onCreateGymProject={handleCreateGymProject}
          />
        )}

        {/* Tab 9: Customizer & Revisions */}
        {activeTab === 'customizer' && (
          <CustomizerView
            projectId={currentProject.id}
            onProposeRevision={handleProposeRevision}
            onApplyRevision={handleApplyRevision}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-4 text-center text-xs text-slate-500">
        HERMES Construction System • Autonomous Building Intelligence & Digital Twin Framework • FBC 2023 / IBC 2024 Grounded
      </footer>
    </div>
  );
}
