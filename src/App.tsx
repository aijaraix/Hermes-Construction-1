import React, { useEffect, useState } from 'react';
import { HermesProjectProvider, useHermesProject } from './context/HermesProjectContext';
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
import { PrehouseSpatialProofView } from './components/PrehouseSpatialProofView';

function HermesAppContent() {
  const { activeProjectId, activeProjectMeta, setActiveProjectId, worldState } = useHermesProject();

  const [activeTab, setActiveTab] = useState<NavTab>('bim-workspace');
  const [isSystemDrawerOpen, setIsSystemDrawerOpen] = useState<boolean>(false);
  const [activeSystemSubtab, setActiveSystemSubtab] = useState<NavTab>('spatial-academy');

  const defaultFallbackProject: DigitalTwinProject = {
    id: activeProjectId,
    name: activeProjectMeta.name || activeProjectId,
    buildingType: 'Single-Family Residential (Canonical Construction OS)',
    gymLevel: 3,
    iterationNumber: 1,
    overallCompletionPct: worldState?.overallCompletionPct || 0.0,
    status: 'planning',
    environment: {
      latitude: 27.9506,
      longitude: -82.4572,
      locationName: activeProjectMeta.location || 'Tampa, Florida',
      jurisdiction: 'City of Tampa / Hillsborough County',
      climateZone: 'Zone 2A (Hot-Humid)',
      coastalProximityMiles: 1.5,
      saltExposureRisk: 'High',
      windSpeedMph: 160,
      rainfallInchesYear: 51.5,
      humidityPctAvg: 74,
      minTempF: 38,
      maxTempF: 96,
      freezeThawCycles: 0,
      seismicCategory: 'Category A',
      wildfireRisk: 'Low',
      floodZone: 'Zone X',
      soilBearingCapacityPsf: 2200,
      groundwaterTableFt: 4.5,
      utilitiesAvailable: ['Municipal Water', 'Sanitary Sewer', '240V Electric', 'Fiber Optic'],
      localCodeVersion: 'Florida Building Code 8th Edition (2023)',
    },
    components: [],
    inspectionTickets: [],
    bom: [],
    suppliers: [],
    schedule: [],
    changeOrderRisks: [],
    score: {
      overall: 100.0,
      completeness: 0.0,
      structuralValidation: 100.0,
      mepConnectivity: 100.0,
      clashFreePercentage: 100.0,
      codeValidation: 100.0,
      environmentalAppropriateness: 100.0,
      materialCompleteness: 100.0,
      inspectionSuccess: 100.0,
      constructability: 100.0,
      costConfidence: 100.0,
      changeOrderRisk: 100.0,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const heartbeatState: PrimeHeartbeatState = {
    activeProjectId: activeProjectId,
    activeProjectName: activeProjectMeta.name || activeProjectId,
    gymLevel: 3,
    overallCompletionPct: worldState?.overallCompletionPct || 0.0,
    heartbeatCount: 1,
    lastHeartbeatTime: new Date().toISOString(),
    statusMessage: `HERMES Active: ${worldState?.currentTask || 'AUTORUN PAUSED'}`,
    activeSwarmAgent: 'HERMES PRIME ORCHESTRATOR',
    unresolvedQuestions: 0,
    inspectionFailuresCount: 0,
    openClashesCount: 0,
    missingMaterialSpecsCount: 0,
    missingPriceEvidenceCount: 0,
    changeOrderRisksCount: 0,
    projectScore: 100.0,
    recentLogs: [],
  };

  const [learnedLessons, setLearnedLessons] = useState<LearnedLesson[]>([]);
  const [uxLevel, setUxLevel] = useState<UserExperienceLevel>('TECHNICAL');
  const [selectedComponent, setSelectedComponent] = useState<BIMComponent | null>(null);
  const [highlightCategory, setHighlightCategory] = useState<string | null>(null);
  const [isTriggering, setIsTriggering] = useState<boolean>(false);

  const handleSelectProject = (projectId: string) => {
    setActiveProjectId(projectId);
  };

  const handleTriggerHeartbeat = async () => {
    setIsTriggering(true);
    setTimeout(() => setIsTriggering(false), 500);
  };

  const handleRepairTicket = async (ticketId: string) => {
    console.log('Repair ticket:', ticketId);
  };

  const handleProposeRevision = async (prompt: string): Promise<ProposedRevision> => {
    return {
      id: 'REV-001',
      projectId: activeProjectId,
      userPrompt: prompt,
      proposedBy: 'USER',
      impactSummary: 'Calculated architectural revision',
      status: 'PROPOSED',
      changes: []
    };
  };

  const handleApplyRevision = async (prompt: string) => {
    console.log('Apply revision:', prompt);
  };

  const handleCreateGymProject = async (level: number, prompt: string) => {
    console.log('Create gym project:', level, prompt);
  };

  const handleHighlightComponents = (compIds: string[], itemName: string) => {
    setHighlightCategory(itemName);
    setActiveTab('3d-twin');
  };

  const currentProject = defaultFallbackProject;

  return (
    <AppShell
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      currentProject={currentProject}
      allProjects={[currentProject]}
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

      {/* HERMES System Developer Area Drawer */}
      <HermesSystemDrawer
        isOpen={isSystemDrawerOpen}
        onClose={() => setIsSystemDrawerOpen(false)}
        activeSystemSubtab={activeSystemSubtab}
        setActiveSystemSubtab={setActiveSystemSubtab}
      >
        {activeSystemSubtab === 'prehouse-spatial-proof' && <PrehouseSpatialProofView />}
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
            projects={[currentProject]}
            lessons={learnedLessons}
            onSelectProject={(id) => setActiveProjectId(id)}
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
    </AppShell>
  );
}

export default function App() {
  return (
    <HermesProjectProvider>
      <HermesAppContent />
    </HermesProjectProvider>
  );
}
