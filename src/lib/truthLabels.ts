import type { Claim, ClaimPromotionEvent } from '../types/hermes';
import { validateClaimPromotion, type PromotionContext } from './projectEvidence';
export type TruthLabel = 'Verified' | 'Project source' | 'Observed' | 'Calculated' | 'AI inferred' | 'Assumed' | 'Simulated' | 'Stale' | 'Needs professional review';
export function deriveTruthLabel(claim: Claim, context?: PromotionContext & { promotionEvents: readonly ClaimPromotionEvent[] }): TruthLabel {
  if (['STALE','SUPERSEDED','REJECTED'].includes(claim.status)) return 'Stale';
  if (claim.realityClass === 'SIMULATION' || claim.realityClass === 'REGRESSION_FIXTURE' || claim.sourceAuthorityClass === 'SIMULATION_FIXTURE' || claim.derivationMethod === 'SIMULATED') return 'Simulated';
  if (claim.status === 'PROFESSIONAL_REVIEW_REQUIRED') return 'Needs professional review';
  const event = context?.promotionEvents.find(e => e.eventId === claim.promotionEventId && e.projectId === claim.projectId && e.projectRevisionId === claim.projectRevisionId && e.actor.reviewerId === claim.approvedBy && JSON.stringify(e.payload.after) === JSON.stringify(claim));
  if (claim.status === 'VERIFIED' && context && event && validateClaimPromotion(claim, context).allowed) return 'Verified';
  if (claim.derivationMethod === 'MODEL_INFERENCE') return 'AI inferred';
  if (claim.derivationMethod === 'DETERMINISTIC_CALCULATION' || claim.derivationMethod === 'RULE_DERIVED') return 'Calculated';
  if (claim.derivationMethod === 'OBSERVED' || claim.derivationMethod === 'MEASURED') return 'Observed';
  if (claim.realityClass === 'LIVE' && claim.evidenceIds.length && !['OWNER_INPUT','UNKNOWN','HERMES_INTERNAL'].includes(claim.sourceAuthorityClass)) return 'Project source';
  return 'Assumed';
}
