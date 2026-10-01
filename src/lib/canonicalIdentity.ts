import type { ConstructionEntity, ConstructionEntityId, EntityRevision, ExternalIdentity } from '../types/hermes';

export function createCanonicalEntity(input: Omit<ConstructionEntity, 'externalIds'> & { externalIds?: ExternalIdentity[] }): ConstructionEntity {
  return { ...input, externalIds: input.externalIds ? [...input.externalIds] : [] };
}
export function withExternalIdentity(entity: ConstructionEntity, externalId: ExternalIdentity): ConstructionEntity {
  const exists = entity.externalIds.some(item => item.system === externalId.system && item.externalId === externalId.externalId && item.sourceId === externalId.sourceId);
  return exists ? entity : { ...entity, externalIds: [...entity.externalIds, externalId] };
}
export function assertNoExternalIdentityConflict(entities: ConstructionEntity[]): void {
  const owners = new Map<string, ConstructionEntityId>();
  for (const entity of entities) for (const alias of entity.externalIds) {
    const key = `${alias.system}:${alias.sourceId || ''}:${alias.externalId}`;
    const owner = owners.get(key);
    if (owner && owner !== entity.entityId) throw new Error(`External identity conflict for ${key}: ${owner} and ${entity.entityId}`);
    owners.set(key, entity.entityId);
  }
}
export function supersedeEntityRevision(previous: EntityRevision, next: Omit<EntityRevision, 'supersedesRevisionId'>): EntityRevision {
  if (previous.entityId !== next.entityId) throw new Error('Entity revisions must preserve canonical entity identity');
  return { ...next, supersedesRevisionId: previous.revisionId };
}
