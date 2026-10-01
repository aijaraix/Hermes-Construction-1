import type { Claim, ClaimDomain, ClaimPromotionEvent, ClaimStatus, DerivationMethod, Evidence, RealityClass, Source, SourceAuthorityClass } from '../types/hermes';

const clone = <T>(value: T): T => structuredClone(value);
const required = (value: string, name: string) => { if (typeof value !== 'string' || !value.trim()) throw new Error(`${name} is required`); };
const time = (value: string, name: string): number => { required(value, name); const result = Date.parse(value); if (!Number.isFinite(result)) throw new Error(`Invalid ${name}`); return result; };
function interval(from?: string, to?: string) {
  if (from) time(from, 'validFrom'); if (to) time(to, 'validTo');
  if (from && to && time(from, 'validFrom') >= time(to, 'validTo')) throw new Error('Invalid validity interval');
}
function serializable(value: unknown): boolean {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return true;
  if (typeof value === 'number') return Number.isFinite(value);
  if (Array.isArray(value)) return value.every(serializable);
  return typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype && Object.values(value).every(serializable);
}
export function createEvidence(input: Evidence): Evidence {
  for (const key of ['evidenceId', 'projectId', 'sourceId', 'projectRevisionId'] as const) required(input[key], key);
  time(input.recordedAt, 'recordedAt');
  if (input.observedAt) time(input.observedAt, 'observedAt');
  if (input.capturedAt) time(input.capturedAt, 'capturedAt');
  if (input.artifactHash && !/^[a-f0-9]{64}$/i.test(input.artifactHash)) throw new Error('Invalid artifact SHA-256');
  if (input.pose && input.spatialFrameId !== input.pose.frameId) throw new Error('Evidence pose/frame mismatch');
  if (input.supports?.some(a => !a.predicate || !serializable(a.value))) throw new Error('Invalid evidence assertion');
  if (!Array.isArray(input.relatedEntityIds)) throw new Error('Entity applicability required');
  return clone(input);
}
function validateClaim(input: Claim) {
  for (const key of ['claimId', 'projectId', 'subjectEntityId', 'predicate', 'projectRevisionId'] as const) required(input[key], key);
  if (!['PROPOSED','OBSERVED','CALCULATED','VERIFIED','REJECTED','STALE','SUPERSEDED','PROFESSIONAL_REVIEW_REQUIRED'].includes(input.status)) throw new Error('Unknown claim status');
  if (!['DIRECT_SOURCE','MEASURED','OBSERVED','IMPORTED','DETERMINISTIC_CALCULATION','RULE_DERIVED','MODEL_INFERENCE','HUMAN_INTERPRETATION','SIMULATED','ASSUMED'].includes(input.derivationMethod)) throw new Error('Unknown derivation');
  time(input.recordedAt, 'recordedAt'); interval(input.validFrom, input.validTo);
  if (input.observedAt) time(input.observedAt, 'observedAt');
  if (!serializable(input.value)) throw new Error('Claim value must be finite JSON');
  if (input.confidence !== undefined && (!Number.isFinite(input.confidence) || input.confidence < 0 || input.confidence > 1)) throw new Error('Confidence must be 0..1');
  if (!Array.isArray(input.evidenceIds) || new Set(input.evidenceIds).size !== input.evidenceIds.length) throw new Error('Invalid evidence references');
}
export function createClaim(input: Omit<Claim, 'status' | 'approvedBy' | 'promotionEventId'> & { status?: Exclude<ClaimStatus, 'VERIFIED' | 'SUPERSEDED'> }): Claim {
  const claim: Claim = { ...clone(input), status: input.status ?? (input.derivationMethod === 'DETERMINISTIC_CALCULATION' || input.derivationMethod === 'RULE_DERIVED' ? 'CALCULATED' : input.derivationMethod === 'OBSERVED' || input.derivationMethod === 'MEASURED' ? 'OBSERVED' : 'PROPOSED') };
  if (claim.status === 'VERIFIED' || claim.status === 'SUPERSEDED' || claim.approvedBy || claim.promotionEventId) throw new Error('Explicit promotion/history operation required');
  if (claim.derivationMethod === 'MODEL_INFERENCE' && claim.status !== 'REJECTED') claim.status = 'PROPOSED';
  validateClaim(claim); return claim;
}
export interface PromotionContext {
  sources: readonly Source[]; evidence: readonly Evidence[]; at: string; reviewerId: string; reason: string;
  /** An explicit validated inference path, never inferred from confidence/manager labels. */
  inferenceValidation?: { claimId: string; projectRevisionId: string; reviewerId: string; evidenceIds: string[]; method: 'HUMAN_REVIEW' | 'DETERMINISTIC_TEST'; passed: boolean };
}
const authorities: Record<ClaimDomain, readonly SourceAuthorityClass[]> = {
  GENERAL: ['PROJECT_SURVEY', 'FIELD_OBSERVATION', 'LAB_TEST', 'LICENSED_PROFESSIONAL_REPORT', 'CONTRACT_DOCUMENT', 'AHJ_RECORD', 'MANUFACTURER_DATA', 'SUPPLIER_QUOTE', 'REGIONAL_PUBLIC_DATA', 'SITE_REMOTE_SENSING'],
  JURISDICTION: ['REGIONAL_PUBLIC_DATA', 'AHJ_RECORD'],
  GEOTECH: ['LAB_TEST', 'LICENSED_PROFESSIONAL_REPORT'],
  PROFESSIONAL_APPROVAL: ['LICENSED_PROFESSIONAL_REPORT'],
  AHJ_APPROVAL: ['AHJ_RECORD'], LEGAL_COMPLETION: ['AHJ_RECORD'],
  PRICE: ['SUPPLIER_QUOTE', 'CONTRACT_DOCUMENT', 'MANUFACTURER_DATA'],
  MATERIAL: ['FIELD_OBSERVATION', 'LAB_TEST', 'PROJECT_SURVEY', 'MANUFACTURER_DATA', 'CONTRACT_DOCUMENT'],
};
const activeAt = (from: string | undefined, to: string | undefined, at: number) => (!from || time(from, 'effectiveFrom') <= at) && (!to || time(to, 'effectiveTo') > at);
/** The caller supplies the trusted evidence registry; this is policy, not authentication. */
export function validateClaimPromotion(claim: Claim, context: PromotionContext): { allowed: boolean; reasons: string[] } {
  const reasons: string[] = [];
  try {
    validateClaim(claim); const at = time(context.at, 'promotion time');
    required(context.reviewerId, 'reviewer'); required(context.reason, 'reason');
    if (!authorities[claim.domain]) throw new Error('Unknown claim domain');
    const predicate = claim.predicate.toLowerCase();
    const requiredDomain: ClaimDomain | undefined = /ahj|municipal/.test(predicate) ? 'AHJ_APPROVAL' : /occupancy|legal_completion/.test(predicate) ? 'LEGAL_COMPLETION' : /professional.*(approval|review)|licensed.*approval/.test(predicate) ? 'PROFESSIONAL_APPROVAL' : /geotech|soil|bearing|foundation/.test(predicate) ? 'GEOTECH' : /jurisdiction|flood|wind|code_edition/.test(predicate) ? 'JURISDICTION' : undefined;
    if (requiredDomain && claim.domain !== requiredDomain) reasons.push('Predicate/domain authority mismatch');
    if (['OWNER_INPUT','UNKNOWN','SIMULATION_FIXTURE'].includes(claim.sourceAuthorityClass)) reasons.push('Unverified source attribution requires a new evidence-derived claim');
    if (['PROFESSIONAL_APPROVAL','AHJ_APPROVAL','LEGAL_COMPLETION'].includes(claim.domain) && (!authorities[claim.domain].includes(claim.sourceAuthorityClass) || !['DIRECT_SOURCE','IMPORTED'].includes(claim.derivationMethod))) reasons.push('External approval must be directly documented, not inferred or calculated');

    if (claim.realityClass !== 'LIVE' || claim.sourceAuthorityClass === 'SIMULATION_FIXTURE' || claim.derivationMethod === 'SIMULATED') reasons.push('Simulation/reference cannot become live Verified');
    if (['REJECTED', 'STALE', 'SUPERSEDED'].includes(claim.status)) reasons.push('Terminal/stale claim requires a new claim revision');
    if (!activeAt(claim.validFrom, claim.validTo, at) || time(claim.recordedAt, 'recordedAt') > at) reasons.push('Claim is not valid at promotion time');
    if (!claim.evidenceIds.length) reasons.push('Evidence required');
    if (claim.derivationMethod === 'ASSUMED') reasons.push('Assumptions require a new evidence-derived claim');
    if (claim.derivationMethod === 'MODEL_INFERENCE') {
      const v = context.inferenceValidation;
      if (!v || !v.passed || v.claimId !== claim.claimId || v.projectRevisionId !== claim.projectRevisionId || v.reviewerId !== context.reviewerId || !['HUMAN_REVIEW','DETERMINISTIC_TEST'].includes(v.method) || v.evidenceIds.length !== claim.evidenceIds.length || !claim.evidenceIds.every(id => v.evidenceIds.includes(id))) reasons.push('Model inference requires an explicit validation/reviewer path');
    }
    for (const id of claim.evidenceIds) {
      const matches = context.evidence.filter(e => e.evidenceId === id);
      if (matches.length !== 1) { reasons.push(`Missing/ambiguous evidence ${id}`); continue; }
      const e = createEvidence(matches[0]);
      const sources = context.sources.filter(s => s.sourceId === e.sourceId);
      if (sources.length !== 1) { reasons.push(`Missing/ambiguous source ${e.sourceId}`); continue; }
      const s = sources[0];
      if (!e.supports?.some(a => a.predicate === claim.predicate && a.units === claim.units && JSON.stringify(a.value) === JSON.stringify(claim.value))) reasons.push(`Evidence does not substantiate claim ${id}`);
      if (e.projectId !== claim.projectId || e.projectRevisionId !== claim.projectRevisionId || !e.relatedEntityIds.includes(claim.subjectEntityId) || (s.projectId && s.projectId !== claim.projectId)) reasons.push(`Evidence applicability mismatch ${id}`);
      if (e.realityClass !== 'LIVE' || e.contentKind !== 'CONTENT' || !e.artifactHash || !e.artifactUri) reasons.push(`Substantive live evidence required ${id}`);
      if (time(e.recordedAt, 'recordedAt') > at || (e.observedAt && time(e.observedAt, 'observedAt') > at) || !activeAt(s.effectiveFrom, s.effectiveTo, at)) reasons.push(`Evidence/source outside validity window ${id}`);
      if (!authorities[claim.domain].includes(s.authorityClass)) reasons.push(`Source authority cannot verify ${claim.domain}`);
      if (['GEOTECH', 'PROFESSIONAL_APPROVAL', 'AHJ_APPROVAL', 'LEGAL_COMPLETION'].includes(claim.domain) && s.projectId !== claim.projectId) reasons.push('Project-specific external authority required');
    }
  } catch (error) { reasons.push(error instanceof Error ? error.message : 'Invalid claim'); }
  return { allowed: reasons.length === 0, reasons };
}
export function promoteClaim(claim: Claim, context: PromotionContext, eventId: string): { claim: Claim; event: ClaimPromotionEvent } {
  required(eventId, 'eventId');
  if (claim.status === 'VERIFIED') throw new Error('Claim already promoted');
  const result = validateClaimPromotion(claim, context);
  if (!result.allowed) throw new Error(result.reasons.join('; '));
  const promoted: Claim = { ...clone(claim), status: 'VERIFIED', approvedBy: context.reviewerId, promotionEventId: eventId };
  return { claim: promoted, event: { eventId, eventType: 'CLAIM_PROMOTED', timestamp: context.at, projectId: claim.projectId, projectRevisionId: claim.projectRevisionId, entitiesAffected: [claim.subjectEntityId], actor: { reviewerId: context.reviewerId }, policyVersion: 'FND02-1', payload: { before: clone(claim), after: clone(promoted), evidenceIds: [...claim.evidenceIds], sourceIds: [...new Set(context.evidence.filter(e => claim.evidenceIds.includes(e.evidenceId)).map(e => e.sourceId))], reason: context.reason } } };
}
export function supersedeClaim(previous: Claim, successor: Claim): { previous: Claim; successor: Claim } {
  validateClaim(previous); validateClaim(successor);
  if (previous.claimId === successor.claimId || previous.projectId !== successor.projectId || previous.subjectEntityId !== successor.subjectEntityId || previous.predicate !== successor.predicate || previous.domain !== successor.domain || previous.supersededByClaimId || successor.supersedesClaimId || time(successor.recordedAt, 'recordedAt') <= time(previous.recordedAt, 'recordedAt')) throw new Error('Invalid claim supersession');
  return { previous: { ...clone(previous), status: 'SUPERSEDED', supersededByClaimId: successor.claimId }, successor: { ...clone(successor), supersedesClaimId: previous.claimId } };
}
export function adaptTruthOrigin(origin: string): { sourceAuthorityClass: SourceAuthorityClass; derivationMethod: DerivationMethod; realityClass: RealityClass } {
  const map: Record<string, [SourceAuthorityClass, DerivationMethod, RealityClass]> = {
    MEASURED: ['FIELD_OBSERVATION','MEASURED','LIVE'], CALCULATED: ['HERMES_INTERNAL','DETERMINISTIC_CALCULATION','LIVE'], RULE_DERIVED: ['HERMES_INTERNAL','RULE_DERIVED','LIVE'], MODEL_GENERATED: ['HERMES_INTERNAL','MODEL_INFERENCE','LIVE'], LLM_REASONED: ['HERMES_INTERNAL','MODEL_INFERENCE','LIVE'], IMPORTED_REFERENCE: ['UNKNOWN','IMPORTED','HISTORICAL_REFERENCE'], SIMULATED: ['SIMULATION_FIXTURE','SIMULATED','SIMULATION'], ASSUMED: ['UNKNOWN','ASSUMED','LIVE'], CUSTOMER: ['OWNER_INPUT','DIRECT_SOURCE','LIVE'], AUTONOMOUS_ENGINE: ['HERMES_INTERNAL','ASSUMED','LIVE'], HERMES_WORKFORCE: ['HERMES_INTERNAL','ASSUMED','LIVE'], HUMAN_EXPERT: ['UNKNOWN','HUMAN_INTERPRETATION','LIVE'], ACADEMY_TRAINED: ['HERMES_INTERNAL','MODEL_INFERENCE','SIMULATION'],
  };
  const [sourceAuthorityClass, derivationMethod, realityClass] = map[origin] ?? ['UNKNOWN','ASSUMED','HISTORICAL_REFERENCE'];
  return { sourceAuthorityClass, derivationMethod, realityClass };
}
