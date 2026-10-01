import React from 'react';
import type { ConstructionTaskSchedule } from '../types/hermes';
import { useHermesProject } from '../context/HermesProjectContext';
import { ScheduleWorkspace } from './immersive/ScheduleWorkspace';

interface ScheduleViewProps { schedule: ConstructionTaskSchedule[]; onInspect?: (ids: string[], name: string) => void }
export const ScheduleView: React.FC<ScheduleViewProps> = ({ schedule, onInspect }) => {
  const { worldState, selectEntity, openInspectorDrawer } = useHermesProject();
  if (!worldState) return <p>Awaiting current project state.</p>;
  const select = (id: string) => {
    if (onInspect) onInspect([id],id);
    else { selectEntity(id); openInspectorDrawer(); }
  };
  return <div className="rounded-xl bg-white p-5 text-slate-800">
    {schedule.length > 0 && <p>Unscoped legacy schedule records do not establish the current project schedule.</p>}
    <ScheduleWorkspace state={worldState} actions={{ select, focusEntity: select, focusPosition: () => {}, focusAvailable: false }}/>
  </div>;
};
