import type { Claim, RealityClass, ValidationResult } from '../../src/types/hermes';
import { createClaim } from '../../src/lib/projectEvidence';
import type { JsonValue } from '../persistence/contracts';
import { hashContent } from '../persistence/integrity';
import type { AiCapability, AiPolicyDecision, AiPrivacy, AiTier } from './capabilities';
import type { AiUsage } from './provider';

export interface AiToolCall { toolCallId:string;runId:string;toolName:string;permissionScope:string;inputHash:string;startedAt:string;completedAt:string;status:'SUCCEEDED'|'DENIED'|'FAILED';outputEvidenceIds:string[];outputArtifactIds:string[];failureCode?:string; }
export interface AiRun {
  runId:string;requestId:string;projectId?:string;projectRevisionId?:string;roleId:string;capability:AiCapability;tier?:AiTier;
  providerId?:string;modelId?:string;modelVersion?:string;adapterId?:string;adapterVersion?:string;locality?:'LOCAL'|'REMOTE';
  executionKind:'MODEL'|'SIMULATOR'|'TEST_DOUBLE'|'NOT_EXECUTED';executionStatus:'SUCCEEDED'|'SIMULATED'|'FAILED'|'DEFERRED'|'DENIED'|'UNAVAILABLE';
  privacy:AiPrivacy;localOnly:boolean;inputEvidenceIds:string[];inputSourceIds:string[];inputChunkIds:string[];
  taskHash:string;promptHash:string;schemaHash:string;taskVersion:string;promptVersion:string;schemaVersion:string;
  toolCalls:AiToolCall[];outputClaimIds:string[];outputArtifactIds:string[];output?:JsonValue;
  startedAt:string;completedAt:string;usage:AiUsage;policyVersion:string;policyDecision:AiPolicyDecision;
  fallbackPath:Array<{providerId:string;modelId:string;status:string;usage:AiUsage}>;
  validation:{status:'NOT_RUN'|'PASSED'|'FAILED';resultRef?:string};approvalStatus:'PROPOSAL_ONLY'|'HUMAN_REVIEW_REQUIRED'|'PROFESSIONAL_REVIEW_REQUIRED'|'DENIED';failureCode?:string;
}
/** Canonical run stores allowed final output, never hidden scratchpad or unrestricted secrets. */
export function assertPermittedAiOutput(value:unknown):asserts value is JsonValue {
  const inspect=(v:unknown,depth=0)=>{
    if(depth>32)throw new Error('AI_OUTPUT_DEPTH_LIMIT');
    if(v&&typeof v==='object')for(const [key,child] of Object.entries(v)) {
      const normalized=key.toLowerCase().replace(/[^a-z0-9]/g,'');
      if(['chainofthought','scratchpad','reasoningtokens','apikey','authorization','credentials','password','accesstoken','secret','systemprompt'].includes(normalized))throw new Error('AI_OUTPUT_FORBIDDEN_FIELD');
      inspect(child,depth+1);
    }
  };
  inspect(value);hashContent(value);
  if(Buffer.byteLength(JSON.stringify(value))>2*1024*1024)throw new Error('AI_OUTPUT_SIZE_LIMIT');
}
export function attachAiValidation(run:AiRun,validation:ValidationResult):AiRun {
  return {...run,validation:{status:validation.passed&&!validation.criticalFailure?'PASSED':'FAILED',resultRef:validation.validationId}};
}
/** Does not promote. Only an executed model proposal with explicit project context creates a claim. */
export function aiRunToClaim(run:AiRun,subjectEntityId:string,realityClass:RealityClass):Claim {
  if(run.executionKind!=='MODEL'||run.executionStatus!=='SUCCEEDED'||!run.projectId||!run.projectRevisionId||run.output===undefined||run.policyDecision==='DENIED')throw new Error('Executed model proposal and explicit project context required');
  assertPermittedAiOutput(run.output);
  return createClaim({claimId:`${run.runId}:PROPOSAL`,projectId:run.projectId,projectRevisionId:run.projectRevisionId,subjectEntityId,domain:'GENERAL',predicate:'ai.structuredProposal',value:run.output,evidenceIds:[...run.inputEvidenceIds],recordedAt:run.completedAt,derivationMethod:'MODEL_INFERENCE',sourceAuthorityClass:'HERMES_INTERNAL',realityClass,status:'PROPOSED',softwareOrModelVersion:`${run.providerId}/${run.modelId}/${run.adapterVersion}`});
}
