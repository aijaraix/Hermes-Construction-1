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
    status: 'ONLINE' | 'LLM_PROVIDER_UNAVAILABLE';
    hasApiKey: boolean;
    activeProvider: string;
    deterministicFallbackActive: boolean;
    competencyAllowedForDeterministic: boolean;
    instructions: string;
  } {
    const hasKey = this.isGeminiKeyConfigured();
    return {
      status: hasKey ? 'ONLINE' : 'LLM_PROVIDER_UNAVAILABLE',
      hasApiKey: hasKey,
      activeProvider: hasKey ? 'Google Gemini 2.5 Flash / Pro' : 'DeterministicProposalSimulator (Fallback)',
      deterministicFallbackActive: !hasKey,
      competencyAllowedForDeterministic: false, // MUST BE NO
      instructions: hasKey
        ? 'Gemini API key is configured and active.'
        : 'GEMINI_API_KEY is not configured in the environment. System is operating safely via deterministic proposal heuristics. Deterministic outputs are marked and excluded from LLM reasoning competency metrics.'
    };
  }

  public static auditReasoningCall(
    requestId: string,
    requestedCategory: ReasoningExecutionCategory
  ): ReasoningExecutionAudit {
    const hasKey = this.isGeminiKeyConfigured();
    const timestamp = new Date().toISOString();

    if (requestedCategory === 'LLM_REASONING') {
      if (hasKey) {
        const audit: ReasoningExecutionAudit = {
          requestId,
          category: 'LLM_REASONING',
          providerUsed: 'Google Gemini API',
          isLlmReasoning: true,
          countsTowardCompetency: true,
          timestamp,
          reason: 'Live Gemini LLM reasoning call executed successfully.'
        };
        this.auditLogs.push(audit);
        return audit;
      } else {
        // Fallback to deterministic simulation
        const audit: ReasoningExecutionAudit = {
          requestId,
          category: 'DETERMINISTIC_EXECUTION',
          providerUsed: 'DeterministicProposalSimulator',
          isLlmReasoning: false,
          countsTowardCompetency: false, // MUST BE NO
          timestamp,
          reason: 'GEMINI_API_KEY not configured. Executed deterministic simulation fallback. Competency credit denied.'
        };
        this.auditLogs.push(audit);
        return audit;
      }
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
