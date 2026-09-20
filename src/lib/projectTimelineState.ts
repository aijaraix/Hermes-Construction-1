import { ConstructionTaskSchedule, HermesWorldState } from '../types/hermes';
import { humanPhaseLabel, humanTaskLabel } from './humanProjectStatus';

export type HumanTimelineCategory =
  | 'PROJECT'
  | 'WORK'
  | 'DESIGN'
  | 'COMPONENT'
  | 'MATERIAL'
  | 'DELIVERY'
  | 'QUALITY'
  | 'ISSUE'
  | 'REPAIR'
  | 'COORDINATION'
  | 'DECISION'
  | 'OTHER';

export interface HumanTimelineEvent {
  sequence: number;
  eventId: string;
  timestamp?: string;
  category: HumanTimelineCategory;
  title: string;
  detail?: string;
  phase?: string;
  phaseLabel?: string;
  taskId?: string;
  actorId?: string;
  affectedEntityIds: string[];
  workLocationXYZ?: [number, number, number];
  equipmentIds: string[];
  materialIds: string[];
  focusEntityIds: string[];
  cameraHint?: string;
  sourceEvent: unknown;
}

export interface ProjectLastSeenMarker {
  projectId: string;
  attemptId: string;
  eventSequence: number;
  viewedAt: string;
}

export type HumanScheduleAvailability = 'NOT_CALCULATED' | 'CALCULATED';

export interface HumanScheduleActivity {
  id: string;
  name: string;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'UNKNOWN';
  durationDays?: number;
  earlyStart?: number;
  earlyFinish?: number;
  lateStart?: number;
  lateFinish?: number;
  totalFloatDays?: number;
  isCriticalPath?: boolean;
  predecessorIds: string[];
  successorIds: string[];
  trade?: string;
  equipmentIds: string[];
  componentIds: string[];
  sourceActivity: unknown;
}

export interface HumanScheduleState {
  availability: HumanScheduleAvailability;
  activities: HumanScheduleActivity[];
  criticalPathDurationDays?: number;
  criticalActivityIds: string[];
}

export interface WhatChangedSummary {
  markerValid: boolean;
  unseenCount: number;
  events: HumanTimelineEvent[];
  countsByCategory: Partial<Record<HumanTimelineCategory, number>>;
  latestSequence: number;
}

export interface HumanTimelineState {
  projectId: string;
  attemptId: string;
  currentSequence: number;
  events: HumanTimelineEvent[];
  whatChanged: WhatChangedSummary;
  schedule: HumanScheduleState;
}

function vector3(value: unknown): [number, number, number] | undefined {
  if (!Array.isArray(value) || value.length < 3) return undefined;
  const values = value.slice(0, 3).map(Number);
  if (values.some((entry) => !Number.isFinite(entry))) return undefined;
  return values as [number, number, number];
}

function finite(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === 'string' && entry.length > 0)
    : [];
}

function eventSequence(event: any, index: number): number {
  return finite(event?.sequence) ?? finite(event?.eventSequence) ?? index + 1;
}

function eventActor(event: any): string | undefined {
  return (
    event?.actor?.agentId ||
    event?.actor?.customerId ||
    event?.actor?.systemId ||
    event?.actorId ||
    event?.agentId
  );
}

function categoryForEvent(event: any): HumanTimelineCategory {
  const type = String(event?.eventType || '').toUpperCase();

  if (type === 'WORLD_GENESIS_INITIALIZED' || type.includes('PROJECT_STAGE') || type === 'PROJECT_CREATED' || type === 'PROJECT_COMPLETED') {
    return 'PROJECT';
  }
  if (type.startsWith('TASK_COMPLETED_') || type === 'TASK_COMPLETED' || type === 'TASK_STARTED' || type === 'TASK_ASSIGNED') {
    return 'WORK';
  }
  if (type.includes('BIM_OBJECT') || type.includes('BIM_REVISION')) {
    return 'COMPONENT';
  }
  if (type.includes('MATERIAL_STATE')) {
    return 'MATERIAL';
  }
  if (type.includes('DELIVERY')) {
    return 'DELIVERY';
  }
  if (type.includes('INSPECTION') || type.includes('DEFECT')) {
    return 'QUALITY';
  }
  if (type.includes('CLASH')) {
    return 'COORDINATION';
  }
  if (type.includes('ISSUE')) {
    return 'ISSUE';
  }
  if (type.includes('REPAIR')) {
    return 'REPAIR';
  }
  if (type.includes('DECISION') || event?.decision) {
    return 'DECISION';
  }
  if (type.includes('DESIGN') || type.includes('METHOD_SELECTED')) {
    return 'DESIGN';
  }

  return 'OTHER';
}

function titleForEvent(event: any): string {
  const type = String(event?.eventType || '');
  const taskId = event?.payload?.taskId || event?.taskId;

  if (type === 'WORLD_GENESIS_INITIALIZED') return 'Project world initialized';

  if (type.startsWith('TASK_COMPLETED_') || type === 'TASK_COMPLETED') {
    return 'Completed: ' + humanTaskLabel(taskId || type.replace(/^TASK_COMPLETED_/, ''));
  }

  const knownTitles: Record<string, string> = {
    PROJECT_CREATED: 'Project created',
    PROJECT_STAGE_CHANGED: 'Project stage changed',
    PROJECT_COMPLETED: 'Project completed',
    TASK_STARTED: 'Task started',
    TASK_ASSIGNED: 'Task assigned',
    BIM_OBJECT_CREATED: 'Building object created',
    BIM_OBJECT_MODIFIED: 'Building object modified',
    BIM_OBJECT_REMOVED: 'Building object removed',
    BIM_REVISION_CREATED: 'Model revision created',
    MATERIAL_STATE_CHANGED: 'Material state changed',
    DELIVERY_RECORD_CREATED: 'Delivery recorded',
    INSPECTION_STARTED: 'Inspection started',
    INSPECTION_FAILED: 'Inspection failed',
    INSPECTION_PASSED: 'Inspection passed',
    INSPECTION_RECORD_CREATED: 'Inspection recorded',
    CLASH_FOUND: 'Coordination clash found',
    CLASH_RESOLVED: 'Coordination clash resolved',
    ISSUE_RECORD_CREATED: 'Issue recorded',
    REPAIR_RECORD_CREATED: 'Repair recorded',
    CONSTRUCTION_METHOD_SELECTED: 'Construction method selected',
    SPATIAL_ACTION_EXECUTED: 'Spatial action completed',
  };

  return knownTitles[type] || formatEventType(type);
}

function formatEventType(type: string): string {
  if (!type) return 'Project event';
  return type
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function detailForEvent(event: any): string | undefined {
  return (
    event?.payload?.message ||
    event?.summary ||
    event?.message ||
    event?.details ||
    event?.decision ||
    undefined
  );
}

function normalizeEvent(event: any, index: number): HumanTimelineEvent {
  const taskId = event?.payload?.taskId || event?.taskId;
  const phase = event?.payload?.phase || event?.eventPhase;
  const embodied = event?.payload?.embodiedExecution || {};

  return {
    sequence: eventSequence(event, index),
    eventId: event?.eventId || 'EVENT-' + String(index + 1),
    timestamp: event?.timestamp,
    category: categoryForEvent(event),
    title: titleForEvent(event),
    detail: detailForEvent(event),
    phase,
    phaseLabel: phase ? humanPhaseLabel(phase) : undefined,
    taskId,
    actorId: embodied?.assignedAgent || eventActor(event),
    affectedEntityIds: stringArray(event?.entitiesAffected || event?.affectedObjectIds),
    workLocationXYZ: vector3(embodied?.workLocationXYZ || event?.position),
    equipmentIds: stringArray(embodied?.equipmentDeployed),
    materialIds: stringArray(embodied?.materialsAssigned),
    focusEntityIds: stringArray(event?.visualIntent?.focusEntityIds || event?.visualizationContract?.targetEntityIds),
    cameraHint: event?.visualIntent?.cameraHint,
    sourceEvent: event,
  };
}

function normalizeEvents(state: HermesWorldState): HumanTimelineEvent[] {
  return (state.events || [])
    .map((event: any, index: number) => normalizeEvent(event, index))
    .sort((a, b) => a.sequence - b.sequence);
}

function normalizeStatus(status: unknown): HumanScheduleActivity['status'] {
  const value = String(status || '').toUpperCase();
  if (value === 'PLANNED' || value === 'PENDING') return 'PLANNED';
  if (value === 'IN_PROGRESS' || value === 'RUNNING') return 'IN_PROGRESS';
  if (value === 'COMPLETED') return 'COMPLETED';
  return 'UNKNOWN';
}

function normalizeCpmActivity(activity: any, index: number): HumanScheduleActivity {
  return {
    id: activity?.activityId || activity?.id || 'SCHEDULE-' + String(index + 1),
    name: activity?.name || activity?.stageName || activity?.activityName || 'Unnamed schedule activity',
    status: normalizeStatus(activity?.status),
    durationDays: finite(activity?.durationDays) ?? (
      finite(activity?.dayStart) !== undefined && finite(activity?.dayEnd) !== undefined
        ? Number(activity.dayEnd) - Number(activity.dayStart)
        : undefined
    ),
    earlyStart: finite(activity?.earlyStart) ?? finite(activity?.dayStart),
    earlyFinish: finite(activity?.earlyFinish) ?? finite(activity?.dayEnd),
    lateStart: finite(activity?.lateStart),
    lateFinish: finite(activity?.lateFinish),
    totalFloatDays: finite(activity?.totalFloat),
    isCriticalPath: typeof activity?.isCriticalPath === 'boolean' ? activity.isCriticalPath : undefined,
    predecessorIds: stringArray(activity?.predecessors || activity?.dependentTaskIds),
    successorIds: stringArray(activity?.successors),
    trade: typeof activity?.trade === 'string'
      ? activity.trade
      : typeof activity?.tradeSubcontractor === 'string'
      ? activity.tradeSubcontractor
      : undefined,
    equipmentIds: stringArray(activity?.equipmentRequired),
    componentIds: stringArray(activity?.componentIds),
    sourceActivity: activity,
  };
}

function deriveSchedule(
  state: HermesWorldState,
  legacySchedule: ConstructionTaskSchedule[] = []
): HumanScheduleState {
  const canonical = state.scheduleActivities || [];
  const source = canonical.length > 0 ? canonical : legacySchedule;
  const activities = source.map((activity: any, index: number) => normalizeCpmActivity(activity, index));

  if (canonical.length === 0) {
    return {
      availability: 'NOT_CALCULATED',
      activities,
      criticalActivityIds: [],
    };
  }

  const finishes = activities
    .map((activity) => activity.earlyFinish)
    .filter((value): value is number => typeof value === 'number' && Number.isFinite(value));

  return {
    availability: 'CALCULATED',
    activities,
    criticalPathDurationDays: finishes.length > 0 ? Math.max(...finishes) : undefined,
    criticalActivityIds: activities
      .filter((activity) => activity.isCriticalPath === true)
      .map((activity) => activity.id),
  };
}

function deriveWhatChanged(
  state: HermesWorldState,
  events: HumanTimelineEvent[],
  marker?: ProjectLastSeenMarker | null
): WhatChangedSummary {
  const latestSequence = events.length > 0
    ? events[events.length - 1].sequence
    : state.eventSequence || 0;

  const markerValid = Boolean(
    marker &&
    marker.projectId === state.projectId &&
    marker.attemptId === state.attemptId
  );

  const baseline = markerValid ? marker!.eventSequence : 0;
  const unseen = events.filter((event) => event.sequence > baseline);
  const countsByCategory: Partial<Record<HumanTimelineCategory, number>> = {};

  for (const event of unseen) {
    countsByCategory[event.category] = (countsByCategory[event.category] || 0) + 1;
  }

  return {
    markerValid,
    unseenCount: unseen.length,
    events: unseen,
    countsByCategory,
    latestSequence,
  };
}

export function deriveHumanTimelineState(
  state: HermesWorldState,
  options?: {
    lastSeen?: ProjectLastSeenMarker | null;
    legacySchedule?: ConstructionTaskSchedule[];
  }
): HumanTimelineState {
  const events = normalizeEvents(state);

  return {
    projectId: state.projectId,
    attemptId: state.attemptId,
    currentSequence: state.eventSequence || events.length,
    events,
    whatChanged: deriveWhatChanged(state, events, options?.lastSeen),
    schedule: deriveSchedule(state, options?.legacySchedule),
  };
}

export function createLastSeenMarker(state: HermesWorldState): ProjectLastSeenMarker {
  return {
    projectId: state.projectId,
    attemptId: state.attemptId,
    eventSequence: state.eventSequence || (state.events?.length || 0),
    viewedAt: new Date().toISOString(),
  };
}

export function lastSeenStorageKey(projectId: string, attemptId: string): string {
  return 'hermes:last-seen:' + projectId + ':' + attemptId;
}
