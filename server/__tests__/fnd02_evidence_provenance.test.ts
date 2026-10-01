import { describe, expect, it, vi, afterEach } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { AuthoritativeSourceDefinition, Claim, Evidence, Source, SourceAuthorityClass } from '../../src/types/hermes';
import { adaptTruthOrigin, createClaim, createEvidence, promoteClaim, supersedeClaim, validateClaimPromotion } from '../../src/lib/projectEvidence';
import { deriveTruthLabel } from '../../src/lib/truthLabels';
import { adaptAuthoritativeSource, adaptFetchedDocument, adaptKnowledgeAssertion, adaptLegacyClaim, adaptManagerReview, sourceRights } from '../../src/lib/evidenceAdapters';
import { HttpSourceFetcher } from '../httpSourceFetcher';
import { HermesLiveHouseEngine } from '../hermesLiveHouseEngine';
const at = '2026-09-30T12:00:00.000Z';
const scope = { projectId: 'P', projectRevisionId: 'R1', subjectEntityId: 'ENTITY', realityClass: 'LIVE' as const, recordedAt: at };
const definition: AuthoritativeSourceDefinition = { sourceId: 'SRC', title: 'Government reference', publisher: 'Publisher', agencyOrOrganization: 'Agency', URL: 'https://example.test/source', discipline: 'Site', applicableAgentRoles: [], topics: [], geographicScope: 'Florida', jurisdiction: 'Florida', publicationDate: '2026-01-01', editionVersion: 'v1', authorityLevel: 'PRIMARY_GOVERNMENT', accessType: 'FREE_PUBLIC', copyrightLicenseStatus: 'PUBLIC_DOMAIN', bulkIngestionPermitted: true, fullTextStoragePermitted: true, chunkingPermitted: true, citationRequirements: 'Cite source', lastChecked: at, freshnessCategory: 'CODE_REGULATION', priority: 1 };
const source = (authorityClass: SourceAuthorityClass = 'AHJ_RECORD'): Source => ({ ...adaptAuthoritativeSource(definition), projectId: 'P', authorityClass });
const evidence = (overrides: Partial<Evidence> = {}): Evidence => createEvidence({ evidenceId: 'E', projectId: 'P', sourceId: 'SRC', projectRevisionId: 'R1', relatedEntityIds: ['ENTITY'], recordedAt: at, artifactHash: 'a'.repeat(64), artifactUri: 'records/permit.pdf', rightsClassification: 'REFERENCE_ONLY', realityClass: 'LIVE', contentKind: 'CONTENT', supports: [{predicate:'ahj.inspection',value:'PASSED'}], ...overrides });
const claim = (overrides: Partial<Claim> = {}): Claim => createClaim({ claimId: 'C', projectId: 'P', projectRevisionId: 'R1', subjectEntityId: 'ENTITY', domain: 'AHJ_APPROVAL', predicate: 'ahj.inspection', value: 'PASSED', evidenceIds: ['E'], recordedAt: at, derivationMethod: 'DIRECT_SOURCE', sourceAuthorityClass: 'AHJ_RECORD', realityClass: 'LIVE', ...overrides } as Parameters<typeof createClaim>[0]);
const context = (authority: SourceAuthorityClass = 'AHJ_RECORD') => ({ at, reviewerId: 'reviewer', reason: 'Checked applicable signed record', evidence: [evidence()], sources: [source(authority)] });
afterEach(() => vi.restoreAllMocks());
describe('FND-02 canonical provenance and authority', () => {
  it('SRC-01 preserves source authority, rights, version and citation', () => {
    expect(adaptAuthoritativeSource(definition)).toMatchObject({ authorityClass: 'REGIONAL_PUBLIC_DATA', legacyAuthorityLevel: 'PRIMARY_GOVERNMENT', licenseStatus: 'PUBLIC_DOMAIN', editionVersion: 'v1', citationRequirements: 'Cite source', storagePolicy: { fullTextStoragePermitted: true } });
  });
  it.each(['PROPRIETARY','RESTRICTED','COPYRIGHT_METADATA_ONLY','RIGHTS_REVIEW_REQUIRED'] as const)('RIGHTS-01 local %s remains restricted and cannot expose full text', license => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'fnd02-'));
    try {
      const file = path.join(dir, 'licensed.txt'); fs.writeFileSync(file, 'copyrighted body');
      const result = HttpSourceFetcher.loadLocalApprovedDocument({ ...definition, copyrightLicenseStatus: license }, file);
      expect(result.document.licenseStatus).toBe(license);
      expect(result.document.parsedText).toBe(''); expect(result.document.filePathOrKey).toBe('');
      expect(result.fetchRecord.fetchStatus).toBe('RIGHTS_RESTRICTED');
    } finally { fs.rmSync(dir, { recursive: true }); }
  });
  it('RIGHTS-02 adapters and HTTP gate fail closed for reference-only and missing permission', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('must not fetch'));
    for (const blocked of [{ ...definition, accessType: 'VIEW_ONLY_METADATA' as const }, { ...definition, fullTextStoragePermitted: false }, { ...definition, bulkIngestionPermitted: false }]) {
      expect(sourceRights(blocked).permitted).toBe(false);
      expect(adaptAuthoritativeSource(blocked).storagePolicy.chunkingPermitted).toBe(false);
      expect((await HttpSourceFetcher.fetchAndStoreSource(blocked)).fetchRecord.fetchStatus).toBe('RIGHTS_RESTRICTED');
    }
    expect(fetchSpy).not.toHaveBeenCalled();
  });
  it('EVID-01 keeps local open-document bytes/hash and adapts linkage without duplicating text', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(),'fnd02-'));
    try {
      const file = path.join(dir,'open.txt'); fs.writeFileSync(file,'open content');
      const r = HttpSourceFetcher.loadLocalApprovedDocument(definition,file);
      const e = adaptFetchedDocument(r.document,r.fetchRecord,source(),{...scope,recordedAt:r.document.retrievalTime});
      expect(e.artifactHash).toBe(r.document.checksumSha256); expect(e.contentKind).toBe('CONTENT'); expect(e).not.toHaveProperty('parsedText');
      expect(()=>adaptFetchedDocument(r.document,{...r.fetchRecord,sourceId:'wrong'},source(),scope)).toThrow(/lineage/);
    } finally { fs.rmSync(dir,{recursive:true}); }
  });
  it('CLAIM-01 inference starts PROPOSED and needs explicit validation', () => {
    const c = claim({domain:'GENERAL',predicate:'height',derivationMethod:'MODEL_INFERENCE'});
    expect(c.status).toBe('PROPOSED'); expect(()=>promoteClaim(c,context(),'EV')).toThrow(/validation/);
    const ctx = {...context(),evidence:[evidence({supports:[{predicate:'height',value:'PASSED'}]})],inferenceValidation:{claimId:'C',projectRevisionId:'R1',reviewerId:'reviewer',evidenceIds:['E'],method:'HUMAN_REVIEW' as const,passed:true}};
    const p = promoteClaim(c,ctx,'EV'); expect(deriveTruthLabel(p.claim,{...ctx,promotionEvents:[p.event]})).toBe('Verified');
    expect(()=>claim({status:'VERIFIED'})).toThrow(/promotion/);
  });
  it.each(['SIMULATION','REGRESSION_FIXTURE','HISTORICAL_REFERENCE'] as const)('TRUTH-01 %s never promotes into live Verified', realityClass => {
    const c=claim({realityClass}); expect(validateClaimPromotion(c,context()).allowed).toBe(false);
    expect(deriveTruthLabel({...c,status:'VERIFIED'})).not.toBe('Verified');
  });
  it.each(['OWNER_INPUT','REGIONAL_PUBLIC_DATA','HERMES_INTERNAL'] as const)('GEO-02 %s cannot verify geotechnical conclusions', authority => {
    const c=claim({domain:'GEOTECH',predicate:'geotech.bearing',sourceAuthorityClass:authority});
    expect(validateClaimPromotion(c,context(authority)).allowed).toBe(false);
  });
  it.each(['PROFESSIONAL_APPROVAL','AHJ_APPROVAL','LEGAL_COMPLETION'] as const)('external %s excludes internal manager authority', domain => {
    const c=claim({domain,predicate:domain.toLowerCase(),sourceAuthorityClass:'HERMES_INTERNAL'});
    expect(validateClaimPromotion(c,context('HERMES_INTERNAL')).allowed).toBe(false);
    expect(adaptManagerReview({managerRoleId:'HERMES',reviewMode:'PROFESSIONAL_REVIEW',decision:'APPROVED'})).toMatchObject({grantsProfessionalApproval:false,grantsAhjApproval:false});
  });
  it('AHJ-02 and PRO-02 allow applicable external evidence and return audit events', () => {
    for (const [domain,authority] of [['AHJ_APPROVAL','AHJ_RECORD'],['PROFESSIONAL_APPROVAL','LICENSED_PROFESSIONAL_REPORT'],['GEOTECH','LAB_TEST']] as const) {
      const c=claim({domain,predicate:domain.toLowerCase(),sourceAuthorityClass:authority}); const ctx={...context(authority),evidence:[evidence({supports:[{predicate:c.predicate,value:c.value}]})]};
      const p=promoteClaim(c,ctx,'EV'); expect(c.status).toBe('PROPOSED'); expect(p.event.payload.before).toEqual(c);
      expect(deriveTruthLabel(p.claim,{...ctx,promotionEvents:[p.event]})).toBe('Verified');
      expect(deriveTruthLabel({...p.claim,value:'forged'},{...ctx,promotionEvents:[p.event]})).not.toBe('Verified');
    }
  });
  it.each([{projectId:'OTHER'},{projectRevisionId:'OTHER'},{relatedEntityIds:['OTHER']},{contentKind:'METADATA_ONLY' as const},{artifactHash:undefined},{supports:[]},{supports:[{predicate:'different',value:'PASSED'}]},{realityClass:'SIMULATION' as const}])('EVID-02 rejects invalid applicability/content %j', patch => {
    expect(validateClaimPromotion(claim(),{...context(),evidence:[evidence(patch)]}).allowed).toBe(false);
  });
  it('authority cannot be bypassed with a generic domain, duplicate ID or expired source', () => {
    expect(validateClaimPromotion(claim({domain:'GENERAL'}),context()).allowed).toBe(false);
    expect(validateClaimPromotion(claim(),{...context(),evidence:[evidence(),evidence()]}).allowed).toBe(false);
    expect(validateClaimPromotion(claim(),{...context(),sources:[{...source(),effectiveTo:at}]}).allowed).toBe(false);
  });
  it('ASSERT-01 knowledge approval is a proposed inference with evidence linkage', () => {
    const e=evidence({lineage:{documentId:'DOC'}});
    const c=adaptKnowledgeAssertion({assertionId:'A',subject:'height',predicate:'height',objectValue:'3',sourceChunkId:'CH',sourceDocumentId:'DOC',sourceUrl:'url',confidence:1,agentExtractorId:'AI',validationStatus:'MANAGER_APPROVED',geographicScope:'FL',buildingTypeScope:'house',materialScope:'wood',effectiveDate:at,version:'1'},e,source(),scope);
    expect(c.status).toBe('PROPOSED'); expect(c.evidenceIds).toEqual(['E']); expect(deriveTruthLabel(c)).toBe('AI inferred');
  });
  it('CLAIM-02 supersession returns both histories and leaves inputs intact', () => {
    const previous=claim(); const next=claim({claimId:'C2',recordedAt:'2026-10-01T12:00:00Z'});
    const result=supersedeClaim(previous,next); expect(previous.status).toBe('PROPOSED'); expect(result.previous.status).toBe('SUPERSEDED'); expect(result.successor.supersedesClaimId).toBe('C');
    expect(()=>supersedeClaim(previous,{...next,projectId:'OTHER'})).toThrow();
  });
  it('PRICE-01 legacy VERIFIED labels and confidence cannot produce Verified', () => {
    const c=adaptLegacyClaim({id:'PRICE',predicate:'price',value:4,priceSource:'VERIFIED CURRENT QUOTE',verificationStatus:'VERIFIED',confidence:1},scope,'PRICE');
    expect(deriveTruthLabel(c)).toBe('Assumed');
  });
  it('ORIGIN-01 maps every legacy axis without conferring professional authority', () => {
    expect(adaptTruthOrigin('CUSTOMER').sourceAuthorityClass).toBe('OWNER_INPUT');
    expect(adaptTruthOrigin('CALCULATED').derivationMethod).toBe('DETERMINISTIC_CALCULATION');
    for (const alias of ['AUTONOMOUS_ENGINE','HERMES_WORKFORCE','HUMAN_EXPERT','ACADEMY_TRAINED','unknown']) expect(adaptTruthOrigin(alias).sourceAuthorityClass).not.toBe('LICENSED_PROFESSIONAL_REPORT');
    expect(adaptTruthOrigin('unknown')).toMatchObject({sourceAuthorityClass:'UNKNOWN',derivationMethod:'ASSUMED'});
  });
  it('HX-01 labels are deterministic and never trust a bare VERIFIED status', () => {
    expect(deriveTruthLabel({...claim(),status:'VERIFIED'})).toBe('Project source');
    const cases=[['MODEL_INFERENCE','AI inferred'],['DETERMINISTIC_CALCULATION','Calculated'],['MEASURED','Observed'],['ASSUMED','Assumed']] as const;
    for (const [derivationMethod,label] of cases) { const c=claim({derivationMethod,evidenceIds:[]}); expect(deriveTruthLabel(c)).toBe(label); expect(deriveTruthLabel(c)).toBe(label); }
  });
});

describe('FND-02 actual live-house task regressions', () => {
  it('hydrated legacy verified assertions remain historical, not current approval', () => {
    const engine=HermesLiveHouseEngine as any;
    const state=engine.buildGenesisState('LIVE_PROJECT',{});
    state.jurisdictionTruth={status:'VERIFIED_SOURCE',sourceEvidence:'a title'};
    state.geotechTruth={dataOrigin:'VERIFIED_IMPORT'};
    state.foundationSelection={dataOrigin:'VERIFIED_ENGINEERING'};
    state.inspectionTickets=[{ticketId:'T',licensedProfessionalApproval:'REVIEWED',AHJInspection:'PASSED',certificateOfOccupancyStatus:'ISSUED'}];
    engine.normalizeLegacyTruth(state);
    expect(state.jurisdictionTruth.status).toBe('UNVERIFIED');
    expect(state.geotechTruth.dataOrigin).toBe('USER_ASSUMPTION');
    expect(state.foundationSelection.dataOrigin).toBe('CALCULATED_UNVERIFIED');
    expect(state.inspectionTickets[0].AHJInspection).toBe('NOT_SUBMITTED');
    expect(state.legacyUnverifiedTruth.T.AHJInspection).toBe('PASSED');
  });
  it.each(['LIVE_PROJECT','REGRESSION_TEST','SIMULATION_GYM'] as const)('%s does not manufacture verification or approvals', mode => {
    // Exercise the real task implementations in memory, without rewriting runtime files.
    const engine=HermesLiveHouseEngine as any;
    const state=engine.buildGenesisState(mode,{location:'Miami, FL',soilBearingPsf:3000,waterTableFt:6});
    const tasks=engine.getBaseTaskGraph();
    for(const id of ['RESOLVE_JURISDICTION','GEOTECHNICAL_INVESTIGATION','FOUNDATION_SELECTION_ENGINE']) tasks.find((t:any)=>t.taskId===id).execute(state);
    expect(state.jurisdictionTruth.status).not.toBe('VERIFIED_SOURCE');
    expect(state.geotechTruth.dataOrigin).not.toBe('VERIFIED_IMPORT');
    expect(state.geotechTruth.evidenceNotes).not.toContain('N-values per ASTM');
    expect(state.foundationSelection.dataOrigin).not.toBe('VERIFIED_ENGINEERING');
    const rebar=tasks.find((t:any)=>t.execute.toString().includes('INSP-REBAR-PREPOUR-001')); rebar.execute(state);
    tasks.find((t:any)=>t.taskId==='MULTI_TRADE_INSPECTION_GATE').execute(state);
    for(const ticket of state.inspectionTickets) {expect(ticket.licensedProfessionalApproval).toBe('PENDING');expect(ticket.AHJInspection).toBe('NOT_SUBMITTED');expect(ticket.certificateOfOccupancyStatus).toBe('NOT_ELIGIBLE');expect(ticket.realityClass).toBe(mode==='LIVE_PROJECT'?'LIVE':mode==='REGRESSION_TEST'?'REGRESSION_FIXTURE':'SIMULATION');}
    const event={eventId:'EVT-1',sequence:1,timestamp:at,payload:{taskId:'GEOTECHNICAL_INVESTIGATION'}};
    engine.attachFnd02Claims(state,event);
    expect(state.geotechTruth.claimIds.length).toBe(1);
    const c=state.evidenceClaims.find((c:Claim)=>c.claimId===state.geotechTruth.claimIds[0]);
    expect(c.projectRevisionId).toBe(state.currentProjectRevisionId);expect(c.status).not.toBe('VERIFIED');
  });
});
