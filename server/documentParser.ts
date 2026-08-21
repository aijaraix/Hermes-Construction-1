import fs from 'fs';
import zlib from 'zlib';
import crypto from 'crypto';
import * as cheerio from 'cheerio';
import PDFParser from 'pdf2json';
import { DocumentParseRecord, FetchedDocument, KnowledgeChunk } from '../src/types/hermes';

export class DocumentParser {
  public static async parseDocumentAsync(doc: FetchedDocument, rawBuffer?: Buffer): Promise<{
    parseRecord: DocumentParseRecord;
    chunks: KnowledgeChunk[];
  }> {
    const parseId = `PARSE-${doc.documentId}-${Date.now()}`;
    const now = new Date().toISOString();
    const warnings: string[] = [];
    const errors: string[] = [];

    // If fetch failed or document bytes are empty or rights restricted
    if (!doc.sizeBytes || doc.sizeBytes === 0 || doc.rightsStatus === 'RIGHTS_RESTRICTED_METADATA_ONLY') {
      const parseRecord: DocumentParseRecord = {
        parseId,
        documentId: doc.documentId,
        parserType: doc.mimeType.includes('pdf') ? 'PDF' : doc.mimeType.includes('html') ? 'HTML' : 'TXT',
        parserName: 'DocumentStatusChecker',
        parserVersion: '3.17.3',
        parserMode: doc.mimeType.includes('pdf') ? 'PRIMARY_PDF_PARSER' : 'HTML_PARSER',
        parseConfidence: 0.0,
        pageCount: 0,
        characterCount: 0,
        sectionsDetected: 0,
        tablesDetected: 0,
        parseWarnings: ['No full-text available for chunk extraction (fetch failed or rights restricted).'],
        parseErrors: doc.sizeBytes === 0 ? ['Empty document buffer.'] : [],
        status: doc.sizeBytes === 0 ? 'PARSE_FAILED' : 'PARSED_SUCCESS',
        parsedAt: now
      };
      return { parseRecord, chunks: [] };
    }

    // Get raw Buffer
    let buffer: Buffer | undefined = rawBuffer;
    if (!buffer && doc.filePathOrKey && fs.existsSync(doc.filePathOrKey)) {
      try {
        buffer = fs.readFileSync(doc.filePathOrKey);
      } catch (e: any) {
        errors.push(`Failed to read file from disk: ${e?.message}`);
      }
    }

    let parserType: 'PDF' | 'HTML' | 'TXT' | 'WEB_STRUCTURED' = 'TXT';
    if (doc.mimeType.includes('html') || (doc.filePathOrKey && doc.filePathOrKey.endsWith('.html'))) {
      parserType = 'HTML';
    } else if (doc.mimeType.includes('pdf') || (doc.filePathOrKey && doc.filePathOrKey.endsWith('.pdf'))) {
      parserType = 'PDF';
    }

    const chunks: KnowledgeChunk[] = [];
    let pageCount = 1;
    let characterCount = 0;
    let sectionsDetected = 0;
    let tablesDetected = 0;
    let parserName = 'StandardTextParser';
    let parserVersion = '3.17.3';
    let parserMode: 'PRIMARY_PDF_PARSER' | 'FALLBACK_PDF_PARSER' | 'OCR_LAST_RESORT' | 'HTML_PARSER' = 'HTML_PARSER';
    let parseConfidence = 0.95;

    if (parserType === 'PDF' && buffer && buffer.length > 0) {
      parserName = 'pdf2json';
      parserVersion = '4.0.3';
      parserMode = 'PRIMARY_PDF_PARSER';

      try {
        let pagesText: { pageNum: number; text: string }[] = [];
        try {
          pagesText = await this.extractPdfWithPdf2Json(buffer);
        } catch (pErr: any) {
          warnings.push(`Primary pdf2json parser error (${pErr?.message}), switching to fallback stream parser.`);
          parserMode = 'FALLBACK_PDF_PARSER';
          parseConfidence = 0.80;
          pagesText = this.extractPdfPageTextsFallback(buffer);
        }

        pageCount = Math.max(1, pagesText.length);

        if (pagesText.length > 0) {
          pagesText.forEach((p) => {
            const trimmed = p.text.trim();
            characterCount += trimmed.length;

            if (trimmed.length > 0) {
              sectionsDetected++;
              const chunkId = `KC-${doc.sourceId}-P${p.pageNum}`;
              const normalized = trimmed.toLowerCase().replace(/\s+/g, ' ');
              const chunkChecksum = crypto.createHash('sha256').update(trimmed).digest('hex').substring(0, 16);

              chunks.push({
                chunkId,
                sourceId: doc.sourceId,
                pageOrSection: `Actual Page ${p.pageNum}`,
                headingHierarchy: [doc.sourceId, `Page ${p.pageNum}`],
                rawText: trimmed,
                normalizedText: normalized,
                topic: `PDF Page ${p.pageNum} Content`,
                discipline: doc.sourceAuthority || 'Engineering',
                agentTags: this.extractAgentTags(trimmed),
                materialTags: [],
                processTags: [],
                locationTags: ['Coastal'],
                jurisdictionTags: ['USA'],
                version: '3.17.3',
                sourceURL: doc.retrievedUrl,
                retrievalTimestamp: doc.retrievalTime,
                rightsStatus: `${doc.rightsStatus} (PDF Page ${p.pageNum}; Checksum: ${chunkChecksum})`
              });
            }
          });
        } else {
          warnings.push('PDF parsed, but no text streams matched standard font encoding patterns.');
          parseConfidence = 0.50;
        }
      } catch (pdfErr: any) {
        errors.push(`PDF parsing error: ${pdfErr?.message || String(pdfErr)}`);
      }
    } else if (parserType === 'HTML') {
      parserName = 'cheerio';
      parserVersion = '1.0.0';
      parserMode = 'HTML_PARSER';

      try {
        const htmlContent = doc.parsedText || (buffer ? buffer.toString('utf-8') : '');
        characterCount = htmlContent.length;

        const $ = cheerio.load(htmlContent);
        $('script, style, nav, footer, header, iframe, noscript, .cookie-banner, .advertisement, .navigation, .menu').remove();

        const docTitle = $('title').text().trim() || $('h1').first().text().trim() || doc.sourceId;
        const headings = $('h1, h2, h3').toArray();
        tablesDetected = $('table').length;

        if (headings.length > 0) {
          headings.forEach((el, idx) => {
            const hText = $(el).text().trim();
            let sectionContent = $(el).nextUntil('h1, h2, h3').text().trim();
            if (!sectionContent) {
              sectionContent = hText;
            }

            if (sectionContent.length > 0) {
              sectionsDetected++;
              const chunkId = `KC-${doc.sourceId}-H${idx + 1}`;
              const chunkChecksum = crypto.createHash('sha256').update(sectionContent).digest('hex').substring(0, 16);

              chunks.push({
                chunkId,
                sourceId: doc.sourceId,
                pageOrSection: `Section: ${hText}`,
                headingHierarchy: [docTitle, hText],
                rawText: `${hText}\n${sectionContent}`,
                normalizedText: sectionContent.toLowerCase().replace(/\s+/g, ' '),
                topic: hText,
                discipline: doc.sourceAuthority || 'Engineering',
                agentTags: this.extractAgentTags(sectionContent),
                materialTags: [],
                processTags: [],
                locationTags: [],
                jurisdictionTags: [],
                version: '3.17.3',
                sourceURL: doc.retrievedUrl,
                retrievalTimestamp: doc.retrievalTime,
                rightsStatus: `${doc.rightsStatus} (Checksum: ${chunkChecksum})`
              });
            }
          });
        } else {
          const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
          if (bodyText.length > 0) {
            sectionsDetected = 1;
            chunks.push({
              chunkId: `KC-${doc.sourceId}-01`,
              sourceId: doc.sourceId,
              pageOrSection: 'Main Body',
              headingHierarchy: [docTitle, 'Body Text'],
              rawText: bodyText,
              normalizedText: bodyText.toLowerCase(),
              topic: docTitle,
              discipline: doc.sourceAuthority || 'Engineering',
              agentTags: this.extractAgentTags(bodyText),
              materialTags: [],
              processTags: [],
              locationTags: [],
              jurisdictionTags: [],
              version: '3.17.3',
              sourceURL: doc.retrievedUrl,
              retrievalTimestamp: doc.retrievalTime,
              rightsStatus: doc.rightsStatus
            });
          }
        }
      } catch (htmlErr: any) {
        errors.push(`HTML parsing error: ${htmlErr?.message || String(htmlErr)}`);
      }
    } else {
      // Plain text parsing
      parserName = 'PlainTextParser';
      const text = doc.parsedText || (buffer ? buffer.toString('utf-8') : '');
      characterCount = text.length;

      if (text.trim().length > 0) {
        const lines = text.split('\n');
        let currentTitle = 'Section 1';
        let currentLines: string[] = [];
        let chunkIndex = 1;

        lines.forEach((line) => {
          const trimmed = line.trim();
          if (trimmed.startsWith('CHAPTER') || trimmed.startsWith('SECTION') || trimmed.startsWith('ARTICLE')) {
            if (currentLines.length > 0) {
              const body = currentLines.join('\n').trim();
              if (body) {
                sectionsDetected++;
                chunks.push({
                  chunkId: `KC-${doc.sourceId}-${chunkIndex++}`,
                  sourceId: doc.sourceId,
                  pageOrSection: currentTitle,
                  headingHierarchy: [doc.sourceId, currentTitle],
                  rawText: body,
                  normalizedText: body.toLowerCase().replace(/\s+/g, ' '),
                  topic: currentTitle,
                  discipline: doc.sourceAuthority || 'Engineering',
                  agentTags: this.extractAgentTags(body),
                  materialTags: [],
                  processTags: [],
                  locationTags: [],
                  jurisdictionTags: [],
                  version: '3.17.3',
                  sourceURL: doc.retrievedUrl,
                  retrievalTimestamp: doc.retrievalTime,
                  rightsStatus: doc.rightsStatus
                });
                currentLines = [];
              }
            }
            currentTitle = trimmed;
          } else {
            if (trimmed) currentLines.push(trimmed);
          }
        });

        if (currentLines.length > 0) {
          const body = currentLines.join('\n').trim();
          if (body) {
            sectionsDetected++;
            chunks.push({
              chunkId: `KC-${doc.sourceId}-${chunkIndex++}`,
              sourceId: doc.sourceId,
              pageOrSection: currentTitle,
              headingHierarchy: [doc.sourceId, currentTitle],
              rawText: body,
              normalizedText: body.toLowerCase().replace(/\s+/g, ' '),
              topic: currentTitle,
              discipline: doc.sourceAuthority || 'Engineering',
              agentTags: this.extractAgentTags(body),
              materialTags: [],
              processTags: [],
              locationTags: [],
              jurisdictionTags: [],
              version: '3.17.3',
              sourceURL: doc.retrievedUrl,
              retrievalTimestamp: doc.retrievalTime,
              rightsStatus: doc.rightsStatus
            });
          }
        }
      }
    }

    const parseRecord: DocumentParseRecord = {
      parseId,
      documentId: doc.documentId,
      parserType,
      parserName,
      parserVersion,
      parserMode,
      parseConfidence,
      pageCount: Math.max(1, pageCount),
      characterCount,
      sectionsDetected,
      tablesDetected,
      parseWarnings: warnings,
      parseErrors: errors,
      status: errors.length > 0 ? 'PARSE_FAILED' : 'PARSED_SUCCESS',
      parsedAt: now
    };

    return { parseRecord, chunks };
  }

  public static async extractPdfWithPdf2Json(buffer: Buffer): Promise<{ pageNum: number; text: string }[]> {
    return new Promise((resolve, reject) => {
      const pdfParser = new PDFParser(null, true);
      pdfParser.on('pdfParser_dataError', (errData: any) => {
        reject(errData.parserError || errData);
      });
      pdfParser.on('pdfParser_dataReady', () => {
        try {
          const pages: { pageNum: number; text: string }[] = [];
          const rawText = pdfParser.getRawTextContent() || '';
          const pageBlocks = rawText.split(/----------------Page \(\d+\) Break----------------/);
          pageBlocks.forEach((block, idx) => {
            const trimmed = block.trim();
            if (trimmed.length > 0) {
              pages.push({ pageNum: idx + 1, text: trimmed });
            }
          });
          resolve(pages);
        } catch (e) {
          reject(e);
        }
      });
      pdfParser.parseBuffer(buffer);
    });
  }

  public static extractPdfPageTextsFallback(buffer: Buffer): { pageNum: number; text: string }[] {
    const pages: { pageNum: number; text: string }[] = [];
    const rawStr = buffer.toString('latin1');
    const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
    let match: RegExpExecArray | null;
    let pageNum = 1;

    while ((match = streamRegex.exec(rawStr)) !== null) {
      let content = match[1];
      try {
        const decompressed = zlib.inflateSync(Buffer.from(content, 'latin1')).toString('utf-8');
        content = decompressed;
      } catch (e) {}

      if (content.includes('Tj') || content.includes('TJ')) {
        const pageStrings: string[] = [];
        const hexTjRegex = /<([0-9A-Fa-f]+)>\s*Tj/g;
        let hMatch;
        while ((hMatch = hexTjRegex.exec(content)) !== null) {
          try {
            const decoded = Buffer.from(hMatch[1], 'hex').toString('utf-8');
            pageStrings.push(decoded);
          } catch (e) {}
        }

        const litTjRegex = /\(([^)]+)\)\s*Tj/g;
        let lMatch;
        while ((lMatch = litTjRegex.exec(content)) !== null) {
          pageStrings.push(lMatch[1]);
        }

        if (pageStrings.length > 0) {
          pages.push({ pageNum: pageNum++, text: pageStrings.join(' ') });
        }
      }
    }

    return pages;
  }

  public static parseDocument(doc: FetchedDocument): {
    parseRecord: DocumentParseRecord;
    chunks: KnowledgeChunk[];
  } {
    const parseId = `PARSE-${doc.documentId}-${Date.now()}`;
    const now = new Date().toISOString();

    if (!doc.sizeBytes || doc.sizeBytes === 0 || doc.rightsStatus === 'RIGHTS_RESTRICTED_METADATA_ONLY') {
      return {
        parseRecord: {
          parseId,
          documentId: doc.documentId,
          parserType: 'TXT',
          parserName: 'SyncDocumentParser',
          parserVersion: '3.17.3',
          parserMode: 'HTML_PARSER',
          parseConfidence: 0.0,
          pageCount: 0,
          characterCount: 0,
          sectionsDetected: 0,
          tablesDetected: 0,
          parseWarnings: ['Sync parser: No full text available.'],
          parseErrors: [],
          status: 'PARSED_SUCCESS',
          parsedAt: now
        },
        chunks: []
      };
    }

    const text = doc.parsedText || '';
    const chunkId = `KC-${doc.sourceId}-SYNC-01`;
    const chunkChecksum = crypto.createHash('sha256').update(text).digest('hex').substring(0, 16);

    const chunk: KnowledgeChunk = {
      chunkId,
      sourceId: doc.sourceId,
      pageOrSection: 'Document Summary',
      headingHierarchy: [doc.sourceId],
      rawText: text,
      normalizedText: text.toLowerCase().replace(/\s+/g, ' '),
      topic: doc.sourceId,
      discipline: doc.sourceAuthority || 'Engineering',
      agentTags: this.extractAgentTags(text),
      materialTags: [],
      processTags: [],
      locationTags: [],
      jurisdictionTags: [],
      version: '3.17.3',
      sourceURL: doc.retrievedUrl,
      retrievalTimestamp: doc.retrievalTime,
      rightsStatus: `${doc.rightsStatus} (Checksum: ${chunkChecksum})`
    };

    return {
      parseRecord: {
        parseId,
        documentId: doc.documentId,
        parserType: 'TXT',
        parserName: 'SyncDocumentParser',
        parserVersion: '3.17.3',
        parserMode: 'HTML_PARSER',
        parseConfidence: 0.90,
        pageCount: 1,
        characterCount: text.length,
        sectionsDetected: 1,
        tablesDetected: 0,
        parseWarnings: [],
        parseErrors: [],
        status: 'PARSED_SUCCESS',
        parsedAt: now
      },
      chunks: [chunk]
    };
  }

  private static extractAgentTags(text: string): string[] {
    const tags: string[] = [];
    if (/wood|timber|pine|nail/i.test(text)) tags.push('WOOD-FRAMING-TRUSS-AGENT');
    if (/concrete|footing|soil|bearing|aci/i.test(text)) tags.push('SHALLOW-FOOTING-DESIGN-AGENT');
    if (/hvac|diffuser|neck|cfm|velocity|duct/i.test(text)) tags.push('HVAC-SUPPLY-RETURN-DIFFUSER-AGENT');
    if (/receptacle|gfci|circuit|outlet|nec/i.test(text)) tags.push('BRANCH-CIRCUIT-RECEPTACLE-AGENT');
    return tags;
  }
}
