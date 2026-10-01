import { GeminiReasoningProvider } from '../../reasoningProvider';
import { QuotaIntegrityEngine } from '../../quotaIntegrityEngine';
import type { AiExecutionContext, AiModelDescriptor, AiProviderAdapter, AiProviderDescriptor, AiProviderOutput, AiRequest } from '../provider';
import { LEGACY_GEMINI_MODELS } from './geminiConfig';

export class GeminiProviderAdapter implements AiProviderAdapter {
  readonly descriptor:AiProviderDescriptor;
  constructor(private controlledQuotaTest=false) {
    this.descriptor={providerId:'GoogleGemini',adapterId:'gemini-reasoning',adapterVersion:'FND05-1',locality:'REMOTE',executionKind:controlledQuotaTest?'TEST_DOUBLE':'MODEL',privacy:['PUBLIC','PROJECT_PRIVATE'],modalities:['TEXT'],structuredOutput:true,tools:false,streaming:false,models:LEGACY_GEMINI_MODELS.map((id,i)=>({modelId:id,capabilities:['reasoning.standard'],tier:'TIER_3_REMOTE_FRONTIER',priority:i}))};
  }
  health(): 'AVAILABLE'|'UNAVAILABLE' {
    if(this.controlledQuotaTest)return QuotaIntegrityEngine.isMockQuotaExhausted()?'AVAILABLE':'UNAVAILABLE';
    const key=process.env.GEMINI_API_KEY;return key&&key!=='MY_GEMINI_API_KEY'&&key.trim()?'AVAILABLE':'UNAVAILABLE';
  }
  async execute(request:Readonly<AiRequest>,model:Readonly<AiModelDescriptor>,context:AiExecutionContext):Promise<AiProviderOutput> {
    if(!request.reasoningContext||this.controlledQuotaTest&&!QuotaIntegrityEngine.isMockQuotaExhausted())return {status:'PROVIDER_UNAVAILABLE'};
    // Exactly one model attempt. The router alone chooses fallback on this path.
    const provider=new GeminiReasoningProvider({modelName:model.modelId,fallbackModels:[],deferOnFailure:false});
    const legacy=await provider.generateReasoning({...request.reasoningContext,allowSimulationFallback:false,forceSimulationMode:false,signal:context.signal});
    const raw=legacy.usageMetadata;
    return {status:legacy.executionMode==='LLM_REASONED'?'SUCCEEDED':legacy.executionMode==='DEFERRED_QUOTA'?'RATE_LIMITED_DEFERRED':legacy.executionMode==='EXECUTION_DEFERRED_NO_PROVIDER'?'PROVIDER_UNAVAILABLE':'FAILED',output:legacy.structuredProposal,citations:legacy.citations,legacy,promptHash:legacy.promptSha256,
      usage:raw?{source:legacy.usageSource??'UNKNOWN',inputTokens:raw.promptTokenCount??raw.promptTokens,outputTokens:raw.candidatesTokenCount??raw.candidateTokens,totalTokens:raw.totalTokenCount,costSource:'UNKNOWN'}:{source:'UNKNOWN',costSource:'UNKNOWN'}};
  }
}
