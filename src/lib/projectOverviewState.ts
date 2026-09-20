import {
  BOMItem,
  ChangeOrderRisk,
  ConstructionTaskSchedule,
  HermesWorldState,
  InspectionTicket,
  ManagerReviewRecord,
  SupplierSource,
} from '../types/hermes';
import {
  deriveHumanProjectStatus,
  HumanProjectStatus,
} from './humanProjectStatus';
import {
  deriveMaterialWorkspaceState,
  MaterialWorkspaceState,
} from './materialWorkspaceState';
import {
  deriveHumanTimelineState,
  HumanTimelineState,
  ProjectLastSeenMarker,
} from './projectTimelineState';
import {
  deriveProjectAttentionState,
  ProjectAttentionState,
} from './projectAttentionState';

export type OverviewTruthState = 'AVAILABLE' | 'NOT_CALCULATED' | 'NOT_RECORDED';

export interface ProjectCostOverview {
  state: OverviewTruthState;
  materialsCostUSD?: number;
  turnkeyCostUSD?: number;
  bomScopedCostUSD?: number;
}

export interface ProjectQualityOverview {
  inspectionResultCount: number;
  activeInspectionFailureCount: number;
  activeClashCount: number;
  failedComponentCount: number;
  professionalReviewPendingCount: number;
  ahjPendingCount: number;
  certificateOfOccupancyPendingCount: number;
  summaryLabel: string;
}

export interface ProjectSiteFact {
  key: string;
  label: string;
  value: string | number;
  unit?: string;
  truthStatus?: string;
  source: string;
}

export interface ProjectSiteOverview {
  location?: string;
  jurisdiction?: string;
  facts: ProjectSiteFact[];
  state: 'AVAILABLE' | 'PARTIAL' | 'NOT_RECORDED';
}

export interface ProjectOverviewState {
  project: {
    id: string;
    name: string;
    modeLabel: string;
    location?: string;
  };
  status: HumanProjectStatus;
  attention: ProjectAttentionState;
  timeline: HumanTimelineState;
  materials: MaterialWorkspaceState;
  cost: ProjectCostOverview;
  quality: ProjectQualityOverview;
  site: ProjectSiteOverview;
  evidence: {
    checkpoint: number;
    eventCount: number;
    componentCount: number;
    materialBatchCount: number;
    inspectionCount: number;
    worldStateHash?: string;
  };
}

function finite(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function modeLabel(mode?: string): string {
  if (mode === 'LIVE_PROJECT') return 'Live Project';
  if (mode === 'SIMULATION_GYM') return 'Simulation';
  if (mode === 'REGRESSION_TEST') return 'Test Fixture';
  return mode ? mode.replace(/_/g, ' ') : 'Unknown Mode';
}

function deriveCost(
  state: HermesWorldState,
  materials: MaterialWorkspaceState
): ProjectCostOverview {
  const costScope: any = state.costScopeBreakdown;
  const materialsCostUSD = finite(costScope?.materialsTotalUSD);
  const turnkeyCostUSD = finite(costScope?.turnkeyTotalUSD);

  const bomScopedCostUSD = materials.demandLines.length > 0
    ? materials.demandLines.reduce(
        (sum, line) => sum + (line.extendedScopedCostUSD || 0),
        0
      )
    : undefined;

  if (
    materialsCostUSD === undefined &&
    turnkeyCostUSD === undefined &&
    bomScopedCostUSD === undefined
  ) {
    return { state: 'NOT_CALCULATED' };
  }

  return {
    state: 'AVAILABLE',
    materialsCostUSD,
    turnkeyCostUSD,
    bomScopedCostUSD,
  };
}

function deriveQuality(
  state: HermesWorldState,
  attention: ProjectAttentionState
): ProjectQualityOverview {
  const inspections = state.inspectionTickets || [];
  const activeInspectionFailureCount = inspections.filter(
    (ticket: any) => String(ticket?.status || '').toUpperCase() === 'FAIL'
  ).length;

  const activeClashCount = (state.clashes || []).filter(
    (clash: any) => String(clash?.status || '').toUpperCase() === 'ACTIVE'
  ).length;

  const failedComponentCount = (state.buildingComponents || []).filter(
    (component: any) =>
      String(component?.inspectionStatus || '').toUpperCase() === 'FAILED'
  ).length;

  const professionalReviewPendingCount =
    attention.items.filter(
      (item) => item.category === 'PROFESSIONAL_REVIEW'
    ).length;

  const ahjItems = attention.items.filter((item) => item.category === 'AHJ');
  const certificateOfOccupancyPendingCount = inspections.filter(
    (ticket: any) =>
      String(ticket?.certificateOfOccupancyStatus || '').toUpperCase() ===
      'PENDING_AHJ_FINAL_WALK'
  ).length;

  let summaryLabel = 'No inspection results recorded yet';
  if (inspections.length > 0) {
    if (
      activeInspectionFailureCount > 0 ||
      failedComponentCount > 0 ||
      activeClashCount > 0
    ) {
      summaryLabel = 'Quality issues require attention';
    } else if (
      professionalReviewPendingCount > 0 ||
      ahjItems.length > 0
    ) {
      summaryLabel = 'HERMES checks recorded; external approvals remain';
    } else {
      summaryLabel = 'No active quality failures recorded';
    }
  }

  return {
    inspectionResultCount: inspections.length,
    activeInspectionFailureCount,
    activeClashCount,
    failedComponentCount,
    professionalReviewPendingCount,
    ahjPendingCount: ahjItems.length,
    certificateOfOccupancyPendingCount,
    summaryLabel,
  };
}

function pushFact(
  facts: ProjectSiteFact[],
  key: string,
  label: string,
  value: unknown,
  source: string,
  truthStatus?: string,
  unit?: string
): void {
  if (
    value === undefined ||
    value === null ||
    value === '' ||
    (typeof value === 'number' && !Number.isFinite(value))
  ) {
    return;
  }

  facts.push({
    key,
    label,
    value: value as string | number,
    unit,
    truthStatus,
    source,
  });
}

function deriveSite(state: HermesWorldState): ProjectSiteOverview {
  const facts: ProjectSiteFact[] = [];
  const params: any = state.projectParams || {};
  const jurisdiction: any = state.jurisdictionTruth;
  const geotech: any = state.geotechTruth;
  const foundation: any = state.foundationSelection;

  const location = params.location || jurisdiction?.userProvidedAddress || undefined;
  const jurisdictionName =
    jurisdiction?.geocodedJurisdiction || params.jurisdiction || undefined;

  pushFact(
    facts,
    'code-edition',
    'Building code',
    jurisdiction?.codeEdition,
    'jurisdictionTruth.codeEdition',
    jurisdiction?.status
  );
  pushFact(
    facts,
    'wind',
    'Wind criteria',
    jurisdiction?.windCriteriaMph ?? params.windRatingMph,
    jurisdiction?.windCriteriaMph !== undefined
      ? 'jurisdictionTruth.windCriteriaMph'
      : 'projectParams.windRatingMph',
    jurisdiction?.status || (params.windRatingMph ? 'USER_INPUT' : undefined),
    'MPH'
  );
  pushFact(
    facts,
    'flood-zone',
    'Flood zone',
    jurisdiction?.floodData?.zone,
    'jurisdictionTruth.floodData.zone',
    jurisdiction?.status
  );
  pushFact(
    facts,
    'climate-zone',
    'Climate zone',
    jurisdiction?.climateData?.ashraeZone,
    'jurisdictionTruth.climateData.ashraeZone',
    jurisdiction?.status
  );
  pushFact(
    facts,
    'soil-class',
    'Soil class',
    geotech?.soilClass,
    'geotechTruth.soilClass',
    geotech?.dataOrigin
  );
  pushFact(
    facts,
    'bearing',
    'Allowable bearing',
    geotech?.bearingCapacityPsf ?? params.soilBearingPsf,
    geotech?.bearingCapacityPsf !== undefined
      ? 'geotechTruth.bearingCapacityPsf'
      : 'projectParams.soilBearingPsf',
    geotech?.dataOrigin || (params.soilBearingPsf ? 'USER_INPUT' : undefined),
    'PSF'
  );
  pushFact(
    facts,
    'groundwater',
    'Water table',
    geotech?.waterTableFt ?? params.waterTableFt,
    geotech?.waterTableFt !== undefined
      ? 'geotechTruth.waterTableFt'
      : 'projectParams.waterTableFt',
    geotech?.dataOrigin || (params.waterTableFt ? 'USER_INPUT' : undefined),
    'ft'
  );
  pushFact(
    facts,
    'foundation',
    'Selected foundation',
    foundation?.selectedFoundation,
    'foundationSelection.selectedFoundation',
    foundation?.dataOrigin
  );

  const stateLabel =
    facts.length === 0 && !location && !jurisdictionName
      ? 'NOT_RECORDED'
      : location && jurisdictionName && facts.length >= 3
      ? 'AVAILABLE'
      : 'PARTIAL';

  return {
    location,
    jurisdiction: jurisdictionName,
    facts,
    state: stateLabel,
  };
}

export function deriveProjectOverviewState(
  state: HermesWorldState,
  options?: {
    lastSeen?: ProjectLastSeenMarker | null;
    projectBom?: BOMItem[];
    suppliers?: SupplierSource[];
    legacySchedule?: ConstructionTaskSchedule[];
    legacyInspectionTickets?: InspectionTicket[];
    changeOrderRisks?: ChangeOrderRisk[];
    managerReviews?: ManagerReviewRecord[];
  }
): ProjectOverviewState {
  const status = deriveHumanProjectStatus(state);
  const attention = deriveProjectAttentionState(state, {
    legacyInspectionTickets: options?.legacyInspectionTickets,
    changeOrderRisks: options?.changeOrderRisks,
    managerReviews: options?.managerReviews,
  });
  const timeline = deriveHumanTimelineState(state, {
    lastSeen: options?.lastSeen,
    legacySchedule: options?.legacySchedule,
  });
  const materials = deriveMaterialWorkspaceState(state, {
    projectBom: options?.projectBom,
    suppliers: options?.suppliers,
  });

  return {
    project: {
      id: state.projectId,
      name: state.projectName || state.projectId,
      modeLabel: modeLabel(state.mode),
      location: state.projectParams?.location || undefined,
    },
    status,
    attention,
    timeline,
    materials,
    cost: deriveCost(state, materials),
    quality: deriveQuality(state, attention),
    site: deriveSite(state),
    evidence: status.evidence,
  };
}
