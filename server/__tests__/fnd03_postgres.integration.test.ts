import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import pg from 'pg';
import { randomBytes } from 'node:crypto';
import { migrateFoundation } from '../persistence/migrate';
import { PostgresFoundationRepository } from '../persistence/PostgresFoundationRepository';
import { postgresHealth } from '../persistence/postgres';
import type { ArtifactMetadata, EventAppend, FoundationProject } from '../persistence/contracts';
import type { Claim, ConstructionEntity, Evidence, Source } from '../../src/types/hermes';

const connectionString=process.env.HERMES_TEST_DATABASE_URL;
if(!connectionString)console.info('FND-03 PostgreSQL/PostGIS: NOT RUN — DATABASE UNAVAILABLE');
describe.skipIf(!connectionString)('FND-03 actual PostgreSQL/PostGIS — explicit test DB only',()=>{
  const schema='hermes_fnd03_'+randomBytes(8).toString('hex');
  const at='2026-09-30T12:00:00.000Z';let admin:pg.Pool;let pool:pg.Pool;let repo:PostgresFoundationRepository;let created=false;
  const event=(id:string,sequence:number):EventAppend=>({sequence,record:{eventId:id,projectId:'P',projectRevisionId:'R1',timestamp:at,eventType:'TEST_EVIDENCE'}});
  const project:FoundationProject={projectId:'P',organizationId:'ORG-HERMES-ACADEMY',name:'Explicit synthetic fixture',status:'SIMULATION',currentRevisionId:'R1',createdAt:at,updatedAt:at};
  const entity:ConstructionEntity={projectId:'P',entityId:'ENTITY',entityClass:'component',currentRevisionId:'ER1',externalIds:[{system:'IFC',sourceId:'MODEL',externalId:'0a12345678901234567890A'}]};
  const source:Source={sourceId:'SOURCE',projectId:'P',sourceType:'signed record',title:'Synthetic test lab report',authorityClass:'LAB_TEST',rightsClassification:'CACHE_ALLOWED',licenseStatus:'PERMITTED_OPEN',storagePolicy:{bulkIngestionPermitted:true,fullTextStoragePermitted:true,chunkingPermitted:true}};
  const evidence:Evidence={evidenceId:'EVIDENCE',projectId:'P',sourceId:'SOURCE',projectRevisionId:'R1',relatedEntityIds:['ENTITY'],recordedAt:at,realityClass:'LIVE',contentKind:'CONTENT',rightsClassification:'CACHE_ALLOWED',artifactHash:'a'.repeat(64),artifactUri:'test://explicit-synthetic-fixture',supports:[{predicate:'geotech.bearing',value:100,units:'kPa'}]};
  const claim:Claim={claimId:'CLAIM',projectId:'P',projectRevisionId:'R1',subjectEntityId:'ENTITY',predicate:'geotech.bearing',domain:'GEOTECH',value:100,units:'kPa',evidenceIds:['EVIDENCE'],recordedAt:at,derivationMethod:'DIRECT_SOURCE',sourceAuthorityClass:'LAB_TEST',realityClass:'LIVE',status:'PROPOSED'};
  // These LIVE-labelled records are synthetic inputs testing policy behavior, never live evidence.
  beforeAll(async()=>{
    admin=new pg.Pool({connectionString});
    // Require PostGIS already present, so cleanup cannot accidentally drop a newly installed extension.
    await admin.query('SELECT PostGIS_Lib_Version()');
    await admin.query(`CREATE SCHEMA ${schema}`);created=true;
    pool=new pg.Pool({connectionString,options:`-c search_path=${schema},public`,max:5});
    await migrateFoundation(pool);
    repo=new PostgresFoundationRepository(pool,{organizationId:project.organizationId,projectId:'P'});
    await repo.createGenesis(project,{revisionId:'R1',projectId:'P',revisionIndex:0,recordedAt:at},{frame:{frameId:'SITE',projectId:'P',kind:'SITE_LOCAL'},revisionId:'R1',unit:'METER'},event('GENESIS',0));
  });
  afterAll(async()=>{await pool?.end();if(created)await admin.query(`DROP SCHEMA ${schema} CASCADE`);await admin?.end();});
  it('PG-01/02 migrations apply once with checksums and real PostGIS is available',async()=>{
    expect(await migrateFoundation(pool)).toEqual([]);expect((await postgresHealth(pool)).available).toBe(true);
    expect((await pool.query('SELECT name FROM schema_migrations ORDER BY name')).rows.map(r=>r.name)).toEqual(['0001_foundation.sql','0002_openbim.sql','0003_ai_runs.sql']);
  });
  it('PG-03 genesis persists atomically and local frame has no geodetic point',async()=>{
    expect(await repo.getProject()).toEqual(project);expect((await repo.getProjectRevision('R1'))?.revisionIndex).toBe(0);
    expect((await pool.query('SELECT crs,geodetic_origin FROM spatial_frames WHERE project_id=$1',['P'])).rows[0]).toEqual({crs:null,geodetic_origin:null});
    const bad=new PostgresFoundationRepository(pool,{organizationId:project.organizationId,projectId:'BAD'});
    await expect(bad.createGenesis({...project,projectId:'BAD'},{revisionId:'R1',projectId:'BAD',revisionIndex:0,recordedAt:at},{frame:{frameId:'SITE',projectId:'BAD',kind:'SITE_LOCAL'},revisionId:'MISSING',unit:'METER'},{...event('BAD',0),record:{...event('BAD',0).record,projectId:'BAD'}})).rejects.toThrow();
    expect(await bad.getProject()).toBeNull();
  });
  it('PG-04 entity/revision/external identity round trip and immutable history',async()=>{
    await repo.appendEntityRevision(entity,{revisionId:'ER1',entityId:'ENTITY',projectRevisionId:'R1',revisionIndex:0,recordedAt:at},{height:3});
    await repo.appendEntityRevision({...entity,currentRevisionId:'ER2',name:'Revised'},{revisionId:'ER2',entityId:'ENTITY',projectRevisionId:'R1',revisionIndex:1,supersedesRevisionId:'ER1',recordedAt:at},{height:4});
    expect((await repo.getEntity('ENTITY'))?.currentRevisionId).toBe('ER2');expect((await repo.getEntityRevisions('ENTITY')).map(r=>r.payload)).toEqual([{height:3},{height:4}]);
    await expect(pool.query('UPDATE entity_revisions SET payload=$1 WHERE project_id=$2',['{}','P'])).rejects.toThrow(/immutable/);
  });
  it('PG-05/08 source/evidence/claim and artifact metadata round trip without bytes',async()=>{
    await repo.createSource(source);
    const metadata:ArtifactMetadata={artifactId:'ART',projectId:'P',sourceId:'SOURCE',evidenceId:'EVIDENCE',projectRevisionId:'R1',objectKey:'explicit-fixture-key',uri:evidence.artifactUri!,sha256:evidence.artifactHash!,sizeBytes:30,mimeType:'text/plain',artifactClass:'EVIDENCE',rightsClassification:'CACHE_ALLOWED',immutable:true,createdAt:at};
    await repo.createEvidence(evidence,metadata);await repo.createClaim(claim);
    expect(await repo.getSource('SOURCE')).toEqual(source);expect(await repo.getEvidence('EVIDENCE')).toEqual(evidence);expect(await repo.getClaim('CLAIM')).toEqual(claim);expect(await repo.getArtifact('ART')).toEqual(metadata);
    expect((await pool.query("SELECT column_name FROM information_schema.columns WHERE table_schema=$1 AND table_name='artifacts' AND data_type='bytea'",[schema])).rowCount).toBe(0);
  });
  it('PG-06/07 concurrent event retries agree and modified content/sequence cannot replace history',async()=>{
    const input=event('RACE',100);const results=await Promise.all([repo.appendEvent(input),repo.appendEvent(input)]);expect(results.sort()).toEqual(['APPENDED','IDEMPOTENT']);
    await expect(repo.appendEvent({...input,record:{...input.record,eventType:'CHANGED'}})).rejects.toThrow(/different/);
    await expect(repo.appendEvent(event('OTHER',100))).rejects.toThrow(/sequence/);
    await expect(pool.query('DELETE FROM events WHERE project_id=$1 AND event_id=$2',['P','RACE'])).rejects.toThrow(/immutable/);
    expect((await repo.getEvent('RACE'))?.record.eventType).toBe('TEST_EVIDENCE');
  });
  it('claim promotion plus event rolls back on conflict and commits only together',async()=>{
    const context={at,reviewerId:'explicit-test-reviewer',reason:'Synthetic policy fixture'};
    await expect(repo.promoteClaim('CLAIM',context,'FAILED_PROMOTION',0)).rejects.toThrow();
    expect((await repo.getClaim('CLAIM'))?.status).toBe('PROPOSED');expect(await repo.getEvent('FAILED_PROMOTION')).toBeNull();
    expect((await repo.promoteClaim('CLAIM',context,'PROMOTION',200)).status).toBe('VERIFIED');expect((await repo.getEvent('PROMOTION'))?.record.eventType).toBe('CLAIM_PROMOTED');
    await expect(repo.createClaim({...claim,claimId:'BYPASS',status:'VERIFIED'})).rejects.toThrow(/promotion/);
  });
  it('PG-09 scoped APIs never read or mutate another organization/project',async()=>{
    const foreign=new PostgresFoundationRepository(pool,{organizationId:'FOREIGN',projectId:'P'});expect(await foreign.getProject()).toBeNull();
    await expect(foreign.getEntity('ENTITY')).rejects.toThrow(/scope/);
    await expect(repo.createSource({...source,sourceId:'FOREIGN',projectId:'OTHER'})).rejects.toThrow(/scope/);
  });
});
