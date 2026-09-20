import { HermesWorldState } from '../types/hermes';

export type InspectableEntityKind =
  | 'PROJECT'
  | 'COMPONENT'
  | 'MATERIAL'
  | 'ACTOR'
  | 'EQUIPMENT'
  | 'FACILITY'
  | 'SPACE'
  | 'SITE'
  | 'UNKNOWN';

export interface InspectableProperty {
  label: string;
  value: string | number | boolean;
  unit?: string;
  sourcePath?: string;
}

export interface InspectableRelationship {
  type:
    | 'HOSTED_BY'
    | 'HOSTS'
    | 'CONNECTED_TO'
    | 'PART_OF_SYSTEM'
    | 'LOCATED_IN'
    | 'CREATED_BY_TASK'
    | 'CREATED_BY_ACTOR'
    | 'TARGETS_COMPONENT'
    | 'ASSIGNED_TO_TASK'
    | 'ASSIGNED_TO_ACTOR'
    | 'CARRIED_BY'
    | 'SUPPLIED_BY'
    | 'OTHER';
  targetId?: string;
  label: string;
  targetKind?: InspectableEntityKind;
}

export interface InspectableEntity {
  id: string;
  kind: InspectableEntityKind;
  name: string;
  category?: string;
  discipline?: string;
  status?: string;
  spatial?: {
    position?: [number, number, number];
    dimensions?: [number, number, number];
    rotationDegrees?: number;
    storeyId?: string;
    storeyName?: string;
    spaceId?: string;
    spaceName?: string;
    hostId?: string;
  };
  properties: InspectableProperty[];
  relationships: InspectableRelationship[];
  sourceRecord: unknown;
}

function vector3(value: unknown): [number, number, number] | undefined {
  if (!Array.isArray(value) || value.length < 3) return undefined;
  const candidate = value.slice(0, 3).map(Number);
  if (candidate.some((entry) => !Number.isFinite(entry))) return undefined;
  return candidate as [number, number, number];
}

function addProperty(
  target: InspectableProperty[],
  label: string,
  value: unknown,
  sourcePath?: string,
  unit?: string
): void {
  if (value === undefined || value === null || value === '') return;
  if (!['string', 'number', 'boolean'].includes(typeof value)) return;
  target.push({
    label,
    value: value as string | number | boolean,
    sourcePath,
    unit,
  });
}

function addRelationship(
  target: InspectableRelationship[],
  type: InspectableRelationship['type'],
  targetId: unknown,
  label: string,
  targetKind?: InspectableEntityKind
): void {
  if (typeof targetId !== 'string' || !targetId) return;
  target.push({ type, targetId, label, targetKind });
}

function componentId(record: any): string | undefined {
  return record?.componentId || record?.id || record?.ifcGlobalId || record?.ifcGuid;
}

function componentName(record: any): string {
  return record?.name || record?.assembly || record?.type || componentId(record) || 'Component';
}

function resolveComponent(record: any): InspectableEntity {
  const id = componentId(record) || 'UNKNOWN-COMPONENT';
  const properties: InspectableProperty[] = [];
  const relationships: InspectableRelationship[] = [];

  const dimensions =
    vector3(record?.dimensionsXYZ) ||
    vector3(record?.dimensions) ||
    vector3(record?.geometry?.dimensions);
  const position =
    vector3(record?.positionXYZ) ||
    vector3(record?.position) ||
    vector3(record?.geometry?.position);

  addProperty(properties, 'IFC Type', record?.ifcType, 'ifcType');
  addProperty(properties, 'IFC Global ID', record?.ifcGlobalId || record?.ifcGuid, 'ifcGlobalId');
  addProperty(properties, 'Assembly', record?.assembly, 'assembly');
  addProperty(properties, 'Material', record?.material, 'material');
  addProperty(properties, 'Installation Phase', record?.installationPhase, 'installationPhase');
  addProperty(properties, 'Inspection Status', record?.inspectionStatus || record?.inspectionState, 'inspectionStatus');
  addProperty(properties, 'Fire Rating', record?.fireRatingHours, 'fireRatingHours', 'hr');
  addProperty(properties, 'Fire Rating', record?.fireRatingMinutes, 'fireRatingMinutes', 'min');
  addProperty(properties, 'Acoustic STC', record?.acousticSTC, 'acousticSTC');
  addProperty(properties, 'Thermal Resistance', record?.thermalResistanceRValue, 'thermalResistanceRValue', 'R');
  addProperty(properties, 'Quantity', record?.quantity?.value, 'quantity.value', record?.quantity?.unit);
  addProperty(properties, 'Unit Cost', record?.unitCost, 'unitCost', 'USD');
  addProperty(properties, 'Total Cost', record?.totalCost, 'totalCost', 'USD');
  addProperty(properties, 'Status', record?.status, 'status');
  addProperty(properties, 'Source Provenance', record?.sourceProvenance, 'sourceProvenance');
  addProperty(properties, 'Current Revision', record?.currentRevisionId, 'currentRevisionId');

  addRelationship(relationships, 'HOSTED_BY', record?.hostWallId, 'Hosted by component', 'COMPONENT');
  addRelationship(relationships, 'CREATED_BY_TASK', record?.sourceTaskId || record?.createdByTaskId, 'Created by task');
  addRelationship(relationships, 'CREATED_BY_ACTOR', record?.createdByAgentId, 'Created by actor', 'ACTOR');
  addRelationship(relationships, 'LOCATED_IN', record?.spaceId, 'Located in space', 'SPACE');

  for (const connectedId of record?.connectedComponentIds || []) {
    addRelationship(relationships, 'CONNECTED_TO', connectedId, 'Connected component', 'COMPONENT');
  }

  for (const openingId of record?.openings || []) {
    addRelationship(relationships, 'HOSTS', openingId, 'Hosted opening', 'COMPONENT');
  }

  return {
    id,
    kind: 'COMPONENT',
    name: componentName(record),
    category: record?.category || record?.type || record?.system,
    discipline: record?.discipline || record?.system,
    status: record?.status || record?.inspectionStatus || record?.inspectionState,
    spatial: {
      position,
      dimensions,
      rotationDegrees:
        typeof record?.orientationDegrees === 'number' ? record.orientationDegrees : undefined,
      storeyId: record?.storeyId,
      storeyName: record?.storeyName,
      spaceId: record?.spaceId,
      spaceName: record?.spaceName || record?.room,
      hostId: record?.hostWallId,
    },
    properties,
    relationships,
    sourceRecord: record,
  };
}

function resolveMaterial(record: any): InspectableEntity {
  const id = record?.materialBatchId || record?.materialId || record?.id || 'UNKNOWN-MATERIAL';
  const properties: InspectableProperty[] = [];
  const relationships: InspectableRelationship[] = [];

  addProperty(properties, 'Category', record?.category || record?.type, 'category');
  addProperty(properties, 'Quantity', record?.quantity, 'quantity', record?.unit);
  addProperty(properties, 'Current Location', record?.currentLocation || record?.status, 'currentLocation');
  addProperty(properties, 'Verification', record?.verificationStatus, 'verificationStatus');
  addProperty(properties, 'Supplier', record?.supplierName, 'supplierName');
  addProperty(properties, 'Weight', record?.weightLbs, 'weightLbs', 'lb');

  addRelationship(relationships, 'TARGETS_COMPONENT', record?.targetComponentId, 'Target component', 'COMPONENT');
  addRelationship(relationships, 'ASSIGNED_TO_TASK', record?.assignedTaskId, 'Assigned task');
  addRelationship(relationships, 'CARRIED_BY', record?.carriedByAgentId, 'Carried by actor', 'ACTOR');
  addRelationship(relationships, 'SUPPLIED_BY', record?.supplierName, 'Supplier');

  return {
    id,
    kind: 'MATERIAL',
    name: record?.name || id,
    category: record?.category || record?.type,
    status: record?.verificationStatus || record?.status || record?.currentLocation,
    spatial: {
      position: vector3(record?.worldPosition),
      dimensions: vector3(record?.dimensionsXYZ || record?.dimensionsMeters),
    },
    properties,
    relationships,
    sourceRecord: record,
  };
}

function resolveActor(record: any): InspectableEntity {
  const rawId = record?.agentId || record?.id || 'UNKNOWN-ACTOR';
  const id = String(rawId).startsWith('AGENT-') ? String(rawId) : String(rawId);
  const properties: InspectableProperty[] = [];
  const relationships: InspectableRelationship[] = [];

  addProperty(properties, 'Role', record?.role, 'role');
  addProperty(properties, 'Discipline', record?.discipline, 'discipline');
  addProperty(properties, 'State', record?.currentState || record?.status, 'currentState');
  addProperty(properties, 'Localization Confidence', record?.localizationConfidence, 'localizationConfidence');
  addProperty(properties, 'Safety Clearance', record?.safetyClearanceMeters, 'safetyClearanceMeters', 'm');
  addProperty(properties, 'Blocked Unsafe', Boolean(record?.blockedUnsafeState), 'blockedUnsafeState');

  addRelationship(relationships, 'ASSIGNED_TO_TASK', record?.currentTaskId, 'Current task');
  addRelationship(
    relationships,
    'CARRIED_BY',
    record?.carriedMaterial?.materialId,
    'Carrying material',
    'MATERIAL'
  );

  return {
    id,
    kind: 'ACTOR',
    name: record?.role ? String(record.role) + ' (' + id + ')' : id,
    category: record?.type || record?.actorType,
    discipline: record?.discipline,
    status: record?.currentState || record?.status,
    spatial: {
      position: vector3(record?.worldPosition || record?.currentPositionXYZ),
      dimensions: vector3(record?.bodyEnvelopeMeters),
    },
    properties: [
      ...properties,
      ...(vector3(record?.bodyEnvelopeMeters)
        ? [{ label: 'Body Envelope', value: JSON.stringify(vector3(record.bodyEnvelopeMeters)), sourcePath: 'bodyEnvelopeMeters' }]
        : []),
      ...(vector3(record?.toolEnvelopeMeters)
        ? [{ label: 'Tool Envelope', value: JSON.stringify(vector3(record.toolEnvelopeMeters)), sourcePath: 'toolEnvelopeMeters' }]
        : []),
      ...(vector3(record?.payloadEnvelopeMeters)
        ? [{ label: 'Payload Envelope', value: JSON.stringify(vector3(record.payloadEnvelopeMeters)), sourcePath: 'payloadEnvelopeMeters' }]
        : []),
    ],
    relationships,
    sourceRecord: record,
  };
}

function resolveEquipment(record: any): InspectableEntity {
  const id = record?.equipmentId || record?.id || 'UNKNOWN-EQUIPMENT';
  const properties: InspectableProperty[] = [];
  const relationships: InspectableRelationship[] = [];

  addProperty(properties, 'Equipment Type', record?.equipmentType, 'equipmentType');
  addProperty(properties, 'Model', record?.modelName, 'modelName');
  addProperty(properties, 'Operational Status', record?.operationalStatus, 'operationalStatus');
  addProperty(properties, 'Clearance Radius', record?.clearanceRadiusMeters, 'clearanceRadiusMeters', 'm');
  addProperty(properties, 'Home Depot', record?.homeDepotId, 'homeDepotId');

  addRelationship(relationships, 'ASSIGNED_TO_TASK', record?.assignedTaskId, 'Assigned task');
  addRelationship(relationships, 'ASSIGNED_TO_ACTOR', record?.assignedAgentId, 'Assigned actor', 'ACTOR');

  return {
    id,
    kind: 'EQUIPMENT',
    name: record?.name || id,
    category: record?.equipmentType,
    status: record?.operationalStatus,
    spatial: {
      position: vector3(record?.worldPosition),
      dimensions: vector3(record?.dimensionsXYZ),
    },
    properties,
    relationships,
    sourceRecord: record,
  };
}

function resolveFacility(record: any): InspectableEntity {
  const id = record?.entityId || record?.id || 'UNKNOWN-FACILITY';
  const properties: InspectableProperty[] = [];

  addProperty(properties, 'Entity Type', record?.entityType, 'entityType');
  addProperty(properties, 'Operational Status', record?.operationalStatus, 'operationalStatus');
  addProperty(properties, 'Max Occupancy', record?.maxOccupancy, 'maxOccupancy');

  return {
    id,
    kind: record?.entityType === 'SITE' ? 'SITE' : 'FACILITY',
    name: record?.name || id,
    category: record?.entityType,
    status: record?.operationalStatus,
    spatial: {
      position: vector3(record?.worldPosition || record?.positionXYZ),
      dimensions: vector3(record?.dimensionsXYZ),
    },
    properties,
    relationships: [],
    sourceRecord: record,
  };
}

function resolveSpace(record: any): InspectableEntity {
  const id = record?.roomId || record?.spaceId || record?.id || 'UNKNOWN-SPACE';
  const properties: InspectableProperty[] = [];

  addProperty(properties, 'Area', record?.areaSqFt, 'areaSqFt', 'sq ft');

  return {
    id,
    kind: 'SPACE',
    name: record?.name || id,
    status: record?.status,
    spatial: {
      position: vector3(record?.positionXYZ || record?.position),
      dimensions: vector3(record?.dimensionsXYZ || record?.dimensions),
    },
    properties,
    relationships: [],
    sourceRecord: record,
  };
}

function resolveProject(state: HermesWorldState): InspectableEntity {
  const properties: InspectableProperty[] = [];

  addProperty(properties, 'Phase', state.currentPhase, 'currentPhase');
  addProperty(properties, 'Current Task', state.currentTask, 'currentTask');
  addProperty(properties, 'Next Task', state.nextTask, 'nextTask');
  addProperty(properties, 'Completion', state.overallCompletionPct, 'overallCompletionPct', '%');
  addProperty(properties, 'Status', state.status, 'status');
  addProperty(properties, 'Mode', state.mode, 'mode');
  addProperty(properties, 'Checkpoint', state.currentCheckpoint, 'currentCheckpoint');

  return {
    id: state.projectId,
    kind: 'PROJECT',
    name: state.projectName || state.projectId,
    category: state.mode,
    status: state.status,
    properties,
    relationships: [],
    sourceRecord: state,
  };
}

export function resolveInspectableEntity(
  state: HermesWorldState,
  entityId: string | null | undefined
): InspectableEntity | null {
  if (!entityId) return null;

  if (entityId === state.projectId) return resolveProject(state);

  const component = (state.buildingComponents || []).find(
    (record: any) =>
      componentId(record) === entityId ||
      ('AGENT-' + String(componentId(record))) === entityId
  );
  if (component) return resolveComponent(component);

  const material = (state.materialsOnsite || []).find(
    (record: any) =>
      record?.materialBatchId === entityId ||
      record?.materialId === entityId ||
      record?.id === entityId
  );
  if (material) return resolveMaterial(material);

  const actor = (state.agentSpatialStates || []).find((record: any) => {
    const rawId = record?.agentId || record?.id;
    return rawId === entityId || ('AGENT-' + String(rawId)) === entityId;
  });
  if (actor) return resolveActor(actor);

  const equipment = (state.equipmentEntities || []).find(
    (record: any) => record?.equipmentId === entityId || record?.id === entityId
  );
  if (equipment) return resolveEquipment(equipment);

  const facility = (state.spatialEntities || []).find(
    (record: any) => record?.entityId === entityId || record?.id === entityId
  );
  if (facility) return resolveFacility(facility);

  const space = (state.programVolumes || []).find(
    (record: any) =>
      record?.roomId === entityId ||
      record?.spaceId === entityId ||
      record?.id === entityId
  );
  if (space) return resolveSpace(space);

  return {
    id: entityId,
    kind: 'UNKNOWN',
    name: entityId,
    properties: [],
    relationships: [],
    sourceRecord: null,
  };
}
