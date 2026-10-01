import type { Claim } from '../../src/types/hermes';
import { assertPermittedAiOutput, type AiRun } from '../ai/aiRun';
import { PostgresFoundationRepository } from './PostgresFoundationRepository';
import { canonicalJson, hashContent, PersistenceConflict, ScopeViolation } from './integrity';

/** Explicit project-scoped persistence. Academy-only runs remain in their existing legacy context. */
export class PostgresAiRunRepository {
  constructor(private foundation:PostgresFoundationRepository) {}
  async append(run:AiRun,proposedClaims:Claim[]=[]):Promise<'APPENDED'|'IDEMPOTENT'> {
    if(run.projectId!==this.foundation.scope.projectId||!run.projectRevisionId)throw new ScopeViolation();
    if(!['PROPOSAL_ONLY','HUMAN_REVIEW_REQUIRED','PROFESSIONAL_REVIEW_REQUIRED','DENIED'].includes(run.approvalStatus)||run.toolCalls.some(t=>t.runId!==run.runId))throw new Error('Invalid AI audit authority or tool linkage');
    if(!run.runId||!run.taskHash||!run.promptHash||!run.schemaHash||!Number.isFinite(Date.parse(run.completedAt)))throw new Error('AI audit provenance incomplete');
    assertPermittedAiOutput(run);const hash=hashContent({run,proposedClaims});
    if(proposedClaims.length&&(run.executionKind!=='MODEL'||run.executionStatus!=='SUCCEEDED'))throw new Error('Only executed model runs can attach inference proposals');
    for(const claim of proposedClaims)if(claim.projectId!==run.projectId||claim.projectRevisionId!==run.projectRevisionId||claim.derivationMethod!=='MODEL_INFERENCE'||claim.status!=='PROPOSED'||!run.outputClaimIds.includes(claim.claimId))throw new Error('AI ledger accepts only linked MODEL_INFERENCE PROPOSED claims');
    return this.foundation.withProjectTransaction(async(f,c)=>{
      await c.query('SELECT project_id FROM projects WHERE project_id=$1 FOR UPDATE',[run.projectId]);
      const existing=await c.query('SELECT content_hash FROM ai_runs WHERE project_id=$1 AND run_id=$2',[run.projectId,run.runId]);
      if(existing.rowCount){if(existing.rows[0].content_hash!==hash)throw new PersistenceConflict('Immutable AI run content mismatch');return 'IDEMPOTENT';}
      for(const claim of proposedClaims)await f.createClaim(claim);
      const eventId=`${run.runId}:RECORDED`;
      await f.appendEvent({sequence:0,record:{eventId,attemptId:run.runId,projectId:run.projectId,projectRevisionId:run.projectRevisionId,timestamp:run.completedAt,eventType:'AI_RUN_RECORDED',runId:run.runId,executionStatus:run.executionStatus,approvalStatus:run.approvalStatus}});
      await c.query('INSERT INTO ai_runs(project_id,run_id,project_revision_id,event_id,capability,execution_status,content_hash,payload) VALUES($1,$2,$3,$4,$5,$6,$7,$8)',[run.projectId,run.runId,run.projectRevisionId,eventId,run.capability,run.executionStatus,hash,canonicalJson(run)]);
      for(const call of run.toolCalls)await c.query('INSERT INTO ai_tool_calls(project_id,tool_call_id,run_id,payload) VALUES($1,$2,$3,$4)',[run.projectId,call.toolCallId,run.runId,canonicalJson(call)]);
      for(const [kind,ids,column] of [['evidence',run.inputEvidenceIds,'evidence_id'],['source',run.inputSourceIds,'source_id'],['chunk',run.inputChunkIds,'chunk_ref']] as const)for(const id of new Set(ids))await c.query(`INSERT INTO ai_run_input_refs(project_id,run_id,ref_id,${column}) VALUES($1,$2,$3,$4)`,[run.projectId,run.runId,`${kind}:${id}`,id]);
      const output=async(kind:'claim'|'artifact'|'evidence',id:string,tool?:string)=>{
        const column={claim:'claim_id',artifact:'artifact_id',evidence:'evidence_id'}[kind];
        await c.query(`INSERT INTO ai_run_output_refs(project_id,run_id,ref_id,tool_call_id,${column}) VALUES($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING`,[run.projectId,run.runId,`${tool??'run'}:${kind}:${id}`,tool,id]);
      };
      for(const id of new Set(run.outputClaimIds))await output('claim',id);
      for(const id of new Set(run.outputArtifactIds))await output('artifact',id);
      for(const call of run.toolCalls){for(const id of new Set(call.outputEvidenceIds))await output('evidence',id,call.toolCallId);for(const id of new Set(call.outputArtifactIds))await output('artifact',id,call.toolCallId);}
      return 'APPENDED';
    });
  }
  get(id:string):Promise<AiRun|null> {return this.foundation.withProjectTransaction(async(f,c)=>(await c.query('SELECT payload FROM ai_runs WHERE project_id=$1 AND run_id=$2',[f.scope.projectId,id])).rows[0]?.payload??null);}
}
