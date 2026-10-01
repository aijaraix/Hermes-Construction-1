import type { HermesWorldState } from '../types/hermes';

/** A world response scopes records without their own IDs; explicit conflicts never inherit it. */
export function recordInCurrentProject(state: HermesWorldState, record: any): boolean {
  return Boolean(record && (!record.projectId || record.projectId === state.projectId)
    && (!record.currentProjectId || record.currentProjectId === state.projectId)
    && (!record.attemptId || record.attemptId === state.attemptId));
}

export function recordedIds(value: unknown): string[] {
  return Array.isArray(value) ? [...new Set(value.filter((id): id is string => typeof id === 'string' && id.length > 0))] : [];
}

export function recordedNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}
