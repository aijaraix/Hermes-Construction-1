import { randomUUID } from 'node:crypto';
import type { ModelEntityMapping, NormalizedIfcModel, SourceModelRevision } from './IfcNormalizer';

export const isValidIfcGlobalId=(value: unknown): value is string=>typeof value==='string'&&/^[0-3][0-9A-Za-z_$]{21}$/.test(value);
/** No global GUID registry: previous mappings must belong to this project's SAME source model. */
export function reconcileModel(model: NormalizedIfcModel, previous: SourceModelRevision | null, explicit: Record<number,string>={},history: ModelEntityMapping[]=[]): ModelEntityMapping[] {
  const old=[...history,...previous?.mappings??[]]; const used=new Set<string>();
  const oldIds=new Set(old.map(m=>m.entityId));const byGuid=new Map(old.filter(m=>m.globalId).map(m=>[m.globalId,m]));
  const names=new Set((previous?.normalized?.entities??[]).filter(e=>e.name).map(e=>JSON.stringify([e.ifcType,e.name])));
  const seen=new Set<string>(),duplicate=new Set<string>();for(const entity of model.entities)if(entity.globalId){if(seen.has(entity.globalId))duplicate.add(entity.globalId);seen.add(entity.globalId);}
  return model.entities.map(entity=>{
    const exact=isValidIfcGlobalId(entity.globalId)&&!duplicate.has(entity.globalId)?byGuid.get(entity.globalId):undefined;
    const mapped=explicit[entity.expressId];
    if(mapped&&!oldIds.has(mapped))throw new Error('Explicit identity mapping must reference this source model history');
    if(exact&&mapped&&mapped!==exact.entityId)throw new Error('Explicit identity conflicts with exact source GlobalId');
    const priorEntity=exact?.entityId??mapped;
    if(priorEntity&&used.has(priorEntity))throw new Error('Identity mapping must be one to one');
    const probable=Boolean(entity.name)&&names.has(JSON.stringify([entity.ifcType,entity.name]));
    const entityId=priorEntity??`HERMES-IFC-${randomUUID()}`;used.add(entityId);
    return {expressId:entity.expressId,globalId:duplicate.has(entity.globalId)?undefined:entity.globalId,entityId,
      state:duplicate.has(entity.globalId)?'UNRESOLVED':exact?'EXACT_EXTERNAL_ID':mapped?'DETERMINISTIC_MATCH':probable?'PROBABLE_REVIEW_REQUIRED':'NEW_ENTITY'};
  });
}
