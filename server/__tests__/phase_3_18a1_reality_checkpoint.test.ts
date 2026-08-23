import { describe, it, expect, beforeAll } from 'vitest';
import { AgentRegistry } from '../agentRegistry';
import { SourceRegistry } from '../sourceRegistry';
import { KnowledgeIngestionEngine } from '../knowledgeIngestionEngine';
import { RealitySwarmEngine } from '../realitySwarmEngine';
import { SandboxExecutionEngine } from '../sandboxExecutionEngine';
import { LearningPersistence } from '../persistence/learningPersistence';

describe('Phase 3.18A.1 — SME Academy Reality Checkpoint & Learning Proof Test Suite', () => {
  beforeAll(async () => {
    await KnowledgeIngestionEngine.initialize();
  }, 90000);

  it('1. Roster Reconciliation: Exactly 50 canonical roles with complete schema fields and explicit category breakdown', () => {
    const roster = KnowledgeIngestionEngine.getCanonicalRoleRecords();
    expect(roster.length).toBe(50);

    const specialists = roster.filter((r) => r.role_type === 'SPECIALIST_LEARNING');
    const managers = roster.filter((r) => r.role_type === 'MANAGER_LEARNING');
    const inspectors = roster.filter((r) => r.role_type === 'INSPECTOR_LEARNING');
    const orchestration = roster.filter((r) => r.role_type === 'SYSTEM_ORCHESTRATION');

    expect(specialists.length).toBe(25);
    expect(managers.length).toBe(19);
    expect(inspectors.length).toBe(2);
    expect(orchestration.length).toBe(4);

    for (const record of roster) {
      expect(record.agent_id).toBeTruthy();
      expect(record.agent_name).toBeTruthy();
      expect(record.role_type).toBeTruthy();
      expect(record.discipline).toBeTruthy();
      expect(record.manager_id).toBeTruthy();
      expect(record.specialist_or_manager).toBeTruthy();
      expect(record.curriculum_id).toBeTruthy();
      expect(record.source_plan_id).toBeTruthy();
      expect(record.knowledge_pack_id).toBeTruthy();
      expect(record.academy_status).toBeTruthy();
      expect(record.competencyBreakdown).toBeDefined();
      expect(record.competencyBreakdown.knowledgeCoverage).toBeGreaterThan(0);
      expect(record.competencyBreakdown.overallReadinessScore).toBeGreaterThan(0);
    }
  });

  it('2. Curricula Reconciliation: 50 curricula assigned, 0 orphans, 0 duplicates', () => {
    const recon = KnowledgeIngestionEngine.getCurriculaReconciliation();
    expect(recon.assigned).toBe(50);
    expect(recon.orphan).toBe(0);
    expect(recon.duplicate).toBe(0);
    expect(recon.totalTopics).toBeGreaterThanOrEqual(250);
  });

  it('3. Authoritative Source Ingestion & Rights Status Verification', () => {
    const sources = KnowledgeIngestionEngine.getAuthoritativeSourceLifecycleRecords();
    expect(sources.length).toBeGreaterThanOrEqual(10);

    const rightsRestricted = sources.filter((s) => s.retrieval_status === 'RIGHTS_RESTRICTED');
    for (const r of rightsRestricted) {
      expect(r.pages_parsed).toBe(0);
      expect(r.chunks_created).toBe(0);
      expect(r.knowledge_entities_extracted).toBe(0);
      expect(r.document_sha256).toBeUndefined();
    }

    const fetched = sources.filter((s) => s.retrieval_status === 'FETCHED' || s.retrieval_status === 'VALIDATED');
    expect(fetched.length).toBeGreaterThanOrEqual(5);
    for (const f of fetched) {
      expect(f.pages_parsed).toBeGreaterThan(0);
      expect(f.chunks_created).toBeGreaterThan(0);
      expect(f.document_sha256).toBeTruthy();
    }
  });

  it('4. Detailed Knowledge Coverage Maps: Steel & Core Trade Disciplines', () => {
    const steelMap = KnowledgeIngestionEngine.getCoverageMapForAgent('STRUCTURAL-STEEL-DESIGN-AGENT');
    expect(steelMap.agentRoleId).toBe('STRUCTURAL-STEEL-DESIGN-AGENT');
    expect(steelMap.topics.length).toBeGreaterThanOrEqual(6);

    const steelTopicNames = steelMap.topics.map((t) => t.curriculumTopic);
    expect(steelTopicNames.some((t) => t.includes('Metallurgical Grading') || t.includes('Steel Families'))).toBe(true);
    expect(steelTopicNames.some((t) => t.includes('Chemical Composition') || t.includes('Alloy'))).toBe(true);
    expect(steelTopicNames.some((t) => t.includes('Galvanization') || t.includes('Corrosion'))).toBe(true);
    expect(steelTopicNames.some((t) => t.includes('Welding'))).toBe(true);
  });

  it('5. Deterministic Specialist Sandboxes & Independent Inspector Sweeps', () => {
    const runResult = SandboxExecutionEngine.runElectricalSandbox('BRANCH-CIRCUIT-RECEPTACLE-AGENT', {
      roomLengthFt: 18,
      roomWidthFt: 14,
      wallHeightFt: 9,
      panelVoltage: 120,
      circuitAmpacity: 20,
      wireGaugeAWG: 14, // 14 AWG on 20A breaker fails continuous load / ampacity
      oneWayDistanceFt: 120, // Long run triggers voltage drop failure
      loadAmps: 18,
      receptacleCount: 2 // Insufficient receptacles triggers spacing failure
    });

    expect(runResult.sandboxRunId).toBeTruthy();
    expect(runResult.validatorOutput.passed).toBe(false);
    expect(runResult.validatorOutput.violations.length).toBeGreaterThan(0);
  });

  it('6. Unattended Scheduler Proof: At least 10 consecutive cycles logged', () => {
    const proof = KnowledgeIngestionEngine.getUnattendedSchedulerProof();
    expect(proof.length).toBeGreaterThanOrEqual(10);

    for (let i = 0; i < proof.length; i++) {
      expect(proof[i].cycleNumber).toBeDefined();
      expect(proof[i].timestamp).toBeTruthy();
      expect(proof[i].agentSelected).toBeTruthy();
      expect(proof[i].reasonSelected).toBeTruthy();
      expect(proof[i].activityPerformed).toBeTruthy();
      expect(proof[i].result).toBeTruthy();
      expect(proof[i].stateChange).toBeTruthy();
      expect(proof[i].nextRecommendedAction).toBeTruthy();
    }
  });

  it('7. Phase 3.18A.1 Master Report & Exit Gates Validation', () => {
    const report = KnowledgeIngestionEngine.getPhase318A1Report();
    expect(report.reportTimestamp).toBeTruthy();
    expect(report.canonicalRoles.totalCount).toBe(50);
    expect(report.canonicalRoles.specialistsCount).toBe(25);
    expect(report.canonicalRoles.managersCount).toBe(19);
    expect(report.canonicalRoles.inspectorsCount).toBe(2);
    expect(report.canonicalRoles.orchestrationCount).toBe(4);

    expect(report.curriculaStats.assigned).toBe(50);
    expect(report.curriculaStats.orphan).toBe(0);
    expect(report.curriculaStats.duplicate).toBe(0);

    expect(report.exitGates.ROSTER_RECONCILIATION_PASS).toBe(true);
    expect(report.exitGates.CURRICULUM_RECONCILIATION_PASS).toBe(true);
    expect(report.exitGates.SOURCE_PROVENANCE_PASS).toBe(true);
    expect(report.exitGates.REAL_RETRIEVAL_PASS).toBe(true);
    expect(report.exitGates.PERSISTENCE_RESTART_PASS).toBe(true);
    expect(report.exitGates.REALITY_SWARM_ACADEMY_AUDIT_PASS).toBe(true);
    expect(report.exitGates.SANDBOX_EXECUTION_PASS).toBe(true);
    expect(report.exitGates.UNATTENDED_SCHEDULER_PROOF_PASS).toBe(true);
  });
});
