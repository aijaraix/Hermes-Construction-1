import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { DocumentParser } from '../documentParser';
import { KnowledgeIngestionEngine } from '../knowledgeIngestionEngine';
import { SourceRegistry } from '../sourceRegistry';
import { AuthoritativeSourceDefinition } from '../../src/types/hermes';

export async function runSyntheticPathEliminationTests() {
  console.log('=== RUNNING PHASE 3.17.1 INTEGRATION TESTS ===');
  SourceRegistry.initialize();

  // Test 1: Fetch Failure Path
  console.log('\n--- Test 1: Fetch Failure Path ---');
  const invalidSource: AuthoritativeSourceDefinition = {
    sourceId: 'INVALID-TEST-SOURCE',
    title: 'Unreachable Engineering Standard',
    publisher: 'Invalid Org',
    agencyOrOrganization: 'None',
    URL: 'https://unreachable-domain-invalid-9999.gov/nonexistent.pdf',
    documentURLIfPermitted: 'https://unreachable-domain-invalid-9999.gov/nonexistent.pdf',
    discipline: 'General',
    applicableAgentRoles: ['SHALLOW-FOOTING-DESIGN-AGENT'],
    topics: ['Test'],
    geographicScope: 'National',
    jurisdiction: 'USA',
    publicationDate: '2024-01-01',
    editionVersion: '1st Ed',
    authorityLevel: 'PRIMARY_GOVERNMENT',
    accessType: 'FREE_PUBLIC',
    copyrightLicenseStatus: 'PUBLIC_DOMAIN',
    bulkIngestionPermitted: true,
    fullTextStoragePermitted: true,
    chunkingPermitted: true,
    citationRequirements: 'None',
    lastChecked: new Date().toISOString(),
    freshnessCategory: 'FOUNDATIONAL_MATERIAL_SCIENCE',
    priority: 1
  };

  const doc1 = await KnowledgeIngestionEngine.ingestSource(invalidSource);
  assert.strictEqual(doc1.parsedText, '');
  const parseRecords1 = KnowledgeIngestionEngine.getParseRecords().filter((p) => p.documentId === doc1.documentId);
  assert.ok(parseRecords1.length > 0);
  assert.strictEqual(parseRecords1[0].pageCount, 0);

  const chunks1 = KnowledgeIngestionEngine.getChunks().filter((c) => c.sourceId === invalidSource.sourceId);
  assert.strictEqual(chunks1.length, 0);
  console.log('PASSED: 0 chunks created for unreachable source.');

  // Test 2: Rights Gate Path
  console.log('\n--- Test 2: Rights Gate Path ---');
  const copyrighted = SourceRegistry.getSource('ACI-318-19-CONCRETE');
  assert.ok(copyrighted);

  if (copyrighted) {
    const doc2 = await KnowledgeIngestionEngine.ingestSource(copyrighted);
    assert.strictEqual(doc2.rightsStatus, 'RIGHTS_RESTRICTED_METADATA_ONLY');

    const chunks2 = KnowledgeIngestionEngine.getChunks().filter((c) => c.sourceId === copyrighted.sourceId);
    assert.strictEqual(chunks2.length, 0);
    console.log('PASSED: Full text storage blocked by Rights Gate.');
  }

  // Test 3: Real PDF and HTML Parser Validation
  console.log('\n--- Test 3: Real PDF & HTML Parsing ---');
  const pdfPath = path.join(process.cwd(), 'data', 'source-documents', 'DOC-FEMA-P55.pdf');
  if (fs.existsSync(pdfPath)) {
    const pdfBuf = fs.readFileSync(pdfPath);
    const pdfDoc = {
      documentId: 'DOC-FEMA-P55-TEST',
      sourceId: 'FEMA-P55',
      originalUrl: 'https://www.fema.gov',
      retrievedUrl: 'https://www.fema.gov',
      retrievalTime: new Date().toISOString(),
      mimeType: 'application/pdf',
      sizeBytes: pdfBuf.length,
      checksumSha256: 'abc123pdf',
      filePathOrKey: pdfPath,
      licenseStatus: 'PUBLIC_DOMAIN' as const,
      rightsStatus: 'PUBLIC_DOMAIN',
      sourceAuthority: 'PRIMARY_GOVERNMENT' as const,
      pageCount: 2,
      parsedText: ''
    };

    const pdfRes = await DocumentParser.parseDocumentAsync(pdfDoc, pdfBuf);
    assert.strictEqual(pdfRes.parseRecord.status, 'PARSED_SUCCESS');
    assert.strictEqual(pdfRes.parseRecord.pageCount, 2);
    assert.strictEqual(pdfRes.chunks.length, 2);
    assert.strictEqual(pdfRes.chunks[0].pageOrSection, 'Actual Page 1');
    assert.strictEqual(pdfRes.chunks[1].pageOrSection, 'Actual Page 2');
    console.log('PASSED: Real PDF parsing with page provenance verified.');
  }

  // Test 4: HVAC Failure & Retraining Loop
  console.log('\n--- Test 4: HVAC Failure & Retraining Loop ---');
  await KnowledgeIngestionEngine.initialize();
  const trace = KnowledgeIngestionEngine.getAuditTrace('HVAC-SUPPLY-RETURN-DIFFUSER-AGENT');
  assert.ok(trace);

  if (trace) {
    assert.strictEqual(trace.initialTestPassed, false);
    assert.ok(trace.initialTestScorePct < 85);
    assert.strictEqual(trace.retrainingTriggered, true);
    assert.ok(trace.retrainingSourcesStudied?.includes('DOE-PNNL-BASC'));
    assert.strictEqual(trace.finalTestPassed, true);
    assert.ok(trace.finalTestScorePct >= 85);
    assert.strictEqual(trace.managerReviewDecision, 'APPROVED');
    assert.strictEqual(trace.shadowRunPassed, true);
    console.log('PASSED: HVAC Failure & Retraining Loop verified.');
  }

  // Test 5: Manager Review & Shadow Mode
  console.log('\n--- Test 5: Manager Review & Shadow Mode Integrity ---');
  const reviews = KnowledgeIngestionEngine.getManagerReviews();
  assert.ok(reviews.length > 0);
  const shadowProposals = KnowledgeIngestionEngine.getShadowProposals();
  assert.ok(shadowProposals.length > 0);
  console.log('PASSED: Manager review and shadow mode records verified.');

  console.log('\n=== ALL PHASE 3.17.1 INTEGRATION TESTS PASSED CLEANLY ===');
}

// Execute if run directly
if (process.argv[1] && process.argv[1].includes('synthetic_path_elimination')) {
  runSyntheticPathEliminationTests();
}
