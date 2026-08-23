export interface KnowledgeEntity {
  entityId: string;
  name: string;
  entityType: 'MATERIAL' | 'COMPONENT' | 'CODE_RULE' | 'SYSTEM' | 'INSPECTION_POINT';
  domain: string;
  attributes: Record<string, any>;
  provenanceSource: string;
  confidence: number;
  createdAt: string;
}

export interface KnowledgeRelationship {
  relationshipId: string;
  sourceEntityId: string;
  targetEntityId: string;
  relationType:
    | 'HAS_GRADE'
    | 'HAS_COMPOSITION'
    | 'HAS_STRENGTH'
    | 'HAS_DENSITY'
    | 'HAS_CORROSION_BEHAVIOR'
    | 'HAS_FIRE_BEHAVIOR'
    | 'USED_FOR'
    | 'NOT_RECOMMENDED_FOR'
    | 'REQUIRES_COATING'
    | 'COMPATIBLE_WITH'
    | 'INCOMPATIBLE_WITH'
    | 'GOVERNED_BY'
    | 'CONNECTS_TO'
    | 'SUPPORTED_BY'
    | 'PENETRATES'
    | 'REQUIRES_CLEARANCE_FROM'
    | 'INSTALLED_AFTER'
    | 'INSTALLED_BEFORE'
    | 'INSPECTED_BY';
  conditions?: string;
  createdAt: string;
}

export interface GroundedAssertion {
  assertionId: string;
  topic: string;
  statement: string;
  provenanceSource: string;
  codeReference: string;
  applicableConditions: Record<string, any>;
  confidence: number;
  verificationStatus: 'VERIFIED' | 'REVALIDATION_REQUIRED';
  verifiedAt: string;
}

export class KnowledgeGraphEngine {
  private static entities: Map<string, KnowledgeEntity> = new Map();
  private static relationships: KnowledgeRelationship[] = [];
  private static groundedAssertions: GroundedAssertion[] = [];
  private static initialized = false;

  public static initializeSeedGraph(): void {
    if (this.initialized) return;
    this.initialized = true;

    // Seed Material 1: 4000 PSI Concrete
    this.addEntity({
      entityId: 'MAT-CONCRETE-4000',
      name: 'Ready-Mix Concrete 4000 PSI S1 Exposure',
      entityType: 'MATERIAL',
      domain: 'Concrete',
      attributes: {
        family: 'Concrete',
        subtype: 'Ready-Mix Normal Weight',
        compressiveStrengthPSI: 4000,
        densityPcf: 145,
        maxWaterCementRatio: 0.45,
        airEntrainmentRangePct: '4.5 - 7.5%',
        slumpInches: '3 - 5',
        curingDaysRequired: 7,
        fireRatingHours: 3,
        codeClassifications: ['ACI 318-19 Section 19.3', 'FBC 2023 Section 1904']
      },
      provenanceSource: 'ACI 318-19 Building Code Requirements for Structural Concrete',
      confidence: 1.0,
      createdAt: new Date().toISOString()
    });

    // Seed Material 2: Structural Steel A36
    this.addEntity({
      entityId: 'MAT-STEEL-A36',
      name: 'ASTM A36 Structural Carbon Steel',
      entityType: 'MATERIAL',
      domain: 'Steel',
      attributes: {
        family: 'Steel',
        subtype: 'Carbon Structural Steel',
        grade: 'A36',
        yieldStrengthPSI: 36000,
        tensileStrengthPSI: 58000,
        densityPcf: 490,
        elasticModulusPSI: 29000000,
        galvanizingRequirement: 'ASTM A123 Hot-Dip Galvanized for Exterior',
        codeClassifications: ['AISC 360-16', 'ASTM A36']
      },
      provenanceSource: 'AISC 360-16 Specification for Structural Steel Buildings',
      confidence: 1.0,
      createdAt: new Date().toISOString()
    });

    // Seed Material 3: Southern Yellow Pine No. 2
    this.addEntity({
      entityId: 'MAT-WOOD-SYP-NO2',
      name: 'Southern Yellow Pine No. 2 Framed Timber',
      entityType: 'MATERIAL',
      domain: 'Wood',
      attributes: {
        family: 'Wood',
        species: 'Southern Yellow Pine',
        grade: 'No. 2',
        treatment: 'Pressure Treated MCA (Micronized Copper Azole) for Soil Contact',
        bendingFbPSI: 1100,
        shearFvPSI: 175,
        modulusE_PSI: 1400000,
        moistureContentMaxPct: 19,
        codeClassifications: ['NDS 2024 Table 4A', 'AWPA U1 Use Category 4A']
      },
      provenanceSource: 'National Design Specification for Wood Construction (NDS 2024)',
      confidence: 1.0,
      createdAt: new Date().toISOString()
    });

    // Seed Grounded Assertions
    this.addGroundedAssertion({
      assertionId: 'AST-CONCRETE-WCRATIO-01',
      topic: 'CONCRETE_WATER_CEMENT_RATIO',
      statement: 'Concrete exposed to sulphate Category S1 soil requires maximum water-cement ratio of 0.45 and minimum f\'c of 4000 PSI per ACI 318-19 Table 19.3.2.1.',
      provenanceSource: 'ACI 318-19 Table 19.3.2.1',
      codeReference: 'ACI 318-19 Sec 19.3.2.1',
      applicableConditions: { exposureCategory: 'S1', sulphateExposure: true },
      confidence: 1.0,
      verificationStatus: 'VERIFIED',
      verifiedAt: new Date().toISOString()
    });

    this.addGroundedAssertion({
      assertionId: 'AST-STEEL-GALV-01',
      topic: 'STEEL_EXTERIOR_CORROSION_COATING',
      statement: 'All exterior structural steel components within 1/2 mile of coastal salt environment must be hot-dip galvanized per ASTM A123 with minimum 2.0 oz/ft2 coating thickness.',
      provenanceSource: 'AISC 360-16 & FBC 2023 Sec 2203',
      codeReference: 'FBC 2023 Sec 2203.2',
      applicableConditions: { locationCategory: 'Coastal Zone', exposureCategory: 'C5' },
      confidence: 1.0,
      verificationStatus: 'VERIFIED',
      verifiedAt: new Date().toISOString()
    });

    this.addGroundedAssertion({
      assertionId: 'AST-WOOD-GROUND-CONTACT-01',
      topic: 'WOOD_GROUND_CONTACT_TREATMENT',
      statement: 'Lumber in direct contact with earth or embedded in concrete in contact with earth must be pressure treated to AWPA U1 Use Category 4A (Ground Contact General Use).',
      provenanceSource: 'AWPA U1-22 & FBC Wood Sec 2304.12',
      codeReference: 'FBC 2023 Sec 2304.12.1',
      applicableConditions: { groundContact: true },
      confidence: 1.0,
      verificationStatus: 'VERIFIED',
      verifiedAt: new Date().toISOString()
    });
  }

  public static addEntity(entity: KnowledgeEntity): void {
    this.entities.set(entity.entityId, entity);
  }

  public static addRelationship(rel: KnowledgeRelationship): void {
    this.relationships.push(rel);
  }

  public static addGroundedAssertion(assertion: GroundedAssertion): void {
    this.groundedAssertions.push(assertion);
  }

  public static findGroundedAssertion(topic: string, conditions?: Record<string, any>): GroundedAssertion | undefined {
    this.initializeSeedGraph();
    return this.groundedAssertions.find(
      (a) => a.topic === topic && a.verificationStatus === 'VERIFIED'
    );
  }

  public static getAllEntities(): KnowledgeEntity[] {
    this.initializeSeedGraph();
    return Array.from(this.entities.values());
  }

  public static getAllRelationships(): KnowledgeRelationship[] {
    this.initializeSeedGraph();
    return [...this.relationships];
  }

  public static getAllAssertions(): GroundedAssertion[] {
    this.initializeSeedGraph();
    return [...this.groundedAssertions];
  }

  public static markAssertionStaleForSource(sourceName: string): number {
    let count = 0;
    this.groundedAssertions.forEach((a) => {
      if (a.provenanceSource.includes(sourceName)) {
        a.verificationStatus = 'REVALIDATION_REQUIRED';
        count++;
      }
    });
    return count;
  }
}
