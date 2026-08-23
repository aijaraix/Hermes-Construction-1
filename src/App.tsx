import React, { useEffect, useState } from 'react';
import {
  DigitalTwinProject,
  PrimeHeartbeatState,
  BIMComponent,
  ProposedRevision,
  LearnedLesson,
} from './types/hermes';
import { AppShell, NavTab, UserExperienceLevel } from './components/AppShell';
import { BimWorkspaceView } from './components/BimWorkspaceView';
import { HermesSystemDrawer } from './components/HermesSystemDrawer';
import { CommandCenterView } from './components/CommandCenterView';
import { ProjectOverviewView } from './components/ProjectOverviewView';
import { ThreeBIMViewer } from './components/ThreeBIMViewer';
import { RoomsSpacesView } from './components/RoomsSpacesView';
import { PlansSystemsView } from './components/PlansSystemsView';
import { InspectorView } from './components/InspectorView';
import { BOMView } from './components/BOMView';
import { ProcurementView } from './components/ProcurementView';
import { ScheduleView } from './components/ScheduleView';
import { ChangeOrderView } from './components/ChangeOrderView';
import { CustomizerView } from './components/CustomizerView';
import { DashboardView } from './components/DashboardView';
import { AgentOrganizationView } from './components/AgentOrganizationView';
import { KnowledgeCenterView } from './components/KnowledgeCenterView';
import { KnowledgeGymView } from './components/KnowledgeGymView';
import { ReadinessGateView } from './components/ReadinessGateView';
import { GymView } from './components/GymView';
import { RealityDataTruthView } from './components/RealityDataTruthView';
import { AuditTrailView } from './components/AuditTrailView';
import { SystemHealthView } from './components/SystemHealthView';
import { Phase318A2ReportView } from './components/Phase318A2ReportView';
import { Phase318BContinuousAcademyView } from './components/Phase318BContinuousAcademyView';
import { Phase318B3SpatialAcademyView } from './components/Phase318B3SpatialAcademyView';
import { OwnerSmeDashboardView } from './components/OwnerSmeDashboardView';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('bim-workspace');
  const [isSystemDrawerOpen, setIsSystemDrawerOpen] = useState<boolean>(false);
  const [activeSystemSubtab, setActiveSystemSubtab] = useState<NavTab>('spatial-academy');

  const [heartbeatState, setHeartbeatState] = useState<PrimeHeartbeatState | null>(null);
  const [currentProject, setCurrentProject] = useState<DigitalTwinProject | null>(null);
  const [allProjects, setAllProjects] = useState<DigitalTwinProject[]>([]);
  const [learnedLessons, setLearnedLessons] = useState<LearnedLesson[]>([]);
  const [uxLevel, setUxLevel] = useState<UserExperienceLevel>('TECHNICAL');

  const [selectedComponent, setSelectedComponent] = useState<BIMComponent | null>(null);
  const [highlightCategory, setHighlightCategory] = useState<string | null>(null);
  const [isTriggering, setIsTriggering] = useState<boolean>(false);

  // Fetch initial system state
  const fetchData = async () => {
    try {
      const [hbRes, projRes, lessonsRes] = await Promise.all([
        fetch('/api/heartbeat').catch(() => null),
        fetch('/api/projects').catch(() => null),
        fetch('/api/learned-lessons').catch(() => null),
      ]);

      if (hbRes && hbRes.ok) {
        const hbData = await hbRes.json().catch(() => null);
        if (hbData) setHeartbeatState(hbData);
      }
      if (projRes && projRes.ok) {
        const projData: DigitalTwinProject[] = await projRes.json().catch(() => []);
        if (projData && projData.length > 0) {
          setAllProjects(projData);
          setCurrentProject((prev) => prev || projData[0]);
        }
      }
      if (lessonsRes && lessonsRes.ok) {
        const lessonsData = await lessonsRes.json().catch(() => []);
        if (lessonsData) setLearnedLessons(lessonsData);
      }
    } catch {
      // Handle initial fetch gracefully
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSelectProject = async (projectId: string) => {
    try {
      const res = await fetch('/api/projects/set-active', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: projectId }),
      });
      const newHb = await res.json();
      setHeartbeatState(newHb);

      const pRes = await fetch(`/api/projects/${projectId}`);
      const updatedProject = await pRes.json();
      setCurrentProject(updatedProject);
    } catch (e) {
      console.error('Error switching project:', e);
    }
  };

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
          <h2 className="text-lg font-bold text-slate-200">Initializing HERMES Construction OS...</h2>
          <p className="text-xs text-slate-400">Loading persistent 3D BIM digital twin models & Reality Swarm</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <AppShell
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentProject={currentProject}
        allProjects={allProjects}
        onSelectProject={handleSelectProject}
        heartbeatState={heartbeatState}
        onTriggerHeartbeat={handleTriggerHeartbeat}
        isTriggering={isTriggering}
        selectedComponent={selectedComponent}
        onCloseInspector={() => setSelectedComponent(null)}
        uxLevel={uxLevel}
        setUxLevel={setUxLevel}
        onOpenSystemDrawer={() => setIsSystemDrawerOpen(true)}
      >
        {/* Primary Operating Experience: OpenBIM CAD Workspace */}
        {activeTab === 'bim-workspace' && (
          <BimWorkspaceView
            onOpenSystemDrawer={() => setIsSystemDrawerOpen(true)}
            initialSelectedComponentId={selectedComponent?.id}
          />
        )}

        {/* Command Center */}
        {activeTab === 'command-center' && (
          <CommandCenterView
            project={currentProject}
            heartbeatState={heartbeatState}
            onTriggerHeartbeat={handleTriggerHeartbeat}
            onNavigateTab={setActiveTab}
          />
        )}

        {/* Project Overview */}
        {activeTab === 'project-overview' && (
          <ProjectOverviewView
            project={currentProject}
            heartbeatState={heartbeatState}
            onNavigateTab={setActiveTab}
          />
        )}

        {/* Legacy 3D Digital Twin Viewer */}
        {activeTab === '3d-twin' && (
          <ThreeBIMViewer
            components={currentProject.components}
            selectedComponentId={selectedComponent?.id}
            onSelectComponent={setSelectedComponent}
            highlightCategory={highlightCategory}
          />
        )}

        {/* Rooms & Spaces Workspace */}
        {activeTab === 'rooms-spaces' && (
          <RoomsSpacesView project={currentProject} onSelectComponent={setSelectedComponent} />
        )}

        {/* Plans & Systems Workspace */}
        {activeTab === 'plans-systems' && <PlansSystemsView project={currentProject} />}

        {/* Inspections Workspace */}
        {activeTab === 'inspections' && (
          <InspectorView
            tickets={currentProject.inspectionTickets}
            onRepairTicket={handleRepairTicket}
            onTriggerHeartbeat={handleTriggerHeartbeat}
          />
        )}

        {/* BOM & Quantities */}
        {activeTab === 'bom' && (
          <BOMView bom={currentProject.bom} onHighlightComponents={handleHighlightComponents} />
        )}

        {/* Procurement & Price Truth */}
        {activeTab === 'procurement' && <ProcurementView suppliers={currentProject.suppliers} />}

        {/* 4D Schedule */}
        {activeTab === 'schedule' && <ScheduleView schedule={currentProject.schedule} />}

        {/* Change-Order Risks */}
        {activeTab === 'risks' && <ChangeOrderView risks={currentProject.changeOrderRisks} />}

        {/* Customizer & Revisions */}
        {activeTab === 'customizer' && (
          <CustomizerView
            projectId={currentProject.id}
            onProposeRevision={handleProposeRevision}
            onApplyRevision={handleApplyRevision}
          />
        )}
      </AppShell>

      {/* HERMES System Developer Area Drawer */}
      <HermesSystemDrawer
        isOpen={isSystemDrawerOpen}
        onClose={() => setIsSystemDrawerOpen(false)}
        activeSystemSubtab={activeSystemSubtab}
        setActiveSystemSubtab={setActiveSystemSubtab}
      >
        {activeSystemSubtab === 'spatial-academy' && <Phase318B3SpatialAcademyView />}
        {activeSystemSubtab === 'continuous-academy' && <Phase318BContinuousAcademyView />}
        {activeSystemSubtab === 'owner-sme-dashboard' && <OwnerSmeDashboardView />}
        {activeSystemSubtab === 'prime' && (
          <DashboardView
            project={currentProject}
            heartbeatState={heartbeatState}
            onTriggerHeartbeat={handleTriggerHeartbeat}
          />
        )}
        {activeSystemSubtab === 'agent-org' && <AgentOrganizationView />}
        {activeSystemSubtab === 'knowledge-center' && <KnowledgeCenterView />}
        {activeSystemSubtab === 'readiness-gate' && <ReadinessGateView />}
        {activeSystemSubtab === 'gym' && (
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
        {activeSystemSubtab === 'reality-truth' && <RealityDataTruthView />}
        {activeSystemSubtab === 'audit' && <AuditTrailView />}
        {activeSystemSubtab === 'system-health' && <SystemHealthView />}
        {activeSystemSubtab === 'source-registry' && <KnowledgeCenterView />}
        {activeSystemSubtab === 'quota-integrity' && <Phase318A2ReportView />}
        {activeSystemSubtab === 'inspections' && (
          <InspectorView
            tickets={currentProject.inspectionTickets}
            onRepairTicket={handleRepairTicket}
            onTriggerHeartbeat={handleTriggerHeartbeat}
          />
        )}
        {activeSystemSubtab === 'bom' && (
          <BOMView bom={currentProject.bom} onHighlightComponents={handleHighlightComponents} />
        )}
        {activeSystemSubtab === 'procurement' && <ProcurementView suppliers={currentProject.suppliers} />}
        {activeSystemSubtab === 'schedule' && <ScheduleView schedule={currentProject.schedule} />}
        {activeSystemSubtab === 'risks' && <ChangeOrderView risks={currentProject.changeOrderRisks} />}
        {activeSystemSubtab === 'customizer' && (
          <CustomizerView
            projectId={currentProject.id}
            onProposeRevision={handleProposeRevision}
            onApplyRevision={handleApplyRevision}
          />
        )}
      </HermesSystemDrawer>
    </>
  );
}
