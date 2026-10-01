import type { AiPolicyDecision } from './capabilities';
import type { AiRequest, AiRoutingPolicy } from './provider';

export function decisionForRequest(request:AiRequest):AiPolicyDecision {
  if(request.risk==='DIRECT_ACTUATION')return 'DENIED';
  if(['STRUCTURAL','PROFESSIONAL_APPROVAL','AHJ_APPROVAL'].includes(request.risk))return 'REQUIRES_PROFESSIONAL_REVIEW';
  if(request.risk==='MACHINE_EXECUTION')return 'REQUIRES_HUMAN_REVIEW';
  if(request.risk==='SAFETY')return 'REQUIRES_DETERMINISTIC_VALIDATION';
  return 'ALLOWED_AS_PROPOSAL';
}
export function validateRoutingPolicy(policy:AiRoutingPolicy) {
  if(!policy.version||!Number.isSafeInteger(policy.maxAttempts)||policy.maxAttempts<1||policy.maxAttempts>5||!['NONE','ELIGIBLE'].includes(policy.fallback))throw new Error('Invalid bounded AI routing policy');
}
export const permittedTools=(policy:AiRoutingPolicy)=>policy.capabilityTools.filter(t=>policy.roleTools.includes(t)&&policy.projectTools.includes(t));
