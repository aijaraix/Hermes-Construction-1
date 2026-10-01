import React from 'react';
import type { HermesWorldState } from '../../types/hermes';
import { resolveInspectableEntity } from '../../lib/inspectableEntity';
import { finitePosition } from '../../lib/inspectorViewState';
import { recordInCurrentProject, recordedIds } from '../../lib/operationRecordScope';

export interface OperationsActions { select: (id: string) => void; focusEntity: (id: string) => void; focusPosition: (position: [number,number,number]) => void; focusAvailable?: boolean }
export function operationEntityAccess(state: HermesWorldState, id: string) {
  const entity = resolveInspectableEntity(state,id);
  const canInspect = Boolean(entity && entity.kind !== 'UNKNOWN' && recordInCurrentProject(state,entity.sourceRecord));
  return { canInspect, canFocus: canInspect && finitePosition(entity?.spatial?.position), name: entity?.name || id };
}
export function OperationsRecordLinks({ state, ids, actions }: { state: HermesWorldState; ids: string[]; actions: OperationsActions }) {
  return <div className="hx-record-links">{recordedIds(ids).map(id => {
    const access = operationEntityAccess(state,id);
    return <div key={id} className="hx-row-actions"><span className="hx-record-id">{id}</span>
      <button disabled={!access.canInspect} onClick={() => actions.select(id)} aria-label={`Inspect ${id}`}>Inspect</button>
      <button disabled={!access.canFocus || actions.focusAvailable === false} onClick={() => actions.focusEntity(id)} aria-label={`Focus ${id}`}>Focus in 3D</button>
      {!access.canInspect && <small>Linked record unavailable</small>}
    </div>;
  })}</div>;
}
export const recordedValue = (value: unknown, suffix = '') => typeof value === 'number' && Number.isFinite(value) ? `${value}${suffix}` : 'Not recorded';
