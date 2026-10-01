import { randomUUID } from 'node:crypto';
import { hashContent } from '../persistence/integrity';
import type { JsonValue } from '../persistence/contracts';
import { AI_CAPABILITIES } from './capabilities';
import { assertPermittedAiOutput, type AiRun } from './aiRun';
import type { AiProviderOutput, AiRequest, AiRouteResult, AiRoutingPolicy, AiUsage } from './provider';
import { ProviderRegistry } from './providerRegistry';
import { decisionForRequest, permittedTools, validateRoutingPolicy } from './policy';
import { AiToolRegistry } from './toolRegistry';
import { ReasoningBudgetManager } from '../reasoningBudgetManager';

const unknownUsage=():AiUsage=>({source:'UNKNOWN',costSource:'UNKNOWN'});
function usage(input?:AiUsage):AiUsage {
  if(!input)return unknownUsage();
  if(!['PROVIDER_REPORTED','ESTIMATED','UNKNOWN'].includes(input.source))throw new Error('INVALID_USAGE_SOURCE');
  const out:AiUsage={source:input.source,costSource:input.costSource??'UNKNOWN'};
  for(const key of ['inputTokens','outputTokens','totalTokens','costUsd'] as const)if(input[key]!==undefined){if(!Number.isFinite(input[key])||input[key]<0)throw new Error('INVALID_USAGE_VALUE');out[key]=input[key];}
  return out;
}
export class CapabilityRouter {
  constructor(readonly registry:ProviderRegistry,private tools=new AiToolRegistry()) {}
  async execute(request:AiRequest,policy:AiRoutingPolicy,deterministic?:()=>Promise<JsonValue>):Promise<AiRouteResult> {
    validateRoutingPolicy(policy);request=structuredClone(request);policy=structuredClone(policy);
    if(!request.requestId||!request.roleId||!request.taskVersion||!request.promptVersion||!request.schemaVersion)throw new Error('AI request provenance missing');
    assertPermittedAiOutput(request.input);
    const decision=decisionForRequest(request),localOnly=request.localOnly===true||request.privacy==='LOCAL_ONLY'||request.capability==='local.private';
    const startedAt=new Date().toISOString();const taskHash=hashContent({requestId:request.requestId,input:request.input,taskVersion:request.taskVersion});
    if(deterministic&&decision!=='DENIED') {
      const result=await deterministic();assertPermittedAiOutput(result);
      ReasoningBudgetManager.recordDeterministicOperation(request.requestId);
      return {status:'DETERMINISTIC_BYPASS',output:result,deterministic:{executionKind:'DETERMINISTIC',taskHash,result}};
    }
    const run:AiRun={runId:`AI-RUN-${randomUUID()}`,requestId:request.requestId,projectId:request.projectId,projectRevisionId:request.projectRevisionId,roleId:request.roleId,capability:request.capability,executionKind:'NOT_EXECUTED',executionStatus:'UNAVAILABLE',privacy:request.privacy,localOnly,inputEvidenceIds:request.evidenceIds,inputSourceIds:request.sourceIds,inputChunkIds:request.chunkIds,taskHash,promptHash:hashContent({input:request.input,version:request.promptVersion}),schemaHash:hashContent(request.outputSchema),taskVersion:request.taskVersion,promptVersion:request.promptVersion,schemaVersion:request.schemaVersion,toolCalls:[],outputClaimIds:[],outputArtifactIds:[],startedAt,completedAt:startedAt,usage:unknownUsage(),policyVersion:policy.version,policyDecision:decision,fallbackPath:[],validation:{status:'NOT_RUN'},approvalStatus:decision==='DENIED'?'DENIED':decision==='REQUIRES_PROFESSIONAL_REVIEW'?'PROFESSIONAL_REVIEW_REQUIRED':decision==='REQUIRES_HUMAN_REVIEW'?'HUMAN_REVIEW_REQUIRED':'PROPOSAL_ONLY'};
    const done=(status:AiRouteResult['status'],failureCode?:string):AiRouteResult=>{run.completedAt=new Date().toISOString();if(failureCode)run.failureCode=failureCode;return {status,run};};
    if(decision==='DENIED'){run.executionStatus='DENIED';return done('POLICY_DENIED','DIRECT_ACTUATION_PROHIBITED');}
    if(!AI_CAPABILITIES.includes(request.capability))return done('NO_ELIGIBLE_PROVIDER','UNSUPPORTED_CAPABILITY');
    const limit=request.maxLatencyMs??30000;
    if(!Number.isSafeInteger(limit)||limit<=0||limit>120000||request.maxCostUsd!==undefined&&(!Number.isFinite(request.maxCostUsd)||request.maxCostUsd<0))throw new Error('Invalid AI time/cost bounds');
    const allowedTools=permittedTools(policy).filter(t=>(request.requiredTools??[]).includes(t));
    if((request.requiredTools??[]).some(t=>!allowedTools.includes(t)||!this.tools.supports(t,localOnly))){run.executionStatus='DENIED';return done('POLICY_DENIED','REQUIRED_TOOL_DENIED');}
    const candidates=this.registry.adapters().flatMap(adapter=>adapter.descriptor.models.map(model=>({adapter,model}))).filter(({adapter,model})=>{
      const d=adapter.descriptor;
      return model.capabilities.includes(request.capability)&&(!localOnly||d.locality==='LOCAL')&&(policy.allowRemote||d.locality==='LOCAL')&&d.privacy.includes(request.privacy)&&(!policy.allowedProviders||policy.allowedProviders.includes(d.providerId))&&(!request.preferredTier||model.tier===request.preferredTier)&&(!request.structuredOutput||d.structuredOutput)&&(!request.streaming||d.streaming)&&(!(request.requiredTools?.length)||d.tools)&&d.modalities.includes(request.modality??'TEXT')&&(!request.estimatedInputTokens||model.contextTokens!==undefined&&model.contextTokens>=request.estimatedInputTokens)&&(request.maxCostUsd===undefined||model.estimatedCostUsd!==undefined&&model.estimatedCostUsd<=request.maxCostUsd)&&(model.estimatedLatencyMs===undefined||model.estimatedLatencyMs<=limit)&&(d.executionKind!=='MODEL'||policy.allowModelExecution)&&(d.executionKind!=='MODEL'||policy.allowPaidExecution||model.estimatedCostUsd===0);
    }).sort((a,b)=>a.model.priority-b.model.priority||a.adapter.descriptor.providerId.localeCompare(b.adapter.descriptor.providerId)||a.model.modelId.localeCompare(b.model.modelId));
    if(!candidates.length)return done(localOnly?'LOCAL_ONLY_UNAVAILABLE':'NO_ELIGIBLE_PROVIDER','NO_PROVIDER_SATISFIES_POLICY');
    const deadline=Date.now()+limit;let last:AiProviderOutput|undefined;let reservedCost=0;
    for(const {adapter,model} of candidates.slice(0,policy.fallback==='NONE'?1:policy.maxAttempts)) {
      const d=adapter.descriptor;const state=adapter.health();
      if(request.maxCostUsd!==undefined&&reservedCost+(model.estimatedCostUsd??Infinity)>request.maxCostUsd){last={status:'PROVIDER_UNAVAILABLE',failureCode:'TOTAL_BUDGET_EXHAUSTED'};continue;}
      if(state!=='AVAILABLE') {last={status:state==='RATE_LIMITED'?'RATE_LIMITED_DEFERRED':'PROVIDER_UNAVAILABLE'};run.fallbackPath.push({providerId:d.providerId,modelId:model.modelId,status:last.status,usage:unknownUsage()});continue;}
      const controller=new AbortController();let timer:ReturnType<typeof setTimeout>;let active=true;
      const remaining=deadline-Date.now();if(remaining<=0){last={status:'FAILED',failureCode:'TIMEOUT'};break;}
      reservedCost+=model.estimatedCostUsd??0;
      Object.assign(run,{providerId:d.providerId,modelId:model.modelId,modelVersion:model.version,adapterId:d.adapterId,adapterVersion:d.adapterVersion,locality:d.locality,tier:model.tier,executionKind:d.executionKind});
      try {
        const result=await Promise.race([
          adapter.execute(request,model,{signal:controller.signal,callTool:(name,input)=>this.tools.call(name,input,{runId:run.runId,allowedTools,localOnly,signal:controller.signal,record:call=>{if(active)run.toolCalls.push(call);}})}),
          new Promise<never>((_,reject)=>{timer=setTimeout(()=>{controller.abort();reject(new Error('TIMEOUT'));},remaining);})
        ]);
        last=result;const measured=usage(result.usage);
        if(result.status!=='SUCCEEDED'){run.fallbackPath.push({providerId:d.providerId,modelId:model.modelId,status:result.status,usage:measured});continue;}
        if(result.output===undefined)throw new Error('MISSING_STRUCTURED_OUTPUT');assertPermittedAiOutput(result.output);
        run.fallbackPath.push({providerId:d.providerId,modelId:model.modelId,status:result.status,usage:measured});
        Object.assign(run,{providerId:d.providerId,modelId:model.modelId,modelVersion:model.version,adapterId:d.adapterId,adapterVersion:d.adapterVersion,locality:d.locality,tier:model.tier,executionKind:d.executionKind,executionStatus:d.executionKind==='MODEL'?'SUCCEEDED':'SIMULATED',usage:measured,output:structuredClone(result.output),outputArtifactIds:result.artifactIds??[]});
        if(result.promptHash)run.promptHash=result.promptHash;
        const completed=done(run.fallbackPath.length>1?'FALLBACK_SELECTED':'SELECTED');return {...completed,output:run.output,legacy:result.legacy};
      } catch(error) {
        const code=error instanceof Error&&error.message==='TIMEOUT'?'TIMEOUT':'PROVIDER_OR_OUTPUT_REJECTED';last={status:'FAILED',failureCode:code};run.fallbackPath.push({providerId:d.providerId,modelId:model.modelId,status:code,usage:unknownUsage()});
        if(code==='TIMEOUT')break; // No overlapping fallback while a noncooperative adapter may still be running.
      } finally {active=false;clearTimeout(timer);controller.abort();}
    }
    run.executionStatus=last?.status==='RATE_LIMITED_DEFERRED'?'DEFERRED':last?.status==='PROVIDER_UNAVAILABLE'?'UNAVAILABLE':'FAILED';
    return done(last?.status==='RATE_LIMITED_DEFERRED'?'RATE_LIMITED_DEFERRED':last?.status==='PROVIDER_UNAVAILABLE'?'PROVIDER_UNAVAILABLE':'FAILED',last?.failureCode);
  }
}
