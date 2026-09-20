import {
  ChangeOrderRisk,
  HermesWorldState,
  InspectionTicket,
  ManagerReviewRecord,
} from '../types/hermes';

export type ProjectAttentionCategory =
  | 'OWNER_DECISION'
  | 'PROJECT_BLOCKER'
  | 'CONSTRUCTABILITY'
  | 'CLASH'
  | 'INSPECTION'
  | 'PROFESSIONAL_REVIEW'
  | 'AHJ'
  | 'QUALITY'
  | 'CHANGE_RISK'
  | 'MANAGER_REVIEW'
  | 'OTHER';

export type ProjectAttentionSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export interface ProjectAttentionItem {
  id: string;
  category: ProjectAttentionCategory;
  severity: ProjectAttentionSeverity;
  title: string;
  detail?: string;
  status?: string;
  requiresOwnerAction: boolean;
  blocking: boolean;
  source:
    | 'WORLD_STATUS'
    | 'PENDING_QUESTION'
    | 'CONSTRUCTABILITY'
    | 'CLASH'
    | 'COMPONENT'
    | 'LIVE_INSPECTION'
    | 'LEGACY_INSPECTION'
    | 'CHANGE_RISK'
    | 'MANAGER_REVIEW';
  relatedEntityIds: string[];
  taskId?: string;
  worldPosition?: [number, number, number];
  recommendedNextAction?: string;
  sourceRecord: unknown;
}

export interface ProjectAttentionState {
  items: ProjectAttentionItem[];
  activeCount: number;
  blockingCount: number;
  ownerActionCount: number;
  byCategory: Partial<Record<ProjectAttentionCategory, number>>;
  bySeverity: Partial<Record<ProjectAttentionSeverity, number>>;
}

function vector3(value: unknown): [number, number, number] | undefined {
  if (!Array.isArray(value) || value.length < 3) return undefined;
  const values = value.slice(0, 3).map(Number);
  if (values.some((entry) => !Number.isFinite(entry))) return undefined;
  return values as [number, number, number];
}

function severityFromString(value: unknown, fallback: ProjectAttentionSeverity = 'MEDIUM'): ProjectAttentionSeverity {
  const normalized = String(value || '').toUpperCase();
  if (normalized === 'CRITICAL') return 'CRITICAL';
  if (normalized === 'HIGH') return 'HIGH';
  if (normalized === 'MEDIUM') return 'MEDIUM';
  if (normalized === 'LOW') return 'LOW';
  if (normalized === 'INFO') return 'INFO';
  return fallback;
}

function add(
  target: ProjectAttentionItem[],
  item: ProjectAttentionItem
): void {
  if (!target.some((existing) => existing.id === item.id)) {
    target.push(item);
  }
}

function deriveWorldAttention(state: HermesWorldState): ProjectAttentionItem[] {
  const items: ProjectAttentionItem[] = [];

  if (state.pendingQuestion?.prompt) {
    add(items, {
      id: state.pendingQuestion.questionId || 'owner-decision',
      category: 'OWNER_DECISION',
      severity: 'HIGH',
      title: 'Owner decision required',
      detail: state.pendingQuestion.prompt,
      status: state.status,
      requiresOwnerAction: true,
      blocking: state.status === 'CUSTOMER_DECISION_REQUIRED' || state.status === 'BLOCKED',
      source: 'PENDING_QUESTION',
      relatedEntityIds: [],
      recommendedNextAction: 'Provide the requested project information.',
      sourceRecord: state.pendingQuestion,
    });
  }

  if (state.status === 'BLOCKED') {
    add(items, {
      id: 'project-blocked',
      category: 'PROJECT_BLOCKER',
      severity: 'HIGH',
      title: 'Project work is blocked',
      detail: 'Canonical project state is BLOCKED. Review the specific active issues for the recorded cause.',
      status: state.status,
      requiresOwnerAction: false,
      blocking: true,
      source: 'WORLD_STATUS',
      relatedEntityIds: [],
      sourceRecord: state,
    });
  }

  if (state.constructabilityProof && ['BLOCKED', 'FAILED'].includes(state.constructabilityProof.status)) {
    add(items, {
      id: state.constructabilityProof.proofId || 'constructability-proof',
      category: 'CONSTRUCTABILITY',
      severity: 'HIGH',
      title: 'Future access / constructability issue',
      detail: state.constructabilityProof.rationale,
      status: state.constructabilityProof.status,
      requiresOwnerAction: false,
      blocking: true,
      source: 'CONSTRUCTABILITY',
      relatedEntityIds: [
        state.constructabilityProof.materialId,
        state.constructabilityProof.closureComponentId,
      ].filter(Boolean),
      taskId: state.constructabilityProof.closureTaskId,
      sourceRecord: state.constructabilityProof,
    });
  }

  for (const clash of state.clashes || []) {
    const status = String((clash as any)?.status || '').toUpperCase();
    const id = (clash as any)?.clashId || (clash as any)?.id || 'clash-' + String(items.length + 1);

    if (status === 'ACTIVE') {
      add(items, {
        id,
        category: 'CLASH',
        severity: severityFromString((clash as any)?.severity, 'HIGH'),
        title: 'Spatial coordination clash',
        detail: (clash as any)?.description,
        status,
        requiresOwnerAction: false,
        blocking: ['HIGH', 'CRITICAL'].includes(String((clash as any)?.severity || '').toUpperCase()),
        source: 'CLASH',
        relatedEntityIds: [
          (clash as any)?.componentA,
          (clash as any)?.componentB,
        ].filter(Boolean),
        worldPosition: vector3((clash as any)?.location),
        sourceRecord: clash,
      });
    } else if (status && status !== 'RESOLVED' && status !== 'RESOLVED_REROUTED') {
      add(items, {
        id: id + '-review',
        category: 'CLASH',
        severity: 'INFO',
        title: 'Coordination record needs status review',
        detail: (clash as any)?.description,
        status,
        requiresOwnerAction: false,
        blocking: false,
        source: 'CLASH',
        relatedEntityIds: [
          (clash as any)?.componentA,
          (clash as any)?.componentB,
        ].filter(Boolean),
        sourceRecord: clash,
      });
    }
  }

  for (const component of state.buildingComponents || []) {
    const status = String((component as any)?.inspectionStatus || '').toUpperCase();
    if (status === 'FAILED') {
      const id = (component as any)?.componentId || (component as any)?.id || 'component-failed-' + String(items.length + 1);
      add(items, {
        id: 'quality-' + id,
        category: 'QUALITY',
        severity: 'HIGH',
        title: 'Component inspection failed',
        detail: (component as any)?.name || id,
        status,
        requiresOwnerAction: false,
        blocking: true,
        source: 'COMPONENT',
        relatedEntityIds: [id],
        taskId: (component as any)?.sourceTaskId || (component as any)?.createdByTaskId,
        worldPosition: vector3((component as any)?.positionXYZ || (component as any)?.geometry?.position),
        sourceRecord: component,
      });
    }
  }

  for (const ticket of state.inspectionTickets || []) {
    const ticketId = (ticket as any)?.ticketId || (ticket as any)?.id || 'inspection-' + String(items.length + 1);
    const status = String((ticket as any)?.status || '').toUpperCase();

    if (status === 'FAIL') {
      add(items, {
        id: ticketId,
        category: 'INSPECTION',
        severity: 'HIGH',
        title: 'Inspection failed',
        detail: (ticket as any)?.notes,
        status,
        requiresOwnerAction: false,
        blocking: true,
        source: 'LIVE_INSPECTION',
        relatedEntityIds: [],
        sourceRecord: ticket,
      });
    } else if (status === 'INSUFFICIENT_INFORMATION') {
      add(items, {
        id: ticketId,
        category: 'INSPECTION',
        severity: 'MEDIUM',
        title: 'Inspection needs more information',
        detail: (ticket as any)?.notes,
        status,
        requiresOwnerAction: false,
        blocking: false,
        source: 'LIVE_INSPECTION',
        relatedEntityIds: [],
        sourceRecord: ticket,
      });
    } else if (status === 'WARNING') {
      add(items, {
        id: ticketId,
        category: 'INSPECTION',
        severity: 'LOW',
        title: 'Inspection warning',
        detail: (ticket as any)?.notes,
        status,
        requiresOwnerAction: false,
        blocking: false,
        source: 'LIVE_INSPECTION',
        relatedEntityIds: [],
        sourceRecord: ticket,
      });
    }

    const professional = String((ticket as any)?.licensedProfessionalApproval || '').toUpperCase();
    if (professional === 'PENDING') {
      add(items, {
        id: ticketId + '-professional',
        category: 'PROFESSIONAL_REVIEW',
        severity: 'MEDIUM',
        title: 'Professional review pending',
        detail: (ticket as any)?.notes,
        status: professional,
        requiresOwnerAction: false,
        blocking: false,
        source: 'LIVE_INSPECTION',
        relatedEntityIds: [],
        recommendedNextAction: 'Obtain the required licensed professional review before relying on this as final professional approval.',
        sourceRecord: ticket,
      });
    }

    const ahj = String((ticket as any)?.AHJInspection || '').toUpperCase();
    if (ahj === 'PENDING_CITY_INSPECTION') {
      add(items, {
        id: ticketId + '-ahj',
        category: 'AHJ',
        severity: 'MEDIUM',
        title: 'Municipal inspection pending',
        detail: (ticket as any)?.notes,
        status: ahj,
        requiresOwnerAction: false,
        blocking: false,
        source: 'LIVE_INSPECTION',
        relatedEntityIds: [],
        sourceRecord: ticket,
      });
    } else if (ahj === 'NOT_SUBMITTED') {
      add(items, {
        id: ticketId + '-ahj-not-submitted',
        category: 'AHJ',
        severity: 'INFO',
        title: 'Municipal inspection not submitted',
        detail: (ticket as any)?.notes,
        status: ahj,
        requiresOwnerAction: false,
        blocking: false,
        source: 'LIVE_INSPECTION',
        relatedEntityIds: [],
        sourceRecord: ticket,
      });
    }

    const co = String((ticket as any)?.certificateOfOccupancyStatus || '').toUpperCase();
    if (co === 'PENDING_AHJ_FINAL_WALK') {
      add(items, {
        id: ticketId + '-co',
        category: 'AHJ',
        severity: state.currentPhase === 'CLOSEOUT' ? 'MEDIUM' : 'INFO',
        title: 'Final occupancy inspection pending',
        detail: (ticket as any)?.notes,
        status: co,
        requiresOwnerAction: false,
        blocking: state.currentPhase === 'CLOSEOUT',
        source: 'LIVE_INSPECTION',
        relatedEntityIds: [],
        sourceRecord: ticket,
      });
    } else if (co === 'NOT_ELIGIBLE' && state.currentPhase === 'CLOSEOUT') {
      add(items, {
        id: ticketId + '-co-not-eligible',
        category: 'AHJ',
        severity: 'HIGH',
        title: 'Project is not eligible for certificate of occupancy',
        detail: (ticket as any)?.notes,
        status: co,
        requiresOwnerAction: false,
        blocking: true,
        source: 'LIVE_INSPECTION',
        relatedEntityIds: [],
        sourceRecord: ticket,
      });
    }
  }

  return items;
}

function deriveLegacyInspections(tickets: InspectionTicket[] = []): ProjectAttentionItem[] {
  return tickets
    .filter((ticket) => ticket.status !== 'verified_closed')
    .map((ticket) => ({
      id: 'legacy-inspection-' + ticket.id,
      category: 'INSPECTION' as const,
      severity: severityFromString(ticket.severity, 'MEDIUM'),
      title: ticket.status === 'repaired' ? 'Repair awaiting verification' : 'Inspection issue open',
      detail: ticket.problem,
      status: ticket.status,
      requiresOwnerAction: false,
      blocking: ticket.status === 'open' && ['critical', 'high'].includes(ticket.severity),
      source: 'LEGACY_INSPECTION' as const,
      relatedEntityIds: ticket.affectedComponentIds || [],
      recommendedNextAction: ticket.proposedRepair,
      sourceRecord: ticket,
    }));
}

function deriveChangeRisks(risks: ChangeOrderRisk[] = []): ProjectAttentionItem[] {
  return risks
    .filter((risk) => !risk.resolved)
    .map((risk) => ({
      id: 'change-risk-' + risk.id,
      category: 'CHANGE_RISK' as const,
      severity: severityFromString(risk.severity, 'MEDIUM'),
      title: 'Potential change-order exposure',
      detail: risk.issue,
      status: risk.probability,
      requiresOwnerAction: false,
      blocking: risk.severity === 'critical',
      source: 'CHANGE_RISK' as const,
      relatedEntityIds: [],
      recommendedNextAction: risk.recommendedMitigation,
      sourceRecord: risk,
    }));
}

function deriveManagerReviews(reviews: ManagerReviewRecord[] = []): ProjectAttentionItem[] {
  const items: ProjectAttentionItem[] = [];

  for (const review of reviews) {
    const decision = review.decision;

    if (decision === 'PROFESSIONAL_REVIEW_REQUIRED') {
      items.push({
        id: 'manager-review-' + (review.reviewId || review.id || String(items.length + 1)),
        category: 'PROFESSIONAL_REVIEW',
        severity: 'HIGH',
        title: 'Licensed professional review required',
        detail: (review.reasons || []).join(' '),
        status: decision,
        requiresOwnerAction: false,
        blocking: true,
        source: 'MANAGER_REVIEW',
        relatedEntityIds: [],
        taskId: review.taskId,
        recommendedNextAction: (review.limitations || []).join(' ') || undefined,
        sourceRecord: review,
      });
    } else if (decision === 'MORE_EVIDENCE_REQUIRED' || decision === 'RETRAINING_REQUIRED' || decision === 'REJECTED') {
      items.push({
        id: 'manager-review-' + (review.reviewId || review.id || String(items.length + 1)),
        category: 'MANAGER_REVIEW',
        severity: decision === 'REJECTED' ? 'HIGH' : 'MEDIUM',
        title:
          decision === 'MORE_EVIDENCE_REQUIRED'
            ? 'More evidence required'
            : decision === 'RETRAINING_REQUIRED'
            ? 'Agent retraining required'
            : 'Manager review rejected',
        detail: (review.reasons || []).join(' '),
        status: decision,
        requiresOwnerAction: false,
        blocking: decision === 'REJECTED',
        source: 'MANAGER_REVIEW',
        relatedEntityIds: [],
        taskId: review.taskId,
        recommendedNextAction: (review.limitations || []).join(' ') || undefined,
        sourceRecord: review,
      });
    }
  }

  return items;
}

function priority(item: ProjectAttentionItem): number {
  const severityWeight: Record<ProjectAttentionSeverity, number> = {
    CRITICAL: 500,
    HIGH: 400,
    MEDIUM: 300,
    LOW: 200,
    INFO: 100,
  };

  return (
    severityWeight[item.severity] +
    (item.blocking ? 80 : 0) +
    (item.requiresOwnerAction ? 60 : 0)
  );
}

export function deriveProjectAttentionState(
  state: HermesWorldState,
  options?: {
    legacyInspectionTickets?: InspectionTicket[];
    changeOrderRisks?: ChangeOrderRisk[];
    managerReviews?: ManagerReviewRecord[];
  }
): ProjectAttentionState {
  const items = [
    ...deriveWorldAttention(state),
    ...deriveLegacyInspections(options?.legacyInspectionTickets),
    ...deriveChangeRisks(options?.changeOrderRisks),
    ...deriveManagerReviews(options?.managerReviews),
  ].sort((a, b) => priority(b) - priority(a));

  const byCategory: Partial<Record<ProjectAttentionCategory, number>> = {};
  const bySeverity: Partial<Record<ProjectAttentionSeverity, number>> = {};

  for (const item of items) {
    byCategory[item.category] = (byCategory[item.category] || 0) + 1;
    bySeverity[item.severity] = (bySeverity[item.severity] || 0) + 1;
  }

  return {
    items,
    activeCount: items.length,
    blockingCount: items.filter((item) => item.blocking).length,
    ownerActionCount: items.filter((item) => item.requiresOwnerAction).length,
    byCategory,
    bySeverity,
  };
}
