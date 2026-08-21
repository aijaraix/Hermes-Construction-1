import { ProvenanceType, ValidationTruthStatus } from './realitySwarmEngine';

export interface CanonicalDataOwnerDefinition {
  canonicalDataKey: string;
  ownerName: string;
  description: string;
  retrievalMethod: string;
}

export interface UIFieldDefinition {
  uiFieldId: string;
  route: string;
  component: string;
  fieldName: string;
  label: string;
  domain: string;
  canonicalDataKey: string;
  allowedProvenance: ProvenanceType[];
  repairPolicy: 'AUTO_FIX_BINDING' | 'DOWNGRADE_STATUS' | 'ESCALATE_DOMAIN_CONFLICT' | 'LOG_ONLY';
  criticality: 'CRITICAL' | 'MAJOR' | 'MINOR';
  projectScoped: boolean;
  auditFrequency: 'REALTIME' | 'PERIODIC';
}

export class UIFieldRegistry {
  public static readonly CANONICAL_OWNERS: Record<string, CanonicalDataOwnerDefinition> = {
    AGENT_ROLE_COUNT: {
      canonicalDataKey: 'AGENT_ROLE_COUNT',
      ownerName: 'AgentRegistry',
      description: 'Canonical registry of all defined agent contracts and roles',
      retrievalMethod: 'AgentRegistry.getAllContracts().length',
    },
    CERTIFIED_AGENT_COUNT: {
      canonicalDataKey: 'CERTIFIED_AGENT_COUNT',
      ownerName: 'Certification Repository / Knowledge Engine',
      description: 'Count of agents with competency score >= 85%',
      retrievalMethod: 'KnowledgeIngestionEngine.getCertifiedAgentCount()',
    },
    ACTIVE_EXECUTING_AGENT_COUNT: {
      canonicalDataKey: 'ACTIVE_EXECUTING_AGENT_COUNT',
      ownerName: 'Swarm Orchestrator Engine',
      description: 'Count of agents currently executing active tasks',
      retrievalMethod: 'SwarmOrchestrator.getActiveExecutingCount()',
    },
    PROJECT_COUNT: {
      canonicalDataKey: 'PROJECT_COUNT',
      ownerName: 'ProjectRepository',
      description: 'Total active projects in Hermes repository',
      retrievalMethod: 'ProjectRepository.getAllProjects().length',
    },
    BOM_TOTAL: {
      canonicalDataKey: 'BOM_TOTAL',
      ownerName: 'BOM Engine / BOM Persistence',
      description: 'Sum of estimated total costs for project BOM items',
      retrievalMethod: 'BOMStore.calculateTotalCost(projectId)',
    },
    ROOM_COUNT: {
      canonicalDataKey: 'ROOM_COUNT',
      ownerName: 'Spatial BIM Model',
      description: 'Count of unique rooms modeled in the active project',
      retrievalMethod: 'Project.components.reduce(rooms)',
    },
    INSPECTION_COUNT: {
      canonicalDataKey: 'INSPECTION_COUNT',
      ownerName: 'Inspection Repository',
      description: 'Count of active and resolved inspection tickets',
      retrievalMethod: 'InspectionStore.getTickets(projectId)',
    },
    PRICE: {
      canonicalDataKey: 'PRICE',
      ownerName: 'Procurement Evidence Store',
      description: 'Verified pricing quotes with supplier evidence',
      retrievalMethod: 'ProcurementStore.getVerifiedPrice(priceId)',
    },
    MODEL_REVISION: {
      canonicalDataKey: 'MODEL_REVISION',
      ownerName: 'Digital Twin Repository',
      description: 'Current 3D BIM model revision string',
      retrievalMethod: 'DigitalTwin.getRevision(projectId)',
    },
    BUILD_METADATA: {
      canonicalDataKey: 'BUILD_METADATA',
      ownerName: 'BuildMetadata',
      description: 'System phase, commit SHA, and build timestamp',
      retrievalMethod: 'BuildMetadata.get()',
    },
  };

  private static fields: UIFieldDefinition[] = [
    {
      uiFieldId: 'UI-ORG-AGENT-COUNT',
      route: '/agent-org',
      component: 'AgentCountBadge',
      fieldName: 'totalAgentRoles',
      label: 'Total Canonical Agent Roles',
      domain: 'Agent Structure',
      canonicalDataKey: 'AGENT_ROLE_COUNT',
      allowedProvenance: ['RUNTIME_CALCULATED', 'DATABASE_RECORD'],
      repairPolicy: 'AUTO_FIX_BINDING',
      criticality: 'CRITICAL',
      projectScoped: false,
      auditFrequency: 'REALTIME',
    },
    {
      uiFieldId: 'UI-ORG-CERTIFIED-COUNT',
      route: '/agent-org',
      component: 'AgentCertificationCard',
      fieldName: 'certifiedAgents',
      label: 'Certified Agent Count',
      domain: 'Agent Structure',
      canonicalDataKey: 'CERTIFIED_AGENT_COUNT',
      allowedProvenance: ['RUNTIME_CALCULATED', 'DATABASE_RECORD'],
      repairPolicy: 'AUTO_FIX_BINDING',
      criticality: 'MAJOR',
      projectScoped: false,
      auditFrequency: 'PERIODIC',
    },
    {
      uiFieldId: 'UI-CMD-PROJECT-COUNT',
      route: '/',
      component: 'CommandCenterHUD',
      fieldName: 'activeProjects',
      label: 'Active Projects Count',
      domain: 'Project Management',
      canonicalDataKey: 'PROJECT_COUNT',
      allowedProvenance: ['RUNTIME_CALCULATED', 'DATABASE_RECORD'],
      repairPolicy: 'AUTO_FIX_BINDING',
      criticality: 'MAJOR',
      projectScoped: false,
      auditFrequency: 'REALTIME',
    },
    {
      uiFieldId: 'UI-OVERVIEW-BOM-TOTAL',
      route: '/overview',
      component: 'ProjectOverviewView',
      fieldName: 'totalCost',
      label: 'Total Modeled Material Cost',
      domain: 'Procurement / Cost',
      canonicalDataKey: 'BOM_TOTAL',
      allowedProvenance: ['RUNTIME_CALCULATED', 'AGENT_GENERATED_VALIDATED'],
      repairPolicy: 'AUTO_FIX_BINDING',
      criticality: 'CRITICAL',
      projectScoped: true,
      auditFrequency: 'REALTIME',
    },
    {
      uiFieldId: 'UI-BOM-SUM-TOTAL',
      route: '/bom',
      component: 'BOMView',
      fieldName: 'totalEstimatedMaterialCost',
      label: 'BOM Summary Total Cost',
      domain: 'Procurement / Cost',
      canonicalDataKey: 'BOM_TOTAL',
      allowedProvenance: ['RUNTIME_CALCULATED'],
      repairPolicy: 'AUTO_FIX_BINDING',
      criticality: 'CRITICAL',
      projectScoped: true,
      auditFrequency: 'REALTIME',
    },
    {
      uiFieldId: 'UI-PROC-CONCRETE-PRICE',
      route: '/procurement',
      component: 'SupplierPriceCard',
      fieldName: 'concretePricePerYd',
      label: 'Tampa Concrete Ready-Mix Unit Price',
      domain: 'Procurement Evidence',
      canonicalDataKey: 'PRICE',
      allowedProvenance: ['EXTERNAL_VERIFIED'],
      repairPolicy: 'DOWNGRADE_STATUS',
      criticality: 'MAJOR',
      projectScoped: true,
      auditFrequency: 'PERIODIC',
    },
    {
      uiFieldId: 'UI-APP-BUILD-VERSION',
      route: '*',
      component: 'AppShellHeader',
      fieldName: 'headerBuildVersion',
      label: 'App Shell Version & Commit Badge',
      domain: 'System Governance',
      canonicalDataKey: 'BUILD_METADATA',
      allowedProvenance: ['CONFIGURATION', 'RUNTIME_CALCULATED'],
      repairPolicy: 'AUTO_FIX_BINDING',
      criticality: 'MAJOR',
      projectScoped: false,
      auditFrequency: 'PERIODIC',
    },
    {
      uiFieldId: 'UI-ROOMS-COUNT',
      route: '/rooms',
      component: 'RoomsSpacesView',
      fieldName: 'totalRoomCount',
      label: 'Total Modeled Rooms',
      domain: 'Spatial Coordination',
      canonicalDataKey: 'ROOM_COUNT',
      allowedProvenance: ['RUNTIME_CALCULATED'],
      repairPolicy: 'AUTO_FIX_BINDING',
      criticality: 'MINOR',
      projectScoped: true,
      auditFrequency: 'PERIODIC',
    },
    {
      uiFieldId: 'UI-INSPECTION-OPEN-COUNT',
      route: '/inspections',
      component: 'InspectionsView',
      fieldName: 'openTickets',
      label: 'Open Inspection Tickets',
      domain: 'Quality Inspection',
      canonicalDataKey: 'INSPECTION_COUNT',
      allowedProvenance: ['RUNTIME_CALCULATED', 'DATABASE_RECORD'],
      repairPolicy: 'AUTO_FIX_BINDING',
      criticality: 'MAJOR',
      projectScoped: true,
      auditFrequency: 'REALTIME',
    },
  ];

  public static getAllFields(): UIFieldDefinition[] {
    return this.fields;
  }

  public static getFieldById(id: string): UIFieldDefinition | undefined {
    return this.fields.find((f) => f.uiFieldId === id);
  }

  public static getFieldsByRoute(route: string): UIFieldDefinition[] {
    return this.fields.filter((f) => f.route === route || f.route === '*');
  }
}
