import React from 'react';
import type { HermesWorldState } from '../../types/hermes';
import { deriveLogisticsWorkspaceState } from '../../lib/logisticsWorkspaceState';
import { MaterialBatchList } from './MaterialsWorkspace';
import { OperationsActions, OperationsRecordLinks, recordedValue } from './OperationsRecordLinks';

export function LogisticsWorkspace({ state, actions }: { state: HermesWorldState; actions: OperationsActions }) {
  const logistics = deriveLogisticsWorkspaceState(state);
  return <div className="hx-summary hx-operations"><p className="hx-record-scope">Current project logistics · {state.mode}. Replay does not change these records.</p>
    <section><h3>Work location</h3>{logistics.work ? <>
      <h4>{logistics.work.title}</h4><p>Task {logistics.work.id}</p><p>Position: {logistics.work.position ? `${logistics.work.position.join(', ')} m` : 'Not recorded'}</p>
      <div className="hx-row-actions"><button disabled={!logistics.work.position} onClick={() => { if (logistics.work?.position) actions.focusPosition(logistics.work.position); }}>Focus work location</button></div>
      <p>Assigned actor: {logistics.work.assignedAgentId || 'Not recorded'}</p>
      <OperationsRecordLinks state={state} ids={logistics.work.assignedAgentId ? [logistics.work.assignedAgentId] : []} actions={actions}/>
      <h4>Required equipment</h4>{!logistics.work.requiredEquipmentIds.length && <p>Not recorded</p>}<OperationsRecordLinks state={state} ids={logistics.work.requiredEquipmentIds} actions={actions}/>
      <h4>Required materials</h4>{!logistics.work.requiredMaterialIds.length && <p>Not recorded</p>}<OperationsRecordLinks state={state} ids={logistics.work.requiredMaterialIds} actions={actions}/>
      <small>Required resource IDs are not proof of allocation or delivery.</small>
    </> : <p>No active work location recorded.</p>}</section>
    <section><h3>Equipment · {logistics.equipment.length}</h3><ul className="hx-operation-list">{logistics.equipment.map(equipment => <li key={equipment.id}>
      <h4>{equipment.name}</h4><p>{equipment.type || 'Type not recorded'} · {equipment.status || 'Status not recorded'}</p>
      <dl><dt>Task assignment</dt><dd>{equipment.assignedTaskId || 'Not recorded'}</dd><dt>Home depot</dt><dd>{equipment.homeDepotId || 'Not recorded'}</dd>
        <dt>Current position</dt><dd>{equipment.position ? `${equipment.position.join(', ')} m` : 'Not recorded'}</dd>
        <dt>Target position</dt><dd>{equipment.targetPosition ? `${equipment.targetPosition.join(', ')} m` : 'Not recorded'}</dd>
        <dt>Clearance radius</dt><dd>{recordedValue(equipment.clearanceRadiusMeters,' m')}</dd></dl>
      <OperationsRecordLinks state={state} ids={[equipment.id,equipment.assignedAgentId].filter((id): id is string => Boolean(id))} actions={actions}/>
    </li>)}</ul>{!logistics.equipment.length && <p>No equipment records.</p>}</section>
    <section><h3>Material staging</h3>{logistics.staging.map(zone => <article className="hx-operation-card" key={zone.id}><h4>{zone.name}</h4><p>{zone.type || 'Type not recorded'} · {zone.status || 'State not recorded'}</p><p>{zone.batchIds.length} batches linked by staging-zone ID</p><OperationsRecordLinks state={state} ids={[zone.id,...zone.batchIds].filter(Boolean)} actions={actions}/></article>)}
      {!logistics.staging.length && <p>No staging-zone records linked to current batches.</p>}
      <MaterialBatchList state={state} batches={logistics.batches} actions={actions}/>
    </section>
    <section><h3>Constructability & future access</h3>{logistics.proof ? <>
      <p>Recorded internal proof: {logistics.proof.proofId || 'ID not recorded'}</p><p>Status: {logistics.proof.status || 'Not recorded'}</p><p>{logistics.proof.rationale || 'Rationale not recorded'}</p>
      <p>Closure task: {logistics.proof.closureTaskId || 'Not recorded'}</p>
      <OperationsRecordLinks state={state} ids={[logistics.proof.materialId,logistics.proof.closureComponentId].filter((id): id is string => Boolean(id))} actions={actions}/>
      <p>Internal proof is not physical access verification.</p>
    </> : <p>No constructability or future-access proof recorded.</p>}
      <small>Delivery routes, reservations and robot paths are not connected.</small>
    </section>
  </div>;
}
