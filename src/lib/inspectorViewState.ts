import type { HermesWorldState } from '../types/hermes';
import { resolveInspectableEntity, InspectableEntity, InspectableProperty } from './inspectableEntity';
import { deriveTruthLabel } from './truthLabels';

export type InspectorTab = 'Overview' | 'Properties' | 'Construction' | 'Spatial' | 'Quality' | 'Provenance';
export function defaultInspectorTab(entity: InspectableEntity): InspectorTab {
  return entity.kind === 'ACTOR' || entity.kind === 'EQUIPMENT' ? 'Construction' : entity.kind === 'MATERIAL' ? 'Properties' : 'Overview';
}
export function finitePosition(value: unknown): value is [number, number, number] {
  return Array.isArray(value) && value.length === 3 && value.every(n => typeof n === 'number' && Number.isFinite(n));
}
export function rendererEntityId(state: HermesWorldState, id: string): string {
  const entity = resolveInspectableEntity(state,id);
  const actor = entity?.kind === 'ACTOR' ? entity.sourceRecord as any : undefined;
  // Existing renderer prefix is a display alias only; canonical inspector identity remains raw.
  return actor?.agentId ? (actor.agentId === 'CUSTOMER-001' ? 'CUSTOMER-001' : `AGENT-${actor.agentId}`) : id;
}
export function inspectorViewState(state: HermesWorldState, selectedId: string | null) {
  const entity = resolveInspectableEntity(state, selectedId || state.projectId)!;
  const raw: any = entity.sourceRecord || {};
  const fields: Record<InspectorTab, InspectableProperty[]> = { Overview: [], Properties: [...entity.properties], Construction: [], Spatial: [], Quality: [], Provenance: [] };
  const add = (tab: InspectorTab, label: string, value: unknown, sourcePath?: string, unit?: string) => {
    if (value === undefined || value === null || value === '') return;
    if (typeof value === 'number' && !Number.isFinite(value)) return;
    if (['string','number','boolean'].includes(typeof value)) fields[tab].push({ label, value: value as string | number | boolean, sourcePath, unit });
  };
  add('Overview','Name',entity.name); add('Overview','ID',entity.id); add('Overview','Kind',entity.kind); add('Overview','Category',entity.category); add('Overview','Discipline',entity.discipline); add('Overview','Recorded status',entity.status);
  for (const [label, key] of [['Source task','sourceTaskId'],['Created by task','createdByTaskId'],['Creating actor','createdByAgentId'],['Assigned task','assignedTaskId'],['Current task','currentTaskId'],['Installation phase','installationPhase'],['Recorded state','currentState'],['Operational state','operationalStatus'],['Location','currentLocation'],['Staging zone','stagingZoneId'],['Target component','targetComponentId'],['Current revision','currentRevisionId']]) add('Construction',label,raw[key],key);
  if (raw.carriedMaterial) add('Construction','Carried material',raw.carriedMaterial.materialId,'carriedMaterial.materialId');
  for (const relationship of entity.relationships) add('Construction',relationship.label,relationship.targetId);
  if (finitePosition(entity.spatial?.position)) add('Spatial','Recorded position',entity.spatial.position.join(', '),'spatial.position','m (current world frame)');
  if (finitePosition(entity.spatial?.dimensions)) add('Spatial','Recorded dimensions',entity.spatial.dimensions.join(' × '),'spatial.dimensions','m');
  add('Spatial','Rotation',entity.spatial?.rotationDegrees,undefined,'°'); add('Spatial','Storey',entity.spatial?.storeyName || entity.spatial?.storeyId); add('Spatial','Space',entity.spatial?.spaceName || entity.spatial?.spaceId); add('Spatial','Host',entity.spatial?.hostId);
  for (const key of ['bodyEnvelopeMeters','toolEnvelopeMeters','payloadEnvelopeMeters','combinedEnvelopeMeters','targetLocationXYZ']) if (finitePosition(raw[key])) add('Spatial',key,raw[key].join(' × '),key,'m');
  add('Spatial','Safety clearance',raw.safetyClearanceMeters,'safetyClearanceMeters','m'); add('Spatial','Clearance radius',raw.clearanceRadiusMeters,'clearanceRadiusMeters','m'); add('Spatial','Blocked unsafe state',raw.blockedUnsafeState,'blockedUnsafeState');
  add('Quality','Recorded internal inspection',raw.inspectionStatus || raw.inspectionState,'inspectionStatus'); add('Quality','Inspection notes',raw.inspectionNotes,'inspectionNotes');
  add('Quality','Legacy verification status (not evidence promotion)',raw.verificationStatus,'verificationStatus');
  const inspections = (state.inspectionTickets || []).filter(ticket => entity.kind === 'PROJECT' || ticket.componentId === entity.id || ticket.affectedComponentIds?.includes(entity.id));
  for (const ticket of inspections) {
    const prefix = ticket.ticketId || ticket.id || 'Inspection';
    add('Quality',`${prefix} · HERMES check`,ticket.status);
    add('Quality',`${prefix} · Professional review`,ticket.licensedProfessionalApproval);
    add('Quality',`${prefix} · AHJ`,ticket.AHJInspection);
    add('Quality',`${prefix} · Occupancy`,ticket.certificateOfOccupancyStatus);
  }
  add('Provenance','Project',state.projectId); add('Provenance','Attempt',state.attemptId); add('Provenance','Project mode',state.mode);
  for (const key of ['sourceTaskId','createdByTaskId','createdByAgentId','currentRevisionId','sourceProvenance','ifcGlobalId','ifcGuid','truthOrigin']) add('Provenance',key,raw[key],key);
  for (const key of ['sourceIds','evidenceIds','claimIds']) for (const id of Array.isArray(raw[key]) ? raw[key] : []) add('Provenance',key,id,key);
  // Legacy status strings never promote evidence. Only proper FND-02 claims get truth labels.
  for (const claim of Array.isArray(raw.claims) ? raw.claims : []) {
    if (claim.projectId === state.projectId && claim.subjectEntityId === entity.id && Array.isArray(claim.evidenceIds) && claim.claimId && claim.derivationMethod && claim.realityClass) add('Provenance',`Claim ${claim.claimId}`,deriveTruthLabel(claim));
  }
  const relatedEvents = (state.events || []).filter(e => (!e.projectId || e.projectId === state.projectId) && (!e.attemptId || e.attemptId === state.attemptId) && (e.entitiesAffected?.includes(entity.id) || e.affectedObjectIds?.includes(entity.id)));
  return { entity, fields, relatedEvents, inspections };
}
