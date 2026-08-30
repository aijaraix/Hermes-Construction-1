import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface LiveProjectMeta {
  id: string;
  name: string;
  location: string;
  buildingType: string;
  sqFt: number;
  bedrooms: number;
  bathrooms: number;
  budget: number;
  status: string;
  isRegressionFixture?: boolean;
}

export interface HermesWorldState {
  projectId: string;
  projectName: string;
  currentCheckpoint: number;
  revision: number;
  status: string;
  diagnostics?: {
    checkpointName?: string;
    entityCount?: number;
    agentCount?: number;
    issueCount?: number;
    clashCount?: number;
  };
  spatialEntities?: any[];
  agentSpatialStates?: any[];
  requirementRecords?: any[];
  surveyMarks?: any[];
  boringSamples?: any[];
  buildableEnvelope?: any;
  programVolumes?: any[];
  materialsOnsite?: any[];
  buildingComponents?: any[];
  clashes?: any[];
  events?: any[];
}

export type ConnectionStatus = 'CONNECTED' | 'SYNCING' | 'ERROR';
export type PlaybackState = 'PAUSED' | 'PLAYING';
export type CameraZone = 'JOBSITE' | 'CAMPUS';

export interface HermesProjectContextType {
  activeProjectId: string;
  activeProjectMeta: LiveProjectMeta;
  liveProjects: LiveProjectMeta[];
  regressionFixtures: LiveProjectMeta[];
  worldState: HermesWorldState | null;
  connectionStatus: ConnectionStatus;
  playbackState: PlaybackState;
  playbackSpeed: number;
  cameraZone: CameraZone;
  autoFollow: boolean;
  selectedEntityId: string | null;
  isInspectorDrawerOpen: boolean;
  isRegressionModalOpen: boolean;
  isNewProjectModalOpen: boolean;
  
  // Actions
  setActiveProjectId: (id: string) => void;
  stepForward: () => Promise<void>;
  runAll: () => Promise<void>;
  resetWorld: () => Promise<void>;
  setPlaybackState: (state: PlaybackState) => void;
  setPlaybackSpeed: (speed: number) => void;
  setCameraZone: (zone: CameraZone) => void;
  setAutoFollow: (enabled: boolean) => void;
  selectEntity: (id: string | null) => void;
  openInspectorDrawer: () => void;
  closeInspectorDrawer: () => void;
  openRegressionModal: () => void;
  closeRegressionModal: () => void;
  openNewProjectModal: () => void;
  closeNewProjectModal: () => void;
  createLiveProject: (newProj: Partial<LiveProjectMeta>) => void;
  refreshWorldState: () => Promise<void>;
}

const DEFAULT_LIVE_PROJECTS: LiveProjectMeta[] = [
  {
    id: 'HERMES-LIVE-HOUSE-001',
    name: 'Live House 001',
    location: 'Tampa, Florida',
    buildingType: 'Single-Family Residence',
    sqFt: 2835,
    bedrooms: 3,
    bathrooms: 2,
    budget: 425000,
    status: 'ACTIVE_CONSTRUCTION',
    isRegressionFixture: false,
  },
];

const DEFAULT_REGRESSION_FIXTURES: LiveProjectMeta[] = [
  { id: 'LIVE-WORLD-AUTONOMOUS-GENERATION-007', name: 'Validation 007 (Master Generation)', location: 'Clean-Room Lab', buildingType: 'Test Fixture', sqFt: 2500, bedrooms: 3, bathrooms: 2, budget: 400000, status: 'REGRESSION_FIXTURE', isRegressionFixture: true },
  { id: 'LIVE-WORLD-VISUAL-VALIDATION-006', name: 'Validation 006 (Causality Test)', location: 'Clean-Room Lab', buildingType: 'Test Fixture', sqFt: 2500, bedrooms: 3, bathrooms: 2, budget: 400000, status: 'REGRESSION_FIXTURE', isRegressionFixture: true },
  { id: 'LIVE-WORLD-VISUAL-VALIDATION-005', name: 'Validation 005 (Frozen Fixture)', location: 'Clean-Room Lab', buildingType: 'Test Fixture', sqFt: 2500, bedrooms: 3, bathrooms: 2, budget: 400000, status: 'REGRESSION_FIXTURE', isRegressionFixture: true },
  { id: 'LIVE-WORLD-VISUAL-VALIDATION-004', name: 'Validation 004 (Foundation Test)', location: 'Clean-Room Lab', buildingType: 'Test Fixture', sqFt: 2500, bedrooms: 3, bathrooms: 2, budget: 400000, status: 'REGRESSION_FIXTURE', isRegressionFixture: true },
  { id: 'LIVE-WORLD-VISUAL-VALIDATION-003', name: 'Validation 003 (Program Test)', location: 'Clean-Room Lab', buildingType: 'Test Fixture', sqFt: 2500, bedrooms: 3, bathrooms: 2, budget: 400000, status: 'REGRESSION_FIXTURE', isRegressionFixture: true },
  { id: 'LIVE-WORLD-VISUAL-VALIDATION-002', name: 'Validation 002 (Survey Test)', location: 'Clean-Room Lab', buildingType: 'Test Fixture', sqFt: 2500, bedrooms: 3, bathrooms: 2, budget: 400000, status: 'REGRESSION_FIXTURE', isRegressionFixture: true },
  { id: 'ACADEMY-HOUSE-0002', name: 'Academy House 0002', location: 'Spatial Academy', buildingType: 'Academy Reference', sqFt: 2400, bedrooms: 3, bathrooms: 2, budget: 380000, status: 'REGRESSION_FIXTURE', isRegressionFixture: true },
];

const HermesProjectContext = createContext<HermesProjectContextType | null>(null);

export const HermesProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeProjectId, setActiveProjectIdState] = useState<string>('HERMES-LIVE-HOUSE-001');
  const [liveProjects, setLiveProjects] = useState<LiveProjectMeta[]>(DEFAULT_LIVE_PROJECTS);
  const [regressionFixtures] = useState<LiveProjectMeta[]>(DEFAULT_REGRESSION_FIXTURES);
  const [worldState, setWorldState] = useState<HermesWorldState | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('SYNCING');
  const [playbackState, setPlaybackState] = useState<PlaybackState>('PAUSED');
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [cameraZone, setCameraZone] = useState<CameraZone>('JOBSITE');
  const [autoFollow, setAutoFollow] = useState<boolean>(true);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [isInspectorDrawerOpen, setIsInspectorDrawerOpen] = useState<boolean>(false);
  const [isRegressionModalOpen, setIsRegressionModalOpen] = useState<boolean>(false);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState<boolean>(false);

  const activeProjectMeta =
    liveProjects.find((p) => p.id === activeProjectId) ||
    regressionFixtures.find((p) => p.id === activeProjectId) ||
    DEFAULT_LIVE_PROJECTS[0];

  const refreshWorldState = async () => {
    try {
      setConnectionStatus('SYNCING');
      const res = await fetch(`/api/hermes/projects/${activeProjectId}/world`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setWorldState(data);
      setConnectionStatus('CONNECTED');
    } catch (err) {
      console.error('Failed to fetch world state:', err);
      setConnectionStatus('ERROR');
    }
  };

  useEffect(() => {
    refreshWorldState();
  }, [activeProjectId]);

  const setActiveProjectId = (id: string) => {
    setActiveProjectIdState(id);
    setSelectedEntityId(null);
  };

  const stepForward = async () => {
    try {
      setConnectionStatus('SYNCING');
      const res = await fetch(`/api/hermes/projects/${activeProjectId}/step`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setWorldState(data.state || data);
      setConnectionStatus('CONNECTED');
    } catch (err) {
      console.error('Step forward error:', err);
      setConnectionStatus('ERROR');
    }
  };

  const runAll = async () => {
    try {
      setConnectionStatus('SYNCING');
      const res = await fetch(`/api/hermes/projects/${activeProjectId}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setWorldState(data.state || data);
      setConnectionStatus('CONNECTED');
    } catch (err) {
      console.error('Run all error:', err);
      setConnectionStatus('ERROR');
    }
  };

  const resetWorld = async () => {
    try {
      setConnectionStatus('SYNCING');
      const res = await fetch(`/api/hermes/projects/${activeProjectId}/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setWorldState(data.state || data);
      setConnectionStatus('CONNECTED');
    } catch (err) {
      console.error('Reset world error:', err);
      setConnectionStatus('ERROR');
    }
  };

  const createLiveProject = (newProj: Partial<LiveProjectMeta>) => {
    const id = `HERMES-LIVE-HOUSE-${String(liveProjects.length + 1).padStart(3, '0')}`;
    const fullProj: LiveProjectMeta = {
      id,
      name: newProj.name || `Live House ${liveProjects.length + 1}`,
      location: newProj.location || 'Tampa, Florida',
      buildingType: newProj.buildingType || 'Single-Family Residence',
      sqFt: newProj.sqFt || 2500,
      bedrooms: newProj.bedrooms || 3,
      bathrooms: newProj.bathrooms || 2,
      budget: newProj.budget || 400000,
      status: 'PLANNING',
      isRegressionFixture: false,
    };
    setLiveProjects((prev) => [...prev, fullProj]);
    setActiveProjectIdState(id);
    setIsNewProjectModalOpen(false);
  };

  return (
    <HermesProjectContext.Provider
      value={{
        activeProjectId,
        activeProjectMeta,
        liveProjects,
        regressionFixtures,
        worldState,
        connectionStatus,
        playbackState,
        playbackSpeed,
        cameraZone,
        autoFollow,
        selectedEntityId,
        isInspectorDrawerOpen,
        isRegressionModalOpen,
        isNewProjectModalOpen,
        setActiveProjectId,
        stepForward,
        runAll,
        resetWorld,
        setPlaybackState,
        setPlaybackSpeed,
        setCameraZone,
        setAutoFollow,
        selectEntity: setSelectedEntityId,
        openInspectorDrawer: () => setIsInspectorDrawerOpen(true),
        closeInspectorDrawer: () => setIsInspectorDrawerOpen(false),
        openRegressionModal: () => setIsRegressionModalOpen(true),
        closeRegressionModal: () => setIsRegressionModalOpen(false),
        openNewProjectModal: () => setIsNewProjectModalOpen(true),
        closeNewProjectModal: () => setIsNewProjectModalOpen(false),
        createLiveProject,
        refreshWorldState,
      }}
    >
      {children}
    </HermesProjectContext.Provider>
  );
};

export const useHermesProject = () => {
  const context = useContext(HermesProjectContext);
  if (!context) {
    throw new Error('useHermesProject must be used within a HermesProjectProvider');
  }
  return context;
};
