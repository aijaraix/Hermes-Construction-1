import { AgentContract, AgentOnboardingState, SwarmAgentEntity, SystemCategory } from '../src/types/hermes';

export const FULL_SWARM_AGENTS: SwarmAgentEntity[] = [
  {
    id: 'AGENT-SWARM-01',
    name: 'HERMES Prime Orchestrator Swarm',
    type: 'ORCHESTRATOR',
    specialty: 'Master Construction Governance & Gym Control',
    status: 'ACTIVE',
    activeTaskId: 'TASK-SYS-01',
    decisionsCount: 142,
    revisionsCount: 12,
    accuracy: 99.2
  },
  {
    id: 'AGENT-SWARM-02',
    name: 'Structural Engineering Swarm',
    type: 'SPECIALIST',
    specialty: 'ACI 318 Concrete & ASCE 7 Wind Uplift Analysis',
    status: 'ACTIVE',
    activeTaskId: 'TASK-STRUCT-01',
    decisionsCount: 98,
    revisionsCount: 4,
    accuracy: 97.5
  }
];

export class AgentRegistry {
  private static contracts: Map<string, AgentContract> = new Map();
  private static initialized = false;

  public static initialize(): void {
    if (this.initialized) return;

    // 1. Leadership & Governance Roles
    this.registerContract({
      roleId: 'HERMES-PRIME-ORCHESTRATOR',
      roleName: 'HERMES Construction Prime Leader',
      managerRoleId: 'NONE',
      discipline: 'Management',
      responsibilities: [
        'Govern global autonomous construction mission & Gym readiness',
        'Monitor core readiness gate percentage and control Gym curriculum advancement',
        'Resolve major cross-discipline executive conflicts',
        'Enforce quality, risk, and professional engineering boundaries'
      ],
      inputs: ['Project executive reports', 'Core readiness gate metrics', 'Inspection sweep summaries'],
      outputs: ['Curriculum block directives', 'System pause/resume commands', 'Executive conflict resolutions'],
      tools: ['calculateReadinessGate()', 'updateGymBlockState()', 'escalateToProfessionalReview()'],
      knowledgeDomains: ['Autonomous Construction Governance', 'FBC 2023 Master Code', 'ACI 318-19', 'ASCE 7-22'],
      canConsult: ['PROJECT-EXECUTIVE-01', 'CONSTRUCTION-KNOWLEDGE-DIRECTOR', 'QUALITY-INSPECTION-DIRECTOR'],
      cannotDo: ['Cannot bypass inspection sweep failures', 'Cannot unblock Gym if readiness < 85%'],
      validationRequirements: ['100% agreement on safety critical overrides'],
      escalationRules: ['Escalate to human owner if unresolvable legal/professional ambiguity arises'],
      knowledgeCurriculum: ['Autonomous Construction Management', 'Risk Frameworks'],
      readinessStatus: 'READY_FOR_CONSTRUCTION_WORK',
      competencyScore: 100.0,
      knowledgeCoveragePct: 100.0,
      isCoreHouse1Role: true
    });

    this.registerContract({
      roleId: 'PROJECT-EXECUTIVE-01',
      roleName: 'Project Executive',
      managerRoleId: 'HERMES-PRIME-ORCHESTRATOR',
      discipline: 'Management',
      responsibilities: [
        'Translate Prime objectives into project scope & strategy',
        'Track milestones, budget targets, and location compliance'
      ],
      inputs: ['Prime directives', 'Site location profile'],
      outputs: ['Project delivery strategy', 'Scope boundary definitions'],
      tools: ['evaluateBudgetVariance()', 'checkSchedulePath()'],
      knowledgeDomains: ['Project Delivery Methods', 'Contract Risk', 'Florida Construction Law'],
      canConsult: ['PROJECT-SUPERINTENDENT-01', 'PROJECT-CONTROLS-MANAGER'],
      cannotDo: ['Cannot alter structural load formulas'],
      validationRequirements: ['Scope approval by Prime'],
      escalationRules: ['Escalate cost overruns > 5% to Prime'],
      knowledgeCurriculum: ['Construction Project Management'],
      readinessStatus: 'READY_FOR_CONSTRUCTION_WORK',
      competencyScore: 98.0,
      knowledgeCoveragePct: 96.0,
      isCoreHouse1Role: true
    });

    this.registerContract({
      roleId: 'PROJECT-SUPERINTENDENT-01',
      roleName: 'Project Superintendent',
      managerRoleId: 'PROJECT-EXECUTIVE-01',
      discipline: 'Management',
      responsibilities: [
        'Govern master trade sequencing and field constructability',
        'Verify crane, staging, access, and temporary works logistics',
        'Conduct final building walkthrough before closeout'
      ],
      inputs: ['Discipline manager proposals', 'BIM model state'],
      outputs: ['Master Trade Sequence', 'Constructability Signoff'],
      tools: ['evaluateTradeSequence()', 'checkSiteStaging()'],
      knowledgeDomains: ['Construction Means & Methods', 'Trade Sequencing', 'OSHA Safety'],
      canConsult: ['SPATIAL-COORDINATION-SUPERINTENDENT', 'QUALITY-INSPECTION-DIRECTOR'],
      cannotDo: ['Cannot override failing structural inspections'],
      validationRequirements: ['Constructability score >= 90%'],
      escalationRules: ['Escalate trade sequence deadlock to Executive'],
      knowledgeCurriculum: ['Field Superintendent Practices', 'OSHA 1926'],
      readinessStatus: 'READY_FOR_CONSTRUCTION_WORK',
      competencyScore: 96.0,
      knowledgeCoveragePct: 94.0,
      isCoreHouse1Role: true
    });

    this.registerContract({
      roleId: 'CONSTRUCTION-KNOWLEDGE-DIRECTOR',
      roleName: 'Construction Knowledge Director',
      managerRoleId: 'HERMES-PRIME-ORCHESTRATOR',
      discipline: 'Management',
      responsibilities: [
        'Govern Knowledge Swarm, source discovery, and ingestion pipeline',
        'Operate Knowledge Gym and calculate agent competency & coverage',
        'Assign agent knowledge curricula and generate Agent Knowledge Packs'
      ],
      inputs: ['Authoritative Source Registry', 'Agent knowledge gaps'],
      outputs: ['Agent Knowledge Packs', 'Agent Learning Reports', 'Competency Scores'],
      tools: ['runIngestionWorker()', 'extractStructuredKnowledge()', 'calculateCompetency()'],
      knowledgeDomains: ['Construction Ontology', 'Building Science', 'Code Ingestion'],
      canConsult: ['KNOWLEDGE-RIGHTS-GOVERNANCE-AGENT', 'LEARNING-COMPETENCY-MANAGER'],
      cannotDo: ['Cannot ingest copyrighted text without rights clearance'],
      validationRequirements: ['Source citation provenance required for all facts'],
      escalationRules: ['Escalate source rights ambiguity to Prime'],
      knowledgeCurriculum: ['Building Science Corpus', 'Knowledge Engineering'],
      readinessStatus: 'READY_FOR_CONSTRUCTION_WORK',
      competencyScore: 99.0,
      knowledgeCoveragePct: 98.0,
      isCoreHouse1Role: true
    });

    // 2. Discipline Managers (16 Roles)
    const disciplineManagers: Array<{ id: string; name: string; disc: any }> = [
      { id: 'SITE-CIVIL-MANAGER', name: 'Site & Civil Manager', disc: 'Site' },
      { id: 'STRUCTURAL-ENGINEERING-MANAGER', name: 'Structural Engineering Manager', disc: 'Structure' },
      { id: 'BUILDING-ENVELOPE-MANAGER', name: 'Building Envelope Manager', disc: 'Envelope' },
      { id: 'PLUMBING-SYSTEMS-MANAGER', name: 'Plumbing Systems Manager', disc: 'Plumbing' },
      { id: 'ELECTRICAL-SYSTEMS-MANAGER', name: 'Electrical Systems Manager', disc: 'Electrical' },
      { id: 'MECHANICAL-HVAC-MANAGER', name: 'Mechanical HVAC Manager', disc: 'HVAC' },
      { id: 'FIRE-LIFE-SAFETY-MANAGER', name: 'Fire & Life Safety Manager', disc: 'Fire Protection' },
      { id: 'SPATIAL-COORDINATION-SUPERINTENDENT', name: 'Spatial Coordination Superintendent', disc: 'Management' },
      { id: 'QUALITY-INSPECTION-DIRECTOR', name: 'Quality & Inspection Director', disc: 'Quality' },
      { id: 'COMMISSIONING-CLOSEOUT-DIRECTOR', name: 'Commissioning & Closeout Director', disc: 'Closeout' },
      { id: 'PROJECT-CONTROLS-MANAGER', name: 'Project Controls Manager', disc: 'Procurement' },
      { id: 'ENVIRONMENTAL-CLIMATE-MANAGER', name: 'Environmental & Climate Manager', disc: 'Site' },
      { id: 'MATERIALS-INTELLIGENCE-MANAGER', name: 'Materials Intelligence Manager', disc: 'Management' },
      { id: 'MEANS-METHODS-MANAGER', name: 'Means & Methods Manager', disc: 'Management' },
      { id: 'QUANTITY-ESTIMATING-MANAGER', name: 'Quantity & Estimating Manager', disc: 'Procurement' },
      { id: 'PROCUREMENT-LOGISTICS-MANAGER', name: 'Procurement & Logistics Manager', disc: 'Procurement' }
    ];

    disciplineManagers.forEach(dm => {
      this.registerContract({
        roleId: dm.id,
        roleName: dm.name,
        managerRoleId: 'PROJECT-SUPERINTENDENT-01',
        discipline: dm.disc,
        responsibilities: [`Govern all specialist trade agents in ${dm.name} discipline`, 'Review trade proposals and resolve trade clashes'],
        inputs: ['Specialist proposals', 'Code standards'],
        outputs: ['Approved trade submittals', 'Escalation notices'],
        tools: ['reviewProposal()', 'checkCodeRules()'],
        knowledgeDomains: [dm.name, 'FBC 2023'],
        canConsult: ['PROJECT-SUPERINTENDENT-01'],
        cannotDo: ['Cannot approve unvalidated calculations'],
        validationRequirements: ['100% code rule compliance'],
        escalationRules: ['Escalate unresolvable clashes to Superintendent'],
        knowledgeCurriculum: [`${dm.name} Master Curriculum`],
        readinessStatus: 'READY_FOR_CONSTRUCTION_WORK',
        competencyScore: 95.0,
        knowledgeCoveragePct: 92.0,
        isCoreHouse1Role: true
      });
    });

    // 3. Spatial Managers
    this.registerContract({
      roleId: 'FLOOR-MANAGER-L01',
      roleName: 'Floor Construction Manager Level 1',
      managerRoleId: 'SPATIAL-COORDINATION-SUPERINTENDENT',
      discipline: 'Architecture',
      responsibilities: ['Coordinate Level 1 room layouts, corridors, shafts, and floor penetrations'],
      inputs: ['Room proposals for L01'],
      outputs: ['Level 1 Integrated Spatial Layout'],
      tools: ['checkFloorClashes()', 'coordinateRisers()'],
      knowledgeDomains: ['Floor Spatial Coordination', 'FBC Chapter 10 Egress'],
      canConsult: ['ROOM-MANAGER-204'],
      cannotDo: ['Cannot alter structural columns'],
      validationRequirements: ['Zero corridor/shaft spatial collisions'],
      escalationRules: ['Escalate riser conflict to Spatial Superintendent'],
      knowledgeCurriculum: ['Floor Coordination Practices'],
      readinessStatus: 'READY_FOR_CONSTRUCTION_WORK',
      competencyScore: 94.0,
      knowledgeCoveragePct: 90.0,
      isCoreHouse1Role: true
    });

    this.registerContract({
      roleId: 'FLOOR-MANAGER-L02',
      roleName: 'Floor Construction Manager Level 2',
      managerRoleId: 'SPATIAL-COORDINATION-SUPERINTENDENT',
      discipline: 'Architecture',
      responsibilities: ['Coordinate Level 2 room layouts, corridors, shafts, and floor penetrations'],
      inputs: ['Room proposals for L02'],
      outputs: ['Level 2 Integrated Spatial Layout'],
      tools: ['checkFloorClashes()', 'coordinateRisers()'],
      knowledgeDomains: ['Floor Spatial Coordination', 'FBC Chapter 10 Egress'],
      canConsult: ['ROOM-MANAGER-204'],
      cannotDo: ['Cannot alter structural columns'],
      validationRequirements: ['Zero corridor/shaft spatial collisions'],
      escalationRules: ['Escalate riser conflict to Spatial Superintendent'],
      knowledgeCurriculum: ['Floor Coordination Practices'],
      readinessStatus: 'READY_FOR_CONSTRUCTION_WORK',
      competencyScore: 94.0,
      knowledgeCoveragePct: 90.0,
      isCoreHouse1Role: true
    });

    this.registerContract({
      roleId: 'ROOM-MANAGER-204',
      roleName: 'Room Construction Manager Room 204',
      managerRoleId: 'FLOOR-MANAGER-L02',
      discipline: 'Architecture',
      responsibilities: [
        'Coordinate room-level trade placements (Electrical, HVAC, Plumbing, Fixtures)',
        'Evaluate component placement for usability, ergonomics, accessibility, and serviceability',
        'Issue consultation requests to resolve spatial clashes inside Room 204'
      ],
      inputs: ['Trade proposals for Room 204'],
      outputs: ['Room 204 Coordinated Layout', 'Trade Consultation Records'],
      tools: ['evaluateDeviceErgonomics()', 'issueConsultation()', 'checkRoomClash()'],
      knowledgeDomains: ['Room Ergonomics', 'ADA Accessibility', 'NEC Device Placement'],
      canConsult: ['ELECTRICAL-BRANCH-CIRCUIT-AGENT', 'HVAC-SUPPLY-RETURN-DIFFUSER-AGENT'],
      cannotDo: ['Cannot move structural load bearing walls without Structural Manager approval'],
      validationRequirements: ['100% device usability and clash prevention'],
      escalationRules: ['Escalate multi-trade grid deadlock to Floor Manager L02'],
      knowledgeCurriculum: ['Room Spatial Management'],
      readinessStatus: 'READY_FOR_CONSTRUCTION_WORK',
      competencyScore: 95.0,
      knowledgeCoveragePct: 91.0,
      isCoreHouse1Role: true
    });

    // 4. Register Representative Trade Specialist Agents (Populating up to 125+ Roles)
    const tradeSpecialistTemplates: Array<{
      id: string;
      name: string;
      manager: string;
      disc: SystemCategory | 'Civil' | 'Controls' | 'Quality' | 'Procurement';
      isCore: boolean;
      status: AgentOnboardingState;
      comp: number;
      cov: number;
    }> = [
      // Site & Civil
      { id: 'PARCEL-SURVEY-ANALYSIS-AGENT', name: 'Parcel & Survey Analysis Specialist', manager: 'SITE-CIVIL-MANAGER', disc: 'Site', isCore: true, status: 'READY_FOR_CONSTRUCTION_WORK', comp: 94, cov: 92 },
      { id: 'TOPOGRAPHY-GRADING-AGENT', name: 'Topography & Grading Specialist', manager: 'SITE-CIVIL-MANAGER', disc: 'Site', isCore: true, status: 'READY_FOR_CONSTRUCTION_WORK', comp: 92, cov: 90 },
      { id: 'SOILS-GEOTECHNICAL-AGENT', name: 'Soils & Geotechnical Specialist', manager: 'SITE-CIVIL-MANAGER', disc: 'Site', isCore: true, status: 'READY_FOR_CONSTRUCTION_WORK', comp: 95, cov: 93 },
      { id: 'STORMWATER-DRAINAGE-AGENT', name: 'Stormwater & Drainage Specialist', manager: 'SITE-CIVIL-MANAGER', disc: 'Site', isCore: true, status: 'READY_FOR_CONSTRUCTION_WORK', comp: 91, cov: 89 },
      { id: 'UTILITY-CONNECTION-AGENT', name: 'Utility Connection Specialist', manager: 'SITE-CIVIL-MANAGER', disc: 'Site', isCore: true, status: 'READY_FOR_CONSTRUCTION_WORK', comp: 93, cov: 91 },

      // Structural
      { id: 'SHALLOW-FOOTING-DESIGN-AGENT', name: 'Shallow Footing Design Specialist', manager: 'STRUCTURAL-ENGINEERING-MANAGER', disc: 'Structure', isCore: true, status: 'READY_FOR_CONSTRUCTION_WORK', comp: 96, cov: 94 },
      { id: 'CONCRETE-SLAB-STRUCTURAL-AGENT', name: 'Concrete Slab Structural Specialist', manager: 'STRUCTURAL-ENGINEERING-MANAGER', disc: 'Structure', isCore: true, status: 'READY_FOR_CONSTRUCTION_WORK', comp: 95, cov: 92 },
      { id: 'WOOD-FRAMING-TRUSS-AGENT', name: 'Wood Framing & Truss Specialist', manager: 'STRUCTURAL-ENGINEERING-MANAGER', disc: 'Structure', isCore: true, status: 'READY_FOR_CONSTRUCTION_WORK', comp: 94, cov: 91 },
      { id: 'MASONRY-CMU-STRUCTURAL-AGENT', name: 'Masonry CMU Structural Specialist', manager: 'STRUCTURAL-ENGINEERING-MANAGER', disc: 'Structure', isCore: true, status: 'READY_FOR_CONSTRUCTION_WORK', comp: 93, cov: 90 },
      { id: 'FASTENER-UPLIFT-AGENT', name: 'Fastener & Uplift Anchor Specialist', manager: 'STRUCTURAL-ENGINEERING-MANAGER', disc: 'Structure', isCore: true, status: 'READY_FOR_CONSTRUCTION_WORK', comp: 97, cov: 95 },

      // Envelope
      { id: 'WATERPROOFING-FLASHING-AGENT', name: 'Waterproofing & Flashing Specialist', manager: 'BUILDING-ENVELOPE-MANAGER', disc: 'Envelope', isCore: true, status: 'READY_FOR_CONSTRUCTION_WORK', comp: 93, cov: 91 },
      { id: 'THERMAL-INSULATION-AGENT', name: 'Thermal Insulation Specialist', manager: 'BUILDING-ENVELOPE-MANAGER', disc: 'Envelope', isCore: true, status: 'READY_FOR_CONSTRUCTION_WORK', comp: 92, cov: 89 },
      { id: 'STANDING-SEAM-ROOFING-AGENT', name: 'Standing Seam Roofing Specialist', manager: 'BUILDING-ENVELOPE-MANAGER', disc: 'Envelope', isCore: true, status: 'READY_FOR_CONSTRUCTION_WORK', comp: 95, cov: 93 },

      // Plumbing
      { id: 'DOMESTIC-WATER-PIPING-AGENT', name: 'Domestic Water Piping Specialist', manager: 'PLUMBING-SYSTEMS-MANAGER', disc: 'Plumbing', isCore: true, status: 'READY_FOR_CONSTRUCTION_WORK', comp: 92, cov: 90 },
      { id: 'SANITARY-DRAIN-VENT-AGENT', name: 'Sanitary Drain & Vent Specialist', manager: 'PLUMBING-SYSTEMS-MANAGER', disc: 'Plumbing', isCore: true, status: 'READY_FOR_CONSTRUCTION_WORK', comp: 94, cov: 92 },

      // Electrical
      { id: 'MAIN-SERVICE-PANEL-AGENT', name: 'Main Service & Panel Specialist', manager: 'ELECTRICAL-SYSTEMS-MANAGER', disc: 'Electrical', isCore: true, status: 'READY_FOR_CONSTRUCTION_WORK', comp: 96, cov: 93 },
      { id: 'BRANCH-CIRCUIT-RECEPTACLE-AGENT', name: 'Branch Circuit & Receptacle Specialist', manager: 'ELECTRICAL-SYSTEMS-MANAGER', disc: 'Electrical', isCore: true, status: 'READY_FOR_CONSTRUCTION_WORK', comp: 95, cov: 92 },
      { id: 'LIGHTING-SWITCHING-AGENT', name: 'Lighting & Switching Specialist', manager: 'ELECTRICAL-SYSTEMS-MANAGER', disc: 'Electrical', isCore: true, status: 'READY_FOR_CONSTRUCTION_WORK', comp: 93, cov: 91 },

      // HVAC
      { id: 'HEATING-COOLING-LOAD-AGENT', name: 'Heating & Cooling Load Specialist', manager: 'MECHANICAL-HVAC-MANAGER', disc: 'HVAC', isCore: true, status: 'READY_FOR_CONSTRUCTION_WORK', comp: 95, cov: 93 },
      { id: 'HVAC-DUCT-ROUTING-AGENT', name: 'Duct Routing & Friction Loss Specialist', manager: 'MECHANICAL-HVAC-MANAGER', disc: 'HVAC', isCore: true, status: 'READY_FOR_CONSTRUCTION_WORK', comp: 94, cov: 91 },
      { id: 'HVAC-SUPPLY-RETURN-DIFFUSER-AGENT', name: 'Supply & Return Diffuser Specialist', manager: 'MECHANICAL-HVAC-MANAGER', disc: 'HVAC', isCore: true, status: 'READY_FOR_CONSTRUCTION_WORK', comp: 92, cov: 90 },

      // Fire
      { id: 'FIRE-SPRINKLER-EGRESS-AGENT', name: 'Fire Sprinkler & Egress Specialist', manager: 'FIRE-LIFE-SAFETY-MANAGER', disc: 'Fire Protection', isCore: true, status: 'READY_FOR_CONSTRUCTION_WORK', comp: 96, cov: 94 },

      // Inspection
      { id: 'INDEPENDENT-STRUCTURAL-INSPECTOR', name: 'Independent Structural Inspector', manager: 'QUALITY-INSPECTION-DIRECTOR', disc: 'Quality', isCore: true, status: 'READY_FOR_CONSTRUCTION_WORK', comp: 98, cov: 96 },
      { id: 'INDEPENDENT-MEP-INSPECTOR', name: 'Independent MEP Inspector', manager: 'QUALITY-INSPECTION-DIRECTOR', disc: 'Quality', isCore: true, status: 'READY_FOR_CONSTRUCTION_WORK', comp: 97, cov: 95 },
      { id: 'INDEPENDENT-ENVELOPE-INSPECTOR', name: 'Independent Envelope Inspector', manager: 'QUALITY-INSPECTION-DIRECTOR', disc: 'Quality', isCore: true, status: 'READY_FOR_CONSTRUCTION_WORK', comp: 96, cov: 94 },

      // Sourcing & Quantities
      { id: 'QUANTITY-TAKEOFF-AGENT', name: 'Quantity Takeoff Estimator', manager: 'QUANTITY-ESTIMATING-MANAGER', disc: 'Procurement', isCore: true, status: 'READY_FOR_CONSTRUCTION_WORK', comp: 95, cov: 93 },
      { id: 'SUPPLIER-PRICING-AGENT', name: 'Supplier Pricing Specialist', manager: 'PROCUREMENT-LOGISTICS-MANAGER', disc: 'Procurement', isCore: true, status: 'READY_FOR_CONSTRUCTION_WORK', comp: 94, cov: 91 }
    ];

    tradeSpecialistTemplates.forEach(t => {
      this.registerContract({
        roleId: t.id,
        roleName: t.name,
        managerRoleId: t.manager,
        discipline: t.disc,
        responsibilities: [`Execute domain analysis and 3D placement for ${t.name}`],
        inputs: ['Project specification', 'BIM model'],
        outputs: ['Trade components', 'Calculation proof'],
        tools: ['calculateDomainMath()', 'queryKnowledgePack()'],
        knowledgeDomains: [t.name, 'FBC 2023'],
        canConsult: [t.manager],
        cannotDo: ['Cannot violate building code minimums'],
        validationRequirements: ['100% calculation compliance'],
        escalationRules: ['Escalate code failure to Discipline Manager'],
        knowledgeCurriculum: [`${t.name} Curriculum`],
        readinessStatus: t.status,
        competencyScore: t.comp,
        knowledgeCoveragePct: t.cov,
        isCoreHouse1Role: t.isCore
      });
    });

    // Dynamically expand to 132 total defined roles
    for (let i = 1; i <= 84; i++) {
      const id = `SPECIALIST-TRADE-ROLE-${String(i).padStart(3, '0')}`;
      this.registerContract({
        roleId: id,
        roleName: `Specialist Trade Role #${i}`,
        managerRoleId: 'MEANS-METHODS-MANAGER',
        discipline: 'Architecture',
        responsibilities: [`Perform specialized construction calculations for trade domain #${i}`],
        inputs: ['Subsystem requirements'],
        outputs: ['Trade submittal'],
        tools: ['runTradeAnalysis()'],
        knowledgeDomains: [`Trade Domain #${i}`],
        canConsult: ['MEANS-METHODS-MANAGER'],
        cannotDo: ['Cannot execute without manager signoff'],
        validationRequirements: ['Competency score >= 85%'],
        escalationRules: ['Escalate knowledge gaps to Knowledge Director'],
        knowledgeCurriculum: [`Specialist Curriculum #${i}`],
        readinessStatus: i <= 20 ? 'READY_FOR_CONSTRUCTION_WORK' : 'RESEARCHING',
        competencyScore: i <= 20 ? 90.0 : 65.0,
        knowledgeCoveragePct: i <= 20 ? 88.0 : 55.0,
        isCoreHouse1Role: i <= 10
      });
    }

    this.initialized = true;
  }

  public static registerContract(contract: AgentContract): void {
    this.contracts.set(contract.roleId, contract);
  }

  public static getContract(roleId: string): AgentContract | undefined {
    this.initialize();
    return this.contracts.get(roleId);
  }

  public static getAllContracts(): AgentContract[] {
    this.initialize();
    return Array.from(this.contracts.values());
  }

  public static updateContractState(roleId: string, updates: Partial<AgentContract>): AgentContract | undefined {
    this.initialize();
    const existing = this.contracts.get(roleId);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates };
    this.contracts.set(roleId, updated);
    return updated;
  }
}
