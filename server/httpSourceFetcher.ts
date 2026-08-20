import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { AuthoritativeSourceDefinition, FetchedDocument, HttpSourceFetchRecord } from '../src/types/hermes';

const SOURCE_DOCS_DIR = path.join(process.cwd(), 'data', 'source-documents');

export class HttpSourceFetcher {
  private static fetchRecords: Map<string, HttpSourceFetchRecord> = new Map();

  public static ensureStorageDir(): void {
    if (!fs.existsSync(SOURCE_DOCS_DIR)) {
      fs.mkdirSync(SOURCE_DOCS_DIR, { recursive: true });
    }
  }

  // Real HTTP Fetch without silent fallbacks
  public static async fetchAndStoreSource(source: AuthoritativeSourceDefinition): Promise<{
    fetchRecord: HttpSourceFetchRecord;
    document: FetchedDocument;
  }> {
    this.ensureStorageDir();
    const docId = `DOC-${source.sourceId}`;
    const fetchId = `FETCH-${source.sourceId}-${Date.now()}`;
    const targetUrl = source.documentURLIfPermitted || source.URL;
    const now = new Date().toISOString();

    // Strict Rights Gate Check
    const openStatuses = ['PUBLIC_DOMAIN', 'PERMITTED_OPEN', 'OPEN_LICENSE', 'PERMITTED_FULL_TEXT'];
    const licenseStr = String(source.copyrightLicenseStatus);
    const rightsPermitted =
      source.bulkIngestionPermitted &&
      source.fullTextStoragePermitted &&
      openStatuses.includes(licenseStr);

    const rightsStatus = rightsPermitted
      ? source.copyrightLicenseStatus
      : licenseStr === 'RIGHTS_REVIEW_REQUIRED'
      ? 'RIGHTS_REVIEW_REQUIRED'
      : 'RIGHTS_RESTRICTED_METADATA_ONLY';

    let rawBuffer: Buffer = Buffer.alloc(0);
    let httpStatus = 0;
    let contentType = 'text/plain; charset=utf-8';
    let fetchStatus: 'SUCCESS' | 'FAILED' | 'RIGHTS_RESTRICTED' = rightsPermitted ? 'FAILED' : 'RIGHTS_RESTRICTED';

    if (!rightsPermitted) {
      // Rights restricted: Store metadata citation header ONLY
      const metaText = `[METADATA ONLY - CITATION RECORD FOR COPYRIGHTED STANDARD]
Source ID: ${source.sourceId}
Title: ${source.title}
Publisher: ${source.publisher}
Official URL: ${source.URL}
Copyright License Status: ${source.copyrightLicenseStatus}
Access Type: ${source.accessType}
Citation Requirement: ${source.citationRequirements}
Full-text storage and bulk ingestion BLOCKED by HERMES Rights Gate.`;
      
      rawBuffer = Buffer.from(metaText, 'utf-8');
      httpStatus = 403;
      contentType = 'text/plain; charset=utf-8';
      fetchStatus = 'RIGHTS_RESTRICTED';
    } else {
      // Real HTTP fetch call with strict timeout controller
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      try {
        const response = await fetch(targetUrl, {
          method: 'GET',
          headers: {
            'User-Agent': 'HERMES-Construction-KnowledgeEngine/3.17.1 (Engineering Research; +https://github.com/aijaraix/Hermes-Construction-1)',
            'Accept': 'text/html,text/plain,application/pdf,application/json'
          },
          signal: controller.signal
        });
        clearTimeout(timeout);

        httpStatus = response.status;
        contentType = response.headers.get('content-type') || contentType;

        if (response.ok) {
          const arrayBuf = await response.arrayBuffer();
          rawBuffer = Buffer.from(arrayBuf);
          fetchStatus = 'SUCCESS';
        } else {
          // HTTP error response (404, 500, etc) - NO SILENT FALLBACK
          fetchStatus = 'FAILED';
          rawBuffer = Buffer.from(`FETCH_FAILED: HTTP ${response.status} ${response.statusText} for URL ${targetUrl}`, 'utf-8');
        }
      } catch (err: any) {
        clearTimeout(timeout);
        // Network failure / connection refused / timeout - NO SILENT FALLBACK
        fetchStatus = 'FAILED';
        httpStatus = 0;
        rawBuffer = Buffer.from(`FETCH_FAILED: Network retrieval error (${err?.message || String(err)}) for URL ${targetUrl}`, 'utf-8');
      }
    }

    // SHA-256 Checksum calculated strictly over raw retrieved bytes
    const checksumSha256 = crypto.createHash('sha256').update(rawBuffer).digest('hex');
    const ext = contentType.includes('pdf') ? 'pdf' : contentType.includes('html') ? 'html' : 'txt';
    const filePath = path.join(SOURCE_DOCS_DIR, `${docId}.${ext}`);

    if (fetchStatus === 'SUCCESS' || fetchStatus === 'RIGHTS_RESTRICTED') {
      try {
        fs.writeFileSync(filePath, rawBuffer);
      } catch (fsErr) {
        console.warn('[HTTP FETCHER] Non-fatal disk write warning:', fsErr);
      }
    }

    const fetchRecord: HttpSourceFetchRecord = {
      fetchId,
      sourceId: source.sourceId,
      documentId: docId,
      requestedUrl: targetUrl,
      finalUrl: targetUrl,
      retrievedAt: now,
      httpStatus,
      contentType,
      contentLength: rawBuffer.length,
      checksumSha256,
      rightsStatus,
      storagePath: filePath,
      fetchStatus
    };

    const document: FetchedDocument = {
      documentId: docId,
      sourceId: source.sourceId,
      originalUrl: source.URL,
      retrievedUrl: targetUrl,
      retrievalTime: now,
      mimeType: contentType,
      sizeBytes: rawBuffer.length,
      checksumSha256,
      filePathOrKey: filePath,
      licenseStatus: source.copyrightLicenseStatus === 'PUBLIC_DOMAIN' ? 'PUBLIC_DOMAIN' : source.copyrightLicenseStatus === 'PERMITTED_OPEN' ? 'PERMITTED_OPEN' : 'RESTRICTED',
      rightsStatus,
      sourceAuthority: source.authorityLevel,
      pageCount: fetchStatus === 'SUCCESS' ? 1 : 0,
      parsedText: fetchStatus === 'SUCCESS' ? rawBuffer.toString('utf-8') : ''
    };

    this.fetchRecords.set(fetchId, fetchRecord);

    return { fetchRecord, document };
  }

  // Explicit helper to load local approved documents (e.g. pre-downloaded public domain manuals)
  public static loadLocalApprovedDocument(source: AuthoritativeSourceDefinition, localFilePath: string): {
    fetchRecord: HttpSourceFetchRecord;
    document: FetchedDocument;
  } {
    this.ensureStorageDir();
    const docId = `DOC-${source.sourceId}`;
    const fetchId = `FETCH-LOCAL-${source.sourceId}-${Date.now()}`;
    const now = new Date().toISOString();

    if (!fs.existsSync(localFilePath)) {
      throw new Error(`Local approved document file not found at path: ${localFilePath}`);
    }

    const rawBuffer = fs.readFileSync(localFilePath);
    const checksumSha256 = crypto.createHash('sha256').update(rawBuffer).digest('hex');
    const isPdf = localFilePath.endsWith('.pdf');
    const isHtml = localFilePath.endsWith('.html');
    const contentType = isPdf ? 'application/pdf' : isHtml ? 'text/html' : 'text/plain; charset=utf-8';

    const fetchRecord: HttpSourceFetchRecord = {
      fetchId,
      sourceId: source.sourceId,
      documentId: docId,
      requestedUrl: `file://${localFilePath}`,
      finalUrl: `file://${localFilePath}`,
      retrievedAt: now,
      httpStatus: 200,
      contentType,
      contentLength: rawBuffer.length,
      checksumSha256,
      rightsStatus: 'LOCAL_APPROVED_DOCUMENT',
      storagePath: localFilePath,
      fetchStatus: 'SUCCESS'
    };

    const document: FetchedDocument = {
      documentId: docId,
      sourceId: source.sourceId,
      originalUrl: source.URL,
      retrievedUrl: `file://${localFilePath}`,
      retrievalTime: now,
      mimeType: contentType,
      sizeBytes: rawBuffer.length,
      checksumSha256,
      filePathOrKey: localFilePath,
      licenseStatus: 'PUBLIC_DOMAIN',
      rightsStatus: 'LOCAL_APPROVED_DOCUMENT',
      sourceAuthority: source.authorityLevel,
      pageCount: 1,
      parsedText: isPdf ? '' : rawBuffer.toString('utf-8')
    };

    this.fetchRecords.set(fetchId, fetchRecord);
    return { fetchRecord, document };
  }

  public static getFetchRecords(): HttpSourceFetchRecord[] {
    return Array.from(this.fetchRecords.values());
  }
}
