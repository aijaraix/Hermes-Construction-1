import {
  AgentContract,
  AgentKnowledgePack,
  CompetencyScenario,
  KnowledgeChunk,
  ShadowWorkProposal,
  ValidationResult
} from '../src/types/hermes';
import { AgentExecutionService } from './agentExecutionService';

export class ShadowModeEngine {
  private static shadowProposals: ShadowWorkProposal[] = [];

  public static async executeShadowScenario(params: {
    agentRole: AgentContract;
    knowledgePack: AgentKnowledgePack;
    availableChunks: KnowledgeChunk[];
    baseScenario: CompetencyScenario;
    allowSimulationFallback?: boolean;
  }): Promise<{ proposal: ShadowWorkProposal; validation: ValidationResult }> {
    const { agentRole, knowledgePack, availableChunks, baseScenario, allowSimulationFallback } = params;

    // Create a distinct SHADOW scenario (different ID, room, parameters)
    const shadowScenarioId = `SCENARIO-SHADOW-${agentRole.roleId}-${Date.now()}`;
    const shadowScenario: CompetencyScenario = {
      ...baseScenario,
      scenarioId: shadowScenarioId,
      scenarioTitle: `[SHADOW MODE] ${baseScenario.scenarioTitle} - Room 305 Verification`,
      roomId: 'ROOM-305',
      // Fresh problem inputs (NO PRE-PACKAGED AGENT DECISIONS / ANSWERS!)
      inputs: this.generateFreshShadowInputs(agentRole.roleId, baseScenario.inputs),
      createdAt: new Date().toISOString()
    };

    // Dispatch shadow scenario to Agent Execution Service for a FRESH Specialist Reasoning Call
    const execution = await AgentExecutionService.executeAgentScenario({
      agentRole,
      scenario: shadowScenario,
      knowledgePack,
      retrievedChunks: availableChunks,
      allowSimulationFallback
    });

    const validation = execution.validation;
    const passed = validation.passed && execution.executionRecord.executionMode === 'LLM_REASONED';

    const proposal: ShadowWorkProposal = {
      proposalId: `SHADOW-${agentRole.roleId}-${Date.now()}`,
      agentRoleId: agentRole.roleId,
      taskStage: 'EXCAVATION_FOOTINGS',
      scope: `Room 305 Shadow Evaluation - ${agentRole.roleName}`,
      proposedAction: `Fresh shadow proposal for Room 305 [Mode: ${execution.executionRecord.executionMode}]: ${JSON.stringify(
        execution.executionRecord.structuredProposal
      )}`,
      proposedBimComponentIds: ['ROOM-305-SPEC'],
      benchmarkComparison: `Independent validator score: ${validation.overallScorePct}%. Mode: ${execution.executionRecord.executionMode}. Status: ${
        passed ? 'PASSED_SHADOW' : 'FAILED_SHADOW'
      }.`,
      managerReviewStatus: passed ? 'PASSED_SHADOW' : 'FAILED_SHADOW',
      evalNotes:
        validation.violations.length > 0
          ? `Shadow run notes [${execution.executionRecord.executionMode}]: ${validation.violations.join('; ')}`
          : 'Shadow run passed independent validation with genuine reasoning execution.',
      timestamp: new Date().toISOString()
    };

    this.shadowProposals.push(proposal);
    return { proposal, validation };
  }

  /**
   * Generates FRESH problem inputs for Shadow Scenarios.
   * STRICT RULE: MUST NOT contain pre-packaged agent decisions (such as agentDecisionWidth, agentDecisionNeckDiameter, agentDecisionSpacingFt, agentDecisionGfci).
   */
  private static generateFreshShadowInputs(agentRoleId: string, baseInputs: Record<string, any>): Record<string, any> {
    const cleanInputs = { ...baseInputs };
    // Remove any legacy preset answer fields if present
    delete cleanInputs.agentDecisionWidth;
    delete cleanInputs.agentDecisionEmbedment;
    delete cleanInputs.agentDecisionNeckDiameter;
    delete cleanInputs.agentDecisionSpacingFt;
    delete cleanInputs.agentDecisionGfci;

    if (agentRoleId === 'SHALLOW-FOOTING-DESIGN-AGENT') {
      return {
        ...cleanInputs,
        loadPoundsPerFt: 2200, // Higher load requiring >17.6 in. width
        soilBearingPsf: 1500,
        minEmbedmentInches: 12,
        concreteCompressiveStrengthPsi: 4000
      };
    } else if (agentRoleId === 'HVAC-SUPPLY-RETURN-DIFFUSER-AGENT') {
      return {
        ...cleanInputs,
        airflowCFM: 160, // Higher airflow
        roomCategory: 'Executive Boardroom NC-25 Quiet Zone',
        maxNeckVelocityFpm: 500,
        diffuserCount: 1
      };
    } else if (agentRoleId === 'BRANCH-CIRCUIT-RECEPTACLE-AGENT') {
      return {
        ...cleanInputs,
        wallLengthFt: 14,
        distanceToWaterSinkFt: 4, // Within 6 ft -> GFCI mandatory per NEC 210.8(A)
        circuitAmps: 20,
        voltage: 120
      };
    }
    return cleanInputs;
  }

  public static getProposals(): ShadowWorkProposal[] {
    return [...this.shadowProposals];
  }
}
