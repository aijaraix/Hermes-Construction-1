import { EngineeringCalculation } from '../src/types/hermes';

/**
 * Deterministic Engineering Calculation Engine for HERMES
 * Executes dimensionally sound structural, fastener, soil, and rebar math.
 */

export function calculateFastenerUpliftCapacity(params: {
  projectId: string;
  componentId: string;
  windSpeedMph: number; // e.g. 160 MPH
  exposureCategory: 'B' | 'C' | 'D';
  fastenerSpacingInches: number; // e.g. 24 inches o.c.
  fastenerDiameterInches: number; // e.g. 0.625 (5/8")
  fastenerMaterial: 'Grade 316 Stainless' | 'Galvanized G185' | 'Standard Carbon Steel';
  embedmentDepthInches: number; // e.g. 12 inches
  concreteCompressiveStrengthPsi: number; // e.g. 4000 PSI
}): EngineeringCalculation {
  const {
    projectId,
    componentId,
    windSpeedMph,
    exposureCategory,
    fastenerSpacingInches,
    fastenerDiameterInches,
    fastenerMaterial,
    embedmentDepthInches,
    concreteCompressiveStrengthPsi
  } = params;

  // 1. ASCE 7-22 / FBC 2023 Wind Velocity Pressure Formula
  // q_z = 0.00256 * K_z * K_zt * K_d * V^2 (PSF)
  const K_z = exposureCategory === 'C' ? 1.0 : exposureCategory === 'D' ? 1.15 : 0.85; // Exposure B default
  const K_zt = 1.0; // Flat topography
  const K_d = 0.85; // Directionality factor for main windforce resisting system
  const velocityPressurePsf = 0.00256 * K_z * K_zt * K_d * Math.pow(windSpeedMph, 2); // e.g. 47.3 PSF @ 160 MPH

  // 2. Net Uplift Pressure
  const GCp_net = 1.48; // External GCp (1.30) - Internal GCpi (-0.18) for roof edge/eave zone
  const netUpliftPressurePsf = velocityPressurePsf * GCp_net; // e.g. 70.0 PSF

  // 3. Tributary Area per Anchor Bolt
  const spacingFeet = fastenerSpacingInches / 12.0; // 2.0 FT for 24" o.c.
  const tributaryEaveWidthFeet = 2.0; // 2 FT overhang/eave
  const tributaryAreaSqFt = spacingFeet * tributaryEaveWidthFeet; // 4.0 SQ FT

  // 4. Design Uplift Demand per Anchor Bolt (LBF)
  const designDemandLbf = netUpliftPressurePsf * tributaryAreaSqFt; // ~280 LBF

  // 5. Anchor Bolt Tension Capacity (ACI 318-19 Concrete Breakout & Steel Capacity)
  // Concrete breakout capacity in tension: N_cb = A_Nc / A_Nco * psi_ed * psi_c * psi_cp * N_b
  // N_b = 24 * lambda * sqrt(f'c) * h_ef^1.5
  const lambda = 1.0; // Normal weight concrete
  const Nb = 24 * lambda * Math.sqrt(concreteCompressiveStrengthPsi) * Math.pow(embedmentDepthInches, 1.5); // LBF
  
  // Steel material multiplier
  const materialMultiplier = fastenerMaterial === 'Grade 316 Stainless' ? 1.0 : fastenerMaterial === 'Galvanized G185' ? 0.95 : 0.85;
  const allowableTensionCapacityLbf = Math.min(1850.0, Nb * 0.75 * materialMultiplier); // Safety factor 0.75

  // 6. Utilization Ratio
  const utilizationRatio = Number((designDemandLbf / allowableTensionCapacityLbf).toFixed(4));
  const passed = utilizationRatio <= 1.0;

  return {
    calculationId: `CALC-UPLIFT-${Date.now()}`,
    projectId,
    componentId,
    calculationType: 'ASCE 7-22 / FBC 2023 Anchor Bolt Wind Uplift & Tension Capacity',
    rawInputs: {
      windSpeedMph,
      exposureCategory,
      fastenerSpacingInches,
      fastenerDiameterInches,
      fastenerMaterial,
      embedmentDepthInches,
      concreteCompressiveStrengthPsi
    },
    inputUnits: {
      windSpeedMph: 'MPH',
      exposureCategory: 'Category',
      fastenerSpacingInches: 'Inches',
      fastenerDiameterInches: 'Inches',
      fastenerMaterial: 'Material Specification',
      embedmentDepthInches: 'Inches',
      concreteCompressiveStrengthPsi: 'PSI'
    },
    equations: [
      'Velocity Pressure: q_z = 0.00256 * K_z * K_zt * K_d * V^2',
      'Design Uplift Demand: T_demand = q_z * GCp_net * TributaryArea',
      'Concrete Breakout Tension Capacity: N_cb = 0.75 * 24 * lambda * sqrt(f\'c) * h_ef^1.5',
      'Utilization Ratio: U = T_demand / N_cb <= 1.0'
    ],
    assumptions: [
      'Exposure B terrain roughness (suburban / wooded residential)',
      'Flat topography (K_zt = 1.0)',
      'Normal weight 4000 PSI concrete stem wall',
      'Continuous edge distance >= 3.0 * h_ef (no edge breakout reduction)'
    ],
    intermediateCalculations: {
      velocityPressurePsf: Number(velocityPressurePsf.toFixed(2)),
      netUpliftPressurePsf: Number(netUpliftPressurePsf.toFixed(2)),
      tributaryAreaSqFt: Number(tributaryAreaSqFt.toFixed(2)),
      concreteBreakoutBaseNbLbf: Number(Nb.toFixed(1))
    },
    designDemand: Number(designDemandLbf.toFixed(1)),
    capacity: Number(allowableTensionCapacityLbf.toFixed(1)),
    demandCapacityUnit: 'LBF Tension',
    utilizationRatio,
    governingCondition: 'ASCE 7-22 Chapter 30 C&C Wind Uplift vs ACI 318-19 Concrete Breakout',
    applicableRuleSection: 'FBC 2023 Section 1609.3 / ACI 318-19 Chapter 17',
    validationState: passed ? 'VALIDATED' : 'INVALID'
  };
}

export function calculateSoilFootingBearing(params: {
  projectId: string;
  componentId: string;
  totalDeadPlusLiveLoadLbs: number; // e.g. 110,000 lbs
  footingLengthFeet: number; // e.g. 156 ft perimeter
  footingWidthInches: number; // e.g. 20 inches
  allowableSoilBearingPsf: number; // e.g. 2,200 PSF
}): EngineeringCalculation {
  const {
    projectId,
    componentId,
    totalDeadPlusLiveLoadLbs,
    footingLengthFeet,
    footingWidthInches,
    allowableSoilBearingPsf
  } = params;

  const footingWidthFeet = footingWidthInches / 12.0; // 1.667 FT
  const totalContactAreaSqFt = footingLengthFeet * footingWidthFeet; // ~260 SQ FT
  const actualContactPressurePsf = totalDeadPlusLiveLoadLbs / totalContactAreaSqFt; // ~423 PSF

  const utilizationRatio = Number((actualContactPressurePsf / allowableSoilBearingPsf).toFixed(4));
  const passed = utilizationRatio <= 1.0;

  return {
    calculationId: `CALC-BEARING-${Date.now()}`,
    projectId,
    componentId,
    calculationType: 'Soil Contact Pressure vs Allowable Soil Bearing Capacity',
    rawInputs: {
      totalDeadPlusLiveLoadLbs,
      footingLengthFeet,
      footingWidthInches,
      allowableSoilBearingPsf
    },
    inputUnits: {
      totalDeadPlusLiveLoadLbs: 'LBF',
      footingLengthFeet: 'Feet',
      footingWidthInches: 'Inches',
      allowableSoilBearingPsf: 'PSF'
    },
    equations: [
      'Contact Area: A = Length * (Width / 12)',
      'Actual Pressure: P_actual = TotalLoad / A',
      'Utilization Ratio: U = P_actual / P_allowable <= 1.0'
    ],
    assumptions: [
      'Uniform soil bearing across 156 lin ft continuous stem wall footing',
      'Geotechnical soil bearing capacity derived from Tampa silty sand survey',
      'No hydrostatic uplift under footing base'
    ],
    intermediateCalculations: {
      totalContactAreaSqFt: Number(totalContactAreaSqFt.toFixed(2)),
      actualContactPressurePsf: Number(actualContactPressurePsf.toFixed(2))
    },
    designDemand: Number(actualContactPressurePsf.toFixed(1)),
    capacity: Number(allowableSoilBearingPsf.toFixed(1)),
    demandCapacityUnit: 'PSF Bearing Pressure',
    utilizationRatio,
    governingCondition: 'FBC 2023 Section 1809.2 Allowable Soil Bearing',
    applicableRuleSection: 'FBC 2023 Section 1809 / ACI 318-19 Section 13.3',
    validationState: passed ? 'VALIDATED' : 'INVALID'
  };
}
