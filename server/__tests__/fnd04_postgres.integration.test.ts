import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import pg from 'pg';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { randomBytes } from 'node:crypto';
import { migrateFoundation } from '../persistence/migrate';
import { PostgresFoundationRepository } from '../persistence/PostgresFoundationRepository';
import { PostgresModelImportRepository } from '../persistence/PostgresModelImportRepository';
import { ModelImportService, type IfcImportRequest } from '../bim/modelImportService';
import { WebIfcServerNormalizer } from '../bim/WebIfcServerNormalizer';
import { LocalArtifactStore } from '../storage/LocalArtifactStore';
import type { SourceModelRevision } from '../bim/IfcNormalizer';

const connectionString=process.env.HERMES_TEST_DATABASE_URL;
if(!connectionString)console.info('FND-04 PostgreSQL/PostGIS: NOT RUN — DATABASE UNAVAILABLE');
describe.skipIf(!connectionString)('FND-04 actual PostgreSQL/PostGIS import transactions — explicit test DB only',()=>{
  const schema='hermes_fnd04_'+randomBytes(8).toString('hex'),at='2026-09-30T00:00:00Z';
  let admin:pg.Pool;let pool:pg.Pool;let created=false;let directory:string;let repo:PostgresModelImportRepository;let foundation:PostgresFoundationRepository;let service:ModelImportService;
  let first:SourceModelRevision;let second:SourceModelRevision;
  const input=async(rev:'a'|'b'):Promise<IfcImportRequest>=>({bytes:await fs.readFile(path.resolve(`server/__tests__/fixtures/openbim/owned-rev-${rev}.ifc`)),model:{projectId:'P',sourceModelId:'MODEL',name:'Owned synthetic IFC'},projectRevisionId:'R1',realityClass:'REGRESSION_FIXTURE',source:{sourceId:'SOURCE',projectId:'P',sourceType:'IFC',title:'Synthetic IFC',authorityClass:'SIMULATION_FIXTURE',rightsClassification:'CACHE_ALLOWED',licenseStatus:'PERMITTED_OPEN',storagePolicy:{bulkIngestionPermitted:true,fullTextStoragePermitted:true,chunkingPermitted:true}}});
  beforeAll(async()=>{
    admin=new pg.Pool({connectionString});await admin.query('SELECT PostGIS_Lib_Version()');await admin.query(`CREATE SCHEMA ${schema}`);created=true;
    pool=new pg.Pool({connectionString,options:`-c search_path=${schema},public`,max:5});await migrateFoundation(pool);
    foundation=new PostgresFoundationRepository(pool,{organizationId:'FND04-TEST',projectId:'P'});
    await foundation.createGenesis({projectId:'P',organizationId:'FND04-TEST',name:'Synthetic',status:'SIMULATION',currentRevisionId:'R1',createdAt:at,updatedAt:at},{projectId:'P',revisionId:'R1',revisionIndex:0,recordedAt:at},{frame:{frameId:'SITE',projectId:'P',kind:'SITE_LOCAL'},revisionId:'R1',unit:'METER'},{sequence:0,record:{eventId:'GENESIS',projectId:'P',timestamp:at,eventType:'GENESIS'}});
    directory=await fs.mkdtemp(path.join(os.tmpdir(),'hermes-fnd04-pg-'));repo=new PostgresModelImportRepository(foundation);service=new ModelImportService(new LocalArtifactStore(directory),new WebIfcServerNormalizer(),repo);
  });
  afterAll(async()=>{await pool?.end();if(created)await admin.query(`DROP SCHEMA ${schema} CASCADE`);await admin?.end();if(directory)await fs.rm(directory,{recursive:true,force:true});});
  it('PERSIST-01 persists parsed source/artifact/evidence, canonical identities, source quantity claims and import event together',async()=>{
    first=(await service.import(await input('a'))).revision;expect(first.status).toBe('IMPORTED');expect(await repo.get(first.revisionId)).toEqual(JSON.parse(JSON.stringify(first)));
    expect((await pool.query('SELECT count(*)::int AS n FROM model_entity_mappings WHERE revision_id=$1',[first.revisionId])).rows[0].n).toBe(7);
    const wall=first.mappings!.find(m=>m.expressId===24)!;expect((await foundation.getEntity(wall.entityId))?.externalIds[0].sourceId).toBe('MODEL');
    const claims=await foundation.claimsBySubject(wall.entityId);expect(claims[0].derivationMethod).toBe('IMPORTED');expect(claims[0].status).toBe('PROPOSED');expect(claims[0].realityClass).toBe('REGRESSION_FIXTURE');
    expect((await foundation.getEvent(`${first.revisionId}:COMPLETE`))?.record.eventType).toBe('MODEL_IMPORTED');
  });
  it('retains immutable prior revisions, entity history and source removals on reimport',async()=>{
    second=(await service.import(await input('b'))).revision;expect(second.status).toBe('IMPORTED');expect(second.priorRevisionId).toBe(first.revisionId);
    const removed=first.mappings!.find(m=>m.expressId===28)!;expect((await foundation.getEntity(removed.entityId))?.lifecycleState).toBe('REMOVED_FROM_SOURCE');
    expect(await repo.get(first.revisionId)).toEqual(JSON.parse(JSON.stringify(first)));
    await expect(pool.query('UPDATE source_model_revisions SET payload=$1 WHERE revision_id=$2',['{}',first.revisionId])).rejects.toThrow(/immutable/);
  });
  it('a mid-promotion SQL failure rolls back ALL entities, mappings, claims and events; source remains failed and auditable',async()=>{
    const entityCount=(await pool.query('SELECT count(*)::int n FROM entity_revisions')).rows[0].n;
    await pool.query("CREATE FUNCTION fnd04_test_reject_diff() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'test-only rejection after entity writes'; END; $$");
    await pool.query('CREATE TRIGGER fnd04_test_reject BEFORE INSERT ON model_diffs FOR EACH ROW EXECUTE FUNCTION fnd04_test_reject_diff()');
    try {
      const failed=(await service.import(await input('a'))).revision;expect(failed.status).toBe('FAILED');expect(failed.report?.committedEntityCount).toBe(0);
      expect((await pool.query('SELECT count(*)::int n FROM entity_revisions')).rows[0].n).toBe(entityCount);
      expect((await pool.query('SELECT count(*)::int n FROM model_entity_mappings WHERE revision_id=$1',[failed.revisionId])).rows[0].n).toBe(0);
      expect(await foundation.getEvent(`${failed.revisionId}:COMPLETE`)).toBeNull();expect((await repo.latest('MODEL'))?.revisionId).toBe(second.revisionId);
      expect(await foundation.getArtifact(failed.sourceArtifact.artifactId)).not.toBeNull();expect((await repo.get(failed.revisionId))?.status).toBe('FAILED');
    } finally {await pool.query('DROP TRIGGER fnd04_test_reject ON model_diffs');}
  });
  it('foreign organization cannot read or promote this project source models',async()=>{
    const foreign=new PostgresModelImportRepository(new PostgresFoundationRepository(pool,{organizationId:'FOREIGN',projectId:'P'}));await expect(foreign.latest('MODEL')).rejects.toThrow(/scope/);await expect(foreign.get(first.revisionId)).rejects.toThrow(/scope/);
  });
});
