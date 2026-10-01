import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { createHash } from 'node:crypto';
import { WebIfcServerNormalizer } from '../bim/WebIfcServerNormalizer';
import { ModelImportService, type IfcImportRequest } from '../bim/modelImportService';
import { reconcileModel, isValidIfcGlobalId } from '../bim/modelReconciliation';
import { diffModel } from '../bim/modelDiff';
import type { IfcNormalizer, ModelImportRepository, NormalizedIfcModel, SourceModel, SourceModelRevision } from '../bim/IfcNormalizer';
import { LocalArtifactStore } from '../storage/LocalArtifactStore';
import { canonicalJson } from '../persistence/integrity';
import { PostgresFoundationRepository } from '../persistence/PostgresFoundationRepository';

const fixtures=path.resolve('server/__tests__/fixtures/openbim');
/** Unit-only repository double. Never used as PostgreSQL persistence proof. */
class ImportMemoryDouble implements ModelImportRepository {
  records=new Map<string,SourceModelRevision>();head=new Map<string,string>();failCommit=false;
  async latest(id:string){return structuredClone(this.records.get(this.head.get(id)??'')??null);}
  async identityHistory(id:string){return structuredClone([...this.records.values()].filter(r=>r.sourceModelId===id&&r.status==='IMPORTED').flatMap(r=>r.mappings??[]));}
  async begin(model:SourceModel,r:SourceModelRevision){this.records.set(r.revisionId,structuredClone(r));}
  async commit(r:SourceModelRevision){if(this.failCommit)throw new Error('Injected commit rejection');this.records.set(r.revisionId,structuredClone(r));this.head.set(r.sourceModelId,r.revisionId);}
  async fail(r:SourceModelRevision){this.records.set(r.revisionId,structuredClone(r));}
  async get(id:string){return structuredClone(this.records.get(id)??null);}
}
const request=(bytes:Uint8Array):IfcImportRequest=>({bytes,model:{projectId:'P',sourceModelId:'MODEL',name:'Owned fixture'},projectRevisionId:'PR1',realityClass:'REGRESSION_FIXTURE',source:{sourceId:'SOURCE',projectId:'P',sourceType:'IFC',title:'Owned synthetic parser fixture',authorityClass:'SIMULATION_FIXTURE',licenseStatus:'PERMITTED_OPEN',rightsClassification:'CACHE_ALLOWED',storagePolicy:{bulkIngestionPermitted:true,fullTextStoragePermitted:true,chunkingPermitted:true}}});
describe('FND-04 real web-ifc parsing, identity and bounded import service',()=>{
  let dir:string;let store:LocalArtifactStore;let a:Buffer;let b:Buffer;let modelA:NormalizedIfcModel;let modelB:NormalizedIfcModel;
  const parser=new WebIfcServerNormalizer();
  beforeAll(async()=>{dir=await fs.mkdtemp(path.join(os.tmpdir(),'hermes-fnd04-tests-'));store=new LocalArtifactStore(dir);a=await fs.readFile(path.join(fixtures,'owned-rev-a.ifc'));b=await fs.readFile(path.join(fixtures,'owned-rev-b.ifc'));[modelA,modelB]=await Promise.all([parser.normalize(a),parser.normalize(b)]);},30000);
  afterAll(async()=>{await fs.rm(dir,{recursive:true,force:true});});
  it('IFC-02/05/06/07 extracts actual IFC4 objects, Pset, containment, materials, type and source quantities',()=>{
    expect(modelA.schema).toBe('IFC4');expect(modelA.parser).toEqual({implementation:'web-ifc',version:'0.0.77'});
    expect(modelA.entities).toHaveLength(7);const wall=modelA.entities.find(e=>e.name==='Wall A')!;
    expect(JSON.stringify(wall.propertySets)).toContain('60 min');expect(JSON.stringify(wall.materials)).toContain('Concrete');expect(JSON.stringify(wall.typeProperties)).toContain('Concrete wall type');
    expect(wall.relationships.find(r=>r.kind==='IFCRELCONTAINEDINSPATIALSTRUCTURE')?.targetExpressIds).toContain(14);
    expect(wall.quantities[0].provenance).toBe('IMPORTED_SOURCE_CLAIM');expect(JSON.stringify(wall.quantities)).toContain('2.4');
    expect(modelA.entities.filter(e=>['IFCPROJECT','IFCSITE','IFCBUILDING','IFCBUILDINGSTOREY','IFCSPACE'].includes(e.ifcType))).toHaveLength(5);
  });
  it('separates real derived geometry/bounds from canonical identity and original source',()=>{
    const wall=modelA.entities.find(e=>e.name==='Wall A')!;
    expect(wall.geometry?.fingerprint).toMatch(/^[a-f0-9]{64}$/);expect(wall.geometry?.representation).toBe('IFC_DERIVED_REFERENCE');
    expect(wall.collisionProxy?.maxMeters[1]).toBeCloseTo(3);expect(wall.collisionProxy?.maxMeters[0]).toBeCloseTo(2);
    expect(wall.collisionProxy?.frame).toBe('WEB_IFC_RENDER_Y_UP_METERS');expect(wall.collisionProxy?.physicallyVerified).toBe(false);
    expect(wall).not.toHaveProperty('vertices');expect(wall).not.toHaveProperty('entityId');
  });
  it('keeps source units and verifies derived mesh bounds are metres even for millimetre IFC input',async()=>{
    const millimetres=await parser.normalize(Buffer.from(a.toString().replace('IFCSIUNIT(*,.LENGTHUNIT.,$,.METRE.)','IFCSIUNIT(*,.LENGTHUNIT.,.MILLI.,.METRE.)')));
    expect(JSON.stringify(millimetres.sourceUnits)).toContain('MILLI');
    expect(millimetres.entities.find(e=>e.name==='Wall A')?.collisionProxy?.maxMeters[1]).toBeCloseTo(0.003,6);
    expect(millimetres.entities.find(e=>e.name==='Wall A')?.collisionProxy?.maxMeters[0]).toBeCloseTo(0.002,6);
  });
  it('IFC-03/04 accepts only parsed valid compressed GlobalIds, retaining invalid raw aliases',async()=>{
    expect(isValidIfcGlobalId('1WWWWWWWWWWWWWWWWWWWWW')).toBe(true);
    for(const id of ['WALL-123','4WWWWWWWWWWWWWWWWWWWWW','1a111111-2222-3333-4444-555555555501'])expect(isValidIfcGlobalId(id)).toBe(false);
    const altered=await parser.normalize(Buffer.from(a.toString().replace('1WWWWWWWWWWWWWWWWWWWWW','WALL-local-synthetic')));
    const wall=altered.entities.find(e=>e.name==='Wall A')!;expect(wall.globalId).toBeUndefined();expect(wall.rawGlobalId).toBe('WALL-local-synthetic');
    expect(reconcileModel(altered,null).find(m=>m.expressId===wall.expressId)?.globalId).toBeUndefined();
  });
  it('IFC-01/ART-01 persists exact source bytes/hash and isolated provenance without canonical promotion',async()=>{
    const result=await new ModelImportService(store,parser).import(request(a));const r=result.revision;
    expect(result.mode).toBe('ISOLATED');expect(r.status).toBe('NORMALIZED_ONLY');expect(r.report?.committedEntityCount).toBe(0);
    expect(r.sourceArtifact.sha256).toBe(createHash('sha256').update(a).digest('hex'));
    expect(await fs.readFile(await store.getReadReference('P',r.sourceArtifact.objectKey))).toEqual(a);
    expect(r.report?.provenance.evidenceId).toBe(r.evidence.evidenceId);expect(r.evidence.artifactHash).toBe(r.sourceArtifact.sha256);
    const receipt=JSON.parse(await fs.readFile(await store.getReadReference('P',r.reportArtifact!.objectKey),'utf8'));
    expect(receipt.provenance.artifactHash).toBe(r.sourceArtifact.sha256);expect(receipt.committedEntityCount).toBe(0);
    expect(r.normalizedArtifact?.artifactClass).toBe('NORMALIZED_SEMANTICS');
    await expect(store.put({...r.sourceArtifact,bytes:b})).rejects.toThrow(/Immutable/);
  });
  it('ID-01/DIFF/REV-01 retains source-context identity while detecting addition, removal, property/placement/geometry change',async()=>{
    const repository=new ImportMemoryDouble();const service=new ModelImportService(store,parser,repository);
    const first=(await service.import(request(a))).revision;const original=canonicalJson(first);
    const second=(await service.import(request(b))).revision;expect(second.status).toBe('IMPORTED');expect(second.priorRevisionId).toBe(first.revisionId);
    const oldWall=first.mappings!.find(m=>m.expressId===24)!;const wall=second.mappings!.find(m=>m.expressId===24)!;
    expect(wall.entityId).toBe(oldWall.entityId);expect(wall.state).toBe('EXACT_EXTERNAL_ID');
    expect(second.diff!.find(d=>d.entityId===wall.entityId)?.changes).toEqual(expect.arrayContaining(['PROPERTY_CHANGED','PLACEMENT_CHANGED','GEOMETRY_CHANGED','RELATIONSHIP_CHANGED']));
    expect(second.diff!.some(d=>d.changes.includes('ADDED'))).toBe(true);expect(second.diff!.some(d=>d.changes.includes('REMOVED'))).toBe(true);
    expect(canonicalJson(await repository.get(first.revisionId))).toBe(original);
    const third=(await service.import(request(b))).revision;expect(third.diff!.every(d=>d.changes.includes('UNCHANGED'))).toBe(true);
    const restored=(await service.import(request(a))).revision;
    expect(restored.mappings!.find(m=>m.expressId===28)?.entityId).toBe(first.mappings!.find(m=>m.expressId===28)?.entityId);
  });
  it('ID-02 name/type similarity requests review with new identity; explicit mappings must be scoped and one-to-one',()=>{
    const mappings=reconcileModel(modelA,null);const previous={normalized:modelA,mappings} as SourceModelRevision;
    const changed=structuredClone(modelA);const wall=changed.entities.find(e=>e.name==='Wall A')!;wall.globalId=undefined;
    const next=reconcileModel(changed,previous);const mapped=next.find(m=>m.expressId===24)!;const old=mappings.find(m=>m.expressId===24)!;
    expect(mapped.entityId).not.toBe(old.entityId);expect(mapped.state).toBe('PROBABLE_REVIEW_REQUIRED');expect(diffModel(changed,next,previous).find(d=>d.entityId===mapped.entityId)?.changes).toContain('IDENTITY_REVIEW_REQUIRED');
    expect(reconcileModel(changed,previous,{24:old.entityId}).find(m=>m.expressId===24)?.state).toBe('DETERMINISTIC_MATCH');
    expect(()=>reconcileModel(changed,previous,{24:'FOREIGN'})).toThrow(/source model/);
    expect(()=>reconcileModel(changed,previous,{24:mappings.find(m=>m.expressId===28)!.entityId})).toThrow(/one to one/);
  });
  it('federated models and duplicate source GUIDs do not collapse identities',()=>{
    expect(reconcileModel(modelA,null)[0].entityId).not.toBe(reconcileModel(modelA,null)[0].entityId);
    const duplicate=structuredClone(modelA);duplicate.entities.find(e=>e.expressId===28)!.globalId=duplicate.entities.find(e=>e.expressId===24)!.globalId;
    const mappings=reconcileModel(duplicate,null).filter(m=>[24,28].includes(m.expressId));expect(mappings.every(m=>m.state==='UNRESOLVED'&&!m.globalId)).toBe(true);expect(mappings[0].entityId).not.toBe(mappings[1].entityId);
  });
  it('FAIL-01 malformed source retains failed evidence/artifact, no normalized entities and no head',async()=>{
    const repository=new ImportMemoryDouble();const service=new ModelImportService(store,parser,repository);
    const result=(await service.import(request(await fs.readFile(path.join(fixtures,'malformed.ifc'))))).revision;
    expect(result.status).toBe('FAILED');expect(result.normalized).toBeUndefined();expect(result.report?.failure?.category).toBe('PARSE_FAILED');expect(result.report?.committedEntityCount).toBe(0);expect(await repository.latest('MODEL')).toBeNull();expect(await store.exists('P',result.sourceArtifact.objectKey)).toBe(true);
    expect(await store.exists('P',result.reportArtifact!.objectKey)).toBe(true);
  });
  it('FAIL-02 size and actual child-process timeout terminate without accepting partial output',async()=>{
    await expect(new WebIfcServerNormalizer({maxBytes:20}).normalize(a)).rejects.toMatchObject({category:'SIZE_LIMIT'});
    // Deadline shorter than process startup: actual fork/termination, not a fake parser timer.
    await expect(new WebIfcServerNormalizer({timeoutMs:1}).normalize(a)).rejects.toMatchObject({category:'TIMEOUT'});
    expect(()=>new WebIfcServerNormalizer({timeoutMs:0})).toThrow(/bounds/);
  });
  it('failed canonical commit records a failed import with unchanged prior head (repository mock only)',async()=>{
    const repository=new ImportMemoryDouble();const service=new ModelImportService(store,parser,repository);
    const prior=(await service.import(request(a))).revision;repository.failCommit=true;
    const failed=(await service.import(request(b))).revision;expect(failed.status).toBe('FAILED');expect(failed.report?.failure?.category).toBe('IMPORT_COMMIT_FAILED');expect(failed.mappings).toBeUndefined();expect((await repository.latest('MODEL'))?.revisionId).toBe(prior.revisionId);
  });
  it('rights/project validation rejects before parsing',async()=>{
    const never:IfcNormalizer={parser:parser.parser,normalize:async()=>{throw new Error('must not parse');}};
    const service=new ModelImportService(store,never);const input=request(a);input.source.rightsClassification='DO_NOT_STORE';
    await expect(service.import(input)).rejects.toThrow(/rights/);input.source.projectId='OTHER';await expect(service.import(input)).rejects.toThrow(/scope/);
  });
  it('uses a private byte snapshot so upload-buffer reuse cannot change the parsed artifact',async()=>{
    const mutable=Buffer.from(a);const pending=new ModelImportService(store,parser).import(request(mutable));mutable.fill(0);
    const result=(await pending).revision;expect(result.status).toBe('NORMALIZED_ONLY');expect(result.sourceArtifact.sha256).toBe(createHash('sha256').update(a).digest('hex'));
  });
  it('foundation unit of work shares one transaction and rejects a retained transaction object (SQL mock only)',async()=>{
    const calls:string[]=[];let connections=0;let released=0;
    const client={query:async(sql:string)=>{calls.push(sql);return {rowCount:1,rows:sql.startsWith('SELECT payload')?[{payload:{projectId:'P'}}]:[{project_id:'P'}]};},release:()=>{released++;}};
    const repo=new PostgresFoundationRepository({connect:async()=>{connections++;return client;}} as any,{organizationId:'O',projectId:'P'});
    let retained:PostgresFoundationRepository;
    await repo.withProjectTransaction(async f=>{retained=f;await f.getProject();await f.getEntity('E');});
    expect(connections).toBe(1);expect(calls.filter(x=>x==='BEGIN')).toHaveLength(1);expect(calls.at(-1)).toBe('COMMIT');expect(released).toBe(1);
    await expect(retained!.getProject()).rejects.toThrow(/ended/);
  });
  it('relationship-only changes have an independent semantic diff',()=>{
    const mappings=reconcileModel(modelA,null),previous={normalized:modelA,mappings} as SourceModelRevision;
    const next=structuredClone(modelA);next.entities.find(e=>e.expressId===24)!.fingerprints.relationships='different';
    expect(diffModel(next,mappings,previous).find(d=>d.expressId===24)?.changes).toEqual(['RELATIONSHIP_CHANGED']);
  });
});
