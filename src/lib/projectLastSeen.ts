import type { HermesWorldState } from '../types/hermes';
import { ProjectLastSeenMarker, lastSeenStorageKey } from './projectTimelineState';
type MarkerStorage = Pick<Storage, 'getItem' | 'setItem'>;
export function readLastSeen(storage: MarkerStorage | undefined, state: Pick<HermesWorldState, 'projectId' | 'attemptId'>): ProjectLastSeenMarker | null {
  try {
    const marker = JSON.parse(storage?.getItem(lastSeenStorageKey(state.projectId,state.attemptId)) || 'null');
    if (marker?.projectId !== state.projectId || marker?.attemptId !== state.attemptId || !Number.isSafeInteger(marker.eventSequence) || marker.eventSequence < 0 || typeof marker.viewedAt !== 'string') return null;
    return marker;
  } catch { return null; }
}
export function writeLastSeen(storage: MarkerStorage | undefined, marker: ProjectLastSeenMarker): boolean {
  try { if (!storage) return false; storage.setItem(lastSeenStorageKey(marker.projectId,marker.attemptId),JSON.stringify(marker)); return true; }
  catch { return false; }
}
