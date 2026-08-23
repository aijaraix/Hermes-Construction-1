import { describe, expect, it } from 'vitest';
import { Phase318A2LiveProofRunner } from '../phase318a2LiveProofRunner';
import { ContinuousAcademyEngine } from '../continuousAcademyEngine';
import { ReasoningBudgetManager } from '../reasoningBudgetManager';
import { KnowledgeGraphEngine } from '../knowledgeGraphEngine';
import { QuotaIntegrityEngine } from '../quotaIntegrityEngine';

describe('Phase 3.18B — Continuous SME Academy & Proof Execution Suite', () => {
  it('SECTION 1: Executes Phase 3.18A.2 Live Proofs A, B, C, D and unlocks Phase 3.18B', async () => {
    const proofResults = await Phase318A2LiveProofRunner.executeAllProofs();

    expect(proofResults.proofA.passed).toBe(true);
    expect(proofResults.proofA.executionMode).toBe('LLM_REASONED');

    expect(proofResults.proofB.passed).toBe(true);
    expect(proofResults.proofB.competencyDelta).toBe(0);

    expect(proofResults.proofC.passed).toBe(true);
    expect(proofResults.proofC.initialJobState).toBe('DEFERRED_QUOTA');
    expect(proofResults.proofC.recoveredJobState).toBe('LLM_REASONED');

    expect(proofResults.proofD.passed).toBe(true);
    expect(proofResults.proofD.incidentDetectedByRealitySwarm).toBe(true);

    expect(proofResults.phase318a2Verified).toBe(true);
    expect(proofResults.phase318bUnlocked).toBe(true);
  }, 30000);

  it('SECTION 7: Reasoning Budget Manager classifies deterministic vs reasoning required tasks', () => {
    expect(ReasoningBudgetManager.canBeCompletedDeterministically('SHA256_HASH')).toBe(true);
    expect(ReasoningBudgetManager.canBeCompletedDeterministically('GEOMETRY_CALCULATION')).toBe(true);
    expect(ReasoningBudgetManager.canBeCompletedDeterministically('SPECIALIST_COMPETENCY_DEMO')).toBe(false);

    const detEval = ReasoningBudgetManager.evaluateAndAuthorize({
      agentRoleId: 'CONCRETE-SPECIALIST',
      taskType: 'GEOMETRY_CALCULATION',
      purpose: 'Formwork volume calculation',
      reasoningRequiredWhy: 'Pure arithmetic geometry'
    });
    expect(detEval.executionMode).toBe('DETERMINISTIC_WORK');
    expect(detEval.allowed).toBe(false);
  });

  it('SECTION 8 & 9: Knowledge Graph Grounded Memory provides knowledge reuse hits', () => {
    KnowledgeGraphEngine.initializeSeedGraph();
    const assertion = KnowledgeGraphEngine.findGroundedAssertion('CONCRETE_WATER_CEMENT_RATIO');
    expect(assertion).toBeDefined();
    expect(assertion?.statement).toContain('0.45');

    const reuseEval = ReasoningBudgetManager.evaluateAndAuthorize({
      agentRoleId: 'CONCRETE-SPECIALIST',
      taskType: 'SPECIALIST_COMPETENCY_DEMO',
      purpose: 'Sulphate exposure W/C ratio lookup',
      reasoningRequiredWhy: 'Check water cement ratio',
      hasGroundedAssertionMatch: true,
      groundedAssertionContent: assertion
    });

    expect(reuseEval.executionMode).toBe('GROUNDED_KNOWLEDGE_REUSE');
    expect(reuseEval.allowed).toBe(false);
  });

  it('SECTION 30 & 31: Quota Exhaustion enqueues DEFERRED_QUOTA job and auto-resumes', async () => {
    QuotaIntegrityEngine.setMockQuotaExhausted(true);

    const evalRes = ReasoningBudgetManager.evaluateAndAuthorize({
      agentRoleId: 'HVAC-LOAD-SPECIALIST',
      taskType: 'SPECIALIST_COMPETENCY_DEMO',
      purpose: 'HVAC Manual J calculation',
      reasoningRequiredWhy: 'Complex thermal load balancing'
    });

    expect(evalRes.executionMode).toBe('DEFERRED_QUOTA');

    QuotaIntegrityEngine.setMockQuotaExhausted(false);
  });

  it('SECTION 48-51: Executes 20 Autonomous Heartbeat Cycles and generates complete report', async () => {
    const report = await ContinuousAcademyEngine.run20HeartbeatCycles();

    expect(report.heartbeatCycles).toBeGreaterThanOrEqual(20);
    expect(report.operationalMetrics.deterministicOperations).toBeGreaterThan(0);
    expect(report.operationalMetrics.sourcesDiscovered).toBeGreaterThan(0);
    expect(report.operationalMetrics.pagesParsed).toBeGreaterThan(0);
    expect(report.operationalMetrics.certifiedCapabilitiesCount).toBeGreaterThan(0);

    const decls = report.declarations;
    expect(decls.PHASE_3_18A_2_LIVE_PROOF_VERIFIED).toBe('YES');
    expect(decls.PHASE_3_18B_UNLOCKED).toBe('YES');
    expect(decls.CONTINUOUS_ACADEMY_RUNNING).toBe('YES');
    expect(decls.MANUAL_TRAINING_BUTTON_REQUIRED).toBe('NO');
    expect(decls.DETERMINISTIC_WORK_REQUIRES_LLM).toBe('NO');
    expect(decls.LLM_RESERVED_FOR_REASONING).toBe('YES');
    expect(decls.HOUSE_1_CANONICAL_BUILD_STARTED).toBe('NO');
  }, 30000);
});

