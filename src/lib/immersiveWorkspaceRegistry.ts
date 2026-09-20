export type ImmersiveWorkspaceId =
  | 'PROJECT'
  | 'MODEL'
  | 'MATERIALS'
  | 'SCHEDULE'
  | 'WORKFORCE'
  | 'LOGISTICS'
  | 'QUALITY'
  | 'SYSTEMS';

export type WorkspacePresentation = 'PANEL' | 'WORKSPACE';

export interface ImmersiveWorkspaceDefinition {
  id: ImmersiveWorkspaceId;
  label: string;
  shortLabel: string;
  iconKey:
    | 'LAYOUT_DASHBOARD'
    | 'LAYERS'
    | 'PACKAGE'
    | 'CALENDAR'
    | 'USERS'
    | 'TRUCK'
    | 'SHIELD_CHECK'
    | 'NETWORK';
  order: number;
  presentation: WorkspacePresentation;
  defaultWidthPx: number;
  minWidthPx: number;
  maxWidthPx: number;
  keyboardShortcut: string;
  mobilePrimary: boolean;
  source:
    | 'PROJECT_OVERVIEW'
    | 'MODEL_TREE'
    | 'MATERIALS_WORKSPACE'
    | 'SCHEDULE_WORKSPACE'
    | 'WORKFORCE_PANEL'
    | 'LOGISTICS_WORKSPACE'
    | 'ATTENTION_WORKSPACE'
    | 'SYSTEMS_TRACE';
  badgeKind?: 'WHAT_CHANGED' | 'MATERIAL_EXCEPTIONS' | 'ATTENTION';
}

export const IMMERSIVE_WORKSPACES: ImmersiveWorkspaceDefinition[] = [
  {
    id: 'PROJECT',
    label: 'Project Overview',
    shortLabel: 'Project',
    iconKey: 'LAYOUT_DASHBOARD',
    order: 1,
    presentation: 'WORKSPACE',
    defaultWidthPx: 680,
    minWidthPx: 520,
    maxWidthPx: 760,
    keyboardShortcut: 'Alt+1',
    mobilePrimary: true,
    source: 'PROJECT_OVERVIEW',
    badgeKind: 'WHAT_CHANGED',
  },
  {
    id: 'MODEL',
    label: 'Model Browser',
    shortLabel: 'Model',
    iconKey: 'LAYERS',
    order: 2,
    presentation: 'PANEL',
    defaultWidthPx: 360,
    minWidthPx: 300,
    maxWidthPx: 480,
    keyboardShortcut: 'Alt+2',
    mobilePrimary: true,
    source: 'MODEL_TREE',
  },
  {
    id: 'MATERIALS',
    label: 'Materials & Procurement',
    shortLabel: 'Materials',
    iconKey: 'PACKAGE',
    order: 3,
    presentation: 'WORKSPACE',
    defaultWidthPx: 700,
    minWidthPx: 560,
    maxWidthPx: 760,
    keyboardShortcut: 'Alt+3',
    mobilePrimary: true,
    source: 'MATERIALS_WORKSPACE',
    badgeKind: 'MATERIAL_EXCEPTIONS',
  },
  {
    id: 'SCHEDULE',
    label: 'Schedule',
    shortLabel: 'Schedule',
    iconKey: 'CALENDAR',
    order: 4,
    presentation: 'WORKSPACE',
    defaultWidthPx: 700,
    minWidthPx: 560,
    maxWidthPx: 760,
    keyboardShortcut: 'Alt+4',
    mobilePrimary: false,
    source: 'SCHEDULE_WORKSPACE',
  },
  {
    id: 'WORKFORCE',
    label: 'Workforce',
    shortLabel: 'Workforce',
    iconKey: 'USERS',
    order: 5,
    presentation: 'PANEL',
    defaultWidthPx: 400,
    minWidthPx: 340,
    maxWidthPx: 460,
    keyboardShortcut: 'Alt+5',
    mobilePrimary: false,
    source: 'WORKFORCE_PANEL',
  },
  {
    id: 'LOGISTICS',
    label: 'Logistics',
    shortLabel: 'Logistics',
    iconKey: 'TRUCK',
    order: 6,
    presentation: 'WORKSPACE',
    defaultWidthPx: 640,
    minWidthPx: 520,
    maxWidthPx: 720,
    keyboardShortcut: 'Alt+6',
    mobilePrimary: false,
    source: 'LOGISTICS_WORKSPACE',
  },
  {
    id: 'QUALITY',
    label: 'Quality & Attention',
    shortLabel: 'Quality',
    iconKey: 'SHIELD_CHECK',
    order: 7,
    presentation: 'WORKSPACE',
    defaultWidthPx: 580,
    minWidthPx: 500,
    maxWidthPx: 680,
    keyboardShortcut: 'Alt+7',
    mobilePrimary: true,
    source: 'ATTENTION_WORKSPACE',
    badgeKind: 'ATTENTION',
  },
  {
    id: 'SYSTEMS',
    label: 'Building Systems',
    shortLabel: 'Systems',
    iconKey: 'NETWORK',
    order: 8,
    presentation: 'PANEL',
    defaultWidthPx: 420,
    minWidthPx: 340,
    maxWidthPx: 500,
    keyboardShortcut: 'Alt+8',
    mobilePrimary: false,
    source: 'SYSTEMS_TRACE',
  },
];

export const WORKSPACE_BY_ID = Object.fromEntries(
  IMMERSIVE_WORKSPACES.map((workspace) => [workspace.id, workspace])
) as Record<ImmersiveWorkspaceId, ImmersiveWorkspaceDefinition>;

export interface ImmersiveWorkspaceUiState {
  activeWorkspaceId: ImmersiveWorkspaceId | null;
  launcherPinned: boolean;
  workspaceWidthById: Partial<Record<ImmersiveWorkspaceId, number>>;
  workspaceSubtabById: Partial<Record<ImmersiveWorkspaceId, string>>;
  developerDrawerOpen: boolean;
}

export const DEFAULT_IMMERSIVE_WORKSPACE_UI_STATE: ImmersiveWorkspaceUiState = {
  activeWorkspaceId: null,
  launcherPinned: false,
  workspaceWidthById: {},
  workspaceSubtabById: {},
  developerDrawerOpen: false,
};

export function toggleWorkspace(
  current: ImmersiveWorkspaceId | null,
  requested: ImmersiveWorkspaceId
): ImmersiveWorkspaceId | null {
  return current === requested ? null : requested;
}

export function clampWorkspaceWidth(
  workspaceId: ImmersiveWorkspaceId,
  requestedWidthPx: number
): number {
  const definition = WORKSPACE_BY_ID[workspaceId];
  if (!definition || !Number.isFinite(requestedWidthPx)) {
    return definition?.defaultWidthPx || 400;
  }

  return Math.max(
    definition.minWidthPx,
    Math.min(definition.maxWidthPx, requestedWidthPx)
  );
}

export function workspaceShortcutTarget(
  event: Pick<KeyboardEvent, 'altKey' | 'key'>
): ImmersiveWorkspaceId | null {
  if (!event.altKey) return null;

  const number = Number(event.key);
  if (!Number.isInteger(number) || number < 1 || number > 8) return null;

  return IMMERSIVE_WORKSPACES[number - 1]?.id || null;
}

export function shouldIgnoreGlobalWorkspaceShortcut(
  target: EventTarget | null
): boolean {
  const element = target as HTMLElement | null;
  if (!element) return false;

  const tag = element.tagName?.toLowerCase();
  return (
    tag === 'input' ||
    tag === 'textarea' ||
    tag === 'select' ||
    element.isContentEditable
  );
}
