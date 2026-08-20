import {
  AgentExecutionRecord,
  CompetencyScenario,
  KnowledgeChunk,
  ValidationResult
} from '../src/types/hermes';

export interface IndependentValidator {
  validate(
    scenario: CompetencyScenario,
    execution: AgentExecutionRecord,
    availableChunks: KnowledgeChunk[]
  ): ValidationResult;
}

export class FoundationValidator implements IndependentValidator {
  public validate(
    scenario: CompetencyScenario,
    execution: AgentExecutionRecord,
    availableChunks: KnowledgeChunk[]
  ): ValidationResult {
    const proposal = execution.structuredProposal || {};
    const inputs = scenario.inputs || {};
    const constraints = scenario.constraints || {};
    const validationId = `VAL-FOUNDATION-${Date.now()}`;

    const loadP = inputs.loadPoundsPerFt || 1800;
    const soilBearingPsf = inputs.soilBearingPsf || 1500;
    const reqWidthInches = (loadP / soilBearingPsf) * 12; // e.g. 14.4 in

    const proposedWidth = Number(proposal.proposedFootingWidth) || 0;
    const proposedEmbedment = Number(proposal.embedmentDepth) || 0;
    const proposedFc = Number(proposal.concreteStrength) || 0;
    const proposedWcm = Number(proposal.waterCementRatio) || 1.0;

    const minEmbedmentReq = constraints.minEmbedmentInches || 12;
    const minFcReq = constraints.minFcPsi || 3000;
    const maxWcmReq = constraints.maxWcm || 0.45;

    const widthOk = proposedWidth >= reqWidthInches;
    const embedmentOk = proposedEmbedment >= minEmbedmentReq;
    const fcOk = proposedFc >= minFcReq;
    const wcmOk = proposedWcm <= maxWcmReq;

    const violations: string[] = [];
    let criticalFailure = false;
    let criticalFailureReason: string | undefined = undefined;

    // Critical Failure Check: Soil Bearing Capacity Exceeded!
    if (!widthOk) {
      criticalFailure = true;
      criticalFailureReason = `CRITICAL SAFETY VIOLATION: Proposed footing width (${proposedWidth} in.) is less than required minimum (${reqWidthInches.toFixed(1)} in.) for load ${loadP} lbs/ft on ${soilBearingPsf} psf soil. Structural settlement / soil shear failure risk!`;
      violations.push(criticalFailureReason);
    }

    if (!embedmentOk) violations.push(`Embedment depth (${proposedEmbedment} in.) is less than minimum required (${minEmbedmentReq} in.).`);
    if (!fcOk) violations.push(`Concrete compressive strength (${proposedFc} psi) is less than minimum required (${minFcReq} psi).`);
    if (!wcmOk) violations.push(`Water-cement ratio (${proposedWcm}) exceeds maximum allowable (${maxWcmReq}).`);

    // Citation grounding check
    const { groundingScorePct, unsupportedCitations } = validateCitations(proposal.sourceCitations || execution.citations, availableChunks);

    const mathScorePct = widthOk ? 100 : 30;
    const codeCompliancePct = [embedmentOk, fcOk, wcmOk].filter(Boolean).length / 3 * 100;
    const completenessPct = (proposal.calculations && proposal.assumptions) ? 100 : 70;
    const assumptionQualityPct = Array.isArray(proposal.assumptions) && proposal.assumptions.length > 0 ? 95 : 60;
    const uncertaintyHandlingPct = Array.isArray(proposal.uncertainties) && proposal.uncertainties.length > 0 ? 90 : 50;

    let overallScorePct = Math.round(
      mathScorePct * 0.35 +
      codeCompliancePct * 0.25 +
      groundingScorePct * 0.15 +
      completenessPct * 0.10 +
      assumptionQualityPct * 0.10 +
      uncertaintyHandlingPct * 0.05
    );

    // CRITICAL FAILURE OVERRIDE
    if (criticalFailure) {
      overallScorePct = Math.min(overallScorePct, 40);
    }

    const passed = !criticalFailure && overallScorePct >= 85;

    return {
      validationId,
      executionId: execution.executionId,
      scenarioId: scenario.scenarioId,
      agentRoleId: execution.agentRoleId,
      mathScorePct,
      codeCompliancePct,
      sourceGroundingPct: groundingScorePct,
      completenessPct,
      assumptionQualityPct,
      uncertaintyHandlingPct,
      overallScorePct,
      passed,
      criticalFailure,
      criticalFailureReason,
      calculatedMetrics: {
        appliedLoadP: loadP,
        soilBearingPsf,
        requiredWidthInches: reqWidthInches,
        proposedWidthInches: proposedWidth,
        widthSafetyFactor: proposedWidth / reqWidthInches
      },
      violations,
      unsupportedCitations,
      validatedAt: new Date().toISOString()
    };
  }
}

export class HVACValidator implements IndependentValidator {
  public validate(
    scenario: CompetencyScenario,
    execution: AgentExecutionRecord,
    availableChunks: KnowledgeChunk[]
  ): ValidationResult {
    const proposal = execution.structuredProposal || {};
    const inputs = scenario.inputs || {};
    const constraints = scenario.constraints || {};
    const validationId = `VAL-HVAC-${Date.now()}`;

    const cfm = inputs.airflowCFM || 120;
    const maxVelocityLimit = constraints.maxNeckVelocityFpm || 500; // NC-25 quiet zone limit

    const neckDiameter = Number(proposal.neckDiameter) || 0;
    const count = Number(proposal.diffuserCount) || 1;

    let calcVel = Number(proposal.calculatedVelocity) || 0;
    if (neckDiameter > 0 && count > 0) {
      const neckAreaSqFt = count * Math.PI * Math.pow(neckDiameter / 2 / 12, 2);
      calcVel = cfm / neckAreaSqFt;
    }

    const velocityOk = calcVel <= maxVelocityLimit;
    const violations: string[] = [];
    let criticalFailure = false;
    let criticalFailureReason: string | undefined = undefined;

    // Critical Noise Violation Check: Exceeding max neck velocity limit by > 20%
    if (calcVel > maxVelocityLimit * 1.2) {
      criticalFailure = true;
      criticalFailureReason = `CRITICAL NOISE VIOLATION: Calculated diffuser neck velocity (${calcVel.toFixed(1)} FPM) exceeds maximum quiet zone threshold (${maxVelocityLimit} FPM) by over 20%. NC-25 acoustic criteria violated!`;
      violations.push(criticalFailureReason);
    } else if (!velocityOk) {
      violations.push(`Neck velocity (${calcVel.toFixed(1)} FPM) exceeds maximum allowable limit (${maxVelocityLimit} FPM).`);
    }

    // Citation grounding check
    const { groundingScorePct, unsupportedCitations } = validateCitations(proposal.sourceCitations || execution.citations, availableChunks);

    const mathScorePct = velocityOk ? 100 : Math.max(20, Math.round((maxVelocityLimit / calcVel) * 80));
    const codeCompliancePct = velocityOk ? 100 : 50;
    const completenessPct = (proposal.ductConnection && proposal.placement) ? 100 : 70;
    const assumptionQualityPct = Array.isArray(proposal.assumptions) && proposal.assumptions.length > 0 ? 95 : 60;
    const uncertaintyHandlingPct = Array.isArray(proposal.uncertainties) && proposal.uncertainties.length > 0 ? 90 : 50;

    let overallScorePct = Math.round(
      mathScorePct * 0.35 +
      codeCompliancePct * 0.25 +
      groundingScorePct * 0.15 +
      completenessPct * 0.10 +
      assumptionQualityPct * 0.10 +
      uncertaintyHandlingPct * 0.05
    );

    // CRITICAL FAILURE OVERRIDE
    if (criticalFailure) {
      overallScorePct = Math.min(overallScorePct, 45);
    }

    const passed = !criticalFailure && overallScorePct >= 85;

    return {
      validationId,
      executionId: execution.executionId,
      scenarioId: scenario.scenarioId,
      agentRoleId: execution.agentRoleId,
      mathScorePct,
      codeCompliancePct,
      sourceGroundingPct: groundingScorePct,
      completenessPct,
      assumptionQualityPct,
      uncertaintyHandlingPct,
      overallScorePct,
      passed,
      criticalFailure,
      criticalFailureReason,
      calculatedMetrics: {
        airflowCFM: cfm,
        neckDiameterInches: neckDiameter,
        diffuserCount: count,
        calculatedVelocityFpm: Math.round(calcVel * 10) / 10,
        maxVelocityLimitFpm: maxVelocityLimit
      },
      violations,
      unsupportedCitations,
      validatedAt: new Date().toISOString()
    };
  }
}

export class ElectricalValidator implements IndependentValidator {
  public validate(
    scenario: CompetencyScenario,
    execution: AgentExecutionRecord,
    availableChunks: KnowledgeChunk[]
  ): ValidationResult {
    const proposal = execution.structuredProposal || {};
    const inputs = scenario.inputs || {};
    const constraints = scenario.constraints || {};
    const validationId = `VAL-ELEC-${Date.now()}`;

    const wallLengthFt = inputs.wallLengthFt || 10;
    const distanceToSinkFt = inputs.distanceToWaterSinkFt !== undefined ? inputs.distanceToWaterSinkFt : 2;

    const proposedSpacing = Number(proposal.receptacleSpacingFt) || 0;
    const gfciSpecified = Boolean(proposal.gfciSpecified);

    const maxSpacingReq = constraints.maxSpacingFt || 12; // NEC 210.52(A)
    const requiresGfci = distanceToSinkFt <= 6; // NEC 210.8(A)

    const spacingOk = proposedSpacing > 0 && proposedSpacing <= maxSpacingReq;
    const gfciOk = !requiresGfci || (requiresGfci && gfciSpecified);

    const violations: string[] = [];
    let criticalFailure = false;
    let criticalFailureReason: string | undefined = undefined;

    if (requiresGfci && !gfciSpecified) {
      criticalFailure = true;
      criticalFailureReason = `CRITICAL LIFE SAFETY VIOLATION: Missing mandatory GFCI protection for receptacle located ${distanceToSinkFt} ft from water sink (NEC 210.8(A) requires GFCI within 6 ft). Shock hazard!`;
      violations.push(criticalFailureReason);
    }

    if (!spacingOk) {
      if (proposedSpacing > maxSpacingReq) {
        criticalFailure = true;
        criticalFailureReason = `CRITICAL CODE VIOLATION: Proposed receptacle spacing (${proposedSpacing} ft) exceeds maximum NEC 210.52(A) limit of ${maxSpacingReq} ft.`;
      }
      violations.push(`Receptacle spacing (${proposedSpacing} ft) violates NEC spacing rules.`);
    }

    // Citation grounding check
    const { groundingScorePct, unsupportedCitations } = validateCitations(proposal.sourceCitations || execution.citations, availableChunks);

    const mathScorePct = spacingOk ? 100 : 40;
    const codeCompliancePct = (spacingOk && gfciOk) ? 100 : 30;
    const completenessPct = (proposal.circuitVoltage && proposal.wireGauge) ? 100 : 70;
    const assumptionQualityPct = Array.isArray(proposal.assumptions) && proposal.assumptions.length > 0 ? 95 : 60;
    const uncertaintyHandlingPct = Array.isArray(proposal.uncertainties) && proposal.uncertainties.length > 0 ? 90 : 50;

    let overallScorePct = Math.round(
      mathScorePct * 0.35 +
      codeCompliancePct * 0.25 +
      groundingScorePct * 0.15 +
      completenessPct * 0.10 +
      assumptionQualityPct * 0.10 +
      uncertaintyHandlingPct * 0.05
    );

    // CRITICAL FAILURE OVERRIDE
    if (criticalFailure) {
      overallScorePct = Math.min(overallScorePct, 50);
    }

    const passed = !criticalFailure && overallScorePct >= 85;

    return {
      validationId,
      executionId: execution.executionId,
      scenarioId: scenario.scenarioId,
      agentRoleId: execution.agentRoleId,
      mathScorePct,
      codeCompliancePct,
      sourceGroundingPct: groundingScorePct,
      completenessPct,
      assumptionQualityPct,
      uncertaintyHandlingPct,
      overallScorePct,
      passed,
      criticalFailure,
      criticalFailureReason,
      calculatedMetrics: {
        wallLengthFt,
        distanceToSinkFt,
        proposedSpacingFt: proposedSpacing,
        maxSpacingReqFt: maxSpacingReq,
        gfciSpecified
      },
      violations,
      unsupportedCitations,
      validatedAt: new Date().toISOString()
    };
  }
}

export class GenericValidator implements IndependentValidator {
  public validate(
    scenario: CompetencyScenario,
    execution: AgentExecutionRecord,
    availableChunks: KnowledgeChunk[]
  ): ValidationResult {
    const proposal = execution.structuredProposal || {};
    const validationId = `VAL-GENERIC-${Date.now()}`;

    const { groundingScorePct, unsupportedCitations } = validateCitations(proposal.sourceCitations || execution.citations, availableChunks);

    return {
      validationId,
      executionId: execution.executionId,
      scenarioId: scenario.scenarioId,
      agentRoleId: execution.agentRoleId,
      mathScorePct: 90,
      codeCompliancePct: 90,
      sourceGroundingPct: groundingScorePct,
      completenessPct: 85,
      assumptionQualityPct: 85,
      uncertaintyHandlingPct: 85,
      overallScorePct: Math.round(88 * (groundingScorePct / 100)),
      passed: groundingScorePct >= 70,
      criticalFailure: false,
      calculatedMetrics: {},
      violations: [],
      unsupportedCitations,
      validatedAt: new Date().toISOString()
    };
  }
}

function validateCitations(
  citations: string[] | undefined,
  availableChunks: KnowledgeChunk[]
): { groundingScorePct: number; unsupportedCitations: string[] } {
  if (!citations || citations.length === 0) {
    return { groundingScorePct: 50, unsupportedCitations: ['No citations provided'] };
  }

  const availableIds = new Set(availableChunks.map((c) => c.chunkId));
  const unsupportedCitations: string[] = [];

  citations.forEach((cId) => {
    if (!availableIds.has(cId) && !cId.startsWith('KC-')) {
      unsupportedCitations.push(cId);
    }
  });

  const validCount = citations.length - unsupportedCitations.length;
  const groundingScorePct = Math.round((validCount / citations.length) * 100);

  return { groundingScorePct, unsupportedCitations };
}
