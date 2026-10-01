import type { PoolClient } from 'pg';
import type { ConstructionEntity, SpatialFrame } from '../../src/types/hermes';
import type { JsonValue } from './contracts';
import type { ModelImportRepository, SourceModel, SourceModelRevision } from '../bim/IfcNormalizer';
import { PostgresFoundationRepository } from './PostgresFoundationRepository';
import { canonicalJson, PersistenceConflict, ScopeViolation } from './integrity';

/** All canonical promotion and final import state share FND-03's project-scoped transaction. */
export class PostgresModelImportRepository implements ModelImportRepository {
  constructor(private foundation: PostgresFoundationRepository) {}
  private project(id: string) {if(id!==this.foundation.scope.projectId)throw new ScopeViolation();}
  get(id: string) {return this.foundation.withProjectTransaction(async(f,c)=>(await c.query('SELECT payload FROM source_model_revisions WHERE project_id=$1 AND revision_id=$2',[f.scope.projectId,id])).rows[0]?.payload as SourceModelRevision??null);}
  latest(id: string) {return this.foundation.withProjectTransaction(async(f,c)=>(await c.query('SELECT r.payload FROM source_models m JOIN source_model_revisions r ON r.project_id=m.project_id AND r.revision_id=m.current_revision_id WHERE m.project_id=$1 AND m.source_model_id=$2',[f.scope.projectId,id])).rows[0]?.payload as SourceModelRevision??null);}
  identityHistory(id: string) {return this.foundation.withProjectTransaction(async(f,c)=>(await c.query("SELECT m.payload FROM model_entity_mappings m JOIN source_model_revisions r ON r.project_id=m.project_id AND r.revision_id=m.revision_id WHERE r.project_id=$1 AND r.source_model_id=$2 AND r.status='IMPORTED' ORDER BY r.created_at,r.revision_id",[f.scope.projectId,id])).rows.map(r=>r.payload));}
  async begin(model: SourceModel,revision: SourceModelRevision) {
    this.project(model.projectId);this.project(revision.projectId);
    if(model.sourceModelId!==revision.sourceModelId||revision.status!=='IMPORTING'||revision.normalized||revision.mappings||revision.diff||revision.report)throw new Error('Import must start with an unpromoted source revision');
    if(revision.evidence.sourceId!==revision.source.sourceId||revision.evidence.projectRevisionId!==revision.projectRevisionId||revision.sourceArtifact.artifactClass!=='IFC_ORIGINAL')throw new Error('Import evidence/source linkage mismatch');
    await this.foundation.withProjectTransaction(async(f,c)=>{
      await f.createSource(revision.source);await f.createEvidence(revision.evidence,revision.sourceArtifact);
      await c.query('INSERT INTO source_models(project_id,source_model_id,name) VALUES($1,$2,$3) ON CONFLICT DO NOTHING',[model.projectId,model.sourceModelId,model.name]);
      await c.query('INSERT INTO source_model_revisions(project_id,source_model_id,revision_id,prior_revision_id,project_revision_id,artifact_id,evidence_id,status,created_at,payload) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)',[revision.projectId,revision.sourceModelId,revision.revisionId,revision.priorRevisionId,revision.projectRevisionId,revision.sourceArtifact.artifactId,revision.evidence.evidenceId,revision.status,revision.createdAt,canonicalJson(revision)]);
      await f.appendEvent({sequence:0,record:{eventId:`${revision.revisionId}:START`,attemptId:revision.revisionId,projectId:revision.projectId,projectRevisionId:revision.projectRevisionId,timestamp:revision.createdAt,eventType:'MODEL_IMPORT_STARTED',sourceArtifactId:revision.sourceArtifact.artifactId}});
    });
  }
  private async terminal(c: PoolClient,revision: SourceModelRevision) {
    const result=await c.query('UPDATE source_model_revisions SET status=$3,payload=$4 WHERE project_id=$1 AND revision_id=$2 AND status=$5 RETURNING revision_id',[revision.projectId,revision.revisionId,revision.status,canonicalJson(revision),'IMPORTING']);
    if(result.rowCount!==1)throw new PersistenceConflict('Import revision unavailable or already terminal');
  }
  async commit(revision: SourceModelRevision) {
    this.project(revision.projectId);
    if(revision.status!=='IMPORTED'||!revision.normalized||!revision.mappings||!revision.diff||revision.report?.status!=='NORMALIZED')throw new Error('Complete normalized import required');
    if(revision.mappings.length!==revision.normalized.entities.length||new Set(revision.mappings.map(m=>m.entityId)).size!==revision.mappings.length)throw new Error('Incomplete or duplicate canonical mapping');
    await this.foundation.withProjectTransaction(async(f,c)=>{
      // Serialize promotion within a project, then verify optimistic source lineage.
      await c.query('SELECT project_id FROM projects WHERE project_id=$1 FOR UPDATE',[revision.projectId]);
      const head=await c.query('SELECT current_revision_id FROM source_models WHERE project_id=$1 AND source_model_id=$2 FOR UPDATE',[revision.projectId,revision.sourceModelId]);
      if(!head.rowCount||(head.rows[0].current_revision_id??undefined)!==revision.priorRevisionId)throw new PersistenceConflict('Source model head changed during normalization');
      const priorIds=new Set<string>((await c.query("SELECT m.entity_id FROM model_entity_mappings m JOIN source_model_revisions r ON r.project_id=m.project_id AND r.revision_id=m.revision_id WHERE r.project_id=$1 AND r.source_model_id=$2 AND r.status='IMPORTED'",[revision.projectId,revision.sourceModelId])).rows.map(r=>r.entity_id));
      const eventId=`${revision.revisionId}:COMPLETE`,at=revision.report.finishedAt;
      for(const artifact of [revision.normalizedArtifact,revision.reportArtifact])if(artifact)await f.createArtifact(artifact);
      const byExpress=new Map(revision.normalized.entities.map(e=>[e.expressId,e]));
      for(const mapping of revision.mappings) {
        const normalized=byExpress.get(mapping.expressId);if(!normalized)throw new Error('Mapping has no normalized entity');
        if(mapping.globalId&&mapping.globalId!==normalized.globalId)throw new Error('Mapped IFC identity differs from parsed source');
        const old=await f.getEntity(mapping.entityId);const history=old?await f.getEntityRevisions(old.entityId):[];
        if(old&&!priorIds.has(old.entityId))throw new PersistenceConflict('Canonical identity is not in this source model lineage');
        const entityRevisionId=`${revision.revisionId}:${mapping.expressId}`;
        const entity: ConstructionEntity={entityId:mapping.entityId,projectId:revision.projectId,entityClass:normalized.ifcType,name:normalized.name,currentRevisionId:entityRevisionId,lifecycleState:mapping.state==='UNRESOLVED'||mapping.state==='PROBABLE_REVIEW_REQUIRED'?'IDENTITY_REVIEW_REQUIRED':'IMPORTED_SOURCE',externalIds:mapping.globalId?[{system:'IFC',externalId:mapping.globalId,sourceId:revision.sourceModelId,revisionId:revision.revisionId}]:[]};
        await f.appendEntityRevision(entity,{revisionId:entityRevisionId,entityId:entity.entityId,projectRevisionId:revision.projectRevisionId,revisionIndex:old?history.at(-1)!.revision.revisionIndex+1:0,supersedesRevisionId:old?.currentRevisionId,recordedAt:at,sourceEventId:eventId},{sourceModelId:revision.sourceModelId,sourceModelRevisionId:revision.revisionId,evidenceId:revision.evidence.evidenceId,artifactId:revision.sourceArtifact.artifactId,normalized} as unknown as JsonValue);
        await c.query('INSERT INTO model_entity_mappings(project_id,revision_id,express_id,entity_id,payload) VALUES($1,$2,$3,$4,$5)',[revision.projectId,revision.revisionId,mapping.expressId,mapping.entityId,canonicalJson(mapping)]);
        for(const [index,quantity] of normalized.quantities.entries())await f.createClaim({claimId:`${entityRevisionId}:QTY:${index}`,projectId:revision.projectId,projectRevisionId:revision.projectRevisionId,entityRevisionId,subjectEntityId:entity.entityId,domain:'GENERAL',predicate:'ifc.sourceQuantity',value:quantity.value,evidenceIds:[revision.evidence.evidenceId],recordedAt:at,derivationMethod:'IMPORTED',sourceAuthorityClass:revision.source.authorityClass,realityClass:revision.realityClass,softwareOrModelVersion:`web-ifc/${revision.normalized.parser.version}`,status:'PROPOSED'});
      }
      // Immutable source spatial frame identities. No survey/Academy transform is invented.
      const kinds:Record<string,SpatialFrame['kind']>={IFCPROJECT:'SITE_LOCAL',IFCSITE:'SITE_LOCAL',IFCBUILDING:'BUILDING',IFCBUILDINGSTOREY:'STOREY',IFCSPACE:'SPACE'};
      const spatial=revision.normalized.entities.filter(e=>kinds[e.ifcType]);const remaining=new Map(spatial.map(e=>[e.expressId,e]));const done=new Set<number>();
      while(remaining.size) {
        let count=0;
        for(const [id,entity] of remaining) {
          const relation=entity.relationships.find(r=>r.kind==='IFCRELAGGREGATES'&&(r.source as any).RelatedObjects?.some((x:any)=>x.value===id));
          const parent=(relation?.source as any)?.RelatingObject?.value as number|undefined;
          if(parent&&remaining.has(parent)&&!done.has(parent))continue;
          const frameId=`${revision.revisionId}:FRAME:${id}`;
          await f.putFrame({frame:{frameId,projectId:revision.projectId,kind:kinds[entity.ifcType],parentFrameId:parent&&done.has(parent)?`${revision.revisionId}:FRAME:${parent}`:undefined},revisionId:revision.projectRevisionId,unit:'METER'});
          remaining.delete(id);done.add(id);count++;
        }
        if(!count)throw new Error('Cyclic IFC spatial containment cannot be promoted');
      }
      for(const removed of revision.diff.filter(d=>d.changes.includes('REMOVED'))) {
        const old=await f.getEntity(removed.entityId);if(!old)throw new Error('Removed source identity missing from history');
        const history=await f.getEntityRevisions(old.entityId);const id=`${revision.revisionId}:REMOVED:${old.entityId}`;
        await f.appendEntityRevision({...old,currentRevisionId:id,lifecycleState:'REMOVED_FROM_SOURCE'},{revisionId:id,entityId:old.entityId,projectRevisionId:revision.projectRevisionId,revisionIndex:history.at(-1)!.revision.revisionIndex+1,supersedesRevisionId:old.currentRevisionId,recordedAt:at,sourceEventId:eventId},{sourceModelRevisionId:revision.revisionId,removed:true});
      }
      await c.query('INSERT INTO model_diffs(project_id,revision_id,payload) VALUES($1,$2,$3)',[revision.projectId,revision.revisionId,canonicalJson(revision.diff)]);
      await f.appendEvent({sequence:1,record:{eventId,attemptId:revision.revisionId,projectId:revision.projectId,projectRevisionId:revision.projectRevisionId,timestamp:at,eventType:'MODEL_IMPORTED',entitiesAffected:revision.mappings.map(m=>m.entityId),sourceArtifactId:revision.sourceArtifact.artifactId,evidenceId:revision.evidence.evidenceId}});
      await this.terminal(c,revision);
      await c.query('UPDATE source_models SET current_revision_id=$3 WHERE project_id=$1 AND source_model_id=$2',[revision.projectId,revision.sourceModelId,revision.revisionId]);
    });
  }
  async fail(revision: SourceModelRevision) {
    this.project(revision.projectId);
    if(revision.status!=='FAILED'||revision.normalized||revision.mappings||revision.report?.committedEntityCount!==0)throw new Error('Failure cannot contain promoted entities');
    await this.foundation.withProjectTransaction(async(f,c)=>{
      for(const artifact of [revision.normalizedArtifact,revision.reportArtifact])if(artifact)await f.createArtifact(artifact);
      await this.terminal(c,revision);
      await f.appendEvent({sequence:1,record:{eventId:`${revision.revisionId}:FAILED`,attemptId:revision.revisionId,projectId:revision.projectId,projectRevisionId:revision.projectRevisionId,timestamp:revision.report.finishedAt,eventType:'MODEL_IMPORT_FAILED',failure:revision.report.failure,sourceArtifactId:revision.sourceArtifact.artifactId}});
    });
  }
}
