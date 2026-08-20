import { DigitalTwinProject, CodeRuleApplicability } from '../src/types/hermes';

export interface CodeRuleDefinition {
  ruleId: string;
  ruleTitle: string;
  codeEdition: string;
  section: string;
  jurisdictionScope: 'Florida State-Wide' | 'HVHZ (Miami-Dade/Broward)' | 'Non-HVHZ Coastal' | 'Local Municipal';
  buildingTypeApplicability: string[];
  minWindSpeedMph?: number;
  maxWindSpeedMph?: number;
  maxCoastalDistanceMiles?: number;
  description: string;
  sourceDocUrl: string;
}

export const FLORIDA_BUILDING_CODE_RULES: CodeRuleDefinition[] = [
  {
    ruleId: 'FBC-2023-SEC-1609-WIND',
    ruleTitle: 'FBC 2023 Wind Load Design (Non-HVHZ)',
    codeEdition: 'FBC 2023 (8th Edition)',
    section: 'Section 1609.3',
    jurisdictionScope: 'Florida State-Wide',
    buildingTypeApplicability: ['Residential Single-Family', 'Commercial Core & Shell', 'Hospitality / Hotel'],
    minWindSpeedMph: 110,
    description: 'Basic wind speed maps for Risk Category II structures in Florida non-HVHZ coastal zones.',
    sourceDocUrl: 'https://www.floridabuilding.org/fbc/thecode/2023_Code_Development/FBC_2023_8th_Edition.htm'
  },
  {
    ruleId: 'FBC-2023-SEC-1620-HVHZ',
    ruleTitle: 'FBC 2023 High-Velocity Hurricane Zone (HVHZ) Provisions',
    codeEdition: 'FBC 2023 (8th Edition)',
    section: 'Section 1620',
    jurisdictionScope: 'HVHZ (Miami-Dade/Broward)',
    buildingTypeApplicability: ['Residential Single-Family', 'Commercial Core & Shell', 'Hospitality / Hotel'],
    minWindSpeedMph: 170,
    description: 'Special high-velocity hurricane zone requirements mandatory ONLY in Miami-Dade and Broward counties.',
    sourceDocUrl: 'https://www.floridabuilding.org/fbc/thecode/2023_Code_Development/FBC_2023_8th_Edition.htm'
  },
  {
    ruleId: 'FBC-2023-SEC-1809-SHALLOW-FDN',
    ruleTitle: 'FBC 2023 Shallow Footing Embedment & Frost Depth',
    codeEdition: 'FBC 2023 (8th Edition)',
    section: 'Section 1809.4',
    jurisdictionScope: 'Florida State-Wide',
    buildingTypeApplicability: ['Residential Single-Family', 'Commercial Core & Shell'],
    description: 'Minimum depth of footings below undisturbed ground surface shall be 12 inches in Florida.',
    sourceDocUrl: 'https://www.floridabuilding.org/fbc/thecode/2023_Code_Development/FBC_2023_8th_Edition.htm'
  },
  {
    ruleId: 'FEMA-P55-COASTAL-SALT',
    ruleTitle: 'FEMA P-55 Stainless Steel & Galvanized Fastener Requirements in Salt Zones',
    codeEdition: 'FEMA P-55 (5th Edition)',
    section: 'Section 14.3.2',
    jurisdictionScope: 'Non-HVHZ Coastal',
    maxCoastalDistanceMiles: 3.0,
    buildingTypeApplicability: ['Residential Single-Family', 'Hospitality / Hotel'],
    description: 'Exposed structural metal connectors within 3,000 ft - 3 miles of saltwater coast require Grade 316 Stainless Steel or hot-dip galvanizing G185.',
    sourceDocUrl: 'https://www.fema.gov/sites/default/files/2020-08/fema_p55_vol1.pdf'
  },
  {
    ruleId: 'NEC-2023-ART-210-GFCI',
    ruleTitle: 'NEC 2023 GFCI Protection in Wet & Damp Locations',
    codeEdition: 'NEC 2023',
    section: 'Article 210.8(A)',
    jurisdictionScope: 'Florida State-Wide',
    buildingTypeApplicability: ['Residential Single-Family', 'Hospitality / Hotel', 'Commercial Core & Shell'],
    description: 'All 125-volt to 250-volt receptacles in bathrooms, outdoors, crawl spaces, basements, and kitchens require GFCI protection.',
    sourceDocUrl: 'https://www.nfpa.org/codes-and-standards/all-codes-and-standards/list-of-codes-and-standards/detail?code=70'
  }
];

export function evaluateJurisdictionApplicability(
  rule: CodeRuleDefinition,
  project: DigitalTwinProject
): CodeRuleApplicability {
  const env = project.environment;
  const projectCounty = env.jurisdiction.toLowerCase();
  const isHVHZCounty = projectCounty.includes('miami') || projectCounty.includes('broward') || projectCounty.includes('dade');

  let applies = true;
  let justification = `Rule applies to ${project.name} in ${env.jurisdiction}.`;

  // HVHZ Check
  if (rule.jurisdictionScope === 'HVHZ (Miami-Dade/Broward)' && !isHVHZCounty) {
    applies = false;
    justification = `INVALID JURISDICTION APPLICATION: ${rule.ruleTitle} (Section ${rule.section}) is an HVHZ provision applicable ONLY to Miami-Dade and Broward counties. ${project.name} is located in ${env.jurisdiction} (Hillsborough County / Tampa), which is non-HVHZ under FBC 2023. Standard FBC 2023 Chapter 16 applies instead.`;
  }

  // Non-HVHZ Coastal check
  if (rule.jurisdictionScope === 'Non-HVHZ Coastal' && rule.maxCoastalDistanceMiles) {
    if (env.coastalProximityMiles > rule.maxCoastalDistanceMiles) {
      applies = false;
      justification = `Rule condition not triggered: Project is ${env.coastalProximityMiles} miles from coast, exceeding the threshold of ${rule.maxCoastalDistanceMiles} miles.`;
    } else {
      justification = `TRIPPER TRIGGERED: Project is ${env.coastalProximityMiles} miles from saltwater coast (< ${rule.maxCoastalDistanceMiles} mi), triggering mandatory Grade 316 Stainless Steel fasteners under ${rule.ruleTitle}.`;
    }
  }

  // Building Type check
  if (rule.buildingTypeApplicability.length > 0 && !rule.buildingTypeApplicability.includes(project.buildingType)) {
    applies = false;
    justification = `Rule does not apply to building type "${project.buildingType}". Applicable types: ${rule.buildingTypeApplicability.join(', ')}.`;
  }

  return {
    ruleId: rule.ruleId,
    ruleTitle: rule.ruleTitle,
    codeEdition: rule.codeEdition,
    section: rule.section,
    jurisdictionScope: rule.jurisdictionScope,
    appliesToProject: applies,
    justification,
    sourceDocUrl: rule.sourceDocUrl,
    confidence: applies ? 98 : 100
  };
}
