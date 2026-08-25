export type ReasoningExecutionCategory =
  | 'LLM_REASONING'
  | 'DETERMINISTIC_EXECUTION'
  | 'KNOWLEDGE_RETRIEVAL'
  | 'CACHED_REASONING'
  | 'RULE_ENGINE'
  | 'CALCULATION_ENGINE';

export interface ReasoningExecutionAudit {
  requestId: string;
  category: ReasoningExecutionCategory;
  providerUsed: string;
  isLlmReasoning: boolean;
  countsTowardCompetency: boolean;
  timestamp: string;
  reason: string;
}

export class ReasoningGatingEngine {
  private static auditLogs: ReasoningExecutionAudit[] = [];

  public static isGeminiKeyConfigured(): boolean {
    const key = process.env.GEMINI_API_KEY;
    return !!key && key !== 'MY_GEMINI_API_KEY' && key.trim().length > 0;
  }

  public static getProviderStatus(): {
    status: 'DEFERRED' | 'ONLINE' | 'LLM_PROVIDER_UNAVAILABLE';
    hasApiKey: boolean;
    activeProvider: string;
    llmAutonomousDecisionsEnabled: boolean;
    deterministicFallbackActive: boolean;
    competencyAllowedForDeterministic: boolean;
    instructions: string;
  } {
    const hasKey = this.isGeminiKeyConfigured();
    return {
      status: 'DEFERRED',
      hasApiKey: hasKey,
      activeProvider: 'Hermes Grounded Deterministic Pipeline',
      llmAutonomousDecisionsEnabled: false,
      deterministicFallbackActive: true,
      competencyAllowedForDeterministic: false,
      instructions: 'LLM_PROVIDER_STATUS is DEFERRED per Owner Gate Directive. Autonomous LLM decision-making is strictly disabled. Execution proceeds solely via deterministic rules, physics calculations, and grounded knowledge retrieval.'
    };
  }

  public static auditReasoningCall(
    requestId: string,
    requestedCategory: ReasoningExecutionCategory
  ): ReasoningExecutionAudit {
    const hasKey = this.isGeminiKeyConfigured();
    const timestamp = new Date().toISOString();

    if (requestedCategory === 'LLM_REASONING') {
      const audit: ReasoningExecutionAudit = {
        requestId,
        category: 'DETERMINISTIC_EXECUTION',
        providerUsed: 'DeterministicProposalSimulator (DEFERRED Gate Enforced)',
        isLlmReasoning: false,
        countsTowardCompetency: false,
        timestamp,
        reason: 'LLM_PROVIDER_STATUS is DEFERRED per Owner Gate Directive. Autonomous LLM decision-making blocked; executed deterministic simulation fallback.'
      };
      this.auditLogs.push(audit);
      return audit;
    } else {
      const audit: ReasoningExecutionAudit = {
        requestId,
        category: requestedCategory,
        providerUsed: 'Hermes Rule/Calc Engine',
        isLlmReasoning: false,
        countsTowardCompetency: false,
        timestamp,
        reason: `Standard deterministic system execution: ${requestedCategory}`
      };
      this.auditLogs.push(audit);
      return audit;
    }
  }

  public static getAuditLogs(): ReasoningExecutionAudit[] {
    return [...this.auditLogs];
  }
}
