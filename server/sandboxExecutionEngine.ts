import { SandboxRunRecord } from '../src/types/hermes';

export class SandboxExecutionEngine {
  private static sandboxHistory: SandboxRunRecord[] = [];

  public static runSandbox(
    agentRoleId: string,
    sandboxType: 'Electrical' | 'HVAC' | 'Plumbing' | 'Structural' | 'Envelope' | 'Materials',
    inputs: Record<string, any>
  ): SandboxRunRecord {
    if (sandboxType === 'Electrical') {
      return this.runElectricalSandbox(agentRoleId, {
        roomLengthFt: inputs.roomLengthFt || 18,
        roomWidthFt: inputs.roomWidthFt || 14,
        wallHeightFt: inputs.wallHeightFt || 9,
        panelVoltage: inputs.panelVoltage || 120,
        circuitAmpacity: inputs.circuitAmpacity || (inputs.wireGauge === 14 ? 15 : 20),
        wireGaugeAWG: inputs.wireGauge || inputs.wireGaugeAWG || 14,
        oneWayDistanceFt: inputs.lengthFt || inputs.oneWayDistanceFt || 100,
        loadAmps: inputs.currentAmps || inputs.loadAmps || 30,
        receptacleCount: inputs.receptacleCount || 2
      });
    } else if (sandboxType === 'HVAC') {
      return this.runHvacSandbox(agentRoleId, {
        roomAreaSqFt: inputs.roomAreaSqFt || 200,
        ceilingHeightFt: inputs.ceilingHeightFt || 9,
        occupants: inputs.occupants || 2,
        climateZone: inputs.climateZone || '2A',
        cfmProvided: inputs.cfmProvided || 200,
        ductDiameterInches: inputs.ductDiameterInches || 6
      });
    } else if (sandboxType === 'Plumbing') {
      return this.runPlumbingSandbox(agentRoleId, {
        waterClosets: inputs.waterClosets || 2,
        lavatories: inputs.lavatories || 2,
        showers: inputs.showers || 1,
        drainPipeDiameterInches: inputs.drainPipeDiameterInches || 3,
        drainSlopeInchesPerFt: inputs.drainSlopeInchesPerFt || 0.25
      });
    } else if (sandboxType === 'Structural') {
      return this.runStructuralSandbox(agentRoleId, {
        columnLoadLbs: inputs.columnLoadLbs || 20000,
        footingWidthFt: inputs.footingWidthFt || 3,
        footingLengthFt: inputs.footingLengthFt || 3,
        allowableSoilBearingPsf: inputs.allowableSoilBearingPsf || 2000,
        windUpliftTensionLbs: inputs.windUpliftTensionLbs || 2000,
        anchorBoltCount: inputs.anchorBoltCount || 4,
        anchorBoltDiameterInches: inputs.anchorBoltDiameterInches || 0.5
      });
    } else if (sandboxType === 'Envelope') {
      return this.runEnvelopeSandbox(agentRoleId, {
        cavityRValue: inputs.cavityRValue || 13,
        continuousRValue: inputs.continuousRValue || 0,
        climateZone: inputs.climateZone || '2A',
        hasClass2VaporRetarder: inputs.hasClass2VaporRetarder ?? true,
        flashingLapInches: inputs.flashingLapInches || 4
      });
    } else {
      return this.runMaterialsSandbox(agentRoleId, {
        woodSpeciesGroup: inputs.woodSpeciesGroup || 'Southern Pine No. 2',
        fastenerDiameterInches: inputs.fastenerDiameterInches || 0.148,
        fastenerPenetrationInches: inputs.fastenerPenetrationInches || 1.5,
        is316StainlessInCoastalZone: inputs.is316StainlessInCoastalZone ?? true,
        coastalProximityMiles: inputs.coastalProximityMiles || 2
      });
    }
  }

  public static runElectricalSandbox(agentRoleId: string, inputs: {
    roomLengthFt: number;
    roomWidthFt: number;
    wallHeightFt: number;
    panelVoltage: number; // e.g. 120
    circuitAmpacity: number; // e.g. 20
    wireGaugeAWG: number; // e.g. 12
    oneWayDistanceFt: number; // e.g. 60
    loadAmps: number; // e.g. 16
    receptacleCount: number; // e.g. 6
  }): SandboxRunRecord {
    const wallPerimeter = 2 * (inputs.roomLengthFt + inputs.roomWidthFt);
    // NEC 210.52: No point along floor line more than 6ft from receptacle -> max 12ft between receptacles
    const requiredReceptacles = Math.ceil(wallPerimeter / 12);
    const spacingPassed = inputs.receptacleCount >= requiredReceptacles;

    // Resistance per 1000ft for 12 AWG Cu is ~1.93 ohms
    const resistancePer1000Ft = inputs.wireGaugeAWG === 12 ? 1.93 : inputs.wireGaugeAWG === 14 ? 3.07 : 1.21;
    const voltageDrop = (2 * inputs.oneWayDistanceFt * inputs.loadAmps * resistancePer1000Ft) / 1000;
    const voltageDropPct = (voltageDrop / inputs.panelVoltage) * 100;
    const voltageDropPassed = voltageDropPct <= 3.0; // NEC recommended max 3% for branch circuit

    const ampacityPassed = inputs.loadAmps <= inputs.circuitAmpacity * 0.8; // 80% continuous load rule

    const violations: string[] = [];
    if (!spacingPassed) violations.push(`NEC 210.52 violation: ${inputs.receptacleCount} receptacles provided for ${wallPerimeter}ft perimeter (min ${requiredReceptacles} required).`);
    if (!voltageDropPassed) violations.push(`NEC 210.19 voltage drop violation: calculated ${voltageDropPct.toFixed(2)}% drop exceeds 3.0% limit.`);
    if (!ampacityPassed) violations.push(`NEC 210.20 continuous load violation: ${inputs.loadAmps}A load exceeds 80% limit (${inputs.circuitAmpacity * 0.8}A) on ${inputs.circuitAmpacity}A breaker.`);

    const passed = violations.length === 0;

    const record: SandboxRunRecord = {
      sandboxRunId: `SANDBOX-ELEC-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      agentRoleId,
      sandboxType: 'Electrical',
      inputs,
      agentProposal: {
        receptacleCount: inputs.receptacleCount,
        wireGaugeAWG: inputs.wireGaugeAWG,
        circuitAmpacity: inputs.circuitAmpacity
      },
      validatorOutput: {
        passed,
        violations,
        metrics: {
          wallPerimeterFt: wallPerimeter,
          requiredReceptacles,
          voltageDropPct: parseFloat(voltageDropPct.toFixed(2)),
          voltageDropPassed,
          ampacityPassed,
          spacingPassed
        }
      },
      timestamp: new Date().toISOString()
    };

    this.sandboxHistory.push(record);
    return record;
  }

  public static runHvacSandbox(agentRoleId: string, inputs: {
    roomAreaSqFt: number;
    ceilingHeightFt: number;
    occupants: number;
    climateZone: string; // e.g. '2A'
    cfmProvided: number; // e.g. 400
    ductDiameterInches: number; // e.g. 8
  }): SandboxRunRecord {
    const volumeCuFt = inputs.roomAreaSqFt * inputs.ceilingHeightFt;
    // Climate Zone 2A cooling estimate: ~30 BTU/hr per sq ft
    const coolingLoadBtuHr = inputs.roomAreaSqFt * 30 + inputs.occupants * 400;
    // CFM required = Sensible BTU / (1.08 * 20 deg F delta T)
    const requiredCfm = Math.round(coolingLoadBtuHr / 21.6);
    const cfmPassed = inputs.cfmProvided >= requiredCfm;

    // Duct velocity v = CFM / Area_sqft
    const ductAreaSqFt = Math.PI * Math.pow(inputs.ductDiameterInches / 2 / 12, 2);
    const velocityFpm = inputs.cfmProvided / ductAreaSqFt;
    const velocityPassed = velocityFpm <= 900; // Max 900 fpm for quiet residential supply duct

    const violations: string[] = [];
    if (!cfmPassed) violations.push(`HVAC airflow shortfall: ${inputs.cfmProvided} CFM provided is less than required ${requiredCfm} CFM for ${coolingLoadBtuHr} BTU/hr load.`);
    if (!velocityPassed) violations.push(`HVAC duct velocity violation: ${Math.round(velocityFpm)} FPM exceeds maximum 900 FPM quiet design threshold.`);

    const passed = violations.length === 0;

    const record: SandboxRunRecord = {
      sandboxRunId: `SANDBOX-HVAC-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      agentRoleId,
      sandboxType: 'HVAC',
      inputs,
      agentProposal: {
        cfmProvided: inputs.cfmProvided,
        ductDiameterInches: inputs.ductDiameterInches
      },
      validatorOutput: {
        passed,
        violations,
        metrics: {
          volumeCuFt,
          coolingLoadBtuHr,
          requiredCfm,
          velocityFpm: Math.round(velocityFpm),
          cfmPassed,
          velocityPassed
        }
      },
      timestamp: new Date().toISOString()
    };

    this.sandboxHistory.push(record);
    return record;
  }

  public static runPlumbingSandbox(agentRoleId: string, inputs: {
    waterClosets: number;
    lavatories: number;
    showers: number;
    drainPipeDiameterInches: number; // e.g. 3
    drainSlopeInchesPerFt: number; // e.g. 0.25 (1/4 inch per ft)
  }): SandboxRunRecord {
    // IPC DFU values: Water Closet = 4 DFU, Lavatory = 1 DFU, Shower = 2 DFU
    const totalDfu = inputs.waterClosets * 4 + inputs.lavatories * 1 + inputs.showers * 2;
    
    // Min pipe size rule: Any line carrying water closet effluent must be min 3"
    const minPipeSizePassed = inputs.waterClosets > 0 ? inputs.drainPipeDiameterInches >= 3 : inputs.drainPipeDiameterInches >= 2;
    
    // IPC minimum slope: 1/4" per foot (0.25 in/ft) for 3" or smaller pipes
    const slopePassed = inputs.drainSlopeInchesPerFt >= 0.25;

    const violations: string[] = [];
    if (!minPipeSizePassed) violations.push(`IPC Plumbing violation: ${inputs.drainPipeDiameterInches}" drain pipe is undersized for ${inputs.waterClosets} water closets (min 3" required).`);
    if (!slopePassed) violations.push(`IPC Plumbing slope violation: ${inputs.drainSlopeInchesPerFt}"/ft slope is less than required 0.25" (1/4") per foot minimum.`);

    const passed = violations.length === 0;

    const record: SandboxRunRecord = {
      sandboxRunId: `SANDBOX-PLUMB-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      agentRoleId,
      sandboxType: 'Plumbing',
      inputs,
      agentProposal: {
        totalDfu,
        drainPipeDiameterInches: inputs.drainPipeDiameterInches,
        drainSlopeInchesPerFt: inputs.drainSlopeInchesPerFt
      },
      validatorOutput: {
        passed,
        violations,
        metrics: {
          totalDfu,
          minPipeSizePassed,
          slopePassed
        }
      },
      timestamp: new Date().toISOString()
    };

    this.sandboxHistory.push(record);
    return record;
  }

  public static runStructuralSandbox(agentRoleId: string, inputs: {
    columnLoadLbs: number; // e.g. 24000 lbs
    footingWidthFt: number; // e.g. 4.0 ft
    footingLengthFt: number; // e.g. 4.0 ft
    allowableSoilBearingPsf: number; // e.g. 2000 psf
    windUpliftTensionLbs: number; // e.g. 4500 lbs
    anchorBoltCount: number; // e.g. 4
    anchorBoltDiameterInches: number; // e.g. 0.625 (5/8 in)
  }): SandboxRunRecord {
    const footingAreaSqFt = inputs.footingWidthFt * inputs.footingLengthFt;
    const actualBearingPsf = inputs.columnLoadLbs / footingAreaSqFt;
    const bearingPassed = actualBearingPsf <= inputs.allowableSoilBearingPsf;

    // ACI 318 / FBC bolt tension capacity: ~5800 lbs per 5/8" A307 bolt in 3000 psi concrete
    const capacityPerBoltLbs = inputs.anchorBoltDiameterInches >= 0.625 ? 5800 : 3600;
    const totalUpliftCapacityLbs = inputs.anchorBoltCount * capacityPerBoltLbs;
    const upliftPassed = totalUpliftCapacityLbs >= inputs.windUpliftTensionLbs;

    const violations: string[] = [];
    if (!bearingPassed) violations.push(`ACI 318 / Soils bearing failure: calculated ${Math.round(actualBearingPsf)} PSF exceeds allowable soil bearing ${inputs.allowableSoilBearingPsf} PSF.`);
    if (!upliftPassed) violations.push(`ASCE 7-22 wind uplift failure: ${totalUpliftCapacityLbs} lbs bolt tension capacity is less than required ${inputs.windUpliftTensionLbs} lbs wind uplift force.`);

    const passed = violations.length === 0;

    const record: SandboxRunRecord = {
      sandboxRunId: `SANDBOX-STRUCT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      agentRoleId,
      sandboxType: 'Structural',
      inputs,
      agentProposal: {
        footingAreaSqFt,
        actualBearingPsf: Math.round(actualBearingPsf),
        totalUpliftCapacityLbs
      },
      validatorOutput: {
        passed,
        violations,
        metrics: {
          footingAreaSqFt,
          actualBearingPsf: Math.round(actualBearingPsf),
          bearingPassed,
          totalUpliftCapacityLbs,
          upliftPassed
        }
      },
      timestamp: new Date().toISOString()
    };

    this.sandboxHistory.push(record);
    return record;
  }

  public static runEnvelopeSandbox(agentRoleId: string, inputs: {
    cavityRValue: number; // e.g. 13
    continuousRValue: number; // e.g. 5
    climateZone: string; // e.g. '2A'
    hasClass2VaporRetarder: boolean;
    flashingLapInches: number; // e.g. 4.0
  }): SandboxRunRecord {
    const totalRValue = inputs.cavityRValue + inputs.continuousRValue;
    // Florida Climate Zone 2A Energy Code min wall R-value = R-13 cavity or R-10 continuous
    const rValuePassed = totalRValue >= 13;
    const flashingPassed = inputs.flashingLapInches >= 4.0; // Min 4" shingle-style weather lap
    const vaporPassed = inputs.hasClass2VaporRetarder;

    const violations: string[] = [];
    if (!rValuePassed) violations.push(`FBC Energy Code violation: R-${totalRValue} total wall insulation is less than R-13 minimum for Climate Zone 2A.`);
    if (!flashingPassed) violations.push(`ASTM E2112 flashing lap violation: ${inputs.flashingLapInches}" flashing lap is less than required 4.0" weather lap.`);
    if (!vaporPassed) violations.push(`Building envelope vapor retarder missing: Class II vapor retarder (perm <= 1.0) required on interior/exterior boundary.`);

    const passed = violations.length === 0;

    const record: SandboxRunRecord = {
      sandboxRunId: `SANDBOX-ENVELOPE-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      agentRoleId,
      sandboxType: 'Envelope',
      inputs,
      agentProposal: {
        totalRValue,
        flashingLapInches: inputs.flashingLapInches,
        hasClass2VaporRetarder: inputs.hasClass2VaporRetarder
      },
      validatorOutput: {
        passed,
        violations,
        metrics: {
          totalRValue,
          rValuePassed,
          flashingPassed,
          vaporPassed
        }
      },
      timestamp: new Date().toISOString()
    };

    this.sandboxHistory.push(record);
    return record;
  }

  public static runMaterialsSandbox(agentRoleId: string, inputs: {
    woodSpeciesGroup: string; // e.g. 'Southern Pine' (G = 0.55)
    fastenerDiameterInches: number; // e.g. 0.148 (10d nail)
    fastenerPenetrationInches: number; // e.g. 1.5
    is316StainlessInCoastalZone: boolean;
    coastalProximityMiles: number; // e.g. 2.5
  }): SandboxRunRecord {
    // USDA Forest Products Laboratory Wood Handbook GTR-282 formula:
    // p = 18.0 * G^(5/2) * D * L (lbs withdrawal resistance)
    const specificGravityG = inputs.woodSpeciesGroup.toLowerCase().includes('pine') ? 0.55 : 0.42;
    const withdrawalResistanceLbs = Math.round(18.0 * Math.pow(specificGravityG, 2.5) * inputs.fastenerDiameterInches * inputs.fastenerPenetrationInches * 1000);

    // Coastal corrosion check (within 5 miles of ocean requires 316 Stainless)
    const corrosionPassed = inputs.coastalProximityMiles > 5.0 || inputs.is316StainlessInCoastalZone;

    const violations: string[] = [];
    if (!corrosionPassed) violations.push(`USDA / FEMA P-55 Corrosion failure: Fastener within ${inputs.coastalProximityMiles} miles of coastal water must be 316 Stainless Steel.`);

    const passed = violations.length === 0;

    const record: SandboxRunRecord = {
      sandboxRunId: `SANDBOX-MAT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      agentRoleId,
      sandboxType: 'Materials',
      inputs,
      agentProposal: {
        withdrawalResistanceLbs,
        is316StainlessInCoastalZone: inputs.is316StainlessInCoastalZone
      },
      validatorOutput: {
        passed,
        violations,
        metrics: {
          specificGravityG,
          withdrawalResistanceLbs,
          corrosionPassed
        }
      },
      timestamp: new Date().toISOString()
    };

    this.sandboxHistory.push(record);
    return record;
  }

  public static getAllHistory(): SandboxRunRecord[] {
    return this.sandboxHistory;
  }

  public static getHistoryForAgent(agentRoleId: string): SandboxRunRecord[] {
    return this.sandboxHistory.filter(r => r.agentRoleId === agentRoleId);
  }

  public static restoreHistory(history: SandboxRunRecord[]): void {
    if (Array.isArray(history)) {
      this.sandboxHistory = history;
    }
  }
}
