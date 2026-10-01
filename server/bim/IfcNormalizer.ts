import type { ConstructionEntity, Evidence, RealityClass, Source } from '../../src/types/hermes';
import type { ArtifactMetadata, JsonValue } from '../persistence/contracts';

export interface IfcParserIdentity { implementation: 'web-ifc'; version: string; }
export interface IfcProvenance { projectId: string; sourceModelId: string; sourceModelRevisionId: string; artifactId: string; artifactHash: string; evidenceId: string; }
export interface NormalizedIfcEntity {
  expressId: number; globalId?: string; rawGlobalId?: string; ifcType: string; name?: string; description?: string;
  propertySets: JsonValue[]; materials: JsonValue[]; quantities: Array<{ provenance: 'IMPORTED_SOURCE_CLAIM'; value: JsonValue }>;
  typeProperties: JsonValue[]; relationships: Array<{ kind: string; targetExpressIds: number[]; source: JsonValue }>;
  placement: JsonValue; geometry?: { fingerprint: string; representation: 'IFC_DERIVED_REFERENCE'; coordinateSystem: 'WEB_IFC_RENDER_Y_UP_METERS'; meshCount: number; transforms: number[][] };
  collisionProxy?: { kind: 'AABB_BROADPHASE_ONLY'; minMeters: number[]; maxMeters: number[]; frame: 'WEB_IFC_RENDER_Y_UP_METERS'; physicallyVerified: false };
  fingerprints: { properties: string; placement: string; geometry: string; relationships: string };
  extensions: JsonValue; warnings: string[];
}
export interface NormalizedIfcModel { schema: string; parser: IfcParserIdentity; entities: NormalizedIfcEntity[]; warnings: string[]; sourceUnits: JsonValue[]; }
export interface NormalizationReport {
  provenance: IfcProvenance; parser: IfcParserIdentity; startedAt: string; finishedAt: string; schema?: string;
  status: 'NORMALIZED' | 'FAILED'; entityCount: number; committedEntityCount: number; warnings: string[];
  failure?: { category: string; message: string };
}
export interface IfcNormalizer { readonly parser: IfcParserIdentity; normalize(bytes: Uint8Array): Promise<NormalizedIfcModel>; }
export class IfcNormalizationError extends Error { constructor(readonly category: string, message: string) { super(message); this.name='IfcNormalizationError'; } }
export type ReconciliationState = 'EXACT_EXTERNAL_ID' | 'DETERMINISTIC_MATCH' | 'PROBABLE_REVIEW_REQUIRED' | 'NEW_ENTITY' | 'REMOVED_OR_SUPERSEDED' | 'UNRESOLVED';
export interface ModelEntityMapping { expressId: number; globalId?: string; entityId: string; state: ReconciliationState; }
export type ModelChange = 'ADDED' | 'REMOVED' | 'PROPERTY_CHANGED' | 'PLACEMENT_CHANGED' | 'GEOMETRY_CHANGED' | 'RELATIONSHIP_CHANGED' | 'UNCHANGED' | 'IDENTITY_REVIEW_REQUIRED';
export interface ModelDiff { entityId: string; expressId?: number; changes: ModelChange[]; }
export interface SourceModel { projectId: string; sourceModelId: string; name: string; }
export interface SourceModelRevision {
  revisionId: string; sourceModelId: string; projectId: string; projectRevisionId: string; priorRevisionId?: string;
  source: Source; evidence: Evidence; sourceArtifact: ArtifactMetadata; createdAt: string; realityClass: RealityClass;
  normalizedArtifact?: ArtifactMetadata; reportArtifact?: ArtifactMetadata;
  status: 'IMPORTING' | 'IMPORTED' | 'NORMALIZED_ONLY' | 'FAILED'; report?: NormalizationReport; normalized?: NormalizedIfcModel;
  mappings?: ModelEntityMapping[]; diff?: ModelDiff[];
}
export interface ImportCommit { revision: SourceModelRevision; entities: ConstructionEntity[]; }
/** Implementations must commit every entity, mapping, revision and event in ONE transaction. */
export interface ModelImportRepository {
  latest(sourceModelId: string): Promise<SourceModelRevision | null>;
  identityHistory?(sourceModelId: string): Promise<ModelEntityMapping[]>;
  begin(model: SourceModel, revision: SourceModelRevision): Promise<void>;
  commit(revision: SourceModelRevision): Promise<void>;
  fail(revision: SourceModelRevision): Promise<void>;
  get(revisionId: string): Promise<SourceModelRevision | null>;
}
export interface InformationRequirementValidator { validate(model: NormalizedIfcModel): Promise<{ standard: 'IDS'; issues: string[] }>; }
export interface BcfIssueAdapter { externalIdentity(issueId: string): { system: 'BCF'; externalId: string }; }
export interface ClassificationDictionaryAdapter { resolve(reference: { dictionaryUri: string; code: string }): Promise<JsonValue>; }
