import fs from 'fs';
import path from 'path';
import {
  DataTruthRecord,
  DomainConflictRecord,
  PageAuditSummary,
  RealityRepairRecord,
} from './realitySwarmEngine';
import { SecurityExposureReport } from './securityScanner';

export interface AuditExecutionRecord {
  auditExecutionId: string;
  agentId: string;
  auditType: string;
  target: string;
  recordsInspected: number;
  findingsCount: number;
  actionsTaken: string[];
  startedAt: string;
  completedAt: string;
  status: 'COMPLETED' | 'FAILED' | 'PARTIAL';
}

export interface RealityStoreData {
  truthRecords: DataTruthRecord[];
  repairLogs: RealityRepairRecord[];
  domainConflicts: DomainConflictRecord[];
  securityExposures: SecurityExposureReport;
  pageAudits: PageAuditSummary[];
  auditExecutions: AuditExecutionRecord[];
  lastSavedAt: string;
}

export class RealityStore {
  private static dbPath = path.join(process.cwd(), 'data', 'db', 'reality_audit_store.json');

  private static sanitizeJsonStringLiterals(json: string): string {
    let inString = false;
    let result = '';

    for (let i = 0; i < json.length; i++) {
      const char = json[i];
      const code = char.charCodeAt(0);

      if (inString) {
        if (char === '"') {
          result += char;
          inString = false;
        } else if (char === '\\') {
          const next = json[i + 1];
          if (next && '"\\/bfnrt'.includes(next)) {
            result += char + next;
            i++;
          } else if (next === 'u' && /^[0-9a-fA-F]{4}$/.test(json.slice(i + 2, i + 6))) {
            result += json.slice(i, i + 6);
            i += 5;
          } else {
            // Invalid escape sequence like \P, \z, or trailing \ -> escape as \\
            result += '\\\\';
          }
        } else if (code < 0x20) {
          switch (char) {
            case '\n': result += '\\n'; break;
            case '\r': result += '\\r'; break;
            case '\t': result += '\\t'; break;
            case '\b': result += '\\b'; break;
            case '\f': result += '\\f'; break;
            default:
              result += `\\u${code.toString(16).padStart(4, '0')}`;
              break;
          }
        } else {
          result += char;
        }
      } else {
        if (char === '"') {
          inString = true;
        }
        result += char;
      }
    }
    return result;
  }

  public static safeParse<T>(jsonString: string): T {
    try {
      return JSON.parse(jsonString) as T;
    } catch {
      const sanitized = this.sanitizeJsonStringLiterals(jsonString);
      return JSON.parse(sanitized) as T;
    }
  }

  public static load(): RealityStoreData | null {
    try {
      if (fs.existsSync(this.dbPath)) {
        const raw = fs.readFileSync(this.dbPath, 'utf-8');
        try {
          const parsed = this.safeParse<RealityStoreData>(raw);
          return parsed;
        } catch {
          console.warn('[REALITY STORE] Store file is corrupted. Resetting store state.');
          try {
            const backupPath = `${this.dbPath}.corrupted.${Date.now()}.bak`;
            fs.renameSync(this.dbPath, backupPath);
          } catch {
            // ignore rename error
          }
          return null;
        }
      }
    } catch {
      console.warn('[REALITY STORE] Failed to read store file from disk.');
    }
    return null;
  }

  public static save(data: Omit<RealityStoreData, 'lastSavedAt'>): void {
    try {
      const dir = path.dirname(this.dbPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const payload: RealityStoreData = {
        ...data,
        lastSavedAt: new Date().toISOString(),
      };

      const tmpPath = `${this.dbPath}.${process.pid}.${Date.now()}.${Math.random().toString(36).slice(2)}.tmp`;
      fs.writeFileSync(tmpPath, JSON.stringify(payload, null, 2), 'utf-8');
      fs.renameSync(tmpPath, this.dbPath);
    } catch (err: any) {
      console.error('[REALITY STORE] Failed to save store to disk:', err?.message || String(err));
    }
  }
}
