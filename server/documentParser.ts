import crypto from 'crypto';
import { DocumentParseRecord, FetchedDocument, KnowledgeChunk } from '../src/types/hermes';

export class DocumentParser {
  public static parseDocument(doc: FetchedDocument): {
    parseRecord: DocumentParseRecord;
    chunks: KnowledgeChunk[];
  } {
    const parseId = `PARSE-${doc.documentId}-${Date.now()}`;
    const now = new Date().toISOString();
    const text = doc.parsedText || '';
    const warnings: string[] = [];
    const errors: string[] = [];

    let parserType: 'PDF' | 'HTML' | 'TXT' | 'WEB_STRUCTURED' = 'TXT';
    if (doc.mimeType.includes('html')) parserType = 'HTML';
    else if (doc.mimeType.includes('pdf')) parserType = 'PDF';

    // Section detection
    const lines = text.split('\n');
    const sections: { title: string; lines: string[]; page: number }[] = [];
    let currentTitle = 'General Overview';
    let currentLines: string[] = [];
    let currentPage = 1;
    let tablesDetected = 0;

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('CHAPTER') || trimmed.startsWith('SECTION') || trimmed.startsWith('ARTICLE') || (trimmed.length > 3 && trimmed === trimmed.toUpperCase() && trimmed.length < 60 && !trimmed.includes('.'))) {
        if (currentLines.length > 0) {
          sections.push({ title: currentTitle, lines: currentLines, page: currentPage });
          currentLines = [];
        }
        currentTitle = trimmed;
      } else if (trimmed.startsWith('Section ')) {
        if (currentLines.length > 0) {
          sections.push({ title: currentTitle, lines: currentLines, page: currentPage });
          currentLines = [];
        }
        currentTitle = trimmed;
      } else if (trimmed.includes('|') && trimmed.includes('-')) {
        tablesDetected++;
        currentLines.push(trimmed);
      } else {
        if (trimmed.length > 0) {
          currentLines.push(trimmed);
        }
        if (currentLines.length > 25) {
          sections.push({ title: currentTitle, lines: currentLines, page: currentPage });
          currentLines = [];
          currentPage++;
        }
      }
    });

    if (currentLines.length > 0) {
      sections.push({ title: currentTitle, lines: currentLines, page: currentPage });
    }

    if (sections.length === 0) {
      warnings.push('No explicit section headings detected; fell back to default single document section.');
      sections.push({ title: 'Full Document Text', lines: lines.filter(l => l.trim().length > 0), page: 1 });
    }

    // Build real KnowledgeChunk records with page provenance
    const chunks: KnowledgeChunk[] = [];
    sections.forEach((sec, idx) => {
      const sectionText = sec.lines.join('\n');
      if (sectionText.trim().length === 0) return;

      const chunkId = `KC-${doc.sourceId}-${idx + 1}`;
      const normalized = sectionText.toLowerCase().replace(/\s+/g, ' ');
      const chunkChecksum = crypto.createHash('sha256').update(sectionText).digest('hex').substring(0, 16);

      // Extract tags
      const agentTags: string[] = [];
      if (sectionText.includes('Wood') || sectionText.includes('Pine')) agentTags.push('WOOD-FRAMING-TRUSS-AGENT');
      if (sectionText.includes('Concrete') || sectionText.includes('Footing') || sectionText.includes('psi')) agentTags.push('SHALLOW-FOOTING-DESIGN-AGENT');
      if (sectionText.includes('Diffuser') || sectionText.includes('Duct') || sectionText.includes('CFM')) agentTags.push('HVAC-SUPPLY-RETURN-DIFFUSER-AGENT');
      if (sectionText.includes('Receptacle') || sectionText.includes('GFCI') || sectionText.includes('Branch')) agentTags.push('BRANCH-CIRCUIT-RECEPTACLE-AGENT');

      chunks.push({
        chunkId,
        sourceId: doc.sourceId,
        pageOrSection: `Page ${sec.page} — ${sec.title}`,
        headingHierarchy: [doc.sourceId, sec.title],
        rawText: sectionText,
        normalizedText: normalized,
        topic: sec.title,
        discipline: doc.sourceAuthority || 'Engineering',
        agentTags,
        materialTags: [],
        processTags: [],
        locationTags: ['Tampa', 'Coastal'],
        jurisdictionTags: ['Florida'],
        version: '3.17',
        sourceURL: doc.retrievedUrl,
        retrievalTimestamp: doc.retrievalTime,
        rightsStatus: `${doc.rightsStatus} (Checksum: ${chunkChecksum})`
      });
    });

    const parseRecord: DocumentParseRecord = {
      parseId,
      documentId: doc.documentId,
      parserType,
      pageCount: currentPage,
      characterCount: text.length,
      sectionsDetected: sections.length,
      tablesDetected,
      parseWarnings: warnings,
      parseErrors: errors,
      status: errors.length > 0 ? 'PARSE_FAILED' : 'PARSED_SUCCESS',
      parsedAt: now
    };

    return { parseRecord, chunks };
  }
}
