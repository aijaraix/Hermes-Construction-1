import type { JsonValue } from '../persistence/contracts';
import type { ReasoningExecutionParams, ReasoningExecutionResult } from '../reasoningProvider';
import type { AiCapability, AiPrivacy, AiRisk, AiTier } from './capabilities';
import type { AiToolCall, AiRun } from './aiRun';

export interface AiRequest {
  requestId:string; capability:AiCapability; roleId:string; projectId?:string; projectRevisionId?:string;
  input:JsonValue; promptVersion:string; taskVersion:string; schemaVersion:string; outputSchema:JsonValue;
  evidenceIds:string[]; sourceIds:string[]; chunkIds:string[];
  localOnly?:boolean; privacy:AiPrivacy; preferredTier?:AiTier; risk:AiRisk;
  structuredOutput?:boolean; requiredTools?:string[]; streaming?:boolean; modality?:'TEXT'|'IMAGE'|'AUDIO';
  maxLatencyMs?:number; maxCostUsd?:number; estimatedInputTokens?:number;
  /** Trusted internal compatibility context, never serialized into AiRun. */
  reasoningContext?:ReasoningExecutionParams;
}
export interface AiModelDescriptor { modelId:string; version?:string; capabilities:AiCapability[]; tier:Exclude<AiTier,'TIER_0_DETERMINISTIC'|'HUMAN_PROFESSIONAL'>; priority:number; contextTokens?:number; estimatedLatencyMs?:number; estimatedCostUsd?:number; }
export interface AiProviderDescriptor {
  providerId:string; adapterId:string; adapterVersion:string; locality:'LOCAL'|'REMOTE';
  executionKind:'MODEL'|'SIMULATOR'|'TEST_DOUBLE'; privacy:AiPrivacy[]; modalities:Array<'TEXT'|'IMAGE'|'AUDIO'>;
  structuredOutput:boolean; tools:boolean; streaming:boolean; models:AiModelDescriptor[];
}
export interface AiUsage { source:'PROVIDER_REPORTED'|'ESTIMATED'|'UNKNOWN'; inputTokens?:number; outputTokens?:number; totalTokens?:number; costUsd?:number; costSource?:'PROVIDER_REPORTED'|'ESTIMATED'|'UNKNOWN'; }
export interface AiProviderOutput {
  status:'SUCCEEDED'|'PROVIDER_UNAVAILABLE'|'RATE_LIMITED_DEFERRED'|'FAILED';
  output?:JsonValue; citations?:string[]; artifactIds?:string[]; usage?:AiUsage;
  requestId?:string; failureCode?:string; legacy?:ReasoningExecutionResult;
  promptHash?:string;
}
export interface AiExecutionContext { signal:AbortSignal; callTool(name:string,input:JsonValue):Promise<{value:JsonValue;call:AiToolCall}>; }
export interface AiProviderAdapter {
  readonly descriptor:AiProviderDescriptor;
  health(): 'AVAILABLE'|'UNAVAILABLE'|'RATE_LIMITED';
  execute(request:Readonly<AiRequest>,model:Readonly<AiModelDescriptor>,context:AiExecutionContext):Promise<AiProviderOutput>;
}
/** Server-governed policy. Must never be taken from model output or a public request body. */
export interface AiRoutingPolicy {
  version:string; allowModelExecution:boolean; allowRemote:boolean; allowPaidExecution:boolean;
  allowedProviders?:string[]; fallback:'NONE'|'ELIGIBLE'; maxAttempts:number;
  capabilityTools:string[]; roleTools:string[]; projectTools:string[];
}
export type AiRouteStatus='SELECTED'|'FALLBACK_SELECTED'|'NO_ELIGIBLE_PROVIDER'|'LOCAL_ONLY_UNAVAILABLE'|'PROVIDER_UNAVAILABLE'|'RATE_LIMITED_DEFERRED'|'POLICY_DENIED'|'FAILED'|'DETERMINISTIC_BYPASS';
export interface AiRouteResult { status:AiRouteStatus; run?:AiRun; output?:JsonValue; legacy?:ReasoningExecutionResult; deterministic?:{executionKind:'DETERMINISTIC';taskHash:string;result:JsonValue}; }
