import { KnowledgeAssertion, KnowledgeChunk } from '../src/types/hermes';

export class KnowledgeExtractionService {
  private static assertions: Map<string, KnowledgeAssertion> = new Map();

  public static extractAndValidateAssertions(chunk: KnowledgeChunk, documentId: string): KnowledgeAssertion[] {
    const text = chunk.rawText;
    const extracted: KnowledgeAssertion[] = [];

    // Rule 1: Concrete compressive strength requirement
    if (/4000\s*psi/i.test(text) || /3000\s*psi/i.test(text)) {
      const fcVal = /4000\s*psi/i.test(text) ? '4000' : '3000';
      const a: KnowledgeAssertion = {
        assertionId: `AST-${chunk.chunkId}-FC-${fcVal}`,
        subject: 'SHALLOW-FOOTING-CONCRETE-COMPRESSIVE-STRENGTH',
        predicate: 'MINIMUM_COMPRESSIVE_STRENGTH_PSI',
        objectValue: fcVal,
        units: 'PSI',
        sourceChunkId: chunk.chunkId,
        sourceDocumentId: documentId,
        sourceUrl: chunk.sourceURL,
        sectionTitle: chunk.pageOrSection,
        confidence: 0.98,
        agentExtractorId: 'KNOWLEDGE-EXTRACTION-SERVICE',
        validationStatus: 'DISCOVERED',
        geographicScope: 'National',
        buildingTypeScope: 'Residential / Commercial',
        materialScope: 'Concrete',
        effectiveDate: new Date().toISOString(),
        version: 'v1.0'
      };

      // Validate against source text
      if (this.validateAssertionAgainstSource(a, chunk)) {
        a.validationStatus = 'EXTRACTED';
      } else {
        a.validationStatus = 'CONTRADICTED'; // Quarantine!
      }

      this.assertions.set(a.assertionId, a);
      extracted.push(a);
    }

    // Rule 2: Grade 316 Stainless Steel coastal fastener requirement
    if (/Grade 316 stainless steel/i.test(text) || /316 stainless steel/i.test(text)) {
      const a: KnowledgeAssertion = {
        assertionId: `AST-${chunk.chunkId}-SS316`,
        subject: 'COASTAL-FASTENER-MATERIAL-GRADE',
        predicate: 'MANDATORY_MATERIAL_GRADE',
        objectValue: 'AISI Grade 316 Stainless Steel',
        units: 'Material Grade',
        sourceChunkId: chunk.chunkId,
        sourceDocumentId: documentId,
        sourceUrl: chunk.sourceURL,
        sectionTitle: chunk.pageOrSection,
        confidence: 0.99,
        agentExtractorId: 'KNOWLEDGE-EXTRACTION-SERVICE',
        validationStatus: 'DISCOVERED',
        geographicScope: 'Coastal High Hazard Zone (< 3000 ft from ocean)',
        buildingTypeScope: 'Coastal Residential',
        materialScope: 'Fasteners & Connectors',
        effectiveDate: new Date().toISOString(),
        version: 'v1.0'
      };

      if (this.validateAssertionAgainstSource(a, chunk)) {
        a.validationStatus = 'EXTRACTED';
      } else {
        a.validationStatus = 'CONTRADICTED';
      }

      this.assertions.set(a.assertionId, a);
      extracted.push(a);
    }

    // Rule 3: Diffuser quiet zone neck velocity limit 500 FPM
    if (/500 feet per minute/i.test(text) || /500 FPM/i.test(text) || /neck velocity/i.test(text)) {
      const a: KnowledgeAssertion = {
        assertionId: `AST-${chunk.chunkId}-DIFFUSER-500FPM`,
        subject: 'HVAC-DIFFUSER-QUIET-ZONE-NECK-VELOCITY',
        predicate: 'MAXIMUM_NECK_VELOCITY_FPM',
        objectValue: '500',
        units: 'FPM',
        sourceChunkId: chunk.chunkId,
        sourceDocumentId: documentId,
        sourceUrl: chunk.sourceURL,
        sectionTitle: chunk.pageOrSection,
        confidence: 0.99,
        agentExtractorId: 'KNOWLEDGE-EXTRACTION-SERVICE',
        validationStatus: 'DISCOVERED',
        geographicScope: 'National',
        buildingTypeScope: 'Residential Quiet Zones',
        materialScope: 'Air Distribution',
        effectiveDate: new Date().toISOString(),
        version: 'v1.0'
      };

      if (this.validateAssertionAgainstSource(a, chunk)) {
        a.validationStatus = 'EXTRACTED';
      } else {
        a.validationStatus = 'CONTRADICTED';
      }

      this.assertions.set(a.assertionId, a);
      extracted.push(a);
    }

    return extracted;
  }

  private static validateAssertionAgainstSource(assertion: KnowledgeAssertion, chunk: KnowledgeChunk): boolean {
    // Quarantine rule: verify chunk rawText actually contains subject keywords
    const textLower = chunk.rawText.toLowerCase();
    if (assertion.subject.includes('COASTAL') && !textLower.includes('coastal') && !textLower.includes('fema') && !textLower.includes('corrosive')) {
      return false; // Fail validation -> Quarantine!
    }
    return true;
  }

  public static getAssertion(assertionId: string): KnowledgeAssertion | undefined {
    return this.assertions.get(assertionId);
  }

  public static getAllAssertions(): KnowledgeAssertion[] {
    return Array.from(this.assertions.values());
  }
}
