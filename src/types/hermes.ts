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
  domainBoundary?: DomainBoundary;
  sourcePlan?: SourcePlanItem[];
}

export interface DomainBoundary {
  domain: string;
  subdomains: string[];
  allowedKnowledge: string[];
  relatedKnowledge: string[];
  outOfScopeKnowledge: string[];
  consultationTargets: string[];
}

export interface SourcePlanItem {
  sourceId: string;
  title: string;
  publisher: string;
  url: string;
  authority: 'PRIMARY_GOVERNMENT' | 'NATIONAL_LAB' | 'ACADEMIC_UNIVERSITY' | 'OPEN_TECHNICAL' | 'MANUFACTURER_SPEC';
  priority: number;
  discipline: string;
  targetTopics: string[];
}

export interface Phase318AInitialReport {
  reportTimestamp: string;
  validSpecialistRolesCount: number;
  managersCount: number;
  rolesRemovedOrMerged: string[];
  curriculaCreatedCount: number;
  totalCurriculumTopicsCount: number;
  sourcePlansCount: number;
  sourcesDiscoveredCount: number;
  documentsFetchedCount: number;
  pagesParsedCount: number;
  chunksCreatedCount: number;
  knowledgeEntitiesCount: number;
  knowledgePacksCount: number;
  agentsActivelyLearningCount: number;
  reasoningJobsCount: number;
  knowledgeGapsCount: number;
  learningHeartbeatStatus: string;
  unattendedSchedulerStatus: string;
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
  | 'DETERMINISTIC_VALIDATOR'
  | 'DETERMINISTIC_SIMULATION'
  | 'DEFERRED_QUOTA'
  | 'FAILED_PROVIDER'
  | 'NOT_EXECUTED'
  | 'DETERMINISTIC_TOOL'
  | 'SIMULATION_ONLY'
  | 'EXECUTION_DEFERRED_NO_PROVIDER'
  | 'EXECUTION_FAILED';

export interface ProviderAttemptRecord {
  attemptId: string;
  executionId: string;
  agentRoleId: string;
  provider: string;
  model: string;
  attemptNumber: number;
  requestTimestamp: string;
  responseTimestamp: string;
  httpStatus: number;
  quotaStatus: boolean;
  success: boolean;
  reason: string;
}

export interface StructuredProviderErrorMetadata {
  errorType: 'RATE_LIMIT' | 'API_ERROR' | 'INVALID_CONFIG';
  provider: string;
  model: string;
  status: number;
  occurredAt: string;
  messageSummary: string;
}

export interface DeferredReasoningJob {
  jobId: string;
  agentRoleId: string;
  scenarioId: string;
  knowledgePackId: string;
  retrievedChunkIds: string[];
  createdAt: string;
  nextAttemptAt: number;
  retryCount: number;
  maxRetries: number;
  status: 'QUEUED_DEFERRED' | 'PROCESSING' | 'COMPLETED' | 'FAILED_EXHAUSTED';
  lastErrorReason?: string;
  discipline: string;
  criticality: 'CRITICAL' | 'HIGH' | 'STANDARD';
}

export interface ProviderFailoverPolicy {
  tier1Model: string;
  tier2Model: string;
  tier3Model: string;
  verifiedModels: string[];
  invalidModels: string[];
  allowSimulationFallbackForContinuity: boolean;
  maxQueueRetries: number;
  baseBackoffMs: number;
}

export interface RetroactiveAuditReport {
  auditedAt: string;
  totalRecordsAudited: number;
  llmReasonedExecutions: number;
  deterministicSimulations: number;
  quotaDeferredExecutions: number;
  providerFailures: number;
  improperSimulationCompetencyRecordsFound: number;
  competencyRecordsInvalidated: number;
  certificationRecordsInvalidated: number;
  realReasoningJobsRequeued: number;
  invalidatedEvidenceDetails: Array<{
    agentRoleId: string;
    reason: string;
    invalidatedAt: string;
  }>;
}

export interface Phase318A2Report {
  generatedAt: string;
  primaryGeminiModel: string;
  secondaryGeminiModels: string[];
  verifiedAvailableModels: string[];
  realLlmExecutions: number;
  simulationExecutions: number;
  quotaDeferrals: number;
  providerFailures: number;
  queuedRealReasoningJobs: number;
  recoveredReplayedJobs: number;
  simulationCompetencyCredits: number;
  simulationCertifications: number;
  simulationHouse1QualificationCredits: number;
  historicalInvalidSimulationEvidenceFound: number;
  invalidatedRecordsCount: number;
  requeuedJobsCount: number;
  learningIntegrityIncidentsCount: number;
  providerHealthStatus: 'AVAILABLE' | 'RATE_LIMITED' | 'OFFLINE';
  governanceQuestions: {
    CAN_GEMINI_QUOTA_FAILURE_CREATE_FAKE_COMPETENCY: 'NO';
    CAN_DETERMINISTIC_SIMULATION_CERTIFY_AN_AGENT: 'NO';
    CAN_SIMULATION_KEEP_ENGINEERING_WORKFLOWS_ACTIVE: 'YES';
    ARE_SIMULATION_AND_LLM_REASONING_VISIBLY_DISTINCT: 'YES';
    DO_QUOTA_DEFERRED_JOBS_RESUME_AUTOMATICALLY: 'YES';
    PHASE_3_18A_2_VERIFIED: 'YES' | 'NO';
    PHASE_3_18B_READY_TO_UNLOCK: 'NO';
  };
  exitGates: ExitGateRecord[];
}

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
  agentId?: string;
  agentRole?: string;
  domain?: string;
  subdomain?: string;
  jurisdiction: string;
  buildingType: string;
  materialSystems?: string[];
  environmentalConditions?: string[];
  codeEditions?: string[];
  validatedCapabilities?: string[];
  excludedCapabilities?: string[];
  knowledgePackVersion?: string;
  sourceCoveragePct?: number;
  sandboxDifficultyLevel?: number;
  certificationDate?: string;
  expirationPolicy?: string;
  evidenceIds?: string[];
  certificationStatus?: 'MASTERED_WITHIN_VALIDATED_SCOPE' | 'OUTSIDE_VALIDATED_SCOPE' | 'PENDING_REVALIDATION';
  status?: 'UNTESTED' | 'RETRAINING_REQUIRED' | 'READY_FOR_SHADOW_WORK' | 'READY_FOR_CONSTRUCTION_WORK';
  climateZone?: string;
  allowedScope?: string;
  limitations?: string[];
  certifiedAt?: string;
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

// ======================================================================
// PHASE 3.18A.1 REALITY CHECKPOINT & LEARNING PROOF EXTENSIONS
// ======================================================================

export type RoleLearningCategory = 
  | 'SPECIALIST_LEARNING'
  | 'MANAGER_LEARNING'
  | 'INSPECTOR_LEARNING'
  | 'SYSTEM_ORCHESTRATION';

export type SpecialistOrManagerType = 'SPECIALIST' | 'MANAGER' | 'INSPECTOR' | 'EXECUTIVE';

export interface MultiDimensionalCompetency {
  knowledgeCoverage: number;       // %
  sourceGrounding: number;          // %
  technicalReasoning: number;       // %
  calculationAccuracy: number;      // %
  codeApplication: number;          // %
  materialKnowledge: number;        // %
  constructability: number;         // %
  tradeCoordination: number;        // %
  safetyRecognition: number;        // %
  uncertaintyHandling: number;      // %
  sandboxPerformance: number;       // %
  adversarialTestPerformance: number; // %
  overallReadinessScore: number;    // %
}

export interface ScopeBoundCertification {
  certifiedScope: string;
  jurisdictionScope: string;
  materialSystemScope: string;
  evidenceVersion: string;
  knowledgePackVersion: string;
  certificationDate: string;
  knownLimitations: string[];
  unresolvedGaps: string[];
}

export interface CanonicalRoleRecord {
  agent_id: string;
  agent_name: string;
  role_type: RoleLearningCategory;
  discipline: string;
  manager_id: string;
  specialist_or_manager: SpecialistOrManagerType;
  curriculum_id: string;
  source_plan_id: string;
  knowledge_pack_id: string;
  academy_status: 'UNTESTED' | 'INGESTING' | 'KNOWLEDGE_TESTED' | 'READY_FOR_SHADOW_WORK' | 'READY_FOR_CONSTRUCTION_WORK';
  reasoning_jobs_completed: number;
  sandbox_runs_completed: number;
  competency_status: string;
  certification_status: string;
  competencyBreakdown: MultiDimensionalCompetency;
  certifiedScopeDetail?: ScopeBoundCertification;
}

export interface TopicCoverageItem {
  topicId: string;
  curriculumTopic: string;
  requiredKnowledge: string;
  authoritativeSource: string;
  retrieved: boolean;
  parsed: boolean;
  chunked: boolean;
  assertionsExtracted: boolean;
  corroborated: boolean;
  tested: boolean;
  confidenceScorePct: number;
  remainingKnowledgeGap?: string;
}

export interface AgentKnowledgeCoverageMap {
  agentRoleId: string;
  agentName: string;
  discipline: string;
  lastUpdated: string;
  topics: TopicCoverageItem[];
  overallCoveragePct: number;
}

export type SourceLifecycleStatus = 
  | 'DISCOVERED'
  | 'FETCH_PENDING'
  | 'FETCHED'
  | 'FETCH_FAILED'
  | 'PROVENANCE_INVALID'
  | 'RIGHTS_RESTRICTED'
  | 'PARSED'
  | 'CHUNKED'
  | 'EXTRACTED'
  | 'VALIDATED';

export interface AuthoritativeSourceLifecycleRecord {
  source_id: string;
  authority: string;
  official_url: string;
  document_title: string;
  document_type: string;
  rights_status: string;
  retrieval_status: SourceLifecycleStatus;
  http_status?: number;
  retrieval_timestamp?: string;
  etag_or_last_modified?: string;
  document_sha256?: string;
  document_size_bytes?: number;
  parser_used?: string;
  pages_parsed: number;
  chunks_created: number;
  knowledge_entities_extracted: number;
  agents_assigned: string[];
}

export interface SandboxRunRecord {
  sandboxRunId: string;
  agentRoleId: string;
  sandboxType: 'Electrical' | 'HVAC' | 'Plumbing' | 'Structural' | 'Envelope' | 'Materials';
  inputs: Record<string, any>;
  agentProposal: Record<string, any>;
  validatorOutput: {
    passed: boolean;
    violations: string[];
    metrics: Record<string, any>;
  };
  inspectorReview?: {
    inspectorAgentRoleId: string;
    defectsFound: string[];
    passed: boolean;
  };
  timestamp: string;
}

export interface UnattendedSchedulerDecision {
  cycleNumber: number;
  timestamp: string;
  agentSelected: string;
  agentName: string;
  reasonSelected: string;
  activityPerformed: string;
  sourceOrReasoningOrSandboxUsed: string;
  result: string;
  stateChange: string;
  nextRecommendedAction: string;
}

export interface AcademyMetrics {
  canonicalRoleCount: number;
  specialistCount: number;
  managerCount: number;
  inspectorCount: number;
  orchestratorCount: number;

  curriculaCount: number;
  curriculumTopicCount: number;

  sourcesRegistered: number;
  sourcesRetrieved: number;
  sourcesFailed: number;
  sourcesRightsRestricted: number;

  documentsFetched: number;
  documentsParsed: number;
  pagesParsed: number;
  chunks: number;
  knowledgeEntities: number;
  assertions: number;

  knowledgePacks: number;

  realModelExecutions: number;
  simulationExecutions: number;
  failedExecutions: number;

  competencyTests: number;
  competencyPasses: number;
  competencyFailures: number;

  knowledgeGapsOpen: number;
  knowledgeGapsResolved: number;

  sandboxRuns: number;
  sandboxPasses: number;
  sandboxFailures: number;

  managerReviews: number;
  inspectorReviews: number;

  heartbeatCycles: number;

  certifiedAgents: number;
  learningAgents: number;
  untestedAgents: number;

  // Distinct Coverage Metrics
  curriculumAssignmentCoveragePct: number;
  sourceCoveragePct: number;
  knowledgeEvidenceCoveragePct: number;
  knowledgeTestCoveragePct: number;
  sandboxTestCoveragePct: number;
  certifiedScopeCoveragePct: number;
}

export interface ExitGateRecord {
  gateId: string;
  description: string;
  status: 'PASSED' | 'FAILED' | 'PENDING';
  evidenceRecordIds?: string[];
  evidenceNote?: string;
  verifiedAt: string;
  verifier?: string;
  failureReason?: string;
}

export interface Phase318A1Report {
  reportTimestamp: string;
  phase318bLocked: boolean;
  house1CanonicalBuildLocked: boolean;
  academyMetrics: AcademyMetrics;
  canonicalRoles: {
    specialistsCount: number;
    managersCount: number;
    inspectorsCount: number;
    orchestrationCount: number;
    totalCount: number;
  };
  curriculaStats: {
    assigned: number;
    inProgress: number;
    completed: number;
    blocked: number;
    orphan: number;
    duplicate: number;
    totalTopics: number;
  };
  sourceStats: {
    discovered: number;
    successfullyRetrieved: number;
    rightsRestricted: number;
    failed: number;
    documentsCount: number;
    pagesParsed: number;
    chunksCreated: number;
    assertionsExtracted: number;
    knowledgePacksCount: number;
  };
  learningStats: {
    agentsTrainedCount: number;
    reasoningExecutionsCount: number;
    competencyTestsCount: number;
    failedTestsCount: number;
    knowledgeGapsCreated: number;
    knowledgeGapsResolved: number;
  };
  sandboxStats: {
    totalRuns: number;
    passes: number;
    failures: number;
  };
  governanceStats: {
    managerReviewsCount: number;
    inspectorReviewsCount: number;
    certifiedAgentsCount: number;
    agentsStillTrainingCount: number;
  };
  unattendedProof: UnattendedSchedulerDecision[];
  realitySwarmAudit: {
    discrepanciesDetected: number;
    safeRepairsPerformed: number;
    escalatedDomainConflicts: number;
  };
  persistenceRestartVerified: boolean;
  exitGates: Record<string, boolean>;
  exitGateRecords: ExitGateRecord[];
}

export interface LiveProofA {
  proofId: 'PROOF_A_REAL_LLM_REASONING';
  executed: boolean;
  passed: boolean;
  agentRoleId: string;
  scenarioId: string;
  provider: string;
  model: string;
  knowledgePackId: string;
  executionMode: 'LLM_REASONED';
  validatorPassed: boolean;
  competencyDelta: number;
  timestamp: string;
}

export interface LiveProofB {
  proofId: 'PROOF_B_SIMULATION_ISOLATION';
  executed: boolean;
  passed: boolean;
  competencyBefore: number;
  certificationBefore: string;
  shadowQualificationBefore: boolean;
  house1ReadinessBefore: number;
  competencyAfter: number;
  certificationAfter: string;
  shadowQualificationAfter: boolean;
  house1ReadinessAfter: number;
  competencyDelta: number;
  timestamp: string;
}

export interface LiveProofC {
  proofId: 'PROOF_C_QUOTA_DEFER_RECOVERY';
  executed: boolean;
  passed: boolean;
  initialJobState: 'DEFERRED_QUOTA';
  recoveredJobState: 'LLM_REASONED';
  queuedAt: string;
  recoveredAt: string;
  timestamp: string;
}

export interface LiveProofD {
  proofId: 'PROOF_D_REALITY_SWARM_INTEGRITY';
  executed: boolean;
  passed: boolean;
  simulatedContaminationInjected: boolean;
  incidentDetectedByRealitySwarm: boolean;
  incidentType: 'SIMULATION_EVIDENCE_ATTACHED_TO_COMPETENCY';
  engineeringCalculationsAltered: false;
  invalidLinkageRepaired: boolean;
  timestamp: string;
}

export interface Phase318A2LiveProofResults {
  verified: boolean;
  phase318a2Verified: boolean;
  phase318bUnlocked: boolean;
  executedAt: string;
  proofA: LiveProofA;
  proofB: LiveProofB;
  proofC: LiveProofC;
  proofD: LiveProofD;
}

export interface Phase318BContinuousReport {
  generatedAt: string;
  heartbeatCycles: number;
  elapsedRuntimeSeconds: number;

  operationalMetrics: {
    deterministicOperations: number;
    realLlmReasoningCalls: number;
    simulationExecutions: number;
    quotaDeferrals: number;
    recoveredReasoningJobs: number;
    sourcesDiscovered: number;
    documentsRetrievalCount: number;
    pagesParsed: number;
    chunksCreated: number;
    knowledgeEntitiesCreated: number;
    knowledgePacksUpdated: number;
    agentsTrained: number;
    competencyTests: number;
    passes: number;
    failures: number;
    knowledgeGapsCreated: number;
    knowledgeGapsResolved: number;
    sandboxExercises: number;
    managerReviews: number;
    managerRejections: number;
    inspectorSweeps: number;
    defectsDetected: number;
    certifiedCapabilitiesCount: number;
    house1ReadinessBefore: number;
    house1ReadinessAfter: number;
  };

  efficiencyMetrics: {
    deterministicToLlmRatio: string;
    knowledgeReuseRatePct: number;
    duplicateReasoningAvoided: number;
    llmCallsPerAgentAdvancement: number;
  };

  declarations: {
    PHASE_3_18A_2_LIVE_PROOF_VERIFIED: 'YES' | 'NO';
    SIMULATION_COMPETENCY_CONTAMINATION: 'YES' | 'NO';
    QUOTA_DEFER_AND_RECOVERY_VERIFIED: 'YES' | 'NO';
    REALITY_LEARNING_INTEGRITY_VERIFIED: 'YES' | 'NO';
    PHASE_3_18B_UNLOCKED: 'YES' | 'NO';
    CONTINUOUS_ACADEMY_RUNNING: 'YES' | 'NO';
    MANUAL_TRAINING_BUTTON_REQUIRED: 'YES' | 'NO';
    DETERMINISTIC_WORK_REQUIRES_LLM: 'YES' | 'NO';
    LLM_RESERVED_FOR_REASONING: 'YES' | 'NO';
    KNOWLEDGE_REUSE_ACTIVE: 'YES' | 'NO';
    AUTONOMOUS_SOURCE_INGESTION_ACTIVE: 'YES' | 'NO';
    AUTONOMOUS_SPECIALIST_TRAINING_ACTIVE: 'YES' | 'NO';
    AUTONOMOUS_MANAGER_TRAINING_ACTIVE: 'YES' | 'NO';
    AUTONOMOUS_INSPECTOR_TRAINING_ACTIVE: 'YES' | 'NO';
    AUTONOMOUS_RETRAINING_ACTIVE: 'YES' | 'NO';
    REALITY_SWARM_MONITORING_ACTIVE: 'YES' | 'NO';
    HOUSE_1_CANONICAL_BUILD_STARTED: 'YES' | 'NO';
  };
}

// ======================================================================
// PHASE 3.18B.1 RUNTIME HARDENING & SCHEDULER TYPES
// ======================================================================

export type AcademyRuntimeHealthStatus =
  | 'ACADEMY_CONFIGURED'
  | 'ACADEMY_PROCESS_ACTIVE'
  | 'ACADEMY_DURABLY_RUNNING'
  | 'ACADEMY_IDLE'
  | 'ACADEMY_PAUSED'
  | 'ACADEMY_DEGRADED'
  | 'ACADEMY_OFFLINE';

export interface AcademyExecutionLock {
  ownerId: string;
  acquiredAt: string;
  expiresAt: string;
  heartbeatId: string;
  workerIdentity: string;
}

export interface ProductionHeartbeatRecord {
  heartbeatId: string;
  requestedTime: string;
  startedTime: string;
  completedTime?: string;
  workerIdentity: string;
  triggerSource: 'HTTP_SCHEDULER' | 'WATCHDOG' | 'DEV_TIMER' | 'MANUAL_API' | 'UNATTENDED_TEST';
  primeDecision: string;
  jobsDispatched: number;
  jobsCompleted: number;
  jobsDeferred: number;
  errors: string[];
  nextWakeRecommendationSeconds: number;
  status: 'SUCCESS' | 'SKIPPED' | 'FAILED' | 'IDLE';
}

export interface KnowledgeReuseMetricRecord {
  llmCallId: string;
  agentRoleId: string;
  taskOrScenarioId: string;
  timestamp: string;
  reasoningNecessity: 'GENUINE_AMBIGUITY' | 'NEW_DOMAIN' | 'COMPETENCY_TEST' | 'MANAGER_CHALLENGE';
  knowledgeRetrievalAttempted: boolean;
  relevantKnowledgeFound: boolean;
  whyExistingKnowledgeInsufficient: string;
  llmCallRequired: boolean;
  duplicateAvoided: boolean;
}

export interface Phase318B1Report {
  generatedAt: string;
  runtimeMode: 'development' | 'production';
  runtimeHealthStatus: AcademyRuntimeHealthStatus;
  lastHeartbeatTimestamp?: string;
  secondsSinceLastHeartbeat?: number;
  schedulerArchitecture: {
    authoritativeScheduler: string;
    triggerEndpoint: string;
    watchdogEnabled: boolean;
    localTimerDisabledInProduction: boolean;
    idempotencyEnforced: boolean;
  };
  operationalMetrics: {
    totalProductionHeartbeats: number;
    successfulHeartbeats: number;
    skippedDuplicateHeartbeats: number;
    idleHeartbeats: number;
    failedHeartbeats: number;
    totalJobsQueued: number;
    totalJobsProcessed: number;
    totalJobsDeferred: number;
    totalWatchdogRecoveries: number;
    staleClaimsRepaired: number;
  };
  reuseMetrics: {
    totalLlmCalls: number;
    knowledgeRetrievalAttemptedCount: number;
    relevantKnowledgeFoundCount: number;
    knowledgeReuseRatePct: number;
    duplicatesAvoidedCount: number;
  };
  instanceLossVerification: {
    verified: boolean;
    testedAt?: string;
    jobsLostCount: number;
    competencyLostPct: number;
    knowledgeEntitiesLostCount: number;
  };
  unattended60MinProof: {
    executed: boolean;
    executedAt?: string;
    simulatedCycles: number;
    simulatedDurationMinutes: number;
    zeroBrowserTrafficDependencyVerified: boolean;
    knowledgeGainedCount: number;
    competencyImprovementPct: number;
    zeroJobLossVerified: boolean;
  };
  declarations: {
    TRUE_247_SCHEDULER_HARDENED: 'YES' | 'NO';
    LOCAL_TIMER_BYPASSED_IN_PRODUCTION: 'YES' | 'NO';
    DISTRIBUTED_LOCKING_ACTIVE: 'YES' | 'NO';
    IDEMPOTENT_HEARTBEATS_ENFORCED: 'YES' | 'NO';
    EVENT_DRIVEN_CONTINUATION_ACTIVE: 'YES' | 'NO';
    DURABLE_WATCHDOG_ACTIVE: 'YES' | 'NO';
    KNOWLEDGE_REUSE_INSTRUMENTED: 'YES' | 'NO';
    REALITY_SWARM_RUNTIME_AUDIT_ACTIVE: 'YES' | 'NO';
    INSTANCE_LOSS_RECOVERY_VERIFIED: 'YES' | 'NO';
    UNATTENDED_60MIN_PROOF_VERIFIED: 'YES' | 'NO';
    HOUSE_1_NOT_STARTED: 'YES' | 'NO';
  };
  exitGates: ExitGateRecord[];
}

// ======================================================================
// PHASE 3.18B.2 LIVE LEARNING PROOF, SME MASTERY & KNOWLEDGE CONVERGENCE TYPES
// ======================================================================

export type SmeDomainMasteryStatus =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'PROFICIENT'
  | 'ADVANCED'
  | 'MASTERED';

export type SmeKnowledgeNodeStatus =
  | 'KNOWN'
  | 'PARTIALLY_KNOWN'
  | 'UNKNOWN'
  | 'RIGHTS_RESTRICTED'
  | 'SOURCE_REQUIRED'
  | 'VERIFICATION_REQUIRED';

export interface SmeKnowledgeTreeNode {
  nodeId: string;
  topic: string;
  category: string;
  description: string;
  status: SmeKnowledgeNodeStatus;
  masteryLevel: SmeDomainMasteryStatus;
  requiredSources: string[];
  groundedAssertionsCount: number;
  corroboratedAssertionsCount: number;
  lastUpdated?: string;
  unresolvedGaps: string[];
}

export interface SmeKnowledgeTree {
  specialistId: string;
  specialistRole: string;
  discipline: string;
  nodes: SmeKnowledgeTreeNode[];
  totalNodesCount: number;
  coveredNodesCount: number;
  partialNodesCount: number;
  unknownNodesCount: number;
  coveragePct: number;
}

export interface AgentBaselineCompetencyDimensions {
  factualKnowledge: number | 'UNKNOWN' | 'NOT_TESTED';
  codeStandardsKnowledge: number | 'UNKNOWN' | 'NOT_TESTED';
  materialsKnowledge: number | 'UNKNOWN' | 'NOT_TESTED';
  calculationAbility: number | 'UNKNOWN' | 'NOT_TESTED';
  installationMethodKnowledge: number | 'UNKNOWN' | 'NOT_TESTED';
  diagnosticAbility: number | 'UNKNOWN' | 'NOT_TESTED';
  designReasoning: number | 'UNKNOWN' | 'NOT_TESTED';
  constraintRecognition: number | 'UNKNOWN' | 'NOT_TESTED';
  uncertaintyHandling: number | 'UNKNOWN' | 'NOT_TESTED';
  sourceGrounding: number | 'UNKNOWN' | 'NOT_TESTED';
  crossTradeCoordination: number | 'UNKNOWN' | 'NOT_TESTED';
  fieldPracticalReasoning: number | 'UNKNOWN' | 'NOT_TESTED';
}

export interface AgentBaselineSnapshot {
  agentId: string;
  role: string;
  scope: string;
  curriculumId: string;
  curriculumDomains: string[];
  authoritativeSourcesAssigned: string[];
  sourcesSuccessfullyRetrieved: number;
  documentsSuccessfullyParsed: number;
  pagesAvailable: number;
  knowledgeChunks: number;
  groundedAssertions: number;
  corroboratedAssertions: number;
  knowledgePackVersion: string;
  unresolvedKnowledgeGaps: number;
  competencyDimensions: AgentBaselineCompetencyDimensions;
  snapshotTimestamp: string;
}

export interface LiveLearningCounters {
  realDocumentsRetrieved: number;
  realBytesRetrieved: number;
  realPagesParsed: number;
  realChunksCreated: number;
  groundedAssertionsCreated: number;
  corroboratedAssertions: number;
  knowledgeTreeNodesCovered: number;
  knowledgeTreeNodesPartial: number;
  knowledgeTreeNodesUnknown: number;
  knowledgePackUpdates: number;
  knowledgeGapsCreated: number;
  knowledgeGapsResolved: number;
  windowLastHour: Record<string, number>;
  windowLast24Hours: Record<string, number>;
  windowLifetime: Record<string, number>;
}

export interface SourceProvenanceChain {
  chainId: string;
  agentRoleId: string;
  sourceId: string;
  sourceTitle: string;
  publisher: string;
  documentId: string;
  sha256Hash: string;
  pageOrSection: string;
  chunkId: string;
  assertionId: string;
  assertionText: string;
  knowledgeTreeNodeId: string;
  knowledgePackId: string;
  testOrSandboxDecision: string;
  verifiedAt: string;
}

export interface SpecialistLearningProofResult {
  specialistId: string;
  specialistRole: string;
  discipline: string;
  baselineKnowledgeState: {
    knowledgePackVersion: string;
    coveragePct: number;
    assertionsCount: number;
  };
  unseenPretrainScore: number;
  pretrainErrors: string[];
  sourcesIngested: {
    sourceId: string;
    title: string;
    url: string;
    sha256: string;
    bytes: number;
    pagesParsed: number;
  }[];
  groundedAssertionsExtracted: number;
  updatedKnowledgePackVersion: string;
  unseenPosttrainScore: number;
  learningDelta: number;
  sandboxExerciseResult: {
    exerciseName: string;
    status: 'PASSED' | 'FAILED';
    physicsScore: number;
    defectsIdentified: number;
  };
  inspectorAdversarialResult: {
    inspectorRoleId: string;
    defectsInjected: number;
    defectsDetected: number;
    defectsCorrected: number;
    status: 'PASSED' | 'FAILED';
  };
  managerReviewResult: {
    managerRoleId: string;
    submittalApproved: boolean;
    decisionNotes: string;
  };
  retentionTestResult: 'RETENTION_TEST_PASS' | 'RETENTION_TEST_FAIL';
  domainMastery: Record<string, SmeDomainMasteryStatus>;
  provenanceChains: SourceProvenanceChain[];
}

export interface AgentMasteryProfile {
  agentId: string;
  agentRole: string;
  discipline: string;
  whatItKnows: string[];
  whatItDoesNotKnow: string[];
  whatItIsStudying: string;
  realSourcesUsed: string[];
  documentsConsumed: number;
  pagesParsed: number;
  knowledgeCoveragePct: number;
  currentMasteryByDomain: Record<string, SmeDomainMasteryStatus>;
  recentFailures: string[];
  knowledgeGaps: string[];
  retrainingHistory: { timestamp: string; topic: string; resolved: boolean }[];
  sandboxPerformance: { totalRuns: number; passRatePct: number; score: number };
  inspectorPerformance: { totalSweeps: number; defectsCaughtPct: number };
  managerAssessment: { status: 'APPROVED' | 'REJECTED' | 'PENDING'; notes: string };
  latestUnseenTest: { preScore: number; postScore: number; delta: number };
  learningRatePctPerCycle: number;
  diminishingReturnFlagged: boolean;
  estimatedCyclesToMastery: number;
}

export interface HistoricalClaimAuditRecord {
  agentId: string;
  discipline: string;
  curriculumId: string;
  knowledgePackVersion: string;
  claimedPreScore: number;
  claimedPostScore: number;
  auditStatus: 'VERIFIED' | 'DOWNGRADED' | 'RE_BENCHMARKED';
  preTestScenarioIds: string[];
  postTestScenarioIds: string[];
  differentQuestionsVerified: boolean;
  llmExecutionIds: string[];
  validatorResults: string;
  managerReview: string;
  inspectorReview: string;
  sourceAssertionsUsed: number;
  sourceProvenanceHashes: string[];
  verifiedAt: string;
}

export type House1CapabilityReadiness =
  | 'NOT_STARTED'
  | 'TRAINING'
  | 'SANDBOX_PASSED'
  | 'MANAGER_APPROVED'
  | 'INSPECTOR_PASSED'
  | 'CROSS_TRADE_PASSED'
  | 'READY'
  | 'BLOCKED_RIGHTS'
  | 'KNOWLEDGE_GAP';

export interface House1CapabilityNode {
  capabilityId: string;
  name: string;
  category: 'SITE' | 'FOUNDATION' | 'STRUCTURE' | 'ENCLOSURE' | 'MEP' | 'FINISHES' | 'INSPECTION' | 'PROCUREMENT' | 'SCHEDULE' | 'CLOSEOUT';
  discipline: string;
  description: string;
  isMandatoryForHouse1: boolean;
  primarySpecialist: string;
  responsibleManager: string;
  independentInspector: string;
  requiredSources: string[];
  requiredKnowledge: string[];
  requiredSandbox: string;
  requiredValidator: string;
  requiredCrossTradeTests: string[];
  readinessStatus: House1CapabilityReadiness;
  difficultyLevelAchieved: number; // 1 to 8
  roleGapFlagged?: boolean;
}

export interface SourceRightsAuditRecord {
  sourceId: string;
  sourceOwner: string;
  documentTitle: string;
  edition: string;
  url: string;
  retrievalDate: string;
  rightsClassification: 'PUBLIC_FULL_TEXT' | 'RESTRICTED_METADATA_ONLY' | 'PROPRIETARY_CITATION_ONLY' | 'QUARANTINED';
  fullTextIngestionPermitted: boolean;
  metadataStoragePermitted: boolean;
  citationPermitted: boolean;
  documentHash?: string;
  pagesProcessed: number;
  pagesParsed?: number;
  quarantinedTextPresent: boolean;
  alternativePrimarySources: string[];
}

export interface RealityAcademyReport {
  academyId: string;
  trainingRunsCount: number;
  defectsInjectedCount: number;
  defectsDetectedCount: number;
  falsePositivesCount: number;
  falseNegativesCount: number;
  detectionRatePct: number;
  uiDataConflictsFound: number;
  securityFindingsCount: number;
  autoRepairsCount: number;
  escalationsCount: number;
  metricTraceVerification: {
    displayedHeartbeatsTraceable: boolean;
    displayedAgentCountTraceable: boolean;
    displayedCompetencyTraceable: boolean;
    displayedDocumentsTraceable: boolean;
  };
}

export interface JobAccountingReconciliation {
  jobsCreated: number;
  queued: number;
  claimed: number;
  running: number;
  completed: number;
  failed: number;
  deferredQuota: number;
  blocked: number;
  retryWait: number;
  totalAccounted: number;
  unaccountedJobs: number;
  accountingVerified: boolean;
}

export interface Phase318B2FullReport {
  generatedAt: string;
  canonicalRoster: {
    specialistsCount: number;
    managersCount: number;
    inspectorsCount: number;
    orchestratorsCount: number;
    realityAgentsCount: number;
    totalRosterCount: number;
  };
  historicalClaimAudits: HistoricalClaimAuditRecord[];
  house1CapabilityGraph: {
    totalCapabilities: number;
    readyCount: number;
    trainingCount: number;
    blockedCount: number;
    failedCount: number;
    readinessPct: number;
    house1ReadyForOwnerAuthorization: 'YES' | 'NO';
    house1CanonicalBuildStarted: 'NO';
    capabilities: House1CapabilityNode[];
  };
  sourceRightsAudits: SourceRightsAuditRecord[];
  realityAcademy: RealityAcademyReport;
  jobAccounting: JobAccountingReconciliation;
  learningVelocity24h: {
    newSourcesDiscovered: number;
    newLegitimateDocuments: number;
    newPagesParsed: number;
    newGroundedAssertions: number;
    newKnowledgePackVersions: number;
    newCapabilitiesMastered: number;
    knowledgeGapsResolved: number;
    prePostCompetencyDeltaAvg: number;
    knowledgeReuseRatePct: number;
  };
  declarations: {
    REAL_SOURCE_RETRIEVAL_ACTIVE: 'YES' | 'NO';
    REAL_DOCUMENT_PARSING_ACTIVE: 'YES' | 'NO';
    REAL_KNOWLEDGE_GROWTH_ACTIVE: 'YES' | 'NO';
    FULL_ROSTER_TRAINING_ACTIVE: 'YES' | 'NO';
    SCOPE_BOUND_CERTIFICATION_ACTIVE: 'YES' | 'NO';
    UNSEEN_TESTING_ACTIVE: 'YES' | 'NO';
    PROGRESSIVE_DIFFICULTY_ACTIVE: 'YES' | 'NO';
    SPECIALIST_SANDBOX_ACTIVE: 'YES' | 'NO';
    MANAGER_INDEPENDENT_TRAINING_ACTIVE: 'YES' | 'NO';
    INSPECTOR_INDEPENDENT_TRAINING_ACTIVE: 'YES' | 'NO';
    CROSS_TRADE_TRAINING_ACTIVE: 'YES' | 'NO';
    REALITY_UI_ACADEMY_ACTIVE: 'YES' | 'NO';
    REALITY_SELF_AUDIT_ACTIVE: 'YES' | 'NO';
    EXTERNAL_DURABLE_SCHEDULER_ACTIVE: 'YES' | 'NO';
    WALL_CLOCK_UNATTENDED_EXECUTION_VERIFIED: 'YES' | 'NO';
    SIMULATION_COMPETENCY_CONTAMINATION: 'NO';
    UNACCOUNTED_JOBS: 0;
    HOUSE_1_CAPABILITY_GATE_ACTIVE: 'YES';
    HOUSE_1_CANONICAL_BUILD_STARTED: 'NO';
  };
  exitGates: ExitGateRecord[];
}

export type Phase318B2Report = Phase318B2FullReport;

// Phase 3.18B.3 — Continuous Spatial Construction Academy Types

export interface FastenerScheduleItem {
  id: string;
  type: string;
  material: string;
  size: string;
  spacingPattern: string;
  quantity: number;
  hostObjectId: string;
  purpose: string;
  codeReference: string;
}

export interface CrossTradeChangeRequest {
  id: string;
  requestingAgent: string;
  requestingSystem: SystemCategory;
  targetAgent: string;
  targetSystem: SystemCategory;
  description: string;
  impactedObjectIds: string[];
  proposedChange: string;
  status: 'pending' | 'approved' | 'rejected' | 'resolved';
  managerApproval?: string;
  timestamp: string;
}

export interface SpatialModelRevision {
  revisionId: string;
  revisionNumber: number;
  timestamp: string;
  agentId: string;
  agentRole: string;
  managerId: string;
  taskDescription: string;
  actionType: 'CREATE_WALL' | 'PLACE_COMPONENT' | 'ROUTE_SYSTEM' | 'CONNECT_COMPONENTS' | 'REPAIR_DEFECT' | 'COORDINATE_CLASH';
  objectsAdded: string[];
  objectsChanged: string[];
  objectsRemoved: string[];
  materialsAdded: Array<{ name: string; qty: number; unit: string }>;
  bomDeltaTotalCost: number;
  reasoning: string;
  codeReference: string;
  modelSnapshot: BIMComponent[];
}

export interface KnowledgeGapRecord {
  gapId: string;
  agentId: string;
  role: string;
  topic: string;
  missingInformation: string;
  sourceRequirements: string[];
  createdTimestamp: string;
  resolvedTimestamp?: string;
  status: 'UNRESOLVED' | 'RESOLVED' | 'DEPRECATED';
}

export interface SpatialAcademyProject {
  projectId: string;
  title: string;
  difficultyLevel: number; // 1 = Component, 2 = Assembly, 3 = System, 4 = Room, 5 = Multi-Room, 6 = Floor, 7 = Small House, 8 = Complex House, 9 = House #1
  difficultyName: string;
  stage: 'SOURCE_DISCOVERY' | 'KNOWLEDGE_EXTRACTION' | 'SPATIAL_CONSTRUCTION' | 'ROOM_MANAGER_REVIEW' | 'FLOOR_MANAGER_REVIEW' | 'INSPECTION_SWEEP' | 'CROSS_TRADE_COORDINATION' | 'DEFECT_RETRAINING' | 'DIGITALLY_COMPLETE';
  siteCoordinateSystem: {
    origin: [number, number, number];
    bounds: [number, number, number];
    units: string;
  };
  components: BIMComponent[];
  fasteners: FastenerScheduleItem[];
  revisions: SpatialModelRevision[];
  inspectionTickets: InspectionTicket[];
  crossTradeRequests: CrossTradeChangeRequest[];
  knowledgeGaps: KnowledgeGapRecord[];
  agentAssignments: Array<{ agentId: string; role: string; system: SystemCategory }>;
  digitalCompletionPct: number;
  isDigitallyComplete: boolean;
  startedFromEmpty: boolean;
}

export interface BathroomCapabilityRecord {
  capabilityId: string;
  capabilityName: string;
  required: boolean;
  responsibleSpecialist: string;
  responsibleManager: string;
  independentInspector: string;
  requiredSources: string[];
  requiredConstructionActions: string[];
  requiredInspection: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'PASSED' | 'FAILED';
}

export interface AgentUtilizationRecord {
  agentId: string;
  role: string;
  domain: string;
  learningJobs: number;
  spatialConstructionJobs: number;
  reasoningJobs: number;
  sandboxExercises: number;
  managerInteractions: number;
  inspectionInteractions: number;
  idleDurationSeconds: number;
  blockedDurationSeconds: number;
  lastActivityTimestamp: string;
  nextScheduledActivity: string;
  isStarved: boolean;
}

export interface PrimeOrchestrationDecision {
  primeDecisionId: string;
  timestamp: string;
  candidateJobs: string[];
  selectedJobs: string[];
  agentsAssigned: string[];
  reasonSelected: string;
  dependencies: string[];
  resourceConstraints: string;
  knowledgeGapsTargeted: string[];
  projectPriority: string;
  expectedOutcome: string;
}

export interface SystemConnectivityGraph {
  nodes: Array<{ id: string; label: string; system: SystemCategory; status: string }>;
  edges: Array<{ source: string; target: string; connectionType: string; isConnected: boolean }>;
}

export interface Phase318B3CheckpointReport {
  SPATIAL_ACADEMY_ACTIVE: 'YES' | 'NO';
  CANONICAL_PROJECT_MODEL_ACTIVE: 'YES' | 'NO';
  CURRENT_TRAINING_PROJECT: string;
  CURRENT_DIFFICULTY_LEVEL: string;
  CURRENT_PROJECT_STAGE: string;
  KNOWLEDGE_ACQUISITION_ACTIVE: 'YES' | 'NO';
  PRACTICAL_CONSTRUCTION_ACTIVE: 'YES' | 'NO';
  MANAGER_REVIEW_ACTIVE: 'YES' | 'NO';
  INSPECTOR_MODEL_REVIEW_ACTIVE: 'YES' | 'NO';
  CROSS_TRADE_COORDINATION_ACTIVE: 'YES' | 'NO';
  REALITY_SWARM_MODEL_AUDIT_ACTIVE: 'YES' | 'NO';
  CANONICAL_MODEL_OBJECTS: number;
  MODEL_REVISIONS: number;
  ACTIVE_AGENTS: number;
  COMPLETED_AGENT_TASKS: number;
  FAILED_AGENT_TASKS: number;
  CROSS_TRADE_CONSULTATIONS: number;
  CLASHES_FOUND: number;
  CLASHES_RESOLVED: number;
  INSPECTION_DEFECTS: number;
  REPAIRS: number;
  KNOWLEDGE_GAPS: number;
  RETRAINING_CYCLES: number;
  BOM_MODEL_DERIVED: 'YES' | 'NO';
  CONSTRUCTION_PLAYBACK_FROM_REAL_REVISIONS: 'YES' | 'NO';
  VIEWER_RENDERING_CANONICAL_MODEL: 'YES' | 'NO';
  COMPONENT_CLICK_THROUGH_ACTIVE: 'YES' | 'NO';
  SYSTEM_LAYER_FILTERING_ACTIVE: 'YES' | 'NO';
  PROJECT_DIGITAL_COMPLETION_PCT: number;
  HOUSE_1_READY_FOR_OWNER_AUTHORIZATION: 'YES' | 'NO';
  HOUSE_1_CANONICAL_BUILD_STARTED: 'NO';
  evidenceOfEmptyStart: string;
}










