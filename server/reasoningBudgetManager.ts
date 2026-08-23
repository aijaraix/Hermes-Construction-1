import { QuotaIntegrityEngine } from './quotaIntegrityEngine';

export type TaskType =
  | 'HTTP_RETRIEVAL'
  | 'SHA256_HASH'
  | 'DOCUMENT_PARSING'
  | 'CHUNKING_INDEXING'
  | 'GEOMETRY_CALCULATION'
  | 'FORMULA_CALCULATION'
  | 'UNIT_CONVERSION'
  | 'DETERMINISTIC_VALIDATION'
  | 'QUEUE_SCHEDULING'
  | 'HEARTBEAT_PROCESSING'
  | 'REALITY_SWARM_AUDIT'
  | 'PHYSICS_SIMULATION'
  | 'GROUNDED_FACT_LOOKUP'
  | 'COMPLEX_TECHNICAL_INTERPRETATION'
  | 'AMBIGUOUS_EVIDENCE_RESOLUTION'
  | 'RULE_EXCEPTION_REASONING'
  | 'CROSS_TRADE_COORDINATION'
  | 'SPECIALIST_COMPETENCY_DEMO'
  | 'MANAGER_TECHNICAL_REVIEW'
  | 'INSPECTOR_ADVERSARIAL_REASONING'
  | 'PRIME_ORCHESTRATION_JUDGMENT';

export interface ReasoningJobRecord {
  reasoningJobId: string;
  agentRoleId: string;
  purpose: string;
  reasoningRequiredWhy: string;
  estimatedPriority: 'P0' | 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | 'P6';
  provider: string;
  model: string;
  executionMode: 'DETERMINISTIC_WORK' | 'GROUNDED_KNOWLEDGE_REUSE' | 'DEFERRED_QUOTA' | 'LLM_REASONED';
  resultStatus: string;
  knowledgePackVersion: string;
  timestamp: string;
}

export class ReasoningBudgetManager {
  private static deterministicOperationsCount = 0;
  private static llmReasoningCallsCount = 0;
  private static knowledgeReuseHitsCount = 0;
  private static duplicateReasoningAvoidedCount = 0;
  private static reasoningJobsDeferredCount = 0;
  private static reasoningJobsRecoveredCount = 0;
  private static jobRecords: ReasoningJobRecord[] = [];

  private static readonly DETERMINISTIC_TASK_TYPES: TaskType[] = [
    'HTTP_RETRIEVAL',
    'SHA256_HASH',
    'DOCUMENT_PARSING',
    'CHUNKING_INDEXING',
    'GEOMETRY_CALCULATION',
    'FORMULA_CALCULATION',
    'UNIT_CONVERSION',
    'DETERMINISTIC_VALIDATION',
    'QUEUE_SCHEDULING',
    'HEARTBEAT_PROCESSING',
    'REALITY_SWARM_AUDIT',
    'PHYSICS_SIMULATION',
    'GROUNDED_FACT_LOOKUP'
  ];

  public static canBeCompletedDeterministically(taskType: TaskType): boolean {
    return this.DETERMINISTIC_TASK_TYPES.includes(taskType);
  }

  public static recordDeterministicOperation(operationName: string): void {
    this.deterministicOperationsCount++;
  }

  public static evaluateAndAuthorize(params: {
    agentRoleId: string;
    taskType: TaskType;
    purpose: string;
    reasoningRequiredWhy: string;
    priority?: 'P0' | 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | 'P6';
    knowledgePackVersion?: string;
    hasGroundedAssertionMatch?: boolean;
    groundedAssertionContent?: any;
  }): {
    allowed: boolean;
    executionMode: 'DETERMINISTIC_WORK' | 'GROUNDED_KNOWLEDGE_REUSE' | 'DEFERRED_QUOTA' | 'LLM_REASONED';
    reason: string;
    groundedContent?: any;
  } {
    const priority = params.priority || 'P3';
    const kvVersion = params.knowledgePackVersion || 'v1.0';

    // 1. Check if task can be completed deterministically
    if (this.canBeCompletedDeterministically(params.taskType)) {
      this.deterministicOperationsCount++;
      const record: ReasoningJobRecord = {
        reasoningJobId: `JOB-DET-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        agentRoleId: params.agentRoleId,
        purpose: params.purpose,
        reasoningRequiredWhy: 'Completed via deterministic logic without LLM',
        estimatedPriority: priority,
        provider: 'DeterministicEngine',
        model: 'none',
        executionMode: 'DETERMINISTIC_WORK',
        resultStatus: 'COMPLETED_DETERMINISTICALLY',
        knowledgePackVersion: kvVersion,
        timestamp: new Date().toISOString()
      };
      this.jobRecords.push(record);
      return {
        allowed: false,
        executionMode: 'DETERMINISTIC_WORK',
        reason: 'Task is deterministic. Executed without Gemini LLM call.'
      };
    }

    // 2. Check if grounded knowledge reuse resolves it
    if (params.hasGroundedAssertionMatch && params.groundedAssertionContent) {
      this.knowledgeReuseHitsCount++;
      this.duplicateReasoningAvoidedCount++;
      const record: ReasoningJobRecord = {
        reasoningJobId: `JOB-REUSE-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        agentRoleId: params.agentRoleId,
        purpose: params.purpose,
        reasoningRequiredWhy: 'Resolved from grounded knowledge graph memory',
        estimatedPriority: priority,
        provider: 'KnowledgeGraphMemory',
        model: 'grounded-assertion-cache',
        executionMode: 'GROUNDED_KNOWLEDGE_REUSE',
        resultStatus: 'GROUNDED_CACHE_HIT',
        knowledgePackVersion: kvVersion,
        timestamp: new Date().toISOString()
      };
      this.jobRecords.push(record);
      return {
        allowed: false,
        executionMode: 'GROUNDED_KNOWLEDGE_REUSE',
        reason: 'Resolved directly from grounded construction knowledge graph memory.',
        groundedContent: params.groundedAssertionContent
      };
    }

    // 3. Check if rate-limited / mock quota exhausted
    if (QuotaIntegrityEngine.isMockQuotaExhausted()) {
      this.reasoningJobsDeferredCount++;
      const record: ReasoningJobRecord = {
        reasoningJobId: `JOB-DEF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        agentRoleId: params.agentRoleId,
        purpose: params.purpose,
        reasoningRequiredWhy: params.reasoningRequiredWhy,
        estimatedPriority: priority,
        provider: 'GoogleGemini',
        model: 'gemini-3.7-flash',
        executionMode: 'DEFERRED_QUOTA',
        resultStatus: 'QUEUED_DEFERRED',
        knowledgePackVersion: kvVersion,
        timestamp: new Date().toISOString()
      };
      this.jobRecords.push(record);
      return {
        allowed: false,
        executionMode: 'DEFERRED_QUOTA',
        reason: 'Reasoning provider rate limited or quota exhausted (429). Enqueued in Deferred Reasoning Queue.'
      };
    }

    // 4. Authorize real LLM reasoning
    this.llmReasoningCallsCount++;
    const record: ReasoningJobRecord = {
      reasoningJobId: `JOB-LLM-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      agentRoleId: params.agentRoleId,
      purpose: params.purpose,
      reasoningRequiredWhy: params.reasoningRequiredWhy,
      estimatedPriority: priority,
      provider: 'GoogleGemini',
      model: 'gemini-3.7-flash',
      executionMode: 'LLM_REASONED',
      resultStatus: 'AUTHORIZED_LLM_EXECUTION',
      knowledgePackVersion: kvVersion,
      timestamp: new Date().toISOString()
    };
    this.jobRecords.push(record);

    return {
      allowed: true,
      executionMode: 'LLM_REASONED',
      reason: 'Task requires genuine specialist reasoning. Authorized Gemini LLM call.'
    };
  }

  public static recordRecoveredJob(): void {
    this.reasoningJobsRecoveredCount++;
  }

  public static getMetrics() {
    const deterministicToLlmRatio =
      this.llmReasoningCallsCount === 0
        ? `${this.deterministicOperationsCount}:0`
        : `${(this.deterministicOperationsCount / this.llmReasoningCallsCount).toFixed(1)}:1`;

    const totalRequests =
      this.deterministicOperationsCount +
      this.llmReasoningCallsCount +
      this.knowledgeReuseHitsCount;

    const knowledgeReuseRatePct =
      totalRequests === 0
        ? 0
        : Math.round((this.knowledgeReuseHitsCount / totalRequests) * 100);

    return {
      deterministicOperations: this.deterministicOperationsCount,
      llmReasoningCalls: this.llmReasoningCallsCount,
      knowledgeReuseHits: this.knowledgeReuseHitsCount,
      duplicateReasoningAvoided: this.duplicateReasoningAvoidedCount,
      reasoningJobsDeferred: this.reasoningJobsDeferredCount,
      reasoningJobsRecovered: this.reasoningJobsRecoveredCount,
      deterministicToLlmRatio,
      knowledgeReuseRatePct,
      llmCallsPerAgentAdvancement: this.llmReasoningCallsCount > 0 ? Number((this.llmReasoningCallsCount / 50).toFixed(2)) : 0
    };
  }

  public static getJobHistory(): ReasoningJobRecord[] {
    return [...this.jobRecords];
  }
}
