import { DigitalTwinProject, EnvironmentProfile } from '../src/types/hermes';

export interface CustomerProjectBrief {
  briefId: string;
  customerName: string;
  projectType: 'APARTMENT_1BR' | 'SINGLE_FAMILY_HOUSE' | 'COMMERCIAL_BATHROOM' | 'MULTI_STORY_COMPLEX';
  targetBudgetUsd: number;
  designAesthetic: 'Modernist' | 'Coastal Contemporary' | 'Industrial Minimalist' | 'Craftsman';
  targetSquareFootage: number;
  targetBedrooms: number;
  targetBathrooms: number;
  specialRequirements: string[];
  environment: EnvironmentProfile;
  createdAt: string;
}

export class ScenarioDirectorEngine {
  private static activeBriefs: Map<string, CustomerProjectBrief> = new Map();

  public static generateCanonicalBrief(type: 'APARTMENT_1BR' | 'SINGLE_FAMILY_HOUSE' | 'COMMERCIAL_BATHROOM'): CustomerProjectBrief {
    const briefId = `BRIEF-${type}-${Date.now()}`;
    let brief: CustomerProjectBrief;

    if (type === 'APARTMENT_1BR') {
      brief = {
        briefId,
        customerName: 'Aura Living Developments LLC',
        projectType: 'APARTMENT_1BR',
        targetBudgetUsd: 185000,
        designAesthetic: 'Modernist',
        targetSquareFootage: 750,
        targetBedrooms: 1,
        targetBathrooms: 1,
        specialRequirements: [
          'Open-concept living room with structural wood studs',
          'En-suite bathroom with waterproof ceramic tile and dual vanity',
          'High-efficiency HVAC mini-split zone',
          'Sound transmission class STC 52 inter-unit walls',
          '160 MPH hurricane wind resistance rating'
        ],
        environment: {
          latitude: 25.7617,
          longitude: -80.1918,
          locationName: 'Miami-Dade Coastal District, FL',
          jurisdiction: 'Florida Building Code (FBC 2023 8th Ed)',
          localCodeVersion: '2023 8th Edition',
          climateZone: 'Zone 1A Very Hot Humid',
          coastalProximityMiles: 1.2,
          saltExposureRisk: 'High',
          windSpeedMph: 160,
          rainfallInchesYear: 62,
          humidityPctAvg: 78,
          minTempF: 42,
          maxTempF: 98,
          freezeThawCycles: 0,
          seismicCategory: 'Category A',
          wildfireRisk: 'Low',
          floodZone: 'AE (BFE +2ft)',
          soilBearingCapacityPsf: 2500,
          groundwaterTableFt: 4.5,
          utilitiesAvailable: ['Municipal Water', 'Sewer', '200A Underground Electric', 'Fiber']
        },
        createdAt: new Date().toISOString()
      };
    } else if (type === 'SINGLE_FAMILY_HOUSE') {
      brief = {
        briefId,
        customerName: 'Pinecrest Custom Estates',
        projectType: 'SINGLE_FAMILY_HOUSE',
        targetBudgetUsd: 650000,
        designAesthetic: 'Coastal Contemporary',
        targetSquareFootage: 2400,
        targetBedrooms: 3,
        targetBathrooms: 2.5,
        specialRequirements: [
          'Continuous stem wall foundation with 3000 PSI concrete',
          'R-21 wall insulation and R-38 roof insulation',
          'Impact-resistant dual-pane low-E glazing',
          'Whole-house fire sprinkler system per NFPA 13D'
        ],
        environment: {
          latitude: 25.6617,
          longitude: -80.3118,
          locationName: 'Pinecrest, FL',
          jurisdiction: 'FBC 2023 High Velocity Hurricane Zone (HVHZ)',
          localCodeVersion: '2023 8th Edition',
          climateZone: 'Zone 1A Very Hot Humid',
          coastalProximityMiles: 3.5,
          saltExposureRisk: 'Moderate',
          windSpeedMph: 175,
          rainfallInchesYear: 60,
          humidityPctAvg: 75,
          minTempF: 40,
          maxTempF: 96,
          freezeThawCycles: 0,
          seismicCategory: 'Category A',
          wildfireRisk: 'Low',
          floodZone: 'X',
          soilBearingCapacityPsf: 3000,
          groundwaterTableFt: 6.0,
          utilitiesAvailable: ['Municipal Water', 'Sewer', '400A Underground Electric']
        },
        createdAt: new Date().toISOString()
      };
    } else {
      brief = {
        briefId,
        customerName: 'Commercial Hospitality Group',
        projectType: 'COMMERCIAL_BATHROOM',
        targetBudgetUsd: 75000,
        designAesthetic: 'Industrial Minimalist',
        targetSquareFootage: 180,
        targetBedrooms: 0,
        targetBathrooms: 1,
        specialRequirements: [
          'ADA compliant turn radius and grab bars',
          'Cast iron drain lines with copper water supply',
          'Non-slip ceramic tile with epoxy grout'
        ],
        environment: {
          latitude: 25.7817,
          longitude: -80.1318,
          locationName: 'Miami Beach, FL',
          jurisdiction: 'FBC 2023 Commercial',
          localCodeVersion: '2023 8th Edition',
          climateZone: 'Zone 1A',
          coastalProximityMiles: 0.5,
          saltExposureRisk: 'High',
          windSpeedMph: 160,
          rainfallInchesYear: 62,
          humidityPctAvg: 80,
          minTempF: 45,
          maxTempF: 95,
          freezeThawCycles: 0,
          seismicCategory: 'Category A',
          wildfireRisk: 'Low',
          floodZone: 'AE',
          soilBearingCapacityPsf: 2000,
          groundwaterTableFt: 3.0,
          utilitiesAvailable: ['Municipal Water', 'Sewer', 'Electric']
        },
        createdAt: new Date().toISOString()
      };
    }

    this.activeBriefs.set(briefId, brief);
    return brief;
  }

  public static getBrief(briefId: string): CustomerProjectBrief | undefined {
    return this.activeBriefs.get(briefId);
  }

  public static getAllBriefs(): CustomerProjectBrief[] {
    return Array.from(this.activeBriefs.values());
  }
}
