import {
  AgentContract,
  AgentExecutionRecord,
  AgentKnowledgePack,
  CompetencyScenario,
  KnowledgeChunk,
  ValidationResult
} from '../src/types/hermes';
import { GeminiReasoningProvider } from './reasoningProvider';
import {
  ElectricalValidator,
  FoundationValidator,
  HVACValidator,
  GenericValidator,
  IndependentValidator
} from './validators';

export class AgentExecutionService {
  private static executionHistory: AgentExecutionRecord[] = [];
  private static provider = new GeminiReasoningProvider();

  public static async executeAgentScenario(params: {
    agentRole: AgentContract;
    scenario: CompetencyScenario;
    knowledgePack: AgentKnowledgePack;
    retrievedChunks: KnowledgeChunk[];
    allowSimulationFallback?: boolean;
    forceSimulationMode?: boolean;
  }): Promise<{ executionRecord: AgentExecutionRecord; validation: ValidationResult }> {
    const { agentRole, scenario, knowledgePack, retrievedChunks, allowSimulationFallback, forceSimulationMode } = params;
    const startedAt = new Date().toISOString();
    const executionId = `EXEC-${agentRole.roleId}-${Date.now()}`;

    // 1. Invoke Model Reasoning Provider
    const reasoningResult = await this.provider.generateReasoning({
      agentRole,
      scenario,
      knowledgePack,
      retrievedChunks,
      allowSimulationFallback,
      forceSimulationMode
    });

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
      toolCalls: [],
      startedAt,
      completedAt,
      usageMetadata: reasoningResult.usageMetadata,
      responseStatus: reasoningResult.responseStatus,
      executionStatus: reasoningResult.executed
        ? 'EXECUTED'
        : reasoningResult.executionMode === 'EXECUTION_FAILED'
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
            ? 'REASONING EXECUTION DEFERRED (QUOTA EXHAUSTED): Gemini 429 rate limit reached across all models. Job queued for automatic replay upon provider recovery. Competency credit denied.'
            : executionRecord.executionMode === 'EXECUTION_DEFERRED_NO_PROVIDER'
            ? 'REASONING EXECUTION DEFERRED: No approved reasoning provider available (GEMINI_API_KEY missing). Competency credit denied.'
            : 'REASONING EXECUTION FAILED: Reasoning provider execution error. Competency credit denied.',
        calculatedMetrics: {},
        violations: [
          `Specialist reasoning did not execute on an approved reasoning provider (${executionRecord.executionMode}). Competency credit denied.`
        ],
        unsupportedCitations: [],
        validatedAt: completedAt
      };
      return { executionRecord, validation: emptyValidation };
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

    return { executionRecord, validation };
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

  public static getExecution(executionId: string): AgentExecutionRecord | undefined {
    return this.executionHistory.find((e) => e.executionId === executionId);
  }
}
