import type { HermesWorldState } from '../types/hermes';
import { deriveMaterialWorkspaceState, isOnSiteBatch } from './materialWorkspaceState';
import { finitePosition } from './inspectorViewState';
import { recordInCurrentProject, recordedIds, recordedNumber } from './operationRecordScope';

function position(value: unknown): [number,number,number] | undefined {
  return finitePosition(value) ? value as [number,number,number] : undefined;
}

/** Display recorded resources and exact relationships; never synthesize transport or access proof. */
export function deriveLogisticsWorkspaceState(state: HermesWorldState) {
  const materials = deriveMaterialWorkspaceState(state);
  const batches = materials.physicalBatches.filter(isOnSiteBatch);
  const stagingIds = new Set(batches.map(batch => batch.stagingZoneId).filter(Boolean));
  const equipment = (state.equipmentEntities || []).filter(record => recordInCurrentProject(state,record)).map((record: any,index) => ({
    id: record.equipmentId || record.id || `EQUIPMENT-${index + 1}`,
    name: record.name || record.equipmentId || 'Unnamed equipment',
    type: record.equipmentType,
    status: record.operationalStatus,
    assignedAgentId: record.assignedAgentId,
    assignedTaskId: record.assignedTaskId,
    homeDepotId: record.homeDepotId,
    position: position(record.worldPosition),
    targetPosition: position(record.targetLocationXYZ),
    clearanceRadiusMeters: recordedNumber(record.clearanceRadiusMeters),
  }));
  const staging = (state.spatialEntities || []).filter(record => recordInCurrentProject(state,record)
    && (['STAGING_ZONE','LAYDOWN_ZONE'].includes(record.entityType) || stagingIds.has(record.entityId || record.id))).map(record => ({
    id: record.entityId || record.id,
    name: record.name || record.entityId || record.id,
    type: record.entityType,
    status: record.currentState || record.operationalStatus || record.state,
    position: position(record.worldPosition || record.positionXYZ),
    batchIds: batches.filter(batch => batch.stagingZoneId === (record.entityId || record.id)).map(batch => batch.id),
  }));
  const active = state.activeTaskDetails;
  const work = active && recordInCurrentProject(state,active) ? {
    id: active.taskId, title: active.title || active.taskId,
    assignedAgentId: active.assignedAgentId,
    position: position(active.workLocationXYZ),
    requiredEquipmentIds: recordedIds(active.requiredEquipment),
    requiredMaterialIds: recordedIds(active.requiredMaterials),
  } : undefined;
  const rawProof = state.constructabilityProof;
  const proof = rawProof && recordInCurrentProject(state,rawProof) ? { ...rawProof } : undefined;
  return { projectId: state.projectId, attemptId: state.attemptId, equipment, staging, batches, work, proof };
}
