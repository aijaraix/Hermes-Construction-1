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
  }): Promise<{ executionRecord: AgentExecutionRecord; validation: ValidationResult }> {
    const { agentRole, scenario, knowledgePack, retrievedChunks } = params;
    const startedAt = new Date().toISOString();
    const executionId = `EXEC-${agentRole.roleId}-${Date.now()}`;

    // 1. Invoke Model Reasoning Provider
    const reasoningResult = await this.provider.generateReasoning({
      agentRole,
      scenario,
      knowledgePack,
      retrievedChunks
    });

    const completedAt = new Date().toISOString();

    // 2. Create Execution Record
    const executionRecord: AgentExecutionRecord = {
      executionId,
      agentRoleId: agentRole.roleId,
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
      executionStatus: reasoningResult.executed ? 'EXECUTED' : 'NOT_EXECUTED'
    };

    this.executionHistory.push(executionRecord);

    // MANDATORY RULE: If executionStatus is NOT_EXECUTED, return unexecuted validation result (Score = 0)
    if (executionRecord.executionStatus === 'NOT_EXECUTED') {
      const emptyValidation: ValidationResult = {
        validationId: `VAL-NONE-${Date.now()}`,
        executionId,
        scenarioId: scenario.scenarioId,
        agentRoleId: agentRole.roleId,
        mathScorePct: 0,
        codeCompliancePct: 0,
        sourceGroundingPct: 0,
        completenessPct: 0,
        assumptionQualityPct: 0,
        uncertaintyHandlingPct: 0,
        overallScorePct: 0,
        passed: false,
        criticalFailure: true,
        criticalFailureReason: 'NO MODEL EXECUTION OCCURRED. Score calculation skipped.',
        calculatedMetrics: {},
        violations: ['No agent model execution was run for this scenario.'],
        unsupportedCitations: [],
        validatedAt: completedAt
      };
      return { executionRecord, validation: emptyValidation };
    }

    // 3. Select Independent Validator
    const validator = this.selectValidatorForRole(agentRole.roleId);

    // 4. Run Independent Deterministic Evaluation
    const validation = validator.validate(scenario, executionRecord, retrievedChunks);

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
