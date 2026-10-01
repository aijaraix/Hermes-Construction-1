import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import pg from 'pg';
import { randomBytes } from 'node:crypto';
import { migrateFoundation } from '../persistence/migrate';
import { PostgresFoundationRepository } from '../persistence/PostgresFoundationRepository';
import { PostgresAiRunRepository } from '../persistence/PostgresAiRunRepository';
import { aiRunToClaim, type AiRun } from '../ai/aiRun';
import { hashContent } from '../persistence/integrity';

const connectionString=process.env.HERMES_TEST_DATABASE_URL;
if(!connectionString)console.info('FND-05 PostgreSQL/PostGIS: NOT RUN — DATABASE UNAVAILABLE');
describe.skipIf(!connectionString)('FND-05 real PostgreSQL AI audit ledger — explicit test DB only',()=>{
  const schema='hermes_fnd05_'+randomBytes(8).toString('hex'),at='2026-09-30T00:00:00Z';let admin:pg.Pool;let pool:pg.Pool;let created=false;let foundation:PostgresFoundationRepository;let ledger:PostgresAiRunRepository;
  // MODEL/SUCCEEDED labels are synthetic inputs exercising storage/policy, never live-provider evidence.
  const run:AiRun={runId:'SYNTHETIC-RUN',requestId:'SYNTHETIC-REQUEST',projectId:'P',projectRevisionId:'R1',roleId:'TEST',capability:'reasoning.standard',tier:'TIER_1_LOCAL_SMALL',providerId:'SYNTHETIC',modelId:'SYNTHETIC',adapterId:'TEST',adapterVersion:'1',locality:'LOCAL',executionKind:'MODEL',executionStatus:'SUCCEEDED',privacy:'LOCAL_ONLY',localOnly:true,inputEvidenceIds:[],inputSourceIds:[],inputChunkIds:['TEST-CHUNK-REFERENCE'],taskHash:hashContent('task'),promptHash:hashContent('prompt'),schemaHash:hashContent({}),taskVersion:'1',promptVersion:'1',schemaVersion:'1',toolCalls:[{toolCallId:'TEST-TOOL',runId:'SYNTHETIC-RUN',toolName:'unit.convert',permissionScope:'unit:convert',inputHash:hashContent({feet:1}),startedAt:at,completedAt:at,status:'SUCCEEDED',outputEvidenceIds:[],outputArtifactIds:[]}],outputClaimIds:['SYNTHETIC-RUN:PROPOSAL'],outputArtifactIds:[],output:{metres:0.3048},startedAt:at,completedAt:at,usage:{source:'UNKNOWN'},policyVersion:'TEST',policyDecision:'ALLOWED_AS_PROPOSAL',fallbackPath:[],validation:{status:'NOT_RUN'},approvalStatus:'PROPOSAL_ONLY'};
  beforeAll(async()=>{
    admin=new pg.Pool({connectionString});await admin.query('SELECT PostGIS_Lib_Version()');await admin.query(`CREATE SCHEMA ${schema}`);created=true;
    pool=new pg.Pool({connectionString,options:`-c search_path=${schema},public`,max:5});await migrateFoundation(pool);
    foundation=new PostgresFoundationRepository(pool,{organizationId:'FND05-TEST',projectId:'P'});
    await foundation.createGenesis({projectId:'P',organizationId:'FND05-TEST',name:'Synthetic fixture',status:'SIMULATION',currentRevisionId:'R1',createdAt:at,updatedAt:at},{projectId:'P',revisionId:'R1',revisionIndex:0,recordedAt:at},{frame:{frameId:'SITE',projectId:'P',kind:'SITE_LOCAL'},revisionId:'R1',unit:'METER'},{sequence:0,record:{eventId:'GENESIS',projectId:'P',timestamp:at,eventType:'GENESIS'}});
    ledger=new PostgresAiRunRepository(foundation);
  });
  afterAll(async()=>{await pool?.end();if(created)await admin.query(`DROP SCHEMA ${schema} CASCADE`);await admin?.end();});
  it('PERSIST-01 run, tool call, refs, proposed claim and event persist atomically and exact retry is idempotent',async()=>{
    const claim=aiRunToClaim(run,'P','REGRESSION_FIXTURE');expect(await ledger.append(run,[claim])).toBe('APPENDED');expect(await ledger.append(run,[claim])).toBe('IDEMPOTENT');expect(await ledger.get(run.runId)).toEqual(run);
    expect((await foundation.getClaim(claim.claimId))?.status).toBe('PROPOSED');expect((await pool.query('SELECT count(*)::int n FROM ai_tool_calls')).rows[0].n).toBe(1);expect((await pool.query('SELECT count(*)::int n FROM ai_run_output_refs')).rows[0].n).toBe(1);
    expect((await foundation.getEvent(`${run.runId}:RECORDED`))?.record.eventType).toBe('AI_RUN_RECORDED');
    await expect(ledger.append({...run,output:{metres:999}},[claim])).rejects.toThrow(/Immutable/);
    await expect(pool.query('DELETE FROM ai_runs WHERE run_id=$1',[run.runId])).rejects.toThrow(/immutable/);
  });
  it('missing referenced evidence rolls back run and event; no duplicate evidence ownership',async()=>{
    const bad={...run,runId:'BAD',toolCalls:[],outputClaimIds:[],inputEvidenceIds:['MISSING']};
    await expect(ledger.append(bad)).rejects.toThrow();expect(await ledger.get('BAD')).toBeNull();expect(await foundation.getEvent('BAD:RECORDED')).toBeNull();
    expect((await pool.query('SELECT count(*)::int n FROM evidence')).rows[0].n).toBe(0);
  });
  it('organization scope and promotion authority cannot be bypassed through audit persistence',async()=>{
    const foreign=new PostgresAiRunRepository(new PostgresFoundationRepository(pool,{organizationId:'FOREIGN',projectId:'P'}));await expect(foreign.get(run.runId)).rejects.toThrow(/scope/);
    await expect(ledger.append({...run,approvalStatus:'VERIFIED' as any})).rejects.toThrow(/authority/);
    await expect(ledger.append({...run,runId:'BAD-CLAIM'},[{...aiRunToClaim(run,'P','REGRESSION_FIXTURE'),status:'VERIFIED'}])).rejects.toThrow(/PROPOSED/);
  });
});
