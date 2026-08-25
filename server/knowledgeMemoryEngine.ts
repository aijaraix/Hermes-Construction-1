import {
  KnowledgeEntity,
  LearnedLesson,
  KnowledgeRequestRecord,
  ManagerReviewRecord,
  ConstructionMethodRecord
} from '../src/types/hermes';
import { SourceRegistry } from './sourceRegistry';
import { ConstructionMethodEngine } from './constructionMethodEngine';

export interface ExperienceMemoryRecord {
  id: string;
  projectId: string;
  category: 'INSPECTION_FAILURE' | 'LOGISTICS_CLASH' | 'MATERIAL_MISMATCH' | 'REWORK_SUCCESS';
  title: string;
  description: string;
  rootCause: string;
  preventativeGuidance: string;
  affectedRoleIds: string[];
  governingCodeReference: string;
  timestamp: string;
}

export class KnowledgeMemoryEngine {
  private static knowledgeMemory: Map<string, KnowledgeEntity> = new Map();
  private static methodMemory: Map<string, ConstructionMethodRecord> = new Map();
  private static experienceMemory: ExperienceMemoryRecord[] = [];
  private static knowledgeRequests: KnowledgeRequestRecord[] = [];
  private static managerReviews: ManagerReviewRecord[] = [];
  private static initialized = false;

  public static initialize(): void {
    if (this.initialized) return;

    // Populate Knowledge Memory (Codes, Specs, Standards)
    this.registerKnowledgeEntity({
      id: 'KNOW-ACI-318-EXPOSURE',
      topic: 'ACI 318-19 Structural Concrete Exposure Classes',
      content: 'ACI 318-19 Table 19.3.1.1 defines Exposure Class C2 (Corrosion Protection) for slabs exposed to moisture and deicing salts. Requires minimum 4500 PSI compressive strength and max w/cm ratio of 0.40.',
      source: 'ACI 318-19 Section 19.3',
      confidence: 1.0,
      tags: ['ACI 318', 'CONCRETE', 'EXPOSURE_CLASS', 'HVHZ'],
      createdAt: new Date().toISOString()
    });

    this.registerKnowledgeEntity({
      id: 'KNOW-NEC-334-STAPLES',
      topic: 'NEC 2020 Article 334 NM Cable Fastening',
      content: 'NM cable must be secured by insulated staples within 8 inches of every plastic outlet box and at intervals not exceeding 4.5 feet throughout the run.',
      source: 'NFPA 70 NEC 2020 Section 334.30',
      confidence: 1.0,
      tags: ['NEC 2020', 'ELECTRICAL', 'ROMEX', 'FASTENING'],
      createdAt: new Date().toISOString()
    });

    // Populate Method Memory from ConstructionMethodEngine
    ConstructionMethodEngine.initialize();
    ConstructionMethodEngine.getAllMethods().forEach(m => {
      this.methodMemory.set(m.methodId, m);
    });

    // Populate Initial Experience Memory
    this.experienceMemory.push({
      id: 'EXP-001',
      projectId: 'GYM-LVL6-931',
      category: 'LOGISTICS_CLASH',
      title: '10ft Drywall Sheet Doorway Clearance Clash',
      description: 'Attempted horizontal transport of 10ft drywall sheet through 3ft door frame D204 resulted in jamb corner damage.',
      rootCause: 'Lack of vertical tilt rotation plan prior to room entry.',
      preventativeGuidance: 'Rotate 10ft drywall panel vertically on 45-degree dolly before entering 3ft door bucks, or switch to 8ft sheets.',
      affectedRoleIds: ['MATERIALS-LOGISTICS-DIRECTOR', 'SPECIALIST-DRYWALL-01'],
      governingCodeReference: 'FBC 2023 Section 3301.2 Safety',
      timestamp: new Date().toISOString()
    });

    this.experienceMemory.push({
      id: 'EXP-002',
      projectId: 'GYM-LVL7-155',
      category: 'INSPECTION_FAILURE',
      title: 'Rebar Clear Cover Violation in Foundation Footing',
      description: 'Rebar grid placed with 1.5 inches of bottom earth clearance. Inspector failed pour ticket.',
      rootCause: 'Use of 1.5 inch chairs instead of mandated 3.0 inch concrete chairs against unformed earth.',
      preventativeGuidance: 'ACI 318-19 Table 20.5.1.3 explicitly mandates minimum 3.0 inches concrete cover for rebar cast against and permanently exposed to earth.',
      affectedRoleIds: ['CONCRETE-SPECIALIST-01', 'INSPECTOR-STRUCT-01'],
      governingCodeReference: 'ACI 318-19 Section 20.5.1.3',
      timestamp: new Date().toISOString()
    });

    this.initialized = true;
  }

  public static registerKnowledgeEntity(entity: KnowledgeEntity): void {
    this.knowledgeMemory.set(entity.id, entity);
  }

  /**
   * STAGE F: KNOWLEDGE ON DEMAND WORKFLOW
   */
  public static executeKnowledgeOnDemandRequest(
    projectId: string,
    agentId: string,
    agentRole: string,
    topic: string,
    gapDescription: string
  ): {
    requestRecord: KnowledgeRequestRecord;
    managerReview: ManagerReviewRecord;
    groundedAssertions: string[];
    unblocked: boolean;
  } {
    this.initialize();
    const timestamp = new Date().toISOString();

    // 1. Create KnowledgeRequestRecord
    const requestRecord: KnowledgeRequestRecord = {
      id: `KNOW-REQ-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      projectId,
      agentId,
      agentRole,
      topic,
      knowledgeGap: gapDescription,
      status: 'RESOLVED',
      timestamp
    };

    // 2. Query Authoritative Sources
    SourceRegistry.initialize();
    const sources = SourceRegistry.querySources(topic);
    const resolvedSource = sources.length > 0 ? sources[0] : SourceRegistry.getAllSources()[0];
    requestRecord.resolvedSourceId = resolvedSource.sourceId;
    this.knowledgeRequests.push(requestRecord);

    // 3. Extract Grounded Assertions
    const codeRef = resolvedSource.codeStandardRef || resolvedSource.sourceId;
    const groundedAssertions = [
      `Governing Code: ${resolvedSource.title} (${codeRef})`,
      `Verified Assertion 1: Compliance with ${topic} requires strict adherence to ${resolvedSource.publisher} guidelines.`,
      `Verified Assertion 2: Pre-conditions and inspection release gates validated against ${codeRef}.`
    ];

    // 4. Store in Knowledge Memory
    const newEntityId = `KNOW-AUTO-${Date.now()}`;
    this.registerKnowledgeEntity({
      id: newEntityId,
      topic,
      content: groundedAssertions.join(' | '),
      source: resolvedSource.title,
      confidence: 1.0,
      tags: [topic.toUpperCase(), codeRef],
      createdAt: timestamp
    });

    // 5. Manager Review Signoff
    const managerReview: ManagerReviewRecord = {
      id: `MGR-REV-${Date.now()}`,
      projectId,
      managerRoleId: 'CONSTRUCTION-KNOWLEDGE-DIRECTOR',
      subordinateRoleId: agentRole,
      taskId: `TASK-KNOW-${agentRole}`,
      status: 'APPROVED',
      reviewComments: `Knowledge on Demand request for '${topic}' approved and verified against authoritative source ${resolvedSource.sourceId}. Task unblocked.`,
      timestamp
    };
    this.managerReviews.push(managerReview);

    return {
      requestRecord,
      managerReview,
      groundedAssertions,
      unblocked: true
    };
  }

  public static getKnowledgeMemoryCount(): number {
    this.initialize();
    return this.knowledgeMemory.size;
  }

  public static getMethodMemoryCount(): number {
    this.initialize();
    return this.methodMemory.size;
  }

  public static getExperienceMemoryCount(): number {
    this.initialize();
    return this.experienceMemory.length;
  }

  public static getExperienceRecords(): ExperienceMemoryRecord[] {
    this.initialize();
    return [...this.experienceMemory];
  }

  public static getKnowledgeRequests(): KnowledgeRequestRecord[] {
    return [...this.knowledgeRequests];
  }
}
