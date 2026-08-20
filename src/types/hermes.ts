export type SystemCategory = 
  | 'Architecture'
  | 'Structure'
  | 'Plumbing'
  | 'HVAC'
  | 'Electrical'
  | 'Fire Protection'
  | 'Envelope'
  | 'Site';

export type ComponentType = 
  | 'wall'
  | 'slab'
  | 'footing'
  | 'column'
  | 'beam'
  | 'roof'
  | 'door'
  | 'window'
  | 'pipe'
  | 'duct'
  | 'conduit'
  | 'panel'
  | 'receptacle'
  | 'light'
  | 'fixture'
  | 'insulation'
  | 'waterproofing'
  | 'flashing'
  | 'drainage';

export type InspectionState = 'passed' | 'pending' | 'failed' | 'repaired';

export interface Explainability {
  reason: string;
  environmentalFactor: string;
  codeRule: string;
  alternativesConsidered: string[];
  costImpact: string;
  lifecycleNotes: string;
}

export interface BIMMaterial {
  name: string;
  specification: string;
  quantity: number;
  unit: string;
}

export interface BIMComponent {
  id: string; // e.g. WALL-3-218
  type: ComponentType;
  system: SystemCategory;
  floor: number;
  room: string;
  assembly: string;
  materials: BIMMaterial[];
  geometry: {
    position: [number, number, number]; // [x, y, z]
    dimensions: [number, number, number]; // [width, height, depth/length]
    rotation?: [number, number, number];
  };
  fireRatingHours?: number;
  acousticSTC?: number;
  isExterior: boolean;
  exposure: string;
  connectedComponentIds: string[];
  openings: string[];
  quantity: {
    value: number;
    unit: string;
  };
  unitCost: number;
  totalCost: number;
  installationStageDay: number;
  inspectionState: InspectionState;
  inspectionNotes?: string;
  whySelected: Explainability;
}

export interface EnvironmentProfile {
  latitude: number;
  longitude: number;
  locationName: string;
  jurisdiction: string;
  climateZone: string;
  coastalProximityMiles: number;
  saltExposureRisk: 'High' | 'Moderate' | 'Low';
  windSpeedMph: number;
  rainfallInchesYear: number;
  humidityPctAvg: number;
  minTempF: number;
  maxTempF: number;
  freezeThawCycles: number;
  seismicCategory: string;
  wildfireRisk: 'High' | 'Moderate' | 'Low';
  floodZone: string;
  soilBearingCapacityPsf: number;
  groundwaterTableFt: number;
  utilitiesAvailable: string[];
  localCodeVersion: string;
}

export type TicketSeverity = 'critical' | 'high' | 'medium' | 'low';

export interface InspectionTicket {
  id: string; // e.g. PLUMB-002918
  projectId: string;
  inspectorAgent: string;
  severity: TicketSeverity;
  affectedComponentIds: string[];
  location: string;
  problem: string;
  requiredStandard: string;
  actualCondition: string;
  status: 'open' | 'repaired' | 'verified_closed';
  repairAgentAssigned?: string;
  proposedRepair?: string;
  repairNotes?: string;
  timestamp: string;
}

export type PriceSourceType = 
  | 'VERIFIED CURRENT PRICE'
  | 'PUBLISHED PRICE'
  | 'SUPPLIER ESTIMATE'
  | 'HISTORICAL ESTIMATE'
  | 'MODEL ESTIMATE'
  | 'QUOTE REQUIRED';

export interface BOMItem {
  id: string;
  item: string;
  category: SystemCategory;
  specification: string;
  modeledQuantity: number;
  unit: string;
  wastePercent: number;
  procurementQuantity: number;
  sourceComponentIds: string[];
  unitPrice: number;
  priceSource: PriceSourceType;
  priceDate: string;
  supplierName: string;
  supplierDistanceMiles: number;
  leadTimeWeeks: number;
  estimatedTotalCost: number;
  confidence: number; // 0-100%
}

export interface SupplierSource {
  id: string;
  name: string;
  category: string;
  address: string;
  distanceMiles: number;
  rating: number;
  leadTimeDays: number;
  verifiedProducts: {
    name: string;
    price: number;
    unit: string;
    availability: 'In Stock' | '3-5 Days' | 'Long Lead' | 'Special Order';
  }[];
}

export interface ConstructionTaskSchedule {
  id: string;
  dayStart: number;
  dayEnd: number;
  stageName: string;
  trade: string;
  dependentTaskIds: string[];
  componentIds: string[];
  equipmentRequired: string[];
  status: 'pending' | 'in_progress' | 'completed';
}

export interface ChangeOrderRisk {
  id: string;
  issue: string;
  probability: 'low' | 'medium' | 'high' | 'critical';
  severity: 'low' | 'medium' | 'high' | 'critical';
  potentialCost: number;
  scheduleImpactDays: number;
  affectedTrades: string[];
  recommendedMitigation: string;
  resolved: boolean;
}

export interface ProjectScore {
  overall: number;
  completeness: number;
  structuralValidation: number;
  mepConnectivity: number;
  clashFreePercentage: number;
  codeValidation: number;
  environmentalAppropriateness: number;
  materialCompleteness: number;
  inspectionSuccess: number;
  constructability: number;
  costConfidence: number;
  changeOrderRisk: number;
}

export type PromotionStatus = 
  | 'DISCOVERED'
  | 'CANDIDATE'
  | 'CORROBORATED'
  | 'VERIFIED'
  | 'APPROVED'
  | 'DEPRECATED';

export interface KnowledgeEntity {
  id: string;
  title: string;
  type: 'MATERIAL' | 'ASSEMBLY' | 'ENVIRONMENT' | 'METHOD' | 'HAZARD' | 'FAILURE_MODE' | 'CODE_REQUIREMENT' | 'PRODUCT' | 'SUPPLIER';
  status: PromotionStatus;
  provenance: string;
  confidence: number;
  geography: string;
  applicableConditions: string[];
  sourceEvidence: string;
  connectedEntityIds: string[];
}

export interface LearnedLesson {
  id: string;
  projectId: string;
  projectName: string;
  whatWorked: string;
  whatFailed: string;
  whatRequiredRepair: string;
  reusableAssembly: string;
  nextGymObjective: string;
  timestamp: string;
}

export interface HermesSystemState {
  system_id: string;
  status: 'ACTIVE' | 'PAUSED' | 'TRAINING' | 'RECOVERING';
  current_curriculum_level: number;
  current_training_focus: string;
  overall_training_score: number;
  total_projects_started: number;
  total_projects_completed: number;
  total_heartbeat_count: number;
  total_failures_detected: number;
  total_failures_repaired: number;
  total_components_created: number;
  total_materials_learned: number;
  total_knowledge_entities: number;
  last_heartbeat_at: string;
  next_heartbeat_at: string;
  model_quota_state: 'HEALTHY' | 'DEGRADED' | 'EXHAUSTED';
  compute_quota_state: 'OPTIMAL' | 'DEGRADED';
  pause_controls: {
    is_system_paused: boolean;
    is_training_paused: boolean;
    finish_current_only: boolean;
    pause_reason: string;
  };
}

export type TaskStage =
  | 'SITE_ANALYSIS'
  | 'PROGRAMMING_SITE_PAD'
  | 'EXCAVATION_FOOTINGS'
  | 'UNDERGROUND_UTILITIES'
  | 'FOUNDATION_SLAB'
  | 'STRUCTURE_FRAMING'
  | 'EXTERIOR_ENVELOPE'
  | 'ROOF_ASSEMBLY'
  | 'PLUMBING_ROUGH_IN'
  | 'HVAC_ROUGH_IN'
  | 'ELECTRICAL_ROUGH_IN'
  | 'FIRE_PROTECTION'
  | 'INSPECTOR_SWEEP'
  | 'AUTO_REPAIR_LOOP'
  | 'BOM_QUANTITY_RECALC'
  | 'LOCAL_PROCUREMENT_COSTING'
  | 'JOB_SCHEDULE_4D'
  | 'CHANGE_ORDER_PREVENTION'
  | 'FINAL_SCORE_POSTMORTEM'
  | 'EXTRACT_LEARNED_LESSONS';

export type TaskStatus = 'QUEUED' | 'RUNNING' | 'BLOCKED' | 'COMPLETED' | 'FAILED';

export interface TaskGraphNode {
  id: string;
  projectId: string;
  stage: TaskStage;
  title: string;
  status: TaskStatus;
  assignedAgentId: string;
  dependsOnTaskIds: string[];
  unlocksTaskIds: string[];
  outputSummary?: string;
  created_at: string;
  completed_at?: string;
}

export interface SwarmAgentEntity {
  id: string;
  name: string;
  swarmGroup: string;
  specialty: string;
  status: 'IDLE' | 'RUNNING' | 'WAITING' | 'FAILED' | 'COMPLETED';
  currentTaskId?: string;
  projectId?: string;
  confidence: number;
  lastAction: string;
  lastActionTime: string;
  retryCount: number;
  errorLog?: string;
}

export interface ProjectSnapshot {
  id: string;
  projectId: string;
  versionTag: string; // e.g. "V001", "V002", "V003"
  description: string;
  taskStage: TaskStage;
  components: BIMComponent[];
  componentCount: number;
  completionPct: number;
  timestamp: string;
}

export interface AssemblyPattern {
  id: string;
  title: string;
  category: SystemCategory;
  climateZone: string;
  codeStandard: string;
  assemblyDescription: string;
  keyMaterials: string[];
  successCount: number;
  failureCount: number;
  provenance: string;
  timestamp: string;
}

export interface DigitalTwinProject {
  id: string;
  name: string;
  buildingType: string;
  gymLevel: number;
  iterationNumber: number;
  overallCompletionPct: number;
  status: 'planning' | 'building' | 'inspecting' | 'repairing' | 'completed';
  environment: EnvironmentProfile;
  components: BIMComponent[];
  inspectionTickets: InspectionTicket[];
  bom: BOMItem[];
  suppliers: SupplierSource[];
  schedule: ConstructionTaskSchedule[];
  changeOrderRisks: ChangeOrderRisk[];
  score: ProjectScore;
  snapshots?: ProjectSnapshot[];
  currentVersionTag?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PrimeHeartbeatState {
  activeProjectId: string;
  activeProjectName: string;
  gymLevel: number;
  overallCompletionPct: number;
  heartbeatCount: number;
  lastHeartbeatTime: string;
  statusMessage: string;
  activeSwarmAgent: string;
  unresolvedQuestions: number;
  inspectionFailuresCount: number;
  openClashesCount: number;
  missingMaterialSpecsCount: number;
  missingPriceEvidenceCount: number;
  changeOrderRisksCount: number;
  projectScore: number;
  recentLogs: Array<{
    id: string;
    timestamp: string;
    swarm: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
  }>;
}

export interface ProposedRevision {
  description: string;
  visualChanges: string[];
  structuralImpact: string;
  mepImpact: string;
  costDelta: number;
  scheduleDeltaDays: number;
  materialChanges: string[];
  procurementImpact: string;
  codeImpact: string;
}
