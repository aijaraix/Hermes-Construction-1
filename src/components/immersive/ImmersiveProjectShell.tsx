import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useHermesProject } from '../../context/HermesProjectContext';
import { BimWorkspaceView, BimWorkspaceHandle } from '../BimWorkspaceView';
import { deriveProjectOverviewState } from '../../lib/projectOverviewState';
import { ImmersiveWorkspaceId, shouldIgnoreGlobalWorkspaceShortcut, toggleWorkspace, workspaceShortcutTarget } from '../../lib/immersiveWorkspaceRegistry';
import { ProjectLauncherRail } from './ProjectLauncherRail';
import { ProjectIdentityChip } from './ProjectIdentityChip';
import { ProjectStatusHUD } from './ProjectStatusHUD';
import { InternalWorkspaceSurface } from './InternalWorkspaceSurface';
import { ProjectOverviewWorkspace } from './ProjectOverviewWorkspace';
import { AttentionChip } from './AttentionChip';
import { AttentionDrawer } from './AttentionDrawer';
import { WhatChangedDrawer } from './WhatChangedDrawer';
import { createLastSeenMarker, ProjectLastSeenMarker } from '../../lib/projectTimelineState';
import { readLastSeen, writeLastSeen } from '../../lib/projectLastSeen';
import { finitePosition } from '../../lib/inspectorViewState';
import { resolveInspectableEntity } from '../../lib/inspectableEntity';
import { MaterialsWorkspace } from './MaterialsWorkspace';
import { ScheduleWorkspace } from './ScheduleWorkspace';
import { LogisticsWorkspace } from './LogisticsWorkspace';
import './immersive.css';

export function ImmersiveProjectShell({ developerOpen, onDeveloperOpen, onDeveloperClose }: {
  developerOpen: boolean; onDeveloperOpen: () => void; onDeveloperClose: () => void;
}) {
  const ctx = useHermesProject();
  const [activeWorkspace, setActiveWorkspace] = useState<ImmersiveWorkspaceId | null>(null);
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);
  const viewport = useRef<BimWorkspaceHandle>(null);
  const [whatChangedOpen, setWhatChangedOpen] = useState(false);
  const [lastSeen, setLastSeen] = useState<ProjectLastSeenMarker | null>(null);
  const [markerPersistence,setMarkerPersistence] = useState('Marker is private to this browser.');
  useEffect(() => {
    setWhatChangedOpen(false);
    if (!ctx.worldState) { setLastSeen(null); return; }
    try { setLastSeen(readLastSeen(window.localStorage,ctx.worldState)); }
    catch { setLastSeen(null); }
  }, [ctx.activeProjectId,ctx.worldState?.attemptId]);
  const markSeen = () => {
    if (!ctx.worldState) return;
    const marker = createLastSeenMarker(ctx.worldState);
    setLastSeen(marker);
    let persisted = false;
    try { persisted = writeLastSeen(window.localStorage,marker); } catch { /* browser storage unavailable */ }
    setMarkerPersistence(persisted ? 'Seen marker saved for this project and attempt in this browser.' : 'Seen for this session only; browser storage is unavailable.');
  };
  const select = (id: string) => { ctx.selectEntity(id); ctx.openInspectorDrawer(); };
  const eventActions = {
    replay: (eventId: string) => { viewport.current?.replayEvent(eventId); setWhatChangedOpen(false); },
    focusEntity: (id: string) => { viewport.current?.focusEntity(id); },
    focusPosition: (position: [number,number,number]) => { viewport.current?.focusPosition(position); },
    canFocusEntity: (id: string) => Boolean(ctx.worldState && finitePosition(resolveInspectableEntity(ctx.worldState,id)?.spatial?.position)),
  };
  const overview = useMemo(() => ctx.worldState ? deriveProjectOverviewState(ctx.worldState,{ lastSeen }) : null, [ctx.worldState,lastSeen]);
  const toggle = (id: ImmersiveWorkspaceId) => setActiveWorkspace(current => toggleWorkspace(current, id));
  const closeWorkspace = () => {
    const id = activeWorkspace;
    setActiveWorkspace(null);
    if (id) document.querySelector<HTMLButtonElement>(`[data-workspace="${id}"]`)?.focus();
  };
  useEffect(() => { setProjectMenuOpen(false); }, [ctx.activeProjectId]);
  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      if (event.key === 'Escape') {
        if (ctx.isNewProjectModalOpen) ctx.closeNewProjectModal();
        else if (ctx.isRegressionModalOpen) ctx.closeRegressionModal();
        else if (developerOpen) onDeveloperClose();
        else if (projectMenuOpen) setProjectMenuOpen(false);
        else if (whatChangedOpen) setWhatChangedOpen(false);
        else if (viewport.current?.closeTopOverlay()) { /* local modal / inspector */ }
        else if (activeWorkspace) closeWorkspace();
        else if (!viewport.current?.collapseTimeline()) return;
        event.preventDefault();
        return;
      }
      if (developerOpen || ctx.isNewProjectModalOpen || ctx.isRegressionModalOpen || shouldIgnoreGlobalWorkspaceShortcut(event.target)) return;
      const target = workspaceShortcutTarget(event);
      if (target) { event.preventDefault(); toggle(target); }
    };
    window.addEventListener('keydown', keydown);
    return () => window.removeEventListener('keydown', keydown);
  });
  const shellBody = activeWorkspace && !['MODEL', 'WORKFORCE', 'SYSTEMS'].includes(activeWorkspace);
  return <main className="hx-shell" aria-label="Immersive project workspace">
    <div className="hx-world"><BimWorkspaceView ref={viewport} workspaceId={activeWorkspace} onWorkspaceClose={closeWorkspace} onOpenSystemDrawer={onDeveloperOpen} onWhatChanged={() => setWhatChangedOpen(true)}/></div>
    <ProjectLauncherRail active={activeWorkspace} onToggle={toggle} onDeveloper={onDeveloperOpen} badges={{
      PROJECT: overview?.timeline.whatChanged.unseenCount, MATERIALS: overview?.materials.summary.exceptionCount, QUALITY: overview?.attention.activeCount,
    }}/>
    <ProjectIdentityChip open={projectMenuOpen} setOpen={setProjectMenuOpen}
      modeLabel={overview?.project.modeLabel || (ctx.activeProjectMeta.isRegressionFixture ? 'Test Fixture · awaiting state' : 'Awaiting project mode')}/>
    <ProjectStatusHUD status={overview?.status} attentionCount={overview?.attention.activeCount || 0} onOpen={() => setActiveWorkspace('PROJECT')}/>
    {shellBody && <InternalWorkspaceSurface workspaceId={activeWorkspace} onClose={closeWorkspace}>
      {!overview ? <p className="hx-empty">Awaiting current project state.</p> : activeWorkspace === 'PROJECT' ? <ProjectOverviewWorkspace overview={overview} onOpen={setActiveWorkspace} onWhatChanged={() => setWhatChangedOpen(true)}/> :
        <div className="hx-summary">
          {activeWorkspace === 'MATERIALS' && ctx.worldState && <MaterialsWorkspace key={`${ctx.activeProjectId}:${ctx.worldState.attemptId}`} state={ctx.worldState} actions={{select,...eventActions}}/>}
          {activeWorkspace === 'SCHEDULE' && ctx.worldState && <ScheduleWorkspace key={`${ctx.activeProjectId}:${ctx.worldState.attemptId}`} state={ctx.worldState} actions={{select,...eventActions}}/>}
          {activeWorkspace === 'LOGISTICS' && ctx.worldState && <LogisticsWorkspace key={`${ctx.activeProjectId}:${ctx.worldState.attemptId}`} state={ctx.worldState} actions={{select,...eventActions}}/>}
          {activeWorkspace === 'QUALITY' && ctx.worldState && <AttentionDrawer key={`${ctx.activeProjectId}:${ctx.worldState.attemptId}`} state={ctx.worldState} attention={overview.attention} onSelect={select} onFocus={eventActions.focusEntity}/>}
        </div>}
    </InternalWorkspaceSurface>}
    {overview && <div className="hx-observability"><AttentionChip attention={overview.attention} onOpen={() => setActiveWorkspace('QUALITY')}/><button className="hx-changed-chip" onClick={() => setWhatChangedOpen(true)}>What changed · {overview.timeline.whatChanged.unseenCount}</button></div>}
    {whatChangedOpen && overview && <WhatChangedDrawer summary={overview.timeline.whatChanged} actions={eventActions} onClose={() => setWhatChangedOpen(false)} onMarkSeen={markSeen} persistence={markerPersistence}/>}
  </main>;
}
