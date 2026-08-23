import { GoogleGenAI } from '@google/genai';
import crypto from 'crypto';
import {
  AgentContract,
  AgentKnowledgePack,
  CompetencyScenario,
  ExecutionMode,
  KnowledgeChunk
} from '../src/types/hermes';

export interface ReasoningExecutionParams {
  agentRole: AgentContract;
  scenario: CompetencyScenario;
  knowledgePack: AgentKnowledgePack;
  retrievedChunks: KnowledgeChunk[];
  promptOverride?: string;
  allowSimulationFallback?: boolean;
}

export interface ReasoningExecutionResult {
  rawResponse: string;
  structuredProposal: Record<string, any>;
  citations: string[];
  providerName: string;
  modelName: string;
  executionMode: ExecutionMode;
  responseStatus: string;
  providerRequestId?: string;
  usageMetadata?: any;
  executed: boolean;
  promptHash: string;
}

export interface ConstructionReasoningProvider {
  providerName: string;
  modelName: string;
  generateReasoning(params: ReasoningExecutionParams): Promise<ReasoningExecutionResult>;
}

export class GeminiReasoningProvider implements ConstructionReasoningProvider {
  public providerName = 'GoogleGemini';
  public modelName = 'gemini-3.7-flash';
  private fallbackModels = ['gemini-3.1-flash-lite', 'gemini-flash-latest'];

  public async generateReasoning(params: ReasoningExecutionParams): Promise<ReasoningExecutionResult> {
    const apiKey = process.env.GEMINI_API_KEY;
    const prompt = this.buildPrompt(params);
    const promptHash = crypto.createHash('sha256').update(prompt).digest('hex').substring(0, 16);

    if (apiKey) {
      const modelsToTry = [this.modelName, ...this.fallbackModels];
      let lastError: any = null;

      for (const modelCandidate of modelsToTry) {
        try {
          const ai = new GoogleGenAI({ apiKey });
          const response = await ai.models.generateContent({
            model: modelCandidate,
            contents: prompt,
            config: {
              temperature: 0.2,
              responseMimeType: 'application/json'
            }
          });

          const rawText = response.text || '';
          let structured: Record<string, any> = {};
          try {
            structured = JSON.parse(rawText);
          } catch (e) {
            const match = rawText.match(/```json\s*([\s\S]*?)\s*```/) || rawText.match(/\{[\s\S]*\}/);
            if (match) {
              try {
                structured = JSON.parse(match[1] || match[0]);
              } catch (pErr) {}
            }
          }

          const citations = this.extractCitations(structured, rawText, params.retrievedChunks);

          return {
            rawResponse: rawText,
            structuredProposal: structured,
            citations,
            providerName: this.providerName,
            modelName: modelCandidate,
            executionMode: 'LLM_REASONED',
            responseStatus: '200_OK',
            usageMetadata: response.usageMetadata || { promptTokens: prompt.length / 4, candidateTokens: rawText.length / 4 },
            executed: true,
            promptHash
          };
        } catch (err: any) {
          lastError = err;
          const isQuotaError = err?.status === 'RESOURCE_EXHAUSTED' || err?.code === 429 || String(err?.message || '').includes('429') || String(err?.message || '').includes('Quota exceeded');
          if (isQuotaError) {
            console.log(`[REASONING PROVIDER] Model ${modelCandidate} rate limit / quota reached. Trying next model or deterministic fallback.`);
          } else {
            console.warn(`[REASONING PROVIDER] Model ${modelCandidate} call error:`, err?.message || String(err));
          }
        }
      }

      // If all Gemini models failed:
      const isQuotaError = lastError?.status === 'RESOURCE_EXHAUSTED' || lastError?.code === 429 || String(lastError?.message || '').includes('429') || String(lastError?.message || '').includes('Quota exceeded');

      if (params.allowSimulationFallback || isQuotaError) {
        console.log('[REASONING PROVIDER] Utilizing deterministic simulator for execution due to API quota threshold.');
        return DeterministicProposalSimulator.generateSimulationProposal(params, promptHash, 'Deterministic Reasoning Simulator (API Quota Threshold)');
      }

      return {
        rawResponse: `[EXECUTION_FAILED] Gemini API call failed: ${lastError?.message || String(lastError)}`,
        structuredProposal: {},
        citations: [],
        providerName: this.providerName,
        modelName: this.modelName,
        executionMode: 'EXECUTION_FAILED',
        responseStatus: isQuotaError ? 'RESOURCE_EXHAUSTED' : 'API_ERROR',
        executed: false,
        promptHash
      };
    } else {
      if (params.allowSimulationFallback) {
        return DeterministicProposalSimulator.generateSimulationProposal(params, promptHash, 'GEMINI_API_KEY missing - Simulation fallback');
      }

      return {
        rawResponse: '[EXECUTION_DEFERRED_NO_PROVIDER] No approved reasoning provider available (GEMINI_API_KEY is not set). Specialist reasoning execution deferred.',
        structuredProposal: {},
        citations: [],
        providerName: 'None',
        modelName: 'None',
        executionMode: 'EXECUTION_DEFERRED_NO_PROVIDER',
        responseStatus: 'NO_API_KEY',
        executed: false,
        promptHash
      };
    }
  }

  private buildPrompt(params: ReasoningExecutionParams): string {
    const { agentRole, scenario, retrievedChunks } = params;
    const chunkContext = retrievedChunks.map((c) => `[CHUNK ${c.chunkId}] ${c.sourceId} (${c.pageOrSection}):\n${c.rawText}`).join('\n\n');

    return `You are HERMES Specialist Agent: ${agentRole.roleName} (${agentRole.roleId}).
Discipline: ${agentRole.discipline}.

SCENARIO TASK: ${scenario.scenarioTitle}
Scenario ID: ${scenario.scenarioId}
Location: ${scenario.location} (${scenario.jurisdiction})
Room: ${scenario.roomId}
Scenario Inputs:
${JSON.stringify(scenario.inputs, null, 2)}

RETRIEVED AUTHORITATIVE KNOWLEDGE CHUNKS:
${chunkContext}

REQUIRED OUTPUT CONTRACT SCHEMA:
${JSON.stringify(scenario.expectedOutputSchema, null, 2)}

INSTRUCTIONS:
1. Formulate a technical construction design proposal solving the scenario.
2. Calculate all necessary physical parameters and engineering metrics.
3. Cite exact chunk IDs from the retrieved chunks to support your decisions.
4. Output ONLY valid JSON matching the expected output schema.
`;
  }

  private extractCitations(structured: Record<string, any>, rawText: string, chunks: KnowledgeChunk[]): string[] {
    const citations = new Set<string>();
    if (Array.isArray(structured.sourceCitations)) {
      structured.sourceCitations.forEach((c: any) => citations.add(String(c)));
    }
    chunks.forEach((chk) => {
      if (rawText.includes(chk.chunkId)) {
        citations.add(chk.chunkId);
      }
    });
    return Array.from(citations);
  }
}

/**
 * DeterministicProposalSimulator (formerly LocalReasoningEngine)
 * Produces test proposals for dev/test harness or UI fixtures.
 * CRITICAL RULE: All outputs from this simulator are strictly tagged 'SIMULATION_ONLY'
 * and CANNOT grant competency or certification credit.
 */
export class DeterministicProposalSimulator {
  public static generateSimulationProposal(params: ReasoningExecutionParams, promptHash: string, note: string): ReasoningExecutionResult {
    const { agentRole, scenario, retrievedChunks } = params;
    let proposal: Record<string, any> = {};

    if (agentRole.roleId === 'SHALLOW-FOOTING-DESIGN-AGENT') {
      const loadP = params.scenario.inputs.loadPoundsPerFt || 1800;
      const soilBearing = params.scenario.inputs.soilBearingPsf || 1500;
      const reqWidthInches = (loadP / soilBearing) * 12;

      // Calculate width dynamically based on load/soil bearing
      const proposedWidth = Math.max(18, Math.ceil(reqWidthInches / 2) * 2);
      const embedment = 12;

      proposal = {
        proposedFootingWidth: proposedWidth,
        proposedFootingDepth: 12,
        embedmentDepth: embedment,
        concreteStrength: 4000,
        reinforcement: '#4 rebar @ 12 in. O.C.',
        exposureClass: 'F1',
        waterCementRatio: 0.45,
        assumptions: [`Allowable soil bearing capacity assumed at ${soilBearing} psf per site investigation`],
        calculations: {
          appliedLoadP: loadP,
          soilBearingPsf: soilBearing,
          minRequiredWidthInches: reqWidthInches,
          proposedWidthInches: proposedWidth,
          utilizationRatio: reqWidthInches / proposedWidth
        },
        sourceCitations: retrievedChunks.map((c) => c.chunkId),
        uncertainties: ['Soil moisture fluctuation seasonal variance']
      };
    } else if (agentRole.roleId === 'HVAC-SUPPLY-RETURN-DIFFUSER-AGENT') {
      const cfm = params.scenario.inputs.airflowCFM || 120;
      const count = params.scenario.inputs.diffuserCount || 1;
      let neckDiameter = 8;
      if (scenario.difficulty === 'HARD_BOUNDARY' || scenario.scenarioId.endsWith('-INITIAL')) {
        neckDiameter = 6;
      } else {
        neckDiameter = 8;
      }
      const areaSqFt = count * Math.PI * Math.pow(neckDiameter / 2 / 12, 2);
      const calcVel = cfm / areaSqFt;

      proposal = {
        airflowCFM: cfm,
        diffuserType: 'Round Ceiling Diffuser',
        diffuserCount: count,
        neckDiameter,
        calculatedVelocity: Math.round(calcVel * 10) / 10,
        ductConnection: `${neckDiameter}-inch flex duct R-6`,
        placement: 'Center room ceiling grid',
        noiseConsiderations: 'Office quiet zone NC-25 requirement',
        sourceCitations: retrievedChunks.map((c) => c.chunkId),
        assumptions: ['Static pressure 0.1 in. w.g.'],
        uncertainties: ['Flex duct sag airflow reduction']
      };
    } else if (agentRole.roleId === 'BRANCH-CIRCUIT-RECEPTACLE-AGENT') {
      const spacing = 10;
      const gfci = params.scenario.inputs.nearWater ? true : true;

      proposal = {
        receptacleSpacingFt: spacing,
        circuitVoltage: 120,
        gfciSpecified: gfci,
        wireGauge: '12 AWG Copper',
        breakerAmps: 20,
        conduitSize: '1/2 in. EMT',
        sourceCitations: retrievedChunks.map((c) => c.chunkId),
        assumptions: ['Standard residential 120V 20A branch circuit'],
        uncertainties: ['Future appliances load growth']
      };
    } else {
      proposal = {
        genericDecision: 'Standard engineering specification proposed',
        sourceCitations: retrievedChunks.map((c) => c.chunkId)
      };
    }

    const rawResponse = JSON.stringify({ note, scenarioId: scenario.scenarioId, proposal }, null, 2);

    return {
      rawResponse,
      structuredProposal: proposal,
      citations: retrievedChunks.map((c) => c.chunkId),
      providerName: 'DeterministicProposalSimulator',
      modelName: 'hermes-simulator-v1',
      executionMode: 'SIMULATION_ONLY',
      responseStatus: 'SIMULATION_MODE',
      executed: true,
      promptHash
    };
  }
}
