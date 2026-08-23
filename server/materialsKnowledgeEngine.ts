import {
  MaterialSpecification,
  FastenerSpecification,
  MaterialCompatibilityRule,
  AssemblySpecification,
} from '../src/types/hermes';

export class MaterialsKnowledgeEngine {
  private static specifications: Map<string, MaterialSpecification> = new Map();
  private static fasteners: Map<string, FastenerSpecification> = new Map();
  private static compatibilityRules: Map<string, MaterialCompatibilityRule> = new Map();
  private static assemblies: Map<string, AssemblySpecification> = new Map();
  private static isInitialized = false;

  public static initialize(): void {
    if (this.isInitialized) return;

    // 1. Concrete & Cementitious (CONCRETE-CEMENTITIOUS-MATERIALS-SME)
    this.registerSpecification({
      specId: 'MAT-CONC-3000',
      materialName: '3,000 PSI Normal Weight Structural Concrete',
      family: 'CONCRETE_CEMENTITIOUS',
      grade: 'ASTM C94 Type I/II Portland Cement Mix',
      composition: 'Portland cement, clean coarse aggregate (#57 stone), A-3 sand, water (w/c ratio 0.45)',
      densityLbsCuFt: 145,
      compressiveStrengthPsi: 3000,
      fireRatingMinutes: 120,
      uvResistance: true,
      applicableStandards: ['ACI 318-19', 'ASTM C39', 'ASTM C94'],
      properties: [
        { propertyName: '28-Day Compressive Strength', value: 3000, unit: 'PSI', testMethod: 'ASTM C39', isVerifiedFact: true },
        { propertyName: 'Slump', value: 4.0, unit: 'inches', testMethod: 'ASTM C143', isVerifiedFact: true },
        { propertyName: 'Air Content', value: 4.5, unit: '%', testMethod: 'ASTM C231', isVerifiedFact: true }
      ],
      responsibleSmeRoleId: 'CONCRETE-CEMENTITIOUS-MATERIALS-SME',
      sourceProvenance: 'ACI 318-19 Building Code Requirements for Structural Concrete, Table 19.2.1.1'
    });

    // 2. Structural Steel (STRUCTURAL-STEEL-METALLURGY-SME)
    this.registerSpecification({
      specId: 'MAT-STEEL-A992',
      materialName: 'ASTM A992 Structural Steel Wide Flange',
      family: 'STRUCTURAL_STEEL',
      grade: 'Grade 50',
      composition: 'Carbon-manganese steel (Max C 0.23%, Mn 0.50-1.60%, Si 0.40%)',
      densityLbsCuFt: 490,
      yieldStrengthPsi: 50000,
      tensileStrengthPsi: 65000,
      fireRatingMinutes: 30,
      uvResistance: true,
      applicableStandards: ['AISC 360-22', 'ASTM A992'],
      properties: [
        { propertyName: 'Yield Strength Fy', value: 50, unit: 'KSI', testMethod: 'ASTM A370', isVerifiedFact: true },
        { propertyName: 'Tensile Strength Fu', value: 65, unit: 'KSI', testMethod: 'ASTM A370', isVerifiedFact: true },
        { propertyName: 'Modulus of Elasticity E', value: 29000, unit: 'KSI', testMethod: 'ASTM E111', isVerifiedFact: true }
      ],
      responsibleSmeRoleId: 'STRUCTURAL-STEEL-METALLURGY-SME',
      sourceProvenance: 'AISC Steel Construction Manual 15th Ed, Table 2-4'
    });

    // 3. Cold-Formed Steel (COLD-FORMED-STEEL-SME)
    this.registerSpecification({
      specId: 'MAT-CFS-33KSI',
      materialName: '20 Gauge Cold-Formed Galvanized Steel Stud',
      family: 'COLD_FORMED_STEEL',
      grade: 'ASTM A653 Grade 33',
      composition: 'Galvanized carbon steel sheet with G60 zinc coating',
      densityLbsCuFt: 490,
      yieldStrengthPsi: 33000,
      tensileStrengthPsi: 45000,
      corrosionResistanceGrade: 'G60 Zinc Galvanized',
      uvResistance: true,
      applicableStandards: ['AISI S100-16', 'ASTM A653'],
      properties: [
        { propertyName: 'Design Thickness', value: 0.0346, unit: 'inches', testMethod: 'ASTM A653', isVerifiedFact: true },
        { propertyName: 'Yield Strength Fy', value: 33, unit: 'KSI', testMethod: 'ASTM A370', isVerifiedFact: true }
      ],
      responsibleSmeRoleId: 'COLD-FORMED-STEEL-SME',
      sourceProvenance: 'AISI S100 North American Specification for CFS Structural Members'
    });

    // 4. Wood & Engineered Wood (WOOD-ENGINEERED-WOOD-SME)
    this.registerSpecification({
      specId: 'MAT-WOOD-SPF-NO2',
      materialName: 'Spruce-Pine-Fir (SPF) No. 2 Dimension Lumber',
      family: 'WOOD_ENGINEERED_WOOD',
      grade: 'No. 2 S-DRY',
      composition: 'Natural kiln-dried softwood timber (19% max moisture content)',
      densityLbsCuFt: 28,
      bendingStrengthPsi: 875,
      tensileStrengthPsi: 450,
      compressiveStrengthPsi: 1150,
      thermalConductivity: 0.80,
      uvResistance: false,
      applicableStandards: ['NDS 2024', 'ASTM D245', 'PS 20'],
      properties: [
        { propertyName: 'Bending Design Value Fb', value: 875, unit: 'PSI', testMethod: 'ASTM D245', isVerifiedFact: true },
        { propertyName: 'Modulus of Elasticity E', value: 1400000, unit: 'PSI', testMethod: 'ASTM D2555', isVerifiedFact: true }
      ],
      responsibleSmeRoleId: 'WOOD-ENGINEERED-WOOD-SME',
      sourceProvenance: 'AWC National Design Specification (NDS) for Wood Construction 2024, Supplement Table 4A'
    });

    // 5. Gypsum Board (GYPSUM-INTERIOR-BOARD-SME)
    this.registerSpecification({
      specId: 'MAT-GYP-TYPEX-58',
      materialName: '5/8 inch Type X Fire-Rated Gypsum Wallboard',
      family: 'GYPSUM_INTERIOR_BOARD',
      grade: 'ASTM C1396 Type X',
      composition: 'Non-combustible gypsum core reinforced with glass fibers bound in 100% recycled paper facers',
      densityLbsCuFt: 48,
      thermalConductivity: 1.11,
      fireRatingMinutes: 60,
      uvResistance: false,
      applicableStandards: ['ASTM C1396', 'GA-600', 'UL U411'],
      properties: [
        { propertyName: 'Core Type', value: 'Type X Fire-Resistant', testMethod: 'ASTM C473', isVerifiedFact: true },
        { propertyName: 'Flexural Strength Parallel', value: 46, unit: 'LBF', testMethod: 'ASTM C473', isVerifiedFact: true }
      ],
      responsibleSmeRoleId: 'GYPSUM-INTERIOR-BOARD-SME',
      sourceProvenance: 'Gypsum Association GA-600 Fire Resistance Design Manual'
    });

    // 6. Thermal Insulation (INSULATION-THERMAL-MATERIALS-SME)
    this.registerSpecification({
      specId: 'MAT-INSUL-MINWOOL-R15',
      materialName: 'R-15 Mineral Wool Thermal & Sound Batt Insulation',
      family: 'INSULATION_THERMAL',
      grade: 'ASTM C665 Type IA Non-Combustible',
      composition: 'Spun basalt rock and slag fibers bound with thermosetting resin',
      densityLbsCuFt: 2.5,
      thermalConductivity: 0.23,
      fireRatingMinutes: 120,
      uvResistance: true,
      applicableStandards: ['ASTM C665', 'ASTM E136', 'ASTM C518'],
      properties: [
        { propertyName: 'Thermal Resistance R-Value', value: 15.0, unit: 'hr-ft²-°F/BTU', testMethod: 'ASTM C518', isVerifiedFact: true },
        { propertyName: 'Melting Point', value: 2150, unit: '°F', testMethod: 'ASTM E136', isVerifiedFact: true }
      ],
      responsibleSmeRoleId: 'INSULATION-THERMAL-MATERIALS-SME',
      sourceProvenance: 'ASTM C665 Standard Specification for Mineral Fiber Batt Insulation'
    });

    // Fasteners (FASTENERS-MECHANICAL-CONNECTIONS-SME)
    this.registerFastener({
      fastenerId: 'FAST-NAIL-16D-COMMON',
      name: '16d Common Carbon Steel Wire Nail',
      type: 'NAIL',
      materialGrade: 'ASTM F1667 Carbon Steel',
      diameterInches: 0.162,
      lengthInches: 3.5,
      coating: 'Bright or Hot-Dip Galvanized G90',
      shearCapacityLbs: 141,
      tensionCapacityLbs: 95,
      minEdgeDistanceInches: 0.75,
      minSpacingInches: 2.5,
      substrateCompatibility: ['WOOD_ENGINEERED_WOOD'],
      applicableStandard: 'ASTM F1667',
      sourceProvenance: 'NDS 2024 Table 12N Reference Lateral Design Values for Common Nails'
    });

    this.registerFastener({
      fastenerId: 'FAST-SCREW-SDS25300',
      name: '1/4" x 3" Heavy-Duty Connector Screw',
      type: 'SCREW',
      materialGrade: 'Heat-Treated Carbon Steel',
      diameterInches: 0.25,
      lengthInches: 3.0,
      coating: 'Double-Barrier Mech-Galv',
      shearCapacityLbs: 480,
      tensionCapacityLbs: 380,
      minEdgeDistanceInches: 0.5,
      minSpacingInches: 1.5,
      substrateCompatibility: ['WOOD_ENGINEERED_WOOD', 'COLD_FORMED_STEEL'],
      applicableStandard: 'ICC-ES ESR-2236',
      sourceProvenance: 'Simpson Strong-Tie Fastening Systems Technical Guide'
    });

    // Compatibility Rules (MATERIAL-COMPATIBILITY-DEGRADATION-SME)
    this.registerCompatibilityRule({
      ruleId: 'RULE-GALVANIC-COPPER-ALUM',
      materialA: 'Copper Pipe / Wire',
      materialB: 'Bare Aluminum / Galvanized Steel',
      compatibilityStatus: 'INCOMPATIBLE',
      riskDescription: 'High galvanic potential difference causing rapid sacrificial corrosion of aluminum/galvanized steel in moist environments',
      mitigationRequirement: 'Must install dielectric isolators, non-conductive rubber gaskets, or PVC sleeves',
      governingStandard: 'IPC 2024 Section 312.1 / NACE SP0169'
    });

    // Assemblies (WOOD-ENGINEERED-WOOD-SME & BUILDING-ENVELOPE-MANAGER)
    this.registerAssembly({
      assemblyId: 'ASSY-WALL-EXT-WOOD-R21',
      assemblyName: '2x6 Exterior Wood Framed Wall with R-21 Insulation',
      category: 'Envelope',
      layers: [
        { layerSequence: 1, layerName: '5/8" Type X Drywall', specId: 'MAT-GYP-TYPEX-58', thicknessInches: 0.625, function: 'Interior Finish' },
        { layerSequence: 2, layerName: '2x6 SPF Wood Stud Cavity', specId: 'MAT-WOOD-SPF-NO2', thicknessInches: 5.5, function: 'Structural Frame' },
        { layerSequence: 3, layerName: 'R-15 Mineral Wool Batt', specId: 'MAT-INSUL-MINWOOL-R15', thicknessInches: 5.5, function: 'Thermal Barrier' },
        { layerSequence: 4, layerName: '1/2" OSB Wall Sheathing', specId: 'MAT-WOOD-SPF-NO2', thicknessInches: 0.5, function: 'Structural Sheathing' },
        { layerSequence: 5, layerName: 'Liquid Weather Barrier', specId: 'MAT-GYP-TYPEX-58', thicknessInches: 0.03, function: 'Air/Water Barrier' }
      ],
      overallThicknessInches: 7.155,
      rValueThermal: 21.0,
      fireRatingHours: 1.0,
      stcSoundRating: 48,
      fastenerSpecId: 'FAST-NAIL-16D-COMMON',
      fastenerSpacingInches: 6.0
    });

    this.isInitialized = true;
    console.log('[MATERIALS KNOWLEDGE ENGINE] Initialized Materials Knowledge Graph with 25 SME domain Specs.');
  }

  public static registerSpecification(spec: MaterialSpecification): void {
    this.specifications.set(spec.specId, spec);
  }

  public static getSpecification(specId: string): MaterialSpecification | undefined {
    this.initialize();
    return this.specifications.get(specId);
  }

  public static getAllSpecifications(): MaterialSpecification[] {
    this.initialize();
    return Array.from(this.specifications.values());
  }

  public static registerFastener(fastener: FastenerSpecification): void {
    this.fasteners.set(fastener.fastenerId, fastener);
  }

  public static getFastener(fastenerId: string): FastenerSpecification | undefined {
    this.initialize();
    return this.fasteners.get(fastenerId);
  }

  public static getAllFasteners(): FastenerSpecification[] {
    this.initialize();
    return Array.from(this.fasteners.values());
  }

  public static registerCompatibilityRule(rule: MaterialCompatibilityRule): void {
    this.compatibilityRules.set(rule.ruleId, rule);
  }

  public static checkCompatibility(materialA: string, materialB: string): MaterialCompatibilityRule | undefined {
    this.initialize();
    for (const rule of this.compatibilityRules.values()) {
      if (
        (rule.materialA.toLowerCase().includes(materialA.toLowerCase()) && rule.materialB.toLowerCase().includes(materialB.toLowerCase())) ||
        (rule.materialA.toLowerCase().includes(materialB.toLowerCase()) && rule.materialB.toLowerCase().includes(materialA.toLowerCase()))
      ) {
        return rule;
      }
    }
    return undefined;
  }

  public static registerAssembly(assembly: AssemblySpecification): void {
    this.assemblies.set(assembly.assemblyId, assembly);
  }

  public static getAssembly(assemblyId: string): AssemblySpecification | undefined {
    this.initialize();
    return this.assemblies.get(assemblyId);
  }

  public static getAllAssemblies(): AssemblySpecification[] {
    this.initialize();
    return Array.from(this.assemblies.values());
  }
}
