import {
  AgentContract,
  AgentExecutionRecord,
  AgentKnowledgePack,
  CompetencyScenario,
  KnowledgeChunk,
  ValidationResult,
  Claim
} from '../src/types/hermes';
import { ScenarioAiRuntime, type ScenarioAiOptions } from './ai/scenarioRuntime';
import { aiRunToClaim, attachAiValidation, type AiRun } from './ai/aiRun';
import { randomUUID } from 'node:crypto';
import {
  ElectricalValidator,
  FoundationValidator,
  HVACValidator,
  GenericValidator,
  IndependentValidator
} from './validators';

export class AgentExecutionService {
  private static executionHistory: AgentExecutionRecord[] = [];
  private static runtime = new ScenarioAiRuntime();
  private static aiRuns: AiRun[] = [];
  /** Trusted composition seam; no HTTP endpoint exposes provider or policy registration. */
  public static configureAiRuntime(runtime:ScenarioAiRuntime) {this.runtime=runtime;}

  public static async executeAgentScenario(params: {
    agentRole: AgentContract;
    scenario: CompetencyScenario;
    knowledgePack: AgentKnowledgePack;
    retrievedChunks: KnowledgeChunk[];
    allowSimulationFallback?: boolean;
    forceSimulationMode?: boolean;
    ai?: ScenarioAiOptions;
  }): Promise<{ executionRecord: AgentExecutionRecord; validation: ValidationResult; aiRun?:AiRun; proposedClaims?:Claim[] }> {
    const { agentRole, scenario, knowledgePack, retrievedChunks, allowSimulationFallback, forceSimulationMode } = params;
    const startedAt = new Date().toISOString();
    const executionId = `EXEC-${agentRole.roleId}-${randomUUID()}`;

    // 1. Invoke Model Reasoning Provider
    const routed = await this.runtime.execute({
      agentRole,
      scenario,
      knowledgePack,
      retrievedChunks,
      allowSimulationFallback,
      forceSimulationMode
    },params.ai);
    const reasoningResult=routed.reasoning;

    const completedAt = new Date().toISOString();

    // 2. Create Execution Record
    const executionRecord: AgentExecutionRecord = {
      executionId,
      agentRoleId: agentRole.roleId,
      executionMode: reasoningResult.executionMode,
      modelProvider: reasoningResult.providerName,
      modelName: reasoningResult.modelName,
      scenarioId: scenario.scenarioId,
      knowledgePackId: knowledgePack.packId,
      retrievedChunkIds: retrievedChunks.map((c) => c.chunkId),
      promptHash: reasoningResult.promptHash,
      rawResponse: reasoningResult.rawResponse,
      structuredProposal: reasoningResult.structuredProposal,
      citations: reasoningResult.citations,
      toolCalls: routed.run?.toolCalls??[],
      aiRunId: routed.run?.runId,
      startedAt,
      completedAt,
      usageMetadata: reasoningResult.usageMetadata,
      providerRequestId: reasoningResult.providerRequestId,
      responseStatus: reasoningResult.responseStatus,
      executionStatus: reasoningResult.executed
        ? 'EXECUTED'
        : reasoningResult.executionMode === 'EXECUTION_FAILED' || reasoningResult.executionMode === 'FAILED_PROVIDER'
        ? 'FAILED'
        : 'NOT_EXECUTED'
    };

    this.executionHistory.push(executionRecord);

    // STRICT MANDATORY RULE (PHASE 3.18A.2):
    // Only 'LLM_REASONED' executions may count toward reasoning competency, SME competency, shadow qualification, certification, or House #1 readiness.
    if (
      executionRecord.executionMode === 'DEFERRED_QUOTA' ||
      executionRecord.executionMode === 'EXECUTION_DEFERRED_NO_PROVIDER' ||
      executionRecord.executionMode === 'FAILED_PROVIDER' ||
      executionRecord.executionMode === 'EXECUTION_FAILED' ||
      executionRecord.executionMode === 'NOT_EXECUTED' ||
      executionRecord.executionStatus !== 'EXECUTED'
    ) {
      const emptyValidation: ValidationResult = {
        validationId: `VAL-NONE-${Date.now()}`,
        executionId,
        scenarioId: scenario.scenarioId,
        agentRoleId: agentRole.roleId,
        reasoningScorePct: 0,
        calculationScorePct: 0,
        sourceGroundingPct: 0,
        constraintCompliancePct: 0,
        uncertaintyHandlingPct: 0,
        completenessPct: 0,
        assumptionQualityPct: 0,
        mathScorePct: 0,
        codeCompliancePct: 0,
        overallScorePct: 0,
        passed: false,
        criticalFailure: true,
        criticalFailureReason:
          executionRecord.executionMode === 'DEFERRED_QUOTA'
            ? 'REASONING EXECUTION DEFERRED (QUOTA EXHAUSTED): Eligible providers unavailable. Job queued for replay upon provider recovery. Competency credit denied.'
            : executionRecord.executionMode === 'EXECUTION_DEFERRED_NO_PROVIDER'
            ? 'REASONING EXECUTION DEFERRED: No approved provider satisfies the capability policy. Competency credit denied.'
            : 'REASONING EXECUTION FAILED: Reasoning provider execution error. Competency credit denied.',
        calculatedMetrics: {},
        violations: [
          `Specialist reasoning did not execute on an approved reasoning provider (${executionRecord.executionMode}). Competency credit denied.`
        ],
        unsupportedCitations: [],
        validatedAt: completedAt
      };
      const aiRun=routed.run?attachAiValidation(routed.run,emptyValidation):undefined;if(aiRun)this.aiRuns.push(structuredClone(aiRun));
      return { executionRecord, validation: emptyValidation, aiRun };
    }

    // 3. Select Independent Validator
    const validator = this.selectValidatorForRole(agentRole.roleId);

    // 4. Run Independent Deterministic Evaluation
    const validation = validator.validate(scenario, executionRecord, retrievedChunks);

    // If executionMode is DETERMINISTIC_SIMULATION or SIMULATION_ONLY:
    // It may calculate a sandbox/simulation score for continuity, BUT passed MUST be false for competency/certification!
    if (
      executionRecord.executionMode === 'DETERMINISTIC_SIMULATION' ||
      executionRecord.executionMode === 'SIMULATION_ONLY'
    ) {
      validation.violations.unshift(
        'DETERMINISTIC_SIMULATION EXECUTION: Simulation score generated for workflow continuity only. CANNOT grant SME competency, certification, shadow qualification, or House #1 readiness credit.'
      );
      validation.passed = false;
    }

    let aiRun=routed.run?attachAiValidation(routed.run,validation):undefined;const proposedClaims:Claim[]=[];
    if(aiRun?.executionKind==='MODEL'&&aiRun.executionStatus==='SUCCEEDED'&&params.ai?.projectId&&params.ai?.projectRevisionId&&params.ai?.subjectEntityId&&params.ai?.realityClass) {
      const claim=aiRunToClaim(aiRun,params.ai.subjectEntityId,params.ai.realityClass);proposedClaims.push(claim);aiRun={...aiRun,outputClaimIds:[claim.claimId]};
    }
    if(aiRun)this.aiRuns.push(structuredClone(aiRun));
    return { executionRecord, validation, aiRun, proposedClaims };
  }

  private static selectValidatorForRole(agentRoleId: string): IndependentValidator {
    if (agentRoleId.includes('FOOTING') || agentRoleId.includes('SHALLOW')) {
      return new FoundationValidator();
    }
    if (agentRoleId.includes('HVAC') || agentRoleId.includes('DIFFUSER') || agentRoleId.includes('DUCT')) {
      return new HVACValidator();
    }
    if (agentRoleId.includes('RECEPTACLE') || agentRoleId.includes('BRANCH') || agentRoleId.includes('ELECTRICAL')) {
      return new ElectricalValidator();
    }
    return new GenericValidator();
  }

  public static getExecutionHistory(): AgentExecutionRecord[] {
    return [...this.executionHistory];
  }
  public static getAiRuns(): AiRun[] {return structuredClone(this.aiRuns);}

  public static getExecution(executionId: string): AgentExecutionRecord | undefined {
    return this.executionHistory.find((e) => e.executionId === executionId);
  }
}
