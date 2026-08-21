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
  }): Promise<{ executionRecord: AgentExecutionRecord; validation: ValidationResult }> {
    const { agentRole, scenario, knowledgePack, retrievedChunks, allowSimulationFallback } = params;
    const startedAt = new Date().toISOString();
    const executionId = `EXEC-${agentRole.roleId}-${Date.now()}`;

    // 1. Invoke Model Reasoning Provider
    const reasoningResult = await this.provider.generateReasoning({
      agentRole,
      scenario,
      knowledgePack,
      retrievedChunks,
      allowSimulationFallback
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

    // STRICT MANDATORY RULE:
    // If executionMode is NOT 'LLM_REASONED' or 'DETERMINISTIC_TOOL' (e.g. EXECUTION_DEFERRED_NO_PROVIDER or EXECUTION_FAILED or NOT_EXECUTED),
    // competency evaluation MUST NOT pass, overallScorePct = 0, passed = false, criticalFailure = true.
    if (
      executionRecord.executionMode === 'EXECUTION_DEFERRED_NO_PROVIDER' ||
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
          executionRecord.executionMode === 'EXECUTION_DEFERRED_NO_PROVIDER'
            ? 'REASONING EXECUTION DEFERRED: No approved reasoning provider available (GEMINI_API_KEY missing). Competency credit denied.'
            : 'REASONING EXECUTION FAILED: Reasoning provider execution error. Competency credit denied.',
        calculatedMetrics: {},
        violations: [
          `Specialist reasoning did not execute on an approved reasoning provider (${executionRecord.executionMode}).`
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

    // If executionMode is SIMULATION_ONLY (explicit simulator), attach warning that result cannot certify competency
    if (executionRecord.executionMode === 'SIMULATION_ONLY') {
      validation.violations.unshift('SIMULATION_ONLY EXECUTION: Simulation evaluation score only. Cannot grant competency certification or shadow mode qualification.');
      // Cannot grant certified pass
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
