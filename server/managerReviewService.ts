import {
  AgentExecutionRecord,
  CompetencyScenario,
  ManagerReviewRecord,
  ReviewMode,
  ValidationResult
} from '../src/types/hermes';

export class ManagerReviewService {
  private static managerReviews: Map<string, ManagerReviewRecord> = new Map();

  public static conductReview(params: {
    managerRoleId: string;
    agentRoleId: string;
    scenario: CompetencyScenario;
    execution: AgentExecutionRecord;
    validation: ValidationResult;
    curriculumCoveragePct: number;
    studiedSourceIds: string[];
    knowledgePackVersion: string;
    shadowPassed?: boolean;
    reviewMode?: ReviewMode;
  }): ManagerReviewRecord {
    const {
      managerRoleId,
      agentRoleId,
      scenario,
      execution,
      validation,
      curriculumCoveragePct,
      studiedSourceIds,
      knowledgePackVersion,
      shadowPassed,
      reviewMode = 'DETERMINISTIC_GOVERNANCE_REVIEW'
    } = params;

    const reviewId = `REV-${agentRoleId}-${Date.now()}`;
    const reasons: string[] = [];
    const limitations: string[] = [];

    let decision: ManagerReviewRecord['decision'] = 'APPROVED';

    // 1. STRICT REASONING-PROVIDER GATING RULE:
    // Specialist agent CANNOT receive approval if reasoning provider did not genuinely execute (e.g. SIMULATION_ONLY or EXECUTION_DEFERRED or FAILED).
    if (execution.executionMode !== 'LLM_REASONED' && execution.executionMode !== 'DETERMINISTIC_TOOL') {
      decision = 'MORE_EVIDENCE_REQUIRED';
      reasons.push(
        `REASONING PROVIDER GATING REJECTION: Execution mode was '${execution.executionMode}' (${execution.modelProvider}). Specialist agents cannot be certified or approved for construction work without genuine reasoning provider execution.`
      );
    } else if (validation.criticalFailure) {
      // 2. MANDATORY RULE: Manager CANNOT override critical failures or failed math/code checks!
      decision = 'RETRAINING_REQUIRED';
      reasons.push(
        `CRITICAL FAILURE REJECTION: Independent validator detected critical failure (${validation.criticalFailureReason}). Manager review override is strictly forbidden.`
      );
    } else if (!validation.passed) {
      decision = 'RETRAINING_REQUIRED';
      reasons.push(
        `VALIDATION REJECTION: Execution score (${validation.overallScorePct}%) is below passing threshold (85%). Violations: ${validation.violations.join('; ')}.`
      );
    } else {
      // Validation passed with genuine reasoning
      if (curriculumCoveragePct < 80) {
        decision = 'MORE_EVIDENCE_REQUIRED';
        reasons.push(`Curriculum evidence coverage (${curriculumCoveragePct}%) is below required 80% threshold for full approval.`);
      } else if (validation.unsupportedCitations.length > 0) {
        decision = 'APPROVED_WITH_LIMITS';
        reasons.push(`Approved with limitations due to ${validation.unsupportedCitations.length} unverified citations.`);
        limitations.push('Restricted to simple residential scenarios until citation grounding reaches 100%.');
      } else if (scenario.difficulty === 'HARD_BOUNDARY') {
        decision = 'PROFESSIONAL_REVIEW_REQUIRED';
        reasons.push(`HARD BOUNDARY SCENARIO: Structural / Life Safety code boundary evaluated (${scenario.scenarioTitle}). Requires licensed professional engineer review before final site execution.`);
        limitations.push('Requires Professional Engineer (PE / SE) stamp for final design document approval.');
      } else if (scenario.difficulty === 'EXPERT') {
        decision = 'APPROVED_WITH_LIMITS';
        reasons.push(`Passed ${scenario.difficulty} scenario. Authorized for bounded construction design.`);
        limitations.push('Scope limited to Risk Category II structures under 3 stories.');
      } else {
        decision = 'APPROVED';
        reasons.push(`Independent validation passed with ${validation.overallScorePct}% score.`);
        reasons.push(`Curriculum coverage verified at ${curriculumCoveragePct}%.`);
      }
    }

    if (shadowPassed === false && decision === 'APPROVED') {
      decision = 'APPROVED_WITH_LIMITS';
      limitations.push('Shadow work benchmark failed; requires shadow work re-testing before independent site execution.');
    }

    const reviewRecord: ManagerReviewRecord = {
      reviewId,
      managerRoleId,
      agentRoleId,
      reviewMode,
      evidenceReviewed: {
        curriculumCoveragePct,
        studiedSourceIds,
        knowledgePackVersion,
        latestTestScorePct: validation.overallScorePct,
        citedChunkIds: execution.citations,
        shadowWorkPassed: Boolean(shadowPassed),
        executionMode: execution.executionMode
      },
      decision,
      reasons,
      limitations: limitations.length > 0 ? limitations : undefined,
      reviewedAt: new Date().toISOString()
    };

    this.managerReviews.set(reviewId, reviewRecord);
    return reviewRecord;
  }

  public static getReview(reviewId: string): ManagerReviewRecord | undefined {
    return this.managerReviews.get(reviewId);
  }

  public static getAllReviews(): ManagerReviewRecord[] {
    return Array.from(this.managerReviews.values());
  }
}
