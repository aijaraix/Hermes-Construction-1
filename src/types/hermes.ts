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
  | 'VERIFIED CURRENT QUOTE'
  | 'PUBLISHED CURRENT PRICE'
  | 'SUPPLIER ESTIMATE'
  | 'REGIONAL MARKET ESTIMATE'
  | 'HISTORICAL ESTIMATE'
  | 'MODEL ESTIMATE'
  | 'QUOTE REQUIRED';

export type KnowledgeValidationLevel = 
  | 'UNVALIDATED'
  | 'DISCOVERED'
  | 'EXPERIMENTAL'
  | 'EXTRACTED'
  | 'RULE-CHECKED'
  | 'ENGINEERING-CALCULATED'
  | 'CORROBORATED'
  | 'SOURCE-CORROBORATED'
  | 'SOURCE-VERIFIED'
  | 'TESTED'
  | 'MANAGER_APPROVED'
  | 'PROFESSIONAL-REVIEW-REQUIRED'
  | 'VERIFIED TRAINING LESSON'
  | 'CONTRADICTED'
  | 'REJECTED'
  | 'DEPRECATED'
  | 'INVALID';

export interface CodeRuleApplicability {
  ruleId: string;
  ruleTitle: string;
  codeEdition: string; // e.g. "FBC 2023 (8th Edition)"
  section: string; // e.g. "1609.1.1"
  jurisdictionScope: 'Florida State-Wide' | 'HVHZ (Miami-Dade/Broward)' | 'Non-HVHZ Coastal' | 'Local Municipal';
  appliesToProject: boolean;
  justification: string;
  sourceDocUrl?: string;
  confidence: number;
}

export interface EngineeringCalculation {
  calculationId: string;
  projectId: string;
  componentId: string;
  calculationType: string; // e.g. "Fastener Uplift Shear & Tension Capacity"
  rawInputs: Record<string, number | string>;
  inputUnits: Record<string, string>;
  equations: string[];
  assumptions: string[];
  intermediateCalculations: Record<string, number | string>;
  designDemand: number;
  capacity: number;
  demandCapacityUnit: string; // e.g. "LBF" or "PSF"
  utilizationRatio: number;
  governingCondition: string;
  applicableRuleSection: string;
  validationState: 'VALIDATED' | 'PARTIAL' | 'INVALID' | 'PROFESSIONAL_REVIEW_REQUIRED';
}

export interface DetailedRepairJustification {
  ticketId: string;
  problem: string;
  rootCause: string;
  proposedRepair: string;
  alternativesConsidered: string[];
  selectedSolution: string;
  engineeringCalculation?: EngineeringCalculation;
  materialSpecification: {
    grade: string;
    dimensions: string;
    corrosionProtection: string;
    fastenerSpacing: string;
  };
  environmentalJustification: string;
  applicableCodeRule: string;
  sourceEvidence: string;
  affectedBimComponentIds: string[];
  bomImpact: {
    addedMaterials: string[];
    costDelta: number;
  };
  scheduleImpactDays: number;
}

export interface QuantityProvenance {
  componentId: string;
  componentName: string;
  formulaUsed: string; // e.g. "Length * Width * Depth / 27"
  modeledQuantity: number;
  modeledUnit: string;
  wasteFactorPercent: number;
  procurementQuantity: number;
  procurementUnit: string;
  contributingComponentIds: string[];
}

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
  id?: string;
  title?: string;
  type?: 'MATERIAL' | 'ASSEMBLY' | 'ENVIRONMENT' | 'METHOD' | 'HAZARD' | 'FAILURE_MODE' | 'CODE_REQUIREMENT' | 'PRODUCT' | 'SUPPLIER';
  status?: PromotionStatus;
  provenance?: string;
  confidence: number;
  geography?: string;
  applicableConditions?: string[];
  sourceEvidence?: string;
  connectedEntityIds?: string[];
  entityId?: string;
  name?: string;
  category?: 
    | 'MATERIAL_PROPERTY'
    | 'PHYSICAL_FACT'
    | 'ENGINEERING_PROPERTY'
    | 'CODE_RULE'
    | 'MANUFACTURER_PRODUCT_DATA'
    | 'INSTALLATION_REQUIREMENT'
    | 'CONSTRUCTION_PRACTICE'
    | 'FAILURE_HISTORY'
    | 'REGIONAL_PRACTICE'
    | 'PRICE_DATA'
    | 'SUPPLY_DATA'
    | string;
  properties?: Record<string, any>;
  sourceIds?: string[];
  validationLevel?: KnowledgeValidationLevel;
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
  type?: string;
  swarmGroup?: string;
  specialty: string;
  status: 'IDLE' | 'RUNNING' | 'WAITING' | 'FAILED' | 'COMPLETED' | 'ACTIVE';
  activeTaskId?: string;
  decisionsCount?: number;
  revisionsCount?: number;
  accuracy?: number;
  currentTaskId?: string;
  projectId?: string;
  confidence?: number;
  lastAction?: string;
  lastActionTime?: string;
  retryCount?: number;
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

export interface HeartbeatRecord {
  heartbeat_id: string;
  timestamp: string;
  project: string;
  reason_for_execution: string;
  prime_state_before: string;
  decisions_made: string[];
  tasks_dispatched: string[];
  results_received: string[];
  prime_state_after: string;
  errors: string[];
  next_planned_actions: string[];
}

export interface TaskExecutionRecord {
  task_id: string;
  project: string;
  trade: string;
  scope: string;
  agent_role: string;
  input_state: string;
  dependencies: string[];
  operation: string;
  reasoning_provider: string;
  deterministic_functions_called: string[];
  result: string;
  validation: string;
  downstream_tasks: string[];
  created_at: string;
  completed_at: string;
}

export interface ModelRevisionRecord {
  revision: string; // e.g. "REV-V001"
  timestamp: string;
  project: string;
  triggering_task: string;
  components_added: number;
  components_modified: number;
  components_removed: number;
  quantity_delta: string;
  cost_delta: number;
  inspection_delta: string;
  model_asset_location: string;
}

export interface InspectionAuditRecord {
  inspection_id: string;
  inspector: string;
  project: string;
  scope: string;
  rules_evaluated: string[];
  mathematical_checks: Array<{
    check_name: string;
    formula: string;
    calculated_value: number;
    threshold: string;
    passed: boolean;
  }>;
  failures: string[];
  evidence: string;
  repair_ticket_id?: string;
  reinspection_status: string;
  final_status: 'PASSED' | 'PENDING' | 'FAILED';
}

export interface BOMRevisionRecord {
  bom_revision_id: string;
  project: string;
  timestamp: string;
  triggering_model_revision: string;
  added_quantities: Array<{ item: string; qty: number; unit: string }>;
  removed_quantities: Array<{ item: string; qty: number; unit: string }>;
  changed_quantities: Array<{ item: string; oldQty: number; newQty: number; unit: string }>;
  pricing_changes: Array<{ item: string; oldPrice: number; newPrice: number }>;
  sourcing_changes: Array<{ item: string; supplier: string }>;
}

export interface DecisionLogRecord {
  id: string;
  projectId: string;
  timestamp: string;
  title: string;
  reason: string;
  environmentalFactors: string;
  sourceEvidence: string;
  selectedByAgent: string;
  validatedByInspector: string;
  affectedTaskIds: string[];
}

export interface RoomScope {
  id: string; // e.g. "ROOM-204"
  name: string;
  floor: number;
  areaSqFt: number;
  ceilingHeightFt: number;
  requiredTrades: SystemCategory[];
  componentsAssigned: string[];
  electricalChain: {
    receptacleIds: string[];
    circuitId: string;
    panelId: string;
    feederId: string;
    serviceId: string;
  };
  plumbingChain?: {
    fixtureIds: string[];
    branchId: string;
    stackId: string;
    drainId: string;
    sewerId: string;
  };
  hvacChain: {
    diffuserIds: string[];
    branchDuctId: string;
    trunkDuctId: string;
    equipmentId: string;
  };
}

export interface CompetencyMatrix {
  siteGrading: number; // 0-100
  concrete: number;
  woodFraming: number;
  plumbing: number;
  electrical: number;
  hvac: number;
  envelope: number;
  roofing: number;
  procurement: number;
  bom: number;
  lastUpdated: string;
}

export interface CorpusSourceItem {
  id: string;
  title: string;
  authority: string; // e.g. "FEMA", "USDA FPL", "DOE Building America", "NIST", "FBC", "IPC", "NEC", "ACI 318"
  rightsCheckPassed: boolean;
  docUrl: string;
  parsedAt: string;
  extractedEntitiesCount: number;
  extractedRulesCount: number;
  extractedAssembliesCount: number;
  confidenceScore: number;
}

export type AgentOnboardingState = 
  | 'DEFINED'
  | 'CURRICULUM_ASSIGNED'
  | 'SOURCE_PLAN_ASSIGNED'
  | 'RESEARCHING'
  | 'INGESTING'
  | 'EXTRACTING_KNOWLEDGE'
  | 'VALIDATING_SOURCES'
  | 'MANAGER_REVIEW'
  | 'COMPETENCY_TESTING'
  | 'READY_FOR_SHADOW_WORK'
  | 'READY_FOR_CONSTRUCTION_WORK'
  | 'RESTRICTED'
  | 'RETRAINING_REQUIRED';

export type MessageType = 
  | 'TASK_ASSIGNMENT'
  | 'CONSULTATION_REQUEST'
  | 'CONSULTATION_RESPONSE'
  | 'DESIGN_PROPOSAL'
  | 'CONFLICT_NOTICE'
  | 'REVISION_REQUEST'
  | 'CALCULATION_REQUEST'
  | 'MATERIAL_REQUEST'
  | 'KNOWLEDGE_REQUEST'
  | 'KNOWLEDGE_GAP'
  | 'INSPECTION_REQUEST'
  | 'FAILURE_NOTICE'
  | 'REPAIR_REQUEST'
  | 'REINSPECTION_REQUEST'
  | 'MANAGER_ESCALATION'
  | 'APPROVAL'
  | 'REJECTION'
  | 'INFORMATION_REQUIRED';

export interface AgentContract {
  roleId: string;
  roleName: string;
  managerRoleId: string;
  discipline: SystemCategory | 'Management' | 'Civil' | 'Controls' | 'Quality' | 'Procurement' | 'Closeout';
  responsibilities: string[];
  inputs: string[];
  outputs: string[];
  tools: string[];
  knowledgeDomains: string[];
  canConsult: string[];
  cannotDo: string[];
  validationRequirements: string[];
  escalationRules: string[];
  knowledgeCurriculum: string[];
  readinessStatus: AgentOnboardingState;
  competencyScore: number;
  knowledgeCoveragePct: number;
  isCoreHouse1Role: boolean;
  activeTaskId?: string;
  lastLearningReportId?: string;
}

export interface AgentMessage {
  messageId: string;
  projectId: string;
  senderRoleId: string;
  receiverRoleId: string;
  messageType: MessageType;
  scope: string; // e.g. "ROOM-204" or "BUILDING"
  componentIds: string[];
  payload: Record<string, any>;
  reasoning: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  timestamp: string;
  responseRequired: boolean;
  status: 'OPEN' | 'RESOLVED' | 'ESCALATED';
}

export interface AgentLearningReport {
  reportId: string;
  agentRoleId: string;
  managerRoleId: string;
  knowledgeObjective: string;
  sourcesResearched: string[];
  sourcesApproved: string[];
  sourcesRejected: string[];
  chunksCreated: number;
  entitiesExtracted: number;
  rulesExtracted: number;
  processesExtracted: number;
  failureModesExtracted: number;
  calculationsExtracted: number;
  contradictionsFound: number;
  unresolvedQuestions: string[];
  knowledgeGapsRemaining: string[];
  coverageBefore: number;
  coverageAfter: number;
  confidence: number;
  managerReviewResult: 'APPROVED' | 'NEEDS_REVISION' | 'REJECTED';
  timestamp: string;
}

export interface AuthoritativeSourceDefinition {
  sourceId: string;
  title: string;
  publisher: string;
  agencyOrOrganization: string;
  URL: string;
  documentURLIfPermitted?: string;
  discipline: string;
  applicableAgentRoles: string[];
  topics: string[];
  geographicScope: string;
  jurisdiction: string;
  publicationDate: string;
  editionVersion: string;
  authorityLevel: 
    | 'PRIMARY_GOVERNMENT'
    | 'PRIMARY_TECHNICAL'
    | 'PRIMARY_MANUFACTURER'
    | 'CONSENSUS_STANDARD'
    | 'UNIVERSITY_RESEARCH'
    | 'SECONDARY_TECHNICAL'
    | 'REFERENCE_ONLY';
  accessType: 'FREE_PUBLIC' | 'PERMITTED_BULK' | 'VIEW_ONLY_METADATA';
  copyrightLicenseStatus: 'PUBLIC_DOMAIN' | 'PERMITTED_OPEN' | 'COPYRIGHT_METADATA_ONLY';
  bulkIngestionPermitted: boolean;
  fullTextStoragePermitted: boolean;
  chunkingPermitted: boolean;
  citationRequirements: string;
  lastChecked: string;
  freshnessCategory: 
    | 'FOUNDATIONAL_MATERIAL_SCIENCE'
    | 'CODE_REGULATION'
    | 'MANUFACTURER_PRODUCT_DATA'
    | 'LOCAL_PRICE'
    | 'SUPPLY_LEAD_TIME';
  priority: number;
}

export interface KnowledgeChunk {
  chunkId: string;
  sourceId: string;
  pageOrSection: string;
  headingHierarchy: string[];
  rawText: string;
  normalizedText: string;
  topic: string;
  discipline: string;
  agentTags: string[];
  materialTags: string[];
  processTags: string[];
  locationTags: string[];
  jurisdictionTags: string[];
  version: string;
  embeddingReference?: string;
  sourceURL: string;
  retrievalTimestamp: string;
  rightsStatus: string;
}



export interface KnowledgeGapItem {
  gapId: string;
  agentRoleId: string;
  topic: string;
  question: string;
  impactedDecision: string;
  status: 'OPEN' | 'RESEARCHING' | 'RESOLVED';
  createdAt: string;
  resolvedAt?: string;
  resolutionNote?: string;
}

export interface MaterialOntologyItem {
  materialId: string;
  family: string;
  subfamily: string;
  chemicalComposition?: string;
  grade: string;
  dimensions?: string;
  strength?: string;
  density?: string;
  moistureBehavior: string;
  thermalBehavior: string;
  fireBehavior: string;
  corrosionBehavior: string;
  decayBehavior: string;
  uvBehavior: string;
  intendedUseType: 
    | 'TEMPORARY_SACRIFICIAL'
    | 'TEMPORARY_REUSABLE'
    | 'PERMANENT_INTERIOR'
    | 'PERMANENT_EXTERIOR'
    | 'PERMANENT_BELOW_GRADE'
    | 'PERMANENT_WET_LOCATION'
    | 'PERMANENT_COASTAL_MARINE';
  intendedUseDurationMonths?: number;
  compatibility: string[];
  installationMethods: string[];
  failureModes: string[];
  unitCost: number;
  priceSource: PriceSourceType;
  leadTimeWeeks: number;
}

export interface CoreReadinessGate {
  totalDefinedRoles: number;
  totalCoreHouse1Roles: number;
  curriculumAssignedCount: number;
  initialIngestionCompleteCount: number;
  managerReviewedCount: number;
  shadowTestedCount: number;
  certifiedCount: number;
  requiredCertificationThreshold: number;
  coreConstructionReadinessPct: number;
  isGymBlocked: boolean;
  gymBlockReason: string;
}

// ======================================================================
// PHASE 3.16 REAL KNOWLEDGE & COMPETENCY EXTENSIONS
// ======================================================================

export type CurriculumTopicStatus = 
  | 'NO_EVIDENCE'
  | 'SOURCE_FOUND'
  | 'INGESTED'
  | 'KNOWLEDGE_EXTRACTED'
  | 'CORROBORATED'
  | 'TESTED'
  | 'MANAGER_APPROVED';

export interface AgentCurriculumTopic {
  topicId: string;
  topicName: string;
  importance: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'ELECTIVE';
  requiredDepth: 'FUNDAMENTAL' | 'PRACTITIONER' | 'EXPERT' | 'AUTHORITATIVE';
  requiredSourceAuthority: string;
  minimumIndependentSources: number;
  requiresCalculationTest: boolean;
  requiresScenarioTest: boolean;
  requiresShadowTest: boolean;
  status: CurriculumTopicStatus;
  evidenceSourceChunkIds: string[];
  evidenceAssertionIds: string[];
}

export interface AgentCurriculum {
  curriculumId: string;
  agentRoleId: string;
  roleTitle: string;
  discipline: SystemCategory | 'Management' | 'Civil' | 'Controls' | 'Quality' | 'Procurement' | 'Closeout';
  topics: AgentCurriculumTopic[];
  overallCoverageScorePct: number;
  lastUpdated: string;
}

export interface FetchedDocument {
  documentId: string;
  sourceId: string;
  originalUrl: string;
  retrievedUrl: string;
  retrievalTime: string;
  mimeType: string;
  sizeBytes: number;
  checksumSha256: string;
  filePathOrKey: string;
  licenseStatus: 'PUBLIC_DOMAIN' | 'PERMITTED_OPEN' | 'COPYRIGHT_METADATA_ONLY' | 'RESTRICTED';
  rightsStatus: string;
  sourceAuthority: string;
  pageCount?: number;
  parsedText: string;
}

export interface KnowledgeAssertion {
  assertionId: string;
  subject: string;
  predicate: string;
  objectValue: string;
  units?: string;
  sourceChunkId: string;
  sourceDocumentId: string;
  sourceUrl: string;
  pageNumber?: number;
  sectionTitle?: string;
  confidence: number;
  agentExtractorId: string;
  validationStatus: 'DISCOVERED' | 'EXTRACTED' | 'CORROBORATED' | 'MANAGER_APPROVED' | 'CONTRADICTED' | 'REJECTED';
  geographicScope: string;
  buildingTypeScope: string;
  materialScope: string;
  effectiveDate: string;
  version: string;
}

export interface KnowledgeContradiction {
  contradictionId: string;
  subject: string;
  assertionAId: string;
  assertionBId: string;
  assertionAText: string;
  assertionBText: string;
  sourceAId: string;
  sourceBId: string;
  assignedManagerRoleId: string;
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED_BY_MANAGER';
  resolutionDetails?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface AgentKnowledgePack {
  packId: string;
  agentRoleId: string;
  versionTag: string; // e.g. "KP-v1.0.0"
  approvedChunkIds: string[];
  approvedAssertionIds: string[];
  approvedRules: string[];
  approvedCalculations: string[];
  approvedFailureModes: string[];
  managerRoleId: string;
  approvalStatus: 'DRAFT' | 'MANAGER_APPROVED' | 'ACTIVE_CONSTRUCTION';
  createdAt: string;
}

export interface CompetencyTestScenario {
  testId: string;
  agentRoleId: string;
  category: 'KNOWLEDGE_RETRIEVAL' | 'MATERIAL_SELECTION' | 'CALCULATION_SETUP' | 'FAILURE_RECOGNITION' | 'COORDINATION' | 'SOURCE_CITATION' | 'SCOPE_BOUNDARIES';
  scenarioTitle: string;
  scenarioDescription: string;
  inputData: Record<string, any>;
  expectedConstraints: string[];
  passingScoreThreshold: number;
}

export interface CompetencyTestResult {
  resultId: string;
  testId: string;
  agentRoleId: string;
  timestamp: string;
  passed: boolean;
  scorePct: number;
  reasoningOutput: string;
  citedChunkIds: string[];
  feedbackNotes: string;
  evaluatedByManagerId: string;
}

export interface ShadowWorkProposal {
  proposalId: string;
  agentRoleId: string;
  taskStage: TaskStage;
  scope: string;
  proposedAction: string;
  proposedBimComponentIds: string[];
  benchmarkComparison: string;
  managerReviewStatus: 'PENDING' | 'PASSED_SHADOW' | 'FAILED_SHADOW';
  evalNotes: string;
  timestamp: string;
}

export interface HttpSourceFetchRecord {
  fetchId: string;
  sourceId: string;
  documentId: string;
  requestedUrl: string;
  finalUrl: string;
  retrievedAt: string;
  httpStatus: number;
  contentType: string;
  contentLength: number;
  checksumSha256: string;
  rightsStatus: string;
  storagePath: string;
  fetchStatus: 'SUCCESS' | 'FAILED' | 'RIGHTS_RESTRICTED';
  etag?: string;
  lastModified?: string;
}

export interface DocumentParseRecord {
  parseId: string;
  documentId: string;
  parserType: 'PDF' | 'HTML' | 'TXT' | 'WEB_STRUCTURED';
  parserName?: string;
  parserVersion?: string;
  parserMode?: 'PRIMARY_PDF_PARSER' | 'FALLBACK_PDF_PARSER' | 'OCR_LAST_RESORT' | 'HTML_PARSER';
  parseConfidence?: number;
  pageCount: number;
  characterCount: number;
  sectionsDetected: number;
  tablesDetected: number;
  parseWarnings: string[];
  parseErrors: string[];
  status: 'PARSED_SUCCESS' | 'PARSE_FAILED';
  parsedAt: string;
}

export type ReviewMode =
  | 'LLM_REASONED_MANAGER_REVIEW'
  | 'DETERMINISTIC_GOVERNANCE_REVIEW'
  | 'HUMAN_REVIEW'
  | 'PROFESSIONAL_REVIEW';

export interface ManagerReviewRecord {
  reviewId: string;
  managerRoleId: string;
  agentRoleId: string;
  reviewMode?: ReviewMode;
  evidenceReviewed: {
    curriculumCoveragePct: number;
    studiedSourceIds: string[];
    knowledgePackVersion: string;
    latestTestScorePct: number;
    citedChunkIds: string[];
    shadowWorkPassed: boolean;
    executionMode?: ExecutionMode;
  };
  decision: 'APPROVED' | 'APPROVED_WITH_LIMITS' | 'RETRAINING_REQUIRED' | 'MORE_EVIDENCE_REQUIRED' | 'REJECTED' | 'PROFESSIONAL_REVIEW_REQUIRED';
  reasons: string[];
  limitations?: string[];
  reviewedAt: string;
}

export interface AgentAuditTrace {
  agentRoleId: string;
  roleTitle: string;
  discipline: string;
  managerRoleId: string;
  sourceUrl: string;
  documentId: string;
  documentChecksum: string;
  pageNumber: number;
  chunkId: string;
  chunkText: string;
  assertionId: string;
  assertionText: string;
  knowledgePackVersion: string;
  testId: string;
  testScenarioTitle: string;
  initialTestScorePct: number;
  initialTestPassed: boolean;
  initialAgentResponse: string;
  retrainingTriggered: boolean;
  retrainingGapNote?: string;
  retrainingSourcesStudied?: string[];
  retrainKnowledgePackVersion?: string;
  finalTestScorePct: number;
  finalTestPassed: boolean;
  finalAgentResponse: string;
  managerReviewDecision: string;
  managerReviewNotes: string;
  shadowRunScorePct: number;
  shadowRunPassed: boolean;
  shadowRunOutput: string;
  certificationStatus: 'UNTESTED' | 'RETRAINING_REQUIRED' | 'READY_FOR_SHADOW_WORK' | 'READY_FOR_CONSTRUCTION_WORK';
}

export interface ResearchRecord {
  researchId: string;
  agentRoleId: string;
  query: string;
  searchProvider: string;
  resultsCount: number;
  selectedUrl: string;
  publisher: string;
  retrievalStatus: 'SUCCESS' | 'FAILED' | 'RIGHTS_RESTRICTED';
  rightsStatus: string;
  decision: string;
  timestamp: string;
}

// ======================================================================
// PHASE 3.17.2 GENUINE REASONING & INDEPENDENT EVALUATION EXTENSIONS
// ======================================================================

export interface CompetencyScenario {
  scenarioId: string;
  agentRoleId: string;
  discipline: SystemCategory | 'Management' | 'Civil' | 'Controls' | 'Quality' | 'Procurement' | 'Closeout';
  difficulty: 'FUNDAMENTAL' | 'PRACTITIONER' | 'EXPERT' | 'HARD_BOUNDARY';
  jurisdiction: string;
  buildingType: string;
  location: string;
  roomId: string;
  scenarioTitle: string;
  scenarioDescription: string;
  inputs: Record<string, any>;
  constraints: Record<string, any>;
  availableEvidence: string[];
  knowledgePackId: string;
  hiddenValidationRules: Record<string, any>; // Hidden from agent during execution!
  expectedOutputSchema: Record<string, any>;
  createdAt: string;
  version: string;
}

export type ExecutionMode =
  | 'LLM_REASONED'
  | 'DETERMINISTIC_TOOL'
  | 'SIMULATION_ONLY'
  | 'NOT_EXECUTED'
  | 'EXECUTION_DEFERRED_NO_PROVIDER'
  | 'EXECUTION_FAILED';

export interface AgentExecutionRecord {
  executionId: string;
  agentRoleId: string;
  executionMode: ExecutionMode;
  modelProvider: string; // e.g. "GoogleGemini" or "DeterministicProposalSimulator"
  modelName: string; // e.g. "gemini-3.7-flash"
  scenarioId: string;
  knowledgePackId: string;
  retrievedChunkIds: string[];
  promptHash: string;
  rawResponse: string;
  structuredProposal: Record<string, any>;
  citations: string[];
  toolCalls: any[];
  startedAt: string;
  completedAt: string;
  usageMetadata?: any;
  providerRequestId?: string;
  responseStatus: string;
  executionStatus: 'EXECUTED' | 'NOT_EXECUTED' | 'FAILED';
}

export interface ValidationResult {
  validationId: string;
  executionId: string;
  scenarioId: string;
  agentRoleId: string;
  reasoningScorePct: number;
  calculationScorePct: number;
  sourceGroundingPct: number;
  constraintCompliancePct: number;
  uncertaintyHandlingPct: number;
  completenessPct: number;
  assumptionQualityPct: number;
  mathScorePct: number;
  codeCompliancePct: number;
  overallScorePct: number;
  passed: boolean;
  criticalFailure: boolean;
  criticalFailureReason?: string;
  calculatedMetrics: Record<string, number | string | boolean>;
  violations: string[];
  unsupportedCitations: string[];
  validatedAt: string;
}

export interface TopicCompetency {
  topicId: string;
  topicName: string;
  scorePct: number;
  status: 'UNTESTED' | 'TESTED_PASS' | 'TESTED_FAIL' | 'RETRAINED_PASS';
  lastEvaluatedAt: string;
}

export interface CertificationScope {
  status: 'UNTESTED' | 'RETRAINING_REQUIRED' | 'READY_FOR_SHADOW_WORK' | 'READY_FOR_CONSTRUCTION_WORK';
  buildingType: string;
  jurisdiction: string;
  climateZone: string;
  allowedScope: string;
  limitations: string[];
  certifiedAt: string;
}

export type EventOrigin = 'REAL_RUNTIME' | 'DETERMINISTIC_ENGINE' | 'SIMULATION' | 'SYSTEM_ADMIN';

export interface LiveLearningActivity {
  activityId: string;
  timestamp: string;
  agentRoleId: string;
  agentName: string;
  activityType: 'SCENARIO_DISPATCHED' | 'RETRIEVAL_COMPLETED' | 'AGENT_REASONED' | 'VALIDATOR_EVALUATED' | 'GAP_DETECTED' | 'RETRAINING_STARTED' | 'MANAGER_REVIEWED' | 'SHADOW_DISPATCHED' | 'SHADOW_EVALUATED' | 'CERTIFIED';
  title: string;
  details: string;
  realityTag: 'REAL_EXECUTION' | 'DETERMINISTIC_VALIDATION' | 'MODEL_GENERATED' | 'SOURCE_GROUNDED' | 'FAILED' | 'RETRAINING' | 'MANAGER_APPROVED' | 'SHADOW_ONLY';
  origin?: EventOrigin;
  executionId?: string;
}




