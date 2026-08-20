import { CorpusSourceItem, KnowledgeEntity, SystemCategory } from '../src/types/hermes';

export interface ConstructionProcessGraph {
  id: string;
  buildingType: string;
  description: string;
  stages: Array<{
    stageNumber: number;
    stageName: string;
    tradeCategory: SystemCategory;
    keyPrerequisites: string[];
    criticalRules: string[];
    typicalDurationDays: number;
  }>;
}

export const AUTHORITATIVE_CORPUS_SOURCES: CorpusSourceItem[] = [
  {
    id: 'FBC-2023-HVHZ',
    title: 'Florida Building Code 2023 — High Velocity Hurricane Zone (HVHZ)',
    authority: 'FBC',
    rightsCheckPassed: true,
    docUrl: 'https://floridabuilding.org/fbc/2023',
    parsedAt: new Date().toISOString(),
    extractedEntitiesCount: 142,
    extractedRulesCount: 88,
    extractedAssembliesCount: 34,
    confidenceScore: 99.5,
  },
  {
    id: 'FEMA-P-55',
    title: 'FEMA P-55 Coastal Construction Manual',
    authority: 'FEMA',
    rightsCheckPassed: true,
    docUrl: 'https://www.fema.gov/grants/mitigation/floods/coastal-manual',
    parsedAt: new Date().toISOString(),
    extractedEntitiesCount: 96,
    extractedRulesCount: 62,
    extractedAssembliesCount: 18,
    confidenceScore: 98.8,
  },
  {
    id: 'USDA-FPL-GTR282',
    title: 'USDA Forest Products Laboratory — Wood Handbook (GTR-282)',
    authority: 'USDA Forest Products Laboratory',
    rightsCheckPassed: true,
    docUrl: 'https://www.fpl.fs.usda.gov/woodhandbook',
    parsedAt: new Date().toISOString(),
    extractedEntitiesCount: 210,
    extractedRulesCount: 115,
    extractedAssembliesCount: 45,
    confidenceScore: 99.2,
  },
  {
    id: 'DOE-BUILDING-AMERICA',
    title: 'DOE Building America Solution Center — Hot-Humid Guide',
    authority: 'DOE Building America',
    rightsCheckPassed: true,
    docUrl: 'https://basc.pnnl.gov/resource-guides',
    parsedAt: new Date().toISOString(),
    extractedEntitiesCount: 175,
    extractedRulesCount: 94,
    extractedAssembliesCount: 29,
    confidenceScore: 98.5,
  },
  {
    id: 'IPC-2024-STD',
    title: 'International Plumbing Code 2024 Standards',
    authority: 'IPC',
    rightsCheckPassed: true,
    docUrl: 'https://codes.iccsafe.org/content/IPC2024P1',
    parsedAt: new Date().toISOString(),
    extractedEntitiesCount: 180,
    extractedRulesCount: 130,
    extractedAssembliesCount: 22,
    confidenceScore: 99.1,
  },
  {
    id: 'NEC-2023-STD',
    title: 'National Electrical Code (NFPA 70) 2023 Edition',
    authority: 'NEC',
    rightsCheckPassed: true,
    docUrl: 'https://www.nfpa.org/codes-and-standards/70',
    parsedAt: new Date().toISOString(),
    extractedEntitiesCount: 230,
    extractedRulesCount: 165,
    extractedAssembliesCount: 40,
    confidenceScore: 99.4,
  },
  {
    id: 'ACI-318-20',
    title: 'ACI 318-19(22) Building Code Requirements for Structural Concrete',
    authority: 'ACI 318',
    rightsCheckPassed: true,
    docUrl: 'https://www.concrete.org/aci318',
    parsedAt: new Date().toISOString(),
    extractedEntitiesCount: 160,
    extractedRulesCount: 105,
    extractedAssembliesCount: 25,
    confidenceScore: 99.6,
  },
];

export const PROCESS_GRAPHS: Record<string, ConstructionProcessGraph> = {
  wood_frame_house: {
    id: 'PROC-WOOD-01',
    buildingType: 'Single-Family Wood-Frame Residence',
    description: 'Standard 2-story residential wood-frame construction sequence adapted for HVHZ hurricane & coastal conditions.',
    stages: [
      {
        stageNumber: 1,
        stageName: 'Site Analysis & Setback Verification',
        tradeCategory: 'Site',
        keyPrerequisites: ['Zoning approval', 'Soil bearing test'],
        criticalRules: ['Verify 25ft front setback', 'Verify soil bearing >= 2,000 PSF'],
        typicalDurationDays: 2,
      },
      {
        stageNumber: 2,
        stageName: 'Site Grading & Swale Excavation',
        tradeCategory: 'Site',
        keyPrerequisites: ['Boundary survey'],
        criticalRules: ['2% positive slope away from building footprint'],
        typicalDurationDays: 3,
      },
      {
        stageNumber: 3,
        stageName: 'Underground Utilities Rough-In',
        tradeCategory: 'Plumbing',
        keyPrerequisites: ['Excavation trenching'],
        criticalRules: ['IPC 1/4" per foot sewer slope minimum'],
        typicalDurationDays: 2,
      },
      {
        stageNumber: 4,
        stageName: 'Footings & Continuous Monolithic Slab Concrete Pour',
        tradeCategory: 'Structure',
        keyPrerequisites: ['Sewer lateral laid', 'Vapor barrier 15-mil Stego Wrap'],
        criticalRules: ['ACI 318 4,000 PSI concrete min', 'Rebar clearance 3" to soil'],
        typicalDurationDays: 4,
      },
      {
        stageNumber: 5,
        stageName: 'First & Second Floor Framing + Truss Roof',
        tradeCategory: 'Structure',
        keyPrerequisites: ['Slab cure >= 7 days (2,500 PSI)'],
        criticalRules: ['FBC HVHZ 160 MPH Simpson hurricane ties @ 24" O.C.'],
        typicalDurationDays: 7,
      },
      {
        stageNumber: 6,
        stageName: 'Exterior Sheathing, WRB Membrane & Roof Dry-In',
        tradeCategory: 'Envelope',
        keyPrerequisites: ['Framing complete'],
        criticalRules: ['High-temp ice & water shield underlayment on roof deck'],
        typicalDurationDays: 4,
      },
      {
        stageNumber: 7,
        stageName: 'Rough Plumbing, Electrical & HVAC Ductwork',
        tradeCategory: 'Plumbing',
        keyPrerequisites: ['Dry-in complete'],
        criticalRules: ['NEC AFCI protection', 'Manual J heat load verification'],
        typicalDurationDays: 5,
      },
      {
        stageNumber: 8,
        stageName: 'Independent Inspector Sweep & Code Validation',
        tradeCategory: 'Structure',
        keyPrerequisites: ['All rough MEP in place'],
        criticalRules: ['100% pass on structural hold-downs, pressure tests'],
        typicalDurationDays: 2,
      },
      {
        stageNumber: 9,
        stageName: 'Insulation, Drywall Sheathing & Interior Finishes',
        tradeCategory: 'Architecture',
        keyPrerequisites: ['Inspector sweep pass'],
        criticalRules: ['R-19 wall insulation, R-38 attic insulation'],
        typicalDurationDays: 6,
      },
      {
        stageNumber: 10,
        stageName: 'Final Commissioning & Project Certification',
        tradeCategory: 'Architecture',
        keyPrerequisites: ['Finishes complete'],
        criticalRules: ['Blower door test <= 3 ACH50', 'Final Judge certification'],
        typicalDurationDays: 2,
      },
    ],
  },
  cmu_masonry_house: {
    id: 'PROC-CMU-02',
    buildingType: 'CMU Masonry Coastal Residence',
    description: 'Concrete Masonry Unit (CMU) first floor with engineered wood truss second floor.',
    stages: [
      {
        stageNumber: 1,
        stageName: 'Foundations & Reinforced CMU Stem Wall',
        tradeCategory: 'Structure',
        keyPrerequisites: ['Excavation'],
        criticalRules: ['#5 rebar vertical cells grouted solid every 24"'],
        typicalDurationDays: 5,
      },
      {
        stageNumber: 2,
        stageName: 'Tie-Beam Pour & Structural Framing',
        tradeCategory: 'Structure',
        keyPrerequisites: ['CMU wall cured'],
        criticalRules: ['Continuous 12"x12" concrete tie-beam with 4-#5 rebar'],
        typicalDurationDays: 6,
      },
    ],
  },
};

export const MATERIAL_KNOWLEDGE_BASE: KnowledgeEntity[] = [
  {
    id: 'MAT-CONCRETE-4000',
    title: '4,000 PSI Ready-Mix Concrete with Silica Fume Admixture',
    type: 'MATERIAL',
    status: 'APPROVED',
    provenance: 'ACI 318-19 Chapter 19 & FBC 2023 Section 1905',
    confidence: 99.5,
    geography: 'Coastal & High Exposure Regions',
    applicableConditions: ['Exposure Class C2 (Chloride Exposure)', 'HVHZ Foundation Slabs'],
    sourceEvidence: 'High durability blend preventing saltwater intrusion and rebar corrosion.',
    connectedEntityIds: ['FBC-2023-HVHZ', 'ACI-318-20'],
  },
  {
    id: 'MAT-SIMPSON-HDU4',
    title: 'Simpson Strong-Tie HDU4 Heavy Hold-Down Anchor',
    type: 'PRODUCT',
    status: 'APPROVED',
    provenance: 'FBC Product Approval FL-14298',
    confidence: 99.8,
    geography: 'Florida HVHZ (160+ MPH Wind Zones)',
    applicableConditions: ['Wood-to-Concrete Continuous Tension Load Path'],
    sourceEvidence: '4,565 lbs allowable tension uplift capacity.',
    connectedEntityIds: ['FBC-2023-HVHZ', 'ENV-WIND-04'],
  },
  {
    id: 'MAT-STEGO-VAPOR-15',
    title: 'Stego Wrap 15-Mil Class A Below-Slab Vapor Retarder',
    type: 'MATERIAL',
    status: 'APPROVED',
    provenance: 'ASTM E1745 Class A Standard',
    confidence: 99.0,
    geography: 'High Water Table & Coastal Regions',
    applicableConditions: ['Below Concrete Slab-on-Grade'],
    sourceEvidence: '0.0086 perms water vapor permeance.',
    connectedEntityIds: ['DOE-BUILDING-AMERICA'],
  },
];
