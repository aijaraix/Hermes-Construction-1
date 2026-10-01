import type { Pool, PoolClient } from 'pg';
import type { Claim, ConstructionEntity, EntityRevision, Evidence, ProjectRevision, Source, SpatialTransform } from '../../src/types/hermes';
import { createClaim, createEvidence, promoteClaim, supersedeClaim, type PromotionContext } from '../../src/lib/projectEvidence';
import type { ArtifactMetadata, EventAppend, FoundationProject, FoundationRepository, FrameRecord, JsonValue, RepositoryScope, StoredEvent } from './contracts';
import { canonicalJson, compareEventHash, eventHash, PersistenceConflict, required, ScopeViolation, validateFrame } from './integrity';
import { withTransaction } from './postgres';

export class PostgresFoundationRepository implements FoundationRepository {
  readonly scope: Readonly<RepositoryScope>;
  private transactionClient?: PoolClient;
  private transactionClosed=false;
  constructor(private pool: Pool, scope: RepositoryScope) {
    required(scope.organizationId,'organizationId'); required(scope.projectId,'projectId'); this.scope=Object.freeze({...scope});
  }
  private project(id: string) { if (id !== this.scope.projectId) throw new ScopeViolation(); }
  private async scoped<T>(action: (c: PoolClient) => Promise<T>) {
    if(this.transactionClosed)throw new Error('Foundation transaction has ended');
    if(this.transactionClient)return action(this.transactionClient);
    return withTransaction(this.pool,async c => {
      const access=await c.query('SELECT project_id FROM projects WHERE project_id=$1 AND organization_id=$2 FOR KEY SHARE',[this.scope.projectId,this.scope.organizationId]);
      if (!access.rowCount) throw new ScopeViolation();
      return action(c);
    });
  }
  /** Trusted server unit of work. All foundation methods on `foundation` share this transaction. */
  async withProjectTransaction<T>(action: (foundation: PostgresFoundationRepository, client: PoolClient) => Promise<T>): Promise<T> {
    return this.scoped(async client=>{
      const foundation=new PostgresFoundationRepository(this.pool,this.scope);foundation.transactionClient=client;
      try {return await action(foundation,client);} finally {foundation.transactionClosed=true;}
    });
  }
  private async payload<T>(c: PoolClient, table: string, key: string, id: string, lock=false): Promise<T | null> {
    // Table/key are private hardcoded call-site constants. Values are always bound parameters.
    const r=await c.query(`SELECT payload FROM ${table} WHERE project_id=$1 AND ${key}=$2${lock?' FOR UPDATE':''}`,[this.scope.projectId,id]);
    return r.rows[0]?.payload ?? null;
  }
  private async immutable(c: PoolClient, table: string, key: string, id: string, value: unknown, columns: Record<string,unknown>) {
    const fields={project_id:this.scope.projectId,[key]:id,...columns,payload:canonicalJson(value)};
    const names=Object.keys(fields);
    const inserted=await c.query(`INSERT INTO ${table} (${names.join(',')}) VALUES (${names.map((_,i)=>'$'+(i+1)).join(',')}) ON CONFLICT DO NOTHING RETURNING ${key}`,Object.values(fields));
    if (!inserted.rowCount) {
      const old=await this.payload(c,table,key,id);
      if (old === null || canonicalJson(old)!==canonicalJson(value)) throw new PersistenceConflict(`Immutable ${table} identity conflict`);
    }
  }
  async getProject(): Promise<FoundationProject | null> {
    if(this.transactionClosed)throw new Error('Foundation transaction has ended');
    const r=await (this.transactionClient??this.pool).query('SELECT payload FROM projects WHERE project_id=$1 AND organization_id=$2',[this.scope.projectId,this.scope.organizationId]);
    return r.rows[0]?.payload ?? null;
  }
  async createGenesis(project: FoundationProject, revision: ProjectRevision, rootFrame: FrameRecord, event: EventAppend) {
    if(this.transactionClient||this.transactionClosed)throw new Error('Genesis requires its own transaction');
    this.project(project.projectId); this.project(revision.projectId); this.project(rootFrame.frame.projectId); this.project(event.record.projectId);
    if (project.organizationId!==this.scope.organizationId || project.currentRevisionId!==revision.revisionId || rootFrame.revisionId!==revision.revisionId || rootFrame.frame.parentFrameId) throw new ScopeViolation();
    await withTransaction(this.pool,async c => {
      await c.query('INSERT INTO organizations(organization_id,name) VALUES($1,$2) ON CONFLICT DO NOTHING',[this.scope.organizationId,this.scope.organizationId]);
      await c.query('INSERT INTO projects(project_id,organization_id,name,status,current_revision_id,created_at,updated_at,payload) VALUES($1,$2,$3,$4,$5,$6,$7,$8)',[project.projectId,project.organizationId,project.name,project.status,project.currentRevisionId,project.createdAt,project.updatedAt,canonicalJson(project)]);
      await this.insertProjectRevision(c,revision); await this.insertFrame(c,rootFrame); await this.insertEvent(c,event);
    });
  }
  private async insertProjectRevision(c: PoolClient,r: ProjectRevision) {
    this.project(r.projectId);
    await this.immutable(c,'project_revisions','revision_id',r.revisionId,r,{revision_index:r.revisionIndex,supersedes_revision_id:r.supersedesRevisionId,source_event_id:r.sourceEventId,valid_from:r.validFrom,valid_to:r.validTo,recorded_at:r.recordedAt});
  }
  async appendProjectRevision(revision: ProjectRevision) {
    this.project(revision.projectId);
    await this.scoped(async c => {
      const result=await c.query('SELECT payload FROM projects WHERE project_id=$1 FOR UPDATE',[this.scope.projectId]);
      const project: FoundationProject=result.rows[0].payload;
      const previous=await this.payload<ProjectRevision>(c,'project_revisions','revision_id',project.currentRevisionId);
      if (revision.supersedesRevisionId!==previous?.revisionId || revision.revisionIndex!==previous.revisionIndex+1) throw new PersistenceConflict('Project revision must extend current revision');
      await this.insertProjectRevision(c,revision);
      const next={...project,currentRevisionId:revision.revisionId,updatedAt:revision.recordedAt};
      await c.query('UPDATE projects SET current_revision_id=$2,updated_at=$3,payload=$4 WHERE project_id=$1',[this.scope.projectId,revision.revisionId,revision.recordedAt,canonicalJson(next)]);
    });
  }
  getProjectRevision(id: string) { return this.scoped(c=>this.payload<ProjectRevision>(c,'project_revisions','revision_id',id)); }
  async appendEntityRevision(entity: ConstructionEntity, revision: EntityRevision, body: JsonValue=null, event?: EventAppend) {
    this.project(entity.projectId);
    if (entity.entityId!==revision.entityId || entity.currentRevisionId!==revision.revisionId) throw new PersistenceConflict('Entity/revision identity mismatch');
    await this.scoped(async c => {
      // Project lock also serializes creation of the same previously absent entity.
      await c.query('SELECT project_id FROM projects WHERE project_id=$1 FOR UPDATE',[this.scope.projectId]);
      const old=await this.payload<ConstructionEntity>(c,'entities','entity_id',entity.entityId,true);
      if (old) {
        const previous=await c.query('SELECT revision FROM entity_revisions WHERE project_id=$1 AND entity_revision_id=$2',[this.scope.projectId,old.currentRevisionId]);
        if (revision.supersedesRevisionId!==old.currentRevisionId || revision.revisionIndex!==previous.rows[0].revision.revisionIndex+1) throw new PersistenceConflict('Entity revision must extend current identity history');
      } else if (revision.supersedesRevisionId) throw new PersistenceConflict('Initial entity cannot supersede missing history');
      const aliases=new Map((old?.externalIds??[]).map(a=>[canonicalJson([a.system,a.sourceId??'',a.externalId]),a]));
      for (const alias of entity.externalIds) aliases.set(canonicalJson([alias.system,alias.sourceId??'',alias.externalId]),alias);
      const next={...entity,externalIds:[...aliases.values()]};
      await c.query('INSERT INTO entities(project_id,entity_id,entity_class,name,current_revision_id,payload) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(project_id,entity_id) DO UPDATE SET entity_class=EXCLUDED.entity_class,name=EXCLUDED.name,current_revision_id=EXCLUDED.current_revision_id,payload=EXCLUDED.payload',[this.scope.projectId,next.entityId,next.entityClass,next.name,next.currentRevisionId,canonicalJson(next)]);
      await c.query('INSERT INTO entity_revisions(project_id,entity_id,entity_revision_id,project_revision_id,revision_index,supersedes_revision_id,source_event_id,valid_from,valid_to,recorded_at,revision,payload) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)',[this.scope.projectId,entity.entityId,revision.revisionId,revision.projectRevisionId,revision.revisionIndex,revision.supersedesRevisionId,revision.sourceEventId,revision.validFrom,revision.validTo,revision.recordedAt,canonicalJson(revision),canonicalJson(body)]);
      for (const alias of next.externalIds) {
        required(alias.externalId,'externalId');
        await c.query('INSERT INTO external_identities(project_id,entity_id,system,source_scope,external_id,source_revision_id,payload) VALUES($1,$2,$3,$4,$5,$6,$7) ON CONFLICT DO NOTHING',[this.scope.projectId,entity.entityId,alias.system,alias.sourceId??'',alias.externalId,alias.revisionId,canonicalJson(alias)]);
        const owner=await c.query('SELECT entity_id FROM external_identities WHERE project_id=$1 AND system=$2 AND source_scope=$3 AND external_id=$4',[this.scope.projectId,alias.system,alias.sourceId??'',alias.externalId]);
        if (owner.rows[0]?.entity_id!==entity.entityId) throw new PersistenceConflict('External identity already belongs to another entity');
      }
      if (event) await this.insertEvent(c,event);
    });
  }
  getEntity(id: string) { return this.scoped(c=>this.payload<ConstructionEntity>(c,'entities','entity_id',id)); }
  getEntityRevisions(id: string) { return this.scoped(async c=>(await c.query('SELECT revision,payload FROM entity_revisions WHERE project_id=$1 AND entity_id=$2 ORDER BY revision_index',[this.scope.projectId,id])).rows); }
  private async insertFrame(c: PoolClient, r: FrameRecord) {
    this.project(r.frame.projectId);validateFrame(r);
    await this.immutable(c,'spatial_frames','frame_id',r.frame.frameId,r,{project_revision_id:r.revisionId,parent_frame_id:r.frame.parentFrameId,frame_kind:r.frame.kind,unit:r.unit,crs:r.crs});
    if (r.geodeticOrigin) {
      const p=r.geodeticOrigin;
      await c.query('UPDATE spatial_frames SET geodetic_origin=ST_SetSRID(ST_MakePoint($3,$4,$5),4326) WHERE project_id=$1 AND frame_id=$2',[this.scope.projectId,r.frame.frameId,p.longitudeDeg,p.latitudeDeg,p.elevationMeters]);
    }
  }
  putFrame(record: FrameRecord) { return this.scoped(c=>this.insertFrame(c,record)); }
  getFrame(id: string) { return this.scoped(c=>this.payload<FrameRecord>(c,'spatial_frames','frame_id',id)); }
  async putTransform(t: SpatialTransform) {
    if (t.translationMeters.length!==3 || !t.translationMeters.every(Number.isFinite) || t.orientation.kind!=='EULER_XYZ_RADIANS' || t.orientation.value.length!==3 || !t.orientation.value.every(Number.isFinite)) throw new Error('Invalid canonical transform');
    return this.scoped(c=>this.immutable(c,'spatial_transforms','transform_id',t.transformId,t,{from_frame_id:t.sourceFrameId,to_frame_id:t.targetFrameId,project_revision_id:t.revisionId,evidence_id:t.evidenceRefId,translation_meters:canonicalJson(t.translationMeters),orientation:canonicalJson(t.orientation)}));
  }
  getTransform(id: string) { return this.scoped(c=>this.payload<SpatialTransform>(c,'spatial_transforms','transform_id',id)); }
  private async insertEvent(c: PoolClient,input: EventAppend): Promise<'APPENDED'|'IDEMPOTENT'> {
    this.project(input.record.projectId);const hash=eventHash(input);const r=input.record;
    let inserted;
    try {
      inserted=await c.query('INSERT INTO events(project_id,event_id,attempt_id,sequence,trace_id,event_type,project_revision_id,actor,affected_entity_ids,occurred_at,content_hash,payload) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) ON CONFLICT(project_id,event_id) DO NOTHING RETURNING event_id',[this.scope.projectId,r.eventId,r.attemptId??'',input.sequence,input.traceId,r.eventType,r.projectRevisionId??r.revisionId,canonicalJson(r.actor??{actorId:r.actorId,agentId:r.agentId}),r.entitiesAffected??r.affectedObjectIds??[],r.timestamp,hash,canonicalJson(input)]);
    } catch (error) { if (error.code==='23505') throw new PersistenceConflict('Canonical event sequence already occupied'); throw error; }
    if (inserted.rowCount) return 'APPENDED';
    const previous=await c.query('SELECT content_hash FROM events WHERE project_id=$1 AND event_id=$2',[this.scope.projectId,r.eventId]);
    if (!previous.rowCount) throw new PersistenceConflict('Canonical event conflict');
    return compareEventHash(previous.rows[0].content_hash,hash);
  }
  appendEvent(event: EventAppend) { return this.scoped(c=>this.insertEvent(c,event)); }
  getEvent(id: string): Promise<StoredEvent|null> { return this.scoped(async c=>{const r=await c.query('SELECT payload,content_hash FROM events WHERE project_id=$1 AND event_id=$2',[this.scope.projectId,id]);return r.rowCount?{...r.rows[0].payload,contentHash:r.rows[0].content_hash}:null;}); }
  listEvents(): Promise<StoredEvent[]> { return this.scoped(async c=>(await c.query('SELECT payload,content_hash FROM events WHERE project_id=$1 ORDER BY attempt_id,sequence',[this.scope.projectId])).rows.map(r=>({...r.payload,contentHash:r.content_hash}))); }
  async createSource(s: Source) {
    if (s.projectId) this.project(s.projectId);
    required(s.sourceId,'sourceId');required(s.title,'source title');required(s.authorityClass,'source authority');required(s.rightsClassification,'source rights');
    return this.scoped(c=>this.immutable(c,'sources','source_id',s.sourceId,s,{source_type:s.sourceType,authority_class:s.authorityClass,license_status:s.licenseStatus,rights_classification:s.rightsClassification,storage_policy:canonicalJson(s.storagePolicy),title:s.title,owner_or_maintainer:s.ownerOrMaintainer,uri:s.uri,edition_version:s.editionVersion,jurisdiction:s.jurisdiction,geographic_scope:s.geographicScope,effective_from:s.effectiveFrom,effective_to:s.effectiveTo,last_checked:s.lastChecked}));
  }
  getSource(id: string) {return this.scoped(c=>this.payload<Source>(c,'sources','source_id',id));}
  private async insertArtifact(c: PoolClient,a: ArtifactMetadata) {
    this.project(a.projectId);
    if (!a.immutable || !/^[a-f0-9]{64}$/.test(a.sha256) || !Number.isSafeInteger(a.sizeBytes) || a.sizeBytes<0) throw new Error('Invalid immutable artifact metadata');
    await this.immutable(c,'artifacts','artifact_id',a.artifactId,a,{project_revision_id:a.projectRevisionId,source_id:a.sourceId,evidence_id:a.evidenceId,artifact_class:a.artifactClass,object_key:a.objectKey,uri:a.uri,sha256:a.sha256,size_bytes:a.sizeBytes,mime_type:a.mimeType,rights_classification:a.rightsClassification,confidentiality:a.confidentiality,immutable:true,created_at:a.createdAt});
  }
  createArtifact(a: ArtifactMetadata) {return this.scoped(c=>this.insertArtifact(c,a));}
  getArtifact(id: string) {return this.scoped(c=>this.payload<ArtifactMetadata>(c,'artifacts','artifact_id',id));}
  async createEvidence(input: Evidence,artifact?: ArtifactMetadata) {
    this.project(input.projectId);const e=createEvidence(input);
    if (artifact && (artifact.sha256!==e.artifactHash || artifact.uri!==e.artifactUri || artifact.sourceId!==e.sourceId || artifact.evidenceId!==e.evidenceId || artifact.projectRevisionId!==e.projectRevisionId || artifact.rightsClassification!==e.rightsClassification)) throw new PersistenceConflict('Evidence/artifact linkage mismatch');
    await this.scoped(async c=>{
      for (const id of e.relatedEntityIds) if (id!==this.scope.projectId && !await this.payload(c,'entities','entity_id',id)) throw new ScopeViolation();
      if (artifact) await this.insertArtifact(c,artifact);
      await this.immutable(c,'evidence','evidence_id',e.evidenceId,e,{source_id:e.sourceId,project_revision_id:e.projectRevisionId,artifact_id:artifact?.artifactId,artifact_hash:e.artifactHash,artifact_uri:e.artifactUri,mime_type:e.mimeType,spatial_frame_id:e.spatialFrameId,related_entity_ids:e.relatedEntityIds,author_or_device:e.authorOrDevice,reality_class:e.realityClass,rights_classification:e.rightsClassification,content_kind:e.contentKind,observed_at:e.observedAt,captured_at:e.capturedAt,recorded_at:e.recordedAt});
    });
  }
  getEvidence(id: string) {return this.scoped(c=>this.payload<Evidence>(c,'evidence','evidence_id',id));}
  private async insertClaim(c: PoolClient,v: Claim) {
    this.project(v.projectId);
    const isProject=v.subjectEntityId===this.scope.projectId;
    if(isProject&&v.entityRevisionId)throw new Error('Project claim cannot reference an entity revision');
    await this.immutable(c,'claims','claim_id',v.claimId,v,{subject_entity_id:isProject?null:v.subjectEntityId,subject_project_id:isProject?v.subjectEntityId:null,project_revision_id:v.projectRevisionId,entity_revision_id:v.entityRevisionId,domain:v.domain,predicate:v.predicate,value:canonicalJson(v.value),units:v.units,derivation_method:v.derivationMethod,authority_class:v.sourceAuthorityClass,reality_class:v.realityClass,status:v.status,valid_from:v.validFrom,valid_to:v.validTo,recorded_at:v.recordedAt,promoted_by:v.approvedBy,promotion_event_id:v.promotionEventId,supersedes_claim_id:v.supersedesClaimId,superseded_by_claim_id:v.supersededByClaimId});
    for (const id of v.evidenceIds) await c.query('INSERT INTO claim_evidence(project_id,claim_id,evidence_id) VALUES($1,$2,$3) ON CONFLICT DO NOTHING',[this.scope.projectId,v.claimId,id]);
  }
  async createClaim(input: Claim) {
    if(input.supersedesClaimId||input.supersededByClaimId)throw new Error('Explicit claim supersession operation required');
    const claim=createClaim(input as Parameters<typeof createClaim>[0]);
    return this.scoped(c=>this.insertClaim(c,claim));
  }
  getClaim(id: string) {return this.scoped(c=>this.payload<Claim>(c,'claims','claim_id',id));}
  claimsBySubject(id: string): Promise<Claim[]> {return this.scoped(async c=>(await c.query('SELECT payload FROM claims WHERE project_id=$1 AND COALESCE(subject_entity_id,subject_project_id)=$2 ORDER BY recorded_at,claim_id',[this.scope.projectId,id])).rows.map(r=>r.payload));}
  promoteClaim(id: string,context: Omit<PromotionContext,'sources'|'evidence'>,eventId: string,sequence: number): Promise<Claim> {
    return this.scoped(async c=>{
      const claim=await this.payload<Claim>(c,'claims','claim_id',id,true);
      if (!claim) throw new Error('Claim unavailable');
      const evidence: Evidence[]=[];const sources=new Map<string,Source>();
      for (const eid of claim.evidenceIds) {
        const e=await this.payload<Evidence>(c,'evidence','evidence_id',eid);if(!e)throw new Error('Claim evidence unavailable');evidence.push(e);
        const s=await this.payload<Source>(c,'sources','source_id',e.sourceId);if(!s)throw new Error('Claim source unavailable');sources.set(s.sourceId,s);
      }
      const result=promoteClaim(claim,{...context,evidence,sources:[...sources.values()]},eventId);
      await this.insertEvent(c,{record:{...result.event},sequence});
      await c.query('UPDATE claims SET status=$3,promoted_by=$4,promotion_event_id=$5,payload=$6 WHERE project_id=$1 AND claim_id=$2',[this.scope.projectId,id,result.claim.status,result.claim.approvedBy,result.claim.promotionEventId,canonicalJson(result.claim)]);
      return result.claim;
    });
  }
  supersedeClaim(id: string,input: Claim) {
    const successor=createClaim(input as Parameters<typeof createClaim>[0]);
    return this.scoped(async c=>{
      const old=await this.payload<Claim>(c,'claims','claim_id',id,true);if(!old)throw new Error('Claim unavailable');
      const result=supersedeClaim(old,successor);await this.insertClaim(c,result.successor);
      await c.query('UPDATE claims SET status=$3,superseded_by_claim_id=$4,payload=$5 WHERE project_id=$1 AND claim_id=$2',[this.scope.projectId,id,result.previous.status,result.previous.supersededByClaimId,canonicalJson(result.previous)]);
    });
  }
}
