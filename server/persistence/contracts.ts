import type { Claim, ConstructionEntity, EntityRevision, Evidence, ProjectRevision, RightsClassification, Source, SpatialFrame, SpatialTransform } from '../../src/types/hermes';
import type { PromotionContext } from '../../src/lib/projectEvidence';

export type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };
/** Scope must be supplied by a trusted server caller, never accepted as authorization from the UI. */
export interface RepositoryScope { organizationId: string; projectId: string; }
export interface FoundationProject { projectId: string; organizationId: string; name: string; status: string; currentRevisionId: string; createdAt: string; updatedAt: string; }
export interface FrameRecord { frame: SpatialFrame; revisionId: string; unit: 'METER'; crs?: string; geodeticOrigin?: { longitudeDeg: number; latitudeDeg: number; elevationMeters: number }; }
export interface CanonicalEvent { eventId: string; projectId: string; timestamp: string; eventType: string; attemptId?: string; revisionId?: string; projectRevisionId?: string; [key: string]: unknown; }
export interface EventAppend { record: CanonicalEvent; sequence: number; traceId?: string; }
export interface StoredEvent extends EventAppend { contentHash: string; }
export interface ArtifactMetadata {
  artifactId: string; projectId: string; objectKey: string; uri: string; sha256: string; sizeBytes: number; mimeType: string;
  artifactClass: 'SOURCE_DOCUMENT' | 'IFC_ORIGINAL' | 'NORMALIZED_SEMANTICS' | 'RENDER_MESH' | 'COLLISION_PROXY' | 'EVIDENCE' | 'OTHER';
  projectRevisionId?: string; sourceId?: string; evidenceId?: string; rightsClassification: RightsClassification;
  confidentiality?: string; immutable: true; createdAt: string;
}
export interface ArtifactPut extends Omit<ArtifactMetadata, 'objectKey' | 'uri' | 'sha256' | 'sizeBytes' | 'immutable'> { bytes: Uint8Array; }
export interface ArtifactStore {
  put(input: ArtifactPut): Promise<ArtifactMetadata>;
  stat(projectId: string, objectKey: string): Promise<ArtifactMetadata | null>;
  exists(projectId: string, objectKey: string): Promise<boolean>;
  getReadReference(projectId: string, objectKey: string): Promise<string>;
  // No deletion API: committed immutable evidence cannot be removed by ordinary domain callers.
}
export interface ProjectRepository {
  getProject(): Promise<FoundationProject | null>;
  createGenesis(project: FoundationProject, revision: ProjectRevision, rootFrame: FrameRecord, event: EventAppend): Promise<void>;
  appendProjectRevision(revision: ProjectRevision): Promise<void>;
  getProjectRevision(id: string): Promise<ProjectRevision | null>;
}
export interface EntityRepository {
  appendEntityRevision(entity: ConstructionEntity, revision: EntityRevision, payload?: JsonValue, event?: EventAppend): Promise<void>;
  getEntity(id: string): Promise<ConstructionEntity | null>;
  getEntityRevisions(id: string): Promise<Array<{ revision: EntityRevision; payload: JsonValue }>>;
}
export interface EventRepository { appendEvent(event: EventAppend): Promise<'APPENDED' | 'IDEMPOTENT'>; getEvent(id: string): Promise<StoredEvent | null>; listEvents(): Promise<StoredEvent[]>; }
export interface EvidenceRepository {
  createSource(source: Source): Promise<void>;
  getSource(id: string): Promise<Source | null>;
  createEvidence(evidence: Evidence, artifact?: ArtifactMetadata): Promise<void>;
  getEvidence(id: string): Promise<Evidence | null>;
  createClaim(claim: Claim): Promise<void>;
  getClaim(id: string): Promise<Claim | null>;
  claimsBySubject(entityId: string): Promise<Claim[]>;
  promoteClaim(id: string, context: Omit<PromotionContext, 'sources' | 'evidence'>, eventId: string, sequence: number): Promise<Claim>;
  supersedeClaim(id: string, successor: Claim): Promise<void>;
}
export interface ArtifactMetadataRepository { createArtifact(metadata: ArtifactMetadata): Promise<void>; getArtifact(id: string): Promise<ArtifactMetadata | null>; }
export interface FoundationRepository extends ProjectRepository, EntityRepository, EventRepository, EvidenceRepository, ArtifactMetadataRepository {
  putFrame(record: FrameRecord): Promise<void>;
  getFrame(id: string): Promise<FrameRecord | null>;
  putTransform(transform: SpatialTransform): Promise<void>;
  getTransform(id: string): Promise<SpatialTransform | null>;
}
