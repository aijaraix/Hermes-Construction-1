import { randomUUID } from 'node:crypto';
import { createEvidence } from '../../src/lib/projectEvidence';
import type { RealityClass, Source } from '../../src/types/hermes';
import type { ArtifactStore } from '../persistence/contracts';
import { canonicalJson } from '../persistence/integrity';
import { IfcNormalizationError, type IfcNormalizer, type ModelImportRepository, type NormalizationReport, type SourceModel, type SourceModelRevision } from './IfcNormalizer';
import { reconcileModel } from './modelReconciliation';
import { diffModel } from './modelDiff';

export interface IfcImportRequest {
  model: SourceModel; projectRevisionId: string; bytes: Uint8Array; source: Source; realityClass: RealityClass;
  explicitMappings?: Record<number,string>;
}
/** Internal service only. Trusted caller resolves project authorization/source rights before entry.
 * Without a repository, returns an isolated result and never promotes canonical project state.
 */
export class ModelImportService {
  constructor(private artifacts: ArtifactStore,private normalizer: IfcNormalizer,private repository?: ModelImportRepository) {}
  async import(input: IfcImportRequest): Promise<{ mode: 'PERSISTED' | 'ISOLATED'; revision: SourceModelRevision }> {
    if(input.source.projectId!==input.model.projectId)throw new Error('Import source project scope mismatch');
    if(!input.source.storagePolicy.fullTextStoragePermitted||!input.source.storagePolicy.bulkIngestionPermitted||!['CACHE_ALLOWED','REDISTRIBUTABLE'].includes(input.source.rightsClassification))throw new Error('IFC source storage rights not granted');
    if(!input.model.sourceModelId||!input.projectRevisionId)throw new Error('Source model/revision identity required');
    // Freeze the source snapshot before any await; the caller may reuse its upload buffer.
    input=structuredClone(input);const bytes=input.bytes;
    const id=randomUUID(),at=new Date().toISOString(),evidenceId=`IFC-EVIDENCE-${id}`;
    // Persist the exact input BEFORE parser execution, including sources that subsequently fail.
    const sourceArtifact=await this.artifacts.put({bytes,artifactId:`IFC-${id}`,projectId:input.model.projectId,projectRevisionId:input.projectRevisionId,sourceId:input.source.sourceId,evidenceId,artifactClass:'IFC_ORIGINAL',mimeType:'application/x-step',rightsClassification:input.source.rightsClassification,createdAt:at});
    const evidence=createEvidence({evidenceId,projectId:input.model.projectId,projectRevisionId:input.projectRevisionId,sourceId:input.source.sourceId,relatedEntityIds:[input.model.projectId],recordedAt:at,realityClass:input.realityClass,contentKind:'CONTENT',rightsClassification:input.source.rightsClassification,artifactHash:sourceArtifact.sha256,artifactUri:sourceArtifact.uri,mimeType:sourceArtifact.mimeType});
    const previous=await this.repository?.latest(input.model.sourceModelId)??null;
    if(previous&&(previous.projectId!==input.model.projectId||previous.sourceModelId!==input.model.sourceModelId))throw new Error('Prior source revision scope mismatch');
    let revision: SourceModelRevision={revisionId:`IFC-REV-${id}`,sourceModelId:input.model.sourceModelId,projectId:input.model.projectId,projectRevisionId:input.projectRevisionId,priorRevisionId:previous?.revisionId,source:input.source,evidence,sourceArtifact,createdAt:at,realityClass:input.realityClass,status:'IMPORTING'};
    await this.repository?.begin(input.model,revision);
    const provenance={projectId:revision.projectId,sourceModelId:revision.sourceModelId,sourceModelRevisionId:revision.revisionId,artifactId:sourceArtifact.artifactId,artifactHash:sourceArtifact.sha256,evidenceId};
    const artifact=async(suffix:string,body:unknown,artifactClass:'NORMALIZED_SEMANTICS'|'OTHER')=>this.artifacts.put({bytes:Buffer.from(canonicalJson(body)),artifactId:`${revision.revisionId}:${suffix}`,artifactClass,projectId:revision.projectId,projectRevisionId:revision.projectRevisionId,sourceId:revision.source.sourceId,evidenceId,mimeType:'application/json',rightsClassification:revision.source.rightsClassification,createdAt:at});
    try {
      const normalized=await this.normalizer.normalize(bytes);
      const identityHistory=await this.repository?.identityHistory?.(input.model.sourceModelId)??[];
      const mappings=reconcileModel(normalized,previous,input.explicitMappings,identityHistory);
      const report: NormalizationReport={provenance,parser:normalized.parser,startedAt:at,finishedAt:new Date().toISOString(),schema:normalized.schema,status:'NORMALIZED',entityCount:normalized.entities.length,committedEntityCount:this.repository?mappings.length:0,warnings:[...normalized.warnings,...normalized.entities.flatMap(e=>e.warnings.map(w=>`${e.expressId}: ${w}`))]};
      // The immutable parse receipt makes no claim that the later canonical transaction committed.
      const normalizedArtifact=await artifact('SEMANTICS',{provenance,normalized},'NORMALIZED_SEMANTICS');
      const reportArtifact=await artifact('PARSE-REPORT',{...report,committedEntityCount:0},'OTHER');
      revision={...revision,status:this.repository?'IMPORTED':'NORMALIZED_ONLY',normalized,mappings,diff:diffModel(normalized,mappings,previous),report,normalizedArtifact,reportArtifact};
      await this.repository?.commit(revision);
    } catch(error) {
      // A repository MUST roll back canonical mutations before this terminal failure is recorded.
      revision={...revision,status:'FAILED',normalized:undefined,mappings:undefined,diff:undefined,report:{provenance,parser:this.normalizer.parser,startedAt:at,finishedAt:new Date().toISOString(),status:'FAILED',entityCount:0,committedEntityCount:0,warnings:[],failure:{category:error instanceof IfcNormalizationError?error.category:'IMPORT_COMMIT_FAILED',message:String(error.message).slice(0,500)}}};
      revision.reportArtifact=await artifact('FAILURE-REPORT',revision.report,'OTHER');
      await this.repository?.fail(revision);
    }
    return {mode:this.repository?'PERSISTED':'ISOLATED',revision};
  }
}
