import type { JsonValue } from '../persistence/contracts';
import type { ReasoningExecutionParams, ReasoningExecutionResult } from '../reasoningProvider';
import type { RealityClass } from '../../src/types/hermes';
import { QuotaIntegrityEngine } from '../quotaIntegrityEngine';
import { ReasoningGatingEngine } from '../reasoningGatingEngine';
import type { AiCapability, AiPrivacy, AiRisk } from './capabilities';
import type { AiRequest, AiRoutingPolicy } from './provider';
import { CapabilityRouter } from './capabilityRouter';
import { ProviderRegistry } from './providerRegistry';
import { GeminiProviderAdapter } from './providers/geminiAdapter';
import { SimulationProviderAdapter } from './providers/simulationAdapter';

export interface ScenarioAiOptions {capability?:AiCapability;localOnly?:boolean;privacy?:AiPrivacy;risk?:AiRisk;projectId?:string;projectRevisionId?:string;subjectEntityId?:string;realityClass?:RealityClass;}
export class ScenarioAiRuntime {
  /** Optional dependencies are installed by a trusted server/test composition root, not request JSON. */
  constructor(private router?:CapabilityRouter,private policy?:AiRoutingPolicy) {}
  async execute(params:ReasoningExecutionParams,options:ScenarioAiOptions={}) {
    const {agentRole,scenario,retrievedChunks,knowledgePack}=params;
    const request:AiRequest={requestId:scenario.scenarioId,roleId:agentRole.roleId,capability:options.capability??'reasoning.standard',projectId:options.projectId,projectRevisionId:options.projectRevisionId,privacy:options.privacy??'PROJECT_PRIVATE',localOnly:options.localOnly,risk:options.risk==='DIRECT_ACTUATION'?'DIRECT_ACTUATION':scenario.difficulty==='HARD_BOUNDARY'?'PROFESSIONAL_APPROVAL':options.risk??'GENERAL',input:{role:agentRole.roleId,discipline:agentRole.discipline,task:scenario.scenarioTitle,inputs:scenario.inputs,constraints:scenario.constraints,context:retrievedChunks.map(c=>({chunkId:c.chunkId,sourceId:c.sourceId,text:c.rawText}))} as JsonValue,promptVersion:'HERMES-REASONING-1',taskVersion:scenario.version,schemaVersion:'SCENARIO-1',outputSchema:scenario.expectedOutputSchema,evidenceIds:scenario.availableEvidence,sourceIds:[...new Set(retrievedChunks.map(c=>c.sourceId))],chunkIds:retrievedChunks.map(c=>c.chunkId),structuredOutput:true,reasoningContext:{agentRole,scenario:{...scenario,hiddenValidationRules:{}},knowledgePack,retrievedChunks}};
    let router=this.router;
    if(!router||params.forceSimulationMode) {
      const registry=new ProviderRegistry();
      if(!params.forceSimulationMode)registry.register(new GeminiProviderAdapter(QuotaIntegrityEngine.isMockQuotaExhausted()));
      // Simulation is explicit continuity, not a local-model substitute for a privacy request.
      if((params.forceSimulationMode||params.allowSimulationFallback)&&!request.localOnly&&request.privacy!=='LOCAL_ONLY'&&request.capability==='reasoning.standard')registry.register(new SimulationProviderAdapter());
      router=new CapabilityRouter(registry);
    }
    const gate=ReasoningGatingEngine.routingConstraints();
    const policy=this.policy??{version:'FND05-OWNER-DEFERRED-1',allowModelExecution:gate.modelExecutionAllowed,allowRemote:true,allowPaidExecution:false,fallback:'ELIGIBLE',maxAttempts:4,capabilityTools:[],roleTools:[],projectTools:[]} satisfies AiRoutingPolicy;
    const result=await router.execute(request,policy);
    let reasoning=result.legacy;
    if(!reasoning) {
      const executed=result.run?.executionStatus==='SUCCEEDED'||result.run?.executionStatus==='SIMULATED';
      reasoning={rawResponse:executed?JSON.stringify(result.output):`[${result.status}] Reasoning did not execute under the current capability policy.`,structuredProposal:(result.output??{}) as Record<string,unknown>,citations:[],providerName:result.run?.providerId??'None',modelName:result.run?.modelId??'None',executionMode:result.run?.executionStatus==='SIMULATED'?'DETERMINISTIC_SIMULATION':result.run?.executionStatus==='SUCCEEDED'?'LLM_REASONED':result.status==='RATE_LIMITED_DEFERRED'?'DEFERRED_QUOTA':result.status==='FAILED'?'FAILED_PROVIDER':'EXECUTION_DEFERRED_NO_PROVIDER',responseStatus:result.status,executed,promptHash:result.run?.promptHash??'',usageMetadata:result.run?.usage,usageSource:result.run?.usage.source} as ReasoningExecutionResult;
    }
    // A test double's claimed legacy mode can never earn genuine-model competency credit.
    if(result.run?.executionStatus==='SIMULATED')reasoning={...reasoning,executionMode:'DETERMINISTIC_SIMULATION'};
    if(result.status==='RATE_LIMITED_DEFERRED')QuotaIntegrityEngine.enqueueDeferredJob({agentRoleId:agentRole.roleId,scenarioId:scenario.scenarioId,knowledgePackId:knowledgePack.packId,retrievedChunkIds:request.chunkIds,discipline:agentRole.discipline,lastErrorReason:'Capability providers exhausted or unavailable; explicit deferred reasoning'});
    return {reasoning,run:result.run,status:result.status};
  }
}
