import type { ModelChange, ModelDiff, ModelEntityMapping, NormalizedIfcModel, SourceModelRevision } from './IfcNormalizer';

export function diffModel(model: NormalizedIfcModel, mappings: ModelEntityMapping[], previous: SourceModelRevision | null): ModelDiff[] {
  const currentById=new Map(model.entities.map(e=>[e.expressId,e]));const oldById=new Map(previous?.normalized?.entities.map(e=>[e.expressId,e])??[]);
  const previousMappings=new Map(previous?.mappings?.map(m=>[m.entityId,m])??[]);const currentIds=new Set(mappings.map(m=>m.entityId));
  const result: ModelDiff[]=mappings.map(mapping=>{
    const current=currentById.get(mapping.expressId)!;
    const oldMapping=previousMappings.get(mapping.entityId);
    const old=oldById.get(oldMapping?.expressId);
    const changes: ModelChange[]=[];
    if(!old)changes.push('ADDED');
    else {
      const names={properties:'PROPERTY_CHANGED',placement:'PLACEMENT_CHANGED',geometry:'GEOMETRY_CHANGED',relationships:'RELATIONSHIP_CHANGED'} as const;
      for(const key of Object.keys(names) as Array<keyof typeof names>)if(current.fingerprints[key]!==old.fingerprints[key])changes.push(names[key]);
    }
    if(['PROBABLE_REVIEW_REQUIRED','UNRESOLVED'].includes(mapping.state))changes.push('IDENTITY_REVIEW_REQUIRED');
    return {entityId:mapping.entityId,expressId:mapping.expressId,changes:changes.length?changes:['UNCHANGED']};
  });
  for(const removed of previous?.mappings??[])if(!currentIds.has(removed.entityId))result.push({entityId:removed.entityId,changes:['REMOVED']});
  return result;
}
