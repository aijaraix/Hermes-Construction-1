export const AI_CAPABILITIES=['reasoning.standard','reasoning.high','document.extract','vision.construction','code','embedding','rerank','ocr','speech.realtime','local.private'] as const;
export type AiCapability=typeof AI_CAPABILITIES[number];
export type AiTier='TIER_0_DETERMINISTIC'|'TIER_1_LOCAL_SMALL'|'TIER_2_LOCAL_LARGE'|'TIER_3_REMOTE_FRONTIER'|'HUMAN_PROFESSIONAL';
export type AiPrivacy='PUBLIC'|'PROJECT_PRIVATE'|'LOCAL_ONLY';
export type AiRisk='GENERAL'|'SAFETY'|'STRUCTURAL'|'PROFESSIONAL_APPROVAL'|'AHJ_APPROVAL'|'MACHINE_EXECUTION'|'DIRECT_ACTUATION';
export type AiPolicyDecision='ALLOWED_AS_PROPOSAL'|'REQUIRES_DETERMINISTIC_VALIDATION'|'REQUIRES_HUMAN_REVIEW'|'REQUIRES_PROFESSIONAL_REVIEW'|'DENIED';
